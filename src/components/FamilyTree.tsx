import React from 'react';
import { Profile, ProfileRole } from '../types';
import { Plus, Mic, Heart, HelpCircle, ArrowUpRight, ShieldAlert, Sparkles, Smile } from 'lucide-react';

interface FamilyTreeProps {
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
  onAddProfileWithRole: (role: ProfileRole) => void;
}

export default function FamilyTree({ profiles, onSelectProfile, onAddProfileWithRole }: FamilyTreeProps) {
  
  // Find profiles by standard roles
  const selfProfile = profiles.find(p => p.role === 'self');
  const fatherProfile = profiles.find(p => p.role === 'father');
  const motherProfile = profiles.find(p => p.role === 'mother');
  
  const paternalGrandfather = profiles.find(p => p.role === 'paternal_grandfather');
  const paternalGrandmother = profiles.find(p => p.role === 'paternal_grandmother');
  
  const maternalGrandfather = profiles.find(p => p.role === 'maternal_grandfather');
  const maternalGrandmother = profiles.find(p => p.role === 'maternal_grandmother');

  const siblingsList = profiles.filter(p => p.role === 'sibling');
  const extendedUncles = profiles.filter(p => p.role === 'uncle');
  const extendedAunts = profiles.filter(p => p.role === 'aunt');

  // Generic Node Renderer
  const renderNode = (
    profile: Profile | undefined,
    placeholderRole: ProfileRole,
    label: string,
    gender: 'Male' | 'Female'
  ) => {
    // Check if the current role should use the orb-like interactive selection design
    const isOrbRole = [
      'paternal_grandfather',
      'paternal_grandmother',
      'maternal_grandfather',
      'maternal_grandmother',
      'father',
      'mother',
      'self'
    ].includes(placeholderRole);

    if (profile) {
      if (isOrbRole) {
        return (
          <div
            id={`node-${profile.id}`}
            onClick={() => onSelectProfile(profile)}
            className="group relative flex flex-col items-center justify-center text-center cursor-pointer select-none mx-auto w-[164px] h-[164px] focus:outline-none transition-all duration-300 transform hover:-translate-y-1.5"
            style={{ contentVisibility: 'auto' }}
          >
            {/* Multi-layered Animated Orbs / Rings */}
            <div className="absolute inset-0 rounded-full border border-[#2D2926]/12 group-hover:border-[#E2A04F]/60 transition-colors duration-500 pointer-events-none" />
            
            {/* Spinning/pulsating accent vector ring */}
            <div className="absolute inset-1.5 rounded-full border border-dashed border-[#2D2926]/5 group-hover:border-[#E2A04F]/40 group-hover:rotate-12 transition-all duration-750 pointer-events-none" />
            
            {/* Active glowing core selection orb */}
            <div className="absolute inset-3 rounded-full bg-white border border-[#2D2926]/20 group-hover:border-[#E2A04F] group-hover:shadow-[0_0_20px_rgba(226,160,79,0.15)] transition-all duration-300 flex flex-col items-center justify-center p-3.5" />

            {/* Content within the orb core */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
              {/* Top active heartbeat indicator bead */}
              <div className="absolute top-6 flex items-center justify-center">
                {profile.isAlive ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E2A04F] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E2A04F]"></span>
                  </span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-[#2D2926]/40"></span>
                )}
              </div>

              {/* Central high-density monogram avatar */}
              <div className={`mt-3 w-10 h-10 rounded-full ${profile.avatarColor} flex items-center justify-center text-[10px] font-sans font-bold tracking-wider text-[#2D2926] shadow-sm border border-[#2D2926]/5 transition-transform duration-300 group-hover:scale-105`}>
                {profile.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>

              {/* Full person name - vintage styled, high-quality serif typography */}
              <h4 className="font-serif font-bold text-[11px] text-[#2D2926] max-w-[110px] truncate leading-tight mt-1.5 group-hover:text-[#E2A04F] transition-colors">
                {profile.fullName}
              </h4>

              {/* Label - tiny upper text */}
              <p className="text-[7.5px] text-[#2D2926]/55 font-sans font-bold uppercase tracking-[0.22em] mt-0.5 whitespace-nowrap">
                {label}
              </p>

              {/* Quick short geographical lineage / primary dialect */}
              <div className="text-[8px] text-[#2D2926]/40 font-mono italic mt-0.5 truncate max-w-[100px]">
                {profile.familyCompound !== 'Unspecified' ? profile.familyCompound : 'No Compound'}
              </div>

              {/* Highlight badge at bottom */}
              <span className="text-[7.5px] bg-[#2D2926] text-[#F9F7F2] px-2 py-0.5 rounded-full font-serif font-medium scale-90 mt-1.5 transition-colors group-hover:bg-[#E2A04F] group-hover:text-black">
                {profile.language.slice(0, 8)}
              </span>
            </div>
          </div>
        );
      } else {
        // Fallback for custom nodes that aren't orb-rendered
        return (
          <div
            id={`node-${profile.id}`}
            onClick={() => onSelectProfile(profile)}
            className="bg-white border border-[#2D2926]/30 hover:border-[#E2A04F]/90 rounded-lg p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer text-center relative max-w-[172px] w-full mx-auto transform hover:-translate-y-0.5 animate-fadeIn group"
            style={{ contentVisibility: 'auto' }}
          >
            {/* Avatar Color indicator */}
            <div className="absolute top-1 right-2 flex gap-1">
              {profile.isAlive ? (
                <span className="w-1.5 h-1.5 bg-[#E2A04F] rounded-full animate-ping" />
              ) : (
                <span className="w-1.5 h-1.5 bg-[#2D2926]/40 rounded-full" />
              )}
            </div>

            <div className={`w-9 h-9 rounded-full ${profile.avatarColor} flex items-center justify-center mx-auto mb-2 text-xs font-bold font-mono shadow-sm border border-[#2D2926]/5`}>
              {profile.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>

            <h4 className="font-display font-medium text-xs text-[#2D2926] truncate leading-tight group-hover:text-[#E2A04F] transition-colors">
              {profile.fullName}
            </h4>
            <p className="text-[9px] text-[#2D2926]/50 uppercase tracking-[0.15em] font-sans mt-1 font-semibold">
              {label}
            </p>
            <div className="text-[8px] text-[#2D2926]/40 font-mono mt-1 whitespace-nowrap overflow-hidden text-ellipsis italic">
              {profile.familyCompound !== 'Unspecified' ? profile.familyCompound : 'No Compound Added'}
            </div>

            {/* Quick micro indicator */}
            <div className="mt-2.5 flex items-center justify-center gap-1">
              <span className="text-[8px] bg-[#2D2926] text-[#F9F7F2] px-2 py-0.5 rounded-full font-serif font-medium">
                {profile.language.slice(0, 8)}
              </span>
              <span className="text-[8px] bg-[#E2A04F]/10 text-[#2D2926] border border-[#E2A04F]/20 px-1.5 py-0.5 rounded-full font-sans font-semibold">
                {profile.lga.slice(0, 7)}
              </span>
            </div>
          </div>
        );
      }
    }

    if (isOrbRole) {
      return (
        <button
          id={`placeholder-add-${placeholderRole}`}
          onClick={() => onAddProfileWithRole(placeholderRole)}
          className="group relative flex flex-col items-center justify-center text-center cursor-pointer select-none mx-auto w-[164px] h-[164px] rounded-full focus:outline-none transition-all duration-300 transform hover:-translate-y-1"
        >
          {/* Outer dashed ring decoration (spin on hover) */}
          <div className="absolute inset-0 rounded-full border border-dashed border-[#2D2926]/12 group-hover:border-[#E2A04F]/60 group-hover:rotate-45 transition-all duration-750 pointer-events-none" />
          
          {/* Inner ring */}
          <div className="absolute inset-2 rounded-full border border-dashed border-[#2D2926]/5 group-hover:border-[#E2A04F]/40 pointer-events-none" />

          {/* Active core placeholder circle */}
          <div className="absolute inset-4 rounded-full bg-[#FAF8F5]/30 hover:bg-white border border-dashed border-[#2D2926]/20 group-hover:border-[#E2A04F] transition-all duration-300 flex flex-col items-center justify-center p-4 shadow-sm" />

          {/* Core interface tools */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border border-dashed border-[#2D2926]/20 flex items-center justify-center mx-auto mb-2 group-hover:bg-[#E2A04F]/15 group-hover:border-[#E2A04F] text-[#2D2926]/40 transition-all duration-300">
              <Plus className="w-3.5 h-3.5 text-[#2D2926]/50 group-hover:text-[#2D2926] transition-transform group-hover:rotate-90 duration-300" />
            </div>
            <span className="text-[9px] font-bold text-[#2D2926]/60 group-hover:text-[#2D2926] transition-colors uppercase tracking-[0.16em] font-sans px-2 leading-tight">
              Add {label}
            </span>
            <span className="text-[7.5px] text-[#2D2926]/40 font-serif italic mt-0.5 tracking-wide">
              Empty Pedigree
            </span>
          </div>
        </button>
      );
    }

    return (
      <button
        id={`placeholder-add-${placeholderRole}`}
        onClick={() => onAddProfileWithRole(placeholderRole)}
        className="border border-dashed border-[#2D2926]/20 hover:border-[#E2A04F] rounded-lg p-4 flex flex-col items-center justify-center bg-white/45 hover:bg-white transition-all cursor-pointer text-center max-w-[172px] w-full min-h-[110px] mx-auto group"
      >
        <div className={`w-8 h-8 rounded-full border border-dashed border-[#2D2926]/20 flex items-center justify-center mx-auto mb-1.5 group-hover:bg-[#E2A04F]/15 group-hover:border-[#E2A04F] text-[#2D2926]/40 transition-all`}>
          <Plus className="w-3.5 h-3.5 text-[#2D2926]/50 group-hover:text-[#2D2926] transition-transform group-hover:rotate-90" />
        </div>
        <span className="text-[10px] font-semibold text-[#2D2926]/70 group-hover:text-[#2D2926] transition-colors uppercase tracking-wider font-sans">
          Add {label}
        </span>
        <span className="text-[8px] text-[#2D2926]/40 font-serif italic mt-0.5">Empty Pedigree</span>
      </button>
    );
  };

  return (
    <div id="family-tree-scroller" className="overflow-x-auto pb-4 pt-1 select-none">
      <div className="min-w-[840px] max-w-5xl mx-auto flex flex-col space-y-12 relative p-6 bg-white/50 border border-[#2D2926]/10 rounded-xl">
        
        {/* Step-1: Grandparents Row */}
        <div className="grid grid-cols-4 gap-4 relative">
          <div className="text-center">
            {renderNode(paternalGrandfather, 'paternal_grandfather', 'Pat. Grandfather', 'Male')}
          </div>
          <div className="text-center">
            {renderNode(paternalGrandmother, 'paternal_grandmother', 'Pat. Grandmother', 'Female')}
          </div>
          <div className="text-center">
            {renderNode(maternalGrandfather, 'maternal_grandfather', 'Mat. Grandfather', 'Male')}
          </div>
          <div className="text-center">
            {renderNode(maternalGrandmother, 'maternal_grandmother', 'Mat. Grandmother', 'Female')}
          </div>
          {/* Connector bridges lines */}
          <div className="absolute left-[12%] right-[12%] top-1/2 -translate-y-1/2 h-[1px] bg-[#2D2926]/10 -z-10" />
        </div>

        {/* Step-2: Parents Row */}
        <div className="grid grid-cols-2 gap-12 relative max-w-[540px] mx-auto">
          <div className="text-center flex justify-center">
            {renderNode(fatherProfile, 'father', 'Father', 'Male')}
          </div>
          <div className="text-center flex justify-center">
            {renderNode(motherProfile, 'mother', 'Mother', 'Female')}
          </div>
          {/* Connector bridges lines */}
          <div className="absolute left-[25%] right-[25%] top-1/2 -translate-y-1/2 h-[1px] bg-[#2D2926]/10 -z-10" />
        </div>

        {/* Step-3: Anchor Self Anchor */}
        <div className="flex justify-center relative">
          <div className="text-center">
            {renderNode(selfProfile, 'self', 'Self (Anchor Point)', 'Male')}
          </div>
        </div>

        {/* Dynamic Expanded Lateral Rails (Siblings & Uncles/Aunts deck list bar) */}
        <div className="border-t border-[#2D2926]/10 pt-6 mt-4">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Smile className="w-4 h-4 text-[#E2A04F]" />
            <h4 className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-[#2D2926]/50">
              Extended Lateral Lineages (First Degree)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Siblings */}
            <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#2D2926]/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-sans uppercase tracking-widest font-bold text-[#2D2926]/70">Siblings Lineage</span>
                <button
                  id="add-sibling-lateral-btn"
                  onClick={() => onAddProfileWithRole('sibling')}
                  className="text-[9px] uppercase tracking-wider bg-white border border-[#2D2926]/20 hover:border-[#E2A04F] px-2.5 py-1 rounded flex items-center gap-1 font-bold text-[#2D2926] hover:text-[#E2A04F] transition-colors cursor-pointer font-sans"
                >
                  <Plus className="w-3 h-3" />
                  Add Sibling
                </button>
              </div>

              {siblingsList.length === 0 ? (
                <p className="text-[10px] text-[#2D2926]/40 italic py-2">No lateral siblings added.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {siblingsList.map(s => (
                    <div
                      key={s.id}
                      onClick={() => onSelectProfile(s)}
                      className="bg-white border border-[#2D2926]/15 hover:border-[#E2A04F] rounded transition-all p-2 flex items-center gap-2 cursor-pointer shadow-none max-w-[180px]"
                    >
                      <div className={`w-5 h-5 rounded-full ${s.avatarColor} text-[8px] font-bold flex items-center justify-center shrink-0 font-mono border border-[#2D2926]/5`}>
                        {s.fullName[0].toUpperCase()}
                      </div>
                      <div className="truncate text-[10px] font-medium text-[#2D2926] max-w-[124px]">{s.fullName}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aunts / Uncles */}
            <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#2D2926]/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-sans uppercase tracking-widest font-bold text-[#2D2926]/70">Uncles & Aunts</span>
                <div className="flex gap-1.5">
                  <button
                    id="add-uncle-lateral-btn"
                    onClick={() => onAddProfileWithRole('uncle')}
                    className="text-[9px] uppercase tracking-wider bg-white border border-[#2D2926]/20 hover:border-[#E2A04F] px-2 py-1 rounded flex items-center gap-0.5 font-bold text-[#2D2926] hover:text-[#E2A04F] transition-colors cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    + Uncle
                  </button>
                  <button
                    id="add-aunt-lateral-btn"
                    onClick={() => onAddProfileWithRole('aunt')}
                    className="text-[9px] uppercase tracking-wider bg-white border border-[#2D2926]/20 hover:border-[#E2A04F] px-2 py-1 rounded flex items-center gap-0.5 font-bold text-[#2D2926] hover:text-[#E2A04F] transition-colors cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    + Aunt
                  </button>
                </div>
              </div>

              {extendedUncles.length === 0 && extendedAunts.length === 0 ? (
                <p className="text-[10px] text-[#2D2926]/40 italic py-2">No uncles or aunts added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {[...extendedUncles, ...extendedAunts].map(u => (
                    <div
                      key={u.id}
                      onClick={() => onSelectProfile(u)}
                      className="bg-white border border-[#2D2926]/15 hover:border-[#E2A04F] rounded transition-all p-2 flex items-center gap-2 cursor-pointer shadow-none max-w-[180px]"
                    >
                      <div className={`w-5 h-5 rounded-full ${u.avatarColor} text-[8px] font-bold flex items-center justify-center shrink-0 font-mono border border-[#2D2926]/5`}>
                        {u.role[0].toUpperCase()}
                      </div>
                      <div className="truncate text-[10px] font-medium text-[#2D2926] max-w-[124px]">{u.fullName}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
