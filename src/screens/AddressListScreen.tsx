// @ts-nocheck
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapPin from "lucide-react-native/icons/map-pin";
import Plus from "lucide-react-native/icons/plus";
import Star from "lucide-react-native/icons/star";
import Trash from "lucide-react-native/icons/trash";
import Edit from "lucide-react-native/icons/pencil";

import Button from "../components/Button";
import Card from "../components/Card";
import FeedbackState from "../components/FeedbackState";
import ListRow from "../components/ListRow";
import ScreenHeader from "../components/ScreenHeader";
import StatusBadge from "../components/StatusBadge";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import useRequireAuth from "../hooks/useRequireAuth";
import {
  deleteAddress,
  getAddresses,
  setDefaultAddress,
} from "../services/addressService";
import { formatAddress } from "../utils/formatters";

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

  const makeDefault = async (address) => {
    try {
      await setDefaultAddress(address.id);
      await load();
    } catch (nextError) {
      setError(nextError.message);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <ScreenHeader
          title={route.params?.selectMode ? "Chọn địa chỉ" : "Địa chỉ nhận hàng"}
          navigation={navigation}
        />
        <FeedbackState variant="loading" fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader
        title={route.params?.selectMode ? "Chọn địa chỉ" : "Địa chỉ nhận hàng"}
        navigation={navigation}
      />
      <ScrollView contentContainerStyle={styles.content} style={styles.scrollFlex}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {addresses.length === 0 ? (
          <FeedbackState
            variant="empty"
            title="Chưa có địa chỉ"
            description="Thêm địa chỉ để có thể đặt hàng."
            fullScreen
          >
            <MapPin color={colors.muted} size={20} strokeWidth={1.6} />
          </FeedbackState>
        ) : (
          addresses.map((address) => (
            <Card key={address.id} padding="md" style={styles.card} onTouchEnd={() => selectAddress(address)}>
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconBox}>
                    <MapPin color={colors.primary} size={16} strokeWidth={2.2} />
                  </View>
                  <View>
                    <Text style={styles.name}>{address.receiver_name}</Text>
                    <Text style={styles.phone}>{address.receiver_phone}</Text>
                  </View>
                </View>
                {Boolean(address.is_default) ? (
                  <StatusBadge
                    label="Mặc định"
                    tone="primary"
                    variant="soft"
                    icon={<Star color={colors.primary} size={11} strokeWidth={2.2} fill={colors.primary} />}
                  />
                ) : null}
              </View>
              <Text style={styles.address}>{formatAddress(address)}</Text>
              <View style={styles.actions}>
                {route.params?.selectMode ? (
                  <Button
                    label="Chọn"
                    variant="tonal"
                    size="sm"
                    fullWidth={false}
                    onPress={() => selectAddress(address)}
                  />
                ) : null}
                {!Boolean(address.is_default) ? (
                  <Button
                    label="Đặt mặc định"
                    variant="ghost"
                    size="sm"
                    fullWidth={false}
                    onPress={() => makeDefault(address)}
                  />
                ) : null}
                <Button
                  label="Sửa"
                  variant="ghost"
                  size="sm"
                  fullWidth={false}
                  leadingIcon={(color) => <Edit color={color} size={14} strokeWidth={2.2} />}
                  onPress={() => navigation.navigate("AddressForm", { address })}
                />
                <Button
                  label="Xóa"
                  variant="ghost"
                  size="sm"
                  fullWidth={false}
                  leadingIcon={(color) => <Trash color={color} size={14} strokeWidth={2.2} />}
                  onPress={() => remove(address)}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
      <SafeAreaView edges={["bottom"]} style={styles.bottomSafe}>
        <View style={styles.bottom}>
          <Button
            label="Thêm địa chỉ"
            variant="primary"
            size="lg"
            leadingIcon={(color) => <Plus color={color} size={18} strokeWidth={2.4} />}
            onPress={() => navigation.navigate("AddressForm")}
            fullWidth
          />
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollFlex: { flex: 1 },
  content: { padding: spacing.px16, paddingBottom: spacing.px40 },
  error: {
    ...typography.captionStrong,
    color: colors.red,
    backgroundColor: colors.redLight,
    padding: spacing.px12,
    borderRadius: colors.radius.md,
    marginBottom: spacing.px12,
  },
  card: { marginBottom: spacing.px12 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: colors.radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.px10,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  phone: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
  address: {
    ...typography.small,
    color: colors.text,
    lineHeight: 20,
    marginTop: spacing.px10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: spacing.px8,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: spacing.px12,
    paddingTop: spacing.px12,
  },
  bottomSafe: { backgroundColor: colors.white },
  bottom: {
    paddingHorizontal: spacing.px16,
    paddingTop: spacing.px10,
    paddingBottom: spacing.px10,
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
});