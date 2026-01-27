import { Link, useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuthStore from "../stores/authStore";
import { LogOut } from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="absolute! inset-x-0 top-0 z-30 w-full py-4">
      <div className="container mx-auto px-4">
        <div className="md:hidden w-full bg-background/80 backdrop-blur-sm rounded-lg border border-border py-3 px-4">
          <div className="flex justify-between items-center">
            <Link to="/user" className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.name || "U"}`}
                  alt={user?.name}
                />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">{user?.name}</span>
            </Link>

            <div className="flex items-center space-x-3">
              <Link to="/" className="text-sm hover:text-primary">
                Home
              </Link>

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="text-sm hover:text-primary"
                >
                  <LogOut />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Floating navbar with squircle shape */}
        <div className="hidden md:flex justify-center">
          <div className="w-4/5 bg-background/80 backdrop-blur-sm rounded-2xl border border-border py-3 px-6 shadow-lg">
            <div className="flex justify-between items-center">
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

              <div className="flex items-center space-x-6">
                <Link to="/" className="hover:text-primary">
                  Home
                </Link>

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
