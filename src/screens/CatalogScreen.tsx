import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Search from "lucide-react-native/icons/search";
import SlidersHorizontal from "lucide-react-native/icons/sliders-horizontal";
import X from "lucide-react-native/icons/x";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import ProductCard from "../components/ProductCard";
import colors from "../constants/colors";
import { useCart } from "../context/CartContext";
import usePaginatedCatalog from "../hooks/usePaginatedCatalog";
import { getCatalogCategories } from "../services/catalogApiService";
import type { CatalogCategory, CatalogProduct } from "../types/catalog";
import type { MainTabParamList } from "../navigation/AppNavigator";

type Props = BottomTabScreenProps<MainTabParamList, "Catalog">;

type CartActions = {
  addToCart: (product: CatalogProduct, quantity?: number) => Promise<boolean>;
};

export default function CatalogScreen({ navigation, route }: Props) {
  const { addToCart } = useCart() as CartActions;
  const [categories, setCategories] = useState<CatalogCategory[]>([
    { id: "all", name: "Tất cả", emoji: "✨", slug: "all" },
  ]);
  const [query, setQuery] = useState(route.params?.initialQuery || "");
  const [category, setCategory] = useState("all");
  const catalog = usePaginatedCatalog(query, category);
  const filteredProducts = catalog.products;

  useEffect(() => {
    let active = true;
    getCatalogCategories()
      .then((items) => {
        if (active) setCategories(items);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (route.params?.initialQuery !== undefined) {
      setQuery(route.params.initialQuery);
    }
    if (route.params?.category) {
      const requested = route.params.category;
      const match = categories.find(
        (item) =>
          item.id === requested ||
          item.slug === requested ||
          item.name === requested
      );
      if (match) setCategory(match.id);
    }
  }, [route.params?.initialQuery, route.params?.category, categories]);

  const addProduct = async (product: CatalogProduct) => {
    const added = await addToCart(product);
    if (!added) {
      Alert.alert("Không thể thêm vào giỏ", "Vui lòng kiểm tra tồn kho và thử lại.");
    }
  };

  if (catalog.isLoading && filteredProducts.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.stateText}>Đang tải catalog...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.variantId}
        numColumns={2}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.content}
        refreshing={catalog.isRefreshing}
        onRefresh={catalog.refresh}
        onEndReached={catalog.loadMore}
        onEndReachedThreshold={0.35}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={styles.headingRow}>
              <View>
                <Text style={styles.eyebrow}>CATALOG</Text>
                <Text style={styles.heading}>Tìm đúng thiết bị</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{catalog.pagination.total}</Text>
              </View>
            </View>

            <View style={styles.searchBox}>
              <Search color={colors.gray} size={20} />
              <TextInput
                style={styles.input}
                value={query}
                onChangeText={setQuery}
                placeholder="Tên, thương hiệu hoặc SKU"
                placeholderTextColor={colors.muted}
                returnKeyType="search"
                accessibilityLabel="Tìm kiếm catalog"
              />
              {query ? (
                <Pressable
                  style={styles.clearButton}
                  onPress={() => setQuery("")}
                  accessibilityRole="button"
                  accessibilityLabel="Xóa từ khóa"
                >
                  <X color={colors.gray} size={18} />
                </Pressable>
              ) : (
                <SlidersHorizontal color={colors.primary} size={19} />
              )}
            </View>

            <FlatList
              horizontal
              data={categories}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => {
                const selected = category === item.id;
                return (
                  <Pressable
                    style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                    onPress={() => setCategory(item.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.categoryLabel, selected && styles.categoryLabelSelected]}>
                      {item.name}
                    </Text>
                  </Pressable>
                );
              }}
            />

            {catalog.error ? (
              <Pressable style={styles.errorBox} onPress={() => catalog.retry()}>
                <Text style={styles.errorText}>{catalog.error.message}</Text>
                <Text style={styles.retryText}>Chạm để thử lại</Text>
              </Pressable>
            ) : null}
          </>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onAdd={() => addProduct(item)}
            onPress={() => navigation.getParent()?.navigate("ProductDetail", { product: item })}
          />
        )}
        ListFooterComponent={
          catalog.isLoadingMore ? (
            <ActivityIndicator style={styles.footerLoader} color={colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Search color={colors.muted} size={30} />
            <Text style={styles.emptyTitle}>Không có sản phẩm phù hợp</Text>
            <Text style={styles.stateText}>Thử từ khóa ngắn hơn hoặc chọn danh mục khác.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 28 },
  columns: { justifyContent: "space-between" },
  headingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "900" },
  heading: { color: colors.text, fontSize: 24, fontWeight: "900", marginTop: 3 },
  countBadge: { minWidth: 42, height: 32, borderRadius: 8, backgroundColor: colors.surfaceMuted, alignItems: "center", justifyContent: "center" },
  countText: { color: colors.text, fontSize: 12, fontWeight: "800" },
  searchBox: { minHeight: 52, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, marginTop: 18 },
  input: { flex: 1, color: colors.text, fontSize: 14, paddingHorizontal: 10, paddingVertical: 0 },
  clearButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  categoryList: { paddingVertical: 14, gap: 8 },
  categoryChip: { minHeight: 40, justifyContent: "center", backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14 },
  categoryChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryLabel: { color: colors.gray, fontSize: 12, fontWeight: "700" },
  categoryLabelSelected: { color: colors.white },
  errorBox: { backgroundColor: colors.redLight, borderColor: "#FECACA", borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { color: colors.red, fontSize: 12 },
  retryText: { color: colors.primary, fontSize: 11, fontWeight: "800", marginTop: 5 },
  empty: { alignItems: "center", paddingVertical: 64, paddingHorizontal: 28 },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 10 },
  stateText: { color: colors.gray, fontSize: 12, lineHeight: 18, marginTop: 7, textAlign: "center" },
  footerLoader: { marginVertical: 18 },
});
