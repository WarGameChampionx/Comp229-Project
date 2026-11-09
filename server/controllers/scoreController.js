
const mongoose = require("mongoose");
const Score = require("../models/Score");
const Challenge = require("../models/Challenge");
require("../models/Game"); // Register Game for nested populate

// POST /api/scores
async function submitScore(req, res, next) {
    try {
        const { challengeId, value } = req.body || {};

        // The player ID comes from the verified JWT, never the request body.
        const userId = req.user._id;

        // Require a valid MongoDB ObjectId.
        if (
            typeof challengeId !== "string" ||
            !mongoose.isObjectIdOrHexString(challengeId)
        ) {
            return res.status(400).json({
                message: "Invalid challenge ID"
            });
        }

        // Scores must be nonnegative, finite numbers.
        if (
            typeof value !== "number" ||
            !Number.isFinite(value) ||
            value < 0
        ) {
            return res.status(400).json({
                message: "Score must be a nonnegative number"
            });
        }

        // Confirm that the challenge exists.
        const challenge = await Challenge.findById(challengeId);

        if (!challenge) {
            return res.status(404).json({
                message: "Challenge not found"
            });
        }

        const filter = {
            userId,
            challengeId: challenge._id
        };

        // Atomic update:
        // - $setOnInsert creates ownership fields for a new score.
        // - $max keeps the highest score on later submissions.
        const result = await Score.findOneAndUpdate(
            filter,
            {
                $setOnInsert: filter,
                $max: { value }
            },
            {
                upsert: true,
                returnDocument: "after",
                runValidators: true,
                includeResultMetadata: true
            }
        );

        const score = result.value;
        const created = !result.lastErrorObject.updatedExisting;

        return res.status(created ? 201 : 200).json({
            message: created
                ? "Score submitted successfully"
                : "Personal best checked",
            personalBest: {
                id: score._id,
                challengeId: score.challengeId,
                value: score.value
            }
        });
    } catch (error) {
        // A simultaneous upsert may encounter the compound unique index.
        // The client may safely retry after this specific race.
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Concurrent score submission; please retry"
            });
        }

        next(error);
    }
}

// GET /api/scores/me
async function getMyScores(req, res, next) {
    try {
        const scores = await Score.find({
            userId: req.user._id
        })
            .sort({ updatedAt: -1 })
            .populate({
                path: "challengeId",
                select: "name gameId",
                populate: {
                    path: "gameId",
                    select: "name"
                }
            })
            .lean();

        return res.status(200).json({
            scores
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/scores/:id
async function getScoreById(req, res, next) {
    try {
        const { id } = req.params;

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: "Invalid score ID"
            });
        }

        // Filter by owner so one player cannot read another's private record.
        const score = await Score.findOne({
            _id: id,
            userId: req.user._id
        }).lean();

        if (!score) {
            return res.status(404).json({
                message: "Score not found"
            });
        }

        return res.status(200).json({ score });
    } catch (error) {
        next(error);
    }
}

// DELETE /api/scores/:id
async function deleteScore(req, res, next) {
    try {
        const { id } = req.params;

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: "Invalid score ID"
            });
        }

        // Deletion requires ownership.
        const score = await Score.findOneAndDelete({
            _id: id,
            userId: req.user._id
        });

        if (!score) {
            return res.status(404).json({
                message: "Score not found"
            });
        }

        return res.status(200).json({
            message: "Score deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    submitScore,
    getMyScores,
    getScoreById,
    deleteScore
};
