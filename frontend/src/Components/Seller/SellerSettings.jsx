import React, { useState, useEffect, useRef } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  User, Mail, Phone, Shield, Bell, CreditCard,
} from "lucide-react";
import api from "../../api";

const SellerSettings = () => {
  const [sellerID, setSellerID] = useState(null);
  const [seller, setSeller] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // For updating profile image and story
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [story, setStory] = useState("");
  const fileInputRef = useRef();

  // For change password functionality
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Helper function to get the current image URL
  const getCurrentImageUrl = () => {
    if (profileImagePreview) {
      console.log("Using profile image preview:", profileImagePreview);
      return profileImagePreview;
    }
    if (seller?.profileImage) {
      console.log("Using seller profile image:", seller.profileImage);
      return seller.profileImage;
    }
    console.log("Using default avatar image");
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=admin";
  };

  // Debug: Log whenever the image URL changes
  useEffect(() => {
    console.log("Image URL changed - profileImagePreview:", profileImagePreview);
    console.log("Image URL changed - seller.profileImage:", seller?.profileImage);
  }, [profileImagePreview, seller?.profileImage]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return profileImageFile !== null || 
           story !== (seller?.story || "") ||
           (profileImagePreview && profileImagePreview !== (seller?.profileImage || ""));
  };

  // Fetch seller data
  const fetchSellerData = async () => {
    console.log("🔍 fetchSellerData called");
    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching seller profile data...");
      console.log("🌐 Making API call to: /sellers/profile");
      
      // Fetch authenticated seller profile (includes sellerID)
      const res = await api.get("/sellers/profile");

      console.log("📡 API Response status:", res.status);
      console.log("📡 API Response ok:", res.status === 200);

      if (res.data) {
        const data = res.data;
        console.log("Fetched seller data:", data);
        
        // Check if the response has success field
        if (data.success === false) {
          throw new Error(data.message || "Failed to fetch seller data");
        }
        
        setSeller(data);
        console.log("Seller Data:", data.sellerID);
        setSellerID(data.sellerID);
        
        // Set the profile image preview from the fetched data
        if (data.profileImage) {
          console.log("Setting profile image from fetched data:", data.profileImage);
          setProfileImagePreview(data.profileImage);
        } else {
          console.log("No profile image in fetched data, resetting preview");
          setProfileImagePreview(""); // Reset to empty if no image
        }
        
        setStory(data.story || "");
        setError(null);
      }
    } catch (err) {
      console.error("❌ Error fetching seller data:", err);
      console.error("❌ Error details:", {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message);
    } finally {
      console.log("🏁 fetchSellerData finished, setting loading to false");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("SellerSettings component mounted, fetching data...");
    console.log("About to call fetchSellerData...");
    fetchSellerData().catch(err => {
      console.error("Error in fetchSellerData:", err);
      setError(err.message);
    });
  }, []);

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file size must be less than 2MB.');
        return;
      }
      
      console.log("Image file selected:", file.name, "Size:", file.size, "Type:", file.type);
      
      // Create a preview URL for the selected file
      const previewUrl = URL.createObjectURL(file);
      setProfileImagePreview(previewUrl);
      setProfileImageFile(file);
    }
  };

  // Clear image selection
  const clearImageSelection = () => {
    if (profileImageFile) {
      setProfileImageFile(null);
      // Reset to the original image if available
      setProfileImagePreview(seller?.profileImage || "");
    }
  };

  // Cleanup function for image preview URLs
  useEffect(() => {
    return () => {
      // Cleanup any created object URLs when component unmounts
      if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  // Handle Save
const handleSave = async () => {
  if (!sellerID) {
    console.log("Seller data:", seller);
    alert("Seller ID not found.");
    return;
  }

  if (isSaving) {
    return; // Prevent multiple submissions
  }

  setIsSaving(true);
  const formData = new FormData();
  if (profileImageFile) {
    formData.append("profileImage", profileImageFile);
    console.log("Adding profile image to form data:", profileImageFile.name);
  }
  formData.append("story", story);

  // Debug: Log FormData contents
  console.log("FormData contents:");
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    console.log("Sending update request for seller ID:", sellerID);
    
    // Use sellerID instead of the whole object
    const res = await api.post(`/sellers/${sellerID}/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res.data) {
      const updatedProfile = res.data;
      console.log("Profile update response:", updatedProfile);

      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 5000); // Clear after 5 seconds

      // Update the state with the new profile data from the response
      setSeller(prevSeller => ({
        ...prevSeller,
        ...updatedProfile
      }));
      
      // IMPORTANT: Always use the response from the backend for the profile image
      if (updatedProfile.profileImage) {
        console.log("Setting profile image from response:", updatedProfile.profileImage);
        setProfileImagePreview(updatedProfile.profileImage);
        
        // Force a re-render by updating the seller state with the new image
        setSeller(prevSeller => ({
          ...prevSeller,
          profileImage: updatedProfile.profileImage
        }));
      }
      
      setStory(updatedProfile.story || "");
    }

    // Clear the selected file only after successful update
    setProfileImageFile(null);
    
    // Force a re-render by updating the seller state
    console.log("Updating seller state with new data");
    
    // Refresh the seller data to ensure everything is in sync
    console.log("Refreshing seller data...");
    await fetchSellerData();
  } catch (err) {
    console.error("Error updating profile:", err);
    alert("Error updating profile: " + err.message);
    
    // If there was an error and we had an image file, keep the preview
    if (profileImageFile) {
      console.log("Keeping image preview after error");
      setProfileImagePreview(URL.createObjectURL(profileImageFile));
    }
  } finally {
    setIsSaving(false);
  }
};

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to deactivate your account?")) return;

    try {
      await api.post("/user/deactivate");
      alert("Account deactivated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to deactivate account");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("⚠ This will permanently delete your account. Continue?")) return;

    try {
      await api.delete("/user");
      alert("Account deleted successfully!");
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Failed to delete account");
    }
  };

  // Handle change password
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    }
    
    if (!passwordData.newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "New password must be at least 8 characters";
    }
    
    if (!passwordData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = "New password must be different from current password";
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);

    try {
      console.log("Changing password...");
      
      const response = await api.post("/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        newPassword_confirmation: passwordData.confirmPassword
      });

      if (response.data) {
        const data = response.data;

        setSuccessMessage("Password changed successfully!");
        setTimeout(() => setSuccessMessage(""), 5000);
        
        // Reset form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setShowChangePassword(false);
        setPasswordErrors({});
      }

    } catch (error) {
      console.error("Error changing password:", error);
      setError(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const cancelPasswordChange = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordErrors({});
    setShowChangePassword(false);
  };

  if (isLoading) {
    return <div>Loading Seller settings...</div>;
  }

  // Error is now displayed in the UI above

  if (!seller) {
    return <div>No Seller data available.</div>;
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Seller Settings</h1>
          {hasUnsavedChanges() && (
            <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              Unsaved Changes
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              // Reset to original state
              setProfileImagePreview(seller?.profileImage || "");
              setProfileImageFile(null);
              setStory(seller?.story || "");
              setError(null);
              setSuccessMessage("");
            }}
            disabled={isSaving}
            className={hasUnsavedChanges() ? "" : "hidden"}
          >
            Cancel Changes
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasUnsavedChanges()}
            className="min-w-[120px]"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">Error: {error}</span>
        </div>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your admin profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24" key={getCurrentImageUrl()}>
                    <AvatarImage
                      src={getCurrentImageUrl()}
                      onError={(e) => {
                        console.log("Image failed to load, using fallback");
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log("Image loaded successfully");
                      }}
                    />
                    <AvatarFallback>{seller.userName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                    ref={fileInputRef}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current.click()}
                  >
                    Change Photo
                  </Button>
                  {profileImageFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearImageSelection}
                      className="text-red-600 hover:text-red-700"
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display Name</Label>
                      <Input id="display-name" defaultValue={seller.userName || ""} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" defaultValue={seller.role || "Admin"} readOnly />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="story">Story</Label>
                    <Textarea
                      id="story"
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" defaultValue={seller.userAddress || ""} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" defaultValue={seller.website || ""} readOnly />
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
                  <Input id="email" defaultValue={seller.userEmail || ""} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <Input id="phone" defaultValue={seller.userContactNumber || ""} readOnly />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={() => setShowChangePassword(!showChangePassword)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {showChangePassword ? "Cancel" : "Change Password"}
                </Button>
              </div>

              {/* Change Password Form */}
              {showChangePassword && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your new password"
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm your new password"
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="min-w-[120px]"
                      >
                        {isChangingPassword ? "Changing..." : "Change Password"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelPasswordChange}
                        disabled={isChangingPassword}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4" >
            <Button 
              variant="outline" 
              onClick={handleDeactivate} 
              className="min-w-[120px] text-black bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600 hover:text-white"
            >
              Deactivate Account
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDelete} 
              className="min-w-[120px] text-black bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600 hover:text-white"
            >
              Delete Account
            </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive push notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-primary" />
                Payment Methods
              </CardTitle>
              <CardDescription>Manage your saved payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border p-4 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium">Visa ending in 1234</p>
                  <p className="text-sm text-gray-500">Expires 08/27</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              <Button>Add Payment Method</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerSettings;