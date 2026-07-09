const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const Parser = require("rss-parser");

admin.initializeApp();

const db = admin.firestore();
const parser = new Parser();

const RSS_FEEDS = [
  {
    source: "JeuxVideo.com",
    category: "Gaming",
    url: "https://www.jeuxvideo.com/rss/rss.xml",
  },
];

exports.importGamingNews = onSchedule("every 6 hours", async () => {
  const newsRef = db.collection("news");

  for (const feed of RSS_FEEDS) {
    try {
      const rss = await parser.parseURL(feed.url);
      const items = (rss.items || []).slice(0, 10);

      for (const item of items) {
        const idSource = item.guid || item.link || item.title;
        const docId = Buffer.from(idSource)
          .toString("base64")
          .replace(/\//g, "_");

        await newsRef.doc(docId).set(
          {
            title: item.title || "Sans titre",
            summary: item.contentSnippet || item.content || "",
            url: item.link || "",
            source: feed.source,
            category: feed.category,
            date: item.isoDate || item.pubDate || new Date().toISOString(),
            image: "",
            importedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error(`Erreur RSS ${feed.source}:`, error);
    }
  }
});