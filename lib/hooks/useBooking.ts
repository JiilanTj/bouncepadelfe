import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/lib/services/booking.service";
import { BookingCreateInput, BookingFilter } from "@/lib/types/booking.types";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

export const BOOKING_QUERY_KEY = ["bookings"];

export function useBookingsQuery(params?: BookingFilter) {
    return useQuery({
        queryKey: [...BOOKING_QUERY_KEY, params],
        queryFn: async () => {
            const response = await bookingService.getAll(params);
            return response.data;
        },
    });
}

export function useBookingQuery(id: string) {
    return useQuery({
        queryKey: [...BOOKING_QUERY_KEY, id],
        queryFn: async () => {
            const response = await bookingService.getById(id);
            return response.data;
        },
        enabled: !!id,
    });
}

export function useCreateBookingMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: BookingCreateInput) => bookingService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEY });
            toast.success("Booking created successfully");
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error("Create booking error:", error);
            toast.error(error.response?.data?.message || "Failed to create booking");
        },
    });
}

export function useCancelBookingMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => bookingService.cancel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEY });
            toast.success("Booking cancelled successfully");
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error("Cancel booking error:", error);
            toast.error(error.response?.data?.message || "Failed to cancel booking");
        },
    });
}

export function useCompleteBookingMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => bookingService.complete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEY });
            toast.success("Booking marked as completed");
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error("Complete booking error:", error);
            toast.error(error.response?.data?.message || "Failed to complete booking");
        },
    });
}

export function useCourtAvailabilityQuery(courtId: string, date?: string) {
    return useQuery({
        queryKey: [...BOOKING_QUERY_KEY, "availability", courtId, date],
        queryFn: async () => {
            const response = await bookingService.getAvailability(courtId, date);
            return response.data;
        },
        enabled: !!courtId,
    });
}

export function useSyncBookingsWithAyoMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params?: { start_date?: string, end_date?: string }) => bookingService.syncWithAyo(params),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEY });
            const { newInserted, existingUpdated, skippedUnmapped } = response.data;
            toast.success(
                `Sync complete! Inserted: ${newInserted}, Updated: ${existingUpdated}, Skipped (Unmapped): ${skippedUnmapped}`,
                { duration: 5000 }
            );
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            console.error("Sync bookings with Ayo error:", error);
            toast.error(error.response?.data?.message || "Failed to sync bookings from Ayo");
        },
    });
}
