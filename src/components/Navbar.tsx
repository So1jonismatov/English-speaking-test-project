import { Link, useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuthStore from "../stores/authStore";
import { LogOut } from "lucide-react";
import maabLogo from "@/assets/maab_logo.png";

export function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 w-full py-4">
      <div className="container mx-auto px-4 md:px-0">
        {/* Mobile/Tablet View */}
        <div className="md:hidden w-full bg-background/80 backdrop-blur-md border-b border-border py-4 px-6 fixed top-0 left-0 right-0 z-50">
          <div className="flex justify-between items-center relative">
            <Link to="/user" className="flex items-center space-x-2 relative z-10">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.name || "U"}`}
                  alt={user?.name}
                />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-xs">{user?.name}</span>
            </Link>

            {/* Centered Logo for Mobile */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Link to="/">
                <img src={maabLogo} alt="MAAB Logo" className="h-6 w-auto mix-blend-multiply opacity-80" />
              </Link>
            </div>

            <div className="flex items-center space-x-3 relative z-10">
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="text-xs hover:text-primary"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Floating navbar with squircle shape */}
        <div className="hidden md:flex justify-center">
          <div className="w-4/5 bg-background/80 backdrop-blur-sm rounded-2xl border border-border py-3 px-6 shadow-lg relative">
            <div className="flex justify-between items-center relative z-10">
              <Link to="/user" className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.name || "U"}`}
                    alt={user?.name}
                  />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">
                  {user?.name} {user?.surname}
                </span>
              </Link>

              {/* Centered Logo */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Link to="/">
                  <img src={maabLogo} alt="MAAB Logo" className="h-8 w-auto mix-blend-multiply opacity-80 hover:opacity-100 transition-opacity" />
                </Link>
              </div>

              <div className="flex items-center space-x-6">
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="hover:text-primary hover:cursor-pointer"
                  >
                    <LogOut />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
