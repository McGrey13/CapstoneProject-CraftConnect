/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Search, Filter, Plus, Download, RefreshCw, Edit, Trash2, Image as ImageIcon, ShoppingBag } from "lucide-react";
import { AddProductModal } from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import { useOrdersData } from "../../hooks/useOrdersData";
import LoadingSpinner from "../ui/LoadingSpinner";
import api from "../../api";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";

const OrdersTab = () => {
  const { ordersData, loading, error, refetch } = useOrdersData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusChangeOpen, setIsStatusChangeOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "shipped": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "packing": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "packing", label: "Packing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ];

  // Filter orders based on search term and status
  const filteredOrders = ordersData ? ordersData.filter(order => {
    const matchesSearch = order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  }) : [];

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleStatusChange = (order) => {
    setOrderToUpdate(order);
    setIsStatusChangeOpen(true);
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      console.log(`Updating order ${orderToUpdate.id} to ${newStatus}`);
      
      // Extract order ID from the order.id (format: ORD-123)
      const orderIdMatch = orderToUpdate.id.match(/\d+/);
      const orderId = orderIdMatch ? orderIdMatch[0] : orderToUpdate.orderID;
      
      if (!orderId) {
        console.error('Could not extract order ID from:', orderToUpdate.id);
        alert('Error: Could not find order ID');
        return;
      }
      
      console.log('Extracted order ID:', orderId);
      
      // Call API to update order status
      const response = await api.put(`/orders/${orderId}/status`, {
        status: newStatus
      });
      
      console.log('Order status update response:', response.data);
      
      if (response.data.success || response.data.order) {
        alert(`Order status updated to ${newStatus} successfully!`);
        setIsStatusChangeOpen(false);
        setOrderToUpdate(null);
        refetch();
      } else {
        alert('Failed to update order status. Please try again.');
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(error.response?.data?.message || "Error updating order status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="w-full pt-4">
        <LoadingSpinner message="Loading orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full pt-4">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-[#a4785a]" />
          <Input 
            placeholder="Search orders by customer, ID, or status..." 
            className="pl-10 pr-4 py-2.5 border-2 border-[#d5bfae] rounded-lg focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200"
            >
              <Filter className="mr-2 h-4 w-4" />Filter
              {statusFilter !== "all" && (
                <Badge className="ml-2 bg-[#a4785a] text-white">1</Badge>
              )}
            </Button>
            {isFilterOpen && (
              <div className="absolute top-full mt-2 right-0 bg-white border-2 border-[#d5bfae] rounded-lg shadow-xl z-10 min-w-[200px] p-2">
                <div className="text-sm font-semibold text-[#5c3d28] mb-2 px-2">Filter by Status</div>
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-all ${
                      statusFilter === option.value
                        ? "bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white"
                        : "hover:bg-[#f8f1ec] text-[#5c3d28]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200"
          >
            <Download className="mr-2 h-4 w-4" />Export
          </Button>
          <Button 
            onClick={refetch}
            className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <RefreshCw className="mr-2 h-4 w-4" />Refresh
          </Button>
        </div>
      </div>

      <Card className="border-[#e5ded7] shadow-xl">
        <CardHeader className="pb-4 border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
          <CardTitle className="text-[#5c3d28] text-xl">Recent Orders</CardTitle>
          <CardDescription className="text-[#7b5a3b]">Manage your customer orders and track their status</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <EmptyState
                      icon="📦"
                      title="No Orders Found"
                      description={searchTerm ? "No orders match your search criteria" : "You haven't received any orders yet"}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)} variant="outline">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                          className="text-[#a4785a] hover:bg-[#f8f1ec] hover:text-[#5c3d28] transition-all duration-200"
                        >
                          View
                        </Button>
                        {(order.status?.toLowerCase() === "pending" || order.status?.toLowerCase() === "processing") && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatusChange(order)}
                            className="text-[#7b5a3b] hover:bg-[#f8f1ec] hover:text-[#5c3d28] transition-all duration-200"
                          >
                            Pack
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Order Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium">Order ID</p>
                  <p className="text-lg font-semibold text-[#5c3d28]">{selectedOrder.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium">Status</p>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium">Customer</p>
                  <p className="text-lg font-semibold text-[#5c3d28]">{selectedOrder.customer}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium">Date</p>
                  <p className="text-lg font-semibold text-[#5c3d28]">{selectedOrder.date}</p>
                </div>
              </div>

              {/* Products List */}
              <div className="border-t border-[#e5ded7] pt-4">
                <h3 className="text-lg font-semibold text-[#5c3d28] mb-3">Order Items</h3>
                <div className="bg-[#faf9f8] rounded-lg border border-[#e5ded7] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-[#f8f1ec] to-[#faf9f8] hover:bg-gradient-to-r">
                        <TableHead className="font-semibold">Product</TableHead>
                        <TableHead className="font-semibold">SKU</TableHead>
                        <TableHead className="font-semibold text-center">Qty</TableHead>
                        <TableHead className="font-semibold text-right">Price</TableHead>
                        <TableHead className="font-semibold text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.products && selectedOrder.products.length > 0 ? (
                        selectedOrder.products.map((product, index) => (
                          <TableRow key={index} className="hover:bg-white/50">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {product.product_image && (
                                  <img 
                                    src={product.product_image} 
                                    alt={product.product_name}
                                    className="h-10 w-10 rounded object-cover"
                                  />
                                )}
                                <span className="font-medium text-[#5c3d28]">{product.product_name || 'Unknown Product'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-[#e5ded7] px-2 py-1 rounded text-[#7b5a3b]">
                                {product.sku || 'N/A'}
                              </code>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {product.quantity}
                            </TableCell>
                            <TableCell className="text-right text-[#5c3d28]">
                              ₱{parseFloat(product.price || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-[#5c3d28]">
                              ₱{parseFloat(product.total_amount || 0).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            No product details available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Total Summary */}
              <div className="border-t border-[#e5ded7] pt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-500 font-medium">Total Items</p>
                  <p className="text-lg font-semibold text-[#5c3d28]">{selectedOrder.items}</p>
                </div>
                <div className="flex justify-between items-center bg-gradient-to-r from-[#f8f1ec] to-[#faf9f8] p-3 rounded-lg">
                  <p className="text-base font-semibold text-[#5c3d28]">Total Amount</p>
                  <p className="text-2xl font-bold text-[#a4785a]">{selectedOrder.total}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#e5ded7]">
                <Button 
                  onClick={() => setIsViewModalOpen(false)}
                  variant="outline"
                  className="flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec]"
                >
                  Close
                </Button>
                {(selectedOrder.status?.toLowerCase() === "pending" || selectedOrder.status?.toLowerCase() === "processing") && (
                  <Button 
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleStatusChange(selectedOrder);
                    }}
                    className="flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8f674a] hover:to-[#6a4c34]"
                  >
                    Mark as Packed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {isStatusChangeOpen && orderToUpdate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">Update Order Status</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-[#f8f1ec] border-2 border-[#e5ded7] rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="text-lg font-bold text-[#5c3d28]">{orderToUpdate.id}</p>
                <p className="text-sm text-gray-600 mt-2">Current Status</p>
                <Badge className={`mt-1 ${getStatusColor(orderToUpdate.status)}`}>
                  {orderToUpdate.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#5c3d28]">Change status to:</p>
                <Button
                  onClick={() => updateOrderStatus("packing")}
                  className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8f674a] hover:to-[#6a4c34] justify-start"
                >
                  📦 Packing
                </Button>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#e5ded7]">
                <Button 
                  onClick={() => {
                    setIsStatusChangeOpen(false);
                    setOrderToUpdate(null);
                  }}
                  variant="outline"
                  className="flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InventoryTab = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productName: "",
    productDescription: "",
    productPrice: "",
    productQuantity: "",
    category: "",
    productImage: null,
    productVideo: null,
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching products with cookie-based authentication");

      const response = await api.get("/seller/products");

      console.log("Response status:", response.status);

      if (response.data) {
        const result = response.data;
        console.log("API Response:", result);

        // Check if the response has the expected data structure
        if (result.status === 'success' && Array.isArray(result.data)) {
          setInventory(result.data);
        } else if (Array.isArray(result)) {
          // Fallback in case the API returns the array directly
          setInventory(result);
        } else {
          console.error('Unexpected response format:', result);
          setInventory([]);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(`Failed to fetch products: ${error.message}`);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewProduct({
      productName: "",
      productDescription: "",
      productPrice: "",
      productQuantity: "",
      category: "",
      productImage: null,
      productVideo: null,
    });
  };

  const handleAddProduct = async (formData) => {
    try {
      console.log("Adding new product:", Object.fromEntries(formData));

      const response = await api.post("/products", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Upload response status:", response.status);

      if (response.data) {
        const result = response.data;
        console.log("Product added successfully:", result.message || "Product added successfully");
        alert("Product added successfully!");
        
        setIsAddDialogOpen(false);
        resetForm();
        fetchProducts(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product. Please try again.");
    }
  };

  const handleUpdateProduct = async (formData, productId) => {
    try {
      // Use the productId parameter or fall back to currentProduct
      const idToUse = productId || currentProduct?.product_id || currentProduct?.id;
      
      if (!idToUse) {
        alert("Product ID not found. Please try again.");
        return;
      }

      // Ensure _method is set to PUT for Laravel
      if (!formData.has('_method')) {
        formData.append('_method', 'PUT');
      }

      console.log("Updating product with ID:", idToUse);
      const response = await api.post(`/products/${idToUse}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        const result = response.data;
        console.log("Product updated successfully:", result);
        alert("Product updated successfully!");
        setIsEditDialogOpen(false);
        fetchProducts(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product. Please try again.");
    }
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    
    try {
      const response = await api.delete(`/products/${currentProduct.product_id}`);

      if (response.data) {
        const result = response.data;
        console.log("Product deleted successfully:", result);
        alert("Product deleted successfully!");
        setIsDeleteDialogOpen(false);
        fetchProducts(); // Refresh the product list
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product. Please try again.");
    }
  };

  const handleEditClick = (product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleTogglePublishStatus = async (product) => {
    try {
      console.log("Full product object:", product);
      console.log("Updating product ID:", product.product_id || product.id);
      
      const response = await api.post(`/products/${product.product_id || product.id}/toggle-publish`);

      if (response.data) {
        const result = response.data;
        console.log("Product publish status updated successfully:", result);
        const newStatus = result.publish_status;
        alert(`Product ${newStatus === 'published' ? 'published' : 'saved as draft'} successfully!`);
        fetchProducts(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating publish status:", error);
      alert("Error updating publish status. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`Setting ${field} to:`, value);
    if (isAddDialogOpen) {
      setNewProduct((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else if (isEditDialogOpen) {
      setCurrentProduct((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileChange = (field, file) => {
    if (isAddDialogOpen) {
      setNewProduct((prev) => ({
        ...prev,
        [field]: file,
      }));
    } else if (isEditDialogOpen) {
      setCurrentProduct((prev) => ({
        ...prev,
        [field]: file,
      }));
    }
  };

  const stockStatusOptions = [
    { value: "all", label: "All Products" },
    { value: "in stock", label: "In Stock" },
    { value: "low stock", label: "Low Stock" },
    { value: "out of stock", label: "Out of Stock" }
  ];

  const filteredInventory = inventory.filter((product) => {
    const matchesSearch = product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStock = stockFilter === "all" || product.status?.toLowerCase() === stockFilter.toLowerCase();
    
    return matchesSearch && matchesStock;
  });

  const getStockColor = (status) => {
    switch (status) {
      case "in stock":
        return "bg-green-100 text-green-800";
      case "low stock":
        return "bg-yellow-100 text-yellow-800";
      case "out of stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPublishColor = (publish_status) => {
    switch (publish_status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getApprovalColor = (approval_status) => {
    switch (approval_status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <div className="w-full pt-4">
        <ErrorState message={error} onRetry={fetchProducts} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-[#a4785a]" />
          <Input
            placeholder="Search products by name, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 border-2 border-[#d5bfae] rounded-lg focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {stockFilter !== "all" && (
                <Badge className="ml-2 bg-[#a4785a] text-white">1</Badge>
              )}
            </Button>
            {isFilterOpen && (
              <div className="absolute top-full mt-2 right-0 bg-white border-2 border-[#d5bfae] rounded-lg shadow-xl z-10 min-w-[200px] p-2">
                <div className="text-sm font-semibold text-[#5c3d28] mb-2 px-2">Filter by Stock Status</div>
                {stockStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStockFilter(option.value);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-all ${
                      stockFilter === option.value
                        ? "bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white"
                        : "hover:bg-[#f8f1ec] text-[#5c3d28]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchProducts}
            className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          
          {/* Add Product Button */}
          <Button 
            className="ml-auto bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-md hover:shadow-lg transition-all duration-200"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
          
          {/* Add Product Modal */}
          <AddProductModal 
            isOpen={isAddDialogOpen} 
            onClose={() => setIsAddDialogOpen(false)}
            onSave={handleAddProduct}
          />
        </div>
      </div>
      
      <Card className="border-[#e5ded7] shadow-xl">
        <CardHeader className="pb-4 border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
          <CardTitle className="text-[#5c3d28] text-xl">Product Inventory</CardTitle>
          <CardDescription className="text-[#7b5a3b]">Manage your product inventory and stock levels</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead>Publish Status</TableHead>
                <TableHead>Approved Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <LoadingSpinner message="Loading products..." size="small" />
                  </TableCell>
                </TableRow>
              ) : filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <EmptyState
                      icon="📦"
                      title="No Products Found"
                      description={searchTerm ? "No products match your search criteria" : "You haven't added any products yet"}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((product) => (
                  <TableRow key={product.id || product.product_id || `product-${Math.random().toString(36).substr(2, 9)}`}>
                    <TableCell>
                      {product.productImage ? (
                        <img 
                          src={product.productImage} 
                          alt={product.productName} 
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>₱{product.productPrice}</TableCell>
                    <TableCell>{product.productQuantity}</TableCell>
                    <TableCell>
                      <Badge className={getStockColor(product.status)} variant="outline">
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPublishColor(product.publish_status)} variant="outline">
                        {product.publish_status || 'draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getApprovalColor(product.approval_status)} variant="outline">
                        {product.approval_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleTogglePublishStatus(product)}
                          className="text-xs"
                        >
                          {product.publish_status === 'published' ? 'Save as Draft' : 'Publish'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(product)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Edit Product Modal */}
          <EditProductModal
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            product={currentProduct}
            onSave={handleUpdateProduct}
          />

          {/* Delete Confirmation Dialog */}
          {isDeleteDialogOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{currentProduct?.productName}"? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteProduct}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

const OrderInventoryManager = () => {
  return (
    <div className="space-y-6">
      {/* Header Section with Craft Theme */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center">
          <ShoppingBag className="h-8 w-8 mr-3" />
          Orders & Inventory
        </h1>
        <p className="text-white/90 mt-2 text-lg">
          Manage your orders and product inventory in one place.
        </p>
      </div>

      {/* Tabs with Craft Theme */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2 bg-[#faf9f8] border-2 border-[#e5ded7] p-1 rounded-xl shadow-md">
          <TabsTrigger 
            value="orders" 
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
          >
            Orders
          </TabsTrigger>
          <TabsTrigger 
            value="inventory"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
          >
            Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="inventory" className="mt-6">
          <InventoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderInventoryManager;