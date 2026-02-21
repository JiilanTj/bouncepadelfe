import { api } from "@/lib/api";
import {
    CreateFacilityInput,
    UpdateFacilityInput,
    FacilitiesResponse,
    FacilityResponse,
} from "@/lib/types/facilities.types";

// ------------------------------------------------------------------------------
// Helper: Build FormData
// ------------------------------------------------------------------------------

// Map camelCase frontend keys to snake_case backend keys
const keyMap: Record<string, string> = {
    displayOrder: "display_order",
    isVisible: "is_visible",
};

function buildFacilityFormData(data: CreateFacilityInput | UpdateFacilityInput): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            const backendKey = keyMap[key] || key;
            if (value instanceof File) {
                formData.append(backendKey, value);
            } else {
                formData.append(backendKey, String(value));
            }
        }
    });

    return formData;
}

// ------------------------------------------------------------------------------
// Facilities Service
// ------------------------------------------------------------------------------

export const facilitiesService = {
    /**
     * Get all visible and active facilities (Public/Protected shared endpoint logic)
     * Note: The backend returns all visible & active for public, but for admin we might want to see all?
     * The current controller implementation `getAllFacilities` filters by `isVisible` and `isActive`.
     * If admins need to see hidden/inactive, we might need a separate endpoint or param.
     * For now, adhering to the requirement "Allow admin CRUD" and "Public GET".
     * Assuming the same endpoint is used for listing for now.
     */
    async getAll(): Promise<FacilitiesResponse> {
        return api.get<FacilitiesResponse>("/facilities");
    },

    /**
     * Get single facility by ID
     * @param id - Facility ID
     */
    async getById(id: string): Promise<FacilityResponse> {
        return api.get<FacilityResponse>(`/facilities/${id}`);
    },

    /**
     * Create new facility
     * @param data - Facility input data
     */
    async create(data: CreateFacilityInput): Promise<FacilityResponse> {
        const formData = buildFacilityFormData(data);

        return api.post<FacilityResponse>("/facilities", formData, {
            headers: {
                "Content-Type": undefined,
            },
        });
    },

    /**
     * Update facility
     * @param id - Facility ID
     * @param data - Facility update data
     */
    async update(id: string, data: UpdateFacilityInput): Promise<FacilityResponse> {
        const formData = buildFacilityFormData(data);

        return api.put<FacilityResponse>(`/facilities/${id}`, formData, {
            headers: {
                "Content-Type": undefined,
            },
        });
    },

    /**
     * Delete facility (Soft delete)
     * @param id - Facility ID
     */
    async delete(id: string): Promise<FacilityResponse> {
        return api.delete<FacilityResponse>(`/facilities/${id}`);
    },
};
