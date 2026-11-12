
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    resumeLink: "",
    coverLetter: ""
  });

  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await fetch(`/jobs/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Job not found");
        }

        setJob(data.job || data);
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

  function openApplicationForm() {
    const sessionId = localStorage.getItem("hirehubSessionId");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!sessionId || !user) {
      navigate("/login", {
        state: { from: `/jobs/${id}` }
      });
      return;
    }

    if (user.role !== "candidate") {
      setError("Only candidates can apply for jobs.");
      return;
    }

    setForm({
      ...form,
      fullName: user.name || "",
      email: user.email || ""
    });

    setError("");
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const sessionId = localStorage.getItem("hirehubSessionId");

    try {
      setApplying(true);
      setError("");

      const response = await fetch("/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionId
        },
        body: JSON.stringify({
          ...form,
          jobId: Number(id)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Application failed.");
      }

      setMessage(data.message || "Application submitted successfully!");
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return <div className="job-details-page">Loading job details...</div>;
  }

  if (!job) {
    return (
      <div className="job-details-page">
        <h2>{error || "Job not found"}</h2>
        <Link to="/jobs">Back to jobs</Link>
      </div>
    );
  }

  return (
    <div className="job-details-page">
      <header className="jobs-header">
        <Link to="/" className="logo">
          Hire<span>Hub</span>.
        </Link>
        <Link to="/jobs" className="jobs-home-link">
          All Jobs
        </Link>
      </header>

      <main className="job-details-container">
        <Link to="/jobs" className="back-link">
          ← Back to jobs
        </Link>

        <section className="job-details-card">
          <div className="job-details-top">
            <div className="home-company-logo">
              {job.company?.charAt(0) || "J"}
            </div>

            <div>
              <h1>{job.title}</h1>
              <p>{job.company}</p>
            </div>
          </div>

          <div className="job-details-info">
            <span>📍 {job.location}</span>
            <span>💼 {job.type}</span>
            <span>
              💰 ₹{(Number(job.salary) / 100000).toFixed(1)} LPA
            </span>
          </div>

          <hr />

          <h2>Job Description</h2>
          <p>{job.description}</p>

          <h2>Required Skills</h2>
          <div className="home-job-tags">
            {job.skills?.map(skill => (
              <span key={skill}>{skill}</span>
            ))}
          </div>

          {message && (
            <p className="apply-success">{message}</p>
          )}

          {error && (
            <p className="apply-error">{error}</p>
          )}

          {!showForm && !message && (
            <button
              className="apply-job-btn"
              onClick={openApplicationForm}
            >
              Apply Now
            </button>
          )}

          {showForm && (
            <form className="application-form" onSubmit={handleSubmit}>
              <h2>Job Application</h2>
              <p>Complete your details to apply for this position.</p>

              <label>Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
              />

              <label>Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <label>Phone Number</label>
              <input
                name="phone"
                type="tel"
                pattern="[0-9+\-\s]{10,15}"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={handleChange}
                required
              />

              <label>Resume Link (Google Drive or portfolio)</label>
              <input
                name="resumeLink"
                type="url"
                placeholder="https://..."
                value={form.resumeLink}
                onChange={handleChange}
                required
              />

              <label>Cover Letter</label>
              <textarea
                name="coverLetter"
                rows="5"
                placeholder="Tell the employer why you are suitable for this role..."
                value={form.coverLetter}
                onChange={handleChange}
                required
              />

              <div className="application-form-actions">
                <button type="submit" disabled={applying}>
                  {applying ? "Submitting..." : "Submit Application"}
                </button>

                <button
                  type="button"
                  className="cancel-application-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default JobDetails;
