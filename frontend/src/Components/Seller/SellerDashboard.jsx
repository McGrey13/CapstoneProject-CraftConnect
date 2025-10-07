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
  DollarSign,
  CreditCard,
  Clock,
  TrendingUp,
  Percent,
  Key,
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
import { Button } from "../ui/button";
import { setupTestSellerAuth } from "../../utils/sellerAuthHelper";

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

  const handleSetupAuth = () => {
    setupTestSellerAuth();
    setTimeout(() => {
      refetch();
    }, 1000);
  };

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
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be authenticated to view the seller dashboard.
          </p>
          <div className="space-y-4">
            <Button 
              onClick={handleSetupAuth}
              className="bg-[#a4785a] hover:bg-[#8a6a5a] text-white px-6 py-3"
            >
              <Key className="h-5 w-5 mr-2" />
              Setup Test Authentication
            </Button>
            <p className="text-sm text-gray-500">
              This will set up a test authentication token for development purposes.
            </p>
          </div>
        </div>
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
          title="Commission Rate"
          value={dashboardData?.transaction_summary?.commission_rate || "2%"}
          description="Platform commission rate"
          icon={<Percent className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Online Payments"
          value={dashboardData?.transaction_summary?.online_payment_count || "0"}
          description="Online payment transactions"
          icon={<CreditCard className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Pending Payments"
          value={dashboardData?.transaction_summary?.pending_payments?.count || "0"}
          description={`₱${dashboardData?.transaction_summary?.pending_payments?.total_amount || "0.00"} pending`}
          icon={<Clock className="h-4 w-4 text-primary" />}
        />
      </div>

      {/* Payment Method Breakdown */}
      {dashboardData?.transaction_summary?.payment_methods && dashboardData.transaction_summary.payment_methods.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Method Breakdown</CardTitle>
            <CardDescription>
              Revenue breakdown by payment method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.transaction_summary.payment_methods.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {method.method === 'gcash' && <CreditCard className="h-5 w-5 text-green-600" />}
                      {method.method === 'paymaya' && <CreditCard className="h-5 w-5 text-blue-600" />}
                      {method.method === 'cod' && <DollarSign className="h-5 w-5 text-orange-600" />}
                    </div>
                    <div>
                      <div className="font-medium">{method.display_name}</div>
                      <div className="text-sm text-gray-500">
                        {method.transaction_count} transactions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₱{method.total_amount.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">
                      {method.percentage}% of total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commission Details */}
      {dashboardData?.transaction_summary && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Commission & Revenue Details</CardTitle>
            <CardDescription>
              Detailed breakdown of your earnings and platform fees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Total Revenue</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ₱{dashboardData.transaction_summary.total_gross_amount?.toLocaleString() || "0.00"}
                </div>
                <div className="text-sm text-gray-500">
                  {dashboardData.transaction_summary.total_transactions || 0} transactions
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Percent className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Platform Commission</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  ₱{dashboardData.transaction_summary.total_admin_fee?.toLocaleString() || "0.00"}
                </div>
                <div className="text-sm text-gray-500">
                  {dashboardData.transaction_summary.commission_rate} rate
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Your Earnings</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  ₱{dashboardData.transaction_summary.total_seller_amount?.toLocaleString() || "0.00"}
                </div>
                <div className="text-sm text-gray-500">
                  After commission deduction
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
