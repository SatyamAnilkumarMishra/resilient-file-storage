"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("../services/authService");
const dynamoService_1 = require("../services/dynamoService");
exports.authController = {
    async register(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService_1.authService.register(email, password);
            res.status(201).json({
                message: 'User registered successfully',
                token: result.token,
                user: result.user
            });
        }
        catch (err) {
            next(err);
        }
    },
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService_1.authService.login(email, password);
            res.status(200).json({
                message: 'Login successful',
                token: result.token,
                user: result.user
            });
        }
        catch (err) {
            next(err);
        }
    },
    async getProfile(req, res, next) {
        try {
            const user = req.user;
            const quota = await dynamoService_1.dynamoService.getUserQuota(user.userId);
            res.status(200).json({
                user,
                quota: quota || {
                    ownerId: user.userId,
                    storageUsedBytes: 0,
                    maxQuotaBytes: 5368709120
                }
            });
        }
        catch (err) {
            next(err);
        }
    }
};
//# sourceMappingURL=authController.js.map
