// Landing Page Types
// Re-export existing types used on the landing page
export type { Facility } from "./facilities.types";
export type { Product } from "./product.types";
export type { Court } from "./court.types";

export interface LandingPageData {
    facilities: import("./facilities.types").Facility[];
    productsSell: import("./product.types").Product[];
    productsRent: import("./product.types").Product[];
    courtsCount: number;
}
