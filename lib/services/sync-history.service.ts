import { api } from "../api";
import { SyncHistoriesResponse } from "../types/sync-history.types";

export const syncHistoryService = {
    /**
     * Get paginated sync histories
     */
    async getAll(params?: { page?: number; limit?: number; type?: string; status?: string }): Promise<SyncHistoriesResponse> {
        return api.get<SyncHistoriesResponse>("/sync-history", { params });
    },
};
