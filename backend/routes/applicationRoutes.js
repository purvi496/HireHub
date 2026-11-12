
const express = require("express");
const router = express.Router();

const jobs = require("../data/jobs");
const users = require("../data/users");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// In-memory application storage
// Applications remain available while the backend server is running.
let applications = [];
let nextApplicationId = 1;

// GET all applications belonging to a recruiter's jobs
router.get("/", authenticate, authorize("recruiter"), (req, res) => {
  const recruiterJobs = jobs.filter(
    job => job.recruiterId === req.user.id
  );

  const recruiterJobIds = recruiterJobs.map(job => job.id);

  const result = applications
    .filter(app => recruiterJobIds.includes(app.jobId))
    .map(app => ({
      ...app,
      job: jobs.find(job => job.id === app.jobId),
      candidate: users.find(user => user.id === app.candidateId)
    }));

  res.json(result);
});

// POST a new job application
router.post("/", authenticate, authorize("candidate"), (req, res) => {
  const { jobId, fullName, email, phone, resumeLink, coverLetter } = req.body;

  if (!jobId || !fullName || !email || !phone || !resumeLink || !coverLetter) {
    return res.status(400).json({
      message: "Please complete all application fields."
    });
  }

  const job = jobs.find(item => item.id === Number(jobId));

  if (!job) {
    return res.status(404).json({ message: "Job not found." });
  }

  const alreadyApplied = applications.some(
    app => app.jobId === Number(jobId) &&
           app.candidateId === req.user.id
  );

  if (alreadyApplied) {
    return res.status(400).json({
      message: "You have already applied for this job."
    });
  }

  const application = {
    id: nextApplicationId++,
    jobId: Number(jobId),
    candidateId: req.user.id,
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    resumeLink: resumeLink.trim(),
    coverLetter: coverLetter.trim(),
    status: "Applied",
    appliedAt: new Date().toISOString()
  };

  applications.push(application);

  res.status(201).json({
    message: "Your application has been submitted successfully!",
    application
  });
});

// GET applications for a particular candidate
router.get(
  "/candidate/:candidateId",
  authenticate,
  (req, res) => {
    const candidateId = Number(req.params.candidateId);

    if (
      req.user.role === "candidate" &&
      req.user.id !== candidateId
    ) {
      return res.status(403).json({
        message: "You can only view your own applications."
      });
    }

    if (!["candidate", "recruiter"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied." });
    }

    let result = applications.filter(
      app => app.candidateId === candidateId
    );

    if (req.user.role === "recruiter") {
      const recruiterJobIds = jobs
        .filter(job => job.recruiterId === req.user.id)
        .map(job => job.id);

      result = result.filter(app => recruiterJobIds.includes(app.jobId));
    }

    result = result.map(app => ({
      ...app,
      job: jobs.find(job => job.id === app.jobId)
    }));

    res.json(result);
  }
);

// GET one application
router.get("/:id", authenticate, (req, res) => {
  const application = applications.find(
    app => app.id === Number(req.params.id)
  );

  if (!application) {
    return res.status(404).json({
      message: "Application not found."
    });
  }

  const job = jobs.find(item => item.id === application.jobId);

  const isCandidate = req.user.id === application.candidateId;
  const isRecruiter = job && req.user.id === job.recruiterId;

  if (!isCandidate && !isRecruiter) {
    return res.status(403).json({ message: "Access denied." });
  }

  res.json({
    ...application,
    job
  });
});

// UPDATE application status (recruiter only)
router.put("/:id", authenticate, authorize("recruiter"), (req, res) => {
  const application = applications.find(
    app => app.id === Number(req.params.id)
  );

  if (!application) {
    return res.status(404).json({
      message: "Application not found."
    });
  }

  const job = jobs.find(item => item.id === application.jobId);

  if (!job || job.recruiterId !== req.user.id) {
    return res.status(403).json({
      message: "You cannot update this application."
    });
  }

  const { status } = req.body;
  const allowedStatuses = ["Applied", "Shortlisted", "Rejected"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid application status."
    });
  }

  application.status = status;

  res.json({
    message: "Application status updated.",
    application
  });
});

module.exports = router;
