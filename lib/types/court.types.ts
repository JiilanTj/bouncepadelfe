export interface Court {
  id: string;
  name: string;
  pricePerHour: number;
  status: "AVAILABLE" | "MAINTENANCE";
  createdAt?: string;
  updatedAt?: string;
}

export interface CourtCreateInput {
  name: string;
  pricePerHour: number;
}

export interface CourtUpdateInput {
  name?: string;
  pricePerHour?: number;
  status?: "AVAILABLE" | "MAINTENANCE";
}
