import React, { useEffect, useRef, useState } from 'react';
import { OralHistory, Profile, ProfileRole } from '../types';
import { Plus, Minus, ChevronUp, ChevronDown } from 'lucide-react';

interface FamilyTreeProps {
  profiles: Profile[];
  recordings?: OralHistory[];
  selectedProfileId?: string;
  onSelectProfile: (profile: Profile) => void;
  onAddProfileWithRole: (role: ProfileRole) => void;
}

export type Side = 'paternal' | 'maternal' | 'self' | 'sibling' | 'extended';

export const SIDE_STYLES: Record<Side, string> = {
  paternal: 'bg-paternal-tint text-paternal-ink',
  maternal: 'bg-forest-tint text-forest',
  self: 'bg-ochre text-ink',
  sibling: 'bg-indigo-tint text-indigo',
  extended: 'bg-sand text-ink-soft',
};

export const ROLE_INFO: Record<ProfileRole, { label: string; addLabel: string; hint?: string; side: Side }> = {
  paternal_grandfather: { label: 'Grandfather', addLabel: 'Add grandfather', hint: 'Father’s side', side: 'paternal' },
  paternal_grandmother: { label: 'Grandmother', addLabel: 'Add grandmother', hint: 'Father’s side', side: 'paternal' },
  maternal_grandfather: { label: 'Grandfather', addLabel: 'Add grandfather', hint: 'Mother’s side', side: 'maternal' },
  maternal_grandmother: { label: 'Grandmother', addLabel: 'Add grandmother', hint: 'Mother’s side', side: 'maternal' },
  father: { label: 'Father', addLabel: 'Add father', side: 'paternal' },
  mother: { label: 'Mother', addLabel: 'Add mother', side: 'maternal' },
  self: { label: 'You', addLabel: 'Add yourself', side: 'self' },
  sibling: { label: 'Sibling', addLabel: 'Add sibling', side: 'sibling' },
  uncle: { label: 'Uncle', addLabel: 'Add uncle', side: 'extended' },
  aunt: { label: 'Aunt', addLabel: 'Add aunt', side: 'extended' },
};

export const initials = (name: string) =>
  name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase();

export const RELATION_PHRASE: Record<ProfileRole, string> = {
  self: 'You',
  father: 'Your father',
  mother: 'Your mother',
  paternal_grandfather: 'Your father’s father',
  paternal_grandmother: 'Your father’s mother',
  maternal_grandfather: 'Your mother’s father',
  maternal_grandmother: 'Your mother’s mother',
  sibling: 'Your sibling',
  uncle: 'Your uncle',
  aunt: 'Your aunt',
};

const storyLabel = (count: number) => (count === 1 ? '1 story' : `${count} stories`);

// Desktop canvas geometry (px, before zoom)
const CARD_W = 160;
const CARD_H = 84;
const BASE_W = 780;
const CANVAS_H = 570;
const ROW_Y = { grandparents: 44, parents: 254, children: 464 };
const ZOOM_STEPS = [0.6, 0.75, 0.9, 1, 1.15, 1.3];

export default function FamilyTree({
  profiles,
  recordings = [],
  selectedProfileId,
  onSelectProfile,
  onAddProfileWithRole,
}: FamilyTreeProps) {
  const byRole = (role: ProfileRole) => profiles.find((p) => p.role === role);
  const self = byRole('self');
  const father = byRole('father');
  const mother = byRole('mother');
  const pgf = byRole('paternal_grandfather');
  const pgm = byRole('paternal_grandmother');
  const mgf = byRole('maternal_grandfather');
  const mgm = byRole('maternal_grandmother');
  const siblings = profiles.filter((p) => p.role === 'sibling');
  const unclesAndAunts = profiles.filter((p) => p.role === 'uncle' || p.role === 'aunt');

  const storyCount = (p: Profile) => recordings.filter((r) => r.profileId === p.id).length;

  // ---------- Zoom (desktop) ----------
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null); // null = fit to width

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ---------- Desktop layout ----------
  const childCount = 1 + siblings.length + 1; // you + siblings + "add sibling"
  const childrenWidth = childCount * CARD_W + (childCount - 1) * 40;
  const canvasW = Math.max(BASE_W, childrenWidth + 40);
  const offset = (canvasW - BASE_W) / 2;

  const fitZoom = containerWidth ? Math.min(1, (containerWidth - 16) / canvasW) : 1;
  const scale = zoom ?? fitZoom;
  const zoomIn = () => setZoom(ZOOM_STEPS.find((z) => z > scale + 0.01) ?? scale);
  const zoomOut = () => setZoom([...ZOOM_STEPS].reverse().find((z) => z < scale - 0.01) ?? scale);

  const gp = { pgf: 20, pgm: 200, mgf: 420, mgm: 600 };
  const parentX = { father: 110, mother: 510 };
  const paternalCentre = offset + 190;
  const maternalCentre = offset + 590;
  const parentsCentre = offset + 390;
  const childrenStart = canvasW / 2 - childrenWidth / 2;
  const childX = (i: number) => childrenStart + i * (CARD_W + 40);
  const childCentres = [self, ...siblings].map((_, i) => childX(i) + CARD_W / 2);
  const barLeft = Math.min(parentsCentre, ...childCentres);
  const barRight = Math.max(parentsCentre, ...childCentres);

  const line = (style: React.CSSProperties, solid: boolean) => (
    <span
      aria-hidden="true"
      className={`absolute ${solid ? 'bg-line-strong' : 'border-line-strong border-dashed'}`}
      style={{
        ...style,
        ...(solid
          ? {}
          : style.width === 2
            ? { borderLeftWidth: 2, width: 0 }
            : { borderTopWidth: 2, height: 0 }),
      }}
    />
  );

  // ---------- Cards ----------
  const PersonCard = ({ profile, compact = false, style }: { profile: Profile; compact?: boolean; style?: React.CSSProperties }) => {
    const info = ROLE_INFO[profile.role];
    const count = storyCount(profile);
    const isSelf = profile.role === 'self';
    const isSelected = profile.id === selectedProfileId;
    return (
      <button
        type="button"
        id={`node-${profile.id}`}
        onClick={() => onSelectProfile(profile)}
        aria-label={`${profile.fullName}, ${info.label}${count ? `, ${storyLabel(count)}` : ''}`}
        aria-pressed={isSelected}
        style={style}
        className={`flex items-center gap-2 text-left rounded-[14px] px-2.5 cursor-pointer transition-all hover:-translate-y-0.5 focus-visible:-translate-y-0.5 ${
          compact ? 'h-[72px] w-full' : ''
        } ${
          isSelf
            ? 'bg-ink text-cream border border-ink hover:shadow-[0_8px_20px_-8px_rgba(31,27,23,0.6)]'
            : 'bg-white text-ink border border-line shadow-[0_2px_6px_rgba(60,40,15,0.06)] hover:border-ochre hover:shadow-[0_8px_20px_-10px_rgba(60,40,15,0.35)]'
        } ${isSelected ? 'ring-2 ring-ochre ring-offset-2 ring-offset-paper' : ''}`}
      >
        <span className={`shrink-0 w-9 h-9 rounded-full font-bold text-[12.5px] flex items-center justify-center ${SIDE_STYLES[info.side]}`}>
          {initials(profile.fullName)}
        </span>
        <span className="min-w-0 flex flex-col">
          <span className="font-semibold text-sm leading-tight line-clamp-2">{profile.fullName}</span>
          <span className={`mt-0.5 text-[12.5px] leading-tight ${isSelf ? 'text-[#CFC4B4]' : 'text-muted'}`}>
            {info.label}
            {count > 0 && <span className={`font-semibold ${isSelf ? 'text-ochre' : 'text-ochre-deep'}`}> · {storyLabel(count)}</span>}
          </span>
        </span>
      </button>
    );
  };

  const AddCard = ({ role, compact = false, style }: { role: ProfileRole; compact?: boolean; style?: React.CSSProperties }) => {
    const info = ROLE_INFO[role];
    return (
      <button
        type="button"
        id={`placeholder-add-${role}`}
        onClick={() => onAddProfileWithRole(role)}
        style={style}
        className={`flex items-center gap-2.5 text-left rounded-[14px] px-3 border-[1.5px] border-dashed border-line-strong text-muted hover:text-ink hover:border-ochre hover:bg-white/70 cursor-pointer transition-colors ${
          compact ? 'h-[72px] w-full' : ''
        }`}
      >
        <span className="shrink-0 w-10 h-10 rounded-full border-[1.5px] border-dashed border-line-strong flex items-center justify-center">
          <Plus className="w-[18px] h-[18px]" aria-hidden="true" />
        </span>
        <span className="flex flex-col">
          <span className="text-[13.5px] font-semibold leading-tight">{info.addLabel}</span>
          {info.hint && <span className="text-xs">{info.hint}</span>}
        </span>
      </button>
    );
  };

  const Slot = ({ profile, role, compact, style }: { profile?: Profile; role: ProfileRole; compact?: boolean; style?: React.CSSProperties }) =>
    profile ? PersonCard({ profile, compact, style }) : AddCard({ role, compact, style });

  const pos = (x: number, y: number): React.CSSProperties => ({ position: 'absolute', left: x, top: y, width: CARD_W, height: CARD_H });

  // ---------- Mobile state ----------
  const [showGrandparents, setShowGrandparents] = useState(false);
  const grandparentCount = [pgf, pgm, mgf, mgm].filter(Boolean).length;

  const GenerationLabel = ({ children, x, y }: { children: React.ReactNode; x: number; y: number }) => (
    <span className="absolute text-[12.5px] font-bold tracking-[0.06em] uppercase text-[#6B6157]" style={{ left: x, top: y }}>
      {children}
    </span>
  );

  return (
    <div className="space-y-5">
      {/* ===== Desktop / tablet: connected tree ===== */}
      <section
        aria-label="Family tree"
        className="hidden md:block bg-paper border border-line rounded-[20px] bg-[radial-gradient(#E3D9CA_1px,transparent_1px)] bg-size-[22px_22px]"
      >
        <div ref={scrollerRef} id="family-tree-scroller" className="overflow-auto py-2">
          <div className="mx-auto" style={{ width: canvasW * scale, height: CANVAS_H * scale }}>
            <div className="relative origin-top-left" style={{ width: canvasW, height: CANVAS_H, transform: `scale(${scale})` }}>
              <GenerationLabel x={offset + 20} y={14}>Grandparents</GenerationLabel>
              <GenerationLabel x={offset + 20} y={224}>Parents</GenerationLabel>
              <GenerationLabel x={Math.min(offset + 20, childrenStart)} y={434}>You &amp; siblings</GenerationLabel>

              {/* Connectors: grandparents → parents */}
              {line({ left: offset + 180, top: 85, width: 20, height: 2 }, !!(pgf && pgm))}
              {line({ left: paternalCentre - 1, top: 85, width: 2, height: 169 }, !!((pgf || pgm) && father))}
              {line({ left: offset + 580, top: 85, width: 20, height: 2 }, !!(mgf && mgm))}
              {line({ left: maternalCentre - 1, top: 85, width: 2, height: 169 }, !!((mgf || mgm) && mother))}

              {/* Connectors: parents → children */}
              {line({ left: offset + 270, top: 295, width: 240, height: 2 }, !!(father && mother))}
              {line({ left: parentsCentre - 1, top: 295, width: 2, height: 130 }, !!((father || mother) && self))}
              {line({ left: barLeft - 1, top: 424, width: barRight - barLeft + 2, height: 2 }, !!self)}
              {childCentres.map((cx, i) => (
                <React.Fragment key={cx}>{line({ left: cx - 1, top: 424, width: 2, height: 40 }, i === 0 ? !!self : true)}</React.Fragment>
              ))}

              {/* People */}
              {Slot({ profile: pgf, role: "paternal_grandfather", style: pos(offset + gp.pgf, ROW_Y.grandparents) })}
              {Slot({ profile: pgm, role: "paternal_grandmother", style: pos(offset + gp.pgm, ROW_Y.grandparents) })}
              {Slot({ profile: mgf, role: "maternal_grandfather", style: pos(offset + gp.mgf, ROW_Y.grandparents) })}
              {Slot({ profile: mgm, role: "maternal_grandmother", style: pos(offset + gp.mgm, ROW_Y.grandparents) })}
              {Slot({ profile: father, role: "father", style: pos(offset + parentX.father, ROW_Y.parents) })}
              {Slot({ profile: mother, role: "mother", style: pos(offset + parentX.mother, ROW_Y.parents) })}
              {Slot({ profile: self, role: "self", style: pos(childX(0), ROW_Y.children) })}
              {siblings.map((s, i) => (
                <React.Fragment key={s.id}>{PersonCard({ profile: s, style: pos(childX(i + 1), ROW_Y.children) })}</React.Fragment>
              ))}
              {AddCard({ role: "sibling", style: pos(childX(siblings.length + 1), ROW_Y.children) })}
            </div>
          </div>
        </div>

        {/* Legend + zoom */}
        <div className="flex flex-wrap justify-between items-center gap-3 px-4 pb-4">
          <div className="flex flex-wrap gap-4 text-[13px] text-muted">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-paternal-tint border border-[#D9B98A]" />Father’s side</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-forest-tint border border-[#9DBBA6]" />Mother’s side</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-tint border border-[#AEB4CF]" />Siblings</span>
          </div>
          <div className="flex items-center bg-white border border-line rounded-xl overflow-hidden">
            <button type="button" onClick={zoomOut} aria-label="Zoom out" className="w-11 h-11 flex items-center justify-center hover:bg-sand cursor-pointer">
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="text-[13px] font-semibold w-13 text-center text-ink-soft" aria-live="polite">{Math.round(scale * 100)}%</span>
            <button type="button" onClick={zoomIn} aria-label="Zoom in" className="w-11 h-11 flex items-center justify-center hover:bg-sand cursor-pointer">
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setZoom(null)} className="h-11 px-3.5 border-l border-line text-[13.5px] font-semibold hover:bg-sand cursor-pointer">
              Fit
            </button>
          </div>
        </div>
      </section>

      {/* ===== Phone: one family at a time ===== */}
      <section aria-label="Family tree" className="md:hidden flex flex-col items-center">
        <button
          type="button"
          onClick={() => setShowGrandparents((v) => !v)}
          aria-expanded={showGrandparents}
          className="w-full h-13 flex items-center gap-2.5 px-4 border-[1.5px] border-dashed border-line-strong rounded-[14px] text-ink-soft cursor-pointer"
        >
          {showGrandparents ? <ChevronDown className="w-[18px] h-[18px]" aria-hidden="true" /> : <ChevronUp className="w-[18px] h-[18px]" aria-hidden="true" />}
          <span className="font-semibold">Grandparents</span>
          <span className="ml-auto text-[13.5px] text-muted">{grandparentCount} of 4 added</span>
        </button>
        {showGrandparents && (
          <div className="w-full grid grid-cols-2 gap-3 mt-3">
            {Slot({ profile: pgf, role: "paternal_grandfather", compact: true })}
            {Slot({ profile: pgm, role: "paternal_grandmother", compact: true })}
            {Slot({ profile: mgf, role: "maternal_grandfather", compact: true })}
            {Slot({ profile: mgm, role: "maternal_grandmother", compact: true })}
          </div>
        )}
        <span aria-hidden="true" className="w-0.5 h-4.5 bg-line-strong" />
        <div className="w-full grid grid-cols-2 gap-3">
          {Slot({ profile: father, role: "father", compact: true })}
          {Slot({ profile: mother, role: "mother", compact: true })}
        </div>
        <span aria-hidden="true" className="w-0.5 h-5.5 bg-line-strong" />
        {self ? (
          <button
            type="button"
            onClick={() => onSelectProfile(self)}
            className="w-full flex items-center gap-3.5 p-4 bg-ink text-cream rounded-[18px] text-left cursor-pointer"
          >
            <span className="shrink-0 w-13 h-13 rounded-full bg-ochre text-ink font-bold flex items-center justify-center">{initials(self.fullName)}</span>
            <span className="min-w-0 flex flex-col">
              <span className="font-display text-xl leading-tight truncate">{self.fullName}</span>
              <span className="text-[13.5px] text-[#CFC4B4]">
                You{self.lga && self.lga !== 'Unspecified' ? ` · ${self.lga}` : ''}{self.language ? ` · ${self.language}` : ''}
              </span>
            </span>
          </button>
        ) : (
          AddCard({ role: 'self', compact: true })
        )}

        <div className="w-full mt-6">
          <h3 className="mb-2.5 font-sans text-[13px] font-bold tracking-[0.06em] uppercase text-[#6B6157]">Siblings</h3>
          <div className="grid grid-cols-2 gap-3">
            {siblings.map((s) => (
              <React.Fragment key={s.id}>{PersonCard({ profile: s, compact: true })}</React.Fragment>
            ))}
            {AddCard({ role: "sibling", compact: true })}
          </div>
        </div>
      </section>

      {/* ===== Uncles & aunts (both layouts) ===== */}
      <section aria-labelledby="extended-family-heading" className="bg-white border border-line rounded-[20px] p-5">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div>
            <h3 id="extended-family-heading" className="font-sans text-base font-bold">Uncles &amp; aunts</h3>
            <p className="text-sm text-muted">Your parents’ brothers and sisters.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              id="add-uncle-lateral-btn"
              onClick={() => onAddProfileWithRole('uncle')}
              className="h-11 px-4 inline-flex items-center gap-1.5 border-[1.5px] border-line rounded-xl font-semibold text-sm hover:border-ochre cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> Uncle
            </button>
            <button
              type="button"
              id="add-aunt-lateral-btn"
              onClick={() => onAddProfileWithRole('aunt')}
              className="h-11 px-4 inline-flex items-center gap-1.5 border-[1.5px] border-line rounded-xl font-semibold text-sm hover:border-ochre cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> Aunt
            </button>
          </div>
        </div>
        {unclesAndAunts.length === 0 ? (
          <p className="text-sm text-muted">No uncles or aunts added yet.</p>
        ) : (
          <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
            {unclesAndAunts.map((p) => (
              <React.Fragment key={p.id}>{PersonCard({ profile: p, compact: true })}</React.Fragment>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
