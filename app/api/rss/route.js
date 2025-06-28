// app/api/rss/route.js

import Parser from "rss-parser";

const RSS_FEED_URL = "https://medicalxpress.com/rss-feed/diabetes-news/";

export async function GET() {
  try {
    const parser = new Parser({
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      customFields: {
        item: [
          // Map media:thumbnail to mediaThumbnail (an object)
          ["media:thumbnail", "mediaThumbnail"],
        ],
      },
    });

    const feed = await parser.parseURL(RSS_FEED_URL);
    const items = feed.items.slice(0, 6).map((item) => ({
      title: item.title,
      link: item.link,
      summary: item.contentSnippet || item.summary || "Click to read more...",
      image:
        item.enclosure?.url ||
        item.mediaThumbnail?.$?.url || // <-- access inside $
        (item.content?.match(/<img[^>]+src="([^">]+)"/)?.[1] ?? null),
    }));

    return Response.json({ items });
  } catch (error) {
    console.error("RSS Fetch Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch RSS feed." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
