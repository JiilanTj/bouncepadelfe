import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courtsService } from "@/lib/services/courts.service";
import { CreateCourtInput, UpdateCourtInput } from "@/lib/types/courts.types";
import { toast } from "sonner";
import { AxiosError } from "axios";

// Define specific error response type
interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

export const COURTS_QUERY_KEY = ["courts"];

export function useCourtsQuery(params?: { type?: string; status?: string; search?: string }) {
    return useQuery({
        queryKey: [...COURTS_QUERY_KEY, params],
        queryFn: async () => {
            const response = await courtsService.getAll(params);
            return response.data;
        },
    });
}

export function useCourtQuery(id: string) {
    return useQuery({
        queryKey: [...COURTS_QUERY_KEY, id],
        queryFn: async () => {
            const response = await courtsService.getById(id);
            return response.data;
        },
        enabled: !!id,
    });
}

export function useCreateCourtMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCourtInput) => courtsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COURTS_QUERY_KEY });
            toast.success("Court created successfully");
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error("Create court error:", error);
            toast.error(error.response?.data?.message || "Failed to create court");
        }
    });
}

export function useUpdateCourtMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCourtInput }) =>
            courtsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COURTS_QUERY_KEY });
            toast.success("Court updated successfully");
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error("Update court error:", error);
            toast.error(error.response?.data?.message || "Failed to update court");
        }
    });
}

export function useDeleteCourtMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => courtsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COURTS_QUERY_KEY });
            toast.success("Court deleted successfully");
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error("Delete court error:", error);
            toast.error(error.response?.data?.message || "Failed to delete court");
        }
    });
}
