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
    // Quotas
    getQuota(ownerId) {
        return this.quotas.get(ownerId) || null;
    }
    putQuota(quota) {
        this.quotas.set(quota.ownerId, { ...quota });
    }
    atomicAddUsedQuota(ownerId, deltaBytes, maxQuotaBytes) {
        let quota = this.quotas.get(ownerId);
        if (!quota) {
            quota = {
                ownerId,
                storageUsedBytes: 0,
                reservedBytes: 0,
                maxQuotaBytes: maxQuotaBytes || env_1.config.defaultUserQuotaBytes,
                updatedAt: new Date().toISOString()
            };
        }
        const newUsed = Math.max(0, quota.storageUsedBytes + deltaBytes);
        if (deltaBytes > 0 && newUsed > quota.maxQuotaBytes) {
            throw new Error(`Storage quota exceeded for user ${ownerId}`);
        }
        quota.storageUsedBytes = newUsed;
        quota.updatedAt = new Date().toISOString();
        this.quotas.set(ownerId, quota);
        return quota;
    }
    // Users
    putUser(user) {
        this.users.set(user.userId, { ...user });
        this.users.set(`email#${user.email.toLowerCase()}`, { ...user });
    }
    getUserById(userId) {
        return this.users.get(userId) || null;
    }
    getUserByEmail(email) {
        return this.users.get(`email#${email.toLowerCase()}`) || null;
    }
}
exports.inMemoryDb = new InMemoryDynamoDB();
exports.dynamoService = {
    clearMemoryDb: () => exports.inMemoryDb.clear(),
    async initializeTables() {
        if (env_1.config.useMockAws) {
            logger_1.logger.info('Using In-Memory DynamoDB engine');
            return;
        }
        try {
            const existing = await aws_1.rawDynamoClient.send(new client_dynamodb_1.ListTablesCommand({}));
            const tableNames = existing.TableNames || [];
            logger_1.logger.info('Connected to DynamoDB endpoint', { tableNames });
        }
        catch (err) {
            logger_1.logger.warn('Failed to list DynamoDB tables, falling back to mock mode if appropriate', { error: err.message });
        }
    },
    // File Operations
    async createFile(file) {
        if (env_1.config.useMockAws) {
            exports.inMemoryDb.putFile(file);
            return;
        }
        await aws_1.docClient.send(new lib_dynamodb_1.PutCommand({
            TableName: exports.TABLE_FILES,
            Item: file
        }));
    },
    async getFile(fileId) {
        if (env_1.config.useMockAws) {
            return exports.inMemoryDb.getFile(fileId);
        }
        const res = await aws_1.docClient.send(new lib_dynamodb_1.GetCommand({
            TableName: exports.TABLE_FILES,
            Key: { fileId }
        }));
        return res.Item || null;
    },
    async findCompletedFileByHash(ownerId, fileHash) {
        if (env_1.config.useMockAws) {
            const files = exports.inMemoryDb.queryFilesByHash(fileHash, ownerId);
            return files[0] || null;
        }
        const res = await aws_1.docClient.send(new lib_dynamodb_1.QueryCommand({
            TableName: exports.TABLE_FILES,
            IndexName: 'fileHash-index',
            KeyConditionExpression: 'fileHash = :h',
            FilterExpression: 'ownerId = :o AND #st = :status',
            ExpressionAttributeNames: { '#st': 'status' },
            ExpressionAttributeValues: {
                ':h': fileHash,
                ':o': ownerId,
                ':status': 'complete'
            }
        }));
        return res.Items && res.Items.length > 0 ? res.Items[0] : null;
    },
    async listFilesByOwner(ownerId) {
        if (env_1.config.useMockAws) {
            return exports.inMemoryDb.queryFilesByOwner(ownerId);
        }
        const res = await aws_1.docClient.send(new lib_dynamodb_1.QueryCommand({
            TableName: exports.TABLE_FILES,
            IndexName: 'ownerId-index',
            KeyConditionExpression: 'ownerId = :o',
            FilterExpression: '#st <> :deleted',
            ExpressionAttributeNames: { '#st': 'status' },
            ExpressionAttributeValues: {
                ':o': ownerId,
                ':deleted': 'deleted'
            }
        }));
        return res.Items || [];
    },
    async updateFileStatus(fileId, status) {
        const updatedAt = new Date().toISOString();
        if (env_1.config.useMockAws) {
            exports.inMemoryDb.updateFileStatus(fileId, status, updatedAt);
            return;
        }
        await aws_1.docClient.send(new lib_dynamodb_1.UpdateCommand({
            TableName: exports.TABLE_FILES,
            Key: { fileId },
            UpdateExpression: 'SET #st = :st, updatedAt = :u',
            ExpressionAttributeNames: { '#st': 'status' },
            ExpressionAttributeValues: {
                ':st': status,
                ':u': updatedAt
            }
        }));
    },
