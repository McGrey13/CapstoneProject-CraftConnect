/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Search, Filter, Plus, RefreshCw, Edit, Trash2, Image as ImageIcon, ShoppingBag, Share2, MoreHorizontal, Package, Truck, RotateCcw, CheckCircle, XCircle, Clock, Calendar, Star } from "lucide-react";
import { AddProductModal } from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import { useOrdersData } from "../../hooks/useOrdersData";
import LoadingSpinner from "../ui/LoadingSpinner";
import api from "../../api";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import ShippingSimulation from "./ShippingSimulation";

const ShippingTab = () => {
  return <ShippingSimulation />;
};

const ReturnRefundRequestsTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [responseStatus, setResponseStatus] = useState("approved");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/after-sale/seller/requests');
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching after-sale requests:', error);
      setError('Failed to load return/refund requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Disable auto-refresh to prevent video playback interruptions
    // Users can manually refresh by closing and reopening the tab or clicking refresh button
    // const interval = setInterval(fetchRequests, 10000);
    // return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRequestTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "return": return "bg-orange-100 text-orange-800";
      case "refund": return "bg-purple-100 text-purple-800";
      case "exchange": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return <Clock className="h-3 w-3" />;
      case "approved": return <CheckCircle className="h-3 w-3" />;
      case "rejected": return <XCircle className="h-3 w-3" />;
      case "processing": return <RefreshCw className="h-3 w-3" />;
      default: return <Package className="h-3 w-3" />;
    }
  };

  const statusOptions = [
    { value: "all", label: "All Requests" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" }
  ];

  const getDateFilterRange = (filterType) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filterType) {
      case 'today':
        return { start: today, end: now };
      case 'thisWeek':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { start: weekStart, end: now };
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: monthStart, end: now };
      case 'lastMonth':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        return { start: lastMonthStart, end: lastMonthEnd };
      case 'custom':
        if (startDate && endDate) {
          return { 
            start: new Date(startDate + 'T00:00:00'), 
            end: new Date(endDate + 'T23:59:59') 
          };
        }
        return null;
      default:
        return null;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.request_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.order?.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer?.user?.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status?.toLowerCase() === statusFilter.toLowerCase();
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const range = getDateFilterRange(dateFilter);
      if (range) {
        const requestDate = new Date(request.created_at);
        matchesDate = requestDate >= range.start && requestDate <= range.end;
      } else if (dateFilter === "custom") {
        matchesDate = true; // Custom date will be handled separately below
      }
    }
    
    // Handle custom date range
    if (dateFilter === "custom" && startDate && endDate) {
      const requestDate = new Date(request.created_at);
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59');
      matchesDate = requestDate >= start && requestDate <= end;
    } else if (dateFilter === "custom" && (!startDate || !endDate)) {
      matchesDate = true; // Show all if custom date range is incomplete
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleRespond = (request) => {
    setSelectedRequest(request);
    setResponseText("");
    setResponseStatus("approved");
    setIsResponseModalOpen(true);
  };

  const submitResponse = async () => {
    if (!selectedRequest || !responseText.trim() || responseText.trim().length < 10) {
      alert('Please provide a response with at least 10 characters');
      return;
    }

    try {
      // Use id (database primary key) for the API endpoint
      const requestId = selectedRequest.id || selectedRequest.request_id;
      if (!requestId) {
        alert('Error: Request ID not found');
        return;
      }
      const response = await api.post(`/after-sale/seller/requests/${requestId}/respond`, {
        response: responseText,
        status: responseStatus
      });

      if (response.data.success) {
        alert(`Request ${responseStatus} successfully!`);
        setIsResponseModalOpen(false);
        setSelectedRequest(null);
        setResponseText("");
        fetchRequests();
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      alert(error.response?.data?.error || 'Failed to submit response');
    }
  };

  if (loading) {
    return (
      <div className="w-full pt-4">
        <LoadingSpinner message="Loading return/refund requests..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full pt-4">
        <ErrorState message={error} onRetry={fetchRequests} />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-2">
        <div className="relative w-full">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#a4785a]" />
          <Input 
            placeholder="Search requests..." 
            className="pl-7 pr-2 py-1.5 text-xs border border-[#d5bfae] rounded focus:border-[#a4785a] focus:ring-1 focus:ring-[#a4785a]/20 transition-all h-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 relative">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="h-7 border border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200 text-[10px] px-2"
          >
            <Filter className="mr-1 h-3 w-3" />Filter
            {(statusFilter !== "all" || dateFilter !== "all") && (
              <Badge className="ml-1 bg-[#a4785a] text-white text-[10px] px-1">
                {(statusFilter !== "all" ? 1 : 0) + (dateFilter !== "all" ? 1 : 0)}
              </Badge>
            )}
          </Button>
          {isFilterOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#d5bfae] rounded shadow-lg z-10 p-3 space-y-3 min-w-[280px]">
              {/* Status Filter */}
              <div>
                <div className="text-[10px] font-semibold text-[#5c3d28] mb-2 flex items-center gap-1">
                  <Package className="h-3 w-3" /> Filter by Status
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-[#d5bfae] rounded text-[10px] focus:border-[#a4785a] focus:ring-1 focus:ring-[#a4785a]/20"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <div className="text-[10px] font-semibold text-[#5c3d28] mb-2 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Filter by Date/Time
                </div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full p-2 border border-[#d5bfae] rounded text-[10px] focus:border-[#a4785a] focus:ring-1 focus:ring-[#a4785a]/20 mb-2"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="custom">Custom Date Range</option>
                </select>

                {/* Custom Date Range */}
                {dateFilter === "custom" && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[9px] text-gray-600 block mb-1">Start Date</label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-1.5 border border-[#d5bfae] rounded text-[10px] focus:border-[#a4785a] focus:ring-1 focus:ring-[#a4785a]/20"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-600 block mb-1">End Date</label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-1.5 border border-[#d5bfae] rounded text-[10px] focus:border-[#a4785a] focus:ring-1 focus:ring-[#a4785a]/20"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Filters Button */}
              {(statusFilter !== "all" || dateFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setDateFilter("all");
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="w-full h-7 border border-red-300 text-red-600 hover:bg-red-50 text-[10px]"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <Card className="border-[#e5ded7] shadow overflow-visible">
        <CardHeader className="pb-2 border-b border-[#e5ded7] bg-[#faf9f8] px-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#5c3d28] text-sm">Return/Refund Requests</CardTitle>
              <CardDescription className="text-[#7b5a3b] text-[10px]">Manage customer return and refund requests</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRequests}
              className="h-7 border border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200 text-[10px] px-2"
              title="Refresh requests"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2 px-2 overflow-visible">
          <div className="overflow-x-auto -mx-2 overflow-y-visible">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] px-2 py-2">Request ID</TableHead>
                  <TableHead className="text-[10px] px-2 py-2">Order #</TableHead>
                  <TableHead className="text-[10px] px-2 py-2">Customer</TableHead>
                  <TableHead className="text-[10px] px-2 py-2">Type</TableHead>
                  <TableHead className="text-[10px] px-2 py-2">Status</TableHead>
                  <TableHead className="w-8 px-1 py-2"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      <EmptyState
                        icon="📦"
                        title="No Requests"
                        description={searchTerm ? "No matching requests" : "No return/refund requests yet"}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request, index) => (
                    <TableRow key={request.request_id || request.id || `request-${index}`}>
                      <TableCell className="font-medium text-[10px] px-2 py-2">{request.request_id || 'N/A'}</TableCell>
                      <TableCell className="text-[10px] px-2 py-2">{request.order?.order_number || 'N/A'}</TableCell>
                      <TableCell className="text-[10px] px-2 py-2 truncate max-w-[80px]">
                        {request.customer?.user?.userName || 'Unknown'}
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <Badge className={`${getRequestTypeColor(request.request_type)} text-[10px]`} variant="outline">
                          {request.request_type ? request.request_type.charAt(0).toUpperCase() + request.request_type.slice(1) : 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <Badge className={`${getStatusColor(request.status)} text-[10px] flex items-center gap-1 w-fit`} variant="outline">
                          {getStatusIcon(request.status)}
                          {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <div className="hidden sm:flex items-center gap-2">
                          <button
                            onClick={() => handleViewRequest(request)}
                            className="px-3 py-1 text-[10px] bg-white border border-[#a4785a] text-[#a4785a] rounded hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                          >
                            View
                          </button>
                          {request.status === 'pending' && (
                            <button
                              onClick={() => handleRespond(request)}
                              className="px-3 py-1 text-[10px] bg-white border border-green-600 text-green-600 rounded hover:!bg-green-600 hover:!text-white cursor-pointer transition-all duration-200"
                            >
                              Respond
                            </button>
                          )}
                        </div>
                        <div className="sm:hidden flex items-center justify-end">
                          <button
                            onClick={() => handleViewRequest(request)}
                            className="p-2 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Request Modal */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky top-0 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl z-10">
              <div className="flex items-center justify-between pr-0">
                <h2 className="text-lg sm:text-2xl font-bold text-white">Request Details</h2>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-white hover:bg-white/30 bg-white/10 border-2 border-white/30 rounded-full p-2 transition-all text-2xl sm:text-3xl font-bold flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 shrink-0 shadow-lg hover:shadow-xl hover:scale-110"
                  aria-label="Close"
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Request ID</p>
                  <p className="text-base sm:text-lg font-semibold text-[#5c3d28]">{selectedRequest.request_id || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Order Number</p>
                  <p className="text-base sm:text-lg font-semibold text-[#5c3d28]">{selectedRequest.order?.order_number || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Request Type</p>
                  <Badge className={`${getRequestTypeColor(selectedRequest.request_type)} text-xs`}>
                    {selectedRequest.request_type ? selectedRequest.request_type.charAt(0).toUpperCase() + selectedRequest.request_type.slice(1) : 'N/A'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Status</p>
                  <Badge className={`${getStatusColor(selectedRequest.status)} text-xs flex items-center gap-1 w-fit`}>
                    {getStatusIcon(selectedRequest.status)}
                    {selectedRequest.status ? selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1) : 'N/A'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Customer</p>
                  <p className="text-base sm:text-lg font-semibold text-[#5c3d28]">
                    {selectedRequest.customer?.user?.userName || 'Unknown'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Date</p>
                  <p className="text-base sm:text-lg font-semibold text-[#5c3d28]">
                    {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedRequest.description && (
                <div className="border-t border-[#e5ded7] pt-3 sm:pt-4">
                  <h3 className="text-base sm:text-lg font-semibold text-[#5c3d28] mb-2 sm:mb-3">Description</h3>
                  <div className="bg-[#faf9f8] rounded-lg border border-[#e5ded7] p-3 sm:p-4">
                    <p className="text-[#5c3d28] whitespace-pre-wrap text-xs sm:text-sm">{selectedRequest.description}</p>
                  </div>
                </div>
              )}

              {/* Reason */}
              {selectedRequest.reason && (
                <div className="border-t border-[#e5ded7] pt-3 sm:pt-4">
                  <h3 className="text-base sm:text-lg font-semibold text-[#5c3d28] mb-2 sm:mb-3">Reason</h3>
                  <p className="text-sm text-[#5c3d28]">{selectedRequest.reason}</p>
                </div>
              )}

              {/* Unboxing Video */}
              {selectedRequest.video_path && (
                <div className="border-t border-[#e5ded7] pt-3 sm:pt-4">
                  <h3 className="text-base sm:text-lg font-semibold text-[#5c3d28] mb-2 sm:mb-3">Unboxing Video</h3>
                  <div className="bg-[#faf9f8] rounded-lg border border-[#e5ded7] p-3 sm:p-4">
                    <video
                      controls
                      className="w-full max-h-96 rounded-lg"
                      src={
                        selectedRequest.video_path.includes('/storage/')
                          ? selectedRequest.video_path.replace('/storage/', '/images/')
                          : selectedRequest.video_path.startsWith('http')
                          ? selectedRequest.video_path
                          : `/images/${selectedRequest.video_path.replace(/^\/+/, '')}`
                      }
                      onError={(e) => {
                        console.error('Video failed to load:', selectedRequest.video_path);
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'block';
                        }
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="hidden text-center py-4 text-gray-500">
                      <p className="text-sm">Video could not be loaded</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Images */}
              {selectedRequest.images && Array.isArray(selectedRequest.images) && selectedRequest.images.length > 0 && (
                <div className="border-t border-[#e5ded7] pt-3 sm:pt-4">
                  <h3 className="text-base sm:text-lg font-semibold text-[#5c3d28] mb-2 sm:mb-3">
                    Product Images ({selectedRequest.images.length})
                  </h3>
                  <div className="bg-[#faf9f8] rounded-lg border border-[#e5ded7] p-3 sm:p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {selectedRequest.images.map((imagePath, index) => {
                        const imageUrl = imagePath.includes('/storage/')
                          ? imagePath.replace('/storage/', '/images/')
                          : imagePath.startsWith('http')
                          ? imagePath
                          : `/images/${imagePath.replace(/^\/+/, '')}`;
                        
                        return (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Product image ${index + 1}`}
                              className="w-full h-32 sm:h-40 object-cover rounded-lg border border-[#e5ded7] cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => {
                                // Open image in full screen or new window
                                window.open(imageUrl, '_blank');
                              }}
                              onError={(e) => {
                                console.error('Image failed to load:', imageUrl);
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                            <div className="hidden absolute inset-0 bg-gray-200 rounded-lg items-center justify-center">
                              <div className="text-center">
                                <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Image not available</p>
                              </div>
                            </div>
                            {/* Image number badge */}
                            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Seller Response */}
              {selectedRequest.seller_response && (
                <div className="border-t border-[#e5ded7] pt-3 sm:pt-4">
                  <h3 className="text-base sm:text-lg font-semibold text-[#5c3d28] mb-2 sm:mb-3">Your Response</h3>
                  <div className="bg-green-50 rounded-lg border border-green-200 p-3 sm:p-4">
                    <p className="text-sm text-green-800">{selectedRequest.seller_response}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#e5ded7]">
                <Button 
                  onClick={() => setIsViewModalOpen(false)}
                  variant="outline"
                  className="w-full sm:flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm"
                >
                  Close
                </Button>
                {selectedRequest.status === 'pending' && (
                  <Button 
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleRespond(selectedRequest);
                    }}
                    className="w-full sm:flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 text-sm"
                  >
                    Respond to Request
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {isResponseModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl">
              <h2 className="text-lg sm:text-2xl font-bold text-white">Respond to Request</h2>
            </div>
            
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="bg-[#f8f1ec] border-2 border-[#e5ded7] rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Request ID</p>
                <p className="text-base sm:text-lg font-bold text-[#5c3d28]">{selectedRequest.request_id || 'N/A'}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Status</label>
                <select
                  value={responseStatus}
                  onChange={(e) => setResponseStatus(e.target.value)}
                  className="w-full p-2 border-2 border-[#d5bfae] rounded-md text-sm"
                >
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="processing">Processing</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Response (min 10 characters)</label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  className="w-full p-2 border-2 border-[#d5bfae] rounded-md text-sm focus:border-[#a4785a] focus:ring-1 focus:ring-[#a4785a]/20"
                  placeholder="Enter your response to the customer..."
                />
                <p className="text-xs text-gray-500">Character count: {responseText.length} / 10 minimum</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#e5ded7]">
                <Button 
                  onClick={() => {
                    setIsResponseModalOpen(false);
                    setSelectedRequest(null);
                    setResponseText("");
                  }}
                  variant="outline"
                  className="w-full sm:flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitResponse}
                  disabled={responseText.trim().length < 10}
                  className="w-full sm:flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 text-sm disabled:opacity-50"
                >
                  Submit Response
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrdersTab = () => {
  const { ordersData, loading, error, refetch } = useOrdersData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusChangeOpen, setIsStatusChangeOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);

  // Auto-refresh disabled to prevent video playback interruptions
  // Users can manually refresh by closing/reopening tabs or using refresh button
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // Silent refresh - call refetch from the hook
  //     refetch();
  //   }, 10000); // Refresh every 10 seconds
  //
  //   return () => clearInterval(interval);
  // }, [refetch]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "shipped": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "packing": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "packing", label: "Packing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ];

  // Filter orders based on search term and status
  const getDateFilterRange = (filterType) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filterType) {
      case 'today':
        return { start: today, end: now };
      case 'thisWeek':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { start: weekStart, end: now };
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: monthStart, end: now };
      case 'lastMonth':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        return { start: lastMonthStart, end: lastMonthEnd };
      case 'custom':
        if (startDate && endDate) {
          return { 
            start: new Date(startDate + 'T00:00:00'), 
            end: new Date(endDate + 'T23:59:59') 
          };
        }
        return null;
      default:
        return null;
    }
  };

  const filteredOrders = ordersData ? ordersData.filter(order => {
    const matchesSearch = order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status?.toLowerCase() === statusFilter.toLowerCase();
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const range = getDateFilterRange(dateFilter);
      if (range) {
        // Try to parse order date - it might be in different formats
        const orderDate = order.date ? new Date(order.date) : (order.created_at ? new Date(order.created_at) : null);
        if (orderDate && !isNaN(orderDate)) {
          matchesDate = orderDate >= range.start && orderDate <= range.end;
        } else {
          matchesDate = true; // If date parsing fails, show the order
        }
      } else if (dateFilter === "custom") {
        matchesDate = true; // Custom date will be handled separately below
      }
    }
    
    // Handle custom date range
    if (dateFilter === "custom" && startDate && endDate) {
      const orderDate = order.date ? new Date(order.date) : (order.created_at ? new Date(order.created_at) : null);
      if (orderDate && !isNaN(orderDate)) {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        matchesDate = orderDate >= start && orderDate <= end;
      } else {
        matchesDate = true; // If date parsing fails, show the order
      }
    } else if (dateFilter === "custom" && (!startDate || !endDate)) {
      matchesDate = true; // Show all if custom date range is incomplete
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  }) : [];

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleStatusChange = (order) => {
    setOrderToUpdate(order);
    setIsStatusChangeOpen(true);
  };


  const updateOrderStatus = async (newStatus) => {
    try {
      console.log('Full order object:', orderToUpdate);
      console.log(`Updating order ${orderToUpdate.id} to ${newStatus}`);
      
      // The backend updateStatus method expects the database ID, not the order_number
      // We need to use orderToUpdate.orderID (which is the database ID)
      let orderId = orderToUpdate.orderID;
      
      if (!orderId) {
        console.error('Could not find order ID from:', orderToUpdate);
        alert('Error: Could not find order ID');
        return;
      }
      
      console.log('Using database order ID:', orderId);
      console.log('API endpoint:', `/orders/${orderId}/status`);
      
      // Use the correct API endpoint: PUT /orders/{orderId}/status
      const response = await api.put(`/orders/${orderId}/status`, {
        status: newStatus
      });
      
      console.log('Order status update response:', response.data);
      
      if (response.data.success || response.data.order) {
        alert(`Order status updated to ${newStatus} successfully!`);
        setIsStatusChangeOpen(false);
        setOrderToUpdate(null);
        refetch();
      } else {
        alert('Failed to update order status. Please try again.');
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      console.error("Error response:", error.response?.data);
      alert(error.response?.data?.message || error.response?.data?.error || "Error updating order status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="w-full pt-4">
        <LoadingSpinner message="Loading orders..." />
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
    <div className="space-y-4 md:space-y-6">
      {/* Search and Filters - Mobile First */}
      <div className="flex flex-col gap-2">
        <div className="relative w-full">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#a4785a]" />
          <Input 
            placeholder="Search orders..." 
            className="pl-7 pr-2 py-1.5 text-xs border border-[#d5bfae] rounded focus:border-[#a4785a] focus:ring-1 focus:ring-[#a4785a]/20 transition-all h-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 relative">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="h-7 border border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200 text-[10px] px-2"
          >
            <Filter className="mr-1 h-3 w-3" />Filter
            {(statusFilter !== "all" || dateFilter !== "all") && (
              <Badge className="ml-1 bg-[#a4785a] text-white text-[10px] px-1">
                {(statusFilter !== "all" ? 1 : 0) + (dateFilter !== "all" ? 1 : 0)}
              </Badge>
            )}
          </Button>
          {isFilterOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#d5bfae] rounded shadow-lg z-10 p-3 space-y-3 min-w-[280px]">
              {/* Status Filter */}
              <div>
                <div className="text-[10px] font-semibold text-[#5c3d28] mb-2 flex items-center gap-1">
                  <Package className="h-3 w-3" /> Filter by Status
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-[#d5bfae] rounded text-[10px] focus:border-[#a4785a] focus:ring-1 focus:ring-[#a4785a]/20"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <div className="text-[10px] font-semibold text-[#5c3d28] mb-2 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Filter by Date/Time
                </div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full p-2 border border-[#d5bfae] rounded text-[10px] focus:border-[#a4785a] focus:ring-1 focus:ring-[#a4785a]/20 mb-2"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="custom">Custom Date Range</option>
                </select>

                {/* Custom Date Range */}
                {dateFilter === "custom" && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[9px] text-gray-600 block mb-1">Start Date</label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-1.5 border border-[#d5bfae] rounded text-[10px] focus:border-[#a4785a] focus:ring-1 focus:ring-[#a4785a]/20"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-600 block mb-1">End Date</label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-1.5 border border-[#d5bfae] rounded text-[10px] focus:border-[#a4785a] focus:ring-1 focus:ring-[#a4785a]/20"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Filters Button */}
              {(statusFilter !== "all" || dateFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setDateFilter("all");
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="w-full h-7 border border-red-300 text-red-600 hover:bg-red-50 text-[10px]"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

        <Card className="border-[#e5ded7] shadow overflow-visible">
          <CardHeader className="pb-2 border-b border-[#e5ded7] bg-[#faf9f8] px-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#5c3d28] text-sm">Recent Orders</CardTitle>
                <CardDescription className="text-[#7b5a3b] text-[10px]">Manage your customer orders and track their status</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                className="h-7 border border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200 text-[10px] px-2"
                title="Refresh orders"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2 px-2 overflow-visible">
            <div className="overflow-x-auto -mx-2 overflow-y-visible">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] px-2 py-2">ID</TableHead>
                <TableHead className="text-[10px] px-2 py-2">Customer</TableHead>
                <TableHead className="text-[10px] px-2 py-2">Total</TableHead>
                <TableHead className="text-[10px] px-2 py-2">Status</TableHead>
                <TableHead className="w-8 px-1 py-2"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    <EmptyState
                      icon="📦"
                      title="No Orders"
                      description={searchTerm ? "No matching orders" : "No orders yet"}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order, index) => (
                  <TableRow key={order.id || `order-${index}`}>
                    <TableCell className="font-medium text-[10px] px-2 py-2">{order.id}</TableCell>
                    <TableCell className="text-[10px] px-2 py-2 truncate max-w-[80px]">{order.customer}</TableCell>
                    <TableCell className="text-[10px] px-2 py-2 font-semibold">{order.total}</TableCell>
                    <TableCell className="px-2 py-2">
                      <Badge className={`${getStatusColor(order.status)} text-[10px]`} variant="outline">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      {/* Desktop: Show all actions directly */}
                      <div className="hidden sm:flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('View button clicked for order:', order.id);
                            handleViewOrder(order);
                          }}
                          className="px-3 py-1 text-[10px] bg-white border border-[#a4785a] text-[#a4785a] rounded hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                          style={{ backgroundColor: 'white', color: '#a4785a' }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#a4785a';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#a4785a';
                          }}
                        >
                          View Details
                        </button>
                        {(order.status?.toLowerCase() === "pending" || order.status?.toLowerCase() === "processing") && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Pack button clicked for order:', order.id);
                              handleStatusChange(order);
                            }}
                            className="px-3 py-1 text-[10px] bg-white border border-[#a4785a] text-[#a4785a] rounded hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                            style={{ backgroundColor: 'white', color: '#a4785a' }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#a4785a';
                              e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                              e.target.style.color = '#a4785a';
                            }}
                          >
                            Pack
                          </button>
                        )}
                      </div>
                      
                      {/* Mobile: Show dropdown */}
                      <div className="sm:hidden flex items-center justify-end">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const orderKey = order.id || `order-${index}`;
                            console.log('Mobile menu clicked for order:', orderKey);
                            setOpenActionMenu(openActionMenu === orderKey ? null : orderKey);
                          }}
                          className="p-2 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                      
                      {/* Dropdown positioned relative to TableCell */}
                      {openActionMenu === (order.id || `order-${index}`) && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenActionMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[120px] py-1">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('View clicked in dropdown for order:', order.id);
                                handleViewOrder(order);
                                setOpenActionMenu(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-[10px] bg-white text-[#a4785a] hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                              style={{ backgroundColor: 'white', color: '#a4785a' }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#a4785a';
                                e.target.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = '#a4785a';
                              }}
                            >
                              View Details
                            </button>
                            {(order.status?.toLowerCase() === "pending" || order.status?.toLowerCase() === "processing") && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Pack clicked in dropdown for order:', order.id);
                                  handleStatusChange(order);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] bg-white text-[#a4785a] hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                                style={{ backgroundColor: 'white', color: '#a4785a' }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#a4785a';
                                  e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'white';
                                  e.target.style.color = '#a4785a';
                                }}
                              >
                                Pack Order
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Order Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky top-0 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl z-10">
              <div className="flex items-center justify-between pr-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Order Details</h2>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-black bg-white/90 rounded-full p-2 text-2xl sm:text-3xl md:text-4xl font-bold flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 shrink-0 shadow-lg"
                  aria-label="Close"
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8">
              {/* Order Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                <div className="space-y-2">
                  <p className="text-sm sm:text-base md:text-lg text-gray-500 font-medium">Order ID</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-[#5c3d28]">{selectedOrder.id}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm sm:text-base md:text-lg text-gray-500 font-medium">Status</p>
                  <Badge className={`${getStatusColor(selectedOrder.status)} text-sm sm:text-base md:text-lg px-3 py-1`}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm sm:text-base md:text-lg text-gray-500 font-medium">Customer</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-[#5c3d28]">{selectedOrder.customer}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm sm:text-base md:text-lg text-gray-500 font-medium">Date</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-[#5c3d28]">{selectedOrder.date}</p>
                </div>
              </div>

              {/* Products List */}
              <div className="border-t border-[#e5ded7] pt-4 sm:pt-6 md:pt-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#5c3d28] mb-3 sm:mb-4 md:mb-6">Order Items</h3>
                <div className="bg-[#faf9f8] rounded-lg border border-[#e5ded7] overflow-hidden">
                  <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-[#f8f1ec] to-[#faf9f8] hover:bg-gradient-to-r">
                        <TableHead className="font-semibold text-base sm:text-lg md:text-xl py-4 sm:py-5 md:py-6">Product</TableHead>
                        <TableHead className="font-semibold text-base sm:text-lg md:text-xl py-4 sm:py-5 md:py-6">SKU</TableHead>
                        <TableHead className="font-semibold text-center text-base sm:text-lg md:text-xl py-4 sm:py-5 md:py-6">Qty</TableHead>
                        <TableHead className="font-semibold text-right text-base sm:text-lg md:text-xl py-4 sm:py-5 md:py-6">Price</TableHead>
                        <TableHead className="font-semibold text-right text-base sm:text-lg md:text-xl py-4 sm:py-5 md:py-6">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.products && selectedOrder.products.length > 0 ? (
                        selectedOrder.products.map((product, index) => (
                          <TableRow key={index} className="hover:bg-white/50">
                            <TableCell className="py-4 sm:py-5 md:py-6">
                              <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                                {product.product_image ? (
                                  <img 
                                    src={product.product_image.includes('/storage/') 
                                      ? product.product_image.replace('/storage/', '/images/')
                                      : product.product_image.startsWith('http')
                                      ? product.product_image
                                      : `/images/${product.product_image.replace(/^\/+/, '')}`
                                    } 
                                    alt={product.product_name}
                                    className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded object-cover border border-[#e5ded7]"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) {
                                        e.target.nextSibling.style.display = 'flex';
                                      }
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className={`h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded flex items-center justify-center bg-gray-200 border border-[#e5ded7] ${product.product_image ? 'hidden' : ''}`}
                                >
                                  <ImageIcon className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-gray-400" />
                                </div>
                                <span className="font-medium text-[#5c3d28] text-base sm:text-lg md:text-xl">{product.product_name || 'Unknown Product'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 sm:py-5 md:py-6">
                              <code className="text-base sm:text-lg md:text-xl bg-[#e5ded7] px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded text-[#7b5a3b] font-medium">
                                {product.sku || 'N/A'}
                              </code>
                            </TableCell>
                            <TableCell className="text-center font-medium text-base sm:text-lg md:text-xl py-4 sm:py-5 md:py-6">
                              {product.quantity}
                            </TableCell>
                            <TableCell className="text-right text-[#5c3d28] text-base sm:text-lg md:text-xl py-4 sm:py-5 md:py-6 font-medium">
                              ₱{parseFloat(product.price || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-[#5c3d28] text-base sm:text-lg md:text-xl py-4 sm:py-5 md:py-6">
                              ₱{parseFloat(product.total_amount || 0).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 sm:py-10 md:py-12 text-gray-500 text-base sm:text-lg md:text-xl">
                            No product details available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="border-t border-[#e5ded7] pt-4 sm:pt-6 md:pt-8">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <p className="text-sm sm:text-base md:text-lg text-gray-500 font-medium">Total Items</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-[#5c3d28]">{selectedOrder.items}</p>
                </div>
                <div className="flex justify-between items-center bg-gradient-to-r from-[#f8f1ec] to-[#faf9f8] p-3 sm:p-4 md:p-6 rounded-lg">
                  <p className="text-base sm:text-lg md:text-xl font-semibold text-[#5c3d28]">Total Amount</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#a4785a]">{selectedOrder.total}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 pt-4 sm:pt-6 md:pt-8 border-t border-[#e5ded7]">
                <Button 
                  onClick={() => setIsViewModalOpen(false)}
                  variant="outline"
                  className="w-full sm:flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-base sm:text-lg md:text-xl py-3 sm:py-4 md:py-5"
                >
                  Close
                </Button>
                {(selectedOrder.status?.toLowerCase() === "pending" || selectedOrder.status?.toLowerCase() === "processing") && (
                  <Button 
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleStatusChange(selectedOrder);
                    }}
                    className="w-full sm:flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8f674a] hover:to-[#6a4c34] text-base sm:text-lg md:text-xl py-3 sm:py-4 md:py-5"
                  >
                    Mark as Packed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {isStatusChangeOpen && orderToUpdate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl">
              <h2 className="text-lg sm:text-2xl font-bold text-white">Update Order Status</h2>
            </div>
            
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="bg-[#f8f1ec] border-2 border-[#e5ded7] rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Order ID</p>
                <p className="text-base sm:text-lg font-bold text-[#5c3d28]">{orderToUpdate.id}</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">Current Status</p>
                <Badge className={`mt-1 text-xs ${getStatusColor(orderToUpdate.status)}`}>
                  {orderToUpdate.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Change status to:</p>
                <Button
                  onClick={() => updateOrderStatus("packing")}
                  className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8f674a] hover:to-[#6a4c34] justify-start text-sm"
                >
                  📦 Packing
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#e5ded7]">
                <Button 
                  onClick={() => {
                    setIsStatusChangeOpen(false);
                    setOrderToUpdate(null);
                  }}
                  variant="outline"
                  className="w-full sm:flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// InventoryTab moved to InventoryManager.jsx - not used here anymore
const InventoryTab_DEPRECATED = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productName: "",
    productDescription: "",
    productPrice: "",
    productQuantity: "",
    category: "",
    productImage: null,
    productVideo: null,
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isViewProductOpen, setIsViewProductOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [productToShare, setProductToShare] = useState(null);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [quantityChange, setQuantityChange] = useState(0);
  const [variationQuantityDraft, setVariationQuantityDraft] = useState({});

  // Fetch products from backend
  useEffect(() => {
    fetchProducts(true); // Show loading on initial fetch
  }, []);

  // Auto-refresh functionality for inventory (silent background refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts(false); // Silent refresh - no loading state
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      console.log("Fetching products with cookie-based authentication");

      const response = await api.get("/seller/products");

      console.log("Response status:", response.status);

      if (response.data) {
        const result = response.data;
        console.log("API Response:", result);

        // Check if the response has the expected data structure
        const normalizeProductResponse = (product) => {
          if (!product) return product;

          let variations = product.variations;
          if (typeof variations === 'string') {
            try {
              const parsed = JSON.parse(variations);
              if (Array.isArray(parsed)) {
                variations = parsed;
              }
            } catch (error) {
              console.warn('Failed to parse product variations string:', error);
              variations = [];
            }
          }

          const hasVariations =
            (Array.isArray(variations) && variations.length > 0) ||
            product.has_variations === true;

          const normalizedVariations = Array.isArray(variations)
            ? variations
                .filter(Boolean)
                .map((variation) => ({
                  ...variation,
                  label: variation?.label || variation?.size || '',
                  size: variation?.size || variation?.label || '',
                  quantity:
                    variation?.quantity !== undefined && variation?.quantity !== null
                      ? Number(variation.quantity)
                      : 0,
                  price:
                    variation?.price !== undefined && variation?.price !== null
                      ? Number(variation.price)
                      : null,
                }))
            : [];

          const variationQuantityTotal = hasVariations
            ? normalizedVariations.reduce(
                (sum, variation) => sum + (Number.isFinite(variation.quantity) ? variation.quantity : 0),
                0
              )
            : null;

          return {
            ...product,
            variations: normalizedVariations,
            has_variations: hasVariations,
            productQuantity:
              variationQuantityTotal !== null ? variationQuantityTotal : product.productQuantity,
          };
        };

        if (result.status === 'success' && Array.isArray(result.data)) {
          setInventory(result.data.map(normalizeProductResponse));
        } else if (Array.isArray(result)) {
          // Fallback in case the API returns the array directly
          setInventory(result.map(normalizeProductResponse));
        } else {
          console.error('Unexpected response format:', result);
          setInventory([]);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      if (showLoading) {
        setError(`Failed to fetch products: ${error.message}`);
      }
      setInventory([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const fetchDetailedProduct = async (product) => {
    const productId = product?.product_id || product?.id;
    if (!productId) {
      return product;
    }

    try {
      const response = await api.get(`/products/${productId}`);
      const data = response.data;

      if (!data) {
        return product;
      }

      let variations = data.variations ?? [];
      if (typeof variations === 'string') {
        try {
          const parsed = JSON.parse(variations);
          if (Array.isArray(parsed)) {
            variations = parsed;
          }
        } catch (error) {
          console.warn('Failed to parse variation data for product', productId, error);
          variations = [];
        }
      }

      const normalizedVariations = Array.isArray(variations)
        ? variations.filter(Boolean).map((variation) => ({
            variation_id: variation?.variation_id || variation?.id || null,
            size: variation?.size || variation?.label || '',
            label: variation?.label || variation?.size || '',
            quantity: variation?.quantity ?? 0,
            price: variation?.price ?? null,
            sku: variation?.sku || '',
          }))
        : [];

    const hasVariations = normalizedVariations.length > 0 || data.has_variations;
    const variationQuantityTotal = hasVariations
      ? normalizedVariations.reduce(
          (sum, variation) => sum + (Number.isFinite(variation.quantity) ? variation.quantity : 0),
          0
        )
      : null;

    return {
      ...product,
      ...data,
      productImage: data.productImage || product.productImage,
      productImages:
        (Array.isArray(data.productImages) && data.productImages.length > 0
          ? data.productImages
          : product.productImages) || [],
      variations: normalizedVariations,
      has_variations: hasVariations,
      productQuantity:
        variationQuantityTotal !== null ? variationQuantityTotal : data.productQuantity ?? product.productQuantity,
    };
    } catch (error) {
      console.error('Error fetching detailed product information:', error);
      return product;
    }
  };

  const resetForm = () => {
    setNewProduct({
      productName: "",
      productDescription: "",
      productPrice: "",
      productQuantity: "",
      category: "",
      productImage: null,
      productVideo: null,
    });
  };

  const handleAddProduct = async (formData) => {
    try {
      console.log("Adding new product:", Object.fromEntries(formData));

      const response = await api.post("/products", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout for product creation with images
      });

      console.log("Upload response status:", response.status);

      if (response.data) {
        const result = response.data;
        console.log("Product added successfully:", result.message || "Product added successfully");
        alert("Product added successfully!");
        
        setIsAddDialogOpen(false);
        resetForm();
        fetchProducts(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding product:", error);
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        alert('Request timed out. This may happen with large image uploads. Please try again with smaller images or fewer images at once.');
      } else if (error.response?.status === 422) {
        console.error("Validation errors:", error.response.data);
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          const errorMessages = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          alert(`Validation Error:\n\n${errorMessages}`);
        } else {
          alert(error.response?.data?.message || "Product validation failed. Please review the form.");
        }
      } else {
        alert(error.response?.data?.message || "Error adding product. Please try again.");
      }
    }
  };

  const handleUpdateProduct = async (formData, productId) => {
    try {
      // Use the productId parameter or fall back to currentProduct
      const idToUse = productId || currentProduct?.product_id || currentProduct?.id;
      
      if (!idToUse) {
        alert("Product ID not found. Please try again.");
        return;
      }

      // Ensure _method is set to PUT for Laravel
      if (!formData.has('_method')) {
        formData.append('_method', 'PUT');
      }

      console.log("Updating product with ID:", idToUse);
      const response = await api.post(`/products/${idToUse}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout for product updates with images
      });

      if (response.data) {
        const result = response.data;
        console.log("Product updated successfully:", result);
        alert("Product updated successfully!");
        setIsEditDialogOpen(false);
        fetchProducts(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating product:", error);
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        alert('Request timed out. This may happen with large image uploads. Please try again with smaller images or fewer images at once.');
      } else if (error.response?.data?.errors) {
        // Show validation errors
        const errors = error.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        alert(`Validation Error:\n\n${errorMessages}`);
      } else {
        alert(error.response?.data?.message || "Error updating product. Please try again.");
      }
    }
  };


  const handleEditClick = async (product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
    const detailedProduct = await fetchDetailedProduct(product);
    setCurrentProduct(detailedProduct);
  };

  const handleViewProduct = async (product) => {
    setCurrentProduct(product);
    setIsViewProductOpen(true);
    const detailedProduct = await fetchDetailedProduct(product);
    setCurrentProduct(detailedProduct);
  };

  const handleShareProduct = (product) => {
    setProductToShare(product);
    setIsShareModalOpen(true);
  };

  const buildVariationDraft = (product) => {
    if (!product?.variations || product.variations.length === 0) {
      return {};
    }

    const draft = {};
    product.variations.forEach((variation, index) => {
      const key = variation?.variation_id ?? variation?.id ?? `idx-${index}`;
      const qty = Number(variation?.quantity ?? 0);
      draft[key] = Number.isFinite(qty) ? qty : 0;
    });
    return draft;
  };

  const handleQuantityClick = async (product) => {
    setQuantityChange(0);
    setVariationQuantityDraft({});
    setIsQuantityModalOpen(true);

    const detailedProduct = await fetchDetailedProduct(product);
    setCurrentProduct(detailedProduct);

    if (detailedProduct?.has_variations && Array.isArray(detailedProduct.variations)) {
      setVariationQuantityDraft(buildVariationDraft(detailedProduct));
    }
  };

  const getVariationKey = (variation, index) =>
    variation?.variation_id ?? variation?.id ?? `idx-${index}`;

  const setVariationQuantityValue = (key, value) => {
    setVariationQuantityDraft((prev) => {
      const numericValue = Number(value);
      const sanitized = Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0;
      return { ...prev, [key]: sanitized };
    });
  };

  const adjustVariationQuantity = (key, delta) => {
    setVariationQuantityDraft((prev) => {
      const currentValue = Number(prev[key]);
      const base = Number.isFinite(currentValue) ? currentValue : 0;
      const updated = Math.max(0, base + delta);
      return { ...prev, [key]: updated };
    });
  };

  const handleUpdateQuantity = async () => {
    if (!currentProduct) return;
    
    try {
      const formData = new FormData();
      // Send all required fields
      formData.append('productName', currentProduct.productName);
      formData.append('productDescription', currentProduct.productDescription || '');
      formData.append('productPrice', currentProduct.productPrice);
      formData.append('category', currentProduct.category);
      formData.append('status', currentProduct.status || 'in stock');
      formData.append('publish_status', currentProduct.publish_status || 'draft');
      formData.append('_method', 'PUT');

      let finalQuantity = (currentProduct.productQuantity || 0) + quantityChange;

      if (currentProduct.has_variations && Array.isArray(currentProduct.variations) && currentProduct.variations.length > 0) {
        const variationsPayload = currentProduct.variations.map((variation, index) => {
          const key = variation?.variation_id ?? variation?.id ?? `idx-${index}`;
          const draftValue = variationQuantityDraft[key];
          // Ensure quantity is an integer
          const updatedQuantity = Number.isFinite(Number(draftValue))
            ? Math.max(0, Math.floor(Number(draftValue)))
            : Math.max(0, Math.floor(Number(variation?.quantity ?? 0)));

          return {
            variation_id: variation?.variation_id ?? variation?.id ?? null,
            label: variation?.label || variation?.size || '',
            size: variation?.size || variation?.label || '',
            quantity: updatedQuantity,
            price: variation?.price ?? null,
            sku: variation?.sku ?? null,
          };
        });

        finalQuantity = variationsPayload.reduce(
          (sum, variation) => sum + (Number.isFinite(variation.quantity) ? variation.quantity : 0),
          0
        );

        formData.set('productQuantity', finalQuantity);
        formData.set('has_variations', '1');

        variationsPayload.forEach((variation, index) => {
          if (variation.variation_id) {
            formData.append(`variations[${index}][variation_id]`, variation.variation_id);
          }
          formData.append(`variations[${index}][label]`, variation.label || '');
          formData.append(`variations[${index}][size]`, variation.size || '');
          
          // Ensure quantity is an integer
          const quantityInt = parseInt(variation.quantity, 10);
          if (Number.isNaN(quantityInt)) {
            console.error(`Invalid quantity for variation ${index}:`, variation.quantity);
            return; // Skip this variation if quantity is invalid
          }
          formData.append(`variations[${index}][quantity]`, quantityInt.toString());
          
          if (variation.price !== null && variation.price !== undefined && variation.price !== '') {
            // Ensure price is a valid number
            const priceValue = parseFloat(variation.price);
            if (Number.isFinite(priceValue)) {
              formData.append(`variations[${index}][price]`, priceValue.toString());
            }
          }
          if (variation.sku) {
            formData.append(`variations[${index}][sku]`, variation.sku);
          }
        });
      } else {
        if (finalQuantity < 0) {
          alert('Quantity cannot be negative!');
          return;
        }
        formData.append('productQuantity', finalQuantity);
      }

      const idToUse = currentProduct.product_id || currentProduct.id;
      const response = await api.post(`/products/${idToUse}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout for quantity updates (may include variations)
      });

      if (response.data) {
        alert(`Quantity updated successfully! New quantity: ${finalQuantity}`);
        setIsQuantityModalOpen(false);
        setCurrentProduct(null);
        setQuantityChange(0);
        setVariationQuantityDraft({});
        fetchProducts(false); // Silent refresh
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        alert('Request timed out. Please try again.');
      } else if (error.response?.data?.errors) {
        // Show validation errors
        const errors = error.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        alert(`Validation Error:\n\n${errorMessages}`);
      } else {
        alert(error.response?.data?.message || "Error updating quantity. Please try again.");
      }
    }
  };

  const copyProductLink = () => {
    if (productToShare) {
      // Use product_id for the customer-facing product detail page
      const productId = productToShare.product_id || productToShare.id;
      const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
      const productLink = `${baseUrl}/product/${productId}`;
      navigator.clipboard.writeText(productLink).then(() => {
        alert('Product link copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy link. Please try again.');
      });
    }
  };

  const handlePostToSocialMedia = async (platform) => {
    if (!productToShare) {
      console.error('No product to share');
      alert('No product selected to share.');
      return;
    }

    try {
      console.log('Starting post preparation for platform:', platform);
      
      // Prepare post data
      const productId = productToShare.product_id || productToShare.id;
      const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
      const productLink = `${baseUrl}/product/${productId}`;
      const message = `Check out this handcrafted product: ${productToShare.productName}\n\n${productToShare.productDescription || 'Handmade with love and care!'}`;

      // Initialize post data
      const postData = {
        message: message,
        link: productLink,
        platform: platform,
        productName: productToShare.productName,
      };

      // Try to generate preview image, but don't block navigation if it fails
      try {
        console.log('Generating preview canvas...');
        const previewCanvas = await generateProductPreviewCanvas();
        
        if (previewCanvas) {
          console.log('Preview canvas generated, converting to blob...');
          // Convert canvas to blob
          const previewBlob = await new Promise((resolve, reject) => {
            previewCanvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert canvas to blob'));
              }
            }, 'image/png');
          });

          if (previewBlob) {
            console.log('Converting blob to base64...');
            // Store preview image as base64
            postData.imageData = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (reader.result) {
                  resolve(reader.result);
                } else {
                  reject(new Error('Failed to read blob as data URL'));
                }
              };
              reader.onerror = () => reject(new Error('FileReader error'));
              reader.readAsDataURL(previewBlob);
            });
          }
        }
      } catch (imageError) {
        console.warn('Failed to generate preview image, continuing without it:', imageError);
        // Continue without image - user can add one manually
      }

      // Store post data in sessionStorage
      sessionStorage.setItem('pendingPost', JSON.stringify(postData));
      sessionStorage.setItem('autoPost', 'true'); // Flag to auto-post
      
      console.log('Post data stored in sessionStorage, navigating to social media page...');
      
      // Navigate to Social Media page - always navigate regardless of image generation
      const targetUrl = `/seller/social-media?tab=posts&platform=${platform}`;
      console.log('Navigating to:', targetUrl);
      
      // Use window.location.href for reliable navigation
      window.location.href = targetUrl;

    } catch (error) {
      console.error('Error preparing post:', error);
      alert('An error occurred while preparing the post. Navigating to social media page anyway...');
      
      // Still navigate even if there's an error - user can create post manually
      const targetUrl = `/seller/social-media?tab=posts&platform=${platform}`;
      window.location.href = targetUrl;
    }
  };

  const generateProductPreviewCanvas = async () => {
    if (!productToShare) return null;

    try {
      // Fetch seller and store information
      const [sellerResponse, storeResponse] = await Promise.all([
        api.get('/sellers/profile').catch(() => ({ data: null })),
        api.get('/store/me').catch(() => ({ data: null }))
      ]);

      const sellerData = sellerResponse.data;
      const storeData = storeResponse.data;

      // Create a canvas element for the preview
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Add roundRect method to canvas context (not available by default)
      if (!ctx.roundRect) {
        ctx.roundRect = function(x, y, width, height, radius) {
          this.beginPath();
          this.moveTo(x + radius, y);
          this.lineTo(x + width - radius, y);
          this.quadraticCurveTo(x + width, y, x + width, y + radius);
          this.lineTo(x + width, y + height - radius);
          this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          this.lineTo(x + radius, y + height);
          this.quadraticCurveTo(x, y + height, x, y + height - radius);
          this.lineTo(x, y + radius);
          this.quadraticCurveTo(x, y, x + radius, y);
          this.closePath();
        };
      }
      
      // Set canvas size (Instagram post size: 1080x1080)
      canvas.width = 1080;
      canvas.height = 1080;
      
      // Professional background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f8f6f0');
      gradient.addColorStop(0.3, '#e8e2d5');
      gradient.addColorStop(1, '#d4c4a8');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle pattern overlay
      ctx.fillStyle = 'rgba(164, 120, 90, 0.05)';
      for (let i = 0; i < canvas.width; i += 40) {
        for (let j = 0; j < canvas.height; j += 40) {
          ctx.fillRect(i, j, 1, 1);
        }
      }
      
      // Load store logo if available
      let storeLogo = null;
      if (storeData?.logo_url) {
        try {
          storeLogo = await loadImage(storeData.logo_url);
        } catch (error) {
          console.warn('Could not load store logo:', error);
        }
      }
      
      // Add store logo at top
      if (storeLogo) {
        const logoSize = 80;
        const logoX = 50;
        const logoY = 50;
        ctx.drawImage(storeLogo, logoX, logoY, logoSize, logoSize);
      }
      
      // Add product image if available
      if (productToShare.productImage) {
        try {
          let imageUrl = productToShare.productImage;
          if (imageUrl.includes('/storage/')) {
            imageUrl = imageUrl.replace('/storage/', '/images/');
          }
          
          const productImg = await loadImage(imageUrl);
          
          const imageSize = 500;
          const x = (canvas.width - imageSize) / 2;
          const y = 180;
          
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 10;
          ctx.shadowOffsetY = 10;
          
          ctx.fillStyle = '#ffffff';
          ctx.roundRect(x - 20, y - 20, imageSize + 40, imageSize + 40, 20);
          ctx.fill();
          
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          ctx.drawImage(productImg, x, y, imageSize, imageSize);
          
        } catch (error) {
          console.warn('Could not load image:', error);
          
          const placeholderSize = 500;
          const x = (canvas.width - placeholderSize) / 2;
          const y = 180;
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.roundRect(x, y, placeholderSize, placeholderSize, 20);
          ctx.fill();
          
          ctx.fillStyle = '#a4785a';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('📦', canvas.width / 2, canvas.height / 2 - 20);
          
          ctx.fillStyle = '#7b5a3b';
          ctx.font = '24px Arial';
          ctx.fillText('Product Image', canvas.width / 2, canvas.height / 2 + 40);
        }
      }
      
      // Add professional text overlay
      await addProfessionalTextOverlay(ctx, canvas, sellerData, storeData);
      
      return canvas;
    } catch (error) {
      console.error('Error generating preview canvas:', error);
      return null;
    }
  };

  const shareProductViaSocial = (platform) => {
    if (!productToShare) return;
    
    // Use product_id for the customer-facing product detail page
    const productId = productToShare.product_id || productToShare.id;
    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const productLink = `${baseUrl}/product/${productId}`;
    const shareText = `Check out this handcrafted product: ${productToShare.productName}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productLink)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll copy the link
        navigator.clipboard.writeText(productLink).then(() => {
          alert('Product link copied! Paste it in your Instagram post caption.');
        }).catch(() => {
          alert('Failed to copy link. Please try again.');
        });
        return;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productLink)}`;
        break;
      case 'messenger':
        shareUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(productLink)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(window.location.origin)}`;
        break;
      default:
        return;
    }
    
    // Open in a properly sized popup window
    const width = 600;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      shareUrl, 
      'share-dialog',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const generateProductPreview = async () => {
    if (!productToShare) return;

    try {
      // Fetch seller and store information
      const [sellerResponse, storeResponse] = await Promise.all([
        api.get('/sellers/profile').catch(() => ({ data: null })),
        api.get('/store/me').catch(() => ({ data: null }))
      ]);

      const sellerData = sellerResponse.data;
      const storeData = storeResponse.data;

      // Create a canvas element for the preview
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Add roundRect method to canvas context (not available by default)
      if (!ctx.roundRect) {
        ctx.roundRect = function(x, y, width, height, radius) {
          this.beginPath();
          this.moveTo(x + radius, y);
          this.lineTo(x + width - radius, y);
          this.quadraticCurveTo(x + width, y, x + width, y + radius);
          this.lineTo(x + width, y + height - radius);
          this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          this.lineTo(x + radius, y + height);
          this.quadraticCurveTo(x, y + height, x, y + height - radius);
          this.lineTo(x, y + radius);
          this.quadraticCurveTo(x, y, x + radius, y);
          this.closePath();
        };
      }
      
      // Set canvas size (Instagram post size: 1080x1080)
      canvas.width = 1080;
      canvas.height = 1080;
      
      // Professional background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f8f6f0');
      gradient.addColorStop(0.3, '#e8e2d5');
      gradient.addColorStop(1, '#d4c4a8');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle pattern overlay
      ctx.fillStyle = 'rgba(164, 120, 90, 0.05)';
      for (let i = 0; i < canvas.width; i += 40) {
        for (let j = 0; j < canvas.height; j += 40) {
          ctx.fillRect(i, j, 1, 1);
        }
      }
      
      // Load store logo if available
      let storeLogo = null;
      if (storeData?.logo_url) {
        try {
          storeLogo = await loadImage(storeData.logo_url);
        } catch (error) {
          console.warn('Could not load store logo:', error);
        }
      }
      
      // Add store logo at top
      if (storeLogo) {
        const logoSize = 80;
        const logoX = 50;
        const logoY = 50;
        ctx.drawImage(storeLogo, logoX, logoY, logoSize, logoSize);
      }
      
      // Add product image if available
      if (productToShare.productImage) {
        try {
          // Convert storage URL to our CORS-enabled URL
          let imageUrl = productToShare.productImage;
          if (imageUrl.includes('/storage/')) {
            imageUrl = imageUrl.replace('/storage/', '/images/');
          }
          
          // Try to load image with CORS
          const productImg = await loadImage(imageUrl);
          
          // Draw product image with professional styling
          const imageSize = 500;
          const x = (canvas.width - imageSize) / 2;
          const y = 180;
          
          // Add shadow effect
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 10;
          ctx.shadowOffsetY = 10;
          
          // Draw rounded rectangle background
          ctx.fillStyle = '#ffffff';
          ctx.roundRect(x - 20, y - 20, imageSize + 40, imageSize + 40, 20);
          ctx.fill();
          
          // Reset shadow
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          // Draw product image
          ctx.drawImage(productImg, x, y, imageSize, imageSize);
          
        } catch (error) {
          console.warn('Could not load image with CORS, generating preview without image:', error);
          
          // Add elegant placeholder
          const placeholderSize = 500;
          const x = (canvas.width - placeholderSize) / 2;
          const y = 180;
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.roundRect(x, y, placeholderSize, placeholderSize, 20);
          ctx.fill();
          
          ctx.fillStyle = '#a4785a';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('📦', canvas.width / 2, canvas.height / 2 - 20);
          
          ctx.fillStyle = '#7b5a3b';
          ctx.font = '24px Arial';
          ctx.fillText('Product Image', canvas.width / 2, canvas.height / 2 + 40);
        }
      }
      
      // Add professional text overlay
      await addProfessionalTextOverlay(ctx, canvas, sellerData, storeData);
      
      // Trigger download
      downloadPreview(canvas);
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Error generating preview image. Please try again.');
    }
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const addProfessionalTextOverlay = async (ctx, canvas, sellerData, storeData) => {
    const startY = 720;
    let currentY = startY;
    
    // Product name with elegant styling
    ctx.fillStyle = '#2c1810';
    ctx.font = 'bold 42px "Arial", sans-serif';
    ctx.textAlign = 'center';
    
    // Add text shadow for depth
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // Split long product names into multiple lines
    const productName = productToShare.productName;
    const maxWidth = canvas.width - 100;
    const words = productName.split(' ');
    let line = '';
    let lines = [];
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    
    // Draw product name lines
    lines.forEach((line, index) => {
      ctx.fillText(line.trim(), canvas.width / 2, currentY + (index * 50));
    });
    currentY += (lines.length * 50) + 20;
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Category with elegant styling
    ctx.font = '28px "Arial", sans-serif';
    ctx.fillStyle = '#a4785a';
    ctx.fillText(productToShare.category.toUpperCase(), canvas.width / 2, currentY);
    currentY += 60;
    
    // Store name and seller info
    const storeName = storeData?.store?.store_name || sellerData?.businessName || 'CraftConnect Store';
    const sellerName = sellerData?.userName || 'Artisan';
    
    ctx.font = '24px "Arial", sans-serif';
    ctx.fillStyle = '#7b5a3b';
    ctx.fillText(`by ${sellerName}`, canvas.width / 2, currentY);
    currentY += 40;
    
    ctx.font = '22px "Arial", sans-serif';
    ctx.fillStyle = '#8b6f47';
    ctx.fillText(storeName, canvas.width / 2, currentY);
    currentY += 50;
    
    // Decorative line
    ctx.strokeStyle = '#d4c4a8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 100, currentY);
    ctx.lineTo(canvas.width / 2 + 100, currentY);
    ctx.stroke();
    currentY += 30;
    
    // CraftConnect branding
    ctx.font = '26px "Arial", sans-serif';
    ctx.fillStyle = '#a4785a';
    ctx.fillText('CraftConnect', canvas.width / 2, currentY);
    currentY += 35;
    
    ctx.font = '18px "Arial", sans-serif';
    ctx.fillStyle = '#8b6f47';
    ctx.fillText('Handmade with Love & Care', canvas.width / 2, currentY);
    
    // Add QR code placeholder area (optional)
    const qrSize = 60;
    const qrX = canvas.width - qrSize - 50;
    const qrY = canvas.height - qrSize - 50;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.roundRect(qrX, qrY, qrSize, qrSize, 8);
    ctx.fill();
    
    ctx.fillStyle = '#a4785a';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR', qrX + qrSize/2, qrY + qrSize/2 + 3);
  };

  const downloadPreview = (canvas) => {
    const link = document.createElement('a');
    link.download = `${productToShare.productName}-preview.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleTogglePublishStatus = async (product) => {
    try {
      console.log("Full product object:", product);
      console.log("Updating product ID:", product.product_id || product.id);
      
      const response = await api.post(`/products/${product.product_id || product.id}/toggle-publish`);

      if (response.data) {
        const result = response.data;
        console.log("Product publish status updated successfully:", result);
        const newStatus = result.publish_status;
        alert(`Product ${newStatus === 'published' ? 'published' : 'saved as draft'} successfully!`);
        fetchProducts(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating publish status:", error);
      alert("Error updating publish status. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`Setting ${field} to:`, value);
    if (isAddDialogOpen) {
      setNewProduct((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else if (isEditDialogOpen) {
      setCurrentProduct((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileChange = (field, file) => {
    if (isAddDialogOpen) {
      setNewProduct((prev) => ({
        ...prev,
        [field]: file,
      }));
    } else if (isEditDialogOpen) {
      setCurrentProduct((prev) => ({
        ...prev,
        [field]: file,
      }));
    }
  };

  const stockStatusOptions = [
    { value: "all", label: "All Products" },
    { value: "in stock", label: "In Stock" },
    { value: "low stock", label: "Low Stock" },
    { value: "out of stock", label: "Out of Stock" }
  ];

  const filteredInventory = inventory.filter((product) => {
    const matchesSearch = product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStock = stockFilter === "all" || product.status?.toLowerCase() === stockFilter.toLowerCase();
    
    return matchesSearch && matchesStock;
  });

  const getStockColor = (status) => {
    switch (status) {
      case "in stock":
        return "bg-green-100 text-green-800";
      case "low stock":
        return "bg-yellow-100 text-yellow-800";
      case "out of stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPublishColor = (publish_status) => {
    switch (publish_status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getApprovalColor = (approval_status) => {
    switch (approval_status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const hasVariationInventory =
    !!(currentProduct?.has_variations &&
      Array.isArray(currentProduct?.variations) &&
      currentProduct.variations.length > 0);

  const variationQuantityPreview = hasVariationInventory
    ? currentProduct.variations.reduce((sum, variation, index) => {
        const key = getVariationKey(variation, index);
        const draftValue = variationQuantityDraft[key];
        const numericDraft = Number(draftValue);
        const baseQuantity = Number(variation?.quantity ?? 0);
        const resolvedQuantity = Number.isFinite(numericDraft)
          ? Math.max(0, numericDraft)
          : Math.max(0, baseQuantity);
        return sum + resolvedQuantity;
      }, 0)
    : null;

  const newQuantityPreview = hasVariationInventory
    ? variationQuantityPreview
    : currentProduct
    ? (currentProduct.productQuantity || 0) + quantityChange
    : 0;

  const renderRatingStars = (ratingValue, showValue = true) => {
    const rating = Number(ratingValue) || 0;
    return (
      <div className="flex items-center gap-1 text-amber-500">
        {Array.from({ length: 5 }).map((_, index) => {
          const point = index + 1;
          let fillColor = "#d1d5db";
          if (rating >= point) {
            fillColor = "#f59e0b";
          } else if (rating > point - 1) {
            fillColor = "url(#halfGradient)";
          }
          return (
            <svg key={index} className="h-4 w-4">
              <defs>
                <linearGradient id="halfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset={`${((rating - (point - 1)) * 100).toFixed(0)}%`} stopColor="#f59e0b" />
                  <stop offset={`${((rating - (point - 1)) * 100).toFixed(0)}%`} stopColor="#d1d5db" />
                </linearGradient>
              </defs>
              <Star
                className="h-4 w-4 text-[#f59e0b]"
                fill={fillColor.startsWith("url") ? fillColor : fillColor}
                stroke={rating >= point ? "#f59e0b" : "#d1d5db"}
              />
            </svg>
          );
        })}
        {showValue && <span className="text-xs text-[#5c3d28] ml-2">{rating.toFixed(1)}</span>}
      </div>
    );
  };

  const formatReviewDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (error) {
    return (
      <div className="w-full pt-4">
        <ErrorState message={error} onRetry={fetchProducts} />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#a4785a]" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 sm:pl-9 pr-2 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#d5bfae] rounded focus:border-[#a4785a] focus:ring-1 focus:ring-[#a4785a]/20 transition-all h-8 sm:h-10"
          />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="h-7 sm:h-8 border border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200 text-[10px] sm:text-xs px-2 sm:px-3"
            >
              <Filter className="mr-1 h-3 w-3" />
              Filter
              {stockFilter !== "all" && (
                <Badge className="ml-1 bg-[#a4785a] text-white text-[10px] px-1">1</Badge>
              )}
            </Button>
            {isFilterOpen && (
              <div className="absolute top-full mt-1 right-0 bg-white border border-[#d5bfae] rounded shadow-lg z-10 min-w-[180px] sm:min-w-[200px] p-2">
                <div className="text-[10px] sm:text-xs font-semibold text-[#5c3d28] mb-2 px-2">Filter by Stock Status</div>
                {stockStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStockFilter(option.value);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-md transition-all text-[10px] sm:text-xs ${
                      stockFilter === option.value
                        ? "bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white"
                        : "hover:bg-[#f8f1ec] text-[#5c3d28]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Add Product Button */}
          <Button 
            className="h-7 sm:h-8 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-md hover:shadow-lg transition-all duration-200 text-[10px] sm:text-xs px-2 sm:px-3"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-1 h-3 w-3" /> Add Product
          </Button>
          
          {/* Add Product Modal */}
          <AddProductModal 
            isOpen={isAddDialogOpen} 
            onClose={() => setIsAddDialogOpen(false)} 
            onSave={handleAddProduct}
          />
        </div>
      </div>
      
      <Card className="border-[#e5ded7] shadow overflow-visible">
        <CardHeader className="pb-2 border-b border-[#e5ded7] bg-[#faf9f8] px-2 sm:px-4 hidden">
          <CardTitle className="text-[#5c3d28] text-base sm:text-lg">Product Inventory</CardTitle>
          <CardDescription className="text-[#7b5a3b] text-xs sm:text-sm">Manage your product inventory and stock levels</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 px-2 sm:px-4 overflow-visible">
          <div className="overflow-x-auto -mx-2 sm:mx-0 overflow-y-visible">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm sm:text-base px-2 py-2 w-12 sm:w-16">Image</TableHead>
                  <TableHead className="text-sm sm:text-base px-2 py-2">Name</TableHead>
                  <TableHead className="text-sm sm:text-base px-2 py-2">Category</TableHead>
                  <TableHead className="text-sm sm:text-base px-2 py-2 hidden md:table-cell">Price</TableHead>
                  <TableHead className="text-sm sm:text-base px-2 py-2 hidden md:table-cell">Stock</TableHead>
                  <TableHead className="text-sm sm:text-base px-2 py-2 hidden lg:table-cell">Status</TableHead>
                  <TableHead className="text-right text-sm sm:text-base px-2 py-2 w-8 sm:w-auto"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <LoadingSpinner message="Loading products..." size="small" />
                    </TableCell>
                  </TableRow>
                ) : filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <EmptyState
                        icon="📦"
                        title="No Products Found"
                        description={searchTerm ? "No products match your search criteria" : "You haven't added any products yet"}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((product) => (
                    <TableRow key={product.id || product.product_id || `product-${Math.random().toString(36).substr(2, 9)}`}>
                      <TableCell className="px-2 py-2">
                        {product.productImage ? (
                          <img 
                            src={product.productImage.includes('/storage/') 
                              ? product.productImage.replace('/storage/', '/images/')
                              : product.productImage
                            } 
                            alt={product.productName} 
                            className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded border border-[#e5ded7]"
                            onError={(e) => {
                              console.warn('Image failed to load:', product.productImage);
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div 
                          className={`h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded flex items-center justify-center border border-[#e5ded7] ${product.productImage ? 'hidden' : ''}`}
                        >
                          <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                        </div>
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <div className="font-medium text-xs sm:text-sm text-[#5c3d28]">{product.productName}</div>
                        <div className="text-xs text-gray-500 md:hidden mt-0.5">
                          ₱{product.productPrice} • Qty: {product.productQuantity}
                        </div>
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <span className="text-xs sm:text-sm text-[#7b5a3b]">{product.category}</span>
                      </TableCell>
                      <TableCell className="px-2 py-2 hidden md:table-cell">
                        <span className="text-xs sm:text-sm font-semibold text-[#5c3d28]">₱{product.productPrice}</span>
                      </TableCell>
                      <TableCell className="px-2 py-2 hidden md:table-cell">
                        <span className="text-xs sm:text-sm text-[#5c3d28]">{product.productQuantity}</span>
                      </TableCell>
                      <TableCell className="px-2 py-2 hidden lg:table-cell">
                        <Badge className={`${getStockColor(product.status)} text-xs sm:text-sm`} variant="outline">
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 py-2 relative">
                        {/* Desktop: Show all actions directly */}
                        <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="px-2 py-1 text-xs sm:text-sm bg-white border border-[#a4785a] text-[#a4785a] rounded hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleShareProduct(product)}
                            className="px-2 py-1 text-xs sm:text-sm bg-white border border-[#a4785a] text-[#a4785a] rounded hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                          >
                            Share
                          </button>
                          <button
                            onClick={() => handleQuantityClick(product)}
                            className="px-2 py-1 text-xs sm:text-sm bg-white border border-[#a4785a] text-[#a4785a] rounded hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                          >
                            Stock
                          </button>
                          {(!product.hasOrders || product.hasOrders === 0) && (
                            <button
                              onClick={() => handleTogglePublishStatus(product)}
                              className="px-2 py-1 text-xs sm:text-sm bg-white border border-[#a4785a] text-[#a4785a] rounded hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                            >
                              {product.publish_status === 'published' ? 'Draft' : 'Publish'}
                            </button>
                          )}
                          <button
                            onClick={() => handleEditClick(product)}
                            className="px-2 py-1 text-xs sm:text-sm bg-white border border-[#a4785a] text-[#a4785a] rounded hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                          >
                            Edit
                          </button>
                        </div>
                        
                        {/* Mobile: Show dropdown */}
                        <div className="sm:hidden flex items-center justify-end">
                          <button
                            onClick={() => setOpenActionMenu(openActionMenu === product.id ? null : product.id)}
                            className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                        
                        {/* Dropdown positioned relative to TableCell */}
                        {openActionMenu === product.id && (
                          <>
                            <div className="fixed inset-0 z-[9998]" onClick={() => setOpenActionMenu(null)} />
                            <div className="absolute right-0 top-full mt-1 bg-white border border-[#e5ded7] rounded-lg shadow-lg z-[9999] min-w-[120px] py-1">
                              <button
                                onClick={() => {
                                  handleViewProduct(product);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs sm:text-sm bg-white text-[#a4785a] hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  handleShareProduct(product);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs sm:text-sm bg-white text-[#a4785a] hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                              >
                                Share Product
                              </button>
                              <button
                                onClick={() => {
                                  handleQuantityClick(product);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs sm:text-sm bg-white text-[#a4785a] hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                              >
                                Update Stock
                              </button>
                              {(!product.hasOrders || product.hasOrders === 0) && (
                                <button
                                  onClick={() => {
                                    handleTogglePublishStatus(product);
                                    setOpenActionMenu(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs sm:text-sm bg-white text-[#a4785a] hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                                >
                                  {product.publish_status === 'published' ? 'Save as Draft' : 'Publish Product'}
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  handleEditClick(product);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs sm:text-sm bg-white text-[#a4785a] hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                              >
                                Edit Product
                              </button>
                            </div>
                          </>
                        )}
                      </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
          
          {/* Edit Product Modal */}
          <EditProductModal
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            product={currentProduct}
            onSave={handleUpdateProduct}
          />

          {/* View Product Modal */}
          {isViewProductOpen && currentProduct && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-white rounded-lg sm:rounded-2xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-2xl font-bold text-white">Product Details</h2>
                    <button 
                      onClick={() => setIsViewProductOpen(false)}
                      className="bg-white text-black rounded-lg sm:rounded-xl p-1.5 sm:p-2 shadow-md transition-all duration-200"
                    >
                      <span className="block text-lg sm:text-xl leading-none">✕</span>
                    </button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Product Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Product Name</p>
                        <p className="text-base sm:text-lg font-semibold text-[#5c3d28]">{currentProduct.productName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">SKU</p>
                        <p className="text-sm sm:text-base font-semibold text-[#5c3d28]">{currentProduct.sku || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Category</p>
                        <p className="text-sm sm:text-base font-semibold text-[#5c3d28]">{currentProduct.category}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Price</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#a4785a]">₱{currentProduct.productPrice}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Stock Quantity</p>
                        <p className="text-base sm:text-lg font-semibold text-[#5c3d28]">{currentProduct.productQuantity}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Stock Status</p>
                        <Badge className={`${getStockColor(currentProduct.status)} text-xs`} variant="outline">
                          {currentProduct.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Publish Status</p>
                        <Badge className={`${getPublishColor(currentProduct.publish_status)} text-xs`} variant="outline">
                          {currentProduct.publish_status || 'draft'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Approval Status</p>
                        <Badge className={`${getApprovalColor(currentProduct.approval_status)} text-xs`} variant="outline">
                          {currentProduct.approval_status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Product Images - All Images Gallery */}
                  {(currentProduct.productImage || (Array.isArray(currentProduct.productImages) && currentProduct.productImages.length > 0)) && (
                    <div className="border-t border-[#e5ded7] pt-3 sm:pt-4">
                      {(() => {
                        // Helper function to get display URL
                        const getDisplayUrl = (url) => {
                          if (!url) return '';
                          if (url.includes('/storage/')) {
                            return url.replace('/storage/', '/images/');
                          }
                          if (url.startsWith('http')) {
                            return url;
                          }
                          return `/images/${url.replace(/^\/+/, '')}`;
                        };

                        // Helper function to normalize URLs for comparison (more lenient)
                        const normalizeUrlForComparison = (url) => {
                          if (!url) return '';
                          let normalized = url.toLowerCase();
                          // Remove /storage/ or /images/ prefixes
                          normalized = normalized.replace(/^\/+(storage|images)\//, '');
                          normalized = normalized.replace(/^\/+/, '');
                          // Remove protocol and domain
                          normalized = normalized.replace(/^https?:\/\/[^/]+/, '');
                          normalized = normalized.replace(/^\/+/, '');
                          // Extract just the filename for comparison
                          const filename = normalized.split('/').pop() || normalized;
                          return filename.split('?')[0]; // Remove query params
                        };

                        // Collect all images - similar to EditProductModal logic
                        const allImages = [];
                        const mainImageUrl = currentProduct.productImage;
                        const mainImageNormalized = mainImageUrl ? normalizeUrlForComparison(mainImageUrl) : null;
                        
                        // First, add main image if it exists
                        if (mainImageUrl) {
                          allImages.push({
                            url: mainImageUrl,
                            isMain: true,
                            index: 0
                          });
                        }

                        // Then add all additional images, marking main if it matches
                        if (Array.isArray(currentProduct.productImages) && currentProduct.productImages.length > 0) {
                          currentProduct.productImages.forEach((imageUrl, index) => {
                            if (!imageUrl) return;
                            
                            const normalizedUrl = normalizeUrlForComparison(imageUrl);
                            const isMainImage = mainImageNormalized && normalizedUrl === mainImageNormalized;
                            
                            // Only add if it's not already the main image we added
                            if (!isMainImage || !mainImageUrl) {
                              // If this is the main image but we haven't added main yet, mark it as main
                              const shouldBeMain = isMainImage && !mainImageUrl;
                              allImages.push({
                                url: imageUrl,
                                isMain: shouldBeMain,
                                index: allImages.length
                              });
                            } else if (isMainImage && allImages.length > 0) {
                              // If main image is in productImages array, update the first one to be marked as main
                              allImages[0].isMain = true;
                            }
                          });
                        }

                        const totalImages = allImages.length;

                        return (
                          <>
                            <h3 className="text-base sm:text-lg font-semibold text-[#5c3d28] mb-2 sm:mb-3">
                              Product Images
                              {totalImages > 0 ? ` (${totalImages} ${totalImages === 1 ? 'image' : 'images'})` : ''}
                            </h3>
                            <div className="bg-[#faf9f8] rounded-lg border border-[#e5ded7] p-3 sm:p-4">
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                {allImages.map((imageData, displayIndex) => {
                                  const displayUrl = getDisplayUrl(imageData.url);
                                  
                                  return (
                                    <div key={`image-${imageData.index}-${displayIndex}`} className="relative group">
                                      {imageData.isMain && (
                                        <div className="absolute top-2 left-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg z-10">
                                          MAIN
                                        </div>
                                      )}
                                      {!imageData.isMain && (
                                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                                          {displayIndex + 1}
                                        </div>
                                      )}
                                      <img 
                                        src={displayUrl}
                                        alt={imageData.isMain 
                                          ? `${currentProduct.productName} - Main` 
                                          : `${currentProduct.productName} - Image ${displayIndex + 1}`
                                        }
                                        className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-lg border-2 border-[#e5ded7] cursor-pointer hover:border-[#a4785a] hover:shadow-lg transition-all duration-200"
                                        onClick={() => {
                                          window.open(displayUrl, '_blank');
                                        }}
                                        onError={(e) => {
                                          console.warn('Image failed to load:', displayUrl);
                                          e.target.style.display = 'none';
                                          if (e.target.nextSibling) {
                                            e.target.nextSibling.style.display = 'flex';
                                          }
                                        }}
                                      />
                                      <div 
                                        className="hidden h-40 sm:h-48 md:h-56 w-full bg-gray-200 rounded-lg border-2 border-[#e5ded7] items-center justify-center text-gray-500"
                                        style={{display: 'none'}}
                                      >
                                        <div className="text-center">
                                          <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                                          <p className="text-xs text-gray-500">Image not available</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-[#7b5a3b] mt-3 text-center">
                                📸 Click on any image to view in full size
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Product Description */}
                  {currentProduct.productDescription && (
                    <div className="border-t border-[#e5ded7] pt-3 sm:pt-4">
                      <h3 className="text-base sm:text-lg font-semibold text-[#5c3d28] mb-2 sm:mb-3">Description</h3>
                      <div className="bg-[#faf9f8] rounded-lg border border-[#e5ded7] p-3 sm:p-4">
                        <p className="text-[#5c3d28] whitespace-pre-wrap text-xs sm:text-sm">{currentProduct.productDescription}</p>
                      </div>
                    </div>
                  )}

                {/* Variations Section - Enhanced Display */}
                {Array.isArray(currentProduct.variations) && currentProduct.variations.length > 0 && (
                  <div className="border-t border-[#e5ded7] pt-3 sm:pt-4">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-[#5c3d28]">Product Variations</h3>
                        <p className="text-xs text-[#7b5a3b] mt-1">
                          {currentProduct.variations.length} variation{currentProduct.variations.length !== 1 ? 's' : ''} available
                        </p>
                      </div>
                      <Badge className="bg-[#a4785a] text-white text-xs sm:text-sm px-3 py-1">
                        {currentProduct.variations.reduce((sum, v) => sum + (v.quantity || 0), 0)} total in stock
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {currentProduct.variations.map((variation, index) => {
                        const isOutOfStock = (variation.quantity ?? 0) <= 0;
                        const variationPrice = variation.price !== null && variation.price !== undefined && variation.price !== ''
                          ? parseFloat(variation.price)
                          : null;
                        const hasCustomPrice = variationPrice !== null && variationPrice !== parseFloat(currentProduct.productPrice || 0);

                        return (
                          <div
                            key={variation.variation_id || variation.id || variation.label || `variation-${index}`}
                            className={`border-2 rounded-lg p-4 shadow-sm transition-all duration-200 ${
                              isOutOfStock
                                ? "bg-gray-50 border-gray-300 opacity-75"
                                : "bg-gradient-to-br from-white to-[#faf9f8] border-[#e5ded7] hover:border-[#a4785a] hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <p className="text-sm sm:text-base font-bold text-[#5c3d28] mb-1">
                                  {variation.label || variation.size || `Option ${index + 1}`}
                                </p>
                                {variation.sku && (
                                  <code className="text-xs bg-[#e5ded7] px-2 py-1 rounded text-[#7b5a3b] font-mono">
                                    {variation.sku}
                                  </code>
                                )}
                              </div>
                              {isOutOfStock ? (
                                <Badge className="bg-red-100 text-red-800 text-xs">Out of Stock</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  {variation.quantity} available
                                </Badge>
                              )}
                            </div>
                            
                            <div className="space-y-2 mt-3 pt-3 border-t border-[#e5ded7]">
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-gray-600 font-medium">Quantity:</span>
                                <span className={`text-sm sm:text-base font-bold ${
                                  isOutOfStock ? "text-red-600" : "text-[#5c3d28]"
                                }`}>
                                  {variation.quantity ?? 0}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-gray-600 font-medium">Price:</span>
                                <span className="text-base sm:text-lg font-bold text-[#a4785a]">
                                  {variationPrice !== null
                                    ? `₱${variationPrice.toFixed(2)}`
                                    : `₱${parseFloat(currentProduct.productPrice || 0).toFixed(2)}`}
                                  {hasCustomPrice && (
                                    <span className="ml-1 text-xs text-[#7b5a3b] font-normal">
                                      (Custom)
                                    </span>
                                  )}
                                </span>
                              </div>
                              {!hasCustomPrice && variationPrice === null && (
                                <p className="text-xs text-[#7b5a3b] italic">
                                  Uses base product price
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Variation Summary */}
                    <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-[#f5f0eb] to-[#ede5dc] rounded-lg border border-[#d5bfae]">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-xs text-[#7b5a3b] font-medium">Total Variations</p>
                          <p className="text-xl font-bold text-[#5c3d28]">{currentProduct.variations.length}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#7b5a3b] font-medium">Total Stock</p>
                          <p className="text-xl font-bold text-[#5c3d28]">
                            {currentProduct.variations.reduce((sum, v) => sum + (v.quantity || 0), 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-[#e5ded7] pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-[#5c3d28]">Reviews & Ratings</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">
                        Average Rating:
                      </span>
                      {renderRatingStars(currentProduct.average_rating, true)}
                      <span className="text-xs sm:text-sm text-gray-500">
                        {currentProduct.total_reviews || 0} review
                        {(currentProduct.total_reviews || 0) === 1 ? "" : "s"}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        Verified: {currentProduct.reviews?.filter((r) => r.is_verified)?.length || 0}
                      </span>
                    </div>
                  </div>

                  {Array.isArray(currentProduct.reviews) && currentProduct.reviews.length > 0 ? (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {currentProduct.reviews.map((review, index) => (
                        <div
                          key={review.review_id || review.id || `review-${index}`}
                          className="border border-[#e5ded7] rounded-lg p-3 sm:p-4 bg-white shadow-sm"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <p className="font-semibold text-[#5c3d28] text-sm">
                                {review.user?.userName || "Customer"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatReviewDate(review.review_date || review.created_at)}
                              </p>
                            </div>
                            {renderRatingStars(review.rating, false)}
                          </div>

                          <p className="mt-2 text-sm text-[#5c3d28] whitespace-pre-wrap">
                            {review.comment && review.comment.trim().length > 0
                              ? review.comment
                              : "No written feedback provided."}
                          </p>

                          {(Array.isArray(review.images) && review.images.length > 0) || review.video_path ? (
                            <div className="mt-3 space-y-2">
                              {Array.isArray(review.images) && review.images.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {review.images.map((imageUrl, mediaIndex) => (
                                    <img
                                      key={`${review.review_id || review.id || index}-image-${mediaIndex}`}
                                      src={imageUrl}
                                      alt="Review media"
                                      className="h-16 w-16 object-cover rounded border border-[#e5ded7]"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                              {review.video_path && (
                                <video
                                  src={review.video_path}
                                  controls
                                  className="w-full rounded border border-[#e5ded7]"
                                />
                              )}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-[#e5ded7] rounded-lg p-4 text-center text-sm text-gray-500">
                      No reviews yet for this product. Encourage customers to ask for feedback after purchase.
                    </div>
                  )}
                </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#e5ded7]">
                    <Button 
                      onClick={() => setIsViewProductOpen(false)}
                      variant="outline"
                      className="w-full sm:flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm"
                    >
                      Close
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsViewProductOpen(false);
                        handleShareProduct(currentProduct);
                      }}
                      variant="outline"
                      className="w-full sm:flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] flex items-center justify-center gap-2 text-sm"
                    >
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      Share Product
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quantity Update Modal */}
          {isQuantityModalOpen && currentProduct && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-white rounded-lg sm:rounded-2xl max-w-md w-full shadow-2xl">
                <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                      📦 Update Quantity
                    </h2>
                    <button 
                      onClick={() => {
                        setIsQuantityModalOpen(false);
                        setCurrentProduct(null);
                        setQuantityChange(0);
                        setVariationQuantityDraft({});
                      }}
                      className="bg-white text-black rounded-lg sm:rounded-xl p-1.5 sm:p-2 shadow-md transition-all duration-200"
                    >
                      <span className="block text-lg sm:text-xl leading-none">✕</span>
                    </button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {/* Product Info */}
                  <div className="bg-[#f8f1ec] border-2 border-[#e5ded7] rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Product Name</p>
                    <p className="text-base sm:text-lg font-bold text-[#5c3d28]">{currentProduct.productName}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">Current Quantity</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#a4785a]">{currentProduct.productQuantity || 0}</p>
                  </div>

                  {/* Quantity Change Input */}
                  {hasVariationInventory ? (
                    <div className="space-y-3">
                      <p className="text-xs sm:text-sm font-semibold text-[#5c3d28]">
                        Adjust quantities for each variation option
                      </p>
                      <div className="space-y-3">
                        {currentProduct.variations.map((variation, index) => {
                          const key = getVariationKey(variation, index);
                          const draftValue = variationQuantityDraft[key];
                          const currentValue = Number.isFinite(Number(draftValue))
                            ? Number(draftValue)
                            : Number(variation?.quantity ?? 0);

                          return (
                            <div
                              key={variation.variation_id || variation.label || `variation-${index}`}
                              className="border border-[#e5ded7] rounded-lg p-3 sm:p-4 bg-[#faf9f8]"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-[#5c3d28]">
                                    {variation.label || variation.size || `Option ${index + 1}`}
                                  </p>
                                  {variation.sku && (
                                    <p className="text-xs text-[#7b5a3b] mt-1">SKU: {variation.sku}</p>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Current:{" "}
                                  <span className="font-semibold text-[#5c3d28]">
                                    {variation.quantity ?? 0}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-3 flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => adjustVariationQuantity(key, -1)}
                                  className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm px-3"
                                >
                                  -
                                </Button>
                                <Input
                                  type="number"
                                  value={currentValue}
                                  onChange={(e) => setVariationQuantityValue(key, e.target.value)}
                                  className="text-center border-2 border-[#d5bfae] text-base sm:text-lg font-bold"
                                  min={0}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => adjustVariationQuantity(key, 1)}
                                  className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm px-3"
                                >
                                  +
                                </Button>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                Set the total available quantity for this option.
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold text-[#5c3d28]">
                        Adjust Quantity
                      </label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantityChange(quantityChange - 1)}
                          className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm px-3"
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={quantityChange}
                          onChange={(e) => setQuantityChange(parseInt(e.target.value) || 0)}
                          className="text-center border-2 border-[#d5bfae] text-base sm:text-lg font-bold"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantityChange(quantityChange + 1)}
                          className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm px-3"
                        >
                          +
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Enter positive number to add, negative to remove
                      </p>
                    </div>
                  )}

                  {/* Preview New Quantity */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-green-700 font-medium mb-1">New Quantity Will Be:</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-700">
                      {newQuantityPreview}
                    </p>
                    {hasVariationInventory && (
                      <p className="text-xs text-gray-500 mt-1">
                        Total is calculated from the updated variation quantities above.
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#e5ded7]">
                    <Button 
                      onClick={() => {
                        setIsQuantityModalOpen(false);
                        setCurrentProduct(null);
                        setQuantityChange(0);
                        setVariationQuantityDraft({});
                      }}
                      variant="outline"
                      className="w-full sm:flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpdateQuantity}
                      className="w-full sm:flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8f674a] hover:to-[#6a4c34] text-sm"
                    >
                      Update Quantity
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Share Product Modal */}
          {isShareModalOpen && productToShare && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-white rounded-lg sm:rounded-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                      <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
                      Share Product
                    </h2>
                    <button 
                      onClick={() => setIsShareModalOpen(false)}
                      className="bg-white text-black rounded-lg sm:rounded-xl p-1.5 sm:p-2 shadow-md transition-all duration-200"
                    >
                      <span className="block text-lg sm:text-xl leading-none">✕</span>
                    </button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {/* Product Info */}
                  <div className="bg-[#f8f1ec] border-2 border-[#e5ded7] rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Product Name</p>
                    <p className="text-base sm:text-lg font-bold text-[#5c3d28]">{productToShare.productName}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">Product Link</p>
                    <div className="bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded border border-[#d5bfae] mt-1">
                      <p className="text-xs text-[#7b5a3b] break-all">
                        {`${import.meta.env.VITE_FRONTEND_URL || window.location.origin}/product/${productToShare.product_id || productToShare.id}`}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This link will take customers to your product detail page
                    </p>
                  </div>

                  {/* Share Options */}
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-base sm:text-lg font-semibold text-[#5c3d28]">Share Options</h3>
                    
                    {/* Generate Preview Image */}
                    <Button
                      onClick={generateProductPreview}
                      className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8f674a] hover:to-[#6a4c34] justify-start text-sm"
                    >
                      🖼️ Generate & Save Preview Image
                    </Button>

                    {/* Copy Link */}
                    <Button
                      onClick={copyProductLink}
                      variant="outline"
                      className="w-full border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] justify-start text-sm"
                    >
                      📋 Copy Product Link
                    </Button>

                    <div className="border-t border-[#e5ded7] my-2 sm:my-3"></div>
                    
                    {/* Post to Social Media */}
                    <h3 className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Post to Your Social Media</h3>
                    <p className="text-xs text-gray-500">Create a post with product image and link</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button
                        onClick={() => handlePostToSocialMedia('facebook')}
                        variant="outline"
                        className="border-2 border-[#1877f2] text-[#1877f2] hover:bg-[#1877f2] hover:text-white justify-start text-sm"
                      >
                        📘 Post to Facebook
                      </Button>
                      <Button
                        onClick={() => handlePostToSocialMedia('instagram')}
                        variant="outline"
                        className="border-2 border-[#E4405F] text-[#E4405F] hover:bg-[#E4405F] hover:text-white justify-start text-sm"
                      >
                        📷 Post to Instagram
                      </Button>
                    </div>

                    <div className="border-t border-[#e5ded7] my-2 sm:my-3"></div>
                    
                    <h3 className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Quick Share via Link</h3>
                    <p className="text-xs text-gray-500">Share product link on other platforms</p>
                    
                    {/* Social Media Quick Share */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => shareProductViaSocial('facebook')}
                        variant="outline"
                        className="border-2 border-[#1877f2] text-[#1877f2] hover:bg-[#1877f2] hover:text-white justify-start text-xs sm:text-sm"
                      >
                        📘 Facebook
                      </Button>
                      <Button
                        onClick={() => shareProductViaSocial('instagram')}
                        variant="outline"
                        className="border-2 border-[#E4405F] text-[#E4405F] hover:bg-[#E4405F] hover:text-white justify-start text-xs sm:text-sm"
                      >
                        📷 Instagram
                      </Button>

                    </div>
                  </div>

                  <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#e5ded7]">
                    <Button 
                      onClick={() => setIsShareModalOpen(false)}
                      variant="outline"
                      className="flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

const OrdersSectionWithTabs = () => {
  const location = useLocation();
  // Initialize with hash from URL if available, otherwise default to 'orders-list'
  const getInitialSubTab = () => {
    const hash = window.location.hash || location.hash;
    if (hash === '#returns' || hash === '#return-refund' || hash === '#returnrefund') {
      return 'returns';
    }
    return 'orders-list';
  };
  const [activeSubTab, setActiveSubTab] = useState(getInitialSubTab());

  // Update sub-tab based on URL hash
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash || location.hash;
      console.log('OrdersSectionWithTabs - Checking hash:', hash);
      if (hash === '#returns' || hash === '#return-refund' || hash === '#returnrefund') {
        console.log('OrdersSectionWithTabs - Setting sub-tab to returns');
        setActiveSubTab('returns');
      } else if (hash === '#orders' || !hash || hash === '') {
        console.log('OrdersSectionWithTabs - Setting sub-tab to orders-list');
        setActiveSubTab('orders-list');
      }
    };
    
    // Check immediately on mount
    checkHash();
    
    // Also check after a brief delay to ensure hash is set
    const timeoutId = setTimeout(checkHash, 50);
    
    const handleHashChange = () => {
      checkHash();
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [location.hash, location.pathname]);

  return (
    <div className="space-y-2 sm:space-y-3">
      <Tabs value={activeSubTab} onValueChange={(value) => {
        setActiveSubTab(value);
        // Update hash when sub-tab changes manually
        if (value === 'orders-list') {
          window.location.hash = '#orders';
        } else if (value === 'returns') {
          window.location.hash = '#returns';
        }
      }} className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-white border border-[#e5ded7] rounded-md p-1">
          <TabsTrigger 
            value="orders-list" 
            className="rounded-sm bg-white text-[#a4785a] data-[state=active]:!bg-[#a4785a] data-[state=active]:!text-white data-[state=active]:shadow-sm transition-all duration-200 text-sm font-medium py-2"
          >
            Orders
          </TabsTrigger>
          <TabsTrigger 
            value="returns"
            className="rounded-sm bg-white text-[#a4785a] data-[state=active]:!bg-[#a4785a] data-[state=active]:!text-white data-[state=active]:shadow-sm transition-all duration-200 text-sm font-medium py-2"
          >
            Return/Refund
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders-list" className="mt-4 sm:mt-6">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="returns" className="mt-4 sm:mt-6">
          <ReturnRefundRequestsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const OrderInventoryManager = () => {
  const location = useLocation();
  // Initialize with hash from URL if available, otherwise default to 'orders'
  const getInitialTab = () => {
    // Check both window.location.hash and location.hash for reliability
    const hash = window.location.hash || location.hash;
    if (hash === '#shipping') {
      return 'shipping';
    }
    // Handle return/refund hash - set main tab to orders (sub-tabs will handle the rest)
    if (hash === '#returns' || hash === '#return-refund' || hash === '#returnrefund') {
      return 'orders';
    }
    return 'orders';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Update active tab based on URL hash - check on mount and when hash changes
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash || location.hash;
      if (hash === '#shipping') {
        setActiveTab('shipping');
      } else if (hash === '#returns' || hash === '#return-refund' || hash === '#returnrefund') {
        // Return/refund requests should be in orders tab (sub-tabs will handle the rest)
        setActiveTab('orders');
      } else {
        // Default to 'orders' if hash is '#orders' or empty
        setActiveTab('orders');
      }
    };
    
    // Check immediately
    checkHash();
    
    // Also listen for hash changes
    const handleHashChange = () => {
      checkHash();
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [location.hash, location.pathname]);

  return (
    <div className="space-y-2 sm:space-y-3 max-w-[412px] sm:max-w-none mx-auto px-2 sm:px-0">
      {/* Header Section with Craft Theme */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg p-3">
        <h1 className="text-base font-bold text-white flex items-center">
          <ShoppingBag className="h-5 w-5 mr-2" />
          Orders & Shipping
        </h1>
        <p className="text-white/90 mt-1 text-xs">
          Manage your orders, shipping, and deliveries in one place.
        </p>
      </div>

      {/* Tabs with Craft Theme */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        // Update hash when tab changes manually (but don't interfere with #returns)
        if (value === 'orders' && window.location.hash !== '#returns') {
          window.location.hash = '#orders';
        } else if (value === 'shipping') {
          window.location.hash = '#shipping';
        }
      }} className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-white border border-[#e5ded7] rounded-md p-1">
          <TabsTrigger 
            value="orders" 
            className="rounded-sm bg-white text-[#a4785a] data-[state=active]:!bg-[#a4785a] data-[state=active]:!text-white data-[state=active]:shadow-sm transition-all duration-200 text-sm font-medium py-2"
          >
            Orders
          </TabsTrigger>
          <TabsTrigger 
            value="shipping"
            className="rounded-sm bg-white text-[#a4785a] data-[state=active]:!bg-[#a4785a] data-[state=active]:!text-white data-[state=active]:shadow-sm transition-all duration-200 text-sm font-medium py-2"
          >
            Shipping
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4 sm:mt-6">
          <OrdersSectionWithTabs />
        </TabsContent>
        <TabsContent value="shipping" className="mt-4 sm:mt-6">
          <ShippingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderInventoryManager;

// Export InventoryTab for use in standalone InventoryManager component
export const InventoryTab = InventoryTab_DEPRECATED;