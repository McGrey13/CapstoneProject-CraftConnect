import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Upload, ImageIcon } from "lucide-react";

const StoreDetails = ({
  storeData = {
    storeName: "",
    storeDescription: "",
    category: "",
    logo: null,
  },
  updateStoreData = () => {},
  onNext = () => {},
}) => {
  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });
  const [logoPreview, setLogoPreview] = useState(null);

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      updateStoreData({ logo: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", description: "" };

    if (!storeData.storeName.trim()) {
      newErrors.name = "Store name is required";
      valid = false;
    }

    if (!storeData.storeDescription.trim()) {
      newErrors.description = "Store description is required";
      valid = false;
    } else if (storeData.storeDescription.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Store Details</h2>
          <p className="text-center text-gray-500">
            Tell us about your handicraft store
          </p>

          <div className="space-y-6">
            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name</Label>
              <Input
                id="store-name"
                placeholder="Enter your store name"
                value={storeData.storeName}
                onChange={(e) => updateStoreData({ storeName: e.target.value })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Store Description */}
            <div className="space-y-2">
              <Label htmlFor="store-description">Store Description</Label>
              <Textarea
                id="store-description"
                placeholder="Describe your store and products"
                className="min-h-[120px]"
                value={storeData.storeDescription}
                onChange={(e) =>
                  updateStoreData({ storeDescription: e.target.value })
                }
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Store Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Category <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={storeData.category}
                onChange={(e) => updateStoreData({ category: e.target.value })}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                <option value="Native Handicraft">Native Handicraft</option>
                <option value="Miniatures & Souvenirs">Miniatures & Souvenirs</option>
                <option value="Rubber Stamp Engraving">Rubber Stamp Engraving</option>
                <option value="Traditional Accessories">Traditional Accessories</option>
                <option value="Statuary & Sculpture">Statuary & Sculpture</option>
                <option value="Basketry & Weaving">Basketry & Weaving</option>
                <option value="Crochet">Crochet</option>

              </select>
            </div>

            {/* Store Logo */}
            <div className="space-y-2">
              <Label htmlFor="store-logo">Store Logo</Label>
              <div className="flex items-center gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-32 h-32 flex items-center justify-center relative">
                  {logoPreview ||
                  (storeData.logo && URL.createObjectURL(storeData.logo)) ? (
                    <img
                      src={
                        logoPreview ||
                        (storeData.logo
                          ? URL.createObjectURL(storeData.logo)
                          : "")
                      }
                      alt="Store logo preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={() =>
                      document.getElementById("logo-upload")?.click()
                    }
                  >
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Square image, at least 500x500px. Max size:
                    2MB.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit}>Next Step</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreDetails;
