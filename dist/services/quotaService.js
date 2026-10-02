"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quotaService = void 0;
const dynamoService_1 = require("./dynamoService");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.quotaService = {
    async checkAndReserveQuota(ownerId, fileSize) {
        const quota = await dynamoService_1.dynamoService.getUserQuota(ownerId);
        const currentUsed = quota ? quota.storageUsedBytes : 0;
        const maxQuota = quota ? quota.maxQuotaBytes : env_1.config.defaultUserQuotaBytes;
        if (currentUsed + fileSize > maxQuota) {
            logger_1.logger.warn('Storage quota limit exceeded', { ownerId, currentUsed, fileSize, maxQuota });
            throw new Error(`Storage quota exceeded. Used: ${currentUsed} bytes, Attempting to upload: ${fileSize} bytes, Max Quota: ${maxQuota} bytes.`);
        }
        // Atomically increment quota
        await dynamoService_1.dynamoService.addUsedQuota(ownerId, fileSize);
        logger_1.logger.info('Quota reserved successfully', { ownerId, deltaBytes: fileSize });
    },
    async confirmQuota(ownerId, fileSize) {
        // Quota was already reserved during init session, no net change needed
        logger_1.logger.info('Quota confirmed for completed upload', { ownerId, fileSize });
    },
    async releaseQuota(ownerId, fileSize) {
        // Release quota when upload is aborted or expired
        await dynamoService_1.dynamoService.addUsedQuota(ownerId, -Math.abs(fileSize));
        logger_1.logger.info('Quota released for aborted/expired upload', { ownerId, releasedBytes: fileSize });
    }
};
//# sourceMappingURL=quotaService.js.map
