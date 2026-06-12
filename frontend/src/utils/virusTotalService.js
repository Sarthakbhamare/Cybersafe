// Community reputation check service.
// Calls backend so API keys stay server-side.

const PRODUCTION_API_URL = 'https://cybersafe-sfoz.onrender.com/api';
const DEFAULT_API_URL = import.meta.env.DEV ? '/api' : PRODUCTION_API_URL;
const API_BASE = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL).replace(/\/$/, '');

const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getCachedResult(indicator) {
  const cached = cache.get(indicator);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(indicator);
  return null;
}

function setCachedResult(indicator, data) {
  cache.set(indicator, { data, timestamp: Date.now() });
}

export async function checkIndicator(indicator) {
  const cleaned = String(indicator || '').trim();
  if (!cleaned) return null;

  const cached = getCachedResult(cleaned);
  if (cached) return { ...cached, cached: true };

  try {
    const response = await fetch(`${API_BASE}/reputation/check?indicator=${encodeURIComponent(cleaned)}`);
    if (!response.ok) return null;

    const data = await response.json();
    setCachedResult(cleaned, data);
    return data;
  } catch (error) {
    console.error('Reputation check error:', error);
    return null;
  }
}

export function clearCache() {
  cache.clear();
}

export function getCacheSize() {
  return cache.size;
}
