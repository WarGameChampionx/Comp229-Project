
const mongoose = require("mongoose");
const Game = require("../models/Game");
const Challenge = require("../models/Challenge");

// GET /api/games
// Public: retrieve all games.
async function getAllGames(req, res, next) {
    try {
        const games = await Game.find()
            .sort({ name: 1 })
            .populate("createdBy", "username")
            .lean();

        return res.status(200).json({ games });
    } catch (error) {
        next(error);
    }
}

// GET /api/games/:id
// Public: retrieve a game and its challenges.
async function getGameById(req, res, next) {
    try {
        const { id } = req.params;

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: "Invalid game ID"
            });
        }

        const game = await Game.findById(id)
            .populate("createdBy", "username")
            .lean();

        if (!game) {
            return res.status(404).json({
                message: "Game not found"
            });
        }

        const challenges = await Challenge.find({ gameId: id })
            .sort({ name: 1 })
            .lean();

        return res.status(200).json({ game, challenges });
    } catch (error) {
        next(error);
    }
}

// POST /api/games
// Admin: create a new game.
async function createGame(req, res, next) {
    try {
        const { name, description = "" } = req.body || {};

        if (
            typeof name !== "string" ||
            !name.trim() ||
            name.trim().length > 100 ||
            typeof description !== "string" ||
            description.length > 2000
        ) {
            return res.status(400).json({
                message: "Invalid game name or description"
            });
        }

        // createdBy is taken from the authenticated user.
        const game = await Game.create({
            name: name.trim(),
            description: description.trim(),
            createdBy: req.user._id
        });

        return res.status(201).json({
            message: "Game created successfully",
            game
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A game with this name already exists"
            });
        }

        next(error);
    }
}

// PUT /api/games/:id
// Admin: update a game's name or description.
async function updateGame(req, res, next) {
    try {
        const { id } = req.params;

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: "Invalid game ID"
            });
        }

        const { name, description } = req.body || {};
        const updates = {};

        if (name !== undefined) {
            if (
                typeof name !== "string" ||
                !name.trim() ||
                name.trim().length > 100
            ) {
                return res.status(400).json({
                    message: "Invalid game name"
                });
            }

            updates.name = name.trim();
        }

        if (description !== undefined) {
            if (
                typeof description !== "string" ||
                description.length > 2000
            ) {
                return res.status(400).json({
                    message: "Invalid game description"
                });
            }

            updates.description = description.trim();
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid update fields provided"
            });
        }

        const game = await Game.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!game) {
            return res.status(404).json({
                message: "Game not found"
            });
        }

        return res.status(200).json({
            message: "Game updated successfully",
            game
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A game with this name already exists"
            });
        }

        next(error);
    }
}

// DELETE /api/games/:id
// Admin: delete a game only when it has no challenges.
async function deleteGame(req, res, next) {
    try {
        const { id } = req.params;

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: "Invalid game ID"
            });
        }

        const game = await Game.findById(id);

        if (!game) {
            return res.status(404).json({
                message: "Game not found"
            });
        }

        // Prevent deleting a game that contains challenges.
        const hasChallenges = await Challenge.exists({ gameId: id });

        if (hasChallenges) {
            return res.status(409).json({
                message: "Cannot delete a game with existing challenges"
            });
        }

        await Game.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Game deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame
};
