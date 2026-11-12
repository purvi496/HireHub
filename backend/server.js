
const { router: authRoutes } = require("./routes/authRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const jobRoutes = require("./routes/jobRoutes");
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.use("/auth", authRoutes);

// Serve React frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Handle React routes
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`HireHub server running on port ${PORT}`);
});
