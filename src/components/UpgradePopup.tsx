import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { PLAN_LABEL, nextTier, type PlanTier } from "@/lib/plans";

export type UpgradeFeature = "interview" | "tailor" | "builder" | "jobs" | "alerts";

const MEME: Record<UpgradeFeature, string> = {
  interview: "Coco ran out of interview slots and is now staring at the wall. Feed her a bigger plan 😼",
  tailor: "Your free rewrites are gone. Your resume is still crying in the corner. Let's fix that 📄😭",
  builder: "Resume builder said: that's all, folks. Time for a bigger plan 🛠️",
  jobs: "The job finder is out of fuel. The jobs are still out there, waiting 🔍",
  alerts: "No alerts left this month. Your dream job won't wait, a bigger plan will 🔔",
};

/** Friendly popup shown when a limited feature is used up. One line, one button to the pricing page. */
export function UpgradePopup({
  open,
  onClose,
  tier,
  feature,
}: {
  open: boolean;
  onClose: () => void;
  tier: PlanTier;
  feature: UpgradeFeature;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  const up = nextTier(tier);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade for more"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(255,255,253,.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 420, background: "#fffffd", color: "#073f89", border: "2px solid #073f89", borderRadius: 20, padding: "28px 24px", textAlign: "center", boxShadow: "0 0 60px -10px rgba(7,63,137,.35)" }}
      >
        <div style={{ fontSize: 44, lineHeight: 1 }}>🐾</div>
        <p style={{ margin: "14px 0 0", fontSize: "1.15rem", fontWeight: 800, lineHeight: 1.35 }}>{MEME[feature]}</p>
        <p style={{ margin: "10px 0 0", fontSize: ".9rem", opacity: 0.75 }}>
          {up ? `You are on ${PLAN_LABEL[tier]}. ${PLAN_LABEL[up]} gives you more every month.` : "You are on our biggest plan. It resets next month."}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          {up ? (
            <Link
              to="/pricing"
              style={{ display: "block", background: "#073f89", color: "#fffffd", fontWeight: 900, borderRadius: 999, padding: "13px 18px", textDecoration: "none" }}
            >
              See {PLAN_LABEL[up]} plan →
            </Link>
          ) : null}
          <button type="button" onClick={onClose} style={{ background: "transparent", color: "#073f89", border: "1px solid rgba(20,33,58,.35)", borderRadius: 999, padding: "11px 18px", cursor: "pointer" }}>
            Maybe later
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
