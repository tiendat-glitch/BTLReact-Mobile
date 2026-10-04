import React from "react";
import { StyleSheet, Text, View } from "react-native";

import colors from "../constants/colors";
import typography from "../constants/typography";
import { formatCurrency } from "../utils/formatters";

type Props = {
  price: number;
  oldPrice?: number;
  size?: "sm" | "md" | "lg";
  emphasize?: boolean;
};

export default function PriceText({ price, oldPrice, size = "md", emphasize }: Props) {
  const hasDiscount = (oldPrice ?? 0) > price && (oldPrice ?? 0) > 0;
  const discount = hasDiscount
    ? Math.round(((oldPrice! - price) / oldPrice!) * 100)
    : 0;

  const primary = priceStyle(size, emphasize);
  const muted = mutedStyle(size);

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={[primary, emphasize ? styles.primaryEmphasized : null]}>{formatCurrency(price)}</Text>
        {hasDiscount ? (
          <Text style={[muted, styles.strike]}>{formatCurrency(oldPrice!)}</Text>
        ) : null}
      </View>
      {hasDiscount ? (
        <View style={styles.discount}>
          <Text style={styles.discountText}>-{discount}%</Text>
        </View>
      ) : null}
    </View>
  );
}

function priceStyle(size: Props["size"], emphasize?: boolean) {
  switch (size) {
    case "sm":
      return emphasize ? styles.priceSmEmphasized : styles.priceSm;
    case "lg":
      return styles.priceLg;
    case "md":
    default:
      return emphasize ? styles.priceMdEmphasized : styles.priceMd;
  }
}

function mutedStyle(size: Props["size"]) {
  return size === "lg" ? styles.mutedOldLg : styles.mutedOld;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  left: { flex: 1 },
  priceSm: { ...typography.captionStrong, color: colors.primary },
  priceSmEmphasized: { ...typography.smallStrong, color: colors.primary },
  priceMd: { ...typography.priceMd, color: colors.primary },
  priceMdEmphasized: { ...typography.h3, color: colors.primary },
  priceLg: { ...typography.priceLg, color: colors.primary },
  mutedOld: { ...typography.caption, color: colors.muted },
  mutedOldLg: { ...typography.small, color: colors.muted },
  strike: { textDecorationLine: "line-through", marginTop: 2 },
  primaryEmphasized: {},
  discount: {
    backgroundColor: colors.redLight,
    borderRadius: colors.radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  discountText: { ...typography.micro, color: colors.red },
});