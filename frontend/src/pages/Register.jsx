
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, company }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed.");
      }

      navigate("/login", {
        state: { successMessage: "Registration successful. Please log in." },
      });
    } catch (submitError) {
      setError(
        submitError instanceof TypeError
          ? "Could not connect to the server. Make sure the backend is running on port 5000."
          : submitError.message || "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">Hire<span>Hub</span>.</Link>

        <h2>Create your account</h2>
        <p>Join HireHub and discover new opportunities.</p>

        {error && <p className="auth-feedback auth-error" role="alert">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="register-name">Full name</label>
          <input
            id="register-name"
            type="text"
            placeholder="Enter your name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <label htmlFor="register-role">Account type</label>
          <select
            id="register-role"
            required
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="" disabled>Select account type</option>
            <option value="candidate">Candidate</option>
            <option value="recruiter">Recruiter</option>
          </select>

          {role === "recruiter" && (
            <>
              <label htmlFor="register-company">Company name</label>
              <input
                id="register-company"
                type="text"
                placeholder="Enter your company name"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                required
              />
            </>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
