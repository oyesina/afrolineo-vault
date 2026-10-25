/**
 * Display language for Afrolineo.
 *
 *   const { t, tc, rich, lang, setLang } = useI18n();
 *   t('landing.hero.lead')                       → plain text
 *   tc('tree.peopleCount', 3)                    → "3 people" (uses *_one / *_other keys)
 *   rich('auth.welcome', { name: <strong>…</strong> }) → text with React elements in {placeholders}
 *
 * English lives in locales/en.ts and is the source of truth. Other languages load
 * on demand; any missing text falls back to English. People's own content
 * (names, stories, transcripts) is never translated.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en, { type MessageKey } from './locales/en';
import { DEFAULT_LANG, isLang, needsCountry, pickLanguage, type Lang, type LangSource } from './languages';

export type Messages = Record<MessageKey, string>;
type PluralBase = { [K in MessageKey]: K extends `${infer B}_one` ? B : never }[MessageKey];
type Vars = Record<string, string | number>;

const loaders: Record<Exclude<Lang, 'en'>, () => Promise<{ default: Partial<Messages> }>> = {
  fr: () => import('./locales/fr'),
  de: () => import('./locales/de'),
  es: () => import('./locales/es'),
  it: () => import('./locales/it'),
  pt: () => import('./locales/pt'),
  nl: () => import('./locales/nl'),
};

const SAVED_KEY = 'afrolineo_language';
const NOTE_KEY = 'afrolineo_language_note_dismissed';

const readSaved = (): string | null => {
  try {
    return localStorage.getItem(SAVED_KEY);
  } catch {
    return null;
  }
};

/** ?lang=de in the address counts as choosing that language (handy for shared links). */
function langFromAddress(): Lang | null {
  try {
    const url = new URL(window.location.href);
    const v = url.searchParams.get('lang');
    if (!isLang(v)) return null;
    url.searchParams.delete('lang');
    window.history.replaceState(null, '', url.toString());
    return v;
  } catch {
    return null;
  }
}

interface I18nContextValue {
  lang: Lang;
  source: LangSource;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey, vars?: Vars) => string;
  tc: (base: PluralBase, count: number, vars?: Vars) => string;
  rich: (key: MessageKey, parts: Record<string, React.ReactNode>) => React.ReactNode;
  /** Whether to show "We picked your language — switch to English?" */
  showAutoNote: boolean;
  dismissAutoNote: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(text: string, vars?: Vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const browserLanguages = typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : [];

  const [{ lang, source }, setChoice] = useState(() => {
    const fromAddress = langFromAddress();
    if (fromAddress) {
      try { localStorage.setItem(SAVED_KEY, fromAddress); } catch { /* ignore */ }
    }
    return pickLanguage({ saved: fromAddress || readSaved(), browserLanguages });
  });
  const [messages, setMessages] = useState<Messages>(en);
  const [noteDismissed, setNoteDismissed] = useState(() => {
    try { return localStorage.getItem(NOTE_KEY) === '1'; } catch { return false; }
  });

  // If the browser language didn't settle it, ask our server which country the visit comes from.
  useEffect(() => {
    if (source === 'manual' || !needsCountry(browserLanguages)) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    fetch('/api/locale', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { country?: string | null } | null) => {
        if (data?.country) setChoice(pickLanguage({ saved: readSaved(), browserLanguages, country: data.country }));
      })
      .catch(() => undefined)
      .finally(() => clearTimeout(timer));
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the chosen language's text
  useEffect(() => {
    let cancelled = false;
    if (lang === 'en') {
      setMessages(en);
    } else {
      loaders[lang]()
        .then((mod) => !cancelled && setMessages({ ...en, ...mod.default }))
        .catch(() => !cancelled && setMessages(en));
    }
    document.documentElement.lang = lang;
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem(SAVED_KEY, next);
      localStorage.setItem(NOTE_KEY, '1');
    } catch { /* ignore */ }
    setNoteDismissed(true);
    setChoice({ lang: next, source: 'manual' });
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: MessageKey, vars?: Vars) => interpolate(messages[key] ?? en[key] ?? key, vars);
    const rules = new Intl.PluralRules(lang);
    const tc = (base: PluralBase, count: number, vars?: Vars) => {
      const form = rules.select(count);
      const key = (`${base}_${form}` in messages ? `${base}_${form}` : `${base}_other`) as MessageKey;
      return t(key, { count: count.toLocaleString(lang), ...vars });
    };
    const rich = (key: MessageKey, parts: Record<string, React.ReactNode>) => {
      const text = messages[key] ?? en[key] ?? key;
      return text.split(/(\{\w+\})/g).map((chunk, i) => {
        const m = chunk.match(/^\{(\w+)\}$/);
        return <React.Fragment key={i}>{m && m[1] in parts ? parts[m[1]] : chunk}</React.Fragment>;
      });
    };
    return {
      lang,
      source,
      setLang,
      t,
      tc,
      rich,
      showAutoNote: !noteDismissed && lang !== DEFAULT_LANG && (source === 'browser' || source === 'country'),
      dismissAutoNote: () => {
        try { localStorage.setItem(NOTE_KEY, '1'); } catch { /* ignore */ }
        setNoteDismissed(true);
      },
    };
  }, [messages, lang, source, setLang, noteDismissed]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
