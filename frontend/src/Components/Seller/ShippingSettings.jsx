import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Truck, Globe, MapPin, Package } from "lucide-react";

const ShippingSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Shipping Settings</h1>
        <Button>Save Changes</Button>
      </div>

      <Tabs defaultValue="domestic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="domestic">Domestic Shipping</TabsTrigger>
          <TabsTrigger value="international">International Shipping</TabsTrigger>
          <TabsTrigger value="packaging">Packaging Options</TabsTrigger>
        </TabsList>

        <TabsContent value="domestic" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Domestic Shipping Methods
              </CardTitle>
              <CardDescription>
                Configure your domestic shipping options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="standard-shipping">Standard Shipping</Label>
                  <p className="text-sm text-gray-500">3-5 business days</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-20">
                    <Input id="standard-price" type="text" placeholder="$5.99" />
                  </div>
                  <Switch id="standard-shipping" defaultChecked />
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="express-shipping">Express Shipping</Label>
                  <p className="text-sm text-gray-500">1-2 business days</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-20">
                    <Input id="express-price" type="text" placeholder="$12.99" />
                  </div>
                  <Switch id="express-shipping" defaultChecked />
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="free-shipping-threshold">Free Shipping Threshold</Label>
                  <p className="text-sm text-gray-500">
                    Orders above this amount qualify for free shipping
                  </p>
                </div>
                <div className="w-32">
                  <Input
                    id="free-shipping-threshold"
                    type="text"
                    placeholder="$75.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="international" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-primary" />
                International Shipping
              </CardTitle>
              <CardDescription>
                Configure your international shipping options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="enable-international" />
                <Label htmlFor="enable-international">
                  Enable International Shipping
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regions">Shipping Regions</Label>
                <Select>
                  <SelectTrigger id="regions">
                    <SelectValue placeholder="Select regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north-america">North America</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="australia">Australia & Oceania</SelectItem>
                    <SelectItem value="south-america">South America</SelectItem>
                    <SelectItem value="africa">Africa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="int-shipping-rate">
                  International Shipping Base Rate
                </Label>
                <Input id="int-shipping-rate" type="text" placeholder="$24.99" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packaging" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Packaging Options
              </CardTitle>
              <CardDescription>
                Configure your packaging preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="eco-friendly" defaultChecked />
                <Label htmlFor="eco-friendly">Use Eco-Friendly Packaging</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="gift-wrap" />
                <Label htmlFor="gift-wrap">Offer Gift Wrapping</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gift-wrap-fee">Gift Wrapping Fee</Label>
                <Input id="gift-wrap-fee" type="text" placeholder="$3.50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="package-note">Package Insert Note</Label>
                <Input
                  id="package-note"
                  placeholder="Thank you for supporting handmade crafts!"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShippingSettings;
