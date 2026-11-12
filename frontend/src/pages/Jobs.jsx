
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const categoryKeywords = {
  "Software Development": [
    "software", "developer", "frontend", "backend",
    "full stack", "react", "node", "java", "javascript"
  ],
  "Data Science": [
    "data", "python", "machine learning", "ml",
    "analyst", "artificial intelligence", "sql"
  ],
  "UI/UX Design": ["ui", "ux", "designer", "design"],
  "Marketing": ["marketing", "seo", "social media", "content"],
  "Business": ["business", "management", "sales", "operations"],
  "Finance": ["finance", "accountant", "accounting", "financial"]
};

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();

  const [location, setLocation] = useState(
    searchParams.get("location") || ""
  );
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [jobType, setJobType] = useState("");

  const [savedJobs, setSavedJobs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("savedJobs") || "[]");
    } catch {
      return [];
    }
  });

  const selectedCategory = searchParams.get("category") || "";
  const keyword = searchParams.get("keyword") || "";

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("/jobs");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load jobs");
        }

        setJobs(Array.isArray(data) ? data : data.jobs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  function toggleSavedJob(job) {
    const alreadySaved = savedJobs.some(
      saved => saved.id === job.id
    );

    const updated = alreadySaved
      ? savedJobs.filter(saved => saved.id !== job.id)
      : [...savedJobs, job];

    localStorage.setItem("savedJobs", JSON.stringify(updated));
    setSavedJobs(updated);
  }

  const filteredJobs = jobs.filter(job => {
    const searchableText = [
      job.title,
      job.company,
      job.description,
      job.location,
      ...(Array.isArray(job.skills) ? job.skills : [])
    ].filter(Boolean).join(" ").toLowerCase();

    if (selectedCategory) {
      const keywords = categoryKeywords[selectedCategory] || [];

      if (!keywords.some(word => searchableText.includes(word))) {
        return false;
      }
    }

    if (keyword && !searchableText.includes(keyword.toLowerCase())) {
      return false;
    }

    if (
      location &&
      !job.location?.toLowerCase().includes(location.toLowerCase())
    ) {
      return false;
    }

    if (minSalary && Number(job.salary) < Number(minSalary)) {
      return false;
    }

    if (maxSalary && Number(job.salary) > Number(maxSalary)) {
      return false;
    }

    if (jobType && job.type !== jobType) {
      return false;
    }

    return true;
  });

  const heading = selectedCategory ||
    (keyword ? `Jobs matching "${keyword}"` : "Find your next opportunity.");

  return (
    <div className="jobs-page">
      <header className="jobs-header">
        <Link to="/" className="logo">
          Hire<span>Hub</span>.
        </Link>

        <div>
          <Link to="/" className="jobs-home-link">Home</Link>
          {" "}
          <Link to="/saved-jobs" className="jobs-home-link">
            Saved Jobs ♥
          </Link>
        </div>
      </header>

      <section className="jobs-content">
        <span className="section-label">EXPLORE OPPORTUNITIES</span>

        <h1>{heading}</h1>

        <p>Discover opportunities that match your skills and ambitions.</p>

        {/* FILTERS */}
        <div className="jobs-filter-panel">
          <input
            type="text"
            placeholder="Search location"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />

          <input
            type="number"
            placeholder="Minimum salary (INR)"
            value={minSalary}
            onChange={e => setMinSalary(e.target.value)}
          />

          <input
            type="number"
            placeholder="Maximum salary (INR)"
            value={maxSalary}
            onChange={e => setMaxSalary(e.target.value)}
          />

          <select
            value={jobType}
            onChange={e => setJobType(e.target.value)}
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setLocation("");
              setMinSalary("");
              setMaxSalary("");
              setJobType("");
            }}
          >
            Clear Filters
          </button>
        </div>

        {selectedCategory && (
          <Link to="/jobs" className="clear-filter">
            Clear category filter ×
          </Link>
        )}

        {keyword && (
          <Link to="/jobs" className="clear-filter">
            Clear search ×
          </Link>
        )}

        {loading && <p>Loading jobs...</p>}

        {error && <p className="auth-error">{error}</p>}

        {!loading && !error && (
          <>
            <p className="jobs-result-count">
              {filteredJobs.length} job(s) found
            </p>

            {filteredJobs.length === 0 ? (
              <div className="no-jobs">
                <h2>No matching jobs found</h2>
                <p>Try changing your filters or explore all opportunities.</p>
                <Link to="/jobs">View all jobs →</Link>
              </div>
            ) : (
              <div className="jobs-list">
                {filteredJobs.map(job => {
                  const isSaved = savedJobs.some(
                    saved => saved.id === job.id
                  );

                  return (
                    <article className="home-job-card" key={job.id}>
                      <div className="home-company-logo">
                        {job.company?.charAt(0) || "J"}
                      </div>

                      <div className="home-job-details">
                        <h3>{job.title}</h3>
                        <p>{job.company} · {job.location}</p>

                        <div className="home-job-tags">
                          <span>{job.type}</span>

                          {job.skills?.map(skill => (
                            <span key={skill}>{skill}</span>
                          ))}
                        </div>
                      </div>

                      <div className="home-job-action">
                        <strong>
                          ₹{(Number(job.salary) / 100000).toFixed(1)} LPA
                        </strong>

                        <Link to={`/jobs/${job.id}`}>
                          View details →
                        </Link>

                        <button
                          type="button"
                          onClick={() => toggleSavedJob(job)}
                          className="save-job-button"
                        >
                          {isSaved ? "♥ Saved" : "♡ Save Job"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Jobs;
