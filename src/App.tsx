import { Outlet, Link, useNavigate } from "react-router";
import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";

export function App() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user && window.location.pathname === '/') {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="">
      <nav style={{ padding: "1rem", background: "#f0f0f0" }}>
        <Link to="/" style={{ margin: "0 10px" }}>Home</Link>
        {!user && <Link to="/login" style={{ margin: "0 10px" }}>Login</Link>}
        {!user && <Link to="/signup" style={{ margin: "0 10px" }}>Sign Up</Link>}
        {user && <Link to="/user" style={{ margin: "0 10px" }}>User Profile</Link>}
        {user && <Link to="/detail/123" style={{ margin: "0 10px" }}>Exam Detail (ID: 123)</Link>}
        {user && (
          <button onClick={handleLogout} style={{ marginLeft: "20px" }}>
            Log Out
          </button>
        )}
      </nav>
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default App;