export const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

export const formatDateTime = (value) => {
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

export const formatAddress = (address) =>
  [address.address_line, address.ward, address.district, address.province]
    .filter(Boolean)
    .join(", ");

