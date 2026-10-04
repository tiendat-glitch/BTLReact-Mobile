// @ts-nocheck
// Shared types for computer-store catalog filtering.
// These map to product_variants fields and catalog facet responses.

export type FacetEntry = {
  value: string;
  count: number;
};

export type FacetGroup = {
  key: string;
  label: string;
  entries: FacetEntry[];
};

export type CatalogFacets = {
  brand: FacetGroup;
  cpu: FacetGroup;
  ram: FacetGroup;
  storage: FacetGroup;
  gpu: FacetGroup;
  screenSize: FacetGroup;
  refreshRate: FacetGroup;
  priceRange: { min: number; max: number };
};

export type SpecFilter = {
  brand?: string[];
  cpu?: string[];
  ram?: string[];
  storage?: string[];
  gpu?: string[];
  screenSize?: string[];
  refreshRate?: string[];
  priceMin?: number | null;
  priceMax?: number | null;
};

export const EMPTY_FILTER: SpecFilter = {
  brand: [],
  cpu: [],
  ram: [],
  storage: [],
  gpu: [],
  screenSize: [],
  refreshRate: [],
  priceMin: null,
  priceMax: null,
};

export function countActiveFilterGroups(filter: SpecFilter): number {
  let count = 0;
  if (filter.brand && filter.brand.length > 0) count += 1;
  if (filter.cpu && filter.cpu.length > 0) count += 1;
  if (filter.ram && filter.ram.length > 0) count += 1;
  if (filter.storage && filter.storage.length > 0) count += 1;
  if (filter.gpu && filter.gpu.length > 0) count += 1;
  if (filter.screenSize && filter.screenSize.length > 0) count += 1;
  if (filter.refreshRate && filter.refreshRate.length > 0) count += 1;
  if (filter.priceMin != null || filter.priceMax != null) count += 1;
  return count;
}

export function isFilterEmpty(filter: SpecFilter): boolean {
  return countActiveFilterGroups(filter) === 0;
}
