import React from "react";
import { Link, useLocation } from "react-router-dom";
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
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

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
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

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

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <div className="flex-1 py-4 px-3 space-y-1">
        <SidebarItem
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Dashboard"
          path="/admin"
          isActive={currentPath === "/admin"}
        />

        <SidebarGroup
          label="Products"
          icon={<ShoppingBag className="h-5 w-5" />}
          defaultOpen={currentPath.includes("/admin/products")}
        >
          <SidebarItem
            icon={<ShoppingBag className="h-4 w-4" />}
            label="All Products"
            path="/admin/products"
            isActive={currentPath === "/admin/products"}
            badge={124}
          />
          <SidebarItem
            icon={<Tag className="h-4 w-4" />}
            label="Categories"
            path="/admin/products/categories"
            isActive={currentPath === "/admin/products/categories"}
          />
          <SidebarItem
            icon={<FileText className="h-4 w-4" />}
            label="Inventory"
            path="/admin/products/inventory"
            isActive={currentPath === "/admin/products/inventory"}
          />
          <SidebarItem
            icon={<ShoppingBag className="h-4 w-4" />}
            label="Add New Product"
            path="/admin/products/add"
            isActive={currentPath === "/admin/products/add"}
          />
          <SidebarItem
            icon={<FileText className="h-4 w-4" />}
            label="Edit Products"
            path="/admin/products/edit"
            isActive={currentPath === "/admin/products/edit"}
          />
        </SidebarGroup>

        <SidebarGroup
          label="Users"
          icon={<Users className="h-5 w-5" />}
          defaultOpen={currentPath.includes("/admin/users")}
        >
          <SidebarItem
            icon={<Users className="h-4 w-4" />}
            label="Customers"
            path="/admin/users/customers"
            isActive={currentPath === "/admin/users/customers"}
            badge={843}
          />
          <SidebarItem
            icon={<Palette className="h-4 w-4" />}
            label="Artisans"
            path="/admin/users/artisans"
            isActive={currentPath === "/admin/users/artisans"}
            badge={56}
          />
          <SidebarItem
            icon={<Users className="h-4 w-4" />}
            label="Admins"
            path="/admin/users/admins"
            isActive={currentPath === "/admin/users/admins"}
          />
        </SidebarGroup>

        <SidebarItem
          icon={<Palette className="h-5 w-5" />}
          label="Seller Dashboard"
          path="/seller"
          isActive={currentPath === "/seller"}
        />

        <SidebarGroup
          label="Orders"
          icon={<FileText className="h-5 w-5" />}
          defaultOpen={currentPath.includes("/admin/orders")}
        >
          <SidebarItem
            icon={<FileText className="h-4 w-4" />}
            label="Orders Overview"
            path="/admin/orders"
            isActive={currentPath === "/admin/orders"}
            badge={18}
          />
          <SidebarItem
            icon={<FileText className="h-4 w-4" />}
            label="Order Details"
            path="/admin/orders/details"
            isActive={currentPath === "/admin/orders/details"}
          />
        </SidebarGroup>

        <SidebarItem
          icon={<MessageSquare className="h-5 w-5" />}
          label="Reviews"
          path="/admin/reviews"
          isActive={currentPath === "/admin/reviews"}
          badge={7}
        />

        <SidebarItem
          icon={<BarChart3 className="h-5 w-5" />}
          label="Analytics"
          path="/admin/analytics"
          isActive={currentPath === "/admin/analytics"}
        />

        <SidebarItem
          icon={<Settings className="h-5 w-5" />}
          label="Settings"
          path="/admin/settings"
          isActive={currentPath === "/admin/settings"}
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
  );
};

export default Sidebar;
