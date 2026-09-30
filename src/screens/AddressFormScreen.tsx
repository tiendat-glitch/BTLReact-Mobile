import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Check from "lucide-react-native/icons/check";
import Save from "lucide-react-native/icons/save";
import type { LatLng } from "react-native-maps";

import FormField from "../components/FormField";
import MapLocationPicker from "../components/MapLocationPicker";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import useRequireAuth from "../hooks/useRequireAuth";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { createAddress, updateAddress } from "../services/addressService";
import type {
  AddressInput,
  ReverseGeocodedFields,
} from "../types/address";

type Props = NativeStackScreenProps<RootStackParamList, "AddressForm">;

const EMPTY_FORM: AddressInput = {
  receiver_name: "",
  receiver_phone: "",
  address_line: "",
  ward: "",
  district: "",
  province: "",
  latitude: null,
  longitude: null,
  is_default: false,
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Không thể lưu địa chỉ.";

export default function AddressFormScreen({ navigation, route }: Props) {
  const isAuthenticated = useRequireAuth(navigation, "Addresses");
  const address = route.params?.address;
  const [form, setForm] = useState<AddressInput>(() => ({
    ...EMPTY_FORM,
    ...(address
      ? {
          receiver_name: address.receiver_name || "",
          receiver_phone: address.receiver_phone || "",
          address_line: address.address_line || "",
          ward: address.ward || "",
          district: address.district || "",
          province: address.province || "",
          latitude:
            address.latitude === null ? null : Number(address.latitude),
          longitude:
            address.longitude === null ? null : Number(address.longitude),
          is_default: Boolean(address.is_default),
        }
      : {}),
  }));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const coordinate = useMemo<LatLng | null>(() => {
    if (
      form.latitude === null ||
      form.longitude === null ||
      !Number.isFinite(form.latitude) ||
      !Number.isFinite(form.longitude)
    ) {
      return null;
    }
    return { latitude: form.latitude, longitude: form.longitude };
  }, [form.latitude, form.longitude]);

  const update = (field: keyof AddressInput) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateFromMap = (
    nextCoordinate: LatLng,
    fields?: ReverseGeocodedFields
  ) => {
    setForm((current) => ({
      ...current,
      latitude: nextCoordinate.latitude,
      longitude: nextCoordinate.longitude,
      ...(fields
        ? {
            address_line: fields.address_line || current.address_line,
            ward: fields.ward || current.ward,
            district: fields.district || current.district,
            province: fields.province || current.province,
          }
        : {}),
    }));
  };

  const submit = async () => {
    const payload: AddressInput = {
      ...form,
      receiver_name: form.receiver_name.trim(),
      receiver_phone: form.receiver_phone.replace(/\s/g, ""),
      address_line: form.address_line.trim(),
      ward: form.ward.trim(),
      district: form.district.trim(),
      province: form.province.trim(),
    };

    if (
      !payload.receiver_name ||
      !payload.receiver_phone ||
      !payload.address_line ||
      !payload.province
    ) {
      setError("Tên, số điện thoại, địa chỉ và tỉnh/thành là bắt buộc.");
      return;
    }
    if (!/^(?:\+84|0)\d{9,10}$/.test(payload.receiver_phone)) {
      setError("Số điện thoại Việt Nam không hợp lệ.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      if (address) await updateAddress(address.id, payload);
      else await createAddress(payload);
      navigation.goBack();
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenHeader
        title={address ? "Sửa địa chỉ" : "Thêm địa chỉ"}
        navigation={navigation}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.sectionTitle}>Thông tin người nhận</Text>
        <View style={styles.section}>
          <FormField
            label="Người nhận *"
            value={form.receiver_name}
            onChangeText={update("receiver_name")}
            autoComplete="name"
            maxLength={150}
          />
          <FormField
            label="Số điện thoại *"
            value={form.receiver_phone}
            onChangeText={update("receiver_phone")}
            keyboardType="phone-pad"
            autoComplete="tel"
            maxLength={20}
          />
        </View>

        <Text style={styles.sectionTitle}>Chọn trên bản đồ</Text>
        <View style={styles.section}>
          <MapLocationPicker value={coordinate} onChange={updateFromMap} />
        </View>

        <Text style={styles.sectionTitle}>Địa chỉ chi tiết</Text>
        <View style={styles.section}>
          <FormField
            label="Số nhà, tên đường *"
            value={form.address_line}
            onChangeText={update("address_line")}
            maxLength={255}
          />
          <FormField
            label="Phường/xã"
            value={form.ward}
            onChangeText={update("ward")}
            maxLength={100}
          />
          <FormField
            label="Quận/huyện"
            value={form.district}
            onChangeText={update("district")}
            maxLength={100}
          />
          <FormField
            label="Tỉnh/thành phố *"
            value={form.province}
            onChangeText={update("province")}
            maxLength={100}
          />
          <Text style={styles.addressHint}>
            Dữ liệu từ bản đồ chỉ là gợi ý. Hãy kiểm tra lại trước khi lưu.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() =>
            setForm((current) => ({
              ...current,
              is_default: !current.is_default,
            }))
          }
          accessibilityRole="checkbox"
          accessibilityState={{ checked: form.is_default }}
        >
          <View
            style={[
              styles.checkbox,
              form.is_default && styles.checkboxSelected,
            ]}
          >
            {form.is_default ? (
              <Check color={colors.white} size={16} strokeWidth={3} />
            ) : null}
          </View>
          <Text style={styles.checkboxText}>Đặt làm địa chỉ mặc định</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.disabled]}
          onPress={submit}
          disabled={isSubmitting}
          accessibilityRole="button"
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Save color={colors.white} size={19} strokeWidth={2.4} />
              <Text style={styles.saveText}>Lưu địa chỉ</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 36 },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 9,
  },
  section: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  addressHint: { color: colors.gray, fontSize: 10, lineHeight: 16 },
  checkboxRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: { color: colors.text, fontSize: 13, marginLeft: 10 },
  error: {
    color: colors.red,
    backgroundColor: colors.redLight,
    borderRadius: 8,
    padding: 11,
    marginBottom: 12,
  },
  saveButton: {
    minHeight: 52,
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.65 },
  saveText: { color: colors.white, fontSize: 14, fontWeight: "900", marginLeft: 8 },
});

