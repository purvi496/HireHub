
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Update navbar after login or logout navigation
  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    } catch {
      setUser(null);
    }
  }, [location]);

  async function handleLogout() {
    const sessionId = localStorage.getItem("hireHubSessionId") ||
      localStorage.getItem("hirehubSessionId");

    try {
      if (sessionId) {
        await fetch("/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: sessionId
          },
          body: JSON.stringify({ sessionId })
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("hirehubSessionId");
      localStorage.removeItem("user");
      localStorage.removeItem("hirehubUser");
      setUser(null);
      navigate("/");
    }
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        Hire<span>Hub</span>.
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/jobs">Find Jobs</Link>

        {user?.role === "candidate" && (
          <Link to="/my-applications">My Applications</Link>
        )}

        {user?.role === "recruiter" && (
          <Link to="/recruiter-dashboard">Dashboard</Link>
        )}
      </div>

      <div className="nav-buttons">
        {!user ? (
          <>
            <Link to="/login" className="login-btn">
              Login
            </Link>

            <Link to="/register" className="signup-btn">
              Sign Up
            </Link>
          </>
        ) : (
          <>
            {user.role === "candidate" && (
              <>
                <Link to="/saved-jobs">Saved Jobs</Link>
                <Link to="/profile">My Profile</Link>
              </>
            )}

            <span className="navbar-user">
              Hi, {user.name?.split(" ")[0]}
            </span>

            <button
              onClick={handleLogout}
              className="login-btn navbar-logout"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
