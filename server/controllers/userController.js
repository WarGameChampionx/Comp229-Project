
const mongoose = require("mongoose");
const User = require("../models/User");
const Score = require("../models/Score");

// Obtain the authenticated user ID.
// Match this helper to the value set by authenticate.js.
function currentUserId(req) {
  return req.user?.id ?? req.user?.sub ?? req.userId;
}

// Remove sensitive fields from user API responses.
function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

// GET /api/users/me
async function getMyProfile(req, res, next) {
  try {
    const user = await User.findById(currentUserId(req));

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/users - Administrator only
async function getAllUsers(req, res, next) {
  try {
    const users = await User.find().sort({
      createdAt: -1
    });

    return res.status(200).json({
      users: users.map(publicUser)
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/users/:id
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const authenticatedId = currentUserId(req);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID"
      });
    }

    if (
      String(authenticatedId) !== id &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Whitelist fields that can be changed.
    const allowedFields = ["username", "email"];
    const submittedFields = Object.keys(req.body);

    if (
      submittedFields.length === 0 ||
      submittedFields.some(
        (field) => !allowedFields.includes(field)
      )
    ) {
      return res.status(400).json({
        message: "Only username and email can be updated"
      });
    }

    const updates = {};

    for (const field of submittedFields) {
      if (
        typeof req.body[field] !== "string" ||
        !req.body[field].trim()
      ) {
        return res.status(400).json({
          message: `${field} must be a non-empty string`
        });
      }

      updates[field] = req.body[field].trim();
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: publicUser(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username or email already exists"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid user data"
      });
    }

    next(error);
  }
}


/**
 * DELETE /api/users/:id
 *
 * Business rules:
 * - Users may delete their own accounts.
 * - Administrators may delete user accounts.
 * - Users with existing Score documents cannot be deleted.
 */
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const authenticatedId = currentUserId(req);

    // Validate MongoDB ObjectId.
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID"
      });
    }

    // Only the account owner or an administrator can delete.
    if (
      authenticatedId !== id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Verify that the user exists.
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Prevent deletion when the user has any scores.
    const hasScores = await Score.exists({
      userId: user._id
    });

    if (hasScores) {
      return res.status(409).json({
        message:
          "Cannot delete user because the account has existing scores."
      });
    }

    // Delete the user if no scores exist.
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: "User deleted successfully"
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyProfile,
  getAllUsers,
  updateUser,
  deleteUser
};
