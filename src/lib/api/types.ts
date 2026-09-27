import type { components, operations } from "./schema";

type S = components["schemas"];

export type Money = S["Money"];
export type Currency = S["Currency"];
export type PricePeriod = S["PricePeriod"];
export type City = S["City"];
export type District = S["District"];
export type LaunchCategory = S["LaunchCategory"];
export type Deal = S["Deal"];
export type PropertySubcategory = S["PropertySubcategory"];
export type PropertyCondition = S["PropertyCondition"];
export type BuildingType = S["BuildingType"];
export type PropertySortKey = S["PropertySortKey"];
export type RoomsOption = S["RoomsOption"];
export type SellerType = S["SellerType"];
export type SellerSummary = S["SellerSummary"];
export type PropertyListing = S["PropertyListing"];
export type PropertyListingPage = S["PropertyListingPage"];
export type CatalogCard = S["CatalogCard"];
export type CatalogCardPage = S["CatalogCardPage"];
export type Facets = S["Facets"];

export type PropertySearchQuery = NonNullable<operations["searchPropertyListings"]["parameters"]["query"]>;
export type PropertyFacetQuery = NonNullable<operations["getPropertyFacets"]["parameters"]["query"]>;
export type CatalogSearchQuery = NonNullable<operations["searchCatalog"]["parameters"]["query"]>;
