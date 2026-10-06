import { adaptCatalogRows } from "../data/catalogAdapter";
import type { CatalogProduct } from "../types/catalog";
import { apiGet, apiPost } from "./httpClient";

export type ComponentType =
  | "CPU"
  | "MAINBOARD"
  | "RAM"
  | "GPU"
  | "STORAGE"
  | "PSU"
  | "CASE"
  | "COOLER";

export type PcComponent = CatalogProduct & {
  componentType: ComponentType;
  socket: string | null;
  memoryType: string | null;
  recommendedPsuWatts: number | null;
  psuWatts: number | null;
  lengthMm: number | null;
  maxGpuLengthMm: number | null;
};

type RawComponent = Record<string, unknown> & {
  component_type: ComponentType;
  socket: string | null;
  memory_type: string | null;
  recommended_psu_watts: number | null;
  psu_watts: number | null;
  length_mm: number | null;
  max_gpu_length_mm: number | null;
};

export type BuildValidation = {
  compatible: boolean;
  complete: boolean;
  missingTypes: ComponentType[];
  issues: Array<{ code: string; message: string }>;
  estimatedTotal: number;
};

const unwrapData = <T,>(payload: T | { data: T } | null | undefined): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>)
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export async function getPcBuilderOptions(): Promise<
  Record<ComponentType, PcComponent[]>
> {
  const { data } = await apiGet<
    | Record<ComponentType, RawComponent[]>
    | { data: Record<ComponentType, RawComponent[]> }
  >("/pc-builder/options");
  const grouped = unwrapData(data) || ({} as Record<ComponentType, RawComponent[]>);
  const result = {} as Record<ComponentType, PcComponent[]>;
  Object.entries(grouped).forEach(([type, rows]) => {
    if (!Array.isArray(rows)) return;
    const products = adaptCatalogRows(rows) as CatalogProduct[];
    result[type as ComponentType] = products.map((product, index) => {
      const raw = rows[index] as RawComponent;
      return {
        ...product,
        componentType: raw.component_type,
        socket: raw.socket,
        memoryType: raw.memory_type,
        recommendedPsuWatts: raw.recommended_psu_watts,
        psuWatts: raw.psu_watts,
        lengthMm: raw.length_mm,
        maxGpuLengthMm: raw.max_gpu_length_mm,
      };
    });
  });
  return result;
}

export async function validatePcBuild(
  selections: Partial<Record<ComponentType, PcComponent>>,
): Promise<BuildValidation> {
  const items = Object.entries(selections).map(([componentType, product]) => ({
    componentType,
    productVariantId: product?.variantId,
    quantity: 1,
  }));
  const { data } = await apiPost<BuildValidation | { data: BuildValidation }>(
    "/pc-builder/validate",
    { items },
  );
  return unwrapData(data);
}
