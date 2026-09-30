"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupSweepService = void 0;
const dynamoService_1 = require("./dynamoService");
const s3Service_1 = require("./s3Service");
const quotaService_1 = require("./quotaService");
const logger_1 = require("../utils/logger");
exports.cleanupSweepService = {
    async sweepExpiredUploads() {
        logger_1.logger.info('Starting background cleanup sweep for expired upload sessions...');
        try {
            const expiredSessions = await dynamoService_1.dynamoService.findExpiredUploadSessions();
            if (expiredSessions.length === 0) {
                logger_1.logger.info('Cleanup sweep complete: No expired upload sessions found.');
                return 0;
            }
            logger_1.logger.info(`Found ${expiredSessions.length} expired upload sessions to clean up.`);
            let cleanedCount = 0;
            for (const session of expiredSessions) {
                try {
                    const file = await dynamoService_1.dynamoService.getFile(session.fileId);
                    if (file) {
                        // Abort S3 Multipart Upload
                        await s3Service_1.s3Service.abortMultipartUpload(file.s3Key, session.uploadId);
                        // Release reserved quota
                        await quotaService_1.quotaService.releaseQuota(session.ownerId, file.sizeBytes);
                        // Mark file as deleted
                        await dynamoService_1.dynamoService.updateFileStatus(file.fileId, 'deleted');
                    }
                    // Mark session as aborted
                    await dynamoService_1.dynamoService.updateSessionStatus(session.uploadId, 'aborted');
                    cleanedCount++;
                    logger_1.logger.info('Aborted expired upload session successfully', {
                        uploadId: session.uploadId,
                        fileId: session.fileId
                    });
                }
                catch (err) {
                    logger_1.logger.error('Failed to clean up expired session', {
                        uploadId: session.uploadId,
                        error: err.message
                    });
                }
            }
            logger_1.logger.info(`Cleanup sweep complete: ${cleanedCount} orphaned sessions aborted and cleaned up.`);
            return cleanedCount;
        }
        catch (err) {
            logger_1.logger.error('Error executing cleanup sweep', { error: err.message });
            return 0;
        }
    }
};
//# sourceMappingURL=cleanupSweepService.js.map
