import { AuthUserPayload } from '../models/types';
export declare const authService: {
    register(email: string, password: string): Promise<{
        token: string;
        user: AuthUserPayload;
    }>;
    login(email: string, password: string): Promise<{
        token: string;
        user: AuthUserPayload;
    }>;
    generateToken(payload: AuthUserPayload): string;
    verifyToken(token: string): AuthUserPayload;
};
