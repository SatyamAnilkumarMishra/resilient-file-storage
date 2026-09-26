"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSha256 = calculateSha256;
exports.generateEtag = generateEtag;
const crypto_1 = __importDefault(require("crypto"));
function calculateSha256(buffer) {
    return crypto_1.default.createHash('sha256').update(buffer).digest('hex');
}
function generateEtag(buffer) {
    // S3 ETag for a single part is typically MD5 hex wrapped in quotes
    const md5Hex = crypto_1.default.createHash('md5').update(buffer).digest('hex');
    return `"${md5Hex}"`;
}
//# sourceMappingURL=hash.js.map
