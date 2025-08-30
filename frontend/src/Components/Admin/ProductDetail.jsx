import React, { useState, useEffect } from "react";
import { X, Edit, Package, DollarSign, ShoppingCart, User, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useCart } from "../cart/CartContext";

const ProductDetail = ({ productId, isOpen, onClose, onEdit }) => {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetails();
    }
  }, [isOpen, productId]);

  const fetchProductDetails = async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/products/${productId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to load product. Status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('Product data received:', responseData);
      
      // Handle different response structures
      let productData = responseData;
      if (responseData.data) {
        productData = responseData.data;
      } else if (Array.isArray(responseData) && responseData.length > 0) {
        productData = responseData[0];
      }
      
      if (!productData || typeof productData !== 'object') {
        throw new Error('Invalid product data received from server');
      }
      
      // Ensure required fields exist
      const processedProduct = {
        ...productData,
        product_id: productData.product_id || productData.id || productId,
        productName: productData.productName || productData.name || 'Unnamed Product',
        productPrice: parseFloat(productData.productPrice || productData.price || 0),
        productQuantity: parseInt(productData.productQuantity || productData.quantity || 0, 10),
        productImage: productData.productImage || productData.image || '',
        status: productData.status || 'pending',
        seller: productData.seller || { user: { userName: 'Unknown Seller' } }
      };
      
      console.log('Processed product data:', processedProduct);
      setProduct(processedProduct);
    } catch (err) {
      console.error("Error fetching product details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "out of stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      case "low stock":
        return <Badge className="bg-orange-500">Low Stock</Badge>;
      case "in stock":
        return <Badge className="bg-green-500">In Stock</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleAddToCart = async () => {
    if (!product || !product.product_id) {
      alert('Product information is incomplete');
      return;
    }

    if (loading) return; // Prevent multiple clicks

    try {
      setLoading(true);
      console.log('Attempting to add to cart:', {
        productId: product.product_id,
        productName: product.productName,
        quantity: quantity
      });
      
      const result = await addToCart(product, quantity);
      
      if (result && result.success) {
        console.log('Add to cart successful:', result);
        alert(`${product.productName} (${quantity}) added to cart`);
      } else {
        const errorMsg = result?.error || 'Failed to add item to cart';
        console.error('Add to cart failed:', errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error in handleAddToCart:', error);
      let errorMessage = 'An error occurred while adding to cart';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        errorMessage = error.response.data?.message || error.response.statusText || errorMessage;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request
        errorMessage = error.message || errorMessage;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading product details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-red-600">Error loading product details: {error}</p>
            <Button onClick={fetchProductDetails} className="mt-4">Retry</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Product Details</DialogTitle>
            <div className="flex gap-2">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  >
                    -
                  </Button>
                  <Input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))} 
                    className="w-16 text-center"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setQuantity(prev => prev + 1)}
                  >
                    +
                  </Button>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleAddToCart}
                  disabled={loading}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {product && (
          <div className="space-y-6">
            {/* Product Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                    {product.productImage ? (
                      <img
                        src={product.image_url || product.productImage}
                        alt={product.productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{product.productName}</h2>
                    <p className="text-gray-600">Product ID: {product.product_id || product.id}</p>
                    <div className="mt-2 flex gap-2">
                      {getStatusBadge(product.approval_status)}
                      {getStatusBadge(product.status)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Product ID</label>
                  <p className="text-lg">{product.product_id || product.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-lg">{product.category || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <p className="text-lg flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    ₱{Number(product.productPrice).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p className="text-lg flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-gray-400" />
                    {product.productQuantity}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-lg">{product.productDescription || "No description provided"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Seller Information */}
            {product.seller && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Seller Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={product.seller.profile_image_url} 
                        alt={product.seller.user?.userName}
                      />
                      <AvatarFallback>
                        {product.seller.user?.userName?.slice(0, 2).toUpperCase() || "SE"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{product.seller.user?.userName || "N/A"}</h3>
                      <p className="text-gray-600">Seller ID: {product.seller.sellerID}</p>
                      <p className="text-gray-600">{product.seller.user?.userAddress || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Total Sales</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₱0.00</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">Views</div>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle>Timestamps</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {product.created_at ? new Date(product.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {product.updated_at ? new Date(product.updated_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetail;
