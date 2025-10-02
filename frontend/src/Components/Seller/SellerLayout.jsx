import React, { useState, useEffect } from "react";
import "./SellerLayout.css";
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
  TrendingUp,
} from "lucide-react";
import ChatBox from '../Chat/ChatBox';
import ConversationList from '../Chat/ConversationList';

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
import SellerAnalytics from "./SellerAnalytics";

const sidebarItems = [
  { key: "storefront", label: "Storefront Customizer", icon: <Palette className="h-5 w-5" /> },
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { key: "profile", label: "My Profile", icon: <UserCircle className="h-5 w-5" /> },
  { key: "payments", label: "Payment Settings", icon: <CreditCard className="h-5 w-5" /> },
  { key: "orders", label: "Orders & Inventory", icon: <ShoppingBag className="h-5 w-5" /> },
  { key: "marketing", label: "Marketing Tools", icon: <Megaphone className="h-5 w-5" /> },
  { key: "shipping", label: "Shipping Settings", icon: <Truck className="h-5 w-5" /> },
  { key: "workshops", label: "Workshops & Events", icon: <Calendar className="h-5 w-5" /> },
  { key: "social", label: "Social Media", icon: <Share2 className="h-5 w-5" /> },
  { key: "analytics", label: "Analytics", icon: <TrendingUp className="h-5 w-5" /> },
  { key: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

const SellerLayout = () => {
  const [activeTab, setActiveTab] = useState("storefront");
  const userName = "Seller User";
  const notificationCount = 3;

  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
  };

  // Effect to get current user info and check for store
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:8000/api/sellers/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        
        if (response.ok) {
          const sellerData = await response.json();
          setCurrentUser({
            userID: sellerData.userID,
            userName: sellerData.userName,
            sellerId: sellerData.sellerID,
            role: 'seller'
          });

          // Check if seller has a store, if not redirect to create store
          if (!sellerData.store) {
            window.location.href = '/create-store';
          } else {
            // Check store status
            const storeStatus = sellerData.store.status;
            if (storeStatus === 'pending') {
              // Store is pending verification, redirect to verification pending page
              window.location.href = '/verification-pending';
            } else if (storeStatus === 'rejected') {
              // Store was rejected, redirect to create store to resubmit
              window.location.href = '/create-store';
            }
            // If status is 'approved', continue with normal seller layout
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        // If there's an error fetching seller profile, redirect to create store
        window.location.href = '/create-store';
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSelectConversation = (conversation) => {
    setCurrentConversation(conversation);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "storefront":
        return <StorefrontCustomizer />;
      case "dashboard":
        return <Dashboard />;
      case "profile":
        return <ProfilePage />;
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
      case "analytics":
        return <SellerAnalytics sellerId={currentUser?.sellerId} />;
      case "settings":
        return <SellerSettings />;
      default:
        return <div>No matching component for: {activeTab}</div>;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#faf9f8]">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 w-full h-16 bg-white shadow-sm px-4 flex items-center justify-between z-5">
        <div className="font-bold text-xl text-[#a4785a] flex items-center transition-all hover:opacity-90 cursor-pointer">
          <svg
            className="w-7 h-7 mr-2 text-[#a4785a]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span className="tracking-wide">CraftConnect</span>
          <span className="text-sm font-medium ml-2 text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Seller</span>
        </div>

        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-[#f8f1ec] transition-colors"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#a4785a] border-2 border-white"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-[#f8f1ec] transition-colors"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-[#f8f1ec] transition-colors"
              >
                <User className="h-5 w-5 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1" >
              <DropdownMenuLabel className="flex items-center">
                <UserCircle className="h-4 w-4 mr-2 text-[#a4785a]" />
                Hi, {userName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab("profile")} className="hover:bg-[#f8f1ec] cursor-pointer">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#f8f1ec] cursor-pointer">Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Sidebar */}
      <div className="flex pt-16">
        <div className="fixed top-16 left-0 w-64 bg-white shadow-sm h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Menu</div>
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mb-1 group ${
                  activeTab === item.key
                    ? "bg-[#f8f1ec] text-[#a4785a] shadow-sm"
                    : "text-gray-600 hover:bg-[#f8f1ec] hover:text-[#a4785a]"
                }`}
              >
                <span className={`mr-3 transition-transform duration-200 ${
                  activeTab === item.key ? "" : "group-hover:scale-110"
                }`}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {activeTab === item.key && (
                  <div className="h-1.5 w-1.5 rounded-full bg-[#a4785a] ml-2"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="ml-64 flex-1 min-h-[calc(100vh-4rem)] pl-6 pr-6 bg-[#faf9f8] ">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-white border-2 border-[#a4785a] text-[#a4785a] hover:bg-[#a4785a] hover:text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#a4785a] focus:ring-opacity-50 group"
      >
        <MessageCircle className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
      </button>

      {/* Chat Popup */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 w-[800px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 animate-slideUp flex">
          <ConversationList 
            onSelectConversation={handleSelectConversation}
            currentConversationId={currentConversation?.conversation_id}
          />
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center bg-[#a4785a] bg-opacity-95 backdrop-blur-sm text-white px-4 py-3">
              <h3 className="font-medium flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                {currentConversation ? `Chat with ${currentConversation.sender?.userName || 'Customer'}` : 'Select a conversation'}
              </h3>
              <button 
                onClick={() => setIsChatOpen(false)} 
                className="text-white hover:text-gray-200 transition-colors focus:outline-none"
              >
                <div className="hover:bg-black hover:bg-opacity-10 rounded-full p-1">
                  ✕
                </div>
              </button>
            </div>
            {currentConversation ? (
              <ChatBox 
                conversationId={currentConversation.conversation_id} 
                user={currentUser}
                customer={currentConversation.sender}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerLayout;
