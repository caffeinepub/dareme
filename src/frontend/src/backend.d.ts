import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Dare {
    id: bigint;
    dare: string;
    caption: string;
    category: string;
}
export interface backendInterface {
    getAllCategories(): Promise<Array<string>>;
    getAllDares(): Promise<Array<Dare>>;
    getDareById(id: bigint): Promise<Dare>;
    getDaresByCategory(category: string): Promise<Array<Dare>>;
}
