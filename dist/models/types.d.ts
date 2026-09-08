export type FileStatus = 'uploading' | 'complete' | 'deleted';
export type UploadSessionStatus = 'in_progress' | 'finalizing' | 'complete' | 'aborted';
export type ChunkStatus = 'pending' | 'complete';
export interface FileRecord {
    fileId: string;
    ownerId: string;
    fileName: string;
    s3Key: string;
    fileHash: string;
    sizeBytes: number;
    contentType: string;
    status: FileStatus;
    createdAt: string;
    updatedAt: string;
}
export interface UploadSessionRecord {
    uploadId: string;
    fileId: string;
    ownerId: string;
    totalChunks: number;
    chunkSizeBytes: number;
    status: UploadSessionStatus;
    createdAt: string;
    expiresAt: number;
}
export interface UploadChunkRecord {
    uploadId: string;
    chunkNumber: number;
    status: ChunkStatus;
    etag?: string;
    sizeBytes: number;
    completedAt?: string | null;
}
export interface UserQuotaRecord {
    ownerId: string;
    storageUsedBytes: number;
    reservedBytes: number;
    maxQuotaBytes: number;
    updatedAt: string;
}
export interface UserRecord {
    userId: string;
    email: string;
    passwordHash: string;
    createdAt: string;
}
export interface AuthUserPayload {
    userId: string;
    email: string;
}
export interface InitUploadRequest {
    fileName: string;
    sizeBytes: number;
    fileHash: string;
    contentType?: string;
    chunkSizeBytes?: number;
}
export interface ConfirmChunkRequest {
    etag: string;
}
export interface UploadStatusResponse {
    uploadId: string;
    fileId: string;
    status: UploadSessionStatus;
    totalChunks: number;
    completedChunks: number;
    completedChunkNumbers: number[];
    missingChunkNumbers: number[];
    progressPercent: number;
    isComplete: boolean;
}
export interface FinalizeUploadResponse {
    fileId: string;
    s3Key: string;
    status: FileStatus;
    fileName: string;
    sizeBytes: number;
    message: string;
}
