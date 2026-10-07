// @ts-nocheck
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Bell from "lucide-react-native/icons/bell";
import BellOff from "lucide-react-native/icons/bell-off";
import Trash from "lucide-react-native/icons/trash";

import Button from "../components/Button";
import Card from "../components/Card";
import FeedbackState from "../components/FeedbackState";
import ScreenHeader from "../components/ScreenHeader";
import StatusBadge from "../components/StatusBadge";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import useRequireAuth from "../hooks/useRequireAuth";
import {
  deletePriceAlert,
  getPriceAlerts,
  updatePriceAlert,
  type PriceAlert,
} from "../services/priceAlertService";
import { formatCurrency } from "../utils/formatters";

const formatDateTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";

export default function PriceAlertsScreen({ navigation }) {
  const isAuthenticated = useRequireAuth(navigation, "PriceAlerts");
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (mode = "initial") => {
      if (!isAuthenticated) return;
      if (mode === "refresh") setIsRefreshing(true);
      else setIsLoading(true);
      setError("");
      try {
        setAlerts(await getPriceAlerts());
      } catch (nextError) {
        setError(nextError.message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isAuthenticated],
  );

  useFocusEffect(useCallback(() => { load("initial"); }, [load]));

  if (!isAuthenticated) return null;

  const handleToggle = async (alert: PriceAlert) => {
    try {
      await updatePriceAlert(alert.id, { isActive: !alert.is_active });
      setAlerts((current) =>
        current.map((a) =>
          a.id === alert.id ? { ...a, is_active: !alert.is_active } : a,
        ),
      );
    } catch (err) {
      Alert.alert("Lỗi", err instanceof Error ? err.message : "Vui lòng thử lại.");
    }
  };

  const handleDelete = (alert: PriceAlert) => {
    Alert.alert(
      "Xóa theo dõi giá?",
      `Bạn sẽ không nhận thông báo cho ${alert.product_name || "sản phẩm"} nữa.`,
      [
        { text: "Không", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePriceAlert(alert.id);
              setAlerts((current) => current.filter((a) => a.id !== alert.id));
            } catch (err) {
              Alert.alert("Lỗi", err instanceof Error ? err.message : "Vui lòng thử lại.");
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <ScreenHeader title="Theo dõi giá" navigation={navigation} />
        <FeedbackState variant="loading" fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScreenHeader title="Theo dõi giá" navigation={navigation} />
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
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {alerts.length === 0 && !error ? (
          <FeedbackState
            variant="empty"
            title="Chưa có theo dõi giá"
            description="Mở chi tiết sản phẩm và chọn “Báo giá khi giảm” để nhận thông báo khi giá thay đổi."
            fullScreen
          >
            <Bell color={colors.muted} size={20} strokeWidth={1.6} />
          </FeedbackState>
        ) : null}

        {alerts.map((alert) => {
          const isActive = Boolean(alert.is_active);
          const currentPrice = Number(alert.current_price || 0);
          const targetPrice = Number(alert.target_price || 0);
          const triggered = currentPrice > 0 && currentPrice <= targetPrice;
          const openProduct = () =>
            navigation.navigate("ProductDetail", {
              productId: alert.product_id,
            });
          return (
            <Card key={alert.id} padding="md" style={styles.card}>
              <View style={styles.cardHeader}>
                <Pressable
                  onPress={openProduct}
                  accessibilityRole="button"
                  accessibilityLabel={`Xem ${alert.product_name || "sản phẩm"}`}
                >
                  {alert.thumbnail_url ? (
                    <Image
                      source={{ uri: alert.thumbnail_url }}
                      style={styles.thumbnail}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.thumbnailPlaceholder}>
                      <Text style={styles.thumbnailEmoji}>📦</Text>
                    </View>
                  )}
                </Pressable>
                <View style={styles.cardInfo}>
                  <Pressable
                    onPress={openProduct}
                    accessibilityRole="button"
                    accessibilityLabel={`Xem ${alert.product_name || "sản phẩm"}`}
                  >
                    <Text style={styles.productName} numberOfLines={2}>
                      {alert.product_name || "Sản phẩm"}
                    </Text>
                  </Pressable>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Giá hiện tại</Text>
                    <Text style={styles.currentPrice}>
                      {formatCurrency(currentPrice)}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Mục tiêu</Text>
                    <Text
                      style={[
                        styles.targetPrice,
                        triggered && styles.targetPriceTriggered,
                      ]}
                    >
                      {formatCurrency(targetPrice)}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => handleDelete(alert)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Xóa theo dõi giá"
                >
                  <Trash color={colors.gray} size={18} strokeWidth={2.2} />
                </Pressable>
              </View>

              {alert.triggered_at ? (
                <View style={styles.triggeredBanner}>
                  <Text style={styles.triggeredText}>
                    ✓ Đã kích hoạt lúc {formatDateTime(alert.triggered_at)}
                  </Text>
                </View>
              ) : null}

              <View style={styles.cardFooter}>
                <StatusBadge
                  label={isActive ? "Đang theo dõi" : "Tạm tắt"}
                  tone={isActive ? "success" : "neutral"}
                  variant="soft"
                />
                <Button
                  label={isActive ? "Tắt theo dõi" : "Bật lại"}
                  variant="ghost"
                  size="sm"
                  fullWidth={false}
                  leadingIcon={(color) =>
                    isActive ? (
                      <BellOff color={color} size={14} strokeWidth={2.4} />
                    ) : (
                      <Bell color={color} size={14} strokeWidth={2.4} />
                    )
                  }
                  onPress={() => handleToggle(alert)}
                />
              </View>
            </Card>
          );
        })}

        {alerts.length > 0 ? (
          <Text style={styles.hint}>
            Nhấn vào sản phẩm để xem chi tiết. Bạn sẽ nhận thông báo khi giá chạm mức đã đặt.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.px16, paddingBottom: spacing.px32 },
  error: {
    ...typography.captionStrong,
    color: colors.red,
    backgroundColor: colors.redLight,
    padding: spacing.px12,
    borderRadius: colors.radius.md,
    marginBottom: spacing.px12,
  },
  card: { marginBottom: spacing.px10 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.px12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: colors.radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  thumbnailPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: colors.radius.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailEmoji: { fontSize: 28 },
  cardInfo: { flex: 1 },
  productName: {
    ...typography.smallStrong,
    color: colors.text,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.px4,
  },
  metaLabel: { ...typography.micro, color: colors.gray },
  currentPrice: {
    ...typography.captionStrong,
    color: colors.text,
  },
  targetPrice: {
    ...typography.captionStrong,
    color: colors.primary,
  },
  targetPriceTriggered: {
    color: colors.green,
    fontWeight: "900",
  },
  triggeredBanner: {
    marginTop: spacing.px8,
    padding: spacing.px8,
    borderRadius: colors.radius.sm,
    backgroundColor: colors.greenLight,
  },
  triggeredText: {
    ...typography.captionStrong,
    color: colors.green,
  },
  cardFooter: {
    marginTop: spacing.px10,
    paddingTop: spacing.px10,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hint: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.px12,
    textAlign: "center",
  },
});