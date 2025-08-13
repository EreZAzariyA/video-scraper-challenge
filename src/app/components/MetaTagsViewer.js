"use client";

import { copyText } from "./copy.js";

export default function MetaTagsViewer({ metaTags }) {
  if (!metaTags) return null;
  return (
    <section className="rounded-lg border border-black/10 dark:border-white/10 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-medium">All meta tags</h2>
        <button
          type="button"
          onClick={async () => {
            await copyText(JSON.stringify(metaTags || [], null, 2));
          }}
          className="h-9 px-3 rounded-md border border-black/10 dark:border-white/15 text-sm"
        >
          Copy JSON
        </button>
      </div>
      <div className="mt-4 max-h-72 overflow-auto rounded-md bg-black/5 dark:bg-white/5 p-3 text-xs">
        <pre className="whitespace-pre-wrap break-words">{JSON.stringify(metaTags || [], null, 2)}</pre>
      </div>
    </section>
  );
}


