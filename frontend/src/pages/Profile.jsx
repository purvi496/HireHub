
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Profile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    resumeLink: "",
    portfolioLink: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const sessionId = localStorage.getItem("hirehubSessionId");

        if (!sessionId) {
          throw new Error("Please login to view your profile.");
        }

        const response = await fetch("/auth/profile", {
          headers: { Authorization: sessionId }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          skills: (data.skills || []).join(", "),
          resumeLink: data.resumeLink || "",
          portfolioLink: data.portfolioLink || ""
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("hirehubSessionId")
        },
        body: JSON.stringify({
          ...form,
          skills: form.skills
            .split(",")
            .map(skill => skill.trim())
            .filter(Boolean)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

      localStorage.setItem("user", JSON.stringify({
        ...savedUser,
        name: data.user.name
      }));

      setMessage(data.message || "Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="post-job-page">
      <header className="jobs-header">
        <Link to="/" className="logo">
          Hire<span>Hub</span>.
        </Link>
        <Link to="/jobs" className="jobs-home-link">
          Explore Jobs
        </Link>
      </header>

      <main className="post-job-container">
        <div className="post-job-card">
          <span className="section-label">CANDIDATE PORTAL</span>
          <h1>My Profile</h1>
          <p>Keep your professional information up to date.</p>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="apply-success">{message}</p>}

          <form onSubmit={handleSubmit}>
            <label>Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              value={form.email}
              disabled
            />

            <label>Phone Number</label>
            <input
              name="phone"
              type="tel"
              pattern="[0-9+\-\s]{10,15}"
              value={form.phone}
              onChange={handleChange}
              required
            />

            <label>Skills</label>
            <input
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="Java, React, Python"
            />

            <label>Resume Link</label>
            <input
              name="resumeLink"
              type="url"
              value={form.resumeLink}
              onChange={handleChange}
              placeholder="https://..."
              required
            />

            <label>Portfolio Link</label>
            <input
              name="portfolioLink"
              type="url"
              value={form.portfolioLink}
              onChange={handleChange}
              placeholder="https://..."
            />

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Update Profile"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Profile;
