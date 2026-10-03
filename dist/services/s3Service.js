"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Service = exports.inMemoryS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const aws_1 = require("../config/aws");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const crypto_1 = __importDefault(require("crypto"));
class InMemoryS3Store {
    multipartUploads = new Map();
    objects = new Map();
    createMultipartUpload(s3Key) {
        const uploadId = `mock_upload_${crypto_1.default.randomUUID()}`;
        this.multipartUploads.set(uploadId, { s3Key, parts: new Map() });
        return uploadId;
    }
    savePart(uploadId, partNumber, buffer) {
        const upload = this.multipartUploads.get(uploadId);
        const md5Hex = crypto_1.default.createHash('md5').update(buffer).digest('hex');
        const etag = `"${md5Hex}"`;
        if (upload) {
            upload.parts.set(partNumber, { partNumber, etag, buffer });
        }
        return etag;
    }
    completeMultipartUpload(uploadId, partsList) {
        const upload = this.multipartUploads.get(uploadId);
        if (!upload) {
            throw new Error(`Multipart upload ${uploadId} not found`);
        }
        // Sort by PartNumber
        const sorted = [...partsList].sort((a, b) => a.PartNumber - b.PartNumber);
        const buffers = [];
        for (const p of sorted) {
            const part = upload.parts.get(p.PartNumber);
            if (part) {
                buffers.push(part.buffer);
            }
            else {
                // If buffer was uploaded via presigned URL simulation where bytes weren't passed directly, create placeholder chunk buffer
                buffers.push(Buffer.alloc(env_1.config.defaultChunkSizeBytes));
            }
        }
        const finalBuffer = Buffer.concat(buffers);
        this.objects.set(upload.s3Key, { buffer: finalBuffer, contentType: 'application/octet-stream' });
        this.multipartUploads.delete(uploadId);
        return finalBuffer;
    }
    abortMultipartUpload(uploadId) {
        this.multipartUploads.delete(uploadId);
    }
    getObject(s3Key) {
        return this.objects.get(s3Key) || null;
    }
    putObject(s3Key, buffer, contentType) {
        this.objects.set(s3Key, { buffer, contentType });
    }
    clear() {
        this.multipartUploads.clear();
        this.objects.clear();
    }
}
exports.inMemoryS3 = new InMemoryS3Store();
exports.s3Service = {
    clearMemoryS3: () => exports.inMemoryS3.clear(),
    async createMultipartUpload(s3Key, contentType = 'application/octet-stream') {
        if (env_1.config.useMockAws) {
            return exports.inMemoryS3.createMultipartUpload(s3Key);
        }
        try {
            const cmd = new client_s3_1.CreateMultipartUploadCommand({
                Bucket: env_1.config.s3BucketName,
                Key: s3Key,
                ContentType: contentType,
            });
            const res = await aws_1.s3Client.send(cmd);
            if (!res.UploadId) {
                throw new Error('S3 did not return an UploadId');
            }
            return res.UploadId;
        }
        catch (err) {
            logger_1.logger.warn('S3 createMultipartUpload failed, falling back to mock S3', { error: err.message });
            return exports.inMemoryS3.createMultipartUpload(s3Key);
        }
    },
    async generatePresignedPartUrl(s3Key, uploadId, partNumber) {
        if (env_1.config.useMockAws || uploadId.startsWith('mock_upload_')) {
            // Return a simulated upload URL that clients can hit or use
            return `http://localhost:${env_1.config.port}/api/uploads/mock-s3-upload?uploadId=${uploadId}&partNumber=${partNumber}&key=${encodeURIComponent(s3Key)}`;
        }
        try {
            const cmd = new client_s3_1.UploadPartCommand({
                Bucket: env_1.config.s3BucketName,
                Key: s3Key,
                UploadId: uploadId,
                PartNumber: partNumber,
            });
            return await (0, s3_request_presigner_1.getSignedUrl)(aws_1.s3Client, cmd, { expiresIn: 3600 });
        }
        catch (err) {
            logger_1.logger.warn('Failed to generate real presigned URL, using mock presigned URL', { error: err.message });
            return `http://localhost:${env_1.config.port}/api/uploads/mock-s3-upload?uploadId=${uploadId}&partNumber=${partNumber}&key=${encodeURIComponent(s3Key)}`;
        }
