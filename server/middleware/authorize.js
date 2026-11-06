function authorize(...allowedRoles) {
    return (req, res, next) => {
        // Authentication middleware must run first.
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // Check the authenticated user's role.
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        next();
    };
}

module.exports = authorize;