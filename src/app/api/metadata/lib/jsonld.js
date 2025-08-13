export function readJsonLd($) {
	const results = [];
	$("script[type='application/ld+json'], script[type='application/ld+json; charset=UTF-8']").each((_, el) => {
		try {
			const raw = $(el).contents().text();
			if (!raw) return;
			const parsed = JSON.parse(raw);
			const nodes = [];
			const addNode = (node) => {
				if (node && typeof node === "object") nodes.push(node);
			};
			if (Array.isArray(parsed)) parsed.forEach(addNode);
			else if (parsed && typeof parsed === "object") {
				addNode(parsed);
				if (Array.isArray(parsed["@graph"])) parsed["@graph"].forEach(addNode);
			}
			results.push(...nodes);
		} catch {}
	});
	return results;
}
