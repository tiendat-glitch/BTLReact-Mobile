import { apiGet, apiPost } from "./httpClient";
import type { ComponentType, PcComponent } from "./pcBuilderService";

export type CustomBuildItem = {
  componentType: ComponentType;
  productVariantId: number | string;
  quantity: number;
};

export type CustomBuild = {
  id: number;
  name: string | null;
  status: "DRAFT" | "SUBMITTED" | "CHECKED_OUT";
  created_at: string;
  updated_at: string;
  items: Array<{
    id: number;
    component_type: ComponentType;
    product_variant_id: number;
    quantity: number;
    product_name?: string;
    variant_name?: string;
    price?: number;
  }>;
};

export const listCustomBuilds = async (): Promise<CustomBuild[]> => {
  const { data } = await apiGet<CustomBuild[]>("/custom-builds");
  return Array.isArray(data) ? data : [];
};

export const getCustomBuild = async (id: number): Promise<CustomBuild> => {
  const { data } = await apiGet<CustomBuild>(`/custom-builds/${id}`);
  return data;
};

export const createCustomBuild = async (
  name: string,
  items: CustomBuildItem[],
): Promise<{ id: number }> => {
  const { data } = await apiPost<{ id: number }>("/custom-builds", {
    name,
    items,
  });
  return data;
};

export type SaveSelectionInput = {
  selections: Partial<Record<ComponentType, PcComponent>>;
  name: string;
};

export const saveSelectionsAsBuild = async ({
  selections,
  name,
}: SaveSelectionInput): Promise<{ id: number }> => {
  const items: CustomBuildItem[] = Object.entries(selections)
    .filter(([, v]) => Boolean(v))
    .map(([componentType, product]) => ({
      componentType: componentType as ComponentType,
      productVariantId: Number(product?.variantId),
      quantity: 1,
    }));
  return createCustomBuild(name, items);
};