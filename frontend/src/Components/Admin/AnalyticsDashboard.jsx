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
    start_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year ago
    end_date: new Date().toISOString().split('T')[0]
  });
  
  // New state for micro analytics
  const [mostSellingProducts, setMostSellingProducts] = useState(null);
  const [highestSalesSellers, setHighestSalesSellers] = useState(null);
  const [microAnalyticsLoading, setMicroAnalyticsLoading] = useState(false);

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:8000/api/analytics/test-controller?period=${selectedPeriod}&start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        console.error('Failed to fetch analytics data:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch micro analytics data
  const fetchMicroAnalyticsData = async () => {
    setMicroAnalyticsLoading(true);
    try {
      const mostSellingUrl = `http://localhost:8000/api/analytics/micro/most-selling-products?period=${selectedPeriod}&start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`;
      const highestSalesUrl = `http://localhost:8000/api/analytics/micro/highest-sales-sellers?period=${selectedPeriod}&start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`;
      
      const [mostSellingResponse, highestSalesResponse] = await Promise.all([
        fetch(mostSellingUrl),
        fetch(highestSalesUrl)
      ]);
      
      if (mostSellingResponse.ok && highestSalesResponse.ok) {
        const mostSellingData = await mostSellingResponse.json();
        const highestSalesData = await highestSalesResponse.json();
        
        setMostSellingProducts(mostSellingData);
        setHighestSalesSellers(highestSalesData);
      } else {
        console.error('Failed to fetch micro analytics data:', {
          mostSellingStatus: mostSellingResponse.status,
          highestSalesStatus: highestSalesResponse.status
        });
        if (!mostSellingResponse.ok) {
          const errorText = await mostSellingResponse.text();
          console.error('Most selling products error:', errorText);
        }
        if (!highestSalesResponse.ok) {
          const errorText = await highestSalesResponse.text();
          console.error('Highest sales sellers error:', errorText);
        }
      }
    } catch (error) {
      console.error('Error fetching micro analytics data:', error);
    } finally {
      setMicroAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    fetchMicroAnalyticsData();
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
        await fetchMicroAnalyticsData(); // Refresh micro analytics data
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

  // Chart data preparation with better error handling
  const revenueChartData = revenue?.trend_data?.map(item => ({
    date: item.month || item.date || 'Unknown',
    revenue: parseFloat(item.revenue || item.total_revenue || 0),
    commission: parseFloat(item.commission || 0),
  })) || [];

  const orderChartData = orders?.trend_data?.map(item => ({
    date: item.month || item.date || 'Unknown',
    orders: parseInt(item.total || item.total_orders || 0),
    completed: parseInt(item.completed || item.completed_orders || 0),
  })) || [];

  const reviewChartData = reviews?.trend_data?.map(item => ({
    date: item.month || item.date || 'Unknown',
    rating: parseFloat(item.avg_rating || item.average_rating || 0),
    reviews: parseInt(item.reviews || item.total_reviews || 0),
  })) || [];


  // Pie chart data with better error handling
  const orderStatusData = [
    { name: 'Completed', value: orders?.status_distribution?.completed || 0, color: '#10B981' },
    { name: 'Pending', value: orders?.status_distribution?.pending || 0, color: '#F59E0B' },
    { name: 'Processing', value: orders?.status_distribution?.processing || 0, color: '#3B82F6' },
    { name: 'Shipped', value: orders?.status_distribution?.shipped || 0, color: '#8B5CF6' },
    { name: 'Cancelled', value: orders?.status_distribution?.cancelled || 0, color: '#EF4444' },
    { name: 'Refunded', value: orders?.status_distribution?.refunded || 0, color: '#6B7280' },
  ].filter(item => item.value > 0); // Only show categories with data

  const reviewScoreData = [
    { name: '5 Stars', value: reviews?.score_distribution?.five_star || 0, color: '#10B981' },
    { name: '4 Stars', value: reviews?.score_distribution?.four_star || 0, color: '#34D399' },
    { name: '3 Stars', value: reviews?.score_distribution?.three_star || 0, color: '#FBBF24' },
    { name: '2 Stars', value: reviews?.score_distribution?.two_star || 0, color: '#F59E0B' },
    { name: '1 Star', value: reviews?.score_distribution?.one_star || 0, color: '#EF4444' },
  ].filter(item => item.value > 0); // Only show categories with data

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive platform insights and metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Period:</label>
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
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">From:</label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              className="px-3 py-1 border rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">To:</label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              className="px-3 py-1 border rounded text-sm"
            />
          </div>
          <Button onClick={() => { fetchAnalyticsData(); fetchMicroAnalyticsData(); }} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={generateAnalyticsData} disabled={generating}>
            <BarChart3 className={`h-4 w-4 mr-2 ${generating ? 'animate-pulse' : ''}`} />
            {generating ? 'Generating...' : 'Generate Data'}
          </Button>
          <Button 
            onClick={() => {
              // Trigger micro analytics data generation
              fetch(`http://localhost:8000/api/analytics/generate-public`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  date: new Date().toISOString().split('T')[0],
                  period_type: selectedPeriod
                }),
              }).then(() => {
                setTimeout(() => {
                  fetchAnalyticsData();
                  fetchMicroAnalyticsData();
                }, 1000);
              });
            }} 
            variant="outline"
            disabled={generating}
          >
            <Activity className="h-4 w-4 mr-2" />
            Generate Micro Data
          </Button>
        </div>
      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            ₱
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{summary.total_revenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {revenue.growth_rate > 0 ? (
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
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
              {orders.completion_rate ? parseFloat(orders.completion_rate).toFixed(1) : '0.0'}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.average_rating ? parseFloat(summary.average_rating).toFixed(1) : '0.0'}/5</div>
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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="sellers">Sellers</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="micro">Micro Analytics</TabsTrigger>
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
                {revenueChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>No revenue data available for the selected period</p>
                      <p className="text-sm">Try adjusting the date range or generating new data</p>
                    </div>
                  </div>
                )}
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
                {orderChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={orderChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="orders" stroke="#8884d8" strokeWidth={2} name="Total Orders" />
                      <Line type="monotone" dataKey="completed" stroke="#82ca9d" strokeWidth={2} name="Completed Orders" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-2" />
                      <p>No order data available for the selected period</p>
                      <p className="text-sm">Try adjusting the date range or generating new data</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Breakdown of order statuses</CardDescription>
              </CardHeader>
              <CardContent>
                {orderStatusData.length > 0 ? (
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
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto mb-2" />
                      <p>No order status data available</p>
                      <p className="text-sm">Generate data to see order distribution</p>
                    </div>
                  </div>
                )}
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
                  <div className="text-2xl font-bold text-green-600">{orders.completion_rate ? parseFloat(orders.completion_rate).toFixed(1) : '0.0'}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">₱{orders.average_order_value ? parseFloat(orders.average_order_value).toFixed(2) : '0.00'}</div>
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
                  <div className="text-2xl font-bold">{reviews.average_rating ? parseFloat(reviews.average_rating).toFixed(1) : '0.0'}/5</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{reviews.response_rate ? parseFloat(reviews.response_rate).toFixed(1) : '0.0'}%</div>
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
                      <span>{products.image_quality?.image_coverage_percentage ? parseFloat(products.image_quality.image_coverage_percentage).toFixed(1) : '0.0'}%</span>
                    </div>
                    <Progress value={products.image_quality?.image_coverage_percentage || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Products with Videos</span>
                      <span>{products.image_quality?.video_coverage_percentage ? parseFloat(products.image_quality.video_coverage_percentage).toFixed(1) : '0.0'}%</span>
                    </div>
                    <Progress value={products.image_quality?.video_coverage_percentage || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Missing Images</span>
                      <span>{products.image_quality?.missing_images_percentage ? parseFloat(products.image_quality.missing_images_percentage).toFixed(1) : '0.0'}%</span>
                    </div>
                    <Progress value={products.image_quality?.missing_images_percentage || 0} className="bg-red-100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Most Selling Products Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Most Selling Products</CardTitle>
              <CardDescription>Top performing products by quantity sold and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {microAnalyticsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading most selling products...</span>
                </div>
              ) : mostSellingProducts?.most_selling_products ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={mostSellingProducts.most_selling_products.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="product_name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'total_revenue' ? `₱${value.toLocaleString()}` : value,
                          name === 'total_revenue' ? 'Revenue' : name === 'total_quantity_sold' ? 'Quantity Sold' : 'Orders'
                        ]}
                        labelFormatter={(label) => `Product: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="total_quantity_sold" fill="#8884d8" name="Quantity Sold" />
                      <Bar dataKey="total_orders" fill="#82ca9d" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  {/* Top Products List */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Top 5 Best Sellers</h4>
                    {mostSellingProducts.most_selling_products.slice(0, 5).map((product, index) => (
                      <div key={product.product_id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold">{product.product_name}</div>
                            <div className="text-sm text-gray-600">by {product.seller_name} • {product.category}</div>
                          </div>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{product.total_quantity_sold}</div>
                            <div className="text-gray-500">Sold</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">₱{product.total_revenue?.toLocaleString()}</div>
                            <div className="text-gray-500">Revenue</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-yellow-600">★{product.average_rating ? parseFloat(product.average_rating).toFixed(1) : '0.0'}</div>
                            <div className="text-gray-500">Rating</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                  <p className="text-gray-600">No most selling products data available</p>
                </div>
              )}
            </CardContent>
          </Card>
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

          {/* Highest Sales Sellers Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Highest Sales Sellers</CardTitle>
              <CardDescription>Top performing sellers by revenue and growth</CardDescription>
            </CardHeader>
            <CardContent>
              {microAnalyticsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading highest sales sellers...</span>
                </div>
              ) : highestSalesSellers?.highest_sales_sellers ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={highestSalesSellers.highest_sales_sellers.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="seller_name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'total_revenue' ? `₱${value.toLocaleString()}` : value,
                          name === 'total_revenue' ? 'Revenue' : name === 'total_orders' ? 'Orders' : 'Products Sold'
                        ]}
                        labelFormatter={(label) => `Seller: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="total_revenue" fill="#10B981" name="Revenue" />
                      <Bar dataKey="total_orders" fill="#3B82F6" name="Orders" />
                      <Bar dataKey="total_products_sold" fill="#F59E0B" name="Products Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  {/* Top Sellers List */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Top 5 Highest Sales Sellers</h4>
                    {highestSalesSellers.highest_sales_sellers.slice(0, 5).map((seller, index) => (
                      <div key={seller.seller_id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold">{seller.business_name}</div>
                            <div className="text-sm text-gray-600">{seller.seller_name} • {seller.top_category}</div>
                          </div>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-green-600">₱{seller.total_revenue?.toLocaleString()}</div>
                            <div className="text-gray-500">Revenue</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">{seller.total_orders}</div>
                            <div className="text-gray-500">Orders</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-yellow-600">★{seller.average_rating ? parseFloat(seller.average_rating).toFixed(1) : '0.0'}</div>
                            <div className="text-gray-500">Rating</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-purple-600">{seller.completion_rate ? parseFloat(seller.completion_rate).toFixed(1) : '0.0'}%</div>
                            <div className="text-gray-500">Completion</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                  <p className="text-gray-600">No highest sales sellers data available</p>
                </div>
              )}
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
                    <span className="font-semibold">{moderation.statistics?.products?.approval_rate ? parseFloat(moderation.statistics.products.approval_rate).toFixed(1) : '0.0'}%</span>
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
                    <span className="font-semibold">{moderation.statistics?.reviews?.approval_rate ? parseFloat(moderation.statistics.reviews.approval_rate).toFixed(1) : '0.0'}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Moderation Trends Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Moderation Trends Over Time</CardTitle>
              <CardDescription>Moderation activity and approval rates by period ({selectedPeriod})</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={moderation.trend_data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'approval_rate' ? `${value}%` : value,
                      name === 'approval_rate' ? 'Approval Rate' : 
                      name === 'total_products_submitted' ? 'Products Submitted' :
                      name === 'products_approved' ? 'Products Approved' :
                      name === 'products_rejected' ? 'Products Rejected' :
                      name === 'total_reviews_submitted' ? 'Reviews Submitted' :
                      name === 'reviews_approved' ? 'Reviews Approved' :
                      name === 'reviews_flagged' ? 'Reviews Flagged' : name
                    ]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="approval_rate" stroke="#10B981" strokeWidth={2} name="Approval Rate" />
                  <Line type="monotone" dataKey="total_products_submitted" stroke="#3B82F6" strokeWidth={2} name="Products Submitted" />
                  <Line type="monotone" dataKey="products_approved" stroke="#10B981" strokeWidth={2} name="Products Approved" />
                  <Line type="monotone" dataKey="products_rejected" stroke="#EF4444" strokeWidth={2} name="Products Rejected" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Moderation Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Moderation Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators for content moderation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{moderation.total_submissions || 0}</div>
                  <div className="text-sm text-gray-600">Total Submissions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{moderation.approval_rate ? parseFloat(moderation.approval_rate).toFixed(1) : '0.0'}%</div>
                  <div className="text-sm text-gray-600">Overall Approval Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{moderation.average_processing_time || 0}h</div>
                  <div className="text-sm text-gray-600">Avg Processing Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{moderation.flagged_content || 0}</div>
                  <div className="text-sm text-gray-600">Flagged Content</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Moderation Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Review Moderation Trends</CardTitle>
              <CardDescription>Review moderation activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={moderation.trend_data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'reviews_approval_rate' ? `${value}%` : value,
                      name === 'reviews_approval_rate' ? 'Reviews Approval Rate' : 
                      name === 'total_reviews_submitted' ? 'Reviews Submitted' :
                      name === 'reviews_approved' ? 'Reviews Approved' :
                      name === 'reviews_flagged' ? 'Reviews Flagged' : name
                    ]}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="total_reviews_submitted" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Reviews Submitted" />
                  <Area type="monotone" dataKey="reviews_approved" stackId="2" stroke="#10B981" fill="#10B981" name="Reviews Approved" />
                  <Area type="monotone" dataKey="reviews_flagged" stackId="3" stroke="#EF4444" fill="#EF4444" name="Reviews Flagged" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

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

        {/* Micro Analytics Tab */}
        <TabsContent value="micro" className="space-y-4">
          {/* Time Scale Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Micro Analytics Dashboard</CardTitle>
              <CardDescription>Comprehensive insights into most selling products and highest sales sellers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
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
                <div className="text-sm text-gray-600">
                  Showing data for: {selectedPeriod} view
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Selling Products Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Most Selling Products Trend</CardTitle>
                <CardDescription>Product performance over time ({selectedPeriod})</CardDescription>
              </CardHeader>
              <CardContent>
                {microAnalyticsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading...</span>
                  </div>
                ) : mostSellingProducts?.trend_data ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mostSellingProducts.trend_data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'total_revenue' ? `₱${value.toLocaleString()}` : value,
                          name === 'total_revenue' ? 'Revenue' : name === 'total_quantity' ? 'Quantity' : 'Orders'
                        ]}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="total_quantity" stroke="#8884d8" strokeWidth={2} name="Quantity Sold" />
                      <Line type="monotone" dataKey="total_orders" stroke="#82ca9d" strokeWidth={2} name="Orders" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                    <p className="text-gray-600">No trend data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Highest Sales Sellers Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Highest Sales Sellers Trend</CardTitle>
                <CardDescription>Seller performance over time ({selectedPeriod})</CardDescription>
              </CardHeader>
              <CardContent>
                {microAnalyticsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading...</span>
                  </div>
                ) : highestSalesSellers?.trend_data ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={highestSalesSellers.trend_data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'total_revenue' ? `₱${value.toLocaleString()}` : value,
                          name === 'total_revenue' ? 'Revenue' : name === 'total_orders' ? 'Orders' : 'Products'
                        ]}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="total_revenue" stackId="1" stroke="#10B981" fill="#10B981" name="Revenue" />
                      <Area type="monotone" dataKey="total_orders" stackId="2" stroke="#3B82F6" fill="#3B82F6" name="Orders" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                    <p className="text-gray-600">No trend data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Performance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance Analysis</CardTitle>
              <CardDescription>Compare performance across product categories</CardDescription>
            </CardHeader>
            <CardContent>
              {microAnalyticsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading category data...</span>
                </div>
              ) : mostSellingProducts?.category_breakdown ? (
                <div className="space-y-6">
                  {Object.entries(mostSellingProducts.category_breakdown).map(([category, products]) => (
                    <div key={category} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-lg capitalize">{category}</h4>
                        <Badge variant="outline">{products.length} products</Badge>
                      </div>
                      <div className="space-y-2">
                        {products.slice(0, 3).map((product, index) => (
                          <div key={product.product_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{product.product_name}</div>
                                <div className="text-sm text-gray-600">by {product.seller_name}</div>
                              </div>
                            </div>
                            <div className="flex gap-4 text-sm">
                              <div className="text-center">
                                <div className="font-semibold text-green-600">{product.total_quantity}</div>
                                <div className="text-gray-500">Sold</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-blue-600">₱{product.total_revenue?.toLocaleString()}</div>
                                <div className="text-gray-500">Revenue</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-yellow-600">★{product.avg_rating ? parseFloat(product.avg_rating).toFixed(1) : '0.0'}</div>
                                <div className="text-gray-500">Rating</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                  <p className="text-gray-600">No category data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seller Growth Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Seller Growth Analysis</CardTitle>
              <CardDescription>Growth rates and performance comparison</CardDescription>
            </CardHeader>
            <CardContent>
              {microAnalyticsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading growth data...</span>
                </div>
              ) : highestSalesSellers?.growth_comparison ? (
                <div className="space-y-4">
                  {highestSalesSellers.growth_comparison.slice(0, 10).map((seller, index) => (
                    <div key={seller.seller_id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          seller.growth_rate > 0 ? 'bg-green-100 text-green-800' : 
                          seller.growth_rate < 0 ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{seller.business_name}</div>
                          <div className="text-sm text-gray-600">{seller.seller_name}</div>
                        </div>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-green-600">₱{seller.total_revenue?.toLocaleString()}</div>
                          <div className="text-gray-500">Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-semibold ${seller.growth_rate > 0 ? 'text-green-600' : seller.growth_rate < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {seller.growth_rate > 0 ? '+' : ''}{seller.growth_rate}%
                          </div>
                          <div className="text-gray-500">Growth</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{seller.total_orders}</div>
                          <div className="text-gray-500">Orders</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-yellow-600">★{seller.avg_rating ? parseFloat(seller.avg_rating).toFixed(1) : '0.0'}</div>
                          <div className="text-gray-500">Rating</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                  <p className="text-gray-600">No growth data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Rating Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Rating Breakdown</CardTitle>
              <CardDescription>Who rated what with detailed user information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.micro_analytics?.detailed_reviews?.rating_breakdowns && 
                  Object.entries(analyticsData.micro_analytics.detailed_reviews.rating_breakdowns).map(([rating, reviews]) => (
                    <div key={rating} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold capitalize">{rating.replace('_', ' ')} Reviews</h4>
                        <Badge variant="outline">{reviews.length} reviews</Badge>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {reviews.slice(0, 5).map((review, index) => (
                          <div key={index} className="text-sm border-l-2 border-gray-200 pl-2">
                            <div className="flex justify-between">
                              <span className="font-medium">{review.user_name}</span>
                              <span className="text-gray-500">{review.date}</span>
                            </div>
                            <div className="text-gray-600">{review.product_name}</div>
                            <div className="text-xs text-gray-500">by {review.seller_name}</div>
                            {review.review_text && (
                              <div className="text-xs text-gray-700 mt-1 italic">
                                "{review.review_text.substring(0, 100)}..."
                              </div>
                            )}
                          </div>
                        ))}
                        {reviews.length > 5 && (
                          <div className="text-xs text-gray-500 text-center">
                            ... and {reviews.length - 5} more reviews
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;

