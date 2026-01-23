import { Outlet, Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Change to true to see home page

  useEffect(() => {
    // Redirect to login if not logged in and trying to access the home page
    if (!isLoggedIn && window.location.pathname === '/') {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="">
      <nav style={{ padding: "1rem", background: "#f0f0f0" }}>
        <Link to="/" style={{ margin: "0 10px" }}>Home</Link>
        <Link to="/login" style={{ margin: "0 10px" }}>Login</Link>
        <Link to="/signup" style={{ margin: "0 10px" }}>Sign Up</Link>
        {isLoggedIn && <Link to="/user" style={{ margin: "0 10px" }}>User Profile</Link>}
        {isLoggedIn && <Link to="/detail/123" style={{ margin: "0 10px" }}>Exam Detail (ID: 123)</Link>}
        <button onClick={() => setIsLoggedIn(!isLoggedIn)} style={{ marginLeft: "20px" }}>
          {isLoggedIn ? "Log Out" : "Log In (for testing)"}
        </button>
      </nav>
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default App;