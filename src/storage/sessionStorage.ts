import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "computer_store_access_token";

const getWebStorage = (): Storage | null =>
  typeof globalThis.localStorage === "undefined" ? null : globalThis.localStorage;

export async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return getWebStorage()?.getItem(TOKEN_KEY) || null;
  }

  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function storeToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    getWebStorage()?.setItem(TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeStoredToken(): Promise<void> {
  if (Platform.OS === "web") {
    getWebStorage()?.removeItem(TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
