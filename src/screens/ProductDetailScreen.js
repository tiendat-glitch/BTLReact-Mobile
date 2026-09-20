import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import colors from "../constants/colors";
import { useCart } from "../context/CartContext";

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const item = product;
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);

  if (!item) {
    return (
      <View style={styles.errorState}>
        <Text style={styles.errorTitle}>Không tải được sản phẩm</Text>
        <Text style={styles.errorText}>
          Vui lòng quay lại và thử chọn sản phẩm khác.
        </Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
          <Text style={styles.errorButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const total = item.price * quantity;

  const handleAddToCart = () => {
    addToCart(item, quantity);
    navigation.navigate("Cart");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* IMAGE */}

        <View style={styles.imageContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.favoriteButton}>
            <Text style={styles.favoriteText}>♡</Text>
          </TouchableOpacity>

          <Text style={styles.productEmoji}>
            {item.emoji}
          </Text>

          <View style={styles.discount}>
            <Text style={styles.discountText}>
              -{Math.round(
                ((item.oldPrice - item.price) /
                  item.oldPrice) *
                  100
              )}%
            </Text>
          </View>
        </View>

        {/* CONTENT */}

        <View style={styles.content}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>
              {item.category}
            </Text>
          </View>

          <Text style={styles.name}>
            {item.name}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.rating}>
              ★ {item.rating}
            </Text>

            <Text style={styles.separator}>
              •
            </Text>

            <Text style={styles.sold}>
              Đã bán {item.sold}
            </Text>

            <Text style={styles.separator}>
              •
            </Text>

            <Text style={styles.delivery}>
              ✓ {item.deliveryTime}
            </Text>
          </View>

          {/* PRICE */}

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {item.price.toLocaleString("vi-VN")}đ
            </Text>

            <Text style={styles.oldPrice}>
              {item.oldPrice.toLocaleString("vi-VN")}đ
            </Text>
          </View>

          <View style={styles.divider} />

          {/* DESCRIPTION */}

          <Text style={styles.sectionTitle}>
            Mô tả sản phẩm
          </Text>

          <Text style={styles.description}>
            {item.description}
          </Text>

          {/* OPTIONS */}

          <Text style={styles.sectionTitle}>
            Thông số nổi bật
          </Text>

          <View style={styles.option}>
            <View>
              <Text style={styles.optionTitle}>
                Cấu hình sản phẩm
              </Text>

              <Text style={styles.optionSub}>
                Thông tin được xác nhận bởi nhà sản xuất
              </Text>
            </View>

            <Text style={styles.check}>
              ✓
            </Text>
          </View>

          <View style={styles.option}>
            <View>
              <Text style={styles.optionTitle}>
                Chính sách bảo hành
              </Text>

              <Text style={styles.optionSub}>
                Bảo hành chính hãng 24 tháng
              </Text>
            </View>

            <Text style={styles.plus}>
              +
            </Text>
          </View>

          {/* QUANTITY */}

          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>
              Số lượng
            </Text>

            <View style={styles.quantityBox}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() =>
                  setQuantity(
                    Math.max(1, quantity - 1)
                  )
                }
              >
                <Text style={styles.quantityText}>
                  −
                </Text>
              </TouchableOpacity>

              <Text style={styles.quantity}>
                {quantity}
              </Text>

              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  styles.plusButton,
                ]}
                onPress={() =>
                  setQuantity(quantity + 1)
                }
              >
                <Text style={styles.plusText}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ADD TO CART */}

      <View style={styles.bottom}>
        <View>
          <Text style={styles.bottomLabel}>
            Tổng cộng
          </Text>

          <Text style={styles.bottomPrice}>
            {total.toLocaleString("vi-VN")}đ
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addButtonText}>
            🛒 Thêm vào giỏ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  errorState: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  errorTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },

  errorText: {
    color: colors.gray,
    marginTop: 8,
    textAlign: "center",
  },

  errorButton: {
    backgroundColor: colors.primary,
    borderRadius: colors.radius.sm,
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  errorButtonText: {
    color: colors.white,
    fontWeight: "800",
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    paddingBottom: 110,
  },

  imageContainer: {
    height: 300,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  productEmoji: {
    fontSize: 145,
  },

  backButton: {
    position: "absolute",
    top: 18,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  backText: {
    fontSize: 36,
    color: colors.text,
    marginTop: -5,
  },

  favoriteButton: {
    position: "absolute",
    top: 18,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  favoriteText: {
    fontSize: 27,
    color: colors.primary,
  },

  discount: {
    position: "absolute",
    left: 18,
    bottom: 18,
    backgroundColor: colors.red,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
  },

  discountText: {
    color: colors.white,
    fontWeight: "900",
  },

  content: {
    backgroundColor: colors.white,
    marginTop: -15,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },

  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },

  categoryText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  name: {
    fontSize: 25,
    fontWeight: "900",
    color: colors.text,
    marginTop: 10,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  rating: {
    color: "#F59E0B",
    fontWeight: "800",
  },

  separator: {
    color: "#BBB",
    marginHorizontal: 7,
  },

  sold: {
    fontSize: 11,
    color: colors.gray,
  },

  delivery: {
    fontSize: 11,
    color: colors.gray,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  price: {
    fontSize: 25,
    fontWeight: "900",
    color: colors.primary,
  },

  oldPrice: {
    fontSize: 13,
    color: colors.gray,
    textDecorationLine: "line-through",
    marginLeft: 10,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 20,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 10,
  },

  description: {
    fontSize: 13,
    color: colors.gray,
    lineHeight: 21,
    marginBottom: 22,
  },

  option: {
    minHeight: 62,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  optionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
  },

  optionSub: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 4,
  },

  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    color: colors.white,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "900",
  },

  plus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    textAlign: "center",
    lineHeight: 27,
    fontSize: 20,
    fontWeight: "800",
  },

  quantitySection: {
    marginTop: 10,
  },

  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 12,
    padding: 4,
  },

  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
  },

  plusButton: {
    backgroundColor: colors.primary,
  },

  quantityText: {
    fontSize: 21,
    fontWeight: "700",
  },

  plusText: {
    color: colors.white,
    fontSize: 21,
    fontWeight: "700",
  },

  quantity: {
    width: 42,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
  },

  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 82,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bottomLabel: {
    fontSize: 10,
    color: colors.gray,
  },

  bottomPrice: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primary,
    marginTop: 3,
  },

  addButton: {
    height: 52,
    paddingHorizontal: 22,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
});