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
  UserCircle,
  MessageCircle,
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

import Dashboard from "../Seller/SellerDashboard";
import StorefrontCustomizer from "../Seller/StorefrontCustomizer";
import PaymentSettings from "./PaymentSettings";
import OrderInventoryManager from "./OrderInventoryManager";
import MarketingTools from "./MarketingTools";
import ShippingSettings from "./ShippingSettings";
import SocialMedia from "./SocialMedia";
import WorkshopsEvents from "./WorkshopsEvents";
import SellerSettings from "./SellerSettings";
import ProfilePage from "./ProfilePage";

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { key: "profile", label: "My Profile", icon: <UserCircle className="h-5 w-5" /> },
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

  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! This is your seller support chat." },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      await fetch("http://localhost:8000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { sender: "user", text: newMessage }]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Thanks! Our team will get back to you shortly." },
      ]);
    }, 800);
    setNewMessage("");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "profile":
        return <ProfilePage />;
      case "storefront":
        return <StorefrontCustomizer />;
      case "payments":
        return <PaymentSettings />;
      case "orders":
        return <OrderInventoryManager />;
      case "marketing":
        return <MarketingTools />;
      case "shipping":
        return <ShippingSettings />;
      case "workshops":
        return <WorkshopsEvents />;
      case "social":
        return <SocialMedia />;
      case "settings":
        return <SellerSettings />;
      default:
        return <div>No matching component for: {activeTab}</div>;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between z-50">
        <div className="font-bold text-xl text-primary flex items-center">
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>CraftConnect</span>
          <span className="text-sm font-normal ml-2 text-gray-500">Seller</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
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
              <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Sidebar */}
      <div className="flex">
        <div className="fixed top-16 left-0 w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === item.key
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="ml-64 pt-0 flex-1 overflow-y-auto p-4">
          {renderContent()}
        </main>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-white border border-[#a4785a] text-[#a4785a] hover:bg-[#a4785a] hover:text-white p-4 rounded-full shadow-lg transition"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Popup */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white border border-gray-300 rounded-xl shadow-lg flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center bg-[#a4785a] text-white px-4 py-2 rounded-t-xl">
            <h3 className="font-semibold">Support Chat</h3>
            <button onClick={() => setIsChatOpen(false)} className="border border-[#a4785a] text-[#a4785a] hover:bg-[#a4785a] hover:text-white px-3 py-1 rounded-full text-sm font-semibold transition">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="p-3 h-64 overflow-y-auto bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex mb-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[70%] text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-[#a4785a] text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t p-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 border border-gray-300 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#a4785a]"
            />
            <button
              onClick={handleSend}
              className="border border-[#a4785a] text-[#a4785a] hover:bg-[#a4785a] hover:text-white px-3 py-1 rounded-full text-sm font-semibold transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerLayout;
