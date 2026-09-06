"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = exports.docClient = exports.rawDynamoClient = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = require("./env");
const dynamoClientConfig = {
    region: env_1.config.awsRegion,
    credentials: {
        accessKeyId: env_1.config.awsAccessKeyId,
        secretAccessKey: env_1.config.awsSecretAccessKey,
    },
};
if (env_1.config.dynamoEndpoint) {
    dynamoClientConfig.endpoint = env_1.config.dynamoEndpoint;
}
exports.rawDynamoClient = new client_dynamodb_1.DynamoDBClient(dynamoClientConfig);
exports.docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(exports.rawDynamoClient, {
    marshallOptions: { removeUndefinedValues: true },
});
const s3ClientConfig = {
    region: env_1.config.awsRegion,
    credentials: {
        accessKeyId: env_1.config.awsAccessKeyId,
        secretAccessKey: env_1.config.awsSecretAccessKey,
    },
    forcePathStyle: true,
};
if (env_1.config.s3Endpoint) {
    s3ClientConfig.endpoint = env_1.config.s3Endpoint;
}
exports.s3Client = new client_s3_1.S3Client(s3ClientConfig);
//# sourceMappingURL=aws.js.map
