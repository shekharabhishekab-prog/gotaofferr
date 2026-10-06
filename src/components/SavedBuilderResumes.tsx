import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Download, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteBuilderSave, listBuilderSaves } from "@/lib/builder-saves.functions";
import { toast } from "@/lib/toast";

type Item = { id: string; label: string | null; result: any; created_at: string };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/** Resumes saved from the resume builder. Shown for plans that have save slots. */
export function SavedBuilderResumes() {
  const list = useServerFn(listBuilderSaves);
  const remove = useServerFn(deleteBuilderSave);
  const [state, setState] = useState<{ slots: number; items: Item[] } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    void list({}).then((r) => setState({ slots: r.slots, items: r.items as Item[] })).catch(() => setState({ slots: 0, items: [] }));
  }, [list]);

  if (state === null) return <Skeleton className="h-24 w-full rounded-2xl" />;
  if (state.slots === 0) return null;

  async function download(item: Item) {
    setBusy(item.id);
    try {
      const { buildBuilderResumePdf } = await import("@/lib/resume-builder-pdf");
      const doc = await buildBuilderResumePdf(item.result.draft, item.result.polished ?? null);
      doc.save(`${(item.result.draft?.fullName || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-resume.pdf`);
    } catch {
      toast.error("Could not build the PDF. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function del(item: Item) {
    setBusy(item.id);
    try {
      const r = await remove({ data: { id: item.id } });
      if (r.ok) setState((s) => (s ? { ...s, items: s.items.filter((x) => x.id !== item.id) } : s));
      else toast.error("Could not delete right now. Please try again.");
    } catch {
      toast.error("Could not delete right now. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-card-foreground">Saved builder resumes</h2>
        <span className="text-xs text-muted-foreground">
          {state.items.length} of {state.slots} saved
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Saved resumes are removed automatically after 3 months.</p>
      {state.items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Nothing saved yet. Use "Save to my account" in the resume builder.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border/60">
          {state.items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="text-sm font-medium text-card-foreground">{item.label || "Resume"}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(item.created_at)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" disabled={busy === item.id} onClick={() => download(item)}>
                  {busy === item.id ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                  Resume
                </Button>
                <Button size="sm" variant="ghost" disabled={busy === item.id} onClick={() => del(item)}>
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
