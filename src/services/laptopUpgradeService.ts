import { apiGet, apiPost } from "./httpClient";

export type UpgradeOption = {
  id: number | string;
  type: "RAM" | "SSD";
  label: string;
  capacity_gb: number;
  price_delta: number | string;
};

export type UpgradeProfile = {
  product_id: number | string;
  base_ram_gb: number;
  max_ram_gb: number;
  ram_type: string;
  ram_slots: number;
  base_storage_gb: number;
  max_storage_gb: number;
  storage_slots: number;
};

export type UpgradeValidation = {
  valid: boolean;
  configuration: {
    kind: "LAPTOP_UPGRADE";
    ram: UpgradeOption | null;
    ssd: UpgradeOption | null;
  };
  configurationKey: string;
  priceAdjustment: number;
  unitPrice: number;
};

export async function getLaptopUpgradeOptions(productId: string): Promise<{
  profile: UpgradeProfile;
  options: UpgradeOption[];
}> {
  return (await apiGet(`/laptops/${productId}/upgrades`)).data;
}

export async function validateLaptopUpgrade(
  productId: string,
  data: {
    productVariantId: string;
    ramOptionId?: number | string;
    ssdOptionId?: number | string;
  }
): Promise<UpgradeValidation> {
  return (await apiPost(`/laptops/${productId}/upgrade/validate`, data)).data;
}

