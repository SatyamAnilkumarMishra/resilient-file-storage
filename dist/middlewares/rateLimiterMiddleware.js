"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiterMiddleware = rateLimiterMiddleware;
const logger_1 = require("../utils/logger");
const windowMs = 60 * 1000; // 1 minute window
const maxRequestsPerMinute = parseInt(process.env.RATE_LIMIT_MAX || '1000', 10); // 1000 requests per min default
const rateLimitMap = new Map();
function rateLimiterMiddleware(req, res, next) {
    const key = req.user ? `user:${req.user.userId}` : `ip:${req.ip}`;
    const now = Date.now();
    let bucket = rateLimitMap.get(key);
    if (!bucket) {
        bucket = { tokens: maxRequestsPerMinute, lastRefill: now };
        rateLimitMap.set(key, bucket);
    }
    // Refill tokens based on elapsed time
    const elapsed = now - bucket.lastRefill;
    if (elapsed > windowMs) {
        bucket.tokens = maxRequestsPerMinute;
        bucket.lastRefill = now;
    }
    if (bucket.tokens <= 0) {
        logger_1.logger.warn('Rate limit exceeded', { key, ip: req.ip });
        return res.status(429).json({
            error: 'Too Many Requests',
            message: `Rate limit of ${maxRequestsPerMinute} requests per minute exceeded. Please slow down.`
        });
    }
    bucket.tokens -= 1;
    res.setHeader('X-RateLimit-Limit', maxRequestsPerMinute);
    res.setHeader('X-RateLimit-Remaining', bucket.tokens);
    next();
}
//# sourceMappingURL=rateLimiterMiddleware.js.map
