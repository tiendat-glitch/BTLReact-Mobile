// @ts-nocheck
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
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CheckCircle2 from "lucide-react-native/icons/circle-check";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import CircleAlert from "lucide-react-native/icons/circle-alert";
import Save from "lucide-react-native/icons/save";
import ShoppingCart from "lucide-react-native/icons/shopping-cart";
import Wrench from "lucide-react-native/icons/wrench";
import X from "lucide-react-native/icons/x";

import Button from "../components/Button";
import Card from "../components/Card";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import { useCart } from "../context/CartContext";
import {
  saveSelectionsAsBuild,
} from "../services/customBuildService";
import {
  getPcBuilderOptions,
  validatePcBuild,
  type ComponentType,
  type PcComponent,
} from "../services/pcBuilderService";
import { formatCurrency } from "../utils/formatters";

const COMPONENTS = [
  { type: "CPU", label: "CPU", required: true },
  { type: "MAINBOARD", label: "Mainboard", required: true },
  { type: "RAM", label: "RAM", required: true },
  { type: "GPU", label: "Card đồ họa", required: false },
  { type: "STORAGE", label: "Ổ cứng", required: true },
  { type: "PSU", label: "Nguồn", required: true },
  { type: "CASE", label: "Vỏ máy", required: true },
  { type: "COOLER", label: "Tản nhiệt", required: false },
];

const PURPOSES = [
  { code: "Gaming", label: "Gaming" },
  { code: "Văn phòng", label: "Văn phòng" },
  { code: "Lập trình", label: "Lập trình" },
  { code: "Đồ họa", label: "Đồ họa" },
  { code: "AI / ML", label: "AI / ML" },
];

const SPEC_DETAIL_FOR_TYPE: Record<ComponentType, string[]> = {
  CPU: ["socket"],
  MAINBOARD: ["socket", "memoryType"],
  RAM: ["memoryType"],
  GPU: ["lengthMm"],
  STORAGE: [],
  PSU: ["psuWatts"],
  CASE: ["maxGpuLengthMm"],
  COOLER: ["socket"],
};

const formatSpecValue = (key: string, value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null;
  switch (key) {
    case "socket":
      return `Socket: ${value}`;
    case "memoryType":
      return `RAM: ${value}`;
    case "lengthMm":
      return `Dài ${value}mm`;
    case "maxGpuLengthMm":
      return `Hỗ trợ GPU dài đến ${value}mm`;
    case "psuWatts":
      return `${value}W`;
    default:
      return null;
  }
};

export default function PcBuilderScreen({ navigation }) {
  const { addToCart } = useCart();
  const [options, setOptions] = useState<Record<ComponentType, PcComponent[]>>({} as Record<ComponentType, PcComponent[]>);
  const [selections, setSelections] = useState<Partial<Record<ComponentType, PcComponent>>>({});
  const [purpose, setPurpose] = useState("Gaming");
  const [activeType, setActiveType] = useState<ComponentType | null>(null);
  const [validation, setValidation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [buildName, setBuildName] = useState("");

  useEffect(() => {
    getPcBuilderOptions()
      .then(setOptions)
      .catch((error) =>
        Alert.alert("Không tải được linh kiện", error.message),
      )
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
          if (active)
            Alert.alert("Không kiểm tra được cấu hình", error.message);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [selections]);

  const total = useMemo(
    () =>
      Object.values(selections).reduce(
        (sum, item) => sum + Number(item?.price || 0),
        0,
      ),
    [selections],
  );

  const estimatedWattage = useMemo(() => {
    const psu = selections.PSU?.psuWatts ?? 0;
    const recommended = selections.GPU?.recommendedPsuWatts ?? 0;
    return { psu, recommended };
  }, [selections.PSU, selections.GPU]);

  const wattageOk = useMemo(() => {
    if (!estimatedWattage.psu || !estimatedWattage.recommended) return null;
    return estimatedWattage.psu >= estimatedWattage.recommended;
  }, [estimatedWattage]);

  const addBuildToCart = async () => {
    if (!validation?.compatible || !validation.complete) {
      Alert.alert(
        "Cấu hình chưa hợp lệ",
        "Chọn đủ linh kiện bắt buộc và xử lý các lỗi tương thích.",
      );
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
      Alert.alert(
        "Không thể thêm cấu hình",
        error instanceof Error ? error.message : "Vui lòng thử lại.",
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveBuild = async () => {
    const name = buildName.trim() || `Cấu hình ${new Date().toLocaleString("vi-VN")}`;
    if (!Object.keys(selections).length) {
      Alert.alert("Chưa có linh kiện", "Hãy chọn ít nhất một linh kiện trước khi lưu.");
      return;
    }
    setIsSaving(true);
    try {
      await saveSelectionsAsBuild({ selections, name });
      Alert.alert("Đã lưu cấu hình", `Cấu hình "${name}" đã được lưu vào tài khoản của bạn.`, [
        { text: "Tiếp tục mua" },
      ]);
      setShowSaveModal(false);
      setBuildName("");
    } catch (error) {
      Alert.alert(
        "Không thể lưu cấu hình",
        error instanceof Error ? error.message : "Vui lòng thử lại.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScreenHeader title="Xây dựng cấu hình PC" navigation={navigation} />
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.sectionTitle}>Mục đích sử dụng</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.purposeList}
            >
              {PURPOSES.map((item) => (
                <Pressable
                  key={item.code}
                  style={[
                    styles.purpose,
                    purpose === item.code && styles.purposeSelected,
                  ]}
                  onPress={() => setPurpose(item.code)}
                >
                  <Text
                    style={[
                      styles.purposeText,
                      purpose === item.code && styles.purposeTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Linh kiện</Text>
            {COMPONENTS.map((component) => {
              const selected = selections[component.type];
              return (
                <Pressable
                  key={component.type}
                  style={styles.componentRow}
                  onPress={() => setActiveType(component.type)}
                >
                  <View style={styles.componentIcon}>
                    <Wrench color={colors.primary} size={18} strokeWidth={2.2} />
                  </View>
                  <View style={styles.componentInfo}>
                    <Text style={styles.componentLabel}>
                      {component.label}
                      {component.required ? " *" : ""}
                    </Text>
                    <Text
                      style={selected ? styles.selectedName : styles.placeholder}
                      numberOfLines={2}
                    >
                      {selected
                        ? `${selected.name} · ${selected.variantName}`
                        : "Chọn linh kiện"}
                    </Text>
                    {selected ? (
                      <Text style={styles.price}>
                        {formatCurrency(selected.price)}
                      </Text>
                    ) : null}
                  </View>
                  <ChevronRight color={colors.gray} size={20} />
                </Pressable>
              );
            })}

            {validation ? (
              <View
                style={[
                  styles.validation,
                  validation.compatible ? styles.valid : styles.invalid,
                ]}
              >
                {validation.compatible ? (
                  <CheckCircle2 color={colors.green} size={20} strokeWidth={2.2} />
                ) : (
                  <CircleAlert color={colors.red} size={20} strokeWidth={2.2} />
                )}
                <View style={styles.validationText}>
                  <Text style={styles.validationTitle}>
                    {validation.compatible
                      ? "Các linh kiện đang tương thích"
                      : "Cần thay đổi cấu hình"}
                  </Text>
                  {validation.missingTypes.length ? (
                    <Text style={styles.issue}>
                      Còn thiếu: {validation.missingTypes.join(", ")}
                    </Text>
                  ) : null}
                  {validation.issues.map((issue) => (
                    <Text key={issue.code} style={styles.issue}>
                      • {issue.message}
                    </Text>
                  ))}
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.bottom}>
            <View style={styles.bottomLeft}>
              <View>
                <Text style={styles.totalLabel}>Tạm tính</Text>
                <Text style={styles.total}>{formatCurrency(total)}</Text>
              </View>
              {estimatedWattage.psu ? (
                <Text
                  style={[
                    styles.wattageText,
                    wattageOk === false && styles.wattageTextBad,
                    wattageOk === true && styles.wattageTextGood,
                  ]}
                >
                  PSU {estimatedWattage.psu}W
                  {estimatedWattage.recommended
                    ? ` · Cần ${estimatedWattage.recommended}W`
                    : ""}
                  {wattageOk === false
                    ? " ⚠️"
                    : wattageOk === true
                      ? " ✓"
                      : ""}
                </Text>
              ) : null}
            </View>
            <View style={styles.bottomActions}>
              <Button
                label="Lưu"
                variant="ghost"
                size="md"
                fullWidth={false}
                leadingIcon={(color) => (
                  <Save color={color} size={16} strokeWidth={2.4} />
                )}
                onPress={() => setShowSaveModal(true)}
                disabled={!Object.keys(selections).length || isSaving}
                accessibilityLabel="Lưu cấu hình"
              />
              <Button
                label="Thêm vào giỏ"
                variant="primary"
                size="md"
                loading={isAdding}
                leadingIcon={(color) => (
                  <ShoppingCart color={color} size={16} strokeWidth={2.4} />
                )}
                onPress={addBuildToCart}
                disabled={
                  !validation?.compatible || !validation.complete || isAdding
                }
              />
            </View>
          </View>
        </>
      )}

      {/* Sheet chọn linh kiện */}
      <Modal
        visible={Boolean(activeType)}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveType(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                Chọn {COMPONENTS.find((item) => item.type === activeType)?.label}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                fullWidth={false}
                label=""
                accessibilityLabel="Đóng"
                leadingIcon={(color) => (
                  <X color={color} size={20} strokeWidth={2.4} />
                )}
                onPress={() => setActiveType(null)}
              />
            </View>
            <FlatList
              data={activeType ? options[activeType] || [] : []}
              keyExtractor={(item) => item.variantId}
              contentContainerStyle={styles.optionList}
              renderItem={({ item }) => {
                const specKeys = activeType
                  ? SPEC_DETAIL_FOR_TYPE[activeType]
                  : [];
                const specs = specKeys
                  .map((k) =>
                    formatSpecValue(
                      k,
                      (item as unknown as Record<string, unknown>)[k],
                    ),
                  )
                  .filter(Boolean) as string[];
                const isLowStock = item.stockQuantity <= 3;
                return (
                  <Pressable
                    style={styles.optionRow}
                    onPress={() => {
                      if (activeType)
                        setSelections((current) => ({
                          ...current,
                          [activeType]: item,
                        }));
                      setActiveType(null);
                    }}
                  >
                    <View style={styles.optionImageBox}>
                      {item.imageUrl ? (
                        <View style={styles.optionImage}>
                          <Text style={styles.optionImageEmoji}>
                            {item.emoji || "🔧"}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.optionImageEmoji}>
                          {item.emoji || "🔧"}
                        </Text>
                      )}
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={styles.optionName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.optionVariant} numberOfLines={1}>
                        {item.variantName}
                      </Text>
                      {specs.length > 0 ? (
                        <View style={styles.optionSpecs}>
                          {specs.map((spec) => (
                            <Text key={spec} style={styles.optionSpec}>
                              {spec}
                            </Text>
                          ))}
                        </View>
                      ) : null}
                      <Text
                        style={[
                          styles.optionStock,
                          isLowStock && styles.optionStockLow,
                        ]}
                      >
                        {isLowStock
                          ? `Chỉ còn ${item.stockQuantity} sp`
                          : `Còn ${item.stockQuantity} sp`}
                      </Text>
                    </View>
                    <Text style={styles.price}>
                      {formatCurrency(item.price)}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Modal lưu build */}
      <Modal
        visible={showSaveModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.saveOverlay}>
          <View style={styles.saveSheet}>
            <Text style={styles.saveTitle}>Lưu cấu hình</Text>
            <Text style={styles.saveDescription}>
              Đặt tên để dễ nhớ. Bạn có thể dùng lại từ danh sách cấu hình đã
              lưu trong tài khoản.
            </Text>
            <TextInput
              style={styles.saveInput}
              value={buildName}
              onChangeText={setBuildName}
              placeholder="Ví dụ: PC Gaming 4K 2024"
              placeholderTextColor={colors.muted}
              autoFocus
              maxLength={120}
              accessibilityLabel="Tên cấu hình"
            />
            <View style={styles.saveActions}>
              <Button
                label="Huỷ"
                variant="ghost"
                fullWidth={false}
                onPress={() => setShowSaveModal(false)}
              />
              <Button
                label="Lưu cấu hình"
                variant="primary"
                fullWidth={false}
                loading={isSaving}
                onPress={handleSaveBuild}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.px16, paddingBottom: spacing.px32 },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.px10,
    marginBottom: spacing.px10,
  },
  purposeList: { gap: spacing.px8, paddingBottom: spacing.px4 },
  purpose: {
    minHeight: 40,
    justifyContent: "center",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.px12,
    marginRight: spacing.px8,
  },
  purposeSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  purposeText: { ...typography.captionStrong, color: colors.gray },
  purposeTextSelected: { color: colors.white },
  componentRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    marginBottom: spacing.px8,
  },
  componentIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: colors.radius.md,
    backgroundColor: colors.primaryLight,
    marginRight: spacing.px10,
  },
  componentInfo: { flex: 1, paddingRight: spacing.px8 },
  componentLabel: {
    ...typography.micro,
    color: colors.gray,
    textTransform: "uppercase",
  },
  selectedName: {
    ...typography.smallStrong,
    color: colors.text,
    lineHeight: 17,
    marginTop: 3,
  },
  placeholder: {
    ...typography.caption,
    color: colors.gray,
    lineHeight: 16,
    marginTop: 3,
  },
  price: {
    ...typography.smallStrong,
    color: colors.primary,
    marginTop: spacing.px4,
  },
  validation: {
    flexDirection: "row",
    borderRadius: colors.radius.md,
    borderWidth: 1,
    padding: spacing.px12,
    marginTop: spacing.px12,
  },
  valid: { backgroundColor: colors.greenLight, borderColor: colors.greenSoft },
  invalid: { backgroundColor: colors.redLight, borderColor: colors.redSoft },
  validationText: { flex: 1, marginLeft: spacing.px8 },
  validationTitle: { ...typography.smallStrong, color: colors.text },
  issue: {
    ...typography.caption,
    color: colors.gray,
    lineHeight: 16,
    marginTop: 3,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.px16,
    paddingTop: spacing.px10,
    paddingBottom: spacing.px16,
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.px10,
  },
  bottomLeft: { flex: 1 },
  bottomActions: { flexDirection: "row", gap: spacing.px8, alignItems: "center" },
  totalLabel: { ...typography.caption, color: colors.gray },
  total: { ...typography.priceLg, color: colors.primary, marginTop: 2 },
  wattageText: {
    ...typography.micro,
    color: colors.gray,
    marginTop: 4,
    fontWeight: "700",
  },
  wattageTextGood: { color: colors.green },
  wattageTextBad: { color: colors.red },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.overlay.modal,
  },
  sheet: {
    height: "78%",
    backgroundColor: colors.background,
    borderTopLeftRadius: colors.radius.lg,
    borderTopRightRadius: colors.radius.lg,
  },
  sheetHeader: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.px16,
  },
  sheetTitle: { ...typography.title, color: colors.text },
  optionList: { padding: spacing.px12 },
  optionRow: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    marginBottom: spacing.px8,
    gap: spacing.px10,
  },
  optionImageBox: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: colors.radius.sm,
  },
  optionImage: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  optionImageEmoji: { fontSize: 32 },
  optionContent: { flex: 1, paddingRight: spacing.px6 },
  optionName: { ...typography.smallStrong, color: colors.text, lineHeight: 17 },
  optionVariant: { ...typography.caption, color: colors.gray, marginTop: 2 },
  optionSpecs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.px6,
    marginTop: 4,
  },
  optionSpec: {
    ...typography.micro,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  optionStock: { ...typography.micro, color: colors.green, marginTop: 4 },
  optionStockLow: { color: colors.red, fontWeight: "700" },
  saveOverlay: {
    flex: 1,
    backgroundColor: colors.overlay.modal,
    justifyContent: "center",
    padding: spacing.px24,
  },
  saveSheet: {
    backgroundColor: colors.white,
    borderRadius: colors.radius.lg,
    padding: spacing.px20,
  },
  saveTitle: { ...typography.h2, color: colors.text },
  saveDescription: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.px8,
    lineHeight: 18,
  },
  saveInput: {
    marginTop: spacing.px14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    color: colors.text,
    ...typography.body,
  },
  saveActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.px10,
    marginTop: spacing.px16,
  },
});