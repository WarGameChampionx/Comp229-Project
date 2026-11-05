require("dotenv").config();

const mongoose = require("mongoose");
const connectDatabase = require("../config/database");

const Game = require("../models/Game");
const User = require("../models/User");

async function testDatabase() {
    await connectDatabase();

    const user = await User.create({
        username: "testuser",
        email: "test@example.com",
        passwordHash: "TEMPORARY_TEST_VALUE"
    });

    try {
        const game = await Game.create({
            name: "Database Test Game",
            description: "Temporary test",
            createdBy: user._id
        });

        const result = await Game.findById(game._id);

        console.log("Saved game:", result.name);

        await Game.deleteOne({ _id: game._id });
    }
    finally {
        await User.deleteOne({ _id: user._id });
    }
}

testDatabase()
    .catch(console.error)
    .finally(() => mongoose.disconnect());