import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import colors from "../constants/colors";
import { useCart } from "../context/CartContext";

export default function CartScreen({ navigation }) {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const deliveryFee = subtotal > 0 ? 15000 : 0;

  const total = subtotal + deliveryFee;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            Giỏ hàng
          </Text>

          <View style={{ width: 35 }} />
        </View>

        {cart.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>
              🛒
            </Text>

            <Text style={styles.emptyTitle}>
              Giỏ hàng đang trống
            </Text>

            <Text style={styles.emptyText}>
              Thêm sản phẩm bạn đang quan tâm vào giỏ hàng
            </Text>

            <TouchableOpacity
              style={styles.shopButton}
              onPress={() =>
                navigation.navigate("Home")
              }
            >
              <Text style={styles.shopButtonText}>
                Tiếp tục mua sắm
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.storeBox}>
              <Text style={styles.storeEmoji}>
                🏪
              </Text>

              <View>
                <Text style={styles.storeName}>
                  BTL Computer Store
                </Text>

                <Text style={styles.storeSub}>
                  Hàng chính hãng • Bảo hành đầy đủ
                </Text>
              </View>
            </View>

            {cart.map((item) => (
              <View
                key={item.id}
                style={styles.item}
              >
                <View style={styles.itemImage}>
                  <Text style={styles.itemEmoji}>
                    {item.emoji}
                  </Text>
                </View>

                <View style={styles.itemInfo}>
                  <Text
                    style={styles.itemName}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>

                  <Text style={styles.itemPrice}>
                    {item.price.toLocaleString(
                      "vi-VN"
                    )}đ
                  </Text>

                  <View style={styles.quantityBox}>
                    <TouchableOpacity
                      onPress={() =>
                        decreaseQuantity(item.id)
                      }
                    >
                      <Text style={styles.minus}>
                        −
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.quantity}>
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        increaseQuantity(item.id)
                      }
                    >
                      <Text style={styles.plus}>
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    removeFromCart(item.id)
                  }
                >
                  <Text style={styles.delete}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.voucher}>
              <Text style={styles.voucherIcon}>
                🏷️
              </Text>

              <Text style={styles.voucherText}>
                Chọn mã giảm giá
              </Text>

              <Text style={styles.arrow}>
                ›
              </Text>
            </View>

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>
                Chi tiết thanh toán
              </Text>

              <Row
                title="Tạm tính"
                value={`${subtotal.toLocaleString(
                  "vi-VN"
                )}đ`}
              />

              <Row
                title="Phí giao hàng"
                value={`${deliveryFee.toLocaleString(
                  "vi-VN"
                )}đ`}
              />

              <View style={styles.line} />

              <Row
                title="Tổng cộng"
                value={`${total.toLocaleString(
                  "vi-VN"
                )}đ`}
                bold
              />
            </View>
          </>
        )}
      </ScrollView>

      {cart.length > 0 && (
        <View style={styles.bottom}>
          <View>
            <Text style={styles.totalLabel}>
              Tổng thanh toán
            </Text>

            <Text style={styles.total}>
              {total.toLocaleString("vi-VN")}đ
            </Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() =>
              navigation.navigate("Checkout", {
                total,
              })
            }
          >
            <Text style={styles.checkoutText}>
              Đặt hàng →
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function Row({ title, value, bold }) {
  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.rowTitle,
          bold && styles.bold,
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.rowValue,
          bold && styles.boldValue,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    padding: 16,
    paddingBottom: 110,
  },

  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  back: {
    fontSize: 36,
    color: colors.text,
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 120,
  },

  emptyEmoji: {
    fontSize: 80,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 15,
  },

  emptyText: {
    color: colors.gray,
    marginTop: 7,
  },

  shopButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 13,
    marginTop: 20,
  },

  shopButtonText: {
    color: colors.white,
    fontWeight: "900",
  },

  storeBox: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  storeEmoji: {
    fontSize: 30,
    marginRight: 12,
  },

  storeName: {
    fontSize: 15,
    fontWeight: "900",
  },

  storeSub: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 4,
  },

  item: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginTop: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },

  itemEmoji: {
    fontSize: 45,
  },

  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },

  itemName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },

  itemPrice: {
    color: colors.primary,
    fontWeight: "900",
    marginTop: 5,
  },

  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  minus: {
    fontSize: 21,
    color: colors.primary,
  },

  plus: {
    fontSize: 21,
    color: colors.primary,
  },

  quantity: {
    fontWeight: "900",
    marginHorizontal: 13,
  },

  delete: {
    fontSize: 27,
    color: "#AAA",
  },

  voucher: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 16,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  voucherIcon: {
    fontSize: 20,
  },

  voucherText: {
    flex: 1,
    marginLeft: 10,
    fontWeight: "700",
  },

  arrow: {
    fontSize: 25,
    color: colors.gray,
  },

  summary: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  rowTitle: {
    color: colors.gray,
  },

  rowValue: {
    color: colors.text,
  },

  line: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 5,
  },

  bold: {
    fontWeight: "900",
    color: colors.text,
  },

  boldValue: {
    color: colors.primary,
    fontSize: 17,
  },

  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 10,
    color: colors.gray,
  },

  total: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primary,
  },

  checkoutButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 15,
  },

  checkoutText: {
    color: colors.white,
    fontWeight: "900",
  },
});