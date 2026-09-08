"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileController = void 0;
const dynamoService_1 = require("../services/dynamoService");
const s3Service_1 = require("../services/s3Service");
const quotaService_1 = require("../services/quotaService");
const env_1 = require("../config/env");
exports.fileController = {
    async listFiles(req, res, next) {
        try {
            const ownerId = req.user.userId;
            const files = await dynamoService_1.dynamoService.listFilesByOwner(ownerId);
            res.status(200).json({ files });
        }
        catch (err) {
            next(err);
        }
    },
    async getFileDetails(req, res, next) {
        try {
            const ownerId = req.user.userId;
            const { fileId } = req.params;
            const file = await dynamoService_1.dynamoService.getFile(fileId);
            if (!file || file.ownerId !== ownerId) {
                return res.status(404).json({ error: 'NotFound', message: `File ${fileId} not found.` });
            }
            const downloadUrl = await s3Service_1.s3Service.generatePresignedDownloadUrl(file.s3Key);
            res.status(200).json({
                file,
                downloadUrl
            });
        }
        catch (err) {
            next(err);
        }
    },
    async deleteFile(req, res, next) {
        try {
            const ownerId = req.user.userId;
            const { fileId } = req.params;
            const file = await dynamoService_1.dynamoService.getFile(fileId);
            if (!file || file.ownerId !== ownerId) {
                return res.status(404).json({ error: 'NotFound', message: `File ${fileId} not found.` });
            }
            await dynamoService_1.dynamoService.updateFileStatus(fileId, 'deleted');
            await quotaService_1.quotaService.releaseQuota(ownerId, file.sizeBytes);
            res.status(200).json({ message: `File ${fileId} marked as deleted and storage quota released.` });
        }
        catch (err) {
            next(err);
        }
    },
    async getQuota(req, res, next) {
        try {
            const ownerId = req.user.userId;
            const quota = await dynamoService_1.dynamoService.getUserQuota(ownerId);
            const used = quota ? quota.storageUsedBytes : 0;
            const max = quota ? quota.maxQuotaBytes : env_1.config.defaultUserQuotaBytes;
            const percent = Math.round((used / max) * 100);
            res.status(200).json({
                ownerId,
                storageUsedBytes: used,
                maxQuotaBytes: max,
                remainingBytes: Math.max(0, max - used),
                usedPercent: percent
            });
        }
        catch (err) {
            next(err);
        }
    },
    async downloadMockFile(req, res, next) {
        try {
            const key = req.query.key;
            const item = s3Service_1.inMemoryS3.getObject(key);
            if (!item) {
                return res.status(404).send('Mock file not found');
            }
            res.setHeader('Content-Type', item.contentType);
            res.send(item.buffer);
        }
        catch (err) {
            next(err);
        }
    }
};
//# sourceMappingURL=fileController.js.map
