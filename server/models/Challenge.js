const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

// A game cannot have two challenges with the same name
challengeSchema.index(
    { gameId: 1, name: 1 },
    { unique: true }
);

module.exports = mongoose.model("Challenge", challengeSchema);