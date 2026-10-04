// @ts-nocheck
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Check from "lucide-react-native/icons/check";
import ChevronDown from "lucide-react-native/icons/chevron-down";
import Save from "lucide-react-native/icons/save";

import AddressPicker from "../components/AddressPicker";
import Button from "../components/Button";
import Card from "../components/Card";
import FormField from "../components/FormField";
import MapLocationPicker from "../components/MapLocationPicker";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import {
  findProvince,
  type District,
  type Province,
} from "../constants/addressVN";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import useRequireAuth from "../hooks/useRequireAuth";
import { createAddress, updateAddress } from "../services/addressService";

const EMPTY_FORM = {
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

const getErrorMessage = (error) =>
  error instanceof Error ? error.message : "Không thể lưu địa chỉ.";

export default function AddressFormScreen({ navigation, route }) {
  const isAuthenticated = useRequireAuth(navigation, "Addresses");
  const address = route.params?.address;

  const initialProvince = useMemo(
    () => (address?.province ? findProvince(address.province) : null),
    [address?.province]
  );

  const [form, setForm] = useState({
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
  });
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    initialProvince
  );
  const [pickerOpen, setPickerOpen] = useState<null | "province" | "district">(
    null
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const coordinate = useMemo(() => {
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

  const update = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateFromMap = (nextCoordinate, fields) => {
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
    if (fields?.province) {
      const matched = findProvince(fields.province);
      if (matched) setSelectedProvince(matched);
    }
  };

  const handleProvinceChange = ({
    name,
    province,
  }: {
    name: string;
    province?: Province;
  }) => {
    setForm((current) => ({
      ...current,
      province: name,
      // reset district khi đổi tỉnh để tránh sai lệch
      district: province && current.district ? "" : current.district,
    }));
    setSelectedProvince(province || null);
  };

  const handleDistrictChange = ({
    name,
  }: {
    name: string;
    district?: District;
  }) => {
    setForm((current) => ({ ...current, district: name }));
  };

  const submit = async () => {
    const payload = {
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
    return;
  };

  if (!isAuthenticated) return null;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScreenHeader
        title={address ? "Sửa địa chỉ" : "Thêm địa chỉ"}
        navigation={navigation}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Text style={styles.sectionTitle}>Thông tin người nhận</Text>
          <Card padding="md">
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
          </Card>

          <Text style={styles.sectionTitle}>Chọn trên bản đồ</Text>
          <Card padding="md">
            <MapLocationPicker value={coordinate} onChange={updateFromMap} />
          </Card>

          <Text style={styles.sectionTitle}>Khu vực giao hàng</Text>
          <Card padding="md">
            <SelectorField
              label="Tỉnh / Thành phố *"
              value={form.province}
              placeholder="Chọn tỉnh thành"
              onPress={() => setPickerOpen("province")}
            />
            <SelectorField
              label="Quận / Huyện"
              value={form.district}
              placeholder={
                selectedProvince
                  ? "Chọn quận huyện"
                  : "Chọn tỉnh thành trước"
              }
              disabled={!selectedProvince}
              onPress={() => setPickerOpen("district")}
            />
            <FormField
              label="Phường / Xã"
              value={form.ward}
              onChangeText={update("ward")}
              placeholder="Nhập phường/xã (không bắt buộc)"
              maxLength={100}
            />
            <FormField
              label="Số nhà, tên đường *"
              value={form.address_line}
              onChangeText={update("address_line")}
              maxLength={255}
            />
            <Text style={styles.addressHint}>
              Bạn có thể gõ để tìm nhanh tỉnh/quận. Dữ liệu từ bản đồ chỉ là gợi ý,
              hãy kiểm tra lại trước khi lưu.
            </Text>
          </Card>

          <Pressable
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
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label="Lưu địa chỉ"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            leadingIcon={(color) => (
              <Save color={color} size={18} strokeWidth={2.4} />
            )}
            onPress={submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <AddressPicker
        visible={pickerOpen === "province"}
        mode="province"
        title="Chọn Tỉnh / Thành phố"
        initialValue={form.province}
        onClose={() => setPickerOpen(null)}
        onSelect={handleProvinceChange}
      />
      <AddressPicker
        visible={pickerOpen === "district"}
        mode="district"
        title="Chọn Quận / Huyện"
        selectedProvince={selectedProvince}
        initialValue={form.district}
        onClose={() => setPickerOpen(null)}
        onSelect={handleDistrictChange}
      />
    </SafeAreaView>
  );
}

function SelectorField({ label, value, placeholder, onPress, disabled }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.selector,
        pressed && !disabled && styles.selectorPressed,
        disabled && styles.selectorDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.selectorText}>
        <Text style={styles.selectorLabel}>{label}</Text>
        <Text
          style={[styles.selectorValue, !value && styles.selectorPlaceholder]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
      </View>
      <ChevronDown color={colors.gray} size={20} strokeWidth={2.2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.px16, paddingBottom: spacing.px32 },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.px10,
    marginBottom: spacing.px8,
  },
  addressHint: {
    ...typography.caption,
    color: colors.gray,
    lineHeight: 16,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.px10,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  selectorPressed: { opacity: 0.6 },
  selectorDisabled: { opacity: 0.45 },
  selectorText: { flex: 1, paddingRight: spacing.px8 },
  selectorLabel: {
    ...typography.captionStrong,
    color: colors.gray,
    marginBottom: 2,
  },
  selectorValue: {
    ...typography.body,
    color: colors.text,
  },
  selectorPlaceholder: { color: colors.muted },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    marginTop: spacing.px12,
    marginBottom: spacing.px12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: colors.radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.px10,
  },
  error: {
    ...typography.captionStrong,
    color: colors.red,
    backgroundColor: colors.redLight,
    borderRadius: colors.radius.md,
    padding: spacing.px10,
    marginBottom: spacing.px12,
  },
});
