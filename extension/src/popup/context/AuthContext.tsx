import React, { createContext, useContext, useEffect, useState } from "react";
import { User, STORAGE_KEYS, Settings, DEFAULT_SETTINGS } from "@/types";
import { getItem, setItem, removeItems } from "@/utils/storage";
import { isTokenExpired } from "@/utils/crypto";
import * as AuthAPI from "@/api/auth";

type AuthScreen =
  | "loading"
  | "login"
  | "set-passcode"
  | "passcode"
  | "dashboard";

interface AuthCtx {
  screen: AuthScreen;
  user: User | null;
  settings: Settings;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  onPasscodeSet: () => void;
  onPasscodeVerified: () => void;
  updateSettings: (s: Partial<Settings>) => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [screen, setScreen] = useState<AuthScreen>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    (async () => {
      const [token, storedUser, passcodeHash, lastUnlock, storedSettings] =
        await Promise.all([
          getItem<string>(STORAGE_KEYS.AUTH_TOKEN),
          getItem<User>(STORAGE_KEYS.AUTH_USER),
          getItem<string>(STORAGE_KEYS.PASSCODE_HASH),
          getItem<number>(STORAGE_KEYS.PASSCODE_LAST_UNLOCK),
          getItem<Settings>(STORAGE_KEYS.SETTINGS),
        ]);

      const mergedSettings = { ...DEFAULT_SETTINGS, ...(storedSettings ?? {}) };
      setSettings(mergedSettings);

      // No token or expired → login
      if (!token || isTokenExpired(token)) {
        setScreen("login");
        return;
      }

      setUser(storedUser);

      // No passcode set → force set passcode first
      if (!passcodeHash) {
        setScreen("set-passcode");
        return;
      }

      // Within unlock window → dashboard
      const timeoutMs = mergedSettings.passcodeTimeoutMinutes * 60 * 1000;
      if (lastUnlock && Date.now() - lastUnlock <= timeoutMs) {
        setScreen("dashboard");
        return;
      }

      setScreen("passcode");
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await AuthAPI.login(email, password);
    const { token, user: u } = res.data;
    await Promise.all([
      setItem(STORAGE_KEYS.AUTH_TOKEN, token),
      setItem(STORAGE_KEYS.AUTH_USER, u),
      setItem(STORAGE_KEYS.AUTH_LOGIN_TIME, Date.now()),
    ]);
    setUser(u);

    const passcodeHash = await getItem<string>(STORAGE_KEYS.PASSCODE_HASH);
    if (!passcodeHash) {
      setScreen("set-passcode");
    } else {
      setScreen("dashboard");
    }

    // Kick off a background sync
    chrome.runtime.sendMessage({ type: "SYNC_BOOKMARKS" });
  };

  const logout = async () => {
    await removeItems([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.AUTH_USER,
      STORAGE_KEYS.AUTH_LOGIN_TIME,
      STORAGE_KEYS.PASSCODE_LAST_UNLOCK,
    ]);
    setUser(null);
    setScreen("login");
  };

  const onPasscodeSet = () => {
    setScreen("dashboard");
    chrome.runtime.sendMessage({ type: "SYNC_BOOKMARKS" });
  };

  const onPasscodeVerified = () => {
    setScreen("dashboard");
  };

  const updateSettings = async (partial: Partial<Settings>) => {
    const merged = { ...settings, ...partial };
    setSettings(merged);
    await setItem(STORAGE_KEYS.SETTINGS, merged);
  };

  return (
    <AuthContext.Provider
      value={{
        screen,
        user,
        settings,
        login,
        logout,
        onPasscodeSet,
        onPasscodeVerified,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
