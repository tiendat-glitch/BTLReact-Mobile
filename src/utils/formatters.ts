export const formatCurrency = (value: number | string | null | undefined): string =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

export const formatDateTime = (
  value: string | number | Date | null | undefined,
): string => {
  if (!value) return "--";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "--"
    : date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

type AddressLike = {
  address_line?: string | null;
  ward?: string | null;
  district?: string | null;
  province?: string | null;
};

export const formatAddress = (address: AddressLike | null | undefined): string =>
  [address?.address_line, address?.ward, address?.district, address?.province]
    .filter(Boolean)
    .join(", ");
