
const express = require("express");

const authRoutes = require("./routes/authRoutes");

const app = express();

const authenticate = require("./middleware/authenticate");
const authorize = require("./middleware/authorize");

// Parse incoming JSON request bodies.
app.use(express.json({ limit: "16kb" }));

// Existing health check — keep this unchanged.
app.get("/api/health", (req, res) => {
    res.json({ message: "Leaderboard API is running" });
});

// SCRUM-13: Authentication endpoints.
app.use("/api/auth", authRoutes);

// Centralized error handler.
app.use((err, req, res, next) => {
    console.error("Application error:", err);

    res.status(500).json({
        message: "Internal server error"
    });
});

module.exports = app;
