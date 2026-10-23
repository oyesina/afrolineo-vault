/**
 * Usage analytics for the Afrolineo admin console.
 *
 * What is stored (see the privacy section of the landing page):
 *  - account details: name, email, sign-in method, onboarding answers
 *  - activity events: what someone did and when, with small numeric/text details
 *  - a tree outline: each person's name, relationship and living status
 * What is never stored: recordings, transcripts, notes or other story content.
 *
 * Storage is two files in DATA_DIR (default ./data):
 *  - events.jsonl  one event per line, append-only
 *  - users.json    one record per user, rewritten after changes
 * Hosts that wipe their disk on redeploy (e.g. Cloud Run) will lose this data.
 */
import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// ---------- Types ----------

export const EVENT_NAMES = [
  'landing_viewed',
  'auth_opened',
  'signed_in',
  'onboarding_completed',
  'session_started',
  'screen_viewed',
  'profile_added',
  'profile_updated',
  'profile_deleted',
  'recording_saved',
  'story_played',
  'relative_linked',
  'backup_exported',
  'signed_out',
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

type PropValue = string | number | boolean;
type Device = 'mobile' | 'tablet' | 'desktop';

interface StoredEvent {
  ts: number;
  name: EventName;
  userId: string | null;
  anonId: string;
  device: Device;
  props: Record<string, PropValue>;
}

interface TreeNode {
  name: string;
  role: string;
  isAlive: boolean;
  sample: boolean; // part of the starter family every new account gets
}

interface UserRecord {
  id: string; // lower-cased email
  name: string;
  email: string;
  provider: string;
  country?: string;
  state?: string;
  ethnicGroup?: string;
  knowledgeLevel?: string;
  firstSeen: number;
  lastSeen: number;
  device: Device;
  tree: TreeNode[];
  treeUpdatedAt?: number;
}

const ROLES = new Set([
  'self', 'father', 'mother', 'paternal_grandfather', 'paternal_grandmother',
  'maternal_grandfather', 'maternal_grandmother', 'sibling', 'uncle', 'aunt',
]);

const DAY = 24 * 60 * 60 * 1000;

// ---------- Storage ----------

// Resolved in loadStore(), after server.ts has loaded .env
let DATA_DIR = '';
let EVENTS_FILE = '';
let USERS_FILE = '';

const events: StoredEvent[] = [];
const users = new Map<string, UserRecord>();

function loadStore() {
  DATA_DIR = process.env.ANALYTICS_DIR || path.join(process.cwd(), 'data');
  EVENTS_FILE = path.join(DATA_DIR, 'events.jsonl');
  USERS_FILE = path.join(DATA_DIR, 'users.json');
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(EVENTS_FILE)) {
    for (const line of fs.readFileSync(EVENTS_FILE, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try {
        events.push(JSON.parse(line));
      } catch {
        // skip a corrupt line rather than failing to start
      }
    }
  }
  if (fs.existsSync(USERS_FILE)) {
    try {
      const list: UserRecord[] = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      list.forEach((u) => users.set(u.id, u));
    } catch (err) {
      console.error('[analytics] could not read users.json:', err);
    }
  }
  events.sort((a, b) => a.ts - b.ts);
  console.log(`[analytics] loaded ${events.length} events and ${users.size} users from ${DATA_DIR}`);
}

let saveTimer: NodeJS.Timeout | null = null;
function scheduleUsersSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    const tmp = `${USERS_FILE}.tmp`;
    fs.writeFile(tmp, JSON.stringify([...users.values()]), (err) => {
      if (err) return console.error('[analytics] save failed:', err);
      fs.rename(tmp, USERS_FILE, (e) => e && console.error('[analytics] save failed:', e));
    });
  }, 1000);
}

function appendEvent(ev: StoredEvent) {
  events.push(ev);
  fs.appendFile(EVENTS_FILE, JSON.stringify(ev) + '\n', (err) => {
    if (err) console.error('[analytics] could not write event:', err);
  });
}

// ---------- Input cleaning ----------

const str = (v: unknown, max = 200): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined;

const toDevice = (v: unknown): Device => (v === 'mobile' || v === 'tablet' ? v : 'desktop');

function cleanProps(raw: unknown): Record<string, PropValue> {
  const out: Record<string, PropValue> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>).slice(0, 12)) {
    const key = k.slice(0, 40);
    if (typeof v === 'string') out[key] = v.slice(0, 200);
    else if (typeof v === 'number' && Number.isFinite(v)) out[key] = v;
    else if (typeof v === 'boolean') out[key] = v;
  }
  return out;
}

const userIdFromEmail = (email?: string) => (email ? email.toLowerCase() : undefined);

// Simple fixed-window rate limiter keyed by IP
function rateLimit(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; reset: number }>();
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > limit) return res.status(429).json({ error: 'Too many requests' });
    next();
  };
}

// ---------- Metrics ----------

const dayKey = (ts: number) => new Date(ts).toISOString().slice(0, 10);

function countBy<T>(items: T[], key: (t: T) => string | undefined, top = 8) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    if (!k) continue;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([label, value]) => ({ label, value }));
}

function activeUserIds(from: number, to: number) {
  const ids = new Set<string>();
  for (const e of events) if (e.userId && e.ts >= from && e.ts < to) ids.add(e.userId);
  return ids;
}

function userStats(u: UserRecord) {
  const mine = events.filter((e) => e.userId === u.id);
  const days = new Set(mine.map((e) => dayKey(e.ts)));
  const recordings = mine.filter((e) => e.name === 'recording_saved');
  const minutes = recordings.reduce((sum, e) => sum + (Number(e.props.durationSec) || 0), 0) / 60;
  const sinceLast = Date.now() - u.lastSeen;
  return {
    activeDays: days.size,
    peopleAdded: mine.filter((e) => e.name === 'profile_added').length,
    stories: recordings.length,
    minutesRecorded: Math.round(minutes * 10) / 10,
    storiesPlayed: mine.filter((e) => e.name === 'story_played').length,
    relativesLinked: mine.filter((e) => e.name === 'relative_linked').length,
    treeSize: u.tree.length,
    ownPeople: u.tree.filter((n) => !n.sample).length,
    status: sinceLast < 7 * DAY ? 'active' : sinceLast < 30 * DAY ? 'at_risk' : 'dormant',
  };
}

function buildSummary(rangeDays: number) {
  const now = Date.now();
  const from = now - rangeDays * DAY;
  const prevFrom = from - rangeDays * DAY;
  const allUsers = [...users.values()];
  const inRange = events.filter((e) => e.ts >= from);

  const newUsers = allUsers.filter((u) => u.firstSeen >= from).length;
  const prevNewUsers = allUsers.filter((u) => u.firstSeen >= prevFrom && u.firstSeen < from).length;
  const activeUsers = activeUserIds(from, now).size;
  const prevActiveUsers = activeUserIds(prevFrom, from).size;
  const dau = activeUserIds(now - DAY, now).size;
  const wau = activeUserIds(now - 7 * DAY, now).size;
  const mau = activeUserIds(now - 30 * DAY, now).size;

  const recordings = inRange.filter((e) => e.name === 'recording_saved');
  const prevRecordings = events.filter((e) => e.name === 'recording_saved' && e.ts >= prevFrom && e.ts < from);
  const minutes = recordings.reduce((s, e) => s + (Number(e.props.durationSec) || 0), 0) / 60;

  // Daily series
  const series: { date: string; activeUsers: number; newUsers: number; stories: number; peopleAdded: number }[] = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const start = new Date(now - i * DAY);
    start.setUTCHours(0, 0, 0, 0);
    const s = start.getTime();
    const e = s + DAY;
    const dayEvents = inRange.filter((ev) => ev.ts >= s && ev.ts < e);
    series.push({
      date: dayKey(s),
      activeUsers: new Set(dayEvents.filter((ev) => ev.userId).map((ev) => ev.userId)).size,
      newUsers: allUsers.filter((u) => u.firstSeen >= s && u.firstSeen < e).length,
      stories: dayEvents.filter((ev) => ev.name === 'recording_saved').length,
      peopleAdded: dayEvents.filter((ev) => ev.name === 'profile_added').length,
    });
  }

  // Activation funnel for everyone who first visited in the range
  const visitors = new Set(inRange.filter((e) => e.name === 'landing_viewed').map((e) => e.anonId));
  const opened = new Set(inRange.filter((e) => e.name === 'auth_opened').map((e) => e.anonId));
  const cohort = allUsers.filter((u) => u.firstSeen >= from);
  const cohortIds = new Set(cohort.map((u) => u.id));
  // Each later step only counts people who also completed the steps before it
  const didAction = (name: EventName) =>
    new Set(events.filter((e) => e.name === name && e.userId && cohortIds.has(e.userId)).map((e) => e.userId as string));
  const addedRelative = didAction('profile_added');
  const recordedStory = new Set([...didAction('recording_saved')].filter((id) => addedRelative.has(id)));
  const cameBack = cohort.filter(
    (u) => recordedStory.has(u.id) && events.some((e) => e.userId === u.id && dayKey(e.ts) !== dayKey(u.firstSeen)),
  ).length;
  const funnel = [
    { step: 'Visited landing page', users: visitors.size },
    { step: 'Opened sign-in', users: opened.size },
    { step: 'Created account', users: cohort.length },
    { step: 'Added a relative', users: addedRelative.size },
    { step: 'Recorded a story', users: recordedStory.size },
    { step: 'Came back another day', users: cameBack },
  ];

  // Weekly retention: share of each sign-up week active in following weeks
  const weekStart = (ts: number) => {
    const d = new Date(ts);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); // Monday
    return d.getTime();
  };
  const thisWeek = weekStart(now);
  const retention: { week: string; size: number; weeks: (number | null)[] }[] = [];
  for (let w = 7; w >= 0; w--) {
    const ws = thisWeek - w * 7 * DAY;
    const members = allUsers.filter((u) => u.firstSeen >= ws && u.firstSeen < ws + 7 * DAY);
    const weeks: (number | null)[] = [];
    for (let k = 1; k <= 4; k++) {
      const s = ws + k * 7 * DAY;
      if (s > now || members.length === 0) {
        weeks.push(null);
        continue;
      }
      const active = activeUserIds(s, s + 7 * DAY);
      weeks.push(members.filter((m) => active.has(m.id)).length / members.length);
    }
    retention.push({ week: dayKey(ws), size: members.length, weeks });
  }

  // Feature usage (actions and screens)
  const actionLabels: Partial<Record<EventName, string>> = {
    profile_added: 'People added',
    profile_updated: 'People edited',
    recording_saved: 'Stories recorded',
    story_played: 'Stories played',
    relative_linked: 'Relatives linked',
    backup_exported: 'Backups exported',
  };
  const featureUsage = Object.entries(actionLabels)
    .map(([name, label]) => {
      const evs = inRange.filter((e) => e.name === name);
      return { label: label!, value: evs.length, users: new Set(evs.map((e) => e.userId)).size };
    })
    .sort((a, b) => b.value - a.value);
  const screenLabels: Record<string, string> = {
    tree: 'Family tree', discovery: 'Discover', community: 'Relatives', about: 'About', dash: 'Founder metrics',
  };
  const screens = countBy(
    inRange.filter((e) => e.name === 'screen_viewed'),
    (e) => screenLabels[String(e.props.screen)] || String(e.props.screen),
  );

  // Feed shows what signed-in people did; anonymous visits and screen views are too noisy
  const recent = events
    .filter((e) => e.userId && e.name !== 'screen_viewed')
    .slice(-40)
    .reverse()
    .map((e) => ({
      ts: e.ts,
      name: e.name,
      props: e.props,
      userId: e.userId,
      userName: e.userId ? users.get(e.userId)?.name : undefined,
    }));

  return {
    generatedAt: now,
    rangeDays,
    storage: { dir: DATA_DIR, events: events.length },
    kpis: {
      totalUsers: users.size,
      newUsers,
      prevNewUsers,
      activeUsers,
      prevActiveUsers,
      dau,
      wau,
      mau,
      stories: recordings.length,
      prevStories: prevRecordings.length,
      minutesRecorded: Math.round(minutes),
      peopleAdded: inRange.filter((e) => e.name === 'profile_added').length,
    },
    series,
    funnel,
    retention,
    featureUsage,
    screens,
    audience: {
      countries: countBy(allUsers, (u) => u.country),
      ethnicGroups: countBy(allUsers, (u) => u.ethnicGroup),
      knowledge: countBy(allUsers, (u) => u.knowledgeLevel),
      providers: countBy(allUsers, (u) => u.provider),
      devices: countBy(allUsers, (u) => u.device),
    },
    recent,
  };
}

// ---------- Routes ----------

export function mountAnalytics(app: express.Express) {
  loadStore();

  const trackLimit = rateLimit(240, 60_000);

  // Public: record one event
  app.post('/api/track', trackLimit, (req, res) => {
    const body = req.body || {};
    const name = body.name as EventName;
    const anonId = str(body.anonId, 64);
    if (!EVENT_NAMES.includes(name) || !anonId) return res.status(400).json({ error: 'Invalid event' });

    const userId = userIdFromEmail(str(body.userEmail, 200));
    const user = userId ? users.get(userId) : undefined;
    const ts = Date.now();
    appendEvent({ ts, name, userId: user ? userId! : null, anonId, device: toDevice(body.device), props: cleanProps(body.props) });
    if (user) {
      user.lastSeen = ts;
      scheduleUsersSave();
    }
    res.status(204).end();
  });

  // Public: create or update the signed-in user's account record
  app.post('/api/track/identify', trackLimit, (req, res) => {
    const body = req.body || {};
    const email = str(body.email, 200);
    const id = userIdFromEmail(email);
    if (!id || !email) return res.status(400).json({ error: 'Email required' });
    const now = Date.now();
    const existing = users.get(id);
    const record: UserRecord = {
      id,
      email,
      name: str(body.name, 120) || existing?.name || email.split('@')[0],
      provider: str(body.provider, 40) || existing?.provider || 'Email',
      country: str(body.country, 80) ?? existing?.country,
      state: str(body.state, 80) ?? existing?.state,
      ethnicGroup: str(body.ethnicGroup, 80) ?? existing?.ethnicGroup,
      knowledgeLevel: str(body.knowledgeLevel, 80) ?? existing?.knowledgeLevel,
      firstSeen: existing?.firstSeen ?? now,
      lastSeen: now,
      device: toDevice(body.device),
      tree: existing?.tree ?? [],
      treeUpdatedAt: existing?.treeUpdatedAt,
    };
    users.set(id, record);
    scheduleUsersSave();
    res.json({ isNew: !existing });
  });

  // Public: replace the user's tree outline (names and relationships only)
  app.post('/api/track/tree', trackLimit, (req, res) => {
    const body = req.body || {};
    const id = userIdFromEmail(str(body.email, 200));
    const user = id ? users.get(id) : undefined;
    if (!user || !Array.isArray(body.tree)) return res.status(400).json({ error: 'Unknown user' });
    user.tree = (body.tree as unknown[])
      .slice(0, 300)
      .map((n) => n as Record<string, unknown>)
      .filter((n) => n && ROLES.has(String(n.role)))
      .map((n) => ({
        name: str(n.name, 120) || 'Unnamed',
        role: String(n.role),
        isAlive: n.isAlive !== false,
        sample: n.sample === true,
      }));
    user.treeUpdatedAt = Date.now();
    scheduleUsersSave();
    res.status(204).end();
  });

  // ----- Admin (password protected) -----

  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const passwordHash = crypto.createHash('sha256').update(adminPassword).digest();
  const adminLimit = rateLimit(60, 60_000);

  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!adminPassword) {
      return res.status(503).json({ error: 'The admin console is not set up. Set ADMIN_PASSWORD on the server and restart it.' });
    }
    const header = req.get('authorization') || '';
    const given = header.startsWith('Bearer ') ? header.slice(7) : '';
    const givenHash = crypto.createHash('sha256').update(given).digest();
    if (!given || !crypto.timingSafeEqual(givenHash, passwordHash)) {
      return res.status(401).json({ error: 'Wrong password' });
    }
    next();
  };

  app.get('/api/admin/summary', adminLimit, requireAdmin, (req, res) => {
    const range = [7, 30, 90].includes(Number(req.query.range)) ? Number(req.query.range) : 30;
    res.json(buildSummary(range));
  });

  app.get('/api/admin/users', adminLimit, requireAdmin, (_req, res) => {
    const list = [...users.values()]
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        provider: u.provider,
        country: u.country,
        ethnicGroup: u.ethnicGroup,
        device: u.device,
        firstSeen: u.firstSeen,
        lastSeen: u.lastSeen,
        ...userStats(u),
      }))
      .sort((a, b) => b.lastSeen - a.lastSeen);
    res.json({ users: list });
  });

  app.get('/api/admin/users/:id', adminLimit, requireAdmin, (req, res) => {
    const user = users.get(String(req.params.id).toLowerCase());
    if (!user) return res.status(404).json({ error: 'User not found' });
    const timeline = events
      .filter((e) => e.userId === user.id)
      .slice(-200)
      .reverse()
      .map((e) => ({ ts: e.ts, name: e.name, props: e.props, device: e.device }));
    res.json({ user, stats: userStats(user), timeline });
  });
}
