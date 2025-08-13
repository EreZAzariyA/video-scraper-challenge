"use client";

function isDirectMedia(url) {
	try {
		const u = new URL(url);
		const path = u.pathname.toLowerCase();
		return [".mp4", ".webm", ".ogg", ".mov", ".m4v"].some((ext) => path.endsWith(ext));
	} catch {
		return false;
	}
}

export default function VideoPreview({ metadata }) {
	const videoUrl = metadata?.videoContentUrl || metadata?.videoUrl || metadata?.videoEmbedUrl || null;
	const poster = metadata?.image || null;
	
	if (!videoUrl) {
		return (
			<section className="rounded-lg border border-black/10 dark:border-white/10 p-5">
				<h2 className="text-base font-medium mb-3">Preview</h2>
				<div className="w-full rounded bg-black/5 dark:bg-white/5 aspect-video flex items-center justify-center">
					<div className="text-center text-black/60 dark:text-white/60">
						<div className="text-sm">No preview available</div>
						<div className="text-xs mt-1">No video URL found in metadata</div>
					</div>
				</div>
			</section>
		);
	}

	const isFile = isDirectMedia(videoUrl);
	const proxied = `/api/download?url=${encodeURIComponent(videoUrl)}&disposition=inline`;

	return (
		<section className="rounded-lg border border-black/10 dark:border-white/10 p-5">
			<h2 className="text-base font-medium mb-3">Preview</h2>
			<div className="w-full">
				{isFile ? (
					<video
						className="w-full rounded bg-black max-h-[60vh]"
						controls
						preload="metadata"
						poster={poster || undefined}
						src={proxied}
					/>
				) : (
					<div className="w-full rounded overflow-hidden bg-black aspect-video">
					<iframe
							title={metadata?.title || "Video preview"}
						src={metadata?.videoEmbedUrl || videoUrl}
							className="w-full h-full"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							allowFullScreen
						/>
					</div>
				)}
				{/* Fallback link if iframe is blocked by X-Frame-Options */}
				<div className="mt-2 text-xs">
					<a className="underline opacity-80 hover:opacity-100" href={videoUrl} target="_blank" rel="noreferrer">
						Open video in a new tab
					</a>
				</div>
			</div>
		</section>
	);
}


