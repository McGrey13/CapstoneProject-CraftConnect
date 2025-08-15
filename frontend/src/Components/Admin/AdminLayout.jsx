import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  FileText,
  BarChart3,
  Settings,
  MessageSquare,
  Tag,
  Palette,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import AdminNavbar from "./AdminNavbar";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

// Import Admin Pages
import Dashboard from "./AdminDashboard";
import OrdersOverview from "./OrdersOverview";
import ProductsTable from "./ProductsTable";
import AdminTable from "./AdminTable";
import CustomerTable from "./CustomerTable";
import ArtisanTable from "./ArtisanTable";
import AdminSettings from "./AdminSettings";

const SidebarItem = ({ icon, label, tabKey, activeTab, setActiveTab, badge }) => (
  <button
    onClick={() => setActiveTab(tabKey)}
    className={cn(
      "w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
      activeTab === tabKey
        ? "bg-primary text-primary-foreground"
        : "text-gray-700 hover:bg-gray-100"
    )}
  >
    <span className="mr-3">{icon}</span>
    {label}
    {badge && (
      <div className="ml-auto bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
        {badge}
      </div>
    )}
  </button>
);

const SidebarGroup = ({ label, icon, children, isOpen, setIsOpen }) => (
  <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
    <CollapsibleTrigger asChild>
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
      >
        <div className="flex items-center">
          <div className="mr-3">{icon}</div>
          <span>{label}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent className="pl-9 pr-2 py-1 space-y-1">
      {children}
    </CollapsibleContent>
  </Collapsible>
);

const AdminLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [productOpen, setProductOpen] = useState(true);
  const [userOpen, setUserOpen] = useState(true);
  const [orderOpen, setOrderOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <ProductsTable />;
      case "categories":
        return <div>Category Management</div>;
      case "inventory":
        return <div>Inventory Page</div>;
      case "addProduct":
        return <div>Add New Product</div>;
      case "editProduct":
        return <div>Edit Products</div>;
      case "customers":
        return <CustomerTable />;
      case "artisans":
        return <ArtisanTable />;
      case "admins":
        return <AdminTable />;
      case "orders":
        return <OrdersOverview />;
      case "orderDetails":
        return <div>Order Details</div>;
      case "reviews":
        return <div>Review Section</div>;
      case "analytics":
        return <div>Analytics Page</div>;
      case "settings":
        return <AdminSettings />;
      default:
        return <div>No matching tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="flex-1 py-4 px-3 space-y-1">
            <SidebarItem
              icon={<LayoutDashboard className="h-5 w-5" />}
              label="Dashboard"
              tabKey="dashboard"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <SidebarGroup
              label="Products"
              icon={<ShoppingBag className="h-5 w-5" />}
              isOpen={productOpen}
              setIsOpen={setProductOpen}
            >
              <SidebarItem
                icon={<ShoppingBag className="h-4 w-4" />}
                label="All Products"
                tabKey="products"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                badge={124}
              />
              <SidebarItem
                icon={<Tag className="h-4 w-4" />}
                label="Categories"
                tabKey="categories"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <SidebarItem
                icon={<FileText className="h-4 w-4" />}
                label="Inventory"
                tabKey="inventory"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <SidebarItem
                icon={<ShoppingBag className="h-4 w-4" />}
                label="Accept Pending Product"
                tabKey="addProduct"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <SidebarItem
                icon={<FileText className="h-4 w-4" />}
                label="Edit Products"
                tabKey="editProduct"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </SidebarGroup>

            <SidebarGroup
              label="Users"
              icon={<Users className="h-5 w-5" />}
              isOpen={userOpen}
              setIsOpen={setUserOpen}
            >
              <SidebarItem
                icon={<Users className="h-4 w-4" />}
                label="Customers"
                tabKey="customers"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                badge={843}
              />
              <SidebarItem
                icon={<Palette className="h-4 w-4" />}
                label="Artisans"
                tabKey="artisans"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                badge={56}
              />
              <SidebarItem
                icon={<Users className="h-4 w-4" />}
                label="Admins"
                tabKey="admins"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </SidebarGroup>

            <SidebarGroup
              label="Orders"
              icon={<FileText className="h-5 w-5" />}
              isOpen={orderOpen}
              setIsOpen={setOrderOpen}
            >
              <SidebarItem
                icon={<FileText className="h-4 w-4" />}
                label="Orders Overview"
                tabKey="orders"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                badge={18}
              />
              <SidebarItem
                icon={<FileText className="h-4 w-4" />}
                label="Order Details"
                tabKey="orderDetails"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </SidebarGroup>

            <SidebarItem
              icon={<MessageSquare className="h-5 w-5" />}
              label="Reviews"
              tabKey="reviews"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              badge={7}
            />

            <SidebarItem
              icon={<BarChart3 className="h-5 w-5" />}
              label="Analytics"
              tabKey="analytics"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <SidebarItem
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              tabKey="settings"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Logged in as</p>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-500">admin@craftconnect.com</p>
            </div>
          </div>
        </div>

        {/* Main Content - Removed top gap */}
        <main className="flex-1 pt-0 px-6 pb-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
