import { FileRecord } from '../models/types';
export interface DedupCheckResult {
    isDuplicate: boolean;
    file?: FileRecord;
}
export declare const dedupService: {
    checkForDuplicate(ownerId: string, fileHash: string, fileName: string): Promise<DedupCheckResult>;
};
