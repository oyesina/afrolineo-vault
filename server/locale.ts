/**
 * GET /api/locale → { country: "DE" | null }
 *
 * Tells the app which country a visit comes from, so it can pick a display
 * language when the browser language doesn't settle it. Nothing is stored.
 *
 * The country comes from a header added by the host or CDN in front of the app:
 *  - Cloudflare: CF-IPCountry (on by default)
 *  - Vercel: X-Vercel-IP-Country
 *  - AWS CloudFront: CloudFront-Viewer-Country
 *  - Google Cloud Load Balancer: add a custom request header such as
 *    "X-Client-Country: {client_region}" and set GEO_COUNTRY_HEADER=x-client-country
 * With none of these, it returns null and the app uses browser language or English.
 * DEV_COUNTRY (e.g. "FR") fakes a country for local testing.
 */
import type express from 'express';

const KNOWN_HEADERS = ['cf-ipcountry', 'x-vercel-ip-country', 'cloudfront-viewer-country', 'x-country-code'];

export function countryFromRequest(req: express.Request): string | null {
  const custom = process.env.GEO_COUNTRY_HEADER?.toLowerCase();
  const headers = custom ? [custom, ...KNOWN_HEADERS] : KNOWN_HEADERS;
  for (const name of headers) {
    const value = req.get(name)?.trim().toUpperCase();
    // Ignore placeholders like XX (unknown) and T1 (Tor)
    if (value && /^[A-Z]{2}$/.test(value) && value !== 'XX' && value !== 'T1') return value;
  }
  const dev = process.env.DEV_COUNTRY?.trim().toUpperCase();
  return dev && /^[A-Z]{2}$/.test(dev) ? dev : null;
}

export function mountLocale(app: express.Express) {
  app.get('/api/locale', (req, res) => {
    res.set('Cache-Control', 'private, no-store');
    res.set('Vary', '*');
    res.json({ country: countryFromRequest(req) });
  });
}
