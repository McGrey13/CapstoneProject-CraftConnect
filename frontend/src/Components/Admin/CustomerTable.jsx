import React, { useState, useEffect } from "react";
import { Eye, MoreHorizontal, Filter, Search, X, Edit } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import CustomerDetail from "./CustomerDetail";
import CustomerEdit from "./CustomerEdit";
import api from "../../api";
import "./AdminTableDesign.css";
import { Users, TrendingUp, ShoppingBag } from "lucide-react";

const CustomerTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for view and edit dialogs
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        console.log("🔍 Fetching customers...");
        const response = await api.get("/customers");
        console.log("✅ Customers API Response:", response.data);
        
        if (Array.isArray(response.data)) {
          setCustomers(response.data);
          console.log(`📊 Loaded ${response.data.length} customers`);
        } else {
          console.warn("⚠️ Unexpected data format:", response.data);
          setCustomers([]);
        }
      } catch (err) {
        console.error("❌ Error fetching customers:", err);
        console.error("Error details:", {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });
        setError(err.message || 'Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleViewCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
    setIsViewDialogOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleSaveCustomer = (updatedCustomer) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.userID === updatedCustomer.userID ? updatedCustomer : customer
      )
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="admin-table-badge active">Active</span>;
      case "inactive":
        return <span className="admin-table-badge inactive">Inactive</span>;
      case "dormant":
        return <span className="admin-table-badge dormant">Dormant</span>;
      default:
        return <span className="admin-table-badge inactive">Unknown</span>;
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.userName?.toLowerCase().includes(searchQuery) ||
      customer.userEmail?.toLowerCase().includes(searchQuery) ||
      customer.userID?.toString().includes(searchQuery) ||
      customer.userAddress?.toLowerCase().includes(searchQuery) ||
      customer.status?.toLowerCase().includes(searchQuery) ||
      customer.orders_count?.toString().includes(searchQuery)
  );

  if (loading) return (
    <div className="admin-table-container">
      <div className="admin-table-loading">
        <div className="admin-table-loading-spinner"></div>
        <span>Loading customers...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-red-800 font-medium">Failed to load customers</h3>
        <p className="text-red-600 mt-1">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>
  );

  if (!customers || customers.length === 0) return (
    <div className="admin-table-container">
      <div className="admin-table-empty">
        <Users className="admin-table-empty-icon" />
        <h3 className="admin-table-empty-title">No customers found</h3>
        <p className="admin-table-empty-description">There are no customers in the system yet.</p>
        <Button className="admin-table-filter-btn">
          Import Customers
        </Button>
      </div>
    </div>
  );

  return (
    <div className="admin-table-container">
      {/* Enhanced Header */}
      <div className="admin-table-header">
        <h1 className="admin-table-title">Customer Management</h1>
        <p className="admin-table-description">
          Manage and monitor all customers with detailed analytics and spending insights
        </p>
        
        {/* Stats Row */}
        <div className="admin-table-stats">
          <div className="admin-table-stat">
            <Users className="admin-table-stat-icon" />
            <div>
              <div className="admin-table-stat-value">{customers.length}</div>
              <div className="admin-table-stat-label">Total Customers</div>
            </div>
          </div>
          <div className="admin-table-stat">
            <TrendingUp className="admin-table-stat-icon" />
            <div>
              <div className="admin-table-stat-value">
                {customers.filter(c => c.status === 'active').length}
              </div>
              <div className="admin-table-stat-label">Active</div>
            </div>
          </div>
          <div className="admin-table-stat">
            <ShoppingBag className="admin-table-stat-icon" />
            <div>
              <div className="admin-table-stat-value">
                {customers.reduce((sum, c) => sum + (c.orders_count || 0), 0)}
              </div>
              <div className="admin-table-stat-label">Total Orders</div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="admin-table-controls">
          <div className="admin-table-search">
            <Search className="admin-table-search-icon" />
            <Input
              placeholder="Search customers by name, email, or status..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="admin-table-filters">
            <button className="admin-table-filter-btn">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <Button className="admin-table-filter-btn">
              Export Data
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Purchase</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.userID}>
                  <TableCell>
                    {customer.profile_image_url ? (
                      <img
                        src={customer.profile_image_url}
                        alt={customer.userName}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.userName || ""}</div>
                      <div className="text-sm text-gray-500">{customer.userID || ""}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{customer.userEmail || ""}</div>
                      <div className="text-gray-500">{customer.userContactNumber || ""}</div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.userAddress || ""}</TableCell>
                  <TableCell>
                    {customer.created_at
                      ? new Date(customer.created_at).toLocaleDateString()
                      : ""}
                  </TableCell>
                  <TableCell>{customer.orders_count || 0}</TableCell>
                  <TableCell>₱{customer.total_spent?.toLocaleString() || '0.00'}</TableCell>
                  <TableCell>
                    {customer.last_purchase
                      ? new Date(customer.last_purchase).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleViewCustomer(customer.userID)}
                        >
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit className="h-4 w-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <X className="h-4 w-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Customer Detail Dialog */}
      <CustomerDetail
        customerId={selectedCustomerId}
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedCustomerId(null);
        }}
        onEdit={handleEditCustomer}
      />

      {/* Customer Edit Dialog (white background fix) */}
      <CustomerEdit
        customer={selectedCustomer}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedCustomer(null);
        }}
        onSave={handleSaveCustomer}
        className="bg-white" // 👈 Ensures white background for readability
      />
    </div>
  );
};

export default CustomerTable;
