<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Shipping;
use App\Models\ShippingHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ShippingController extends Controller
{
    /**
     * Assign rider to an order
     */
    public function assignRider(Request $request)
    {
        try {
            $request->validate([
                'order_id' => 'required|exists:orders,orderID',
                'tracking_number' => 'required|string',
                'rider_info' => 'required|array',
                'rider_info.rider_name' => 'required|string',
                'rider_info.rider_phone' => 'required|string',
                'rider_info.rider_email' => 'nullable|email',
                'rider_info.vehicle_type' => 'required|string',
                'rider_info.vehicle_number' => 'required|string',
                'delivery_info' => 'required|array',
                'delivery_info.delivery_address' => 'required|string',
                'delivery_info.delivery_city' => 'required|string',
                'delivery_info.delivery_province' => 'required|string',
                'delivery_info.delivery_notes' => 'nullable|string',
                'delivery_info.estimated_delivery' => 'nullable|date',
                'status' => 'required|string|in:to_ship,shipped,delivered'
            ]);

            $order = Order::findOrFail($request->order_id);

            // Check if shipping record already exists for this order
            $existingShipping = Shipping::where('order_id', $request->order_id)->first();
            if ($existingShipping) {
                return response()->json([
                    'success' => false,
                    'message' => 'Shipping record already exists for this order'
                ], 400);
            }

            // Create shipping record
            $shipping = Shipping::create([
                'order_id' => $request->order_id,
                'tracking_number' => $request->tracking_number,
                'rider_name' => $request->rider_info['rider_name'],
                'rider_phone' => $request->rider_info['rider_phone'],
                'rider_email' => $request->rider_info['rider_email'] ?? null,
                'vehicle_type' => $request->rider_info['vehicle_type'],
                'vehicle_number' => $request->rider_info['vehicle_number'],
                'delivery_address' => $request->delivery_info['delivery_address'],
                'delivery_city' => $request->delivery_info['delivery_city'],
                'delivery_province' => $request->delivery_info['delivery_province'],
                'delivery_notes' => $request->delivery_info['delivery_notes'] ?? null,
                'estimated_delivery' => $request->delivery_info['estimated_delivery'] ?? null,
                'status' => $request->status,
                'assigned_at' => now()
            ]);

            // Update order status
            $order->update(['status' => $request->status]);

            // Create initial shipping history
            ShippingHistory::create([
                'shipping_id' => $shipping->id,
                'status' => $request->status,
                'description' => 'Rider assigned and package ready for shipping',
                'location' => 'Warehouse',
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rider assigned successfully',
                'data' => $shipping->load('order', 'histories')
            ]);

        } catch (\Exception $e) {
            Log::error('Error assigning rider: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign rider',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update shipping status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|string|in:to_ship,shipped,delivered',
                'location' => 'nullable|string',
                'description' => 'nullable|string'
            ]);

            $shipping = Shipping::findOrFail($id);

            // Update shipping status
            $shipping->update([
                'status' => $request->status,
                'updated_at' => now()
            ]);

            // Update order status
            $shipping->order->update(['status' => $request->status]);

            // Create shipping history entry
            ShippingHistory::create([
                'shipping_id' => $shipping->id,
                'status' => $request->status,
                'description' => $request->description ?? $this->getStatusDescription($request->status),
                'location' => $request->location ?? 'In Transit',
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Shipping status updated successfully',
                'data' => $shipping->load('order', 'histories')
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating shipping status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update shipping status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get shipping details by tracking number
     */
    public function getByTrackingNumber($trackingNumber)
    {
        try {
            $shipping = Shipping::where('tracking_number', $trackingNumber)
                ->with(['order.customer', 'order.items.product', 'histories' => function($query) {
                    $query->orderBy('timestamp', 'desc');
                }])
                ->first();

            if (!$shipping) {
                return response()->json([
                    'success' => false,
                    'message' => 'Shipping not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $shipping
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching shipping details: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch shipping details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all shippings for a seller
     */
    public function getSellerShippings(Request $request)
    {
        try {
            $seller = $request->user()->seller;
            
            if (!$seller) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seller not found'
                ], 404);
            }

            $shippings = Shipping::whereHas('order', function($query) use ($seller) {
                $query->where('sellerID', $seller->sellerID);
            })
            ->with(['order.customer', 'histories' => function($query) {
                $query->orderBy('timestamp', 'desc');
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $shippings
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching seller shippings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch shippings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate tracking number
     */
    public function generateTrackingNumber()
    {
        do {
            $trackingNumber = 'CC' . date('Ymd') . strtoupper(Str::random(6));
        } while (Shipping::where('tracking_number', $trackingNumber)->exists());

        return response()->json([
            'success' => true,
            'tracking_number' => $trackingNumber
        ]);
    }

    /**
     * Get status description
     */
    private function getStatusDescription($status)
    {
        switch ($status) {
            case 'to_ship':
                return 'Package ready for shipping';
            case 'shipped':
                return 'Package has been shipped';
            case 'delivered':
                return 'Package has been delivered';
            default:
                return 'Status updated';
        }
    }
}
