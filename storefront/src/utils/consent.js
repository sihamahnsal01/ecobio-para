import { useEffect, useState } from 'react';

const KEY = 'ecobio_cookie_consent';
const EVENT = 'cookie-consent-change';
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 180; // about 6 months

export function getConsent() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.timestamp || Date.now() - data.timestamp > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function saveConsent({ analytics = false, thirdParty = false }) {
  const data = { necessary: true, analytics, thirdParty, timestamp: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable: consent will be asked again next visit */
  }
  window.dispatchEvent(new Event(EVENT));
  return data;
}

export function hasConsent(category) {
  const c = getConsent();
  return !!(c && c[category]);
}

// React hook: re-renders when the visitor changes their choice
export function useConsent() {
  const [consent, setConsent] = useState(getConsent());
  useEffect(() => {
    const update = () => setConsent(getConsent());
    window.addEventListener(EVENT, update);
    return () => window.removeEventListener(EVENT, update);
  }, []);
  return consent;
}

export function openCookieSettings() {
  window.dispatchEvent(new Event('open-cookie-settings'));
}
