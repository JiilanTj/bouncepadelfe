export interface Facility {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    imageKey: string | null;
    imageUrl: string | null;
    displayOrder: number;
    isVisible: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFacilityInput {
    name: string;
    description?: string;
    icon?: string;
    displayOrder?: number;
    isVisible?: boolean;
    image: File;
}

export interface UpdateFacilityInput {
    name?: string;
    description?: string;
    icon?: string;
    displayOrder?: number;
    isVisible?: boolean;
    image?: File;
}

export interface FacilitiesResponse {
    message: string;
    data: Facility[];
}

export interface FacilityResponse {
    message: string;
    data: Facility;
}
