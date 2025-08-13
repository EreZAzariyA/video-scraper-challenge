import got from "got";

const DEFAULT_HEADERS = {
	"user-agent":
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
	accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
	"accept-language": "en-US,en;q=0.9",
	"accept-encoding": "gzip, deflate, br, zstd",
	"cache-control": "max-age=0",
	"sec-ch-ua": '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
	"sec-ch-ua-mobile": "?0",
	"sec-ch-ua-platform": '"Windows"',
	"sec-fetch-dest": "document",
	"sec-fetch-mode": "navigate",
	"sec-fetch-site": "none",
	"sec-fetch-user": "?1",
	"upgrade-insecure-requests": "1",
};

export async function fetchHtmlNative(url) {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);
		const response = await fetch(url, {
			headers: DEFAULT_HEADERS,
			redirect: "follow",
			signal: controller.signal,
		});
		clearTimeout(timeoutId);
		const contentType = response.headers.get("content-type") || "";
		if (!response.ok) {
			return { ok: false, status: response.status, reason: "status", error: `Upstream responded with ${response.status} ${response.statusText}`, contentType };
		}
		if (!/text\/html/i.test(contentType)) {
			return { ok: false, status: 415, reason: "content-type", error: "URL did not return HTML content", contentType };
		}
		const html = await response.text();
		return { ok: true, html, via: "fetch" };
	} catch (err) {
		const message = String(err?.message || err);
		return { ok: false, status: 504, reason: "exception", error: message };
	}
}

export async function fetchHtmlGot(url) {
	try {
		const res = await got(url, {
			http2: false,
			throwHttpErrors: false,
			timeout: { request: 10000 },
			headers: {
				"user-agent": "curl/8.0.0",
				"accept": "*/*",
			},
			decompress: true,
			followRedirect: true,
		});
		const contentType = String(res.headers["content-type"] || "");
		if (res.statusCode >= 400) {
			return { ok: false, status: res.statusCode, reason: "status", error: `Upstream responded with ${res.statusCode}`, contentType };
		}
		if (!/text\/html/i.test(contentType)) {
			return { ok: false, status: 415, reason: "content-type", error: "URL did not return HTML content", contentType };
		}
		return { ok: true, html: res.body, via: "got" };
	} catch (err) {
		const message = String(err?.message || err);
		return { ok: false, status: 500, reason: "exception", error: message };
	}
}

export async function fetchHtmlWithFallback(url) {
	const native = await fetchHtmlNative(url);
	if (native.ok) return native;
	
	// Try fallback for certain error codes
	if ([403, 406, 429, 415, 500, 502, 503, 504].includes(Number(native.status))) {
		const fallback = await fetchHtmlGot(url);
		return fallback.ok ? fallback : native;
	}
	return native;
}


