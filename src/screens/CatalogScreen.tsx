// CatalogScreen — Hero với search + filter + category rail, grid 2 cột, FAB filter.
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { SafeAreaView } from "react-native-safe-area-context";

import FeedbackState from "../components/FeedbackState";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import SpecFilterSheet from "../components/SpecFilterSheet";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import { useCart } from "../context/CartContext";
import useCompareAction from "../hooks/useCompareAction";
import usePaginatedCatalog from "../hooks/usePaginatedCatalog";
import { getCatalogCategories } from "../services/catalogApiService";
import { cacheProduct } from "../services/productCache";
import {
  EMPTY_FILTER,
  countActiveFilterGroups,
  isFilterEmpty,
  type SpecFilter,
} from "../types/specFilter";

export default function CatalogScreen({ navigation, route }: any) {
  const { addToCart } = useCart();
  const compare = useCompareAction();
  const [categories, setCategories] = useState([
    { id: "all", name: "Tất cả", slug: "all" },
  ]);
  const [query, setQuery] = useState(route.params?.initialQuery || "");
  const [category, setCategory] = useState("all");
  const [filter, setFilter] = useState<SpecFilter>(EMPTY_FILTER);
  const [filterVisible, setFilterVisible] = useState(false);

  const catalog = usePaginatedCatalog(query, category, filter);
  const filteredProducts = catalog.products;
  const activeFilterCount = useMemo(
    () => countActiveFilterGroups(filter),
    [filter],
  );

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
        (item: any) =>
          item.id === requested ||
          item.slug === requested ||
          item.name === requested,
      );
      if (match) setCategory(match.id);
    }
  }, [route.params?.initialQuery, route.params?.category, categories]);

  const addProduct = async (product: any) => {
    await addToCart(product as any);
  };

  const handleApplyFilter = (next: SpecFilter) => {
    setFilter(next);
    setFilterVisible(false);
  };

  if (catalog.isLoading && filteredProducts.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <HeaderHero
          query={query}
          setQuery={setQuery}
          onFilter={() => setFilterVisible(true)}
          activeFilterCount={activeFilterCount}
        />
        <View style={styles.categoryRow}>
          {categories.map((c: any) => (
            <CategoryChip
              key={c.id}
              label={c.name}
              selected={category === c.id}
              onPress={() => setCategory(c.id)}
            />
          ))}
        </View>
        <FeedbackState
          variant="loading"
          title="Đang tải catalog..."
          fullScreen
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
          <View style={styles.headerWrap}>
            <HeaderHero
              query={query}
              setQuery={setQuery}
              onFilter={() => setFilterVisible(true)}
              activeFilterCount={activeFilterCount}
            />

            {activeFilterCount > 0 ? (
              <View style={styles.activeFilterRow}>
                <View style={styles.filterPill}>
                  <Text style={styles.filterPillText} numberOfLines={1}>
                    {activeFilterCount} bộ lọc đang áp dụng
                  </Text>
                </View>
                <Pressable
                  onPress={() => setFilter(EMPTY_FILTER)}
                  accessibilityRole="button"
                  style={styles.clearFilterBtn}
                >
                  <Text style={styles.clearFilterText}>Xoá</Text>
                </Pressable>
              </View>
            ) : null}

            <FlatList
              horizontal
              data={categories}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }: any) => {
                const selected = category === item.id;
                return (
                  <CategoryChip
                    label={item.name}
                    selected={selected}
                    onPress={() => setCategory(item.id)}
                  />
                );
              }}
            />

            {catalog.error ? (
              <Pressable
                style={styles.errorBox}
                onPress={() => catalog.retry()}
              >
                <Text style={styles.errorText}>
                  {catalog.error.message}
                </Text>
                <Text style={styles.retryText}>Chạm để thử lại</Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }: any) => (
          <ProductCard
            product={item}
            onAdd={() => addProduct(item)}
            onCompare={() => compare.toggle(item)}
            inCompare={compare.hasProduct(item.id)}
            onPress={() => {
              cacheProduct(item);
              navigation
                .getParent()
                ?.navigate("ProductDetail", { productId: item.id });
            }}
          />
        )}
        ListFooterComponent={
          catalog.isLoadingMore ? (
            <ActivityIndicator
              style={styles.footerLoader}
              color={colors.primary}
            />
          ) : null
        }
        ListEmptyComponent={
          !catalog.isLoading ? (
            <FeedbackState
              variant="empty"
              title="Không có sản phẩm phù hợp"
              description={
                isFilterEmpty(filter)
                  ? "Thử từ khoá ngắn hơn hoặc chọn danh mục khác."
                  : "Bỏ bớt tiêu chí lọc để thấy thêm sản phẩm."
              }
            />
          ) : null
        }
      />

      <SpecFilterSheet
        visible={filterVisible}
        facets={catalog.facets}
        initial={filter}
        onClose={() => setFilterVisible(false)}
        onApply={handleApplyFilter}
      />
    </SafeAreaView>
  );
}

function HeaderHero({
  query,
  setQuery,
  onFilter,
  activeFilterCount,
}: {
  query: string;
  setQuery: (v: string) => void;
  onFilter: () => void;
  activeFilterCount: number;
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        <View style={styles.heroHeading}>
          <Text style={styles.eyebrow}>CATALOG</Text>
          <Text style={styles.heading}>Tìm đúng thiết bị bạn cần</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search color={colors.gray} size={20} strokeWidth={2.2} />
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
              <X color={colors.gray} size={18} strokeWidth={2.4} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.filterButton,
            activeFilterCount > 0 ? styles.filterButtonActive : null,
            pressed ? styles.pressed : null,
          ]}
          onPress={onFilter}
          accessibilityRole="button"
          accessibilityLabel="Mở bộ lọc thông số"
        >
          <SlidersHorizontal
            color={
              activeFilterCount > 0 ? colors.white : colors.primary
            }
            size={20}
            strokeWidth={2.4}
          />
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {activeFilterCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

function CategoryChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.categoryChip,
        selected ? styles.categoryChipSelected : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text
        style={[
          styles.categoryLabel,
          selected ? styles.categoryLabelSelected : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.px16,
    paddingTop: spacing.px4,
    paddingBottom: spacing.px56,
  },
  headerWrap: {
    paddingHorizontal: spacing.px16,
  },
  columns: { justifyContent: "space-between" },
  hero: {
    paddingTop: spacing.px8,
    paddingBottom: spacing.px4,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.px8,
    gap: spacing.px12,
  },
  heroHeading: { flex: 1, minWidth: 0 },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
    marginTop: 4,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px10,
    marginTop: spacing.px8,
  },
  searchBox: {
    flex: 1,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.lg,
    paddingHorizontal: spacing.px14,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingHorizontal: spacing.px10,
    paddingVertical: 0,
    margin: 0,
  },
  clearButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButton: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: colors.radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    position: "relative",
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  filterBadgeText: {
    ...typography.micro,
    color: colors.white,
  },
  activeFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px10,
    marginTop: spacing.px12,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: colors.radius.pill,
  },
  filterPillText: {
    ...typography.captionStrong,
    color: colors.primary,
  },
  clearFilterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearFilterText: {
    ...typography.captionStrong,
    color: colors.danger,
  },
  categoryList: { paddingVertical: spacing.px12, gap: spacing.px8 },
  categoryChip: {
    minHeight: 40,
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.pill,
    paddingHorizontal: spacing.px16,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryLabel: {
    ...typography.captionStrong,
    color: colors.gray,
  },
  categoryLabelSelected: { color: colors.white },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: spacing.px16,
    paddingBottom: spacing.px12,
  },
  errorBox: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.dangerSoft,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    marginBottom: spacing.px12,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
  },
  retryText: {
    ...typography.captionStrong,
    color: colors.primary,
    marginTop: 4,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  footerLoader: { marginVertical: spacing.px18 },
});
