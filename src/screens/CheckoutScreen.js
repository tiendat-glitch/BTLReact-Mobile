import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import colors from "../constants/colors";
import { useCart } from "../context/CartContext";

export default function CheckoutScreen({
  navigation,
  route,
}) {
  const { cart, clearCart } = useCart();

  const [payment, setPayment] =
    useState("COD");

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const deliveryFee = 15000;
  const total = subtotal + deliveryFee;

  const placeOrder = () => {
    Alert.alert(
      "Đặt hàng thành công 🎉",
      "Đơn hàng của bạn đang được chuẩn bị.",
      [
        {
          text: "Về trang chủ",
          onPress: () => {
            clearCart();
            navigation.navigate("Home");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            Xác nhận đơn hàng
          </Text>

          <View style={{ width: 35 }} />
        </View>

        {/* ADDRESS */}

        <Text style={styles.sectionTitle}>
          Địa chỉ giao hàng
        </Text>

        <View style={styles.addressCard}>
          <View style={styles.addressIcon}>
            <Text>📍</Text>
          </View>

          <View style={styles.addressInfo}>
            <View style={styles.addressTop}>
              <Text style={styles.addressName}>
                Tiến Đạt
              </Text>

              <Text style={styles.addressPhone}>
                09xx xxx xxx
              </Text>
            </View>

            <Text style={styles.address}>
              123 Phố Hàng Bạc, Hoàn Kiếm,
              Hà Nội
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </View>

        {/* DELIVERY */}

        <Text style={styles.sectionTitle}>
          Phương thức giao hàng
        </Text>

        <View style={styles.deliveryCard}>
          <View style={styles.deliveryIcon}>
            <Text>🛵</Text>
          </View>

          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryName}>
              Giao hàng tiêu chuẩn
            </Text>

            <Text style={styles.deliveryTime}>
              Dự kiến 20 - 30 phút
            </Text>
          </View>

          <Text style={styles.deliveryPrice}>
            15.000đ
          </Text>
        </View>

        {/* PAYMENT */}

        <Text style={styles.sectionTitle}>
          Phương thức thanh toán
        </Text>

        <Payment
          icon="💵"
          title="Tiền mặt"
          sub="Thanh toán khi nhận hàng"
          selected={payment === "COD"}
          onPress={() => setPayment("COD")}
        />

        <Payment
          icon="💳"
          title="Thẻ ngân hàng"
          sub="Visa / Mastercard / ATM"
          selected={payment === "CARD"}
          onPress={() => setPayment("CARD")}
        />

        <Payment
          icon="📱"
          title="Ví điện tử"
          sub="Thanh toán online"
          selected={payment === "WALLET"}
          onPress={() => setPayment("WALLET")}
        />

        {/* VOUCHER */}

        <View style={styles.voucher}>
          <Text style={styles.voucherIcon}>
            🏷️
          </Text>

          <View style={{ flex: 1 }}>
            <Text style={styles.voucherTitle}>
              Mã giảm giá
            </Text>

            <Text style={styles.voucherSub}>
              Chọn voucher để tiết kiệm hơn
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </View>

        {/* ORDER */}

        <Text style={styles.sectionTitle}>
          Chi tiết đơn hàng
        </Text>

        <View style={styles.orderCard}>
          {cart.map((item) => (
            <View
              style={styles.orderItem}
              key={item.id}
            >
              <View style={styles.orderImage}>
                <Text>{item.emoji}</Text>
              </View>

              <View style={styles.orderInfo}>
                <Text style={styles.orderName}>
                  {item.name}
                </Text>

                <Text style={styles.orderQuantity}>
                  x{item.quantity}
                </Text>
              </View>

              <Text style={styles.orderPrice}>
                {(
                  item.price * item.quantity
                ).toLocaleString("vi-VN")}đ
              </Text>
            </View>
          ))}

          <View style={styles.line} />

          <Row
            title="Tạm tính"
            value={`${subtotal.toLocaleString(
              "vi-VN"
            )}đ`}
          />

          <Row
            title="Phí giao hàng"
            value="15.000đ"
          />

          <View style={styles.line} />

          <Row
            title="Tổng thanh toán"
            value={`${total.toLocaleString(
              "vi-VN"
            )}đ`}
            bold
          />
        </View>
      </ScrollView>

      {/* BOTTOM */}

      <View style={styles.bottom}>
        <View>
          <Text style={styles.bottomLabel}>
            Tổng thanh toán
          </Text>

          <Text style={styles.total}>
            {total.toLocaleString("vi-VN")}đ
          </Text>
        </View>

        <TouchableOpacity
          style={styles.orderButton}
          onPress={placeOrder}
        >
          <Text style={styles.orderButtonText}>
            Đặt hàng
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Payment({
  icon,
  title,
  sub,
  selected,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.payment,
        selected && styles.selectedPayment,
      ]}
      onPress={onPress}
    >
      <View style={styles.paymentIcon}>
        <Text style={{ fontSize: 21 }}>
          {icon}
        </Text>
      </View>

      <View style={styles.paymentInfo}>
        <Text style={styles.paymentTitle}>
          {title}
        </Text>

        <Text style={styles.paymentSub}>
          {sub}
        </Text>
      </View>

      <View
        style={[
          styles.radio,
          selected && styles.selectedRadio,
        ]}
      >
        {selected && (
          <View style={styles.radioDot} />
        )}
      </View>
    </TouchableOpacity>
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
    fontSize: 19,
    fontWeight: "900",
    color: colors.text,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },

  addressCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  addressIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },

  addressInfo: {
    flex: 1,
    marginLeft: 11,
  },

  addressTop: {
    flexDirection: "row",
  },

  addressName: {
    fontWeight: "900",
    fontSize: 13,
  },

  addressPhone: {
    color: colors.gray,
    fontSize: 11,
    marginLeft: 10,
  },

  address: {
    color: colors.gray,
    fontSize: 11,
    marginTop: 5,
    lineHeight: 17,
  },

  arrow: {
    fontSize: 26,
    color: colors.gray,
  },

  deliveryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  deliveryIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#FFF7E8",
    justifyContent: "center",
    alignItems: "center",
  },

  deliveryInfo: {
    flex: 1,
    marginLeft: 11,
  },

  deliveryName: {
    fontSize: 13,
    fontWeight: "800",
  },

  deliveryTime: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 4,
  },

  deliveryPrice: {
    fontSize: 12,
    fontWeight: "800",
  },

  payment: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 13,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  selectedPayment: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  paymentIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
  },

  paymentInfo: {
    flex: 1,
    marginLeft: 11,
  },

  paymentTitle: {
    fontSize: 13,
    fontWeight: "800",
  },

  paymentSub: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 3,
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CCC",
    justifyContent: "center",
    alignItems: "center",
  },

  selectedRadio: {
    borderColor: colors.primary,
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },

  voucher: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  voucherIcon: {
    fontSize: 21,
    marginRight: 11,
  },

  voucherTitle: {
    fontWeight: "800",
    fontSize: 13,
  },

  voucherSub: {
    color: colors.gray,
    fontSize: 10,
    marginTop: 3,
  },

  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 15,
  },

  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  orderImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },

  orderInfo: {
    flex: 1,
    marginLeft: 10,
  },

  orderName: {
    fontSize: 12,
    fontWeight: "800",
  },

  orderQuantity: {
    color: colors.gray,
    fontSize: 10,
    marginTop: 4,
  },

  orderPrice: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  line: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 8,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },

  rowTitle: {
    color: colors.gray,
    fontSize: 12,
  },

  rowValue: {
    fontSize: 12,
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
    alignItems: "center",
    justifyContent: "space-between",
  },

  bottomLabel: {
    fontSize: 10,
    color: colors.gray,
  },

  total: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
  },

  orderButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 15,
  },

  orderButtonText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 14,
  },
});