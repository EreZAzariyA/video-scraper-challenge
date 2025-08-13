"use client";

import { useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { useCopy } from "../hooks/useCopy.js";

function DefRow({ label, value, href }) {
  const { copy, isLoading, isSuccess, isError } = useCopy();
  
  if (!value) return null;
  const display = String(value);
  
  return (
    <>
      <dt className="text-xs text-black/60 dark:text-white/60 sm:text-right sm:pr-4 self-center">
        {label}
      </dt>
      <dd className="text-sm group flex items-start justify-between min-w-0 max-w-full">
        {href ? (
          <a className="min-w-0 max-w-full underline decoration-transparent hover:decoration-inherit break-words" href={href} target="_blank" rel="noreferrer" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
            {display}
          </a>
        ) : (
          <span className="min-w-0 max-w-full break-words" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{display}</span>
        )}
        <button
          type="button"
          onClick={() => copy(display)}
          disabled={isLoading}
          className={`opacity-0 group-hover:opacity-100 ml-2 text-xs underline transition-colors ${
            isSuccess ? 'text-green-600 dark:text-green-400' :
            isError ? 'text-red-600 dark:text-red-400' :
            'hover:text-black/80 dark:hover:text-white/80'
          }`}
        >
          {isLoading ? 'Copying...' : 
           isSuccess ? 'Copied!' : 
           isError ? 'Failed' : 
           'Copy'}
        </button>
      </dd>
    </>
  );
}

export default function Overview({ metadata }) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  if (!metadata) return null;
  const formatDate = (source) => {
    if (!source) return null;
    try {
      const date = typeof source === "number" ? new Date(source) : new Date(String(source));
      if (isNaN(date.getTime())) return null;
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      const HH = String(date.getHours()).padStart(2, "0");
      const MM = String(date.getMinutes()).padStart(2, "0");
      return `${dd}.${mm}.${yyyy} ${HH}:${MM}`;
    } catch {
      return null;
    }
  };
  const formatRelative = (source) => {
    try {
      const d = typeof source === "number" ? dayjs(source) : dayjs(String(source));
      if (!d.isValid()) return null;
      return d.fromNow();
    } catch {
      return null;
    }
  };
  

  const publishedDisplay =
    formatDate(metadata?.publishedEpochMs) ||
    formatDate(metadata?.publishedISO) ||
    formatDate(metadata?.publishedRaw);
  const modifiedDisplay =
    formatDate(metadata?.modifiedEpochMs) ||
    formatDate(metadata?.modifiedISO) ||
    formatDate(metadata?.modifiedRaw);
  const publishedRel =
    formatRelative(metadata?.publishedEpochMs) ||
    formatRelative(metadata?.publishedISO) ||
    formatRelative(metadata?.publishedRaw);
  const modifiedRel =
    formatRelative(metadata?.modifiedEpochMs) ||
    formatRelative(metadata?.modifiedISO) ||
    formatRelative(metadata?.modifiedRaw);
  const domain = (() => {
    try { return new URL(metadata?.url).hostname.replace(/^www\./, ""); } catch { return null; }
  })();
  const description = String(metadata?.description || "");
  const descriptionShort = description.length > 180 && !showFullDescription ? `${description.slice(0, 180)}…` : description;
  const badges = [
    metadata?.type ? { label: metadata.type } : null,
    metadata?.durationHuman ? { label: metadata.durationHuman } : null,
    metadata?.locale ? { label: metadata.locale } : null,
  ].filter(Boolean);
  return (
    <section className="rounded-lg border border-black/10 dark:border-white/10 p-5">
      <h2 className="text-base font-medium">Overview</h2>
      {badges.length ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-black/60 dark:text-white/60">Tags:</span>
          {badges.map((b, i) => (
            <span key={i} className="px-2 py-1 rounded bg-black/5 dark:bg-white/10">{b.label}</span>
          ))}
        </div>
      ) : null}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)] gap-y-3 sm:gap-y-2 sm:gap-x-4">
        <DefRow label="Resolved URL" value={metadata?.url} href={metadata?.url} />
        <DefRow label="Title" value={metadata?.title} />
        <>
          <dt className="text-xs text-black/60 dark:text-white/60 sm:text-right sm:pr-4 self-start">Description</dt>
          <dd className="text-sm break-words">
            {descriptionShort || "—"}
            {description.length > 180 ? (
              <button
                type="button"
                className="ml-2 text-xs underline"
                onClick={() => setShowFullDescription((v) => !v)}
              >
                {showFullDescription ? "Show less" : "Show more"}
              </button>
            ) : null}
          </dd>
        </>
        <DefRow label="Site Name" value={metadata?.siteName} />
        <DefRow label="Canonical URL" value={metadata?.canonicalUrl} href={metadata?.canonicalUrl} />
        <DefRow label="Author" value={metadata?.author} />
        <>
          <dt className="text-xs text-black/60 dark:text-white/60 sm:text-right sm:pr-4 self-center">Published</dt>
          <dd className="text-sm break-words flex items-center gap-2">
            <span>{publishedDisplay || "—"}</span>
            {publishedRel ? <span className="text-xs text-black/60 dark:text-white/60">({publishedRel})</span> : null}
          </dd>
        </>
        <>
          <dt className="text-xs text-black/60 dark:text-white/60 sm:text-right sm:pr-4 self-center">Modified</dt>
          <dd className="text-sm break-words flex items-center gap-2">
            <span>{modifiedDisplay || "—"}</span>
            {modifiedRel ? <span className="text-xs text-black/60 dark:text-white/60">({modifiedRel})</span> : null}
          </dd>
        </>
        <DefRow label="Duration" value={metadata?.durationHuman || metadata?.durationISO || metadata?.durationSeconds} />
        <DefRow label="View Count" value={metadata?.viewCount ? metadata.viewCount.toLocaleString() : null} />
        <DefRow label="Like Count" value={metadata?.likeCount ? metadata.likeCount.toLocaleString() : null} />
        <DefRow label="Share Count" value={metadata?.shareCount ? metadata.shareCount.toLocaleString() : null} />
        <DefRow label="Comment Count" value={metadata?.commentCount ? metadata.commentCount.toLocaleString() : null} />
        <DefRow label="Rating" value={metadata?.rating ? `${metadata.rating}/10` : null} />
        <DefRow label="Rating Count" value={metadata?.ratingCount ? metadata.ratingCount.toLocaleString() : null} />
        <DefRow label="Resolution" value={metadata?.resolution} />
        <DefRow label="Dimensions" value={metadata?.width && metadata?.height ? `${metadata.width} × ${metadata.height}` : null} />
        <DefRow label="Video Type" value={metadata?.videoType} />
        <DefRow label="Quality" value={metadata?.quality} />
        <DefRow label="File Size" value={metadata?.fileSize ? `${(metadata.fileSize / 1024 / 1024).toFixed(2)} MB` : null} />
        <DefRow label="Category" value={metadata?.category} />
        <DefRow label="Keywords" value={metadata?.keywords} />
        <DefRow label="Tags" value={metadata?.tags ? metadata.tags.join(', ') : null} />
        <DefRow label="Publisher" value={metadata?.publisher} />
        <DefRow label="Copyright" value={metadata?.copyright} />
        <DefRow label="License" value={metadata?.license} href={metadata?.license?.startsWith('http') ? metadata.license : null} />
        <DefRow label="Language" value={metadata?.language} />
        <DefRow label="Captions" value={metadata?.captions} />
        <DefRow label="Streaming URL" value={metadata?.streamingUrl} href={metadata?.streamingUrl} />
        <DefRow label="Twitter Card" value={metadata?.twitterCard} />
        <DefRow label="Twitter Site" value={metadata?.twitterSite} />
        <DefRow label="Locale" value={metadata?.locale} />
        <DefRow label="Image" value={metadata?.image} href={metadata?.image} />
        <DefRow label="Video URL" value={metadata?.videoContentUrl || metadata?.videoUrl || metadata?.videoEmbedUrl} href={metadata?.videoContentUrl || metadata?.videoUrl || metadata?.videoEmbedUrl} />
      </div>
    </section>
  );
}


