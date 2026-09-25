"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const dynamoService_1 = require("./services/dynamoService");
const cleanupSweepService_1 = require("./services/cleanupSweepService");
const logger_1 = require("./utils/logger");
async function bootstrap() {
    await dynamoService_1.dynamoService.initializeTables();
    const server = app_1.default.listen(env_1.config.port, () => {
        logger_1.logger.info(`Resilient File Storage Server listening on port ${env_1.config.port}`, {
            env: env_1.config.nodeEnv,
            instanceId: process.env.INSTANCE_ID || 'app-instance-local',
            useMockAws: env_1.config.useMockAws
        });
    });
    // Start background cleanup sweep interval
    const sweepInterval = setInterval(async () => {
        try {
            await cleanupSweepService_1.cleanupSweepService.sweepExpiredUploads();
        }
        catch (err) {
            logger_1.logger.error('Error during scheduled background cleanup sweep', { error: err.message });
        }
    }, env_1.config.cleanupSweepIntervalMs);
    const shutdown = () => {
        logger_1.logger.info('Shutting down server gracefully...');
        clearInterval(sweepInterval);
        server.close(() => {
            logger_1.logger.info('HTTP server closed.');
            process.exit(0);
        });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}
bootstrap().catch(err => {
    logger_1.logger.error('Failed to bootstrap server', { error: err.message, stack: err.stack });
    process.exit(1);
});
//# sourceMappingURL=server.js.map
