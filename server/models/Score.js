const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    challengeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge",
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

// One personal best per user per challenge
scoreSchema.index(
    { userId: 1, challengeId: 1 },
    { unique: true }
);

// Helps retrieve leaderboard rankings.
scoreSchema.index({ challengeId: 1, value: -1 });

module.exports = mongoose.model("Score", scoreSchema);