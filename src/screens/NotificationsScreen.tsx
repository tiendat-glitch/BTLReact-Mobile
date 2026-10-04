// @ts-nocheck
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import BellOff from "lucide-react-native/icons/bell-off";
import CheckCheck from "lucide-react-native/icons/check-check";

import Button from "../components/Button";
import FeedbackState from "../components/FeedbackState";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import useRequireAuth from "../hooks/useRequireAuth";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";
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
    try {
      setItems(await getNotifications());
      return;
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  if (!isAuthenticated) return null;

  const open = async (item) => {
    if (!item.is_read) {
      try {
        await markNotificationRead(item.id);
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, is_read: 1 } : entry,
          ),
        );
      } catch (nextError) {
        setError(nextError.message);
        return;
      }
    }
    if (item.reference_type === "ORDER" && item.reference_id) {
      navigation.navigate("OrderDetail", { orderId: item.reference_id });
    }
    return;
  };

  const readAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems((current) => current.map((item) => ({ ...item, is_read: 1 })));
    } catch (nextError) {
      setError(nextError.message);
    }
    return;
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <ScreenHeader title="Thông báo" navigation={navigation} />
        <FeedbackState variant="loading" fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScreenHeader title="Thông báo" navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {items.some((item) => !item.is_read) ? (
          <View style={styles.readAllRow}>
            <Button
              variant="ghost"
              size="sm"
              fullWidth={false}
              label="Đánh dấu tất cả đã đọc"
              leadingIcon={(color) => (
                <CheckCheck color={color} size={16} strokeWidth={2.2} />
              )}
              onPress={readAll}
            />
          </View>
        ) : null}
        {items.length === 0 ? (
          <FeedbackState
            variant="empty"
            title="Chưa có thông báo"
            description="Cập nhật đơn hàng và khuyến mãi sẽ hiển thị tại đây."
            fullScreen
          >
            <BellOff color={colors.muted} size={20} strokeWidth={1.6} />
          </FeedbackState>
        ) : (
          items.map((item) => (
            <View
              key={item.id}
              style={[styles.card, !item.is_read && styles.unread]}
              onTouchEnd={() => open(item)}
            >
              <View style={styles.titleRow}>
                <Text style={styles.title}>{item.title}</Text>
                {!item.is_read ? <View style={styles.dot} /> : null}
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.date}>{formatDateTime(item.created_at)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.px16 },
  error: {
    ...typography.captionStrong,
    color: colors.red,
    backgroundColor: colors.redLight,
    padding: spacing.px12,
    borderRadius: colors.radius.md,
    marginBottom: spacing.px12,
  },
  readAllRow: { alignSelf: "flex-end", marginBottom: spacing.px8 },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px14,
    marginBottom: spacing.px10,
  },
  unread: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  titleRow: { flexDirection: "row", alignItems: "center" },
  title: {
    ...typography.bodyStrong,
    color: colors.text,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.px8,
  },
  message: {
    ...typography.caption,
    color: colors.gray,
    lineHeight: 18,
    marginTop: spacing.px6,
  },
  date: {
    ...typography.micro,
    color: colors.muted,
    marginTop: spacing.px8,
  },
});