
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate a signed JWT for an authenticated user.
function generateToken(user) {
    return jwt.sign(
        { sub: user._id.toString() },
        process.env.JWT_SECRET,
        {
            algorithm: "HS256",
            expiresIn: process.env.JWT_EXPIRES_IN || "1h"
        }
    );
}

// POST /api/auth/register
async function register(req, res, next) {
    try {
        const { username, email, password } = req.body || {};

        // Validate the incoming request.
        if (
            typeof username !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Username, email and password are required"
            });
        }

        const cleanUsername = username.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanUsername || !cleanEmail || !password) {
            return res.status(400).json({
                message: "Username, email and password are required"
            });
        }

        // Apply basic validation before accessing the database.
        if (
            cleanUsername.length < 3 ||
            cleanUsername.length > 30 ||
            cleanEmail.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
            password.length < 12 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                message: "Invalid username, email or password format"
            });
        }

        // Check for an existing account.
        const existingUser = await User.findOne({
            $or: [
                { username: cleanUsername },
                { email: cleanEmail }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username or email is already registered"
            });
        }

        // Hash the password; never store it in plaintext.
        const passwordHash = await bcrypt.hash(password, 12);

        // Do not accept a role from the registration request.
        const user = await User.create({
            username: cleanUsername,
            email: cleanEmail,
            passwordHash
        });

        // Exclude the password hash from the response.
        return res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        // Handle MongoDB unique-index conflicts, including race conditions.
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Username or email is already registered"
            });
        }

        next(error);
    }
}

// POST /api/auth/login
async function login(req, res, next) {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // passwordHash has select:false in the User model.
        // Explicitly retrieve it for password verification.
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+passwordHash");

        // Return a generic message for incorrect credentials.
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate a JWT after successful authentication.
        const token = generateToken(user);

        return res.status(200).json({
            message: "Login successful",
            token,
            tokenType: "Bearer",
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                ...(user.role ? { role: user.role } : {})
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { register, login };
