import got from "got";
import { Readable } from "node:stream";
import { normalizeUrl } from "../../../lib/normalizeUrl.js";

function guessFilenameFromUrl(urlString) {
	try {
		const u = new URL(urlString);
		const pathname = u.pathname || "/video";
		const base = pathname.split("/").filter(Boolean).pop() || "video";
		return base.includes(".") ? base : `${base}.mp4`;
	} catch {
		return "video.mp4";
	}
}

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const url = normalizeUrl(searchParams.get("url"));
	const disposition = searchParams.get("disposition") || "inline";
	
	if (!url) {
		return Response.json({ error: "Invalid url" }, { status: 400 });
	}

	try {
		const upstream = got.stream(url, {
			http2: true,
			throwHttpErrors: false,
			followRedirect: true,
			headers: {
				"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
				accept: "*/*",
				...(request.headers.get("range") && { range: request.headers.get("range") }),
			},
		});

		const { statusCode, headers: upstreamHeaders } = await new Promise((resolve, reject) => {
			upstream.once("response", (res) => resolve({ statusCode: res.statusCode, headers: res.headers }));
			upstream.once("error", reject);
		});

		const headers = new Headers();
		["content-type", "content-length", "accept-ranges", "content-range"].forEach(key => {
			if (upstreamHeaders[key]) headers.set(key, String(upstreamHeaders[key]));
		});

		if (disposition === "attachment") {
			headers.set("content-disposition", `attachment; filename="${guessFilenameFromUrl(url)}"`);
		}

		return new Response(Readable.toWeb(upstream), { status: statusCode || 200, headers });
	} catch (error) {
		return Response.json({ error: "Failed to download", url }, { status: 502 });
	}
}


