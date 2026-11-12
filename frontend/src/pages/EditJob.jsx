
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function EditJob() {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await fetch(`/jobs/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to find job.");
        }

        const job = data.job || data;

        setForm({
          title: job.title || "",
          company: job.company || "",
          location: job.location || "",
          salary: job.salary || "",
          type: job.type || "Full-time",
          description: job.description || "",
          skills: Array.isArray(job.skills)
            ? job.skills.join(", ")
            : ""
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const sessionId = localStorage.getItem("hirehubSessionId");

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`/jobs/${id}`, {
        method: "PUT",
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
        throw new Error(data.message || "Unable to update job.");
      }

      navigate("/recruiter-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading job details...</p>;

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
          <h1>Edit Job</h1>
          <p>Update the details of your job opening.</p>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <label>Job Title</label>
            <input name="title" value={form.title} onChange={handleChange} required />

            <label>Company Name</label>
            <input name="company" value={form.company} onChange={handleChange} required />

            <label>Location</label>
            <input name="location" value={form.location} onChange={handleChange} required />

            <label>Annual Salary (INR)</label>
            <input
              name="salary"
              type="number"
              min="1"
              value={form.salary}
              onChange={handleChange}
              required
            />

            <label>Job Type</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Internship</option>
              <option>Contract</option>
            </select>

            <label>Job Description</label>
            <textarea
              name="description"
              rows="5"
              value={form.description}
              onChange={handleChange}
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

            <button type="submit" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditJob;
