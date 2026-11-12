
const express = require("express");
const router = express.Router();

const { authenticate, authorize } =
    require("../middleware/authMiddleware");

const jobs = require("../data/jobs");

// 1. GET all jobs with search, filters and pagination
router.get("/", (req, res) => {

    const {
        keyword,
        location,
        type,
        minSalary,
        maxSalary,
        page = 1,
        limit = 6
    } = req.query;

    const currentPage = Number(page);
    const pageLimit = Number(limit);

    // Validate pagination
    if (
        !Number.isInteger(currentPage) ||
        currentPage < 1 ||
        !Number.isInteger(pageLimit) ||
        pageLimit < 1 ||
        pageLimit > 50
    ) {
        return res.status(400).json({
            message: "Invalid page or limit"
        });
    }

    // Validate salary filters
    const min = minSalary === undefined ? undefined : Number(minSalary);
    const max = maxSalary === undefined ? undefined : Number(maxSalary);

    if (
        (min !== undefined && (!Number.isFinite(min) || min < 0)) ||
        (max !== undefined && (!Number.isFinite(max) || max < 0)) ||
        (min !== undefined && max !== undefined && min > max)
    ) {
        return res.status(400).json({
            message: "Invalid salary range"
        });
    }

    let filteredJobs = [...jobs];

    // Keyword search
    if (keyword) {
        const search = keyword.trim().toLowerCase();

        filteredJobs = filteredJobs.filter(job =>
            job.title.toLowerCase().includes(search) ||
            job.company.toLowerCase().includes(search) ||
            job.description.toLowerCase().includes(search) ||
            job.skills.some(skill =>
                skill.toLowerCase().includes(search)
            )
        );
    }

    // Location filter
    if (location) {
        const searchLocation = location.trim().toLowerCase();

        filteredJobs = filteredJobs.filter(job =>
            job.location.toLowerCase().includes(searchLocation)
        );
    }

    // Job type filter
    if (type) {
        filteredJobs = filteredJobs.filter(job =>
            job.type.toLowerCase() === type.trim().toLowerCase()
        );
    }

    // Minimum salary filter
    if (min !== undefined) {
        filteredJobs = filteredJobs.filter(job =>
            job.salary >= min
        );
    }

    // Maximum salary filter
    if (max !== undefined) {
        filteredJobs = filteredJobs.filter(job =>
            job.salary <= max
        );
    }

    // Pagination
    const totalJobs = filteredJobs.length;
    const totalPages = Math.ceil(totalJobs / pageLimit);

    const startIndex = (currentPage - 1) * pageLimit;

    const paginatedJobs = filteredJobs.slice(
        startIndex,
        startIndex + pageLimit
    );

    res.status(200).json({
        totalJobs,
        totalPages,
        currentPage,
        pageLimit,
        jobs: paginatedJobs
    });
});


// 2. GET job by ID
router.get("/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid job ID"
        });
    }

    const job = jobs.find(j => j.id === id);

    if (!job) {
        return res.status(404).json({
            message: "Job not found"
        });
    }

    res.status(200).json(job);
});


// 3. POST - Add a new job
router.post(
    "/",
    authenticate,
    authorize("recruiter"),
    (req, res) => {

        const {
            title,
            company,
            location,
            salary,
            type,
            description,
            skills
        } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof company !== "string" || !company.trim() ||
            typeof location !== "string" || !location.trim() ||
            typeof salary !== "number" || salary <= 0 ||
            typeof type !== "string" || !type.trim() ||
            typeof description !== "string" || !description.trim() ||
            !Array.isArray(skills) ||
            skills.length === 0 ||
            !skills.every(s => typeof s === "string" && s.trim())
        ) {
            return res.status(400).json({
                message: "Please provide valid job details"
            });
        }

        const newJob = {
            id: jobs.length > 0
                ? Math.max(...jobs.map(j => j.id)) + 1
                : 101,
            title: title.trim(),
            company: company.trim(),
            location: location.trim(),
            salary,
            type: type.trim(),
            description: description.trim(),
            skills,
            recruiterId: req.user.id
        };

        jobs.push(newJob);

        res.status(201).json({
            message: "Job added successfully",
            job: newJob
        });
    }
);


// 4. PUT - Update a job
router.put(
    "/:id",
    authenticate,
    authorize("recruiter"),
    (req, res) => {

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid job ID"
            });
        }

        const job = jobs.find(j => j.id === id);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        // Check job ownership
        if (job.recruiterId !== req.user.id) {
            return res.status(403).json({
                message: "You can only update your own jobs"
            });
        }

        const {
            title,
            company,
            location,
            salary,
            type,
            description,
            skills
        } = req.body;

        if (
            (title !== undefined &&
                (typeof title !== "string" || !title.trim())) ||
            (company !== undefined &&
                (typeof company !== "string" || !company.trim())) ||
            (location !== undefined &&
                (typeof location !== "string" || !location.trim())) ||
            (salary !== undefined &&
                (typeof salary !== "number" || salary <= 0)) ||
            (type !== undefined &&
                (typeof type !== "string" || !type.trim())) ||
            (description !== undefined &&
                (typeof description !== "string" || !description.trim())) ||
            (skills !== undefined &&
                (!Array.isArray(skills) ||
                skills.length === 0 ||
                !skills.every(s => typeof s === "string" && s.trim())))
        ) {
            return res.status(400).json({
                message: "Invalid job details"
            });
        }

        Object.assign(job, {
            ...(title !== undefined && { title: title.trim() }),
            ...(company !== undefined && { company: company.trim() }),
            ...(location !== undefined && { location: location.trim() }),
            ...(salary !== undefined && { salary }),
            ...(type !== undefined && { type: type.trim() }),
            ...(description !== undefined && { description: description.trim() }),
            ...(skills !== undefined && { skills })
        });

        res.status(200).json({
            message: "Job updated successfully",
            job
        });
    }
);


// 5. DELETE - Delete a job
router.delete(
    "/:id",
    authenticate,
    authorize("recruiter"),
    (req, res) => {

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid job ID"
            });
        }

        const index = jobs.findIndex(j => j.id === id);

        if (index === -1) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        const job = jobs[index];

        // Check job ownership
        if (job.recruiterId !== req.user.id) {
            return res.status(403).json({
                message: "You can only delete your own jobs"
            });
        }

        const deletedJob = jobs.splice(index, 1);

        res.status(200).json({
            message: "Job deleted successfully",
            job: deletedJob[0]
        });
    }
);

module.exports = router;
