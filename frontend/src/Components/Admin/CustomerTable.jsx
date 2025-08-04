import React, { useState } from "react";
import { Eye, Trash2, MoreHorizontal, Filter, Search } from "lucide-react";
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

const mockCustomers = [
  {
    id: "CUST-1001",
    firstName: "Maria",
    lastName: "Rodriguez",
    email: "maria.rodriguez@example.com",
    phone: "+63 912 345 6789",
    address: "123 Main St",
    city: "Calamba, Laguna",
    joinDate: "2023-01-15",
    totalOrders: 12,
    totalSpent: 1250.75,
    status: "active",
    lastPurchase: "2023-06-15",
  },
  {
    id: "CUST-1002",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    phone: "+63 923 456 7890",
    address: "456 Oak Ave",
    city: "San Pedro, Laguna",
    joinDate: "2023-02-22",
    totalOrders: 8,
    totalSpent: 875.5,
    status: "active",
    lastPurchase: "2023-06-14",
  },
  {
    id: "CUST-1003",
    firstName: "Emily",
    lastName: "Johnson",
    email: "emily.johnson@example.com",
    phone: "+63 934 567 8901",
    address: "789 Pine St",
    city: "Los Baños, Laguna",
    joinDate: "2023-01-05",
    totalOrders: 15,
    totalSpent: 1820.25,
    status: "active",
    lastPurchase: "2023-06-14",
  },
  {
    id: "CUST-1004",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@example.com",
    phone: "+63 945 678 9012",
    address: "321 Cedar Rd",
    city: "Sta. Rosa, Laguna",
    joinDate: "2023-03-10",
    totalOrders: 3,
    totalSpent: 245.0,
    status: "inactive",
    lastPurchase: "2023-05-13",
  },
  {
    id: "CUST-1005",
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@example.com",
    phone: "+63 956 789 0123",
    address: "654 Maple Dr",
    city: "Biñan, Laguna",
    joinDate: "2023-02-18",
    totalOrders: 7,
    totalSpent: 650.0,
    status: "active",
    lastPurchase: "2023-06-12",
  },
  {
    id: "CUST-1006",
    firstName: "David",
    lastName: "Garcia",
    email: "david.garcia@example.com",
    phone: "+63 967 890 1234",
    address: "987 Elm St",
    city: "Cabuyao, Laguna",
    joinDate: "2023-03-25",
    totalOrders: 5,
    totalSpent: 420.5,
    status: "active",
    lastPurchase: "2023-06-10",
  },
  {
    id: "CUST-1007",
    firstName: "Jessica",
    lastName: "Martinez",
    email: "jessica.martinez@example.com",
    phone: "+63 978 901 2345",
    address: "246 Birch Ave",
    city: "Calamba, Laguna",
    joinDate: "2023-01-30",
    totalOrders: 10,
    totalSpent: 1125.75,
    status: "active",
    lastPurchase: "2023-06-08",
  },
  {
    id: "CUST-1008",
    firstName: "Robert",
    lastName: "Lee",
    email: "robert.lee@example.com",
    phone: "+63 989 012 3456",
    address: "135 Walnut Ln",
    city: "San Pablo, Laguna",
    joinDate: "2023-02-05",
    totalOrders: 0,
    totalSpent: 0.0,
    status: "inactive",
    lastPurchase: "",
  },
];

const CustomerTable = ({ onViewCustomer = () => {} }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState(mockCustomers);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setCustomers(mockCustomers);
    } else {
      const filtered = mockCustomers.filter(
        (customer) =>
          customer.firstName.toLowerCase().includes(query) ||
          customer.lastName.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query) ||
          customer.id.toLowerCase().includes(query) ||
          customer.city.toLowerCase().includes(query)
      );
      setCustomers(filtered);
    }
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
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{customer.id}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{customer.email}</div>
                    <div className="text-gray-500">{customer.phone}</div>
                  </div>
                </TableCell>
                <TableCell>{customer.city}</TableCell>
                <TableCell>
                  {new Date(customer.joinDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{customer.totalOrders}</TableCell>
                <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                <TableCell>
                  {customer.lastPurchase
                    ? new Date(customer.lastPurchase).toLocaleDateString()
                    : "Never"}
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
                      <DropdownMenuItem onClick={() => onViewCustomer(customer.id)}>
                        <Eye className="h-4 w-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        Edit
                      </DropdownMenuItem>
                      {customer.status === "active" ? (
                        <DropdownMenuItem className="text-amber-600">
                          <svg
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-green-600">
                          <svg
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Activate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {customers.length} of {mockCustomers.length} customers
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerTable;
