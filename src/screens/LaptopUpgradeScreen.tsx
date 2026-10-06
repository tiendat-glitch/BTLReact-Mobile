// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Check from "lucide-react-native/icons/check";
import Cpu from "lucide-react-native/icons/cpu";
import HardDrive from "lucide-react-native/icons/hard-drive";
import MemoryStick from "lucide-react-native/icons/memory-stick";
import ShoppingCart from "lucide-react-native/icons/shopping-cart";

import Button from "../components/Button";
import Card from "../components/Card";
import FeedbackState from "../components/FeedbackState";
import ScreenHeader from "../components/ScreenHeader";
import StatusBadge from "../components/StatusBadge";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import { useCart } from "../context/CartContext";
import {
  getLaptopUpgradeOptions,
  validateLaptopUpgrade,
} from "../services/laptopUpgradeService";
import { getCatalogPage } from "../services/catalogApiService";
import { getCachedProduct } from "../services/productCache";
import { formatCurrency } from "../utils/formatters";

export default function LaptopUpgradeScreen({ navigation, route }) {
  const productId = (route.params as any)?.productId ?? (route.params as any)?.id ?? (route.params as any)?.product?.id;
  const cachedProduct = productId != null ? getCachedProduct(productId) : null;
  const [product, setProduct] = useState<any>(cachedProduct ?? (route.params as any)?.product ?? null);
  const { addToCart } = useCart();
  const [profile, setProfile] = useState(null);
  const [options, setOptions] = useState([]);
  const [ramOptionId, setRamOptionId] = useState(undefined);
  const [ssdOptionId, setSsdOptionId] = useState(undefined);
  const [validation, setValidation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Nếu điều hướng bằng productId (không có object product), fetch từ catalog.
  useEffect(() => {
    if (product || !productId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const result = await getCatalogPage({ page: 1, limit: 20, query: String(productId) });
        const match = result.items.find((entry) => String(entry.id) === String(productId));
        if (!cancelled && match) setProduct(match);
      } catch {
        // ignore — UI sẽ hiển thị loading
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, product]);

  useEffect(() => {
    getLaptopUpgradeOptions(product.id)
      .then((result) => {
        setProfile(result.profile);
        setOptions(result.options);
      })
      .catch((error) =>
        Alert.alert("Không hỗ trợ nâng cấp", error.message, [
          { text: "Quay lại", onPress: navigation.goBack },
        ]),
      )
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
    () =>
      options.filter(
        (item) =>
          item.type === "RAM" &&
          (!profile || item.capacity_gb <= profile.max_ram_gb),
      ),
    [options, profile],
  );
  const ssdOptions = useMemo(
    () =>
      options.filter(
        (item) =>
          item.type === "SSD" &&
          (!profile || item.capacity_gb <= profile.max_storage_gb),
      ),
    [options, profile],
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
      ]
        .filter(Boolean)
        .join(" · "),
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
    return;
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <ScreenHeader title="Nâng cấp Laptop" navigation={navigation} />
        <FeedbackState variant="loading" fullScreen />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <ScreenHeader title="Nâng cấp Laptop" navigation={navigation} />
        <FeedbackState
          variant="empty"
          title="Không hỗ trợ nâng cấp"
          description="Sản phẩm này không có cấu hình nâng cấp."
          fullScreen
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScreenHeader title="Nâng cấp Laptop" navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card padding="md">
          <View style={styles.productCard}>
            <Cpu color={colors.primary} size={22} strokeWidth={2.2} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.muted}>{product.variantName}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.limits}>
          <Text style={styles.limitText}>
            RAM tối đa {profile.max_ram_gb}GB · {profile.ram_type} ·{" "}
            {profile.ram_slots} khe
          </Text>
          <Text style={styles.limitText}>
            SSD tối đa {profile.max_storage_gb}GB · {profile.storage_slots} khe
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Chọn RAM</Text>
        <OptionList
          icon={
            <MemoryStick
              color={colors.primary}
              size={18}
              strokeWidth={2.2}
            />
          }
          options={ramOptions}
          selectedId={ramOptionId}
          onSelect={(id) =>
            setRamOptionId((current) => (current === id ? undefined : id))
          }
        />

        <Text style={styles.sectionTitle}>Chọn SSD</Text>
        <OptionList
          icon={
            <HardDrive
              color={colors.primary}
              size={18}
              strokeWidth={2.2}
            />
          }
          options={ssdOptions}
          selectedId={ssdOptionId}
          onSelect={(id) =>
            setSsdOptionId((current) => (current === id ? undefined : id))
          }
        />

        {validation ? (
          <View style={styles.validation}>
            <Check color={colors.green} size={18} strokeWidth={2.4} />
            <View style={styles.validationInfo}>
              <Text style={styles.validationTitle}>Cấu hình tương thích</Text>
              <Text style={styles.muted}>
                Chi phí nâng cấp {formatCurrency(validation.priceAdjustment)}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottom}>
        <View>
          <Text style={styles.bottomLabel}>Giá sau nâng cấp</Text>
          <Text style={styles.total}>
            {validation
              ? formatCurrency(validation.unitPrice)
              : formatCurrency(product.price)}
          </Text>
        </View>
        <Button
          label="Thêm vào giỏ"
          variant="primary"
          size="lg"
          loading={isAdding || isValidating}
          leadingIcon={(color) => (
            <ShoppingCart color={color} size={18} strokeWidth={2.4} />
          )}
          onPress={addUpgrade}
          disabled={!validation || isAdding || isValidating}
        />
      </View>
    </SafeAreaView>
  );
}

function OptionList({ icon, options, selectedId, onSelect }) {
  if (!options.length) {
    return (
      <Text style={styles.emptyHint}>Không có lựa chọn phù hợp với cấu hình này.</Text>
    );
  }
  return (
    <View>
      {options.map((option) => {
        const selected = selectedId === option.id;
        return (
          <Pressable
            key={String(option.id)}
            style={[styles.option, selected && styles.optionSelected]}
            onPress={() => onSelect(option.id)}
          >
            {icon}
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.price}>
                +{formatCurrency(option.price_delta)}
              </Text>
            </View>
            <View
              style={[styles.checkbox, selected && styles.checkboxSelected]}
            >
              {selected ? <Check color={colors.white} size={14} strokeWidth={3} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.px16, paddingBottom: spacing.px32 },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  productInfo: { flex: 1, marginLeft: spacing.px10 },
  productName: { ...typography.bodyStrong, color: colors.text },
  muted: {
    ...typography.caption,
    color: colors.gray,
    lineHeight: 17,
    marginTop: 3,
  },
  limits: {
    backgroundColor: colors.primaryLight,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    marginTop: spacing.px10,
  },
  limitText: {
    ...typography.captionStrong,
    color: colors.primaryDark,
    lineHeight: 18,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.px16,
    marginBottom: spacing.px8,
  },
  emptyHint: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.px8,
  },
  option: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    marginBottom: spacing.px8,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionInfo: { flex: 1, marginLeft: spacing.px10 },
  optionLabel: { ...typography.smallStrong, color: colors.text },
  price: { ...typography.captionStrong, color: colors.primary, marginTop: 3 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: colors.radius.sm,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  validation: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.greenLight,
    borderColor: colors.greenSoft,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    marginTop: spacing.px12,
  },
  validationInfo: { flex: 1, marginLeft: spacing.px8 },
  validationTitle: { ...typography.smallStrong, color: colors.green },
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
  },
  bottomLabel: { ...typography.caption, color: colors.gray },
  total: { ...typography.priceLg, color: colors.primary, marginTop: 2 },
});