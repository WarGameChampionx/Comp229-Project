
const mongoose = require("mongoose");

const Challenge = require("../models/Challenge");
const Game = require("../models/Game");
const Score = require("../models/Score");

// GET /api/challenges?gameId=...
// Public: list challenges belonging to an existing game.
async function getChallenges(req, res, next) {
  try {
    const { gameId } = req.query;

    if (!mongoose.isValidObjectId(gameId)) {
      return res.status(400).json({
        message: "A valid gameId is required"
      });
    }

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({
        message: "Game not found"
      });
    }

    const challenges = await Challenge.find({ gameId })
      .sort({ name: 1 });

    return res.status(200).json({ challenges });
  } catch (error) {
    next(error);
  }
}

// POST /api/challenges
// Administrator only: create a challenge.
async function createChallenge(req, res, next) {
  try {
    const { gameId, name } = req.body;

    // Validate the game ID.
    if (!mongoose.isValidObjectId(gameId)) {
      return res.status(400).json({
        message: "A valid gameId is required"
      });
    }

    // Validate the challenge name.
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Challenge name is required"
      });
    }

    // Verify the parent game exists.
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({
        message: "Game not found"
      });
    }

    // Create and save the challenge.
    const challenge = await Challenge.create({
      gameId,
      name: name.trim()
    });

    return res.status(201).json({
      message: "Challenge created successfully",
      challenge
    });
  } catch (error) {
    // Handle duplicate gameId/name index violations.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This game already has a challenge with that name"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid challenge data"
      });
    }

    next(error);
  }
}

// PATCH /api/challenges/:id
// Administrator only: rename an existing challenge.
async function updateChallenge(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid challenge ID"
      });
    }

    // Permit only changes to the challenge name.
    if (
      !req.body ||
      Object.keys(req.body).length !== 1 ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        message: "Only a non-empty challenge name can be updated"
      });
    }

    const challenge = await Challenge.findByIdAndUpdate(
      id,
      { $set: { name: name.trim() } },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found"
      });
    }

    return res.status(200).json({
      message: "Challenge updated successfully",
      challenge
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This game already has a challenge with that name"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid challenge data"
      });
    }

    next(error);
  }
}

// DELETE /api/challenges/:id
// Administrator only: delete if no scores reference it.
async function deleteChallenge(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid challenge ID"
      });
    }

    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found"
      });
    }

    // Preserve score history by blocking deletion.
    const hasScores = await Score.exists({
      challengeId: challenge._id
    });

    if (hasScores) {
      return res.status(409).json({
        message:
          "Cannot delete challenge because it has existing scores."
      });
    }

    await Challenge.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Challenge deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge
};
