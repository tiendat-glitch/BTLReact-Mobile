import { apiGet } from "./httpClient";

export type Promotion = {
  id: number | string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  target_type: "NONE" | "CATEGORY" | "PRODUCT" | "URL";
  target_value: string | null;
};

export async function getPromotions(): Promise<Promotion[]> {
  const payload = await apiGet("/promotions");
  return Array.isArray(payload.data) ? payload.data : [];
}

