"use client";

import { useCopy } from "../hooks/useCopy.js";

export default function ActionsBar({ result, onClose }) {
	const { copy, copyStatus, isLoading, isSuccess, isError } = useCopy();
	
	if (!result) return null;
	const m = result.metadata || {};
	const bestVideo = m.videoContentUrl || m.videoUrl || m.videoEmbedUrl;
	
	const handleCopyJSON = () => {
		copy(JSON.stringify(result, null, 2));
	};
	return (
		<div className="sticky top-0 z-10 -mx-5 px-5 py-2 bg-[color:var(--background)]/80 backdrop-blur border-b border-black/5 dark:border-white/5 flex items-center gap-2">
			<a
				href={m.url}
				target="_blank"
				rel="noreferrer"
				className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm border"
			>
				Open URL
			</a>
			<button
				type="button"
				onClick={handleCopyJSON}
				disabled={isLoading}
				className={`inline-flex items-center justify-center h-9 px-3 rounded-md text-sm border transition-colors ${
					isSuccess 
						? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400' 
						: isError
						? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400'
						: 'hover:bg-black/5 dark:hover:bg-white/5'
				}`}
			>
				{isLoading ? 'Copying...' : 
				 isSuccess ? 'Copied!' : 
				 isError ? 'Failed' : 
				 'Copy JSON'}
			</button>
			{bestVideo ? (
				<a
					href={`/api/download?url=${encodeURIComponent(bestVideo)}&disposition=attachment`}
					className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm border bg-foreground text-background"
				>
					Download
				</a>
			) : null}
			<span className="flex-1" />
			{onClose ? (
				<button
					type="button"
					aria-label="Close results"
					onClick={onClose}
					className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
				>
					Close
				</button>
			) : null}
		</div>
	);
}


