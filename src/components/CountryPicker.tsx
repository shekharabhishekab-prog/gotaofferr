import { useEffect, useRef, useState } from "react";

import { BUILDER_COUNTRIES, countryName } from "@/lib/builder-countries";

/** One searchable country input: type, pick a suggestion. No long dropdown. */
export function CountryPicker({ value, onChange }: { value?: string; onChange: (code: string) => void }) {
  const [text, setText] = useState(countryName(value));
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  // Do not overwrite what the user is typing when the IP prefill arrives late.
  useEffect(() => {
    if (!open) setText(countryName(value));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) {
        setOpen(false);
        setText(countryName(value));
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [value]);
  const q = text.trim().toLowerCase();
  const picked = countryName(value).toLowerCase() === q;
  const hits = (q && !picked ? BUILDER_COUNTRIES.filter(([, n]) => n.toLowerCase().includes(q)) : BUILDER_COUNTRIES).slice(0, 8);
  return (
    <div ref={box} className="relative" data-testid="country-picker">
      <label htmlFor="builder-country" className="text-sm font-semibold text-foreground">
        Country you are applying in
      </label>
      <input
        id="builder-country"
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls="builder-country-list"
        value={text}
        placeholder="Start typing a country"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
        }}
        className="mt-1 block w-full rounded-lg border border-border/60 bg-card px-3 py-2 text-base text-foreground"
      />
      <p className="mt-1 text-xs text-muted-foreground">
        We guessed from your connection. Wrong? Type and pick the right one. Your resume follows that country's format.
      </p>
      {open && hits.length > 0 && (
        <ul
          id="builder-country-list"
          role="listbox"
          className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-card shadow-lg"
        >
          {hits.map(([code, name]) => (
            <li key={code} role="option" aria-selected={code === value}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-primary/10"
                onClick={() => {
                  onChange(code);
                  setText(name);
                  setOpen(false);
                }}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
