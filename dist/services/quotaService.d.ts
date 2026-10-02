export declare const quotaService: {
    checkAndReserveQuota(ownerId: string, fileSize: number): Promise<void>;
    confirmQuota(ownerId: string, fileSize: number): Promise<void>;
    releaseQuota(ownerId: string, fileSize: number): Promise<void>;
};
