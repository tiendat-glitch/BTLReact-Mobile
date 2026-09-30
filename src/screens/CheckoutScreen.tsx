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
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Check from "lucide-react-native/icons/check";
import MapPin from "lucide-react-native/icons/map-pin";
import PackageCheck from "lucide-react-native/icons/package-check";
import StoreIcon from "lucide-react-native/icons/store";
import Truck from "lucide-react-native/icons/truck";

import FormField from "../components/FormField";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { getAddresses } from "../services/addressService";
import {
  createCheckoutOrder,
  getCheckoutOptions,
  getCheckoutQuote,
  type CheckoutInput,
  type CheckoutQuote,
  type FulfillmentMethod,
  type ShippingMethod,
  type SpecialRequestCode,
  type Store,
} from "../services/checkoutService";
import type { Address } from "../types/address";
import { formatAddress, formatCurrency } from "../utils/formatters";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;
type CartItem = {
  cartKey: string;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
};
type CartState = {
  cart: CartItem[];
  isCartLoading: boolean;
  reloadCart: () => Promise<void>;
};
type AuthState = {
  isAuthenticated: boolean;
  user: { fullName?: string; phone?: string } | null;
};

const SPECIAL_REQUEST_LABELS: Record<SpecialRequestCode, string> = {
  AFTER_HOURS: "Giao ngoài giờ hành chính",
  CALL_BEFORE_DELIVERY: "Gọi điện trước khi giao",
  CAREFUL_PACKAGING: "Đóng gói cẩn thận",
  SMS_ONLY: "Chỉ nhắn tin, không gọi điện",
  INSPECT_BEFORE_RECEIVING: "Kiểm tra hàng trước khi nhận",
};

const newIdempotencyKey = () =>
  `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

export default function CheckoutScreen({ navigation, route }: Props) {
  const { isAuthenticated, user } = useAuth() as AuthState;
  const { cart, isCartLoading, reloadCart } = useCart() as CartState;
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [availableSpecialRequests, setAvailableSpecialRequests] = useState<SpecialRequestCode[]>([]);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("DELIVERY");
  const [selectedAddressId, setSelectedAddressId] = useState<number | string | null>(route.params?.selectedAddressId || null);
  const [pickupStoreId, setPickupStoreId] = useState<number | string | null>(null);
  const [shippingMethodCode, setShippingMethodCode] = useState("STANDARD");
  const [recipientName, setRecipientName] = useState(user?.fullName || "");
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || "");
  const [specialRequests, setSpecialRequests] = useState<SpecialRequestCode[]>([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [note, setNote] = useState("");
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
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
      const [nextAddresses, options] = await Promise.all([
        getAddresses() as Promise<Address[]>,
        getCheckoutOptions(),
      ]);
      setAddresses(nextAddresses);
      setStores(options.stores);
      setShippingMethods(options.shippingMethods);
      setAvailableSpecialRequests(options.specialRequests);
      setSelectedAddressId((current) =>
        current || nextAddresses.find((item) => Boolean(item.is_default))?.id || nextAddresses[0]?.id || null
      );
      setPickupStoreId((current) => current || options.stores[0]?.id || null);
      setShippingMethodCode((current) =>
        options.shippingMethods.some((item) => item.code === current)
          ? current
          : options.shippingMethods[0]?.code || "STANDARD"
      );
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Không tải được checkout.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const selectedAddress = useMemo(
    () => addresses.find((item) => String(item.id) === String(selectedAddressId)),
    [addresses, selectedAddressId]
  );

  const buildInput = useCallback((): CheckoutInput | null => {
    const base = {
      fulfillmentMethod,
      specialRequests,
      voucherCode: voucherCode.trim() || undefined,
      note: note.trim() || undefined,
      paymentMethod: "COD" as const,
    };
    if (fulfillmentMethod === "DELIVERY") {
      if (!selectedAddressId || !shippingMethodCode) return null;
      return { ...base, addressId: selectedAddressId, shippingMethodCode };
    }
    if (!pickupStoreId || !recipientName.trim() || !recipientPhone.trim()) return null;
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
          setError(nextError instanceof Error ? nextError.message : "Không tính được đơn hàng.");
        }
      } finally {
        if (quoteRequest.current === requestId) setIsQuoting(false);
      }
    }, 450);
    return () => clearTimeout(timeout);
  }, [buildInput, cart.length, isCartLoading, isLoading]);

  const toggleSpecialRequest = (code: SpecialRequestCode) => {
    setSpecialRequests((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code]
    );
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
      const order = await createCheckoutOrder(input, idempotencyKey.current);
      await reloadCart();
      idempotencyKey.current = newIdempotencyKey();
      navigation.replace("OrderDetail", { orderId: order.id, order });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Không thể đặt hàng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScreenHeader title="Xác nhận đơn hàng" navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {isLoading ? <ActivityIndicator color={colors.primary} /> : (
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
                icon={<StoreIcon size={18} color={fulfillmentMethod === "PICKUP" ? colors.white : colors.gray} />}
                selected={fulfillmentMethod === "PICKUP"}
                onPress={() => setFulfillmentMethod("PICKUP")}
              />
            </View>

            {fulfillmentMethod === "DELIVERY" ? (
              <>
                <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
                {selectedAddress ? (
                  <Pressable style={styles.card} onPress={() => navigation.navigate("Addresses", { selectMode: true })}>
                    <View style={styles.rowBetween}>
                      <View style={styles.iconBox}><MapPin color={colors.primary} size={18} /></View>
                      <View style={styles.flex}>
                        <Text style={styles.strong}>{selectedAddress.receiver_name} · {selectedAddress.receiver_phone}</Text>
                        <Text style={styles.muted}>{formatAddress(selectedAddress)}</Text>
                      </View>
                      <Text style={styles.change}>Đổi</Text>
                    </View>
                  </Pressable>
                ) : (
                  <Pressable style={styles.emptyButton} onPress={() => navigation.navigate("AddressForm")}>
                    <Text style={styles.change}>+ Thêm địa chỉ nhận hàng</Text>
                  </Pressable>
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
                {stores.map((store) => (
                  <Choice
                    key={String(store.id)}
                    selected={String(pickupStoreId) === String(store.id)}
                    title={store.name}
                    description={`${store.address_line}, ${store.district || store.province} · ${store.opening_hours || "Liên hệ cửa hàng"}`}
                    onPress={() => setPickupStoreId(store.id)}
                  />
                ))}
                <View style={styles.formCard}>
                  <FormField label="Người nhận *" value={recipientName} onChangeText={setRecipientName} />
                  <FormField label="Số điện thoại *" value={recipientPhone} onChangeText={setRecipientPhone} keyboardType="phone-pad" />
                </View>
              </>
            )}

            <Text style={styles.sectionTitle}>Sản phẩm</Text>
            <View style={styles.card}>
              {cart.map((item) => (
                <View key={item.cartKey} style={styles.productRow}>
                  <View style={styles.flex}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.muted}>{item.variantName} · x{item.quantity}</Text>
                  </View>
                  <Text style={styles.productPrice}>{formatCurrency(item.price * item.quantity)}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Mã giảm giá</Text>
            <TextInput style={styles.input} value={voucherCode} onChangeText={(value) => setVoucherCode(value.toUpperCase())} autoCapitalize="characters" placeholder="Nhập mã voucher" placeholderTextColor={colors.muted} />

            <Text style={styles.sectionTitle}>Yêu cầu đặc biệt</Text>
            <View style={styles.card}>
              {availableSpecialRequests.map((code) => {
                const selected = specialRequests.includes(code);
                return (
                  <Pressable key={code} style={styles.checkRow} onPress={() => toggleSpecialRequest(code)} accessibilityRole="checkbox" accessibilityState={{ checked: selected }}>
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected ? <Check color={colors.white} size={14} strokeWidth={3} /> : null}
                    </View>
                    <Text style={styles.checkLabel}>{SPECIAL_REQUEST_LABELS[code]}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Ghi chú đơn hàng</Text>
            <TextInput style={[styles.input, styles.note]} value={note} onChangeText={setNote} multiline maxLength={500} textAlignVertical="top" placeholder="Ví dụ: Vui lòng gọi trước khi giao..." placeholderTextColor={colors.muted} />
            <Text style={styles.counter}>{note.length}/500</Text>

            <Text style={styles.sectionTitle}>Thanh toán</Text>
            <View style={styles.paymentCard}>
              <PackageCheck color={colors.primary} size={22} />
              <View style={styles.paymentInfo}>
                <Text style={styles.strong}>Thanh toán khi nhận hàng (COD)</Text>
                <Text style={styles.muted}>Thanh toán sau khi nhận và kiểm tra hàng.</Text>
              </View>
            </View>

            <View style={styles.summary}>
              {isQuoting ? <ActivityIndicator color={colors.primary} /> : quote ? (
                <>
                  <Summary label="Tạm tính" value={formatCurrency(quote.subtotal)} />
                  <Summary label="Giảm giá" value={`-${formatCurrency(quote.discountAmount)}`} />
                  <Summary label="Phí vận chuyển" value={formatCurrency(quote.shippingFee)} />
                  <Summary label="Tổng cộng" value={formatCurrency(quote.totalAmount)} bold />
                </>
              ) : <Text style={styles.muted}>Hoàn tất thông tin để tính tổng đơn hàng.</Text>}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.bottom}>
        <View>
          <Text style={styles.bottomLabel}>Tổng thanh toán</Text>
          <Text style={styles.total}>{quote ? formatCurrency(quote.totalAmount) : "--"}</Text>
        </View>
        <TouchableOpacity style={[styles.orderButton, (!quote || isSubmitting || isQuoting) && styles.disabled]} onPress={placeOrder} disabled={!quote || isSubmitting || isQuoting}>
          {isSubmitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.orderText}>Đặt hàng COD</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function Segment({ label, icon, selected, onPress }: { label: string; icon: React.ReactNode; selected: boolean; onPress: () => void }) {
  return <Pressable style={[styles.segment, selected && styles.segmentSelected]} onPress={onPress}><View style={styles.segmentIcon}>{icon}</View><Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{label}</Text></Pressable>;
}

function Choice({ selected, title, description, onPress }: { selected: boolean; title: string; description: string; onPress: () => void }) {
  return <Pressable style={[styles.choice, selected && styles.choiceSelected]} onPress={onPress}><View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View><View style={styles.flex}><Text style={styles.strong}>{title}</Text><Text style={styles.muted}>{description}</Text></View></Pressable>;
}

function Summary({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <View style={styles.rowBetween}><Text style={[styles.muted, bold && styles.strong]}>{label}</Text><Text style={[styles.summaryValue, bold && styles.total]}>{value}</Text></View>;
}

const formatEta = (method: ShippingMethod) =>
  method.eta_min_days === 0 && method.eta_max_days === 0
    ? "Trong ngày"
    : `${method.eta_min_days}-${method.eta_max_days} ngày`;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 112 },
  error: { color: colors.red, backgroundColor: colors.redLight, borderRadius: 8, padding: 12, marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 17, marginBottom: 9 },
  segmented: { flexDirection: "row", backgroundColor: colors.surfaceMuted, borderRadius: 8, padding: 4 },
  segment: { flex: 1, minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 6 },
  segmentSelected: { backgroundColor: colors.primary },
  segmentIcon: { marginRight: 7 },
  segmentText: { color: colors.gray, fontSize: 12, fontWeight: "800" },
  segmentTextSelected: { color: colors.white },
  card: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 14 },
  formCard: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 14, marginTop: 8 },
  emptyButton: { minHeight: 54, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8 },
  choice: { minHeight: 64, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 8 },
  choiceSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  radio: { width: 21, height: 21, borderRadius: 11, borderColor: colors.borderStrong, borderWidth: 2, alignItems: "center", justifyContent: "center", marginRight: 11 },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 4 },
  iconBox: { width: 38, height: 38, alignItems: "center", justifyContent: "center", backgroundColor: colors.primaryLight, borderRadius: 8, marginRight: 10 },
  flex: { flex: 1 },
  strong: { color: colors.text, fontSize: 13, fontWeight: "800" },
  muted: { color: colors.gray, fontSize: 11, lineHeight: 18, marginTop: 3 },
  change: { color: colors.primary, fontSize: 12, fontWeight: "800", marginLeft: 8 },
  productRow: { flexDirection: "row", alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 10 },
  productName: { color: colors.text, fontSize: 12, fontWeight: "800" },
  productPrice: { color: colors.primary, fontSize: 12, fontWeight: "800" },
  input: { minHeight: 50, backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, color: colors.text, fontSize: 14, paddingHorizontal: 13 },
  note: { minHeight: 100, paddingTop: 12 },
  counter: { color: colors.gray, fontSize: 10, marginTop: 5, textAlign: "right" },
  checkRow: { minHeight: 46, flexDirection: "row", alignItems: "center" },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderColor: colors.borderStrong, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkLabel: { flex: 1, color: colors.text, fontSize: 12, marginLeft: 10 },
  paymentCard: { minHeight: 66, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderColor: colors.primary, borderWidth: 1, borderRadius: 8, padding: 13 },
  paymentInfo: { flex: 1, marginLeft: 11 },
  summary: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 14, marginTop: 18 },
  summaryValue: { color: colors.text, fontSize: 11 },
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0, minHeight: 82, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.white, borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 12 },
  bottomLabel: { color: colors.gray, fontSize: 10 },
  total: { color: colors.primary, fontSize: 18, fontWeight: "900" },
  orderButton: { minWidth: 150, minHeight: 50, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16 },
  disabled: { opacity: 0.5 },
  orderText: { color: colors.white, fontSize: 13, fontWeight: "900" },
});
