import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import {
  NavigationContainer,
  type NavigatorScreenParams,
  type Theme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Grid2X2 from "lucide-react-native/icons/grid-2x2";
import House from "lucide-react-native/icons/house";
import ShoppingCart from "lucide-react-native/icons/shopping-cart";
import UserRound from "lucide-react-native/icons/user-round";

import colors from "../constants/colors";
import spacing from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import AddressFormScreen from "../screens/AddressFormScreen";
import AddressListScreen from "../screens/AddressListScreen";
import CartScreen from "../screens/CartScreen";
import CatalogScreen from "../screens/CatalogScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RegisterScreen from "../screens/RegisterScreen";
import WarrantyScreen from "../screens/WarrantyScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import ReviewsScreen from "../screens/ReviewsScreen";
import ComparisonScreen from "../screens/ComparisonScreen";
import PcBuilderScreen from "../screens/PcBuilderScreen";
import LaptopUpgradeScreen from "../screens/LaptopUpgradeScreen";
import PriceAlertsScreen from "../screens/PriceAlertsScreen";
import type { CatalogProduct } from "../types/catalog";
import type { Address } from "../types/address";

export type MainTabParamList = {
  Home: undefined;
  Catalog: { initialQuery?: string; category?: string } | undefined;
  Cart: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  ProductDetail: { product: CatalogProduct };
  Checkout: { selectedAddressId?: number | string } | undefined;
  Login: { redirectTo?: keyof RootStackParamList } | undefined;
  Register: { redirectTo?: keyof RootStackParamList } | undefined;
  Addresses: { selectMode?: boolean } | undefined;
  AddressForm: { address?: Address } | undefined;
  Orders: undefined;
  OrderDetail: { orderId: number | string; order?: unknown };
  Notifications: undefined;
  Warranty: undefined;
  Favorites: undefined;
  Reviews: { product: CatalogProduct };
  Comparison: undefined;
  PcBuilder: undefined;
  LaptopUpgrade: { product: CatalogProduct };
  PriceAlerts: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navigationTheme: Theme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.white,
    text: colors.text,
    border: colors.border,
    notification: colors.red,
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" },
    medium: { fontFamily: "System", fontWeight: "500" },
    bold: { fontFamily: "System", fontWeight: "700" },
    heavy: { fontFamily: "System", fontWeight: "900" },
  },
};

const tabIcons = {
  Home: House,
  Catalog: Grid2X2,
  Cart: ShoppingCart,
  Profile: UserRound,
};

function MainTabs() {
  const { cartCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const Icon = tabIcons[route.name];
        return {
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray,
          tabBarHideOnKeyboard: true,
          sceneStyle: styles.scene,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabItem,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Icon color={color} size={22} strokeWidth={focused ? 2.6 : 2} />
              {route.name === "Cart" && cartCount > 0 ? (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {cartCount > 99 ? "99+" : cartCount}
                  </Text>
                </View>
              ) : null}
            </View>
          ),
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Trang chủ" }} />
      <Tab.Screen name="Catalog" component={CatalogScreen} options={{ title: "Sản phẩm" }} />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: "Giỏ hàng",
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Tài khoản" }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isRestoring } = useAuth();

  if (isRestoring) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Addresses" component={AddressListScreen} />
        <Stack.Screen name="AddressForm" component={AddressFormScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Warranty" component={WarrantyScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
        <Stack.Screen name="Reviews" component={ReviewsScreen} />
        <Stack.Screen name="Comparison" component={ComparisonScreen} />
        <Stack.Screen name="PcBuilder" component={PcBuilderScreen} />
        <Stack.Screen name="LaptopUpgrade" component={LaptopUpgradeScreen} />
        <Stack.Screen name="PriceAlerts" component={PriceAlertsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  scene: {
    backgroundColor: colors.background,
  },
  tabBar: {
    minHeight: 64,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.px6,
    paddingBottom: spacing.px6,
    elevation: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  tabItem: {
    minHeight: 52,
    paddingTop: 2,
    paddingBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 2,
  },
  tabBadge: {
    position: "absolute",
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  tabBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "900",
  },
  badge: {
    minWidth: 17,
    height: 17,
    borderRadius: 8,
    backgroundColor: colors.danger,
    color: colors.white,
    fontSize: 9,
    fontWeight: "800",
  },
});
