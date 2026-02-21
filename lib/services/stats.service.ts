import { format } from "date-fns";
import { api, axiosInstance } from "@/lib/api";
import { DashboardStatsResponse, ReportsStatsResponse } from "../types/stats.types";

export const statsService = {
    getDashboardStats: (): Promise<DashboardStatsResponse> => {
        return api.get<DashboardStatsResponse>("/stats/dashboard");
    },

    getReportsStats: (dateRange?: { from?: Date; to?: Date }): Promise<ReportsStatsResponse> => {
        const params = new URLSearchParams();
        if (dateRange?.from) {
            params.append("startDate", dateRange.from.toISOString());
        }
        if (dateRange?.to) {
            params.append("endDate", dateRange.to.toISOString());
        }
        const queryString = params.toString();
        return api.get<ReportsStatsResponse>(`/stats/reports${queryString ? `?${queryString}` : ""}`);
    },

    exportReport: async (dateRange?: { from?: Date; to?: Date }): Promise<void> => {
        const params = new URLSearchParams();
        if (dateRange?.from) {
            params.append("startDate", dateRange.from.toISOString());
        }
        if (dateRange?.to) {
            params.append("endDate", dateRange.to.toISOString());
        }

        try {
            const response = await axiosInstance.get('/stats/export', {
                params: params,
                responseType: 'blob', // Important for file download
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Fix: Generate filename on frontend to ensure correct local date
            // This prevents backend UTC conversion issues (e.g. "yesterday" due to timezone)
            const fileName = `report-${dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : 'all'}.xlsx`;

            /* 
            // Previous Logic (Backend Filename) - Caused Timezone Issues
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (fileNameMatch?.[1]) {
                    // fileName = fileNameMatch[1]; // Ignored to fix timezone bug
                }
            }
            */

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export error:", error);
            throw error;
        }
    },
};
