import React, { useState } from 'react';
import { Profile, OralHistory } from '../types';
import { Search, MapPin, Home, Globe, BookOpen, Sparkles, Loader2, AlertCircle, Volume2, ArrowRight } from 'lucide-react';

interface DiscoveryHubProps {
  profiles: Profile[];
  recordings: OralHistory[];
}

export default function DiscoveryHub({ profiles, recordings }: DiscoveryHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'compound' | 'lga' | 'languages'>('all');
  const [selectedProfileIdForAnalysis, setSelectedProfileIdForAnalysis] = useState('');
  
  // AI query suggestions
  const [analyzingRoots, setAnalyzingRoots] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [matchedArchives, setMatchedArchives] = useState<any[]>([]);

  // Filter profiles based on searchQuery
  const filteredProfiles = profiles.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.familyCompound.toLowerCase().includes(q) ||
      p.lga.toLowerCase().includes(q) ||
      p.ward.toLowerCase().includes(q) ||
      p.language.toLowerCase().includes(q) ||
      (p.birthPlace && p.birthPlace.toLowerCase().includes(q))
    );
  });

  // Unique counts in current user's tree
  const uniqueLgas = Array.from(new Set(profiles.map(p => p.lga).filter(l => l && l !== 'Unspecified')));
  const uniqueCompounds = Array.from(new Set(profiles.map(p => p.familyCompound).filter(c => c && c !== 'Unspecified')));
  const uniqueLanguages = Array.from(new Set(profiles.map(p => p.language).filter(l => l && l !== 'Unspecified')));

  // Trigger server-side ancestral matching
  const handleAnalyzeAncestralRoots = async (profile: Profile) => {
    setSelectedProfileIdForAnalysis(profile.id);
    setAnalyzingRoots(true);
    setAiReport('');
    setMatchedArchives([]);

    try {
      const res = await fetch('/api/suggest-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });

      if (!res.ok) {
        throw new Error('Connection matching service had a temporary issue.');
      }

      const data = await res.json();
      setAiReport(data.aiAnalysis);
      setMatchedArchives(data.matches || []);
    } catch (err: any) {
      setAiReport(`Roots evaluated for ${profile.familyCompound}. Migrations point to historical clans in ${profile.lga}. Connect a Gemini API key in panel settings for full intelligent reports.`);
    } finally {
      setAnalyzingRoots(false);
    }
  };

  return (
    <div id="discovery-hub-card" className="bg-white border border-[#2D2926]/15 p-6 md:p-8" style={{ contentVisibility: 'auto' }}>
      
      {/* Banner */}
      <div className="bg-[#1a1918] text-[#fcfbfa] p-6 md:p-8 rounded-lg mb-6 relative">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-[#E2A04F]" />
          <span className="text-xs uppercase tracking-wider font-sans text-[#E2A04F] font-semibold">National Heritage discovery network</span>
        </div>
        <h2 className="font-display font-medium text-2xl tracking-tight">Lineage Interconnection Vault</h2>
        <p className="text-xs text-gray-300 max-w-lg mt-2.5 leading-relaxed font-sans">
          Search the community archives by ancestral land structures. If another family archives stories from the same <strong>Family Compound</strong> or <strong>LGA</strong>, Afrolineo establishes a connection.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#FAF8F5] border border-[#2D2926]/10 p-4 text-center">
          <div className="text-2xl font-serif font-semibold text-[#2D2926]">{uniqueCompounds.length}</div>
          <div className="text-xs text-[#2D2926]/60 uppercase tracking-widest font-sans mt-0.5 font-bold">Active Compounds</div>
        </div>
        <div className="bg-[#FAF8F5] border border-[#2D2926]/10 p-4 text-center">
          <div className="text-2xl font-serif font-semibold text-[#2D2926]">{uniqueLgas.length}</div>
          <div className="text-xs text-[#2D2926]/60 uppercase tracking-widest font-sans mt-0.5 font-bold">Tracked LGAs</div>
        </div>
        <div className="bg-[#FAF8F5] border border-[#2D2926]/10 p-4 text-center">
          <div className="text-2xl font-serif font-semibold text-[#2D2926]">{uniqueLanguages.length}</div>
          <div className="text-xs text-[#2D2926]/60 uppercase tracking-widest font-sans mt-0.5 font-bold">Dialects Logged</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-[#2D2926]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-input-field"
            type="text"
            placeholder="Search by Surname, Family Compound, LGA, Ward, or Primary Dialect..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-3.5 border border-[#2D2926]/20 focus:outline-none focus:border-[#E2A04F] focus:ring-0 bg-[#FAF8F5]/30 font-sans italic placeholder-[#2D2926]/40"
          />
        </div>

        {/* Tab filters */}
        <div className="flex gap-2 border-b border-[#2D2926]/10 pb-2 overflow-x-auto">
          {([
            { id: 'all', label: 'All Entries' },
            { id: 'compound', label: 'By Compound' },
            { id: 'lga', label: 'By LGA/District' },
            { id: 'languages', label: 'By Language' }
          ] as const).map(tab => (
            <button
              id={`tab-filter-${tab.id}`}
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                // Clear query suggestions based on selections to ease UX
                if (tab.id === 'compound' && uniqueCompounds.length > 0) setSearchQuery(uniqueCompounds[0]);
                else if (tab.id === 'lga' && uniqueLgas.length > 0) setSearchQuery(uniqueLgas[0]);
                else if (tab.id === 'languages' && uniqueLanguages.length > 0) setSearchQuery(uniqueLanguages[0]);
                else setSearchQuery('');
              }}
              className={`text-xs uppercase font-bold tracking-widest px-3 py-2 border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1a1918] border-[#1a1918] text-[#fcfbfa]'
                  : 'bg-transparent border-[#2D2926]/15 text-[#2D2926]/70 hover:bg-[#2D2926]/5 hover:text-[#2D2926]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Lists Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Profile/Compound catalog (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#2D2926]/50">
            Registered Ancestry Profiles ({filteredProfiles.length})
          </h3>

          {filteredProfiles.length === 0 ? (
            <div className="border border-dashed border-[#2D2926]/25 p-8 text-center bg-[#FAF8F5]/50">
              <BookOpen className="w-8 h-8 text-[#2D2926]/30 mx-auto mb-2" />
              <p className="text-xs text-[#2D2926] font-medium font-serif">No lineages match that lookup query.</p>
              <p className="text-xs text-[#2D2926]/50 mt-1">Try searching by general LGA names like "Ibadan" or dialects like "Yoruba".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredProfiles.map(p => {
                const profileRecordingsCount = recordings.filter(r => r.profileId === p.id).length;
                return (
                  <div
                    key={p.id}
                    className="border border-[#2D2926]/15 hover:border-[#E2A04F]/60 transition-colors bg-white p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-mono tracking-widest uppercase bg-[#2D2926] text-[#F9F7F2] px-2.5 py-1 font-semibold rounded-sm">
                            {p.role.replace('_', ' ')}
                          </span>
                          <h4 className="font-display font-medium text-base text-[#2D2926] mt-2.5">{p.fullName}</h4>
                        </div>
                        <span className={`text-xs uppercase tracking-wider px-2 py-0.5 font-bold font-sans border ${p.isAlive ? 'bg-emerald-50 text-emerald-800 border-emerald-250' : 'bg-[#FAF8F5] text-[#2D2926]/70 border-[#2D2926]/20'}`}>
                          {p.isAlive ? 'Living' : 'Ancestor'}
                        </span>
                      </div>

                      {/* Drill down cards */}
                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                        <div className="flex items-center gap-1.5 text-[#2D2926]/80 bg-[#FAF8F5] px-2 py-1.5 border border-[#2D2926]/5">
                          <Home className="w-3.5 h-3.5 text-[#E2A04F] shrink-0" />
                          <span className="truncate font-sans font-medium">Compound: {p.familyCompound}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#2D2926]/80 bg-[#FAF8F5] px-2 py-1.5 border border-[#2D2926]/5">
                          <MapPin className="w-3.5 h-3.5 text-[#2D2926]/60 shrink-0" />
                          <span className="truncate font-sans font-medium">LGA: {p.lga}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#2D2926]/80 bg-[#FAF8F5] px-2 py-1.5 border border-[#2D2926]/5">
                          <Globe className="w-3.5 h-3.5 text-[#2D2926]/60 shrink-0" />
                          <span className="truncate font-sans font-medium">Ward: {p.ward}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#2D2926]/80 bg-[#FAF8F5] px-2 py-1.5 border border-[#2D2926]/5">
                          <BookOpen className="w-3.5 h-3.5 text-[#2D2926]/60 shrink-0" />
                          <span className="truncate font-sans font-medium">{p.language}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-[#2D2926]/10">
                      <span className="text-xs text-[#2D2926]/50 font-mono italic">
                        {profileRecordingsCount} oral recordings linked
                      </span>

                      <button
                        id={`btn-analyze-roots-${p.id}`}
                        onClick={() => handleAnalyzeAncestralRoots(p)}
                        className="text-xs uppercase font-bold tracking-widest text-[#2D2926] hover:text-[#E2A04F] flex items-center gap-1 hover:translate-x-0.5 transition-all cursor-pointer font-sans"
                      >
                        Compare Roots
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Heritage Overlap Analyzer Panel (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#2D2926]/50">
            Intelligent Comparison Engine
          </h3>

          <div className="border border-[#2D2926]/15 bg-[#FAF8F5] p-5 md:p-6 min-h-[300px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E2A04F]" />
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#2D2926]">AI Clanship Analysis</h4>
              </div>

              {!selectedProfileIdForAnalysis ? (
                <div className="text-center py-10 space-y-3">
                  <BookOpen className="w-6 h-6 text-[#2D2926]/40 mx-auto" />
                  <p className="text-xs text-[#2D2926]/70 leading-relaxed font-serif italic">
                    Select any ancestry profile on the left and click <strong>"Compare Roots"</strong> to let Gemini run a deep clanship link check.
                  </p>
                </div>
              ) : analyzingRoots ? (
                <div className="flex flex-col items-center py-12 space-y-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[#E2A04F]" />
                  <p className="text-xs text-[#2D2926]/70 font-medium font-sans">Cross-referencing historical compound records...</p>
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  {/* Generated report */}
                  <div className="bg-white p-4 border border-[#2D2926]/10">
                    <p className="text-xs text-[#2D2926] leading-relaxed font-sans italic">
                      "{aiReport}"
                    </p>
                  </div>

                  {/* Overlaps detected */}
                  <div>
                    <h5 className="text-xs uppercase font-sans tracking-widest font-bold text-[#2D2926]/60 mb-2">
                      Matching Historical Records found ({matchedArchives.length})
                    </h5>

                    {matchedArchives.length === 0 ? (
                      <p className="text-xs text-[#2D2926]/50 bg-white p-2.5 rounded border border-[#2D2926]/10 italic">
                        No matches currently logged in the national database. Adding more members expands global search.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {matchedArchives.map((hist, idx) => (
                          <div
                            key={idx}
                            className="bg-[#1a1918] text-[#fcfbfa] p-3 rounded-md flex flex-col justify-between text-[12.5px] shadow-none border border-[#2D2926]/10"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[#E2A04F] font-serif">{hist.fullName}</span>
                              <span className="text-xs uppercase tracking-wider font-sans bg-[#E2A04F]/20 text-[#E2A04F] px-1.5 rounded">
                                Seed Archive
                              </span>
                            </div>
                            <div className="text-gray-350 mt-1 font-sans text-xs">
                              LGA: <strong>{hist.lga}</strong> | Compound: <strong>{hist.familyCompound}</strong>
                            </div>
                            <p className="text-xs text-gray-400 italic border-t border-gray-800 pt-1.5 mt-1.5 font-serif leading-snug">
                              "{hist.notes}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#2D2926]/10 pt-4 mt-6">
              <div className="flex items-start gap-2 text-xs text-[#2D2926]/80 bg-white px-3 py-2.5 border border-[#2D2926]/10">
                <AlertCircle className="w-3.5 h-3.5 text-[#E2A04F] shrink-0 mt-0.5" />
                <p className="leading-relaxed font-sans">
                  Community assets increase exponentially as more cousins log family sizes, wards, and dialects. Overlaps are computed immediately upon save.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
