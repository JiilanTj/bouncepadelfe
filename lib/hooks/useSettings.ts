import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios.instance";
import { toast } from "sonner";
import { Settings, UpdateSettingsInput } from "../types/settings.types";
import { AxiosError } from "axios";

interface SettingsResponse {
    success: boolean;
    message: string;
    data: Settings;
}

// Define specific error response type
interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

export const useSettingsQuery = () => {
    return useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            const response = await axiosInstance.get<SettingsResponse>("/settings");
            return response.data.data;
        },
    });
};

export const useUpdateSettingsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateSettingsInput & { heroImage?: File | null }) => {
            const formData = new FormData();

            // Append text fields
            Object.entries(data).forEach(([key, value]) => {
                if (key !== 'heroImageUrl' && key !== 'updatedAt' && key !== 'id' && value !== null && value !== undefined) {
                    formData.append(key, value as string);
                }
            });

            // Append file if exists
            if (data.heroImage) {
                formData.append("heroImage", data.heroImage);
            }

            const response = await axiosInstance.patch<SettingsResponse>("/settings", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data.data;
        },
        onSuccess: () => {
            toast.success("Settings saved successfully");
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            toast.error(error.response?.data?.message || "Failed to update settings");
        },
    });
};
