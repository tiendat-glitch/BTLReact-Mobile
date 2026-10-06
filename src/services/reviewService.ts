import { apiGet, apiPost } from "./httpClient";

export type Review = {
  id: number | string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
  verified_purchase: boolean | number;
};

export type ReviewBreakdownEntry = {
  rating: number;
  count: number;
  percent: number;
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
  breakdown?: ReviewBreakdownEntry[];
};

const unwrapData = <T,>(payload: T | { data: T }): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }
  return payload as T;
};

export type GetReviewsOptions = {
  page?: number;
  limit?: number;
  /** Lọc theo mức rating cụ thể (1..5). Bỏ trống hoặc undefined = tất cả. */
  rating?: number;
};

export async function getProductReviews(
  productId: string,
  options: GetReviewsOptions = {},
): Promise<ReviewPage> {
  const params: Record<string, string> = {};
  if (options.page) params.page = String(options.page);
  if (options.limit) params.limit = String(options.limit);
  if (options.rating) params.rating = String(options.rating);
  const { data } = await apiGet<ReviewPage | { data: ReviewPage }>(
    `/products/${productId}/reviews`,
    { params },
  );
  return unwrapData(data);
}

export async function getReviewEligibility(
  productId: string,
): Promise<EligibleOrderItem[]> {
  const { data } = await apiGet<
    EligibleOrderItem[] | { data: EligibleOrderItem[] }
  >(
    `/products/${productId}/review-eligibility`,
  );
  const items = unwrapData(data);
  return Array.isArray(items) ? items : [];
}

export async function submitReview(
  productId: string,
  data: { orderItemId: number | string; rating: number; comment: string },
) {
  const result = await apiPost<unknown | { data: unknown }>(
    `/products/${productId}/reviews`,
    { ...data, productId },
  );
  return unwrapData(result.data);
}