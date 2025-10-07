import React, { useState, useEffect } from "react";
import { Edit, Eye, MoreHorizontal, Filter, X } from "lucide-react";
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
import SellerDetail from "./SellerDetail";
import SellerEdit from "./SellerEdit";
import api from "../../api";
import "./AdminTableDesign.css";
import { Search, Palette, TrendingUp, Users } from "lucide-react";

const ArtisanTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sellers, setSellers] = useState([]);
  const [allSellers, setAllSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for view and edit dialogs
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true);
        console.log("🔍 Fetching sellers/artisans...");
        const response = await api.get("/sellers");
        console.log("✅ Sellers API Response:", response.data);
        
        if (Array.isArray(response.data)) {
          setSellers(response.data);
          setAllSellers(response.data);
          console.log(`📊 Loaded ${response.data.length} sellers/artisans`);
        } else {
          console.warn("⚠️ Unexpected data format:", response.data);
          setSellers([]);
          setAllSellers([]);
        }
      } catch (error) {
        console.error("❌ Error fetching sellers:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        setError(error.message || 'Failed to fetch sellers');
      } finally {
        setLoading(false);
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
          (seller.user?.userName && seller.user.userName.toLowerCase().includes(query)) ||
          (seller.businessName && seller.businessName.toLowerCase().includes(query)) ||
          (seller.user?.userAddress && seller.user.userAddress.toLowerCase().includes(query)) ||
          (seller.sellerID && seller.sellerID.toString().includes(query)) ||
          (seller.status && seller.status.toLowerCase().includes(query)) ||
          (seller.total_orders && seller.total_orders.toString().includes(query))
      );
      setSellers(filtered);
    }
  };

  const handleViewSeller = (sellerId) => {
    setSelectedSellerId(sellerId);
    setIsViewDialogOpen(true);
  };

  const handleEditSeller = (seller) => {
    setSelectedSeller(seller);
    setIsEditDialogOpen(true);
  };

  const handleSaveSeller = (updatedSeller) => {
    setSellers(prev => 
      prev.map(seller => 
        seller.sellerID === updatedSeller.sellerID ? updatedSeller : seller
      )
    );
    setAllSellers(prev => 
      prev.map(seller => 
        seller.sellerID === updatedSeller.sellerID ? updatedSeller : seller
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
      case "pending":
        return <span className="admin-table-badge pending">Pending</span>;
      case "suspended":
        return <span className="admin-table-badge dormant">Suspended</span>;
      default:
        return <span className="admin-table-badge inactive">Unknown</span>;
    }
  };

  if (loading) return (
    <div className="admin-table-container">
      <div className="admin-table-loading">
        <div className="admin-table-loading-spinner"></div>
        <span>Loading artisans...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-red-800 font-medium">Failed to load sellers</h3>
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

  if (!sellers || sellers.length === 0) return (
    <div className="admin-table-container">
      <div className="admin-table-empty">
        <Palette className="admin-table-empty-icon" />
        <h3 className="admin-table-empty-title">No artisans found</h3>
        <p className="admin-table-empty-description">There are no artisans in the system yet.</p>
        <Button className="admin-table-filter-btn">
          Invite Artisans
        </Button>
      </div>
    </div>
  );

  return (
    <div className="admin-table-container">
      {/* Enhanced Header */}
      <div className="admin-table-header">
        <h1 className="admin-table-title">Artisan Management</h1>
        <p className="admin-table-description">
          Manage and monitor all artisans with performance analytics and revenue insights
        </p>
        
        {/* Stats Row */}
        <div className="admin-table-stats">
          <div className="admin-table-stat">
            <Palette className="admin-table-stat-icon" />
            <div>
              <div className="admin-table-stat-value">{sellers.length}</div>
              <div className="admin-table-stat-label">Total Artisans</div>
            </div>
          </div>
          <div className="admin-table-stat">
            <TrendingUp className="admin-table-stat-icon" />
            <div>
              <div className="admin-table-stat-value">
                {sellers.filter(s => s.status === 'active').length}
              </div>
              <div className="admin-table-stat-label">Active</div>
            </div>
          </div>
          <div className="admin-table-stat">
            <Users className="admin-table-stat-icon" />
            <div>
              <div className="admin-table-stat-value">
                {sellers.reduce((sum, s) => sum + (s.total_orders || 0), 0)}
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
              placeholder="Search artisans by name, email, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <TableHead>Image</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Location</TableHead>
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
                  {seller.profile_image_url ? (
                    <img
                      src={seller.profile_image_url}
                      alt={seller.user?.userName}
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
                    <div className="font-medium">{seller.user?.userName || ""}</div>
                    <div className="text-sm text-gray-500">{seller.sellerID || ""}</div>
                  </div>
                </TableCell>
                <TableCell>{seller.businessName || ""}</TableCell>
                <TableCell>{seller.user?.userAddress || ""}</TableCell>
                <TableCell>
                  ₱{seller.total_revenue?.toLocaleString() || '0.00'}
                </TableCell>
                <TableCell>{seller.products_count || 0}</TableCell>
                <TableCell>{seller.total_orders || 0}</TableCell>
                <TableCell>
                  {seller.created_at
                    ? new Date(seller.created_at).toLocaleDateString()
                    : ""}
                </TableCell>
                <TableCell>{getStatusBadge(seller.status || "active")}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewSeller(seller.sellerID)}>
                        <Eye className="h-4 w-4 mr-2" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditSeller(seller)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <X className="h-4 w-4 mr-2" /> Deactivate
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

      {/* Seller Detail Dialog */}
      <SellerDetail
        sellerId={selectedSellerId}
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedSellerId(null);
        }}
        onEdit={handleEditSeller}
      />

      {/* Seller Edit Dialog */}
      <SellerEdit
        seller={selectedSeller}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedSeller(null);
        }}
        onSave={handleSaveSeller}
      />
    </div>
  );
};

export default ArtisanTable;
