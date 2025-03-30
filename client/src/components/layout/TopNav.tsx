import { useAuth } from "@/hooks/useAuth";
import { Menu, Search, HelpCircle, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TopNavProps {
  onMobileMenuClick: () => void;
}

export default function TopNav({ onMobileMenuClick }: TopNavProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center lg:hidden">
          <button 
            type="button" 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onMobileMenuClick}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="ml-4 md:hidden">
            <div className="flex items-center">
              <div className="bg-primary-500 rounded-lg p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white h-5 w-5">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-800">SocialAI</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 max-w-xl mx-auto lg:ml-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              type="text" 
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm w-full"
              placeholder="Search for content, analytics, or tools..." 
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button type="button" className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none">
            <HelpCircle className="h-5 w-5" />
          </button>
          <button type="button" className="relative flex items-center text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">3</span>
          </button>
          <div className="hidden md:block border-l border-gray-200 h-6 mx-1"></div>
          <div className="hidden md:flex items-center">
            <img
              src={user?.avatarUrl || "https://randomuser.me/api/portraits/women/42.jpg"}
              alt="Profile"
              className="h-8 w-8 rounded-full"
            />
            <span className="ml-2 text-sm font-medium text-gray-700 hidden lg:block">
              {user?.fullName || "Demo User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
