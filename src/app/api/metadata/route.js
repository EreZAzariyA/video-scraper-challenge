import { normalizeUrl } from "./lib/normalizeUrl.js";
import { fetchHtmlWithFallback } from "./lib/fetchHtml.js";
import { parseAllMeta } from "./lib/parseMetadata.js";

export async function POST(request) {
  try {
    const { url: rawUrl } = await request.json();
    const url = normalizeUrl(rawUrl);
    
    if (!url) {
      return Response.json({ error: "Invalid URL" }, { status: 400 });
    }

    const htmlResult = await fetchHtmlWithFallback(url);
    
    if (!htmlResult.ok) {
      return Response.json(
        { error: htmlResult.error || "Failed to fetch URL", url },
        { status: htmlResult.status || 502 }
      );
    }

    const { metadata, metaTags } = parseAllMeta(htmlResult.html);
    return Response.json({ metadata: { url, ...metadata }, metaTags });
    
  } catch (error) {
    const isTimeout = error?.name === "AbortError" || error?.message?.includes("abort");
    const status = isTimeout ? 504 : 500;
    const message = isTimeout ? "Request timed out" : "Failed to process request";
    
    return Response.json({ error: message }, { status });
  }
}


