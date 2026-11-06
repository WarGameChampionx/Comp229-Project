
const express = require("express");

const authenticate = require("../middleware/authenticate");

const {
    submitScore,
    getMyScores,
    getScoreById,
    deleteScore
} = require("../controllers/scoreController");

const router = express.Router();

// Require a valid JWT for every score route.
router.use(authenticate);

// Create a score or update a personal best.
router.post("/", submitScore);

// Retrieve the authenticated player's scores.
// Keep this route before "/:id".
router.get("/me", getMyScores);

// Retrieve one score owned by the authenticated player.
router.get("/:id", getScoreById);

// Delete one score owned by the authenticated player.
router.delete("/:id", deleteScore);

module.exports = router;
