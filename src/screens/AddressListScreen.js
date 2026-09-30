import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import {
  deleteAddress,
  getAddresses,
  setDefaultAddress,
} from "../services/addressService";
import { formatAddress } from "../utils/formatters";
import useRequireAuth from "../hooks/useRequireAuth";

export default function AddressListScreen({ navigation, route }) {
  const isAuthenticated = useRequireAuth(navigation, "Addresses");
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError("");
    try {
      setAddresses(await getAddresses());
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!isAuthenticated) return null;

  const selectAddress = (address) => {
    if (route.params?.selectMode) {
      navigation.navigate("Checkout", { selectedAddressId: address.id });
    }
  };

  const remove = (address) => {
    Alert.alert("Xóa địa chỉ", `Xóa địa chỉ của ${address.receiver_name}?`, [
      { text: "Không", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAddress(address.id);
            await load();
          } catch (nextError) {
            setError(nextError.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={route.params?.selectMode ? "Chọn địa chỉ" : "Địa chỉ nhận hàng"} navigation={navigation} />
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {addresses.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Chưa có địa chỉ</Text>
              <Text style={styles.emptyText}>Thêm địa chỉ để có thể đặt hàng.</Text>
            </View>
          ) : addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={styles.card}
              onPress={() => selectAddress(address)}
              disabled={!route.params?.selectMode}
              accessibilityRole={route.params?.selectMode ? "button" : undefined}
            >
              <View style={styles.cardTop}>
                <Text style={styles.name}>{address.receiver_name}</Text>
                {Boolean(address.is_default) && <Text style={styles.defaultTag}>Mặc định</Text>}
              </View>
              <Text style={styles.phone}>{address.receiver_phone}</Text>
              <Text style={styles.address}>{formatAddress(address)}</Text>
              <View style={styles.actions}>
                {!Boolean(address.is_default) && (
                  <TouchableOpacity onPress={async () => { await setDefaultAddress(address.id); await load(); }}>
                    <Text style={styles.actionText}>Đặt mặc định</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => navigation.navigate("AddressForm", { address })}>
                  <Text style={styles.actionText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => remove(address)}>
                  <Text style={styles.deleteText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddressForm")}
        accessibilityRole="button"
      >
        <Text style={styles.addText}>+ Thêm địa chỉ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, paddingBottom: 92 },
  error: { color: colors.red, backgroundColor: "#FEF2F2", padding: 12, borderRadius: 8, marginBottom: 12 },
  empty: { alignItems: "center", paddingVertical: 70 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "900" },
  emptyText: { color: colors.gray, fontSize: 13, marginTop: 7 },
  card: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 15, marginBottom: 12 },
  cardTop: { flexDirection: "row", alignItems: "center" },
  name: { color: colors.text, fontSize: 15, fontWeight: "900" },
  defaultTag: { color: colors.primary, backgroundColor: colors.primaryLight, fontSize: 10, fontWeight: "800", marginLeft: 9, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  phone: { color: colors.gray, fontSize: 12, marginTop: 6 },
  address: { color: colors.text, fontSize: 13, lineHeight: 20, marginTop: 6 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 20, borderTopColor: colors.border, borderTopWidth: 1, marginTop: 13, paddingTop: 12 },
  actionText: { color: colors.primary, fontSize: 12, fontWeight: "700" },
  deleteText: { color: colors.red, fontSize: 12, fontWeight: "700" },
  addButton: { position: "absolute", left: 16, right: 16, bottom: 16, minHeight: 52, borderRadius: 8, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  addText: { color: colors.white, fontSize: 14, fontWeight: "900" },
});

