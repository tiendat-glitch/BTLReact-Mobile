import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import ShoppingCart from "lucide-react-native/icons/shopping-cart";

import colors from "../constants/colors";
import type { CatalogProduct } from "../types/catalog";

type Props = {
  product: CatalogProduct;
  onPress: () => void;
  onAdd?: () => unknown | Promise<unknown>;
  style?: StyleProp<ViewStyle>;
};

const formatSold = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);

export default function ProductCard({ product, onPress, onAdd, style }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasDiscount = product.oldPrice > product.price && product.oldPrice > 0;
  const discount = hasDiscount
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const isOutOfStock = product.stockQuantity <= 0;

  useEffect(() => {
    setImageFailed(false);
  }, [product.imageUrl]);

  const handleAdd = (event: GestureResponderEvent) => {
    event.stopPropagation();
    void onAdd?.();
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.86}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${product.price.toLocaleString("vi-VN")} đồng`}
    >
      <View style={styles.imageContainer}>
        {product.imageUrl && !imageFailed ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="contain"
            onError={() => setImageFailed(true)}
            accessibilityLabel={`Ảnh ${product.name}`}
          />
        ) : (
          <Text style={styles.emoji}>{product.emoji}</Text>
        )}

        {hasDiscount ? (
          <View style={styles.discount}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.brand} numberOfLines={1}>{product.brand || product.category}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.rating}>
            {product.rating ? `★ ${product.rating}` : "Sản phẩm mới"}
          </Text>
          {product.sold ? <Text style={styles.sold}>Đã bán {formatSold(product.sold)}</Text> : null}
        </View>

        <Text style={styles.price}>{product.price.toLocaleString("vi-VN")}đ</Text>
        {hasDiscount ? (
          <Text style={styles.oldPrice}>{product.oldPrice.toLocaleString("vi-VN")}đ</Text>
        ) : (
          <View style={styles.oldPricePlaceholder} />
        )}

        <View style={styles.footer}>
          <Text
            style={[styles.stock, isOutOfStock && styles.outOfStock]}
            numberOfLines={1}
          >
            {product.deliveryTime}
          </Text>
          <TouchableOpacity
            style={[styles.addButton, isOutOfStock && styles.disabledButton]}
            onPress={handleAdd}
            disabled={isOutOfStock || !onAdd}
            accessibilityRole="button"
            accessibilityState={{ disabled: isOutOfStock || !onAdd }}
            accessibilityLabel={`Thêm ${product.name} vào giỏ hàng`}
          >
            <ShoppingCart color={colors.white} size={19} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48.5%",
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  imageContainer: {
    height: 148,
    backgroundColor: colors.surfaceMuted,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  emoji: { fontSize: 68 },
  discount: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.red,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: { color: colors.white, fontSize: 9, fontWeight: "900" },
  content: { padding: 11 },
  brand: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  name: {
    minHeight: 39,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    marginTop: 4,
  },
  metaRow: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },
  rating: { color: colors.accent, fontSize: 9, fontWeight: "800" },
  sold: { color: colors.gray, fontSize: 9 },
  price: { color: colors.primary, fontSize: 16, fontWeight: "900", marginTop: 7 },
  oldPrice: {
    height: 15,
    color: colors.muted,
    fontSize: 10,
    textDecorationLine: "line-through",
    marginTop: 2,
  },
  oldPricePlaceholder: { height: 17 },
  footer: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 7,
  },
  stock: { flex: 1, color: colors.green, fontSize: 9, fontWeight: "700", paddingRight: 6 },
  outOfStock: { color: colors.red },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: { backgroundColor: colors.muted },
});
