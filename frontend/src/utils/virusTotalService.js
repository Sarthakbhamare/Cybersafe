// VirusTotal API Integration Service
// Handles API calls, rate limiting, and caching

const VIRUSTOTAL_API_KEY = 'd97e8f68af7ec07c4e49a9c57ec1a172c950475a71bb5c032fd3b7af3c1d6636';
const VIRUSTOTAL_API_BASE = 'https://www.virustotal.com/api/v3';

// Simple in-memory cache (in production, use localStorage or Redis)
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Rate limiting: 4 requests per minute (free tier)
let requestQueue = [];
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 15000; // 15 seconds between requests

// Check if cached result exists and is valid
function getCachedResult(indicator) {
  const cached = cache.get(indicator);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(indicator);
  return null;
}

// Save result to cache
function setCachedResult(indicator, data) {
  cache.set(indicator, {
    data,
    timestamp: Date.now()
  });
}

// Rate limiting helper
async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

// Convert VirusTotal response to our format
function parseVirusTotalResponse(data, indicator, type) {
  const attributes = data.data?.attributes || {};
  const stats = attributes.last_analysis_stats || {};
  
  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  const totalScans = Object.values(stats).reduce((sum, val) => sum + val, 0);
  
  // Calculate severity
  let severity = 'safe';
  if (malicious > 5 || suspicious > 10) {
    severity = 'critical';
  } else if (malicious > 2 || suspicious > 5) {
    severity = 'high';
  } else if (malicious > 0 || suspicious > 0) {
    severity = 'medium';
  }
  
  // Determine category based on attributes
  let category = 'Unknown Threat';
  const categories = attributes.categories || {};
  if (categories.phishing || attributes.last_final_url?.includes('phish')) {
    category = 'Phishing';
  } else if (categories.malware) {
    category = 'Malware Distribution';
  } else if (categories.spam) {
    category = 'Spam Source';
  }
  
  return {
    indicator,
    type: severity === 'safe' ? 'clean' : 'malicious',
    severity,
    category,
    reports: malicious + suspicious,
    lastSeen: attributes.last_analysis_date 
      ? new Date(attributes.last_analysis_date * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    description: `Detected by ${malicious}/${totalScans} security vendors${
      malicious > 0 ? ' as malicious' : suspicious > 0 ? ' as suspicious' : ''
    }`,
    tags: [
      ...(malicious > 0 ? ['malicious'] : []),
      ...(suspicious > 0 ? ['suspicious'] : []),
      ...(categories.phishing ? ['phishing'] : []),
      ...(categories.malware ? ['malware'] : [])
    ],
    scanResults: {
      malicious,
      suspicious,
      undetected: stats.undetected || 0,
      harmless: stats.harmless || 0,
      totalScans
    },
    source: 'VirusTotal'
  };
}

// Check URL reputation
async function checkURL(url) {
  // Check cache first
  const cached = getCachedResult(url);
  if (cached) return { ...cached, cached: true };
  
  try {
    await waitForRateLimit();
    
    // Encode URL for API
    const urlId = btoa(url).replace(/=/g, '');
    
    const response = await fetch(`${VIRUSTOTAL_API_BASE}/urls/${urlId}`, {
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY
      }
    });
    
    if (!response.ok) {
      // If URL not found, try submitting it for analysis
      if (response.status === 404) {
        return await submitURL(url);
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const result = parseVirusTotalResponse(data, url, 'url');
    
    setCachedResult(url, result);
    return result;
    
  } catch (error) {
    console.error('VirusTotal API error:', error);
    return null;
  }
}

// Submit URL for scanning
async function submitURL(url) {
  try {
    await waitForRateLimit();
    
    const formData = new FormData();
    formData.append('url', url);
    
    const response = await fetch(`${VIRUSTOTAL_API_BASE}/urls`, {
      method: 'POST',
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Submit error: ${response.status}`);
    }
    
    // Return pending status
    return {
      indicator: url,
      type: 'pending',
      severity: 'unknown',
      category: 'Analysis Pending',
      reports: 0,
      lastSeen: new Date().toISOString().split('T')[0],
      description: 'URL submitted for analysis. Results will be available shortly.',
      tags: ['pending-analysis'],
      source: 'VirusTotal'
    };
    
  } catch (error) {
    console.error('VirusTotal submit error:', error);
    return null;
  }
}

// Check IP address reputation
async function checkIP(ip) {
  const cached = getCachedResult(ip);
  if (cached) return { ...cached, cached: true };
  
  try {
    await waitForRateLimit();
    
    const response = await fetch(`${VIRUSTOTAL_API_BASE}/ip_addresses/${ip}`, {
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const result = parseVirusTotalResponse(data, ip, 'ip');
    
    setCachedResult(ip, result);
    return result;
    
  } catch (error) {
    console.error('VirusTotal API error:', error);
    return null;
  }
}

// Check domain reputation
async function checkDomain(domain) {
  const cached = getCachedResult(domain);
  if (cached) return { ...cached, cached: true };
  
  try {
    await waitForRateLimit();
    
    const response = await fetch(`${VIRUSTOTAL_API_BASE}/domains/${domain}`, {
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const result = parseVirusTotalResponse(data, domain, 'domain');
    
    setCachedResult(domain, result);
    return result;
    
  } catch (error) {
    console.error('VirusTotal API error:', error);
    return null;
  }
}

// Main function to check any indicator
export async function checkIndicator(indicator, type) {
  try {
    if (type === 'url') {
      return await checkURL(indicator);
    } else if (type === 'ip') {
      return await checkIP(indicator);
    } else if (type === 'email') {
      // Extract domain from email
      const domain = indicator.split('@')[1];
      if (domain) {
        const result = await checkDomain(domain);
        if (result) {
          return {
            ...result,
            indicator,
            description: `Email domain analysis: ${result.description}`
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Indicator check error:', error);
    return null;
  }
}

// Export cache management functions
export function clearCache() {
  cache.clear();
}

export function getCacheSize() {
  return cache.size;
}
