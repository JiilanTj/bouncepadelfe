export type SyncType = "COURT" | "BOOKING";
export type SyncStatus = "SUCCESS" | "FAILED";

export interface SyncHistoryUser {
    id: string;
    name: string;
    email: string;
}

export interface SyncHistory {
    id: string;
    type: SyncType;
    status: SyncStatus;
    summary: string;
    details?: any;
    triggeredBy?: string;
    triggerer?: SyncHistoryUser;
    createdAt: string;
}

export interface SyncHistoriesResponse {
    success: boolean;
    data: {
        histories: SyncHistory[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
    message: string;
}
