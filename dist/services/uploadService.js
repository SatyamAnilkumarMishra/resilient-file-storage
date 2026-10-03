"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadService = void 0;
const dynamoService_1 = require("./dynamoService");
const s3Service_1 = require("./s3Service");
const dedupService_1 = require("./dedupService");
const quotaService_1 = require("./quotaService");
const env_1 = require("../config/env");
const uuid_1 = require("uuid");
const logger_1 = require("../utils/logger");
exports.uploadService = {
    async initiateUploadSession(ownerId, fileName, sizeBytes, fileHash, contentType = 'application/octet-stream', customChunkSize) {
        if (!fileName || !sizeBytes || sizeBytes <= 0 || !fileHash) {
            throw new Error('Invalid upload session parameters: fileName, sizeBytes (>0), and fileHash are required.');
        }
        // 1. Check Deduplication
        const dedupResult = await dedupService_1.dedupService.checkForDuplicate(ownerId, fileHash, fileName);
        if (dedupResult.isDuplicate && dedupResult.file) {
            return {
                deduplicated: true,
                file: dedupResult.file,
                message: 'File deduplicated successfully. No chunk upload required.'
            };
        }
        // 2. Atomic Quota Reservation
        await quotaService_1.quotaService.checkAndReserveQuota(ownerId, sizeBytes);
        // 3. Determine Chunk Size & Chunks Count
        const minChunkSize = 5 * 1024 * 1024; // 5MB S3 standard minimum
        const chunkSize = customChunkSize && customChunkSize >= 1024 * 1024
            ? customChunkSize
            : (sizeBytes < minChunkSize ? sizeBytes : Math.max(minChunkSize, env_1.config.defaultChunkSizeBytes));
        const totalChunks = Math.ceil(sizeBytes / chunkSize);
        const fileId = (0, uuid_1.v4)();
        const s3Key = `uploads/${ownerId}/${fileId}/${fileName}`;
        // 4. Create S3 Multipart Upload Session
        const uploadId = await s3Service_1.s3Service.createMultipartUpload(s3Key, contentType);
        const now = new Date().toISOString();
        const expiresAt = Math.floor(Date.now() / 1000) + env_1.config.uploadExpirationHours * 3600;
        // 5. Create File Record in DynamoDB
        const fileRecord = {
            fileId,
            ownerId,
            fileName,
            s3Key,
            fileHash,
            sizeBytes,
            contentType,
            status: 'uploading',
            createdAt: now,
            updatedAt: now
        };
        await dynamoService_1.dynamoService.createFile(fileRecord);
        // 6. Create Upload Session Record in DynamoDB
        const sessionRecord = {
            uploadId,
            fileId,
            ownerId,
            totalChunks,
            chunkSizeBytes: chunkSize,
            status: 'in_progress',
            createdAt: now,
            expiresAt
        };
        await dynamoService_1.dynamoService.createUploadSession(sessionRecord);
        // 7. Initialize Chunk Status Records in DynamoDB
        const chunkPromises = [];
        const presignedUrlPromises = [];
        for (let chunkNumber = 1; chunkNumber <= totalChunks; chunkNumber++) {
            const isLastChunk = chunkNumber === totalChunks;
            const expectedSize = isLastChunk
                ? sizeBytes - (totalChunks - 1) * chunkSize
                : chunkSize;
            const chunkRecord = {
                uploadId,
                chunkNumber,
                status: 'pending',
                sizeBytes: expectedSize,
                completedAt: null
            };
            chunkPromises.push(dynamoService_1.dynamoService.saveChunkRecord(chunkRecord));
            presignedUrlPromises.push(s3Service_1.s3Service.generatePresignedPartUrl(s3Key, uploadId, chunkNumber).then(url => ({
                chunkNumber,
                url
            })));
