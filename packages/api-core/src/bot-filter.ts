// Crawlers, link-preview fetchers and HTTP libraries. Clicks from these are
// still recorded (for visibility) but excluded from affiliate click stats.
const BOT_UA_RE =
  /bot|crawl|spider|slurp|facebookexternalhit|meta-externalagent|whatsapp|telegrambot|slackbot|discordbot|twitterbot|linkedinbot|skypeuripreview|embedly|preview|headless|lighthouse|pingdom|uptime|curl|wget|python-requests|python-urllib|aiohttp|httpx|axios|node-fetch|undici|go-http|java\/|okhttp|libwww|scrapy/i;

export function isBotUserAgent(ua: string | undefined): boolean {
  if (!ua || !ua.trim()) return true;
  return BOT_UA_RE.test(ua);
}

// Repeat clicks on the same target from the same IP hash within this window
// are recorded as duplicates.
export const REPEAT_CLICK_WINDOW_MS = 30 * 60 * 1000;
