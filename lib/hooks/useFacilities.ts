import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { facilitiesService } from "@/lib/services/facilities.service";
import { CreateFacilityInput, UpdateFacilityInput } from "@/lib/types/facilities.types";
import { toast } from "sonner";
import { AxiosError } from "axios";

// Define specific error response type
interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

export const FACILITIES_QUERY_KEY = ["facilities"];

export function useFacilitiesQuery() {
    return useQuery({
        queryKey: FACILITIES_QUERY_KEY,
        queryFn: async () => {
            const response = await facilitiesService.getAll();
            return response.data;
        },
    });
}

export function useCreateFacilityMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateFacilityInput) => facilitiesService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FACILITIES_QUERY_KEY });
            toast.success("Facility created successfully");
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error("Create facility error:", error);
            toast.error(error.response?.data?.message || "Failed to create facility");
        }
    });
}

export function useUpdateFacilityMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateFacilityInput }) =>
            facilitiesService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FACILITIES_QUERY_KEY });
            toast.success("Facility updated successfully");
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error("Update facility error:", error);
            toast.error(error.response?.data?.message || "Failed to update facility");
        }
    });
}

export function useDeleteFacilityMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => facilitiesService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FACILITIES_QUERY_KEY });
            toast.success("Facility deleted successfully");
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error("Delete facility error:", error);
            toast.error(error.response?.data?.message || "Failed to delete facility");
        }
    });
}
