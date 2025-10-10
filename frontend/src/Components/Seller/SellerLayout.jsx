import React, { useState, useEffect } from "react";
import "./SellerLayout.css";
import api from "../../api";
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
  FileText,
} from "lucide-react";
import ChatBox from '../Chat/ChatBox';
import { useUser } from "../Context/UserContext";
import LoadingSpinner from "../ui/LoadingSpinner";
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
import ShippingSimulation from "./ShippingSimulation";
import EReceiptWaybill from "./EReceiptWaybill";
import PaymentTracking from "./PaymentTracking";
import { Wallet } from "lucide-react";

const sidebarItems = [
  { key: "storefront", label: "Storefront Customizer", icon: <Palette className="h-5 w-5" /> },
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { key: "profile", label: "My Profile", icon: <UserCircle className="h-5 w-5" /> },
  { key: "payments", label: "E-payment Settings", icon: <Wallet className="h-5 w-5" /> },
  { key: "payment-tracking", label: "Payment Tracking", icon: <Wallet className="h-5 w-5" /> },
  { key: "orders", label: "Orders & Inventory", icon: <ShoppingBag className="h-5 w-5" /> },
  { key: "shipping-sim", label: "Shipping", icon: <Truck className="h-5 w-5" /> },
  { key: "receipts", label: "E-Receipts & Waybills", icon: <FileText className="h-5 w-5" /> },
  { key: "marketing", label: "Marketing Tools", icon: <Megaphone className="h-5 w-5" /> },
  { key: "shipping", label: "Shipping Settings", icon: <Truck className="h-5 w-5" /> },
  { key: "workshops", label: "Workshops & Events", icon: <Calendar className="h-5 w-5" /> },
  { key: "social", label: "Social Media", icon: <Share2 className="h-5 w-5" /> },
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
  const [isVerifying, setIsVerifying] = useState(true);

  const { logout, isAuthenticated } = useUser();
  
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
      // Still redirect even if logout fails
      window.location.href = "/login";
    }
  };

  // Effect to get current user info and check for store
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Wait for authentication to be ready
        if (!isAuthenticated) {
          console.log('Waiting for authentication...');
          setIsVerifying(true);
          return;
        }

        console.log('✅ User authenticated, fetching seller profile...');

        // Use the api instance which handles cookies automatically
        const response = await api.get('/sellers/profile');
        
        if (response.data) {
          const sellerData = response.data;
          setCurrentUser({
            userID: sellerData.userID,
            userName: sellerData.userName,
            sellerId: sellerData.sellerID,
            role: 'seller'
          });

          // Check if seller has a store, if not redirect to create store
          if (!sellerData.store) {
            console.log('No store found, redirecting to create store');
            window.location.href = '/create-store';
          } else {
            // Check store status
            const storeStatus = sellerData.store.status;
            if (storeStatus === 'pending') {
              // Store is pending verification, redirect to verification pending page
              console.log('Store pending verification');
              window.location.href = '/verification-pending';
            } else if (storeStatus === 'rejected') {
              // Store was rejected, redirect to create store to resubmit
              console.log('Store rejected, redirecting to create store');
              window.location.href = '/create-store';
            }
            // If status is 'approved', continue with normal seller layout
          }
        }
        
        setIsVerifying(false);
      } catch (error) {
        console.error('Error fetching current user:', error);
        
        // If 401 error, redirect to login
        if (error.response?.status === 401) {
          console.log('Authentication failed, redirecting to login');
          window.location.href = '/login';
        } else {
          // Other errors, continue anyway
          console.log('Error but continuing:', error.message);
          setIsVerifying(false);
        }
      }
    };

    // Only fetch when authenticated
    if (isAuthenticated) {
      fetchCurrentUser();
    } else if (isAuthenticated === false) {
      // Explicitly not authenticated
      console.log('Not authenticated, redirecting to login');
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

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
      case "payment-tracking":
        return <PaymentTracking />;
      case "orders":
        return <OrderInventoryManager />;
      case "shipping-sim":
        return <ShippingSimulation />;
      case "receipts":
        return <EReceiptWaybill />;
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

  // Show loading while verifying authentication
  if (isVerifying) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#faf9f8]">
        <LoadingSpinner message="Loading seller dashboard..." />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#faf9f8]">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 w-full h-16 bg-gradient-to-r from-white to-[#faf9f8] shadow-lg border-b border-[#e5ded7] px-4 flex items-center justify-between z-50 backdrop-blur-sm">
        <div className="font-bold text-xl text-[#5c3d28] flex items-center transition-all hover:opacity-90 cursor-pointer group">
          <div className="p-2 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-xl mr-3 shadow-md group-hover:shadow-lg transition-all duration-200">
            <svg
              className="w-6 h-6 text-white"
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
          </div>
          <span className="tracking-wide text-[#5c3d28]">CraftConnect</span>
          <span className="text-sm font-medium ml-3 text-white bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] px-3 py-1 rounded-full shadow-md">Seller</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-gradient-to-r hover:from-[#a4785a]/10 hover:to-[#7b5a3b]/10 transition-all duration-200 rounded-xl"
          >
            <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
              <Bell className="h-4 w-4 text-white" />
            </div>
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-red-500 to-red-600 border-2 border-white shadow-md"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-gradient-to-r hover:from-[#a4785a]/10 hover:to-[#7b5a3b]/10 transition-all duration-200 rounded-xl"
          >
            <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
              <Settings className="h-4 w-4 text-white" />
            </div>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-gradient-to-r hover:from-[#a4785a]/10 hover:to-[#7b5a3b]/10 transition-all duration-200"
              >
                <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 border-2 border-[#e5ded7] shadow-xl" >
              <DropdownMenuLabel className="flex items-center bg-gradient-to-r from-[#faf9f8] to-white">
                <div className="p-1.5 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                  <UserCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-[#5c3d28] font-medium">Hi, {userName}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#e5ded7]" />
              <DropdownMenuItem onClick={() => setActiveTab("profile")} className="hover:bg-gradient-to-r hover:from-[#a4785a]/10 hover:to-[#7b5a3b]/10 cursor-pointer text-[#5c3d28] transition-all duration-200">
                <UserCircle className="h-4 w-4 mr-2 text-[#a4785a]" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("settings")} className="hover:bg-gradient-to-r hover:from-[#a4785a]/10 hover:to-[#7b5a3b]/10 cursor-pointer text-[#5c3d28] transition-all duration-200">
                <Settings className="h-4 w-4 mr-2 text-[#a4785a]" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#e5ded7]" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 cursor-pointer transition-all duration-200">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Sidebar */}
      <div className="flex pt-16">
        <div className="fixed top-16 left-0 w-64 bg-gradient-to-b from-white to-[#faf9f8] shadow-xl border-r border-[#e5ded7] h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-6">
            <div className="text-xs font-bold text-[#7b5a3b] uppercase tracking-wider mb-4 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-full mr-2"></div>
              Navigation Menu
            </div>
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative ${
                    activeTab === item.key
                      ? "bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white shadow-lg transform scale-[1.02]"
                      : "text-[#5c3d28] hover:bg-gradient-to-r hover:from-[#a4785a]/10 hover:to-[#7b5a3b]/10 hover:text-[#a4785a] hover:shadow-md hover:transform hover:scale-[1.01]"
                  }`}
                >
                  <span className={`mr-3 transition-all duration-300 ${
                    activeTab === item.key 
                      ? "text-white" 
                      : "text-[#a4785a] group-hover:scale-110 group-hover:rotate-3"
                  }`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {activeTab === item.key && (
                    <div className="h-2 w-2 rounded-full bg-white ml-2 shadow-sm"></div>
                  )}
                  {activeTab !== item.key && (
                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-1 h-1 rounded-full bg-[#a4785a]"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="ml-64 flex-1 min-h-[calc(100vh-4rem)] pl-6 pr-6 bg-gradient-to-br from-[#faf9f8] to-white">
          <div className="bg-white rounded-2xl shadow-xl border border-[#e5ded7] p-8 min-h-[calc(100vh-8rem)]">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#a4785a]/30 group border-2 border-white"
      >
        <MessageCircle className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse"></div>
      </button>

      {/* Chat Popup */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 w-[800px] bg-white rounded-2xl shadow-2xl border-2 border-[#e5ded7] overflow-hidden transition-all duration-300 animate-slideUp flex backdrop-blur-sm">
          <ConversationList 
            onSelectConversation={handleSelectConversation}
            currentConversationId={currentConversation?.conversation_id}
          />
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white px-6 py-4">
              <h3 className="font-semibold flex items-center text-lg">
                <div className="p-1.5 bg-white/20 rounded-lg mr-3">
                  <MessageCircle className="h-4 w-4" />
                </div>
                {currentConversation ? `Chat with ${currentConversation.sender?.userName || 'Customer'}` : 'Select a conversation'}
              </h3>
              <button 
                onClick={() => setIsChatOpen(false)} 
                className="text-white hover:text-gray-200 transition-all duration-200 focus:outline-none"
              >
                <div className="hover:bg-white/20 rounded-full p-2 transition-all duration-200">
                  <div className="w-4 h-4 flex items-center justify-center">
                    ✕
                  </div>
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
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#faf9f8] to-white">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-[#a4785a]" />
                  </div>
                  <p className="text-[#5c3d28] font-medium">Select a conversation to start chatting</p>
                  <p className="text-[#7b5a3b] text-sm mt-1">Connect with your customers</p>
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
