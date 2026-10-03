import { useEffect, useState } from "react";

export type NetworkState = {
  online: boolean;
  /** "fast" | "slow" | "unknown" based on Network Information API. */
  effectiveType: "fast" | "slow" | "unknown";
  saveData: boolean;
  /** True when the user is online but on a slow / metered connection. */
  isSlow: boolean;
};

function getEffectiveType(): NetworkState["effectiveType"] {
  if (typeof navigator === "undefined") return "unknown";
  const conn = (navigator as any).connection;
  if (!conn) return "unknown";
  // 2g and slow-2g are treated as slow; 3g/4g as fast.
  if (["slow-2g", "2g"].includes(conn.effectiveType)) return "slow";
  if (["3g", "4g"].includes(conn.effectiveType)) return "fast";
  return "unknown";
}

function getSaveData(): boolean {
  if (typeof navigator === "undefined") return false;
  return Boolean((navigator as any).connection?.saveData);
}

/**
 * Tracks browser online/offline state and, when available, the Network
 * Information API effective connection type. Useful for showing an offline
 * banner and skipping heavy requests on metered connections.
 */
export function useNetworkStatus(): NetworkState {
  // Initial values must match the server render (always "online / unknown"),
  // otherwise React logs a hydration mismatch. Real values are read after mount.
  const [online, setOnline] = useState(true);
  const [effectiveType, setEffectiveType] = useState<NetworkState["effectiveType"]>("unknown");
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    setEffectiveType(getEffectiveType());
    setSaveData(getSaveData());

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleChange = () => {
      setEffectiveType(getEffectiveType());
      setSaveData(getSaveData());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const conn = (navigator as any).connection;
    if (conn?.addEventListener) {
      conn.addEventListener("change", handleChange);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (conn?.removeEventListener) {
        conn.removeEventListener("change", handleChange);
      }
    };
  }, []);

  return {
    online,
    effectiveType,
    saveData,
    isSlow: online && (effectiveType === "slow" || saveData),
  };
}
