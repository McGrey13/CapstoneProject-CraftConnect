import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  Eye, RefreshCw, X, AlertTriangle, 
  Star, Filter, Calendar, Clock, 
  CheckCircle, XCircle, MessageSquare,
  Download, ArrowLeft, ArrowRight,
  Video, Image as ImageIcon, Play, Flag, Shield
} from "lucide-react";
import api from "../../api";
import "./AdminTableDesign.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [filters, setFilters] = useState({
    rating: 'all',
    flagged: 'all',
    searchTerm: '',
    dateFilter: 'all',
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allReviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all reviews from all products
      const response = await api.get('/admin/reviews');
      const reviewsData = response.data.data || response.data || [];
      setAllReviews(reviewsData);
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allReviews];

    // Rating filter
    if (filters.rating !== 'all') {
      filtered = filtered.filter(r => r.rating === parseInt(filters.rating));
    }

    // Flagged filter
    if (filters.flagged === 'flagged') {
      filtered = filtered.filter(r => r.is_flagged === true);
    } else if (filters.flagged === 'not_flagged') {
      filtered = filtered.filter(r => !r.is_flagged);
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.comment?.toLowerCase().includes(searchLower) ||
        r.user?.userName?.toLowerCase().includes(searchLower) ||
        r.product?.productName?.toLowerCase().includes(searchLower)
      );
    }

    // Date filter
    if (filters.dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(r => new Date(r.review_date) >= today);
    } else if (filters.dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(r => new Date(r.review_date) >= weekAgo);
    } else if (filters.dateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(r => new Date(r.review_date) >= monthAgo);
    } else if (filters.dateFilter === 'custom' && filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => {
        const reviewDate = new Date(r.review_date);
        return reviewDate >= start && reviewDate <= end;
      });
    }

    setReviews(filtered);
    setCurrentPage(1);
  };

  const handleFlagReview = async () => {
    if (!selectedReview || !flagReason.trim()) {
      alert('Please provide a reason for flagging this review');
      return;
    }

    try {
      await api.post(`/admin/reviews/${selectedReview.review_id}/flag`, {
        reason: flagReason
      });
      showToast('Review flagged successfully', 'success');
      setFlagDialogOpen(false);
      setFlagReason('');
      fetchReviews();
    } catch (err) {
      showToast('Error flagging review', 'error');
    }
  };

  const handleUnflagReview = async (reviewId) => {
    try {
      await api.post(`/admin/reviews/${reviewId}/unflag`);
      showToast('Review unflagged successfully', 'success');
      fetchReviews();
    } catch (err) {
      showToast('Error unflagging review', 'error');
    }
  };


  const showToast = (message, type = 'info') => {
    // Simple toast implementation
    alert(message);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-50';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRatingBadge = (rating) => {
    return (
      <Badge className={`${getRatingColor(rating)} flex items-center gap-1 w-fit`}>
        <Star className="h-3 w-3 fill-current" />
        {rating}/5
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fixImageUrl = (url) => {
    if (!url) return url;
    // If it's already a full URL with localhost:8000, use it directly
    if (url.includes('localhost:8000')) {
      return url;
    }
    // If it's a full URL with localhost:8080, convert to 8000
    if (url.includes('localhost:8080')) {
      return url.replace('localhost:8080', 'localhost:8000');
    }
    // If it's already a relative path starting with /storage/, use it
    if (url.startsWith('/storage/') || url.startsWith('/images/')) {
      return url;
    }
    // If it's a path without leading slash, add /storage/
    if (url && !url.startsWith('http') && !url.startsWith('/')) {
      return `/storage/${url}`;
    }
    return url;
  };

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return reviews.slice(startIndex, startIndex + itemsPerPage);
  }, [reviews, currentPage]);

  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-[#9F2936]" />
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <div className="admin-table-header">
        <div>
          <h2 className="admin-table-title">Reviews & Ratings Management</h2>
          <p className="admin-table-description">
            Monitor and manage product reviews and ratings
          </p>
        </div>
        <Button onClick={fetchReviews} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Rating</label>
            <Select value={filters.rating} onValueChange={(value) => setFilters({...filters, rating: value})}>
              <SelectTrigger className="bg-white border-gray-200 hover:bg-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all" className="bg-white hover:bg-gray-100">All Ratings</SelectItem>
                <SelectItem value="5" className="bg-white hover:bg-gray-100">5 Stars</SelectItem>
                <SelectItem value="4" className="bg-white hover:bg-gray-100">4 Stars</SelectItem>
                <SelectItem value="3" className="bg-white hover:bg-gray-100">3 Stars</SelectItem>
                <SelectItem value="2" className="bg-white hover:bg-gray-100">2 Stars</SelectItem>
                <SelectItem value="1" className="bg-white hover:bg-gray-100">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Flagged Status</label>
            <Select value={filters.flagged} onValueChange={(value) => setFilters({...filters, flagged: value})}>
              <SelectTrigger className="bg-white border-gray-200 hover:bg-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all" className="bg-white hover:bg-gray-100">All Reviews</SelectItem>
                <SelectItem value="flagged" className="bg-white hover:bg-gray-100">Flagged Only</SelectItem>
                <SelectItem value="not_flagged" className="bg-white hover:bg-gray-100">Not Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Date Range</label>
            <Select value={filters.dateFilter} onValueChange={(value) => setFilters({...filters, dateFilter: value})}>
              <SelectTrigger className="bg-white border-gray-200 hover:bg-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all" className="bg-white hover:bg-gray-100">All Time</SelectItem>
                <SelectItem value="today" className="bg-white hover:bg-gray-100">Today</SelectItem>
                <SelectItem value="week" className="bg-white hover:bg-gray-100">Last 7 Days</SelectItem>
                <SelectItem value="month" className="bg-white hover:bg-gray-100">Last 30 Days</SelectItem>
                <SelectItem value="custom" className="bg-white hover:bg-gray-100">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
            <Input
              placeholder="Search reviews..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
            />
          </div>
        </div>

        {filters.dateFilter === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">Total Reviews</div>
          <div className="text-2xl font-bold text-[#9F2936]">{allReviews.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">Flagged Reviews</div>
          <div className="text-2xl font-bold text-orange-600">
            {allReviews.filter(r => r.is_flagged).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">Average Rating</div>
          <div className="text-2xl font-bold text-green-600">
            {allReviews.length > 0 
              ? (allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length).toFixed(1)
              : '0.0'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">5 Star Reviews</div>
          <div className="text-2xl font-bold text-yellow-600">
            {allReviews.filter(r => r.rating === 5).length}
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      {error ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No reviews found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Review ID</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Media</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReviews.map((review) => (
                  <tr key={review.review_id}>
                    <td>
                      <span className="font-mono text-xs text-[#a4785a] font-semibold">
                        #{review.review_id}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium text-[#5c3d28]">
                          {review.product?.productName || 'N/A'}
                        </span>
                        {review.product?.product_id && (
                          <span className="text-xs text-gray-500">
                            ID: {review.product.product_id}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium text-[#5c3d28]">
                          {review.user?.userName || 'N/A'}
                        </span>
                        {review.user?.userEmail && (
                          <span className="text-xs text-gray-500">
                            {review.user.userEmail}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{getRatingBadge(review.rating)}</td>
                    <td>
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {review.comment || 'No comment'}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            {review.images.length}
                          </Badge>
                        )}
                        {review.video_path && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            Video
                          </Badge>
                        )}
                        {(!review.images || review.images.length === 0) && !review.video_path && (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-600">
                        {formatDate(review.review_date)}
                      </div>
                    </td>
                    <td>
                      {review.is_flagged ? (
                        <Badge className="bg-red-100 text-red-700 flex items-center gap-1 w-fit">
                          <Flag className="h-3 w-3" />
                          Flagged
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedReview(review);
                              setViewModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {!review.is_flagged ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedReview(review);
                                setFlagDialogOpen(true);
                              }}
                            >
                              <Flag className="h-4 w-4 mr-2" />
                              Flag Review
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleUnflagReview(review.review_id)}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Unflag Review
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, reviews.length)} of {reviews.length} reviews
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Review Dialog */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Review ID: #{selectedReview?.review_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Product</label>
                  <p className="text-sm text-gray-900">{selectedReview.product?.productName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-sm text-gray-900">{selectedReview.user?.userName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Rating</label>
                  <div className="mt-1">{getRatingBadge(selectedReview.rating)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedReview.review_date)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Comment</label>
                <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                  {selectedReview.comment || 'No comment provided'}
                </p>
              </div>

              {selectedReview.images && Array.isArray(selectedReview.images) && selectedReview.images.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Images</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedReview.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={fixImageUrl(img)}
                        alt={`Review image ${idx + 1}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedReview.video_path && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Video</label>
                  <video
                    src={fixImageUrl(selectedReview.video_path)}
                    controls
                    className="w-full mt-2 rounded border"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {selectedReview.is_flagged && selectedReview.flag_reason && (
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <label className="text-sm font-medium text-red-700">Flag Reason</label>
                  <p className="text-sm text-red-900 mt-1">{selectedReview.flag_reason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Review Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Review</DialogTitle>
            <DialogDescription>
              Provide a reason for flagging this review
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Reason</label>
              <Textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Enter reason for flagging this review..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setFlagDialogOpen(false);
              setFlagReason('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleFlagReview}>
              Flag Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminReviews;

