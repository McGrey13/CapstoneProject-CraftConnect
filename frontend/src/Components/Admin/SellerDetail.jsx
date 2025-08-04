import React from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const SellerDetail = ({ id = "SEL-1001", onBack = () => {} }) => {
  // Mock seller data
  const seller = {
    id: "SEL-1001",
    name: "Sarah Johnson",
    businessName: "Sarah's Pottery",
    email: "sarah@sarahspottery.com",
    phone: "+63 912 345 6789",
    location: "123 Artisan St., Calamba, Laguna",
    category: "Ceramics",
    joinDate: "2023-01-15",
    status: "active",
    bio: "Creating handcrafted pottery inspired by nature and traditional Filipino designs. Each piece is carefully made with locally sourced clay and glazes.",
    revenue: {
      total: 12450.75,
      thisMonth: 1850.25,
      lastMonth: 1650.5,
    },
    productsCount: 24,
    ordersCount: {
      total: 87,
      pending: 3,
      completed: 84,
    },
    rating: 4.8,
    reviewsCount: 65,
    bankDetails: {
      accountName: "Sarah Johnson",
      accountNumber: "****6789",
      bankName: "BPI",
    },
    verificationStatus: {
      email: true,
      phone: true,
      identity: true,
      business: true,
    },
  };

  // Mock recent orders
  const recentOrders = [
    {
      id: "ORD-7652",
      date: "2023-06-15",
      customer: "Maria Rodriguez",
      amount: 129.99,
      status: "Completed",
    },
    {
      id: "ORD-7651",
      date: "2023-06-14",
      customer: "John Smith",
      amount: 85.5,
      status: "Processing",
    },
    {
      id: "ORD-7650",
      date: "2023-06-14",
      customer: "Emily Johnson",
      amount: 210.75,
      status: "Shipped",
    },
    {
      id: "ORD-7649",
      date: "2023-06-13",
      customer: "Michael Brown",
      amount: 45.0,
      status: "Completed",
    },
    {
      id: "ORD-7648",
      date: "2023-06-12",
      customer: "Sarah Wilson",
      amount: 178.25,
      status: "Completed",
    },
  ];

  // Mock top products
  const topProducts = [
    { id: "PRD-1234", name: "Handcrafted Ceramic Mug", price: 24.99, sales: 78 },
    { id: "PRD-2345", name: "Decorative Vase", price: 49.99, sales: 65 },
    { id: "PRD-3456", name: "Ceramic Plate Set", price: 89.99, sales: 42 },
    { id: "PRD-4567", name: "Small Planter", price: 18.99, sales: 36 },
    { id: "PRD-5678", name: "Decorative Bowl", price: 32.5, sales: 28 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Seller Details</h1>
      </div>

      {/* Seller Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Seller Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-gray-600">{seller.name.charAt(0)}</span>
              </div>
              <h2 className="text-xl font-semibold">{seller.name}</h2>
              <p className="text-gray-500">{seller.businessName}</p>
              <div className="mt-2">
                {seller.status === "active" && <Badge className="bg-green-500">Active</Badge>}
                {seller.status === "pending" && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Pending
                  </Badge>
                )}
                {seller.status === "suspended" && <Badge variant="destructive">Suspended</Badge>}
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{seller.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p>{seller.phone}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p>{seller.location}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p>{new Date(seller.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">About</h3>
              <p className="text-gray-600 text-sm">{seller.bio}</p>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Verification Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email</span>
                  {seller.verificationStatus.email ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Phone</span>
                  {seller.verificationStatus.phone ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Identity</span>
                  {seller.verificationStatus.identity ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Business</span>
                  {seller.verificationStatus.business ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Payment Information</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm">
                  <span className="text-gray-500">Bank:</span> {seller.bankDetails.bankName}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Account:</span> {seller.bankDetails.accountName}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Account Number:</span> {seller.bankDetails.accountNumber}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right side: Stats, Tabs and Admin Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold">${seller.revenue.total.toFixed(2)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-green-600">
                  +
                  {(
                    ((seller.revenue.thisMonth - seller.revenue.lastMonth) / seller.revenue.lastMonth) *
                    100
                  ).toFixed(1)}
                  % from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Products</p>
                    <p className="text-2xl font-bold">{seller.productsCount}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">Active listings in store</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Orders</p>
                    <p className="text-2xl font-bold">{seller.ordersCount.total}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {seller.ordersCount.pending} pending, {seller.ordersCount.completed} completed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="text-2xl font-bold">{seller.rating.toFixed(1)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-yellow-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">From {seller.reviewsCount} reviews</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Orders and Products */}
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Recent Orders</TabsTrigger>
              <TabsTrigger value="products">Top Products</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>${order.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            order.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "Processing"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
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
                    <TableHead>Price</TableHead>
                    <TableHead>Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.sales} units</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
                {seller.status === "pending" && (
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" /> Approve Seller
                  </Button>
                )}
                {seller.status === "active" && (
                  <Button
                    variant="outline"
                    className="text-amber-600 border-amber-600 hover:bg-amber-50"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" /> Suspend Account
                  </Button>
                )}
                {seller.status === "suspended" && (
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" /> Reactivate Account
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SellerDetail;
