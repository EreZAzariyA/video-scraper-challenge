export function normalizeDate(value) {
	if (!value) return { raw: null, iso: null, epochMs: null };
	try {
		const d = new Date(value);
		if (isNaN(d.getTime())) return { raw: String(value), iso: null, epochMs: null };
		return { raw: String(value), iso: d.toISOString(), epochMs: d.getTime() };
	} catch {
		return { raw: String(value), iso: null, epochMs: null };
	}
}


