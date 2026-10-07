// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import Bell from "lucide-react-native/icons/bell";
import GitCompareArrows from "lucide-react-native/icons/git-compare-arrows";
import Heart from "lucide-react-native/icons/heart";
import Laptop from "lucide-react-native/icons/laptop";
import ShoppingCart from "lucide-react-native/icons/shopping-cart";
import Star from "lucide-react-native/icons/star";
import ShieldCheck from "lucide-react-native/icons/shield-check";

import Button from "../components/Button";
import Card from "../components/Card";
import ListRow from "../components/ListRow";
import PriceText from "../components/PriceText";
import ProductGallery from "../components/ProductGallery";
import ReviewSummaryInline from "../components/ReviewSummaryInline";
import StatusBadge from "../components/StatusBadge";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useCompare } from "../context/CompareContext";
import {
  addFavorite,
  getFavoriteStatus,
  removeFavorite,
} from "../services/favoriteService";
import {
  createPriceAlert,
  deletePriceAlert,
  getPriceAlerts,
} from "../services/priceAlertService";
import { cacheProduct, getCachedProduct } from "../services/productCache";

export default function ProductDetailScreen({ route, navigation }) {
  const productId: string | number | undefined =
    (route.params as any)?.productId ?? (route.params as any)?.id;
  // Ưu tiên object product được cache khi user bấm từ Home/Catalog/Favorites,
  // tránh phải fetch lại và tránh URL phải mang cả object.
  const cachedItem = productId != null ? getCachedProduct(productId) : null;
  const [item, setItem] = useState<any>(cachedItem);
  const [isItemLoading, setIsItemLoading] = useState(!cachedItem && !!productId);
  const [itemError, setItemError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const {
    hasProduct: isCompared,
    addProduct: addToCompare,
    removeProduct: removeFromCompare,
  } = useCompare();

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [hasPriceAlert, setHasPriceAlert] = useState(false);
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);
  const [priceAlertTarget, setPriceAlertTarget] = useState("");

  useEffect(() => {
    let active = true;
    if (!isAuthenticated || !item?.id) {
      setIsFavorite(false);
      setHasPriceAlert(false);
      return undefined;
    }
    getFavoriteStatus(item.id)
      .then((favorited) => {
        if (active) setIsFavorite(favorited);
      })
      .catch(() => {
        if (active) setIsFavorite(false);
      });
    getPriceAlerts()
      .then((alerts) => {
        if (active) {
          setHasPriceAlert(
            alerts.some(
              (a) =>
                String(a.product_id) === String(item.id) &&
                a.alert_type === "PRICE_DROP" &&
                a.is_active,
            ),
          );
        }
      })
      .catch(() => {
        if (active) setHasPriceAlert(false);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, item?.id]);

  // Nếu mở bằng deep link chỉ có `id` (không có object), fetch từ catalog.
  useEffect(() => {
    if (item || !productId) return undefined;
    let active = true;
    setIsItemLoading(true);
    setItemError(null);
    (async () => {
      try {
        const result = await getCatalogPage({
          page: 1,
          limit: 20,
          query: String(productId),
        });
        if (!active) return;
        const match = result.items.find(
          (entry) => String(entry.id) === String(productId),
        );
        if (match) {
          setItem(match);
        } else {
          setItemError("Không tìm thấy sản phẩm.");
        }
      } catch (err) {
        if (active) {
          setItemError(
            err instanceof Error ? err.message : "Không tải được sản phẩm.",
          );
        }
      } finally {
        if (active) setIsItemLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [item, productId]);

  if (!item) {
    if (isItemLoading) {
      return (
        <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
          <View style={styles.errorState}>
            <Text style={styles.errorTitle}>Đang tải sản phẩm…</Text>
          </View>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>Không tải được sản phẩm</Text>
          <Text style={styles.errorText}>
            {itemError || "Vui lòng quay lại và thử chọn sản phẩm khác."}
          </Text>
          <Button
            label="Quay lại"
            variant="primary"
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const total = item.price * quantity;
  const hasDiscount = item.oldPrice > item.price && item.oldPrice > 0;
  const isOutOfStock = item.stockQuantity <= 0;
  const galleryImages = (item.images && item.images.length > 0
    ? item.images
    : item.imageUrl
    ? [item.imageUrl]
    : []
  ).filter(Boolean);

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    const added = await addToCart(item, quantity);
    if (added) navigation.navigate("Main", { screen: "Cart" });
    else
      Alert.alert(
        "Không thể thêm vào giỏ",
        "Vui lòng kiểm tra tồn kho và thử lại.",
      );
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Cần đăng nhập",
        "Đăng nhập để lưu sản phẩm yêu thích.",
        [
          { text: "Để sau", style: "cancel" },
          {
            text: "Đăng nhập",
            onPress: () => navigation.navigate("Login", { redirectTo: "Main" }),
          },
        ],
      );
      return;
    }
    setIsFavoriteLoading(true);
    try {
      if (isFavorite) await removeFavorite(item.id);
      else await addFavorite(item.id);
      setIsFavorite((current) => !current);
    } catch (nextError) {
      Alert.alert(
        "Không thể cập nhật",
        nextError instanceof Error ? nextError.message : "Vui lòng thử lại.",
      );
    } finally {
      setIsFavoriteLoading(false);
    }
    return;
  };

  const toggleComparison = () => {
    if (isCompared(item.id)) {
      removeFromCompare(item.id);
      return;
    }
    const result = addToCompare(item);
    if (!result.ok)
      Alert.alert("Không thể so sánh", result.message);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        style={styles.scrollFlex}
      >
        <View style={styles.imageSection}>
          <View style={styles.imageTopBar}>
            <Button
              variant="tonal"
              size="sm"
              fullWidth={false}
              label=""
              accessibilityLabel="Quay lại"
              leadingIcon={(color) => (
                <ChevronLeft color={color} size={22} strokeWidth={2.4} />
              )}
              onPress={() => navigation.goBack()}
            />
            <Button
              variant="tonal"
              size="sm"
              fullWidth={false}
              label=""
              accessibilityLabel={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              accessibilityState={{ selected: isFavorite, busy: isFavoriteLoading }}
              leadingIcon={(color) => (
                <Heart
                  color={isFavorite ? colors.red : color}
                  fill={isFavorite ? colors.red : "transparent"}
                  size={20}
                  strokeWidth={2.2}
                />
              )}
              onPress={toggleFavorite}
              disabled={isFavoriteLoading}
            />
          </View>
          <ProductGallery
            images={galleryImages}
            fallbackEmoji={item.emoji}
            alt={item.name}
            aspectRatio={1}
            backgroundColor={colors.surfaceMuted}
          />
          {hasDiscount ? (
            <View style={styles.discount}>
              <Text style={styles.discountText}>
                -{Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}%
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <View style={styles.tagRow}>
            <StatusBadge label={item.category} tone="primary" variant="soft" />
            {item.brand ? (
              <StatusBadge label={item.brand} tone="neutral" variant="soft" />
            ) : null}
          </View>

          <Text style={styles.name}>{item.name}</Text>

          {item.rating ? (
            <View style={styles.ratingRow}>
              <View style={styles.ratingGroup}>
                <Star color={colors.accent} fill={colors.accent} size={14} strokeWidth={1.6} />
                <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
              </View>
              {item.sold ? <Text style={styles.sold}>Đã bán {item.sold}</Text> : null}
              <Text style={styles.delivery}>✓ {item.deliveryTime}</Text>
            </View>
          ) : null}

          <PriceText price={item.price} oldPrice={item.oldPrice} size="lg" emphasize />
          {item.voucherPrice !== undefined && item.voucherCode ? (
            <View style={styles.voucherPrice}>
              <Text style={styles.voucherLabel}>
                Giá dự kiến với mã {item.voucherCode}
              </Text>
              <Text style={styles.voucherAmount}>
                {formatCurrency(item.voucherPrice)}
              </Text>
              {item.voucherMinOrder ? (
                <Text style={styles.voucherCondition}>
                  Áp dụng cho đơn từ {formatCurrency(item.voucherMinOrder)}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>{item.description}</Text>

          <Text style={styles.sectionTitle}>Thông số nổi bật</Text>
          <Card padding="md">
            <View style={styles.optionRow}>
              <View style={styles.optionMeta}>
                <Text style={styles.optionTitle}>
                  {item.variantName || "Cấu hình sản phẩm"}
                </Text>
                <Text style={styles.optionSub}>
                  {item.specs?.length
                    ? item.specs.join(" • ")
                    : "Chưa có thông số chi tiết"}
                </Text>
              </View>
              <View style={styles.optionCheck}>
                <Text style={styles.optionCheckText}>✓</Text>
              </View>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Đánh giá & nhận xét</Text>
          <ReviewSummaryInline
            productId={item.id}
            onViewAll={() => {
              cacheProduct(item);
              navigation.navigate("Reviews", { productId: item.id });
            }}
          />

          <Text style={styles.sectionTitle}>Dịch vụ & so sánh</Text>
          <Card padding="none" radius="lg">
            <ListRow
              label={isCompared(item.id) ? "Đã thêm vào so sánh" : "Thêm vào so sánh"}
              description="So sánh tối đa 4 sản phẩm cùng danh mục"
              leadingIcon={GitCompareArrows}
              leadingTone="info"
              trailing={isCompared(item.id) ? "badge" : "chevron"}
              badgeLabel={isCompared(item.id) ? "Đã thêm" : undefined}
              onPress={toggleComparison}
            />
            {item.category === "Laptop" ? (
              <>
                <View style={styles.dividerThin} />
                <ListRow
                  label="Nâng cấp Laptop"
                  description="Chọn RAM và SSD theo giới hạn phần cứng"
                  leadingIcon={Laptop}
                  leadingTone="primary"
                  onPress={() => {
                    cacheProduct(item);
                    navigation.navigate("LaptopUpgrade", { productId: item.id });
                  }}
                />
              </>
            ) : null}
            {isAuthenticated ? (
              <>
                <View style={styles.dividerThin} />
                <ListRow
                  label={hasPriceAlert ? "Đang theo dõi giá" : "Báo giá khi giảm"}
                  description={
                    hasPriceAlert
                      ? "Bạn sẽ nhận thông báo khi giá xuống dưới mức đã đặt"
                      : `Hiện ${item.price.toLocaleString("vi-VN")}đ — đặt mức giá để nhận thông báo`
                  }
                  leadingIcon={Bell}
                  leadingTone="success"
                  trailing={hasPriceAlert ? "badge" : "chevron"}
                  badgeLabel={hasPriceAlert ? "Đang bật" : undefined}
                  onPress={async () => {
                    if (hasPriceAlert) {
                      Alert.alert(
                        "Hủy theo dõi giá?",
                        "Bạn sẽ không nhận thông báo khi giá thay đổi.",
                        [
                          { text: "Không", style: "cancel" },
                          {
                            text: "Hủy theo dõi",
                            style: "destructive",
                            onPress: async () => {
                              try {
                                const alerts = await getPriceAlerts();
                                const alert = alerts.find(
                                  (a) =>
                                    String(a.product_id) === String(item.id) &&
                                    a.alert_type === "PRICE_DROP" &&
                                    a.is_active,
                                );
                                if (alert) await deletePriceAlert(alert.id);
                                setHasPriceAlert(false);
                              } catch (err) {
                                Alert.alert("Lỗi", err.message);
                              }
                            },
                          },
                        ],
                      );
                    } else {
                      setPriceAlertTarget(String(item.price));
                      setShowPriceAlertModal(true);
                    }
                  }}
                />
              </>
            ) : null}
          </Card>

          <Card padding="md" style={styles.warrantyCard}>
            <View style={styles.warrantyRow}>
              <View style={styles.warrantyIcon}>
                <ShieldCheck color={colors.success} size={18} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Bảo hành chính hãng</Text>
                <Text style={styles.optionSub}>
                  {item.warrantyMonths || 12} tháng tại các trung tâm bảo hành trên toàn quốc
                </Text>
              </View>
              <View style={[styles.optionCheck, styles.optionCheckSoft]}>
                <Text style={styles.optionCheckSoftText}>✓</Text>
              </View>
            </View>
          </Card>

          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Số lượng</Text>
            <View style={styles.quantityBox}>
              <Button
                variant="tonal"
                size="sm"
                fullWidth={false}
                label=""
                accessibilityLabel="Giảm số lượng"
                leadingIcon={(color) => (
                  <Text style={styles.quantityText}>−</Text>
                )}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              />
              <Text style={styles.quantity}>{quantity}</Text>
              <Button
                variant="primary"
                size="sm"
                fullWidth={false}
                label=""
                accessibilityLabel="Tăng số lượng"
                leadingIcon={(color) => (
                  <Text style={styles.quantityTextPlus}>+</Text>
                )}
                onPress={() =>
                  setQuantity(Math.min(item.stockQuantity, quantity + 1))
                }
                disabled={isOutOfStock || quantity >= item.stockQuantity}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.bottomSafe}>
        <View style={styles.bottom}>
          <View style={styles.totalInfo}>
            <Text style={styles.totalLabel} numberOfLines={1}>Tổng cộng</Text>
            <Text style={styles.total} numberOfLines={1}>{formatCurrency(total)}</Text>
          </View>
          <Button
            label={isOutOfStock ? "Tạm hết hàng" : "Thêm vào giỏ"}
            variant="primary"
            size="lg"
            leadingIcon={(color) => (
              <ShoppingCart color={color} size={18} strokeWidth={2.4} />
            )}
            onPress={handleAddToCart}
            disabled={isOutOfStock}
            style={styles.cta}
          />
        </View>
      </SafeAreaView>

      {/* Modal: Price Alert */}
      <Modal
        visible={showPriceAlertModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowPriceAlertModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Đặt mức giá theo dõi</Text>
            <Text style={styles.modalDescription}>
              Bạn sẽ nhận thông báo khi giá sản phẩm giảm xuống dưới mức đã
              đặt. Giá hiện tại: {item.price.toLocaleString("vi-VN")}đ
            </Text>
            <TextInput
              style={styles.modalInput}
              value={priceAlertTarget}
              onChangeText={(value) =>
                setPriceAlertTarget(value.replace(/[^0-9]/g, ""))
              }
              keyboardType="number-pad"
              placeholder="Nhập mức giá mong muốn (VNĐ)"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Mức giá mục tiêu"
            />
            <View style={styles.modalActions}>
              <Button
                label="Huỷ"
                variant="ghost"
                fullWidth={false}
                onPress={() => setShowPriceAlertModal(false)}
              />
              <Button
                label="Đặt theo dõi"
                variant="primary"
                fullWidth={false}
                onPress={async () => {
                  const target = Number(priceAlertTarget);
                  if (!target || target <= 0) {
                    Alert.alert("Mức giá không hợp lệ", "Vui lòng nhập số lớn hơn 0.");
                    return;
                  }
                  try {
                    await createPriceAlert({
                      productId: Number(item.id),
                      productVariantId: item.variantId
                        ? Number(item.variantId)
                        : undefined,
                      alertType: "PRICE_DROP",
                      targetPrice: target,
                    });
                    setHasPriceAlert(true);
                    setShowPriceAlertModal(false);
                    Alert.alert(
                      "Đã đặt theo dõi",
                      `Bạn sẽ nhận thông báo khi ${item.name} giảm xuống dưới ${target.toLocaleString("vi-VN")}đ.`,
                    );
                  } catch (err) {
                    Alert.alert(
                      "Lỗi",
                      err instanceof Error ? err.message : "Không đặt được theo dõi.",
                    );
                  }
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

import { formatCurrency } from "../utils/formatters";
import { getCatalogPage } from "../services/catalogApiService";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.px24,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.text,
  },
  errorText: {
    ...typography.caption,
    color: colors.gray,
    textAlign: "center",
    marginTop: spacing.px8,
  },
  errorButton: { marginTop: spacing.px18 },
  scrollFlex: { flex: 1 },
  scroll: { paddingBottom: 120 },
  imageSection: {
    position: "relative",
    backgroundColor: colors.surfaceMuted,
    width: "100%",
  },
  imageTopBar: {
    position: "absolute",
    top: spacing.px12,
    left: spacing.px12,
    right: spacing.px12,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 5,
  },
  discount: {
    position: "absolute",
    left: spacing.px18,
    top: spacing.px12,
    backgroundColor: colors.red,
    paddingHorizontal: spacing.px12,
    paddingVertical: spacing.px6,
    borderRadius: colors.radius.md,
    zIndex: 2,
  },
  discountText: {
    ...typography.micro,
    color: colors.white,
  },
  content: {
    backgroundColor: colors.white,
    marginTop: -spacing.px16,
    borderTopLeftRadius: colors.radius.xl,
    borderTopRightRadius: colors.radius.xl,
    padding: spacing.px20,
  },
  tagRow: {
    flexDirection: "row",
    gap: spacing.px8,
  },
  name: {
    ...typography.h1,
    color: colors.text,
    marginTop: spacing.px10,
  },
  voucherPrice: {
    marginTop: spacing.px8,
    padding: spacing.px12,
    borderRadius: colors.radius.md,
    backgroundColor: colors.greenLight,
  },
  voucherLabel: { ...typography.caption, color: colors.gray },
  voucherAmount: { ...typography.h3, color: colors.green, marginTop: 2 },
  voucherCondition: { ...typography.caption, color: colors.gray, marginTop: 2 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.px10,
    marginTop: spacing.px8,
  },
  ratingGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    ...typography.smallStrong,
    color: colors.accent,
  },
  sold: {
    ...typography.caption,
    color: colors.gray,
  },
  delivery: {
    ...typography.caption,
    color: colors.gray,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.px16,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.px10,
    marginTop: spacing.px4,
  },
  description: {
    ...typography.small,
    color: colors.gray,
    lineHeight: 21,
    marginBottom: spacing.px16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionMeta: { flex: 1, paddingRight: spacing.px12 },
  optionTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  optionSub: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.px4,
  },
  optionCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  optionCheckText: {
    color: colors.white,
    fontWeight: "900",
  },
  optionCheckSoft: {
    backgroundColor: colors.primaryLight,
  },
  optionCheckSoftText: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 14,
  },
  warrantyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  warrantyCard: { marginTop: spacing.px12 },
  warrantyIcon: {
    width: 40,
    height: 40,
    borderRadius: colors.radius.md,
    backgroundColor: colors.successLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.px12,
  },
  dividerThin: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.px16,
  },
  quantitySection: { marginTop: spacing.px10 },
  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: 4,
  },
  quantityText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "800",
  },
  quantityTextPlus: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "800",
  },
  quantity: {
    ...typography.title,
    color: colors.text,
    width: 42,
    textAlign: "center",
  },
  bottomSafe: { backgroundColor: colors.white },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.px12,
    paddingHorizontal: spacing.px16,
    paddingVertical: spacing.px12,
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  totalInfo: { flex: 1, minWidth: 0 },
  totalLabel: {
    ...typography.caption,
    color: colors.gray,
  },
  total: {
    ...typography.priceLg,
    color: colors.primary,
    marginTop: 2,
  },
  cta: { flexShrink: 0, minWidth: 150 },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay.modal,
    justifyContent: "center",
    padding: spacing.px24,
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderRadius: colors.radius.lg,
    padding: spacing.px20,
  },
  modalTitle: { ...typography.h2, color: colors.text },
  modalDescription: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.px8,
    lineHeight: 18,
  },
  modalInput: {
    marginTop: spacing.px14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    color: colors.text,
    ...typography.body,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.px10,
    marginTop: spacing.px16,
  },
});