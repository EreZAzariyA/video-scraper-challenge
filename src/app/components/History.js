"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "metadata_url_history_v1";

function normalizeForHistory(value) {
  return String(value || "").trim();
}

export function useHistory() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const api = useMemo(
    () => ({
      add: (url) => {
        const normalized = normalizeForHistory(url);
        if (!normalized) return;
        setItems((prev) => {
          const next = [normalized, ...prev.filter((x) => x !== normalized)];
          return next.slice(0, 25);
        });
      },
      clear: () => setItems([]),
    }),
    []
  );

  return { items, ...api };
}

export default function History({ items, onPick, onClear }) {
  if (!items?.length) return null;
  return (
    <section className="mt-6 rounded-lg border border-black/10 dark:border-white/10 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Recent URLs</h2>
        <button
          type="button"
          onClick={onClear}
          className="h-9 px-3 rounded-md border border-black/10 dark:border-white/15 text-sm"
        >
          Clear
        </button>
      </div>
      <ul className="mt-3 grid gap-2">
        {items.map((url) => (
          <li key={url}>
            <button
              type="button"
              className="w-full text-left text-sm truncate rounded border border-transparent hover:border-black/10 dark:hover:border-white/15 px-3 py-2"
              onClick={() => onPick?.(url)}
              title={url}
            >
              {url}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}


