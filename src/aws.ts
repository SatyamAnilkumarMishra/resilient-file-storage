import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { config } from './env';

const dynamoClientConfig: any = {
  region: config.awsRegion,
  credentials: {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
  },
};

if (config.dynamoEndpoint) {
  dynamoClientConfig.endpoint = config.dynamoEndpoint;
}

export const rawDynamoClient = new DynamoDBClient(dynamoClientConfig);
export const docClient = DynamoDBDocumentClient.from(rawDynamoClient, {
  marshallOptions: { removeUndefinedValues: true },
});

const s3ClientConfig: any = {
  region: config.awsRegion,
  credentials: {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
  },
  forcePathStyle: true,
};

if (config.s3Endpoint) {
  s3ClientConfig.endpoint = config.s3Endpoint;
}

export const s3Client = new S3Client(s3ClientConfig);
