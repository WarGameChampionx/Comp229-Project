
const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");

const {
    getGames,
    getGame,
    createGame,
    updateGame,
    deleteGame
} = require("../controllers/gameController");

// Get all games
router.get("/", getGames);

// Get one game
router.get("/:id", getGame);

// Create a game
router.post("/", authenticate, createGame);

// Update a game
router.put("/:id", authenticate, updateGame);

// Delete a game
router.delete("/:id", authenticate, deleteGame);

module.exports = router;
