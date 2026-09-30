import { apiGet, apiPost } from "./httpClient";

export type Review = {
  id: number | string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
  verified_purchase: boolean | number;
};

export type EligibleOrderItem = {
  order_item_id: number | string;
  variant_name: string;
  sku: string;
  order_id: number | string;
  order_code: string;
  created_at: string;
};

export type ReviewPage = {
  items: Review[];
  total: number;
  average: number;
  page: number;
  limit: number;
};

export async function getProductReviews(productId: string): Promise<ReviewPage> {
  return (await apiGet(`/products/${productId}/reviews`)).data;
}

export async function getReviewEligibility(productId: string): Promise<EligibleOrderItem[]> {
  const payload = await apiGet(`/products/${productId}/review-eligibility`);
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function submitReview(
  productId: string,
  data: { orderItemId: number | string; rating: number; comment: string }
) {
  return (await apiPost(`/products/${productId}/reviews`, data)).data;
}

