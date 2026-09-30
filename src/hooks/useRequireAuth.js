import { useEffect } from "react";

import { useAuth } from "../context/AuthContext";

export default function useRequireAuth(navigation, redirectTo) {
  const { isAuthenticated, isRestoring } = useAuth();

  useEffect(() => {
    if (!isRestoring && !isAuthenticated) {
      navigation.replace("Login", { redirectTo });
    }
  }, [isAuthenticated, isRestoring, navigation, redirectTo]);

  return isAuthenticated;
}

