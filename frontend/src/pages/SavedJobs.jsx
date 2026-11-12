
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    setSavedJobs(saved);
  }, []);

  function removeJob(id) {
    const updated = savedJobs.filter(job => job.id !== id);
    localStorage.setItem("savedJobs", JSON.stringify(updated));
    setSavedJobs(updated);
  }

  return (
    <div className="jobs-page">
      <header className="jobs-header">
        <Link to="/" className="logo">
          Hire<span>Hub</span>.
        </Link>
        <Link to="/jobs" className="jobs-home-link">
          Explore Jobs
        </Link>
      </header>

      <main className="jobs-content">
        <span className="section-label">YOUR COLLECTION</span>
        <h1>Saved Jobs</h1>
        <p>Keep track of opportunities you are interested in.</p>

        {savedJobs.length === 0 ? (
          <div className="no-jobs">
            <h2>No saved jobs yet</h2>
            <p>Save jobs that interest you and find them here.</p>
            <Link to="/jobs">Explore Jobs →</Link>
          </div>
        ) : (
          <div className="jobs-list">
            {savedJobs.map(job => (
              <article className="home-job-card" key={job.id}>
                <div className="home-company-logo">
                  {job.company?.charAt(0) || "J"}
                </div>

                <div className="home-job-details">
                  <h3>{job.title}</h3>
                  <p>{job.company} · {job.location}</p>
                  <div className="home-job-tags">
                    <span>{job.type}</span>
                  </div>
                </div>

                <div className="home-job-action">
                  <Link to={`/jobs/${job.id}`}>View Details →</Link>
                  <button onClick={() => removeJob(job.id)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default SavedJobs;
