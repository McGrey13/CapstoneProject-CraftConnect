  import React, { useState, useEffect } from "react";
  import { Card } from "../ui/card";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
  import { Input } from "../ui/input";
  import { Label } from "../ui/label";
  import { Button } from "../ui/button";
  import { Slider } from "../ui/slider";
  import { Switch } from "../ui/switch";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "../ui/select";
  import {
    Palette,
    Layout,
    Type,
    Sliders,
    Save,
    Eye,
    EyeOff,
    Upload,
    Image as ImageIcon,
  } from "lucide-react";

  const ColorPicker = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={label}>{label}</Label>
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-5 rounded-full border"
            style={{ backgroundColor: value }}
          />
          <span className="text-xs text-gray-500">{value}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          id={label}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 p-1"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  const StorefrontCustomizer = () => {
    const [storeData, setStoreData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [customization, setCustomization] = useState({
      primary_color: "#6366f1",
      secondary_color: "#f43f5e",
      background_color: "#ffffff",
      text_color: "#1f2937",
      accent_color: "#0ea5e9",
      heading_font: "Inter",
      body_font: "Inter",
      heading_size: 18,
      body_size: 16,
      show_hero_section: true,
      show_featured_products: true,
      desktop_columns: 4,
      mobile_columns: 2,
      product_card_style: "minimal",
    });
    const [images, setImages] = useState({
      logo: null,
      background: null,
    });
    const [imagePreviews, setImagePreviews] = useState({
      logo: null,
      background: null,
    });

    // Fetch store data on component mount
    useEffect(() => {
      fetchStoreData();
    }, []);

    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("auth_token");
        
        console.log("🔍 Fetching store data...");
        console.log("🔑 Token:", token ? "Present" : "Missing");
        
        const response = await fetch("http://localhost:8000/api/stores/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("📡 Response status:", response.status);
        console.log("📡 Response ok:", response.ok);

        // Check if the response is HTML instead of JSON
        const contentType = response.headers.get("content-type");
        console.log("📄 Content-Type:", contentType);
        
        if (contentType && contentType.includes("text/html")) {
          const htmlText = await response.text();
          console.error("💥 Received HTML instead of JSON:", htmlText.substring(0, 200) + "...");
          console.error("💥 Full HTML response:", htmlText);
          setError("Received HTML response instead of JSON. This usually means authentication failed or the API endpoint is not working correctly.");
          setStoreData(null);
          setLoading(false);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          console.log("📦 Store data received:", data);
          setStoreData(data);
          
          // Set customization data from store
          if (data.store) {
            console.log("🏪 Store found:", data.store);
            console.log("🖼️ Logo URL:", data.logo_url);
            console.log("🖼️ Background URL:", data.background_url);
            
            setCustomization({
              primary_color: data.store.primary_color || "#6366f1",
              secondary_color: data.store.secondary_color || "#f43f5e",
              background_color: data.store.background_color || "#ffffff",
              text_color: data.store.text_color || "#1f2937",
              accent_color: data.store.accent_color || "#0ea5e9",
              heading_font: data.store.heading_font || "Inter",
              body_font: data.store.body_font || "Inter",
              heading_size: data.store.heading_size || 18,
              body_size: data.store.body_size || 16,
              show_hero_section: data.store.show_hero_section ?? true,
              show_featured_products: data.store.show_featured_products ?? true,
              desktop_columns: data.store.desktop_columns || 4,
              mobile_columns: data.store.mobile_columns || 2,
              product_card_style: data.store.product_card_style || "minimal",
            });

            // Set image previews
            setImagePreviews({
              logo: data.logo_url,
              background: data.background_url,
            });
            
            console.log("✅ Store data loaded successfully");
          } else {
            console.warn("⚠️ No store data found in response");
          }
        } else if (response.status === 404) {
          console.warn("⚠️ No store found. User may need to create a store first.");
          setStoreData(null);
        } else {
          const errorData = await response.json();
          console.error("❌ Failed to fetch store data:", errorData);
        }
      } catch (error) {
        console.error("💥 Error fetching store data:", error);
        if (error.message.includes("Unexpected token '<'")) {
          setError("The server returned HTML instead of JSON. This usually indicates an authentication issue or the API endpoint is not working correctly. Please check if you're logged in properly.");
        } else {
          setError(`An error occurred while fetching store data: ${error.message}`);
        }
        setStoreData(null);
      } finally {
        setLoading(false);
      }
    };

    const handleCustomizationChange = (key, value) => {
      setCustomization({ ...customization, [key]: value });
    };

  const handleImageUpload = (type, file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (8MB max)
      if (file.size > 8 * 1024 * 1024) {
        setError('Image size must be less than 8MB');
        return;
      }
      
      setImages({ ...images, [type]: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews({ ...imagePreviews, [type]: e.target.result });
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors and show success
      setError(null);
      setSuccess(`${type === 'background' ? 'Background' : 'Logo'} image uploaded successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    }
  };

    const saveCustomization = async () => {
      try {
        setSaving(true);
        const token = localStorage.getItem("auth_token");
        const formData = new FormData();

        // Add customization data
        Object.keys(customization).forEach(key => {
          formData.append(key, customization[key]);
        });

        // Add image files
        if (images.logo) formData.append('logo', images.logo);
        if (images.background) formData.append('background_image', images.background);

        const response = await fetch("http://localhost:8000/api/stores/customization", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Customization saved:", data);
          setSuccess("Store customization saved successfully!");
          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(null), 3000);
          // Refresh store data
          await fetchStoreData();
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to save customization");
        }
      } catch (error) {
        console.error("Error saving customization:", error);
      } finally {
        setSaving(false);
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading store data...</p>
          </div>
        </div>
      );
    }

    if (!storeData) {
      return (
        <div className="space-y-6 p-6">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Store Found</h2>
            <p className="text-gray-600 mb-6">
              You need to create a store first before you can customize it.
            </p>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 max-w-2xl mx-auto">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                If you've already created a store, please check your authentication or contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
            <button 
              onClick={() => setError(null)}
              className="float-right text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong className="font-bold">Success:</strong>
            <span className="block sm:inline"> {success}</span>
            <button 
              onClick={() => setSuccess(null)}
              className="float-right text-green-500 hover:text-green-700"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Storefront Customizer</h1>
          <p className="text-gray-500 mt-1">
            Personalize your shop's appearance to reflect your brand identity.
          </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={previewMode ? "default" : "outline"}
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2"
            >
              {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {previewMode ? "Edit Mode" : "Customer View"}
            </Button>
            <Button
              onClick={saveCustomization}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-2/3">
            <Card className="p-6 bg-white border-2 border-dashed border-gray-200">
              {previewMode ? (
                <StorePreview 
                  storeData={storeData} 
                  customization={customization}
                  imagePreviews={imagePreviews}
                />
              ) : (
              <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Eye className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Preview Your Store</h3>
                    <p className="text-gray-600 mb-6">
                      Toggle "Customer View" to see how your store looks to customers
                    </p>
                    <Button
                      onClick={() => setPreviewMode(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg font-semibold"
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      View Customer Experience
                    </Button>
                  </div>
              </div>
              )}
            </Card>
          </div>

          <div className="w-1/3 space-y-6">
            <Tabs defaultValue="branding">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="branding">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="colors">
                  <Palette className="h-4 w-4 mr-2" />
                  Colors
                </TabsTrigger>
                <TabsTrigger value="typography">
                  <Type className="h-4 w-4 mr-2" />
                  Typography
                </TabsTrigger>
                <TabsTrigger value="layout">
                  <Layout className="h-4 w-4 mr-2" />
                  Layout
                </TabsTrigger>
              </TabsList>

              {/* Branding Tab */}
              <TabsContent value="branding" className="space-y-4 pt-4">
                <Card className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Store Name</Label>
                    <Input 
                      value={storeData?.store?.store_name || ""} 
                      disabled 
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Store name cannot be changed here</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Store Logo</Label>
                    <div className="flex items-center gap-4">
                      {imagePreviews.logo && (
                        <img 
                          src={imagePreviews.logo} 
                          alt="Logo preview" 
                          className="w-16 h-16 object-contain border rounded"
                        />
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('logo', e.target.files[0])}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <Button variant="outline" size="sm" asChild>
                            <span><Upload className="h-4 w-4 mr-2" />Upload Logo</span>
                          </Button>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Background Image</Label>
                    <div className="space-y-3">
                      {imagePreviews.background ? (
                        <div className="relative group">
                          <img 
                            src={imagePreviews.background} 
                            alt="Background preview" 
                            className="w-full h-32 object-cover border rounded-lg shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setImagePreviews({ ...imagePreviews, background: null });
                                setImages({ ...images, background: null });
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-sm text-gray-600 mb-2">No background image selected</p>
                          <p className="text-xs text-gray-500">Upload a background image for your store</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('background', e.target.files[0])}
                          className="hidden"
                          id="background-upload"
                        />
                        <Label htmlFor="background-upload" className="cursor-pointer flex-1">
                          <Button variant="outline" size="sm" asChild className="w-full">
                            <span><Upload className="h-4 w-4 mr-2" />{imagePreviews.background ? 'Change Background' : 'Upload Background'}</span>
                          </Button>
                        </Label>
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>• Recommended size: 1920x1080px or larger</p>
                        <p>• Supported formats: JPG, PNG, GIF, SVG</p>
                        <p>• Maximum file size: 8MB</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-4 pt-4">
                <Card className="p-4 space-y-4">
                  <ColorPicker 
                    label="Primary Color" 
                    value={customization.primary_color} 
                    onChange={(val) => handleCustomizationChange("primary_color", val)} 
                  />
                  <ColorPicker 
                    label="Secondary Color" 
                    value={customization.secondary_color} 
                    onChange={(val) => handleCustomizationChange("secondary_color", val)} 
                  />
                  <ColorPicker 
                    label="Background Color" 
                    value={customization.background_color} 
                    onChange={(val) => handleCustomizationChange("background_color", val)} 
                  />
                  <ColorPicker 
                    label="Text Color" 
                    value={customization.text_color} 
                    onChange={(val) => handleCustomizationChange("text_color", val)} 
                  />
                  <ColorPicker 
                    label="Accent Color" 
                    value={customization.accent_color} 
                    onChange={(val) => handleCustomizationChange("accent_color", val)} 
                  />
                </Card>
              </TabsContent>

              {/* Typography Tab */}
              <TabsContent value="typography" className="space-y-4 pt-4">
                <Card className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Heading Font</Label>
                    <Select value={customization.heading_font} onValueChange={(val) => handleCustomizationChange("heading_font", val)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                        <SelectItem value="Merriweather">Merriweather</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Body Font</Label>
                    <Select value={customization.body_font} onValueChange={(val) => handleCustomizationChange("body_font", val)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                        <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Heading Size: {customization.heading_size}px</Label>
                    <Slider 
                      value={[customization.heading_size]} 
                      min={12} 
                      max={36} 
                      step={1} 
                      onValueChange={(val) => handleCustomizationChange("heading_size", val[0])} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Body Size: {customization.body_size}px</Label>
                    <Slider 
                      value={[customization.body_size]} 
                      min={12} 
                      max={24} 
                      step={1} 
                      onValueChange={(val) => handleCustomizationChange("body_size", val[0])} 
                    />
                  </div>
                </Card>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="space-y-4 pt-4">
                <Card className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Show Hero Section</Label>
                    <Switch 
                      checked={customization.show_hero_section} 
                      onCheckedChange={(val) => handleCustomizationChange("show_hero_section", val)} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Show Featured Products</Label>
                    <Switch 
                      checked={customization.show_featured_products} 
                      onCheckedChange={(val) => handleCustomizationChange("show_featured_products", val)} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Product Card Style</Label>
                    <Select 
                      value={customization.product_card_style} 
                      onValueChange={(val) => handleCustomizationChange("product_card_style", val)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="elegant">Elegant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Desktop Columns: {customization.desktop_columns}</Label>
                    <Slider 
                      value={[customization.desktop_columns]} 
                      min={2} 
                      max={6} 
                      step={1} 
                      onValueChange={(val) => handleCustomizationChange("desktop_columns", val[0])} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mobile Columns: {customization.mobile_columns}</Label>
                    <Slider 
                      value={[customization.mobile_columns]} 
                      min={1} 
                      max={3} 
                      step={1} 
                      onValueChange={(val) => handleCustomizationChange("mobile_columns", val[0])} 
                    />
                  </div>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    );
  };

  // Store Preview Component
  const StorePreview = ({ storeData, customization, imagePreviews }) => {
    const previewStyle = {
      '--primary-color': customization.primary_color,
      '--secondary-color': customization.secondary_color,
      '--background-color': customization.background_color,
      '--text-color': customization.text_color,
      '--accent-color': customization.accent_color,
      '--heading-font': customization.heading_font,
      '--body-font': customization.body_font,
      '--heading-size': `${customization.heading_size}px`,
      '--body-size': `${customization.body_size}px`,
    };

    // Fallback data if storeData is not available
    const storeName = storeData?.store?.store_name || "Your Store";
    const storeDescription = storeData?.store?.store_description || "Discover amazing products crafted with passion and quality";
    const ownerName = storeData?.store?.owner_name || "Store Owner";
    const ownerEmail = storeData?.store?.owner_email || "contact@store.com";
    const ownerPhone = storeData?.store?.owner_phone || "+63 123 456 7890";
    const ownerAddress = storeData?.store?.owner_address || "Your Address";

    return (
      <div className="store-preview min-h-screen" style={previewStyle}>
        <style>{`
          .store-preview {
            font-family: var(--body-font);
            color: var(--text-color);
            background-color: var(--background-color);
            ${imagePreviews.background ? `
              background-image: url('${imagePreviews.background}');
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
              background-attachment: fixed;
            ` : ''}
          }
          .store-preview h1, .store-preview h2, .store-preview h3 {
            font-family: var(--heading-font);
            font-size: var(--heading-size);
            color: var(--text-color);
            font-weight: 700;
          }
          .store-preview p, .store-preview span {
            font-size: var(--body-size);
            line-height: 1.6;
          }
          .store-preview .btn-primary {
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          .store-preview .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          }
          .store-preview .btn-secondary {
            background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          .store-preview .btn-secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          }
          .store-preview .accent {
            color: var(--accent-color);
            font-weight: 600;
          }
          .store-preview .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
          }
          .store-preview .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          }
          .store-preview .hero-overlay {
            background: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6));
            backdrop-filter: blur(2px);
          }
        `}</style>
        
        {/* Store Header */}
        <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4">
                {imagePreviews.logo && (
                  <div className="p-2 bg-white rounded-full shadow-md">
                    <img 
                      src={imagePreviews.logo} 
                      alt="Store Logo" 
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{storeName}</h1>
                  <p className="text-sm text-gray-600">Premium Quality Products</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  About
                </button>
                <button className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Contact
                </button>
                <button className="btn-primary">
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        {customization.show_hero_section && (
          <div className="relative overflow-hidden">
            <div className="hero-overlay absolute inset-0 z-10"></div>
            <div className="relative z-20 py-32">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-6xl font-bold mb-6 text-white drop-shadow-lg">
                    Welcome to {storeName}
                  </h2>
                  <p className="text-2xl mb-10 text-white/90 drop-shadow-md leading-relaxed">
                    {storeDescription}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button className="btn-secondary px-10 py-5 rounded-xl text-xl font-bold">
                       Explore Products
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm text-black px-10 py-5 rounded-xl text-xl font-bold border-2 border-white/30 hover:bg-white/30 transition-all duration-300">
                       Contact Us
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
          </div>
        )}

        {/* Featured Products */}
        {customization.show_featured_products && (
          <div className="py-20 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold mb-4 text-gray-900">Featured Products</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Discover our handpicked selection of premium products
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-6 rounded-full"></div>
              </div>
              
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${customization.desktop_columns} gap-8`}>
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="card group overflow-hidden">
                    <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                      <div className="relative z-10 text-center">
                        <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <span className="text-2xl"></span>
                        </div>
                        <span className="text-gray-600 font-medium">Product Image {item}</span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          -20%
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                        Premium Product {item}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        High-quality product with excellent features and durability
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold accent">₱{29.99 + item * 10}</span>
                          <span className="text-lg text-gray-400 line-through">₱{39.99 + item * 10}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm text-gray-600">4.{item + 5}</span>
                        </div>
                      </div>
                      <button className="btn-primary w-full py-3 rounded-xl text-lg font-bold">
                         Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <button className="btn-secondary px-8 py-4 rounded-xl text-lg font-bold">
                  View All Products
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default StorefrontCustomizer;
