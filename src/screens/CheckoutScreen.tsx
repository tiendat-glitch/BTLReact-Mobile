// @ts-nocheck
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Check from "lucide-react-native/icons/check";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import MapPin from "lucide-react-native/icons/map-pin";
import PackageCheck from "lucide-react-native/icons/package-check";
import Store from "lucide-react-native/icons/store";
import Truck from "lucide-react-native/icons/truck";

import Button from "../components/Button";
import Card from "../components/Card";
import FormField from "../components/FormField";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getAddresses } from "../services/addressService";
import {
  createCheckoutOrder,
  getCheckoutOptions,
  getCheckoutQuote,
  validateVoucher,
  type PaymentMethodCode,
} from "../services/checkoutService";
import { getPromotions, type Promotion } from "../services/promotionService";
import { formatAddress, formatCurrency } from "../utils/formatters";
import { formatDistance, getStoreStatusLabel, haversineKm } from "../utils/geo";

const SPECIAL_REQUEST_LABELS = {
  AFTER_HOURS: "Giao ngoài giờ hành chính",
  CALL_BEFORE_DELIVERY: "Gọi điện trước khi giao",
  CAREFUL_PACKAGING: "Đóng gói cẩn thận",
  SMS_ONLY: "Chỉ nhắn tin, không gọi điện",
  INSPECT_BEFORE_RECEIVING: "Kiểm tra hàng trước khi nhận",
};

const PAYMENT_METHODS = [
  {
    code: "COD" as PaymentMethodCode,
    label: "Thanh toán khi nhận hàng (COD)",
    description: "Thanh toán sau khi nhận và kiểm tra hàng.",
  },
  {
    code: "BANK_TRANSFER" as PaymentMethodCode,
    label: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản trước qua tài khoản ngân hàng được cung cấp.",
  },
  {
    code: "MOMO" as PaymentMethodCode,
    label: "Ví MoMo",
    description: "Thanh toán qua ứng dụng MoMo.",
  },
  {
    code: "VNPAY" as PaymentMethodCode,
    label: "VNPAY",
    description: "Thanh toán qua cổng thanh toán VNPAY.",
  },
];

const newIdempotencyKey = () =>
  `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

export default function CheckoutScreen({ navigation, route }) {
  const { isAuthenticated, user } = useAuth();
  const { cart, isCartLoading, reloadCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [stores, setStores] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [availableSpecialRequests, setAvailableSpecialRequests] = useState([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [fulfillmentMethod, setFulfillmentMethod] = useState("DELIVERY");
  const [selectedAddressId, setSelectedAddressId] = useState(
    route.params?.selectedAddressId || null,
  );
  const [pickupStoreId, setPickupStoreId] = useState(null);
  const [shippingMethodCode, setShippingMethodCode] = useState("STANDARD");
  const [recipientName, setRecipientName] = useState(user?.fullName || "");
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || "");
  const [specialRequests, setSpecialRequests] = useState([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherValidation, setVoucherValidation] = useState(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [note, setNote] = useState("");
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodCode>("COD");
  const idempotencyKey = useRef(newIdempotencyKey());
  const quoteRequest = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) navigation.replace("Login", { redirectTo: "Checkout" });
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    if (route.params?.selectedAddressId) {
      setSelectedAddressId(route.params.selectedAddressId);
    }
  }, [route.params?.selectedAddressId]);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError("");
    try {
      const [nextAddresses, options, promos] = await Promise.all([
        getAddresses(),
        getCheckoutOptions(),
        getPromotions().catch(() => []),
      ]);
      setAddresses(nextAddresses);
      setStores(options.stores);
      setShippingMethods(options.shippingMethods);
      setAvailableSpecialRequests(options.specialRequests);
      setPromotions(promos);
      // Ưu tiên địa chỉ mặc định mỗi lần load lại — fix bug: trước đây
      // nếu user đã chọn 1 địa chỉ rồi đổi địa chỉ mặc định khác, lần load
      // sau sẽ giữ địa chỉ cũ do `current || ...` short-circuit. Bây giờ:
      //  - Nếu địa chỉ hiện tại vẫn tồn tại trong danh sách → giữ nguyên
      //    (user đã chọn chủ động, không ép đổi).
      //  - Nếu không còn trong danh sách (bị xóa) hoặc chưa có → lấy
      //    default, fallback về địa chỉ đầu tiên.
      setSelectedAddressId((current) => {
        if (
          current &&
          nextAddresses.some((item) => String(item.id) === String(current))
        ) {
          return current;
        }
        return (
          nextAddresses.find((item) => Boolean(item.is_default))?.id ||
          nextAddresses[0]?.id ||
          null
        );
      });
      setPickupStoreId((current) => current || options.stores[0]?.id || null);
      setShippingMethodCode((current) =>
        options.shippingMethods.some((item) => item.code === current)
          ? current
          : options.shippingMethods[0]?.code || "STANDARD",
      );
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Không tải được checkout.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const selectedAddress = useMemo(
    () =>
      addresses.find(
        (item) => String(item.id) === String(selectedAddressId),
      ),
    [addresses, selectedAddressId],
  );

  const buildInput = useCallback(() => {
    const base = {
      fulfillmentMethod,
      specialRequests,
      voucherCode: voucherCode.trim() || undefined,
      note: note.trim() || undefined,
      paymentMethod,
    };
    if (fulfillmentMethod === "DELIVERY") {
      if (!selectedAddressId || !shippingMethodCode) return null;
      return { ...base, addressId: selectedAddressId, shippingMethodCode };
    }
    if (!pickupStoreId || !recipientName.trim() || !recipientPhone.trim())
      return null;
    return {
      ...base,
      pickupStoreId,
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.replace(/\s/g, ""),
    };
  }, [
    fulfillmentMethod,
    specialRequests,
    voucherCode,
    note,
    paymentMethod,
    selectedAddressId,
    shippingMethodCode,
    pickupStoreId,
    recipientName,
    recipientPhone,
  ]);

  useEffect(() => {
    if (isLoading || isCartLoading || !cart.length) return undefined;
    const input = buildInput();
    if (!input) {
      setQuote(null);
      return undefined;
    }
    const requestId = quoteRequest.current + 1;
    quoteRequest.current = requestId;
    const timeout = setTimeout(async () => {
      setIsQuoting(true);
      setError("");
      try {
        const nextQuote = await getCheckoutQuote(input);
        if (quoteRequest.current === requestId) setQuote(nextQuote);
      } catch (nextError) {
        if (quoteRequest.current === requestId) {
          setQuote(null);
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Không tính được đơn hàng.",
          );
        }
      } finally {
        if (quoteRequest.current === requestId) setIsQuoting(false);
      }
    }, 450);
    return () => clearTimeout(timeout);
  }, [buildInput, cart.length, isCartLoading, isLoading]);

  const toggleSpecialRequest = (code) => {
    setSpecialRequests((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  };

  const validateVoucherCode = async () => {
    if (!voucherCode.trim()) return;
    const code = voucherCode.trim().toUpperCase();
    const subtotal = quote?.subtotal ?? 0;
    setIsValidatingVoucher(true);
    try {
      const result = await validateVoucher(code, subtotal);
      setVoucherValidation(result);
    } catch {
      setVoucherValidation({ valid: false, error: "Không kiểm tra được voucher." });
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setVoucherCode("");
    setVoucherValidation(null);
  };

  const placeOrder = async () => {
    const input = buildInput();
    if (!input || !quote) {
      setError("Vui lòng hoàn tất thông tin nhận hàng và chờ hệ thống tính tổng.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      // Re-validate quote trước khi tạo order để tránh lỗi "đặt đơn thất
      // bại" khi giá/tồn kho/voucher đã thay đổi từ lúc quote. Nếu khớp
      // thì tiến hành tạo; nếu lệch, hiển thị thông báo và yêu cầu user
      // đợi reload quote.
      const freshQuote = await getCheckoutQuote(input);
      if (
        freshQuote.subtotal !== quote.subtotal ||
        freshQuote.shippingFee !== quote.shippingFee ||
        freshQuote.discountAmount !== quote.discountAmount ||
        freshQuote.totalAmount !== quote.totalAmount
      ) {
        setQuote(freshQuote);
        setError(
          "Tổng đơn đã thay đổi (giá/tồn kho/voucher). Hệ thống đã cập nhật, vui lòng kiểm tra và đặt lại.",
        );
        return;
      }
      const order = await createCheckoutOrder(input, idempotencyKey.current);
      await reloadCart();
      idempotencyKey.current = newIdempotencyKey();
      navigation.replace("OrderDetail", { orderId: order.id });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Không thể đặt hàng.");
    } finally {
      setIsSubmitting(false);
    }
    return;
  };

  if (!isAuthenticated) return null;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader title="Xác nhận đơn hàng" navigation={navigation} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          style={styles.scrollFlex}
        >
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Text style={styles.sectionTitle}>Hình thức nhận hàng</Text>
              <View style={styles.segmented}>
                <Segment
                  label="Giao tận nơi"
                  icon={<Truck size={18} color={fulfillmentMethod === "DELIVERY" ? colors.white : colors.gray} />}
                  selected={fulfillmentMethod === "DELIVERY"}
                  onPress={() => setFulfillmentMethod("DELIVERY")}
                />
                <Segment
                  label="Nhận tại cửa hàng"
                  icon={<Store size={18} color={fulfillmentMethod === "PICKUP" ? colors.white : colors.gray} />}
                  selected={fulfillmentMethod === "PICKUP"}
                  onPress={() => setFulfillmentMethod("PICKUP")}
                />
              </View>

              {fulfillmentMethod === "DELIVERY" ? (
                <>
                  <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
                  {selectedAddress ? (
                    <View style={styles.card}>
                      <View style={styles.rowBetween}>
                        <View style={styles.iconBox}>
                          <MapPin color={colors.primary} size={18} strokeWidth={2.2} />
                        </View>
                        <View style={styles.flex}>
                          <View style={styles.addressHeader}>
                            <Text style={styles.strong} numberOfLines={1}>
                              {selectedAddress.receiver_name}
                            </Text>
                            <Text style={styles.phoneText}>
                              · {selectedAddress.receiver_phone}
                            </Text>
                            {Boolean(selectedAddress.is_default) ? (
                              <View style={styles.defaultChip}>
                                <Text style={styles.defaultChipText}>
                                  Mặc định
                                </Text>
                              </View>
                            ) : null}
                          </View>
                          <Text style={styles.muted}>
                            {formatAddress(selectedAddress)}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() =>
                            navigation.navigate("Addresses", {
                              selectMode: true,
                            })
                          }
                          accessibilityRole="button"
                          accessibilityLabel="Đổi địa chỉ nhận hàng"
                          hitSlop={8}
                          style={({ pressed }) => [
                            styles.changeBtn,
                            pressed ? styles.changeBtnPressed : null,
                          ]}
                        >
                          <Text style={styles.change}>Đổi</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.emptyAddressBox}>
                      <Text style={styles.emptyAddressTitle}>
                        Bạn chưa có địa chỉ nhận hàng
                      </Text>
                      <Text style={styles.emptyAddressText}>
                        Thêm địa chỉ để tiếp tục đặt hàng. Có thể đặt làm địa
                        chỉ mặc định để lần sau tự điền.
                      </Text>
                      <Button
                        label="Thêm địa chỉ nhận hàng"
                        variant="primary"
                        size="md"
                        leadingIcon={(color) => (
                          <MapPin color={color} size={18} strokeWidth={2.2} />
                        )}
                        onPress={() =>
                          navigation.navigate("AddressForm", {
                            // Sau khi lưu, quay lại Checkout để tự động chọn.
                            selectAfterSave: true,
                          })
                        }
                        style={styles.emptyAddressBtn}
                      />
                      <Button
                        label="Chọn từ sổ địa chỉ"
                        variant="ghost"
                        size="md"
                        onPress={() =>
                          navigation.navigate("Addresses", {
                            selectMode: true,
                          })
                        }
                        style={styles.emptyAddressBtn}
                      />
                    </View>
                  )}

                  <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
                  {shippingMethods.map((method) => (
                    <Choice
                      key={method.code}
                      selected={shippingMethodCode === method.code}
                      title={method.name}
                      description={`${formatEta(method)} · ${formatCurrency(method.base_fee)}`}
                      onPress={() => setShippingMethodCode(method.code)}
                    />
                  ))}
                </>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Cửa hàng nhận hàng</Text>
                  {stores.map((store) => {
                    const userLat = selectedAddress?.latitude
                      ? Number(selectedAddress.latitude)
                      : null;
                    const userLng = selectedAddress?.longitude
                      ? Number(selectedAddress.longitude)
                      : null;
                    const storeLat = store.latitude
                      ? Number(store.latitude)
                      : null;
                    const storeLng = store.longitude
                      ? Number(store.longitude)
                      : null;
                    const distance =
                      userLat != null && userLng != null && storeLat != null && storeLng != null
                        ? haversineKm(userLat, userLng, storeLat, storeLng)
                        : null;
                    const status = getStoreStatusLabel(store.opening_hours);
                    return (
                      <Pressable
                        key={String(store.id)}
                        style={[
                          styles.storeCard,
                          String(pickupStoreId) === String(store.id) &&
                            styles.storeCardSelected,
                        ]}
                        onPress={() => setPickupStoreId(store.id)}
                        accessibilityRole="radio"
                        accessibilityState={{
                          selected: String(pickupStoreId) === String(store.id),
                        }}
                      >
                        <View
                          style={[
                            styles.storeRadio,
                            String(pickupStoreId) === String(store.id) &&
                              styles.storeRadioSelected,
                          ]}
                        >
                          {String(pickupStoreId) === String(store.id) ? (
                            <View style={styles.storeRadioDot} />
                          ) : null}
                        </View>
                        <View style={styles.storeInfo}>
                          <View style={styles.storeTitleRow}>
                            <Text style={styles.storeName} numberOfLines={1}>
                              {store.name}
                            </Text>
                            <View
                              style={[
                                styles.storeStatusDot,
                                {
                                  backgroundColor: status.isOpen
                                    ? colors.green
                                    : colors.red,
                                },
                              ]}
                            />
                            <Text
                              style={[
                                styles.storeStatusText,
                                {
                                  color: status.isOpen
                                    ? colors.green
                                    : colors.red,
                                },
                              ]}
                            >
                              {status.isOpen ? "Mở cửa" : "Đã đóng"}
                            </Text>
                          </View>
                          <Text style={styles.storeAddress} numberOfLines={2}>
                            {store.address_line}
                            {store.ward ? `, ${store.ward}` : ""}
                            {store.district ? `, ${store.district}` : ""}
                            {`, ${store.province}`}
                          </Text>
                          <View style={styles.storeMetaRow}>
                            <Text style={styles.storeMetaText}>
                              {status.label}
                            </Text>
                          </View>
                          <View style={styles.storeMetaRow}>
                            <Text style={styles.storeMetaText}>
                              📞 {store.phone}
                            </Text>
                            {distance != null ? (
                              <Text style={styles.storeDistance}>
                                · {formatDistance(distance)} từ địa chỉ giao
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                  <Card padding="md">
                    <FormField
                      label="Người nhận *"
                      value={recipientName}
                      onChangeText={setRecipientName}
                    />
                    <FormField
                      label="Số điện thoại *"
                      value={recipientPhone}
                      onChangeText={setRecipientPhone}
                      keyboardType="phone-pad"
                    />
                  </Card>
                </>
              )}

              <Text style={styles.sectionTitle}>Sản phẩm</Text>
              <Card padding="md">
                {cart.map((item) => (
                  <View key={item.cartKey} style={styles.productRow}>
                    <View style={styles.flex}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.muted}>
                        {item.variantName} · x{item.quantity}
                      </Text>
                    </View>
                    <Text style={styles.productPrice}>
                      {formatCurrency(item.price * item.quantity)}
                    </Text>
                  </View>
                ))}
              </Card>

              {promotions.length > 0 ? (
                <View style={styles.promoCard}>
                  <Text style={styles.promoLabel}>Ưu đãi đang có</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.promoScroll}
                    contentContainerStyle={styles.promoContent}
                  >
                    {promotions.map((promo) => (
                      <Pressable
                        key={String(promo.id)}
                        style={styles.promoChip}
                        onPress={() => setVoucherCode(promo.title)}
                      >
                        <Text style={styles.promoChipText} numberOfLines={1}>
                          {promo.title}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              <Text style={styles.sectionTitle}>Mã giảm giá</Text>
              <View style={styles.voucherRow}>
                <TextInput
                  style={[styles.input, styles.voucherInput]}
                  value={voucherCode}
                  onChangeText={(value) => {
                    setVoucherCode(value.toUpperCase());
                    setVoucherValidation(null);
                  }}
                  autoCapitalize="characters"
                  placeholder="Nhập mã voucher"
                  placeholderTextColor={colors.muted}
                  editable={!voucherValidation?.valid}
                  accessibilityLabel="Mã voucher"
                />
                {voucherValidation?.valid ? (
                  <Button
                    label="Bỏ"
                    variant="ghost"
                    size="sm"
                    onPress={removeVoucher}
                    accessibilityLabel="Bỏ áp dụng voucher"
                  />
                ) : (
                  <Button
                    label="Áp dụng"
                    variant="primary"
                    size="sm"
                    onPress={validateVoucherCode}
                    loading={isValidatingVoucher}
                    disabled={!voucherCode.trim() || isValidatingVoucher}
                    accessibilityLabel="Áp dụng voucher"
                  />
                )}
              </View>
              {voucherValidation?.valid ? (
                <View style={styles.voucherSuccess}>
                  <Check color={colors.green} size={14} strokeWidth={2.8} />
                  <Text style={styles.voucherSuccessText}>
                    {voucherValidation.voucher.name || voucherValidation.voucher.code}
                    {" — "}
                    Giảm{" "}
                    {voucherValidation.voucher.discountType === "PERCENT"
                      ? `${voucherValidation.voucher.discountValue}%`
                      : formatCurrency(voucherValidation.voucher.discountPreview)}
                    {voucherValidation.voucher.discountType === "PERCENT" &&
                    voucherValidation.voucher.maxDiscount
                      ? ` (tối đa ${formatCurrency(voucherValidation.voucher.maxDiscount)})`
                      : ""}
                  </Text>
                </View>
              ) : voucherValidation?.valid === false && voucherValidation?.error ? (
                <Text style={styles.voucherError}>{voucherValidation.error}</Text>
              ) : null}

              <Text style={styles.sectionTitle}>Yêu cầu đặc biệt</Text>
              <Card padding="md">
                {availableSpecialRequests.map((code) => {
                  const selected = specialRequests.includes(code);
                  return (
                    <Pressable
                      key={code}
                      style={styles.checkRow}
                      onPress={() => toggleSpecialRequest(code)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                    >
                      <View
                        style={[styles.checkbox, selected && styles.checkboxSelected]}
                      >
                        {selected ? <Check color={colors.white} size={14} strokeWidth={3} /> : null}
                      </View>
                      <Text style={styles.checkLabel}>{SPECIAL_REQUEST_LABELS[code]}</Text>
                    </Pressable>
                  );
                })}
              </Card>

              <Text style={styles.sectionTitle}>Ghi chú đơn hàng</Text>
              <TextInput
                style={[styles.input, styles.note]}
                value={note}
                onChangeText={setNote}
                multiline
                maxLength={500}
                textAlignVertical="top"
                placeholder="Ví dụ: Vui lòng gọi trước khi giao..."
                placeholderTextColor={colors.muted}
              />
              <Text style={styles.counter}>{note.length}/500</Text>

              <Text style={styles.sectionTitle}>Thanh toán</Text>
              <Card padding="sm">
                {PAYMENT_METHODS.map((method) => (
                  <Pressable
                    key={method.code}
                    style={[
                      styles.paymentOption,
                      paymentMethod === method.code && styles.paymentOptionSelected,
                    ]}
                    onPress={() => setPaymentMethod(method.code)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: paymentMethod === method.code }}
                  >
                    <View
                      style={[
                        styles.radio,
                        paymentMethod === method.code && styles.radioSelected,
                      ]}
                    >
                      {paymentMethod === method.code ? (
                        <View style={styles.radioDot} />
                      ) : null}
                    </View>
                    <View style={styles.paymentContent}>
                      <Text style={styles.paymentLabel}>{method.label}</Text>
                      <Text style={styles.paymentDesc}>{method.description}</Text>
                    </View>
                  </Pressable>
                ))}
              </Card>

              <Card padding="md" style={styles.summary}>
                {isQuoting ? (
                  <ActivityIndicator color={colors.primary} />
                ) : quote ? (
                  <>
                    <Summary label="Tạm tính" value={formatCurrency(quote.subtotal)} />
                    <Summary label="Giảm giá" value={`-${formatCurrency(quote.discountAmount)}`} />
                    <Summary label="Phí vận chuyển" value={formatCurrency(quote.shippingFee)} />
                    <Summary label="Tổng cộng" value={formatCurrency(quote.totalAmount)} bold />
                  </>
                ) : (
                  <Text style={styles.muted}>Hoàn tất thông tin để tính tổng đơn hàng.</Text>
                )}
              </Card>
            </>
          )}
        </ScrollView>
        <SafeAreaView edges={["bottom"]} style={styles.bottomSafe}>
          <View style={styles.bottom}>
            <View style={styles.totalInfo}>
              <Text style={styles.bottomLabel} numberOfLines={1}>
                Tổng thanh toán
              </Text>
              <Text style={styles.total} numberOfLines={1}>
                {quote ? formatCurrency(quote.totalAmount) : "--"}
              </Text>
            </View>
            <Button
              label={`Đặt hàng · ${paymentMethod === "COD" ? "COD" : paymentMethod}`}
              variant="primary"
              size="lg"
              loading={isSubmitting}
              trailingIcon={(color) => (
                <ChevronRight color={color} size={18} strokeWidth={2.6} />
              )}
              onPress={placeOrder}
              disabled={!quote || isSubmitting || isQuoting}
              style={styles.cta}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Segment({ label, icon, selected, onPress }) {
  return (
    <Pressable
      style={[styles.segment, selected && styles.segmentSelected]}
      onPress={onPress}
    >
      <View style={styles.segmentIcon}>{icon}</View>
      <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Choice({ selected, title, description, onPress }) {
  return (
    <Pressable
      style={[styles.choice, selected && styles.choiceSelected]}
      onPress={onPress}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.flex}>
        <Text style={styles.strong}>{title}</Text>
        <Text style={styles.muted}>{description}</Text>
      </View>
    </Pressable>
  );
}

function Summary({ label, value, bold }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.muted, bold && styles.summaryLabelBold]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, bold && styles.total]}>{value}</Text>
    </View>
  );
}

const formatEta = (method) =>
  method.eta_min_days === 0 && method.eta_max_days === 0
    ? "Trong ngày"
    : `${method.eta_min_days}-${method.eta_max_days} ngày`;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollFlex: { flex: 1 },
  content: { padding: spacing.px16, paddingBottom: spacing.px40 },
  error: {
    ...typography.captionStrong,
    color: colors.red,
    backgroundColor: colors.redLight,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    marginBottom: spacing.px12,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.px16,
    marginBottom: spacing.px8,
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderRadius: colors.radius.md,
    padding: 4,
  },
  segment: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: colors.radius.sm,
  },
  segmentSelected: { backgroundColor: colors.primary },
  segmentIcon: { marginRight: 7 },
  segmentText: { ...typography.captionStrong, color: colors.gray },
  segmentTextSelected: { color: colors.white },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px14,
  },
  emptyButton: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
  },
  emptyAddressBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.lg,
    padding: spacing.px16,
    gap: spacing.px10,
  },
  emptyAddressTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  emptyAddressText: {
    ...typography.caption,
    color: colors.gray,
    lineHeight: 18,
  },
  emptyAddressBtn: { marginTop: spacing.px4 },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  phoneText: {
    ...typography.captionStrong,
    color: colors.text,
  },
  defaultChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: colors.radius.pill,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    marginLeft: 6,
  },
  defaultChipText: {
    ...typography.micro,
    color: colors.primary,
  },
  changeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: colors.radius.md,
    backgroundColor: colors.primaryLight,
  },
  changeBtnPressed: { opacity: 0.7 },
  choice: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    marginBottom: spacing.px8,
  },
  choiceSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderColor: colors.borderStrong,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.px10,
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBox: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: colors.radius.md,
    marginRight: spacing.px10,
  },
  strong: { ...typography.smallStrong, color: colors.text },
  muted: {
    ...typography.caption,
    color: colors.gray,
    lineHeight: 18,
    marginTop: 3,
  },
  change: {
    ...typography.captionStrong,
    color: colors.primary,
    marginLeft: spacing.px8,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.px10,
  },
  productName: { ...typography.smallStrong, color: colors.text },
  productPrice: { ...typography.smallStrong, color: colors.primary },
  input: {
    minHeight: 50,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    color: colors.text,
    paddingHorizontal: spacing.px12,
    ...typography.body,
  },
  note: { minHeight: 100, paddingTop: spacing.px12 },
  counter: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.px4,
    textAlign: "right",
  },
  voucherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px10,
  },
  voucherInput: { flex: 1 },
  voucherSuccess: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.px8,
    padding: spacing.px10,
    backgroundColor: colors.greenLight,
    borderRadius: colors.radius.md,
    gap: spacing.px8,
  },
  voucherSuccessText: {
    ...typography.captionStrong,
    color: colors.green,
    flex: 1,
  },
  voucherError: {
    ...typography.captionStrong,
    color: colors.red,
    marginTop: spacing.px8,
  },
  promoCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    borderColor: colors.primarySoft,
    borderWidth: 1,
  },
  promoLabel: {
    ...typography.captionStrong,
    color: colors.primary,
    marginBottom: spacing.px8,
  },
  promoScroll: { flexGrow: 0 },
  promoContent: { gap: spacing.px8, paddingRight: spacing.px8 },
  promoChip: {
    paddingHorizontal: spacing.px12,
    paddingVertical: spacing.px8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderColor: colors.primarySoft,
    borderWidth: 1,
  },
  promoChipText: {
    ...typography.captionStrong,
    color: colors.primary,
  },
  storeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px14,
    marginBottom: spacing.px8,
    gap: spacing.px12,
  },
  storeCardSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  storeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  storeRadioSelected: { borderColor: colors.primary },
  storeRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  storeInfo: { flex: 1 },
  storeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px6,
  },
  storeName: {
    ...typography.smallStrong,
    color: colors.text,
    flexShrink: 1,
  },
  storeStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  storeStatusText: {
    ...typography.micro,
    fontWeight: "700",
  },
  storeAddress: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 4,
    lineHeight: 17,
  },
  storeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4,
  },
  storeMetaText: {
    ...typography.micro,
    color: colors.gray,
  },
  storeDistance: {
    ...typography.micro,
    color: colors.primary,
    fontWeight: "700",
  },
  checkRow: { flexDirection: "row", alignItems: "center", minHeight: 46 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: colors.radius.sm,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkLabel: {
    ...typography.small,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.px10,
  },
  paymentCard: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
  },
  paymentInfo: { flex: 1, marginLeft: spacing.px10 },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.px14,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  paymentOptionSelected: { backgroundColor: colors.primaryLight },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.px12,
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  paymentContent: { flex: 1 },
  paymentLabel: { ...typography.smallStrong, color: colors.text },
  paymentDesc: { ...typography.caption, color: colors.gray, marginTop: 2 },
  summary: { marginTop: spacing.px16 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  summaryLabelBold: { ...typography.bodyStrong, color: colors.text },
  summaryValue: { ...typography.caption, color: colors.text },
  bottomSafe: { backgroundColor: colors.white },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.px12,
    paddingHorizontal: spacing.px16,
    paddingTop: spacing.px10,
    paddingBottom: spacing.px10,
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  totalInfo: { flex: 1, minWidth: 0 },
  bottomLabel: { ...typography.caption, color: colors.gray },
  total: { ...typography.priceLg, color: colors.primary, marginTop: 2 },
  cta: { flexShrink: 0, minWidth: 160 },
});