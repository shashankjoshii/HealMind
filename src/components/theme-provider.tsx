"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "healmind-theme";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * The `<html>` class is the source of truth — the pre-paint script in the root
 * layout sets it before React runs. Rather than mirroring it into state (which
 * would mean a setState-in-effect and a cascading render), we subscribe to it
 * directly and let React read it on demand.
 */
const themeStore = {
  listeners: new Set<() => void>(),
  subscribe(listener: () => void) {
    themeStore.listeners.add(listener);
    return () => {
      themeStore.listeners.delete(listener);
    };
  },
  emit() {
    themeStore.listeners.forEach((l) => l());
  },
  getSnapshot(): Theme {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  },
  // The server has no DOM; the pre-paint script corrects this before paint.
  getServerSnapshot(): Theme {
    return "light";
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  );

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing / storage disabled — theme just won't persist.
    }
    themeStore.emit();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
