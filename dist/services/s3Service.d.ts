declare class InMemoryS3Store {
    private multipartUploads;
    private objects;
    createMultipartUpload(s3Key: string): string;
    savePart(uploadId: string, partNumber: number, buffer: Buffer): string;
    completeMultipartUpload(uploadId: string, partsList: {
        PartNumber: number;
        ETag: string;
    }[]): Buffer;
    abortMultipartUpload(uploadId: string): void;
    getObject(s3Key: string): {
        buffer: Buffer;
        contentType: string;
    } | null;
    putObject(s3Key: string, buffer: Buffer, contentType: string): void;
    clear(): void;
}
export declare const inMemoryS3: InMemoryS3Store;
export declare const s3Service: {
    clearMemoryS3: () => void;
    createMultipartUpload(s3Key: string, contentType?: string): Promise<string>;
    generatePresignedPartUrl(s3Key: string, uploadId: string, partNumber: number): Promise<string>;
    completeMultipartUpload(s3Key: string, uploadId: string, parts: {
        PartNumber: number;
        ETag: string;
    }[]): Promise<void>;
    abortMultipartUpload(s3Key: string, uploadId: string): Promise<void>;
    generatePresignedDownloadUrl(s3Key: string): Promise<string>;
};
export {};
