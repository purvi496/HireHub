
const { sessions } = require("../routes/authRoutes");
const users = require("../data/users");

const extractSessionId = (req) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
        return null;
    }

    const trimmedHeader = String(authHeader).trim();

    if (!trimmedHeader) {
        return null;
    }

    const bearerPrefix = /^Bearer\s+/i;

    return bearerPrefix.test(trimmedHeader)
        ? trimmedHeader.replace(bearerPrefix, "").trim()
        : trimmedHeader;
};

// Verify whether user is logged in
const authenticate = (req, res, next) => {
    const sessionId = extractSessionId(req);

    if (!sessionId || !sessions.has(sessionId)) {
        return res.status(401).json({
            message: "Please login first"
        });
    }

    const userId = sessions.get(sessionId);

    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(401).json({
            message: "Invalid user session"
        });
    }

    req.user = user;

    next();
};

// Check user role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You are not authorized to perform this action"
            });
        }

        next();
    };
};

module.exports = { authenticate, authorize };
