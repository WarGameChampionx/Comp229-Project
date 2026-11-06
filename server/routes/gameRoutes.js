
const express = require("express");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const {
    getAllGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame
} = require("../controllers/gameController");

const router = express.Router();

// Public endpoints.
router.get("/", getAllGames);
router.get("/:id", getGameById);

// Administrator-only endpoints.
router.post("/", authenticate, authorize("admin"), createGame);
router.put("/:id", authenticate, authorize("admin"), updateGame);
router.delete("/:id", authenticate, authorize("admin"), deleteGame);

module.exports = router;
