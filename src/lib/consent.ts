/**
 * Cookie and storage consent.
 *
 * Afrolineo sets no actual cookies; it uses browser storage, which privacy
 * laws (GDPR/ePrivacy, UK GDPR, CCPA/CPRA, LGPD, POPIA, NDPA…) treat the same way.
 *
 *  - essential: always on. Keeps you signed in and stores your family archive.
 *  - analytics: off until the visitor agrees. Sends usage events to the
 *    admin console (see src/lib/analytics.ts).
 *
 * A browser sending Global Privacy Control starts with analytics off.
 * Bump CONSENT_VERSION whenever what we collect changes, so everyone is asked again.
 */

export const CONSENT_VERSION = 1;
const CONSENT_KEY = 'afrolineo_consent';

export interface ConsentState {
  version: number;
  analytics: boolean;
  decidedAt: string;
}

type Listener = (state: ConsentState | null) => void;
const listeners = new Set<Listener>();

let current: ConsentState | null = read();

function read(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    return parsed.version === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

/** The saved choice, or null if this visitor hasn't decided yet. */
export function getConsent(): ConsentState | null {
  return current;
}

export function hasAnalyticsConsent(): boolean {
  return current?.analytics === true;
}

/** True when the browser asks sites not to sell or share data (Global Privacy Control). */
export function globalPrivacyControlOn(): boolean {
  return typeof navigator !== 'undefined' && (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

export function saveConsent(analytics: boolean) {
  current = { version: CONSENT_VERSION, analytics, decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(current));
    if (!analytics) localStorage.removeItem('afrolineo_anon_id'); // drop the analytics ID on opt-out
  } catch {
    // storage blocked: the choice still applies for this visit
  }
  listeners.forEach((fn) => fn(current));
}

export function onConsentChange(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// Lets any "Cookie settings" link open the preferences window
const OPEN_EVENT = 'afrolineo:open-cookie-settings';
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}
export function onOpenCookieSettings(fn: () => void) {
  window.addEventListener(OPEN_EVENT, fn);
  return () => window.removeEventListener(OPEN_EVENT, fn);
}

/** What the app keeps in the browser, shown in the preferences window. */
export const STORAGE_INVENTORY = {
  essential: [
    { name: 'afrolineo_auth_user', purpose: 'Keeps you signed in on this device.' },
    { name: 'afrolineo_profiles, afrolineo_recordings, afrolineo_linked_relatives', purpose: 'Your family tree, stories and linked relatives. Stored only in this browser.' },
    { name: 'afrolineo_login_sessions, afrolineo_has_exported, afrolineo_sidebar_collapsed', purpose: 'Remembers recent sign-ins on this device, whether you have made a backup, and your menu layout.' },
    { name: 'afrolineo_consent', purpose: 'Remembers the choices you make here.' },
  ],
  analytics: [
    { name: 'afrolineo_anon_id', purpose: 'A random ID that links visits from this browser before and after you sign in.' },
    { name: 'Usage sent to our server', purpose: 'Your account details, which features you use, and an outline of your tree (names and relationships). Never your recordings, transcripts or notes.' },
  ],
};
