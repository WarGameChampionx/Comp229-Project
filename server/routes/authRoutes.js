
const express = require("express");

const { register, login } = require("../controllers/authController");

const router = express.Router();

// Register a new player.
router.post("/register", register);

// Authenticate an existing player.
router.post("/login", login);

module.exports = router;
