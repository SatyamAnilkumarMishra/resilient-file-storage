"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
exports.config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_resilient_storage_2026',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    defaultChunkSizeBytes: parseInt(process.env.DEFAULT_CHUNK_SIZE_BYTES || '5242880', 10), // 5MB
    defaultUserQuotaBytes: parseInt(process.env.DEFAULT_USER_QUOTA_BYTES || '5368709120', 10), // 5GB
    uploadExpirationHours: parseInt(process.env.UPLOAD_EXPIRATION_HOURS || '24', 10),
    cleanupSweepIntervalMs: parseInt(process.env.CLEANUP_SWEEP_INTERVAL_MS || '300000', 10),
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock_access_key',
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock_secret_key',
    s3BucketName: process.env.S3_BUCKET_NAME || 'resilient-storage-bucket',
    dynamoEndpoint: process.env.DYNAMODB_ENDPOINT || undefined,
    s3Endpoint: process.env.S3_ENDPOINT || undefined,
    useMockAws: process.env.USE_MOCK_AWS === 'true' || (!process.env.AWS_ACCESS_KEY_ID && !process.env.DYNAMODB_ENDPOINT)
};
//# sourceMappingURL=env.js.map
