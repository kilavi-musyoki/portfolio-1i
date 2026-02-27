// Vercel Serverless Function — CV Download Tracking + Redirect
//
// GET /api/track-download
// - Optionally logs download metadata to a Google Sheets webhook
//   defined by GOOGLE_SHEETS_WEBHOOK
// - Then redirects to the CV asset at /assets/Kilavi_Musyoki_CV.pdf
//
// Environment variables (Vercel dashboard):
// - GOOGLE_SHEETS_WEBHOOK (optional)

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK;

  if (webhook) {
    try {
      const payload = {
        timestamp: new Date().toISOString(),
        referrer: req.headers.referer || null,
        userAgent: req.headers['user-agent'] || null,
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null,
      };

      // Fire-and-forget; do not block redirect on errors
      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch {
      // Swallow any logging issues
    }
  }

  res.writeHead(302, {
    Location: '/assets/Kilavi_Musyoki_CV.pdf',
  });
  res.end();
};

