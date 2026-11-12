
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          "Invalid server response. Check the backend and Vite proxy."
        );
      }

      if (!response.ok) {
        throw new Error(result.message || "Login failed.");
      }

      if (!result.sessionId || !result.user) {
        throw new Error("Login response is missing session information.");
      }

      localStorage.setItem("hirehubSessionId", result.sessionId);
      localStorage.setItem("user", JSON.stringify(result.user));

      if (result.user.role === "recruiter") {
        navigate("/recruiter-dashboard");
      } else {
        // Return candidate to the job they wanted to apply for
        navigate(location.state?.from || "/jobs");
      }

    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          Hire<span>Hub</span>.
        </Link>

        <h2>Welcome back</h2>
        <p>Login to continue your job search.</p>

        {error && (
          <p className="auth-feedback auth-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
