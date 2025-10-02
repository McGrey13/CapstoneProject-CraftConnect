import React, { useState, useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";
import AdminNavbar from "./AdminNavbar";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useUser } from "../Context/UserContext";
import { useNavigate } from "react-router-dom";

// Import Admin Pages
import Dashboard from "./AdminDashboard";
import OrdersOverview from "./OrdersOverview";
import ProductsTable from "./ProductsTable";
import CustomerTable from "./CustomerTable";
import ArtisanTable from "./ArtisanTable";
import AnalyticsDashboard from "./AnalyticsDashboard";
import AdminSettings from "./AdminSettings";
import AcceptPendingProduct from "./AcceptPendingProduct";
import StoreVerification from "./StoreVerification";
import api from "../../api";

const SidebarItem = ({ icon, label, tabKey, activeTab, setActiveTab, badge, onItemClick }) => (
  <button
    onClick={() => {
      setActiveTab(tabKey);
      if (onItemClick) onItemClick();
    }}
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

const SidebarGroup = ({ label, icon, children, isOpen, setIsOpen, onItemClick }) => (
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
      {React.Children.map(children, child =>
        React.cloneElement(child, { onItemClick })
      )}
    </CollapsibleContent>
  </Collapsible>
);

const AdminLayout = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [productOpen, setProductOpen] = useState(true);
  const [userOpen, setUserOpen] = useState(true);
  const [orderOpen, setOrderOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({});

  // Check authentication and admin role
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
        return;
      }
      if (user.role !== 'administrator') {
        navigate('/home');
        return;
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/verification-stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching verification stats:', error);
      }
    };

    if (user && user.role === 'administrator') {
      fetchStats();
    }
  }, [user]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not admin (will redirect)
  if (!user || user.role !== 'administrator') {
    return null;
  }

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
        return <div><AcceptPendingProduct /></div>;
      case "customers":
        return <CustomerTable />;
      case "artisans":
        return <ArtisanTable />;
      case "storeVerification":
        return <StoreVerification />;
      case "orders":
        return <OrdersOverview />;
      case "orderDetails":
        return <div>Order Details</div>;
      case "analytics":
        return <AnalyticsDashboard />;
      case "settings":
        return <AdminSettings />;
      default:
        return <div>No matching tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar userName={user?.userName || 'Admin'} />
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white shadow-md"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Sidebar */}
        <div className={cn(
          "w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out flex-shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex-1 py-4 px-3 space-y-1">
            <SidebarItem
              icon={<LayoutDashboard className="h-5 w-5" />}
              label="Dashboard"
              tabKey="dashboard"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onItemClick={() => setSidebarOpen(false)}
            />

            <SidebarGroup
              label="Products"
              icon={<ShoppingBag className="h-5 w-5" />}
              isOpen={productOpen}
              setIsOpen={setProductOpen}
              onItemClick={() => setSidebarOpen(false)}
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
            </SidebarGroup>

            <SidebarGroup
              label="Users"
              icon={<Users className="h-5 w-5" />}
              isOpen={userOpen}
              setIsOpen={setUserOpen}
              onItemClick={() => setSidebarOpen(false)}
            >
              <SidebarItem
                icon={<Users className="h-4 w-4" />}
                label="Customers"
                tabKey="customers"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                badge={stats?.total_customers || 0}
              />
              <SidebarItem
                icon={<Palette className="h-4 w-4" />}
                label="Artisans"
                tabKey="artisans"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                badge={stats?.total_artisans || 0}
              />
              <SidebarItem
                icon={<FileText className="h-4 w-4" />}
                label="Store Verification"
                tabKey="storeVerification"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                badge={stats?.pending_stores || 0}
              />

            </SidebarGroup>

            <SidebarGroup
              label="Orders"
              icon={<FileText className="h-5 w-5" />}
              isOpen={orderOpen}
              setIsOpen={setOrderOpen}
              onItemClick={() => setSidebarOpen(false)}
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
              icon={<BarChart3 className="h-5 w-5" />}
              label="Analytics"
              tabKey="analytics"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onItemClick={() => setSidebarOpen(false)}
            />

            <SidebarItem
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              tabKey="settings"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onItemClick={() => setSidebarOpen(false)}
            />
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Logged in as</p>
              <p className="text-sm font-medium">{user?.userName || 'Admin'}</p>
              <p className="text-xs text-gray-500">{user?.userEmail || 'admin@craftconnect.com'}</p>
            </div>
          </div>
        </div>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto main-content">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
