import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
export declare const rawDynamoClient: DynamoDBClient;
export declare const docClient: DynamoDBDocumentClient;
export declare const s3Client: S3Client;
