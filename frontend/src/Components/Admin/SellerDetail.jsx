import React, { useState, useEffect } from "react";
import { X, Edit, User, Mail, Phone, MapPin, Calendar, Store, Package, DollarSign } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const SellerDetail = ({ sellerId, isOpen, onClose, onEdit }) => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && sellerId) {
      fetchSellerDetails();
    }
  }, [isOpen, sellerId]);

  const fetchSellerDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/sellers/${sellerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setSeller(data);
    } catch (err) {
      console.error("Error fetching seller details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Seller Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading seller details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Seller Details</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-red-600">Error loading seller details: {error}</p>
            <Button onClick={fetchSellerDetails} className="mt-4">Retry</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Seller Details</DialogTitle>
            <div className="flex gap-2">
              <Button onClick={() => onEdit(seller)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Seller
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="h-4 w-4" />
        </Button>
            </div>
      </div>
        </DialogHeader>

        {seller && (
          <div className="space-y-6">
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Seller Profile
                </CardTitle>
          </CardHeader>
          <CardContent>
                <div className="flex items-start gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={seller.profile_image_url || seller.profile_picture_path} 
                      alt={seller.user?.userName}
                    />
                    <AvatarFallback>
                      {seller.user?.userName?.slice(0, 2).toUpperCase() || "SE"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{seller.user?.userName || "N/A"}</h2>
                    <p className="text-gray-600">Seller ID: {seller.sellerID}</p>
                    <div className="mt-2">{getStatusBadge(seller.status || "active")}</div>
              </div>
            </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Seller ID</label>
                  <p className="text-lg">{seller.sellerID}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(seller.status || "active")}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg">{seller.user?.userName || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {seller.user?.userEmail || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-lg flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {seller.user?.userContactNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {seller.user?.userAddress || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Birthday</label>
                  <p className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {seller.user?.userBirthday ? new Date(seller.user.userBirthday).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                  <div>
                  <label className="text-sm font-medium text-gray-500">Age</label>
                  <p className="text-lg">{seller.user?.userAge || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Name</label>
                  <p className="text-lg">{seller.businessName || "N/A"}</p>
                </div>
                  <div>
                  <label className="text-sm font-medium text-gray-500">Specialty</label>
                  <p className="text-lg">{seller.specialty || "N/A"}</p>
                  </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Website</label>
                  <p className="text-lg">{seller.website || "N/A"}</p>
                  </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Story</label>
                  <p className="text-lg">{seller.story || "No story provided"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{seller.productCount || 0}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                  </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₱0.00</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <p className="text-lg">{seller.user?.role || "Seller"}</p>
                </div>
                  <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-lg">
                    {seller.created_at ? new Date(seller.created_at).toLocaleDateString() : "N/A"}
                  </p>
                  </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-lg">
                    {seller.updated_at ? new Date(seller.updated_at).toLocaleDateString() : "N/A"}
                  </p>
                  </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Featured</label>
                  <p className="text-lg">{seller.featured ? "Yes" : "No"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SellerDetail;
