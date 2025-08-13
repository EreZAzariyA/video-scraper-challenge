"use client";

import Image from "next/image";

const directLoader = ({ src }) => src;

function getFavicon(url) {
	try {
		const u = new URL(url);
		return `${u.protocol}//${u.hostname}/favicon.ico`;
	} catch {
		return "/favicon.ico";
	}
}

export default function SummaryCard({ metadata }) {
	if (!metadata) return null;
	const domain = (() => {
		try { return new URL(metadata.url).hostname.replace(/^www\./, ""); } catch { return metadata.siteName || ""; }
	})();
	return (
		<section className="rounded-lg border border-black/10 dark:border-white/10 p-5">
			<div className="flex items-stretch gap-4">
				{metadata.image ? (
					<a href={metadata.image} target="_blank" rel="noreferrer" className="relative block w-32 aspect-square shrink-0 rounded-lg overflow-hidden bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10">
						<Image src={metadata.image} alt={metadata?.imageAlt || "image"} fill sizes="128px" className="object-cover object-center" unoptimized loader={directLoader} />
					</a>
				) : (
					<div className="w-32 aspect-square shrink-0 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10" />
				)}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<Image src={getFavicon(metadata.url)} alt="favicon" width={20} height={20} className="w-5 h-5 rounded-sm" unoptimized loader={directLoader} />
						<div className="text-xs text-black/60 dark:text-white/60 truncate">{domain}</div>
					</div>
					<div className="text-base font-medium leading-snug break-words">{metadata.title || "Untitled"}</div>
					{metadata.description ? (
						<div className="mt-1 text-sm text-black/70 dark:text-white/70 line-clamp-3">{metadata.description}</div>
					) : null}
					<div className="mt-3 flex flex-wrap gap-2 text-xs">
						{metadata.publishedISO ? (
							<span className="px-2 py-1 rounded bg-black/5 dark:bg-white/10">Published</span>
						) : null}
						{metadata.durationHuman ? (
							<span className="px-2 py-1 rounded bg-black/5 dark:bg-white/10">{metadata.durationHuman}</span>
						) : null}
						{metadata.type ? (
							<span className="px-2 py-1 rounded bg-black/5 dark:bg-white/10">{metadata.type}</span>
						) : null}
						{metadata.twitterCard ? (
							<span className="px-2 py-1 rounded bg-black/5 dark:bg-white/10">Twitter: {metadata.twitterCard}</span>
						) : null}
					</div>
				</div>
			</div>
		</section>
	);
}


