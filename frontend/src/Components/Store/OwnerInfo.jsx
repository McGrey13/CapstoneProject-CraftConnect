import React, { useState } from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/Components/ui/alert";

const OwnerInfo = ({ onNext, onBack, ownerData, setOwnerData }) => {
  const [errors, setErrors] = useState({});
  const [verificationStatus, setVerificationStatus] = useState("idle");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOwnerData({ ...ownerData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSelectChange = (value, name) => {
    setOwnerData({ ...ownerData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!ownerData.fullName?.trim()) newErrors.fullName = "Full name is required";
    if (!ownerData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(ownerData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!ownerData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9\-\+\s()]+$/.test(ownerData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!ownerData.address?.trim()) newErrors.address = "Address is required";
    if (!ownerData.city?.trim()) newErrors.city = "City is required";
    if (!ownerData.state?.trim()) newErrors.state = "State/Province is required";
    if (!ownerData.zipCode?.trim()) newErrors.zipCode = "ZIP/Postal code is required";
    if (!ownerData.country?.trim()) newErrors.country = "Country is required";
    if (!ownerData.identityType) newErrors.identityType = "Identity type is required";
    if (!ownerData.identityNumber?.trim()) newErrors.identityNumber = "Identity number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = () => {
    if (validateForm()) {
      setVerificationStatus("verifying");
      setTimeout(() => {
        setVerificationStatus("success");
      }, 2000);
    }
  };

  const handleSubmit = () => {
    if (verificationStatus === "success") {
      onNext();
    } else {
      handleVerify();
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-center mb-6">
              Store Owner Information
            </h2>
            <p className="text-gray-500 text-center mb-6">
              Please provide your contact details and verification information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={ownerData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={ownerData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={ownerData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone}</p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={ownerData.country}
                onChange={handleChange}
                placeholder="United States"
                className={errors.country ? "border-red-500" : ""}
              />
              {errors.country && (
                <p className="text-red-500 text-xs">{errors.country}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={ownerData.address}
                onChange={handleChange}
                placeholder="123 Main St, Apt 4B"
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-red-500 text-xs">{errors.address}</p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={ownerData.city}
                onChange={handleChange}
                placeholder="New York"
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-red-500 text-xs">{errors.city}</p>
              )}
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                name="state"
                value={ownerData.state}
                onChange={handleChange}
                placeholder="NY"
                className={errors.state ? "border-red-500" : ""}
              />
              {errors.state && (
                <p className="text-red-500 text-xs">{errors.state}</p>
              )}
            </div>

            {/* ZIP */}
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP/Postal Code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={ownerData.zipCode}
                onChange={handleChange}
                placeholder="10001"
                className={errors.zipCode ? "border-red-500" : ""}
              />
              {errors.zipCode && (
                <p className="text-red-500 text-xs">{errors.zipCode}</p>
              )}
            </div>

            {/* Identity Type */}
            <div className="space-y-2">
              <Label htmlFor="identityType">Identity Document Type</Label>
              <Select
                value={ownerData.identityType}
                onValueChange={(value) =>
                  handleSelectChange(value, "identityType")
                }
              >
                <SelectTrigger
                  className={errors.identityType ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="driverLicense">Driver's License</SelectItem>
                  <SelectItem value="nationalId">National ID</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.identityType && (
                <p className="text-red-500 text-xs">{errors.identityType}</p>
              )}
            </div>

            {/* Identity Number */}
            <div className="space-y-2">
              <Label htmlFor="identityNumber">Identity Document Number</Label>
              <Input
                id="identityNumber"
                name="identityNumber"
                value={ownerData.identityNumber}
                onChange={handleChange}
                placeholder="AB123456789"
                className={errors.identityNumber ? "border-red-500" : ""}
              />
              {errors.identityNumber && (
                <p className="text-red-500 text-xs">{errors.identityNumber}</p>
              )}
            </div>
          </div>

          {/* Verification Alerts */}
          {verificationStatus === "verifying" && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-600">
                Verifying your information. Please wait...
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Verification successful! You can now proceed to the next step.
              </AlertDescription>
            </Alert>
          )}

          {verificationStatus === "error" && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                Verification failed. Please check your information and try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={verificationStatus === "verifying"}
            >
              {verificationStatus === "verifying"
                ? "Verifying..."
                : verificationStatus === "success"
                ? "Continue"
                : "Verify & Continue"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Default props
OwnerInfo.defaultProps = {
  onNext: () => {},
  onBack: () => {},
  ownerData: {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    identityType: "",
    identityNumber: "",
  },
  setOwnerData: () => {},
};

export default OwnerInfo;
