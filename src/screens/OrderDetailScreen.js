import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import { cancelOrder, getOrder } from "../services/orderService";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { STATUS_LABELS } from "./OrdersScreen";
import useRequireAuth from "../hooks/useRequireAuth";

const TIMELINE = ["PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPING", "DELIVERED", "COMPLETED"];

export default function OrderDetailScreen({ navigation, route }) {
  const isAuthenticated = useRequireAuth(navigation, "Orders");
  const [order, setOrder] = useState(route.params?.order || null);
  const [isLoading, setIsLoading] = useState(!order);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError("");
    try { setOrder(await getOrder(route.params.orderId || route.params.order?.id)); }
    catch (nextError) { setError(nextError.message); }
    finally { setIsLoading(false); }
  }, [isAuthenticated, route.params]);

  useEffect(() => { load(); }, [load]);

  if (!isAuthenticated) return null;

  const confirmCancel = () => Alert.alert("Hủy đơn hàng", "Bạn chắc chắn muốn hủy đơn này?", [
    { text: "Không", style: "cancel" },
    { text: "Hủy đơn", style: "destructive", onPress: async () => {
      try { setOrder(await cancelOrder(order.id, "Khách hàng yêu cầu hủy")); }
      catch (nextError) { setError(nextError.message); }
    } },
  ]);

  if (isLoading) return <View style={styles.container}><ScreenHeader title="Chi tiết đơn" navigation={navigation} /><View style={styles.center}><ActivityIndicator color={colors.primary} /></View></View>;

  if (!order) return <View style={styles.container}><ScreenHeader title="Chi tiết đơn" navigation={navigation} /><View style={styles.center}><Text style={styles.error}>{error || "Không tìm thấy đơn hàng"}</Text></View></View>;

  const currentIndex = TIMELINE.indexOf(order.status);
  return (
    <View style={styles.container}>
      <ScreenHeader title={order.order_code} navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.errorBox}>{error}</Text> : null}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái</Text>
          {order.status === "CANCELLED" || order.status === "DELIVERY_FAILED" ? (
            <Text style={styles.dangerStatus}>{STATUS_LABELS[order.status]}</Text>
          ) : TIMELINE.map((status, index) => (
            <View key={status} style={styles.timelineRow}>
              <View style={[styles.dot, index <= currentIndex && styles.activeDot]} />
              <Text style={[styles.timelineText, index <= currentIndex && styles.activeText]}>{STATUS_LABELS[status]}</Text>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhận hàng</Text>
          <Text style={styles.strong}>{order.delivery_receiver_name} · {order.delivery_phone}</Text>
          <Text style={styles.muted}>{order.delivery_address}</Text>
          <Text style={styles.muted}>Đặt lúc {formatDateTime(order.created_at)}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm</Text>
          {(order.items || []).map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.muted}>{item.variant_name} · {item.sku} · x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Summary label="Tạm tính" value={formatCurrency(order.subtotal)} />
          <Summary label="Giảm giá" value={`-${formatCurrency(order.discount_amount)}`} />
          <Summary label="Phí giao hàng" value={formatCurrency(order.shipping_fee)} />
          <Summary label="Tổng cộng" value={formatCurrency(order.total_amount)} bold />
          <Summary label="Thanh toán" value={`${order.payment_method || "COD"} · ${order.payment_status || "PENDING"}`} />
        </View>
        {order.note ? <View style={styles.section}><Text style={styles.sectionTitle}>Ghi chú</Text><Text style={styles.muted}>{order.note}</Text></View> : null}
        {["PENDING", "CONFIRMED"].includes(order.status) && (
          <TouchableOpacity style={styles.cancelButton} onPress={confirmCancel}>
            <Text style={styles.cancelText}>Hủy đơn hàng</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

function Summary({ label, value, bold }) {
  return <View style={styles.summaryRow}><Text style={[styles.muted, bold && styles.strong]}>{label}</Text><Text style={[styles.summaryValue, bold && styles.total]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  content: { padding: 16, paddingBottom: 36 },
  error: { color: colors.red, textAlign: "center" },
  errorBox: { color: colors.red, backgroundColor: "#FEF2F2", borderRadius: 8, padding: 12, marginBottom: 12 },
  section: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 15, marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "900", marginBottom: 12 },
  timelineRow: { minHeight: 34, flexDirection: "row", alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.lightGray, marginRight: 11 },
  activeDot: { backgroundColor: colors.primary },
  timelineText: { color: colors.muted, fontSize: 12 },
  activeText: { color: colors.text, fontWeight: "700" },
  dangerStatus: { color: colors.red, fontWeight: "900" },
  strong: { color: colors.text, fontSize: 13, fontWeight: "800" },
  muted: { color: colors.gray, fontSize: 12, lineHeight: 19, marginTop: 3 },
  itemRow: { flexDirection: "row", borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 10 },
  itemInfo: { flex: 1, paddingRight: 10 },
  itemName: { color: colors.text, fontSize: 13, fontWeight: "800" },
  itemPrice: { color: colors.primary, fontSize: 12, fontWeight: "800" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 4 },
  summaryValue: { color: colors.text, fontSize: 12 },
  total: { color: colors.primary, fontSize: 16, fontWeight: "900" },
  cancelButton: { minHeight: 48, borderColor: colors.red, borderWidth: 1, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cancelText: { color: colors.red, fontSize: 13, fontWeight: "800" },
});

