"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const dynamoService_1 = require("./dynamoService");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.authService = {
    async register(email, password) {
        if (!email || !password || password.length < 6) {
            throw new Error('Valid email and password (at least 6 characters) are required.');
        }
        const existingUser = await dynamoService_1.dynamoService.getUserByEmail(email);
        if (existingUser) {
            throw new Error(`User with email ${email} already exists.`);
        }
        const userId = (0, uuid_1.v4)();
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const createdAt = new Date().toISOString();
        const userRecord = {
            userId,
            email: email.toLowerCase(),
            passwordHash,
            createdAt
        };
        await dynamoService_1.dynamoService.createUser(userRecord);
        const token = this.generateToken({ userId, email: userRecord.email });
        logger_1.logger.info('User registered successfully', { userId, email: userRecord.email });
        return {
            token,
            user: { userId, email: userRecord.email }
        };
    },
    async login(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required.');
        }
        const userRecord = await dynamoService_1.dynamoService.getUserByEmail(email);
        if (!userRecord) {
            throw new Error('Invalid email or password credentials.');
        }
        const isMatch = await bcryptjs_1.default.compare(password, userRecord.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid email or password credentials.');
        }
        const token = this.generateToken({ userId: userRecord.userId, email: userRecord.email });
        logger_1.logger.info('User logged in successfully', { userId: userRecord.userId, email: userRecord.email });
        return {
            token,
            user: { userId: userRecord.userId, email: userRecord.email }
        };
    },
    generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.config.jwtSecret, { expiresIn: env_1.config.jwtExpiresIn });
    },
    verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
    }
};
//# sourceMappingURL=authService.js.map
