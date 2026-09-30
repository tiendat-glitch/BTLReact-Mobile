import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import useRequireAuth from "../hooks/useRequireAuth";
import { getWarranties, lookupWarranty } from "../services/warrantyService";

export default function WarrantyScreen({ navigation }) {
  const isAuthenticated = useRequireAuth(navigation, "Warranty");
  const [items, setItems] = useState([]);
  const [serial, setSerial] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError("");
    try { setItems(await getWarranties()); }
    catch (nextError) { setError(nextError.message); }
    finally { setIsLoading(false); }
  }, [isAuthenticated]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  if (!isAuthenticated) return null;

  const lookup = async () => {
    if (!serial.trim()) { await load(); return; }
    setIsLoading(true);
    setError("");
    try { setItems([await lookupWarranty(serial)]); }
    catch (nextError) { setItems([]); setError(nextError.message); }
    finally { setIsLoading(false); }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Bảo hành" navigation={navigation} />
      <View style={styles.searchRow}>
        <TextInput style={styles.input} value={serial} onChangeText={setSerial} autoCapitalize="characters" placeholder="Nhập serial number" placeholderTextColor={colors.muted} onSubmitEditing={lookup} />
        <TouchableOpacity style={styles.searchButton} onPress={lookup}><Text style={styles.searchText}>Tra cứu</Text></TouchableOpacity>
      </View>
      {isLoading ? <View style={styles.center}><ActivityIndicator color={colors.primary} /></View> : (
        <ScrollView contentContainerStyle={styles.content}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {items.length === 0 && !error ? <View style={styles.empty}><Text style={styles.emptyTitle}>Chưa có bảo hành</Text></View> : items.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.row}><Text style={styles.serial}>{item.serial_number || "Chưa cấp serial"}</Text><Text style={styles.status}>{item.status}</Text></View>
              <Text style={styles.label}>Bắt đầu: <Text style={styles.value}>{formatDate(item.start_date)}</Text></Text>
              <Text style={styles.label}>Hết hạn: <Text style={styles.value}>{formatDate(item.end_date)}</Text></Text>
              {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const formatDate = (value) => value ? new Date(value).toLocaleDateString("vi-VN") : "--";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: { flexDirection: "row", padding: 16, paddingBottom: 4 },
  input: { flex: 1, minHeight: 48, backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, color: colors.text, paddingHorizontal: 12 },
  searchButton: { minWidth: 82, minHeight: 48, backgroundColor: colors.primary, borderRadius: 8, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  searchText: { color: colors.white, fontSize: 12, fontWeight: "900" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16 },
  error: { color: colors.red, backgroundColor: "#FEF2F2", padding: 12, borderRadius: 8 },
  empty: { alignItems: "center", paddingVertical: 80 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: "900" },
  card: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 15, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  serial: { color: colors.text, fontSize: 14, fontWeight: "900" },
  status: { color: colors.primary, backgroundColor: colors.primaryLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: "900" },
  label: { color: colors.gray, fontSize: 12, marginTop: 5 },
  value: { color: colors.text, fontWeight: "700" },
  note: { color: colors.gray, fontSize: 12, lineHeight: 18, borderTopColor: colors.border, borderTopWidth: 1, marginTop: 12, paddingTop: 10 },
});
