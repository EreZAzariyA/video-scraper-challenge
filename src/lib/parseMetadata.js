import * as cheerio from "cheerio";
import { readJsonLd } from "./jsonld.js";
import { parseIsoDurationToSeconds, formatSecondsToHuman } from "./duration.js";
import { normalizeDate } from "./dates.js";

function getMeta($, key) {
	return (
		$(`meta[name="${key}"]`).attr("content") ||
		$(`meta[property="${key}"]`).attr("content") ||
		null
	);
}


// Collects all <meta> tags as simple objects
function collectAllMeta($) {
	const tags = [];
	$("meta").each((_, el) => {
		const name = $(el).attr("name") || null;
		const property = $(el).attr("property") || null;
		const content = $(el).attr("content") || null;
		if (name || property) tags.push({ name, property, content });
	});
	return tags;
}

// Extracts common Open Graph/Twitter/standard fields
function extractBasicMeta($) {
	const titleTag = $("title").first().text().trim() || null;
	const videoCandidates = [
		getMeta($, "og:video"),
		getMeta($, "og:video:url"),
		getMeta($, "og:video:secure_url"),
		getMeta($, "twitter:player:stream"),
		getMeta($, "twitter:player"),
	];
	const videoUrl = videoCandidates.find((v) => v && String(v).trim().length > 0) || null;
	return {
		title: getMeta($, "og:title") || getMeta($, "twitter:title") || titleTag,
		description: getMeta($, "description") || getMeta($, "og:description") || null,
		siteName: getMeta($, "og:site_name"),
		canonicalUrl: $("link[rel=canonical]").attr("href") || null,
		type: getMeta($, "og:type"),
		image: getMeta($, "og:image") || getMeta($, "og:image:url") || getMeta($, "og:image:secure_url") || getMeta($, "twitter:image") || getMeta($, "twitter:image:src") || null,
		imageAlt: getMeta($, "og:image:alt") || getMeta($, "twitter:image:alt"),
		videoUrl,
		author: getMeta($, "author") || getMeta($, "article:author"),
		twitterCard: getMeta($, "twitter:card"),
		twitterSite: getMeta($, "twitter:site"),
		locale: getMeta($, "og:locale"),
	};
}

// Extracts published/modified dates from meta and JSON-LD
function extractDates($, jsonld) {
	let published = getMeta($, "article:published_time") || getMeta($, "pubdate") || null;
	let modified = getMeta($, "article:modified_time") || null;

	const types = (node) => {
		const t = node && node["@type"];
		return Array.isArray(t) ? t.map(String) : t ? [String(t)] : [];
	};
	const videoNodes = jsonld.filter((n) => types(n).some((t) => /VideoObject/i.test(t)));
	const articleNodes = jsonld.filter((n) => types(n).some((t) => /(Article|NewsArticle)/i.test(t)));

	const firstVideo = videoNodes[0];
	if (firstVideo) {
		if (!published) published = firstVideo.uploadDate || firstVideo.datePublished || null;
		if (!modified) modified = firstVideo.dateModified || null;
	}
	const firstArticle = articleNodes[0];
	if (firstArticle) {
		if (!published) published = firstArticle.datePublished || null;
		if (!modified) modified = firstArticle.dateModified || null;
	}

	const p = normalizeDate(published);
	const m = normalizeDate(modified);
	return {
		publishedRaw: p.raw,
		publishedISO: p.iso,
		publishedEpochMs: p.epochMs,
		modifiedRaw: m.raw,
		modifiedISO: m.iso,
		modifiedEpochMs: m.epochMs,
	};
}

// Extracts duration from meta/itemprop/JSON-LD
function extractDuration($, jsonld) {
	let durationSeconds = null;
	let durationISO = null;
	const ogDuration = getMeta($, "og:video:duration") || getMeta($, "video:duration");
	if (ogDuration && /^\d+$/.test(String(ogDuration))) durationSeconds = Number(ogDuration);
	const itempropDuration = $("meta[itemprop='duration'], time[itemprop='duration']").attr("content") || $("time[itemprop='duration']").attr("datetime") || null;
	if (!durationSeconds && itempropDuration) {
		const secs = parseIsoDurationToSeconds(itempropDuration);
		if (secs) {
			durationISO = itempropDuration;
			durationSeconds = secs;
		}
	}

	if (jsonld.length && !durationISO) {
		const types = (node) => {
			const t = node && node["@type"];
			return Array.isArray(t) ? t.map(String) : t ? [String(t)] : [];
		};
		const videoNodes = jsonld.filter((n) => types(n).some((t) => /VideoObject/i.test(t)));
		const firstVideo = videoNodes[0];
		if (firstVideo && typeof firstVideo.duration === "string") durationISO = firstVideo.duration;
		if (!durationSeconds && durationISO) {
			const secs = parseIsoDurationToSeconds(durationISO);
			if (secs) durationSeconds = secs;
		}
	}

	const duration = durationSeconds ?? (ogDuration && /^\d+$/.test(String(ogDuration)) ? Number(ogDuration) : null);
	return {
		durationISO: durationISO || null,
		durationSeconds: duration,
		durationHuman: formatSecondsToHuman(duration),
	};
}

// Extracts best video URL (prefer direct content URLs over embeds)
function extractVideoUrl($, jsonld, current) {
	let direct = null;
	let embed = null;

	// itemprop hints
	const itempropDirect = $("meta[itemprop='contentUrl']").attr("content") || null;
	const itempropEmbed = $("meta[itemprop='embedUrl']").attr("content") || null;
	if (itempropDirect) direct = itempropDirect;
	if (itempropEmbed) embed = itempropEmbed;

	// JSON-LD VideoObject
	if (jsonld.length) {
		const types = (node) => {
			const t = node && node["@type"];
			return Array.isArray(t) ? t.map(String) : t ? [String(t)] : [];
		};
		const videoNodes = jsonld.filter((n) => types(n).some((t) => /VideoObject/i.test(t)));
		const first = videoNodes[0];
		if (first) {
			if (!direct && typeof first.contentUrl === "string") direct = first.contentUrl;
			if (!embed && typeof first.embedUrl === "string") embed = first.embedUrl;
			if (!embed && typeof first.url === "string") embed = first.url;
		}
	}

	const candidates = [direct, current?.videoUrl, embed];
	const best = candidates.find((v) => v && String(v).trim().length > 0) || null;
	return { videoUrl: best, videoContentUrl: direct || null, videoEmbedUrl: embed || null };
}

export function parseAllMeta(html) {
	const $ = cheerio.load(html);
	const metaTags = collectAllMeta($);
	const basic = extractBasicMeta($);
	const jsonld = readJsonLd($);
	const dates = extractDates($, jsonld);
	const duration = extractDuration($, jsonld);
	const video = extractVideoUrl($, jsonld, basic);

	return {
		metadata: { ...basic, ...dates, ...duration, ...video },
		metaTags,
	};
}


