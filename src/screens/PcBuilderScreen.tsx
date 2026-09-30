import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import CheckCircle2 from "lucide-react-native/icons/circle-check";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import CircleAlert from "lucide-react-native/icons/circle-alert";
import Wrench from "lucide-react-native/icons/wrench";
import X from "lucide-react-native/icons/x";

import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import { useCart } from "../context/CartContext";
import type { RootStackParamList } from "../navigation/AppNavigator";
import {
  getPcBuilderOptions,
  validatePcBuild,
  type BuildValidation,
  type ComponentType,
  type PcComponent,
} from "../services/pcBuilderService";
import { formatCurrency } from "../utils/formatters";

type Props = NativeStackScreenProps<RootStackParamList, "PcBuilder">;
type CartActions = {
  addToCart: (product: PcComponent, quantity?: number) => Promise<boolean>;
};

const COMPONENTS: Array<{ type: ComponentType; label: string; required: boolean }> = [
  { type: "CPU", label: "CPU", required: true },
  { type: "MAINBOARD", label: "Mainboard", required: true },
  { type: "RAM", label: "RAM", required: true },
  { type: "GPU", label: "Card đồ họa", required: false },
  { type: "STORAGE", label: "Ổ cứng", required: true },
  { type: "PSU", label: "Nguồn", required: true },
  { type: "CASE", label: "Vỏ máy", required: true },
  { type: "COOLER", label: "Tản nhiệt", required: false },
];

export default function PcBuilderScreen({ navigation }: Props) {
  const { addToCart } = useCart() as CartActions;
  const [options, setOptions] = useState<Partial<Record<ComponentType, PcComponent[]>>>({});
  const [selections, setSelections] = useState<Partial<Record<ComponentType, PcComponent>>>({});
  const [purpose, setPurpose] = useState("Gaming");
  const [activeType, setActiveType] = useState<ComponentType | null>(null);
  const [validation, setValidation] = useState<BuildValidation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    getPcBuilderOptions()
      .then(setOptions)
      .catch((error) => Alert.alert("Không tải được linh kiện", error.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!Object.keys(selections).length) {
      setValidation(null);
      return undefined;
    }
    let active = true;
    const timeout = setTimeout(() => {
      validatePcBuild(selections)
        .then((result) => {
          if (active) setValidation(result);
        })
        .catch((error) => {
          if (active) Alert.alert("Không kiểm tra được cấu hình", error.message);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [selections]);

  const total = useMemo(
    () => Object.values(selections).reduce((sum, item) => sum + Number(item?.price || 0), 0),
    [selections]
  );

  const addBuildToCart = async () => {
    if (!validation?.compatible || !validation.complete) {
      Alert.alert("Cấu hình chưa hợp lệ", "Chọn đủ linh kiện bắt buộc và xử lý các lỗi tương thích.");
      return;
    }
    setIsAdding(true);
    try {
      for (const product of Object.values(selections)) {
        if (product && !(await addToCart(product))) {
          throw new Error(`Không thể thêm ${product.name}`);
        }
      }
      navigation.navigate("Main", { screen: "Cart" });
    } catch (error) {
      Alert.alert("Không thể thêm cấu hình", error instanceof Error ? error.message : "Vui lòng thử lại.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Xây dựng cấu hình PC" navigation={navigation} />
      {isLoading ? <View style={styles.center}><ActivityIndicator color={colors.primary} /></View> : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.sectionTitle}>Mục đích sử dụng</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {["Gaming", "Văn phòng", "Lập trình", "Đồ họa", "AI / ML"].map((item) => (
                <Pressable key={item} style={[styles.purpose, purpose === item && styles.purposeSelected]} onPress={() => setPurpose(item)}>
                  <Text style={[styles.purposeText, purpose === item && styles.purposeTextSelected]}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Linh kiện</Text>
            {COMPONENTS.map((component) => {
              const selected = selections[component.type];
              return (
                <Pressable key={component.type} style={styles.componentRow} onPress={() => setActiveType(component.type)}>
                  <View style={styles.componentIcon}><Wrench color={colors.primary} size={18} /></View>
                  <View style={styles.componentInfo}>
                    <Text style={styles.componentLabel}>{component.label}{component.required ? " *" : ""}</Text>
                    <Text style={selected ? styles.selectedName : styles.placeholder} numberOfLines={2}>
                      {selected ? `${selected.name} · ${selected.variantName}` : "Chọn linh kiện"}
                    </Text>
                    {selected ? <Text style={styles.price}>{formatCurrency(selected.price)}</Text> : null}
                  </View>
                  <ChevronRight color={colors.gray} size={20} />
                </Pressable>
              );
            })}

            {validation ? (
              <View style={[styles.validation, validation.compatible ? styles.valid : styles.invalid]}>
                {validation.compatible ? <CheckCircle2 color={colors.green} size={20} /> : <CircleAlert color={colors.red} size={20} />}
                <View style={styles.validationText}>
                  <Text style={styles.validationTitle}>{validation.compatible ? "Các linh kiện đang tương thích" : "Cần thay đổi cấu hình"}</Text>
                  {validation.missingTypes.length ? <Text style={styles.issue}>Còn thiếu: {validation.missingTypes.join(", ")}</Text> : null}
                  {validation.issues.map((issue) => <Text key={issue.code} style={styles.issue}>• {issue.message}</Text>)}
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.bottom}>
            <View><Text style={styles.totalLabel}>Tạm tính</Text><Text style={styles.total}>{formatCurrency(total)}</Text></View>
            <TouchableOpacity style={[styles.addButton, (!validation?.compatible || !validation.complete || isAdding) && styles.disabled]} onPress={addBuildToCart} disabled={!validation?.compatible || !validation.complete || isAdding}>
              {isAdding ? <ActivityIndicator color={colors.white} /> : <Text style={styles.addText}>Thêm cấu hình</Text>}
            </TouchableOpacity>
          </View>
        </>
      )}

      <Modal visible={Boolean(activeType)} animationType="slide" transparent onRequestClose={() => setActiveType(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Chọn {COMPONENTS.find((item) => item.type === activeType)?.label}</Text>
              <Pressable style={styles.closeButton} onPress={() => setActiveType(null)}><X color={colors.text} size={22} /></Pressable>
            </View>
            <FlatList
              data={activeType ? options[activeType] || [] : []}
              keyExtractor={(item) => item.variantId}
              contentContainerStyle={styles.optionList}
              renderItem={({ item }) => (
                <Pressable style={styles.optionRow} onPress={() => { if (activeType) setSelections((current) => ({ ...current, [activeType]: item })); setActiveType(null); }}>
                  <View style={styles.componentInfo}><Text style={styles.optionName}>{item.name}</Text><Text style={styles.placeholder}>{item.variantName}</Text></View>
                  <Text style={styles.price}>{formatCurrency(item.price)}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, paddingBottom: 112 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 10, marginBottom: 10 },
  purpose: { minHeight: 40, justifyContent: "center", borderColor: colors.border, borderWidth: 1, borderRadius: 8, backgroundColor: colors.white, paddingHorizontal: 13, marginRight: 8 },
  purposeSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  purposeText: { color: colors.gray, fontSize: 11, fontWeight: "700" },
  purposeTextSelected: { color: colors.white },
  componentRow: { minHeight: 78, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 8 },
  componentIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: colors.primaryLight, marginRight: 10 },
  componentInfo: { flex: 1, paddingRight: 8 },
  componentLabel: { color: colors.gray, fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  selectedName: { color: colors.text, fontSize: 12, fontWeight: "800", lineHeight: 17, marginTop: 3 },
  placeholder: { color: colors.gray, fontSize: 11, lineHeight: 16, marginTop: 3 },
  price: { color: colors.primary, fontSize: 12, fontWeight: "900", marginTop: 4 },
  validation: { flexDirection: "row", borderRadius: 8, borderWidth: 1, padding: 13, marginTop: 12 },
  valid: { backgroundColor: colors.greenLight, borderColor: "#BBF7D0" },
  invalid: { backgroundColor: colors.redLight, borderColor: "#FECACA" },
  validationText: { flex: 1, marginLeft: 9 },
  validationTitle: { color: colors.text, fontSize: 12, fontWeight: "900" },
  issue: { color: colors.gray, fontSize: 10, lineHeight: 16, marginTop: 3 },
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0, minHeight: 82, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.white, borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 12 },
  totalLabel: { color: colors.gray, fontSize: 10 },
  total: { color: colors.primary, fontSize: 18, fontWeight: "900" },
  addButton: { minWidth: 150, minHeight: 50, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16 },
  disabled: { opacity: 0.5 },
  addText: { color: colors.white, fontSize: 13, fontWeight: "900" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.42)" },
  sheet: { height: "78%", backgroundColor: colors.background, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  sheetHeader: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.white, borderBottomColor: colors.border, borderBottomWidth: 1, paddingHorizontal: 16 },
  sheetTitle: { color: colors.text, fontSize: 16, fontWeight: "900" },
  closeButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  optionList: { padding: 12 },
  optionRow: { minHeight: 72, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 8 },
  optionName: { color: colors.text, fontSize: 12, fontWeight: "900" },
});

