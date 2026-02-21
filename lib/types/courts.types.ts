export enum CourtType {
    INDOOR = "INDOOR",
    OUTDOOR = "OUTDOOR",
}

export enum CourtStatus {
    ACTIVE = "ACTIVE",
    MAINTENANCE = "MAINTENANCE",
    INACTIVE = "INACTIVE",
}

export interface Court {
    id: string;
    name: string;
    slug: string;
    type: CourtType;
    surface: string;
    status: CourtStatus;
    pricePerHour: string;
    imageKey: string | null;
    imageUrl: string | null;
    isVisible: boolean;
    ayoFieldId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCourtInput {
    name: string;
    type: CourtType;
    surface: string;
    status: CourtStatus;
    price_per_hour: number;
    ayo_field_id?: string;
    image: File;
}

export interface UpdateCourtInput {
    name?: string;
    type?: CourtType;
    surface?: string;
    status?: CourtStatus;
    price_per_hour?: number;
    ayo_field_id?: string;
    is_visible?: boolean;
    image?: File;
}

export interface CourtsResponse {
    message: string;
    data: Court[];
}

export interface CourtResponse {
    message: string;
    data: Court;
}
