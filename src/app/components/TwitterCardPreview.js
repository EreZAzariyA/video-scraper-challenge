"use client";

function getDomain(href) {
	try {
		const u = new URL(href);
		return u.hostname.replace(/^www\./, "");
	} catch {
		return null;
	}
}

export default function TwitterCardPreview({ metadata }) {
	if (!metadata) return null;
	const cardType = (metadata.twitterCard || "summary_large_image").toLowerCase();
	const title = metadata.title || "Untitled";
	const description = metadata.description || "";
	const image = metadata.image || null;
	const imageAlt = metadata.imageAlt || title || "image";
	const targetUrl = metadata.canonicalUrl || metadata.url;
	const domain = getDomain(targetUrl) || metadata.siteName || "";
	const playerUrl = metadata.videoEmbedUrl || metadata.videoUrl || null;

	return (
		<section className="rounded-lg border border-black/10 dark:border-white/10 p-5">
			<h2 className="text-base font-medium mb-3">Twitter Card Preview</h2>
			<div className="max-w-xl mx-auto">
				{cardType === "summary" ? (
					<a
						href={targetUrl}
						target="_blank"
						rel="noreferrer"
						className="flex w-full gap-3 rounded-lg border border-black/10 dark:border-white/10 overflow-hidden bg-white dark:bg-black no-underline"
					>
						{image ? (
							<img
								src={image}
								alt={imageAlt}
								className="w-[120px] h-[120px] object-cover bg-black/5 dark:bg-white/5"
							/>
						) : (
							<div className="w-[120px] h-[120px] bg-black/5 dark:bg-white/10" />
						)}
						<div className="py-3 pr-3 flex-1 min-w-0">
							<div className="text-xs text-black/60 dark:text-white/60 mb-1 truncate">{domain}</div>
							<div className="text-sm font-medium leading-snug line-clamp-2">{title}</div>
							{description ? (
								<div className="mt-1 text-xs text-black/70 dark:text-white/70 line-clamp-2">{description}</div>
							) : null}
						</div>
					</a>
				) : cardType === "player" && playerUrl ? (
					<div className="rounded-lg border border-black/10 dark:border-white/10 overflow-hidden bg-white dark:bg-black">
						<div className="aspect-video bg-black">
							<iframe
								title={title}
								src={playerUrl}
								className="w-full h-full"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								allowFullScreen
							/>
						</div>
						<div className="p-3">
							<div className="text-xs text-black/60 dark:text-white/60 mb-1 truncate">{domain}</div>
							<div className="text-sm font-medium leading-snug">{title}</div>
						</div>
					</div>
				) : (
					<a
						href={targetUrl}
						target="_blank"
						rel="noreferrer"
						className="block rounded-lg border border-black/10 dark:border-white/10 overflow-hidden bg-white dark:bg-black no-underline"
					>
						{image ? (
							<img
								src={image}
								alt={imageAlt}
								className="w-full aspect-[1.91/1] object-cover bg-black/5 dark:bg-white/5"
							/>
						) : (
							<div className="w-full aspect-[1.91/1] bg-black/5 dark:bg-white/10" />
						)}
						<div className="p-3">
							<div className="text-xs text-black/60 dark:text-white/60 mb-1 truncate">{domain}</div>
							<div className="text-sm font-medium leading-snug line-clamp-2">{title}</div>
							{description ? (
								<div className="mt-1 text-xs text-black/70 dark:text-white/70 line-clamp-2">{description}</div>
							) : null}
						</div>
					</a>
				)}
			</div>
		</section>
	);
}


