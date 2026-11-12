
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchApplications() {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        const sessionId = localStorage.getItem("hirehubSessionId");

        if (!user || !sessionId) {
          throw new Error("Please login to view your applications.");
        }

        const response = await fetch(
          `/applications/candidate/${user.id}`,
          {
            headers: {
              Authorization: sessionId
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load applications.");
        }

        setApplications(Array.isArray(data) ? data : data.applications || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  function getStatusClass(status) {
    if (status === "Shortlisted") return "status-shortlisted";
    if (status === "Rejected") return "status-rejected";
    return "status-applied";
  }

  return (
    <div className="applications-page">
      <header className="jobs-header">
        <Link to="/" className="logo">
          Hire<span>Hub</span>.
        </Link>
        <Link to="/jobs" className="jobs-home-link">
          Explore Jobs
        </Link>
      </header>

      <main className="applications-container">
        <span className="section-label">YOUR CAREER JOURNEY</span>
        <h1>My Applications</h1>
        <p>Keep track of the jobs you've applied for.</p>

        {loading && <p>Loading applications...</p>}

        {error && <p className="auth-error">{error}</p>}

        {!loading && !error && applications.length === 0 && (
          <div className="no-applications">
            <h2>No applications yet</h2>
            <p>Start exploring opportunities and apply for jobs.</p>
            <Link to="/jobs">Explore Jobs →</Link>
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="applications-list">
            {applications.map((application) => {
              const job = application.job || {};

              return (
                <article className="application-card" key={application.id}>
                  <div>
                    <h3>
                      {job.title || application.jobTitle || "Job Application"}
                    </h3>
                    <p>
                      {job.company || application.company || "Company"}
                    </p>
                    <span className={`application-status ${getStatusClass(application.status)}`}>
                      {application.status || "Applied"}
                    </span>
                  </div>

                  <Link to={`/jobs/${application.jobId}`}>
                    View Job →
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyApplications;
