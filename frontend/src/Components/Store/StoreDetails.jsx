import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Upload, ImageIcon, AlertCircle, Info } from "lucide-react";
import api from "../../api";

const StoreDetails = ({
  storeData = {
    storeName: "",
    storeDescription: "",
    category: "Native Handicraft",
    logo: null,
    ownerCity: "",
  },
  updateStoreData = () => {},
  onNext = () => {},
}) => {
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    logo: "",
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [checkingName, setCheckingName] = useState(false);
  const [nameSuggestion, setNameSuggestion] = useState("");

  // File size limits (10MB for logo)
  const MAX_LOGO_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];

  const handleLogoChange = (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        logo: 'Invalid file type. Please upload JPG, PNG, GIF, or SVG files only.'
      }));
      e.target.value = ''; // Clear input
      updateStoreData({ logo: null });
      setLogoPreview(null);
      return;
    }
    
    // Validate file size
    if (file.size > MAX_LOGO_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setErrors(prev => ({
        ...prev,
        logo: `File size too large (${fileSizeMB}MB). Maximum size is 10MB. Please compress or choose a smaller file.`
      }));
      e.target.value = ''; // Clear input
      updateStoreData({ logo: null });
      setLogoPreview(null);
      return;
    }
    
    // File is valid
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.logo;
      return newErrors;
    });
    
    updateStoreData({ logo: file });
    setLogoPreview(URL.createObjectURL(file));
  };

  // Check store name availability (debounced)
  const checkStoreName = useCallback(async (storeName) => {
    if (!storeName || storeName.trim().length < 3) {
      setErrors(prev => ({ ...prev, name: "" }));
      setNameSuggestion("");
      return;
    }

    setCheckingName(true);
    try {
      // Check if store name exists by trying to get stores with similar names
      const response = await api.get('/stores', { 
        params: { search: storeName.trim() } 
      });
      
      const stores = response.data || [];
      const trimmedName = storeName.trim().toLowerCase();
      
      // Check if name already includes branch format
      const hasBranchFormat = / - .+ Branch$/i.test(storeName.trim());
      
      // Check for exact match (case-insensitive)
      const exactMatch = stores.find(
        store => store.store_name?.toLowerCase() === trimmedName
      );

      if (exactMatch) {
        // If name already has branch format, just show error
        if (hasBranchFormat) {
          setErrors(prev => ({
            ...prev,
            name: "This store name is already taken. Please choose a different name."
          }));
          setNameSuggestion("");
        } else {
          // Suggest adding branch location if city is available
          if (storeData.ownerCity) {
            const cityName = storeData.ownerCity;
            const suggestedName = `${storeName.trim()} - ${cityName} Branch`;
            setNameSuggestion(suggestedName);
            setErrors(prev => ({
              ...prev,
              name: `This store name is already taken. Please use a different name or add your branch location. Suggested: "${suggestedName}"`
            }));
          } else {
            setErrors(prev => ({
              ...prev,
              name: "This store name is already taken. Please choose a different name or add a branch location (e.g., 'Store Name - City Branch')."
            }));
            setNameSuggestion("");
          }
        }
      } else {
        // Name is available - clear errors and show suggestion if city is available
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.name;
          return newErrors;
        });
        
        // If city is available and name doesn't have branch format, show suggestion
        if (storeData.ownerCity && !hasBranchFormat) {
          const suggestedName = `${storeName.trim()} - ${storeData.ownerCity} Branch`;
          setNameSuggestion(suggestedName);
        } else {
          setNameSuggestion("");
        }
      }
    } catch (error) {
      // If API fails, don't block user - validation will happen on submit
      console.error('Error checking store name:', error);
    } finally {
      setCheckingName(false);
    }
  }, [storeData.ownerCity]);

  // Debounce store name check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (storeData.storeName) {
        checkStoreName(storeData.storeName);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [storeData.storeName, checkStoreName]);

  // Update suggestion when city changes
  useEffect(() => {
    if (storeData.ownerCity && storeData.storeName) {
      const suggestedName = `${storeData.storeName.trim()} - ${storeData.ownerCity} Branch`;
      setNameSuggestion(suggestedName);
    } else {
      setNameSuggestion("");
    }
  }, [storeData.ownerCity, storeData.storeName]);

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

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
    return valid && !newErrors.name; // Don't proceed if name error exists
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

          <div className="space-y-4">
            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name</Label>
              <div className="relative">
                <Input
                  id="store-name"
                  placeholder="Enter your store name"
                  value={storeData.storeName}
                  onChange={(e) => {
                    updateStoreData({ storeName: e.target.value });
                    // Clear error when user starts typing
                    if (errors.name) {
                      setErrors(prev => ({ ...prev, name: "" }));
                    }
                  }}
                  className={errors.name ? "border-red-500" : ""}
                />
                {checkingName && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>
              
              {/* Branch naming instruction */}
              {storeData.ownerCity && !errors.name && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Branch Location Detected</p>
                      <p>Since you're located in <strong>{storeData.ownerCity}</strong>, consider naming your store with the branch location:</p>
                      {nameSuggestion && (
                        <p className="mt-1 font-semibold text-blue-900">"{nameSuggestion}"</p>
                      )}
                      <p className="mt-1 text-xs">Example: "Gio Store's - Calamba Branch"</p>
                    </div>
                  </div>
                </div>
              )}
              
              {errors.name && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p>{errors.name}</p>
                      {nameSuggestion && (
                        <button
                          type="button"
                          onClick={() => {
                            updateStoreData({ storeName: nameSuggestion });
                            setErrors(prev => ({ ...prev, name: "" }));
                          }}
                          className="mt-2 text-sm font-medium text-red-900 underline hover:text-red-700"
                        >
                          Use suggested name: "{nameSuggestion}"
                        </button>
                      )}
                    </div>
                  </div>
                </div>
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
            <div className="space-y-2">
              <Label htmlFor="store-category">Store Category</Label>
              <Select
                value={storeData.category}
                onValueChange={(value) => updateStoreData({ category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Native Handicraft">Native Handicraft</SelectItem>
                  <SelectItem value="Miniatures & Souvenirs">Miniatures & Souvenirs</SelectItem>
                  <SelectItem value="Rubber Stamp Engraving">Rubber Stamp Engraving</SelectItem>
                  <SelectItem value="Traditional Accessories">Traditional Accessories</SelectItem>
                  <SelectItem value="Statuary & Sculpture">Statuary & Sculpture</SelectItem>
                  <SelectItem value="Basketry & Weaving">Basketry & Weaving</SelectItem>
                  <SelectItem value="Shoe & Sandals Making">Shoe & Sandals Making</SelectItem>
                  <SelectItem value="Leather Crafts">Leather Crafts</SelectItem>
                  <SelectItem value="Candle Making">Candle Making</SelectItem>
                  <SelectItem value="Wood Carving & WoodCraft Artisans">Wood Carving & WoodCraft Artisans</SelectItem>
                  <SelectItem value="House Garments">House Garments</SelectItem>
                  <SelectItem value="Beadwork">Beadwork</SelectItem>
                  <SelectItem value="Crochet">Crochet</SelectItem>
                </SelectContent>
              </Select>
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
                    Recommended: Square image, at least 500x500px. Max size: 10MB. Accepted formats: JPG, PNG, GIF, SVG.
                  </p>
                  {errors.logo && (
                    <p className="text-sm text-red-500 mt-1">{errors.logo}</p>
                  )}
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
