export interface Settings {
    id: string;
    businessName: string | null;
    businessEmail: string | null;
    businessPhone: string | null;
    businessAddress: string | null;
    businessMapLink: string | null;
    facebookUrl: string | null;
    instagramUrl: string | null;
    tiktokUrl: string | null;
    twitterUrl: string | null;
    heroImageUrl: string | null;
    weekdayOpen: string | null;
    weekdayClose: string | null;
    weekendOpen: string | null;
    weekendClose: string | null;
    updatedAt: string;
}

export type UpdateSettingsInput = Partial<Omit<Settings, "id" | "updatedAt">>;
