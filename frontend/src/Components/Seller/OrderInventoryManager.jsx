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
import { Search, Filter, Plus, Download, RefreshCw, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { AddProductModal } from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import { useOrdersData } from "../../hooks/useOrdersData";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";

const OrdersTab = () => {
  const { ordersData, loading, error, refetch } = useOrdersData();
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter orders based on search term
  const filteredOrders = ordersData ? ordersData.filter(order =>
    order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search orders..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Filter</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button variant="outline" size="sm" onClick={refetch}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Manage your customer orders</CardDescription>
        </CardHeader>
        <CardContent>
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
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const InventoryTab = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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
      const token = localStorage.getItem("auth_token");
      console.log("Fetching products with token:", token ? "Token exists" : "No token");

      const response = await fetch("http://localhost:8000/api/products", {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
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
      
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Please log in to add products");
        return;
      }

      console.log("Token for upload: Token exists");

      const response = await fetch("http://localhost:8000/api/products", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("Upload response status:", response.status);

      if (response.ok) {
        try {
          const text = await response.text();
          const result = text ? JSON.parse(text) : { message: "Product added successfully" };
          console.log("Product added successfully:", result.message);
          alert("Product added successfully!");
        } catch (error) {
          console.log("Product added successfully (no JSON response)");
          alert("Product added successfully!");
        }
        
        setIsAddDialogOpen(false);
        resetForm();
        fetchProducts(); // Refresh the list
      } else {
        try {
          const errorData = await response.json();
          console.error("Failed to add product:", errorData);
          alert(`Failed to add product: ${errorData.message || "Unknown error"}`);
        } catch (error) {
          console.error("Failed to parse error response:", error);
          console.error("Failed to add product (status:", response.status, ")");
          alert(`Failed to add product. Status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product. Please try again.");
    }
  };

  const handleUpdateProduct = async (formData, productId) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Please log in to update products");
        return;
      }

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
      const response = await fetch(`http://localhost:8000/api/products/${idToUse}`, {
        method: "POST", // Using POST with _method=PUT for Laravel
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Product updated successfully:", result);
        alert("Product updated successfully!");
        setIsEditDialogOpen(false);
        fetchProducts(); // Refresh the list
      } else {
        const errorData = await response.json();
        console.error("Failed to update product:", errorData);
        alert(`Failed to update product: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product. Please try again.");
    }
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Please log in to delete products");
        return;
      }

      const response = await fetch(`http://localhost:8000/api/products/${currentProduct.product_id}`, {
        method: "DELETE",
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Product deleted successfully:", result);
        alert("Product deleted successfully!");
        setIsDeleteDialogOpen(false);
        fetchProducts(); // Refresh the product list
      } else {
        const errorData = await response.json();
        console.error("Failed to delete product:", errorData);
        alert(`Failed to delete product: ${errorData.message || 'Unknown error'}`);
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
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Please log in to update product status");
        return;
      }

      console.log("Full product object:", product);
      console.log("Updating product ID:", product.product_id || product.id);
      
      const response = await fetch(`http://localhost:8000/api/products/${product.product_id || product.id}/toggle-publish`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Product publish status updated successfully:", result);
        const newStatus = result.publish_status;
        alert(`Product ${newStatus === 'published' ? 'published' : 'saved as draft'} successfully!`);
        fetchProducts(); // Refresh the list
      } else {
        console.error("Response status:", response.status);
        console.error("Response URL:", response.url);
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error("Failed to update publish status:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Could not parse error response as JSON");
        }
        alert(`Failed to update publish status: ${errorMessage}`);
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

  const filteredInventory = inventory.filter(
    (product) =>
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={fetchProducts}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          
          {/* Add Product Button */}
          <Button 
            className="ml-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
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
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Inventory</CardTitle>
          <CardDescription>Manage your product inventory</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <TableCell>${product.productPrice}</TableCell>
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
    <div className="space-y-6 bg-white p-6 rounded-lg">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders & Inventory</h1>
        <p className="text-muted-foreground">
          Manage your orders and product inventory in one place.
        </p>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
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