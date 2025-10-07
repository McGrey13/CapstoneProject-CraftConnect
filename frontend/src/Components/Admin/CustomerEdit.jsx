import React, { useState, useEffect } from "react";
import { X, Save, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import api from "../../api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const CustomerEdit = ({ customer, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        userName: customer.userName || "",
        userEmail: customer.userEmail || "",
        userContactNumber: customer.userContactNumber || "",
        userAddress: customer.userAddress || "",
        userBirthday: customer.userBirthday ? customer.userBirthday.split('T')[0] : "",
        userAge: customer.userAge || "",
        status: customer.status || "active",
      });
    }
  }, [customer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/customers/${customer.userID}`, formData);
      const updatedCustomer = response.data;
      onSave(updatedCustomer);
      onClose();
    } catch (err) {
      console.error("Error updating customer:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="outline" className="text-gray-500">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Edit Customer</DialogTitle>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {customer && (
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  <Label htmlFor="userName">Full Name</Label>
                  <Input
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    id="userEmail"
                    name="userEmail"
                    type="email"
                    value={formData.userEmail}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="userContactNumber">Phone Number</Label>
                  <Input
                    id="userContactNumber"
                    name="userContactNumber"
                    value={formData.userContactNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="userAge">Age</Label>
                  <Input
                    id="userAge"
                    name="userAge"
                    type="number"
                    value={formData.userAge}
                    onChange={handleInputChange}
                    placeholder="Enter age"
                  />
                </div>
                <div>
                  <Label htmlFor="userBirthday">Birthday</Label>
                  <Input
                    id="userBirthday"
                    name="userBirthday"
                    type="date"
                    value={formData.userBirthday}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="userAddress">Address</Label>
                  <Input
                    id="userAddress"
                    name="userAddress"
                    value={formData.userAddress}
                    onChange={handleInputChange}
                    placeholder="Enter full address"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Current Information Display */}
            <Card>
              <CardHeader>
                <CardTitle>Current Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer ID</label>
                  <p className="text-lg">{customer.userID}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <p className="text-lg">{customer.role || "Customer"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-lg">
                    {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-lg">
                    {customer.updated_at ? new Date(customer.updated_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button type="button" onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerEdit;
