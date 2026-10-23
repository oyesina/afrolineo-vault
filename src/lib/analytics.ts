/**
 * Sends usage events to the server for the admin console.
 * Never send story content (transcripts, notes, audio) through here.
 * Failures are ignored: analytics must never break the app.
 */
import type { Profile } from '../types';

export type TrackEvent =
  | 'landing_viewed'
  | 'auth_opened'
  | 'signed_in'
  | 'onboarding_completed'
  | 'session_started'
  | 'screen_viewed'
  | 'profile_added'
  | 'profile_updated'
  | 'profile_deleted'
  | 'recording_saved'
  | 'story_played'
  | 'relative_linked'
  | 'backup_exported'
  | 'signed_out';

type Props = Record<string, string | number | boolean | undefined>;

const ANON_KEY = 'afrolineo_anon_id';
// The starter family every new account begins with (see DEFAULT_PROFILES in App.tsx)
const SAMPLE_PROFILE_IDS = new Set(['p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6']);

let userEmail: string | null = null;

function anonId(): string {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return 'no-storage';
  }
}

function device(): 'mobile' | 'tablet' | 'desktop' {
  const w = window.innerWidth;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function post(url: string, body: unknown) {
  try {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    return Promise.resolve(undefined);
  }
}

/** Remember who is signed in so later events are linked to them. */
export function setAnalyticsUser(email: string | null) {
  userEmail = email;
}

/** Create or update the account record. Resolves once the server has it. */
export async function identify(user: {
  email: string;
  name: string;
  provider: string;
  ancestralCountry?: string;
  ancestralState?: string;
  ethnicGroup?: string;
  knowledgeLevel?: string;
}) {
  userEmail = user.email;
  await post('/api/track/identify', {
    email: user.email,
    name: user.name,
    provider: user.provider,
    country: user.ancestralCountry,
    state: user.ancestralState,
    ethnicGroup: user.ethnicGroup,
    knowledgeLevel: user.knowledgeLevel,
    device: device(),
  });
}

export function track(name: TrackEvent, props: Props = {}) {
  const clean: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) if (v !== undefined) clean[k] = v;
  post('/api/track', { name, anonId: anonId(), userEmail, device: device(), props: clean });
}

let treeTimer: ReturnType<typeof setTimeout> | null = null;
/** Send the tree outline (names and relationships only), at most once every 2 seconds. */
export function syncTreeOutline(profiles: Profile[]) {
  if (!userEmail) return;
  const email = userEmail;
  if (treeTimer) clearTimeout(treeTimer);
  treeTimer = setTimeout(() => {
    post('/api/track/tree', {
      email,
      tree: profiles.map((p) => ({
        name: p.fullName,
        role: p.role,
        isAlive: p.isAlive,
        sample: SAMPLE_PROFILE_IDS.has(p.id),
      })),
    });
  }, 2000);
}
