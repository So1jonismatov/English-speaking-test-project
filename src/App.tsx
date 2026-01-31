import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import useAuthStore from "./stores/authStore";
import { Navbar } from "@/components/Navbar";

export function App() {
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on app load
    useAuthStore.getState().initializeAuth();

    if (!loading && !isAuthenticated && window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-background font-sans text-foreground">
      <Navbar />
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
