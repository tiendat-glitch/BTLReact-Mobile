// CartScreen — header + section title + store card + item list + summary +
// sticky bottom bar. Redesign: section eyebrow + clear hierarchy.
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Minus from "lucide-react-native/icons/minus";
import Plus from "lucide-react-native/icons/plus";
import ShoppingCart from "lucide-react-native/icons/shopping-cart";
import Store from "lucide-react-native/icons/store";
import Tag from "lucide-react-native/icons/tag";
import Trash from "lucide-react-native/icons/trash";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import Truck from "lucide-react-native/icons/truck";
import ShieldCheck from "lucide-react-native/icons/shield-check";

import Button from "../components/Button";
import Card from "../components/Card";
import FeedbackState from "../components/FeedbackState";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import shadows from "../constants/shadows";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatters";

export default function CartScreen({ navigation }: any) {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    isCartLoading,
    cartError,
  } = useCart();

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );
  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader
        title="Giỏ hàng"
        subtitle={`${totalItems} sản phẩm`}
        navigation={navigation}
      />

      {cartError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {(cartError as any)?.message || "Đã xảy ra lỗi với giỏ hàng."}
          </Text>
        </View>
      ) : null}

      {isCartLoading && cart.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !isCartLoading && cart.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <FeedbackState
            variant="empty"
            title="Giỏ hàng đang trống"
            description="Thêm sản phẩm bạn đang quan tâm vào giỏ hàng"
            icon={
              <ShoppingCart
                color={colors.primary}
                size={36}
                strokeWidth={1.6}
              />
            }
          />
          <View style={styles.shopButton}>
            <Button
              label="Tiếp tục mua sắm"
              variant="primary"
              size="lg"
              leadingIcon={(color: string) => (
                <ShoppingCart color={color} size={20} strokeWidth={2.4} />
              )}
              onPress={() => navigation.navigate("Home")}
            />
          </View>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          style={styles.scrollFlex}
        >
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionEyebrow}>GIỎ HÀNG</Text>
              <Text style={styles.sectionTitle}>
                {cart.length} sản phẩm đã chọn
              </Text>
            </View>

            <Card padding="md" style={styles.storeCard}>
              <View style={styles.storeIconBox}>
                <Store color={colors.primary} size={20} strokeWidth={2.2} />
              </View>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>BTL Computer Store</Text>
                <Text style={styles.storeSub}>
                  Hàng chính hãng • Bảo hành đầy đủ
                </Text>
              </View>
            </Card>

            {cart.map((item: any) => (
              <Card
                key={item.cartKey}
                padding="md"
                style={styles.itemCard}
              >
                <View style={styles.itemRow}>
                  <View style={styles.itemImage}>
                    <Text style={styles.itemEmoji}>
                      {item.emoji || "🛒"}
                    </Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {item.variantName ? (
                      <Text style={styles.itemVariant} numberOfLines={1}>
                        {item.variantName}
                      </Text>
                    ) : null}
                    <View style={styles.itemPriceRow}>
                      <Text style={styles.itemPrice}>
                        {formatCurrency(item.price)}
                      </Text>
                      {item.oldPrice && item.oldPrice > item.price ? (
                        <Text style={styles.itemOldPrice}>
                          {formatCurrency(item.oldPrice)}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.itemFooter}>
                      <View style={styles.quantityBox}>
                        <Pressable
                          onPress={() => decreaseQuantity(item.cartKey)}
                          style={({ pressed }) => [
                            styles.qtyButton,
                            styles.qtyDec,
                            pressed ? styles.pressed : null,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel="Giảm số lượng"
                        >
                          <Minus
                            color={colors.primary}
                            size={16}
                            strokeWidth={2.6}
                          />
                        </Pressable>
                        <Text style={styles.quantity}>
                          {item.quantity}
                        </Text>
                        <Pressable
                          onPress={() => increaseQuantity(item.cartKey)}
                          style={({ pressed }) => [
                            styles.qtyButton,
                            styles.qtyInc,
                            pressed ? styles.pressed : null,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel="Tăng số lượng"
                        >
                          <Plus
                            color={colors.white}
                            size={16}
                            strokeWidth={2.6}
                          />
                        </Pressable>
                      </View>
                      <Pressable
                        onPress={() => removeFromCart(item.cartKey)}
                        style={({ pressed }) => [
                          styles.removeButton,
                          pressed ? styles.pressed : null,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Xóa ${item.name}`}
                      >
                        <Trash
                          color={colors.danger}
                          size={16}
                          strokeWidth={2.4}
                        />
                        <Text style={styles.removeText}>Xóa</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Card>
            ))}

            <Card padding="md" style={styles.voucher}>
              <View style={styles.voucherIcon}>
                <Tag color={colors.primary} size={18} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.voucherText}>Voucher & mã giảm giá</Text>
                <Text style={styles.voucherSub}>
                  Áp dụng ở bước thanh toán
                </Text>
              </View>
              <ChevronRight
                color={colors.muted}
                size={20}
                strokeWidth={2.2}
              />
            </Card>

            <View style={styles.trustRow}>
              <TrustItem
                icon={Truck}
                label="Giao nhanh"
                sub="2h nội thành"
              />
              <TrustItem
                icon={ShieldCheck}
                label="Bảo hành"
                sub="Chính hãng"
              />
              <TrustItem
                icon={Tag}
                label="Đổi trả"
                sub="Trong 7 ngày"
              />
            </View>

            <Card padding="md" style={styles.summary}>
              <Text style={styles.summaryTitle}>Chi tiết thanh toán</Text>
              <SummaryRow
                label="Tạm tính"
                value={formatCurrency(subtotal)}
              />
              <SummaryRow
                label="Phí giao hàng"
                value="Tính khi checkout"
                muted
              />
              <View style={styles.divider} />
              <SummaryRow
                label="Tổng cộng"
                value={formatCurrency(subtotal)}
                bold
              />
            </Card>
            <View style={styles.scrollSpacer} />
        </ScrollView>
      )}

      {!isCartLoading && cart.length > 0 ? (
        <SafeAreaView edges={["bottom"]} style={styles.bottomSafe}>
          <View style={styles.bottom}>
            <View style={styles.totalInfo}>
              <Text style={styles.totalLabel} numberOfLines={1}>
                Tạm tính
              </Text>
              <Text style={styles.total} numberOfLines={1}>
                {formatCurrency(subtotal)}
              </Text>
            </View>
            <Button
              label="Đặt hàng"
              variant="primary"
              size="lg"
              trailingIcon={(color: string) => (
                <ChevronRight
                  color={color}
                  size={20}
                  strokeWidth={2.6}
                />
              )}
              onPress={() => navigation.navigate("Checkout")}
              disabled={isCartLoading}
              style={styles.checkoutBtn}
            />
          </View>
        </SafeAreaView>
      ) : null}
    </SafeAreaView>
  );
}

function SummaryRow({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text
        style={[
          styles.summaryLabel,
          bold ? styles.summaryLabelBold : null,
          muted ? styles.summaryLabelMuted : null,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          bold ? styles.summaryValueBold : null,
          muted ? styles.summaryValueMuted : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function TrustItem({
  icon: Icon,
  label,
  sub,
}: {
  icon: any;
  label: string;
  sub: string;
}) {
  return (
    <View style={styles.trustItem}>
      <View style={styles.trustIcon}>
        <Icon color={colors.primary} size={18} strokeWidth={2.2} />
      </View>
      <Text style={styles.trustLabel}>{label}</Text>
      <Text style={styles.trustSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    marginHorizontal: spacing.px16,
    marginTop: spacing.px12,
    backgroundColor: colors.dangerLight,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    borderWidth: 1,
    borderColor: colors.dangerSoft,
  },
  errorText: {
    ...typography.captionStrong,
    color: colors.danger,
  },
  scroll: {
    paddingHorizontal: spacing.px16,
    paddingTop: spacing.px8,
  },
  shopButton: {
    paddingTop: spacing.px20,
    width: 240,
  },
  sectionTitleRow: { marginBottom: spacing.px12 },
  sectionEyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: 4,
  },
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.px12,
  },
  storeIconBox: {
    width: 44,
    height: 44,
    borderRadius: colors.radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.px12,
  },
  storeInfo: { flex: 1 },
  storeName: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  storeSub: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
  itemCard: {
    marginBottom: spacing.px12,
  },
  itemRow: { flexDirection: "row", alignItems: "flex-start" },
  itemImage: {
    width: 76,
    height: 76,
    borderRadius: colors.radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.px12,
  },
  itemEmoji: { fontSize: 34 },
  itemInfo: { flex: 1 },
  itemName: {
    ...typography.bodyStrong,
    color: colors.text,
    lineHeight: 20,
  },
  itemVariant: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
  itemPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 6,
  },
  itemPrice: {
    ...typography.priceSm,
    color: colors.primary,
  },
  itemOldPrice: {
    ...typography.caption,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.px10,
  },
  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: colors.radius.pill,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyDec: { backgroundColor: colors.surface },
  qtyInc: { backgroundColor: colors.primary },
  quantity: {
    ...typography.bodyStrong,
    color: colors.text,
    minWidth: 28,
    textAlign: "center",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: colors.radius.pill,
  },
  removeText: {
    ...typography.captionStrong,
    color: colors.danger,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  scrollFlex: { flex: 1 },
  scrollSpacer: { height: 140 },
  voucher: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.px4,
  },
  voucherIcon: {
    width: 36,
    height: 36,
    borderRadius: colors.radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.px12,
  },
  voucherTextWrap: { flex: 1, minWidth: 0 },
  voucherText: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  voucherSub: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
  trustRow: {
    flexDirection: "row",
    gap: spacing.px10,
    marginTop: spacing.px16,
  },
  trustItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: colors.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.px12,
    alignItems: "center",
  },
  trustIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  trustLabel: {
    ...typography.captionStrong,
    color: colors.text,
  },
  trustSub: {
    ...typography.micro,
    color: colors.gray,
    marginTop: 1,
  },
  summary: { marginTop: spacing.px16 },
  summaryTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.px12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.px8,
  },
  summaryLabel: {
    ...typography.small,
    color: colors.gray,
  },
  summaryLabelBold: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  summaryLabelMuted: { color: colors.muted },
  summaryValue: {
    ...typography.small,
    color: colors.text,
  },
  summaryValueBold: {
    ...typography.priceSm,
    color: colors.primary,
  },
  summaryValueMuted: { color: colors.gray },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.px8,
  },
  bottomSafe: { backgroundColor: colors.surface },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px12,
    paddingHorizontal: spacing.px16,
    paddingVertical: spacing.px12,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    ...shadows.sticky,
  },
  totalInfo: { flex: 1, minWidth: 0 },
  totalLabel: {
    ...typography.caption,
    color: colors.gray,
  },
  total: {
    ...typography.priceLg,
    color: colors.primary,
    marginTop: 2,
  },
  checkoutBtn: { flexShrink: 0, minWidth: 140 },
});
