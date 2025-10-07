import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import api from '../../api';
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
  Clock,
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
  DollarSign
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

  useEffect(() => {
    fetchStores();
    fetchStats();
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
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/verification-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (storeId) => {
    try {
      await api.post(`/admin/stores/${storeId}/approve`);
      fetchStores();
      fetchStats();
      alert('Store approved and seller verified successfully!');
    } catch (error) {
      console.error('Error approving store:', error);
      alert('Error approving store');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      await api.post(`/admin/stores/${selectedStore.storeID}/reject`, { reason: rejectReason });
      fetchStores();
      fetchStats();
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedStore(null);
      alert('Store rejected successfully!');
    } catch (error) {
      console.error('Error rejecting store:', error);
      alert('Error rejecting store');
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
      console.error('Error fetching documents and seller details:', error);
    } finally {
      setLoadingSellerDetails(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const DocumentViewer = ({ documents, sellerDetails, loading, onReject }) => (
    <div className="space-y-6 px-2">
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600 font-medium">Loading seller details...</div>
          </div>
        </div>
      ) : (
        <>
          {/* Seller Information */}
          {sellerDetails && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-200 rounded-full">
                    <User className="h-6 w-6 text-blue-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Seller Information</h3>
                </div>
                {sellerDetails.store.status === 'pending' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onReject(sellerDetails.store)}
                    className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Store
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-8 flex items-center gap-3 text-lg">
                    <User className="h-6 w-6 text-blue-600" />
                    Personal Details
                  </h4>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="flex items-start gap-4">
                        <User className="h-5 w-5 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-700 block mb-2 text-base">Name:</span>
                          <span className="text-gray-900 text-base">{sellerDetails.seller.user.userName}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Mail className="h-5 w-5 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-700 block mb-2 text-base">Email:</span>
                          <span className="text-gray-900 text-base break-all">{sellerDetails.seller.user.userEmail}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="flex items-start gap-4">
                        <Phone className="h-5 w-5 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-700 block mb-2 text-base">Contact:</span>
                          <span className="text-gray-900 text-base">{sellerDetails.seller.user.userContactNumber}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-700 block mb-2 text-base">Address:</span>
                          <span className="text-gray-900 text-base">{sellerDetails.seller.user.userAddress}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0 mt-1" />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-gray-700 block mb-2 text-base">Location:</span>
                        <span className="text-gray-900 text-base">{sellerDetails.seller.user.userCity}, {sellerDetails.seller.user.userProvince}, {sellerDetails.seller.user.userRegion}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="flex items-start gap-4">
                        <Shield className="h-5 w-5 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-700 block mb-2 text-base">Account Status:</span>
                          <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                            sellerDetails.seller.user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sellerDetails.seller.user.is_verified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Shield className="h-5 w-5 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-700 block mb-2 text-base">Seller Status:</span>
                          <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                            sellerDetails.seller.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sellerDetails.seller.is_verified ? 'Verified Seller' : 'Pending Verification'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-8 flex items-center gap-3 text-lg">
                    <Store className="h-6 w-6 text-blue-600" />
                    Store Details
                  </h4>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="flex items-start gap-4">
                        <Store className="h-5 w-5 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-700 block mb-2 text-base">Store Name:</span>
                          <span className="text-gray-900 text-base">{sellerDetails.store.store_name}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <User className="h-5 w-5 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-700 block mb-2 text-base">Owner Name:</span>
                          <span className="text-gray-900 text-base">{sellerDetails.store.owner_name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="flex items-start gap-4">
                        <Building2 className="h-5 w-5 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-700 block mb-2 text-base">TIN Number:</span>
                          <span className="text-gray-900 text-base font-mono bg-gray-100 px-3 py-2 rounded">{sellerDetails.store.tin_number || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Package className="h-5 w-5 text-gray-500 flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-700 block mb-2 text-base">Category:</span>
                          <span className="text-gray-900 text-base bg-blue-100 px-3 py-2 rounded-full">{sellerDetails.store.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Shield className="h-5 w-5 text-gray-500 flex-shrink-0 mt-1" />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-gray-700 block mb-2 text-base">Status:</span>
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                          sellerDetails.store.status === 'approved' ? 'bg-green-100 text-green-800' :
                          sellerDetails.store.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sellerDetails.store.status.charAt(0).toUpperCase() + sellerDetails.store.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    {sellerDetails.store.rejection_reason && (
                      <div className="flex items-start gap-4">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-700 block mb-2 text-base">Rejection Reason:</span>
                          <p className="text-red-700 bg-red-50 p-4 rounded text-base">{sellerDetails.store.rejection_reason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Store Documents */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gray-200 rounded-full">
                <FileText className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Store Documents</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {documents.logo && (
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <h4 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                    Store Logo
                  </h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <img 
              src={documents.logo.url} 
              alt="Store Logo" 
                      className="max-w-full h-40 object-contain mx-auto"
            />
          </div>
        </div>
      )}
      
      {documents.bir_permit && (
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <h4 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    BIR Permit
                  </h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            {documents.bir_permit.type === 'image' ? (
              <img 
                src={documents.bir_permit.url} 
                alt="BIR Permit" 
                        className="max-w-full h-64 object-contain mx-auto"
              />
            ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <FileText className="h-16 w-16 text-gray-400" />
                <a 
                  href={documents.bir_permit.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                          <Download className="h-4 w-4" />
                  View BIR Permit PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      
      {documents.dti_permit && (
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <h4 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    DTI Permit
                  </h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            {documents.dti_permit.type === 'image' ? (
              <img 
                src={documents.dti_permit.url} 
                alt="DTI Permit" 
                        className="max-w-full h-64 object-contain mx-auto"
              />
            ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <FileText className="h-16 w-16 text-gray-400" />
                <a 
                  href={documents.dti_permit.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                          <Download className="h-4 w-4" />
                  View DTI Permit PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      
      {documents.id_document && (
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <h4 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <User className="h-5 w-5 text-orange-600" />
            ID Document {documents.id_document.id_type && `(${documents.id_document.id_type})`}
          </h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            {documents.id_document.type === 'image' ? (
              <img 
                src={documents.id_document.url} 
                alt="ID Document" 
                        className="max-w-full h-64 object-contain mx-auto"
              />
            ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <FileText className="h-16 w-16 text-gray-400" />
                <a 
                  href={documents.id_document.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
                >
                          <Download className="h-4 w-4" />
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
  
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-700">{stats.total_stores || 0}</div>
                <div className="text-sm text-blue-600 font-medium">Total Stores</div>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Store className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-700">{stats.pending_stores || 0}</div>
                <div className="text-sm text-yellow-600 font-medium">Pending Review</div>
              </div>
              <div className="p-3 bg-yellow-200 rounded-full">
                <Clock className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-700">{stats.approved_stores || 0}</div>
                <div className="text-sm text-green-600 font-medium">Approved</div>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-700">{stats.rejected_stores || 0}</div>
                <div className="text-sm text-red-600 font-medium">Rejected</div>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <XCircle className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search stores, owners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
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
        </CardContent>
      </Card>

      {/* Stores Table */}
      <Card className="shadow-lg border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                    Store
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                    Owner
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                    Status
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                    TIN
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                    Created
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No stores found
                    </td>
                  </tr>
                ) : (
                  stores.map((store) => (
                    <tr key={store.storeID} className="hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100">
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          {store.logo_url ? (
                            <img 
                              className="h-12 w-12 rounded-full object-cover mr-4 border-2 border-gray-200" 
                              src={store.logo_url} 
                              alt={store.store_name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mr-4 border-2 border-gray-200">
                              <Store className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-gray-900 mb-1">
                              {store.store_name}
                            </div>
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                              {store.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{store.owner_name}</div>
                            <div className="text-xs text-gray-500 flex items-center">
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
                        <div className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {store.tin_number || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-600 flex items-center">
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
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 transition-all duration-200"
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
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300 transition-all duration-200"
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
                                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300 transition-all duration-200"
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
        <DialogContent className="max-w-[98vw] w-full max-h-[90vh] overflow-y-auto mt-16 mb-8 mx-2" style={{ marginTop: '4rem' }}>
          <DialogHeader className="pb-6 pt-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  Store Verification - {selectedStore?.store_name}
            </DialogTitle>
                <p className="text-gray-600 mt-1">Review seller information and documents</p>
              </div>
            </div>
          </DialogHeader>
          {selectedStore?.documents && (
            <DocumentViewer 
              documents={selectedStore.documents} 
              sellerDetails={sellerDetails}
              loading={loadingSellerDetails}
              onReject={(store) => {
                setSelectedStore(store);
                setShowRejectDialog(true);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Store</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this store. This will be sent to the seller.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <textarea
              className="w-full p-3 border rounded-md"
              rows="4"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject}>
              Reject Store
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StoreVerification;
