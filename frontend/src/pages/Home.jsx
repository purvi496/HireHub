
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const categories = [
  { icon: "⌘", name: "Software Development", count: "120+ opportunities" },
  { icon: "◈", name: "Data Science", count: "65+ opportunities" },
  { icon: "✳", name: "UI/UX Design", count: "40+ opportunities" },
  { icon: "↗", name: "Marketing", count: "35+ opportunities" },
  { icon: "▤", name: "Business", count: "50+ opportunities" },
  { icon: "◎", name: "Finance", count: "25+ opportunities" },
];

const jobs = [
  {
    id: 101,
    company: "Tech Solutions",
    initial: "T",
    role: "Frontend Developer",
    location: "Bangalore",
    type: "Full-time",
    salary: "₹6 LPA",
    skills: ["React", "JavaScript", "CSS"],
  },
  {
    id: 102,
    company: "Innovate Labs",
    initial: "I",
    role: "Backend Developer",
    location: "Hyderabad",
    type: "Full-time",
    salary: "₹8 LPA",
    skills: ["Node.js", "Express", "Java"],
  },
  {
    id: 103,
    company: "DataWorks",
    initial: "D",
    role: "Python Intern",
    location: "Remote",
    type: "Internship",
    salary: "₹2 LPA",
    skills: ["Python", "SQL", "Data"],
  },
];

function Home() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  function handleSearch(event) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (location.trim()) params.set("location", location.trim());

    navigate(`/jobs?${params.toString()}`);
  }

  return (
    <div className="hirehub-home">
      <Navbar />

      {/* HERO SECTION */}
      <section className="simple-hero">
        <div className="hero-inner hero-simple-inner">
          <div className="hero-copy hero-simple-copy">
            <span className="hero-label">WELCOME TO HIREHUB</span>

            <h1>
              Find jobs that match
              <br />
              <span>your skills.</span>
            </h1>

            <p>
              Explore job opportunities, discover companies and
              find the right opportunity to grow your career.
            </p>

            <form className="simple-search" onSubmit={handleSearch}>
              <div className="simple-search-field">
                <span>⌕</span>
                <input
                  placeholder="Job title or keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <div className="simple-search-field">
                <span>⌖</span>
                <input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <button type="submit" className="simple-search-button">
                Search Jobs
              </button>
            </form>

            <div className="hero-caption">
              Popular searches:
              <Link to="/jobs?keyword=React">React Developer</Link>
              <Link to="/jobs?keyword=Java">Java</Link>
              <Link to="/jobs?keyword=Python">Python</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="home-section categories-section">
        <div className="home-section-heading">
          <div>
            <span className="section-label">JOB CATEGORIES</span>
            <h2>Browse by category</h2>
            <p>Find opportunities in the field you want to grow in.</p>
          </div>

          <Link to="/jobs" className="section-link">
            View all jobs →
          </Link>
        </div>

        <div className="home-category-grid">
          {categories.map((category) => (
            <Link
              to={`/jobs?category=${encodeURIComponent(category.name)}`}
              className="home-category"
              key={category.name}
            >
              <div className="home-category-icon">
                {category.icon}
              </div>

              <div>
                <h3>{category.name}</h3>
                <p>{category.count}</p>
              </div>

              <span className="category-chevron">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* LATEST JOBS SECTION */}
      <section className="home-section jobs-section">
        <div className="home-section-heading">
          <div>
            <span className="section-label">RECENT JOBS</span>
            <h2>Latest job openings</h2>
            <p>Check out some of the latest opportunities.</p>
          </div>

          <Link to="/jobs" className="section-link">
            Browse all jobs →
          </Link>
        </div>

        <div className="home-job-list">
          {jobs.map((job) => (
            <article className="home-job-card" key={job.id}>
              <div className="home-company-logo">
                {job.initial}
              </div>

              <div className="home-job-details">
                <h3>{job.role}</h3>
                <p>{job.company}</p>

                <div className="home-job-tags">
                  <span>⌖ {job.location}</span>
                  <span>◷ {job.type}</span>

                  {job.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>

              <div className="home-job-action">
                <strong>{job.salary}</strong>

                <Link to={`/jobs/${job.id}`}>
                  View details →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* RECRUITER SECTION */}
      <section className="recruiter-section">
        <div>
          <span className="section-label">FOR EMPLOYERS</span>
          <h2>Hire the right people</h2>
          <p>
            Post job openings and connect with candidates
            looking for new opportunities.
          </p>
        </div>

        <Link to="/register">Start hiring →</Link>
      </section>

      {/* FOOTER */}
      <footer className="simple-footer">
        <Link to="/" className="footer-brand">
          Hire<span>Hub</span>.
        </Link>

        <p>Connecting people with opportunities.</p>

        <span>© 2026 HireHub</span>
      </footer>
    </div>
  );
}

export default Home;
