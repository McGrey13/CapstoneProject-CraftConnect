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
  Clock,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import "./AdminTableDesign.css";

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
    start_date: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 years ago (minimum recommended)
    end_date: new Date().toISOString().split('T')[0]
  });
  
  // Recommended views based on selected period
  const getRecommendedView = (period) => {
    const recommendations = {
      daily: {
        title: "Daily View Recommended",
        description: "Best for tracking daily performance, identifying trends, and monitoring short-term changes",
        suggestedRange: "Last 30-90 days",
        charts: ["Revenue trends", "Order volume", "Daily sales patterns"]
      },
      monthly: {
        title: "Monthly View Recommended", 
        description: "Ideal for business planning, seasonal analysis, and long-term trend identification",
        suggestedRange: "Last 6-12 months",
        charts: ["Monthly revenue", "Growth patterns", "Seasonal trends"]
      },
      quarterly: {
        title: "Quarterly View Recommended",
        description: "Excellent for quarterly reporting, business reviews, and performance tracking",
        suggestedRange: "Last 4-8 quarters",
        charts: ["Quarterly revenue", "Quarter-over-quarter growth", "Seasonal patterns"]
      },
      yearly: {
        title: "Yearly View Recommended",
        description: "Perfect for annual planning, year-over-year comparisons, and strategic analysis",
        suggestedRange: "Last 2-3 years",
        charts: ["Annual growth", "Yearly performance", "Strategic insights"]
      }
    };
    return recommendations[period] || recommendations.monthly;
  };
  
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
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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

  // Handle period change with automatic data refresh
  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
    
    // Adjust date range based on selected period
    const now = new Date();
    let newDateRange = { ...dateRange };
    
    switch (newPeriod) {
      case 'daily':
        // For daily view, limit to last 90 days for better performance
        newDateRange.start_date = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'monthly':
        // For monthly view, show last 12 months
        newDateRange.start_date = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'quarterly':
        // For quarterly view, show last 8 quarters (2 years)
        newDateRange.start_date = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'yearly':
        // For yearly view, show last 3 years
        newDateRange.start_date = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
    }
    
    setDateRange(newDateRange);
  };

  // Auto-fetch data when period or date range changes
  useEffect(() => {
    if (selectedPeriod && dateRange.start_date && dateRange.end_date) {
      fetchAnalyticsData();
      fetchMicroAnalyticsData();
    }
  }, [selectedPeriod, dateRange.start_date, dateRange.end_date]);

  // Fetch micro analytics data
  const fetchMicroAnalyticsData = async () => {
    setMicroAnalyticsLoading(true);
    try {
      const mostSellingUrl = `http://localhost:8000/api/analytics/revenue/most-selling-products?period=${selectedPeriod}&start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`;
      const highestSalesUrl = `http://localhost:8000/api/analytics/revenue/highest-sales-sellers?period=${selectedPeriod}&start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`;
      
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
          'Accept': 'application/json',
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
      <div className="admin-table-container">
        <div className="admin-table-loading">
          <div className="admin-table-loading-spinner"></div>
          <span>Loading analytics dashboard...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="admin-table-container">
        <div className="admin-table-empty">
          <BarChart3 className="admin-table-empty-icon" />
          <h3 className="admin-table-empty-title">No Analytics Data</h3>
          <p className="admin-table-empty-description">Generate analytics data to view comprehensive insights and metrics</p>
          <Button onClick={generateAnalyticsData} disabled={generating} className="admin-table-filter-btn">
            <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Generate Data'}
          </Button>
        </div>
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
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h1 className="admin-table-title">Analytics Dashboard</h1>
          <p className="admin-table-description">
            Comprehensive platform insights, performance metrics, and business intelligence
          </p>
          
          {/* Stats Row */}
          <div className="admin-table-stats">
            <div className="admin-table-stat">
              <BarChart3 className="admin-table-stat-icon" />
              <div>
                <div className="admin-table-stat-label">Data Status</div>
                <div className="text-xs text-gray-500">Real-time Analytics</div>
              </div>
            </div>
            <div className="admin-table-stat">
              <Calendar className="admin-table-stat-icon" />
              <div>
                <div className="admin-table-stat-label">Period</div>
                <div className="text-xs text-gray-500">{selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} View</div>
              </div>
            </div>
            <div className="admin-table-stat">
              <Activity className="admin-table-stat-icon" />
              <div>
                <div className="admin-table-stat-label">Last Updated</div>
                <div className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>

          {/* Enhanced Controls */}
          <div className="admin-table-controls">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Period:</label>
                <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-32 border-2 border-gray-200 focus:border-[#a4785a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">From:</label>
                <input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-[#a4785a] focus:ring-[#a4785a]/20 transition-all duration-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">To:</label>
                <input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-[#a4785a] focus:ring-[#a4785a]/20 transition-all duration-300"
                />
              </div>
            </div>
            <div className="admin-table-filters">
              <button 
                onClick={() => { fetchAnalyticsData(); fetchMicroAnalyticsData(); }} 
                className="admin-table-filter-btn"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <Button onClick={generateAnalyticsData} disabled={generating} className="admin-table-filter-btn">
                <BarChart3 className={`h-4 w-4 mr-2 ${generating ? 'animate-pulse' : ''}`} />
                {generating ? 'Generating...' : 'Generate Data'}
              </Button>
              <Button 
                onClick={() => {
                  // Trigger micro analytics data generation
                  fetch(`http://localhost:8000/api/analytics/generate-public`, {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                    },
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
                className="admin-table-filter-btn"
                disabled={generating}
              >
                <Activity className="h-4 w-4 mr-2" />
                Generate Micro Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Recommended View Banner */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <div className="flex items-start gap-4">
            <div className="admin-table-stat-icon bg-blue-100 text-blue-600">
              💡
            </div>
            <div className="flex-1">
              <h3 className="admin-table-title text-blue-900">
                {getRecommendedView(selectedPeriod).title}
              </h3>
              <p className="admin-table-description text-blue-700 mb-4">
                {getRecommendedView(selectedPeriod).description}
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="admin-table-stat">
                  <Calendar className="admin-table-stat-icon text-blue-600" />
                  <div>
                    <div className="admin-table-stat-label text-blue-800">Suggested Range</div>
                    <div className="text-xs text-blue-600">{getRecommendedView(selectedPeriod).suggestedRange}</div>
                  </div>
                </div>
                {getRecommendedView(selectedPeriod).charts.map((chart, index) => (
                  <div key={index} className="admin-table-stat">
                    <BarChart3 className="admin-table-stat-icon text-blue-600" />
                    <div>
                      <div className="admin-table-stat-label text-blue-800">Chart Type</div>
                      <div className="text-xs text-blue-600">{chart}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="admin-dashboard-grid">
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-card-header">
            <div className="admin-dashboard-card-title">Total Revenue</div>
            <div className="admin-dashboard-card-icon">
              <span className="text-2xl">₱</span>
            </div>
          </div>
          <div className="admin-dashboard-card-value">₱{summary.total_revenue?.toLocaleString() || 0}</div>
          <div className="admin-dashboard-card-description">Platform total revenue</div>
          <div className="admin-dashboard-card-trend">
            {revenue.growth_rate > 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="positive">+{revenue.growth_rate}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                <span className="negative">{revenue.growth_rate}%</span>
              </>
            )}
          </div>
        </div>

        <div className="admin-dashboard-card">
          <div className="admin-dashboard-card-header">
            <div className="admin-dashboard-card-title">Total Orders</div>
            <div className="admin-dashboard-card-icon">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="admin-dashboard-card-value">{summary.total_orders?.toLocaleString() || 0}</div>
          <div className="admin-dashboard-card-description">All time orders</div>
          <div className="admin-dashboard-card-trend">
            <span className="text-gray-600">
              {orders.completion_rate ? parseFloat(orders.completion_rate).toFixed(1) : '0.0'}% completion rate
            </span>
          </div>
        </div>

        <div className="admin-dashboard-card">
          <div className="admin-dashboard-card-header">
            <div className="admin-dashboard-card-title">Average Rating</div>
            <div className="admin-dashboard-card-icon">
              <Star className="h-5 w-5" />
            </div>
          </div>
          <div className="admin-dashboard-card-value">{summary.average_rating ? parseFloat(summary.average_rating).toFixed(1) : '0.0'}/5</div>
          <div className="admin-dashboard-card-description">Platform average rating</div>
          <div className="admin-dashboard-card-trend">
            <span className="text-gray-600">
              {reviews.total_reviews} total reviews
            </span>
          </div>
        </div>

        <div className="admin-dashboard-card">
          <div className="admin-dashboard-card-header">
            <div className="admin-dashboard-card-title">Active Sellers</div>
            <div className="admin-dashboard-card-icon">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="admin-dashboard-card-value">{summary.active_sellers || 0}</div>
          <div className="admin-dashboard-card-description">Active sellers on platform</div>
          <div className="admin-dashboard-card-trend">
            <span className="text-gray-600">
              {summary.total_products} total products
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Analytics Tabs */}
      <div className="admin-table-container">
        <Tabs defaultValue="revenue" className="space-y-4">
          <div className="admin-table-header">
            <TabsList className="grid w-full grid-cols-6 bg-gray-50 p-1 rounded-lg">
              <TabsTrigger 
                value="revenue" 
                className="data-[state=active]:bg-[#a4785a] data-[state=active]:text-white transition-all duration-300"
              >
                Revenue
              </TabsTrigger>
              <TabsTrigger 
                value="orders"
                className="data-[state=active]:bg-[#a4785a] data-[state=active]:text-white transition-all duration-300"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="data-[state=active]:bg-[#a4785a] data-[state=active]:text-white transition-all duration-300"
              >
                Reviews
              </TabsTrigger>
              <TabsTrigger 
                value="products"
                className="data-[state=active]:bg-[#a4785a] data-[state=active]:text-white transition-all duration-300"
              >
                Products
              </TabsTrigger>
              <TabsTrigger 
                value="sellers"
                className="data-[state=active]:bg-[#a4785a] data-[state=active]:text-white transition-all duration-300"
              >
                Sellers
              </TabsTrigger>
              <TabsTrigger 
                value="moderation"
                className="data-[state=active]:bg-[#a4785a] data-[state=active]:text-white transition-all duration-300"
              >
                Moderation
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Enhanced Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="admin-table-container">
              <div className="admin-table-header">
                <h3 className="admin-table-title">Revenue Analytics</h3>
                <p className="admin-table-description">
                  Platform revenue trends and breakdown analysis
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="admin-table-container">
                    <div className="admin-table-header">
                      <h4 className="admin-table-title">Revenue Trend - {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} View</h4>
                      <p className="admin-table-description">Platform revenue over time ({selectedPeriod} data points)</p>
                    </div>
                    <div className="p-6">
                      {revenueChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={revenueChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']} />
                            <Area type="monotone" dataKey="revenue" stroke="#a4785a" fill="#a4785a" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="admin-table-empty">
                          <BarChart3 className="admin-table-empty-icon" />
                          <h3 className="admin-table-empty-title">No Revenue Data</h3>
                          <p className="admin-table-empty-description">No revenue data available for the selected period</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-table-container">
                    <div className="admin-table-header">
                      <h4 className="admin-table-title">Revenue Breakdown</h4>
                      <p className="admin-table-description">Detailed revenue composition analysis</p>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="admin-table-stat">
                        <div className="admin-table-stat-icon">
                          <span className="text-lg">₱</span>
                        </div>
                        <div className="flex-1">
                          <div className="admin-table-stat-label">Total Revenue</div>
                          <div className="admin-table-stat-value">₱{revenue.total_revenue?.toLocaleString() || 0}</div>
                        </div>
                      </div>
                      <div className="admin-table-stat">
                        <div className="admin-table-stat-icon">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="admin-table-stat-label">Platform Commission</div>
                          <div className="admin-table-stat-value">₱{revenue.platform_commission?.toLocaleString() || 0}</div>
                        </div>
                      </div>
                      <div className="admin-table-stat">
                        <div className="admin-table-stat-icon">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="admin-table-stat-label">Payment Fees</div>
                          <div className="admin-table-stat-value">₱{revenue.payment_fees?.toLocaleString() || 0}</div>
                        </div>
                      </div>
                      <div className="admin-table-stat border-t pt-4">
                        <div className="admin-table-stat-icon">
                          <span className="text-green-600 text-lg">✓</span>
                        </div>
                        <div className="flex-1">
                          <div className="admin-table-stat-label text-green-700">Net Revenue</div>
                          <div className="admin-table-stat-value text-green-600">₱{revenue.net_revenue?.toLocaleString() || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro Analytics Section - Merged into Revenue Tab */}
            <div className="p-6 space-y-6">
          {/* Time Scale Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Micro Analytics</CardTitle>
              <CardDescription>Comprehensive revenue insights into most selling products and highest sales sellers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-600">
                  Showing data for: {selectedPeriod} view
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            {/* Most Selling Products Trend - Full Width */}
            <div className="w-full">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Most Selling Products Trend - {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} View</CardTitle>
                  <CardDescription>Product performance over time ({selectedPeriod} data points)</CardDescription>
                </CardHeader>
                <CardContent className="w-full">
                  {microAnalyticsLoading ? (
                    <div className="flex items-center justify-center h-96">
                      <RefreshCw className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Loading...</span>
                    </div>
                  ) : mostSellingProducts?.trend_data ? (
                    <div className="w-full h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mostSellingProducts.trend_data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="product_name" 
                            angle={-60}
                            textAnchor="end"
                            height={120}
                            interval={0}
                            fontSize={12}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis />
                          <Tooltip 
                            formatter={(value, name) => [
                              name === 'total_revenue' ? `₱${value.toLocaleString()}` : value,
                              name === 'total_revenue' ? 'Revenue' : name === 'total_quantity' ? 'Quantity Sold' : 'Orders'
                            ]}
                            labelFormatter={(label, payload) => {
                              if (payload && payload[0]) {
                                return `Product: ${payload[0].payload.product_name} (${payload[0].payload.seller_name})`;
                              }
                              return `Product: ${label}`;
                            }}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #ccc',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="total_quantity" stroke="#8884d8" strokeWidth={3} name="Quantity Sold" />
                          <Line type="monotone" dataKey="total_orders" stroke="#82ca9d" strokeWidth={3} name="Orders" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                      <p className="text-gray-600">No trend data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Highest Sales Sellers Trend - Full Width */}
            <div className="w-full">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Highest Sales Sellers Trend</CardTitle>
                  <CardDescription>Seller performance over time ({selectedPeriod})</CardDescription>
                </CardHeader>
                <CardContent className="w-full">
                  {microAnalyticsLoading ? (
                    <div className="flex items-center justify-center h-96">
                      <RefreshCw className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Loading...</span>
                    </div>
                  ) : highestSalesSellers?.trend_data ? (
                    <div className="w-full h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={highestSalesSellers.trend_data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="seller_name" 
                            angle={-60}
                            textAnchor="end"
                            height={120}
                            interval={0}
                            fontSize={12}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis />
                          <Tooltip 
                            formatter={(value, name) => [
                              name === 'total_revenue' ? `₱${value.toLocaleString()}` : value,
                              name === 'total_revenue' ? 'Revenue' : name === 'total_orders' ? 'Orders' : 'Products'
                            ]}
                            labelFormatter={(label, payload) => {
                              if (payload && payload[0]) {
                                return `Seller: ${payload[0].payload.seller_name} (${payload[0].payload.business_name})`;
                              }
                              return `Seller: ${label}`;
                            }}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #ccc',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="total_revenue" stackId="1" stroke="#10B981" fill="#10B981" name="Revenue" />
                          <Area type="monotone" dataKey="total_orders" stackId="2" stroke="#3B82F6" fill="#3B82F6" name="Orders" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                      <p className="text-gray-600">No trend data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
            </div>
        </TabsContent>

          {/* Enhanced Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="admin-table-container">
              <div className="admin-table-header">
                <h3 className="admin-table-title">Order Analytics</h3>
                <p className="admin-table-description">
                  Order volume trends, completion rates, and performance metrics
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="admin-table-container">
                    <div className="admin-table-header">
                      <h4 className="admin-table-title">Order Trends - {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} View</h4>
                      <p className="admin-table-description">Order volume and completion over time ({selectedPeriod} data points)</p>
                    </div>
                    <div className="p-6">
                      {orderChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={orderChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="orders" stroke="#a4785a" strokeWidth={2} name="Total Orders" />
                            <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="Completed Orders" />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="admin-table-empty">
                          <ShoppingBag className="admin-table-empty-icon" />
                          <h3 className="admin-table-empty-title">No Order Data</h3>
                          <p className="admin-table-empty-description">No order data available for the selected period</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-table-container">
                    <div className="admin-table-header">
                      <h4 className="admin-table-title">Order Status Distribution</h4>
                      <p className="admin-table-description">Breakdown of order statuses across the platform</p>
                    </div>
                    <div className="p-6">
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
                              fill="#a4785a"
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
                        <div className="admin-table-empty">
                          <PieChart className="admin-table-empty-icon" />
                          <h3 className="admin-table-empty-title">No Order Status Data</h3>
                          <p className="admin-table-empty-description">No order status data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Order Metrics */}
                <div className="admin-table-container">
                  <div className="admin-table-header">
                    <h4 className="admin-table-title">Order Performance Metrics</h4>
                    <p className="admin-table-description">Key order performance indicators and KPIs</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="admin-table-stat">
                        <CheckCircle className="admin-table-stat-icon text-green-600" />
                        <div className="flex-1">
                          <div className="admin-table-stat-value text-green-600">{orders.completion_rate ? parseFloat(orders.completion_rate).toFixed(1) : '0.0'}%</div>
                          <div className="admin-table-stat-label">Completion Rate</div>
                          <div className="text-xs text-gray-500">Order fulfillment success</div>
                        </div>
                      </div>
                      <div className="admin-table-stat">
                        <TrendingUp className="admin-table-stat-icon text-blue-600" />
                        <div className="flex-1">
                          <div className="admin-table-stat-value">₱{orders.average_order_value ? parseFloat(orders.average_order_value).toFixed(2) : '0.00'}</div>
                          <div className="admin-table-stat-label">Average Order Value</div>
                          <div className="text-xs text-gray-500">Revenue per order</div>
                        </div>
                      </div>
                      <div className="admin-table-stat">
                        <XCircle className="admin-table-stat-icon text-red-600" />
                        <div className="flex-1">
                          <div className="admin-table-stat-value text-red-600">{orders.status_distribution?.cancelled || 0}</div>
                          <div className="admin-table-stat-label">Cancelled Orders</div>
                          <div className="text-xs text-gray-500">Order cancellations</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Enhanced Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <div className="admin-table-container">
              <div className="admin-table-header">
                <h3 className="admin-table-title">Review Analytics</h3>
                <p className="admin-table-description">
                  Review trends, rating distributions, and customer feedback insights
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="admin-table-container">
                    <div className="admin-table-header">
                      <h4 className="admin-table-title">Rating Trends</h4>
                      <p className="admin-table-description">Average rating over time</p>
                    </div>
                    <div className="p-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={reviewChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 5]} />
                          <Tooltip formatter={(value) => [value.toFixed(2), 'Rating']} />
                          <Line type="monotone" dataKey="rating" stroke="#a4785a" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="admin-table-container">
                    <div className="admin-table-header">
                      <h4 className="admin-table-title">Review Score Distribution</h4>
                      <p className="admin-table-description">Breakdown of review ratings</p>
                    </div>
                    <div className="p-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={reviewScoreData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#a4785a"
                            dataKey="value"
                          >
                            {reviewScoreData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Enhanced Review Metrics */}
                <div className="admin-table-container">
                  <div className="admin-table-header">
                    <h4 className="admin-table-title">Review Performance Metrics</h4>
                    <p className="admin-table-description">Key review performance indicators and customer satisfaction metrics</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="admin-table-stat">
                        <MessageSquare className="admin-table-stat-icon text-blue-600" />
                        <div className="flex-1">
                          <div className="admin-table-stat-value">{reviews.total_reviews || 0}</div>
                          <div className="admin-table-stat-label">Total Reviews</div>
                          <div className="text-xs text-gray-500">Customer feedback</div>
                        </div>
                      </div>
                      <div className="admin-table-stat">
                        <Star className="admin-table-stat-icon text-yellow-600" />
                        <div className="flex-1">
                          <div className="admin-table-stat-value">{reviews.average_rating ? parseFloat(reviews.average_rating).toFixed(1) : '0.0'}/5</div>
                          <div className="admin-table-stat-label">Average Rating</div>
                          <div className="text-xs text-gray-500">Overall satisfaction</div>
                        </div>
                      </div>
                      <div className="admin-table-stat">
                        <Activity className="admin-table-stat-icon text-green-600" />
                        <div className="flex-1">
                          <div className="admin-table-stat-value">{reviews.response_rate ? parseFloat(reviews.response_rate).toFixed(1) : '0.0'}%</div>
                          <div className="admin-table-stat-label">Response Rate</div>
                          <div className="text-xs text-gray-500">Seller engagement</div>
                        </div>
                      </div>
                      <div className="admin-table-stat">
                        <Star className="admin-table-stat-icon text-yellow-500" />
                        <div className="flex-1">
                          <div className="admin-table-stat-value">{reviews.score_distribution?.five_star || 0}</div>
                          <div className="admin-table-stat-label">5-Star Reviews</div>
                          <div className="text-xs text-gray-500">Excellent ratings</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

        {/* Enhanced Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="admin-table-container">
            <div className="admin-table-header">
              <h3 className="admin-table-title">Product Analytics</h3>
              <p className="admin-table-description">
                Product status distribution, inventory insights, and performance metrics
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="admin-table-container">
                  <div className="admin-table-header">
                    <h4 className="admin-table-title">Product Status Distribution</h4>
                    <p className="admin-table-description">Breakdown of product statuses across the platform</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="admin-table-stat">
                      <CheckCircle className="admin-table-stat-icon text-green-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-label">Active Products</div>
                        <div className="admin-table-stat-value">{products.status_distribution?.active || 0}</div>
                        <div className="text-xs text-gray-500">Available for purchase</div>
                      </div>
                    </div>
                    <div className="admin-table-stat">
                      <XCircle className="admin-table-stat-icon text-red-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-label">Out of Stock</div>
                        <div className="admin-table-stat-value">{products.status_distribution?.out_of_stock || 0}</div>
                        <div className="text-xs text-gray-500">Inventory depleted</div>
                      </div>
                    </div>
                    <div className="admin-table-stat">
                      <AlertTriangle className="admin-table-stat-icon text-yellow-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-label">Low Stock</div>
                        <div className="admin-table-stat-value">{products.status_distribution?.low_stock || 0}</div>
                        <div className="text-xs text-gray-500">Running low</div>
                      </div>
                    </div>
                    <div className="admin-table-stat">
                      <Star className="admin-table-stat-icon text-blue-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-label">Featured Products</div>
                        <div className="admin-table-stat-value">{products.status_distribution?.featured || 0}</div>
                        <div className="text-xs text-gray-500">Promoted items</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-table-container">
                  <div className="admin-table-header">
                    <h4 className="admin-table-title">Image Quality Metrics</h4>
                    <p className="admin-table-description">Product image coverage and quality assessment</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="admin-table-stat">
                      <Image className="admin-table-stat-icon text-green-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-label">Products with Images</div>
                        <div className="admin-table-stat-value">{products.image_quality?.image_coverage_percentage ? parseFloat(products.image_quality.image_coverage_percentage).toFixed(1) : '0.0'}%</div>
                        <div className="text-xs text-gray-500">Image coverage rate</div>
                        <Progress value={products.image_quality?.image_coverage_percentage || 0} className="mt-2" />
                      </div>
                    </div>
                    <div className="admin-table-stat">
                      <Video className="admin-table-stat-icon text-blue-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-label">Products with Videos</div>
                        <div className="admin-table-stat-value">{products.image_quality?.video_coverage_percentage ? parseFloat(products.image_quality.video_coverage_percentage).toFixed(1) : '0.0'}%</div>
                        <div className="text-xs text-gray-500">Video coverage rate</div>
                        <Progress value={products.image_quality?.video_coverage_percentage || 0} className="mt-2" />
                      </div>
                    </div>
                    <div className="admin-table-stat">
                      <XCircle className="admin-table-stat-icon text-red-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-label">Missing Images</div>
                        <div className="admin-table-stat-value">{products.image_quality?.missing_images_percentage ? parseFloat(products.image_quality.missing_images_percentage).toFixed(1) : '0.0'}%</div>
                        <div className="text-xs text-gray-500">Products without images</div>
                        <Progress value={products.image_quality?.missing_images_percentage || 0} className="mt-2 bg-red-100" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Most Selling Products Chart */}
          <div className="admin-table-container">
            <div className="admin-table-header">
              <h4 className="admin-table-title">Most Selling Products</h4>
              <p className="admin-table-description">Top performing products by quantity sold and revenue</p>
            </div>
            <div className="p-6">
              {microAnalyticsLoading ? (
                <div className="admin-table-loading">
                  <div className="admin-table-loading-spinner"></div>
                  <span>Loading most selling products...</span>
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
                <div className="admin-table-empty">
                  <AlertTriangle className="admin-table-empty-icon" />
                  <h3 className="admin-table-empty-title">No Most Selling Products Data</h3>
                  <p className="admin-table-empty-description">No most selling products data available</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Enhanced Sellers Tab */}
        <TabsContent value="sellers" className="space-y-4">
          <div className="admin-table-container">
            <div className="admin-table-header">
              <h3 className="admin-table-title">Seller Analytics</h3>
              <p className="admin-table-description">
                Top performing sellers, revenue insights, and growth metrics
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="admin-table-container">
                <div className="admin-table-header">
                  <h4 className="admin-table-title">Top Performing Sellers</h4>
                  <p className="admin-table-description">Sellers ranked by revenue and performance</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {seller_revenue.top_sellers?.map((seller, index) => (
                      <div key={seller.seller_id} className="admin-table-stat border border-gray-200 rounded-lg p-4">
                        <div className="w-8 h-8 bg-[#a4785a] text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="admin-table-stat-label">{seller.seller?.businessName || 'Unknown Seller'}</div>
                          <div className="admin-table-stat-value">₱{seller.total_revenue?.toLocaleString() || 0}</div>
                          <div className="text-xs text-gray-500">{seller.total_orders} orders • {seller.products_sold} products sold</div>
                        </div>
                        <div className="text-right">
                          <div className="admin-table-stat-icon">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Highest Sales Sellers Chart */}
              <div className="admin-table-container">
                <div className="admin-table-header">
                  <h4 className="admin-table-title">Highest Sales Sellers</h4>
                  <p className="admin-table-description">Top performing sellers by revenue and growth</p>
                </div>
                <div className="p-6">
                  {microAnalyticsLoading ? (
                    <div className="admin-table-loading">
                      <div className="admin-table-loading-spinner"></div>
                      <span>Loading highest sales sellers...</span>
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
            </div>
          </div>

              {/* Enhanced Seller Metrics */}
              <div className="admin-table-container">
                <div className="admin-table-header">
                  <h4 className="admin-table-title">Seller Performance Metrics</h4>
                  <p className="admin-table-description">Key seller performance indicators and statistics</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="admin-table-stat">
                      <Users className="admin-table-stat-icon text-blue-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-value">{seller_revenue.total_sellers || 0}</div>
                        <div className="admin-table-stat-label">Total Sellers</div>
                        <div className="text-xs text-gray-500">Registered sellers</div>
                      </div>
                    </div>
                    <div className="admin-table-stat">
                      <CheckCircle className="admin-table-stat-icon text-green-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-value">{seller_revenue.active_sellers || 0}</div>
                        <div className="admin-table-stat-label">Active Sellers</div>
                        <div className="text-xs text-gray-500">Currently selling</div>
                      </div>
                    </div>
                    <div className="admin-table-stat">
                      <TrendingUp className="admin-table-stat-icon text-purple-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-value">₱{seller_revenue.average_revenue_per_seller?.toLocaleString() || 0}</div>
                        <div className="admin-table-stat-label">Avg Revenue/Seller</div>
                        <div className="text-xs text-gray-500">Average earnings</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Enhanced Moderation Tab */}
        <TabsContent value="moderation" className="space-y-4">
          <div className="admin-table-container">
            <div className="admin-table-header">
              <h3 className="admin-table-title">Moderation Analytics</h3>
              <p className="admin-table-description">
                Content moderation statistics, approval rates, and moderation performance metrics
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="admin-table-container">
                  <div className="admin-table-header">
                    <h4 className="admin-table-title">Product Moderation</h4>
                    <p className="admin-table-description">Product approval statistics and workflow</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="admin-table-stat">
                      <AlertTriangle className="admin-table-stat-icon text-yellow-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-label">Pending Approval</div>
                        <div className="admin-table-stat-value">{moderation.statistics?.products?.pending || 0}</div>
                        <div className="text-xs text-gray-500">Awaiting review</div>
                      </div>
                    </div>
                    <div className="admin-table-stat">
                      <CheckCircle className="admin-table-stat-icon text-green-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-label">Approved</div>
                        <div className="admin-table-stat-value">{moderation.statistics?.products?.approved || 0}</div>
                        <div className="text-xs text-gray-500">Successfully approved</div>
                      </div>
                    </div>
                    <div className="admin-table-stat">
                      <XCircle className="admin-table-stat-icon text-red-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-label">Rejected</div>
                        <div className="admin-table-stat-value">{moderation.statistics?.products?.rejected || 0}</div>
                        <div className="text-xs text-gray-500">Failed approval</div>
                      </div>
                    </div>
                    <div className="admin-table-stat border-t pt-4">
                      <TrendingUp className="admin-table-stat-icon text-blue-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-label text-blue-700">Approval Rate</div>
                        <div className="admin-table-stat-value text-blue-600">{moderation.statistics?.products?.approval_rate ? parseFloat(moderation.statistics.products.approval_rate).toFixed(1) : '0.0'}%</div>
                        <div className="text-xs text-gray-500">Overall success rate</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-table-container">
                  <div className="admin-table-header">
                    <h4 className="admin-table-title">Review Moderation</h4>
                    <p className="admin-table-description">Review moderation statistics and content filtering</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="admin-table-stat">
                      <AlertTriangle className="admin-table-stat-icon text-red-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-label">Flagged Reviews</div>
                        <div className="admin-table-stat-value">{moderation.statistics?.reviews?.flagged || 0}</div>
                        <div className="text-xs text-gray-500">Require attention</div>
                      </div>
                    </div>
                    <div className="admin-table-stat">
                      <CheckCircle className="admin-table-stat-icon text-green-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-label">Approved Reviews</div>
                        <div className="admin-table-stat-value">{moderation.statistics?.reviews?.approved || 0}</div>
                        <div className="text-xs text-gray-500">Passed moderation</div>
                      </div>
                    </div>
                    <div className="admin-table-stat">
                      <XCircle className="admin-table-stat-icon text-red-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-label">Removed Reviews</div>
                        <div className="admin-table-stat-value">{moderation.statistics?.reviews?.removed || 0}</div>
                        <div className="text-xs text-gray-500">Removed from platform</div>
                      </div>
                    </div>
                    <div className="admin-table-stat border-t pt-4">
                      <TrendingUp className="admin-table-stat-icon text-blue-600" />
                      <div className="flex-1">
                        <div className="admin-table-stat-label text-blue-700">Approval Rate</div>
                        <div className="admin-table-stat-value text-blue-600">{moderation.statistics?.reviews?.approval_rate ? parseFloat(moderation.statistics.reviews.approval_rate).toFixed(1) : '0.0'}%</div>
                        <div className="text-xs text-gray-500">Review success rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Moderation Trends Over Time */}
          <div className="admin-table-container">
            <div className="admin-table-header">
              <h4 className="admin-table-title">Moderation Trends Over Time</h4>
              <p className="admin-table-description">Moderation activity and approval rates by period ({selectedPeriod})</p>
            </div>
            <div className="p-6">
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
                  <Line type="monotone" dataKey="approval_rate" stroke="#a4785a" strokeWidth={2} name="Approval Rate" />
                  <Line type="monotone" dataKey="total_products_submitted" stroke="#3B82F6" strokeWidth={2} name="Products Submitted" />
                  <Line type="monotone" dataKey="products_approved" stroke="#10B981" strokeWidth={2} name="Products Approved" />
                  <Line type="monotone" dataKey="products_rejected" stroke="#EF4444" strokeWidth={2} name="Products Rejected" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Enhanced Moderation Performance Metrics */}
          <div className="admin-table-container">
            <div className="admin-table-header">
              <h4 className="admin-table-title">Moderation Performance Metrics</h4>
              <p className="admin-table-description">Key performance indicators for content moderation efficiency</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="admin-table-stat">
                  <Activity className="admin-table-stat-icon text-blue-600" />
                  <div className="flex-1">
                    <div className="admin-table-stat-value">{moderation.total_submissions || 0}</div>
                    <div className="admin-table-stat-label">Total Submissions</div>
                    <div className="text-xs text-gray-500">All content submitted</div>
                  </div>
                </div>
                <div className="admin-table-stat">
                  <TrendingUp className="admin-table-stat-icon text-green-600" />
                  <div className="flex-1">
                    <div className="admin-table-stat-value">{moderation.approval_rate ? parseFloat(moderation.approval_rate).toFixed(1) : '0.0'}%</div>
                    <div className="admin-table-stat-label">Overall Approval Rate</div>
                    <div className="text-xs text-gray-500">Success rate</div>
                  </div>
                </div>
                <div className="admin-table-stat">
                  <Clock className="admin-table-stat-icon text-yellow-600" />
                  <div className="flex-1">
                    <div className="admin-table-stat-value">{moderation.average_processing_time || 0}h</div>
                    <div className="admin-table-stat-label">Avg Processing Time</div>
                    <div className="text-xs text-gray-500">Review duration</div>
                  </div>
                </div>
                <div className="admin-table-stat">
                  <AlertTriangle className="admin-table-stat-icon text-red-600" />
                  <div className="flex-1">
                    <div className="admin-table-stat-value">{moderation.flagged_content || 0}</div>
                    <div className="admin-table-stat-label">Flagged Content</div>
                    <div className="text-xs text-gray-500">Requires attention</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

