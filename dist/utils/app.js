"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
const rateLimiterMiddleware_1 = require("./middlewares/rateLimiterMiddleware");
const errorHandler_1 = require("./middlewares/errorHandler");
const cleanupSweepService_1 = require("./services/cleanupSweepService");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(rateLimiterMiddleware_1.rateLimiterMiddleware);
// Health check endpoint (returns instance identifier for load balance verification)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        instanceId: process.env.INSTANCE_ID || 'app-instance-local',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime())
    });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/uploads', uploadRoutes_1.default);
app.use('/api/files', fileRoutes_1.default);
// Admin / Background Cleanup Sweep trigger endpoint
app.post('/api/admin/sweep-cleanup', async (req, res, next) => {
    try {
        const count = await cleanupSweepService_1.cleanupSweepService.sweepExpiredUploads();
        res.status(200).json({ message: 'Cleanup sweep completed', abortedSessionsCount: count });
    }
    catch (err) {
        next(err);
    }
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map
