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

export function useSyncWithAyoMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => courtsService.syncWithAyo(),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: COURTS_QUERY_KEY });
            const { synced, unmatched_courts, unmatched_ayo_fields } = response.data;
            toast.success(
                `Sync selesai: ${synced.length} lapangan tersinkronisasi` +
                (unmatched_courts.length > 0
                    ? `, ${unmatched_courts.length} lapangan internal tidak ditemukan di Ayo`
                    : "") +
                (unmatched_ayo_fields.length > 0
                    ? `, ${unmatched_ayo_fields.length} lapangan Ayo tidak ada di internal`
                    : ""),
                { duration: 6000 }
            );
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error("Sync Ayo error:", error);
            toast.error(error.response?.data?.message || "Gagal sinkronisasi dengan Ayo.co.id");
        }
    });
}

export function useAyoFieldsQuery() {
    return useQuery({
        queryKey: ["ayo-fields"],
        queryFn: async () => {
            const response = await courtsService.getAyoFields();
            return response.data;
        },
    });
}

export function useMapAyoFieldMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ courtId, ayoFieldId }: { courtId: string; ayoFieldId: number | string }) =>
            courtsService.mapAyoField(courtId, ayoFieldId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COURTS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ["ayo-fields"] });
            toast.success("Successfully mapped court to Ayo.co.id field");
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error("Map Ayo Field error:", error);
            toast.error(error.response?.data?.message || "Failed to map court to Ayo field");
        }
    });
}
