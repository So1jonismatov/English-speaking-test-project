import { Outlet, Link, useNavigate } from "react-router";
import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function App() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user && window.location.pathname === "/") {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Floating navbar for large screens, normal navbar for mobile */}
      <nav className="absolute inset-x-0 top-0 z-30 w-full py-4">
        <div className="container mx-auto px-4">
          {/* Mobile: Normal navbar */}
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
                <Link to="/test" className="text-sm hover:text-primary">
                  Test
                </Link>
                <Link to="/user" className="text-sm hover:text-primary">
                  Profile
                </Link>

                {user && (
                  <button
                    onClick={handleLogout}
                    className="text-sm hover:text-primary"
                  >
                    Logout
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
                  <Link to="/test" className="hover:text-primary">
                    Test
                  </Link>
                  <Link to="/user" className="hover:text-primary">
                    Profile
                  </Link>

                  {user && (
                    <button
                      onClick={handleLogout}
                      className="hover:text-primary"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-screen h-screen">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
