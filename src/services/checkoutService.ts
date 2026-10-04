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

export type PaymentMethodCode = "COD" | "BANK_TRANSFER" | "MOMO" | "VNPAY";

export type VoucherValidation =
  | {
      valid: true;
      voucher: {
        id: number;
        code: string;
        name: string;
        description: string | null;
        discountType: "PERCENT" | "FIXED";
        discountValue: number;
        discountPreview: number;
        minOrder: number;
        maxDiscount: number | null;
        usageLimit: number | null;
        usedCount: number;
        remaining: number | null;
      };
    }
  | {
      valid: false;
      error: string;
      minOrder?: number;
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
  paymentMethod: PaymentMethodCode;
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

export type CheckoutOptions = {
  stores: Store[];
  shippingMethods: ShippingMethod[];
  specialRequests: SpecialRequestCode[];
};

const unwrapResponse = <T,>(body: T | { data: T }): T => {
  if (body && typeof body === "object" && "data" in body) {
    return body.data as T;
  }
  return body as T;
};

export async function getCheckoutOptions(): Promise<CheckoutOptions> {
  const { data } = await apiGet<CheckoutOptions | { data: CheckoutOptions }>(
    "/checkout/options",
  );
  return unwrapResponse(data);
}

export async function validateVoucher(
  code: string,
  subtotal: number,
): Promise<VoucherValidation> {
  const { data } = await apiPost<
    VoucherValidation | { data: VoucherValidation }
  >("/vouchers/validate", { code, subtotal });
  return unwrapResponse(data);
}

export async function getCheckoutQuote(
  input: CheckoutInput,
): Promise<CheckoutQuote> {
  const { data } = await apiPost<CheckoutQuote | { data: CheckoutQuote }>(
    "/checkout/quote",
    input,
  );
  return unwrapResponse(data);
}

export async function createCheckoutOrder(
  input: CheckoutInput,
  idempotencyKey: string,
) {
  const { data } = await apiPost<unknown | { data: unknown }>(
    "/orders",
    { ...input, idempotencyKey },
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
  return unwrapResponse(data);
}