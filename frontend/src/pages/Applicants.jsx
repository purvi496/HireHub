
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function Applicants() {
  const { jobId } = useParams();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sessionId = localStorage.getItem("hirehubSessionId");

  useEffect(() => {
    async function fetchApplicants() {
      try {
        const response = await fetch("/applications", {
          headers: { Authorization: sessionId }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load applicants");
        }

        const allApplications = Array.isArray(data)
          ? data
          : data.applications || [];

        setApplications(
          allApplications.filter(app => Number(app.jobId) === Number(jobId))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchApplicants();
  }, [jobId]);

  async function updateStatus(applicationId, status) {
    try {
      const response = await fetch(`/applications/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionId
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update status");
      }

      setApplications(current =>
        current.map(app =>
          app.id === applicationId ? { ...app, status } : app
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="applications-page">
      <header className="jobs-header">
        <Link to="/" className="logo">
          Hire<span>Hub</span>.
        </Link>
        <Link to="/recruiter-dashboard" className="jobs-home-link">
          Dashboard
        </Link>
      </header>

      <main className="applications-container">
        <span className="section-label">RECRUITER PORTAL</span>
        <h1>Manage Applicants</h1>
        <p>Review candidates who applied for this job.</p>

        {loading && <p>Loading applicants...</p>}
        {error && <p className="auth-error">{error}</p>}

        {!loading && !error && applications.length === 0 && (
          <div className="no-applications">
            <h2>No applicants yet</h2>
            <p>Applications for this job will appear here.</p>
          </div>
        )}

        {!loading && applications.length > 0 && (
          <div className="applications-list">
            {applications.map(app => (
              <article className="application-card" key={app.id}>
                <div className="applicant-info">
                  <h3>{app.fullName || app.candidate?.name}</h3>
                  <p>{app.email || app.candidate?.email}</p>
                  <p>Phone: {app.phone || "Not provided"}</p>
                  <p>Status: <strong>{app.status}</strong></p>

                  <p className="applicant-cover-letter">
                    <strong>Cover Letter:</strong><br />
                    {app.coverLetter || "No cover letter provided"}
                  </p>

                  {app.resumeLink && (
                    <a
                      href={app.resumeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resume-link"
                    >
                      View Resume →
                    </a>
                  )}

                  <div className="applicant-actions">
                    <button
                      onClick={() => updateStatus(app.id, "Shortlisted")}
                      disabled={app.status === "Shortlisted"}
                    >
                      Shortlist
                    </button>

                    <button
                      className="reject-button"
                      onClick={() => updateStatus(app.id, "Rejected")}
                      disabled={app.status === "Rejected"}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Applicants;
