<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\PayMongoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use function Pest\Laravel\post;

class PaymentController extends Controller
{
    protected $payMongoService;

    public function __construct()
    {
        // Only initialize PayMongo service if keys are configured
        if (env('PAYMONGO_SECRET_KEY') && env('PAYMONGO_PUBLIC_KEY')) {
            $this->payMongoService = new PayMongoService();
        }
    }

    public function initiatePayment(Request $request)
    {
        try {
            // Validate request
            $request->validate([
                'amount' => 'required|numeric|min:100', // Minimum amount 100 PHP
                'payment_method' => 'required|in:gcash,grab_pay,card,paymaya,cod',
                'orderID' => 'required|exists:orders,orderID'
            ]);

            // Get the authenticated user
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Create payment record
            $payment = Payment::create([
                'userID' => $user->userID,
                'orderID' => $request->orderID,
                'amount' => $request->amount,
                'currency' => 'PHP',
                'paymentMethod' => $request->payment_method,
                'paymentStatus' => 'pending',
                'orderDate' => now(),
            ]);

            // Handle Cash on Delivery
            if ($request->payment_method === 'cod') {
                $payment->update(['paymentStatus' => 'paid']);
                return response()->json([
                    'success' => true,
                    'message' => 'Order placed successfully with Cash on Delivery'
                ]);
            }

            // Create PayMongo source for e-wallets (GCash, GrabPay, PayMaya)
            if (in_array($request->payment_method, ['gcash', 'grab_pay', 'paymaya'])) {
                // Check if PayMongo is configured and available
                if (!$this->payMongoService || !env('PAYMONGO_SECRET_KEY') || !env('PAYMONGO_PUBLIC_KEY')) {
                    // For development/testing - simulate successful payment
                    $payment->update([
                        'paymentStatus' => 'paid',
                        'payment_details' => json_encode([
                            'type' => 'simulated',
                            'method' => $request->payment_method,
                            'amount' => $request->amount,
                            'status' => 'paid'
                        ])
                    ]);

                    return response()->json([
                        'success' => true,
                        'message' => 'Payment simulated successfully for development',
                        'redirect_url' => url('/payment/success')
                    ]);
                }

                try {
                    $source = $this->payMongoService->createSource(
                        $request->amount,
                        $request->payment_method
                    );

                    $payment->update([
                        'paymongo_source_id' => $source['data']['id'],
                        'payment_details' => $source
                    ]);

                    return response()->json([
                        'success' => true,
                        'redirect_url' => $source['data']['attributes']['redirect']['checkout_url']
                    ]);
                } catch (\Exception $e) {
                    Log::error('PayMongo Error: ' . $e->getMessage());
                    return response()->json([
                        'success' => false,
                        'message' => 'Payment service temporarily unavailable. Please try again later.'
                    ], 500);
                }
            }

            // For card payments
            if (!$this->payMongoService) {
                // Simulate card payment for development
                $payment->update([
                    'paymentStatus' => 'paid',
                    'payment_details' => json_encode([
                        'type' => 'simulated',
                        'method' => $request->payment_method,
                        'amount' => $request->amount,
                        'status' => 'paid'
                    ])
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment simulated successfully for development',
                    'redirect_url' => url('/payment/success')
                ]);
            }

            $paymentIntent = $this->payMongoService->createPaymentIntent(
                $request->amount,
                'PHP',
                [$request->payment_method]
            );

            $payment->update([
                'paymongo_payment_intent_id' => $paymentIntent['data']['id'],
                'payment_details' => $paymentIntent
            ]);

            return response()->json([
                'success' => true,
                'client_key' => $paymentIntent['data']['attributes']['client_key'],
                'payment_intent_id' => $paymentIntent['data']['id']
            ]);

        } catch (\Exception $e) {
            Log::error('Payment Initiation Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Payment initiation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function handleWebhook(Request $request)
    {
        try {
            $payload = $request->all();
            Log::info('PayMongo Webhook received', $payload);

            // Verify webhook signature (recommended for production)
            // $signature = $request->header('Paymongo-Signature');

            $type = $payload['data']['attributes']['type'];
            $resourceId = $payload['data']['attributes']['data']['id'];

            switch ($type) {
                case 'source.chargeable':
                    $payment = Payment::where('paymongo_source_id', $resourceId)->first();
                    if ($payment) {
                        $payment->update(['paymentStatus' => 'processing']);
                    }
                    break;

                case 'payment.paid':
                    $payment = Payment::where('paymongo_payment_intent_id', $resourceId)
                        ->orWhere('paymongo_source_id', $resourceId)
                        ->first();
                    if ($payment) {
                        $payment->update(['paymentStatus' => 'paid']);
                    }
                    break;

                case 'payment.failed':
                    $payment = Payment::where('paymongo_payment_intent_id', $resourceId)
                        ->orWhere('paymongo_source_id', $resourceId)
                        ->first();
                    if ($payment) {
                        $payment->update([
                            'paymentStatus' => 'failed',
                            'failure_reason' => $payload['data']['attributes']['data']['attributes']['failed_message']
                        ]);
                    }
                    break;
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('Webhook Processing Error: ' . $e->getMessage());
            return response()->json(['success' => false], 500);
        }
    }

    public function paymentSuccess(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Payment completed successfully!',
            'redirect_url' => 'http://localhost:5173/orders' // Redirect to frontend orders page
        ]);
    }

    public function paymentFailed(Request $request)
    {
        return response()->json([
            'success' => false,
            'message' => 'Payment failed. Please try again.',
            'redirect_url' => 'http://localhost:5173/checkout' // Redirect back to checkout
        ]);
    }

    public function paymentSession(Request $request)
    {

        $data = [
            'data' => [
                'attributes' => [
                    'amount' => 1000,
                    'currency' => 'PHP',
                    'payment_method_types' => ['gcash', 'paymaya'],
                    'redirect_url' => route('payment.success'),
                    'cancel_url' => route('payment.failed'),
                    'quantity' => 1,
                    'name' => 'Test Payment',
                ],
                'payment_method_options' => [
                    'gcash' => [
                        'type' => 'gcash',
                        'phone' => '09171234567'
                    ],
                    'paymaya' => [
                        'type' => 'paymaya',
                        'phone' => '09171234567'
                    ]
                ],  
                'success_url' => route('payment.success'),
                'cancel_url' => route('payment.failed'),
            ]
        ];
        $response = Curl::to('https://api.paymongo.com/v1/payment_sessions')
            ->withHeaders('content-type: application/json')
            ->withHeaders('accept: application/json')
            ->withAuthorization('Basic ' . base64_encode(env('PAYMONGO_SECRET_KEY')))
            ->withData($data);
            ->asJson();
            ->post();

            
    }

}