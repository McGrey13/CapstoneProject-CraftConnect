import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DollarSign,
  ShoppingBag,
  Star,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Image,
  Video,
  Shield,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

// Chart components (you can replace with your preferred chart library)
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/analytics/test-controller?period=${selectedPeriod}&start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        console.error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, dateRange]);

  // Generate analytics data
  const generateAnalyticsData = async () => {
    setGenerating(true);
    try {
      console.log('Generating analytics data...');
      const response = await fetch('http://localhost:8000/api/analytics/generate-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          period_type: selectedPeriod
        }),
      });
      
      console.log('Generate response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Generate response:', result);
        
        // Show success message
        if (result.data_created) {
          alert(`Data generated successfully!\nOrders: ${result.data_created.orders}\nProducts: ${result.data_created.products}\nReviews: ${result.data_created.reviews}`);
        }
        
        await fetchAnalyticsData(); // Refresh data after generation
        console.log('Analytics data refreshed');
      } else {
        console.error('Generate failed with status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error generating analytics data:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
        <p className="text-gray-600 mb-4">Generate analytics data to view insights</p>
        <Button onClick={generateAnalyticsData} disabled={generating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Generating...' : 'Generate Data'}
        </Button>
      </div>
    );
  }

  const { revenue, seller_revenue, orders, reviews, products, moderation, summary } = analyticsData;

  // Chart data preparation
  const revenueChartData = revenue.trend_data?.map(item => ({
    date: item.month,
    revenue: parseFloat(item.revenue),
    commission: parseFloat(item.commission),
  })) || [];

  const orderChartData = orders.trend_data?.map(item => ({
    date: item.month,
    orders: item.total,
    completed: item.completed,
  })) || [];

  const reviewChartData = reviews.trend_data?.map(item => ({
    date: item.month,
    rating: parseFloat(item.avg_rating),
    reviews: item.reviews,
  })) || [];

  // Pie chart data
  const orderStatusData = [
    { name: 'Completed', value: orders.status_distribution?.completed || 0, color: '#10B981' },
    { name: 'Pending', value: orders.status_distribution?.pending || 0, color: '#F59E0B' },
    { name: 'Processing', value: orders.status_distribution?.processing || 0, color: '#3B82F6' },
    { name: 'Shipped', value: orders.status_distribution?.shipped || 0, color: '#8B5CF6' },
    { name: 'Cancelled', value: orders.status_distribution?.cancelled || 0, color: '#EF4444' },
    { name: 'Refunded', value: orders.status_distribution?.refunded || 0, color: '#6B7280' },
  ];

  const reviewScoreData = [
    { name: '5 Stars', value: reviews.score_distribution?.five_star || 0, color: '#10B981' },
    { name: '4 Stars', value: reviews.score_distribution?.four_star || 0, color: '#34D399' },
    { name: '3 Stars', value: reviews.score_distribution?.three_star || 0, color: '#FBBF24' },
    { name: '2 Stars', value: reviews.score_distribution?.two_star || 0, color: '#F59E0B' },
    { name: '1 Star', value: reviews.score_distribution?.one_star || 0, color: '#EF4444' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive platform insights and metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalyticsData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={generateAnalyticsData} disabled={generating}>
            <BarChart3 className={`h-4 w-4 mr-2 ${generating ? 'animate-pulse' : ''}`} />
            {generating ? 'Generating...' : 'Generate Data'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{summary.total_revenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {revenue.growth_rate > 0 ? (
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{revenue.growth_rate?.toFixed(1)}% from last period
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {revenue.growth_rate?.toFixed(1)}% from last period
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_orders?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {orders.completion_rate?.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.average_rating?.toFixed(1) || 0}/5</div>
            <p className="text-xs text-muted-foreground">
              {reviews.total_reviews} total reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.active_sellers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary.total_products} total products
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="sellers">Sellers</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Platform revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Revenue composition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Revenue</span>
                  <span className="font-semibold">₱{revenue.total_revenue?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Platform Commission</span>
                  <span className="font-semibold">₱{revenue.platform_commission?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Payment Fees</span>
                  <span className="font-semibold">₱{revenue.payment_fees?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span>Net Revenue</span>
                  <span className="font-semibold text-green-600">₱{revenue.net_revenue?.toLocaleString() || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Trends</CardTitle>
                <CardDescription>Order volume and completion over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={orderChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="completed" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Breakdown of order statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent, value }) => 
                        value > 0 ? `${name}\n${(percent * 100).toFixed(0)}%` : ''
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Metrics</CardTitle>
              <CardDescription>Key order performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{orders.completion_rate?.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">₱{orders.average_order_value?.toFixed(2) || 0}</div>
                  <div className="text-sm text-gray-600">Average Order Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{orders.status_distribution?.cancelled || 0}</div>
                  <div className="text-sm text-gray-600">Cancelled Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rating Trends</CardTitle>
                <CardDescription>Average rating over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reviewChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip formatter={(value) => [value.toFixed(2), 'Rating']} />
                    <Line type="monotone" dataKey="rating" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Score Distribution</CardTitle>
                <CardDescription>Breakdown of review ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={reviewScoreData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reviewScoreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Review Metrics</CardTitle>
              <CardDescription>Review performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{reviews.total_reviews || 0}</div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{reviews.average_rating?.toFixed(1) || 0}/5</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{reviews.response_rate?.toFixed(1) || 0}%</div>
                  <div className="text-sm text-gray-600">Response Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{reviews.score_distribution?.five_star || 0}</div>
                  <div className="text-sm text-gray-600">5-Star Reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Status Distribution</CardTitle>
                <CardDescription>Breakdown of product statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Active Products</span>
                    <Badge variant="default">{products.status_distribution?.active || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Out of Stock</span>
                    <Badge variant="destructive">{products.status_distribution?.out_of_stock || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Low Stock</span>
                    <Badge variant="secondary">{products.status_distribution?.low_stock || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Featured Products</span>
                    <Badge variant="outline">{products.status_distribution?.featured || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Image Quality Metrics</CardTitle>
                <CardDescription>Product image coverage and quality</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Products with Images</span>
                      <span>{products.image_quality?.image_coverage_percentage?.toFixed(1) || 0}%</span>
                    </div>
                    <Progress value={products.image_quality?.image_coverage_percentage || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Products with Videos</span>
                      <span>{products.image_quality?.video_coverage_percentage?.toFixed(1) || 0}%</span>
                    </div>
                    <Progress value={products.image_quality?.video_coverage_percentage || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Missing Images</span>
                      <span>{products.image_quality?.missing_images_percentage?.toFixed(1) || 0}%</span>
                    </div>
                    <Progress value={products.image_quality?.missing_images_percentage || 0} className="bg-red-100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sellers Tab */}
        <TabsContent value="sellers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Sellers</CardTitle>
              <CardDescription>Sellers ranked by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seller_revenue.top_sellers?.map((seller, index) => (
                  <div key={seller.seller_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{seller.seller?.businessName || 'Unknown Seller'}</div>
                        <div className="text-sm text-gray-600">{seller.total_orders} orders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₱{seller.total_revenue?.toLocaleString() || 0}</div>
                      <div className="text-sm text-gray-600">{seller.products_sold} products sold</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Sellers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{seller_revenue.total_sellers || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Active Sellers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{seller_revenue.active_sellers || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Avg Revenue/Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{seller_revenue.average_revenue_per_seller?.toLocaleString() || 0}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Moderation</CardTitle>
                <CardDescription>Product approval statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Pending Approval</span>
                    <Badge variant="secondary">{moderation.statistics?.products?.pending || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Approved</span>
                    <Badge variant="default">{moderation.statistics?.products?.approved || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rejected</span>
                    <Badge variant="destructive">{moderation.statistics?.products?.rejected || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Approval Rate</span>
                    <span className="font-semibold">{moderation.statistics?.products?.approval_rate?.toFixed(1) || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Moderation</CardTitle>
                <CardDescription>Review moderation statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Flagged Reviews</span>
                    <Badge variant="destructive">{moderation.statistics?.reviews?.flagged || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Approved Reviews</span>
                    <Badge variant="default">{moderation.statistics?.reviews?.approved || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Removed Reviews</span>
                    <Badge variant="secondary">{moderation.statistics?.reviews?.removed || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Approval Rate</span>
                    <span className="font-semibold">{moderation.statistics?.reviews?.approval_rate?.toFixed(1) || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Moderation</CardTitle>
              <CardDescription>User account moderation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{moderation.statistics?.users?.suspended || 0}</div>
                  <div className="text-sm text-gray-600">Suspended Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{moderation.statistics?.users?.reactivated || 0}</div>
                  <div className="text-sm text-gray-600">Reactivated Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
