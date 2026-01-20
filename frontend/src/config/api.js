// API Configuration
// This file centralizes all API-related configuration

// Production API URL (Render deployment)
const PRODUCTION_API_URL = "https://cybersafe-sfoz.onrender.com/api";

// Development API URL
const DEVELOPMENT_API_URL = "/api";

// Determine which URL to use based on environment
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? DEVELOPMENT_API_URL : PRODUCTION_API_URL);

// Export individual endpoints for convenience
export const AUTH_ENDPOINTS = {
  signup: `${API_BASE}/auth/signup`,
  login: `${API_BASE}/auth/login`,
  profile: `${API_BASE}/auth/profile`,
};

export const CHAT_ENDPOINTS = {
  send: `${API_BASE}/chat`,
  history: `${API_BASE}/chat/history`,
};

export const STORY_ENDPOINTS = {
  list: `${API_BASE}/stories`,
  create: `${API_BASE}/stories`,
};

// Default fetch timeout (60 seconds for Render free tier cold starts)
export const FETCH_TIMEOUT = 60000;

// Helper function to create fetch with timeout
export const fetchWithTimeout = async (url, options = {}, timeout = FETCH_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
