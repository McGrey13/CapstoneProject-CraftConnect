import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Megaphone,
  Mail,
  Gift,
  Tag,
  TrendingUp,
  X,
  Loader2,
  Copy,
  Trash2,
  RefreshCw,
  Share2,
  Star
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import api from "../../api";
import SellerAnalytics from "./SellerAnalytics";

const MarketingTools = () => {
  const [activeTab, setActiveTab] = useState('promotions');
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [sellerId, setSellerId] = useState(null);

  // Fetch seller information
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const response = await api.get('/sellers/profile');
        if (response.data) {
          setSellerId(response.data.sellerID);
        }
      } catch (error) {
        console.error('Error fetching seller data:', error);
      }
    };

    fetchSellerData();
  }, []);

const fetchProducts = async () => {
  try {
    setIsLoadingProducts(true);
    const response = await api.get('/seller/products');

    if (response.data) {
      const data = response.data;
      
      // Ensure each product has the correct ID field
      const processedData = Array.isArray(data) ? data.map(product => ({
        ...product,
        id: product.product_id || product.id // Ensure we have a consistent ID field
      })) : [];
      
      setProducts(processedData);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    alert(error.message || 'Failed to load products');
  } finally {
    setIsLoadingProducts(false);
  }
};

  const toggleFeatured = async (productId, currentStatus) => {
    if (!productId) {
      console.error('Product ID is undefined');
      alert('Invalid product ID');
      return;
    }

    try {
      const response = await api.post(`/products/${productId}/toggle-featured`, {});

      if (response.data) {
        console.log('Toggle featured response:', response.data);

        // Update the local state to reflect the change
        setProducts(prevProducts => prevProducts.map(product => 
          product.id === productId 
            ? { ...product, is_featured: !currentStatus } 
            : product
        ));

        // Show success message
        alert('Product featured status updated successfully');
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      alert(error.message || 'Failed to update featured status');
    }
  };

  useEffect(() => {
    fetchDiscounts();
    if (activeTab === 'featured') {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchDiscounts = async () => {
    try {
      setIsLoading(true);
      
      console.log('Fetching discount codes...');
      const response = await api.get('/discount-codes');
      
      console.log('Discount codes response status:', response.status);
      
      if (response.data) {
        const responseData = response.data;
        console.log('Raw API response:', responseData);
        
        // Handle different response formats
        let discountsData = [];
        if (Array.isArray(responseData)) {
          discountsData = responseData;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          discountsData = responseData.data;
        } else if (responseData.discounts && Array.isArray(responseData.discounts)) {
          discountsData = responseData.discounts;
        }
        
        console.log('Processed discounts data:', discountsData);
        setDiscounts(discountsData);
      }
    } catch (error) {
      console.error('Error in fetchDiscounts:', error);
      // Only show error to user if it's not an auth error (handled by auth flow)
      if (!error.message.includes('401') && !error.message.includes('auth_token')) {
        alert(`Error loading discount codes: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    
    if (!discountCode || !discountAmount) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);

      const response = await api.post('/discount-codes', {
        code: discountCode.trim(),
        type: 'percentage',
        value: parseFloat(discountAmount),
        usage_limit: usageLimit ? parseInt(usageLimit) : null,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      });

      if (response.data) {
        const responseData = response.data;

        // Add the new discount to the list
        setDiscounts(prevDiscounts => [responseData, ...prevDiscounts]);
        
        // Reset form
        setDiscountCode('');
        setDiscountAmount('');
        setUsageLimit('');
        
        // Show success message
        alert(`Discount code "${responseData.code}" created successfully!`);
      }
    } catch (error) {
      console.error('Error creating discount code:', error);
      alert(`Error: ${error.message || 'Failed to create discount code. Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount code?')) {
      return;
    }

    try {
      const response = await api.delete(`/discount-codes/${id}`);

      if (response.data) {
        setDiscounts(discounts.filter(discount => discount.id !== id));
        alert('Discount code deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting discount code:', error);
      alert('Failed to delete discount code');
    }
  };
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Marketing Tools</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="discounts">Discount Codes</TabsTrigger>
          <TabsTrigger value="featured">Featured Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="promotions" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Megaphone className="h-5 w-5 mr-2 text-primary" />
                  Featured Product
                </CardTitle>
                <CardDescription>
                  Highlight a product on your storefront
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab('featured')}
                >
                  Manage Featured Products
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-primary" />
                  Flash Sale
                </CardTitle>
                <CardDescription>Create a limited-time offer</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Create Flash Sale
                </Button>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="featured" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Featured Products</CardTitle>
              <CardDescription>
                Select products to feature on your storefront
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProducts ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No products found. Please add some products first.
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id || product.product_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        {product.productImage ? (
                          <img 
                            src={product.productImage} 
                            alt={product.productName}
                            className="h-16 w-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                            <div className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{product.productName}</div>
                          <div className="text-sm text-gray-500">
                            {product.category} • ${product.productPrice}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={product.is_featured ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFeatured(product.id || product.product_id, product.is_featured)}
                        disabled={isLoadingProducts}
                      >
                        {product.is_featured ? (
                          <>
                            <Star className={`h-4 w-4 mr-2 ${product.is_featured ? "text-yellow-500 fill-yellow-500" : ""}`}/>
                            Featured
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Feature
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discounts" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-primary" />
                  Create Discount Code
                </CardTitle>
                <CardDescription>
                  Create a new discount code for your customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleCreateDiscount} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Discount Code</Label>
                    <div className="flex items-center">
                      <Input 
                        id="code" 
                        placeholder="SUMMER25" 
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        className="font-mono tracking-wider"
                        required
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="ml-2"
                        onClick={() => {
                          // Generate a random 8-character code
                          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                          let result = '';
                          for (let i = 0; i < 8; i++) {
                            result += chars.charAt(Math.floor(Math.random() * chars.length));
                          }
                          setDiscountCode(result);
                        }}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount-amount">Discount Value (%)</Label>
                    <div className="relative">
                      <Input 
                        id="discount-amount" 
                        type="number" 
                        min="1" 
                        max="100"
                        placeholder="25" 
                        value={discountAmount}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(1, parseInt(e.target.value) || 1));
                          setDiscountAmount(value);
                        }}
                        className="pl-8"
                        required
                      />
                      <span className="absolute left-3 top-2.5 text-gray-500">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usage-limit">Usage Limit (optional)</Label>
                    <Input 
                      id="usage-limit" 
                      type="number" 
                      min="1"
                      placeholder="Leave empty for unlimited" 
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value ? Math.max(1, parseInt(e.target.value) || 1) : '')}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {usageLimit ? `Code can be used ${usageLimit} time${usageLimit > 1 ? 's' : ''}` : 'No usage limit set'}
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : 'Create Discount Code'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Active Discounts</CardTitle>
                    <CardDescription>
                      {discounts.length} active code{discounts.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchDiscounts}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading && discounts.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : discounts.length > 0 ? (
                  <TooltipProvider>
                    <div className="space-y-3">
                    {discounts.map((discount) => (
                      <div 
                        key={discount.id}
                        className={`flex items-center justify-between p-4 border rounded-md transition-colors ${
                          discount.is_active ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 opacity-75'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-mono font-bold text-lg">{discount.code}</p>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              discount.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {discount.is_active ? 'Active' : 'Expired'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {discount.value}% off {discount.type === 'fixed' ? 'fixed' : ''}
                          </p>
                          
                          {discount.expires_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              Expires: {new Date(discount.expires_at).toLocaleDateString()}
                            </p>
                          )}
                          
                          {discount.usage_limit ? (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    discount.is_active ? 'bg-green-500' : 'bg-gray-400'
                                  }`}
                                  style={{ 
                                    width: `${Math.max(5, (discount.remaining_uses / discount.usage_limit) * 100)}%`
                                  }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {discount.remaining_uses} of {discount.usage_limit} uses remaining
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-green-600 mt-1">Unlimited uses</p>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {new Date(discount.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    navigator.clipboard.writeText(discount.code);
                                    // Could add a toast notification here
                                    alert(`Copied ${discount.code} to clipboard`);
                                  }}
                                >
                                  <Copy className="h-4 w-4" />
                                  <span className="sr-only">Copy code</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy code</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                  onClick={async () => {
                                    if (window.confirm(`Are you sure you want to delete discount code ${discount.code}? This action cannot be undone.`)) {
                                      setIsLoading(true);
                                      try {
                                        const response = await api.delete(`/discount-codes/${discount.id}`);
                                        
                                        if (response.data) {
                                          // Show success message
                                          alert(`Discount code ${discount.code} has been deleted`);
                                          
                                          // Refresh the list
                                          fetchDiscounts();
                                        }
                                      } catch (error) {
                                        console.error('Error deleting discount code:', error);
                                        alert(error.message || 'Failed to delete discount code');
                                      } finally {
                                        setIsLoading(false);
                                      }
                                    }
                                  }}
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Delete code</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete code</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          
                          {discount.is_active && discount.remaining_uses > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7"
                                  onClick={() => {
                                    // Handle share functionality
                                    const shareUrl = `${window.location.origin}/checkout?discount=${encodeURIComponent(discount.code)}`;
                                    navigator.clipboard.writeText(shareUrl);
                                    alert(`Shareable link copied to clipboard!`);
                                  }}
                                >
                                  <Share2 className="h-3 w-3 mr-1" /> Share
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy shareable link</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    ))}
                    </div>
                  </TooltipProvider>
                ) : (
                  <div className="text-center py-8">
                    <Gift className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No active discount codes</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first discount code to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 pt-4">
          <SellerAnalytics sellerId={sellerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingTools;
