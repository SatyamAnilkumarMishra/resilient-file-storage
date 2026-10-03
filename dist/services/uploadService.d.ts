import { FileRecord, UploadStatusResponse, FinalizeUploadResponse } from '../models/types';
export declare const uploadService: {
    initiateUploadSession(ownerId: string, fileName: string, sizeBytes: number, fileHash: string, contentType?: string, customChunkSize?: number): Promise<{
        deduplicated: boolean;
        file: FileRecord;
        message: string;
        uploadId?: undefined;
        fileId?: undefined;
        totalChunks?: undefined;
        chunkSizeBytes?: undefined;
        expiresAt?: undefined;
        chunkUrls?: undefined;
    } | {
        deduplicated: boolean;
        uploadId: string;
        fileId: string;
        totalChunks: number;
        chunkSizeBytes: number;
        expiresAt: number;
        chunkUrls: {
            chunkNumber: number;
            url: string;
        }[];
        file?: undefined;
        message?: undefined;
    }>;
    getPresignedPartUrl(uploadId: string, chunkNumber: number, ownerId: string): Promise<string>;
    confirmChunkUpload(uploadId: string, chunkNumber: number, etag: string, ownerId: string): Promise<{
        uploadId: string;
        chunkNumber: number;
        status: string;
        etag: string;
        idempotent: boolean;
    }>;
    getUploadStatus(uploadId: string, ownerId: string): Promise<UploadStatusResponse>;
    finalizeUpload(uploadId: string, ownerId: string): Promise<FinalizeUploadResponse>;
};
