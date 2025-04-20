
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Package,
  ClipboardList,
  Settings,
  Users,
  Activity,
  Home,
  Barcode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ 
  icon, 
  label, 
  href, 
  active, 
  onClick 
}: SidebarItemProps) => {
  return (
    <Link to={href} onClick={onClick}>
      <Button
        variant="ghost"
        size="lg"
        className={cn(
          "w-full justify-start gap-3 font-normal",
          active 
            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        {icon}
        {label}
      </Button>
    </Link>
  );
};

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const isMobile = useIsMobile();
  const pathname = window.location.pathname;

  const items = [
    { icon: <Home size={20} />, label: "Dashboard", href: "/" },
    { icon: <Package size={20} />, label: "Products", href: "/products" },
    { icon: <Barcode size={20} />, label: "Scan Products", href: "/scan" },
    { icon: <ClipboardList size={20} />, label: "Orders", href: "/orders" },
    { icon: <Activity size={20} />, label: "Activity", href: "/activity" },
    { icon: <BarChart3 size={20} />, label: "Reports", href: "/reports" },
    { icon: <Users size={20} />, label: "Users", href: "/users" },
    { icon: <Settings size={20} />, label: "Settings", href: "/settings" },
  ];

  if (!isOpen && isMobile) {
    return null;
  }

  return (
    <aside className={cn(
      "bg-sidebar h-screen flex flex-col gap-4 p-4 border-r border-sidebar-border",
      isMobile ? "fixed inset-y-0 left-0 z-50 w-64" : "w-64"
    )}>
      <div className="flex items-center gap-2 px-3 h-14">
        <Package size={28} className="text-sidebar-accent" />
        <span className="font-bold text-xl text-sidebar-foreground">StockSavvy</span>
      </div>

      <div className="space-y-1 mt-4">
        {items.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={pathname === item.href}
            onClick={isMobile ? onClose : undefined}
          />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
