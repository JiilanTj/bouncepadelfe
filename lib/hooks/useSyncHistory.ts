import { useQuery } from "@tanstack/react-query";
import { syncHistoryService } from "../services/sync-history.service";

export const SYNC_HISTORY_QUERY_KEY = ["sync-history"];

export function useSyncHistoriesQuery(params?: { page?: number; limit?: number; type?: string; status?: string }) {
    return useQuery({
        queryKey: [...SYNC_HISTORY_QUERY_KEY, params],
        queryFn: async () => {
            const response = await syncHistoryService.getAll(params);
            return response.data;
        },
    });
}
