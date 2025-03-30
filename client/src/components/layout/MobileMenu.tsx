import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Brain, 
  MessageSquare, 
  BarChart, 
  DollarSign, 
  Settings,
  PlusCircle,
  LogOut,
  X
} from "lucide-react";
import { 
  FaTwitter, 
  FaInstagram, 
  FaFacebook 
} from "react-icons/fa";
import { SiOpenai } from "react-icons/si";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
    { path: "/calendar", label: "Content Calendar", icon: <Calendar className="mr-3 h-5 w-5" /> },
    { path: "/editor", label: "Content Editor", icon: <FileText className="mr-3 h-5 w-5" /> },
    { path: "/ai-assistant", label: "AI Assistant", icon: <Brain className="mr-3 h-5 w-5" /> },
    { path: "/auto-engage", label: "Auto-Engage", icon: <MessageSquare className="mr-3 h-5 w-5" /> },
    { path: "/analytics", label: "Analytics", icon: <BarChart className="mr-3 h-5 w-5" /> },
    { path: "/monetization", label: "Monetization", icon: <DollarSign className="mr-3 h-5 w-5" /> },
    { path: "/settings", label: "Settings", icon: <Settings className="mr-3 h-5 w-5" /> },
  ];

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div 
      className={cn(
        "md:hidden fixed inset-0 z-20 bg-gray-600 bg-opacity-75 transition-opacity",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      <div 
        className={cn(
          "fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl z-30 transform transition duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-500 rounded-lg p-2">
                <SiOpenai className="text-white text-xl" />
              </div>
              <span className="text-xl font-semibold text-gray-800">SocialAI</span>
            </div>
            <button className="text-gray-500" onClick={onClose}>
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 py-4 px-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg",
                    location === item.path
                      ? "text-primary-500 bg-primary-50"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={handleLinkClick}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
          
          <div className="mt-auto p-4 border-t border-gray-200">
            {/* Connected Accounts */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Connected Accounts</h3>
              <div className="flex space-x-1.5">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-blue-500">
                  <FaTwitter />
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-pink-500">
                  <FaInstagram />
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-blue-600">
                  <FaFacebook />
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer">
                  <PlusCircle className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center">
              <img 
                src={user?.avatarUrl || "https://randomuser.me/api/portraits/women/42.jpg"} 
                alt="Profile" 
                className="h-8 w-8 rounded-full" 
              />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.fullName || "Demo User"}</p>
                <p className="text-xs text-gray-500">{user?.email || "demo@example.com"}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-500" onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
