"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamoService = exports.inMemoryDb = exports.TABLE_USERS = exports.TABLE_USER_QUOTAS = exports.TABLE_UPLOAD_CHUNKS = exports.TABLE_UPLOAD_SESSIONS = exports.TABLE_FILES = void 0;
const aws_1 = require("../config/aws");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.TABLE_FILES = 'Files';
exports.TABLE_UPLOAD_SESSIONS = 'UploadSessions';
exports.TABLE_UPLOAD_CHUNKS = 'UploadChunks';
exports.TABLE_USER_QUOTAS = 'UserQuotas';
exports.TABLE_USERS = 'Users';
// In-Memory Storage for Mock Mode
class InMemoryDynamoDB {
    files = new Map(); // fileId -> record
    sessions = new Map(); // uploadId -> record
    chunks = new Map(); // `uploadId#chunkNumber` -> record
    quotas = new Map(); // ownerId -> record
    users = new Map(); // userId / email -> record
    clear() {
        this.files.clear();
        this.sessions.clear();
        this.chunks.clear();
        this.quotas.clear();
        this.users.clear();
    }
    // Files
    putFile(file) {
        this.files.set(file.fileId, { ...file });
    }
    getFile(fileId) {
        const item = this.files.get(fileId);
        return item ? { ...item } : null;
    }
    queryFilesByHash(fileHash, ownerId) {
        const matches = [];
        for (const file of this.files.values()) {
            if (file.fileHash === fileHash && file.ownerId === ownerId && file.status === 'complete') {
                matches.push({ ...file });
            }
        }
        return matches;
    }
    queryFilesByOwner(ownerId) {
        const matches = [];
        for (const file of this.files.values()) {
            if (file.ownerId === ownerId && file.status !== 'deleted') {
                matches.push({ ...file });
            }
        }
        return matches;
    }
    updateFileStatus(fileId, status, updatedAt) {
        const file = this.files.get(fileId);
        if (file) {
            file.status = status;
            file.updatedAt = updatedAt;
            this.files.set(fileId, file);
        }
    }
    deleteFile(fileId) {
        this.files.delete(fileId);
    }
    // Upload Sessions
    putSession(session) {
        this.sessions.set(session.uploadId, { ...session });
    }
    getSession(uploadId) {
        const item = this.sessions.get(uploadId);
        return item ? { ...item } : null;
    }
    updateSessionStatus(uploadId, status) {
        const session = this.sessions.get(uploadId);
        if (session) {
            session.status = status;
            this.sessions.set(uploadId, session);
        }
    }
    scanExpiredSessions(nowEpoch) {
        const expired = [];
        for (const session of this.sessions.values()) {
            if (session.status === 'in_progress' && session.expiresAt <= nowEpoch) {
                expired.push({ ...session });
            }
        }
        return expired;
    }
    // Chunks
    putChunk(chunk) {
        const key = `${chunk.uploadId}#${chunk.chunkNumber}`;
        this.chunks.set(key, { ...chunk });
    }
    getChunk(uploadId, chunkNumber) {
        const key = `${uploadId}#${chunkNumber}`;
        const item = this.chunks.get(key);
        return item ? { ...item } : null;
    }
    queryChunksByUploadId(uploadId) {
        const matches = [];
        for (const chunk of this.chunks.values()) {
            if (chunk.uploadId === uploadId) {
                matches.push({ ...chunk });
            }
        }
        matches.sort((a, b) => a.chunkNumber - b.chunkNumber);
        return matches;
    }
    confirmChunk(uploadId, chunkNumber, etag, completedAt) {
        const key = `${uploadId}#${chunkNumber}`;
        const chunk = this.chunks.get(key) || {
            uploadId,
            chunkNumber,
            sizeBytes: 0,
        };
        chunk.status = 'complete';
        chunk.etag = etag;
        chunk.completedAt = completedAt;
        this.chunks.set(key, chunk);
    }
    deleteChunksForUpload(uploadId) {
        for (const [key, chunk] of this.chunks.entries()) {
            if (chunk.uploadId === uploadId) {
                this.chunks.delete(key);
            }
        }
    }
