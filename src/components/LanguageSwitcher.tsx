import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Globe, X } from 'lucide-react';
import { useI18n } from '../i18n';
import { LANGUAGES, type Lang } from '../i18n/languages';

/**
 * Language menu. English is always listed first; each language is shown in
 * its own name so people can find theirs whatever is currently on screen.
 */
export default function LanguageSwitcher({
  variant = 'light',
  compact = false,
  align = 'right',
  direction = 'down',
}: {
  variant?: 'light' | 'dark';
  compact?: boolean;
  align?: 'left' | 'right';
  direction?: 'down' | 'up';
}) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = LANGUAGES.find((l) => l.code === lang)!;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (code: Lang) => {
    setLang(code);
    setOpen(false);
  };

  const buttonClass =
    variant === 'dark'
      ? 'text-gray-300 hover:text-white hover:bg-white/10'
      : 'text-ink-soft hover:text-ink hover:bg-sand';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${t('lang.menuLabel')}: ${current.nativeName}`}
        className={`h-11 inline-flex items-center gap-1.5 rounded-full font-semibold text-[15px] cursor-pointer ${compact ? 'w-11 justify-center' : 'px-3'} ${buttonClass}`}
      >
        <Globe className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
        {!compact && (
          <>
            <span>{current.nativeName}</span>
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </>
        )}
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('lang.menuLabel')}
          className={`absolute z-[90] w-52 py-1.5 bg-white text-ink border border-line rounded-2xl shadow-[0_20px_40px_-15px_rgba(31,27,23,0.4)] ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
        >
          {LANGUAGES.map((l) => {
            const selected = l.code === lang;
            return (
              <li key={l.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  lang={l.code}
                  onClick={() => choose(l.code)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-[15px] hover:bg-sand cursor-pointer ${selected ? 'font-semibold' : ''}`}
                >
                  <span>
                    {l.nativeName}
                    {l.code !== 'en' && <span className="ml-1.5 text-[13px] text-muted font-normal">{l.englishName}</span>}
                  </span>
                  {selected && <Check className="w-4 h-4 text-forest" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Shown once when the language was picked automatically, so anyone who
 * prefers English can switch with one click. "Switch to English" stays in English.
 */
export function LanguageAutoNote() {
  const { showAutoNote, dismissAutoNote, setLang, lang, t } = useI18n();
  if (!showAutoNote) return null;
  const name = LANGUAGES.find((l) => l.code === lang)!.nativeName;
  return (
    <div role="status" className="relative z-[60] bg-ink text-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px]">
        <Globe className="w-4 h-4 text-[#E2A04F] shrink-0" aria-hidden="true" />
        <p className="flex-1 min-w-48">{t('lang.autoNote', { language: name })}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            lang="en"
            onClick={() => setLang('en')}
            className="h-9 px-3.5 rounded-full bg-ochre text-ink font-semibold cursor-pointer hover:brightness-95"
          >
            Switch to English
          </button>
          <button
            type="button"
            onClick={dismissAutoNote}
            className="h-9 px-3 rounded-full font-semibold hover:bg-white/10 cursor-pointer"
          >
            {t('lang.keep', { language: name })}
          </button>
          <button
            type="button"
            onClick={dismissAutoNote}
            aria-label={t('common.close')}
            className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
