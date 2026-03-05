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

export interface SyncedCourt {
    courtId: string;
    courtName: string;
    ayoFieldId: number;
    ayoFieldName: string;
}

export interface UnmatchedField {
    id: number;
    name: string;
}

export interface UnmatchedCourt {
    id: string;
    name: string;
}

export interface SyncAyoResult {
    synced: SyncedCourt[];
    unmatched_ayo_fields: UnmatchedField[];
    unmatched_courts: UnmatchedCourt[];
    total_ayo_fields: number;
    total_internal_courts: number;
}

export interface SyncAyoResponse {
    message: string;
    data: SyncAyoResult;
}

export interface AyoField {
    id: number;
    name: string;
    [key: string]: unknown;
}

export interface AyoFieldsResponse {
    message: string;
    data: AyoField[];
}

