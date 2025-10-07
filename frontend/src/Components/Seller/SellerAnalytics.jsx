import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RefreshCw, TrendingUp, Package, AlertTriangle, Tag } from "lucide-react";
import { Button } from "../ui/button";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorState from "../ui/ErrorState";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import api from "../../api";

const SellerAnalytics = ({ sellerId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    if (!sellerId) {
      setError('Please wait while loading seller information...');
      setLoading(true);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/analytics/seller/${sellerId}`);
      
      if (response.data) {
        setAnalytics(response.data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    if (sellerId) {
      fetchAnalytics();
    }
  }, [sellerId]);

  if (loading) {
    return (
      <div className="w-full pt-4">
        <LoadingSpinner message="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full pt-4">
        <ErrorState message={`Error loading analytics: ${error}`} onRetry={fetchAnalytics} />
      </div>
    );
  }

  if (!analytics) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Analytics</h1>
          <p className="text-gray-500">Track your store's performance and sales metrics</p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.total_revenue)}</div>
            <p className="text-xs text-gray-500">
              {analytics.order_metrics.total_orders} total orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Selling Product</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.best_sellers[0]?.units_sold || 0} units
            </div>
            <p className="text-xs text-gray-500 truncate">
              {analytics.best_sellers[0]?.name || 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Completion</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.order_metrics.completion_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">
              {analytics.order_metrics.completed} completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Discounts</CardTitle>
            <Tag className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.discount_stats.active_codes}
            </div>
            <p className="text-xs text-gray-500">
              Used {analytics.discount_stats.codes_used} times
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Overview</CardTitle>
          <CardDescription>Current status of all orders and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Status Cards with Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-600">Pending</p>
                  <span className="text-xs text-gray-500">
                    {analytics.order_metrics.total_orders > 0 
                      ? Math.round((analytics.order_metrics.pending / analytics.order_metrics.total_orders) * 100)
                      : 0}%
                  </span>
                </div>
                <p className="text-2xl font-bold">{analytics.order_metrics.pending}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${analytics.order_metrics.total_orders > 0 
                        ? (analytics.order_metrics.pending / analytics.order_metrics.total_orders) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-yellow-600">Packing</p>
                  <span className="text-xs text-gray-500">
                    {analytics.order_metrics.total_orders > 0 
                      ? Math.round((analytics.order_metrics.packing / analytics.order_metrics.total_orders) * 100)
                      : 0}%
                  </span>
                </div>
                <p className="text-2xl font-bold">{analytics.order_metrics.packing}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${analytics.order_metrics.total_orders > 0 
                        ? (analytics.order_metrics.packing / analytics.order_metrics.total_orders) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-600">Shipped</p>
                  <span className="text-xs text-gray-500">
                    {analytics.order_metrics.total_orders > 0 
                      ? Math.round((analytics.order_metrics.shipped / analytics.order_metrics.total_orders) * 100)
                      : 0}%
                  </span>
                </div>
                <p className="text-2xl font-bold">{analytics.order_metrics.shipped}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${analytics.order_metrics.total_orders > 0 
                        ? (analytics.order_metrics.shipped / analytics.order_metrics.total_orders) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-green-600">Completed</p>
                  <span className="text-xs text-gray-500">
                    {analytics.order_metrics.total_orders > 0 
                      ? Math.round((analytics.order_metrics.completed / analytics.order_metrics.total_orders) * 100)
                      : 0}%
                  </span>
                </div>
                <p className="text-2xl font-bold">{analytics.order_metrics.completed}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${analytics.order_metrics.total_orders > 0 
                        ? (analytics.order_metrics.completed / analytics.order_metrics.total_orders) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.order_metrics.total_orders}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-700">
                    {Math.round(analytics.order_metrics.completion_rate)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Processing Orders</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {analytics.order_metrics.pending + analytics.order_metrics.packing + analytics.order_metrics.shipped}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Flow Visualization */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Order Flow</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-xs text-gray-600">Pending</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-yellow-600"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                  <span className="text-xs text-gray-600">Packing</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                  <div className="h-full bg-gradient-to-r from-yellow-600 to-purple-600"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <span className="text-xs text-gray-600">Shipped</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-green-600"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-xs text-gray-600">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peak Selling Periods */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Selling Periods</CardTitle>
          <CardDescription>Top performing months with detailed insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.peak_periods.map((period, index) => {
              // Get top products for this period (simulate based on best_sellers)
              const topProducts = analytics.best_sellers.slice(0, 3);
              const topCategories = Object.entries(analytics.revenue_by_category)
                .sort(([,a], [,b]) => (b.revenue || 0) - (a.revenue || 0))
                .slice(0, 3);

              return (
                <TooltipProvider key={period.month}>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors">
                        <div>
                          <p className="font-medium">#{index + 1} - {period.month}</p>
                          <p className="text-sm text-gray-500">{period.orders} orders</p>
                        </div>
                        <p className="font-bold">{formatCurrency(period.revenue)}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-md">
                      <div className="p-4">
                        <h4 className="font-semibold text-lg mb-3">{period.month} Performance Details</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-blue-600 mb-2">📊 Key Metrics</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Revenue: <span className="font-semibold">{formatCurrency(period.revenue)}</span></div>
                              <div>Orders: <span className="font-semibold">{period.orders}</span></div>
                              <div>Avg Order: <span className="font-semibold">{formatCurrency(period.revenue / period.orders || 0)}</span></div>
                              <div>Rank: <span className="font-semibold">#{index + 1}</span></div>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium text-green-600 mb-2">🏆 Top Products</h5>
                            <div className="space-y-1">
                              {topProducts.map((product, idx) => (
                                <div key={idx} className="text-sm flex justify-between">
                                  <span className="truncate max-w-[120px]">{product.name}</span>
                                  <span className="font-semibold">{product.units_sold} units</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium text-purple-600 mb-2">📦 Top Categories</h5>
                            <div className="space-y-1">
                              {topCategories.map(([category, data], idx) => (
                                <div key={idx} className="text-sm flex justify-between">
                                  <span className="truncate max-w-[120px]">{category}</span>
                                  <span className="font-semibold">{formatCurrency(data.revenue || 0)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Monthly revenue over the past year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthly_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Combined Product Performance & Revenue Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Product Performance & Revenue Analysis</CardTitle>
          <CardDescription>Combined view of best selling products and revenue by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  ...analytics.best_sellers.map(product => ({
                    name: product.name,
                    type: 'Product',
                    units_sold: product.units_sold,
                    revenue: product.revenue || 0,
                    category: product.category || 'N/A'
                  })),
                  ...Object.entries(analytics.revenue_by_category).map(([category, data]) => ({
                    name: category,
                    type: 'Category',
                    units_sold: data.units_sold || 0,
                    revenue: data.revenue || 0,
                    category: category
                  }))
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis yAxisId="units" orientation="left" />
                <YAxis yAxisId="revenue" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'revenue') {
                      return [formatCurrency(value), 'Revenue'];
                    }
                    return [value, 'Units Sold'];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${data.name} (${data.type})`;
                    }
                    return label;
                  }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="units"
                  dataKey="units_sold" 
                  fill="#8884d8" 
                  name="Units Sold"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  yAxisId="revenue"
                  dataKey="revenue" 
                  fill="#82ca9d" 
                  name="Revenue"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Discount Code Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Code Performance</CardTitle>
          <CardDescription>Overview of your discount codes usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Total Codes</p>
              <p className="text-2xl font-bold">{analytics.discount_stats.total_codes}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Times Used</p>
              <p className="text-2xl font-bold">{analytics.discount_stats.codes_used}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Total Discount Amount</p>
              <p className="text-2xl font-bold">
                {formatCurrency(analytics.discount_stats.total_discount_amount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Performing Products */}
      <Card>
        <CardHeader>
          <CardTitle>Products Needing Attention</CardTitle>
          <CardDescription>Products with low inventory turnover</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.low_performers.map((product) => (
              <div
                key={product.product_id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    {product.units_sold} units sold | {formatCurrency(product.revenue)} revenue
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {(product.conversion_rate).toFixed(1)}% conversion
                  </p>
                  <p className="text-xs text-gray-500">
                    {(product.inventory_turnover).toFixed(2)}x turnover
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerAnalytics;
