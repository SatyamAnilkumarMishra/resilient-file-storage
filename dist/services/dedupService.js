"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dedupService = void 0;
const dynamoService_1 = require("./dynamoService");
const uuid_1 = require("uuid");
const logger_1 = require("../utils/logger");
exports.dedupService = {
    async checkForDuplicate(ownerId, fileHash, fileName) {
        const existingFile = await dynamoService_1.dynamoService.findCompletedFileByHash(ownerId, fileHash);
        if (existingFile) {
            logger_1.logger.info('File deduplication hit', { ownerId, fileHash, existingFileId: existingFile.fileId });
            const newFileId = (0, uuid_1.v4)();
            const now = new Date().toISOString();
            // Create a reference file record pointing to the exact same s3Key
            const dedupFile = {
                fileId: newFileId,
                ownerId,
                fileName: fileName || existingFile.fileName,
                s3Key: existingFile.s3Key,
                fileHash: existingFile.fileHash,
                sizeBytes: existingFile.sizeBytes,
                contentType: existingFile.contentType,
                status: 'complete',
                createdAt: now,
                updatedAt: now
            };
            await dynamoService_1.dynamoService.createFile(dedupFile);
            return {
                isDuplicate: true,
                file: dedupFile
            };
        }
        return { isDuplicate: false };
    }
};
//# sourceMappingURL=dedupService.js.map
