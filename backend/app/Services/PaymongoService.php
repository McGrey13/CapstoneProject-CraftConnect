<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class PayMongoService
{
    protected $client;
    protected $secretKey;
    protected $publicKey;
    protected $baseUrl = 'https://api.paymongo.com/v1';

    public function __construct()
    {
        $this->secretKey = env('PAYMONGO_SECRET_KEY');
        $this->publicKey = env('PAYMONGO_PUBLIC_KEY');
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
                'Authorization' => 'Basic ' . base64_encode($this->secretKey . ':')
            ]
        ]);
    }

    public function createPaymentIntent($amount, $currency = 'PHP', $paymentMethodAllowed = ['gcash', 'grab_pay', 'card'])
    {
        try {
            $response = $this->client->post('/payment_intents', [
                'json' => [
                    'data' => [
                        'attributes' => [
                            'amount' => $amount * 100, // Convert to cents
                            'payment_method_allowed' => $paymentMethodAllowed,
                            'currency' => $currency,
                            'capture_type' => 'automatic',
                        ]
                    ]
                ]
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            Log::error('PayMongo Payment Intent Creation Error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function createPaymentMethod($type, $details)
    {
        try {
            $response = $this->client->post('/payment_methods', [
                'json' => [
                    'data' => [
                        'attributes' => [
                            'type' => $type,
                            'details' => $details,
                            'billing' => [
                                'name' => $details['name'],
                                'email' => $details['email'],
                                'phone' => $details['phone']
                            ]
                        ]
                    ]
                ]
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            Log::error('PayMongo Payment Method Creation Error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function attachPaymentIntent($paymentIntentId, $paymentMethodId)
    {
        try {
            $response = $this->client->post("/payment_intents/{$paymentIntentId}/attach", [
                'json' => [
                    'data' => [
                        'attributes' => [
                            'payment_method' => $paymentMethodId
                        ]
                    ]
                ]
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            Log::error('PayMongo Payment Intent Attachment Error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function createSource($amount, $type = 'gcash', $currency = 'PHP')
    {
        try {
            $response = $this->client->post('/sources', [
                'json' => [
                    'data' => [
                        'attributes' => [
                            'amount' => $amount * 100,
                            'currency' => $currency,
                            'type' => $type,
                            'redirect' => [
                                'success' => url('/payment/success'),
                                'failed' => url('/payment/failed')
                            ]
                        ]
                    ]
                ]
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            Log::error('PayMongo Source Creation Error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function retrievePaymentIntent($paymentIntentId)
    {
        try {
            $response = $this->client->get("/payment_intents/{$paymentIntentId}");
            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            Log::error('PayMongo Payment Intent Retrieval Error: ' . $e->getMessage());
            throw $e;
        }
    }
}