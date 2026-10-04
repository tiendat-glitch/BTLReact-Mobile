import { Platform } from "react-native";

const defaultHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const defaultApiUrl = `http://${defaultHost}:8000/api`;

export const API_BASE_URL: string = (
  process.env.EXPO_PUBLIC_API_URL || defaultApiUrl
).replace(/\/+$/, "");

export const API_TIMEOUT_MS: number = 10000;
