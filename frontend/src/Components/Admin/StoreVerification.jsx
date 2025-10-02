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
  Filter
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
      const response = await api.get(`/admin/stores/${store.storeID}/documents`);
      setSelectedStore({ ...store, documents: response.data.documents });
      setShowDocuments(true);
    } catch (error) {
      console.error('Error fetching documents:', error);
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

  const DocumentViewer = ({ documents }) => (
    <div className="space-y-4">
      {documents.logo && (
        <div>
          <h4 className="font-semibold mb-2">Store Logo</h4>
          <div className="border rounded-lg p-4">
            <img 
              src={documents.logo.url} 
              alt="Store Logo" 
              className="max-w-full h-32 object-contain"
            />
          </div>
        </div>
      )}
      
      {documents.bir_permit && (
        <div>
          <h4 className="font-semibold mb-2">BIR Permit</h4>
          <div className="border rounded-lg p-4">
            {documents.bir_permit.type === 'image' ? (
              <img 
                src={documents.bir_permit.url} 
                alt="BIR Permit" 
                className="max-w-full h-64 object-contain"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8" />
                <a 
                  href={documents.bir_permit.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View BIR Permit PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      
      {documents.dti_permit && (
        <div>
          <h4 className="font-semibold mb-2">DTI Permit</h4>
          <div className="border rounded-lg p-4">
            {documents.dti_permit.type === 'image' ? (
              <img 
                src={documents.dti_permit.url} 
                alt="DTI Permit" 
                className="max-w-full h-64 object-contain"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8" />
                <a 
                  href={documents.dti_permit.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View DTI Permit PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      
      {documents.id_document && (
        <div>
          <h4 className="font-semibold mb-2">
            ID Document {documents.id_document.id_type && `(${documents.id_document.id_type})`}
          </h4>
          <div className="border rounded-lg p-4">
            {documents.id_document.type === 'image' ? (
              <img 
                src={documents.id_document.url} 
                alt="ID Document" 
                className="max-w-full h-64 object-contain"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8" />
                <a 
                  href={documents.id_document.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View ID Document PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total_stores || 0}</div>
            <div className="text-sm text-gray-600">Total Stores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_stores || 0}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved_stores || 0}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected_stores || 0}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search stores, owners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
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
        </CardContent>
      </Card>

      {/* Stores Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TIN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <tr key={store.storeID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {store.logo_url ? (
                            <img 
                              className="h-10 w-10 rounded-full object-cover mr-3" 
                              src={store.logo_url} 
                              alt={store.store_name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {store.store_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {store.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{store.owner_name}</div>
                        <div className="text-sm text-gray-500">{store.owner_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(store.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {store.tin_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(store.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDocuments(store)}
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
                              className="text-green-600 hover:text-green-700"
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
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Store Documents - {selectedStore?.store_name}
            </DialogTitle>
          </DialogHeader>
          {selectedStore?.documents && (
            <DocumentViewer documents={selectedStore.documents} />
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
