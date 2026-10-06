// HomeScreen — entry point của app, tối ưu cho màn ~412dp (iQOO Z10 Turbo+).
// Bố cục:
//   1. Header (greeting + brand + cart/notification pill)
//   2. Search bar floating
//   3. Banner khuyến mãi
//   4. Quick access (3 ô tone riêng)
//   5. Category rail (pill tròn)
//   6. Sản phẩm nổi bật (grid 2 cột)
//   7. CTA banner xây dựng PC
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Bell from "lucide-react-native/icons/bell";
import ShoppingCart from "lucide-react-native/icons/shopping-cart";
import Sparkles from "lucide-react-native/icons/sparkles";
import Laptop from "lucide-react-native/icons/laptop";
import Monitor from "lucide-react-native/icons/monitor";
import Cpu from "lucide-react-native/icons/cpu";
import Headphones from "lucide-react-native/icons/headphones";
import Keyboard from "lucide-react-native/icons/keyboard";
import Smartphone from "lucide-react-native/icons/smartphone";
import Zap from "lucide-react-native/icons/zap";
import Wrench from "lucide-react-native/icons/wrench";
import ShieldCheck from "lucide-react-native/icons/shield-check";
import ChevronRight from "lucide-react-native/icons/chevron-right";

import Button from "../components/Button";
import CategoryChip from "../components/CategoryChip";
import FeedbackState from "../components/FeedbackState";
import ProductCard from "../components/ProductCard";
import PromotionCarousel from "../components/PromotionCarousel";
import SearchBar from "../components/SearchBar";
import SectionHeader from "../components/SectionHeader";
import colors from "../constants/colors";
import shadows from "../constants/shadows";
import spacing, { contentInset } from "../constants/spacing";
import typography from "../constants/typography";
import { useCart } from "../context/CartContext";
import useCompareAction from "../hooks/useCompareAction";
import usePaginatedCatalog from "../hooks/usePaginatedCatalog";
import { EMPTY_FILTER } from "../types/specFilter";
import { getPromotions } from "../services/promotionService";
import { getCatalogCategories } from "../services/catalogApiService";
import { cacheProduct } from "../services/productCache";

const HOME_CATEGORY_ICONS: Record<string, typeof Sparkles> = {
  all: Sparkles,
  laptop: Laptop,
  "pc-gaming": Cpu,
  "pc-van-phong": Monitor,
  "dien-thoai": Smartphone,
  "linh-kien": Cpu,
  "man-hinh": Monitor,
  "phu-kien": Headphones,
  keyboard: Keyboard,
};

const QUICK_ACCESS = [
  {
    id: "flash",
    title: "Flash sale",
    subtitle: "Giảm đến 50%",
    icon: Zap,
    bg: colors.accent,
    textOnBg: colors.white,
  },
  {
    id: "build",
    title: "Xây PC",
    subtitle: "Tự chọn linh kiện",
    icon: Wrench,
    bg: colors.primary,
    textOnBg: colors.white,
  },
  {
    id: "warranty",
    title: "Bảo hành",
    subtitle: "Tra serial",
    icon: ShieldCheck,
    bg: colors.success,
    textOnBg: colors.white,
  },
];

export default function HomeScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [promotions, setPromotions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Home chỉ cần 1 page để gợi ý; danh sách đầy đủ nằm ở Catalog.
  // Pagination giúp tránh tải toàn bộ 422 sản phẩm khi mở app.
  const {
    products,
    isLoading,
    isRefreshing,
    error,
    retry,
    refresh,
  } = usePaginatedCatalog("", "all", EMPTY_FILTER);
  const { cartCount, addToCart } = useCart();
  const compare = useCompareAction();
  const featuredProducts = useMemo(
    () => products.slice(0, 8),
    [products],
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

  const handleAddToCart = async (productId: string) => {
    const product: any = products.find((item: any) => item.id === productId);
    if (!product) return;
    const added = await addToCart(product as any);
    if (!added) {
      Alert.alert(
        "Không thể thêm vào giỏ",
        "Vui lòng kiểm tra tồn kho và thử lại.",
      );
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate("Catalog", {
      category: categoryId === "all" ? undefined : categoryId,
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow} numberOfLines={1}>
              CỬA HÀNG TRỰC TUYẾN
            </Text>
            <Text style={styles.subline} numberOfLines={1}>
              Laptop • PC • Linh kiện chính hãng
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() =>
                navigation.getParent()?.navigate("Notifications")
              }
              style={({ pressed }) => [
                styles.iconButton,
                pressed ? styles.pressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Thông báo"
            >
              <Bell color={colors.text} size={20} strokeWidth={2.2} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("Cart")}
              style={({ pressed }) => [
                styles.iconButton,
                styles.iconButtonAccent,
                pressed ? styles.pressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Mở giỏ hàng, ${cartCount} sản phẩm`}
            >
              <ShoppingCart
                color={colors.white}
                size={18}
                strokeWidth={2.4}
              />
              {cartCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartCount > 99 ? "99+" : cartCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressViewOffset={4}
          />
        }
      >
        {isLoading ? (
          <FeedbackState
            variant="loading"
            title="Đang tải danh mục sản phẩm..."
          />
        ) : error && products.length === 0 ? (
          <FeedbackState
            variant="error"
            title="Chưa kết nối được cửa hàng"
            description={
              error?.message || "Vui lòng kiểm tra kết nối và thử lại."
            }
            onRetry={() => retry()}
          />
        ) : (
          <>
            {error ? (
              <View style={styles.refreshError}>
                <Text style={styles.refreshErrorText}>
                  {error.message}
                </Text>
              </View>
            ) : null}

            <View style={styles.searchBlock}>
              <SearchBar
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() =>
                  navigation.navigate("Catalog", { initialQuery: query })
                }
              />
            </View>

            {promotions.length > 0 ? (
              <View style={styles.promoBlock}>
                <PromotionCarousel
                  promotions={promotions}
                  onPress={(promotion: any) => {
                    if (promotion.target_type === "CATEGORY") {
                      navigation.navigate("Catalog", {
                        category: promotion.target_value,
                      });
                    }
                  }}
                />
              </View>
            ) : null}

            <View style={styles.quickAccessWrap}>
              {QUICK_ACCESS.map((item) => {
                const Icon = item.icon;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      if (item.id === "build") {
                        navigation.navigate("PcBuilder");
                      } else if (item.id === "warranty") {
                        navigation.navigate("Warranty");
                      } else {
                        navigation.navigate("Catalog");
                      }
                    }}
                    style={({ pressed }) => [
                      styles.quickAccess,
                      { backgroundColor: item.bg },
                      pressed ? styles.pressed : null,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={item.title}
                  >
                    <View style={styles.quickAccessIcon}>
                      <Icon
                        color={item.textOnBg}
                        size={20}
                        strokeWidth={2.4}
                      />
                    </View>
                    <Text
                      style={[
                        styles.quickAccessTitle,
                        { color: item.textOnBg },
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.quickAccessSub,
                        { color: item.textOnBg, opacity: 0.82 },
                      ]}
                      numberOfLines={2}
                    >
                      {item.subtitle}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.sectionHeaderWrap}>
              <SectionHeader
                eyebrow="KHÁM PHÁ"
                title="Danh mục nổi bật"
                action={
                  <Pressable
                    onPress={() => navigation.navigate("Catalog")}
                    accessibilityRole="button"
                    style={styles.viewAllBtn}
                  >
                    <Text style={styles.viewAllText}>Tất cả</Text>
                    <ChevronRight
                      color={colors.primary}
                      size={16}
                      strokeWidth={2.4}
                    />
                  </Pressable>
                }
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryList}
              contentContainerStyle={styles.categoryListContent}
            >
              {categories.map((category: any) => {
                const Icon =
                  HOME_CATEGORY_ICONS[category.slug] || Sparkles;
                return (
                  <CategoryChip
                    key={category.id}
                    id={category.id}
                    name={category.name}
                    icon={Icon}
                    onPress={() => handleCategoryPress(category.id)}
                  />
                );
              })}
            </ScrollView>

            <View style={styles.sectionHeaderWrap}>
              <SectionHeader
                eyebrow="GỢI Ý HÔM NAY"
                title="Sản phẩm nổi bật"
                subtitle="Cập nhật liên tục theo cửa hàng"
                action={
                  <Pressable
                    onPress={() => navigation.navigate("Catalog")}
                    accessibilityRole="button"
                    style={styles.viewAllBtn}
                  >
                    <Text style={styles.viewAllText}>Xem thêm</Text>
                    <ChevronRight
                      color={colors.primary}
                      size={16}
                      strokeWidth={2.4}
                    />
                  </Pressable>
                }
              />
            </View>

            {featuredProducts.length > 0 ? (
              <View style={styles.productGrid}>
                {featuredProducts.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={() => handleAddToCart(product.id)}
                    onCompare={() => compare.toggle(product)}
                    inCompare={compare.hasProduct(product.id)}
                    onPress={() => {
                      cacheProduct(product);
                      navigation.navigate("ProductDetail", { productId: product.id });
                    }}
                  />
                ))}
              </View>
            ) : (
              <FeedbackState
                variant="empty"
                title="Không tìm thấy sản phẩm"
                description="Thử từ khóa khác hoặc chọn một danh mục khác."
              />
            )}

            <View style={styles.ctaBanner}>
              <View style={styles.ctaBannerContent}>
                <Text style={styles.ctaEyebrow}>XÂY DỰNG CẤU HÌNH</Text>
                <Text style={styles.ctaTitle}>
                  Tự chọn linh kiện cho bộ PC của bạn
                </Text>
                <Text style={styles.ctaSub}>
                  Hệ thống tự kiểm tra tương thích và ngân sách.
                </Text>
              </View>
              <Button
                label="Bắt đầu ngay"
                variant="primary"
                size="md"
                fullWidth={false}
                rounded
                onPress={() => navigation.navigate("PcBuilder")}
                style={styles.ctaBtn}
              />
            </View>
          </>
        )}

        <View style={{ height: spacing.px40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerSafe: { backgroundColor: colors.background },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: contentInset.horizontal,
    paddingTop: spacing.px12,
    paddingBottom: spacing.px12,
    gap: spacing.px12,
  },
  headerText: { flex: 1, minWidth: 0 },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
  },
  brand: {
    ...typography.h3,
    color: colors.text,
    marginTop: 2,
  },
  subline: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: colors.radius.pill,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonAccent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    ...typography.micro,
    color: colors.white,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.px32 },
  searchBlock: {
    paddingHorizontal: contentInset.horizontal,
    marginTop: spacing.px4,
  },
  promoBlock: { marginTop: spacing.px16 },
  quickAccessWrap: {
    flexDirection: "row",
    gap: spacing.px10,
    paddingHorizontal: contentInset.horizontal,
    marginTop: spacing.px20,
  },
  quickAccess: {
    flex: 1,
    minWidth: 0,
    borderRadius: colors.radius.lg,
    paddingHorizontal: spacing.px12,
    paddingVertical: spacing.px14,
    minHeight: 108,
    justifyContent: "space-between",
    ...shadows.card,
  },
  quickAccessIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  quickAccessTitle: {
    ...typography.bodyStrong,
    marginTop: spacing.px8,
  },
  quickAccessSub: {
    ...typography.caption,
    marginTop: 2,
    lineHeight: 16,
  },
  refreshError: {
    marginHorizontal: contentInset.horizontal,
    backgroundColor: colors.dangerLight,
    borderColor: colors.dangerSoft,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    marginBottom: spacing.px12,
  },
  refreshErrorText: {
    ...typography.captionStrong,
    color: colors.danger,
  },
  sectionHeaderWrap: {
    paddingHorizontal: contentInset.horizontal,
    marginTop: spacing.px24,
  },
  categoryList: {
    marginTop: spacing.px4,
  },
  categoryListContent: {
    paddingHorizontal: contentInset.horizontal,
    paddingBottom: spacing.px4,
    gap: spacing.px10,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "flex-start",
    rowGap: spacing.px12,
    paddingHorizontal: contentInset.horizontal,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 4,
  },
  viewAllText: {
    ...typography.buttonSm,
    color: colors.primary,
  },
  ctaBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: colors.radius.lg,
    borderColor: colors.border,
    borderWidth: 1,
    marginHorizontal: contentInset.horizontal,
    marginTop: spacing.px28,
    padding: spacing.px16,
    gap: spacing.px12,
  },
  ctaBannerContent: { flex: 1, minWidth: 0 },
  ctaEyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
  },
  ctaTitle: {
    ...typography.bodyStrong,
    color: colors.text,
    marginTop: 4,
  },
  ctaSub: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
  ctaBtn: { flexShrink: 0 },
});
