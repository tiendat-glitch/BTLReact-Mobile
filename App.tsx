import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import colors from "./src/constants/colors";
import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { CompareProvider } from "./src/context/CompareContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <CompareProvider>
          <CartProvider>
            <SafeAreaView
              style={{ flex: 1, backgroundColor: colors.background }}
              edges={["top", "bottom"]}
            >
              <AppNavigator />
            </SafeAreaView>
          </CartProvider>
        </CompareProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

