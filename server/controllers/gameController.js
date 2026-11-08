
const Game = require("../models/Game");

// 1. Get all games
exports.getGames = async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Get one game
exports.getGame = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                message: "Game not found"
            });
        }

        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Create a game
exports.createGame = async (req, res) => {
    try {
        const game = new Game({
            name: req.body.name,
            description: req.body.description,
            createdBy: req.user._id
        });

        await game.save();

        res.status(201).json(game);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 4. Update a game
exports.updateGame = async (req, res) => {
    try {
        const game = await Game.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!game) {
            return res.status(404).json({
                message: "Game not found"
            });
        }

        res.json(game);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 5. Delete a game
exports.deleteGame = async (req, res) => {
    try {
        const game = await Game.findByIdAndDelete(req.params.id);

        if (!game) {
            return res.status(404).json({
                message: "Game not found"
            });
        }

        res.json({
            message: "Game deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
