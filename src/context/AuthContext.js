import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser,
  loginRequest,
  registerRequest,
} from "../services/authService";
import {
  setApiAccessToken,
  setApiUnauthorizedHandler,
} from "../services/httpClient";
import {
  getStoredToken,
  removeStoredToken,
  storeToken,
} from "../storage/sessionStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const clearSession = useCallback(async () => {
    setApiAccessToken(null);
    setUser(null);
    await removeStoredToken();
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const token = await getStoredToken();
        if (!token) {
          return;
        }

        setApiAccessToken(token);
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        setApiAccessToken(null);
        await removeStoredToken();
      } finally {
        if (isMounted) {
          setIsRestoring(false);
        }
      }
    }

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setApiUnauthorizedHandler(clearSession);
    return () => setApiUnauthorizedHandler(null);
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const session = await loginRequest(credentials);
    setApiAccessToken(session.token);
    try {
      await storeToken(session.token);
    } catch (error) {
      setApiAccessToken(null);
      throw error;
    }
    setUser(session.user);
    return session.user;
  }, []);

  const register = useCallback(async (data) => {
    await registerRequest(data);
    return login({ email: data.email, password: data.password });
  }, [login]);

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isRestoring,
      login,
      register,
      logout,
      clearSession,
    }),
    [user, isRestoring, login, register, logout, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }
  return context;
}

