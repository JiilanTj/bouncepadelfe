import { api } from "@/lib/api";
import {
    CreateCourtInput,
    UpdateCourtInput,
    CourtsResponse,
    CourtResponse,
    SyncAyoResponse,
} from "@/lib/types/courts.types";

/**
 * Helper to build FormData for Court requests (Create/Update)
 * Maps camelCase frontend keys to snake_case backend keys where necessary.
 */
function buildCourtFormData(data: CreateCourtInput | UpdateCourtInput): FormData {
    const formData = new FormData();

    // Map camelCase/nested frontend keys if needed (handled by types currently)
    // price_per_hour and ayo_field_id are already snake_case in types to match backend expectations
    // but we can map them here if we use camelCase in types in the future.

    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (value instanceof File) {
                formData.append(key, value);
            } else {
                formData.append(key, String(value));
            }
        }
    });

    return formData;
}

export const courtsService = {
    /**
     * Get all visible and non-inactive courts (Filtered by public/admin in backend)
     */
    async getAll(params?: { type?: string; status?: string; search?: string }): Promise<CourtsResponse> {
        return api.get<CourtsResponse>("/courts", { params });
    },

    /**
     * Get single court by ID or slug
     */
    async getById(id: string): Promise<CourtResponse> {
        return api.get<CourtResponse>(`/courts/${id}`);
    },

    /**
     * Create new court
     */
    async create(data: CreateCourtInput): Promise<CourtResponse> {
        const formData = buildCourtFormData(data);

        return api.post<CourtResponse>("/courts", formData, {
            headers: {
                "Content-Type": undefined,
            },
        });
    },

    /**
     * Update court
     */
    async update(id: string, data: UpdateCourtInput): Promise<CourtResponse> {
        const formData = buildCourtFormData(data);

        return api.put<CourtResponse>(`/courts/${id}`, formData, {
            headers: {
                "Content-Type": undefined,
            },
        });
    },

    /**
     * Delete court (Soft delete in backend)
     */
    async delete(id: string): Promise<CourtResponse> {
        return api.delete<CourtResponse>(`/courts/${id}`);
    },

    /**
     * Sync internal courts with Ayo.co.id venue fields.
     * Matches by name, updates ayo_field_id in internal DB.
     */
    async syncWithAyo(): Promise<SyncAyoResponse> {
        return api.post<SyncAyoResponse>("/courts/sync-ayo");
    },

    /**
     * Get raw list of venue fields from Ayo.co.id
     */
    async getAyoFields(): Promise<import("@/lib/types/courts.types").AyoFieldsResponse> {
        return api.get<import("@/lib/types/courts.types").AyoFieldsResponse>("/courts/ayo-fields");
    },

    /**
     * Manually map an internal court to an Ayo.co.id venue field
     */
    async mapAyoField(courtId: string, ayoFieldId: number | string): Promise<CourtResponse> {
        return api.patch<CourtResponse>(`/courts/${courtId}/map-ayo`, { ayoFieldId });
    }
};

