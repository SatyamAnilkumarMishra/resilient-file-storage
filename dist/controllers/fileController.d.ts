import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
export declare const fileController: {
    listFiles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getFileDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    deleteFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getQuota(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    downloadMockFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
};
