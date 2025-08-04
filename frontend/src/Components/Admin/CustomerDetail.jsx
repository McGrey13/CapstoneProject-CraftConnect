import React, { useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  DollarSign,
  Edit,
  Trash2,
  Save,
  Package,
  Clock,
  User,
  Eye,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

const CustomerDetail = ({ id = "CUST-1001", onBack = () => {} }) => {
  const [customer, setCustomer] = useState({
    id: "CUST-1001",
    firstName: "Maria",
    lastName: "Rodriguez",
    email: "maria.rodriguez@example.com",
    phone: "+63 912 345 6789",
    address: "123 Main St",
    city: "Calamba",
    province: "Laguna",
    postalCode: "4027",
    country: "Philippines",
    joinDate: "2023-01-15",
    totalOrders: 12,
    totalSpent: 1250.75,
    status: "active",
    lastPurchase: "2023-06-15",
    birthDate: "1990-05-12",
    gender: "female",
    notes: "Prefers eco-friendly packaging. Interested in ceramic products.",
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ ...customer });

  const recentOrders = [
    { id: "ORD-7652", date: "2023-06-15", items: 3, amount: 129.99, status: "Completed" },
    { id: "ORD-7543", date: "2023-05-22", items: 2, amount: 85.5, status: "Completed" },
    { id: "ORD-7421", date: "2023-04-18", items: 4, amount: 210.75, status: "Completed" },
    { id: "ORD-7312", date: "2023-03-05", items: 1, amount: 45.0, status: "Completed" },
    { id: "ORD-7201", date: "2023-02-14", items: 2, amount: 78.25, status: "Completed" },
  ];

  const favoriteProducts = [
    { id: "PRD-1234", name: "Handcrafted Ceramic Mug", category: "Ceramics", price: 24.99, purchaseCount: 3 },
    { id: "PRD-2345", name: "Woven Basket Set", category: "Home", price: 49.99, purchaseCount: 2 },
    { id: "PRD-3456", name: "Hand-Poured Soy Candle", category: "Home", price: 18.99, purchaseCount: 4 },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    setCustomer((prev) => ({ ...prev, ...editFormData }));
    setIsEditDialogOpen(false);
  };

  const handleDeleteCustomer = () => {
    console.log(`Deleting customer ${customer.id}`);
    onBack();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Customer Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Customer Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-gray-600">
                  {customer.firstName.charAt(0)}
                  {customer.lastName.charAt(0)}
                </span>
              </div>
              <h2 className="text-xl font-semibold">{customer.firstName} {customer.lastName}</h2>
              <p className="text-gray-500">{customer.id}</p>
              <div className="mt-2">
                {customer.status === "active" ? (
                  <Badge className="bg-green-500">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                )}
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {[{
                icon: Mail,
                label: "Email",
                value: customer.email,
              }, {
                icon: Phone,
                label: "Phone",
                value: customer.phone,
              }, {
                icon: MapPin,
                label: "Address",
                value: `${customer.address}, ${customer.city}, ${customer.province} ${customer.postalCode}, ${customer.country}`,
              }, {
                icon: User,
                label: "Gender",
                value: customer.gender,
              }, {
                icon: Calendar,
                label: "Birth Date",
                value: new Date(customer.birthDate).toLocaleDateString(),
              }, {
                icon: Clock,
                label: "Joined",
                value: new Date(customer.joinDate).toLocaleDateString(),
              }].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start">
                  <Icon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Notes</h3>
              <p className="text-gray-600 text-sm">{customer.notes}</p>
            </div>

            <div className="mt-6 space-y-3">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Edit className="h-4 w-4 mr-2" /> Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit Customer Profile</DialogTitle>
                    <DialogDescription>
                      Make changes to the customer profile here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {[
                      ["firstName", "First Name"],
                      ["lastName", "Last Name"],
                      ["email", "Email", "email"],
                      ["phone", "Phone"],
                      ["address", "Address"],
                      ["city", "City"],
                      ["province", "Province"],
                      ["postalCode", "Postal Code"],
                      ["country", "Country"],
                      ["birthDate", "Birth Date", "date"],
                      ["gender", "Gender"],
                      ["notes", "Notes"]
                    ].map(([key, label, type = "text"]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{label}</Label>
                        <Input
                          id={key}
                          name={key}
                          type={type}
                          value={editFormData[key]}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button type="button" onClick={handleSaveChanges}>
                      <Save className="h-4 w-4 mr-2" /> Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full text-red-600 border-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Customer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the customer account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCustomer} className="bg-red-600 hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{
              label: "Total Spent",
              value: `$${customer.totalSpent.toFixed(2)}`,
              icon: DollarSign,
              bg: "bg-green-100",
              iconColor: "text-green-600",
              subtitle: "Lifetime value",
            }, {
              label: "Orders",
              value: customer.totalOrders,
              icon: ShoppingCart,
              bg: "bg-blue-100",
              iconColor: "text-blue-600",
              subtitle: "Total orders placed",
            }, {
              label: "Last Purchase",
              value: new Date(customer.lastPurchase).toLocaleDateString(),
              icon: Calendar,
              bg: "bg-purple-100",
              iconColor: "text-purple-600",
              subtitle: `${Math.floor((new Date() - new Date(customer.lastPurchase)) / (1000 * 60 * 60 * 24))} days ago`,
            }].map((stat, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`h-10 w-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">{stat.subtitle}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="products">Favorite Products</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell>${order.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="products" className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Purchased</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {favoriteProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.purchaseCount} times</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Package className="h-4 w-4 mr-2" /> View Product
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: "Placed order",
                    timestamp: "2023-06-15T10:30:00",
                    details: "Order #ORD-7652 for $129.99",
                  },
                  {
                    action: "Updated shipping address",
                    timestamp: "2023-06-10T15:45:00",
                    details: "Changed shipping address",
                  },
                  {
                    action: "Added product to cart",
                    timestamp: "2023-06-10T15:40:00",
                    details: "Added Handcrafted Ceramic Mug to cart",
                  },
                  {
                    action: "Viewed product",
                    timestamp: "2023-06-10T15:35:00",
                    details: "Viewed Handcrafted Ceramic Mug",
                  },
                  {
                    action: "Logged in",
                    timestamp: "2023-06-10T15:30:00",
                    details: "Successful login from 192.168.1.1",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start border-b pb-3 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
