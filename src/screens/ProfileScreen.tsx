// ProfileScreen — khi đã đăng nhập: header gradient + avatar/info + menu card.
// Khi chưa đăng nhập: hero CTA đăng nhập / đăng ký.
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { LucideIcon } from "lucide-react-native";
import {
  Heart,
  GitCompareArrows,
  Package,
  Cpu,
  MapPin,
  Bell,
  BellRing,
  ShieldCheck,
  LogOut,
  ChevronRight,
  UserPlus,
  LogIn,
} from "lucide-react-native";

import Avatar from "../components/Avatar";
import Button from "../components/Button";
import Card from "../components/Card";
import FeedbackState from "../components/FeedbackState";
import ListRow from "../components/ListRow";
import StatusBadge from "../components/StatusBadge";
import colors from "../constants/colors";
import shadows from "../constants/shadows";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import { useAuth } from "../context/AuthContext";
import { useCompare } from "../context/CompareContext";

type MenuItem = {
  label: string;
  description?: string;
  icon: LucideIcon;
  onPress: () => void;
  badge?: string;
  tone?: "primary" | "warning" | "success" | "info" | "danger";
  destructive?: boolean;
};

export default function ProfileScreen({ navigation }: any) {
  const { user, isAuthenticated, logout } = useAuth();
  const { products: comparedProducts } = useCompare();

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.guestHero}>
          <View style={styles.guestIcon}>
            <UserPlus
              color={colors.primary}
              size={28}
              strokeWidth={2.2}
            />
          </View>
          <Text style={styles.eyebrow}>TÀI KHOẢN</Text>
          <Text style={styles.guestTitle}>Không gian của bạn</Text>
          <Text style={styles.guestSub}>
            Theo dõi đơn, lưu địa chỉ, yêu thích và bảo hành tại một nơi.
          </Text>
        </View>
        <View style={styles.guestBody}>
          <FeedbackState
            variant="empty"
            title="Đăng nhập để tiếp tục"
            description="Đồng bộ giỏ hàng, danh sách yêu thích và đơn đang xử lý."
          />
          <View style={styles.cta}>
            <Button
              label="Đăng nhập"
              variant="primary"
              size="lg"
              leadingIcon={(color: string) => (
                <LogIn color={color} size={18} strokeWidth={2.4} />
              )}
              onPress={() =>
                navigation.navigate("Login", { redirectTo: "Main" })
              }
            />
            <Button
              label="Tạo tài khoản mới"
              variant="secondary"
              size="lg"
              leadingIcon={(color: string) => (
                <UserPlus color={color} size={18} strokeWidth={2.4} />
              )}
              onPress={() =>
                navigation.navigate("Register", { redirectTo: "Main" })
              }
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = () =>
    Alert.alert("Đăng xuất", "Bạn muốn kết thúc phiên đăng nhập?", [
      { text: "Không", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.navigate("Home");
        },
      },
    ]);

  const menuItems: MenuItem[] = [
    {
      label: "Đơn hàng của tôi",
      description: "Theo dõi trạng thái và lịch sử đơn hàng",
      icon: Package,
      tone: "primary",
      onPress: () => navigation.navigate("Orders"),
    },
    {
      label: "Sản phẩm yêu thích",
      description: "Danh sách sản phẩm bạn đã lưu",
      icon: Heart,
      tone: "danger",
      onPress: () => navigation.navigate("Favorites"),
    },
    {
      label: "Theo dõi giá",
      description: "Nhận thông báo khi giá giảm",
      icon: BellRing,
      tone: "warning",
      onPress: () => navigation.navigate("PriceAlerts"),
    },
    {
      label: "So sánh sản phẩm",
      description: "So sánh tối đa 4 sản phẩm cùng danh mục",
      icon: GitCompareArrows,
      tone: "info",
      badge:
        comparedProducts.length > 0
          ? String(comparedProducts.length)
          : undefined,
      onPress: () => navigation.navigate("Comparison"),
    },
    {
      label: "Xây dựng cấu hình PC",
      description: "Chọn linh kiện tương thích cho bộ PC",
      icon: Cpu,
      tone: "primary",
      onPress: () => navigation.navigate("PcBuilder"),
    },
    {
      label: "Địa chỉ nhận hàng",
      description: "Quản lý địa chỉ giao hàng và mặc định",
      icon: MapPin,
      tone: "primary",
      onPress: () => navigation.navigate("Addresses"),
    },
    {
      label: "Thông báo",
      description: "Cập nhật đơn hàng và khuyến mãi",
      icon: Bell,
      tone: "info",
      onPress: () => navigation.navigate("Notifications"),
    },
    {
      label: "Bảo hành",
      description: "Tra cứu serial và trạng thái bảo hành",
      icon: ShieldCheck,
      tone: "success",
      onPress: () => navigation.navigate("Warranty"),
    },
  ];

  const fullName = user.fullName || user.full_name || "";
  const phone = user.phone || user.phone_number || "";
  const firstName = fullName.split(" ").filter(Boolean)[0] || "bạn";

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHero}>
          <View style={styles.profileRow}>
            <Avatar
              name={fullName || user.email}
              size={64}
              tone="primary"
            />
            <View style={styles.profileInfo}>
              <Text style={styles.greeting}>Xin chào,</Text>
              <Text style={styles.profileName} numberOfLines={1}>
                {fullName || user.email}
              </Text>
              <View style={styles.badgeRow}>
                {phone ? (
                  <StatusBadge
                    label={phone}
                    tone="primary"
                    variant="soft"
                    size="sm"
                  />
                ) : null}
                <StatusBadge
                  label="Thành viên"
                  tone="success"
                  variant="soft"
                  size="sm"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatTile
            label="Đơn hàng"
            value="0"
            tone={colors.primary}
            bg={colors.primaryLight}
          />
          <StatTile
            label="Yêu thích"
            value="0"
            tone={colors.danger}
            bg={colors.dangerLight}
          />
          <StatTile
            label="Voucher"
            value="0"
            tone={colors.accent}
            bg={colors.accentLight}
          />
        </View>

        <Text style={styles.menuTitle}>Quản lý tài khoản</Text>

        <Card padding="none" radius="lg" style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <View key={item.label}>
              <ListRow
                label={item.label}
                description={item.description}
                leadingIcon={item.icon}
                leadingTone={item.tone}
                trailing={item.badge ? "badge" : "chevron"}
                badgeLabel={item.badge}
                onPress={item.onPress}
              />
              {index < menuItems.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          ))}
        </Card>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed ? styles.pressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất"
        >
          <LogOut
            color={colors.danger}
            size={18}
            strokeWidth={2.4}
          />
          <Text style={styles.logoutText}>Đăng xuất</Text>
          <ChevronRight
            color={colors.danger}
            size={18}
            strokeWidth={2.4}
          />
        </Pressable>

        <Text style={styles.versionText}>
          Phiên bản 1.0.0
        </Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({
  label,
  value,
  tone,
  bg,
}: {
  label: string;
  value: string;
  tone: string;
  bg: string;
}) {
  return (
    <View style={[styles.statTile, { backgroundColor: bg }]}>
      <Text style={[styles.statValue, { color: tone }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: tone }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
  },
  guestHero: {
    paddingHorizontal: spacing.px20,
    paddingTop: spacing.px24,
    paddingBottom: spacing.px16,
  },
  guestIcon: {
    width: 56,
    height: 56,
    borderRadius: colors.radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.px16,
  },
  guestTitle: {
    ...typography.h1,
    color: colors.text,
    marginTop: spacing.px6,
  },
  guestSub: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.px6,
    maxWidth: 320,
  },
  guestBody: {
    flex: 1,
    paddingHorizontal: spacing.px16,
    paddingBottom: spacing.px32,
    gap: spacing.px16,
  },
  cta: { gap: spacing.px10 },
  profileHero: {
    margin: spacing.px16,
    padding: spacing.px16,
    backgroundColor: colors.surface,
    borderRadius: colors.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px14,
  },
  profileInfo: { flex: 1 },
  greeting: {
    ...typography.caption,
    color: colors.gray,
  },
  profileName: {
    ...typography.h2,
    color: colors.text,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.px6,
    marginTop: spacing.px8,
    flexWrap: "wrap",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.px10,
    paddingHorizontal: spacing.px16,
    marginBottom: spacing.px8,
  },
  statTile: {
    flex: 1,
    borderRadius: colors.radius.lg,
    padding: spacing.px14,
    alignItems: "flex-start",
  },
  statValue: {
    ...typography.h2,
  },
  statLabel: {
    ...typography.caption,
    marginTop: 2,
  },
  menuTitle: {
    ...typography.h4,
    color: colors.text,
    paddingHorizontal: spacing.px20,
    marginTop: spacing.px16,
    marginBottom: spacing.px8,
  },
  menuCard: {
    marginHorizontal: spacing.px16,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 64,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px10,
    marginHorizontal: spacing.px16,
    marginTop: spacing.px16,
    padding: spacing.px16,
    backgroundColor: colors.dangerLight,
    borderRadius: colors.radius.lg,
    borderWidth: 1,
    borderColor: colors.dangerSoft,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  logoutText: {
    ...typography.bodyStrong,
    color: colors.danger,
    flex: 1,
  },
  versionText: {
    ...typography.caption,
    color: colors.muted,
    textAlign: "center",
    marginTop: spacing.px20,
  },
});
