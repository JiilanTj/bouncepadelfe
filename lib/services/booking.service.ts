import { api } from "../api";
import {
    Booking,
    BookingCreateInput,
    BookingFilter,
    BookingSlot
} from "../types/booking.types";
import { AxiosResponse } from "axios";

export const bookingService = {
    // GET /bookings
    getAll: (params?: BookingFilter): Promise<AxiosResponse<{ data: Booking[], meta: { total: number, page: number, limit: number, totalPages: number } }>> => {
        return api.get("/bookings", { params });
    },

    // GET /bookings/:id
    getById: (id: string): Promise<AxiosResponse<Booking>> => {
        return api.get(`/bookings/${id}`);
    },

    // POST /bookings
    create: (data: BookingCreateInput): Promise<AxiosResponse<Booking>> => {
        return api.post("/bookings", data);
    },

    // PATCH /bookings/:id/cancel
    cancel: (id: string): Promise<AxiosResponse<Booking>> => {
        return api.patch(`/bookings/${id}/cancel`);
    },

    // PATCH /bookings/:id/complete
    complete: (id: string): Promise<AxiosResponse<Booking>> => {
        return api.patch(`/bookings/${id}/complete`);
    },

    // GET /bookings/availability/:id
    getAvailability: (courtId: string, date?: string): Promise<AxiosResponse<BookingSlot[]>> => {
        return api.get(`/bookings/availability/${courtId}`, { params: { date } });
    }
};
