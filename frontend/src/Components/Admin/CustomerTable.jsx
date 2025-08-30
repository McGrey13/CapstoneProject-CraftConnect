import React, { useState, useEffect } from "react";
import { Eye, Trash2, MoreHorizontal, Filter, Search, X, Edit} from "lucide-react";
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

const CustomerTable = ({ onViewCustomer = () => {} }) => {
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
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/api/customers", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        console.log("API Response:", data);

        setCustomers(data);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError(err.message);
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
    setCustomers(prev => 
      prev.map(customer => 
        customer.userID === updatedCustomer.userID ? updatedCustomer : customer
      )
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return (
          <Badge variant="outline" className="text-gray-500">
            Inactive
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.userName?.toLowerCase().includes(searchQuery) ||
      customer.userEmail?.toLowerCase().includes(searchQuery) ||
      customer.userID?.toString().includes(searchQuery) ||
      customer.userAddress?.toLowerCase().includes(searchQuery)
  );

  if (loading) return <div className="p-6">Loading customers...</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load customers: {error}</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button>Export Data</Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="h-4 w-4" />
          </div>
        </div>

        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
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
                  <TableCell>0</TableCell>
                  <TableCell>₱0.00</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    {getStatusBadge(customer.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewCustomer(customer.userID)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                            <X className="h-4 w-4 mr-2" />Deactivate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
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

      {/* Customer Edit Dialog */}
      <CustomerEdit
        customer={selectedCustomer}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedCustomer(null);
        }}
        onSave={handleSaveCustomer}
      />
    </div>
  );
};

export default CustomerTable;
