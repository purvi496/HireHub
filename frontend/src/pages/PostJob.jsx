
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function PostJob() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    type: "Full-time",
    description: "",
    skills: ""
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const sessionId = localStorage.getItem("hirehubSessionId");

    if (!user || user.role !== "recruiter" || !sessionId) {
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionId
        },
        body: JSON.stringify({
          ...form,
          salary: Number(form.salary),
          skills: form.skills
            .split(",")
            .map(skill => skill.trim())
            .filter(Boolean)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to post job.");
      }

      alert("Job posted successfully!");
      navigate("/recruiter-dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="post-job-page">
      <header className="jobs-header">
        <Link to="/" className="logo">
          Hire<span>Hub</span>.
        </Link>

        <Link to="/recruiter-dashboard" className="jobs-home-link">
          Dashboard
        </Link>
      </header>

      <main className="post-job-container">
        <Link to="/recruiter-dashboard" className="back-link">
          ← Back to Dashboard
        </Link>

        <div className="post-job-card">
          <span className="section-label">RECRUITER PORTAL</span>
          <h1>Post a New Job</h1>
          <p>Enter the details of the opportunity you want to advertise.</p>

          {error && (
            <p className="auth-error">{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            <label>Job Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Frontend Developer"
              required
            />

            <label>Company Name</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Enter company name"
              required
            />

            <label>Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Bangalore or Remote"
              required
            />

            <label>Annual Salary (in INR)</label>
            <input
              name="salary"
              type="number"
              min="1"
              value={form.salary}
              onChange={handleChange}
              placeholder="e.g. 600000"
              required
            />

            <label>Job Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>

            <label>Job Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the role and responsibilities..."
              rows="5"
              required
            />

            <label>Required Skills</label>
            <input
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="React, JavaScript, CSS"
              required
            />
            <small>Separate skills using commas.</small>

            <button type="submit" disabled={submitting}>
              {submitting ? "Posting Job..." : "Publish Job"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default PostJob;
