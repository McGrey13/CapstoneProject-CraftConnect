<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Ixudra\Curl\Facades\Curl;
use App\Models\Payment;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Services\PayMongoService;
use App\Services\CommissionService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected PayMongoService $payMongoService;
    protected CommissionService $commissionService;

    public function __construct(PayMongoService $payMongoService, CommissionService $commissionService)
    {
        $this->payMongoService = $payMongoService;
        $this->commissionService = $commissionService;
    }
    public function initiatePayment(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string|in:gcash,paymaya,cod'
        ]);

        $user = $request->user(); // assuming you use Laravel Auth
        $amount = $request->amount * 100; // PayMongo uses cents
        $method = strtolower($request->payment_method);

        if ($method === 'cod') {
            return $this->handleCODPayment($amount, $user);
        }

        // GCash / PayMaya (via Sources API)
        return $this->handleEwalletPayment($amount, $method, $user);
    }

    private function handleEwalletPayment($amount, $method, $user)
    {
        $sourceData = [
            "data" => [
                "attributes" => [
                    "amount" => $amount,
                    "currency" => "PHP",
                    "type" => $method, // gcash or paymaya
                    "redirect" => [
                        "success" => url('/api/payment/success'),
                        "failed"  => url('/api/payment/failed')
                    ],
                    "billing" => [
                        "name" => $user->userName ?? 'Customer',
                        "email" => $user->userEmail ?? 'customer@example.com',
                        "phone" => $user->userContactNumber ?? '09123456789'
                    ]
                ]
            ]
        ];

        $response = Curl::to('https://api.paymongo.com/v1/sources')
            ->withHeaders([
                'Content-Type: application/json',
                'Accept: application/json',
                'Authorization: Basic ' . base64_encode(env('PAYMONGO_SECRET_KEY') . ':')
            ])
            ->withData($sourceData)
            ->asJson()
            ->post();

        if (!isset($response->data->attributes->redirect->checkout_url)) {
            return response()->json(['success' => false, 'message' => 'Unable to create source'], 500);
        }

        return response()->json([
            'success' => true,
            'redirect_url' => $response->data->attributes->redirect->checkout_url
        ]);
    }

    private function handleCardPayment($amount, $user)
    {
        $intentData = [
            "data" => [
                "attributes" => [
                    "amount" => $amount,
                    "currency" => "PHP",
                    "payment_method_allowed" => ["card"],
                    "description" => "Payment by " . ($user->userName ?? 'Customer')
                ]
            ]
        ];

        $response = Curl::to('https://api.paymongo.com/v1/payment_intents')
            ->withHeaders([
                'Content-Type: application/json',
                'Accept: application/json',
                'Authorization: Basic ' . base64_encode(env('PAYMONGO_SECRET_KEY') . ':')
            ])
            ->withData($intentData)
            ->asJson()
            ->post();

        if (!isset($response->data->id)) {
            return response()->json(['success' => false, 'message' => 'Unable to create payment intent'], 500);
        }

        return response()->json([
            'success' => true,
            'payment_intent_id' => $response->data->id,
            'client_key' => $response->data->attributes->client_key
        ]);
    }

    private function handleCODPayment($amount, $user)
    {
        // For COD payments, we don't need PayMongo integration
        // Just return success response
        return response()->json([
            'success' => true,
            'payment_method' => 'cod',
            'message' => 'COD payment initiated successfully'
        ]);
    }

    // ✅ Handle success callback
    public function success(Request $request)
    {
        $paymentId = $request->get('payment_id', 'N/A');
        
        // Log the successful payment
        \Log::info('Payment Success', [
            'payment_id' => $paymentId,
            'request_data' => $request->all(),
            'timestamp' => now()
        ]);

        // Redirect to frontend payment success page
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect($frontendUrl . '/payment-success?payment_id=' . $paymentId);
    }

    // ✅ Handle failed callback
    public function failed(Request $request)
    {
        $paymentId = $request->get('payment_id', 'N/A');
        
        // Log the failed payment
        \Log::info('Payment Failed', [
            'payment_id' => $paymentId,
            'request_data' => $request->all(),
            'timestamp' => now()
        ]);

        // Redirect to frontend payment failed page
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect($frontendUrl . '/payment-failed?payment_id=' . $paymentId);
    }

    // ✅ Handle payment success with payment ID
    public function paymentSuccess(Request $request, $payment_id)
    {
        try {
            // Log the successful payment
            \Log::info('Payment Success', [
                'payment_id' => $payment_id,
                'request_data' => $request->all(),
                'timestamp' => now()
            ]);

            // You can add additional logic here like:
            // - Update order status
            // - Send confirmation email
            // - Update inventory
            // - Create payment record in database

            return response()->json([
                'success' => true, 
                'message' => 'Payment successful!',
                'payment_id' => $payment_id,
                'redirect_url' => url('/payment-success') // Frontend success page
            ]);
        } catch (\Exception $e) {
            \Log::error('Payment Success Error', [
                'payment_id' => $payment_id,
                'error' => $e->getMessage(),
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error processing payment success',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ✅ Handle payment failure with payment ID
    public function paymentFailed(Request $request, $payment_id)
    {
        try {
            // Log the failed payment
            \Log::info('Payment Failed', [
                'payment_id' => $payment_id,
                'request_data' => $request->all(),
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment failed. Please try again.',
                'payment_id' => $payment_id,
                'redirect_url' => url('/payment-failed') // Frontend failure page
            ]);
        } catch (\Exception $e) {
            \Log::error('Payment Failed Error', [
                'payment_id' => $payment_id,
                'error' => $e->getMessage(),
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error processing payment failure',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create payment intent for order
     */
    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,orderID',
            'payment_methods' => 'array|required',
            'payment_methods.*' => 'string|in:gcash,paymaya,cod'
        ]);

        try {
            $order = Order::with('orderProducts.product')->findOrFail($request->order_id);
            
            // Calculate total amount in centavos
            $totalAmount = $order->orderProducts->sum(function ($orderProduct) {
                return $orderProduct->price * $orderProduct->quantity * 100; // Convert to centavos
            });

            if ($totalAmount <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid order amount'
                ], 400);
            }

            // Handle both online payments and COD
            if (in_array('cod', $request->payment_methods)) {
                return $this->handleCODPaymentForOrder($order, $totalAmount);
            }
            
            return $this->handleOnlinePayment($order, $totalAmount, $request->payment_methods);

        } catch (\Exception $e) {
            Log::error('Payment intent creation failed', [
                'error' => $e->getMessage(),
                'order_id' => $request->order_id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment intent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle PayMongo webhook
     */
    public function handleWebhook(Request $request)
    {
        try {
            $payload = $request->getContent();
            $signature = $request->header('Paymongo-Signature');
            $webhookSecret = config('services.paymongo.webhook_secret');

            // Verify webhook signature
            if (!$this->payMongoService->verifyWebhookSignature($payload, $signature, $webhookSecret)) {
                Log::warning('Invalid webhook signature', [
                    'signature' => $signature,
                    'payload_length' => strlen($payload)
                ]);
                return response()->json(['error' => 'Invalid signature'], 401);
            }

            $event = json_decode($payload, true);
            $eventType = $event['data']['attributes']['type'] ?? null;

            Log::info('Webhook received', [
                'event_type' => $eventType,
                'event_id' => $event['data']['id'] ?? null
            ]);

            // Handle different event types
            switch ($eventType) {
                case 'payment_intent.succeeded':
                    return $this->handlePaymentSuccess($event);
                case 'payment_intent.payment_failed':
                    return $this->handlePaymentFailure($event);
                default:
                    Log::info('Unhandled webhook event', ['type' => $eventType]);
                    return response()->json(['message' => 'Event not handled'], 200);
            }

        } catch (\Exception $e) {
            Log::error('Webhook processing failed', [
                'error' => $e->getMessage(),
                'payload' => $request->getContent()
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Handle successful payment
     */
    private function handlePaymentSuccess(array $event)
    {
        try {
            $intentId = $event['data']['id'];
            $amount = $event['data']['attributes']['amount'];
            $metadata = $event['data']['attributes']['metadata'] ?? [];

            // Find the payment record
            $payment = Payment::where('paymongo_payment_intent_id', $intentId)->first();
            
            if (!$payment) {
                Log::error('Payment record not found', ['intent_id' => $intentId]);
                return response()->json(['error' => 'Payment not found'], 404);
            }

            // Process payment with commission service
            $paymentData = [
                'order_id' => $payment->orderID,
                'amount_cents' => $amount,
                'paymongo_payment_id' => $intentId,
                'paymongo_intent_id' => $intentId,
                'metadata' => $metadata
            ];

            $result = $this->commissionService->processPayment($paymentData);

            if (!$result['success']) {
                Log::error('Payment processing failed', [
                    'error' => $result['error'],
                    'payment_id' => $payment->payment_id
                ]);
                return response()->json(['error' => 'Payment processing failed'], 500);
            }

            // Update payment status
            $payment->update([
                'paymentStatus' => 'paid',
                'payment_details' => array_merge($payment->payment_details ?? [], $event)
            ]);

            Log::info('Payment processed successfully', [
                'payment_id' => $payment->payment_id,
                'transaction_id' => $result['transaction']->id,
                'amount' => $amount
            ]);

            return response()->json(['message' => 'Payment processed successfully']);

        } catch (\Exception $e) {
            Log::error('Payment success handling failed', [
                'error' => $e->getMessage(),
                'event' => $event
            ]);

            return response()->json(['error' => 'Payment success handling failed'], 500);
        }
    }

    /**
     * Handle failed payment
     */
    private function handlePaymentFailure(array $event)
    {
        try {
            $intentId = $event['data']['id'];
            $failureReason = $event['data']['attributes']['last_payment_error']['message'] ?? 'Unknown error';

            // Find the payment record
            $payment = Payment::where('paymongo_payment_intent_id', $intentId)->first();
            
            if ($payment) {
                $payment->update([
                    'paymentStatus' => 'failed',
                    'failure_reason' => $failureReason,
                    'payment_details' => array_merge($payment->payment_details ?? [], $event)
                ]);

                // Update order status
                $order = Order::find($payment->orderID);
                if ($order) {
                    $order->update(['status' => 'failed']);
                }
            }

            Log::info('Payment failed', [
                'intent_id' => $intentId,
                'reason' => $failureReason
            ]);

            return response()->json(['message' => 'Payment failure handled']);

        } catch (\Exception $e) {
            Log::error('Payment failure handling failed', [
                'error' => $e->getMessage(),
                'event' => $event
            ]);

            return response()->json(['error' => 'Payment failure handling failed'], 500);
        }
    }


    /**
     * Handle online payment
     */
    private function handleOnlinePayment(Order $order, int $totalAmount, array $paymentMethods)
    {
        try {
            // Create payment intent with PayMongo
            $paymentData = [
                'amount_cents' => $totalAmount,
                'currency' => 'PHP',
                'payment_methods' => $paymentMethods,
                'description' => 'Payment for Order #' . $order->orderID,
                'metadata' => [
                    'order_id' => $order->orderID,
                    'customer_id' => $order->customer_id
                ]
            ];

            $result = $this->payMongoService->createPaymentIntent($paymentData);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create payment intent',
                    'error' => $result['error']
                ], 500);
            }

            // Create payment record
            $payment = Payment::create([
                'userID' => $order->userID,
                'orderID' => $order->orderID,
                'amount' => $totalAmount / 100,
                'currency' => 'PHP',
                'paymentMethod' => implode(',', $paymentMethods),
                'paymentStatus' => 'pending',
                'payment_type' => 'online',
                'paymongo_payment_intent_id' => $result['data']['id'],
                'payment_details' => $result['data']
            ]);

            // Update order status
            $order->update(['status' => 'pending_payment']);

            Log::info('Online payment intent created', [
                'order_id' => $order->orderID,
                'payment_id' => $payment->payment_id,
                'intent_id' => $result['data']['id'],
                'amount' => $totalAmount,
                'methods' => $paymentMethods
            ]);

            return response()->json([
                'success' => true,
                'payment_type' => 'online',
                'payment_intent_id' => $result['data']['id'],
                'client_key' => $result['data']['attributes']['client_key'],
                'checkout_url' => $result['data']['attributes']['next_action']['redirect']['url'] ?? null,
                'payment_id' => $payment->payment_id
            ]);

        } catch (\Exception $e) {
            Log::error('Online payment creation failed', [
                'error' => $e->getMessage(),
                'order_id' => $order->orderID
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create online payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle COD payment for order
     */
    private function handleCODPaymentForOrder(Order $order, int $totalAmount)
    {
        try {
            // Create payment record for COD
            $payment = Payment::create([
                'userID' => $order->userID,
                'orderID' => $order->orderID,
                'paymentMethod' => 'cod',
                'paymentStatus' => 'pending',
                'amount' => $totalAmount / 100, // Convert back to pesos
                'currency' => 'PHP',
                'payment_type' => 'cod',
                'orderDate' => now(),
                'reference_number' => 'COD-' . $order->orderID . '-' . time()
            ]);

            // Update order status
            $order->update([
                'orderStatus' => 'pending_payment',
                'paymentStatus' => 'pending'
            ]);

            Log::info('COD payment created successfully', [
                'order_id' => $order->orderID,
                'payment_id' => $payment->payment_id,
                'amount' => $totalAmount
            ]);

            return response()->json([
                'success' => true,
                'payment_type' => 'cod',
                'payment_id' => $payment->payment_id,
                'message' => 'COD payment created successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('COD payment creation failed', [
                'error' => $e->getMessage(),
                'order_id' => $order->orderID
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create COD payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
