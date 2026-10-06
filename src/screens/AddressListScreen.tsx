// AddressListScreen — Quản lý địa chỉ nhận hàng. Hỗ trợ 2 mode:
//   - Bình thường: CRUD, đặt mặc định, thêm/sửa/xóa.
//   - selectMode (khi mở từ Checkout): chọn 1 địa chỉ để quay lại Checkout.
//
// Fix bug: trước đây dùng `onTouchEnd` trên Card nhưng component Card
// không pass prop đó xuống, dẫn đến chọn địa chỉ không hoạt động. Fix
// bằng Pressable bọc ngoài Card; toàn bộ card bấm được trong selectMode.
// Trong non-selectMode, ẩn nút Chọn/Sửa/Xóa bận rộn để UI gọn.
import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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

export default function AddressListScreen({ navigation, route }: any) {
  const isAuthenticated = useRequireAuth(navigation, "Addresses");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const isSelectMode = Boolean(route.params?.selectMode);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError("");
    try {
      setAddresses(await getAddresses());
    } catch (nextError: any) {
      setError(nextError?.message || "Không tải được địa chỉ.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (!isAuthenticated) return null;

  const selectAddress = (address: any) => {
    if (!isSelectMode) return;
    // Quay lại Checkout và merge params. RN7 navigate với route đã tồn tại
    // trong stack sẽ goBack đồng thời cập nhật params.
    navigation.navigate("Checkout", { selectedAddressId: address.id });
  };

  const remove = (address: any) => {
    Alert.alert("Xóa địa chỉ", `Xóa địa chỉ của ${address.receiver_name}?`, [
      { text: "Không", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAddress(address.id);
            await load();
          } catch (nextError: any) {
            setError(nextError?.message || "Không xóa được địa chỉ.");
          }
        },
      },
    ]);
  };

  const makeDefault = async (address: any) => {
    try {
      await setDefaultAddress(address.id);
      await load();
    } catch (nextError: any) {
      setError(nextError?.message || "Không đặt được mặc định.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <ScreenHeader
          title={isSelectMode ? "Chọn địa chỉ" : "Địa chỉ nhận hàng"}
          navigation={navigation}
        />
        <FeedbackState variant="loading" fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader
        title={isSelectMode ? "Chọn địa chỉ" : "Địa chỉ nhận hàng"}
        navigation={navigation}
        subtitle={
          isSelectMode
            ? "Chạm vào địa chỉ để giao hàng tới đó"
            : "Đặt địa chỉ mặc định để hệ thống tự chọn khi đặt hàng"
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        style={styles.scrollFlex}
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {isSelectMode ? (
          <View style={styles.banner}>
            <MapPin color={colors.primary} size={18} strokeWidth={2.2} />
            <Text style={styles.bannerText}>
              Bạn có thể chọn địa chỉ đã có hoặc thêm địa chỉ mới bên dưới.
            </Text>
          </View>
        ) : null}

        {addresses.length === 0 ? (
          <FeedbackState
            variant="empty"
            title="Chưa có địa chỉ"
            description="Thêm địa chỉ để có thể đặt hàng."
            fullScreen
            icon={
              <MapPin color={colors.muted} size={32} strokeWidth={1.6} />
            }
          >
            <View style={styles.shopButton}>
              <Button
                label="Thêm địa chỉ ngay"
                variant="primary"
                leadingIcon={(color: string) => (
                  <Plus color={color} size={18} strokeWidth={2.4} />
                )}
                onPress={() =>
                  navigation.navigate("AddressForm", {
                    selectAfterSave: isSelectMode,
                  })
                }
              />
            </View>
          </FeedbackState>
        ) : (
          addresses.map((address) => {
            const isDefault = Boolean(address.is_default);
            return (
              <Pressable
                key={address.id}
                onPress={() => (isSelectMode ? selectAddress(address) : undefined)}
                disabled={!isSelectMode}
                accessibilityRole={isSelectMode ? "button" : undefined}
                accessibilityLabel={
                  isSelectMode
                    ? `Chọn địa chỉ ${address.receiver_name}`
                    : undefined
                }
                accessibilityState={{
                  disabled: !isSelectMode,
                }}
                style={({ pressed }) => [
                  pressed && isSelectMode ? styles.cardPressed : null,
                ]}
              >
                <Card padding="md" style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardLeft}>
                      <View style={styles.iconBox}>
                        <MapPin
                          color={colors.primary}
                          size={16}
                          strokeWidth={2.2}
                        />
                      </View>
                      <View style={styles.cardLeftInfo}>
                        <Text style={styles.name}>{address.receiver_name}</Text>
                        <Text style={styles.phone}>
                          {address.receiver_phone}
                        </Text>
                      </View>
                    </View>
                    {isDefault ? (
                      <StatusBadge
                        label="Mặc định"
                        tone="primary"
                        variant="soft"
                        icon={
                          <Star
                            color={colors.primary}
                            size={11}
                            strokeWidth={2.2}
                            fill={colors.primary}
                          />
                        }
                      />
                    ) : null}
                  </View>
                  <Text style={styles.address}>{formatAddress(address)}</Text>
                  <View style={styles.actions}>
                    {isSelectMode ? (
                      <Button
                        label="Chọn địa chỉ này"
                        variant="primary"
                        size="sm"
                        fullWidth={false}
                        onPress={() => selectAddress(address)}
                        accessibilityLabel={`Chọn địa chỉ ${address.receiver_name}`}
                      />
                    ) : null}
                    {!isDefault && !isSelectMode ? (
                      <Button
                        label="Đặt mặc định"
                        variant="ghost"
                        size="sm"
                        fullWidth={false}
                        onPress={() => makeDefault(address)}
                      />
                    ) : null}
                    {!isSelectMode ? (
                      <Button
                        label="Sửa"
                        variant="ghost"
                        size="sm"
                        fullWidth={false}
                        leadingIcon={(color: string) => (
                          <Edit color={color} size={14} strokeWidth={2.2} />
                        )}
                        onPress={() =>
                          navigation.navigate("AddressForm", { address })
                        }
                      />
                    ) : null}
                    {!isSelectMode ? (
                      <Button
                        label="Xóa"
                        variant="ghost"
                        size="sm"
                        fullWidth={false}
                        leadingIcon={(color: string) => (
                          <Trash color={color} size={14} strokeWidth={2.2} />
                        )}
                        onPress={() => remove(address)}
                      />
                    ) : null}
                  </View>
                </Card>
              </Pressable>
            );
          })
        )}
      </ScrollView>
      <SafeAreaView edges={["bottom"]} style={styles.bottomSafe}>
        <View style={styles.bottom}>
          <Button
            label="Thêm địa chỉ"
            variant="primary"
            size="lg"
            leadingIcon={(color: string) => (
              <Plus color={color} size={18} strokeWidth={2.4} />
            )}
            onPress={() =>
              navigation.navigate("AddressForm", {
                // Khi đang trong selectMode, sau khi lưu sẽ quay về màn
                // trước (Checkout) thay vì quay về AddressList, và tự
                // chọn địa chỉ mới.
                selectAfterSave: isSelectMode,
              })
            }
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
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px8,
    padding: spacing.px12,
    backgroundColor: colors.primaryLight,
    borderRadius: colors.radius.md,
    borderColor: colors.primarySoft,
    borderWidth: 1,
    marginBottom: spacing.px12,
  },
  bannerText: {
    ...typography.caption,
    color: colors.primary,
    flex: 1,
    lineHeight: 18,
  },
  card: { marginBottom: spacing.px12 },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  cardLeftInfo: { flex: 1, minWidth: 0 },
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
  shopButton: { paddingTop: spacing.px16, width: 240 },
});