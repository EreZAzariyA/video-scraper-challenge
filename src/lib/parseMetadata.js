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
		keywords: getMeta($, "keywords") || getMeta($, "news_keywords") || null,
		category: getMeta($, "article:section") || getMeta($, "og:article:section") || getMeta($, "section") || null,
		publisher: getMeta($, "article:publisher") || getMeta($, "og:article:publisher") || getMeta($, "publisher") || null,
		copyright: getMeta($, "copyright") || getMeta($, "rights") || null,
		language: $("html").attr("lang") || getMeta($, "content-language") || getMeta($, "language") || null,
	};
}

// Extracts view count and resolution metadata
function extractVideoStats($, jsonld) {
	let viewCount = null;
	let width = null;
	let height = null;

	// Try to get view count from various sources
	const viewCandidates = [
		getMeta($, "og:video:view_count"),
		getMeta($, "twitter:player:view_count"),
		getMeta($, "video:view_count"),
		$("meta[itemprop='interactionCount']").attr("content"),
		$("meta[name='video:view_count']").attr("content"),
	];
	
	const foundViews = viewCandidates.find((v) => v && String(v).trim().length > 0);
	if (foundViews) {
		const parsed = parseInt(String(foundViews).replace(/[^\d]/g, ''), 10);
		if (!isNaN(parsed) && parsed > 0) viewCount = parsed;
	}

	// Try to get video resolution
	const widthCandidates = [
		getMeta($, "og:video:width"),
		getMeta($, "twitter:player:width"),
		getMeta($, "video:width"),
		$("meta[itemprop='width']").attr("content"),
	];
	
	const heightCandidates = [
		getMeta($, "og:video:height"), 
		getMeta($, "twitter:player:height"),
		getMeta($, "video:height"),
		$("meta[itemprop='height']").attr("content"),
	];

	const foundWidth = widthCandidates.find((w) => w && String(w).trim().length > 0);
	const foundHeight = heightCandidates.find((h) => h && String(h).trim().length > 0);

	if (foundWidth) {
		const parsed = parseInt(String(foundWidth), 10);
		if (!isNaN(parsed) && parsed > 0) width = parsed;
	}
	
	if (foundHeight) {
		const parsed = parseInt(String(foundHeight), 10);
		if (!isNaN(parsed) && parsed > 0) height = parsed;
	}

	// Check JSON-LD for additional data
	if (jsonld.length) {
		const types = (node) => {
			const t = node && node["@type"];
			return Array.isArray(t) ? t.map(String) : t ? [String(t)] : [];
		};
		
		const videoNodes = jsonld.filter((n) => types(n).some((t) => /VideoObject/i.test(t)));
		const firstVideo = videoNodes[0];
		
		if (firstVideo) {
			// Try to extract view count from JSON-LD
			if (!viewCount && firstVideo.interactionStatistic) {
				const stats = Array.isArray(firstVideo.interactionStatistic) 
					? firstVideo.interactionStatistic 
					: [firstVideo.interactionStatistic];
				
				for (const stat of stats) {
					if (stat && stat.interactionType && stat.userInteractionCount) {
						const type = String(stat.interactionType).toLowerCase();
						if (type.includes('view') || type.includes('watch')) {
							const count = parseInt(String(stat.userInteractionCount), 10);
							if (!isNaN(count) && count > 0) {
								viewCount = count;
								break;
							}
						}
					}
				}
			}
			
			// Try to extract resolution from JSON-LD
			if (!width && firstVideo.width) {
				const parsed = parseInt(String(firstVideo.width), 10);
				if (!isNaN(parsed) && parsed > 0) width = parsed;
			}
			
			if (!height && firstVideo.height) {
				const parsed = parseInt(String(firstVideo.height), 10);
				if (!isNaN(parsed) && parsed > 0) height = parsed;
			}
		}
	}

	const resolution = (width && height) ? `${width}x${height}` : null;
	
	return {
		viewCount,
		width,
		height,
		resolution,
	};
}

// Extracts engagement metrics and ratings
function extractEngagementData($, jsonld) {
	let likeCount = null;
	let shareCount = null;
	let commentCount = null;
	let rating = null;
	let ratingCount = null;
	let tags = [];

	// Try to get engagement metrics from various sources
	const likeCandidates = [
		getMeta($, "og:video:like_count"),
		getMeta($, "twitter:player:like_count"),
		getMeta($, "video:like_count"),
		$("meta[itemprop='likeCount']").attr("content"),
	];
	
	const shareCandidates = [
		getMeta($, "og:video:share_count"),
		getMeta($, "twitter:player:share_count"),
		getMeta($, "video:share_count"),
		$("meta[itemprop='shareCount']").attr("content"),
	];
	
	const commentCandidates = [
		getMeta($, "og:video:comment_count"),
		getMeta($, "twitter:player:comment_count"),
		getMeta($, "video:comment_count"),
		$("meta[itemprop='commentCount']").attr("content"),
	];

	const ratingCandidates = [
		getMeta($, "rating"),
		getMeta($, "og:rating"),
		$("meta[itemprop='ratingValue']").attr("content"),
		$("meta[name='rating']").attr("content"),
	];

	const ratingCountCandidates = [
		getMeta($, "rating_count"),
		getMeta($, "og:rating_count"),
		$("meta[itemprop='ratingCount']").attr("content"),
		$("meta[itemprop='reviewCount']").attr("content"),
	];

	// Parse engagement numbers
	const foundLikes = likeCandidates.find((v) => v && String(v).trim().length > 0);
	if (foundLikes) {
		const parsed = parseInt(String(foundLikes).replace(/[^\d]/g, ''), 10);
		if (!isNaN(parsed) && parsed >= 0) likeCount = parsed;
	}

	const foundShares = shareCandidates.find((v) => v && String(v).trim().length > 0);
	if (foundShares) {
		const parsed = parseInt(String(foundShares).replace(/[^\d]/g, ''), 10);
		if (!isNaN(parsed) && parsed >= 0) shareCount = parsed;
	}

	const foundComments = commentCandidates.find((v) => v && String(v).trim().length > 0);
	if (foundComments) {
		const parsed = parseInt(String(foundComments).replace(/[^\d]/g, ''), 10);
		if (!isNaN(parsed) && parsed >= 0) commentCount = parsed;
	}

	const foundRating = ratingCandidates.find((v) => v && String(v).trim().length > 0);
	if (foundRating) {
		const parsed = parseFloat(String(foundRating));
		if (!isNaN(parsed) && parsed >= 0 && parsed <= 10) rating = parsed;
	}

	const foundRatingCount = ratingCountCandidates.find((v) => v && String(v).trim().length > 0);
	if (foundRatingCount) {
		const parsed = parseInt(String(foundRatingCount).replace(/[^\d]/g, ''), 10);
		if (!isNaN(parsed) && parsed >= 0) ratingCount = parsed;
	}

	// Extract tags from article:tag meta tags
	$("meta[property='article:tag'], meta[name='article:tag']").each((_, el) => {
		const tag = $(el).attr("content");
		if (tag && tag.trim()) {
			tags.push(tag.trim());
		}
	});

	// Check JSON-LD for additional engagement data
	if (jsonld.length) {
		const types = (node) => {
			const t = node && node["@type"];
			return Array.isArray(t) ? t.map(String) : t ? [String(t)] : [];
		};
		
		const videoNodes = jsonld.filter((n) => types(n).some((t) => /VideoObject/i.test(t)));
		const firstVideo = videoNodes[0];
		
		if (firstVideo) {
			// Extract tags/keywords from JSON-LD
			if (firstVideo.keywords) {
				const keywords = Array.isArray(firstVideo.keywords) 
					? firstVideo.keywords 
					: String(firstVideo.keywords).split(',');
				
				for (const keyword of keywords) {
					const cleaned = String(keyword).trim();
					if (cleaned && !tags.includes(cleaned)) {
						tags.push(cleaned);
					}
				}
			}

			// Extract rating from JSON-LD
			if (!rating && firstVideo.aggregateRating) {
				const aggRating = firstVideo.aggregateRating;
				if (aggRating.ratingValue) {
					const parsed = parseFloat(String(aggRating.ratingValue));
					if (!isNaN(parsed) && parsed >= 0) rating = parsed;
				}
				if (!ratingCount && aggRating.ratingCount) {
					const parsed = parseInt(String(aggRating.ratingCount), 10);
					if (!isNaN(parsed) && parsed >= 0) ratingCount = parsed;
				}
			}

			// Extract engagement from interactionStatistic
			if (firstVideo.interactionStatistic) {
				const stats = Array.isArray(firstVideo.interactionStatistic) 
					? firstVideo.interactionStatistic 
					: [firstVideo.interactionStatistic];
				
				for (const stat of stats) {
					if (stat && stat.interactionType && stat.userInteractionCount) {
						const type = String(stat.interactionType).toLowerCase();
						const count = parseInt(String(stat.userInteractionCount), 10);
						
						if (!isNaN(count) && count >= 0) {
							if (!likeCount && (type.includes('like') || type.includes('thumb'))) {
								likeCount = count;
							} else if (!shareCount && type.includes('share')) {
								shareCount = count;
							} else if (!commentCount && type.includes('comment')) {
								commentCount = count;
							}
						}
					}
				}
			}
		}
	}

	return {
		likeCount,
		shareCount,
		commentCount,
		rating,
		ratingCount,
		tags: tags.length > 0 ? tags : null,
	};
}

// Extracts technical video information
function extractTechnicalData($, jsonld) {
	let videoType = null;
	let encoding = null;
	let quality = null;
	let fileSize = null;
	let streamingUrl = null;
	let captions = null;
	let license = null;

	// Try to get technical data from various sources
	const typeCandidates = [
		getMeta($, "og:video:type"),
		getMeta($, "video:type"),
		getMeta($, "content-type"),
		$("meta[itemprop='encodingFormat']").attr("content"),
	];

	const qualityCandidates = [
		getMeta($, "og:video:quality"),
		getMeta($, "video:quality"),
		getMeta($, "video:resolution"),
		$("meta[itemprop='videoQuality']").attr("content"),
	];

	const sizeCandidates = [
		getMeta($, "og:video:size"),
		getMeta($, "video:size"),
		getMeta($, "content-length"),
		$("meta[itemprop='contentSize']").attr("content"),
	];

	const licenseCandidates = [
		getMeta($, "license"),
		getMeta($, "og:license"),
		getMeta($, "cc:license"),
		getMeta($, "rights"),
		$("meta[itemprop='license']").attr("content"),
		$("link[rel='license']").attr("href"),
	];

	// Parse technical data
	const foundType = typeCandidates.find((v) => v && String(v).trim().length > 0);
	if (foundType) {
		videoType = String(foundType).trim();
	}

	const foundQuality = qualityCandidates.find((v) => v && String(v).trim().length > 0);
	if (foundQuality) {
		quality = String(foundQuality).trim();
	}

	const foundSize = sizeCandidates.find((v) => v && String(v).trim().length > 0);
	if (foundSize) {
		const sizeStr = String(foundSize);
		const parsed = parseInt(sizeStr.replace(/[^\d]/g, ''), 10);
		if (!isNaN(parsed) && parsed > 0) {
			fileSize = parsed;
		}
	}

	const foundLicense = licenseCandidates.find((v) => v && String(v).trim().length > 0);
	if (foundLicense) {
		license = String(foundLicense).trim();
	}

	// Look for streaming URLs (HLS, DASH)
	const hlsUrl = getMeta($, "og:video:stream") || $("link[type='application/vnd.apple.mpegurl']").attr("href");
	const dashUrl = $("link[type='application/dash+xml']").attr("href");
	
	if (hlsUrl || dashUrl) {
		streamingUrl = hlsUrl || dashUrl;
	}

	// Look for captions/subtitles
	const captionElements = $("track[kind='captions'], track[kind='subtitles']");
	if (captionElements.length > 0) {
		const captionLanguages = [];
		captionElements.each((_, el) => {
			const lang = $(el).attr("srclang");
			const label = $(el).attr("label");
			if (lang) {
				captionLanguages.push(label ? `${lang} (${label})` : lang);
			}
		});
		if (captionLanguages.length > 0) {
			captions = captionLanguages.join(', ');
		}
	}

	// Check JSON-LD for technical data
	if (jsonld.length) {
		const types = (node) => {
			const t = node && node["@type"];
			return Array.isArray(t) ? t.map(String) : t ? [String(t)] : [];
		};
		
		const videoNodes = jsonld.filter((n) => types(n).some((t) => /VideoObject/i.test(t)));
		const firstVideo = videoNodes[0];
		
		if (firstVideo) {
			if (!videoType && firstVideo.encodingFormat) {
				videoType = String(firstVideo.encodingFormat);
			}
			
			if (!fileSize && firstVideo.contentSize) {
				const parsed = parseInt(String(firstVideo.contentSize), 10);
				if (!isNaN(parsed) && parsed > 0) fileSize = parsed;
			}

			if (!license && firstVideo.license) {
				license = String(firstVideo.license);
			}

			if (!encoding && firstVideo.videoFrameSize) {
				encoding = String(firstVideo.videoFrameSize);
			}
		}
	}

	return {
		videoType,
		encoding,
		quality,
		fileSize,
		streamingUrl,
		captions,
		license,
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
	const videoStats = extractVideoStats($, jsonld);
	const engagement = extractEngagementData($, jsonld);
	const technical = extractTechnicalData($, jsonld);

	return {
		metadata: { ...basic, ...dates, ...duration, ...video, ...videoStats, ...engagement, ...technical },
		metaTags,
	};
}


