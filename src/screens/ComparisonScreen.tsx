import React, { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Trash2 from "lucide-react-native/icons/trash";

import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import { useCompare } from "../context/CompareContext";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { formatCurrency } from "../utils/formatters";

type Props = NativeStackScreenProps<RootStackParamList, "Comparison">;

export default function ComparisonScreen({ navigation }: Props) {
  const { products, removeProduct, clear } = useCompare();
  const rows = useMemo(() => {
    const labels = new Set<string>();
    products.forEach((product) => product.specs.forEach((_, index) => labels.add(`Thông số ${index + 1}`)));
    return [
      { label: "Giá", values: products.map((item) => formatCurrency(item.price)) },
      { label: "Tồn kho", values: products.map((item) => `${item.stockQuantity}`) },
      { label: "Bảo hành", values: products.map((item) => `${item.warrantyMonths} tháng`) },
      ...[...labels].map((label, index) => ({
        label,
        values: products.map((item) => item.specs[index] || "--"),
      })),
    ];
  }, [products]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="So sánh sản phẩm"
        navigation={navigation}
        action={products.length ? (
          <TouchableOpacity onPress={clear} accessibilityLabel="Xóa danh sách so sánh">
            <Trash2 color={colors.red} size={20} />
          </TouchableOpacity>
        ) : null}
      />
      {!products.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Chưa có sản phẩm để so sánh</Text>
          <Text style={styles.emptyText}>Mở chi tiết sản phẩm và chọn “Thêm so sánh”.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.productHeaderRow}>
                <View style={styles.labelCell} />
                {products.map((product) => (
                  <View key={product.id} style={styles.productHeader}>
                    {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="contain" /> : <Text style={styles.emoji}>{product.emoji}</Text>}
                    <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                    <TouchableOpacity style={styles.remove} onPress={() => removeProduct(product.id)}>
                      <Text style={styles.removeText}>Bỏ</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              {rows.map((row, rowIndex) => {
                const different = new Set(row.values).size > 1;
                return (
                  <View key={row.label} style={[styles.tableRow, rowIndex % 2 === 1 && styles.tableRowAlt]}>
                    <View style={styles.labelCell}><Text style={styles.label}>{row.label}</Text></View>
                    {row.values.map((value, index) => (
                      <View key={`${row.label}-${products[index].id}`} style={[styles.valueCell, different && styles.different]}>
                        <Text style={styles.value}>{value}</Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 12, paddingBottom: 32 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: "900" },
  emptyText: { color: colors.gray, fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 7 },
  productHeaderRow: { flexDirection: "row", backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, overflow: "hidden" },
  labelCell: { width: 105, minHeight: 62, padding: 10, justifyContent: "center" },
  productHeader: { width: 150, minHeight: 190, alignItems: "center", justifyContent: "center", borderLeftColor: colors.border, borderLeftWidth: 1, padding: 10 },
  image: { width: 100, height: 90 },
  emoji: { fontSize: 52 },
  productName: { color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: "800", textAlign: "center", marginTop: 7 },
  remove: { minHeight: 36, justifyContent: "center", paddingHorizontal: 12 },
  removeText: { color: colors.red, fontSize: 10, fontWeight: "800" },
  tableRow: { flexDirection: "row", borderBottomColor: colors.border, borderBottomWidth: 1, backgroundColor: colors.white },
  tableRowAlt: { backgroundColor: colors.surfaceMuted },
  valueCell: { width: 150, minHeight: 62, justifyContent: "center", borderLeftColor: colors.border, borderLeftWidth: 1, padding: 10 },
  different: { backgroundColor: colors.accentLight },
  label: { color: colors.gray, fontSize: 11, fontWeight: "800" },
  value: { color: colors.text, fontSize: 11, lineHeight: 17 },
});

