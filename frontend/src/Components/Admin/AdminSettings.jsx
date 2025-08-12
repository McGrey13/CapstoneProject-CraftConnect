import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User, Mail, Phone, Shield, Bell, CreditCard } from "lucide-react";
import axios from "axios";

const AdminSettings = () => {
  const [adminData, setAdminData] = useState({
    display_name: "",
    business_name: "",
    bio: "",
    location: "",
    website: "",
    email: "",
    phone: "",
  });

  // Fetch current admin profile
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/admin/profile", { withCredentials: true })
      .then((res) => setAdminData(res.data))
      .catch((err) => console.error("Error fetching admin data:", err));
  }, []);

  // Handle deactivate
  const handleDeactivate = () => {
    if (window.confirm("Are you sure you want to deactivate your account?")) {
      axios
        .delete("http://localhost:8000/api/admin/deactivate", { withCredentials: true })
        .then(() => alert("Account deactivated."))
        .catch((err) => console.error(err));
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (window.confirm("This action is permanent. Continue?")) {
      axios
        .delete("http://localhost:8000/api/admin/delete", { withCredentials: true })
        .then(() => {
          alert("Account deleted.");
          window.location.href = "/login";
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <Button>Save Changes</Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your seller profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=artisan" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display Name</Label>
                      <Input
                        id="display-name"
                        value={adminData.display_name}
                        onChange={(e) =>
                          setAdminData({ ...adminData, display_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input
                        id="business-name"
                        value={adminData.business_name}
                        onChange={(e) =>
                          setAdminData({ ...adminData, business_name: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={adminData.bio}
                      onChange={(e) =>
                        setAdminData({ ...adminData, bio: e.target.value })
                      }
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={adminData.location}
                        onChange={(e) =>
                          setAdminData({ ...adminData, location: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={adminData.website}
                        onChange={(e) =>
                          setAdminData({ ...adminData, website: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                Account Information
              </CardTitle>
              <CardDescription>
                Manage your account details and security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <Input
                    id="email"
                    value={adminData.email}
                    onChange={(e) =>
                      setAdminData({ ...adminData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <Input
                    id="phone"
                    value={adminData.phone}
                    onChange={(e) =>
                      setAdminData({ ...adminData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button variant="destructive" onClick={handleDeactivate}>
                Deactivate Account
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
};

export default AdminSettings;
