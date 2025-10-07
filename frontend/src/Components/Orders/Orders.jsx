import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Clock, Package, Truck, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('To Pay');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        alert('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': {
        title: 'To Pay',
        description: 'Payment pending',
        icon: Clock,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      'processing': {
        title: 'To Ship',
        description: 'Order processing',
        icon: Package,
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
    'To Pay': orders.filter(order => order.status === 'pending'),
    'To Ship': orders.filter(order => order.status === 'processing'),
    'To Receive': orders.filter(order => order.status === 'shipped'),
    'Completed': orders.filter(order => order.status === 'delivered'),
    'Return/Refund': orders.filter(order => order.status === 'returned' || order.status === 'cancelled')
  };

  const statusColumns = [
    { key: 'To Pay', title: 'To Pay', icon: Clock, color: 'yellow' },
    { key: 'To Ship', title: 'To Ship', icon: Package, color: 'blue' },
    { key: 'To Receive', title: 'To Receive', icon: Truck, color: 'purple' },
    { key: 'Completed', title: 'Completed', icon: CheckCircle2, color: 'green' },
    { key: 'Return/Refund', title: 'Return/Refund', icon: RotateCcw, color: 'orange' }
  ];

  const renderOrderCard = (order) => {
    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;
    
    return (
      <Card key={order.orderID} className="border-[#e5ded7] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4">
        <div className="bg-[#f8f5f2] px-4 py-3 border-b border-[#e5ded7]">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">Order #</span>
              <span className="font-medium ml-1">{order.orderID}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Total:</span>{' '}
              <span className="font-bold">₱{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatDate(order.orderDate)}
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
                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
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
                      {activeTab === 'To Pay' && 'Orders waiting for payment'}
                      {activeTab === 'To Ship' && 'Orders being processed and prepared for shipping'}
                      {activeTab === 'To Receive' && 'Orders on their way to you'}
                      {activeTab === 'Completed' && 'Orders successfully delivered'}
                      {activeTab === 'Return/Refund' && 'Orders returned or refunded'}
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
                          {activeTab === 'To Pay' && 'All your orders are paid and ready to process!'}
                          {activeTab === 'To Ship' && 'Your orders are being prepared for shipping.'}
                          {activeTab === 'To Receive' && 'Your orders will appear here once they ship.'}
                          {activeTab === 'Completed' && 'Completed orders will appear here after delivery.'}
                          {activeTab === 'Return/Refund' && 'Returned or refunded orders will appear here.'}
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
                        {ordersInColumn.map(renderOrderCard)}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
