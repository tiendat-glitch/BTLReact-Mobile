// FavoritesScreen — danh sách sản phẩm yêu thích. Redesign:
//   - Section header (eyebrow + title + count).
//   - Danh sách dạng row (ảnh vuông 64 + tên + giá + meta + nút xóa).
//   - Pull-to-refresh, empty state có CTA quay về Home.
//   - Xóa 1 chạm với confirm inline, có snackbar/alert feedback.
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Heart from "lucide-react-native/icons/heart";
import HeartCrack from "lucide-react-native/icons/heart-crack";
import ShoppingCart from "lucide-react-native/icons/shopping-cart";
import GitCompareArrows from "lucide-react-native/icons/git-compare-arrows";
import Trash from "lucide-react-native/icons/trash";

import Button from "../components/Button";
import FeedbackState from "../components/FeedbackState";
import PriceText from "../components/PriceText";
import ScreenHeader from "../components/ScreenHeader";
import SectionHeader from "../components/SectionHeader";
import StatusBadge from "../components/StatusBadge";
import colors from "../constants/colors";
import shadows from "../constants/shadows";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import { useCart } from "../context/CartContext";
import useRequireAuth from "../hooks/useRequireAuth";
import useCompareAction from "../hooks/useCompareAction";
import { getFavorites, removeFavorite } from "../services/favoriteService";
import { cacheProduct } from "../services/productCache";

const REMOVE_ICON_SIZE = 18;

export default function FavoritesScreen({ navigation }: any) {
  const isAuthenticated = useRequireAuth(navigation, "Favorites");
  const { addToCart } = useCart();
  const compare = useCompareAction();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!isAuthenticated) return;
      if (mode === "refresh") setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);
      try {
        const items = await getFavorites();
        setProducts(items);
      } catch (nextError: any) {
        setError(nextError?.message || "Không tải được danh sách yêu thích.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isAuthenticated],
  );

  useFocusEffect(
    useCallback(() => {
      void load("initial");
    }, [load]),
  );

  if (!isAuthenticated) return null;

  const openProduct = (product: any) => {
    cacheProduct(product);
    navigation.getParent()?.navigate("ProductDetail", { productId: product.id });
  };

  const handleRemove = (product: any) => {
    Alert.alert(
      "Bỏ yêu thích?",
      `Xóa "${product.name}" khỏi danh sách yêu thích.`,
      [
        { text: "Giữ lại", style: "cancel" },
        {
          text: "Bỏ yêu thích",
          style: "destructive",
          onPress: async () => {
            // Optimistic update: ẩn ngay để UI mượt.
            const previous = products;
            setProducts((current) => current.filter((item) => item.id !== product.id));
            try {
              await removeFavorite(product.id);
            } catch (nextError: any) {
              setProducts(previous);
              Alert.alert(
                "Không thể cập nhật",
                nextError?.message || "Vui lòng thử lại.",
              );
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <FavoriteRow
      item={item}
      onOpen={openProduct}
      onRemove={handleRemove}
      onAddToCart={(product: any) => {
        void addToCart(product);
      }}
      inCompare={compare.hasProduct(item.id)}
      onToggleCompare={() => compare.toggle(item)}
    />
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader
        title="Sản phẩm yêu thích"
        navigation={navigation}
        subtitle={
          !isLoading && products.length > 0
            ? `${products.length} sản phẩm đã lưu`
            : undefined
        }
        action={
          products.length > 0 ? (
            <Pressable
              onPress={() => {
                Alert.alert(
                  "Bỏ tất cả yêu thích?",
                  "Hành động này sẽ xóa toàn bộ sản phẩm khỏi danh sách.",
                  [
                    { text: "Giữ lại", style: "cancel" },
                    {
                      text: "Bỏ tất cả",
                      style: "destructive",
                      onPress: async () => {
                        const snapshot = products;
                        setProducts([]);
                        try {
                          await Promise.all(
                            snapshot.map((item) => removeFavorite(item.id)),
                          );
                        } catch {
                          setProducts(snapshot);
                          Alert.alert("Không thể cập nhật", "Vui lòng thử lại.");
                        }
                      },
                    },
                  ],
                );
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Bỏ tất cả yêu thích"
              style={({ pressed }) => [
                styles.headerAction,
                pressed ? styles.pressed : null,
              ]}
            >
              <HeartCrack color={colors.danger} size={20} strokeWidth={2.2} />
            </Pressable>
          ) : null
        }
      />

      {isLoading ? (
        <FeedbackState variant="loading" title="Đang tải..." fullScreen />
      ) : error && products.length === 0 ? (
        <FeedbackState
          variant="error"
          title="Chưa tải được danh sách"
          description={error}
          onRetry={() => load("initial")}
        />
      ) : products.length === 0 ? (
        <FeedbackState
          variant="empty"
          title="Chưa có sản phẩm yêu thích"
          description="Lưu sản phẩm để xem lại nhanh hơn và nhận thông báo khi giá giảm."
          fullScreen
          icon={<Heart color={colors.danger} size={40} strokeWidth={1.6} />}
        >
          <View style={styles.shopButton}>
            <Button
              label="Khám phá sản phẩm"
              variant="primary"
              leadingIcon={(color: string) => <Heart color={color} size={18} strokeWidth={2.4} />}
              onPress={() => navigation.navigate("Main")}
            />
          </View>
        </FeedbackState>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => load("refresh")}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <SectionHeader
              eyebrow="DANH SÁCH CỦA BẠN"
              title="Đã lưu gần đây"
              subtitle="Vuốt xuống để làm mới, bấm biểu tượng giỏ để thêm nhanh vào giỏ hàng."
            />
          }
          ListFooterComponent={<View style={styles.listFooter} />}
        />
      )}
    </SafeAreaView>
  );
}

type FavoriteRowProps = {
  item: any;
  onOpen: (item: any) => void;
  onRemove: (item: any) => void;
  onAddToCart: (item: any) => void | Promise<void>;
  inCompare: boolean;
  onToggleCompare: () => void;
};

function FavoriteRow({
  item,
  onOpen,
  onRemove,
  onAddToCart,
  inCompare,
  onToggleCompare,
}: FavoriteRowProps) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const isOutOfStock = item.stockQuantity <= 0;
  const showImage = Boolean(item.imageUrl) && !thumbFailed;
  return (
    <Pressable
      onPress={() => onOpen(item)}
      accessibilityRole="link"
      accessibilityLabel={`Xem chi tiết ${item.name}`}
      style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
    >
      <View style={styles.thumb}>
        {showImage ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.thumbImage}
            resizeMode="cover"
            onError={() => setThumbFailed(true)}
            accessibilityLabel={`Ảnh ${item.name}`}
          />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={styles.thumbEmoji}>{item.emoji || "🛒"}</Text>
          </View>
        )}
        {isOutOfStock ? (
          <View style={styles.outChip}>
            <Text style={styles.outChipText}>Hết</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.tagRow}>
          {item.brand ? (
            <StatusBadge label={item.brand} tone="neutral" variant="soft" />
          ) : null}
          {item.category ? (
            <StatusBadge label={item.category} tone="primary" variant="soft" />
          ) : null}
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        {item.variantName ? (
          <Text style={styles.variant} numberOfLines={1}>
            {item.variantName}
          </Text>
        ) : null}
        <View style={styles.priceRow}>
          <PriceText price={item.price} oldPrice={item.oldPrice} size="sm" />
        </View>
        <View style={styles.actionRow}>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              void onAddToCart(item);
            }}
            disabled={isOutOfStock}
            accessibilityRole="button"
            accessibilityLabel={`Thêm ${item.name} vào giỏ`}
            hitSlop={8}
            style={({ pressed }) => [
              styles.miniAction,
              styles.miniActionPrimary,
              isOutOfStock ? styles.miniActionDisabled : null,
              pressed && !isOutOfStock ? styles.pressed : null,
            ]}
          >
            <ShoppingCart color={colors.white} size={14} strokeWidth={2.4} />
            <Text style={styles.miniActionPrimaryText}>
              {isOutOfStock ? "Hết hàng" : "Thêm giỏ"}
            </Text>
          </Pressable>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onToggleCompare();
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: inCompare }}
            accessibilityLabel={
              inCompare
                ? `Bỏ ${item.name} khỏi so sánh`
                : `Thêm ${item.name} vào so sánh`
            }
            hitSlop={8}
            style={({ pressed }) => [
              styles.miniAction,
              inCompare ? styles.miniActionCompareActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <GitCompareArrows
              color={inCompare ? colors.white : colors.text}
              size={14}
              strokeWidth={2.4}
            />
          </Pressable>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onRemove(item);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Bỏ yêu thích ${item.name}`}
            hitSlop={8}
            style={({ pressed }) => [
              styles.miniAction,
              styles.miniActionRemove,
              pressed ? styles.pressed : null,
            ]}
          >
            <Trash color={colors.danger} size={REMOVE_ICON_SIZE} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: colors.radius.pill,
    backgroundColor: colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingHorizontal: spacing.px16, paddingBottom: spacing.px40 },
  listFooter: { height: spacing.px24 },
  separator: { height: spacing.px12 },
  row: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: colors.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.px12,
    gap: spacing.px12,
    ...shadows.card,
  },
  rowPressed: { backgroundColor: colors.surfaceMuted },
  thumb: {
    width: 88,
    height: 88,
    borderRadius: colors.radius.md,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    position: "relative",
  },
  thumbImage: { width: "100%", height: "100%" },
  thumbPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbEmoji: { fontSize: 40 },
  outChip: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: colors.radius.sm,
    borderWidth: 1,
    borderColor: colors.dangerSoft,
  },
  outChipText: {
    ...typography.micro,
    color: colors.danger,
  },
  body: { flex: 1, gap: 4 },
  tagRow: {
    flexDirection: "row",
    gap: spacing.px4,
    flexWrap: "wrap",
  },
  name: {
    ...typography.bodyStrong,
    color: colors.text,
    lineHeight: 20,
  },
  variant: {
    ...typography.caption,
    color: colors.gray,
  },
  priceRow: { marginTop: 2 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px8,
    marginTop: spacing.px8,
  },
  miniAction: {
    minHeight: 32,
    minWidth: 32,
    paddingHorizontal: 10,
    borderRadius: colors.radius.pill,
    backgroundColor: colors.surfaceMuted,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  miniActionPrimary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
  },
  miniActionPrimaryText: {
    ...typography.captionStrong,
    color: colors.white,
  },
  miniActionCompareActive: {
    backgroundColor: colors.primary,
  },
  miniActionRemove: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 10,
  },
  miniActionDisabled: { backgroundColor: colors.surfaceMuted },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  shopButton: { paddingTop: spacing.px16, width: 240 },
});
