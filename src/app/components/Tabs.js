"use client";

import { useState } from "react";

export default function Tabs({ tabs, defaultIndex = 0 }) {
	const [index, setIndex] = useState(defaultIndex);
	if (!Array.isArray(tabs) || tabs.length === 0) return null;
	const current = tabs[Math.min(index, tabs.length - 1)];

	return (
		<div className="w-full">
			<div className="flex gap-2 border-b border-black/10 dark:border-white/10 mb-4">
				{tabs.map((t, i) => (
					<button
						key={t.id || t.label || i}
						type="button"
						onClick={() => setIndex(i)}
						className={`h-9 px-3 text-sm rounded-t-md border-b-2 -mb-px ${i === index ? "border-foreground font-medium" : "border-transparent text-black/60 dark:text-white/60 hover:text-foreground"}`}
					>
						{t.label}
					</button>
				))}
			</div>
			<div>{current.content}</div>
		</div>
	);
}


