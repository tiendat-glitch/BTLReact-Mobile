// @ts-nocheck
import React, { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Search from "lucide-react-native/icons/search";
import ShieldCheck from "lucide-react-native/icons/shield-check";
import ShieldOff from "lucide-react-native/icons/shield-off";
import AlertCircle from "lucide-react-native/icons/circle-alert";

import Button from "../components/Button";
import Card from "../components/Card";
import FeedbackState from "../components/FeedbackState";
import ScreenHeader from "../components/ScreenHeader";
import StatusBadge from "../components/StatusBadge";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import useRequireAuth from "../hooks/useRequireAuth";
import type { Warranty, WarrantyStatus } from "../services/warrantyService";
import {
  getWarranties,
  lookupWarranty,
} from "../services/warrantyService";

const STATUS_LABELS = {
  ALL: "Tất cả",
  ACTIVE: "Đang bảo hành",
  EXPIRED: "Đã hết hạn",
  CLAIMED: "Đã claim",
};

const STATUS_TONE = {
  ACTIVE: "success",
  EXPIRED: "neutral",
  CLAIMED: "warning",
};

const STATUS_FILTERS: WarrantyStatus[] = ["ALL", "ACTIVE", "EXPIRED", "CLAIMED"];

const filterWarranties = (items: Warranty[], status: WarrantyStatus) => {
  if (status === "ALL") return items;
  return items.filter((w) => w.status === status);
};

const sortWarranties = (items: Warranty[]) =>
  [...items].sort((a, b) => {
    // Ưu tiên ACTIVE, rồi sắp xếp theo end_date
    if (a.status !== b.status) {
      if (a.status === "ACTIVE") return -1;
      if (b.status === "ACTIVE") return 1;
    }
    return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
  });

const getDaysLeft = (endDateStr: string): number => {
  const end = new Date(endDateStr);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const formatDate = (value: string) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "--";

const CategoryIcon = ({ status }: { status: Warranty["status"] }) => {
  if (status === "ACTIVE") {
    return <ShieldCheck color={colors.green} size={20} strokeWidth={2.2} />;
  }
  if (status === "EXPIRED") {
    return <ShieldOff color={colors.muted} size={20} strokeWidth={2.2} />;
  }
  return <AlertCircle color={colors.yellow} size={20} strokeWidth={2.2} />;
};

export default function WarrantyScreen({ navigation }) {
  const isAuthenticated = useRequireAuth(navigation, "Warranty");
  const [allItems, setAllItems] = useState<Warranty[]>([]);
  const [serial, setSerial] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<WarrantyStatus>("ALL");

  const load = useCallback(
    async (mode = "initial") => {
      if (!isAuthenticated) return;
      if (mode === "refresh") setIsRefreshing(true);
      else setIsLoading(true);
      setError("");
      try {
        setAllItems(await getWarranties());
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

  const handleSearch = async () => {
    if (!serial.trim()) {
      await load("initial");
      setActiveFilter("ALL");
      return;
    }
    setIsSearching(true);
    setError("");
    try {
      const found = await lookupWarranty(serial.trim());
      setAllItems([found]);
      setActiveFilter("ALL");
    } catch (nextError) {
      setAllItems([]);
      setError(nextError.message);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isAuthenticated) return null;

  const filtered = sortWarranties(filterWarranties(allItems, activeFilter));
  const counts = {
    ALL: allItems.length,
    ACTIVE: allItems.filter((w) => w.status === "ACTIVE").length,
    EXPIRED: allItems.filter((w) => w.status === "EXPIRED").length,
    CLAIMED: allItems.filter((w) => w.status === "CLAIMED").length,
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <ScreenHeader title="Bảo hành" navigation={navigation} />
        <FeedbackState variant="loading" fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScreenHeader title="Bảo hành" navigation={navigation} />

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search color={colors.gray} size={18} strokeWidth={2.2} />
          <TextInput
            style={styles.input}
            value={serial}
            onChangeText={setSerial}
            autoCapitalize="characters"
            placeholder="Nhập serial number"
            placeholderTextColor={colors.muted}
            onSubmitEditing={handleSearch}
            accessibilityLabel="Serial cần tra cứu"
          />
        </View>
        <Button
          label="Tra cứu"
          variant="primary"
          size="sm"
          onPress={handleSearch}
          loading={isSearching}
          leadingIcon={(color) => (
            <Search color={color} size={16} strokeWidth={2.4} />
          )}
        />
      </View>

      {/* Filter chips — thanh danh mục trạng thái bảo hành.
          Bug: trước đây ScrollView ngang không giới hạn chiều cao (không
          có maxHeight/height cố định) nên bị stretching full màn, đẩy nội
          dung warranty xuống dưới. Fix bằng cách bỏ ScrollView ngang không
          cần thiết và dùng View flex-wrap với gap. */}
      {allItems.length > 0 && !serial.trim() ? (
        <View style={styles.filterWrap}>
          {STATUS_FILTERS.map((status) => {
            const isActive = activeFilter === status;
            return (
              <Pressable
                key={status}
                style={({ pressed }) => [
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                  pressed ? styles.pressed : null,
                ]}
                onPress={() => setActiveFilter(status)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`${STATUS_LABELS[status]}, ${counts[status]} sản phẩm`}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {STATUS_LABELS[status]}
                </Text>
                <View
                  style={[
                    styles.filterCount,
                    isActive && styles.filterCountActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      isActive && styles.filterCountTextActive,
                    ]}
                  >
                    {counts[status]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

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

        {filtered.length === 0 && !error ? (
          <FeedbackState
            variant="empty"
            title={
              serial.trim()
                ? "Không tìm thấy bảo hành"
                : "Chưa có bảo hành"
            }
            description={
              serial.trim()
                ? `Không có bảo hành với serial "${serial}"`
                : "Bảo hành sẽ xuất hiện khi bạn mua sản phẩm."
            }
            fullScreen
          >
            <ShieldOff color={colors.muted} size={20} strokeWidth={1.6} />
          </FeedbackState>
        ) : (
          filtered.map((item) => {
            const daysLeft = getDaysLeft(item.end_date);
            const isActive = item.status === "ACTIVE";
            const isUrgent = isActive && daysLeft > 0 && daysLeft <= 30;

            return (
              <Card key={item.id} padding="md" style={styles.card}>
                {/* Header row */}
                <View style={styles.cardHeader}>
                  <View style={styles.productInfo}>
                    <CategoryIcon status={item.status} />
                    <View style={styles.productNameRow}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {item.product_name || item.product_display_name || "Sản phẩm"}
                      </Text>
                      {item.variant_name ? (
                        <Text style={styles.variantName} numberOfLines={1}>
                          {item.variant_name}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <StatusBadge
                    label={item.status === "ACTIVE" ? "Còn bảo hành" : item.status === "EXPIRED" ? "Hết hạn" : "Đã claim"}
                    tone={STATUS_TONE[item.status]}
                    variant="soft"
                  />
                </View>

                {/* Thumbnail if available */}
                {item.thumbnail_url ? (
                  <View style={styles.thumbnailRow}>
                    <Image
                      source={{ uri: item.thumbnail_url }}
                      style={styles.thumbnail}
                      resizeMode="contain"
                    />
                    <View style={styles.thumbnailMeta}>
                      {item.order_code ? (
                        <Text style={styles.metaLabel}>
                          Đơn: <Text style={styles.metaValue}>{item.order_code}</Text>
                        </Text>
                      ) : null}
                      {item.sku || item.variant_sku ? (
                        <Text style={styles.metaLabel}>
                          SKU: <Text style={styles.metaValue}>{item.sku || item.variant_sku}</Text>
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ) : null}

                {/* Date info */}
                <View style={styles.dateGrid}>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>Bắt đầu</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(item.start_date)}
                    </Text>
                  </View>
                  <View style={styles.dateDivider} />
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>Hết hạn</Text>
                    <Text
                      style={[
                        styles.dateValue,
                        !isActive && styles.dateValueExpired,
                      ]}
                    >
                      {formatDate(item.end_date)}
                    </Text>
                  </View>
                  {isActive ? (
                    <>
                      <View style={styles.dateDivider} />
                      <View style={styles.dateItem}>
                        <Text style={styles.dateLabel}>Còn lại</Text>
                        <Text
                          style={[
                            styles.dateValue,
                            isUrgent && styles.dateValueUrgent,
                          ]}
                        >
                          {daysLeft > 0
                            ? `${daysLeft} ngày`
                            : "Hết hạn hôm nay"}
                        </Text>
                      </View>
                    </>
                  ) : null}
                </View>

                {/* Countdown bar */}
                {isActive ? (() => {
                  // Tính % dựa trên tổng số ngày bảo hành thực tế, tránh
                  // hard-code 365*2 gây sai lệch cho gói bảo hành 12 tháng.
                  const totalDays = Math.max(
                    1,
                    Math.ceil(
                      (new Date(item.end_date).getTime() -
                        new Date(item.start_date).getTime()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  );
                  const fillPercent = Math.max(
                    0,
                    Math.min(100, (daysLeft / totalDays) * 100),
                  );
                  return (
                    <View style={styles.countdownBar}>
                      <View
                        style={[
                          styles.countdownFill,
                          { width: `${fillPercent}%` },
                          isUrgent && styles.countdownFillUrgent,
                        ]}
                      />
                      {isUrgent ? (
                        <Text style={styles.countdownUrgentText}>
                          ⚠️ Bảo hành sắp hết trong {daysLeft} ngày
                        </Text>
                      ) : null}
                    </View>
                  );
                })() : null}

                {/* Serial */}
                <Text style={styles.serialLabel}>
                  Serial: <Text style={styles.serialValue}>{item.serial_number || "Chưa cấp"}</Text>
                </Text>

                {/* Note */}
                {item.note ? (
                  <Text style={styles.note}>{item.note}</Text>
                ) : null}

                {/* CTA */}
                {item.order_id ? (
                  <Pressable
                    style={styles.orderLink}
                    onPress={() =>
                      navigation.navigate("OrderDetail", {
                        orderId: String(item.order_id),
                      })
                    }
                  >
                    <Text style={styles.orderLinkText}>
                      Xem đơn hàng {item.order_code || ""} →
                    </Text>
                  </Pressable>
                ) : null}
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.px16,
    paddingTop: spacing.px16,
    gap: spacing.px10,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    paddingHorizontal: spacing.px12,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingHorizontal: spacing.px8,
    paddingVertical: 0,
    margin: 0,
  },
  filterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.px16,
    paddingTop: spacing.px12,
    paddingBottom: spacing.px4,
    gap: spacing.px8,
    alignItems: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.px12,
    paddingVertical: spacing.px8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.px6,
    minHeight: 36,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.captionStrong,
    color: colors.gray,
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  filterCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  filterCountActive: {
    backgroundColor: colors.primary,
  },
  filterCountText: {
    ...typography.micro,
    color: colors.gray,
  },
  filterCountTextActive: {
    color: colors.white,
  },
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
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.px10,
  },
  productInfo: { flexDirection: "row", alignItems: "flex-start", flex: 1, gap: spacing.px8 },
  productNameRow: { flex: 1 },
  productName: {
    ...typography.bodyStrong,
    color: colors.text,
    lineHeight: 20,
  },
  variantName: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
  thumbnailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.px12,
    padding: spacing.px8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: colors.radius.sm,
    gap: spacing.px10,
  },
  thumbnail: { width: 48, height: 48, borderRadius: 6 },
  thumbnailMeta: { flex: 1 },
  metaLabel: {
    ...typography.micro,
    color: colors.gray,
  },
  metaValue: {
    ...typography.captionStrong,
    color: colors.text,
  },
  dateGrid: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.px10,
  },
  dateItem: { flex: 1, alignItems: "center" },
  dateDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  dateLabel: {
    ...typography.micro,
    color: colors.gray,
    marginBottom: 2,
  },
  dateValue: {
    ...typography.smallStrong,
    color: colors.text,
  },
  dateValueExpired: { color: colors.muted },
  dateValueUrgent: { color: colors.red },
  countdownBar: {
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    justifyContent: "center",
    marginBottom: spacing.px10,
    position: "relative",
  },
  countdownFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 11,
    backgroundColor: colors.greenLight,
  },
  countdownFillUrgent: {
    backgroundColor: colors.redLight,
  },
  countdownUrgentText: {
    ...typography.micro,
    color: colors.red,
    fontWeight: "700",
    textAlign: "center",
  },
  serialLabel: {
    ...typography.caption,
    color: colors.gray,
    marginBottom: spacing.px6,
  },
  serialValue: {
    ...typography.captionStrong,
    color: colors.text,
    fontFamily: "monospace",
  },
  note: {
    ...typography.caption,
    color: colors.gray,
    lineHeight: 18,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: spacing.px10,
    paddingTop: spacing.px10,
  },
  orderLink: {
    marginTop: spacing.px10,
    alignItems: "flex-end",
  },
  orderLinkText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "700",
  },
});