// SellerDashboard.jsx
import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  ShoppingBag,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

// Reusable stat card component
const StatCard = ({ title, value, description, icon, trend, trendValue }) => (
  <Card className="w-full">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="mt-2 flex items-center text-xs">
        {trend === "up" && (
          <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
        )}
        {trend === "down" && (
          <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
        )}
        <span
          className={
            trend === "up"
              ? "text-green-500"
              : trend === "down"
              ? "text-red-500"
              : ""
          }
        >
          {trendValue}
        </span>
      </div>
    </CardContent>
  </Card>
);

// Status color helper
const getStatusStyle = (status) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Processing":
      return "bg-blue-100 text-blue-800";
    case "Shipped":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const SellerDashboard = () => {
  const now = new Date();

  return (
    <div className="w-full pt-4"> {/* Top spacing handled here */}
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, Seller User! Here's what's happening today.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {now.toLocaleDateString()} {now.toLocaleTimeString()}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <StatCard
          title="Total Revenue"
          value="₱24,780"
          description="Total revenue this month"
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          trend="up"
          trendValue="12% from last month"
        />
        <StatCard
          title="Customer Satisfaction"
          value="4.8 / 5"
          description="Average rating from customers"
          icon={<Star className="h-4 w-4 text-primary" />}
          trend="up"
          trendValue="0.3 from last month"
        />
        <StatCard
          title="Active Artisans"
          value="56"
          description="Artisans with active listings"
          icon={<Users className="h-4 w-4 text-primary" />}
          trend="up"
          trendValue="3% from last month"
        />
        <StatCard
          title="Products Sold"
          value="1,234"
          description="Products sold this month"
          icon={<ShoppingBag className="h-4 w-4 text-primary" />}
          trend="down"
          trendValue="2% from last month"
        />
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest 5 orders placed on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "ORD-7652",
                  customer: "Maria Rodriguez",
                  date: "2023-06-15",
                  amount: "₱129.99",
                  status: "Completed",
                },
                {
                  id: "ORD-7651",
                  customer: "John Smith",
                  date: "2023-06-14",
                  amount: "₱85.50",
                  status: "Processing",
                },
                {
                  id: "ORD-7650",
                  customer: "Emily Johnson",
                  date: "2023-06-14",
                  amount: "₱210.75",
                  status: "Shipped",
                },
                {
                  id: "ORD-7649",
                  customer: "Michael Brown",
                  date: "2023-06-13",
                  amount: "₱45.00",
                  status: "Completed",
                },
                {
                  id: "ORD-7648",
                  customer: "Sarah Wilson",
                  date: "2023-06-12",
                  amount: "₱178.25",
                  status: "Completed",
                },
              ].map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-2 pt-2"
                >
                  <div>
                    <div className="font-medium">{order.id}</div>
                    <div className="text-sm text-gray-500">
                      {order.customer}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{order.amount}</div>
                    <div className="text-sm text-gray-500">{order.date}</div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Rated Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Rated Products</CardTitle>
            <CardDescription>
              Products with highest customer ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "Handcrafted Wooden Bowl",
                  rating: "4.9",
                  reviews: 120,
                },
                { name: "Ceramic Vase", rating: "4.8", reviews: 85 },
                { name: "Macrame Wall Hanging", rating: "4.8", reviews: 78 },
              ].map((product, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b pb-2 pt-2"
                >
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.reviews} reviews
                    </div>
                  </div>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    {product.rating}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerDashboard;
