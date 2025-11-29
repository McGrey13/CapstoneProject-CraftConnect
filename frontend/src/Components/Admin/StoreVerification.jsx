import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import api from '../../api';
import { useToast } from '../Context/ToastContext';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Image as ImageIcon,
  Download,
  Filter,
  Store,
  Users,
  AlertTriangle,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  TrendingUp,
  Package,
  DollarSign,
  Clock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

const StoreVerification = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStore, setSelectedStore] = useState(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [stats, setStats] = useState({});
  const [sellerDetails, setSellerDetails] = useState(null);
  const [loadingSellerDetails, setLoadingSellerDetails] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchStores();
    fetchStats();
  }, [searchTerm, statusFilter]);

  // Auto-refresh every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStores();
      fetchStats();
    }, 60000); // 60 seconds = 1 minute

    return () => clearInterval(interval);
  }, [searchTerm, statusFilter]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await api.get('/admin/stores', { params });
      setStores(response.data.data || []);
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/verification-stats');
      setStats(response.data);
    } catch (error) {
      // Error handling
    }
  };

  const handleApprove = async (storeId) => {
    try {
      await api.post(`/admin/stores/${storeId}/approve`);
      fetchStores();
      fetchStats();
      showToast('Store approved and seller verified successfully!', 'success');
    } catch (error) {
      showToast('Error approving store', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }

    try {
      await api.post(`/admin/stores/${selectedStore.storeID}/reject`, { reason: rejectReason });
      fetchStores();
      fetchStats();
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedStore(null);
      showToast('Store rejected successfully!', 'success');
    } catch (error) {
      showToast('Error rejecting store', 'error');
    }
  };

  const viewDocuments = async (store) => {
    try {
      setLoadingSellerDetails(true);
      const [documentsResponse, sellerDetailsResponse] = await Promise.all([
        api.get(`/admin/stores/${store.storeID}/documents`),
        api.get(`/admin/stores/${store.storeID}/seller-details`)
      ]);
      
      setSelectedStore({ 
        ...store, 
        documents: documentsResponse.data.documents 
      });
      setSellerDetails(sellerDetailsResponse.data);
      setShowDocuments(true);
    } catch (error) {
      // Error handling
    } finally {
      setLoadingSellerDetails(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-[#f5f0eb] text-[#7b5a3b] border border-[#d5bfae]', text: 'Pending' },
      approved: { color: 'bg-[#d5bfae] text-[#5c3d28] border border-[#a4785a]', text: 'Approved' },
      rejected: { color: 'bg-[#f5f0eb] text-[#7b5a3b] border border-[#d5bfae]', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const DocumentViewer = ({ documents, sellerDetails, loading, onReject }) => (
    <div className="space-y-8 px-1">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#d5bfae] border-t-[#a4785a] mx-auto mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Store className="h-7 w-7 text-[#a4785a] opacity-40" />
              </div>
            </div>
            <div className="text-[#5c3d28] font-semibold text-lg">Loading seller details...</div>
            <div className="text-[#7b5a3b] text-sm mt-2">Please wait while we fetch the information</div>
          </div>
        </div>
      ) : (
        <>
          {/* Action Bar */}
          {sellerDetails && sellerDetails.store.status === 'pending' && (
            <div className="bg-gradient-to-r from-[#f5f0eb] via-[#ede5dc] to-[#f5f0eb] border-2 border-[#d5bfae] rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#d5bfae] rounded-xl shadow-sm">
                    <AlertTriangle className="h-6 w-6 text-[#5c3d28]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#5c3d28] text-lg">Pending Verification</h4>
                    <p className="text-[#7b5a3b] text-sm">This store is awaiting your approval decision</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => onReject(sellerDetails.store)}
                    className="bg-white hover:bg-[#f5f0eb] text-[#5c3d28] border-2 border-[#d5bfae] hover:border-[#a4785a] shadow-md hover:shadow-lg transition-all duration-300 font-semibold px-6"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Reject Store
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleApprove(sellerDetails.store.storeID)}
                    className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-6"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Approve Store
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Seller Information */}
          {sellerDetails && (
            <div className="bg-gradient-to-br from-[#f5f0eb] via-[#ede5dc] to-[#e8ddd0] rounded-2xl p-8 border-2 border-[#d5bfae] shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-lg">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-[#5c3d28]">Seller Information</h3>
                  <p className="text-[#7b5a3b] mt-1">Complete profile and verification details</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Personal Details Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#d5bfae] hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-[#d5bfae]">
                    <div className="p-3 bg-[#f5f0eb] rounded-xl">
                      <User className="h-6 w-6 text-[#a4785a]" />
                    </div>
                    <h4 className="font-bold text-[#5c3d28] text-xl">Personal Details</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] rounded-xl p-5 border border-[#d5bfae]">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-lg shadow-sm">
                          <User className="h-5 w-5 text-[#a4785a]" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wider block mb-2">Full Name</span>
                          <span className="text-[#5c3d28] font-semibold text-lg">{sellerDetails.seller.user.userName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] rounded-xl p-5 border border-[#d5bfae]">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-lg shadow-sm">
                          <Mail className="h-5 w-5 text-[#a4785a]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wider block mb-2">Email Address</span>
                          <span className="text-[#5c3d28] font-medium text-base break-all">{sellerDetails.seller.user.userEmail}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] rounded-xl p-5 border border-[#d5bfae]">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-white rounded-lg shadow-sm">
                            <Phone className="h-5 w-5 text-[#a4785a]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wider block mb-2">Contact</span>
                            <span className="text-[#5c3d28] font-medium">{sellerDetails.seller.user.userContactNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] rounded-xl p-5 border border-[#d5bfae]">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-white rounded-lg shadow-sm">
                            <Calendar className="h-5 w-5 text-[#a4785a]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wider block mb-2">Member Since</span>
                            <span className="text-[#5c3d28] font-medium">{new Date(sellerDetails.seller.user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] rounded-xl p-5 border border-[#d5bfae]">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-lg shadow-sm">
                          <MapPin className="h-5 w-5 text-[#a4785a]" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wider block mb-2">Complete Address</span>
                          <p className="text-[#5c3d28] font-medium leading-relaxed">{sellerDetails.seller.user.userAddress}</p>
                          <p className="text-[#7b5a3b] text-sm mt-2">{sellerDetails.seller.user.userCity}, {sellerDetails.seller.user.userProvince}, {sellerDetails.seller.user.userRegion}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] rounded-xl p-4 border-2 border-[#d5bfae]">
                        <Shield className="h-6 w-6 text-[#a4785a] mx-auto mb-2" />
                        <span className="text-xs font-semibold text-[#7b5a3b] block mb-2">Account Status</span>
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                          sellerDetails.seller.user.is_verified ? 'bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white' : 'bg-[#d5bfae] text-[#5c3d28]'
                        }`}>
                          {sellerDetails.seller.user.is_verified ? '✓ Verified' : 'Unverified'}
                        </span>
                      </div>
                      <div className="text-center bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] rounded-xl p-4 border-2 border-[#d5bfae]">
                        <Store className="h-6 w-6 text-[#a4785a] mx-auto mb-2" />
                        <span className="text-xs font-semibold text-[#7b5a3b] block mb-2">Seller Status</span>
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                          sellerDetails.seller.is_verified ? 'bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white' : 'bg-[#d5bfae] text-[#5c3d28]'
                        }`}>
                          {sellerDetails.seller.is_verified ? '✓ Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Store Details Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#d5bfae] hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-[#d5bfae]">
                    <div className="p-3 bg-[#f5f0eb] rounded-xl">
                      <Store className="h-6 w-6 text-[#a4785a]" />
                    </div>
                    <h4 className="font-bold text-[#5c3d28] text-xl">Store Details</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] rounded-xl p-6 border-2 border-[#d5bfae] shadow-sm">
                      <div className="flex items-center gap-4 mb-3">
                        <Store className="h-6 w-6 text-[#a4785a]" />
                        <span className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wider">Store Name</span>
                      </div>
                      <h5 className="text-2xl font-bold text-[#5c3d28]">{sellerDetails.store.store_name}</h5>
                    </div>

                    <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] rounded-xl p-5 border border-[#d5bfae]">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-lg shadow-sm">
                          <User className="h-5 w-5 text-[#a4785a]" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wider block mb-2">Owner Name</span>
                          <span className="text-[#5c3d28] font-semibold text-lg">{sellerDetails.store.owner_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] rounded-xl p-5 border border-[#d5bfae]">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-white rounded-lg shadow-sm">
                            <Building2 className="h-5 w-5 text-[#a4785a]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wider block mb-2">TIN Number</span>
                            <span className="text-[#5c3d28] font-mono font-bold text-sm bg-white px-3 py-2 rounded-lg border border-[#d5bfae] inline-block">{sellerDetails.store.tin_number || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] rounded-xl p-5 border border-[#d5bfae]">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-white rounded-lg shadow-sm">
                            <Package className="h-5 w-5 text-[#a4785a]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wider block mb-2">Category</span>
                            <span className="inline-block bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md">{sellerDetails.store.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] rounded-xl p-5 border border-[#d5bfae]">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-lg shadow-sm">
                          <Shield className="h-5 w-5 text-[#a4785a]" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wider block mb-3">Verification Status</span>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-bold shadow-lg ${
                              sellerDetails.store.status === 'approved' ? 'bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white' :
                              sellerDetails.store.status === 'rejected' ? 'bg-[#d5bfae] text-[#5c3d28]' :
                              'bg-[#f5f0eb] text-[#7b5a3b] border-2 border-[#d5bfae]'
                            }`}>
                              {sellerDetails.store.status === 'approved' && <CheckCircle className="h-5 w-5" />}
                              {sellerDetails.store.status === 'rejected' && <XCircle className="h-5 w-5" />}
                              {sellerDetails.store.status === 'pending' && <Clock className="h-5 w-5" />}
                              {sellerDetails.store.status.charAt(0).toUpperCase() + sellerDetails.store.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {sellerDetails.store.rejection_reason && (
                      <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] rounded-xl p-6 border-2 border-[#d5bfae] shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 bg-white rounded-lg shadow-sm">
                            <AlertTriangle className="h-5 w-5 text-[#a4785a]" />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-semibold text-[#5c3d28] uppercase tracking-wider block mb-3">Rejection Reason</span>
                            <p className="text-[#5c3d28] font-medium leading-relaxed bg-white p-4 rounded-lg border border-[#d5bfae]">{sellerDetails.store.rejection_reason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Store Documents */}
          <div className="bg-gradient-to-br from-[#f5f0eb] via-[#ede5dc] to-[#f5f0eb] rounded-2xl p-8 border-2 border-[#d5bfae] shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-[#5c3d28]">Store Documents</h3>
                <p className="text-[#7b5a3b] mt-1">Official business and identification documents</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {documents.logo && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#d5bfae] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-[#d5bfae]">
                    <div className="p-2.5 bg-[#f5f0eb] rounded-xl">
                      <ImageIcon className="h-5 w-5 text-[#a4785a]" />
                    </div>
                    <h4 className="font-bold text-[#5c3d28] text-lg">Store Logo</h4>
                  </div>
                  <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] border-2 border-[#d5bfae] rounded-xl p-6 flex items-center justify-center min-h-[200px]">
                    <img 
                      src={documents.logo.url} 
                      alt="Store Logo" 
                      className="max-w-full max-h-48 object-contain drop-shadow-lg"
                    />
                  </div>
                </div>
              )}
              
              {documents.bir_permit && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#d5bfae] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-[#d5bfae]">
                    <div className="p-2.5 bg-[#f5f0eb] rounded-xl">
                      <Building2 className="h-5 w-5 text-[#a4785a]" />
                    </div>
                    <h4 className="font-bold text-[#5c3d28] text-lg">BIR Permit</h4>
                  </div>
                  <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] border-2 border-[#d5bfae] rounded-xl p-6 flex items-center justify-center min-h-[280px]">
                    {documents.bir_permit.type === 'image' ? (
                      <img 
                        src={documents.bir_permit.url} 
                        alt="BIR Permit" 
                        className="max-w-full max-h-64 object-contain drop-shadow-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center space-y-5">
                        <div className="p-6 bg-white rounded-2xl shadow-md">
                          <FileText className="h-20 w-20 text-[#a4785a]" />
                        </div>
                        <a 
                          href={documents.bir_permit.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white rounded-xl hover:from-[#8f674a] hover:to-[#6a4c34] shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base"
                        >
                          <Download className="h-5 w-5" />
                          View BIR Permit PDF
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {documents.dti_permit && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#d5bfae] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-[#d5bfae]">
                    <div className="p-2.5 bg-[#f5f0eb] rounded-xl">
                      <Building2 className="h-5 w-5 text-[#a4785a]" />
                    </div>
                    <h4 className="font-bold text-[#5c3d28] text-lg">DTI Permit</h4>
                  </div>
                  <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] border-2 border-[#d5bfae] rounded-xl p-6 flex items-center justify-center min-h-[280px]">
                    {documents.dti_permit.type === 'image' ? (
                      <img 
                        src={documents.dti_permit.url} 
                        alt="DTI Permit" 
                        className="max-w-full max-h-64 object-contain drop-shadow-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center space-y-5">
                        <div className="p-6 bg-white rounded-2xl shadow-md">
                          <FileText className="h-20 w-20 text-[#a4785a]" />
                        </div>
                        <a 
                          href={documents.dti_permit.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white rounded-xl hover:from-[#8f674a] hover:to-[#6a4c34] shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base"
                        >
                          <Download className="h-5 w-5" />
                          View DTI Permit PDF
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {documents.id_document && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#d5bfae] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-[#d5bfae]">
                    <div className="p-2.5 bg-[#f5f0eb] rounded-xl">
                      <User className="h-5 w-5 text-[#a4785a]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#5c3d28] text-lg">ID Document</h4>
                      {documents.id_document.id_type && (
                        <span className="text-xs font-semibold text-[#7b5a3b] bg-[#f5f0eb] px-3 py-1 rounded-full inline-block mt-1 border border-[#d5bfae]">{documents.id_document.id_type}</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] border-2 border-[#d5bfae] rounded-xl p-6 flex items-center justify-center min-h-[280px]">
                    {documents.id_document.type === 'image' ? (
                      <img 
                        src={documents.id_document.url} 
                        alt="ID Document" 
                        className="max-w-full max-h-64 object-contain drop-shadow-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center space-y-5">
                        <div className="p-6 bg-white rounded-2xl shadow-md">
                          <FileText className="h-20 w-20 text-[#a4785a]" />
                        </div>
                        <a 
                          href={documents.id_document.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white rounded-xl hover:from-[#8f674a] hover:to-[#6a4c34] shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base"
                        >
                          <Download className="h-5 w-5" />
                          View ID Document PDF
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      {/* Test Button - Remove in production */}
      <Card className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] border-[#d5bfae]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-[#5c3d28] mb-1">Test Notification</div>
              <div className="text-xs text-[#7b5a3b]">Click to test the toast notification</div>
            </div>
            <Button
              onClick={() => showToast('Store approved and seller verified successfully!', 'success')}
              className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Test Success Toast
            </Button>
          </div>
        </CardContent>
      </Card>
  
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] border-[#d5bfae] hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-[#5c3d28]">{stats.total_stores || 0}</div>
                <div className="text-sm text-[#7b5a3b] font-medium">Total Stores</div>
              </div>
              <div className="p-3 bg-[#d5bfae] rounded-full">
                <Store className="h-6 w-6 text-[#5c3d28]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] border-[#d5bfae] hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-[#7b5a3b]">{stats.pending_stores || 0}</div>
                <div className="text-sm text-[#7b5a3b] font-medium">Pending Review</div>
              </div>
              <div className="p-3 bg-[#d5bfae] rounded-full">
                <Clock className="h-6 w-6 text-[#a4785a]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] border-[#d5bfae] hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-[#5c3d28]">{stats.approved_stores || 0}</div>
                <div className="text-sm text-[#7b5a3b] font-medium">Approved</div>
              </div>
              <div className="p-3 bg-[#d5bfae] rounded-full">
                <CheckCircle className="h-6 w-6 text-[#a4785a]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] border-[#d5bfae] hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-[#5c3d28]">{stats.rejected_stores || 0}</div>
                <div className="text-sm text-[#7b5a3b] font-medium">Rejected</div>
              </div>
              <div className="p-3 bg-[#d5bfae] rounded-full">
                <XCircle className="h-6 w-6 text-[#a4785a]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm border-[#d5bfae]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7b5a3b] h-5 w-5" />
                <Input
                  placeholder="Search stores, owners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-[#d5bfae] focus:border-[#a4785a] focus:ring-[#a4785a] rounded-lg"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-[#7b5a3b]" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 h-12 border-[#d5bfae] focus:border-[#a4785a] focus:ring-[#a4785a] rounded-lg">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>
          <div className="mt-3 text-xs text-[#7b5a3b] flex items-center gap-2">
          </div>
        </CardContent>
      </Card>

      {/* Stores Table */}
      <Card className="shadow-lg border-[#d5bfae]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#f5f0eb] to-[#ede5dc] border-b border-[#d5bfae]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#5c3d28] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                    Store
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#5c3d28] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                    Owner
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#5c3d28] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                    Status
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#5c3d28] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                    TIN
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#5c3d28] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                    Created
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#5c3d28] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#d5bfae]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-[#7b5a3b]">
                      Loading...
                    </td>
                  </tr>
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-[#7b5a3b]">
                      No stores found
                    </td>
                  </tr>
                ) : (
                  stores.map((store) => (
                    <tr key={store.storeID} className="hover:bg-[#f5f0eb] transition-colors duration-200 border-b border-[#d5bfae]">
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          {store.logo_url ? (
                            <img 
                              className="h-12 w-12 rounded-full object-cover mr-4 border-2 border-[#d5bfae]" 
                              src={store.logo_url} 
                              alt={store.store_name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] flex items-center justify-center mr-4 border-2 border-[#d5bfae]">
                              <Store className="h-6 w-6 text-[#7b5a3b]" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-[#5c3d28] mb-1">
                              {store.store_name}
                            </div>
                            <div className="text-xs text-[#7b5a3b] bg-[#f5f0eb] px-2 py-1 rounded-full inline-block border border-[#d5bfae]">
                              {store.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-[#f5f0eb] flex items-center justify-center mr-3 border border-[#d5bfae]">
                            <User className="h-4 w-4 text-[#a4785a]" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#5c3d28]">{store.owner_name}</div>
                            <div className="text-xs text-[#7b5a3b] flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {store.owner_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        {getStatusBadge(store.status)}
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="text-sm font-mono text-[#5c3d28] bg-[#f5f0eb] px-2 py-1 rounded border border-[#d5bfae]">
                        {store.tin_number || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="text-sm text-[#7b5a3b] flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                        {new Date(store.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDocuments(store)}
                            className="bg-[#f5f0eb] hover:bg-[#ede5dc] text-[#5c3d28] border-[#d5bfae] hover:border-[#a4785a] transition-all duration-200"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {store.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(store.storeID)}
                                className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white border-0 transition-all duration-200"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStore(store);
                                setShowRejectDialog(true);
                              }}
                                className="bg-[#f5f0eb] hover:bg-[#ede5dc] text-[#5c3d28] border-[#d5bfae] hover:border-[#a4785a] transition-all duration-200"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Document Viewer Dialog */}
      <Dialog open={showDocuments} onOpenChange={setShowDocuments}>
        <DialogContent
          className="w-[96vw] h-[92vh] max-w-none overflow-y-auto p-0 mt-8 bg-gradient-to-br from-[#f5f0eb] to-white rounded-3xl shadow-2xl border-2 border-[#d5bfae]"
        >
          <DialogHeader className="pb-6 pt-6 px-8 sticky top-0 bg-gradient-to-r from-white via-[#f5f0eb] to-white z-20 shadow-md border-b-2 border-[#d5bfae] rounded-t-3xl backdrop-blur-sm bg-opacity-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#a4785a] rounded-2xl blur-md opacity-30 animate-pulse"></div>
                  <div className="relative p-4 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-lg">
                    <Store className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold text-[#5c3d28] mb-1">
                    {selectedStore?.store_name}
                  </DialogTitle>
                  <p className="text-[#7b5a3b] text-base font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Review seller information and documents
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowDocuments(false)}
                className="bg-white hover:bg-[#f5f0eb] text-[#5c3d28] border-2 border-[#d5bfae] hover:border-[#a4785a] shadow-md hover:shadow-lg transition-all duration-300 font-semibold px-6 rounded-xl"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Close
              </Button>
            </div>
          </DialogHeader>

          {selectedStore?.documents && (
            <div className="px-8 py-6">
              <DocumentViewer
                documents={selectedStore.documents}
                sellerDetails={sellerDetails}
                loading={loadingSellerDetails}
                onReject={(store) => {
                  setSelectedStore(store);
                  setShowRejectDialog(true);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent className="max-w-2xl bg-white rounded-2xl shadow-2xl border-2 border-[#d5bfae]">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-lg">
                <XCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <AlertDialogTitle className="text-3xl font-bold text-[#5c3d28]">Reject Store Application</AlertDialogTitle>
                <AlertDialogDescription className="text-base text-[#7b5a3b] mt-2">
                  Please provide a detailed reason for rejecting this store. This message will be sent to the seller to help them understand the decision.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="py-6">
            <div className="bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] rounded-xl p-6 border-2 border-[#d5bfae]">
              <label className="block mb-3 text-sm font-bold text-[#5c3d28] uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#a4785a]" />
                Rejection Reason
              </label>
              <textarea
                className="w-full p-4 border-2 border-[#d5bfae] rounded-xl focus:border-[#a4785a] focus:ring-4 focus:ring-[#f5f0eb] transition-all duration-200 bg-white text-[#5c3d28] placeholder-[#7b5a3b] font-medium resize-none"
                rows="6"
                placeholder="Example: The submitted business documents are unclear or expired. Please resubmit clear, valid documents..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <p className="text-xs text-[#7b5a3b] mt-2 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Be specific and constructive to help the seller improve their application
              </p>
            </div>
          </div>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="px-6 py-3 rounded-xl bg-[#f5f0eb] hover:bg-[#ede5dc] text-[#5c3d28] font-semibold border-2 border-[#d5bfae] hover:border-[#a4785a] transition-all duration-300 shadow-sm hover:shadow-md">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReject}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            >
              <XCircle className="h-4 w-4 mr-2 inline" />
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StoreVerification;
