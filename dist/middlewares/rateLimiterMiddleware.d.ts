import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
export declare function rateLimiterMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
