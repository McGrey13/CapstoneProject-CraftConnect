import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('auth_token');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#a36b4f]" />
      </div>
    );
  }

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
          {orders.map((order) => (
            <Card key={order.orderID} className="border-[#e5ded7] overflow-hidden">
              <div className="bg-[#f8f5f2] px-6 py-3 border-b border-[#e5ded7] flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500">Order #</span>
                  <span className="font-medium ml-1">{order.orderID}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Placed on</span>{' '}
                  <span className="font-medium">{formatDate(order.orderDate)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Total:</span>{' '}
                  <span className="font-bold">₱{parseFloat(order.totalAmount).toFixed(2)}</span>
                </div>
                <div className="px-3 py-1 bg-[#e5ded7] rounded-full text-sm">
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>
              
              <CardContent className="p-0">
                {order.items.map((item) => (
                  <div key={item.order_product_id} className="p-6 border-b border-[#e5ded7] last:border-0 flex">
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
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
                    
                    <div className="ml-6 flex-grow">
                      <h3 className="font-medium text-[#4b3832]">{item.product_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">Sold by: {item.seller_name}</p>
                      <div className="mt-2 flex items-center">
                        <span className="text-[#a36b4f] font-medium">
                          ₱{parseFloat(item.price).toFixed(2)}
                        </span>
                        <span className="mx-2 text-gray-400">×</span>
                        <span className="text-gray-600">{item.quantity}</span>
                        <span className="ml-auto font-medium">
                          ₱{parseFloat(item.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
