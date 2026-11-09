
const express = require("express");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const {
  getMyProfile,
  getAllUsers,
  updateUser,
  deleteUser
} = require("../controllers/userController");

const router = express.Router();

// Every user account endpoint requires authentication.
router.use(authenticate);

// Get the authenticated user's own profile.
router.get("/me", getMyProfile);

// List all users - administrator only.
router.get("/", authorize("admin"), getAllUsers);

// Update a user - self or administrator.
router.patch("/:id", updateUser);

// Delete a user - self or administrator.
router.delete("/:id", deleteUser);

module.exports = router;
