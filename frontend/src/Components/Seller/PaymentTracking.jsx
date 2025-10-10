import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Wallet, 
  Search, 
  Download, 
  RefreshCw, 
  TrendingUp,
  DollarSign,
  CreditCard,
  Eye,
  Filter,
  Calendar
} from "lucide-react";
import api from "../../api";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";

const PaymentTracking = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    gcashPayments: 0,
    paymayaPayments: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/seller/payments");
      
      if (response.data && response.data.success) {
        setPayments(response.data.payments || []);
        setStats(response.data.stats || stats);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError("Failed to fetch payments. Please try again.");
      
      // Mock data for demonstration
      const mockPayments = [
        {
          id: 1,
          payment_id: 1,
          reference_number: "PAY-20251009-GCAS-A1B2C3",
          order_id: "ORD-20251009-X1Y2Z3",
          customer_name: "Maria Santos",
          amount: 1250.00,
          payment_method: "gcash",
          payment_status: "paid",
          created_at: "2025-10-09 10:30:00"
        },
        {
          id: 2,
          payment_id: 2,
          reference_number: "PAY-20251009-PAYM-B4C5D6",
          order_id: "ORD-20251009-Y3Z4W5",
          customer_name: "Juan Dela Cruz",
          amount: 850.50,
          payment_method: "paymaya",
          payment_status: "paid",
          created_at: "2025-10-09 11:45:00"
        },
        {
          id: 3,
          payment_id: 3,
          reference_number: "PAY-20251009-GCAS-E7F8G9",
          order_id: "ORD-20251009-Z6W7V8",
          customer_name: "Anna Reyes",
          amount: 2100.00,
          payment_method: "gcash",
          payment_status: "processing",
          created_at: "2025-10-09 14:20:00"
        }
      ];
      setPayments(mockPayments);
      setStats({
        totalEarnings: 4200.50,
        pendingPayouts: 850.00,
        gcashPayments: 3350.00,
        paymayaPayments: 850.50
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodBadge = (method) => {
    const methodLower = method?.toLowerCase();
    if (methodLower === "gcash") {
      return <Badge className="bg-blue-500 text-white">GCash</Badge>;
    } else if (methodLower === "paymaya") {
      return <Badge className="bg-green-500 text-white">PayMaya</Badge>;
    }
    return <Badge>{method}</Badge>;
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.order_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = paymentTypeFilter === "all" || 
      payment.payment_method?.toLowerCase() === paymentTypeFilter.toLowerCase();
    
    const matchesStatus = statusFilter === "all" || 
      payment.payment_status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setIsViewModalOpen(true);
  };

  const exportPayments = () => {
    // CSV export functionality
    const csvContent = [
      ["Payment Reference", "Order ID", "Customer", "Amount", "Method", "Status", "Date"],
      ...filteredPayments.map(p => [
        p.reference_number,
        p.order_id,
        p.customer_name,
        `₱${parseFloat(p.amount).toFixed(2)}`,
        p.payment_method,
        p.payment_status,
        new Date(p.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="w-full pt-4">
        <LoadingSpinner message="Loading payments..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Wallet className="h-8 w-8 mr-3" />
          Payment Tracking
        </h1>
        <p className="text-white/90 mt-2 text-lg">
          Track all e-wallet payments from your customers
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#e5ded7] shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-[#5c3d28]">
                  ₱{parseFloat(stats.totalEarnings).toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e5ded7] shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold text-[#5c3d28]">
                  ₱{parseFloat(stats.pendingPayouts).toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e5ded7] shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">GCash Payments</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₱{parseFloat(stats.gcashPayments).toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e5ded7] shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">PayMaya Payments</p>
                <p className="text-2xl font-bold text-green-600">
                  ₱{parseFloat(stats.paymayaPayments).toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-[#a4785a]" />
          <Input
            placeholder="Search by payment reference, order ID, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 border-2 border-[#d5bfae] rounded-lg focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {(paymentTypeFilter !== "all" || statusFilter !== "all") && (
                <Badge className="ml-2 bg-[#a4785a] text-white">
                  {(paymentTypeFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
                </Badge>
              )}
            </Button>
            {isFilterOpen && (
              <div className="absolute top-full mt-2 right-0 bg-white border-2 border-[#d5bfae] rounded-lg shadow-xl z-10 min-w-[250px] p-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-[#5c3d28] mb-2">Payment Method</p>
                    {["all", "gcash", "paymaya"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setPaymentTypeFilter(type)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-all mb-1 ${
                          paymentTypeFilter === type
                            ? "bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white"
                            : "hover:bg-[#f8f1ec] text-[#5c3d28]"
                        }`}
                      >
                        {type === "all" ? "All Methods" : type === "gcash" ? "GCash" : "PayMaya"}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-[#e5ded7] pt-3">
                    <p className="text-sm font-semibold text-[#5c3d28] mb-2">Status</p>
                    {["all", "paid", "processing", "pending"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-all mb-1 capitalize ${
                          statusFilter === status
                            ? "bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white"
                            : "hover:bg-[#f8f1ec] text-[#5c3d28]"
                        }`}
                      >
                        {status === "all" ? "All Status" : status}
                      </button>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPaymentTypeFilter("all");
                      setStatusFilter("all");
                      setIsFilterOpen(false);
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportPayments}
            className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={fetchPayments}
            className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <Card className="border-[#e5ded7] shadow-xl">
        <CardHeader className="pb-4 border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
          <CardTitle className="text-[#5c3d28] text-xl">E-Wallet Payments</CardTitle>
          <CardDescription className="text-[#7b5a3b]">
            All GCash and PayMaya payments from your customers
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Reference</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <EmptyState
                      icon="💳"
                      title="No Payments Found"
                      description={searchTerm ? "No payments match your search criteria" : "You haven't received any e-wallet payments yet"}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.reference_number}</TableCell>
                    <TableCell>{payment.order_id}</TableCell>
                    <TableCell>{payment.customer_name}</TableCell>
                    <TableCell className="font-semibold text-[#5c3d28]">
                      ₱{parseFloat(payment.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>{getPaymentMethodBadge(payment.payment_method)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.payment_status)} variant="outline">
                        {payment.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPayment(payment)}
                        className="text-[#a4785a] hover:bg-[#f8f1ec] hover:text-[#5c3d28] transition-all duration-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Payment Modal */}
      {isViewModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Payment Details</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-gray-500 font-medium">Payment Reference</p>
                  <p className="text-lg font-bold text-[#a4785a]">{selectedPayment.reference_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium">Order ID</p>
                  <p className="text-lg font-semibold text-[#5c3d28]">{selectedPayment.order_id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium">Customer</p>
                  <p className="text-lg font-semibold text-[#5c3d28]">{selectedPayment.customer_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium">Payment Method</p>
                  {getPaymentMethodBadge(selectedPayment.payment_method)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium">Status</p>
                  <Badge className={getStatusColor(selectedPayment.payment_status)}>
                    {selectedPayment.payment_status}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-[#e5ded7] pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 font-medium">Amount Paid</p>
                  <p className="text-3xl font-bold text-[#a4785a]">
                    ₱{parseFloat(selectedPayment.amount).toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500 font-medium">Date & Time</p>
                  <p className="text-sm text-[#5c3d28]">
                    {new Date(selectedPayment.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#e5ded7]">
                <Button
                  onClick={() => setIsViewModalOpen(false)}
                  variant="outline"
                  className="flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec]"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTracking;

