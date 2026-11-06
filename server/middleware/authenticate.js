const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticate(req, res, next) {
    try {
        // Read the Authorization header.
        const authorization = req.headers.authorization;

        // Require a Bearer token.
        if (!authorization?.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const token = authorization.slice(7).trim();

        if (!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // Verify token signature and expiration.
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"]
        });

        // Check that the user still exists.
        const user = await User.findById(decoded.sub);

        if (!user) {
            return res.status(401).json({
                message: "Invalid authentication token"
            });
        }

        // Make the authenticated user available to other handlers.
        req.user = user;

        next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired authentication token"
            });
        }

        next(error);
    }
}

module.exports = authenticate;