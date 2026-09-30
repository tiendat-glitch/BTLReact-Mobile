import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import useRequireAuth from "../hooks/useRequireAuth";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../services/notificationService";
import { formatDateTime } from "../utils/formatters";

export default function NotificationsScreen({ navigation }) {
  const isAuthenticated = useRequireAuth(navigation, "Notifications");
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError("");
    try { setItems(await getNotifications()); }
    catch (nextError) { setError(nextError.message); }
    finally { setIsLoading(false); }
  }, [isAuthenticated]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  if (!isAuthenticated) return null;

  const open = async (item) => {
    if (!item.is_read) {
      try {
        await markNotificationRead(item.id);
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_read: 1 } : entry));
      } catch (nextError) { setError(nextError.message); return; }
    }
    if (item.reference_type === "ORDER" && item.reference_id) {
      navigation.navigate("OrderDetail", { orderId: item.reference_id });
    }
  };

  const readAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems((current) => current.map((item) => ({ ...item, is_read: 1 })));
    } catch (nextError) { setError(nextError.message); }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Thông báo" navigation={navigation} />
      {isLoading ? <View style={styles.center}><ActivityIndicator color={colors.primary} /></View> : (
        <ScrollView contentContainerStyle={styles.content}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {items.some((item) => !item.is_read) && (
            <TouchableOpacity style={styles.readAll} onPress={readAll}><Text style={styles.readAllText}>Đánh dấu tất cả đã đọc</Text></TouchableOpacity>
          )}
          {items.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>Chưa có thông báo</Text></View> : items.map((item) => (
            <TouchableOpacity key={item.id} style={[styles.card, !item.is_read && styles.unread]} onPress={() => open(item)}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{item.title}</Text>
                {!item.is_read && <View style={styles.dot} />}
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.date}>{formatDateTime(item.created_at)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16 },
  error: { color: colors.red, backgroundColor: "#FEF2F2", padding: 12, borderRadius: 8, marginBottom: 12 },
  readAll: { alignSelf: "flex-end", minHeight: 40, justifyContent: "center" },
  readAllText: { color: colors.primary, fontSize: 12, fontWeight: "800" },
  empty: { alignItems: "center", paddingVertical: 90 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: "900" },
  card: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 10 },
  unread: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  titleRow: { flexDirection: "row", alignItems: "center" },
  title: { flex: 1, color: colors.text, fontSize: 13, fontWeight: "900" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: 8 },
  message: { color: colors.gray, fontSize: 12, lineHeight: 18, marginTop: 6 },
  date: { color: colors.muted, fontSize: 10, marginTop: 8 },
});

