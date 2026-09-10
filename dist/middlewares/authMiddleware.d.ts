import { Request, Response, NextFunction } from 'express';
import { AuthUserPayload } from '../models/types';
export interface AuthenticatedRequest extends Request {
    user?: AuthUserPayload;
}
export declare function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
