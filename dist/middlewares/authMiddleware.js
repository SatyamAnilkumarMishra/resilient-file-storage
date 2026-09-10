"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const authService_1 = require("../services/authService");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing or malformed Authorization header. Expected Bearer token.'
        });
    }
    const token = authHeader.substring(7);
    try {
        const payload = authService_1.authService.verifyToken(token);
        req.user = payload;
        next();
    }
    catch (err) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired access token.',
            details: err.message
        });
    }
}
//# sourceMappingURL=authMiddleware.js.map
