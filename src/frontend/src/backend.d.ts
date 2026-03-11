import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Price = bigint;
export type Timestamp = bigint;
export type ListingId = bigint;
export interface Listing {
    id: ListingId;
    title: string;
    contact: string;
    ownerId: Principal;
    createdAt: Timestamp;
    description: string;
    sellerName: string;
    imageUrl?: string;
    category: Category;
    price: Price;
}
export interface NewListingInput {
    title: string;
    contact: string;
    description: string;
    sellerName: string;
    imageUrl?: string;
    category: Category;
    price: Price;
}
export interface UserProfile {
    name: string;
}
export enum Category {
    clothing = "clothing",
    craftsHandmade = "craftsHandmade",
    other = "other",
    foodProduce = "foodProduce",
    furniture = "furniture",
    toolsEquipment = "toolsEquipment",
    services = "services",
    electronics = "electronics"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    countListingsByCategory(): Promise<Array<[Category, bigint]>>;
    createListing(input: NewListingInput): Promise<ListingId>;
    deleteListing(id: ListingId): Promise<void>;
    filterListingsByCategory(category: Category): Promise<Array<Listing>>;
    getAllListings(): Promise<Array<Listing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListingById(id: ListingId): Promise<Listing>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchListings(keyword: string): Promise<Array<Listing>>;
}
