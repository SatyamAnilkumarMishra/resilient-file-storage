export declare const config: {
    port: number;
    nodeEnv: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    defaultChunkSizeBytes: number;
    defaultUserQuotaBytes: number;
    uploadExpirationHours: number;
    cleanupSweepIntervalMs: number;
    awsRegion: string;
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
    s3BucketName: string;
    dynamoEndpoint: string | undefined;
    s3Endpoint: string | undefined;
    useMockAws: boolean;
};
