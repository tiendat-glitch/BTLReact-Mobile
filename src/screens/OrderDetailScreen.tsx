// @ts-nocheck
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Check from "lucide-react-native/icons/check";
import CircleAlert from "lucide-react-native/icons/circle-alert";
import CircleCheck from "lucide-react-native/icons/circle-check";
import CircleX from "lucide-react-native/icons/circle-x";
import Truck from "lucide-react-native/icons/truck";
import X from "lucide-react-native/icons/x";

import Button from "../components/Button";
import FeedbackState from "../components/FeedbackState";
import ScreenHeader from "../components/ScreenHeader";
import StatusBadge from "../components/StatusBadge";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import useRequireAuth from "../hooks/useRequireAuth";
import { cancelOrder, getOrder } from "../services/orderService";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { STATUS_LABELS } from "./OrdersScreen";

// Timeline flow thành công (PENDING -> COMPLETED).
// DELIVERY_FAILED là nhánh song song được hiển thị riêng vì cần cảnh báo.
const SUCCESS_TIMELINE = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPING",
  "DELIVERED",
  "COMPLETED",
];

const PAYMENT_LABELS = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán lỗi",
  REFUNDED: "Đã hoàn tiền",
};

const PAYMENT_TONE = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "neutral",
};

const ORDER_STATUS_TONE = {
  PENDING: "warning",
  CONFIRMED: "primary",
  PROCESSING: "primary",
  PACKED: "primary",
  SHIPPING: "primary",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCELLED: "danger",
  DELIVERY_FAILED: "danger",
};

export default function OrderDetailScreen({ navigation, route }) {
  const isAuthenticated = useRequireAuth(navigation, "Orders");
  const [order, setOrder] = useState(route.params?.order || null);
  const [isLoading, setIsLoading] = useState(!order);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (mode = "initial") => {
      if (!isAuthenticated) return;
      if (mode === "refresh") setIsRefreshing(true);
      else setIsLoading(true);
      setError("");
      try {
        const next = await getOrder(
          route.params.orderId || route.params.order?.id,
        );
        setOrder(next);
      } catch (nextError) {
        setError(nextError.message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isAuthenticated, route.params],
  );

  useEffect(() => {
    load("initial");
  }, [load]);

  if (!isAuthenticated) return null;

  const confirmCancel = () =>
    Alert.alert("Hủy đơn hàng", "Bạn chắc chắn muốn hủy đơn này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy đơn",
        style: "destructive",
        onPress: async () => {
          try {
            const next = await cancelOrder(order.id, "Khách hàng yêu cầu hủy");
            setOrder((current) => ({ ...current, ...next }));
          } catch (nextError) {
            setError(nextError.message);
          }
        },
      },
    ]);

  if (isLoading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <ScreenHeader title="Chi tiết đơn" navigation={navigation} />
        <FeedbackState variant="loading" fullScreen />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <ScreenHeader title="Chi tiết đơn" navigation={navigation} />
        <FeedbackState
          variant="error"
          title="Không tìm thấy đơn hàng"
          description={error}
        />
      </SafeAreaView>
    );
  }

  const currentIndex = SUCCESS_TIMELINE.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";
  const isDeliveryFailed = order.status === "DELIVERY_FAILED";
  const isTerminalFailure = isCancelled || isDeliveryFailed;
  const paymentTone = PAYMENT_TONE[order.payment_status] || "warning";

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScreenHeader title={order.order_code} navigation={navigation} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => load("refresh")}
            tintColor={colors.primary}
          />
        }
      >
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ===== STATUS & PAYMENT ===== */}
        <View style={styles.section}>
          <View style={styles.statusHeader}>
            <Text style={styles.sectionTitle}>Trạng thái</Text>
            <StatusBadge
              label={
                STATUS_LABELS[order.status] ||
                order.status ||
                "Không xác định"
              }
              tone={ORDER_STATUS_TONE[order.status] || "neutral"}
              variant="soft"
            />
          </View>

          {isTerminalFailure ? (
            <View
              style={[
                styles.dangerStatus,
                isDeliveryFailed && styles.deliveryFailedBox,
              ]}
            >
              {isCancelled ? (
                <CircleX color={colors.red} size={20} strokeWidth={2.2} />
              ) : (
                <Truck color={colors.red} size={20} strokeWidth={2.2} />
              )}
              <View style={styles.dangerStatusContent}>
                <Text style={styles.dangerStatusText}>
                  {isDeliveryFailed
                    ? "Đơn hàng giao thất bại"
                    : "Đơn hàng đã bị hủy"}
                </Text>
                {order.cancellation_reason ? (
                  <Text style={styles.dangerStatusReason}>
                    Lý do: {order.cancellation_reason}
                  </Text>
                ) : null}
                {isDeliveryFailed ? (
                  <Text style={styles.dangerStatusHint}>
                    Nhân viên sẽ liên hệ bạn để sắp xếp giao lại. Vui lòng
                    giữ điện thoại.
                  </Text>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.timeline}>
              {SUCCESS_TIMELINE.map((status, index) => {
                const reached = index <= currentIndex;
                return (
                  <View key={status} style={styles.timelineRow}>
                    <View
                      style={[styles.dot, reached ? styles.dotActive : null]}
                    >
                      {reached ? (
                        <Check
                          color={colors.white}
                          size={11}
                          strokeWidth={3}
                        />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.timelineText,
                        reached ? styles.timelineTextActive : null,
                      ]}
                    >
                      {STATUS_LABELS[status] || status}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {order.estimated_delivery_at ? (
            <Text style={styles.etaText}>
              Dự kiến giao: {formatDateTime(order.estimated_delivery_at)}
            </Text>
          ) : null}
        </View>

        {/* ===== PAYMENT ===== */}
        <View style={styles.section}>
          <View style={styles.statusHeader}>
            <Text style={styles.sectionTitle}>Thanh toán</Text>
            <StatusBadge
              label={
                PAYMENT_LABELS[order.payment_status] ||
                order.payment_status ||
                "Chờ thanh toán"
              }
              tone={paymentTone}
              variant="soft"
            />
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.muted}>Phương thức</Text>
            <Text style={styles.paymentValue}>
              {order.payment_method || "COD"}
            </Text>
          </View>
          {order.payment_status === "PAID" && order.paid_at ? (
            <Text style={styles.muted}>
              Đã thanh toán lúc {formatDateTime(order.paid_at)}
            </Text>
          ) : null}
        </View>

        {/* ===== RECEIVER ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhận hàng</Text>
          <Text style={styles.strong}>
            {order.delivery_receiver_name} · {order.delivery_phone}
          </Text>
          <Text style={styles.muted}>{order.delivery_address}</Text>
          <Text style={styles.muted}>
            Đặt lúc {formatDateTime(order.created_at)}
          </Text>
          {order.fulfillment_method === "PICKUP" &&
          order.pickup_store_name ? (
            <View style={styles.pickupBox}>
              <Text style={styles.strong}>Nhận tại cửa hàng</Text>
              <Text style={styles.muted}>{order.pickup_store_name}</Text>
              {order.pickup_store_address ? (
                <Text style={styles.muted}>
                  {order.pickup_store_address}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* ===== ITEMS ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm</Text>
          {(order.items || []).map((item) => (
            <View key={item.id} style={styles.itemRow}>
              {item.image_url || item.thumbnail_url ? (
                <Image
                  source={{ uri: item.image_url || item.thumbnail_url }}
                  style={styles.itemImage}
                  resizeMode="cover"
                  accessibilityLabel={`Ảnh ${item.product_name}`}
                />
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Text style={styles.itemImagePlaceholderText}>📦</Text>
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product_name}
                </Text>
                <Text style={styles.muted}>
                  {item.variant_name} · {item.sku} · x{item.quantity}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.subtotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* ===== SUMMARY ===== */}
        <View style={styles.section}>
          <Summary label="Tạm tính" value={formatCurrency(order.subtotal)} />
          <Summary
            label="Giảm giá"
            value={`-${formatCurrency(order.discount_amount)}`}
          />
          <Summary
            label="Phí giao hàng"
            value={formatCurrency(order.shipping_fee)}
          />
          <Summary
            label="Tổng cộng"
            value={formatCurrency(order.total_amount)}
            bold
          />
        </View>

        {order.note ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <Text style={styles.muted}>{order.note}</Text>
          </View>
        ) : null}

        {["PENDING", "CONFIRMED"].includes(order.status) ? (
          <View style={styles.cancelWrap}>
            <Button
              label="Hủy đơn hàng"
              variant="danger"
              leadingIcon={(color) => (
                <X color={color} size={18} strokeWidth={2.4} />
              )}
              onPress={confirmCancel}
            />
          </View>
        ) : null}

        {isDeliveryFailed ? (
          <View style={styles.cancelWrap}>
            <Text style={styles.muted}>
              Cần hỗ trợ? Vui lòng liên hệ CSKH qua mục Thông báo.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Summary({ label, value, bold }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.muted, bold ? styles.summaryLabelBold : null]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, bold ? styles.total : null]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.px16, paddingBottom: spacing.px32 },
  errorBox: {
    backgroundColor: colors.redLight,
    borderColor: colors.redSoft,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    marginBottom: spacing.px12,
  },
  errorText: {
    ...typography.captionStrong,
    color: colors.red,
  },
  section: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px14,
    marginBottom: spacing.px12,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.px12,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.px10,
  },
  timeline: { paddingVertical: spacing.px4 },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 32,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.px10,
  },
  dotActive: { backgroundColor: colors.primary },
  timelineText: {
    ...typography.caption,
    color: colors.muted,
  },
  timelineTextActive: {
    ...typography.smallStrong,
    color: colors.text,
  },
  dangerStatus: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.redLight,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    gap: spacing.px10,
  },
  deliveryFailedBox: {
    backgroundColor: colors.redLight,
    borderColor: colors.redSoft,
    borderWidth: 1,
  },
  dangerStatusContent: { flex: 1 },
  dangerStatusText: {
    ...typography.bodyStrong,
    color: colors.red,
  },
  dangerStatusReason: {
    ...typography.caption,
    color: colors.red,
    marginTop: 4,
    opacity: 0.85,
  },
  dangerStatusHint: {
    ...typography.caption,
    color: colors.text,
    marginTop: 6,
  },
  etaText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.px10,
    fontWeight: "700",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  paymentValue: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  pickupBox: {
    marginTop: spacing.px10,
    padding: spacing.px10,
    backgroundColor: colors.surfaceMuted,
    borderRadius: colors.radius.sm,
  },
  strong: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  muted: {
    ...typography.small,
    color: colors.gray,
    lineHeight: 19,
    marginTop: 3,
  },
  itemRow: {
    flexDirection: "row",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.px10,
    gap: spacing.px10,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
  },
  itemImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  itemImagePlaceholderText: { fontSize: 22 },
  itemInfo: { flex: 1, paddingRight: spacing.px6 },
  itemName: {
    ...typography.smallStrong,
    color: colors.text,
  },
  itemPrice: {
    ...typography.smallStrong,
    color: colors.primary,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  summaryLabelBold: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  summaryValue: {
    ...typography.caption,
    color: colors.text,
  },
  total: {
    ...typography.title,
    color: colors.primary,
  },
  cancelWrap: { marginTop: spacing.px10 },
});