import React, { useState } from 'react';
import { Profile, LinkedRelative } from '../types';
import { 
  Users, UserPlus, Link2, Heart, Globe, Sparkles, Plus, 
  Trash2, Search, MapPin, Home, MessageSquare, Check, HelpCircle 
} from 'lucide-react';

interface CommunityVaultProps {
  profiles: Profile[];
  linkedRelatives: LinkedRelative[];
  onAddLink: (link: Omit<LinkedRelative, 'id' | 'linkedAt'>) => void;
  onRemoveLink: (id: string) => void;
}

const COMMUNITY_SEEDS = [
  {
    id: 'comm-1',
    fullName: 'Chief Olubayo Babajide',
    familyCompound: 'Babajide Ancestral Villa',
    lga: 'Lagos Island',
    ward: 'Ward 02',
    language: 'Yoruba (Eko Dialect)',
    notes: 'Primary keeper of Lagos Island merchant records and trade routes mapping back to 19th-century Oyo Empire.',
    avatarColor: 'bg-amber-100 text-amber-950',
    familySizeEstimate: 120,
    isAlive: true
  },
  {
    id: 'comm-2',
    fullName: 'Mazi Emeka Okeke',
    familyCompound: 'Okeke Palace Compound',
    lga: 'Nnewi North',
    ward: 'Otolo Ward 1',
    language: 'Igbo (Anambra Central)',
    notes: 'Maternal clan elder documenting the great Otolo migrations. Active collaborator with pre-colonial oral story tapes.',
    avatarColor: 'bg-emerald-100 text-emerald-950',
    familySizeEstimate: 160,
    isAlive: true
  },
  {
    id: 'comm-3',
    fullName: 'Kofi Boateng',
    familyCompound: 'Asante Palace Grounds',
    lga: 'Kumasi Metro',
    ward: 'Manhyia Sub-Metro',
    language: 'Twi (Asante)',
    notes: 'Linguist specializing in Asante drum poetry, proverb translations, and gold compound lineage records.',
    avatarColor: 'bg-rose-100 text-rose-950',
    familySizeEstimate: 95,
    isAlive: true
  },
  {
    id: 'comm-4',
    fullName: 'Yasmine Diop',
    familyCompound: 'Griot House of Medina',
    lga: 'Dakar Plateau',
    ward: 'Medina Ward 3',
    language: 'Wolof (Medina)',
    notes: 'Sovereign storyteller tracing Afro-diasporic descendants from Bahia, Brazil; Havana, Cuba; and London back to Wolof roots.',
    avatarColor: 'bg-blue-100 text-blue-950',
    familySizeEstimate: 80,
    isAlive: true
  },
  {
    id: 'comm-5',
    fullName: 'Dr. Morenike Olukunle',
    familyCompound: 'Olukunle House',
    lga: 'Ogbomoso North',
    ward: 'Ward 04',
    language: 'Yoruba (Oyo dialect)',
    notes: 'Researcher mapping agricultural guilds and blacksmith lineage compounds based in Ogbomoso North LGA.',
    avatarColor: 'bg-[#FAF8F5] border border-amber-200 text-amber-900',
    familySizeEstimate: 210,
    isAlive: true
  }
];

export default function CommunityVault({ 
  profiles, 
  linkedRelatives, 
  onAddLink, 
  onRemoveLink 
}: CommunityVaultProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommunityMember, setSelectedCommunityMember] = useState<typeof COMMUNITY_SEEDS[0] | null>(null);
  
  // Link Form State
  const [selectedMyProfileId, setSelectedMyProfileId] = useState('');
  const [clanshipType, setClanshipType] = useState<'close' | 'distant'>('close');
  const [customRelationNotes, setCustomRelationNotes] = useState('');
  const [customLinkSuccess, setCustomLinkSuccess] = useState(false);

  // Manual Custom External Connection State
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCompound, setManualCompound] = useState('');
  const [manualLga, setManualLga] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  // Filtering Community seeds
  const filteredCommunity = COMMUNITY_SEEDS.filter(comm => {
    const q = searchQuery.toLowerCase();
    return (
      comm.fullName.toLowerCase().includes(q) ||
      comm.familyCompound.toLowerCase().includes(q) ||
      comm.lga.toLowerCase().includes(q) ||
      comm.language.toLowerCase().includes(q)
    );
  });

  // Calculate matching compounds between User's tree and community seeds
  const getSuggestedMatches = () => {
    const matches: Array<{ userProfile: Profile, commProfile: typeof COMMUNITY_SEEDS[0], reason: string }> = [];
    
    profiles.forEach(userP => {
      COMMUNITY_SEEDS.forEach(commP => {
        // Match by compound
        if (
          userP.familyCompound && 
          commP.familyCompound && 
          userP.familyCompound.toLowerCase().trim() === commP.familyCompound.toLowerCase().trim()
        ) {
          matches.push({
            userProfile: userP,
            commProfile: commP,
            reason: `Shared Ancestral Compound: "${userP.familyCompound}"`
          });
        }
        // Match by LGA (if no compound match but shares LGA)
        else if (
          userP.lga && 
          commP.lga && 
          userP.lga.toLowerCase().trim() === commP.lga.toLowerCase().trim()
        ) {
          matches.push({
            userProfile: userP,
            commProfile: commP,
            reason: `Shared Local District (LGA): "${userP.lga}"`
          });
        }
      });
    });

    return matches;
  };

  const handlesSubmitLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMyProfileId || !selectedCommunityMember) return;

    onAddLink({
      myProfileId: selectedMyProfileId,
      relativeName: selectedCommunityMember.fullName,
      relativeCompound: selectedCommunityMember.familyCompound,
      relativeLga: selectedCommunityMember.lga,
      clanshipType,
      notes: customRelationNotes || `Verified kinship link established on the basis of shared ancestral origins in ${selectedCommunityMember.lga}.`
    });

    setCustomLinkSuccess(true);
    setCustomRelationNotes('');
    setTimeout(() => {
      setCustomLinkSuccess(false);
      setSelectedCommunityMember(null);
    }, 1500);
  };

  const handleManualLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMyProfileId || !manualName || !manualCompound || !manualLga) return;

    onAddLink({
      myProfileId: selectedMyProfileId,
      relativeName: manualName,
      relativeCompound: manualCompound,
      relativeLga: manualLga,
      clanshipType,
      notes: manualNotes || `Sovereign linkage created to external relative: ${manualName} of ${manualCompound}.`
    });

    setCustomLinkSuccess(true);
    setManualName('');
    setManualCompound('');
    setManualLga('');
    setManualNotes('');
    setTimeout(() => {
      setCustomLinkSuccess(false);
      setShowManualForm(false);
    }, 1500);
  };

  const suggestedMatches = getSuggestedMatches();

  return (
    <div id="community-vault-card" className="bg-white border border-[#2D2926]/15 p-6 md:p-8" style={{ contentVisibility: 'auto' }}>
      
      {/* Visual Title Header Banner */}
      <div className="bg-[#1a1918] text-[#fcfbfa] p-6 md:p-8 rounded-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 shrink-0 pointer-events-none">
          <Users className="w-48 h-48 rotate-12 text-[#E2A04F]" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#E2A04F]" />
          <span className="text-[9px] uppercase tracking-[0.2em] font-sans text-[#E2A04F] font-semibold">COOPERATIVE ORAL COUSINS MAP</span>
        </div>
        <h2 className="font-display font-medium text-2xl tracking-tight">Kinship Community Springboard</h2>
        <p className="text-xs text-gray-300 max-w-xl mt-2.5 leading-relaxed font-sans">
          This community springboard links individuals who have connected their respective profiles as close or distant relatives. By declaring compound alignments or local government ties, we recreate severed family trees collectively.
        </p>
      </div>

      {/* Suggested Connection Sparks Alert Bar */}
      {suggestedMatches.length > 0 && (
        <div className="bg-[#E2A04F]/10 border border-[#E2A04F]/30 p-4 rounded-sm flex items-start gap-3.5 mb-8 animate-pulse">
          <Sparkles className="w-5 h-5 text-[#E2A04F] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-[10px] uppercase tracking-[0.15em] font-black font-sans text-amber-900 leading-none mb-1">
              Lineage Intersection Points Detected ({suggestedMatches.length})
            </h4>
            <p className="text-xs text-amber-950 font-serif">
              Our cooperative directory indicates your registered family branches share compounds or direct local administration LGAs with active Community members. Connect these profiles as relatives to broaden your oral records.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedMatches.map((match, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedCommunityMember(match.commProfile);
                    setSelectedMyProfileId(match.userProfile.id);
                    setCustomRelationNotes(`Linked due to shared match: ${match.reason}`);
                    setShowManualForm(false);
                  }}
                  className="bg-white/90 hover:bg-white text-gray-900 border border-[#E2A04F]/40 text-[9px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-sm transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Link2 className="w-3 h-3 text-[#E2A04F]" />
                  Link {match.userProfile.fullName.replace(' (Self)', '')} ➔ {match.commProfile.fullName}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Primary Layout Segment: Browser & Action Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Directory & Manual linkage option */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <h3 className="font-sans font-bold text-[10px] uppercase tracking-[0.18em] text-gray-500">
              Community Directory Directory
            </h3>

            <button
              onClick={() => {
                setShowManualForm(!showManualForm);
                setSelectedCommunityMember(null);
              }}
              className="text-[9px] uppercase tracking-wider text-[#E2A04F] hover:text-[#2D2926] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {showManualForm ? "Browse Directory" : "Link External Relative"}
            </button>
          </div>

          {!showManualForm ? (
            <div className="space-y-4">
              {/* Directory Filter search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter community profiles by name, compound, LGA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-200 focus:outline-none focus:border-[#E2A04F] placeholder-gray-400 bg-gray-50/50"
                />
              </div>

              {/* Profiles list */}
              <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredCommunity.map(item => {
                  const matchingCount = profiles.filter(p => p.lga.toLowerCase() === item.lga.toLowerCase() || p.familyCompound.toLowerCase() === item.familyCompound.toLowerCase()).length;
                  return (
                    <div 
                      key={item.id}
                      className="border border-gray-200 hover:border-[#E2A04F] bg-[#FAF8F5]/30 p-4 rounded-sm transition-all flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${item.avatarColor} font-bold font-sans text-xs flex items-center justify-center shrink-0`}>
                            {item.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-display font-medium text-sm text-[#2D2926]">{item.fullName}</h4>
                            <span className="text-[9.5px] italic text-[#E2A04F] font-semibold">{item.familyCompound}</span>
                          </div>
                        </div>

                        {matchingCount > 0 && (
                          <span className="text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-250 py-0.5 px-2 rounded-full font-bold uppercase tracking-wider animate-pulse">
                            Overlap Match
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 mt-3 font-serif leading-relaxed italic bg-white p-3 border border-gray-100 rounded-sm">
                        "{item.notes}"
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] text-gray-500 font-sans">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#E2A04F]" />
                          <span>LGA: {item.lga}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-gray-400" />
                          <span>Dialect: {item.language}</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center">
                        <span className="text-[9px] text-[#2D2926]/40 font-mono">
                          Directory Group Size: ~{item.familySizeEstimate}
                        </span>

                        <button
                          onClick={() => {
                            setSelectedCommunityMember(item);
                            // Auto-select first local profile if none selected
                            if (profiles.length > 0 && !selectedMyProfileId) {
                              setSelectedMyProfileId(profiles[0].id);
                            }
                          }}
                          className="bg-[#2D2926] hover:bg-[#E2A04F] text-[#F9F7F2] hover:text-[#2D2926] text-[9.5px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-sm transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          Establish Kin Link
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Custom Manual External Relatives Link Form */
            <form onSubmit={handleManualLinkSubmit} className="bg-[#FAF8F5] border border-gray-200 p-5 rounded-sm space-y-4">
              <div className="border-b border-gray-200 pb-2 mb-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Link an External Relative (Sovereign Declaration)</h4>
                <p className="text-[10px] text-gray-500 mt-0.5 font-serif">
                  Declare a link to a relative who is not listed in the standard seed folder. Enter their names and origin records below.
                </p>
              </div>

              {customLinkSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 text-center rounded-sm text-xs text-emerald-800 space-y-1">
                  <Check className="w-6 h-6 text-emerald-700 mx-auto" />
                  <p className="font-bold">Sovereign relative connection saved successfully!</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                        Select Member in Your Tree
                      </label>
                      <select
                        required
                        value={selectedMyProfileId}
                        onChange={(e) => setSelectedMyProfileId(e.target.value)}
                        className="w-full bg-white border border-gray-300 py-2 px-3 text-xs rounded shadow-xs focus:ring-1 focus:ring-[#E2A04F]/50 outline-none"
                      >
                        <option value="">-- Choose Profile --</option>
                        {profiles.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.fullName} ({p.role.replace('_', ' ')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                        Relative's Full Name (External)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kolawole Babajide"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        className="w-full bg-white border border-gray-300 py-2 px-3 text-xs rounded focus:ring-1 focus:ring-[#E2A04F]/50 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                        Their Ancestral Compound (External)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Babajide Ancestral House"
                        value={manualCompound}
                        onChange={(e) => setManualCompound(e.target.value)}
                        className="w-full bg-white border border-gray-300 py-2 px-3 text-xs rounded focus:ring-1 focus:ring-[#E2A04F]/50 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                        Their LGA / District
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lagos Island"
                        value={manualLga}
                        onChange={(e) => setManualLga(e.target.value)}
                        className="w-full bg-white border border-gray-300 py-2 px-3 text-xs rounded focus:ring-1 focus:ring-[#E2A04F]/50 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                        Clanship Integrity Level
                      </label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-1.5 text-xs">
                          <input
                            type="radio"
                            name="manual-clanship"
                            checked={clanshipType === 'close'}
                            onChange={() => setClanshipType('close')}
                          />
                          Close Relative
                        </label>
                        <label className="flex items-center gap-1.5 text-xs">
                          <input
                            type="radio"
                            name="manual-clanship"
                            checked={clanshipType === 'distant'}
                            onChange={() => setClanshipType('distant')}
                          />
                          Distant Relative
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                      Relationship Annotation / Story links
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Met at the royal lineage coronation, confirmed we shared identical maternal pre-colonial origins..."
                      value={manualNotes}
                      onChange={(e) => setManualNotes(e.target.value)}
                      className="w-full bg-white border border-gray-300 py-2 px-3 text-xs rounded focus:ring-1 focus:ring-[#E2A04F]/50 outline-none font-serif"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowManualForm(false)}
                      className="px-4 py-2 border border-gray-200 text-xs rounded text-gray-600 hover:bg-gray-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedMyProfileId || !manualName}
                      className="px-5 py-2 bg-[#2D2926] hover:bg-[#E2A04F] text-[#F9F7F2] hover:text-[#2D2926] text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                    >
                      Save Ancestral Connection
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

        </div>

        {/* Right Side: Connections builder & existing list */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active linking builder card */}
          {selectedCommunityMember && (
            <div className="border-2 border-[#E2A04F] bg-[#FAF8F5] p-5 rounded-md space-y-4 animate-slideDown">
              <div className="flex justify-between items-start border-b border-[#E2A04F]/20 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-1">
                    <Link2 className="w-4 h-4 text-[#E2A04F]" />
                    Connection Calibration Builder
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Connecting to {selectedCommunityMember.fullName}</p>
                </div>
                <button 
                  onClick={() => setSelectedCommunityMember(null)}
                  className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer font-sans"
                >
                  ✕
                </button>
              </div>

              {customLinkSuccess ? (
                <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-sm text-center text-xs text-emerald-800 font-semibold flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" /> Link Declared Safely!
                </div>
              ) : (
                <form onSubmit={handlesSubmitLink} className="space-y-3">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                      Who in your tree matches this relative?
                    </label>
                    <select
                      required
                      value={selectedMyProfileId}
                      onChange={(e) => setSelectedMyProfileId(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-xs rounded py-2 px-3 focus:outline-none focus:border-[#E2A04F]"
                    >
                      <option value="">-- Choose Member Profile --</option>
                      {profiles.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.role.replace('_', ' ')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                      Connection Integrity LEVEL
                    </label>
                    <div className="flex gap-4 mt-1">
                      <label className="flex items-center gap-1.5 text-xs">
                        <input
                          type="radio"
                          name="comm-clanship"
                          checked={clanshipType === 'close'}
                          onChange={() => setClanshipType('close')}
                        />
                        Close Relative
                      </label>
                      <label className="flex items-center gap-1.5 text-xs">
                        <input
                          type="radio"
                          name="comm-clanship"
                          checked={clanshipType === 'distant'}
                          onChange={() => setClanshipType('distant')}
                        />
                        Distant Relative
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                      Verifiable Alignment Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Include details about migration maps, shared names, or elders confirmations..."
                      value={customRelationNotes}
                      onChange={(e) => setCustomRelationNotes(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-xs rounded py-1.5 px-3 focus:outline-none focus:border-[#E2A04F] font-serif"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedCommunityMember(null)}
                      className="px-3 py-1.5 border border-gray-200 text-[10px] uppercase font-bold rounded hover:bg-gray-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#E2A04F] hover:bg-[#d0903f] text-black text-[10px] uppercase font-bold tracking-widest rounded cursor-pointer"
                    >
                      Authenticate Linkage
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* List of established linkages */}
          <div className="border border-gray-200 p-5 rounded-sm bg-[#FAF8F5]/40 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-[#2D2926]/60 font-bold">
                My Linked Sovereign Relatives ({linkedRelatives.length})
              </span>
              <Heart className={`w-4 h-4 text-rose-500 ${linkedRelatives.length > 0 ? 'fill-rose-500' : ''}`} />
            </div>

            {linkedRelatives.length === 0 ? (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <Link2 className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-serif italic">No clanship links currently authenticated.</p>
                <p className="text-[10px] max-w-xs mx-auto leading-normal">
                  Connect your family nodes on the left directory map with verified community records to build real-time linkage.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {linkedRelatives.map(link => {
                  const localProfile = profiles.find(p => p.id === link.myProfileId);
                  return (
                    <div 
                      key={link.id} 
                      className="bg-white border border-gray-200 p-3.5 rounded-md flex flex-col justify-between shadow-xs relative border-l-4 border-l-[#E2A04F]"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] uppercase tracking-widest font-bold bg-[#E2A04F]/10 text-amber-950 px-2 py-0.5 rounded-sm border border-[#E2A04F]/20">
                              {link.clanshipType === 'close' ? 'Close Kin' : 'Distant Kin'}
                            </span>
                            <div className="text-xs font-serif font-black text-[#2D2926] mt-2 leading-tight">
                              {localProfile ? localProfile.fullName : 'Sovereign Node'}
                              <span className="text-[10px] font-sans font-normal text-gray-400"> is connected to </span>
                              <strong className="text-amber-950 font-sans">{link.relativeName}</strong>
                            </div>
                          </div>

                          <button
                            onClick={() => onRemoveLink(link.id)}
                            className="text-gray-400 hover:text-red-650 transition-colors cursor-pointer"
                            title="Unlink and disconnect"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[10px] text-gray-500 mt-2 font-sans bg-gray-50/70 p-2.5 rounded-sm border border-gray-150 relative">
                          <Home className="w-3.5 h-3.5 text-[#E2A04F] absolute right-2 top-2 opacity-30" />
                          <div>Compound: <strong>{link.relativeCompound}</strong></div>
                          <div>District (LGA): <strong>{link.relativeLga}</strong></div>
                          <p className="text-[9.5px] italic text-[#2D2926]/80 border-t border-gray-150/50 mt-1.5 pt-1.5 pr-4 font-serif">
                            "{link.notes}"
                          </p>
                        </div>
                      </div>

                      <div className="text-[8px] font-mono text-gray-400 text-right mt-2 leading-none">
                        Declared: {link.linkedAt}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Education panel */}
          <div className="border border-dashed border-gray-200 p-4.5 bg-gray-55/20 text-[10px] text-gray-500 rounded-lg flex items-start gap-2.5 leading-relaxed font-sans mt-3">
            <HelpCircle className="w-4 h-4 text-[#E2A04F] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-gray-700 uppercase tracking-wider mb-0.5">Kinship Calibration Integrity</span>
              Authenticating a link bridges two sovereign genealogical scopes. Once a relative link is certified, we cross-pollinate corresponding compound indicators in our Discovery Network.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
