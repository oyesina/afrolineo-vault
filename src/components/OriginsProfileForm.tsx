import React, { useState, useEffect } from 'react';
import { Profile, ProfileRole } from '../types';
import { X, Globe, Home, Users, MapPin, Sparkles, Languages } from 'lucide-react';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/locales/en';

const ROLE_OPTIONS: ProfileRole[] = ['self', 'father', 'mother', 'paternal_grandfather', 'paternal_grandmother', 'maternal_grandfather', 'maternal_grandmother', 'sibling', 'uncle', 'aunt'];

interface OriginsFormProps {
  onSubmit: (profile: Omit<Profile, 'id' | 'avatarColor'> & { id?: string }) => void;
  onCancel: () => void;
  initialProfile?: Profile | null;
  fixedRole?: ProfileRole; // If adding to a specific position in the tree
}

// Popular African regions & LGAs/administrative councils (specifically Nigeria & West Africa pointers)
const POPULAR_LGAS = [
  'Ibadan North', 'Ibadan Northeast', 'Ibadan Northwest', 'Lagos Island', 'Alimosho', 'Ikeja', 'Surulere',
  'Nnewi North', 'Nnewi South', 'Enugu North', 'Udi', 'Benin City', 'Ogbomoso North', 'Ogbomoso South',
  'Kumasi Metro (Ghana)', 'Accra Metropolitan (Ghana)', 'Oshodi-Isolo', 'Abuja Municipal Council',
  'Port Harcourt Local Council', 'Ife Central', 'Kano Municipal', 'Calabar Municipality', 'Aba South'
];

const POPULAR_LANGUAGES = [
  'Yoruba', 'Igbo', 'Hausa', 'Twi (Asante)', 'Fante', 'Ga', 'Ewe', 'Edo', 'Urhobo', 'Ijaw', 'Zulu', 'Xhosa', 'Pidgin English', 'Krio'
];

export default function OriginsProfileForm({ onSubmit, onCancel, initialProfile, fixedRole }: OriginsFormProps) {
  const { t } = useI18n();
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [role, setRole] = useState<ProfileRole>('self');
  const [birthYear, setBirthYear] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [language, setLanguage] = useState('');
  const [lga, setLga] = useState('');
  const [ward, setWard] = useState('');
  const [familyCompound, setFamilyCompound] = useState('');
  const [familySizeEstimate, setFamilySizeEstimate] = useState<number>(30);
  const [notes, setNotes] = useState('');
  const [isAlive, setIsAlive] = useState(true);

  // States for search lookups
  const [lgaSearch, setLgaSearch] = useState('');
  const [showLgaDropdown, setShowLgaDropdown] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setFullName(initialProfile.fullName);
      setGender(initialProfile.gender);
      setRole(initialProfile.role);
      setBirthYear(initialProfile.birthYear);
      setBirthPlace(initialProfile.birthPlace);
      setLanguage(initialProfile.language);
      setLga(initialProfile.lga);
      setLgaSearch(initialProfile.lga);
      setWard(initialProfile.ward);
      setFamilyCompound(initialProfile.familyCompound);
      setFamilySizeEstimate(initialProfile.familySizeEstimate || 30);
      setNotes(initialProfile.notes);
      setIsAlive(initialProfile.isAlive);
    } else if (fixedRole) {
      setRole(fixedRole);
      // Auto assign standard genders for parent roles
      if (fixedRole === 'father' || fixedRole === 'paternal_grandfather' || fixedRole === 'maternal_grandfather') {
        setGender('Male');
      } else if (fixedRole === 'mother' || fixedRole === 'paternal_grandmother' || fixedRole === 'maternal_grandmother') {
        setGender('Female');
      }
    }
  }, [initialProfile, fixedRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    onSubmit({
      id: initialProfile?.id,
      fullName: fullName.trim(),
      gender,
      role,
      birthYear: birthYear.trim() || 'Unspecified',
      birthPlace: birthPlace.trim() || 'Unspecified',
      language: language.trim() || 'Unspecified',
      lga: lga.trim() || 'Unspecified',
      ward: ward.trim() || 'Unspecified',
      familyCompound: familyCompound.trim() || 'Unspecified',
      familySizeEstimate,
      notes: notes.trim(),
      isAlive
    });
  };

  const filteredLGAs = POPULAR_LGAS.filter(item =>
    item.toLowerCase().includes(lgaSearch.toLowerCase())
  );

  const filteredLanguages = POPULAR_LANGUAGES.filter(item =>
    item.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <div id="origins-form-card" className="bg-white border border-[#eae8e5] rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full mx-auto" style={{ contentVisibility: 'auto' }}>
      {/* Header */}
      <div className="bg-[#1a1918] text-[#fcfbfa] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="font-display font-semibold text-lg">
            {initialProfile ? t('form.editTitle', { name: initialProfile.fullName }) : t('form.addTitle')}
          </h3>
        </div>
        <button
          id="close-form-btn"
          type="button"
          onClick={onCancel}
          aria-label={t('common.close')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        <p className="text-xs text-gray-500 leading-relaxed border-b border-gray-100 pb-3">
          {t('form.lead')}
        </p>

        {/* Core Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              {t('form.name')}
            </label>
            <input
              id="input-fullname"
              type="text"
              required
              placeholder={t('form.namePlaceholder')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-sm border border-[#e2e2e0] rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              {t('form.relationship')}
            </label>
            <select
              id="select-role"
              disabled={!!fixedRole}
              value={role}
              onChange={(e) => setRole(e.target.value as ProfileRole)}
              className="w-full text-sm border border-[#e2e2e0] rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-gray-50/50 disabled:bg-gray-100 disabled:text-gray-500"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{t(`form.role.${r}` as MessageKey)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              {t('form.gender')}
            </label>
            <div className="flex gap-2">
              {(['Male', 'Female'] as const).map((g) => (
                <button
                  id={`btn-gender-${g.toLowerCase()}`}
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 text-xs py-2 px-2.5 rounded-lg border font-medium transition-all ${
                    gender === g
                      ? 'border-amber-600 bg-amber-50/50 text-amber-900'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {g === 'Male' ? t('form.male') : t('form.female')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              {t('form.birthYear')}
            </label>
            <input
              id="input-birthyear"
              type="text"
              placeholder={t('form.birthYearPlaceholder')}
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="w-full text-sm border border-[#e2e2e0] rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              {t('form.status')}
            </label>
            <div className="flex gap-2">
              <button
                id="btn-status-alive"
                type="button"
                onClick={() => setIsAlive(true)}
                className={`flex-1 text-xs py-2 px-1 rounded-lg border font-medium transition-all ${
                  isAlive
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t('form.living')}
              </button>
              <button
                id="btn-status-ancestor"
                type="button"
                onClick={() => setIsAlive(false)}
                className={`flex-1 text-xs py-2 px-1 rounded-lg border font-medium transition-all ${
                  !isAlive
                    ? 'border-[#1a1918] bg-gray-100 text-gray-950'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t('form.passedOn')}
              </button>
            </div>
          </div>
        </div>

        {/* Anchor Geographical Drill Down Section */}
        <div className="bg-[#faf9f6] border border-[#f0eee9] p-4 md:p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-800 border-b border-amber-150 pb-2 mb-2">
            <Home className="w-4 h-4" />
            <h4 className="font-display font-medium text-xs uppercase tracking-wider">
              {t('form.placeSection')}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Family Compound */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                <Home className="w-3.5 h-3.5 text-gray-400" />
                {t('form.compound')}
              </label>
              <input
                id="input-compound"
                type="text"
                placeholder={t('form.compoundPlaceholder')}
                value={familyCompound}
                onChange={(e) => setFamilyCompound(e.target.value)}
                className="w-full text-sm border border-[#e2e2e0] rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-white"
              />
              <span className="text-xs text-gray-400 mt-1 block">
                {t('form.compoundHint')}
              </span>
            </div>

            {/* Language / Dialect */}
            <div className="relative">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                <Languages className="w-3.5 h-3.5 text-gray-400" />
                {t('form.language')}
              </label>
              <input
                id="input-language"
                type="text"
                placeholder={t('form.languagePlaceholder')}
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setLangSearch(e.target.value);
                  setShowLangDropdown(true);
                }}
                onFocus={() => setShowLangDropdown(true)}
                className="w-full text-sm border border-[#e2e2e0] rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-white"
              />
              {showLangDropdown && filteredLanguages.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-36 overflow-y-auto">
                  {filteredLanguages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setLanguage(lang);
                        setLangSearch(lang);
                        setShowLangDropdown(false);
                      }}
                      className="w-full text-left text-xs px-3 py-2 hover:bg-amber-50 hover:text-amber-900 transition-colors border-b border-gray-50"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
              {showLangDropdown && (
                <div
                  className="fixed inset-0 z-0"
                  onClick={() => setShowLangDropdown(false)}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local Government Area (LGA) */}
            <div className="relative">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {t('form.lga')}
              </label>
              <input
                id="input-lga"
                type="text"
                placeholder={t('form.lgaPlaceholder')}
                value={lga}
                onChange={(e) => {
                  setLga(e.target.value);
                  setLgaSearch(e.target.value);
                  setShowLgaDropdown(true);
                }}
                onFocus={() => setShowLgaDropdown(true)}
                className="w-full text-sm border border-[#e2e2e0] rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-white"
              />
              {showLgaDropdown && filteredLGAs.length > 0 && (
                <div id="lga-autocomplete-list" className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-36 overflow-y-auto">
                  {filteredLGAs.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setLga(item);
                        setLgaSearch(item);
                        setShowLgaDropdown(false);
                      }}
                      className="w-full text-left text-xs px-3 py-2 hover:bg-amber-50 hover:text-amber-900 transition-colors border-b border-gray-50"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
              {showLgaDropdown && (
                <div
                  className="fixed inset-0 z-0"
                  onClick={() => setShowLgaDropdown(false)}
                />
              )}
              <span className="text-xs text-gray-400 mt-1 block">
                {t('form.lgaHint')}
              </span>
            </div>

            {/* Ward */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                {t('form.ward')}
              </label>
              <input
                id="input-ward"
                type="text"
                placeholder={t('form.wardPlaceholder')}
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full text-sm border border-[#e2e2e0] rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-white"
              />
            </div>
          </div>

          {/* Family Size Estimator */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                {t('form.familySize')}
              </span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono text-xs">
                {t('form.familySizeValue', { count: familySizeEstimate })}
              </span>
            </div>
            <input
              id="slider-familysize"
              type="range"
              min="5"
              max="250"
              step="5"
              value={familySizeEstimate}
              onChange={(e) => setFamilySizeEstimate(parseInt(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1 font-mono">
              <span>{t('form.familySmall')}</span>
              <span>{t('form.familyLarge')}</span>
            </div>
          </div>
        </div>

        {/* Birth place and historical biography */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              {t('form.birthplace')}
            </label>
            <input
              id="input-birthplace"
              type="text"
              placeholder={t('form.birthplacePlaceholder')}
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              className="w-full text-sm border border-[#e2e2e0] rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              {t('form.notes')}
            </label>
            <textarea
              id="textarea-notes"
              rows={3}
              placeholder={t('form.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm border border-[#e2e2e0] rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-gray-50/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            id="cancel-btn"
            type="button"
            onClick={onCancel}
            className="text-xs px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-55 font-medium transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            id="save-profile-btn"
            type="submit"
            className="text-xs px-5 py-2.5 bg-[#1a1918] text-white rounded-lg hover:bg-amber-65 font-medium transition-colors cursor-pointer shadow-sm hover:shadow"
          >
            {initialProfile ? t('form.save') : t('form.add')}
          </button>
        </div>
      </form>
    </div>
  );
}
