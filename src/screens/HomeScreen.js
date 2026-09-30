import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import SearchBar from "../components/SearchBar";
import CategoryItem from "../components/CategoryItem";
import ProductCard from "../components/ProductCard";
import PromotionCarousel from "../components/PromotionCarousel";

import useCatalog from "../hooks/useCatalog";

import colors from "../constants/colors";
import { useCart } from "../context/CartContext";
import { getPromotions } from "../services/promotionService";

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [promotions, setPromotions] = useState([]);

  const {
    products,
    categories,
    isLoading,
    isRefreshing,
    error,
    retry,
    refresh,
  } = useCatalog();
  const { cartCount, addToCart } = useCart();
  const featuredProducts = products.slice(0, 8);

  useEffect(() => {
    let active = true;
    getPromotions()
      .then((items) => {
        if (active) setPromotions(items);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.locationLabel}>CỬA HÀNG TRỰC TUYẾN</Text>

            <View>
              <Text style={styles.location}>BTL Computer Store</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate("Cart")}
            accessibilityRole="button"
            accessibilityLabel={`Mở giỏ hàng, ${cartCount} sản phẩm`}
          >
            <Text style={styles.cartIcon}>🛒</Text>

            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* SEARCH */}

        <View style={styles.searchWrapper}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() =>
              navigation.navigate("Catalog", { initialQuery: query })
            }
          />
        </View>

        <View style={styles.promotionWrapper}>
          <PromotionCarousel
            promotions={promotions}
            onPress={(promotion) => {
              if (promotion.target_type === "CATEGORY") {
                navigation.navigate("Catalog", {
                  category: promotion.target_value,
                });
              }
            }}
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải danh mục sản phẩm...</Text>
          </View>
        ) : error && products.length === 0 ? (
          <View style={styles.errorState}>
            <Text style={styles.errorTitle}>Chưa kết nối được cửa hàng</Text>
            <Text style={styles.errorText}>{error.message}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => retry()}
              accessibilityRole="button"
              accessibilityLabel="Thử tải lại danh mục"
            >
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {error && (
              <View style={styles.refreshError}>
                <Text style={styles.refreshErrorText}>{error.message}</Text>
              </View>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Khám phá danh mục</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Catalog")}
                accessibilityRole="button"
              >
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryList}
            >
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  selected={category.name === "Tất cả"}
                  onPress={() =>
                    navigation.navigate("Catalog", {
                      category:
                        category.id === "all" ? undefined : category.id,
                    })
                  }
                />
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
                <Text style={styles.sectionSubTitle}>
                  Dữ liệu sản phẩm đang hoạt động từ cửa hàng
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("Catalog")}
                accessibilityRole="button"
              >
                <Text style={styles.seeAll}>Xem thêm</Text>
              </TouchableOpacity>
            </View>

            {featuredProducts.length > 0 ? (
              <View style={styles.productGrid}>
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={async () => {
                      const added = await addToCart(product);
                      if (!added) {
                        Alert.alert(
                          "Không thể thêm vào giỏ",
                          "Vui lòng kiểm tra tồn kho và thử lại."
                        );
                      }
                    }}
                    onPress={() =>
                      navigation.navigate("ProductDetail", {
                        product,
                      })
                    }
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>⌕</Text>
                <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
                <Text style={styles.emptyText}>
                  Thử từ khóa khác hoặc chọn một danh mục khác.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  locationLabel: {
    fontSize: 11,
    color: colors.gray,
  },

  location: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginTop: 3,
  },

  cartButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  cartIcon: {
    fontSize: 22,
  },

  badge: {
    position: "absolute",
    right: -2,
    top: -4,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
  },

  searchWrapper: {
    marginTop: 18,
  },

  promotionWrapper: {
    marginTop: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: colors.text,
  },

  sectionSubTitle: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 3,
  },

  seeAll: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  categoryList: {
    marginHorizontal: -2,
  },

  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  loadingState: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: colors.gray,
    fontSize: 13,
    marginTop: 12,
  },

  errorState: {
    backgroundColor: colors.white,
    borderRadius: colors.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 24,
    padding: 24,
    alignItems: "center",
  },

  errorTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },

  errorText: {
    color: colors.gray,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    textAlign: "center",
  },

  retryButton: {
    minHeight: 44,
    backgroundColor: colors.primary,
    borderRadius: colors.radius.sm,
    justifyContent: "center",
    marginTop: 16,
    paddingHorizontal: 20,
  },

  retryText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "800",
  },

  refreshError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderRadius: colors.radius.sm,
    borderWidth: 1,
    marginTop: 16,
    padding: 12,
  },

  refreshErrorText: {
    color: colors.red,
    fontSize: 12,
    lineHeight: 17,
  },

  emptyState: {
    backgroundColor: colors.white,
    borderRadius: colors.radius.md,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyIcon: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: "800",
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 8,
  },

  emptyText: {
    color: colors.gray,
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },

});
