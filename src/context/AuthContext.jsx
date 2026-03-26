/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
  clearAuthSession,
  getCurrentUser,
  getStoredAuthSession,
  loginUser,
  registerUser,
  setAuthToken,
  storeAuthSession,
} from "../services/api";

const AuthContext = createContext(null);

function applySession(session, setToken, setUser, setAuthLoading) {
  setAuthToken(session.token);
  storeAuthSession(session);
  setToken(session.token);
  setUser(session.user);
  setAuthLoading(false);
  return session;
}

function clearSessionState(setToken, setUser, setAuthLoading) {
  clearAuthSession();
  setAuthToken("");
  setToken("");
  setUser(null);
  setAuthLoading(false);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const storedSession = getStoredAuthSession();

      if (!storedSession?.token) {
        if (isMounted) {
          setAuthLoading(false);
        }

        return;
      }

      try {
        setAuthToken(storedSession.token);
        const response = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        applySession(
          { token: storedSession.token, user: response.data.user },
          setToken,
          setUser,
          setAuthLoading
        );
      } catch {
        if (isMounted) {
          clearSessionState(setToken, setUser, setAuthLoading);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleUnauthorized = () => {
      clearSessionState(setToken, setUser, setAuthLoading);
    };

    window.addEventListener("crm:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("crm:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (credentials) => {
    const response = await loginUser(credentials);

    return applySession(response.data, setToken, setUser, setAuthLoading);
  };

  const register = async (payload) => {
    const response = await registerUser(payload);

    return applySession(response.data, setToken, setUser, setAuthLoading);
  };

  const logout = () => {
    clearSessionState(setToken, setUser, setAuthLoading);
  };

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === "admin",
        login,
        logout,
        register,
        token,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
