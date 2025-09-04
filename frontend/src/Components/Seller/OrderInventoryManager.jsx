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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

const OrdersTab = () => {
  const orders = [
    { id: "ORD-1234", customer: "Jane Smith", date: "2023-06-15", total: "$78.50", status: "Processing", items: 3 },
    { id: "ORD-1235", customer: "John Doe", date: "2023-06-14", total: "$125.00", status: "Shipped", items: 2 },
    { id: "ORD-1236", customer: "Alice Johnson", date: "2023-06-13", total: "$45.75", status: "Delivered", items: 1 },
    { id: "ORD-1237", customer: "Robert Brown", date: "2023-06-12", total: "$210.25", status: "Processing", items: 4 },
    { id: "ORD-1238", customer: "Emily Davis", date: "2023-06-11", total: "$95.00", status: "Shipped", items: 2 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Processing": return "bg-yellow-100 text-yellow-800";
      case "Shipped": return "bg-blue-100 text-blue-800";
      case "Delivered": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-8" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Filter</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button variant="outline" size="sm"><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
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
              {orders.map((order) => (
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
                  <TableCell>
                    <Badge className={getStatusColor(order.approval_status)} variant="outline">
                      {order.approval_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
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
      const token = localStorage.getItem("token");
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
      // Set empty array to prevent undefined errors
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
      
      const token = localStorage.getItem("token");
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

  const handleUpdateProduct = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to update products");
        return;
      }

      // Ensure _method is set to PUT for Laravel
      if (!formData.has('_method')) {
        formData.append('_method', 'PUT');
      }

      const response = await fetch(`http://localhost:8000/api/products/${currentProduct.product_id}`, {
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
      const token = localStorage.getItem("token");
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
                <TableHead>Status</TableHead>
                <TableHead>Approved Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No products found
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
                      <Badge className={getApprovalColor(product.approval_status)} variant="outline">
                        {product.approval_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
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