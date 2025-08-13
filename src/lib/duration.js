export function parseIsoDurationToSeconds(iso) {
	if (!iso || typeof iso !== "string") return null;
	const match = iso.match(/P(?:\d+Y)?(?:\d+M)?(?:\d+W)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?)?/i);
	if (!match) return null;
	const [, h = 0, m = 0, s = 0] = (iso.match(/T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i) || []);
	const hours = Number(h || 0);
	const mins = Number(m || 0);
	const secs = Number(s || 0);
	return hours * 3600 + mins * 60 + secs;
}

export function formatSecondsToHuman(totalSeconds) {
	if (totalSeconds == null || isNaN(totalSeconds)) return null;
	const seconds = Math.max(0, Math.floor(Number(totalSeconds)));
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	const pad = (n) => String(n).padStart(2, "0");
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}


