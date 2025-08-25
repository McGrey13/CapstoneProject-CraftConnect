import React, { useState } from "react";
import { Edit, Trash2, Eye, MoreHorizontal, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input"; 
import { Table, TableHeader, TableBody, TableHead, TableCell, TableRow } from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge"; 


const mockSellers = [
  {
    id: "SEL-1001",
    name: "Sarah Johnson",
    businessName: "Sarah's Pottery",
    location: "Calamba, Laguna",
    category: "Ceramics",
    joinDate: "2023-01-15",
    status: "active",
    revenue: 12450.75,
    productsCount: 24,
    ordersCount: 87,
  },
  {
    id: "SEL-1002",
    name: "Miguel Santos",
    businessName: "Weaving Wonders",
    location: "San Pedro, Laguna",
    category: "Textiles",
    joinDate: "2023-02-22",
    status: "active",
    revenue: 9875.5,
    productsCount: 18,
    ordersCount: 65,
  },
  {
    id: "SEL-1003",
    name: "Elena Cruz",
    businessName: "Knot & Fiber",
    location: "Victoria, Laguna",
    category: "Textiles",
    joinDate: "2023-01-05",
    status: "active",
    revenue: 15320.25,
    productsCount: 31,
    ordersCount: 112,
  },
  {
    id: "SEL-1004",
    name: "Antonio Reyes",
    businessName: "Forest Crafts",
    location: "Paete, Laguna",
    category: "Woodworking",
    joinDate: "2023-03-10",
    status: "pending",
    revenue: 0,
    productsCount: 15,
    ordersCount: 0,
  },
  {
    id: "SEL-1005",
    name: "Maria Lim",
    businessName: "Paper Artistry",
    location: "Pakil, Laguna",
    category: "Paper Crafts",
    joinDate: "2023-02-18",
    status: "suspended",
    revenue: 2150.0,
    productsCount: 12,
    ordersCount: 23,
  },
  {
    id: "SEL-1006",
    name: "Jose Garcia",
    businessName: "Glass Wonders",
    location: "Liliw, Laguna",
    category: "Glass Works",
    joinDate: "2023-03-25",
    status: "active",
    revenue: 7890.5,
    productsCount: 9,
    ordersCount: 42,
  },
  {
    id: "SEL-1007",
    name: "Sophia Mendoza",
    businessName: "Natural Essentials",
    location: "Los Baños, Laguna",
    category: "Bath & Body",
    joinDate: "2023-01-30",
    status: "active",
    revenue: 11245.75,
    productsCount: 22,
    ordersCount: 95,
  },
  {
    id: "SEL-1008",
    name: "Rafael Dizon",
    businessName: "Metal Creations",
    location: "Nagcarlan, Laguna",
    category: "Metal Works",
    joinDate: "2023-02-05",
    status: "active",
    revenue: 8765.25,
    productsCount: 14,
    ordersCount: 56,
  },
];

const SellersTable = ({ onViewSeller = () => {} }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sellers, setSellers] = useState(mockSellers);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setSellers(mockSellers);
    } else {
      const filtered = mockSellers.filter(
        (seller) =>
          seller.name.toLowerCase().includes(query) ||
          seller.businessName.toLowerCase().includes(query) ||
          seller.location.toLowerCase().includes(query) ||
          seller.id.toLowerCase().includes(query)
      );
      setSellers(filtered);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            Pending
          </Badge>
        );
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sellers</h1>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search sellers..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
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
              <TableHead>Seller</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellers.map((seller) => (
              <TableRow key={seller.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{seller.name}</div>
                    <div className="text-sm text-gray-500">{seller.id}</div>
                  </div>
                </TableCell>
                <TableCell>{seller.businessName}</TableCell>
                <TableCell>{seller.location}</TableCell>
                <TableCell>{seller.category}</TableCell>
                <TableCell>${seller.revenue.toFixed(2)}</TableCell>
                <TableCell>{seller.productsCount}</TableCell>
                <TableCell>{seller.ordersCount}</TableCell>
                <TableCell>
                  {new Date(seller.joinDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{getStatusBadge(seller.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onViewSeller(seller.id)}>
                        <Eye className="h-4 w-4 mr-2" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" /> Edit Details
                      </DropdownMenuItem>
                      {seller.status === "pending" && (
                        <DropdownMenuItem>
                          <svg
                            className="h-4 w-4 mr-2 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Approve
                        </DropdownMenuItem>
                      )}
                      {seller.status === "active" && (
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
                          Suspend
                        </DropdownMenuItem>
                      )}
                      {seller.status === "suspended" && (
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
                          Reactivate
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
          Showing {sellers.length} of {mockSellers.length} sellers
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

export default SellersTable;
