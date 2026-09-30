import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import { getOrders } from "../services/orderService";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import useRequireAuth from "../hooks/useRequireAuth";

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

export default function OrdersScreen({ navigation }) {
  const isAuthenticated = useRequireAuth(navigation, "Orders");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError("");
    try { setOrders(await getOrders()); }
    catch (nextError) { setError(nextError.message); }
    finally { setIsLoading(false); }
  }, [isAuthenticated]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!isAuthenticated) return null;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Đơn hàng của tôi" navigation={navigation} />
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.error}>{error}</Text>
              <TouchableOpacity onPress={load}><Text style={styles.retry}>Thử lại</Text></TouchableOpacity>
            </View>
          ) : null}
          {!error && orders.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
              <Text style={styles.emptyText}>Các đơn đã đặt sẽ xuất hiện tại đây.</Text>
              <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate("Main")}>
                <Text style={styles.shopText}>Mua sắm ngay</Text>
              </TouchableOpacity>
            </View>
          ) : orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.card}
              onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
            >
              <View style={styles.row}>
                <Text style={styles.code}>{order.order_code}</Text>
                <Text style={[styles.status, order.status === "CANCELLED" && styles.cancelled]}>
                  {STATUS_LABELS[order.status] || order.status}
                </Text>
              </View>
              <Text style={styles.date}>{formatDateTime(order.created_at)}</Text>
              <View style={styles.totalRow}>
                <Text style={styles.orderType}>{order.order_type === "CUSTOM_BUILD" ? "PC tự chọn" : "Sản phẩm có sẵn"}</Text>
                <Text style={styles.total}>{formatCurrency(order.total_amount)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export { STATUS_LABELS };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, paddingBottom: 32 },
  errorBox: { backgroundColor: "#FEF2F2", borderRadius: 8, padding: 14 },
  error: { color: colors.red, fontSize: 12 },
  retry: { color: colors.primary, fontWeight: "800", marginTop: 9 },
  empty: { alignItems: "center", paddingVertical: 90 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "900" },
  emptyText: { color: colors.gray, fontSize: 13, marginTop: 7 },
  shopButton: { backgroundColor: colors.primary, borderRadius: 8, marginTop: 18, paddingHorizontal: 18, paddingVertical: 12 },
  shopText: { color: colors.white, fontWeight: "800" },
  card: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 15, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  code: { color: colors.text, fontSize: 14, fontWeight: "900" },
  status: { color: colors.primary, backgroundColor: colors.primaryLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: "800" },
  cancelled: { color: colors.red, backgroundColor: "#FEF2F2" },
  date: { color: colors.gray, fontSize: 11, marginTop: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 15, borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 12 },
  orderType: { color: colors.gray, fontSize: 12 },
  total: { color: colors.primary, fontSize: 15, fontWeight: "900" },
});

