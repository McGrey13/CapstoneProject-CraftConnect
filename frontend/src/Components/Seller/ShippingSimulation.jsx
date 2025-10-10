import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  Truck, MapPin, User, Phone, Package, Clock, CheckCircle, 
  AlertCircle, Download, Eye, Edit, Save, X
} from "lucide-react";
import api from "../../api";

const ShippingSimulation = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [riderInfo, setRiderInfo] = useState({
    riderName: "",
    riderPhone: "",
    riderEmail: "",
    riderCompany: "",
    vehicleType: "",
    vehicleNumber: ""
  });
  const [deliveryInfo, setDeliveryInfo] = useState({
    deliveryAddress: "",
    deliveryCity: "",
    deliveryProvince: "",
    deliveryNotes: ""
  });
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/seller');
      console.log('🚚 SHIPPING - All seller orders:', response.data.length);
      
      // ONLY show orders in packing status that DON'T have tracking numbers yet
      // Orders with tracking numbers should be handled in E-Receipt & Waybill section
      const filteredOrders = response.data.filter(order => {
        const hasNoTracking = !order.trackingNumber || order.trackingNumber.trim() === '';
        const isPacking = order.status === 'packing';
        
        console.log(`🚚 Order ${order.order_number}:`, {
          orderID: order.orderID,
          status: order.status,
          isPacking: isPacking,
          trackingNumber: order.trackingNumber || 'NONE',
          hasNoTracking: hasNoTracking,
          willShow: isPacking && hasNoTracking
        });
        
        // ONLY show packing orders that don't have tracking numbers yet
        return isPacking && hasNoTracking;
      });
      
      console.log('✅ Filtered orders for shipping (packing without tracking):', filteredOrders.length);
      filteredOrders.forEach(order => {
        console.log(`  ✓ Order ${order.order_number} - OrderID: ${order.orderID}`);
      });
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTrackingNumber = () => {
    const prefix = "CC";
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
                   (date.getMonth() + 1).toString().padStart(2, '0') +
                   date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${dateStr}${random}`;
  };

  const handleAssignRider = async (orderId) => {
    try {
      // Validate required fields
      if (!riderInfo.riderName || !riderInfo.riderPhone || !riderInfo.vehicleType || !riderInfo.vehicleNumber) {
        alert('Please fill in all required rider information fields');
        return;
      }

      // Use existing tracking number from order, or generate new one if not exists
      const existingTracking = selectedOrder.trackingNumber;
      const trackingNum = existingTracking || generateTrackingNumber();
      setTrackingNumber(trackingNum);

      // Convert camelCase to snake_case for backend
      const shippingData = {
        order_id: orderId,
        tracking_number: trackingNum,
        rider_info: {
          rider_name: riderInfo.riderName,
          rider_phone: riderInfo.riderPhone,
          rider_email: riderInfo.riderEmail,
          rider_company: riderInfo.riderCompany,
          vehicle_type: riderInfo.vehicleType,
          vehicle_number: riderInfo.vehicleNumber
        },
        delivery_info: {
          // Only send optional fields - address is auto-fetched from customer on backend
          delivery_notes: deliveryInfo.deliveryNotes
        },
        status: 'shipped' // Order status becomes 'shipped' when rider is assigned
      };

      console.log('Sending shipping data:', shippingData);

      const response = await api.post('/shipping/assign', shippingData);
      console.log('✅ Shipping assignment response:', response.data);
      
      // Show success message
      alert('✅ Rider assigned and tracking number generated! Order is now ready for E-Receipt. Tracking: ' + trackingNum);
      
      console.log('🔄 Updating local state for order:', orderId);
      console.log('📋 Orders before update:', orders.length);
      
      // Update local state - mark THIS SPECIFIC ORDER as shipped
      const updatedOrders = orders.map(order => {
        if (order.orderID === orderId) {
          console.log(`  ✓ Updating Order ${order.order_number} (ID: ${order.orderID}) to shipped`);
          return { ...order, status: 'shipped', trackingNumber: trackingNum };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      console.log('📋 Orders after update:', updatedOrders.length);

      setSelectedOrder(null);
      setIsEditing(false);
      resetForm();
      
      // Refresh orders list from server
      console.log('🔄 Refreshing orders from server...');
      await fetchOrders();
    } catch (error) {
      console.error('Error assigning rider:', error);
      console.error('Error details:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      alert('❌ Error assigning rider: ' + errorMessage);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      
      setOrders(orders.map(order => 
        order.orderID === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleUpdateShippingStatus = async (orderId, newStatus) => {
    try {
      // Find the shipping record for this order
      const order = orders.find(o => o.orderID === orderId);
      if (!order || !order.trackingNumber) {
        alert('❌ No tracking number found for this order');
        return;
      }

      // Get shipping record by tracking number
      const shippingResponse = await api.get(`/shipping/tracking/${order.trackingNumber}`);
      const shippingId = shippingResponse.data.data.id;

      // Update shipping status
      const response = await api.put(`/shipping/${shippingId}/status`, {
        status: newStatus,
        location: newStatus === 'shipped' ? 'In Transit' : 'Warehouse',
        description: newStatus === 'shipped' ? 'Package has been shipped and is in transit' : 'Package ready for shipping'
      });

      if (response.data.success) {
        alert(`✅ Order status updated to ${newStatus}`);
        
        // Update local state
        setOrders(orders.map(order => 
          order.orderID === orderId 
            ? { ...order, status: newStatus }
            : order
        ));
        
        // Refresh orders list
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error updating shipping status:', error);
      alert('❌ Error updating shipping status: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setRiderInfo({
      riderName: "",
      riderPhone: "",
      riderEmail: "",
      riderCompany: "",
      vehicleType: "",
      vehicleNumber: ""
    });
    setDeliveryInfo({
      deliveryAddress: "",
      deliveryCity: "",
      deliveryProvince: "",
      deliveryNotes: ""
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_payment': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'packing': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_payment': return <AlertCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'packing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a4785a] mx-auto mb-4"></div>
          <p className="text-[#5c3d28]">Loading shipping data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Shipping </h1>
            <p className="text-white/90 mt-1">Manage deliveries and track packages</p>
          </div>
        </div>
        
        {/* Order Flow Info */}
        <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
          <p className="text-white/90 text-sm mb-2 font-medium">📋 Shipping Simulation:</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="bg-white/20 px-3 py-1 rounded-full text-white">
              ✅ Shows ONLY orders in "Packing" status WITHOUT tracking numbers
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-white">
              📦 Assign rider → Generate tracking number → Ready for E-Receipt
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-white">
              🧾 Orders with tracking numbers appear in "E-Receipt & Waybill"
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <Card className="border-2 border-[#e5ded7] shadow-xl">
          <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
            <CardTitle className="text-[#5c3d28] flex items-center text-xl">
              <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                <Package className="h-5 w-5 text-white" />
              </div>
              Orders Ready for Tracking Assignment
            </CardTitle>
            <CardDescription className="text-[#7b5a3b] ml-11">
              Only shows orders in "Packing" status WITHOUT tracking numbers - ready to assign rider and generate tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-[#7b5a3b] font-semibold mb-2">No orders ready for tracking assignment</p>
                  <p className="text-[#7b5a3b] text-sm">Orders will appear here when they are packed but don't have tracking numbers yet</p>
                  <p className="text-[#7b5a3b] text-xs mt-2">Orders with tracking numbers are handled in "E-Receipt & Waybill" section</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.orderID}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      selectedOrder?.orderID === order.orderID
                        ? 'border-[#a4785a] bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10'
                        : 'border-[#e5ded7] hover:border-[#a4785a]/50 hover:shadow-md'
                    }`}
                    onClick={() => {
                      setSelectedOrder(order);
                      // Auto-populate delivery info from order's customer location
                      setDeliveryInfo({
                        deliveryAddress: order.location || "",
                        deliveryCity: "",
                        deliveryProvince: "",
                        deliveryNotes: ""
                      });
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-[#5c3d28] bg-white px-2 py-1 rounded border border-[#e5ded7]">
                            {order.order_number || `ORD-${order.orderID}`}
                          </h3>
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Packed - Ready
                          </Badge>
                          {order.payment_method && (
                            <Badge className={`flex items-center gap-1 ${
                              order.payment_method === 'cod' ? 'bg-yellow-100 text-yellow-800' :
                              order.payment_method === 'gcash' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {order.payment_method.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[#7b5a3b] text-sm font-medium">
                          👤 {order.customer || 'Unknown'}
                        </p>
                        <p className="text-[#7b5a3b] text-sm">
                          📦 Items: {order.items || 0} • 💰 Total: ₱{order.totalAmount?.toFixed(2) || order.total || '0.00'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Order ID: #{order.orderID}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1 px-3 py-1">
                          <AlertCircle className="h-4 w-4" />
                          No Tracking Yet
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rider Assignment & Delivery Info */}
        <Card className="border-2 border-[#e5ded7] shadow-xl">
          <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
            <CardTitle className="text-[#5c3d28] flex items-center text-xl">
              <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                <User className="h-5 w-5 text-white" />
              </div>
              Rider & Delivery Information
            </CardTitle>
            <CardDescription className="text-[#7b5a3b] ml-11">
              {selectedOrder ? `Assign rider and generate tracking for Order #${selectedOrder.orderID}` : 'Select an order to assign rider and generate tracking number'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {selectedOrder ? (
              <div className="space-y-6">
                {/* Rider Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#5c3d28] flex items-center">
                    <User className="h-5 w-5 mr-2 text-[#a4785a]" />
                    Rider Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="riderName" className="text-[#5c3d28] font-medium">Rider Name</Label>
                      <Input
                        id="riderName"
                        value={riderInfo.riderName}
                        onChange={(e) => setRiderInfo({...riderInfo, riderName: e.target.value})}
                        placeholder="Enter rider name"
                        className="border-[#e5ded7] focus:border-[#a4785a] bg-[#faf9f8] text-[#5c3d28]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="riderPhone" className="text-[#5c3d28] font-medium">Phone Number</Label>
                      <Input
                        id="riderPhone"
                        value={riderInfo.riderPhone}
                        onChange={(e) => setRiderInfo({...riderInfo, riderPhone: e.target.value})}
                        placeholder="Enter phone number"
                        className="border-[#e5ded7] focus:border-[#a4785a] bg-[#faf9f8] text-[#5c3d28]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="riderEmail" className="text-[#5c3d28] font-medium">Email</Label>
                      <Input
                        id="riderEmail"
                        type="email"
                        value={riderInfo.riderEmail}
                        onChange={(e) => setRiderInfo({...riderInfo, riderEmail: e.target.value})}
                        placeholder="Enter email address"
                        className="border-[#e5ded7] focus:border-[#a4785a] bg-[#faf9f8] text-[#5c3d28]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="riderCompany" className="text-[#5c3d28] font-medium">Company / Workplace</Label>
                      <Input
                        id="riderCompany"
                        value={riderInfo.riderCompany}
                        onChange={(e) => setRiderInfo({...riderInfo, riderCompany: e.target.value})}
                        placeholder="e.g., JRS Express, LBC, J&T"
                        className="border-[#e5ded7] focus:border-[#a4785a] bg-[#faf9f8] text-[#5c3d28]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleType" className="text-[#5c3d28] font-medium">Vehicle Type</Label>
                      <Input
                        id="vehicleType"
                        value={riderInfo.vehicleType}
                        onChange={(e) => setRiderInfo({...riderInfo, vehicleType: e.target.value})}
                        placeholder="e.g., Motorcycle, Van, Truck"
                        className="border-[#e5ded7] focus:border-[#a4785a] bg-[#faf9f8] text-[#5c3d28]"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="vehicleNumber" className="text-[#5c3d28] font-medium">Vehicle Number</Label>
                      <Input
                        id="vehicleNumber"
                        value={riderInfo.vehicleNumber}
                        onChange={(e) => setRiderInfo({...riderInfo, vehicleNumber: e.target.value})}
                        placeholder="Enter vehicle plate number"
                        className="border-[#e5ded7] focus:border-[#a4785a] bg-[#faf9f8] text-[#5c3d28]"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#5c3d28] flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-[#a4785a]" />
                    Delivery Information
                    <Badge className="ml-2 bg-blue-100 text-blue-800">Auto-fetched from Customer</Badge>
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Customer Complete Address */}
                    <div className="space-y-2">
                      <Label htmlFor="deliveryAddress" className="text-[#5c3d28] font-medium">
                        Customer's Delivery Address (Auto-fetched)
                      </Label>
                      <Textarea
                        id="deliveryAddress"
                        value={deliveryInfo.deliveryAddress}
                        readOnly
                        disabled
                        rows={4}
                        className="border-2 border-blue-200 bg-blue-50 text-[#5c3d28] resize-none cursor-not-allowed font-medium"
                        placeholder="Customer's complete delivery address will appear here..."
                      />
                      <p className="text-xs text-blue-800 font-medium">
                        📍 This address includes the customer's street, city, and province from their profile
                      </p>
                    </div>
                    
                    {/* Delivery Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="deliveryNotes" className="text-[#5c3d28] font-medium">
                        Delivery Notes (Optional)
                      </Label>
                      <Textarea
                        id="deliveryNotes"
                        value={deliveryInfo.deliveryNotes}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, deliveryNotes: e.target.value})}
                        placeholder="Add special delivery instructions for the rider..."
                        rows={3}
                        className="border-[#e5ded7] focus:border-[#a4785a] bg-[#faf9f8] text-[#5c3d28] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleAssignRider(selectedOrder.orderID)}
                    className="flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8a6b4a] hover:to-[#6b4a2f] shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Assign Rider & Generate Tracking
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedOrder(null);
                      resetForm();
                    }}
                    className="border-[#e5ded7] text-[#5c3d28] hover:bg-[#faf9f8] hover:border-[#a4785a] transition-all duration-200"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-[#7b5a3b] text-lg">Select an order to assign rider</p>
                <p className="text-[#7b5a3b] text-sm mt-2">Choose from the orders list to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShippingSimulation;
