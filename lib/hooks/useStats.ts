import { useQuery } from "@tanstack/react-query";
import { statsService } from "../services/stats.service";
import { DashboardStats, ReportsStats } from "../types/stats.types";

export const useDashboardStatsQuery = () => {
    return useQuery({
        queryKey: ["stats", "dashboard"],
        queryFn: async (): Promise<DashboardStats> => {
            const response = await statsService.getDashboardStats();
            if (response.success) {
                return response.data;
            }
            throw new Error(response.message);
        },
        refetchInterval: 300000, // Refetch every 5 minutes
    });
};

export const useReportsStatsQuery = (dateRange?: { from?: Date; to?: Date }) => {
    return useQuery({
        queryKey: ["stats", "reports", dateRange],
        queryFn: async (): Promise<ReportsStats> => {
            const response = await statsService.getReportsStats(dateRange);
            if (response.success) {
                return response.data;
            }
            throw new Error(response.message);
        },
    });
};
