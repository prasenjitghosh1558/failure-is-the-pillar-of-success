"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "telemetry-dark" | "enterprise-light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "telemetry-dark",
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("telemetry-dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("nextrak-theme") as Theme | null;
    if (saved && (saved === "telemetry-dark" || saved === "enterprise-light")) {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      applyTheme("telemetry-dark");
    }
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", t);
    if (t === "telemetry-dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("nextrak-theme", t);
    applyTheme(t);
  };

  const toggleTheme = () => {
    const next = theme === "telemetry-dark" ? "enterprise-light" : "telemetry-dark";
    setTheme(next);
  };

  const isDark = theme === "telemetry-dark";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

