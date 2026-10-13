import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

export const fieldClass =
  "mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none";

export function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="mt-3 block text-sm font-semibold text-foreground first:mt-0">
      {label}
      {required ? <span className="text-primary"> *</span> : null}
      {children}
      {hint ? <span className="mt-1 block text-xs font-normal text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={`mt-1 block text-right text-[11px] font-normal ${value.length > max * 0.9 ? "text-primary" : "text-muted-foreground"}`}>
      {value.length}/{max}
    </span>
  );
}

type Props<T extends { id: string }> = {
  title: string;
  help?: string;
  items: T[];
  onChange: (items: T[]) => void;
  show: boolean;
  onShow: (v: boolean) => void;
  empty: () => T;
  addLabel: string;
  summary: (item: T) => { title: string; sub: string };
  validate: (item: T) => string | null;
  form: (draft: T, set: (patch: Partial<T>) => void) => ReactNode;
  max?: number;
};

/** Add / edit / delete / reorder list. Edit opens the same form prefilled. Delete asks first. */
export function ListEditor<T extends { id: string }>(p: Props<T>) {
  const [draft, setDraft] = useState<T | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const save = () => {
    if (!draft) return;
    const e = p.validate(draft);
    if (e) return setErr(e);
    p.onChange(isNew ? [...p.items, draft] : p.items.map((i) => (i.id === draft.id ? draft : i)));
    setDraft(null);
    setErr(null);
  };
  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= p.items.length) return;
    const next = [...p.items];
    [next[idx], next[j]] = [next[j], next[idx]];
    p.onChange(next);
  };

  return (
    <section className="rounded-xl border border-border/60 bg-card p-5" aria-label={p.title}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{p.title}</p>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={p.show} onChange={(e) => p.onShow(e.target.checked)} className="h-4 w-4 accent-[#f7d000]" />
          Show
        </label>
      </div>
      {p.help ? <p className="mt-1 text-xs text-muted-foreground">{p.help}</p> : null}

      <ul className="mt-3 space-y-2">
        {p.items.map((it, idx) => {
          const s = p.summary(it);
          return (
            <li key={it.id} className="rounded-lg border border-border/60 bg-background p-3">
              <p className="text-sm font-semibold text-foreground">{s.title}</p>
              {s.sub ? <p className="text-xs text-muted-foreground">{s.sub}</p> : null}
              {confirmId === it.id ? (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-foreground">Delete this? This cannot be undone.</span>
                  <Button type="button" size="sm" onClick={() => { p.onChange(p.items.filter((x) => x.id !== it.id)); setConfirmId(null); }}>
                    Yes, delete
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setConfirmId(null)}>
                    Keep
                  </Button>
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => { setDraft({ ...it }); setIsNew(false); setErr(null); }}>
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setConfirmId(it.id)}>
                    Delete
                  </Button>
                  <Button type="button" size="sm" variant="outline" aria-label="Move up" disabled={idx === 0} onClick={() => move(idx, -1)}>
                    Up
                  </Button>
                  <Button type="button" size="sm" variant="outline" aria-label="Move down" disabled={idx === p.items.length - 1} onClick={() => move(idx, 1)}>
                    Down
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {draft ? (
        <div className="mt-3 rounded-lg border border-primary/50 bg-background p-4">
          {p.form(draft, (patch) => setDraft({ ...draft, ...patch }))}
          {err ? <p role="alert" className="mt-3 text-xs text-primary">{err}</p> : null}
          <div className="mt-4 flex gap-2">
            <Button type="button" size="sm" onClick={save}>
              Save
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => { setDraft(null); setErr(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : !p.max || p.items.length < p.max ? (
        <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => { setDraft(p.empty()); setIsNew(true); setErr(null); }}>
          {p.addLabel}
        </Button>
      ) : null}
    </section>
  );
}

let n = 0;
export const newId = () => `n${Date.now().toString(36)}${(n++).toString(36)}`;
export const endBeforeStart = (start: string, end: string) => !!start && !!end && end < start;
