const mongoose = require("mongoose");

async function connectDatabase() {
    try {
        const uri = process.env.MONGODB_URI;
        const parsedUri = new URL(uri);

        console.log("Configured cluster:", parsedUri.hostname);

        await mongoose.connect(uri, {
            dbName: "Leaderboard"
        });

        console.log("MongoDB connected successfully");
        console.log("Database:      ", mongoose.connection.name);
        console.log("Connected Host:", mongoose.connection.host);
    }
    catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

module.exports = connectDatabase;