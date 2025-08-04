import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  ChevronDown,
  ChevronRight,
  User,
  Bell,
  LogOut,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";

const SidebarItem = ({ icon, label, path, isActive, badge }) => (
  <Link to={path} className="w-full">
    <div
      className={cn(
        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      <div className="mr-3">{icon}</div>
      <span>{label}</span>
      {badge && (
        <div className="ml-auto bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
          {badge}
        </div>
      )}
    </div>
  </Link>
);

const SidebarGroup = ({ label, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
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
};

const SellerSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <div className="flex-1 py-4 px-3 space-y-1">
        <SidebarItem
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Dashboard"
          path="/seller"
          isActive={currentPath === "/seller"}
        />
        <SidebarItem
          icon={<Palette className="h-5 w-5" />}
          label="Storefront Customizer"
          path="/seller/storefront"
          isActive={currentPath === "/seller/storefront"}
        />
        <SidebarItem
          icon={<CreditCard className="h-5 w-5" />}
          label="Payment Settings"
          path="/seller/payments"
          isActive={currentPath === "/seller/payments"}
        />
        <SidebarItem
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Orders & Inventory"
          path="/seller/orders-inventory"
          isActive={currentPath === "/seller/orders-inventory"}
        />
        <SidebarItem
          icon={<Megaphone className="h-5 w-5" />}
          label="Marketing Tools"
          path="/seller/marketing"
          isActive={currentPath === "/seller/marketing"}
        />
        <SidebarItem
          icon={<Truck className="h-5 w-5" />}
          label="Shipping Settings"
          path="/seller/shipping"
          isActive={currentPath === "/seller/shipping"}
        />
        <SidebarItem
          icon={<Calendar className="h-5 w-5" />}
          label="Workshops & Events"
          path="/seller/workshops"
          isActive={currentPath === "/seller/workshops"}
        />
        <SidebarItem
          icon={<Share2 className="h-5 w-5" />}
          label="Social Media"
          path="/seller/social"
          isActive={currentPath === "/seller/social"}
        />
        <SidebarItem
          icon={<Settings className="h-5 w-5" />}
          label="Settings"
          path="/seller/settings"
          isActive={currentPath === "/seller/settings"}
        />
      </div>
    </div>
  );
};

const SellerLayout = ({ children }) => {
  const userName = "Seller User";
  const notificationCount = 3;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="w-full h-16 bg-white border-b border-gray-200 px-4">
        <div className="h-full flex items-center justify-between">
          <Link to="/seller" className="flex items-center">
            <div className="font-bold text-xl text-primary flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 mr-2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span>CraftConnect</span>
              <span className="text-sm font-normal ml-2 text-gray-500">Seller</span>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/seller/notifications" className="relative">
              <Button variant="ghost" size="icon">
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
            </Link>

            <Link to="/seller/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Hi, {userName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/seller/profile" className="w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/seller/settings" className="w-full">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/logout" className="w-full flex items-center">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Sidebar + Page Content */}
      <div className="flex">
        <SellerSidebar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default SellerLayout;
