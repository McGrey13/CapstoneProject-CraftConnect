// SellerDashboard.jsx
import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  ShoppingBag,
  Star,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useDashboardData } from "../../hooks/useDashboardData";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";

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
  const { dashboardData, loading, error, refetch } = useDashboardData();
  const now = new Date();

  if (loading) {
    return (
      <div className="w-full pt-4">
        <LoadingSpinner message="Loading dashboard data..." />
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
    <div className="w-full pt-4"> {/* Top spacing handled here */}
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <div className="text-sm text-gray-500">
            Last updated: {now.toLocaleDateString()} {now.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <StatCard
          title="Total Revenue"
          value={dashboardData?.stats?.totalRevenue?.value || "₱0.00"}
          description={dashboardData?.stats?.totalRevenue?.description || "Total revenue this month"}
          icon={  
            <span className="h-8 w-8 text-2xl">₱</span>
          }
          trend={dashboardData?.stats?.totalRevenue?.trend || "neutral"}
          trendValue={dashboardData?.stats?.totalRevenue?.trendValue || "No data available"}
        />
        <StatCard
          title="Customer Satisfaction"
          value={dashboardData?.stats?.customerSatisfaction?.value || "0.0 / 5"}
          description={dashboardData?.stats?.customerSatisfaction?.description || "Average rating from customers"}
          icon={<Star className="h-4 w-4 text-primary" />}
          trend={dashboardData?.stats?.customerSatisfaction?.trend || "neutral"}
          trendValue={dashboardData?.stats?.customerSatisfaction?.trendValue || "No data available"}
        />
        <StatCard
          title="Active Artisans"
          value={dashboardData?.stats?.activeArtisans?.value || "0"}
          description={dashboardData?.stats?.activeArtisans?.description || "Artisans with active listings"}
          icon={<Users className="h-4 w-4 text-primary" />}
          trend={dashboardData?.stats?.activeArtisans?.trend || "neutral"}
          trendValue={dashboardData?.stats?.activeArtisans?.trendValue || "No data available"}
        />
        <StatCard
          title="Products Sold"
          value={dashboardData?.stats?.productsSold?.value || "0"}
          description={dashboardData?.stats?.productsSold?.description || "Products sold this month"}
          icon={<ShoppingBag className="h-4 w-4 text-primary" />}
          trend={dashboardData?.stats?.productsSold?.trend || "neutral"}
          trendValue={dashboardData?.stats?.productsSold?.trendValue || "No data available"}
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
              {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order) => (
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
                ))
              ) : (
                <EmptyState
                  icon="🛍️"
                  title="No Recent Orders"
                  description="Orders will appear here once customers start purchasing your products"
                />
              )}
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
              {dashboardData?.topRatedProducts && dashboardData.topRatedProducts.length > 0 ? (
                dashboardData.topRatedProducts.map((product, i) => (
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
                ))
              ) : (
                <EmptyState
                  icon="⭐"
                  title="No Rated Products"
                  description="Product ratings will appear here once customers start reviewing your products"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerDashboard;
