require("dotenv").config();

const mongoose        = require("mongoose");
const connectDatabase = require("../config/database");

const User      = require("../models/User");
const Game      = require("../models/Game");
const Challenge = require("../models/Challenge");
const Score     = require("../models/Score");

async function initializeDatabase() {
    await connectDatabase();

    const models = [User, Game, Challenge, Score];

    for (const model of models) {
        await model.createCollection();
        await model.init();
        console.log(`${model.modelName} initialized`);
    }

    console.log("Database initialization complete.");
}

initializeDatabase()
    .catch(console.error)
    .finally(() => mongoose.disconnect());