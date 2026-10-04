// Stub for Expo Web: react-native-maps không chạy được trên web.
// Cho phép nhập tọa độ thủ công; flow reverse-geocode được bỏ qua.
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapPin from "lucide-react-native/icons/map-pin";
import colors from "../constants/colors";

export type LatLng = { latitude: number; longitude: number };

export type MapPressEvent = {
  nativeEvent: { coordinate: LatLng };
};

export type MarkerDragStartEndEvent = {
  nativeEvent: { coordinate: LatLng };
};

export type ReverseGeocodedFields = {
  address_line?: string;
  ward?: string;
  district?: string;
  province?: string;
};

type Props = {
  value: LatLng | null;
  onChange: (coordinate: LatLng, fields?: ReverseGeocodedFields) => void;
};

const DEFAULT_COORDINATE: LatLng = {
  latitude: 10.7769,
  longitude: 106.7009,
};

export default function MapLocationPicker({ value, onChange }: Props) {
  const coordinate = value || DEFAULT_COORDINATE;
  const [latText, setLatText] = useState(String(coordinate.latitude));
  const [lngText, setLngText] = useState(String(coordinate.longitude));
  const [hint, setHint] = useState(
    "Bản đồ không khả dụng trên web. Vui lòng nhập tọa độ thủ công."
  );

  const commit = () => {
    const lat = Number(latText.replace(",", "."));
    const lng = Number(lngText.replace(",", "."));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setHint("Tọa độ không hợp lệ. Vui lòng nhập số thập phân.");
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setHint("Tọa độ nằm ngoài phạm vi cho phép.");
      return;
    }
    setHint("Đã lưu tọa độ.");
    onChange({ latitude: lat, longitude: lng });
  };

  return (
    <View>
      <View style={styles.toolbar}>
        <View style={styles.toolbarTitle}>
          <MapPin color={colors.primary} size={18} />
          <Text style={styles.title}>Vị trí giao hàng</Text>
        </View>
      </View>

      <View style={styles.placeholderFrame}>
        <Text style={styles.placeholderText}>
          Bản đồ chỉ hỗ trợ trên thiết bị di động (Android/iOS).
        </Text>
        <Text style={styles.placeholderSub}>
          Nhập lat / lng thủ công bên dưới.
        </Text>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputCol}>
          <Text style={styles.inputLabel}>Latitude</Text>
          <TextInput
            value={latText}
            onChangeText={setLatText}
            keyboardType="numeric"
            style={styles.input}
            placeholder="10.7769"
            placeholderTextColor={colors.gray}
          />
        </View>
        <View style={styles.inputCol}>
          <Text style={styles.inputLabel}>Longitude</Text>
          <TextInput
            value={lngText}
            onChangeText={setLngText}
            keyboardType="numeric"
            style={styles.input}
            placeholder="106.7009"
            placeholderTextColor={colors.gray}
          />
        </View>
      </View>

      <Pressable
        style={styles.saveButton}
        onPress={commit}
        accessibilityRole="button"
        accessibilityLabel="Lưu tọa độ"
      >
        <Text style={styles.saveButtonText}>Lưu tọa độ</Text>
      </Pressable>

      {value ? (
        <Text style={styles.coordinate}>
          {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
        </Text>
      ) : null}
      {hint ? <Text style={styles.message}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  toolbarTitle: { flexDirection: "row", alignItems: "center" },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 7,
  },
  placeholderFrame: {
    height: 140,
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  placeholderText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  placeholderSub: {
    color: colors.gray,
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  inputCol: { flex: 1, marginRight: 8 },
  inputLabel: {
    color: colors.gray,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  input: {
    minHeight: 44,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: colors.text,
    fontSize: 14,
    backgroundColor: colors.surface,
  },
  saveButton: {
    minHeight: 44,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  coordinate: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
  message: {
    color: colors.gray,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
});
