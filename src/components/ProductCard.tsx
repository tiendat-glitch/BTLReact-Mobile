// ProductCard — card sản phẩm dùng trong grid Home/Catalog. Redesign:
//   - Ảnh lớn, có nền gradient nhẹ để placeholder dễ nhìn.
//   - Badge giảm giá "nổi" góc trái trên, nút compare góc phải.
//   - Giá đậm + size lớn, giá gạch ngang dưới.
//   - Nút "Add" tròn pill, CTA rõ.
//   - Rating + sold text phụ.
//   - Khi hết hàng: overlay mờ + nhãn Hết hàng.
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import GitCompareArrows from "lucide-react-native/icons/git-compare-arrows";
import ShoppingCart from "lucide-react-native/icons/shopping-cart";
import Star from "lucide-react-native/icons/star";
import PackageX from "lucide-react-native/icons/package-x";

import colors from "../constants/colors";
import shadows from "../constants/shadows";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import type { CatalogProduct } from "../types/catalog";

type Props = {
  product: CatalogProduct;
  onPress: () => void;
  onAdd?: () => unknown | Promise<unknown>;
  onCompare?: () => unknown | Promise<unknown>;
  inCompare?: boolean;
  style?: StyleProp<ViewStyle>;
};

const formatSold = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);

export default function ProductCard({
  product,
  onPress,
  onAdd,
  onCompare,
  inCompare = false,
  style,
}: Props) {
  const [imageIndex, setImageIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const hasDiscount = product.oldPrice > product.price && product.oldPrice > 0;
  const discount = hasDiscount
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const isOutOfStock = product.stockQuantity <= 0;

  const imageList =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  useEffect(() => {
    setImageIndex(0);
    setImageFailed(false);
  }, [product.imageUrl]);

  const handleAdd = (event: GestureResponderEvent) => {
    event.stopPropagation();
    void onAdd?.();
  };

  const handleCompare = (event: GestureResponderEvent) => {
    event.stopPropagation();
    void onCompare?.();
  };

  const currentImage = imageList[Math.min(imageIndex, imageList.length - 1)];

  return (
    <View style={[styles.cardWrap, style]}>
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={`${product.name}, ${product.price.toLocaleString("vi-VN")} đồng`}
    >
      <View style={styles.imageContainer}>
        {currentImage && !imageFailed ? (
          <Image
            source={{ uri: currentImage }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
            accessibilityLabel={`Ảnh ${product.name}`}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.emoji}>{product.emoji || "🛒"}</Text>
          </View>
        )}

        {isOutOfStock ? (
          <View style={styles.outOverlay} pointerEvents="none">
            <View style={styles.outChip}>
              <PackageX color={colors.danger} size={14} strokeWidth={2.4} />
              <Text style={styles.outChipText}>Hết hàng</Text>
            </View>
          </View>
        ) : null}

        {hasDiscount ? (
          <View style={styles.discount}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        ) : null}

        {onCompare ? (
          <Pressable
            style={[
              styles.compareButton,
              inCompare && styles.compareButtonActive,
            ]}
            onPress={handleCompare}
            accessibilityRole="button"
            accessibilityLabel={
              inCompare
                ? `Bỏ ${product.name} khỏi so sánh`
                : `Thêm ${product.name} vào so sánh`
            }
            accessibilityState={{ selected: inCompare }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <GitCompareArrows
              color={inCompare ? colors.white : colors.text}
              size={15}
              strokeWidth={2.4}
            />
          </Pressable>
        ) : null}

        {imageList.length > 1 ? (
          <View style={styles.galleryDots}>
            {imageList.slice(0, 4).map((uri, index) => (
              <View
                key={`${uri}-${index}`}
                style={[
                  styles.galleryDot,
                  index === imageIndex && styles.galleryDotActive,
                ]}
              />
            ))}
            {imageList.length > 4 ? (
              <Text style={styles.galleryMore}>+{imageList.length - 4}</Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand || product.category}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {product.rating || product.sold ? (
          <View style={styles.metaRow}>
            {product.rating ? (
              <View style={styles.ratingRow}>
                <Star color={colors.accent} size={11} fill={colors.accent} />
                <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
              </View>
            ) : null}
            {product.sold ? (
              <Text style={styles.sold}>Đã bán {formatSold(product.sold)}</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.priceRow}>
          <Text style={styles.price} numberOfLines={1}>
            {product.price.toLocaleString("vi-VN")}đ
          </Text>
          {hasDiscount ? (
            <Text style={styles.oldPrice} numberOfLines={1}>
              {product.oldPrice.toLocaleString("vi-VN")}đ
            </Text>
          ) : null}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            isOutOfStock && styles.disabledButton,
            pressed && !isOutOfStock ? styles.pressed : null,
          ]}
          onPress={isOutOfStock ? undefined : handleAdd}
          disabled={isOutOfStock || !onAdd}
          accessibilityRole="button"
          accessibilityState={{ disabled: isOutOfStock || !onAdd }}
          accessibilityLabel={`Thêm ${product.name} vào giỏ hàng`}
        >
          <ShoppingCart
            color={isOutOfStock ? colors.gray : colors.white}
            size={18}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.addLabel,
              isOutOfStock && styles.addLabelDisabled,
            ]}
            numberOfLines={1}
          >
            {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
          </Text>
        </Pressable>
      </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    flexBasis: "48.5%",
    maxWidth: "48.5%",
    minWidth: 0,
    marginBottom: spacing.px14,
  },
  card: {
    flex: 1,
    minHeight: 360,
    backgroundColor: colors.surface,
    borderRadius: colors.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  imageContainer: {
    height: 152,
    backgroundColor: colors.surfaceMuted,
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },
  emoji: { fontSize: 56 },
  outOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  outChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.surface,
    borderRadius: colors.radius.pill,
    borderWidth: 1,
    borderColor: colors.dangerLight,
  },
  outChipText: {
    ...typography.micro,
    color: colors.danger,
  },
  discount: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: colors.radius.sm,
  },
  discountText: {
    ...typography.micro,
    color: colors.white,
  },
  galleryDots: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  galleryDot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(15,26,46,0.18)",
  },
  galleryDotActive: {
    backgroundColor: colors.primary,
  },
  galleryMore: {
    ...typography.micro,
    color: colors.gray,
    marginLeft: 4,
  },
  compareButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: colors.radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  compareButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  content: {
    padding: spacing.px12,
    gap: 4,
    flex: 1,
    justifyContent: "space-between",
  },
  brand: {
    ...typography.eyebrow,
    color: colors.primary,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.text,
    minHeight: 38,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    minHeight: 18,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  rating: {
    ...typography.captionStrong,
    color: colors.accent,
  },
  sold: {
    ...typography.micro,
    color: colors.gray,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 6,
  },
  price: {
    ...typography.priceMd,
    color: colors.primary,
  },
  oldPrice: {
    ...typography.caption,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  addButton: {
    marginTop: spacing.px10,
    height: 38,
    borderRadius: colors.radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addLabel: {
    ...typography.buttonSm,
    color: colors.white,
  },
  addLabelDisabled: { color: colors.gray },
  disabledButton: { backgroundColor: colors.surfaceMuted },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
