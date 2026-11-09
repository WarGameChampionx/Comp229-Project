
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const userRoutes = require("./routes/userRoutes");
const challengeRoutes = require("./routes/challengeRoutes");

const app = express();

// Configure Cross-Origin Resource Sharing.
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Parse incoming JSON request bodies.
app.use(express.json({ limit: "16kb" }));

// Health check endpoint.
app.get("/api/health", (req, res) => {
  res.json({ message: "Leaderboard API is running" });
});

// SCRUM-13: Authentication API.
app.use("/api/auth", authRoutes);

// SCRUM-16: Game CRUD API.
app.use("/api/games", gameRoutes);

// SCRUM-19: Score CRUD API.
app.use("/api/scores", scoreRoutes);
app.use("/api/challenges", challengeRoutes);
// SCRUM-21: Leaderboard ranking API.
app.use("/api/leaderboards", leaderboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users", userRoutes);

// Centralized error handler.
app.use((err, req, res, next) => {
  console.error("Application error:", err);

  res.status(500).json({
    message: "Internal server error"
  });
});

module.exports = app;
