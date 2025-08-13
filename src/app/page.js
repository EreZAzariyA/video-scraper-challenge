"use client";

import { useMemo, useState, useTransition } from "react";
import UrlForm from "./components/UrlForm.js";
import Overview from "./components/Overview.js";
import MetaTagsViewer from "./components/MetaTagsViewer.js";
import History, { useHistory } from "./components/History.js";
import VideoPreview from "./components/VideoPreview.js";
import TwitterCardPreview from "./components/TwitterCardPreview.js";
import Tabs from "./components/Tabs.js";
import SummaryCard from "./components/SummaryCard.js";
import ActionsBar from "./components/ActionsBar.js";

export default function Home() {
  const [inputUrl, setInputUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const history = useHistory();

  const canSubmit = useMemo(() => inputUrl.trim().length > 0, [inputUrl]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setResult(null);
    const prepared = inputUrl.replace(/\s+/g, "").trim();
    startTransition(async () => {
      try {
        const response = await fetch("/api/metadata", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: prepared }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Request failed");
        }
        setResult(data);
        history.add(data?.metadata?.url || prepared);
      } catch (err) {
        try {
          const text = err?.message || "";
          setError(text);
        } catch {
          setError("Something went wrong");
        }
      }
    });
  }

  return (
    <div className="min-h-dvh px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">Video Metadata Dashboard</h1>
        <p className="mt-1 text-black/60 dark:text-white/60 text-sm">
          Paste an embedded video link. On submit, we will fetch and extract Open Graph, Twitter Card, and standard meta tags.
        </p>

        <UrlForm
          inputUrl={inputUrl}
          onInputChange={setInputUrl}
          onSubmit={(e) => handleSubmit(e)}
          isPending={isPending}
          canSubmit={canSubmit}
        />

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            <div className="font-medium">Error</div>
            <div className="opacity-90 break-words">{String(error)}</div>
          </div>
        ) : null}

        {isPending && !result ? (
          <div className="mt-6 animate-pulse rounded-lg border border-black/10 dark:border-white/10 p-5">
            <div className="h-4 w-40 bg-black/10 dark:bg-white/10 rounded" />
            <div className="mt-3 h-3 w-2/3 bg-black/10 dark:bg-white/10 rounded" />
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-24 bg-black/5 dark:bg-white/5 rounded" />
              <div className="h-24 bg-black/5 dark:bg-white/5 rounded" />
            </div>
          </div>
        ) : null}

        {result ? (
          <div className="mt-6 grid gap-6">
            <ActionsBar result={result} onClose={() => setResult(null)} />
            <SummaryCard metadata={result?.metadata} />
            <Tabs
              tabs={[
                { id: "overview", label: "Overview", content: <Overview metadata={result?.metadata} /> },
                { id: "preview", label: "Preview", content: <VideoPreview metadata={result?.metadata} /> },
                { id: "twitter", label: "Twitter Card", content: <TwitterCardPreview metadata={result?.metadata} /> },
                { id: "tags", label: "Meta Tags", content: <MetaTagsViewer metaTags={result?.metaTags} /> },
              ]}
            />
          </div>
        ) : null}

        <History
          items={history.items}
          onPick={(url) => setInputUrl(url)}
          onClear={history.clear}
        />
      </div>
    </div>
  );
}
