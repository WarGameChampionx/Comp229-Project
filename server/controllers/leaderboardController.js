const mongoose = require("mongoose");
const Challenge = require("../models/Challenge");
const Score = require("../models/Score");

// GET /api/leaderboards/:challengeId
async function getLeaderboard(req, res, next) {
    try {
        const { challengeId } = req.params;

        // Validate the challenge ID.
        if (!mongoose.isObjectIdOrHexString(challengeId)) {
            return res.status(400).json({
                message: "Invalid challenge ID"
            });
        }

        // Verify that the challenge exists.
        const challenge = await Challenge.findById(challengeId);

        if (!challenge) {
            return res.status(404).json({
                message: "Challenge not found"
            });
        }

        // Retrieve the top 100 scores, highest first.
        const scores = await Score.find({ challengeId })
            .sort({ value: -1, _id: 1 })
            .limit(100)
            .populate("userId", "username")
            .lean();

        // Convert the results into leaderboard entries.
        const leaderboard = scores
            .filter(score => score.userId)
            .map((score, index) => ({
                rank: index + 1,
                username: score.userId.username,
                score: score.value
            }));

        return res.status(200).json({
            challengeId,
            challengeName: challenge.name,
            leaderboard
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { getLeaderboard };