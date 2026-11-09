
const express = require("express");
const mongoose = require("mongoose");
const Challenge = require("../models/Challenge");

const router = express.Router();

// GET /api/challenges?gameId=...
// Public endpoint: retrieve challenges belonging to a game.
router.get("/", async (req, res, next) => {
  try {
    const { gameId } = req.query;

    if (!mongoose.isValidObjectId(gameId)) {
      return res.status(400).json({
        message: "A valid gameId is required"
      });
    }

    const challenges = await Challenge.find({ gameId })
      .select("_id gameId name")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({ challenges });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
