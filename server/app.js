
const express = require("express");

const authRoutes = require("./routes/authRoutes");

const cors = require("cors");

const app = express();

app.use(cors({
    origin: "http://localhost:5173", // Adjust this to your frontend's URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

const authenticate = require("./middleware/authenticate");
const authorize = require("./middleware/authorize");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

// Parse incoming JSON request bodies.
app.use(express.json({ limit: "16kb" }));

// Existing health check — keep this unchanged.
app.get("/api/health", (req, res) => {
    res.json({ message: "Leaderboard API is running" });
});

// SCRUM-13: Authentication endpoints.
app.use("/api/auth", authRoutes);
// SCRUM-21: Implement leaderboard ranking API.
app.use("/api/leaderboards", leaderboardRoutes);

// Centralized error handler.
app.use((err, req, res, next) => {
    console.error("Application error:", err);

    res.status(500).json({
        message: "Internal server error"
    });
});

module.exports = app;
