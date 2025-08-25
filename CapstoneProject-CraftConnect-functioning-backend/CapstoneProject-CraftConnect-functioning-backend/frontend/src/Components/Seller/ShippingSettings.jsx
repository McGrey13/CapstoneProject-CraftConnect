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
    <div className="space-y-6 bg-white p-6 rounded-lg">
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
              {/* ...content unchanged */}
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
              {/* ...content unchanged */}
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
              {/* ...content unchanged */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShippingSettings;
