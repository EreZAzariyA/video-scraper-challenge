export function normalizeUrl(input) {
	let value = String(input || "").trim();
	// Remove any whitespace characters in the middle (spaces, tabs, newlines)
	value = value.replace(/\s+/g, "");
	if (value.startsWith("@")) {
		value = value.slice(1).trim();
	}
	value = value.replace(/^"+|"+$/g, "");
	if (!/^https?:\/\//i.test(value)) {
		value = `https://${value}`;
	}
	try {
		const url = new URL(value);
		return url.toString();
	} catch {
		return null;
	}
}


