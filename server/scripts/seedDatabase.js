// Adds fictional, repeatable demo data to an EMPTY GameZone database.
// Run clearDatabase.js first if replacing existing records.
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const connectDatabase = require("../config/database");
const User = require("../models/User");
const Game = require("../models/Game");
const Challenge = require("../models/Challenge");
const Score = require("../models/Score");

const gameDefinitions = [
    { name: "Space Invaders", description: "Defend Earth against waves of alien invaders.", challenges: [
        ["Classic", 18000], ["Survival", 36000], ["Boss Rush", 24000]
    ] },
    { name: "Pac-Man", description: "Navigate mazes, collect pellets, and avoid ghosts.", challenges: [
        ["Classic Maze", 24000], ["Ghost Chase", 31000], ["Endless", 46000]
    ] },
    { name: "Tetris", description: "Stack blocks, clear lines, and chase a new high score.", challenges: [
        ["Marathon", 110000], ["Ultra", 55000]
    ] },
    { name: "Donkey Kong", description: "Climb platforms and dodge obstacles.", challenges: [
        ["Stage 1", 15000], ["Stage 2", 22000]
    ] },
    { name: "Asteroids", description: "Pilot a spacecraft through dangerous asteroid fields.", challenges: [
        ["Arcade", 28000], ["Survival", 41000]
    ] }
];

const usernames = [
    "pixelpilot", "arcadeace", "neonrunner", "retroqueen",
    "blockmaster", "starblazer", "ghosthunter", "highscorehero"
];

async function main() {
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!adminPassword || adminPassword.length < 12) {
        throw new Error("Set SEED_ADMIN_PASSWORD to a password of at least 12 characters before seeding.");
    }

    await connectDatabase();

    const databaseName = mongoose.connection.name;
    if (databaseName !== "Leaderboard") {
        throw new Error(`Refusing to seed unexpected database: ${databaseName}`);
    }

    // Refuse partial population so reruns never create duplicate demo records.
    const counts = await Promise.all([User, Game, Challenge, Score].map(model => model.countDocuments()));
    if (counts.some(count => count !== 0)) {
        throw new Error(`Database is not empty (users/games/challenges/scores: ${counts.join("/")}). Clear it first if replacement is intended.`);
    }

    const admin = await User.create({
        username: "gamezoneadmin",
        email: "gamezoneadmin@example.com",
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: "admin"
    });

    // Random passwords make these fictional scoreboard accounts non-loginable by guesswork.
    const playerData = await Promise.all(usernames.map(async username => ({
        username,
        email: `${username}@example.com`,
        passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10),
        role: "user"
    })));
    const players = await User.insertMany(playerData);

    let challengeCount = 0;
    let scoreCount = 0;

    for (let gameIndex = 0; gameIndex < gameDefinitions.length; gameIndex++) {
        const definition = gameDefinitions[gameIndex];
        const game = await Game.create({
            name: definition.name,
            description: definition.description,
            createdBy: admin._id
        });

        for (let challengeIndex = 0; challengeIndex < definition.challenges.length; challengeIndex++) {
            const [name, baseScore] = definition.challenges[challengeIndex];
            const challenge = await Challenge.create({ gameId: game._id, name });
            challengeCount++;

            // Every player gets one distinct personal-best score per challenge.
            const scoreData = players.map((player, playerIndex) => {
                const skill = (playerIndex * 37 + gameIndex * 19 + challengeIndex * 23) % 85;
                return {
                    userId: player._id,
                    challengeId: challenge._id,
                    value: Math.round((baseScore * (0.55 + skill / 100)) / 50) * 50
                };
            });
            await Score.insertMany(scoreData);
            scoreCount += scoreData.length;
        }
    }

    console.log(`Seed complete in database ${databaseName}:`);
    console.log(`  Users: ${players.length + 1} (8 players + 1 admin)`);
    console.log(`  Games: ${gameDefinitions.length}`);
    console.log(`  Challenges: ${challengeCount}`);
    console.log(`  Scores: ${scoreCount}`);
    console.log("  Admin login: gamezoneadmin@example.com");
    console.log("  Admin password: the value you supplied in SEED_ADMIN_PASSWORD");
}

main()
    .catch(error => { console.error(error); process.exitCode = 1; })
    .finally(async () => { await mongoose.disconnect(); });
