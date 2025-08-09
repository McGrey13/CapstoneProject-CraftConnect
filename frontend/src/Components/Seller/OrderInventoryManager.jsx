import React from "react";
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
} from "lucide-react";

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
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
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
  const inventory = [
    { id: "PRD-001", name: "Handcrafted Ceramic Mug", category: "Pottery", price: "$24.99", stock: 15, status: "In Stock" },
    { id: "PRD-002", name: "Woven Wall Hanging", category: "Textiles", price: "$89.50", stock: 8, status: "In Stock" },
    { id: "PRD-003", name: "Wooden Cutting Board", category: "Woodwork", price: "$45.00", stock: 3, status: "Low Stock" },
    { id: "PRD-004", name: "Hand-poured Soy Candle", category: "Home Goods", price: "$18.75", stock: 0, status: "Out of Stock" },
    { id: "PRD-005", name: "Macramé Plant Hanger", category: "Textiles", price: "$32.50", stock: 12, status: "In Stock" },
  ];

  const getStockColor = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "Out of Stock":
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
          <Input placeholder="Search products..." className="pl-8" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Filter</Button>
          <Button variant="primary" size="sm"><Plus className="mr-2 h-4 w-4" />Add Product</Button>
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
              {inventory.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge className={getStockColor(product.status)} variant="outline">
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
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
