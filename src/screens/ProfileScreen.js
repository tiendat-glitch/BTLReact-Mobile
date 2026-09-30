import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import colors from "../constants/colors";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen({ navigation }) {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <Text style={styles.eyebrow}>TÀI KHOẢN</Text>
          <Text style={styles.pageTitle}>Không gian của bạn</Text>
        </View>
        <View style={styles.guest}>
          <Text style={styles.guestTitle}>Đăng nhập để tiếp tục</Text>
          <Text style={styles.guestText}>Theo dõi đơn, quản lý địa chỉ và bảo hành tại một nơi.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Login", { redirectTo: "Main" })}>
            <Text style={styles.primaryText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const confirmLogout = () => Alert.alert("Đăng xuất", "Bạn muốn kết thúc phiên đăng nhập?", [
    { text: "Không", style: "cancel" },
    { text: "Đăng xuất", style: "destructive", onPress: async () => { await logout(); navigation.navigate("Home"); } },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={styles.eyebrow}>TÀI KHOẢN</Text>
        <Text style={styles.pageTitle}>Xin chào, {user.fullName?.split(" ").at(-1)}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profile}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user.fullName?.charAt(0)?.toUpperCase() || "U"}</Text></View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.fullName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            {user.phone ? <Text style={styles.email}>{user.phone}</Text> : null}
          </View>
        </View>
        <Menu label="Đơn hàng của tôi" onPress={() => navigation.navigate("Orders")} />
        <Menu label="Sản phẩm yêu thích" onPress={() => navigation.navigate("Favorites")} />
        <Menu label="So sánh sản phẩm" onPress={() => navigation.navigate("Comparison")} />
        <Menu label="Xây dựng cấu hình PC" onPress={() => navigation.navigate("PcBuilder")} />
        <Menu label="Địa chỉ nhận hàng" onPress={() => navigation.navigate("Addresses")} />
        <Menu label="Thông báo" onPress={() => navigation.navigate("Notifications")} />
        <Menu label="Bảo hành" onPress={() => navigation.navigate("Warranty")} />
        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Menu({ label, onPress, disabled }) {
  return (
    <TouchableOpacity style={[styles.menu, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
      <Text style={styles.menuText}>{label}</Text>
      <Text style={styles.arrow}>{disabled ? "Sắp có" : "›"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pageHeader: { minHeight: 78, justifyContent: "center", paddingHorizontal: 16 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "900" },
  pageTitle: { color: colors.text, fontSize: 22, fontWeight: "900", marginTop: 3 },
  content: { padding: 16 },
  guest: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
  guestTitle: { color: colors.text, fontSize: 20, fontWeight: "900" },
  guestText: { color: colors.gray, fontSize: 13, lineHeight: 20, marginTop: 8, textAlign: "center" },
  primaryButton: { minHeight: 48, backgroundColor: colors.primary, borderRadius: 8, justifyContent: "center", marginTop: 20, paddingHorizontal: 22 },
  primaryText: { color: colors.white, fontWeight: "900" },
  profile: { backgroundColor: colors.white, borderRadius: 8, borderColor: colors.border, borderWidth: 1, padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 16 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.white, fontSize: 22, fontWeight: "900" },
  profileInfo: { flex: 1, marginLeft: 13 },
  name: { color: colors.text, fontSize: 16, fontWeight: "900" },
  email: { color: colors.gray, fontSize: 12, marginTop: 4 },
  menu: { minHeight: 56, backgroundColor: colors.white, borderBottomColor: colors.border, borderBottomWidth: 1, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  menuText: { color: colors.text, fontSize: 14, fontWeight: "700" },
  arrow: { color: colors.gray, fontSize: 12 },
  disabled: { opacity: 0.5 },
  logoutButton: { minHeight: 50, borderColor: colors.red, borderWidth: 1, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 22 },
  logoutText: { color: colors.red, fontSize: 13, fontWeight: "900" },
});
