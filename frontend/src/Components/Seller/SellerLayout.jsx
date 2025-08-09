import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Truck,
  Megaphone,
  Calendar,
  Share2,
  Palette,
  Settings,
  User,
  Bell,
  LogOut,
} from "lucide-react";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import Dashboard from "../Admin/Dashboard";
import StorefrontCustomizer from "../Seller/StorefrontCustomizer";
import PaymentSettings from "./PaymentSettings";
import OrderInventoryManager from "./OrderInventoryManager";
import MarketingTools from "./MarketingTools";
import ShippingSettings from "./ShippingSettings";
import SocialMedia from "./SocialMedia";
import WorkshopsEvents from "./WorkshopsEvents";
import SellerSettings from "./SellerSettings";

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { key: "storefront", label: "Storefront Customizer", icon: <Palette className="h-5 w-5" /> },
  { key: "payments", label: "Payment Settings", icon: <CreditCard className="h-5 w-5" /> },
  { key: "orders", label: "Orders & Inventory", icon: <ShoppingBag className="h-5 w-5" /> },
  { key: "marketing", label: "Marketing Tools", icon: <Megaphone className="h-5 w-5" /> },
  { key: "shipping", label: "Shipping Settings", icon: <Truck className="h-5 w-5" /> },
  { key: "workshops", label: "Workshops & Events", icon: <Calendar className="h-5 w-5" /> },
  { key: "social", label: "Social Media", icon: <Share2 className="h-5 w-5" /> },
  { key: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

const SellerLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const userName = "Seller User";
  const notificationCount = 3;

  const renderContent = () => {
  console.log("Active Tab:", activeTab); // Add this for debug
  switch (activeTab) {
    case "dashboard":
      return <Dashboard />;
    case "storefront":
      return <div><StorefrontCustomizer /></div>; // Wrap in div to isolate
    case "payments":
      return <div><PaymentSettings /></div>;
    case "orders":
      return <div><OrderInventoryManager /></div>;
    case "marketing":
      return <div><MarketingTools /></div>;
    case "shipping":
      return <div><ShippingSettings /></div>;
    case "workshops":
      return <div><WorkshopsEvents /></div>;
    case "social":
      return <div><SocialMedia /></div>;
    case "settings":
      return <div><SellerSettings /></div>;
    default:
      return <div>No matching component for: {activeTab}</div>;
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="w-full h-16 bg-white border-b border-gray-200 px-4">
        <div className="h-full flex items-center justify-between">
          <div className="font-bold text-xl text-primary flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span>CraftConnect</span>
            <span className="text-sm font-normal ml-2 text-gray-500">Seller</span>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {notificationCount}
                </Badge>
              )}
            </Button>

            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Hi, {userName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Sidebar and Main Content */}
      <div className="flex">
        <div className="w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 py-4 px-2">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === item.key ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default SellerLayout;
