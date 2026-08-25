import React from "react";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import { CartProvider } from "./src/context/CartContext";

import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <SafeAreaView
          style={{ flex: 1 }}
          edges={["top", "bottom"]}
        >
          <AppNavigator />
        </SafeAreaView>
      </CartProvider>
    </SafeAreaProvider>
  );
}