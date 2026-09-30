import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type LatLng,
  type MapPressEvent,
  type MarkerDragStartEndEvent,
} from "react-native-maps";
import Crosshair from "lucide-react-native/icons/crosshair";
import MapPin from "lucide-react-native/icons/map-pin";

import colors from "../constants/colors";
import type { ReverseGeocodedFields } from "../types/address";

type Props = {
  value: LatLng | null;
  onChange: (coordinate: LatLng, fields?: ReverseGeocodedFields) => void;
};

const DEFAULT_COORDINATE: LatLng = {
  latitude: 10.7769,
  longitude: 106.7009,
};

function mapGeocodedAddress(
  address: Location.LocationGeocodedAddress
): ReverseGeocodedFields {
  const street = [address.streetNumber, address.street]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    address_line: street || address.name || "",
    ward: address.district || "",
    district: address.subregion || "",
    province: address.region || address.city || "",
  };
}

export default function MapLocationPicker({ value, onChange }: Props) {
  const mapRef = useRef<MapView>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [message, setMessage] = useState("");
  const coordinate = value || DEFAULT_COORDINATE;

  const resolveCoordinate = async (nextCoordinate: LatLng) => {
    setIsResolving(true);
    setMessage("");
    try {
      if (Platform.OS === "android") {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          onChange(nextCoordinate);
          setMessage(
            "Đã lưu tọa độ. Cấp quyền vị trí để tự điền các trường địa chỉ."
          );
          return;
        }
      }
      const results = await Location.reverseGeocodeAsync(nextCoordinate);
      onChange(
        nextCoordinate,
        results[0] ? mapGeocodedAddress(results[0]) : undefined
      );
      if (!results[0]) {
        setMessage("Đã chọn vị trí. Vui lòng nhập địa chỉ chi tiết bên dưới.");
      }
    } catch {
      onChange(nextCoordinate);
      setMessage("Không thể tự điền địa chỉ. Tọa độ vẫn được lưu.");
    } finally {
      setIsResolving(false);
    }
  };

  const chooseCurrentLocation = async () => {
    setIsResolving(true);
    setMessage("");
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setMessage("Bạn cần cấp quyền vị trí để dùng vị trí hiện tại.");
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const nextCoordinate = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };
      mapRef.current?.animateToRegion(
        { ...nextCoordinate, latitudeDelta: 0.008, longitudeDelta: 0.008 },
        350
      );
      const results = await Location.reverseGeocodeAsync(nextCoordinate);
      onChange(
        nextCoordinate,
        results[0] ? mapGeocodedAddress(results[0]) : undefined
      );
    } catch {
      setMessage("Không lấy được vị trí hiện tại. Hãy bật GPS và thử lại.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleMapPress = (event: MapPressEvent) => {
    void resolveCoordinate(event.nativeEvent.coordinate);
  };

  const handleDragEnd = (event: MarkerDragStartEndEvent) => {
    void resolveCoordinate(event.nativeEvent.coordinate);
  };

  return (
    <View>
      <View style={styles.toolbar}>
        <View style={styles.toolbarTitle}>
          <MapPin color={colors.primary} size={18} />
          <Text style={styles.title}>Vị trí giao hàng</Text>
        </View>
        <Pressable
          style={styles.locationButton}
          onPress={chooseCurrentLocation}
          disabled={isResolving}
          accessibilityRole="button"
          accessibilityLabel="Dùng vị trí hiện tại"
        >
          {isResolving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Crosshair color={colors.primary} size={18} />
          )}
          <Text style={styles.locationButtonText}>Vị trí hiện tại</Text>
        </Pressable>
      </View>

      <View style={styles.mapFrame}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          initialRegion={{
            ...coordinate,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          }}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
          toolbarEnabled={false}
        >
          <Marker
            coordinate={coordinate}
            draggable
            onDragEnd={handleDragEnd}
            title="Điểm giao hàng"
          />
        </MapView>
        {isResolving ? (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null}
      </View>

      <Text style={styles.hint}>
        Chạm bản đồ hoặc kéo ghim để chọn đúng cổng nhận hàng.
      </Text>
      {value ? (
        <Text style={styles.coordinate}>
          {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
        </Text>
      ) : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
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
  title: { color: colors.text, fontSize: 14, fontWeight: "900", marginLeft: 7 },
  locationButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 11,
  },
  locationButtonText: { color: colors.primary, fontSize: 11, fontWeight: "800", marginLeft: 6 },
  mapFrame: {
    height: 260,
    overflow: "hidden",
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
  },
  map: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  hint: { color: colors.gray, fontSize: 11, lineHeight: 17, marginTop: 8 },
  coordinate: { color: colors.text, fontSize: 10, fontWeight: "700", marginTop: 4 },
  message: { color: colors.red, fontSize: 11, lineHeight: 17, marginTop: 5 },
});
