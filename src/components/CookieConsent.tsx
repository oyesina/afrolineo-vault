import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Cookie, X } from 'lucide-react';
import {
  STORAGE_INVENTORY,
  getConsent,
  globalPrivacyControlOn,
  onConsentChange,
  onOpenCookieSettings,
  saveConsent,
} from '../lib/consent';

/**
 * Cookie notice shown to every visitor until they choose, plus a preferences
 * window that "Cookie settings" links can reopen at any time.
 * Accept and reject carry equal weight, and nothing optional runs before a choice.
 */
export default function CookieConsent({ bottomOffsetClass = 'bottom-0' }: { bottomOffsetClass?: string }) {
  const [decided, setDecided] = useState(getConsent() !== null);
  const [showSettings, setShowSettings] = useState(false);
  const gpc = globalPrivacyControlOn();

  useEffect(() => onConsentChange((c) => setDecided(c !== null)), []);
  useEffect(() => onOpenCookieSettings(() => setShowSettings(true)), []);

  const choose = (analytics: boolean) => {
    saveConsent(analytics);
    setShowSettings(false);
  };

  return (
    <>
      {!decided && !showSettings && (
        <section
          role="region"
          aria-label="Cookie notice"
          className={`fixed inset-x-0 ${bottomOffsetClass} z-[70] p-3 sm:p-4 pointer-events-none animate-slideUp`}
        >
          <div className="pointer-events-auto mx-auto max-w-3xl bg-white text-ink border border-line rounded-2xl shadow-[0_20px_50px_-15px_rgba(31,27,23,0.45)] p-5 sm:p-6">
            <div className="flex gap-3.5">
              <span className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-ochre-tint text-paternal-ink items-center justify-center">
                <Cookie className="w-5 h-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="font-sans text-base font-bold">We use cookies and similar storage</h2>
                <p className="mt-1 text-[14.5px] leading-relaxed text-ink-soft">
                  Essential storage keeps you signed in and saves your family archive on this device. With your permission,
                  we’d also like to measure how Afrolineo is used so we can improve it. We never collect your recordings,
                  transcripts or notes.{' '}
                  <button type="button" onClick={() => setShowSettings(true)} className="font-semibold text-ochre-deep underline underline-offset-4 cursor-pointer">
                    See what we store
                  </button>
                </p>
                {gpc && (
                  <p className="mt-2 text-[13px] text-muted">
                    Your browser’s Global Privacy Control signal is on, so analytics stays off unless you choose to allow it.
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-col-reverse sm:flex-row sm:items-center gap-2.5 sm:justify-end">
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="h-11 px-4 rounded-full font-semibold text-ink-soft hover:bg-sand cursor-pointer"
              >
                Customize
              </button>
              <button
                type="button"
                onClick={() => choose(false)}
                className="h-11 px-5 rounded-full bg-ink text-cream font-semibold hover:bg-ink-soft cursor-pointer"
              >
                Reject non-essential
              </button>
              <button
                type="button"
                onClick={() => choose(true)}
                className="h-11 px-5 rounded-full bg-ink text-cream font-semibold hover:bg-ink-soft cursor-pointer"
              >
                Accept all
              </button>
            </div>
          </div>
        </section>
      )}

      {showSettings && (
        <CookieSettings
          initialAnalytics={getConsent()?.analytics ?? false}
          gpc={gpc}
          onSave={choose}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}

function CookieSettings({
  initialAnalytics,
  gpc,
  onSave,
  onClose,
}: {
  initialAnalytics: boolean;
  gpc: boolean;
  onSave: (analytics: boolean) => void;
  onClose: () => void;
}) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 animate-fadeIn">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-settings-title"
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-cream text-ink rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-11 h-11 rounded-full text-muted hover:text-ink hover:bg-sand flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="cookie-settings-title" className="font-display text-[26px] font-medium leading-tight pr-10">Cookie settings</h2>
        <p className="mt-2 text-[15px] text-muted leading-relaxed">
          Choose what Afrolineo may store and measure. You can change this any time from “Cookie settings” at the bottom of the page.
        </p>

        <div className="mt-6 space-y-3">
          <CategoryCard
            title="Essential"
            description="Keeps you signed in and stores your family tree, stories and settings in this browser. The app can’t work without it."
            items={STORAGE_INVENTORY.essential}
            control={<span className="text-sm font-semibold text-forest whitespace-nowrap">Always on</span>}
          />
          <CategoryCard
            title="Analytics"
            description="Helps us understand which features people use so we can improve Afrolineo. Includes your account details and an outline of your tree, never your recordings, transcripts or notes."
            items={STORAGE_INVENTORY.analytics}
            control={
              <button
                type="button"
                role="switch"
                aria-checked={analytics}
                aria-label="Allow analytics"
                onClick={() => setAnalytics((v) => !v)}
                className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer shrink-0 ${analytics ? 'bg-forest' : 'bg-line-strong'}`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${analytics ? 'translate-x-5' : ''}`} />
              </button>
            }
          />
        </div>

        {gpc && (
          <p className="mt-4 text-[13px] text-muted">
            Your browser sends a Global Privacy Control signal, so analytics is off by default. Turning it on here overrides that for this site.
          </p>
        )}

        <div className="mt-4 rounded-2xl bg-sand/60 p-4 text-[13.5px] text-ink-soft leading-relaxed">
          <p className="font-semibold text-ink">Other services</p>
          <p className="mt-1">
            Fonts load from Google Fonts, which receives your IP address. If you use automatic transcription, that recording is sent to
            Google’s Gemini service to be transcribed and is not kept by Afrolineo. We don’t use advertising or social media cookies.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => onSave(analytics)}
            className="flex-1 h-12 rounded-full bg-ochre text-ink font-semibold hover:brightness-95 cursor-pointer"
          >
            Save choices
          </button>
          <button
            type="button"
            onClick={() => onSave(false)}
            className="flex-1 h-12 rounded-full border-[1.5px] border-[#CFC4B4] font-semibold hover:border-ink cursor-pointer"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={() => onSave(true)}
            className="flex-1 h-12 rounded-full border-[1.5px] border-[#CFC4B4] font-semibold hover:border-ink cursor-pointer"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({
  title,
  description,
  items,
  control,
}: {
  title: string;
  description: string;
  items: { name: string; purpose: string }[];
  control: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-line rounded-2xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-sans text-[15px] font-bold">{title}</h3>
          <p className="mt-1 text-sm text-muted leading-relaxed">{description}</p>
        </div>
        {control}
      </div>
      <details className="group mt-3">
        <summary className="list-none inline-flex items-center gap-1 text-sm font-semibold text-ochre-deep cursor-pointer">
          What’s stored
          <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <ul className="mt-2 space-y-2">
          {items.map((item) => (
            <li key={item.name} className="text-[13px]">
              <code className="font-mono text-[12px] text-ink break-all">{item.name}</code>
              <p className="text-muted">{item.purpose}</p>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
