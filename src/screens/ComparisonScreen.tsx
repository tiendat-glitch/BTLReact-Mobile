// @ts-nocheck
import React, { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GitCompareArrows from "lucide-react-native/icons/git-compare-arrows";
import Trash from "lucide-react-native/icons/trash";

import Button from "../components/Button";
import FeedbackState from "../components/FeedbackState";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import { useCompare } from "../context/CompareContext";
import { formatCurrency } from "../utils/formatters";

// Danh sách dòng so sánh — định nghĩa theo field CatalogProduct thật
const COMPARE_ROWS: ReadonlyArray<{
  label: string;
  get: (product: CatalogProduct) => string | number;
  numeric?: boolean; // dùng để highlight "tốt hơn"
}> = [
  { label: "Giá hiện tại", get: (p) => formatCurrency(p.price), numeric: true },
  { label: "Giá gốc", get: (p) => (p.oldPrice ? formatCurrency(p.oldPrice) : "--") },
  {
    label: "Tồn kho",
    get: (p) => (p.stockQuantity > 0 ? `${p.stockQuantity} sp` : "Hết hàng"),
    numeric: true,
  },
  {
    label: "Đã bán",
    get: (p) => (p.sold != null ? `${p.sold}` : "—"),
    numeric: true,
  },
  { label: "Bảo hành", get: (p) => `${p.warrantyMonths} tháng` },
  { label: "SKU", get: (p) => p.sku || "—" },
  { label: "Phiên bản", get: (p) => p.variantName || "—" },
];

const isBetterLower = (label: string) => label === "Giá hiện tại";

export default function ComparisonScreen({ navigation }) {
  const { products, removeProduct, clear } = useCompare();

  // Tính số giá trị khác biệt cho mỗi row
  const rows = useMemo(
    () =>
      COMPARE_ROWS.map((row) => ({
        label: row.label,
        numeric: row.numeric ?? false,
        rawValues: products.map((product) => row.get(product)),
        // đánh dấu giá trị "tốt nhất" trong nhóm (giá thấp nhất, tồn kho cao nhất...)
        bestIndex: (() => {
          if (!row.numeric || products.length < 2) return -1;
          const numericValues = products.map((product) => {
            const value = row.get(product);
            if (typeof value === "number") return value;
            const cleaned = String(value).replace(/[^\d.-]/g, "");
            return Number(cleaned);
          });
          if (numericValues.some((v) => !Number.isFinite(v))) return -1;
          if (isBetterLower(row.label)) {
            const min = Math.min(...numericValues);
            return numericValues.indexOf(min);
          }
          const max = Math.max(...numericValues);
          return numericValues.indexOf(max);
        })(),
      })),
    [products],
  );

  if (!products.length) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <ScreenHeader title="So sánh sản phẩm" navigation={navigation} />
        <FeedbackState
          variant="empty"
          title="Chưa có sản phẩm để so sánh"
          description="Mở chi tiết sản phẩm và chọn “Thêm so sánh”."
          fullScreen
        >
          <GitCompareArrows color={colors.muted} size={20} strokeWidth={1.6} />
        </FeedbackState>
      </SafeAreaView>
    );
  }

  const formatValue = (value: string | number) =>
    typeof value === "number" ? value.toLocaleString("vi-VN") : value;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScreenHeader
        title={`So sánh (${products.length})`}
        navigation={navigation}
        action={
          <Button
            variant="ghost"
            size="sm"
            fullWidth={false}
            label=""
            accessibilityLabel="Xóa danh sách so sánh"
            leadingIcon={(color) => (
              <Trash color={color} size={18} strokeWidth={2.2} />
            )}
            onPress={clear}
          />
        }
      />
      <Text style={styles.subtitle}>
        Các sản phẩm thuộc danh mục <Text style={styles.subtitleStrong}>{products[0].category}</Text>
      </Text>
      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            <View style={styles.productHeaderRow}>
              <View style={styles.labelCell}>
                <Text style={styles.headerLabel}>Sản phẩm</Text>
              </View>
              {products.map((product) => (
                <View key={product.id} style={styles.productHeader}>
                  {product.imageUrl ? (
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.emoji}>{product.emoji}</Text>
                  )}
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.brandText} numberOfLines={1}>
                    {product.brand}
                  </Text>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth={false}
                    label="Bỏ"
                    onPress={() => removeProduct(product.id)}
                  />
                </View>
              ))}
            </View>
            {rows.map((row, rowIndex) => {
              const different = new Set(row.rawValues).size > 1;
              return (
                <View
                  key={row.label}
                  style={[
                    styles.tableRow,
                    rowIndex % 2 === 1 && styles.tableRowAlt,
                    different && styles.tableRowDifferent,
                  ]}
                >
                  <View
                    style={[styles.labelCell, different && styles.labelCellDifferent]}
                  >
                    <Text style={styles.label}>{row.label}</Text>
                  </View>
                  {row.rawValues.map((value, index) => (
                    <View
                      key={`${row.label}-${products[index].id}`}
                      style={[
                        styles.valueCell,
                        different && styles.valueCellDifferent,
                        index === row.bestIndex && styles.valueCellBest,
                      ]}
                    >
                      <Text style={styles.value}>{formatValue(value)}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  subtitle: {
    ...typography.caption,
    color: colors.gray,
    paddingHorizontal: spacing.px16,
    paddingVertical: spacing.px8,
  },
  subtitleStrong: { color: colors.text, fontWeight: "700" },
  content: { padding: spacing.px12, paddingBottom: spacing.px32 },
  productHeaderRow: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    overflow: "hidden",
  },
  headerLabel: { ...typography.captionStrong, color: colors.text },
  labelCell: {
    width: 105,
    minHeight: 62,
    padding: spacing.px10,
    justifyContent: "center",
  },
  productHeader: {
    width: 160,
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    borderLeftColor: colors.border,
    borderLeftWidth: 1,
    padding: spacing.px10,
  },
  image: { width: 110, height: 100 },
  emoji: { fontSize: 52 },
  productName: {
    ...typography.smallStrong,
    color: colors.text,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 7,
  },
  brandText: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    backgroundColor: colors.white,
  },
  tableRowAlt: { backgroundColor: colors.surfaceMuted },
  tableRowDifferent: {},
  labelCellDifferent: {
    backgroundColor: colors.accentLight,
  },
  valueCell: {
    width: 160,
    minHeight: 62,
    justifyContent: "center",
    borderLeftColor: colors.border,
    borderLeftWidth: 1,
    padding: spacing.px10,
  },
  valueCellDifferent: { backgroundColor: colors.accentLight },
  valueCellBest: {
    borderWidth: 2,
    borderColor: colors.success,
    backgroundColor: "#fff",
  },
  label: {
    ...typography.captionStrong,
    color: colors.gray,
  },
  value: {
    ...typography.caption,
    color: colors.text,
    lineHeight: 17,
  },
});