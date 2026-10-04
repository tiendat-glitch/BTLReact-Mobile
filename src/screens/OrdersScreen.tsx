// @ts-nocheck
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import ShoppingBag from "lucide-react-native/icons/shopping-bag";
import Package from "lucide-react-native/icons/package";

import Button from "../components/Button";
import FeedbackState from "../components/FeedbackState";
import ScreenHeader from "../components/ScreenHeader";
import StatusBadge from "../components/StatusBadge";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import useRequireAuth from "../hooks/useRequireAuth";
import { getOrders } from "../services/orderService";
import { formatCurrency, formatDateTime } from "../utils/formatters";

const STATUS_LABELS = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang chuẩn bị",
  PACKED: "Đã đóng gói",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  DELIVERY_FAILED: "Giao thất bại",
};

const STATUS_TONE = {
  PENDING: "warning",
  CONFIRMED: "primary",
  PROCESSING: "primary",
  PACKED: "primary",
  SHIPPING: "primary",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCELLED: "danger",
  DELIVERY_FAILED: "danger",
} as const;

export { STATUS_LABELS };

export default function OrdersScreen({ navigation }) {
  const isAuthenticated = useRequireAuth(navigation, "Orders");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError("");
    try {
      setOrders(await getOrders());
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!isAuthenticated) return null;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScreenHeader title="Đơn hàng của tôi" navigation={navigation} />

      {isLoading ? (
        <FeedbackState variant="loading" fullScreen />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <Button
                variant="ghost"
                size="sm"
                fullWidth={false}
                label="Thử lại"
                onPress={load}
              />
            </View>
          ) : null}

          {!error && orders.length === 0 ? (
            <FeedbackState
              variant="empty"
              title="Chưa có đơn hàng"
              description="Các đơn đã đặt sẽ xuất hiện tại đây."
              fullScreen
            >
              <View style={styles.shopButton}>
                <Button
                  label="Mua sắm ngay"
                  variant="primary"
                  leadingIcon={(color) => (
                    <ShoppingBag color={color} size={18} strokeWidth={2.4} />
                  )}
                  onPress={() => navigation.navigate("Main")}
                />
              </View>
            </FeedbackState>
          ) : (
            orders.map((order) => (
              <View key={order.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.codeRow}>
                    <Package color={colors.primary} size={16} strokeWidth={2.2} />
                    <Text style={styles.code}>{order.order_code}</Text>
                  </View>
                  <StatusBadge
                    label={STATUS_LABELS[order.status] || order.status}
                    tone={STATUS_TONE[order.status] || "primary"}
                    variant="soft"
                  />
                </View>
                <Text style={styles.date}>{formatDateTime(order.created_at)}</Text>
                <View style={styles.totalRow}>
                  <Text style={styles.orderType}>
                    {order.order_type === "CUSTOM_BUILD" ? "PC tự chọn" : "Sản phẩm có sẵn"}
                  </Text>
                  <Text style={styles.total}>{formatCurrency(order.total_amount)}</Text>
                </View>
                <View style={styles.cardAction}>
                  <Button
                    label="Xem chi tiết"
                    variant="tonal"
                    size="sm"
                    fullWidth={false}
                    onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
                  />
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    ...typography.captionStrong,
    color: colors.red,
    flex: 1,
  },
  shopButton: { paddingTop: spacing.px16, width: 200 },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px14,
    marginBottom: spacing.px12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codeRow: { flexDirection: "row", alignItems: "center" },
  code: {
    ...typography.bodyStrong,
    color: colors.text,
    marginLeft: spacing.px8,
  },
  date: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.px8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.px12,
    paddingTop: spacing.px12,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  orderType: {
    ...typography.caption,
    color: colors.gray,
  },
  total: {
    ...typography.title,
    color: colors.primary,
  },
  cardAction: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.px10,
  },
});