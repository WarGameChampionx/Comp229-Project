// Clears only GameZone's four application collections.
// DANGER: Deletes ALL users, games, challenges, and scores in the target database.
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const connectDatabase = require("../config/database");
const User = require("../models/User");
const Game = require("../models/Game");
const Challenge = require("../models/Challenge");
const Score = require("../models/Score");

async function main() {
    if (process.env.CONFIRM_CLEAR !== "DELETE_GAMEZONE_DATA") {
        throw new Error("Refusing to delete data. Set CONFIRM_CLEAR=DELETE_GAMEZONE_DATA to proceed.");
    }

    await connectDatabase();

    const databaseName = mongoose.connection.name;
    if (databaseName !== "Leaderboard") {
        throw new Error(`Refusing to clear unexpected database: ${databaseName}`);
    }

    console.log(`Deleting GameZone records from database: ${databaseName}`);
    for (const model of [Score, Challenge, Game, User]) {
        const result = await model.deleteMany({});
        console.log(`${model.modelName}: deleted ${result.deletedCount}`);
    }
    console.log("GameZone collections cleared. Collections and indexes remain intact.");
}

main()
    .catch(error => { console.error(error); process.exitCode = 1; })
    .finally(async () => { await mongoose.disconnect(); });
