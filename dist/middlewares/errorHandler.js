"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = require("../utils/logger");
function errorHandler(err, req, res, next) {
    logger_1.logger.error('Unhandled API Error', {
        path: req.path,
        method: req.method,
        message: err.message,
        stack: err.stack
    });
    const statusCode = err.statusCode || (err.message && err.message.includes('not found') ? 404 : 400);
    res.status(statusCode).json({
        error: err.name || 'ApplicationError',
        message: err.message || 'An unexpected error occurred.',
        path: req.path
    });
}
//# sourceMappingURL=errorHandler.js.map
