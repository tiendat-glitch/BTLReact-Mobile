import { useEffect } from "react";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";

import { useAuth } from "../context/AuthContext";

export default function useRequireAuth(
  navigation: NavigationProp<ParamListBase>,
  redirectTo?: string,
): boolean {
  const { isAuthenticated, isRestoring } = useAuth();

  useEffect(() => {
    if (!isRestoring && !isAuthenticated) {
      // Caller (màn hình) truyền navigation với stack riêng; cast sang any
      // để tránh phải generic tại đây. Mỗi screen sẽ tự check redirectTo.
      (navigation as unknown as { replace: (route: string, params?: object) => void })
        .replace("Login", { redirectTo });
    }
  }, [isAuthenticated, isRestoring, navigation, redirectTo]);

  return isAuthenticated;
}
