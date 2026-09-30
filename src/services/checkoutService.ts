import { apiGet, apiPost } from "./httpClient";

export type FulfillmentMethod = "DELIVERY" | "PICKUP";
export type SpecialRequestCode =
  | "AFTER_HOURS"
  | "CALL_BEFORE_DELIVERY"
  | "CAREFUL_PACKAGING"
  | "SMS_ONLY"
  | "INSPECT_BEFORE_RECEIVING";

export type Store = {
  id: number | string;
  code: string;
  name: string;
  address_line: string;
  ward: string | null;
  district: string | null;
  province: string;
  phone: string;
  opening_hours: string | null;
};

export type ShippingMethod = {
  id: number | string;
  code: string;
  name: string;
  description: string | null;
  eta_min_days: number;
  eta_max_days: number;
  base_fee: number | string;
  free_shipping_threshold: number | string | null;
};

export type CheckoutInput = {
  fulfillmentMethod: FulfillmentMethod;
  addressId?: number | string;
  pickupStoreId?: number | string;
  shippingMethodCode?: string;
  recipientName?: string;
  recipientPhone?: string;
  specialRequests: SpecialRequestCode[];
  voucherCode?: string;
  note?: string;
  paymentMethod: "COD";
};

export type CheckoutQuote = {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  voucherCode: string | null;
  fulfillmentMethod: FulfillmentMethod;
  shippingMethod: ShippingMethod | null;
  pickupStore: Store | null;
};

export async function getCheckoutOptions(): Promise<{
  stores: Store[];
  shippingMethods: ShippingMethod[];
  specialRequests: SpecialRequestCode[];
}> {
  return (await apiGet("/checkout/options")).data;
}

export async function getCheckoutQuote(input: CheckoutInput): Promise<CheckoutQuote> {
  return (await apiPost("/checkout/quote", input)).data;
}

export async function createCheckoutOrder(
  input: CheckoutInput,
  idempotencyKey: string
) {
  return (
    await apiPost(
      "/orders",
      { ...input, idempotencyKey },
      { headers: { "Idempotency-Key": idempotencyKey } }
    )
  ).data;
}

