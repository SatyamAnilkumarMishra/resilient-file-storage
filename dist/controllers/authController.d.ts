import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
export declare const authController: {
    register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
