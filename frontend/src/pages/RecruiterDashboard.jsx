
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    async function fetchJobs() {
      try {
        if (!user || user.role !== "recruiter") {
          navigate("/login");
          return;
        }

        const response = await fetch("/jobs");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load jobs");
        }

        const allJobs = Array.isArray(data) ? data : data.jobs || [];

        const recruiterJobs = allJobs.filter(
          job => Number(job.recruiterId) === Number(user.id)
        );

        setJobs(recruiterJobs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  // DELETE JOB
  async function handleDelete(jobId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("hirehubSessionId")
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete job.");
      }

      setJobs(currentJobs =>
        currentJobs.filter(job => job.id !== jobId)
      );

    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="recruiter-dashboard">
      <header className="jobs-header">
        <Link to="/" className="logo">
          Hire<span>Hub</span>.
        </Link>

        <div>
          <span className="dashboard-welcome">
            Welcome, {user?.name || "Recruiter"}
          </span>

          <Link to="/" className="jobs-home-link">
            Home
          </Link>
        </div>
      </header>

      <main className="dashboard-container">
        <div className="dashboard-heading">
          <div>
            <span className="section-label">RECRUITER PORTAL</span>
            <h1>Dashboard</h1>
            <p>Manage your job openings and find the right talent.</p>
          </div>

          <Link to="/post-job" className="post-job-button">
            + Post a Job
          </Link>
        </div>

        <div className="dashboard-stats">
          <div className="dashboard-stat-card">
            <span>Total Jobs Posted</span>
            <h2>{jobs.length}</h2>
          </div>

          <div className="dashboard-stat-card">
            <span>Active Openings</span>
            <h2>{jobs.length}</h2>
          </div>
        </div>

        <section className="recruiter-jobs-section">
          <h2>Your Job Listings</h2>

          {loading && <p>Loading your jobs...</p>}

          {error && <p className="auth-error">{error}</p>}

          {!loading && !error && jobs.length === 0 && (
            <div className="no-jobs">
              <h3>No jobs posted yet</h3>
              <p>Post your first job to start finding candidates.</p>
              <Link to="/post-job">Post a Job →</Link>
            </div>
          )}

          {!loading && jobs.length > 0 && (
            <div className="recruiter-jobs-list">
              {jobs.map(job => (
                <article className="recruiter-job-card" key={job.id}>
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.company} · {job.location}</p>

                    <div className="home-job-tags">
                      <span>{job.type}</span>
                      <span>
                        ₹{(Number(job.salary) / 100000).toFixed(1)} LPA
                      </span>
                    </div>
                  </div>

                  <div className="recruiter-job-actions">
                    <Link to={`/jobs/${job.id}`}>
                      View
                    </Link>

                    <Link to={`/edit-job/${job.id}`}>
                      Edit
                    </Link>
                    <Link to={`/applicants/${job.id}`}>
  Applicants
</Link>
                    <button onClick={() => handleDelete(job.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default RecruiterDashboard;
