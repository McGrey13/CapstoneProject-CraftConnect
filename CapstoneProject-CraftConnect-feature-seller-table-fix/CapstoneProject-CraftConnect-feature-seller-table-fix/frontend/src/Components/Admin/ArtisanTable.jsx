import React, { useState, useEffect } from "react";
import { Edit, Trash2, Eye, MoreHorizontal, Filter, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableCell,
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

const ArtisanTable = ({ onViewSeller = () => {} }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sellers, setSellers] = useState([]);
  const [allSellers, setAllSellers] = useState([]);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/sellers");
        const data = await res.json();
        setSellers(data);
        setAllSellers(data);
      } catch (error) {
        console.error("Error fetching sellers:", error);
      }
    };
    fetchSellers();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setSellers(allSellers);
    } else {
      const filtered = allSellers.filter(
        (seller) =>
          (seller.name && seller.name.toLowerCase().includes(query)) ||
          (seller.businessName &&
            seller.businessName.toLowerCase().includes(query)) ||
          (seller.location && seller.location.toLowerCase().includes(query)) ||
          (seller.id && seller.id.toLowerCase().includes(query))
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
            {sellers.map((seller, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div>
                    <div className="font-medium">{seller.userName || ""}</div>
                    <div className="text-sm text-gray-500">{seller.id || ""}</div>
                  </div>
                </TableCell>
                <TableCell>{seller.businessName || ""}</TableCell>
                <TableCell>{seller.location || ""}</TableCell>
                <TableCell>{seller.category || ""}</TableCell>
                <TableCell>
                  {seller.revenue !== undefined ? `$${seller.revenue}` : ""}
                </TableCell>
                <TableCell>{seller.productsCount || ""}</TableCell>
                <TableCell>{seller.ordersCount || ""}</TableCell>
                <TableCell>
                  {seller.joinDate
                    ? new Date(seller.joinDate).toLocaleDateString()
                    : ""}
                </TableCell>
                <TableCell>{getStatusBadge(seller.status) || ""}</TableCell>
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <X className="h-4 w-4 mr-2" /> Deactivate
                      </DropdownMenuItem>
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
          Showing {sellers.length} of {allSellers.length} sellers
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

export default ArtisanTable;
