import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import useAuthStore from "./stores/authStore";
import { Navbar } from "@/components/Navbar";

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useAuthStore((state) => state.loading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  const isTestRoute = location.pathname.startsWith("/test/");

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (
      !loading &&
      !isAuthenticated &&
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/signup"
    ) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-background font-sans text-foreground">
      {!isTestRoute && <Navbar />}
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
