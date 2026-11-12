const { router: authRoutes } = require("./routes/authRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const jobRoutes = require("./routes/jobRoutes");
const express = require("express");

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to HireHub API!");
});
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.use("/auth", authRoutes);
// Start server
app.listen(PORT, () => {
    console.log(`HireHub server running on http://localhost:${PORT}`);
});
