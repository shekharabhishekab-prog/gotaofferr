import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "dark" | "light" | "system";

const STORAGE_KEY = "gotaofferr-theme";

function systemPrefersLight() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches;
}

export function applyTheme(pref: ThemePreference) {
  if (typeof document === "undefined") return;
  const light = pref === "light" || (pref === "system" && systemPrefersLight());
  document.documentElement.classList.toggle("theme-light", light);
  document.documentElement.classList.toggle("dark", !light);
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    const initial = stored ?? "dark";
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }, []);

  return { theme, setTheme };
}
