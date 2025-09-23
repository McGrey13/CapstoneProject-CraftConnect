<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\PayMongoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $payMongoService;

    public function __construct(PayMongoService $payMongoService)
    {
        $this->payMongoService = $payMongoService;
    }

    public function initiatePayment(Request $request)
    {
        try {
            // Validate request
            $request->validate([
                'amount' => 'required|numeric|min:100', // Minimum amount 100 PHP
                'payment_method' => 'required|in:gcash,grab_pay,card',
                'order_id' => 'required|exists:orders,orderID'
            ]);

            // Create payment record
            $payment = Payment::create([
                'userID' => auth()->id(),
                'orderID' => $request->order_id,
                'amount' => $request->amount,
                'currency' => 'PHP',
                'paymentMethod' => $request->payment_method,
                'paymentStatus' => 'pending',
                'orderDate' => now(),
            ]);

            // Create PayMongo source for e-wallets (GCash, GrabPay)
            if (in_array($request->payment_method, ['gcash', 'grab_pay'])) {
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
            }

            // For card payments
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
        return view('payment.success');
    }

    public function paymentFailed(Request $request)
    {
        return view('payment.failed');
    }
}