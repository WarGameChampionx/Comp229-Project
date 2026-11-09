
const express = require("express");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const {
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge
} = require("../controllers/challengeController");

const router = express.Router();

// Public: retrieve challenges for a selected game.
router.get("/", getChallenges);

// Administrator-only CRUD operations.
router.post(
  "/",
  authenticate,
  authorize("admin"),
  createChallenge
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  updateChallenge
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteChallenge
);

module.exports = router;
