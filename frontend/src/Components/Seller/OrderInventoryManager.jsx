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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Search,
  Filter,
  Plus,
  Download,
  RefreshCw,
  Edit,
  Trash2,
} from "lucide-react";
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productName: "",
    productDescription: "",
    productPrice: "",
    productQuantity: "",
    category: "",
    productImage: null,
    productVideo: null,
  });
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
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Products fetched:", data);
        setInventory(data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch products:", errorData);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    try {
      console.log("Current newProduct state:", newProduct);

      // Validate required fields
      if (!newProduct.productName || !newProduct.productPrice || !newProduct.productQuantity || !newProduct.category) {
        alert("Please fill in all required fields");
        return;
      }

      const formData = new FormData();
      formData.append("productName", newProduct.productName);
      formData.append("productDescription", newProduct.productDescription || "");
      formData.append("productPrice", newProduct.productPrice);
      formData.append("productQuantity", newProduct.productQuantity);
      formData.append("category", newProduct.category);

      if (newProduct.productImage) {
        formData.append("productImage", newProduct.productImage);
      }
      if (newProduct.productVideo) {
        formData.append("productVideo", newProduct.productVideo);
      }

      console.log("Sending product data:", Object.fromEntries(formData));

      const token = localStorage.getItem("token");
      console.log("Token for upload:", token ? "Token exists" : "No token");

      const response = await fetch("http://localhost:8000/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
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
          setIsAddDialogOpen(false);
          setNewProduct({
            productName: "",
            productDescription: "",
            productPrice: "",
            productQuantity: "",
            category: "",
            productImage: null,
            productVideo: null,
          });
          fetchProducts(); // Refresh the list
        } catch {
          console.log("Product added successfully (no JSON response)");
          alert("Product added successfully!");
          setIsAddDialogOpen(false);
          setNewProduct({
            productName: "",
            productDescription: "",
            productPrice: "",
            productQuantity: "",
            category: "",
            productImage: null,
            productVideo: null,
          });
          fetchProducts(); // Refresh the list
        }
      } else {
        try {
          const errorData = await response.json();
          console.error("Failed to add product:", errorData);
          alert(`Failed to add product: ${errorData.message || "Unknown error"}`);
        } catch{
          console.error("Failed to add product (status:", response.status, ")");
          alert(`Failed to add product. Status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product. Please try again.");
    }
  };

  const handleUpdateProduct = async () => {
    try {
      const formData = new FormData();
      formData.append("productName", currentProduct.productName);
      formData.append("productDescription", currentProduct.productDescription || "");
      formData.append("productPrice", currentProduct.productPrice);
      formData.append("productQuantity", currentProduct.productQuantity);
      formData.append("category", currentProduct.category);
      formData.append("status", currentProduct.status);
      formData.append("_method", "PUT"); // Laravel needs this for PUT/PATCH requests with FormData

      if (currentProduct.productImage && currentProduct.productImage instanceof File) {
        formData.append("productImage", currentProduct.productImage);
      }
      if (currentProduct.productVideo && currentProduct.productVideo instanceof File) {
        formData.append("productVideo", currentProduct.productVideo);
      }

      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:8000/api/products/${currentProduct.product_id}`, {
        method: "POST", // Use POST with _method=PUT
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Product updated successfully!");
        setIsEditDialogOpen(false);
        fetchProducts();
      } else {
        const errorData = await response.json();
        alert(`Failed to update product: ${errorData.message}`);
        console.error("Failed to update product:", errorData);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product. Please try again.");
    }
  };

  const handleDeleteProduct = async (product_id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:8000/api/products/${product_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Product deleted successfully!");
        setIsDeleteDialogOpen(false);
        fetchProducts(); // Refresh the product list
      } else {
        const errorData = await response.json();
        alert(`Failed to delete product: ${errorData.message}`);
        console.error("Failed to delete product:", errorData);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          {/* Add Product Modal Trigger */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="primary" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Product Name</Label>
                  <Input
                    placeholder="Product Name"
                    value={newProduct.productName}
                    onChange={(e) => handleInputChange("productName", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Product Description</Label>
                  <Textarea
                    placeholder="Description"
                    value={newProduct.productDescription}
                    onChange={(e) => handleInputChange("productDescription", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Product Price</Label>
                  <Input
                    placeholder="Price"
                    type="number"
                    step="0.01"
                    value={newProduct.productPrice}
                    onChange={(e) => handleInputChange("productPrice", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Product Quantity</Label>
                  <Input
                    placeholder="Quantity"
                    type="number"
                    value={newProduct.productQuantity}
                    onChange={(e) => handleInputChange("productQuantity", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Product Category</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pottery">Pottery</SelectItem>
                      <SelectItem value="Textiles">Textiles</SelectItem>
                      <SelectItem value="Woodwork">Woodwork</SelectItem>
                      <SelectItem value="Home Goods">Home Goods</SelectItem>
                      <SelectItem value="Jewelry">Jewelry</SelectItem>
                      <SelectItem value="Art">Art</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Product Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("productImage", e.target.files[0])}
                  />
                </div>
                <div>
                  <Label>Product Video</Label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange("productVideo", e.target.files[0])}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddProduct}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                <TableHead>Product ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableRow key={product.product_id}>
                    <TableCell className="font-medium">{product.product_id}</TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.productPrice}</TableCell>
                    <TableCell>{product.productQuantity}</TableCell>
                    <TableCell>
                      <Badge className={getStockColor(product.status)} variant="outline">
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(product)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Product Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <div className="grid gap-4 py-4">
              <div>
                <Label>Product Name</Label>
                <Input
                  value={currentProduct.productName}
                  onChange={(e) => handleInputChange("productName", e.target.value)}
                />
              </div>
              <div>
                <Label>Product Description</Label>
                <Textarea
                  value={currentProduct.productDescription || ""}
                  onChange={(e) => handleInputChange("productDescription", e.target.value)}
                />
              </div>
              <div>
                <Label>Product Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={currentProduct.productPrice}
                  onChange={(e) => handleInputChange("productPrice", e.target.value)}
                />
              </div>
              <div>
                <Label>Product Quantity</Label>
                <Input
                  type="number"
                  value={currentProduct.productQuantity}
                  onChange={(e) => handleInputChange("productQuantity", e.target.value)}
                />
              </div>
              <div>
                <Label>Product Category</Label>
                <Select
                  value={currentProduct.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pottery">Pottery</SelectItem>
                    <SelectItem value="Textiles">Textiles</SelectItem>
                    <SelectItem value="Woodwork">Woodwork</SelectItem>
                    <SelectItem value="Home Goods">Home Goods</SelectItem>
                    <SelectItem value="Jewelry">Jewelry</SelectItem>
                    <SelectItem value="Art">Art</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Product Status</Label>
                <Select
                  value={currentProduct.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in stock">In Stock</SelectItem>
                    <SelectItem value="low stock">Low Stock</SelectItem>
                    <SelectItem value="out of stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Product Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("productImage", e.target.files[0])}
                />
              </div>
              <div>
                <Label>Product Video</Label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange("productVideo", e.target.files[0])}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateProduct}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              **{currentProduct?.productName}** from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteProduct(currentProduct?.product_id)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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