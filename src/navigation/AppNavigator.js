import React from "react";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import FoodDetailScreen from "../screens/FoodDetailScreen";
import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";

const Stack =
  createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

        <Stack.Screen
          name="FoodDetail"
          component={FoodDetailScreen}
        />

        <Stack.Screen
          name="Cart"
          component={CartScreen}
        />

        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}