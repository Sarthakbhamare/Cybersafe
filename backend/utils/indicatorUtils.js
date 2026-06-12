const URL_PATTERN = /https?:\/\/[^\s]+/gi;
const IPV4_PATTERN = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;
const DOMAIN_PATTERN = /\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/g;

export function detectIndicatorType(indicator = "") {
  const value = String(indicator).trim();
  if (!value) return "unknown";

  if (/^https?:\/\//i.test(value)) return "url";
  if (/^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/.test(value)) return "ip";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "email";
  if (/^\+?[\d\s()\-]{7,}$/.test(value)) return "phone";
  if (/^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(value)) return "domain";

  return "unknown";
}

export function normalizeIndicator(indicator = "", type = detectIndicatorType(indicator)) {
  const raw = String(indicator).trim();
  if (!raw) return "";

  try {
    if (type === "url") {
      const url = new URL(raw);
      return url.hostname.toLowerCase().replace(/^www\./, "");
    }

    if (type === "domain") {
      return raw.toLowerCase().replace(/^www\./, "");
    }

    if (type === "email") {
      const domain = raw.split("@")[1] || raw;
      return domain.toLowerCase().replace(/^www\./, "");
    }

    if (type === "phone") {
      return raw.replace(/\D/g, "");
    }

    return raw.toLowerCase();
  } catch {
    return raw.toLowerCase();
  }
}

export function extractIndicators(text = "") {
  const input = String(text);
  const out = [];

  const urls = input.match(URL_PATTERN) || [];
  urls.forEach((value) => {
    out.push({
      raw: value,
      type: "url",
      normalized: normalizeIndicator(value, "url"),
    });
  });

  const ips = input.match(IPV4_PATTERN) || [];
  ips.forEach((value) => {
    out.push({
      raw: value,
      type: "ip",
      normalized: normalizeIndicator(value, "ip"),
    });
  });

  const domains = input.match(DOMAIN_PATTERN) || [];
  domains.forEach((value) => {
    const alreadyCovered = out.some((i) => i.normalized === normalizeIndicator(value, "domain"));
    if (!alreadyCovered) {
      out.push({
        raw: value,
        type: "domain",
        normalized: normalizeIndicator(value, "domain"),
      });
    }
  });

  // De-duplicate normalized values.
  const seen = new Set();
  return out.filter((item) => {
    if (!item.normalized || seen.has(item.normalized)) return false;
    seen.add(item.normalized);
    return true;
  });
}
