import React, { useState } from "react";
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
  Image,
  Type,
  Grid,
  Sliders,
  Save,
} from "lucide-react";
import SellerLayout from "./SellerLayout";

const ColorPicker = ({ label, value, onChange }) => {
  return (
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
};

const StorefrontCustomizer = () => {
  const [colors, setColors] = useState({
    primary: "#6366f1",
    secondary: "#f43f5e",
    background: "#ffffff",
    text: "#1f2937",
    accent: "#0ea5e9",
  });

  const [fonts, setFonts] = useState({
    heading: "Inter",
    body: "Inter",
    headingSize: 18,
    bodySize: 16,
  });

  const [layout, setLayout] = useState({
    showHero: true,
    showFeatured: true,
    columnsDesktop: 4,
    columnsMobile: 2,
    productCardStyle: "minimal",
  });

  const handleColorChange = (key, value) => {
    setColors({ ...colors, [key]: value });
  };

  const handleFontChange = (key, value) => {
    setFonts({ ...fonts, [key]: value });
  };

  const handleLayoutChange = (key, value) => {
    setLayout({ ...layout, [key]: value });
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Storefront Customizer</h1>
          <p className="text-gray-500 mt-1">
            Personalize your shop's appearance to reflect your brand identity.
          </p>
        </div>

        <div className="flex gap-6">
          <div className="w-2/3">
            <Card className="p-6 bg-white border-2 border-dashed border-gray-200">
              <div className="text-center py-20">
                <p className="text-gray-500">Preview will appear here</p>
                <p className="text-sm text-gray-400 mt-2">
                  Changes will be reflected in real-time
                </p>
              </div>
            </Card>
          </div>

          <div className="w-1/3 space-y-6">
            <Tabs defaultValue="colors">
              <TabsList className="grid w-full grid-cols-4">
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
                <TabsTrigger value="advanced">
                  <Sliders className="h-4 w-4 mr-2" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-4 pt-4">
                <Card className="p-4 space-y-4">
                  <ColorPicker label="Primary Color" value={colors.primary} onChange={(value) => handleColorChange("primary", value)} />
                  <ColorPicker label="Secondary Color" value={colors.secondary} onChange={(value) => handleColorChange("secondary", value)} />
                  <ColorPicker label="Background Color" value={colors.background} onChange={(value) => handleColorChange("background", value)} />
                  <ColorPicker label="Text Color" value={colors.text} onChange={(value) => handleColorChange("text", value)} />
                  <ColorPicker label="Accent Color" value={colors.accent} onChange={(value) => handleColorChange("accent", value)} />
                </Card>
              </TabsContent>

              {/* Typography Tab */}
              <TabsContent value="typography" className="space-y-4 pt-4">
                <Card className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="headingFont">Heading Font</Label>
                    <Select value={fonts.heading} onValueChange={(value) => handleFontChange("heading", value)}>
                      <SelectTrigger id="headingFont">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                        <SelectItem value="Merriweather">Merriweather</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bodyFont">Body Font</Label>
                    <Select value={fonts.body} onValueChange={(value) => handleFontChange("body", value)}>
                      <SelectTrigger id="bodyFont">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                        <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Heading Size: {fonts.headingSize}px</Label>
                    </div>
                    <Slider value={[fonts.headingSize]} min={12} max={36} step={1} onValueChange={(value) => handleFontChange("headingSize", value[0])} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Body Size: {fonts.bodySize}px</Label>
                    </div>
                    <Slider value={[fonts.bodySize]} min={12} max={24} step={1} onValueChange={(value) => handleFontChange("bodySize", value[0])} />
                  </div>
                </Card>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="space-y-4 pt-4">
                <Card className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showHero">Show Hero Section</Label>
                    <Switch id="showHero" checked={layout.showHero} onCheckedChange={(checked) => handleLayoutChange("showHero", checked)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showFeatured">Show Featured Products</Label>
                    <Switch id="showFeatured" checked={layout.showFeatured} onCheckedChange={(checked) => handleLayoutChange("showFeatured", checked)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productCardStyle">Product Card Style</Label>
                    <Select value={layout.productCardStyle} onValueChange={(value) => handleLayoutChange("productCardStyle", value)}>
                      <SelectTrigger id="productCardStyle">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="elegant">Elegant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Desktop Columns: {layout.columnsDesktop}</Label>
                    </div>
                    <Slider value={[layout.columnsDesktop]} min={2} max={6} step={1} onValueChange={(value) => handleLayoutChange("columnsDesktop", value[0])} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Mobile Columns: {layout.columnsMobile}</Label>
                    </div>
                    <Slider value={[layout.columnsMobile]} min={1} max={3} step={1} onValueChange={(value) => handleLayoutChange("columnsMobile", value[0])} />
                  </div>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4 pt-4">
                <Card className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customCSS">Custom CSS</Label>
                    <textarea
                      id="customCSS"
                      className="w-full min-h-[150px] p-2 border rounded-md font-mono text-sm"
                      placeholder="/* Add your custom CSS here */"
                    />
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            <Button className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default StorefrontCustomizer;
