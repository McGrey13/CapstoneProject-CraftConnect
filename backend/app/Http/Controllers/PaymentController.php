<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Order;
use App\Models\Product;
use App\Services\PayMongoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use function Pest\Laravel\post;
use Illuminate\Support\Facades\Session;
use Ixudra\Curl\Facades\Curl;

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
                
                // Update order status to confirmed
                $order = Order::where('orderID', $request->orderID)->first();
                if ($order) {
                    $order->update(['status' => 'confirmed']);
                }
                
                return response()->json([
                    'success' => true,
                    'message' => 'Order placed successfully with Cash on Delivery'
                ]);
            }

            // Create PayMongo payment session for e-wallets (GCash, PayMaya)
            if (in_array($request->payment_method, ['gcash', 'paymaya'])) {
                try {
                    // Check if PayMongo is properly configured
                    if (!env('PAYMONGO_SECRET_KEY') || !env('PAYMONGO_PUBLIC_KEY')) {
                        throw new \Exception('PayMongo not configured');
                    }

                    // Create payment session data
                    $sessionData = $this->createPaymentSessionData($request->amount, $request->payment_method, $payment->payment_id);
                    
                    $response = Curl::to('https://api.paymongo.com/v1/payment_sessions')
                        ->withHeaders(['content-type: application/json'])
                        ->withHeaders(['accept: application/json'])
                        ->withHeaders(['Authorization: Basic '.base64_encode(env('PAYMONGO_SECRET_KEY').':')])
                        ->withData($sessionData)
                        ->asJson()
                        ->post();

                    // Log the response for debugging
                    Log::info('PayMongo Response: ' . json_encode($response));

                    if ($response && isset($response->data)) {
                        // Store session ID in payment record
                        $payment->update([
                            'paymongo_payment_intent_id' => $response->data->id,
                            'payment_details' => json_encode($response)
                        ]);

                        // Store session ID in session for success/failure handling
                        Session::put('payment_session_id', $response->data->id);
                        Session::put('payment_id', $payment->payment_id);
                        Session::put('order_id', $request->orderID); // Store order ID for success/failure handling

                        return response()->json([
                            'success' => true,
                            'checkout_url' => $response->data->attributes->checkout_url,
                            'session_id' => $response->data->id
                        ]);
                    } else {
                        // Log the actual response for debugging
                        Log::error('Invalid PayMongo response structure: ' . json_encode($response));
                        
                        // For development, simulate successful payment when response is invalid
                        $payment->update([
                            'paymentStatus' => 'paid',
                            'payment_details' => json_encode([
                                'type' => 'simulated',
                                'method' => $request->payment_method,
                                'amount' => $request->amount,
                                'status' => 'paid',
                                'note' => 'PayMongo response invalid - simulated payment',
                                'original_response' => $response
                            ])
                        ]);

                        return response()->json([
                            'success' => true,
                            'message' => 'Payment processed successfully (PayMongo response invalid - using simulation)',
                            'redirect_url' => 'http://localhost:5173/orders?payment=success&method=' . $request->payment_method
                        ]);
                    }

                } catch (\Exception $e) {
                    Log::error('PayMongo Payment Session Error: ' . $e->getMessage());
                    
                    // Check if it's an account activation error
                    if (strpos($e->getMessage(), 'account_not_activated') !== false) {
                        // For development, simulate successful payment when account is not activated
                        $payment->update([
                            'paymentStatus' => 'paid',
                            'payment_details' => json_encode([
                                'type' => 'simulated',
                                'method' => $request->payment_method,
                                'amount' => $request->amount,
                                'status' => 'paid',
                                'note' => 'PayMongo account not activated - simulated payment'
                            ])
                        ]);

                        return response()->json([
                            'success' => true,
                            'message' => 'Payment processed successfully (PayMongo account not activated - using simulation)',
                            'redirect_url' => 'http://localhost:5173/orders?payment=success&method=' . $request->payment_method
                        ]);
                    }
                    
                    // For other errors, provide a fallback
                    return response()->json([
                        'success' => false,
                        'message' => 'Payment service temporarily unavailable. Please try Cash on Delivery or contact support.',
                        'error_type' => 'service_unavailable'
                    ], 500);
                }
            }

            // Handle GrabPay separately (if needed)
            if ($request->payment_method === 'grab_pay') {
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
        try {
            // Get order ID from session
            $orderId = Session::get('order_id');
            $paymentId = Session::get('payment_id');
            
            if ($orderId) {
                // Update order status to confirmed
                $order = Order::where('orderID', $orderId)->first();
                if ($order) {
                    $order->update(['status' => 'confirmed']);
                }
                
                // Update payment status to paid
                if ($paymentId) {
                    $payment = Payment::find($paymentId);
                    if ($payment) {
                        $payment->update(['paymentStatus' => 'paid']);
                    }
                }
                
                // Clear session data
                Session::forget(['order_id', 'payment_id', 'payment_session_id']);
            }
        } catch (\Exception $e) {
            Log::error('Payment Success Error: ' . $e->getMessage());
        }
        
        // Redirect to frontend orders page with success parameter
        return redirect('http://localhost:5173/orders?payment=success');
    }

    public function paymentFailed(Request $request)
    {
        try {
            // Get order ID from session
            $orderId = Session::get('order_id');
            $paymentId = Session::get('payment_id');
            
            if ($orderId) {
                // Delete the order since payment failed
                $order = Order::where('orderID', $orderId)->first();
                if ($order) {
                    // Restore product quantities
                    foreach ($order->orderProducts as $orderProduct) {
                        $product = Product::find($orderProduct->product_id);
                        if ($product) {
                            $product->increment('productQuantity', $orderProduct->quantity);
                        }
                    }
                    
                    // Delete order products first
                    $order->orderProducts()->delete();
                    
                    // Delete the order
                    $order->delete();
                }
                
                // Update payment status to failed
                if ($paymentId) {
                    $payment = Payment::find($paymentId);
                    if ($payment) {
                        $payment->update(['paymentStatus' => 'failed']);
                    }
                }
                
                // Clear session data
                Session::forget(['order_id', 'payment_id', 'payment_session_id']);
            }
        } catch (\Exception $e) {
            Log::error('Payment Failed Error: ' . $e->getMessage());
        }
        
        // Redirect to frontend orders page with failed parameter
        return redirect('http://localhost:5173/orders?payment=failed');
    }

    /**
     * Create payment session data for PayMongo
     */
    private function createPaymentSessionData($amount, $paymentMethod, $paymentId)
    {
        return [
            'data' => [
                'attributes' => [
                    'line_items' => [
                        [
                            'amount' => $amount * 100, // Convert to cents
                    'currency' => 'PHP',
                            'payment_method_types' => [$paymentMethod],
                    'quantity' => 1,
                            'name' => 'Order Payment #' . $paymentId,
                        ]
                ],
                'payment_method_options' => [
                        $paymentMethod => [
                            'type' => $paymentMethod,
                        ]
                    ],
                    'success_url' => 'http://localhost:5173/orders?payment=success',
                    'cancel_url' => 'http://localhost:5173/orders?payment=failed',
                    'description' => 'Payment for Order #' . $paymentId,
                ]
            ],
        ];
    }

    public function paymentSession(Request $request)
    {
        try {
            // Get request data
            $amount = $request->input('amount', 1000);
            $paymentMethod = $request->input('payment_method', 'gcash');
            $orderID = $request->input('orderID', 'ORDER-001');

            // For development, always redirect to orders page
            $checkoutUrl = 'http://localhost:5173/orders?payment=success&method=' . $paymentMethod . '&amount=' . $amount;
            
            return response()->json([
                'success' => true,
                'checkout_url' => $checkoutUrl,
                'session_id' => 'dev_session_' . uniqid(),
                'message' => 'Payment session created (development mode - direct redirect to orders)'
            ]);

        } catch (\Exception $e) {
            Log::error('Payment Session Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment session: ' . $e->getMessage()
            ], 500);
        }
    }

}