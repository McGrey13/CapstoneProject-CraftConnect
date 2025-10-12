import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, ArrowLeft, Clock, Package, Truck, CheckCircle2, RotateCcw, XCircle, Star, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import api from '../../api';
import { useUser } from '../Context/UserContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('To Package');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useUser();
  
  // Rating & Review states
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productRating, setProductRating] = useState(0);
  const [sellerRating, setSellerRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    // Check for payment status in URL query params
    const searchParams = new URLSearchParams(location.search);
    const paymentStatus = searchParams.get('payment');
    const sourceId = searchParams.get('source_id');

    if (paymentStatus === 'success') {
      alert('Payment successful! Your order has been confirmed.');
      // Clean up URL
      navigate('/orders', { replace: true });
    } else if (paymentStatus === 'failed') {
      alert('Payment failed. Please try again or choose a different payment method.');
      // Clean up URL
      navigate('/orders', { replace: true });
    } else if (paymentStatus === 'error') {
      alert('There was an error processing your payment. Please contact support if the issue persists.');
      // Clean up URL
      navigate('/orders', { replace: true });
    }
  }, [location, navigate]);

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    try {
      console.log('🔍 Fetching orders for user:', user?.userName, 'User ID:', user?.userID);
      const response = await api.get('/orders');
      console.log('📦 Orders API response:', response.data);
      console.log('📦 Response is array?', Array.isArray(response.data));
      
      // Handle different response structures
      const ordersData = Array.isArray(response.data) ? response.data : response.data.data || [];
      
      // Log each order's details for debugging
      console.log('✅ Total orders received:', ordersData.length);
      ordersData.forEach(order => {
        console.log(`📋 Order #${order.orderID} (${order.order_number}):`, {
          status: order.status,
          paymentStatus: order.paymentStatus,
          payment_method: order.payment_method,
          created: order.orderDate,
          totalAmount: order.totalAmount,
          itemsCount: order.items?.length
        });
      });
      
      console.log('💾 Setting orders state with', ordersData.length, 'orders');
      setOrders(ordersData);
      console.log('✅ Orders state updated!');
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      if (error.response?.status === 401) {
        console.log('Authentication failed, redirecting to login');
        alert('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        alert('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate, isAuthenticated, user]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusInfo = (status, paymentStatus) => {
    const statusMap = {
      'pending': {
        title: 'To Pay',
        description: paymentStatus === 'paid' ? 'Payment received, ready to ship' : 'Payment pending',
        icon: Clock,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      'processing': {
        title: 'To Package',
        description: 'Payment received - Ready to package',
        icon: Package,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      'packing': {
        title: 'To Ship',
        description: 'Seller is packing your order',
        icon: Truck,
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      'shipped': {
        title: 'To Receive',
        description: 'Out for delivery',
        icon: Truck,
        color: 'bg-purple-500',
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      'delivered': {
        title: 'Completed',
        description: 'Order delivered',
        icon: CheckCircle2,
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      'cancelled': {
        title: 'Cancelled',
        description: 'Order cancelled',
        icon: XCircle,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      'payment_failed': {
        title: 'Return/Refund',
        description: 'Payment failed',
        icon: XCircle,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      'returned': {
        title: 'Return/Refund',
        description: 'Return processed',
        icon: RotateCcw,
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      }
    };

    return statusMap[status] || statusMap['pending'];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#a36b4f]" />
      </div>
    );
  }

  // Group orders by status
  const groupedOrders = {
    'To Package': orders.filter(order => {
      // Debug each order
      const shouldShow = 
        order.status === 'processing' ||
        (order.status === 'pending' && order.paymentStatus === 'paid') ||
        (order.status === 'pending' && order.payment_method === 'cod') ||
        (order.status === 'pending' && (order.payment_method === 'gcash' || order.payment_method === 'paymaya'));
      
      console.log(`Order #${order.orderID} - To Package filter:`, {
        status: order.status,
        paymentStatus: order.paymentStatus,
        payment_method: order.payment_method,
        shouldShow: shouldShow
      });
      
      return shouldShow;
    }),
    'To Ship': orders.filter(order => 
      order.status === 'packing'
    ),
    'To Receive': orders.filter(order => order.status === 'shipped'),
    'Completed': orders.filter(order => order.status === 'delivered'),
    'Rating & Review': orders.filter(order => order.status === 'delivered'), // Only delivered orders can be reviewed
    'Return/Refund': orders.filter(order => 
      order.status === 'returned' || 
      order.status === 'cancelled' ||
      order.status === 'payment_failed' ||
      order.status === 'failed' // Orders with failed status
      // Don't include pending online payments here anymore - they show in To Package
    )
  };

  const statusColumns = [
    { key: 'To Package', title: 'To Package', icon: Package, color: 'yellow' },
    { key: 'To Ship', title: 'To Ship', icon: Truck, color: 'blue' },
    { key: 'To Receive', title: 'To Receive', icon: Truck, color: 'purple' },
    { key: 'Completed', title: 'Completed', icon: CheckCircle2, color: 'green' },
    { key: 'Rating & Review', title: 'Rating & Review', icon: Star, color: 'amber' },
    { key: 'Return/Refund', title: 'Return/Refund', icon: RotateCcw, color: 'orange' }
  ];

  // Log grouped orders count for debugging
  console.log('📊 Grouped orders count:', {
    'To Package': groupedOrders['To Package'].length,
    'To Ship': groupedOrders['To Ship'].length,
    'To Receive': groupedOrders['To Receive'].length,
    'Completed': groupedOrders['Completed'].length,
    'Return/Refund': groupedOrders['Return/Refund'].length
  });
  console.log('📊 Total orders in state:', orders.length);
  
  // List all orders by status
  console.log('📊 Orders by status breakdown:');
  orders.forEach(order => {
    console.log(`  - Order ${order.order_number}: status="${order.status}", payment="${order.paymentStatus}", method="${order.payment_method}"`);
  });

  const handleMarkAsReceived = async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/mark-received`);
      if (response.data.success) {
        alert('Order marked as received! Thank you for your purchase.');
        // Refresh orders
        fetchOrders();
      }
    } catch (error) {
      console.error('Error marking order as received:', error);
      alert(error.response?.data?.message || 'Failed to mark order as received');
    }
  };

  const handleOpenReview = (order, product = null) => {
    setSelectedOrder(order);
    setSelectedProduct(product);
    setProductRating(0);
    setSellerRating(0);
    setReviewText('');
    setShowReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (productRating === 0 && sellerRating === 0) {
      alert('Please provide at least one rating');
      return;
    }

    try {
      setSubmittingReview(true);
      
      // Submit product review if rating provided
      if (productRating > 0 && selectedProduct) {
        await api.post(`/products/${selectedProduct.product_id}/reviews`, {
          rating: productRating,
          review: reviewText,
          order_id: selectedOrder.orderID
        });
      }

      // Submit seller review if rating provided
      if (sellerRating > 0 && selectedOrder.seller_id) {
        await api.post(`/sellers/${selectedOrder.seller_id}/reviews`, {
          rating: sellerRating,
          review: reviewText,
          order_id: selectedOrder.orderID
        });
      }

      alert('Thank you for your review!');
      setShowReviewDialog(false);
      fetchOrders();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange(star)}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform duration-200`}
          >
            <Star
              className={`h-8 w-8 ${
                star <= rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderReviewCard = (order) => {
    return (
      <Card key={order.orderID} className="border-2 border-[#d5bfae] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 mb-4">
        <div className="bg-gradient-to-r from-[#f5f0eb] to-[#ede5dc] px-6 py-4 border-b-2 border-[#d5bfae]">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-[#7b5a3b] font-medium">Order Number:</span>
                <span className="font-bold text-[#5c3d28] bg-white px-3 py-1 rounded-lg border-2 border-[#d5bfae] shadow-sm">
                  {order.order_number || `ORD-${order.orderID}`}
                </span>
              </div>
              <div className="text-xs text-[#7b5a3b] mt-2 flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                {formatDate(order.orderDate)}
              </div>
            </div>
            <div className="text-sm text-right">
              <span className="text-[#7b5a3b]">Total:</span>{' '}
              <span className="font-bold text-xl text-[#5c3d28]">₱{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            {order.items && order.items.map((item) => (
              <div key={item.order_product_id} className="bg-gradient-to-br from-white to-[#faf9f8] p-5 rounded-xl border-2 border-[#d5bfae] hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border-2 border-[#d5bfae] shadow-sm">
                    {item.product_image ? (
                      <img
                        src={`http://localhost:8000/storage/${item.product_image}`}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <h4 className="font-bold text-[#5c3d28] text-lg mb-2">{item.product_name}</h4>
                    <p className="text-sm text-[#7b5a3b] mb-3">Qty: {item.quantity} × ₱{parseFloat(item.price).toFixed(2)}</p>
                    <Button
                      onClick={() => handleOpenReview(order, item)}
                      className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                    >
                      <Star className="h-5 w-5 mr-2" />
                      Rate This Product
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOrderCard = (order) => {
    const statusInfo = getStatusInfo(order.status, order.paymentStatus);
    const StatusIcon = statusInfo.icon;
    
    return (
      <Card key={order.orderID} className="border-[#e5ded7] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4">
        <div className="bg-[#f8f5f2] px-4 py-3 border-b border-[#e5ded7]">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-500">Order Number:</span>
                <span className="font-bold text-[#5c3d28] bg-white px-2 py-1 rounded border border-[#e5ded7]">
                  {order.order_number || `ORD-${order.orderID}`}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Payment Status Badge */}
                {order.paymentStatus === 'paid' && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    ✓ Paid ({order.payment_method?.toUpperCase() || 'Online'})
                  </Badge>
                )}
                {order.paymentStatus === 'pending' && order.payment_method === 'cod' && (
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                    COD
                  </Badge>
                )}
                {order.paymentStatus === 'pending' && order.payment_method === 'gcash' && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    GCash (Pending)
                  </Badge>
                )}
                {order.paymentStatus === 'pending' && order.payment_method === 'paymaya' && (
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    PayMaya (Pending)
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-sm text-right">
              <span className="text-gray-500">Total:</span>{' '}
              <span className="font-bold text-lg">₱{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2 flex items-center gap-3">
            <span>
              <span className="mr-1">📅</span>
              {formatDate(order.orderDate)}
            </span>
            {order.tracking_number && (
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono text-xs">
                📦 {order.tracking_number}
              </span>
            )}
          </div>
        </div>
        
        <CardContent className="p-3">
          {order.items && order.items.slice(0, 2).map((item) => (
            <div key={item.order_product_id} className="flex items-center gap-3 py-2">
              <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                {item.product_image ? (
                  <img
                    src={`http://localhost:8000/storage/${item.product_image}`}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
              </div>
              
              <div className="flex-grow min-w-0">
                <h4 className="font-medium text-[#4b3832] text-sm truncate">{item.product_name}</h4>
                {item.sku && (
                  <p className="text-xs text-[#7b5a3b] font-mono bg-[#faf9f8] px-2 py-0.5 rounded inline-block mt-1">
                    SKU: {item.sku}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-1">Qty: {item.quantity}</p>
                <p className="text-xs text-[#a36b4f] font-medium">
                  ₱{parseFloat(item.price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          {order.items && order.items.length > 2 && (
            <div className="text-xs text-gray-500 text-center py-1">
              +{order.items.length - 2} more items
            </div>
          )}
          
          {/* Order Received Button - Only show for shipped orders */}
          {order.status === 'shipped' && (
            <div className="mt-4 pt-3 border-t border-[#e5ded7]">
              <Button
                onClick={() => handleMarkAsReceived(order.orderID)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Order Received
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-[#4b3832]">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <Button onClick={() => navigate('/products')}>
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Horizontal Navigation Tabs */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            {statusColumns.map((column) => {
              const ColumnIcon = column.icon;
              const ordersInColumn = groupedOrders[column.key];
              const isActive = activeTab === column.key;
              
              return (
                <Button
                  key={column.key}
                  onClick={() => setActiveTab(column.key)}
                  variant={isActive ? "default" : "outline"}
                  className={`flex items-center gap-2 px-4 py-2 transition-all duration-300 ${
                    isActive
                      ? `bg-${column.color}-500 hover:bg-${column.color}-600 text-white`
                      : `border-${column.color}-300 text-${column.color}-600 hover:bg-${column.color}-50`
                  }`}
                >
                  <ColumnIcon className="h-4 w-4" />
                  <span className="font-medium">{column.title}</span>
                  <Badge 
                    variant="secondary" 
                    className={`ml-1 text-xs ${
                      isActive 
                        ? 'bg-white text-gray-700' 
                        : `bg-${column.color}-100 text-${column.color}-700`
                    }`}
                  >
                    {ordersInColumn.length}
                  </Badge>
                </Button>
              );
            })}
          </div>

          {/* Active Column Content */}
          <div className="bg-white rounded-lg border border-[#e5ded7] shadow-sm">
            {(() => {
              const activeColumn = statusColumns.find(col => col.key === activeTab);
              const ColumnIcon = activeColumn.icon;
              const ordersInColumn = groupedOrders[activeTab];
              
              return (
                <>
                  {/* Column Header */}
                  <div className={`bg-${activeColumn.color}-50 border-b border-${activeColumn.color}-200 px-6 py-4 rounded-t-lg`}>
                    <div className="flex items-center gap-3">
                      <ColumnIcon className={`h-6 w-6 text-${activeColumn.color}-600`} />
                      <h2 className={`text-xl font-bold text-${activeColumn.color}-800`}>
                        {activeTab}
                      </h2>
                      <Badge 
                        variant="secondary" 
                        className={`bg-${activeColumn.color}-200 text-${activeColumn.color}-800`}
                      >
                        {ordersInColumn.length} order{ordersInColumn.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <p className={`text-sm text-${activeColumn.color}-600 mt-1`}>
                      {activeTab === 'To Package' && 'Paid orders ready to be packaged by seller'}
                      {activeTab === 'To Ship' && 'Orders being packed and ready to ship'}
                      {activeTab === 'To Receive' && 'Orders on their way to you'}
                      {activeTab === 'Completed' && 'Orders successfully delivered'}
                      {activeTab === 'Rating & Review' && 'Share your experience and help other shoppers'}
                      {activeTab === 'Return/Refund' && 'Cancelled, failed, or COD unpaid orders'}
                    </p>
                  </div>
                  
                  {/* Column Content */}
                  <div className="p-6">
                    {ordersInColumn.length === 0 ? (
                      <div className="text-center py-12">
                        <ColumnIcon className={`h-16 w-16 text-${activeColumn.color}-300 mx-auto mb-4`} />
                        <h3 className={`text-lg font-semibold text-${activeColumn.color}-600 mb-2`}>
                          No orders in this status
                        </h3>
                        <p className={`text-sm text-${activeColumn.color}-500 mb-6`}>
                          {activeTab === 'To Package' && 'No paid orders waiting to be packaged right now!'}
                          {activeTab === 'To Ship' && 'Orders will appear here once seller starts packing.'}
                          {activeTab === 'To Receive' && 'Your orders will appear here once they ship.'}
                          {activeTab === 'Completed' && 'Completed orders will appear here after delivery.'}
                          {activeTab === 'Rating & Review' && 'No orders available for review yet.'}
                          {activeTab === 'Return/Refund' && 'Cancelled, failed, or unpaid orders will appear here.'}
                        </p>
                        <Button 
                          onClick={() => navigate('/products')}
                          className="bg-[#a36b4f] hover:bg-[#8b5a47] text-white"
                        >
                          Continue Shopping
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ordersInColumn.map(activeTab === 'Rating & Review' ? renderReviewCard : renderOrderCard)}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-white to-[#faf9f8] border-2 border-[#d5bfae]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#5c3d28] flex items-center gap-2">
              <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
              Rate Your Experience
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Order Info */}
            {selectedOrder && (
              <div className="bg-gradient-to-r from-[#f5f0eb] to-[#ede5dc] p-4 rounded-xl border-2 border-[#d5bfae]">
                <p className="text-sm text-[#7b5a3b] font-medium">
                  Order: <span className="font-bold text-[#5c3d28]">{selectedOrder.order_number}</span>
                </p>
              </div>
            )}

            {/* Product Info */}
            {selectedProduct && (
              <div className="bg-white p-4 rounded-xl border-2 border-[#d5bfae] shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border-2 border-[#d5bfae]">
                    {selectedProduct.product_image ? (
                      <img
                        src={`http://localhost:8000/storage/${selectedProduct.product_image}`}
                        alt={selectedProduct.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#5c3d28]">{selectedProduct.product_name}</h4>
                    <p className="text-sm text-[#7b5a3b]">₱{parseFloat(selectedProduct.price).toFixed(2)}</p>
                  </div>
                </div>

                {/* Product Rating */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Product Rating
                  </label>
                  <StarRating rating={productRating} onRatingChange={setProductRating} />
                  <p className="text-xs text-[#7b5a3b]">
                    {productRating === 0 && 'Select a rating'}
                    {productRating === 1 && '⭐ Poor'}
                    {productRating === 2 && '⭐⭐ Fair'}
                    {productRating === 3 && '⭐⭐⭐ Good'}
                    {productRating === 4 && '⭐⭐⭐⭐ Very Good'}
                    {productRating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                  </p>
                </div>
              </div>
            )}

            {/* Seller Rating */}
            <div className="bg-gradient-to-br from-white to-[#faf9f8] p-4 rounded-xl border-2 border-[#d5bfae]">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Seller Service Rating
                </label>
                <StarRating rating={sellerRating} onRatingChange={setSellerRating} />
                <p className="text-xs text-[#7b5a3b]">
                  {sellerRating === 0 && 'Select a rating'}
                  {sellerRating === 1 && '⭐ Poor'}
                  {sellerRating === 2 && '⭐⭐ Fair'}
                  {sellerRating === 3 && '⭐⭐⭐ Good'}
                  {sellerRating === 4 && '⭐⭐⭐⭐ Very Good'}
                  {sellerRating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                </p>
              </div>
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Your Review (Optional)
              </label>
              <Textarea
                placeholder="Share your experience with this product and seller..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="border-2 border-[#d5bfae] focus:border-[#a4785a] resize-none"
              />
              <p className="text-xs text-[#7b5a3b]">
                Help other shoppers by sharing your honest feedback
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowReviewDialog(false)}
                variant="outline"
                className="flex-1 border-2 border-[#d5bfae] hover:bg-[#f5f0eb]"
                disabled={submittingReview}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={submittingReview || (productRating === 0 && sellerRating === 0)}
                className="flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
