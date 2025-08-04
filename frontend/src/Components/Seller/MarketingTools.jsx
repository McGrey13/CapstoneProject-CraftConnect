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
import { Megaphone, Mail, Gift, Tag, TrendingUp } from "lucide-react";


const MarketingTools = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Marketing Tools</h1>
        <Button>Create New Campaign</Button>
      </div>

      <Tabs defaultValue="promotions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="email">Email Marketing</TabsTrigger>
          <TabsTrigger value="discounts">Discount Codes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="promotions" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Megaphone className="h-5 w-5 mr-2 text-primary" />
                  Featured Product
                </CardTitle>
                <CardDescription>
                  Highlight a product on your storefront
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Set Featured Product
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-primary" />
                  Flash Sale
                </CardTitle>
                <CardDescription>Create a limited-time offer</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Create Flash Sale
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Boost Visibility
                </CardTitle>
                <CardDescription>
                  Increase your shop's visibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Boost Shop
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-primary" />
                Email Campaigns
              </CardTitle>
              <CardDescription>
                Create and manage email marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="Summer Collection Announcement"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject-line">Subject Line</Label>
                <Input
                  id="subject-line"
                  placeholder="New Summer Collection Now Available!"
                />
              </div>
              <Button className="w-full">Create Email Campaign</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discounts" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2 text-primary" />
                Discount Codes
              </CardTitle>
              <CardDescription>
                Create and manage discount codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Discount Code</Label>
                <Input id="code" placeholder="SUMMER25" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-amount">Discount Amount (%)</Label>
                <Input id="discount-amount" type="number" placeholder="25" />
              </div>
              <Button className="w-full">Create Discount Code</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Performance</CardTitle>
              <CardDescription>
                View the performance of your marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
                <p className="text-gray-500">
                  Marketing analytics visualization would appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingTools;
