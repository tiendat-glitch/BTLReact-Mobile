import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Check from "lucide-react-native/icons/check";
import Cpu from "lucide-react-native/icons/cpu";
import HardDrive from "lucide-react-native/icons/hard-drive";
import MemoryStick from "lucide-react-native/icons/memory-stick";

import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import { useCart } from "../context/CartContext";
import type { RootStackParamList } from "../navigation/AppNavigator";
import {
  getLaptopUpgradeOptions,
  validateLaptopUpgrade,
  type UpgradeOption,
  type UpgradeProfile,
  type UpgradeValidation,
} from "../services/laptopUpgradeService";
import type { CatalogProduct } from "../types/catalog";
import { formatCurrency } from "../utils/formatters";

type Props = NativeStackScreenProps<RootStackParamList, "LaptopUpgrade">;
type CartActions = {
  addToCart: (
    product: CatalogProduct & { cartKey?: string },
    quantity?: number,
    configured?: unknown
  ) => Promise<boolean>;
};

export default function LaptopUpgradeScreen({ navigation, route }: Props) {
  const { product } = route.params;
  const { addToCart } = useCart() as CartActions;
  const [profile, setProfile] = useState<UpgradeProfile | null>(null);
  const [options, setOptions] = useState<UpgradeOption[]>([]);
  const [ramOptionId, setRamOptionId] = useState<number | string | undefined>();
  const [ssdOptionId, setSsdOptionId] = useState<number | string | undefined>();
  const [validation, setValidation] = useState<UpgradeValidation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    getLaptopUpgradeOptions(product.id)
      .then((result) => {
        setProfile(result.profile);
        setOptions(result.options);
      })
      .catch((error) => Alert.alert("Không hỗ trợ nâng cấp", error.message, [
        { text: "Quay lại", onPress: navigation.goBack },
      ]))
      .finally(() => setIsLoading(false));
  }, [navigation.goBack, product.id]);

  useEffect(() => {
    if (!ramOptionId && !ssdOptionId) {
      setValidation(null);
      return undefined;
    }
    let active = true;
    setIsValidating(true);
    const timeout = setTimeout(() => {
      validateLaptopUpgrade(product.id, {
        productVariantId: product.variantId,
        ramOptionId,
        ssdOptionId,
      })
        .then((result) => {
          if (active) setValidation(result);
        })
        .catch((error) => {
          if (active) {
            setValidation(null);
            Alert.alert("Cấu hình không hợp lệ", error.message);
          }
        })
        .finally(() => {
          if (active) setIsValidating(false);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [product.id, product.variantId, ramOptionId, ssdOptionId]);

  const ramOptions = useMemo(
    () => options.filter((item) => item.type === "RAM" && (!profile || item.capacity_gb <= profile.max_ram_gb)),
    [options, profile]
  );
  const ssdOptions = useMemo(
    () => options.filter((item) => item.type === "SSD" && (!profile || item.capacity_gb <= profile.max_storage_gb)),
    [options, profile]
  );

  const addUpgrade = async () => {
    if (!validation) return;
    setIsAdding(true);
    const configuredProduct = {
      ...product,
      cartKey: `${product.variantId}:${validation.configurationKey}`,
      price: validation.unitPrice,
      oldPrice: validation.unitPrice,
      variantName: [
        product.variantName,
        validation.configuration.ram?.label,
        validation.configuration.ssd?.label,
      ].filter(Boolean).join(" · "),
    };
    try {
      const added = await addToCart(configuredProduct, 1, {
        item_type: "LAPTOP_UPGRADE",
        upgrade: { ramOptionId, ssdOptionId },
      });
      if (added) navigation.navigate("Main", { screen: "Cart" });
      else Alert.alert("Không thể thêm vào giỏ", "Vui lòng thử lại.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Nâng cấp Laptop" navigation={navigation} />
      {isLoading ? <View style={styles.center}><ActivityIndicator color={colors.primary} /></View> : profile ? (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.productCard}>
              <Cpu color={colors.primary} size={24} />
              <View style={styles.productInfo}><Text style={styles.productName}>{product.name}</Text><Text style={styles.muted}>{product.variantName}</Text></View>
            </View>
            <View style={styles.limits}>
              <Text style={styles.limitText}>RAM tối đa {profile.max_ram_gb}GB · {profile.ram_type} · {profile.ram_slots} khe</Text>
              <Text style={styles.limitText}>SSD tối đa {profile.max_storage_gb}GB · {profile.storage_slots} khe</Text>
            </View>

            <Text style={styles.sectionTitle}>Chọn RAM</Text>
            <OptionList icon={<MemoryStick color={colors.primary} size={19} />} options={ramOptions} selectedId={ramOptionId} onSelect={(id) => setRamOptionId((current) => current === id ? undefined : id)} />

            <Text style={styles.sectionTitle}>Chọn SSD</Text>
            <OptionList icon={<HardDrive color={colors.primary} size={19} />} options={ssdOptions} selectedId={ssdOptionId} onSelect={(id) => setSsdOptionId((current) => current === id ? undefined : id)} />

            {validation ? (
              <View style={styles.validation}>
                <Check color={colors.green} size={20} />
                <View style={styles.validationInfo}><Text style={styles.validationTitle}>Cấu hình tương thích</Text><Text style={styles.muted}>Chi phí nâng cấp {formatCurrency(validation.priceAdjustment)}</Text></View>
              </View>
            ) : null}
          </ScrollView>
          <View style={styles.bottom}>
            <View><Text style={styles.bottomLabel}>Giá sau nâng cấp</Text><Text style={styles.total}>{validation ? formatCurrency(validation.unitPrice) : formatCurrency(product.price)}</Text></View>
            <TouchableOpacity style={[styles.addButton, (!validation || isAdding || isValidating) && styles.disabled]} onPress={addUpgrade} disabled={!validation || isAdding || isValidating}>
              {isAdding || isValidating ? <ActivityIndicator color={colors.white} /> : <Text style={styles.addText}>Thêm vào giỏ</Text>}
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </View>
  );
}

function OptionList({ icon, options, selectedId, onSelect }: { icon: React.ReactNode; options: UpgradeOption[]; selectedId?: number | string; onSelect: (id: number | string) => void }) {
  return <View>{options.map((option) => { const selected = selectedId === option.id; return <Pressable key={String(option.id)} style={[styles.option, selected && styles.optionSelected]} onPress={() => onSelect(option.id)}>{icon}<View style={styles.optionInfo}><Text style={styles.optionLabel}>{option.label}</Text><Text style={styles.price}>+{formatCurrency(option.price_delta)}</Text></View><View style={[styles.checkbox, selected && styles.checkboxSelected]}>{selected ? <Check color={colors.white} size={14} /> : null}</View></Pressable>; })}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, center: { flex: 1, alignItems: "center", justifyContent: "center" }, content: { padding: 16, paddingBottom: 112 },
  productCard: { minHeight: 72, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 14 }, productInfo: { flex: 1, marginLeft: 11 }, productName: { color: colors.text, fontSize: 14, fontWeight: "900" }, muted: { color: colors.gray, fontSize: 11, lineHeight: 17, marginTop: 3 },
  limits: { backgroundColor: colors.primaryLight, borderRadius: 8, padding: 12, marginTop: 10 }, limitText: { color: colors.primaryDark, fontSize: 11, lineHeight: 18, fontWeight: "700" }, sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 18, marginBottom: 9 },
  option: { minHeight: 62, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 8 }, optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight }, optionInfo: { flex: 1, marginLeft: 10 }, optionLabel: { color: colors.text, fontSize: 12, fontWeight: "800" }, price: { color: colors.primary, fontSize: 11, fontWeight: "800", marginTop: 3 }, checkbox: { width: 22, height: 22, borderRadius: 6, borderColor: colors.borderStrong, borderWidth: 1, alignItems: "center", justifyContent: "center" }, checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  validation: { flexDirection: "row", alignItems: "center", backgroundColor: colors.greenLight, borderColor: "#BBF7D0", borderWidth: 1, borderRadius: 8, padding: 13, marginTop: 12 }, validationInfo: { flex: 1, marginLeft: 9 }, validationTitle: { color: colors.green, fontSize: 12, fontWeight: "900" },
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0, minHeight: 82, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.white, borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 12 }, bottomLabel: { color: colors.gray, fontSize: 10 }, total: { color: colors.primary, fontSize: 18, fontWeight: "900" }, addButton: { minWidth: 145, minHeight: 50, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16 }, disabled: { opacity: 0.5 }, addText: { color: colors.white, fontSize: 13, fontWeight: "900" },
});

