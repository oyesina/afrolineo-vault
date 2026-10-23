import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight, ArrowUpRight, Download, LogOut, RefreshCw, Search, X, Lock, Users as UsersIcon, LayoutDashboard,
} from 'lucide-react';
import LineageMark from '../components/LineageMark';
import { BarList, TimeChart } from './charts';

// ---------- Types (mirror server/analytics.ts) ----------

interface Summary {
  generatedAt: number;
  rangeDays: number;
  storage: { dir: string; events: number };
  kpis: {
    totalUsers: number; newUsers: number; prevNewUsers: number; activeUsers: number; prevActiveUsers: number;
    dau: number; wau: number; mau: number; stories: number; prevStories: number; minutesRecorded: number; peopleAdded: number;
  };
  series: { date: string; activeUsers: number; newUsers: number; stories: number; peopleAdded: number }[];
  funnel: { step: string; users: number }[];
  retention: { week: string; size: number; weeks: (number | null)[] }[];
  featureUsage: { label: string; value: number; users: number }[];
  screens: { label: string; value: number }[];
  audience: Record<'countries' | 'ethnicGroups' | 'knowledge' | 'providers' | 'devices', { label: string; value: number }[]>;
  recent: { ts: number; name: string; props: Record<string, string | number | boolean>; userId: string | null; userName?: string }[];
}

type Status = 'active' | 'at_risk' | 'dormant';

interface UserRow {
  id: string; name: string; email: string; provider: string; country?: string; ethnicGroup?: string; device: string;
  firstSeen: number; lastSeen: number; activeDays: number; peopleAdded: number; stories: number; minutesRecorded: number;
  storiesPlayed: number; relativesLinked: number; treeSize: number; ownPeople: number; status: Status;
}

interface UserDetail {
  user: UserRow & { state?: string; knowledgeLevel?: string; tree: { name: string; role: string; isAlive: boolean; sample: boolean }[]; treeUpdatedAt?: number };
  stats: Omit<UserRow, 'id' | 'name' | 'email' | 'provider' | 'country' | 'ethnicGroup' | 'device' | 'firstSeen' | 'lastSeen'>;
  timeline: { ts: number; name: string; props: Record<string, string | number | boolean>; device: string }[];
}

// ---------- Helpers ----------

const PASSWORD_KEY = 'afrolineo_admin_key';

const STATUS_STYLE: Record<Status, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-forest-tint text-forest' },
  at_risk: { label: 'At risk', className: 'bg-ochre-tint text-paternal-ink' },
  dormant: { label: 'Dormant', className: 'bg-sand text-muted' },
};

const ROLE_LABEL: Record<string, string> = {
  self: 'Self', father: 'Father', mother: 'Mother',
  paternal_grandfather: 'Father’s father', paternal_grandmother: 'Father’s mother',
  maternal_grandfather: 'Mother’s father', maternal_grandmother: 'Mother’s mother',
  sibling: 'Sibling', uncle: 'Uncle', aunt: 'Aunt',
};

const SCREEN_LABEL: Record<string, string> = {
  tree: 'Family tree', discovery: 'Discover', community: 'Relatives', about: 'About', dash: 'Founder metrics',
};

function describeEvent(name: string, props: Record<string, string | number | boolean>): string {
  const role = props.role ? ROLE_LABEL[String(props.role)] || String(props.role) : '';
  switch (name) {
    case 'landing_viewed': return 'Visited the landing page';
    case 'auth_opened': return props.mode === 'sign_up' ? 'Opened create-account' : 'Opened sign-in';
    case 'signed_in': return `Signed in with ${props.provider || 'email'}`;
    case 'onboarding_completed': return `Finished onboarding${props.country ? ` · ${props.country}` : ''}${props.ethnicGroup ? `, ${props.ethnicGroup}` : ''}`;
    case 'session_started': return 'Opened the app';
    case 'screen_viewed': return `Viewed ${SCREEN_LABEL[String(props.screen)] || props.screen}`;
    case 'profile_added': return `Added a person${role ? ` (${role})` : ''}`;
    case 'profile_updated': return `Edited a person${role ? ` (${role})` : ''}`;
    case 'profile_deleted': return `Removed a person${role ? ` (${role})` : ''}`;
    case 'recording_saved': return `Recorded a story${props.durationSec ? ` · ${formatDuration(Number(props.durationSec))}` : ''}${role ? ` with ${role.toLowerCase()}` : ''}`;
    case 'story_played': return 'Played a story';
    case 'relative_linked': return `Linked a ${props.closeness === 'close' ? 'close' : 'distant'} relative`;
    case 'backup_exported': return 'Exported a backup';
    case 'signed_out': return 'Signed out';
    default: return name;
  }
}

const formatDuration = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;

function timeAgo(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} d ago`;
  return new Date(ts).toLocaleDateString();
}

const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const pct = (v: number) => `${Math.round(v * 100)}%`;

async function api<T>(path: string, password: string): Promise<T> {
  const res = await fetch(path, { headers: { Authorization: `Bearer ${password}` } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Request failed (${res.status})`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// ---------- Small building blocks ----------

function Card({ title, subtitle, children, className = '', action }: { title: string; subtitle?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={`bg-white border border-line rounded-2xl p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-sans text-base font-bold text-ink">{title}</h2>
          {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Delta({ now, prev }: { now: number; prev: number }) {
  if (prev === 0 && now === 0) return <span className="text-xs text-muted">no change</span>;
  if (prev === 0) return <span className="text-xs text-muted">new this period</span>;
  const change = (now - prev) / prev;
  const up = change >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-forest' : 'text-[#8A1C12]'}`}>
      {up ? <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" /> : <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />}
      {up ? '+' : ''}{Math.round(change * 100)}% <span className="font-normal text-muted">vs previous</span>
    </span>
  );
}

function Kpi({ label, value, children }: { label: string; value: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-[32px] leading-none font-medium tabular-nums">{value}</p>
      <div className="mt-2 min-h-4">{children}</div>
    </div>
  );
}

// ---------- Overview ----------

function Overview({ summary }: { summary: Summary }) {
  const { kpis, series, funnel, retention } = summary;
  const isEmpty = kpis.totalUsers === 0 && summary.storage.events === 0;
  const stickiness = kpis.mau ? kpis.dau / kpis.mau : 0;
  const first = funnel[0]?.users || 0;

  if (isEmpty) {
    return (
      <div className="bg-white border border-line rounded-2xl p-10 text-center">
        <h2 className="font-display text-2xl font-medium">No activity yet</h2>
        <p className="mt-2 text-muted max-w-md mx-auto">
          Data appears here as soon as people visit the site and sign in. Open the app in another tab to see your own visit show up.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Total users" value={kpis.totalUsers}>
          <span className="text-xs text-muted">all time</span>
        </Kpi>
        <Kpi label="New users" value={kpis.newUsers}><Delta now={kpis.newUsers} prev={kpis.prevNewUsers} /></Kpi>
        <Kpi label="Active users" value={kpis.activeUsers}><Delta now={kpis.activeUsers} prev={kpis.prevActiveUsers} /></Kpi>
        <Kpi label="Stickiness (daily ÷ monthly users)" value={pct(stickiness)}>
          <span className="text-xs text-muted">{kpis.dau} today · {kpis.wau} week · {kpis.mau} month</span>
        </Kpi>
        <Kpi label="Stories recorded" value={kpis.stories}><Delta now={kpis.stories} prev={kpis.prevStories} /></Kpi>
        <Kpi label="Minutes recorded" value={kpis.minutesRecorded}>
          <span className="text-xs text-muted">{kpis.peopleAdded} people added</span>
        </Kpi>
      </div>

      {/* Trends */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Daily active users" subtitle="Signed-in people who did anything that day">
          <TimeChart data={series.map((d) => ({ date: d.date, value: d.activeUsers }))} kind="line" color="#2F5D4A" label="Active users" />
        </Card>
        <Card title="New accounts per day" subtitle="First sign-in on that day">
          <TimeChart data={series.map((d) => ({ date: d.date, value: d.newUsers }))} kind="bar" color="#B9772A" label="New accounts" />
        </Card>
      </div>

      {/* Funnel + retention */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Activation funnel" subtitle={`Visitors and new accounts in the last ${summary.rangeDays} days`}>
          <ol className="space-y-3">
            {funnel.map((step, i) => {
              const share = first ? step.users / first : 0;
              const prev = i > 0 ? funnel[i - 1].users : 0;
              const drop = i > 0 && prev > 0 ? 1 - step.users / prev : 0;
              return (
                <li key={step.step}>
                  <div className="flex justify-between gap-3 text-sm mb-1">
                    <span className="text-ink-soft"><span className="text-muted tabular-nums">{i + 1}.</span> {step.step}</span>
                    <span className="font-semibold tabular-nums">
                      {step.users}
                      <span className="font-normal text-muted"> · {first ? pct(share) : '–'}</span>
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-sand overflow-hidden">
                    <div className="h-full rounded-full bg-forest" style={{ width: `${Math.max(share * 100, step.users ? 2 : 0)}%` }} />
                  </div>
                  {i > 0 && drop > 0 && (
                    <p className="mt-1 text-xs text-muted">{pct(drop)} dropped off from the step before</p>
                  )}
                </li>
              );
            })}
          </ol>
        </Card>

        <Card title="Weekly retention" subtitle="Share of each sign-up week who came back in later weeks">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-1">
              <thead>
                <tr className="text-muted text-xs">
                  <th className="text-left font-semibold px-1">Signed up week of</th>
                  <th className="text-right font-semibold px-1">Users</th>
                  {[1, 2, 3, 4].map((w) => <th key={w} className="font-semibold px-1">Week {w}</th>)}
                </tr>
              </thead>
              <tbody>
                {retention.map((row) => (
                  <tr key={row.week}>
                    <td className="px-1 whitespace-nowrap">{new Date(`${row.week}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}</td>
                    <td className="px-1 text-right tabular-nums">{row.size}</td>
                    {row.weeks.map((v, k) => (
                      <td
                        key={k}
                        className="text-center rounded-md tabular-nums h-8 min-w-12"
                        style={
                          v === null
                            ? { background: '#F7F3EC', color: '#9A8F82' }
                            : { background: `rgba(47, 93, 74, ${0.08 + v * 0.85})`, color: v > 0.45 ? '#FFFFFF' : '#1F1B17' }
                        }
                        title={v === null ? 'Not enough time yet' : `${pct(v)} of ${row.size} came back in week ${k + 1}`}
                      >
                        {v === null ? '–' : pct(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Engagement */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="What people do" subtitle="Actions in this period · people who did it">
          <BarList items={summary.featureUsage.map((f) => ({ label: f.label, value: f.value, note: `${f.users} ${f.users === 1 ? 'person' : 'people'}` }))} color="#B9772A" />
        </Card>
        <Card title="Screens viewed" subtitle="Where people spend time">
          <BarList items={summary.screens} color="#B9772A" />
        </Card>
        <Card title="Recent activity" subtitle="Latest actions by signed-in people">
          <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {summary.recent.map((e, i) => (
              <li key={`${e.ts}-${i}`} className="text-sm">
                <p>
                  <span className="font-semibold">{e.userName || 'Someone'}</span>{' '}
                  <span className="text-ink-soft">{describeEvent(e.name, e.props).replace(/^./, (c) => c.toLowerCase())}</span>
                </p>
                <p className="text-xs text-muted">{timeAgo(e.ts)}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Audience */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Countries"><BarList items={summary.audience.countries.map((c) => ({ ...c, label: c.label === 'Other African Native Region' ? 'Other African country' : c.label }))} /></Card>
        <Card title="Ethnic groups"><BarList items={summary.audience.ethnicGroups} /></Card>
        <Card title="Sign-in method"><BarList items={summary.audience.providers} /></Card>
        <Card title="Devices"><BarList items={summary.audience.devices.map((d) => ({ ...d, label: d.label[0].toUpperCase() + d.label.slice(1) }))} /></Card>
      </div>

      <p className="text-xs text-muted">
        {summary.storage.events.toLocaleString()} events stored in <code className="font-mono">{summary.storage.dir}</code>. Updated {timeAgo(summary.generatedAt)}.
      </p>
    </div>
  );
}

// ---------- Users ----------

type SortKey = 'lastSeen' | 'firstSeen' | 'name' | 'activeDays' | 'peopleAdded' | 'stories' | 'minutesRecorded';

function UsersView({ users, onOpen }: { users: UserRow[]; onOpen: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'lastSeen', dir: -1 });

  const counts = useMemo(() => ({
    all: users.length,
    active: users.filter((u) => u.status === 'active').length,
    at_risk: users.filter((u) => u.status === 'at_risk').length,
    dormant: users.filter((u) => u.status === 'dormant').length,
  }), [users]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => status === 'all' || u.status === status)
      .filter((u) => !q || [u.name, u.email, u.country, u.ethnicGroup].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        return (typeof av === 'string' ? av.localeCompare(String(bv)) : Number(av) - Number(bv)) * sort.dir;
      });
  }, [users, query, status, sort]);

  const exportCsv = () => {
    const cols: (keyof UserRow)[] = ['name', 'email', 'provider', 'country', 'ethnicGroup', 'device', 'firstSeen', 'lastSeen', 'status', 'activeDays', 'peopleAdded', 'stories', 'minutesRecorded', 'treeSize'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [cols.join(',')].concat(
      rows.map((u) => cols.map((c) => esc(c === 'firstSeen' || c === 'lastSeen' ? new Date(u[c]).toISOString() : u[c])).join(',')),
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `afrolineo-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const SortHeader = ({ label, k, align = 'left' }: { label: string; k: SortKey; align?: 'left' | 'right' }) => (
    <th className={`px-3 py-2.5 font-semibold text-${align}`} aria-sort={sort.key === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? (s.dir === 1 ? -1 : 1) : -1 }))}
        className="inline-flex items-center gap-1 hover:text-ink cursor-pointer"
      >
        {label}
        <span aria-hidden="true" className="text-[10px]">{sort.key === k ? (sort.dir === 1 ? '▲' : '▼') : ''}</span>
      </button>
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 h-11 px-3.5 bg-white border border-line rounded-xl flex-1 min-w-60 max-w-md">
          <Search className="w-[18px] h-[18px] text-muted" aria-hidden="true" />
          <span className="sr-only">Search users</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, country, ethnic group"
            className="flex-1 bg-transparent outline-none text-[15px]"
          />
        </label>
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
          {(['all', 'active', 'at_risk', 'dormant'] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
              className={`h-10 px-3.5 rounded-full text-sm font-semibold border cursor-pointer ${status === s ? 'bg-ink text-cream border-ink' : 'bg-white border-line text-ink-soft hover:border-ink-soft'}`}
            >
              {s === 'all' ? 'All' : STATUS_STYLE[s].label} <span className="opacity-70 tabular-nums">{counts[s]}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={!rows.length}
          className="ml-auto h-10 px-4 rounded-xl border border-line bg-white text-sm font-semibold inline-flex items-center gap-2 hover:border-ink-soft cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" aria-hidden="true" /> Export CSV
        </button>
      </div>
      <p className="text-xs text-muted">Active = used the app in the last 7 days · At risk = 7–30 days ago · Dormant = over 30 days.</p>

      <div className="bg-white border border-line rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-muted text-xs bg-paper border-b border-line">
            <tr>
              <SortHeader label="User" k="name" />
              <th className="px-3 py-2.5 font-semibold text-left">Status</th>
              <th className="px-3 py-2.5 font-semibold text-left">Country</th>
              <SortHeader label="Signed up" k="firstSeen" />
              <SortHeader label="Last active" k="lastSeen" />
              <SortHeader label="Active days" k="activeDays" align="right" />
              <SortHeader label="People added" k="peopleAdded" align="right" />
              <SortHeader label="Stories" k="stories" align="right" />
              <SortHeader label="Minutes" k="minutesRecorded" align="right" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={9} className="px-3 py-10 text-center text-muted">No users match.</td></tr>
            ) : rows.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-3 py-2.5">
                  <button type="button" onClick={() => onOpen(u.id)} className="text-left cursor-pointer group">
                    <span className="block font-semibold group-hover:underline underline-offset-4">{u.name}</span>
                    <span className="block text-xs text-muted">{u.email}</span>
                  </button>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[u.status].className}`}>{STATUS_STYLE[u.status].label}</span>
                </td>
                <td className="px-3 py-2.5 text-ink-soft">{u.country || '–'}</td>
                <td className="px-3 py-2.5 text-ink-soft whitespace-nowrap">{formatDate(u.firstSeen)}</td>
                <td className="px-3 py-2.5 text-ink-soft whitespace-nowrap">{timeAgo(u.lastSeen)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{u.activeDays}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{u.peopleAdded}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{u.stories}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{u.minutesRecorded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const GENERATIONS: { label: string; roles: string[] }[] = [
  { label: 'Grandparents', roles: ['paternal_grandfather', 'paternal_grandmother', 'maternal_grandfather', 'maternal_grandmother'] },
  { label: 'Parents, uncles & aunts', roles: ['father', 'mother', 'uncle', 'aunt'] },
  { label: 'Self & siblings', roles: ['self', 'sibling'] },
];

function UserDrawer({ id, password, onClose }: { id: string; password: string; onClose: () => void }) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setDetail(null);
    api<UserDetail>(`/api/admin/users/${encodeURIComponent(id)}`, password).then(setDetail).catch((e) => setError(e.message));
  }, [id, password]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-ink/40 animate-fadeIn" onClick={onClose} aria-hidden="true" />
      <aside role="dialog" aria-modal="true" aria-label="User details" className="relative w-full sm:max-w-xl h-full bg-cream overflow-y-auto animate-slideLeft shadow-2xl">
        <div className="sticky top-0 bg-cream/95 backdrop-blur border-b border-line px-6 py-4 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-2xl font-medium truncate">{detail?.user.name || 'Loading…'}</h2>
            {detail && <p className="text-sm text-muted truncate">{detail.user.email} · {detail.user.provider}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" autoFocus className="w-11 h-11 rounded-full hover:bg-sand flex items-center justify-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="m-6 p-3 rounded-xl bg-[#FDECEA] text-[#8A1C12] text-sm">{error}</p>}

        {detail && (
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[detail.stats.status].className}`}>{STATUS_STYLE[detail.stats.status].label}</span>
              {[detail.user.country, detail.user.state, detail.user.ethnicGroup, detail.user.knowledgeLevel, detail.user.device]
                .filter(Boolean)
                .map((t) => <span key={String(t)} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-line text-ink-soft">{t}</span>)}
            </div>

            <dl className="grid grid-cols-3 gap-px bg-line border border-line rounded-2xl overflow-hidden">
              {[
                ['Signed up', formatDate(detail.user.firstSeen)],
                ['Last active', timeAgo(detail.user.lastSeen)],
                ['Active days', detail.stats.activeDays],
                ['People added', detail.stats.peopleAdded],
                ['Stories', detail.stats.stories],
                ['Minutes', detail.stats.minutesRecorded],
                ['Stories played', detail.stats.storiesPlayed],
                ['Relatives linked', detail.stats.relativesLinked],
                ['Tree size', `${detail.stats.treeSize} (${detail.stats.ownPeople} own)`],
              ].map(([k, v]) => (
                <div key={String(k)} className="bg-white px-3.5 py-3">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>

            <section>
              <h3 className="font-sans text-base font-bold mb-1">Family tree outline</h3>
              <p className="text-xs text-muted mb-3">
                Names and relationships only. “Sample” marks the starter family every account begins with.
                {detail.user.treeUpdatedAt && ` Updated ${timeAgo(detail.user.treeUpdatedAt)}.`}
              </p>
              {detail.user.tree.length === 0 ? (
                <p className="text-sm text-muted">No tree received yet.</p>
              ) : (
                <div className="space-y-3">
                  {GENERATIONS.map((g) => {
                    const people = detail.user.tree.filter((n) => g.roles.includes(n.role));
                    if (!people.length) return null;
                    return (
                      <div key={g.label}>
                        <p className="text-xs font-bold uppercase tracking-[0.06em] text-[#6B6157] mb-1.5">{g.label}</p>
                        <ul className="flex flex-wrap gap-2">
                          {people.map((n, i) => (
                            <li key={`${n.name}-${i}`} className="bg-white border border-line rounded-xl px-3 py-2 text-sm">
                              <span className="font-semibold">{n.name}</span>
                              <span className="text-muted"> · {ROLE_LABEL[n.role] || n.role}{!n.isAlive && ' · passed on'}</span>
                              {n.sample && <span className="ml-1.5 text-[11px] font-semibold text-muted border border-line rounded px-1">Sample</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <h3 className="font-sans text-base font-bold mb-3">Activity</h3>
              {detail.timeline.length === 0 ? (
                <p className="text-sm text-muted">No activity recorded.</p>
              ) : (
                <ol className="relative border-l-2 border-line ml-1.5 space-y-3">
                  {detail.timeline.map((e, i) => (
                    <li key={`${e.ts}-${i}`} className="pl-4 relative">
                      <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-line-strong" aria-hidden="true" />
                      <p className="text-sm">{describeEvent(e.name, e.props)}</p>
                      <p className="text-xs text-muted">{new Date(e.ts).toLocaleString()} · {e.device}</p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}

// ---------- Sign-in gate ----------

function AdminLogin({ onSuccess }: { onSuccess: (password: string) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/admin/summary?range=7', password);
      onSuccess(password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-line rounded-3xl p-8">
        <span className="w-11 h-11 rounded-xl bg-ink flex items-center justify-center">
          <Lock className="w-5 h-5 text-[#E2A04F]" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-display text-[28px] font-medium">Afrolineo admin</h1>
        <p className="mt-1 text-[15px] text-muted">Enter the admin password set on the server.</p>
        <label htmlFor="admin-password" className="block mt-6 mb-1.5 text-sm font-semibold text-ink-soft">Admin password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-12 px-4 rounded-xl bg-white border border-line outline-none focus:border-ochre focus:ring-2 focus:ring-ochre/25"
          autoFocus
        />
        {error && <p role="alert" className="mt-3 p-3 rounded-xl bg-[#FDECEA] text-[#8A1C12] text-sm">{error}</p>}
        <button type="submit" disabled={busy || !password} className="mt-5 w-full h-12 rounded-full bg-ochre text-ink font-semibold hover:brightness-95 cursor-pointer disabled:opacity-60">
          {busy ? 'Checking…' : 'Open dashboard'}
        </button>
        <a href="/" className="block mt-4 text-center text-sm text-muted hover:text-ink">← Back to the app</a>
      </form>
    </div>
  );
}

// ---------- Console shell ----------

export default function AdminConsole() {
  const [password, setPassword] = useState<string>(() => {
    try { return sessionStorage.getItem(PASSWORD_KEY) || ''; } catch { return ''; }
  });
  const [tab, setTab] = useState<'overview' | 'users'>('overview');
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [openUser, setOpenUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Admin · Afrolineo';
  }, []);

  const signOut = useCallback(() => {
    try { sessionStorage.removeItem(PASSWORD_KEY); } catch { /* ignore */ }
    setPassword('');
    setSummary(null);
    setUsers([]);
  }, []);

  const load = useCallback(async () => {
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const [s, u] = await Promise.all([
        api<Summary>(`/api/admin/summary?range=${range}`, password),
        api<{ users: UserRow[] }>('/api/admin/users', password),
      ]);
      setSummary(s);
      setUsers(u.users);
    } catch (err) {
      if ((err as { status?: number }).status === 401) signOut();
      else setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [password, range, signOut]);

  useEffect(() => { load(); }, [load]);

  // Refresh every minute while the tab is visible
  useEffect(() => {
    if (!password) return;
    const t = setInterval(() => document.visibilityState === 'visible' && load(), 60_000);
    return () => clearInterval(t);
  }, [password, load]);

  if (!password) {
    return (
      <AdminLogin
        onSuccess={(p) => {
          try { sessionStorage.setItem(PASSWORD_KEY, p); } catch { /* ignore */ }
          setPassword(p);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="bg-white border-b border-line sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2.5 shrink-0" title="Back to the app">
            <span className="w-9 h-9 rounded-[10px] bg-ink flex items-center justify-center">
              <LineageMark className="w-5 h-5 text-[#E2A04F]" />
            </span>
            <span className="font-display text-xl font-semibold hidden sm:inline">Afrolineo</span>
            <span className="text-xs font-bold uppercase tracking-[0.08em] bg-sand text-ink-soft px-2 py-1 rounded-md">Admin</span>
          </a>
          <nav aria-label="Admin" className="flex gap-1 ml-2">
            {([['overview', 'Overview', LayoutDashboard], ['users', 'Users', UsersIcon]] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-current={tab === key ? 'page' : undefined}
                className={`h-10 px-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer ${tab === key ? 'bg-sand text-ink' : 'text-muted hover:text-ink'}`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" /> {label}
                {key === 'users' && <span className="tabular-nums text-muted">{users.length}</span>}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={load} aria-label="Refresh" title="Refresh" className="w-10 h-10 rounded-xl hover:bg-sand flex items-center justify-center cursor-pointer">
              <RefreshCw className={`w-[18px] h-[18px] ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button type="button" onClick={signOut} aria-label="Sign out of admin" title="Sign out" className="w-10 h-10 rounded-xl hover:bg-sand flex items-center justify-center cursor-pointer">
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[30px] font-medium leading-tight">{tab === 'overview' ? 'How people use Afrolineo' : 'Users'}</h1>
            <p className="text-muted">{tab === 'overview' ? 'Growth, activation, retention and engagement.' : 'Every account, what they’ve done and how recently.'}</p>
          </div>
          {tab === 'overview' && (
            <div role="group" aria-label="Date range" className="flex bg-sand rounded-xl p-1">
              {([7, 30, 90] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={range === r}
                  onClick={() => setRange(r)}
                  className={`h-9 px-3.5 rounded-lg text-sm font-semibold cursor-pointer ${range === r ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'}`}
                >
                  {r} days
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p role="alert" className="p-3 rounded-xl bg-[#FDECEA] text-[#8A1C12] text-sm">{error}</p>}

        {!summary ? (
          <p className="text-muted py-10 text-center">Loading…</p>
        ) : tab === 'overview' ? (
          <Overview summary={summary} />
        ) : (
          <UsersView users={users} onOpen={setOpenUser} />
        )}
      </main>

      {openUser && <UserDrawer id={openUser} password={password} onClose={() => setOpenUser(null)} />}
    </div>
  );
}
