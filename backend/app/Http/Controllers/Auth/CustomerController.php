<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    /**
     * Get all customers
     */
    public function index()
    {
        try {
            $customers = User::where('role', 'customer')->get();
            
            return response()->json($customers);
        } catch (\Exception $e) {
            Log::error('Error fetching customers:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error fetching customers: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get a specific customer by ID
     */
    public function show($id)
    {
        try {
            $customer = User::where('userID', $id)->where('role', 'customer')->first();
            
            if (!$customer) {
                return response()->json(['message' => 'Customer not found'], 404);
            }
            
            return response()->json($customer);
        } catch (\Exception $e) {
            Log::error('Error fetching customer:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error fetching customer: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update a customer
     */
    public function update(Request $request, $id)
    {
        try {
            $customer = User::where('userID', $id)->where('role', 'customer')->first();
            
            if (!$customer) {
                return response()->json(['message' => 'Customer not found'], 404);
            }

            $request->validate([
                'userName' => 'nullable|string|max:255',
                'userEmail' => 'nullable|email|unique:users,userEmail,' . $id . ',userID',
                'userContactNumber' => 'nullable|string|max:255',
                'userAddress' => 'nullable|string|max:255',
                'userBirthday' => 'nullable|date',
                'userAge' => 'nullable|integer|min:0',
                'status' => 'nullable|in:active,inactive',
            ]);

            $customer->update($request->only([
                'userName', 'userEmail', 'userContactNumber', 'userAddress', 
                'userBirthday', 'userAge', 'status'
            ]));

            Log::info('Customer updated successfully:', ['customer_id' => $id]);
            
            return response()->json($customer);
        } catch (\Exception $e) {
            Log::error('Error updating customer:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error updating customer: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete a customer
     */
    public function destroy($id)
    {
        try {
            $customer = User::where('userID', $id)->where('role', 'customer')->first();
            
            if (!$customer) {
                return response()->json(['message' => 'Customer not found'], 404);
            }

            $customer->delete();

            Log::info('Customer deleted successfully:', ['customer_id' => $id]);
            
            return response()->json(['message' => 'Customer deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting customer:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error deleting customer: ' . $e->getMessage()], 500);
        }
    }
}
