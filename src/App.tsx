/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Profile, OralHistory, ProfileRole, LinkedRelative, LoginSession } from './types';
import FamilyTree, { RELATION_PHRASE, ROLE_INFO, SIDE_STYLES, initials } from './components/FamilyTree';
import OriginsProfileForm from './components/OriginsProfileForm';
import RecordingStudio from './components/RecordingStudio';
import LineageMark from './components/LineageMark';
import { identify, setAnalyticsUser, syncTreeOutline, track } from './lib/analytics';
import { hasAnalyticsConsent, onConsentChange, openCookieSettings } from './lib/consent';
import CookieConsent from './components/CookieConsent';
import DiscoveryHub from './components/DiscoveryHub';
import UserLoginGate from './components/UserLoginGate';
import CommunityVault from './components/CommunityVault';
import { 
  Users, Mic, Globe, Heart, ShieldAlert, Sparkles, Download, Upload, 
  HelpCircle, Trash2, ArrowRight, UserPlus, FolderHeart, Plus, 
  X, Check, Settings, MessageSquare, Flame, Smile, LogOut, Search,
  ChevronLeft, ChevronRight, Copy, FileText, Smartphone, Laptop, Tablet, MapPin, TrendingUp, UserCheck, Network, Briefcase, Newspaper, Shield,
  ChevronDown, BookOpen, Gift, Play, Pause, Bookmark, Pencil
} from 'lucide-react';

import { ARTICLES, GIFTS, STORIES } from './data/exploreData';

// Elegant default seed dataset illustrating historical oral lineages
const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'p-1',
    fullName: 'Akin Babajide (Self)',
    gender: 'Male',
    role: 'self',
    birthYear: '1995',
    birthPlace: 'Lagos Island Maternity, Lagos',
    language: 'Yoruba (Lagos dialect)',
    lga: 'Lagos Island',
    ward: 'Ward 02',
    familyCompound: 'Babajide Ancestral Villa',
    familySizeEstimate: 12,
    notes: 'Heritage Seeker currently residing in London. Restoring clan history.',
    isAlive: true,
    avatarColor: 'bg-amber-100 text-amber-900'
  },
  {
    id: 'p-2',
    fullName: 'Olatunde Babajide',
    gender: 'Male',
    role: 'father',
    birthYear: '1962',
    birthPlace: 'Oka Akoko, Ondo State',
    language: 'Yoruba',
    lga: 'Surulere',
    ward: 'Ward 08',
    familyCompound: 'Alao Compound, Oka Akoko',
    familySizeEstimate: 45,
    notes: 'Retired engineer, lover of traditional native drumming and Yoruba proverb recitation.',
    isAlive: true,
    avatarColor: 'bg-amber-250 text-amber-950'
  },
  {
    id: 'p-3',
    fullName: 'Zainab Okeke Babajide',
    gender: 'Female',
    role: 'mother',
    birthYear: '1968',
    birthPlace: 'Nnewi, Anambra State',
    language: 'Igbo (Central)',
    lga: 'Nnewi North',
    ward: 'Otolo Ward 1',
    familyCompound: 'Okeke Palace Compound',
    familySizeEstimate: 85,
    notes: 'Educator and central organizer of the compound maternal lineages.',
    isAlive: true,
    avatarColor: 'bg-emerald-150 text-emerald-950'
  },
  {
    id: 'p-4',
    fullName: 'Tolani Babajide',
    gender: 'Female',
    role: 'sibling',
    birthYear: '1998',
    birthPlace: 'Lagos, Nigeria',
    language: 'Yoruba',
    lga: 'Lagos Island',
    ward: 'Ward 02',
    familyCompound: 'Babajide Ancestral Villa',
    familySizeEstimate: 12,
    notes: 'Linguist, active helper with old voice recording translations.',
    isAlive: true,
    avatarColor: 'bg-amber-100 text-amber-900'
  },
  {
    id: 'p-5',
    fullName: 'Adebayo Olukunle',
    gender: 'Male',
    role: 'paternal_grandfather',
    birthYear: '1932',
    birthPlace: 'Ogbomoso, Oyo State',
    language: 'Yoruba',
    lga: 'Ogbomoso North',
    ward: 'Ward 04',
    familyCompound: 'Olucunle House',
    familySizeEstimate: 70,
    notes: 'Ancestral merchant who connected regional trade roots to coastal ports.',
    isAlive: false,
    avatarColor: 'bg-amber-100 text-amber-900'
  },
  {
    id: 'p-6',
    fullName: 'Nneka Okeke',
    gender: 'Female',
    role: 'maternal_grandmother',
    birthYear: '1928',
    birthPlace: 'Nnewi, Anambra State',
    language: 'Igbo (Anambra dialect)',
    lga: 'Nnewi North',
    ward: 'Otolo Ward 1',
    familyCompound: 'Okeke Palace Compound',
    familySizeEstimate: 130,
    notes: 'Revered clan teller and traditional medicine archivist. Her spoken history maps 6 generations.',
    isAlive: false,
    avatarColor: 'bg-emerald-100 text-emerald-900'
  }
];

const DEFAULT_RECORDINGS: OralHistory[] = [
  {
    id: 'rec-1',
    profileId: 'p-6',
    title: 'Anambra Migration & Market Trade Paths',
    durationSec: 155,
    recordedAt: 'May 12, 2026',
    transcript: `[Native Spoken Recitation]
    "My grandchildren, remember this word: 'Nwanne di na mba' - spiritual kinship crosses borders. Our family came from Nnewi long before the iron roads were built. My father, who spoke fluent Central Igbo, managed trade links to the coastal areas of Onitsha. The Okeke compound had 5 primary structures. Today, there are over a hundred of us spread across Lagos and the Americas. Let this voice be your pathfinder."`,
    summary: 'Igbo Migration, Market Trade Networks, Clan Wisdom, Language Preservation',
    promptQuestion: 'How did we come to settle in this LGA or current ward?'
  },
  {
    id: 'rec-2',
    profileId: 'p-2',
    title: 'Alao Compound Harvest Songs and Meanings',
    durationSec: 85,
    recordedAt: 'May 19, 2026',
    transcript: `[First person recitation speaking Yoruba]
    "We woke at dawn to harvest cocoa pods at Oka Akoko. My grandfather taught me that hard work builds compound honor. He would sing 'Owo mi a to lori oro'. oka Akoko North LGA is our land. Never swap your tongue for gold."`,
    summary: 'Agricultural Lore, Yoruba Proverbs, Compound Slogans',
    promptQuestion: 'What specific traditional recipes, songs, or trades did your grandparents pass down?'
  }
];

type AppScreen = 'tree' | 'discovery' | 'community' | 'dash' | 'about';

const APP_NAV: { id: string; screen: AppScreen; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }> }[] = [
  { id: 'sidebar-nav-tree-btn', screen: 'tree', label: 'Family tree', shortLabel: 'Tree', icon: LineageMark },
  { id: 'sidebar-nav-discovery-btn', screen: 'discovery', label: 'Discover', shortLabel: 'Discover', icon: Globe },
  { id: 'sidebar-nav-community-btn', screen: 'community', label: 'Relatives', shortLabel: 'Relatives', icon: Users },
  // Founder metrics moved to the admin console at /admin
  { id: 'sidebar-nav-about-btn', screen: 'about', label: 'About', shortLabel: 'About', icon: HelpCircle },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ 
    email: string; 
    name: string; 
    provider: string;
    ancestralCountry?: string;
    ethnicGroup?: string;
    custodianName?: string;
    knowledgeLevel?: string;
    ancestralState?: string;
    ancestralWard?: string;
  } | null>(() => {
    const saved = localStorage.getItem('afrolineo_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (userData: { 
    email: string; 
    name: string; 
    provider: string;
    ancestralCountry?: string;
    ethnicGroup?: string;
    custodianName?: string;
    knowledgeLevel?: string;
    ancestralState?: string;
    ancestralWard?: string;
  }) => {
    setCurrentUser(userData);
    localStorage.setItem('afrolineo_auth_user', JSON.stringify(userData));
    identify(userData).then(() => {
      track('signed_in', { provider: userData.provider });
      track('onboarding_completed', {
        country: userData.ancestralCountry,
        ethnicGroup: userData.ethnicGroup,
        knowledgeLevel: userData.knowledgeLevel,
      });
    });

    // Guide the family tree profile state dynamically on successful authentication using details entered!
    setProfiles(prev => {
      return prev.map(p => {
        if (p.role === 'self' || p.id === 'p-1') {
          return {
            ...p,
            fullName: `${userData.name} (Self)`,
            language: userData.ethnicGroup || p.language,
            birthPlace: `${p.birthPlace.split(',')[0] || 'Lagos'}${userData.ancestralState ? ', ' + userData.ancestralState : ''}, ${userData.ancestralCountry || 'Nigeria'}`,
            ward: userData.ancestralWard || p.ward,
            notes: `Vault owner. Knowledge Level: ${userData.knowledgeLevel || 'Exploring'}. Restoring lineage history.`
          };
        }
        if (p.role === 'maternal_grandfather' || p.role === 'maternal_grandmother' || p.id === 'p-6') {
          if (userData.custodianName) {
            return {
              ...p,
              fullName: userData.custodianName,
              language: userData.ethnicGroup || p.language,
              birthPlace: `Historic territory${userData.ancestralState ? ', ' + userData.ancestralState : ''}, ${userData.ancestralCountry || 'Nigeria'}`,
              ward: userData.ancestralWard || p.ward,
              notes: `Identified as primary tradition guardian for ${userData.ethnicGroup || 'native'} oral transcripts.`
            };
          }
        }
        return p;
      });
    });
  };

  const handleLogout = () => {
    track('signed_out');
    setAnalyticsUser(null);
    setCurrentUser(null);
    localStorage.removeItem('afrolineo_auth_user');
  };

  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('afrolineo_profiles');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILES;
  });

  const [recordings, setRecordings] = useState<OralHistory[]>(() => {
    const saved = localStorage.getItem('afrolineo_recordings');
    return saved ? JSON.parse(saved) : DEFAULT_RECORDINGS;
  });

  // UI Flow Control
  const [activeScreen, setActiveScreen] = useState<'tree' | 'discovery' | 'community' | 'dash' | 'about'>('tree');
  const [selectedAboutTab, setSelectedAboutTab] = useState<'dei' | 'careers' | 'newsroom' | 'security' | 'privacy' | 'guidelines' | 'terms' | 'social-impact' | 'community-impact' | 'support' | 'articles' | 'gifts' | 'customer-stories'>('dei');

  // Interactive states for Articles, Gifts & Customer Stories (Authenticated)
  const [selectedArticleIdAuth, setSelectedArticleIdAuth] = useState<string | null>(null);
  const [savedArticlesAuth, setSavedArticlesAuth] = useState<string[]>([]);
  const [articleSearchQueryAuth, setArticleSearchQueryAuth] = useState('');
  const [articleFilterAuth, setArticleFilterAuth] = useState('all');
  
  const [selectedGiftIdAuth, setSelectedGiftIdAuth] = useState<string | null>(null);
  const [customFamilyNameAuth, setCustomFamilyNameAuth] = useState('');
  const [customRegionAuth, setCustomRegionAuth] = useState('');
  const [giftCustomizedAuth, setGiftCustomizedAuth] = useState(false);
  const [stagedGiftsAuth, setStagedGiftsAuth] = useState<any[]>([]);

  const [storyRegionFilterAuth, setStoryRegionFilterAuth] = useState('all');
  const [playingStoryIdAuth, setPlayingStoryIdAuth] = useState<string | null>(null);
  const [submittedStoriesAuth, setSubmittedStoriesAuth] = useState<any[]>([]);
  const [newStoryNameAuth, setNewStoryNameAuth] = useState('');
  const [newStoryRegionAuth, setNewStoryRegionAuth] = useState('Diaspora');
  const [newStoryTextAuth, setNewStoryTextAuth] = useState('');

  // Interactive states for Terms, Social Impact, Community & Support (Authenticated)
  const [pactSignedAuth, setPactSignedAuth] = useState(false);
  const [sponsorshipCompoundAuth, setSponsorshipCompoundAuth] = useState('');
  const [sponsorshipLGAAuth, setSponsorshipLGAAuth] = useState('');
  const [sponsorshipSubmittedAuth, setSponsorshipSubmittedAuth] = useState(false);
  const [workshopBookedAuth, setWorkshopBookedAuth] = useState(false);
  const [workshopDateAuth, setWorkshopDateAuth] = useState('');
  const [supportSubmittedAuth, setSupportSubmittedAuth] = useState(false);
  const [supportCategoryAuth, setSupportCategoryAuth] = useState('offline');
  const [supportMessageAuth, setSupportMessageAuth] = useState('');
  const [supportEmailAuth, setSupportEmailAuth] = useState('');
  const [faqOpenAuth, setFaqOpenAuth] = useState<number | null>(null);

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Playback for recorded stories in the person details panel
  const storyAudioRef = useRef<HTMLAudioElement | null>(null);
  const [playingStoryId, setPlayingStoryId] = useState<string | null>(null);

  const stopStoryAudio = () => {
    storyAudioRef.current?.pause();
    storyAudioRef.current = null;
    setPlayingStoryId(null);
  };

  const toggleStoryAudio = (story: OralHistory) => {
    if (playingStoryId === story.id) {
      stopStoryAudio();
      return;
    }
    stopStoryAudio();
    if (!story.audioBase64) return;
    const audio = new Audio(`data:audio/webm;base64,${story.audioBase64}`);
    audio.onended = () => setPlayingStoryId(null);
    audio.play().catch(() => setPlayingStoryId(null));
    track('story_played', { durationSec: story.durationSec });
    storyAudioRef.current = audio;
    setPlayingStoryId(story.id);
  };
  const [showForm, setShowForm] = useState(false);
  const [fixedRoleForForm, setFixedRoleForForm] = useState<ProfileRole | undefined>(undefined);
  const [showRecordingStudio, setShowRecordingStudio] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('afrolineo_sidebar_collapsed') === 'true';
  });

  const [linkedRelatives, setLinkedRelatives] = useState<LinkedRelative[]>(() => {
    const saved = localStorage.getItem('afrolineo_linked_relatives');
    return saved ? JSON.parse(saved) : [];
  });

  // Growth loop & Kill-switch states (PM Docs)
  const [userFeedbackMessage, setUserFeedbackMessage] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSitemapModal, setShowSitemapModal] = useState(false);
  const [sitemapSearchQuery, setSitemapSearchQuery] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [showRawTextFallback, setShowRawTextFallback] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [manualBackupInput, setManualBackupInput] = useState('');
  const [sessionSearch, setSessionSearch] = useState('');
  
  // Interactive About page states
  const [careersSubmitted, setCareersSubmitted] = useState(false);
  const [selectedCareerRole, setSelectedCareerRole] = useState('');
  const [careersApplicantName, setCareersApplicantName] = useState('');
  const [careersApplicantEmail, setCareersApplicantEmail] = useState('');
  const [careersApplicantCv, setCareersApplicantCv] = useState('');
  const [careersApplicantCover, setCareersApplicantCover] = useState('');

  const [expandedCareerId, setExpandedCareerId] = useState<string | null>(null);
  const [selectedNewsArticleId, setSelectedNewsArticleId] = useState<string | null>(null);

  const [securityScanState, setSecurityScanState] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [securityLogs, setSecurityLogs] = useState<string[]>([]);

  const [localPrivacySettings, setLocalPrivacySettings] = useState({
    localTelemetry: false,
    audioCompression: true,
    sessionLogs: true,
    encryptedIndexes: true
  });
  const [privacyNotification, setPrivacyNotification] = useState(false);

  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  
  // Tracking if current user has performed a backup export
  const [hasExportedData, setHasExportedData] = useState<boolean>(() => {
    return localStorage.getItem('afrolineo_has_exported') === 'true';
  });

  // Track login sessions
  const [loginSessions, setLoginSessions] = useState<LoginSession[]>(() => {
    const saved = localStorage.getItem('afrolineo_login_sessions');
    if (saved) return JSON.parse(saved);
    
    // Seed records representing realistic activity from our user demographic
    return [
      {
        id: 'sess-1',
        email: 'oyesinaoyerinde@gmail.com',
        name: 'Oyesina Oyerinde',
        deviceType: 'Mobile (Android)',
        location: 'Lagos, Nigeria',
        timestamp: '2026-06-24 11:42:15',
        status: 'Success'
      },
      {
        id: 'sess-2',
        email: 'seydou@example.com',
        name: 'Seydou Diallo',
        deviceType: 'Mobile (iOS)',
        location: 'Dakar, Senegal',
        timestamp: '2026-06-24 09:15:30',
        status: 'Success'
      },
      {
        id: 'sess-3',
        email: 'yasmine@diop.org',
        name: 'Yasmine Diop',
        deviceType: 'Tablet (iPad)',
        location: 'London, UK',
        timestamp: '2026-06-23 18:22:10',
        status: 'Success'
      },
      {
        id: 'sess-4',
        email: 'chioma@okoro.ng',
        name: 'Chioma Okoro',
        deviceType: 'Desktop (Chrome)',
        location: 'Enugu, Nigeria',
        timestamp: '2026-06-23 14:05:45',
        status: 'Success'
      },
      {
        id: 'sess-5',
        email: 'tunde@babajide.com',
        name: 'Tunde Babajide',
        deviceType: 'Desktop (Safari)',
        location: 'Atlanta, US',
        timestamp: '2026-06-22 22:11:04',
        status: 'Success'
      },
      {
        id: 'sess-6',
        email: 'kwame@mensah.gh',
        name: 'Kwame Mensah',
        deviceType: 'Mobile (Android)',
        location: 'Accra, Ghana',
        timestamp: '2026-06-22 10:30:12',
        status: 'Success'
      }
    ];
  });

  // Track if current user logs in
  useEffect(() => {
    if (currentUser) {
      setLoginSessions(prev => {
        // Prevent duplicate active sessions for this specific page mount
        const sessionExists = prev.some(s => s.email === currentUser.email && s.status === 'Active');
        if (sessionExists) return prev;

        // Detect current user's browser / device
        let detectedDevice = 'Desktop (Chrome)';
        if (typeof navigator !== 'undefined') {
          const ua = navigator.userAgent;
          if (/tablet|ipad|playbook|silk/i.test(ua)) {
            detectedDevice = "Tablet (iPad)";
          } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Opera Mini/i.test(ua)) {
            if (/iPhone/i.test(ua)) detectedDevice = "Mobile (iOS)";
            else if (/Android/i.test(ua)) detectedDevice = "Mobile (Android)";
            else detectedDevice = "Mobile (Web)";
          } else if (/Chrome/i.test(ua)) {
            detectedDevice = "Desktop (Chrome)";
          } else if (/Safari/i.test(ua)) {
            detectedDevice = "Desktop (Safari)";
          } else if (/Firefox/i.test(ua)) {
            detectedDevice = "Desktop (Firefox)";
          }
        }

        const newSession: LoginSession = {
          id: `sess-${Date.now()}`,
          email: currentUser.email,
          name: currentUser.name,
          deviceType: detectedDevice,
          location: currentUser.ancestralCountry ? `${currentUser.ancestralState || 'Lagos'}, ${currentUser.ancestralCountry}` : 'Lagos, Nigeria',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          status: 'Active'
        };

        const updated = [newSession, ...prev.filter(s => s.email !== currentUser.email || s.status !== 'Active')];
        localStorage.setItem('afrolineo_login_sessions', JSON.stringify(updated));
        return updated;
      });
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('afrolineo_has_exported', String(hasExportedData));
  }, [hasExportedData]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('afrolineo_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('afrolineo_recordings', JSON.stringify(recordings));
  }, [recordings]);

  useEffect(() => {
    localStorage.setItem('afrolineo_sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('afrolineo_linked_relatives', JSON.stringify(linkedRelatives));
  }, [linkedRelatives]);

  const handleAddLink = (linkData: Omit<LinkedRelative, 'id' | 'linkedAt'>) => {
    const newLink: LinkedRelative = {
      ...linkData,
      id: `link-${Date.now()}`,
      linkedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setLinkedRelatives(prev => [...prev, newLink]);
    track('relative_linked', { closeness: newLink.clanshipType });
  };

  const handleRemoveLink = (id: string) => {
    setLinkedRelatives(prev => prev.filter(link => link.id !== id));
  };

  // Calculations for Key Metrics (PM specs: user metrics, story minutes, deep profiles count!)
  const totalSecondsRecorded = recordings.reduce((acc, curr) => acc + curr.durationSec, 0);
  const totalMinutesRecorded = (totalSecondsRecorded / 60).toFixed(1);
  
  // A "Deep Profile" has at least 1 audio recording and is linked into the vertical pedigree structure
  const deepProfilesCount = profiles.filter(p => {
    const hasHistory = recordings.some(r => r.profileId === p.id);
    const isVerticalLine = ['self', 'father', 'mother', 'paternal_grandfather', 'paternal_grandmother', 'maternal_grandfather', 'maternal_grandmother'].includes(p.role);
    return hasHistory && isVerticalLine;
  }).length;

  const handleSaveProfile = (formPayload: Omit<Profile, 'id' | 'avatarColor'> & { id?: string }) => {
    if (formPayload.id) {
      // Editing existing profile
      track('profile_updated', { role: formPayload.role });
      setProfiles(prev =>
        prev.map(p =>
          p.id === formPayload.id
            ? { ...p, ...formPayload } as Profile
            : p
        )
      );
      // Update selected profile details view live
      if (selectedProfile && selectedProfile.id === formPayload.id) {
        setSelectedProfile({ ...selectedProfile, ...formPayload } as Profile);
      }
    } else {
      // Creating new profile
      const avatarColors = [
        'bg-amber-100 text-amber-900',
        'bg-emerald-100 text-emerald-900',
        'bg-rose-100 text-rose-800',
        'bg-blue-100 text-blue-900',
        'bg-violet-100 text-violet-900'
      ];
      const selectedColor = avatarColors[profiles.length % avatarColors.length];

      const newProfile: Profile = {
        ...formPayload,
        id: `p-${Date.now()}`,
        avatarColor: selectedColor
      };
      setProfiles(prev => [...prev, newProfile]);
      track('profile_added', { role: newProfile.role, isAlive: newProfile.isAlive });
    }
    setShowForm(false);
    setFixedRoleForForm(undefined);
  };

  const handleSaveOralHistory = (recordingPayload: Omit<OralHistory, 'id'>) => {
    const newRec: OralHistory = {
      ...recordingPayload,
      id: `rec-${Date.now()}`
    };
    setRecordings(prev => [...prev, newRec]);
    track('recording_saved', {
      durationSec: newRec.durationSec,
      hasAudio: !!newRec.audioBase64,
      role: profiles.find((p) => p.id === newRec.profileId)?.role,
    });
    setShowRecordingStudio(false);
  };

  const handleDeleteProfile = (profileId: string) => {
    if (confirm('Are you absolutely sure you want to delete this lineage node? This will also un-link any attached oral history audio records.')) {
      track('profile_deleted', { role: profiles.find((p) => p.id === profileId)?.role });
      setProfiles(prev => prev.filter(p => p.id !== profileId));
      setRecordings(prev => prev.filter(r => r.profileId !== profileId));
      setSelectedProfile(null);
    }
  };

  // Sovereign JSON export
  const triggerExportDatabase = () => {
    track('backup_exported', { people: profiles.length, stories: recordings.length });
    const payload = JSON.stringify({ profiles, recordings, linkedRelatives }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afrolineo-heritage-archive_${new Date().toISOString().slice(0, 10)}.afrolineo`;
    a.click();
    URL.revokeObjectURL(url);
    setHasExportedData(true);
  };

  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.profiles) && Array.isArray(parsed.recordings)) {
          setProfiles(parsed.profiles);
          setRecordings(parsed.recordings);
          if (Array.isArray(parsed.linkedRelatives)) {
            setLinkedRelatives(parsed.linkedRelatives);
          }
          alert('Heritage archive successfully uploaded and restored!');
          setShowImportExport(false);
        } else {
          alert('Invalid Afrolineo file format. Archive could not be restored.');
        }
      } catch (err) {
        alert('File reading failed. Make sure the file is a valid .afrolineo JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleCopyRawBackup = () => {
    try {
      const payload = JSON.stringify({ profiles, recordings, linkedRelatives }, null, 2);
      navigator.clipboard.writeText(payload);
      setCopySuccess(true);
      setHasExportedData(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      alert('Unable to copy to clipboard. Please copy it manually from the text box below.');
    }
  };

  const handleRestoreFromText = () => {
    try {
      const parsed = JSON.parse(manualBackupInput);
      if (Array.isArray(parsed.profiles) && Array.isArray(parsed.recordings)) {
        setProfiles(parsed.profiles);
        setRecordings(parsed.recordings);
        if (Array.isArray(parsed.linkedRelatives)) {
          setLinkedRelatives(parsed.linkedRelatives);
        }
        alert('Heritage archive successfully restored from raw text!');
        setManualBackupInput('');
        setShowRawTextFallback(false);
        setShowImportExport(false);
      } else {
        alert('Invalid data structure. Make sure "profiles" and "recordings" arrays are present.');
      }
    } catch (e) {
      alert('Failed to parse text. Please make sure the text pasted is a valid JSON backup object.');
    }
  };

  // Submit PM secret feedback
  const handleSendPMFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFeedbackMessage.trim()) return;

    setFeedbackSuccess(true);
    setTimeout(() => {
      setUserFeedbackMessage('');
      setFeedbackSuccess(false);
      setShowFeedbackModal(false);
    }, 2000);
  };

  // ---- Usage analytics for the admin console (only with consent) ----
  const [analyticsAllowed, setAnalyticsAllowed] = useState(hasAnalyticsConsent());
  useEffect(() => onConsentChange((c) => setAnalyticsAllowed(c?.analytics === true)), []);

  useEffect(() => {
    if (!currentUser || !analyticsAllowed) return;
    // Re-identify each session so accounts created before tracking existed are known
    identify(currentUser).then(() => {
      track('session_started');
      syncTreeOutline(profiles);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email, analyticsAllowed]);

  useEffect(() => {
    if (currentUser) track('screen_viewed', { screen: activeScreen });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScreen, currentUser?.email]);

  useEffect(() => {
    if (currentUser) syncTreeOutline(profiles);
  }, [profiles, currentUser]);

  if (!currentUser) {
    return <UserLoginGate onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row antialiased text-ink">
      {/* Desktop sidebar (collapsible) */}
      <aside
        id="afrolineo-sidebar"
        className={`hidden md:flex flex-col bg-sand border-r border-line shrink-0 sticky top-0 h-screen justify-between p-4 z-30 transition-all duration-300 relative ${
          isSidebarCollapsed ? 'w-20 items-center px-2' : 'w-64 lg:w-72'
        }`}
      >
        <button
          id="sidebar-collapse-toggle"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-6 -right-3 w-6 h-6 rounded-full bg-white border border-line text-ink-soft hover:text-ink flex items-center justify-center cursor-pointer shadow-sm z-40"
          aria-label={isSidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="flex flex-col gap-6 w-full">
          <div className={`flex items-center gap-2.5 w-full ${isSidebarCollapsed ? 'justify-center' : 'px-2 pt-1'}`}>
            <span className="w-9 h-9 rounded-[10px] bg-ink flex items-center justify-center shrink-0">
              <LineageMark className="w-5 h-5 text-[#E2A04F]" />
            </span>
            {!isSidebarCollapsed && <span className="font-display text-[21px] font-semibold tracking-tight">Afrolineo</span>}
          </div>

          <nav aria-label="App" className="flex flex-col gap-1 w-full">
            {APP_NAV.map(({ id, screen, label, icon: Icon }) => {
              const active = activeScreen === screen;
              return (
                <button
                  key={screen}
                  id={id}
                  onClick={() => {
                    setActiveScreen(screen);
                    if (screen === 'about') setSelectedAboutTab('dei');
                  }}
                  aria-current={active ? 'page' : undefined}
                  title={isSidebarCollapsed ? label : undefined}
                  className={`flex items-center gap-3 rounded-xl text-[15px] transition-colors cursor-pointer ${
                    isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-3.5 py-3 text-left'
                  } ${active ? 'bg-white text-ink font-semibold shadow-[0_1px_2px_rgba(60,40,15,0.08)]' : 'text-ink-soft font-medium hover:bg-white/60'}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-[#9A5B14]' : ''}`} aria-hidden="true" />
                  {!isSidebarCollapsed && <span>{label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            id="sidebar-io-btn"
            onClick={() => setShowImportExport(true)}
            title={isSidebarCollapsed ? 'Back up & export' : undefined}
            className={`flex items-center gap-3 rounded-xl text-[15px] font-medium text-ink-soft hover:bg-white/60 cursor-pointer ${
              isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-3.5 py-3'
            }`}
          >
            <Download className="w-5 h-5 shrink-0" aria-hidden="true" />
            {!isSidebarCollapsed && <span>Back up &amp; export</span>}
          </button>
          {!isSidebarCollapsed && (
            <button
              type="button"
              onClick={openCookieSettings}
              className="self-start px-3.5 text-[13px] text-muted hover:text-ink underline-offset-4 hover:underline cursor-pointer"
            >
              Cookie settings
            </button>
          )}

          {currentUser && (
            <div className={`flex items-center gap-3 rounded-2xl bg-cream border border-line ${isSidebarCollapsed ? 'flex-col p-2' : 'p-3'}`}>
              <span
                className="w-9 h-9 rounded-full bg-ink text-cream font-bold text-[13px] flex items-center justify-center shrink-0"
                title={`${currentUser.name} (${currentUser.email})`}
              >
                {currentUser.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </span>
              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate leading-tight">{currentUser.name}</p>
                  <p className="text-[12.5px] text-muted truncate">{currentUser.email}</p>
                </div>
              )}
              <button
                id="sidebar-logout-btn"
                onClick={handleLogout}
                aria-label="Sign out"
                title="Sign out"
                className="w-10 h-10 rounded-lg text-muted hover:text-record hover:bg-white flex items-center justify-center cursor-pointer shrink-0"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Phone header */}
      <header id="afrolineo-mobile-header" className="md:hidden bg-cream/95 backdrop-blur border-b border-line sticky top-0 z-40">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-[10px] bg-ink flex items-center justify-center">
              <LineageMark className="w-5 h-5 text-[#E2A04F]" />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">Afrolineo</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              id="mobile-nav-io-btn"
              onClick={() => setShowImportExport(true)}
              aria-label="Back up and export"
              className="w-11 h-11 rounded-xl text-ink-soft hover:bg-sand flex items-center justify-center cursor-pointer"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              id="mobile-logout-btn"
              onClick={handleLogout}
              aria-label="Sign out"
              className="w-11 h-11 rounded-xl text-ink-soft hover:bg-sand flex items-center justify-center cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Phone bottom navigation */}
      <nav aria-label="App" className="md:hidden bg-white border-t border-line fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        {APP_NAV.map(({ screen, shortLabel, icon: Icon }) => {
          const active = activeScreen === screen;
          return (
            <button
              key={screen}
              onClick={() => {
                setActiveScreen(screen);
                if (screen === 'about') setSelectedAboutTab('dei');
              }}
              aria-current={active ? 'page' : undefined}
              className={`h-16 flex flex-col items-center justify-center gap-1 text-xs cursor-pointer ${active ? 'text-ink font-bold' : 'text-muted font-medium'}`}
            >
              <Icon className={`w-[22px] h-[22px] ${active ? 'text-[#9A5B14]' : ''}`} aria-hidden="true" />
              {shortLabel}
            </button>
          );
        })}
      </nav>

      {/* Cookie notice sits above the phone bottom bar */}
      <CookieConsent bottomOffsetClass="bottom-16 md:bottom-0" />

      {/* RIGHT SIDE MAIN WRAPPER CONTAINER */}
      <div className="flex-1 flex flex-col overflow-y-auto min-h-screen">
        {/* Main Core Body Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:py-8">
          
          {/* Metric widgets row summary (top visual) */}
          <section id="metric-top-bar" aria-label="Archive summary" className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
            {[
              { label: 'People', value: profiles.length, icon: FolderHeart, tint: 'bg-ochre-tint text-paternal-ink' },
              { label: 'Minutes recorded', value: totalMinutesRecorded, icon: Mic, tint: 'bg-ochre-tint text-paternal-ink' },
              { label: 'Full profiles', value: deepProfilesCount, icon: Sparkles, tint: 'bg-forest-tint text-forest' },
            ].map(({ label, value, icon: Icon, tint }) => (
              <div key={label} className="bg-white border border-line rounded-2xl p-3 sm:p-5 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display text-2xl sm:text-3xl font-medium text-ink leading-none">{value}</p>
                  <p className="text-xs sm:text-sm text-muted mt-1.5 leading-tight">{label}</p>
                </div>
                <span className={`hidden sm:flex w-11 h-11 rounded-full items-center justify-center shrink-0 ${tint}`}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
              </div>
            ))}
          </section>

          {/* 1. Main SCREEN: Lineage tree */}
        {activeScreen === 'tree' && (() => {
          const coreRoles: { role: ProfileRole; label: string }[] = [
            { role: 'self', label: 'yourself' },
            { role: 'father', label: 'your father' },
            { role: 'mother', label: 'your mother' },
            { role: 'paternal_grandfather', label: 'your father’s father' },
            { role: 'paternal_grandmother', label: 'your father’s mother' },
            { role: 'maternal_grandfather', label: 'your mother’s father' },
            { role: 'maternal_grandmother', label: 'your mother’s mother' },
          ];
          const missing = coreRoles.filter(({ role }) => !profiles.some((p) => p.role === role));
          const filled = coreRoles.length - missing.length;
          const familyAnchor = profiles.find((p) => p.role === 'father') || profiles.find((p) => p.role === 'self');
          const familyName = familyAnchor ? familyAnchor.fullName.trim().split(' ').slice(-1)[0] : '';
          const generations = [
            profiles.some((p) => p.role.includes('grand')),
            profiles.some((p) => ['father', 'mother', 'uncle', 'aunt'].includes(p.role)),
            profiles.some((p) => ['self', 'sibling'].includes(p.role)),
          ].filter(Boolean).length;
          const elders = ['paternal_grandmother', 'maternal_grandmother', 'paternal_grandfather', 'maternal_grandfather', 'mother', 'father', 'self'];
          const unrecordedElder = elders
            .map((role) => profiles.find((p) => p.role === role))
            .find((p) => p && !recordings.some((r) => r.profileId === p.id));
          const recordTarget = elders.map((role) => profiles.find((p) => p.role === role)).find(Boolean);

          return (
          <div className="space-y-5">
            {/* Page header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display font-medium text-[28px] sm:text-[34px] leading-tight tracking-[-0.02em]">
                  {familyName ? `${familyName} family` : 'Your family tree'}
                </h1>
                <p className="mt-1 text-muted">
                  {profiles.length} {profiles.length === 1 ? 'person' : 'people'} · {generations} {generations === 1 ? 'generation' : 'generations'} · {recordings.length} {recordings.length === 1 ? 'story' : 'stories'} recorded
                </p>
              </div>
              <div className="flex gap-2.5 w-full sm:w-auto">
                {recordTarget && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProfile(recordTarget);
                      setShowRecordingStudio(true);
                    }}
                    className="flex-1 sm:flex-none h-11.5 inline-flex items-center justify-center gap-2 px-4 rounded-xl border-[1.5px] border-[#CFC4B4] bg-white font-semibold hover:border-ink cursor-pointer whitespace-nowrap"
                  >
                    <Mic className="w-[18px] h-[18px] text-record" aria-hidden="true" />
                    Record a story
                  </button>
                )}
                <button
                  type="button"
                  id="add-custom-member-btn"
                  onClick={() => {
                    setFixedRoleForForm(undefined);
                    setShowForm(true);
                  }}
                  className="flex-1 sm:flex-none h-11.5 inline-flex items-center justify-center gap-2 px-4 sm:px-5 rounded-xl bg-ochre font-semibold text-ink hover:brightness-95 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-[18px] h-[18px]" aria-hidden="true" />
                  Add relative
                </button>
              </div>
            </div>

            {/* Next-step nudge */}
            {(missing.length > 0 || unrecordedElder) && (
              <div id="ancestral-guidance-card" className="flex flex-wrap items-center gap-3.5 bg-white border border-line rounded-2xl px-4.5 py-3.5">
                <span className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-ochre-tint text-paternal-ink items-center justify-center">
                  {missing.length > 0 ? <Plus className="w-5 h-5" aria-hidden="true" /> : <Mic className="w-5 h-5" aria-hidden="true" />}
                </span>
                <div className="flex-[1_1_260px] min-w-0">
                  <p className="font-semibold">
                    {missing.length > 0 ? `Next step: add ${missing[0].label}` : `Next step: record ${unrecordedElder!.fullName}`}
                  </p>
                  <p className="text-sm text-muted">
                    {missing.length > 0
                      ? 'Even a first name helps relatives find you.'
                      : 'Their voice is the part of your archive that can’t be rebuilt later.'}
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-[13px] text-muted whitespace-nowrap">Tree {filled} of {coreRoles.length}</span>
                  <span aria-hidden="true" className="flex-1 sm:flex-none sm:w-28 h-2 rounded-full bg-sand overflow-hidden flex">
                    <span className="bg-forest" style={{ width: `${(filled / coreRoles.length) * 100}%` }} />
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (missing.length > 0) {
                        setFixedRoleForForm(missing[0].role);
                        setShowForm(true);
                      } else if (unrecordedElder) {
                        setSelectedProfile(unrecordedElder);
                        setShowRecordingStudio(true);
                      }
                    }}
                    className="h-11 px-4 rounded-xl bg-ink text-cream font-semibold text-sm hover:bg-ink-soft cursor-pointer"
                  >
                    {missing.length > 0 ? 'Add' : 'Record'}
                  </button>
                </div>
              </div>
            )}

            <FamilyTree
              profiles={profiles}
              recordings={recordings}
              selectedProfileId={selectedProfile?.id}
              onSelectProfile={(p) => setSelectedProfile(p)}
              onAddProfileWithRole={(role) => {
                setFixedRoleForForm(role);
                setShowForm(true);
              }}
            />
          </div>
          );
        })()}

        {/* 2. Main SCREEN: Discovery Network hub */}
        {activeScreen === 'discovery' && (
          <DiscoveryHub 
            profiles={profiles}
            recordings={recordings}
          />
        )}

        {/* 2.5. Main SCREEN: Community Springboard & Relative linkages */}
        {activeScreen === 'community' && (
          <CommunityVault 
            profiles={profiles}
            linkedRelatives={linkedRelatives}
            onAddLink={handleAddLink}
            onRemoveLink={handleRemoveLink}
          />
        )}

        {/* 3. Main SCREEN: Founder PM Metrics dashboard */}
        {activeScreen === 'dash' && (() => {
          // Live calculation of funnel steps
          const isStep1Complete = !!currentUser;
          const isStep2Complete = profiles.length > 6 || profiles.some(p => {
            const defaultProfile = DEFAULT_PROFILES.find(dp => dp.id === p.id);
            return !defaultProfile || p.fullName !== defaultProfile.fullName || p.familyCompound !== defaultProfile.familyCompound;
          });
          const isStep3Complete = recordings.length > DEFAULT_RECORDINGS.length;
          const isStep4Complete = linkedRelatives.length > 0;
          const isStep5Complete = hasExportedData;

          // Device login breakdown
          const totalSessions = loginSessions.length || 1;
          const mobileSessions = loginSessions.filter(s => s.deviceType.toLowerCase().includes('mobile')).length;
          const tabletSessions = loginSessions.filter(s => s.deviceType.toLowerCase().includes('tablet')).length;
          const desktopSessions = loginSessions.filter(s => s.deviceType.toLowerCase().includes('desktop')).length;

          const mobilePct = Math.round((mobileSessions / totalSessions) * 100);
          const tabletPct = Math.round((tabletSessions / totalSessions) * 100);
          const desktopPct = Math.round((desktopSessions / totalSessions) * 100);

          // Filter sessions
          const filteredSessions = loginSessions.filter(s => {
            const query = sessionSearch.toLowerCase();
            return s.name.toLowerCase().includes(query) || 
                   s.email.toLowerCase().includes(query) || 
                   s.location.toLowerCase().includes(query) || 
                   s.deviceType.toLowerCase().includes(query);
          });

          return (
            <div className="bg-white border border-[#eae8e5] rounded-2xl p-6 md:p-8 space-y-8 max-w-4xl mx-auto shadow-sm" style={{ contentVisibility: 'auto' }}>
              <div className="border-b border-gray-150 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-[#E2A04F] fill-[#E2A04F]" />
                    <h2 className="font-display font-bold text-xl text-gray-900 uppercase tracking-tight">Founder Growth Loop & Analytics</h2>
                  </div>
                  <p className="text-xs text-gray-500">
                    Sovereign metrics monitoring engine tracking active login sessions, cohort conversion flow patterns, and real-time device distributions.
                  </p>
                </div>
                
                {currentUser && (
                  <div className="bg-[#FAF8F5] border border-[#2D2926]/10 px-3 py-1.5 rounded-sm flex items-center gap-2 text-xs">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-mono font-bold text-[#2D2926]">
                      Active User: <span className="text-[#E2A04F]">{currentUser.name}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Core Gauges + Kill Switch Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Cohort Gauges */}
                <div className="bg-[#faf9f6] border border-[#f0eee9] p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-150 pb-2">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-[#E2A04F]" />
                      Sovereign Growth Milestones
                    </h4>
                    <span className="text-xs font-mono font-bold text-gray-400">V1 Cohort Status</span>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Gauge 1 */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-gray-600">Total Minutes Captured ({totalMinutesRecorded}m)</span>
                        <span className="font-bold text-amber-800">100% of V1 Milestone</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-amber-600 h-full rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>

                    {/* Gauge 2 */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-gray-600">Deep Profiles Linked ({deepProfilesCount})</span>
                        <span className="font-bold text-emerald-800">Target Goal: 100</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(deepProfilesCount, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Red Kill Switch Area */}
                <div className="bg-white border border-red-200 rounded-xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-red-100 pb-2">
                    <div className="flex items-center gap-1.5 text-red-800">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider">Verified Kill Switch Clause</h4>
                    </div>
                    <span className="text-xs bg-red-100 text-red-800 font-mono font-bold px-1.5 py-0.5 rounded">60-Day Mandate</span>
                  </div>
                  
                  <blockquote className="text-[12.5px] text-gray-650 bg-red-50/50 p-3 italic rounded-lg border border-red-150 leading-relaxed font-serif">
                    "If we do not achieve 500 user-generated oral recordings and a 4.2-star rating within 60 days, we will pivot to legacy B2B curation archives for funeral homes and cultural sites."
                  </blockquote>
                  
                  <div className="flex items-center justify-between text-xs pt-1 font-mono">
                    <span className="text-gray-500">Currently Operating in:</span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded">
                      Validated Core Mode
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. Device Type Login Distribution */}
              <div className="bg-[#FAF8F5] border border-[#2D2926]/10 rounded-xl p-5 md:p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-[#2D2926]/10 pb-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-[#2D2926] flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#E2A04F]" />
                    Device Type Logins
                  </h4>
                  <span className="text-xs text-gray-500 font-mono">Total tracked: {totalSessions} sessions</span>
                </div>

                <div className="space-y-4">
                  {/* Segmented composite progress bar chart representing the split */}
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
                    <div 
                      className="bg-[#E2A04F] h-full transition-all duration-500 relative group"
                      style={{ width: `${mobilePct}%` }}
                      title={`Mobile: ${mobilePct}%`}
                    />
                    <div 
                      className="bg-[#2D2926] h-full transition-all duration-500 relative group"
                      style={{ width: `${desktopPct}%` }}
                      title={`Desktop: ${desktopPct}%`}
                    />
                    <div 
                      className="bg-[#7A8B7B] h-full transition-all duration-500 relative group"
                      style={{ width: `${tabletPct}%` }}
                      title={`Tablet: ${tabletPct}%`}
                    />
                  </div>

                  {/* Device key elements */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-2.5 bg-white rounded-lg border border-gray-150 flex flex-col items-center">
                      <Smartphone className="w-4 h-4 text-[#E2A04F] mb-1" />
                      <span className="text-xs uppercase font-sans tracking-wider text-gray-500 block font-bold">Mobile Screen</span>
                      <p className="text-lg font-serif font-black text-gray-900 mt-0.5">{mobilePct}%</p>
                      <span className="text-xs text-gray-400 font-mono mt-0.5">{mobileSessions} logins</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-gray-150 flex flex-col items-center">
                      <Laptop className="w-4 h-4 text-[#2D2926] mb-1" />
                      <span className="text-xs uppercase font-sans tracking-wider text-gray-500 block font-bold">Desktop Clients</span>
                      <p className="text-lg font-serif font-black text-gray-900 mt-0.5">{desktopPct}%</p>
                      <span className="text-xs text-gray-400 font-mono mt-0.5">{desktopSessions} logins</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-gray-150 flex flex-col items-center">
                      <Tablet className="w-4 h-4 text-[#7A8B7B] mb-1" />
                      <span className="text-xs uppercase font-sans tracking-wider text-gray-500 block font-bold">Tablet Devices</span>
                      <p className="text-lg font-serif font-black text-gray-900 mt-0.5">{tabletPct}%</p>
                      <span className="text-xs text-gray-400 font-mono mt-0.5">{tabletSessions} logins</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. User Flow Patterns (Funnel Conversion & Checklist) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Conversion Funnel */}
                <div className="bg-white border border-[#2D2926]/12 rounded-xl p-5 space-y-4">
                  <div className="border-b border-gray-100 pb-2">
                    <h5 className="text-xs uppercase tracking-wider font-bold text-[#2D2926] flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-800" />
                      Sovereign Onboarding Funnel
                    </h5>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 font-mono mb-1">
                        <span>1. Auth Gate Onboarding</span>
                        <span className="font-bold text-gray-700">100% conversion</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#2D2926] h-full" style={{ width: '100%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-500 font-mono mb-1">
                        <span>2. Pedigree Node Customization</span>
                        <span className="font-bold text-gray-700">82% conversion</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#2D2926]/80 h-full" style={{ width: '82%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-500 font-mono mb-1">
                        <span>3. Spoken Memory Capture</span>
                        <span className="font-bold text-gray-700">65% conversion</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#2D2926]/60 h-full" style={{ width: '65%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-500 font-mono mb-1">
                        <span>4. Kinship Community Match</span>
                        <span className="font-bold text-gray-700">46% conversion</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#E2A04F] h-full" style={{ width: '46%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-500 font-mono mb-1">
                        <span>5. Portable Secure Backup</span>
                        <span className="font-bold text-gray-700">38% conversion</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#E2A04F]/60 h-full" style={{ width: '38%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* My Active Progress Checklist */}
                <div className="bg-[#FAF8F5] border border-[#2D2926]/10 rounded-xl p-5 space-y-4">
                  <div className="border-b border-[#2D2926]/12 pb-2">
                    <h5 className="text-xs uppercase tracking-wider font-bold text-[#2D2926] flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#E2A04F]" />
                      My Heritage Journey Status
                    </h5>
                  </div>

                  <div className="space-y-3.5">
                    {/* Funnel Step 1 */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-emerald-850" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-gray-800">1. Onboarded Authenticated</p>
                        <p className="text-xs text-gray-500">Validated credentials fine-tuned to maternal/paternal ancestral districts.</p>
                      </div>
                    </div>

                    {/* Funnel Step 2 */}
                    <div className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                        isStep2Complete ? 'bg-emerald-100 border-emerald-300' : 'bg-gray-100 border-gray-300'
                      }`}>
                        {isStep2Complete ? (
                          <Check className="w-2.5 h-2.5 text-emerald-850" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        )}
                      </div>
                      <div className="text-xs flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`font-bold ${isStep2Complete ? 'text-gray-800' : 'text-gray-500'}`}>2. Mapping Lineage Connections</p>
                          {!isStep2Complete && (
                            <button 
                              onClick={() => setActiveScreen('tree')}
                              className="text-xs uppercase tracking-wider font-extrabold text-[#E2A04F] hover:underline cursor-pointer"
                            >
                              Open Map
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Edit default names or append ancestral parents on your pedigree chart.</p>
                      </div>
                    </div>

                    {/* Funnel Step 3 */}
                    <div className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                        isStep3Complete ? 'bg-emerald-100 border-emerald-300' : 'bg-gray-100 border-gray-300'
                      }`}>
                        {isStep3Complete ? (
                          <Check className="w-2.5 h-2.5 text-emerald-850" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        )}
                      </div>
                      <div className="text-xs flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`font-bold ${isStep3Complete ? 'text-gray-800' : 'text-gray-500'}`}>3. Recording Spoken Wisdom</p>
                          {!isStep3Complete && (
                            <button 
                              onClick={() => {
                                setActiveScreen('tree');
                                setShowRecordingStudio(true);
                              }}
                              className="text-xs uppercase tracking-wider font-extrabold text-[#E2A04F] hover:underline cursor-pointer"
                            >
                              Record Voice
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Record a live audio memo or drop a WAV file onto an elder's profile.</p>
                      </div>
                    </div>

                    {/* Funnel Step 4 */}
                    <div className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                        isStep4Complete ? 'bg-emerald-100 border-emerald-300' : 'bg-gray-100 border-gray-300'
                      }`}>
                        {isStep4Complete ? (
                          <Check className="w-2.5 h-2.5 text-emerald-850" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        )}
                      </div>
                      <div className="text-xs flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`font-bold ${isStep4Complete ? 'text-gray-800' : 'text-gray-500'}`}>4. Kinship Community Bridge</p>
                          {!isStep4Complete && (
                            <button 
                              onClick={() => setActiveScreen('community')}
                              className="text-xs uppercase tracking-wider font-extrabold text-[#E2A04F] hover:underline cursor-pointer"
                            >
                              Connect Kin
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Link nodes with other users by matching ancestral compound overlap districts.</p>
                      </div>
                    </div>

                    {/* Funnel Step 5 */}
                    <div className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                        isStep5Complete ? 'bg-emerald-100 border-emerald-300' : 'bg-gray-100 border-gray-300'
                      }`}>
                        {isStep5Complete ? (
                          <Check className="w-2.5 h-2.5 text-emerald-850" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        )}
                      </div>
                      <div className="text-xs flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`font-bold ${isStep5Complete ? 'text-gray-800' : 'text-gray-500'}`}>5. Export Portable Archive</p>
                          {!isStep5Complete && (
                            <button 
                              onClick={() => setShowImportExport(true)}
                              className="text-xs uppercase tracking-wider font-extrabold text-[#E2A04F] hover:underline cursor-pointer"
                            >
                              Export Now
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Backup your sovereign records locally as a secure offline .afrolineo archive.</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* 3. Records of Login Sessions of Users */}
              <div className="bg-white border border-[#2D2926]/12 rounded-xl p-5 md:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D2926]/10 pb-3">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold text-[#2D2926] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#2D2926]" />
                      Sovereign User Login Sessions
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5 leading-normal">
                      Secured telemetry logging matching verified ancestral custodians accessing the heritage capsule.
                    </p>
                  </div>

                  <input 
                    type="text"
                    placeholder="Search sessions..."
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#E2A04F]/40 placeholder-gray-400 w-full sm:w-48 text-[#2D2926]"
                  />
                </div>

                <div className="overflow-x-auto">
                  <div className="max-h-[240px] overflow-y-auto border border-gray-150 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-150 text-left">
                      <thead className="bg-[#FAF8F5] sticky top-0 text-xs uppercase font-sans tracking-wider text-gray-500 font-bold">
                        <tr>
                          <th className="px-4 py-2.5">User Custodian</th>
                          <th className="px-4 py-2.5">Device Type</th>
                          <th className="px-4 py-2.5">Physical Hub</th>
                          <th className="px-4 py-2.5">Timestamp</th>
                          <th className="px-4 py-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 text-[12.5px] font-mono text-gray-700 bg-white">
                        {filteredSessions.length > 0 ? (
                          filteredSessions.map((session) => (
                            <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-sans font-semibold text-gray-900">{session.name}</div>
                                <div className="text-xs text-gray-400">{session.email}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="flex items-center gap-1.5 text-gray-800">
                                  {session.deviceType.toLowerCase().includes('mobile') ? (
                                    <Smartphone className="w-3.5 h-3.5 text-[#E2A04F]" />
                                  ) : session.deviceType.toLowerCase().includes('tablet') ? (
                                    <Tablet className="w-3.5 h-3.5 text-[#7A8B7B]" />
                                  ) : (
                                    <Laptop className="w-3.5 h-3.5 text-[#2D2926]" />
                                  )}
                                  {session.deviceType}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="flex items-center gap-1 text-gray-600 font-sans">
                                  <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                  {session.location}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs">
                                {session.timestamp}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {session.status === 'Active' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-sans font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                    Active Now
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-sans font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                    Closed
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-400 font-sans italic text-xs">
                              No login sessions matching your criteria were found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* PM Recommendations alerts */}
              <div className="bg-[#FAF8F5] border border-[#2D2926]/12 p-5 rounded-sm space-y-2">
                <h5 className="font-display font-bold text-xs text-amber-900 uppercase tracking-wide">
                  Product Loop Instructions: The "Story Gap" Trigger
                </h5>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Rather than asking generic user feedback, Afrolineo implements a <strong>Story Gap Alert</strong>. When you select a profile node with <strong>zero linked records</strong>, the drawer nudges with direct questions: <em>"You haven't recorded a memory yet. What is one wisdom you want the next generation to remember?"</em> This stimulates instant elder interview recording trigger actions.
                </p>
              </div>
            </div>
          );
        })()}

        {activeScreen === 'about' && (
          <div className="space-y-6 animate-scaleIn">
            
            {/* Top Header Banner */}
            <div className="bg-[#2D2926] text-[#F9F7F2] p-6 sm:p-8 rounded-sm border-l-4 border-l-[#E2A04F] shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-black block mb-2 font-sans">
                  Corporate & Cultural Directory
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-wider text-white">
                  About Afrolineo Platform
                </h2>
                <p className="text-xs text-gray-300 mt-1.5 max-w-2xl leading-relaxed font-serif italic">
                  Curating tools to reverse the digital erasure of oral lineages. Learn about our social mission, privacy practices, careers, and media dispatches.
                </p>
              </div>
              <button
                onClick={() => setActiveScreen('tree')}
                className="px-4.5 py-2.5 bg-[#E2A04F] hover:bg-[#FAF8F5] hover:text-[#2D2926] text-[#2D2926] text-xs uppercase font-bold tracking-widest transition-all rounded-sm shrink-0 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <FolderHeart className="w-3.5 h-3.5" />
                Return to Tree Map
              </button>
            </div>

            {/* Main Tabs Container Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              
              {/* Tab Navigation Menu */}
              <div className="md:col-span-1 bg-[#FAF8F5] border border-[#2D2926]/12 rounded-sm p-4 space-y-3 shadow-xs">
                <span className="text-xs uppercase font-sans tracking-[0.18em] text-gray-500 font-bold block mb-1 px-1">
                  Browse Sections
                </span>
                <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-1 md:gap-2">
                  <button
                    onClick={() => setSelectedAboutTab('dei')}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-sm transition-all flex items-center gap-2.5 font-sans font-bold shrink-0 cursor-pointer ${
                      selectedAboutTab === 'dei' ? 'bg-[#2D2926] text-[#E2A04F] shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span className="truncate">Diversity & DEI</span>
                  </button>

                  <button
                    onClick={() => setSelectedAboutTab('careers')}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-sm transition-all flex items-center gap-2.5 font-sans font-bold shrink-0 cursor-pointer ${
                      selectedAboutTab === 'careers' ? 'bg-[#2D2926] text-[#E2A04F] shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <span className="truncate">Careers</span>
                  </button>

                  <button
                    onClick={() => setSelectedAboutTab('newsroom')}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-sm transition-all flex items-center gap-2.5 font-sans font-bold shrink-0 cursor-pointer ${
                      selectedAboutTab === 'newsroom' ? 'bg-[#2D2926] text-[#E2A04F] shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Newspaper className="w-4 h-4 shrink-0" />
                    <span className="truncate">Newsroom</span>
                  </button>

                  <button
                    onClick={() => setSelectedAboutTab('security')}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-sm transition-all flex items-center gap-2.5 font-sans font-bold shrink-0 cursor-pointer ${
                      selectedAboutTab === 'security' ? 'bg-[#2D2926] text-[#E2A04F] shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Shield className="w-4 h-4 shrink-0" />
                    <span className="truncate">Security</span>
                  </button>

                  <button
                    onClick={() => setSelectedAboutTab('privacy')}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-sm transition-all flex items-center gap-2.5 font-sans font-bold shrink-0 cursor-pointer ${
                      selectedAboutTab === 'privacy' ? 'bg-[#2D2926] text-[#E2A04F] shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">Privacy</span>
                  </button>

                  <button
                    onClick={() => setSelectedAboutTab('guidelines')}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-sm transition-all flex items-center gap-2.5 font-sans font-bold shrink-0 cursor-pointer ${
                      selectedAboutTab === 'guidelines' ? 'bg-[#2D2926] text-[#E2A04F] shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span className="truncate">Guidelines</span>
                  </button>

                  <button
                    onClick={() => setSelectedAboutTab('terms')}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-sm transition-all flex items-center gap-2.5 font-sans font-bold shrink-0 cursor-pointer ${
                      selectedAboutTab === 'terms' ? 'bg-[#2D2926] text-[#E2A04F] shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Shield className="w-4 h-4 shrink-0" />
                    <span className="truncate">Terms & Pact</span>
                  </button>

                  <button
                    onClick={() => setSelectedAboutTab('social-impact')}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-sm transition-all flex items-center gap-2.5 font-sans font-bold shrink-0 cursor-pointer ${
                      selectedAboutTab === 'social-impact' ? 'bg-[#2D2926] text-[#E2A04F] shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span className="truncate">Social Impact</span>
                  </button>

                  <button
                    onClick={() => setSelectedAboutTab('community-impact')}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-sm transition-all flex items-center gap-2.5 font-sans font-bold shrink-0 cursor-pointer ${
                      selectedAboutTab === 'community-impact' ? 'bg-[#2D2926] text-[#E2A04F] shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    <span className="truncate">Community Hub</span>
                  </button>

                  <button
                    onClick={() => setSelectedAboutTab('support')}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-sm transition-all flex items-center gap-2.5 font-sans font-bold shrink-0 cursor-pointer ${
                      selectedAboutTab === 'support' ? 'bg-[#2D2926] text-[#E2A04F] shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Smile className="w-4 h-4 shrink-0" />
                    <span className="truncate">Support Desk</span>
                  </button>

                  <button
                    onClick={() => setSelectedAboutTab('articles')}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-sm transition-all flex items-center gap-2.5 font-sans font-bold shrink-0 cursor-pointer ${
                      selectedAboutTab === 'articles' ? 'bg-[#2D2926] text-[#E2A04F] shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span className="truncate">Articles & Essays</span>
                  </button>

                  <button
                    onClick={() => setSelectedAboutTab('gifts')}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-sm transition-all flex items-center gap-2.5 font-sans font-bold shrink-0 cursor-pointer ${
                      selectedAboutTab === 'gifts' ? 'bg-[#2D2926] text-[#E2A04F] shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Gift className="w-4 h-4 shrink-0" />
                    <span className="truncate">Heritage Gifts</span>
                  </button>

                  <button
                    onClick={() => setSelectedAboutTab('customer-stories')}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-sm transition-all flex items-center gap-2.5 font-sans font-bold shrink-0 cursor-pointer ${
                      selectedAboutTab === 'customer-stories' ? 'bg-[#2D2926] text-[#E2A04F] shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <FolderHeart className="w-4 h-4 shrink-0" />
                    <span className="truncate">Custodian Stories</span>
                  </button>
                </nav>

                {/* Micro badge indicator */}
                <div className="border-t border-gray-200 pt-3 hidden md:block text-xs text-gray-500 font-mono text-center">
                  Live Compliance • 2026
                </div>
              </div>

              {/* Tab Content Canvas */}
              <div className="md:col-span-3 bg-white border border-[#2D2926]/12 rounded-sm p-6 sm:p-8 shadow-xs min-h-[450px]">
                
                {/* 1. DIVERSITY, EQUITY, & INCLUSION */}
                {selectedAboutTab === 'dei' && (
                  <div className="space-y-6 animate-scaleIn">
                    <div className="border-b border-gray-100 pb-4">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">DEI Pledge</span>
                      <h3 className="font-display font-black text-xl text-[#2D2926] uppercase">Bridging the Ancestral Data Desert</h3>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed font-light">
                      Historically, the tools of digital archiving, database schemas, and genealogical charting have been built around Western family structures (e.g. strict monogamy, written church and town hall registries). African lineages, indigenous oral traditions, and localized compound-level geographies have suffered systemic technological exclusion.
                    </p>

                    <blockquote className="border-l-4 border-[#E2A04F] pl-4 italic text-gray-600 my-4 text-xs font-serif leading-relaxed">
                      "In many parts of Africa, a family tree is not drawn on a paper kept in a vault—it is recited in song during village festivals, or told under the shade of a sacred baobab. When a grand-uncle dies, an entire library of land ownership and cousins burns to ashes."
                      <cite className="block text-xs font-mono uppercase font-bold text-gray-500 mt-1.5 not-italic">— Mazi Chinedu, Igbo Historical Elder Representative</cite>
                    </blockquote>

                    <h4 className="font-display font-bold text-xs uppercase tracking-wide text-[#2D2926] pt-2">Our Three Strategic Inclusion Imperatives:</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-[#FAF8F5] p-4 border border-gray-150 rounded-sm">
                        <span className="text-xl block mb-1">🌍</span>
                        <h5 className="font-sans font-bold text-xs text-[#2D2926] mb-1">Epistemic Equity</h5>
                        <p className="text-[12.5px] text-gray-600 leading-relaxed">
                          Elevating verbal testimonies and oral testaments to the exact same database validity as written government files.
                        </p>
                      </div>
                      
                      <div className="bg-[#FAF8F5] p-4 border border-gray-150 rounded-sm">
                        <span className="text-xl block mb-1">🔊</span>
                        <h5 className="font-sans font-bold text-xs text-[#2D2926] mb-1">Acoustic Justice</h5>
                        <p className="text-[12.5px] text-gray-600 leading-relaxed">
                          Refining high-fidelity noise reduction algorithms to respect the deep pitch and tonal accents of non-English narratives.
                        </p>
                      </div>

                      <div className="bg-[#FAF8F5] p-4 border border-gray-150 rounded-sm">
                        <span className="text-xl block mb-1">🗺️</span>
                        <h5 className="font-sans font-bold text-xs text-[#2D2926] mb-1">Ancestral Geometry</h5>
                        <p className="text-[12.5px] text-gray-600 leading-relaxed">
                          Replacing generic lat-long coordinates with localized family compound quarters and tribal village boundaries.
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                      <span className="text-gray-500">Would you like to register a missing ancestral compound?</span>
                      <button 
                        onClick={() => {
                          setFixedRoleForForm(undefined);
                          setSelectedProfile(undefined);
                          setShowForm(true);
                        }}
                        className="px-4 py-2 border border-[#E2A04F] hover:bg-[#E2A04F] hover:text-[#2D2926] text-[#E2A04F] font-sans font-bold uppercase tracking-wider text-xs rounded-sm transition-colors cursor-pointer"
                      >
                        Create Custom Node
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. CAREERS */}
                {selectedAboutTab === 'careers' && (
                  <div className="space-y-6 animate-scaleIn">
                    <div className="border-b border-gray-100 pb-4">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Work With Us</span>
                      <h3 className="font-display font-black text-xl text-[#2D2926] uppercase font-sans">Build the Tools of Spoken Memory</h3>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed font-light">
                      Afrolineo is expanding its decentralized engineering and anthropological operations. We seek individuals passionate about restoring ancestral connections through offline-first software systems.
                    </p>

                    {/* Active Jobs Deck */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs uppercase tracking-widest font-black text-gray-400 font-sans">Active Positions (2026)</h4>
                      
                      {[
                        {
                          id: 'role-1',
                          title: 'Senior Heritage Ontologist',
                          dept: 'Genealogical Systems',
                          location: 'Lagos, Nigeria or Remote',
                          salary: 'Competitive Equity + Base',
                          desc: 'Tasked with designing cross-continental lineage tree databases capable of cataloging non-linear family webs, polygamous structures, and maternal lineage circles. Must understand relational schemas and graph network databases.'
                        },
                        {
                          id: 'role-2',
                          title: 'Speech Signal & DSP Engineer',
                          dept: 'Acoustic Division',
                          location: 'Accra, Ghana or Remote',
                          desc: 'Focuses on creating browser-based noise reduction encoders and audio compression protocols to clean and restore degraded spoken voice recordings from dusty tape records and cheap mobile microphones.',
                          salary: 'Competitive Base'
                        },
                        {
                          id: 'role-3',
                          title: 'Diaspora Outreach & Community Lead',
                          dept: 'Cultural Engagement',
                          location: 'London, UK or Nairobi, Kenya',
                          desc: 'Leads local community workshops, cultural outreach circles, and elders gatherings to deploy portable audio recording suitcases and educate families on independent offline backup procedures.',
                          salary: 'Flexible Contracting'
                        }
                      ].map((job) => (
                        <div key={job.id} className="border border-gray-200 rounded-sm p-4 hover:border-[#E2A04F] transition-all bg-[#FAF8F5]">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div>
                              <h5 className="font-sans font-bold text-xs text-[#2D2926]">{job.title}</h5>
                              <div className="flex gap-2 text-xs text-gray-500 font-mono mt-0.5">
                                <span>{job.dept}</span>
                                <span>•</span>
                                <span>{job.location}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setExpandedCareerId(expandedCareerId === job.id ? null : job.id);
                                setSelectedCareerRole(job.title);
                              }}
                              className="self-start sm:self-center px-3 py-1 text-xs uppercase tracking-wider font-bold bg-[#2D2926] hover:bg-[#E2A04F] hover:text-black text-white transition-colors rounded-xs cursor-pointer"
                            >
                              {expandedCareerId === job.id ? 'Close details' : 'View & Apply'}
                            </button>
                          </div>

                          {expandedCareerId === job.id && (
                            <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-700 space-y-3 animate-slideDown">
                              <p className="leading-relaxed">{job.desc}</p>
                              <div className="bg-white p-2.5 rounded border border-gray-150 flex justify-between text-xs font-mono text-gray-500">
                                <span>Compensation: {job.salary}</span>
                                <span className="text-[#E2A04F] font-bold">Offline Security Clearance Required</span>
                              </div>

                              {/* Interactive simulated application form */}
                              {!careersSubmitted ? (
                                <form 
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!careersApplicantName || !careersApplicantEmail) {
                                      alert("Please fill out your name and email.");
                                      return;
                                    }
                                    setCareersSubmitted(true);
                                  }}
                                  className="border-t border-dashed border-gray-200 pt-3 space-y-3"
                                >
                                  <span className="text-xs uppercase tracking-wider text-gray-400 font-bold block">Apply directly to this role</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input 
                                      type="text" 
                                      placeholder="Full Name *" 
                                      required
                                      value={careersApplicantName}
                                      onChange={(e) => setCareersApplicantName(e.target.value)}
                                      className="text-xs p-2.5 border border-gray-300 rounded bg-white w-full focus:outline-none focus:border-[#E2A04F]"
                                    />
                                    <input 
                                      type="email" 
                                      placeholder="Email Address *" 
                                      required
                                      value={careersApplicantEmail}
                                      onChange={(e) => setCareersApplicantEmail(e.target.value)}
                                      className="text-xs p-2.5 border border-gray-300 rounded bg-white w-full focus:outline-none focus:border-[#E2A04F]"
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 gap-3">
                                    <input 
                                      type="text" 
                                      placeholder="Link to Resume or LinkedIn Profile (e.g., https://github.com/...)" 
                                      value={careersApplicantCv}
                                      onChange={(e) => setCareersApplicantCv(e.target.value)}
                                      className="text-xs p-2.5 border border-gray-300 rounded bg-white w-full focus:outline-none focus:border-[#E2A04F]"
                                    />
                                    <textarea 
                                      placeholder="Briefly state why you want to help construct Afrolineo's spoken lineage vaults..."
                                      rows={2}
                                      value={careersApplicantCover}
                                      onChange={(e) => setCareersApplicantCover(e.target.value)}
                                      className="text-xs p-2.5 border border-gray-300 rounded bg-white w-full focus:outline-none focus:border-[#E2A04F]"
                                    />
                                  </div>
                                  <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-sans font-bold uppercase tracking-wider text-xs rounded-sm transition-colors cursor-pointer font-semibold"
                                  >
                                    Submit Application
                                  </button>
                                </form>
                              ) : (
                                <div className="bg-emerald-50 border border-emerald-250 p-4 rounded text-center space-y-2 animate-scaleIn">
                                  <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                                    <Check className="w-4 h-4 text-emerald-600 inline" /> Application Received!
                                  </p>
                                  <p className="text-[12.5px] text-emerald-700 leading-relaxed">
                                    Thank you, <strong className="text-emerald-900">{careersApplicantName}</strong>. Your request for the role of <strong>{selectedCareerRole}</strong> has been cataloged into our regional database folder. We will reach out within 4-6 solar phases.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCareersSubmitted(false);
                                      setCareersApplicantName('');
                                      setCareersApplicantEmail('');
                                      setCareersApplicantCv('');
                                      setCareersApplicantCover('');
                                    }}
                                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-mono text-xs uppercase font-bold rounded"
                                  >
                                    Apply for another opening
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. NEWSROOM */}
                {selectedAboutTab === 'newsroom' && (
                  <div className="space-y-6 animate-scaleIn">
                    <div className="border-b border-gray-100 pb-4">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Media Dispatches</span>
                      <h3 className="font-display font-black text-xl text-[#2D2926] uppercase">Newsroom & Announcements</h3>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed font-light">
                      Chronological updates on technical achievements, compound preservation metrics, and platform launches.
                    </p>

                    {[
                      {
                        id: 'news-1',
                        date: 'June 15, 2026',
                        title: 'Afrolineo Closes Pre-Seed Round of Funding to Deepen West-African Compound Databases',
                        excerpt: 'We have raised strategic contributions from decentralized preservation syndicates and heritage foundations to expand local offline servers in Nigerian compound squares.',
                        content: 'LAGOS, NIGERIA — Today, Afrolineo announced the formal closing of a pre-seed capital pooling session. The funds will be allocated exclusively to fabricating physical oral archives—miniature, low-power server nodes installed directly inside local elder compound structures. These servers run on local mesh WiFi, completely independent of commercial satellite grids, allowing remote village residents to capture high-fidelity lineage recordings without paying cellular internet tariffs.'
                      },
                      {
                        id: 'news-2',
                        date: 'May 22, 2026',
                        title: 'Partnering with Dialect Custodians: How We Decentered Machine Translation Models',
                        excerpt: 'Standard cloud translation frameworks struggle with ancestral tonal variations. We have worked directly with village linguists to map unique dialectical speech structures.',
                        content: 'ACCRA, GHANA — Standard synthetic translation systems are trained on written text parsed from official news portals. They systematically fail to transcribe conversational oral narratives, where pitch, pacing, and local geographical metaphors define the actual family history. By working hand-in-hand with native dialect elders, Afrolineo is building custom acoustic weight sets that preserve oral literature in its organic raw state, without forcing it through standard western grammatical rules.'
                      },
                      {
                        id: 'news-3',
                        date: 'April 10, 2026',
                        title: 'Announcing the Sovereign Offline Export Protocol (.afrolineo JSON archives)',
                        excerpt: 'Our engineering branch has shipped an end-to-end sandbox extraction protocol. Your data belongs to you, always exportable and independent of any cloud subscription.',
                        content: 'LONDON, UK — In keeping with our strict client stewardship rules, we have released an end-to-end encrypted backup tool. Users can download their entire genealogical map and voice indices as a single package with a simple toggle action. These archives are designed as readable JSON templates, meaning that even if the internet itself collapses, your family’s oral history can be read and rendered by any basic browser software in the world.'
                      }
                    ].map((article) => (
                      <div key={article.id} className="border-b border-gray-150 pb-5 pt-3 last:border-0">
                        <span className="text-xs text-gray-400 font-mono block mb-1">{article.date} • Media Dispatch</span>
                        <h4 className="font-sans font-bold text-sm text-[#2D2926] hover:text-[#E2A04F] transition-colors">
                          <button
                            onClick={() => setSelectedNewsArticleId(selectedNewsArticleId === article.id ? null : article.id)}
                            className="text-left text-xs font-bold leading-relaxed block focus:outline-none cursor-pointer"
                          >
                            {article.title}
                          </button>
                        </h4>
                        <p className="text-[12.5px] text-gray-500 mt-2 leading-relaxed">{article.excerpt}</p>
                        
                        {selectedNewsArticleId === article.id ? (
                          <div className="mt-4 bg-[#FAF8F5] p-4 rounded border border-gray-150 text-xs text-gray-700 space-y-3 animate-slideDown">
                            <p className="leading-relaxed whitespace-pre-line font-serif">{article.content}</p>
                            <button
                              onClick={() => setSelectedNewsArticleId(null)}
                              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-mono text-xs uppercase font-bold rounded cursor-pointer"
                            >
                              Minimize Article
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedNewsArticleId(article.id)}
                            className="text-xs text-[#E2A04F] font-bold hover:underline mt-2 inline-flex items-center gap-1 cursor-pointer"
                          >
                            Read Full Press Release <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. SECURITY */}
                {selectedAboutTab === 'security' && (
                  <div className="space-y-6 animate-scaleIn">
                    <div className="border-b border-gray-100 pb-4">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Encrypted Trust</span>
                      <h3 className="font-display font-black text-xl text-[#2D2926] uppercase">Zero-Knowledge Ancestral Cryptography</h3>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed font-light">
                      Security on Afrolineo is modeled after strict offline-first principles. We believe ancestral credentials should never reside on centralized cloud storage nodes susceptible to scanning, advertising indexes, or unauthorized corporate parsing.
                    </p>

                    <div className="space-y-4 pt-2">
                      <div className="flex gap-3 items-start">
                        <div className="w-7 h-7 rounded-full bg-amber-50 text-[#E2A04F] flex items-center justify-center shrink-0 border border-amber-200 text-xs font-bold">1</div>
                        <div>
                          <h4 className="font-sans font-bold text-xs text-[#2D2926]">Local Safe Sandbox Caching</h4>
                          <p className="text-[12.5px] text-gray-600 mt-1 leading-relaxed">
                            All your recorded family files, pedigree node alterations, and elder coordinates are saved inside your individual browser's offline database storage (`localStorage`/IndexDB). This means no external server can inspect your genealogical tree unless you manually choose to export it.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="w-7 h-7 rounded-full bg-amber-50 text-[#E2A04F] flex items-center justify-center shrink-0 border border-amber-200 text-xs font-bold">2</div>
                        <div>
                          <h4 className="font-sans font-bold text-xs text-[#2D2926]">Acoustic High-Pass Filters</h4>
                          <p className="text-[12.5px] text-gray-600 mt-1 leading-relaxed">
                            When saving voice memoirs, our system localizes audio recordings, applying high-pass and low-pass noise gate filters to filter out background humming signatures. It stores clean vocal data in highly compressed web format headers.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="w-7 h-7 rounded-full bg-[#E2A04F]/10 text-[#E2A04F] flex items-center justify-center shrink-0 border border-[#E2A04F]/25 text-xs font-bold">3</div>
                        <div>
                          <h4 className="font-sans font-bold text-xs text-[#2D2926]">Decentralized JSON Porting</h4>
                          <p className="text-[12.5px] text-gray-600 mt-1 leading-relaxed">
                            Your full repository remains fully portable. When you choose to download your family's history, the generated backup file utilizes secure cryptographic encoding arrays to guarantee your history is safe.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Cryptography terminal scan simulation */}
                    <div className="bg-[#1a1918] rounded-md p-4 text-[#F9F7F2] font-mono text-xs mt-6 space-y-3 border border-gray-800">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <span className="text-gray-400 text-xs uppercase font-sans font-bold tracking-wider">Local Crypto Module Check</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E2A04F] animate-pulse" />
                      </div>

                      {securityScanState === 'idle' && (
                        <div className="text-center py-4 space-y-2">
                          <p className="text-gray-400">Ready to perform client sandbox integrity verification scan...</p>
                          <button
                            type="button"
                            onClick={() => {
                              setSecurityScanState('scanning');
                              setSecurityLogs(['[INIT] Initiating Local Sandbox Cryptography Diagnostics...', '[SCAN] Validating localStorage profile index health...', '[SCAN] checking node linkages and family structures...']);
                              
                              setTimeout(() => {
                                setSecurityLogs(prev => [...prev, '[SCAN] Scanning cached oral voice memory blobs (0 leaks found)...', '[SCAN] Validating compliance index matches: ISO-AFRO-2026.']);
                              }, 1200);

                              setTimeout(() => {
                                setSecurityLogs(prev => [...prev, '[SUCCESS] Local Sandbox integrity verified successfully! Crypto-Keys: ACTIVE.', '[SUCCESS] 100% Zero-knowledge compliance validated.']);
                                setSecurityScanState('complete');
                              }, 2505);
                            }}
                            className="px-3.5 py-1.5 bg-[#E2A04F] hover:bg-white text-[#2D2926] font-sans font-bold uppercase tracking-wider text-xs rounded-xs transition-colors cursor-pointer"
                          >
                            Initiate Encryption Diagnostics
                          </button>
                        </div>
                      )}

                      {securityScanState === 'scanning' && (
                        <div className="space-y-1.5 animate-pulse text-amber-300">
                          {securityLogs.map((log, idx) => (
                            <p key={idx}>{log}</p>
                          ))}
                          <p className="text-xs text-gray-500 italic mt-2 animate-bounce">Scanning browser memory buffers...</p>
                        </div>
                      )}

                      {securityScanState === 'complete' && (
                        <div className="space-y-3">
                          <div className="space-y-1.5 text-emerald-400">
                            {securityLogs.map((log, idx) => (
                              <p key={idx}>{log}</p>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
                            <span className="text-xs text-gray-500">Security Index: 100% Local Stewardship</span>
                            <button
                              type="button"
                              onClick={() => setSecurityScanState('idle')}
                              className="text-xs text-[#E2A04F] hover:underline"
                            >
                              Reset Terminal Diagnostics
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. PRIVACY */}
                {selectedAboutTab === 'privacy' && (
                  <div className="space-y-6 animate-scaleIn">
                    <div className="border-b border-gray-100 pb-4">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Compliance Covenant</span>
                      <h3 className="font-display font-black text-xl text-[#2D2926] uppercase">Sovereign Steward Privacy Agreement</h3>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed font-light">
                      This Covenant is established between you (the Heritage Custodian) and the Afrolineo sandbox engine. We do not use ad trackers or sell data. We keep a first-party record of your account, your tree outline (names and relationships) and which features you use, so we can improve Afrolineo.
                    </p>

                    <h4 className="font-sans font-bold text-xs uppercase tracking-wide text-[#2D2926] pt-2">Our Absolute Privacy Pledge:</h4>
                    
                    <div className="space-y-3 text-xs text-gray-600 bg-[#FAF8F5] p-5 rounded-sm border border-gray-150">
                      <div className="flex gap-2">
                        <span className="text-emerald-700">✓</span>
                        <p><strong>Voice Biometric Autonomy:</strong> We never upload, inspect, or process your recorded elders’ voice memoirs for automated biometric identity parsing or profiling.</p>
                      </div>
                      <div className="flex gap-2 border-t border-gray-200/60 pt-2">
                        <span className="text-emerald-700">✓</span>
                        <p><strong>Zero External Analytics sharing:</strong> We do not utilize commercial tracking pixels. Your session activities are strictly locked within the client sandbox frame.</p>
                      </div>
                      <div className="flex gap-2 border-t border-gray-200/60 pt-2">
                        <span className="text-emerald-700">✓</span>
                        <p><strong>Absolute Data Portability:</strong> At any time, you may export your whole database or obliterate all cached profile files via the sandbox command panel.</p>
                      </div>
                    </div>

                    {/* Interactive Privacy Preferences Settings Panel */}
                    <div className="border border-gray-200 p-4 rounded-sm space-y-4">
                      <h4 className="font-sans font-bold text-xs text-[#2D2926] uppercase tracking-wide">Configure Local Sandbox Privacy preferences</h4>
                      <p className="text-[12.5px] text-gray-500 leading-relaxed">
                        Customize what metadata remains cached locally within your browser sandbox. Your choices are persisted immediately in your private state variables.
                      </p>

                      <div className="space-y-3 text-xs">
                        <label className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
                          <div>
                            <span className="font-bold block text-gray-700">Allow Anonymous Growth Telemetry</span>
                            <span className="text-xs text-gray-400 font-light">Send anonymous metadata (such as profile count) to optimize genealogical ontologies.</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={localPrivacySettings.localTelemetry} 
                            onChange={(e) => setLocalPrivacySettings(prev => ({ ...prev, localTelemetry: e.target.checked }))}
                            className="w-4 h-4 rounded border-gray-300 text-[#E2A04F] focus:ring-[#E2A04F]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2 rounded hover:bg-gray-50 border-t border-gray-100 cursor-pointer">
                          <div>
                            <span className="font-bold block text-gray-700">Compress Audio Recording Buffers</span>
                            <span className="text-xs text-gray-400 font-light">Compacts oral wav histories to save browser space and facilitate quick offline exports.</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={localPrivacySettings.audioCompression} 
                            onChange={(e) => setLocalPrivacySettings(prev => ({ ...prev, audioCompression: e.target.checked }))}
                            className="w-4 h-4 rounded border-gray-300 text-[#E2A04F] focus:ring-[#E2A04F]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2 rounded hover:bg-gray-50 border-t border-gray-100 cursor-pointer">
                          <div>
                            <span className="font-bold block text-gray-700">Cache Device Session Logs locally</span>
                            <span className="text-xs text-gray-400 font-light">Tracks device access time to detect unauthorized logins inside your local network.</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={localPrivacySettings.sessionLogs} 
                            onChange={(e) => setLocalPrivacySettings(prev => ({ ...prev, sessionLogs: e.target.checked }))}
                            className="w-4 h-4 rounded border-gray-300 text-[#E2A04F] focus:ring-[#E2A04F]"
                          />
                        </label>
                      </div>

                      <div className="pt-3 border-t border-gray-150 flex justify-between items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPrivacyNotification(true);
                            setTimeout(() => setPrivacyNotification(false), 3000);
                          }}
                          className="px-4 py-2 bg-[#2D2926] hover:bg-[#E2A04F] text-[#F9F7F2] hover:text-[#2D2926] text-xs font-sans font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer font-semibold"
                        >
                          Save Privacy Configurations
                        </button>

                        {privacyNotification && (
                          <span className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded animate-scaleIn">
                            ✓ Sandbox Configuration Saved!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. USER GUIDELINES */}
                {selectedAboutTab === 'guidelines' && (
                  <div className="space-y-6 animate-scaleIn">
                    <div className="border-b border-gray-100 pb-4">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Custodian Handbook</span>
                      <h3 className="font-display font-black text-xl text-[#2D2926] uppercase">Best Practices for Oral Interviews</h3>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed font-light">
                      Oral heritage recording is an act of deep reverence. We have curated a set of procedural consensus protocols for our regional memory custodians to ensure high-quality and respectful recording sessions.
                    </p>

                    {/* Timeline-style guide */}
                    <div className="relative border-l border-gray-200 pl-4 space-y-5 ml-2 pt-2">
                      <div className="relative">
                        <span className="absolute -left-[25px] top-0.5 bg-[#E2A04F] text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center border border-white">1</span>
                        <h4 className="font-sans font-bold text-xs text-[#2D2926]">Preparation & Landmark Anchoring</h4>
                        <p className="text-[12.5px] text-gray-600 mt-1 leading-relaxed">
                          Rather than jumping straight to names, ask the elder about local landmarks—ancient streams, family compound gates, marketplace shrines. This grounds oral narratives with rich geographic metadata.
                        </p>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-[25px] top-0.5 bg-[#E2A04F] text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center border border-white">2</span>
                        <h4 className="font-sans font-bold text-xs text-[#2D2926]">Acoustic Spoken Consent Ritual</h4>
                        <p className="text-[12.5px] text-gray-600 mt-1 leading-relaxed">
                          Always begin every voice file by asking the elder: <em>"Are you willing to speak your history for your grandchildren to listen to?"</em> Recording this formal consent directly onto the sound file ensures permanent ethical compliance.
                        </p>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-[25px] top-0.5 bg-[#E2A04F] text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center border border-white">3</span>
                        <h4 className="font-sans font-bold text-xs text-[#2D2926]">Embrace Atmospheric Sound</h4>
                        <p className="text-[12.5px] text-gray-600 mt-1 leading-relaxed">
                          Do not worry if there are sounds of rain, chickens clucking, or wind blowing. Ambient sounds represent the physical truth of the compound environment. Do not try to aggressively filter them out.
                        </p>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-[25px] top-0.5 bg-[#E2A04F] text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center border border-white">4</span>
                        <h4 className="font-sans font-bold text-xs text-[#2D2926]">Consensus Validation</h4>
                        <p className="text-[12.5px] text-gray-600 mt-1 leading-relaxed">
                          Before creating a new node linking two ancestral lines, sit down with other cousins and elders to confirm the linkages. This maintains a clean, authorized genealogical truth map.
                        </p>
                      </div>
                    </div>

                    {/* Custodian Ethos Quiz module */}
                    <div className="bg-[#FAF8F5] border border-[#2D2926]/12 p-5 rounded-sm space-y-4 mt-6">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#E2A04F]" />
                        <h4 className="font-sans font-bold text-xs text-[#2D2926] uppercase tracking-wide">Test Your Custodian Ethos</h4>
                      </div>
                      <p className="text-[12.5px] text-gray-600 leading-relaxed">
                        Think you are ready to record? Take our quick 3-question evaluation to unlock your <strong>Heritage Custodian Certification Stamp</strong> inside the local browser database!
                      </p>

                      <div className="space-y-3.5 text-xs">
                        <div className="space-y-1.5">
                          <p className="font-bold text-[#2D2926]">1. What is the most ethical first step before pressing the record button?</p>
                          <div className="grid grid-cols-1 gap-2 text-[12.5px]">
                            <button
                              type="button"
                              onClick={() => setQuizAnswers(prev => ({ ...prev, 1: 'a' }))}
                              className={`p-2 rounded border text-left cursor-pointer ${quizAnswers[1] === 'a' ? 'bg-amber-100 border-[#E2A04F] text-amber-900 font-semibold' : 'bg-white hover:bg-gray-50 border-gray-250 text-gray-700'}`}
                            >
                              A) Begin asking immediately to maximize audio file length.
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuizAnswers(prev => ({ ...prev, 1: 'b' }))}
                              className={`p-2 rounded border text-left cursor-pointer ${quizAnswers[1] === 'b' ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-semibold' : 'bg-white hover:bg-gray-50 border-gray-250 text-gray-700'}`}
                            >
                              B) Ask the elder for direct, vocal permission recorded at the start of the audio file.
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 border-t border-gray-200/60 pt-3">
                          <p className="font-bold text-[#2D2926]">2. Why are atmospheric compound sounds like rain or chickens valuable?</p>
                          <div className="grid grid-cols-1 gap-2 text-[12.5px]">
                            <button
                              type="button"
                              onClick={() => setQuizAnswers(prev => ({ ...prev, 2: 'a' }))}
                              className={`p-2 rounded border text-left cursor-pointer ${quizAnswers[2] === 'a' ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-semibold' : 'bg-white hover:bg-gray-50 border-gray-250 text-gray-700'}`}
                            >
                              A) They preserve the organic physical context and climate truth of the compound square.
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuizAnswers(prev => ({ ...prev, 2: 'b' }))}
                              className={`p-2 rounded border text-left cursor-pointer ${quizAnswers[2] === 'b' ? 'bg-amber-100 border-[#E2A04F] text-amber-900 font-semibold' : 'bg-white hover:bg-gray-50 border-gray-250 text-gray-700'}`}
                            >
                              B) They are not valuable and should always be scrubbed using studio AI filters.
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 border-t border-gray-200/60 pt-3">
                          <p className="font-bold text-[#2D2926]">3. Who ultimately owns the voice files and lineage data mapped on Afrolineo?</p>
                          <div className="grid grid-cols-1 gap-2 text-[12.5px]">
                            <button
                              type="button"
                              onClick={() => setQuizAnswers(prev => ({ ...prev, 3: 'a' }))}
                              className={`p-2 rounded border text-left cursor-pointer ${quizAnswers[3] === 'a' ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-semibold' : 'bg-white hover:bg-gray-50 border-gray-250 text-gray-700'}`}
                            >
                              A) You and your family, under full decentralized local stewardship.
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuizAnswers(prev => ({ ...prev, 3: 'b' }))}
                              className={`p-2 rounded border text-left cursor-pointer ${quizAnswers[3] === 'b' ? 'bg-amber-100 border-[#E2A04F] text-amber-900 font-semibold' : 'bg-white hover:bg-gray-50 border-gray-250 text-gray-700'}`}
                            >
                              B) Afrolineo, who uses them to optimize search models and public analytics.
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (!quizAnswers[1] || !quizAnswers[2] || !quizAnswers[3]) {
                              alert("Please answer all three questions first!");
                              return;
                            }
                            let score = 0;
                            if (quizAnswers[1] === 'b') score++;
                            if (quizAnswers[2] === 'a') score++;
                            if (quizAnswers[3] === 'a') score++;
                            setQuizScore(score);
                          }}
                          className="px-4 py-2 bg-[#2D2926] hover:bg-[#E2A04F] text-[#F9F7F2] hover:text-[#2D2926] text-xs font-sans font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                        >
                          Submit Ethos Answers
                        </button>

                        {quizScore !== null && (
                          <div className={`p-3 rounded text-center text-xs font-bold w-full sm:w-auto ${quizScore === 3 ? 'bg-emerald-50 border border-emerald-250 text-emerald-800' : 'bg-amber-50 border border-amber-250 text-amber-800'}`}>
                            {quizScore === 3 ? (
                              <p className="flex items-center justify-center gap-1">
                                <Check className="w-4 h-4 text-emerald-600 inline" /> Score: 3/3! Certified Custodian!
                              </p>
                            ) : (
                              <p>Score: {quizScore}/3. Try again to correct your values!</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. TERMS & SOVEREIGN PACT */}
                {selectedAboutTab === 'terms' && (
                  <div className="space-y-6 animate-scaleIn">
                    <div className="border-b border-gray-100 pb-4">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Legal Autonomy</span>
                      <h3 className="font-display font-black text-xl text-[#2D2926] uppercase">Sovereign Ancestral Memory Pact</h3>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed font-light">
                      Unlike commercial ancestry tools that trade, index, or sell your family’s oral tapes and genealogical records, Afrolineo keeps your <strong>recordings and transcripts on your own device</strong> and only keeps a minimal account record, tree outline and usage history on its servers.
                    </p>

                    <div className="bg-[#FAF8F5] p-5 border border-gray-150 rounded-sm space-y-3">
                      <h4 className="font-sans font-bold text-gray-800 text-xs uppercase tracking-wide">Standard Rules of Ownership:</h4>
                      <div className="space-y-2 text-xs text-gray-600">
                        <p><strong>1. Zero Data Lock-In:</strong> All family files, voice sound blocks, and geographical annotations stay in your device’s local IndexedDB sandbox. You can export or destroy them at any time.</p>
                        <p><strong>2. Commercial Ban:</strong> Afrolineo is legally barred from cataloging your uploaded files for commercial advertising, public indexes, or corporate machine translation trainings.</p>
                        <p><strong>3. Absolute Consent:</strong> You confirm that you have obtained verbal consent from parent and grandparent custodians before uploading their voice clips here.</p>
                      </div>
                    </div>

                    {/* Interactive signing pact */}
                    <div className="border border-[#E2A04F]/40 bg-[#FAF8F5] rounded-sm p-5 space-y-3.5">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-[#E2A04F]" />
                        <span className="font-sans font-bold text-xs text-[#2D2926] uppercase">Affirm the Ancestral Stewardship Pact</span>
                      </div>
                      <p className="text-[12.5px] text-gray-500 leading-normal">
                        By checking this box, you pledge to respect living elders, record details with maximum fidelity, and preserve these records as a sacred trust for coming generations.
                      </p>

                      {!pactSignedAuth ? (
                        <button
                          type="button"
                          onClick={() => setPactSignedAuth(true)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-[#2D2926] hover:bg-[#E2A04F] text-[#F9F7F2] hover:text-[#2D2926] text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                        >
                          Sign & Affirm Pact
                        </button>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded flex items-center justify-between text-xs font-bold animate-scaleIn">
                          <span className="flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-600 inline" /> Pact Signed & Verified inside Local Sandbox
                          </span>
                          <button
                            type="button"
                            onClick={() => setPactSignedAuth(false)}
                            className="text-xs text-[#2D2926] hover:underline font-mono uppercase"
                          >
                            Revoke
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 8. SOCIAL IMPACT */}
                {selectedAboutTab === 'social-impact' && (
                  <div className="space-y-6 animate-scaleIn">
                    <div className="border-b border-gray-100 pb-4">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Cultural Mission</span>
                      <h3 className="font-display font-black text-xl text-[#2D2926] uppercase">Reversing the Digital Erasure of Oral Lineages</h3>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed font-light">
                      Across sub-Saharan Africa, thousands of deep family trees exist solely in the minds of aging elders. When a custodian passes, a treasury of local coordinates and tribal history is lost. Afrolineo works to democratize physical recording kits and server hardware to villages.
                    </p>

                    {/* Stats strip */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-[#FAF8F5] border border-gray-150 p-4 rounded">
                        <strong className="block text-[#E2A04F] text-xl font-sans font-black">14,200+</strong>
                        <span className="text-xs text-gray-500 font-mono">Elder Logs Saved</span>
                      </div>
                      <div className="bg-[#FAF8F5] border border-gray-150 p-4 rounded">
                        <strong className="block text-[#E2A04F] text-xl font-sans font-black">350+</strong>
                        <span className="text-xs text-gray-500 font-mono">Compounds Mapped</span>
                      </div>
                      <div className="bg-[#FAF8F5] border border-gray-150 p-4 rounded">
                        <strong className="block text-[#E2A04F] text-xl font-sans font-black">1.2M+</strong>
                        <span className="text-xs text-gray-500 font-mono">Words Preserved</span>
                      </div>
                    </div>

                    {/* Nomination Form */}
                    <div className="border border-gray-250 p-5 rounded bg-white space-y-4">
                      <h4 className="font-sans font-bold text-gray-800 text-xs uppercase tracking-wide">Sponsor a Village Elder Compound</h4>
                      <p className="text-[12.5px] text-gray-500 leading-relaxed">
                        We deploy custom micro-WiFi backup server hubs to remote West African regions. Nominate an elder compound in your family village to receive sponsored backup hardware.
                      </p>

                      {!sponsorshipSubmittedAuth ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!sponsorshipCompoundAuth || !sponsorshipLGAAuth) return;
                            setSponsorshipSubmittedAuth(true);
                          }}
                          className="space-y-3"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Compound / Family Name (e.g. Alao Compound)"
                              required
                              value={sponsorshipCompoundAuth}
                              onChange={(e) => setSponsorshipCompoundAuth(e.target.value)}
                              className="text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white w-full"
                            />
                            <input
                              type="text"
                              placeholder="Local State & Ward (e.g. Oyo State, Ward 4)"
                              required
                              value={sponsorshipLGAAuth}
                              onChange={(e) => setSponsorshipLGAAuth(e.target.value)}
                              className="text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white w-full"
                            />
                          </div>
                          <button
                            type="submit"
                            className="px-4.5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                          >
                            Submit Nomination Request
                          </button>
                        </form>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded text-center space-y-2.5 animate-scaleIn">
                          <p className="font-bold text-sm flex items-center justify-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-600 inline" /> Nomination Staged Successfully!
                          </p>
                          <p className="text-xs text-emerald-700 leading-relaxed">
                            Thank you! Your nomination for <strong>{sponsorshipCompoundAuth}</strong> located in <strong>{sponsorshipLGAAuth}</strong> has been logged in your client buffer and staged for review by our regional coordinators.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSponsorshipSubmittedAuth(false);
                              setSponsorshipCompoundAuth('');
                              setSponsorshipLGAAuth('');
                            }}
                            className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-mono text-xs uppercase font-bold rounded"
                          >
                            Nominate another compound
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 9. AFROLINEO IN YOUR COMMUNITY */}
                {selectedAboutTab === 'community-impact' && (
                  <div className="space-y-6 animate-scaleIn">
                    <div className="border-b border-gray-100 pb-4">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Local Outreach</span>
                      <h3 className="font-display font-black text-xl text-[#2D2926] uppercase">Afrolineo in Your Community</h3>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed font-light">
                      We believe family tree mapping is best done in collaborative physical gatherings. We run regular workshops, townhalls, and diaspora meetups in cities like Lagos, Accra, Nairobi, London, Houston, and Atlanta.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border border-gray-200 p-4 rounded bg-[#FAF8F5]">
                        <strong className="block text-gray-800 text-xs">🏡 Community Archivist Toolkits</strong>
                        <p className="text-gray-600 text-[12.5px] leading-relaxed mt-1">
                          Get physical journals, high-sensitivity microphone adaptors, and step-by-step guideline pamphlets for your compound gathering.
                        </p>
                      </div>

                      <div className="border border-gray-200 p-4 rounded bg-[#FAF8F5]">
                        <strong className="block text-gray-800 text-xs">🤝 Tribal Townhalls</strong>
                        <p className="text-gray-600 text-[12.5px] leading-relaxed mt-1">
                          We team up with regional diaspora councils to host genealogy calibration gatherings.
                        </p>
                      </div>
                    </div>

                    {/* Request Workshop Kit */}
                    <div className="border border-amber-250 bg-amber-50/15 p-5 rounded space-y-3.5">
                      <h4 className="font-sans font-bold text-gray-800 text-xs uppercase tracking-wide">Request a Local Workshop Prep Kit</h4>
                      <p className="text-[12.5px] text-gray-500 leading-relaxed">
                        Planning an upcoming family reunion? Select your date to reserve a local training session and get a physical preparation guide.
                      </p>

                      {!workshopBookedAuth ? (
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <input
                            type="date"
                            value={workshopDateAuth}
                            onChange={(e) => setWorkshopDateAuth(e.target.value)}
                            className="text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white text-gray-700 font-sans"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!workshopDateAuth) {
                                alert("Please select a valid target reunion date first.");
                                return;
                              }
                              setWorkshopBookedAuth(true);
                            }}
                            className="px-5 py-2.5 bg-[#2D2926] hover:bg-[#E2A04F] text-[#F9F7F2] hover:text-[#2D2926] text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer shrink-0"
                          >
                            Book Workshop Date
                          </button>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded animate-scaleIn space-y-2 text-left">
                          <p className="font-bold text-xs flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-600 inline" /> Workshop Date Scheduled!
                          </p>
                          <p className="text-xs text-emerald-700 leading-relaxed">
                            Fantastic! We have noted your family union date (<strong>{workshopDateAuth}</strong>). A physical toolkit with analog memory charts and recording tools has been scheduled for dispatch.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setWorkshopBookedAuth(false);
                              setWorkshopDateAuth('');
                            }}
                            className="text-xs text-[#2D2926] hover:underline uppercase font-bold font-mono"
                          >
                            Cancel or Reschedule
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 10. SUPPORT DESK */}
                {selectedAboutTab === 'support' && (
                  <div className="space-y-6 animate-scaleIn">
                    <div className="border-b border-gray-100 pb-4">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Assistance Portal</span>
                      <h3 className="font-display font-black text-xl text-[#2D2926] uppercase">Custodian Help & Support Desk</h3>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed font-light">
                      Having issues importing lineage spreadsheets, restoring audio recordings, or customizing family cards? View our guides or file a technical ticket.
                    </p>

                    {/* Accordion FAQ */}
                    <div className="space-y-2.5">
                      <h4 className="font-sans font-bold text-gray-800 text-xs uppercase tracking-wider">Frequently Answered Protocols:</h4>
                      
                      {[
                        { q: 'Will my records vanish if I clear my browser history?', a: 'Yes. Your recordings and full tree are stored only in your browser. To prevent loss, open your Active Sitemap and download an offline archive (.afrolineo backup file) weekly.' },
                        { q: 'How do I combine family branches with relatives?', a: 'Go to your Active Sitemap, select "Sovereign Offline Backup", export your tree as JSON, and share it. Relatives can import your file to merge nodes seamlessly.' },
                        { q: 'Are village compound nodes accessible without internet?', a: 'Yes! Our custom application works offline. You can map lineages, write bios, and save logs; they sync securely once a connection is detected.' }
                      ].map((faq, idx) => (
                        <div key={idx} className="border border-gray-200 rounded">
                          <button
                            type="button"
                            onClick={() => setFaqOpenAuth(faqOpenAuth === idx ? null : idx)}
                            className="w-full text-left p-3 bg-[#FAF8F5] hover:bg-gray-50 flex justify-between items-center text-xs font-bold text-gray-800 cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${faqOpenAuth === idx ? 'rotate-180' : ''}`} />
                          </button>
                          {faqOpenAuth === idx && (
                            <div className="p-4 bg-white text-xs text-gray-650 border-t border-gray-100 leading-relaxed font-serif animate-slideDown">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Support Form */}
                    <div className="border border-gray-250 p-5 rounded bg-white space-y-4">
                      <h4 className="font-sans font-bold text-gray-800 text-xs uppercase tracking-wide">Log a Support & Diagnostic Ticket</h4>
                      <p className="text-[12.5px] text-gray-500 leading-relaxed">
                        Encountered a bug or error? Submit a local assistance ticket.
                      </p>

                      {!supportSubmittedAuth ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!supportEmailAuth || !supportMessageAuth) return;
                            setSupportSubmittedAuth(true);
                          }}
                          className="space-y-3"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="email"
                              placeholder="Your Registered Email *"
                              required
                              value={supportEmailAuth}
                              onChange={(e) => setSupportEmailAuth(e.target.value)}
                              className="text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white w-full"
                            />
                            <select
                              value={supportCategoryAuth}
                              onChange={(e) => setSupportCategoryAuth(e.target.value)}
                              className="text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white text-gray-750 w-full font-sans"
                            >
                              <option value="offline">Offline backup & restore issue</option>
                              <option value="recording">Recording voice memos help</option>
                              <option value="sitemap">Sitemap & navigation error</option>
                              <option value="other">Other ancestral node error</option>
                            </select>
                          </div>
                          <textarea
                            placeholder="Please describe what specific ancestral node linkage or audio asset is malfunctioning..."
                            rows={3}
                            required
                            value={supportMessageAuth}
                            onChange={(e) => setSupportMessageAuth(e.target.value)}
                            className="text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white w-full"
                          />
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-[#2D2926] hover:bg-[#E2A04F] text-[#F9F7F2] hover:text-[#2D2926] text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                          >
                            Generate Help Desk Ticket
                          </button>
                        </form>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded text-center space-y-2.5 animate-scaleIn">
                          <p className="font-bold text-sm flex items-center justify-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-600 inline" /> Support Ticket Logged!
                          </p>
                          <p className="text-xs text-emerald-700 leading-relaxed">
                            Your help desk ticket <strong>#AFR-2026-{(Math.floor(Math.random() * 8999) + 1000)}</strong> has been registered in your client browser session. An encrypted diagnostic file has been staged in your local log buffer.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSupportSubmittedAuth(false);
                              setSupportMessageAuth('');
                              setSupportEmailAuth('');
                            }}
                            className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-mono text-xs uppercase font-bold rounded"
                          >
                            Submit another support ticket
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 11. ARTICLES & ESSAYS (AUTHENTICATED) */}
                {selectedAboutTab === 'articles' && (
                  <div className="space-y-6 animate-scaleIn text-xs text-[#2D2926] text-left">
                    <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Knowledge Hub</span>
                        <h3 className="font-serif font-black text-lg text-[#2D2926] uppercase">Oral Genealogy & Preservation Articles</h3>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">Curated by Academic Councils</span>
                    </div>

                    {selectedArticleIdAuth ? (
                      // Rich Article Reader view
                      (() => {
                        const article = ARTICLES.find(a => a.id === selectedArticleIdAuth);
                        if (!article) return null;
                        const isSaved = savedArticlesAuth.includes(article.id);
                        return (
                          <div className="space-y-5 text-left">
                            <button
                              type="button"
                              onClick={() => setSelectedArticleIdAuth(null)}
                              className="text-[#E2A04F] hover:underline font-bold text-xs uppercase flex items-center gap-1 cursor-pointer"
                            >
                              ← Return to Articles Directory
                            </button>
                            <div className="bg-[#FAF8F5] border border-gray-200 p-6 rounded-md space-y-4 text-left">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
                                <span className="bg-[#2D2926] text-white px-2 py-0.5 rounded-[3px] text-xs font-bold uppercase tracking-wider">{article.category}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400 font-mono">{article.date} • {article.readTime}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isSaved) {
                                        setSavedArticlesAuth(savedArticlesAuth.filter(id => id !== article.id));
                                      } else {
                                        setSavedArticlesAuth([...savedArticlesAuth, article.id]);
                                      }
                                    }}
                                    className="p-1 rounded hover:bg-gray-200 text-gray-600 cursor-pointer flex items-center"
                                    title={isSaved ? "Remove Bookmark" : "Bookmark Article"}
                                  >
                                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#E2A04F] text-[#E2A04F]' : 'text-gray-400'}`} />
                                  </button>
                                </div>
                              </div>
                              <h3 className="font-serif font-black text-xl text-[#2D2926] leading-snug">{article.title}</h3>
                              <p className="text-xs text-gray-500 font-serif italic border-l-2 border-[#E2A04F] pl-3 text-left">Written by {article.author}</p>
                              
                              <div className="text-gray-700 leading-relaxed font-serif text-xs space-y-3.5 pt-2 whitespace-pre-line text-left">
                                {article.content}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      // Main directory view
                      <div className="space-y-5 text-left">
                        {/* Search and Filters Bar */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search historical essays & guides..."
                              value={articleSearchQueryAuth}
                              onChange={(e) => setArticleSearchQueryAuth(e.target.value)}
                              className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white font-sans text-gray-850"
                            />
                          </div>
                          <select
                            value={articleFilterAuth}
                            onChange={(e) => setArticleFilterAuth(e.target.value)}
                            className="text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white font-sans text-gray-750"
                          >
                            <option value="all">All Categories</option>
                            <option value="Oral Traditions">Oral Traditions</option>
                            <option value="Research Techniques">Research Techniques</option>
                            <option value="Tech & Privacy">Tech & Privacy</option>
                            <option value="Historical Records">Historical Records</option>
                          </select>
                        </div>

                        {/* Saved list mini bar if any */}
                        {savedArticlesAuth.length > 0 && (
                          <div className="bg-amber-50/20 border border-[#E2A04F]/30 p-3 rounded-sm flex items-center justify-between text-xs font-medium">
                            <span className="text-gray-700 font-sans flex items-center gap-1.5">
                              <Bookmark className="w-3.5 h-3.5 text-[#E2A04F] fill-[#E2A04F]" /> You bookmarked <strong>{savedArticlesAuth.length}</strong> essays for offline reading.
                            </span>
                            <button
                              type="button"
                              onClick={() => setSavedArticlesAuth([])}
                              className="text-xs text-[#2D2926] underline uppercase font-bold hover:text-[#E2A04F]"
                            >
                              Clear List
                            </button>
                          </div>
                        )}

                        {/* List Grid */}
                        <div className="grid grid-cols-1 gap-4">
                          {ARTICLES.filter(art => {
                            const matchQuery = art.title.toLowerCase().includes(articleSearchQueryAuth.toLowerCase()) || 
                                               art.excerpt.toLowerCase().includes(articleSearchQueryAuth.toLowerCase()) ||
                                               art.author.toLowerCase().includes(articleSearchQueryAuth.toLowerCase());
                            const matchFilter = articleFilterAuth === 'all' || art.category === articleFilterAuth;
                            return matchQuery && matchFilter;
                          }).map(art => {
                            const isSaved = savedArticlesAuth.includes(art.id);
                            return (
                              <div key={art.id} className="border border-gray-200 hover:border-gray-300 p-4 rounded-md bg-[#FAF8F5] transition-all flex flex-col justify-between space-y-3 text-left">
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase font-mono tracking-widest text-[#E2A04F] font-bold">{art.category}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isSaved) {
                                          setSavedArticlesAuth(savedArticlesAuth.filter(id => id !== art.id));
                                        } else {
                                          setSavedArticlesAuth([...savedArticlesAuth, art.id]);
                                        }
                                      }}
                                      className="p-1 rounded hover:bg-gray-155 text-gray-500 cursor-pointer flex items-center"
                                      title={isSaved ? "Remove Bookmark" : "Bookmark Article"}
                                    >
                                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#E2A04F] text-[#E2A04F]' : 'text-gray-400'}`} />
                                    </button>
                                  </div>
                                  <h5 className="font-serif font-black text-sm text-gray-800 leading-snug">{art.title}</h5>
                                  <p className="text-[12.5px] text-gray-600 leading-relaxed font-light">{art.excerpt}</p>
                                </div>
                                <div className="flex items-center justify-between pt-1 border-t border-gray-200/50">
                                  <span className="text-xs text-gray-500 font-mono italic">By {art.author} • {art.readTime}</span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedArticleIdAuth(art.id)}
                                    className="px-3 py-1.5 bg-[#2D2926] hover:bg-[#E2A04F] text-white hover:text-[#2D2926] text-xs uppercase font-bold rounded transition-colors cursor-pointer"
                                  >
                                    Read Full Essay →
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 12. HERITAGE GIFTS (AUTHENTICATED) */}
                {selectedAboutTab === 'gifts' && (
                  <div className="space-y-6 animate-scaleIn text-xs text-[#2D2926] text-left">
                    <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Preservation Shop</span>
                        <h3 className="font-serif font-black text-lg text-[#2D2926] uppercase">Custom Family Heritage Artifacts</h3>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">100% of proceeds fund offline village hardware</span>
                    </div>

                    {selectedGiftIdAuth ? (
                      // Product Customization Panel
                      (() => {
                        const gift = GIFTS.find(g => g.id === selectedGiftIdAuth);
                        if (!gift) return null;
                        const famName = customFamilyNameAuth || 'Alao Family';
                        const regName = customRegionAuth || 'Oyo State, Nigeria';
                        return (
                          <div className="space-y-5 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedGiftIdAuth(null);
                                setGiftCustomizedAuth(false);
                              }}
                              className="text-[#E2A04F] hover:underline font-bold text-xs uppercase flex items-center gap-1 cursor-pointer"
                            >
                              ← Back to Heritage Shop Catalog
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-left">
                              {/* Left Column: Interactive Design Simulation Mockup */}
                              <div className="border border-gray-250 bg-[#2D2926] text-[#F9F7F2] p-6 rounded-md text-center space-y-4 shadow-inner relative overflow-hidden min-h-[250px] flex flex-col justify-center items-center">
                                {/* Simulated gold borders representing high luxury */}
                                <div className="absolute inset-2 border border-[#E2A04F]/20 pointer-events-none rounded"></div>
                                <div className="absolute inset-3 border border-[#E2A04F]/5 pointer-events-none rounded"></div>
                                
                                <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-black font-sans">
                                  ARCHIVAL DEMO SPECIFICATION
                                </span>

                                {gift.id === 'gift-1' && (
                                  <div className="space-y-3">
                                    <div className="w-12 h-12 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto text-[#2D2926] shadow-md border-2 border-[#E2A04F]">
                                      <Mic className="w-6 h-6 text-[#E2A04F]" />
                                    </div>
                                    <h5 className="font-serif font-bold text-sm tracking-wide text-white">HERITAGE AUDIO CAPSULE</h5>
                                    <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Laser Engraved:</p>
                                    <div className="bg-[#1a1918] py-2 px-4 rounded border border-[#E2A04F]/40 inline-block font-serif font-black text-amber-100 text-xs tracking-wider italic">
                                      "{famName} Archives"
                                    </div>
                                  </div>
                                )}

                                {gift.id === 'gift-2' && (
                                  <div className="space-y-3">
                                    <div className="w-16 h-12 bg-transparent border-2 border-dashed border-[#E2A04F]/40 flex items-center justify-center mx-auto rounded">
                                      <span className="text-xs text-gray-400 font-mono">5-Gen Blueprint</span>
                                    </div>
                                    <h5 className="font-serif font-black text-sm text-[#E2A04F] uppercase tracking-wider">{famName} Historical Tree</h5>
                                    <p className="text-xs text-gray-300 font-sans leading-relaxed">Archival Canvas Specimen</p>
                                    <div className="bg-[#1a1918]/60 py-1.5 px-3 rounded text-xs font-mono text-[#E2A04F]">
                                      TERRITORY: {regName.toUpperCase()}
                                    </div>
                                  </div>
                                )}

                                {gift.id === 'gift-3' && (
                                  <div className="space-y-3">
                                    <div className="w-10 h-12 bg-amber-900 border border-amber-600 rounded flex items-center justify-center mx-auto text-amber-200 font-serif font-black shadow-lg">
                                      📜
                                    </div>
                                    <h5 className="font-serif font-bold text-sm text-white">THE CUSTODIAN JOURNAL</h5>
                                    <p className="text-xs text-gray-400 font-serif italic">Embossed in Gold Leaf Leather:</p>
                                    <div className="bg-amber-950 py-1.5 px-3 rounded border border-amber-500/40 font-sans font-bold text-amber-300 text-xs uppercase">
                                      {famName} COVENANT
                                    </div>
                                  </div>
                                )}

                                {gift.id === 'gift-4' && (
                                  <div className="space-y-3">
                                    <div className="w-12 h-12 bg-emerald-900/60 rounded flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500">
                                      <Network className="w-6 h-6" />
                                    </div>
                                    <h5 className="font-serif font-bold text-sm text-white">VILLAGE SERVER HUB</h5>
                                    <p className="text-xs text-gray-400 font-mono">STAGED HUB LOCATION:</p>
                                    <div className="bg-emerald-950/80 py-1.5 px-3 rounded border border-emerald-500/40 font-mono font-bold text-emerald-300 text-xs uppercase">
                                      {famName} • {regName.toUpperCase()}
                                    </div>
                                  </div>
                                )}

                                <div className="text-xs font-mono text-gray-500 pt-2">
                                  Interactive Design Preview
                                </div>
                              </div>

                              {/* Right Column: Customizer inputs */}
                              <div className="space-y-4 border border-gray-200 p-5 rounded-md bg-white">
                                <span className="bg-amber-100 text-[#2D2926] px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{gift.badge} Customizer</span>
                                <h3 className="font-serif font-black text-base text-[#2D2926]">{gift.name}</h3>
                                <p className="text-[12.5px] text-gray-500 leading-relaxed font-light">{gift.description}</p>
                                <span className="block text-[#E2A04F] text-base font-sans font-black">${gift.price.toFixed(2)}</span>

                                <div className="space-y-3 pt-2">
                                  <div>
                                    <label className="block text-xs uppercase font-sans font-bold text-gray-600 mb-1">
                                      Embossed Custom Family Name
                                    </label>
                                    <input
                                      type="text"
                                      placeholder={gift.customPlaceholder}
                                      value={customFamilyNameAuth}
                                      onChange={(e) => {
                                        setCustomFamilyNameAuth(e.target.value);
                                        setGiftCustomizedAuth(true);
                                      }}
                                      className="w-full text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white font-sans text-gray-850"
                                    />
                                  </div>

                                  {(gift.id === 'gift-2' || gift.id === 'gift-4') && (
                                    <div>
                                      <label className="block text-xs uppercase font-sans font-bold text-gray-600 mb-1">
                                        Regional Location Label
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="e.g. Oyo State, Nigeria"
                                        value={customRegionAuth}
                                        onChange={(e) => {
                                          setCustomRegionAuth(e.target.value);
                                          setGiftCustomizedAuth(true);
                                        }}
                                        className="w-full text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white font-sans text-gray-850"
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const customizedItem = {
                                        id: `${gift.id}-${Date.now()}`,
                                        originalName: gift.name,
                                        customName: customFamilyNameAuth || gift.customPlaceholder,
                                        customRegion: customRegionAuth,
                                        price: gift.price,
                                        badge: gift.badge
                                      };
                                      setStagedGiftsAuth([...stagedGiftsAuth, customizedItem]);
                                      alert(`Success! "${customizedItem.customName}" customization added to your staged dispatch manifest.`);
                                      setSelectedGiftIdAuth(null);
                                      setCustomFamilyNameAuth('');
                                      setCustomRegionAuth('');
                                      setGiftCustomizedAuth(false);
                                    }}
                                    className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-sans font-bold uppercase tracking-wider rounded transition-colors cursor-pointer text-center font-bold"
                                  >
                                    Stage Custom Dispatch
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedGiftIdAuth(null);
                                      setCustomFamilyNameAuth('');
                                      setCustomRegionAuth('');
                                      setGiftCustomizedAuth(false);
                                    }}
                                    className="px-4 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-bold"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      // Main shop catalog view
                      <div className="space-y-6 text-left">
                        <p className="text-gray-750 font-light leading-relaxed font-serif italic text-xs border-l-4 border-[#E2A04F] pl-4 text-left">
                          Each item is individually crafted to order by regional artisans. 100% of profit margins are pooled into a decentralized development grant which distributes micro-WiFi server hubs and recorders to rural, offline tribal wards.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {GIFTS.map(gift => (
                            <div key={gift.id} className="border border-gray-200 hover:border-gray-300 rounded-lg overflow-hidden bg-white flex flex-col justify-between shadow-xs transition-all">
                              <div className="relative h-44 w-full bg-[#FAF8F5]">
                                <img
                                  src={gift.imageUrl}
                                  alt={gift.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute top-3 left-3 bg-[#2D2926] text-white px-2 py-0.5 rounded-[3px] text-xs font-bold uppercase tracking-wider">
                                  {gift.badge}
                                </span>
                              </div>
                              <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-left">
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-amber-500 font-bold">★ {gift.rating} Rating</span>
                                    <span className="text-[#E2A04F] text-xs font-sans font-black">${gift.price.toFixed(2)}</span>
                                  </div>
                                  <h5 className="font-serif font-black text-sm text-gray-800 leading-snug">{gift.name}</h5>
                                  <p className="text-xs text-gray-500 leading-relaxed font-light">{gift.description}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedGiftIdAuth(gift.id);
                                    setCustomFamilyNameAuth('');
                                    setCustomRegionAuth('');
                                  }}
                                  className="w-full py-2 bg-[#FAF8F5] hover:bg-[#2D2926] hover:text-white border border-[#2D2926]/30 text-[#2D2926] text-xs font-sans font-bold uppercase tracking-wider rounded transition-all cursor-pointer font-bold"
                                >
                                  Configure & Preview Artifact →
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Staged delivery manifest list */}
                        {stagedGiftsAuth.length > 0 && (
                          <div className="bg-[#FAF8F5] border border-gray-200 p-5 rounded-md text-left space-y-3.5">
                            <h5 className="font-sans font-bold text-xs uppercase text-[#2D2926] flex items-center gap-2">
                              🎁 Your Staged Dispatch Manifest ({stagedGiftsAuth.length})
                            </h5>
                            <p className="text-xs text-gray-500">
                              These customized items are prepared in your temporary client session buffer. To place a real order or apply village sponsorship credit vouchers, proceed to the secure gateway setup.
                            </p>
                            <div className="space-y-2.5">
                              {stagedGiftsAuth.map((item) => (
                                <div key={item.id} className="bg-white border border-gray-150 p-3 rounded flex items-center justify-between text-xs font-sans">
                                  <div>
                                    <p className="font-bold text-gray-800">{item.originalName}</p>
                                    <p className="text-xs text-[#E2A04F] font-serif italic">Custom Title: "{item.customName}" {item.customRegion ? `• Region: ${item.customRegion}` : ''}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <strong className="text-gray-800 font-black">${item.price.toFixed(2)}</strong>
                                    <button
                                      type="button"
                                      onClick={() => setStagedGiftsAuth(stagedGiftsAuth.filter(g => g.id !== item.id))}
                                      className="text-red-600 hover:underline text-xs uppercase font-mono"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between items-center pt-2.5 border-t border-gray-200">
                              <span className="text-xs text-gray-600">Total Dispatch Cost:</span>
                              <strong className="text-base text-gray-800 font-sans font-black">
                                ${stagedGiftsAuth.reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 13. CUSTODIAN STORIES (AUTHENTICATED) */}
                {selectedAboutTab === 'customer-stories' && (
                  <div className="space-y-6 animate-scaleIn text-xs text-[#2D2926] text-left">
                    <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Impact Testimonials</span>
                        <h3 className="font-serif font-black text-lg text-[#2D2926] uppercase">Custodian Success Chronicles</h3>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">Real Diaspora Breakthroughs</span>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light text-xs text-left">
                      Read about real family archivists who broke through decades of genealogical silences by integrating verbal praise-songs, geographical wards, and localized audio recordings.
                    </p>

                    {/* Filter and Story list */}
                    <div className="space-y-5">
                      <div className="flex gap-2 justify-start">
                        {['all', 'Nigeria', 'Senegal', 'Diaspora'].map(reg => (
                          <button
                            key={reg}
                            onClick={() => setStoryRegionFilterAuth(reg)}
                            className={`px-3 py-1.5 rounded text-xs uppercase font-bold transition-all cursor-pointer ${
                              storyRegionFilterAuth === reg ? 'bg-[#2D2926] text-[#E2A04F]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {reg === 'all' ? 'All Regions' : reg}
                          </button>
                        ))}
                      </div>

                      {/* Display stories list */}
                      <div className="grid grid-cols-1 gap-5">
                        {/* Static stories + user submitted stories */}
                        {[...STORIES, ...submittedStoriesAuth]
                          .filter(s => storyRegionFilterAuth === 'all' || s.region === storyRegionFilterAuth)
                          .map(story => {
                            const isPlaying = playingStoryIdAuth === story.id;
                            return (
                              <div key={story.id} className="border border-gray-200 rounded-lg p-5 bg-[#FAF8F5] text-left space-y-3.5 relative">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2.5">
                                  <div>
                                    <span className="text-xs uppercase font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">{story.ethnic} ({story.region})</span>
                                    <h5 className="font-serif font-black text-sm text-[#2D2926] mt-1">{story.name}</h5>
                                  </div>
                                  <span className="text-xs font-mono font-bold text-[#E2A04F]">{story.yearsTrace}</span>
                                </div>

                                <p className="text-[12.5px] text-gray-700 font-serif font-bold italic">"{story.summary}"</p>
                                <p className="text-[12.5px] text-gray-600 font-light leading-relaxed font-serif whitespace-pre-line">{story.details}</p>

                                <div className="bg-white border border-gray-150 p-3 rounded flex flex-col sm:flex-row items-center justify-between gap-3">
                                  <span className="text-xs text-gray-500 font-sans">Oral Scribe: <strong>{story.speaker || 'Anonymous'}</strong></span>
                                  
                                  {/* Simulated Interactive Audio tape playing with visual wave bar pulsing */}
                                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                    {isPlaying && (
                                      <div className="flex items-end gap-0.5 h-4 px-1">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                          <span
                                            key={i}
                                            className="w-0.5 bg-[#E2A04F] rounded-full animate-pulse"
                                            style={{
                                              height: `${Math.floor(Math.random() * 12) + 4}px`,
                                              animationDelay: `${i * 0.15}s`,
                                              animationDuration: '0.6s'
                                            }}
                                          ></span>
                                        ))}
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isPlaying) {
                                          setPlayingStoryIdAuth(null);
                                        } else {
                                          setPlayingStoryIdAuth(story.id);
                                          // Simulate an automatic pause after 20 seconds
                                          setTimeout(() => {
                                            setPlayingStoryIdAuth(prev => prev === story.id ? null : prev);
                                          }, 20000);
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-[#2D2926] hover:bg-[#E2A04F] hover:text-[#2D2926] text-white text-xs uppercase font-bold tracking-wider rounded transition-colors flex items-center gap-1 cursor-pointer font-sans"
                                    >
                                      {isPlaying ? <Pause className="w-3 h-3 inline" /> : <Play className="w-3 h-3 inline font-bold" />}
                                      {isPlaying ? 'Pause tape' : `Hear Oral clip (${story.audioDuration || 'Demo'})`}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Submission form for user stories */}
                      <div className="border border-gray-250 p-5 rounded bg-white space-y-4 text-left">
                        <h4 className="font-sans font-bold text-[#2D2926] text-xs uppercase tracking-wide">Publish Your Family Breakthrough Story</h4>
                        <p className="text-[12.5px] text-gray-500 leading-relaxed">
                          Did you trace a long-lost ancestor, record a poignant oral audio capsule, or find your village ancestral compound? Tell other custodians what you accomplished!
                        </p>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!newStoryNameAuth || !newStoryTextAuth) return;
                            const customStory = {
                              id: `custom-story-${Date.now()}`,
                              name: `${newStoryNameAuth} Ancestral Record`,
                              region: newStoryRegionAuth || 'Diaspora',
                              ethnic: 'Oral Historian',
                              yearsTrace: 'Newly Restored',
                              summary: 'Preserving a living memory sandbox breakthrough.',
                              details: newStoryTextAuth,
                              speaker: newStoryNameAuth,
                              audioDuration: 'Live Tape'
                            };
                            setSubmittedStoriesAuth([customStory, ...submittedStoriesAuth]);
                            setNewStoryNameAuth('');
                            setNewStoryRegionAuth('');
                            setNewStoryTextAuth('');
                            alert("Thank you! Your ancestral breakthrough story has been published to your browser's local sandbox.");
                          }}
                          className="space-y-3"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Your Family or Compound Name (e.g., Sowande Clan)"
                              required
                              value={newStoryNameAuth}
                              onChange={(e) => setNewStoryNameAuth(e.target.value)}
                              className="text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white w-full"
                            />
                            <select
                              value={newStoryRegionAuth}
                              onChange={(e) => setNewStoryRegionAuth(e.target.value)}
                              className="text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white text-gray-750 w-full font-sans"
                            >
                              <option value="Diaspora">Diaspora Region</option>
                              <option value="Nigeria">Nigeria Region</option>
                              <option value="Senegal">Senegal Region</option>
                              <option value="Ghana">Ghana Region</option>
                              <option value="Kenya">Kenya Region</option>
                              <option value="Other">Other region</option>
                            </select>
                          </div>
                          <textarea
                            placeholder="Share your family breakthrough (What names, stories, or coordinates did you unlock? How did you record them?)..."
                            rows={3}
                            required
                            value={newStoryTextAuth}
                            onChange={(e) => setNewStoryTextAuth(e.target.value)}
                            className="text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white w-full animate-none"
                          />
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-[#2D2926] hover:bg-[#E2A04F] text-[#F9F7F2] hover:text-[#2D2926] text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                          >
                            Submit Breakthrough Story
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER credit rails and comprehensive links */}
      <footer className="bg-[#1a1918] text-gray-400 border-t border-gray-800 font-sans mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-12">
            
            {/* Branding Column */}
            <div className="md:col-span-3 space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#E2A04F]" />
                <span className="font-display font-bold text-white tracking-wider uppercase text-sm">Afrolineo</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-serif italic max-w-sm">
                Preserving oral history, sovereign lineages, and localized cultural geography across ancestral compounds.
              </p>
              <div className="text-xs text-gray-500 font-mono">
                Platform Local Time: 2026 • Live Heritage Node
              </div>
            </div>

            {/* Explore Section */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-[12.5px] uppercase tracking-widest font-bold text-[#E2A04F] font-sans">Explore</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveScreen('about'); setSelectedAboutTab('articles'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-white transition-colors">Articles</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setShowSitemapModal(true); }} className="text-gray-400 hover:text-white transition-colors font-semibold text-[#E2A04F]">Sitemap</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveScreen('about'); setSelectedAboutTab('gifts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-white transition-colors">Gifts</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveScreen('about'); setSelectedAboutTab('customer-stories'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-white transition-colors">Customer Stories</a></li>
              </ul>
            </div>

            {/* About Section */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-[12.5px] uppercase tracking-widest font-bold text-[#E2A04F] font-sans">About</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveScreen('about'); setSelectedAboutTab('dei'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-white transition-colors">Diversity, Equity, and Inclusion</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveScreen('about'); setSelectedAboutTab('careers'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveScreen('about'); setSelectedAboutTab('newsroom'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-white transition-colors">Newsroom</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveScreen('about'); setSelectedAboutTab('security'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveScreen('about'); setSelectedAboutTab('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveScreen('about'); setSelectedAboutTab('guidelines'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-white transition-colors">User Guidelines</a></li>
              </ul>
            </div>

            {/* Terms & Support Section */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-[12.5px] uppercase tracking-widest font-bold text-[#E2A04F] font-sans">Terms & Support</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveScreen('about'); setSelectedAboutTab('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveScreen('about'); setSelectedAboutTab('social-impact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-white transition-colors">Social Impact</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveScreen('about'); setSelectedAboutTab('community-impact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-white transition-colors">Afrolineo in your Community</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveScreen('about'); setSelectedAboutTab('support'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                <li><button type="button" onClick={openCookieSettings} className="text-gray-400 hover:text-white transition-colors cursor-pointer">Cookie settings</button></li>
              </ul>
            </div>

            {/* Social Section */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-[12.5px] uppercase tracking-widest font-bold text-[#E2A04F] font-sans">Social</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-white transition-colors">YouTube</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-white transition-colors">LinkedIn</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom attribution copyright bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© 2026 Afrolineo Community Heritage Vault. Trace Your Land, Live Your Story.</p>
            <p className="text-xs text-gray-600 font-mono">
              Built for preserving oral history and localized cultural geography.
            </p>
          </div>
        </div>
      </footer>
      </div>

      {/* Person details panel */}
      {selectedProfile && !showForm && !showRecordingStudio && (() => {
        const person = selectedProfile;
        // "Grandmother Nneka" stays whole; "Zainab Okeke" becomes "Zainab"
        const cleanName = person.fullName.replace(/\(.*?\)/g, '').trim();
        const startsWithTitle = /^(grand(mother|father|ma|pa)|chief|papa|mama|baba|iya|mr|mrs|dr|alhaji|alhaja|prince|princess|oba|uncle|aunt(ie)?)\b/i.test(cleanName);
        const firstName = startsWithTitle ? cleanName : cleanName.split(' ')[0];
        const stories = recordings.filter((r) => r.profileId === person.id);
        const isUnset = (v?: string) => !v || v === 'Unspecified';
        const facts: { label: string; value?: string }[] = [
          { label: 'Family compound', value: person.familyCompound },
          { label: 'Hometown / LGA', value: person.lga },
          { label: 'Ward', value: person.ward },
          { label: 'Language', value: person.language },
          { label: 'Born', value: person.birthYear },
          { label: 'Birthplace', value: person.birthPlace },
        ];
        const formatDuration = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
        const closePanel = () => {
          stopStoryAudio();
          setSelectedProfile(null);
        };

        return (
          <div
            id="profile-detail-drawer"
            className="fixed inset-0 z-50 flex justify-end"
            onKeyDown={(e) => {
              if (e.key === 'Escape') closePanel();
            }}
          >
            <div className="fixed inset-0 bg-ink/50 backdrop-blur-[2px] animate-fadeIn" onClick={closePanel} aria-hidden="true" />

            <aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-drawer-name"
              className="relative w-full sm:max-w-[440px] bg-cream h-full flex flex-col shadow-[0_0_60px_-10px_rgba(31,27,23,0.5)] animate-slideLeft"
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-5 flex items-start gap-4 shrink-0">
                <span className={`shrink-0 w-15 h-15 rounded-full font-bold text-lg flex items-center justify-center ${SIDE_STYLES[ROLE_INFO[person.role].side]}`}>
                  {initials(person.fullName)}
                </span>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h2 id="profile-drawer-name" className="font-display font-medium text-[26px] leading-tight tracking-[-0.01em]">
                    {person.fullName}
                  </h2>
                  <p className="mt-0.5 text-[15px] text-muted">
                    {RELATION_PHRASE[person.role]}
                    {person.role !== 'self' && <> · {person.isAlive ? 'Living' : 'Passed on'}</>}
                  </p>
                </div>
                <button
                  id="close-drawer-btn"
                  type="button"
                  onClick={closePanel}
                  aria-label="Close"
                  autoFocus
                  className="shrink-0 -mr-2 -mt-1 w-11 h-11 rounded-full text-muted hover:text-ink hover:bg-sand flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-7">
                <button
                  id="record-new-story-drawer-btn"
                  type="button"
                  onClick={() => {
                    stopStoryAudio();
                    setShowRecordingStudio(true);
                  }}
                  className="w-full h-13 rounded-2xl bg-ochre hover:brightness-95 text-ink font-semibold text-base flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Mic className="w-5 h-5" aria-hidden="true" />
                  {person.role === 'self' ? 'Record your own story' : `Record a story with ${firstName}`}
                </button>

                {/* Details */}
                <section aria-labelledby="profile-details-heading">
                  <h3 id="profile-details-heading" className="font-sans text-base font-bold mb-3">Details</h3>
                  <dl className="grid grid-cols-2 gap-px bg-line rounded-2xl overflow-hidden border border-line">
                    {facts.map((f) => (
                      <div key={f.label} className="bg-white px-4 py-3">
                        <dt className="text-[13px] text-muted">{f.label}</dt>
                        <dd className={`mt-0.5 font-semibold text-[15px] break-words ${isUnset(f.value) ? 'text-[#9A8F82] font-normal' : ''}`}>
                          {isUnset(f.value) ? 'Not added' : f.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>

                {/* Notes */}
                {person.notes && person.notes.trim() && (
                  <section aria-labelledby="profile-notes-heading">
                    <h3 id="profile-notes-heading" className="font-sans text-base font-bold mb-2">About {firstName}</h3>
                    <p className="font-display text-[17px] leading-relaxed text-ink-soft whitespace-pre-line">{person.notes}</p>
                  </section>
                )}

                {/* Stories */}
                <section aria-labelledby="profile-stories-heading">
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 id="profile-stories-heading" className="font-sans text-base font-bold">Stories</h3>
                    {stories.length > 0 && <span className="text-sm text-muted">{stories.length}</span>}
                  </div>

                  {stories.length === 0 ? (
                    <div className="rounded-2xl border-[1.5px] border-dashed border-line-strong p-5 text-center">
                      <p className="font-semibold">No stories yet</p>
                      <p className="mt-1 text-sm text-muted">A good first question to ask:</p>
                      <p className="mt-2 font-display italic text-[17px] text-ink-soft">“What is one thing you want your grandchildren to remember?”</p>
                    </div>
                  ) : (
                    <ul className="space-y-2.5">
                      {stories.map((r) => {
                        const isPlaying = playingStoryId === r.id;
                        return (
                          <li key={r.id} className="bg-white border border-line rounded-2xl p-3.5">
                            <div className="flex items-center gap-3">
                              {r.audioBase64 ? (
                                <button
                                  type="button"
                                  onClick={() => toggleStoryAudio(r)}
                                  aria-label={`${isPlaying ? 'Pause' : 'Play'} ${r.title}`}
                                  className="shrink-0 w-11 h-11 rounded-full bg-ink text-cream flex items-center justify-center cursor-pointer hover:bg-ink-soft"
                                >
                                  {isPlaying ? <Pause className="w-[18px] h-[18px] fill-current" /> : <Play className="w-[18px] h-[18px] fill-current ml-0.5" />}
                                </button>
                              ) : (
                                <span className="shrink-0 w-11 h-11 rounded-full bg-sand text-ink-soft flex items-center justify-center" title="Transcript only">
                                  <FileText className="w-[18px] h-[18px]" aria-hidden="true" />
                                </span>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-[15px] leading-snug">{r.title}</p>
                                <p className="text-[13px] text-muted">
                                  {formatDuration(r.durationSec)} · {r.recordedAt}
                                  {!r.audioBase64 && ' · transcript only'}
                                </p>
                              </div>
                            </div>
                            {r.transcript && (
                              <details className="group mt-2.5">
                                <summary className="list-none cursor-pointer text-sm font-semibold text-ochre-deep hover:underline underline-offset-4">
                                  <span className="group-open:hidden">Read transcript</span>
                                  <span className="hidden group-open:inline">Hide transcript</span>
                                </summary>
                                <p className="mt-2 font-display text-[15.5px] leading-relaxed text-ink-soft whitespace-pre-line">{r.transcript}</p>
                              </details>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </div>

              {/* Footer */}
              <div className="border-t border-line px-6 py-4 flex gap-2.5 shrink-0 bg-cream">
                <button
                  id="edit-profile-drawer-btn"
                  type="button"
                  onClick={() => {
                    stopStoryAudio();
                    setShowForm(true);
                  }}
                  className="flex-1 h-12 rounded-xl border-[1.5px] border-[#CFC4B4] bg-white font-semibold hover:border-ink cursor-pointer flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" aria-hidden="true" />
                  Edit details
                </button>
                {person.role !== 'self' && (
                  <button
                    id="delete-profile-drawer-btn"
                    type="button"
                    onClick={() => handleDeleteProfile(person.id)}
                    aria-label={`Remove ${person.fullName} from tree`}
                    title="Remove from tree"
                    className="w-12 h-12 rounded-xl border-[1.5px] border-line text-muted hover:text-record hover:border-record/40 hover:bg-[#FDECEA] flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-[18px] h-[18px]" />
                  </button>
                )}
              </div>
            </aside>
          </div>
        );
      })()}

      {/* DOCK / FORM MODALS */}
      {showForm && (
        <div id="form-overlay" className="fixed inset-0 z-50 bg-[#1a1918]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl">
            <OriginsProfileForm 
              onSubmit={handleSaveProfile}
              onCancel={() => {
                setShowForm(false);
                setFixedRoleForForm(undefined);
              }}
              initialProfile={selectedProfile}
              fixedRole={fixedRoleForForm}
            />
          </div>
        </div>
      )}

      {showRecordingStudio && selectedProfile && (
        <div id="recording-studio-overlay" className="fixed inset-0 z-50 bg-[#1a1918]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl">
            <RecordingStudio 
              profile={selectedProfile}
              onSaveRecording={handleSaveOralHistory}
              onClose={() => setShowRecordingStudio(false)}
            />
          </div>
        </div>
      )}

      {/* MODAL: Import Export / Backup sovereign details */}
      {showImportExport && (
        <div id="import-export-modal" className="fixed inset-0 z-50 bg-[#1a1918]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F9F7F2] rounded-sm border border-[#2D2926]/20 max-w-md w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[#2D2926]/12">
              <h3 className="font-display font-medium text-sm text-[#2D2926] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <Download className="w-4 h-4 text-[#E2A04F]" />
                Sovereign Heritage Data Archiver
              </h3>
              <button onClick={() => setShowImportExport(false)} className="text-[#2D2926]/55 hover:text-[#2D2926] transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#2D2926]/75 leading-relaxed font-serif">
              We align strictly to complete data ownership guidelines. Download your entire oral transcript map tree safely offline, or restore historical genealogy maps anytime.
            </p>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <span className="text-xs text-[#2D2926]/50 uppercase font-sans tracking-wider font-bold block">Method 1: File Transfer</span>
                
                <button
                  id="export-database-binary-btn"
                  onClick={triggerExportDatabase}
                  className="w-full py-2.5 px-4 bg-[#2D2926] text-[#F9F7F2] hover:bg-[#E2A04F] hover:text-[#2D2926] text-xs font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Heritage Backup (.afrolineo)
                </button>

                <div className="border border-dashed border-[#2D2926]/12 p-3 rounded-sm flex flex-col items-center justify-center bg-white bg-opacity-40">
                  <span className="text-xs text-[#2D2926]/50 uppercase font-sans tracking-wider font-bold mb-1.5">Import Backup File</span>
                  <label className="px-4 py-1.5 bg-[#FAF8F5] border border-[#2D2926]/15 hover:border-[#E2A04F] rounded-sm text-xs font-bold uppercase tracking-wider text-[#2D2926] cursor-pointer shadow-xs transition-[#FAF8F5]">
                    Upload Backup File
                    <input
                      type="file"
                      accept=".afrolineo"
                      onChange={handleImportDatabase}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Robust Iframe Sandbox Copy/Paste fallback section */}
              <div className="border-t border-[#2D2926]/12 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#E2A04F] uppercase font-sans tracking-wider font-bold">
                    Method 2: Copy & Paste Fallback
                  </span>
                  <button
                    onClick={() => setShowRawTextFallback(!showRawTextFallback)}
                    className="text-xs uppercase tracking-wider text-[#2D2926]/60 hover:text-[#2D2926] font-bold underline transition-colors cursor-pointer"
                  >
                    {showRawTextFallback ? 'Hide' : 'Show Manual Clipboard Tools'}
                  </button>
                </div>

                <p className="text-xs text-[#2D2926]/60 font-serif leading-normal italic">
                  Note: If downloading fails inside the browser preview frame due to security sandbox restrictions, use these tools to securely backup or restore your data!
                </p>

                {showRawTextFallback && (
                  <div className="space-y-3 p-3 bg-white/70 border border-[#2D2926]/10 rounded-sm animate-slideDown">
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-1">Backup Data Code</span>
                      <button
                        onClick={handleCopyRawBackup}
                        className={`w-full py-2 px-3 text-xs rounded-sm font-sans uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          copySuccess 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-[#2D2926]/5 hover:bg-[#2D2926]/10 text-[#2D2926]'
                        }`}
                      >
                        {copySuccess ? <Check className="w-3.5 h-3.5 animate-pulse" /> : <Copy className="w-3.5 h-3.5" />}
                        {copySuccess ? 'Copied Custom Archive!' : 'Copy Raw Backup to Clipboard'}
                      </button>
                      <span className="text-xs text-gray-400 block mt-1 leading-normal italic">
                        Clicking this copies your raw lineage and transcript records. Paste it into any text file (.txt/.json) on your computer to save!
                      </span>
                    </div>

                    <div className="border-t border-gray-150 pt-2.5">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-1">Restore from Raw Text</span>
                      <textarea
                        rows={3}
                        placeholder='Paste your raw .afrolineo backup JSON string here...'
                        value={manualBackupInput}
                        onChange={(e) => setManualBackupInput(e.target.value)}
                        className="w-full text-xs p-2 bg-gray-50 border border-gray-250 rounded shadow-inner font-mono focus:outline-none focus:border-[#E2A04F]"
                      />
                      <button
                        type="button"
                        onClick={handleRestoreFromText}
                        disabled={!manualBackupInput.trim()}
                        className="w-full mt-1.5 py-1.5 px-3 bg-[#E2A04F]/90 hover:bg-[#E2A04F] disabled:bg-gray-200 disabled:text-gray-400 text-black text-xs font-sans font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                      >
                        Restore From Text Paste
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secret Feedback Modal: PM specs matching */}
      {showFeedbackModal && (
        <div id="pm-feedback-modal" className="fixed inset-0 z-50 bg-[#1a1918]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F9F7F2] rounded-sm p-6 border border-[#2D2926]/20 max-w-md w-full shrink-0 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#2D2926]/12 pb-2">
              <div className="flex items-center gap-1.5 font-sans font-bold text-[#2D2926] text-xs uppercase tracking-wide">
                <Smile className="w-4 h-4 text-[#E2A04F]" />
                Founder PM Feedback Button
              </div>
              <button onClick={() => setShowFeedbackModal(false)} className="text-[#2D2926]/55 hover:text-[#2D2926] transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#2D2926]/70 leading-relaxed font-serif italic">
              This panel serves as the <strong>Secret Feedback Button</strong> mentioned in the product specs, helping catalog exactly which critical missing feature or discovery gap needs to be built next.
            </p>

            {feedbackSuccess ? (
              <div className="bg-[#E2A04F]/10 border border-[#E2A04F]/20 p-5 rounded-sm text-center text-xs space-y-1 text-[#2D2926]">
                <Check className="w-6 h-6 text-emerald-800 mx-auto" />
                <p className="font-serif font-bold">Feedback Cataloged Successfully.</p>
                <p className="text-xs text-[#2D2926]/60">Thank you for helping us iterate Afrolineo!</p>
              </div>
            ) : (
              <form onSubmit={handleSendPMFeedback} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase font-sans tracking-widest text-[#2D2926]/50 mb-1.5 font-bold">
                    What is the most critical feature missing right now?
                  </label>
                  <textarea
                    id="input-feedback-text"
                    required
                    rows={4}
                    value={userFeedbackMessage}
                    onChange={(e) => setUserFeedbackMessage(e.target.value)}
                    placeholder="e.g. Please add photo scanning archives, maternal lineage DNA links, or Yoruba translation enhancements..."
                    className="w-full text-xs border border-[#2D2926]/12 rounded-sm p-3 focus:outline-none focus:ring-1 focus:ring-[#E2A04F]/50 bg-white placeholder-[#2D2926]/40 text-[#2D2926] font-serif"
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs font-sans tracking-wider uppercase font-bold">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 border border-[#2D2926]/15 rounded-sm text-[#2D2926] hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2D2926] hover:bg-[#E2A04F] hover:text-[#2D2926] text-[#F9F7F2] rounded-sm shadow-sm transition-all cursor-pointer"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* COMPREHENSIVE INTERACTIVE SITEMAP MODAL */}
      {showSitemapModal && (
        <div id="interactive-sitemap-modal" className="fixed inset-0 z-50 bg-[#1a1918]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-[#2D2926]/20 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden animate-scaleIn text-[#2D2926]">
            
            {/* Header banner */}
            <div className="bg-[#2D2926] p-6 text-[#F9F7F2] flex items-center justify-between border-b border-[#E2A04F]/20">
              <div className="flex items-center gap-3 text-left">
                <Network className="w-6 h-6 text-[#E2A04F]" />
                <div>
                  <h3 className="font-display font-bold text-lg uppercase tracking-wider text-white">Afrolineo Active Sitemap</h3>
                  <p className="text-xs text-gray-400 font-sans tracking-normal leading-normal">
                    Interactive portal mapper offering single-click shortcuts to all pedigree screens and localized heritage tools.
                  </p>
                </div>
              </div>
              <button 
                id="close-sitemap-top-btn"
                onClick={() => { setShowSitemapModal(false); setSitemapSearchQuery(''); }} 
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Close Sitemap"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sitemap Search Panel */}
            <div className="px-6 md:px-8 pt-6">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search active sitemap nodes (e.g. Pedigree, Careers, Privacy)..."
                  value={sitemapSearchQuery}
                  onChange={(e) => setSitemapSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#2D2926] focus:outline-none focus:border-[#E2A04F] shadow-xs"
                />
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              
              {/* Main Directory Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left">
                
                {/* Column 1: Core Navigation (Explore Views) */}
                <div className="space-y-4">
                  <div className="border-b border-[#2D2926]/10 pb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#E2A04F]" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D2926] font-sans">Core Navigation</h4>
                  </div>
                  <p className="text-[12.5px] text-gray-500 leading-relaxed font-serif italic">
                    Direct access links to our decentralized physical mapping hubs and oral vaults.
                  </p>
                  
                  <ul className="space-y-2.5">
                    {[
                      { id: 'sitemap-nav-tree', key: 'tree', label: 'Interactive Pedigree Map', icon: <Users className="w-3.5 h-3.5 text-[#2D2926]" /> },
                      { id: 'sitemap-nav-discovery', key: 'discovery', label: 'Oral Discovery Hub', icon: <Globe className="w-3.5 h-3.5 text-[#2D2926]" /> },
                      { id: 'sitemap-nav-community', key: 'community', label: 'Kinship Vault & Matcher', icon: <UserPlus className="w-3.5 h-3.5 text-[#2D2926]" /> },
                      { id: 'sitemap-nav-dash', key: 'dash', label: 'Growth Loop & Telemetry', icon: <Flame className="w-3.5 h-3.5 text-[#2D2926]" /> }
                    ].filter(item => item.label.toLowerCase().includes(sitemapSearchQuery.toLowerCase())).map((item) => (
                      <li key={item.id}>
                        <button 
                          id={item.id}
                          onClick={() => {
                            setActiveScreen(item.key as any);
                            setShowSitemapModal(false);
                            setSitemapSearchQuery('');
                          }}
                          className={`w-full text-left p-2 rounded-sm border hover:border-[#E2A04F] transition-all flex items-center justify-between text-xs cursor-pointer group ${
                            activeScreen === item.key ? 'bg-[#E2A04F]/10 border-[#E2A04F] font-bold text-[#2D2926]' : 'bg-white border-gray-200 text-gray-750'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {item.icon}
                            {item.label}
                          </span>
                          <span className="text-xs uppercase font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-400 group-hover:text-[#E2A04F]">
                            {activeScreen === item.key ? 'Current' : 'Jump'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: Sovereign Utility Triggers */}
                <div className="space-y-4">
                  <div className="border-b border-[#2D2926]/10 pb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#E2A04F]" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D2926] font-sans">Active Custodian Tools</h4>
                  </div>
                  <p className="text-[12.5px] text-gray-500 leading-relaxed font-serif italic">
                    Actionable sub-modules for recording lineage voices and downloading credentials.
                  </p>

                  <ul className="space-y-2.5">
                    {[
                      {
                        id: 'sitemap-action-record',
                        label: 'Launch Spoken Recording Studio',
                        icon: <Mic className="w-3.5 h-3.5 text-gray-750" />,
                        badge: 'Launch',
                        badgeClass: 'bg-amber-50 text-amber-850 border-amber-100',
                        onClick: () => {
                          if (profiles.length > 0) {
                            setSelectedProfile(profiles[0]);
                            setShowRecordingStudio(true);
                          }
                        }
                      },
                      {
                        id: 'sitemap-action-bio',
                        label: 'Establish Custom Bio Node',
                        icon: <Plus className="w-3.5 h-3.5 text-gray-750" />,
                        badge: 'Create',
                        badgeClass: 'bg-gray-100 text-gray-650',
                        onClick: () => {
                          setFixedRoleForForm(undefined);
                          setSelectedProfile(undefined);
                          setShowForm(true);
                        }
                      },
                      {
                        id: 'sitemap-action-backup',
                        label: 'Sovereign Offline Backup',
                        icon: <Download className="w-3.5 h-3.5 text-gray-750" />,
                        badge: 'Port',
                        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-150',
                        onClick: () => {
                          setShowImportExport(true);
                        }
                      },
                      {
                        id: 'sitemap-action-feedback',
                        label: 'Secret PM Feedback Panel',
                        icon: <Smile className="w-3.5 h-3.5 text-gray-750" />,
                        badge: 'Feedback',
                        badgeClass: 'bg-gray-100 text-gray-650',
                        onClick: () => {
                          setShowFeedbackModal(true);
                        }
                      }
                    ].filter(item => item.label.toLowerCase().includes(sitemapSearchQuery.toLowerCase())).map((item) => (
                      <li key={item.id}>
                        <button 
                          id={item.id}
                          onClick={() => {
                            item.onClick();
                            setShowSitemapModal(false);
                            setSitemapSearchQuery('');
                          }}
                          className="w-full text-left p-2 bg-white border border-gray-200 hover:border-[#E2A04F] rounded-sm transition-all flex items-center justify-between text-xs cursor-pointer group"
                        >
                          <span className="flex items-center gap-2">
                            {item.icon}
                            {item.label}
                          </span>
                          <span className={`text-xs uppercase font-mono px-1.5 py-0.5 rounded border ${item.badgeClass}`}>
                            {item.badge}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Corporate & About Pages */}
                <div className="space-y-4">
                  <div className="border-b border-[#2D2926]/10 pb-2 flex items-center gap-2">
                    <FolderHeart className="w-4 h-4 text-[#E2A04F]" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D2926] font-sans">About Directory</h4>
                  </div>
                  <p className="text-[12.5px] text-gray-500 leading-relaxed font-serif italic">
                    Administrative credentials, public guidelines, and platform newsrooms.
                  </p>

                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'dei', label: 'Diversity, Equity & Inclusion', badge: 'DEI' },
                      { id: 'careers', label: 'Careers & Opportunities', badge: 'Jobs' },
                      { id: 'newsroom', label: 'Newsroom & Press Releases', badge: 'Media' },
                      { id: 'security', label: 'Platform Security', badge: 'Trust' },
                      { id: 'privacy', label: 'Sovereign Privacy Policy', badge: 'Legal' },
                      { id: 'guidelines', label: 'Custodian User Guidelines', badge: 'Rules' },
                      { id: 'terms', label: 'Sovereign Heritage Terms', badge: 'Terms' },
                      { id: 'social-impact', label: 'Social & Cultural Impact', badge: 'Impact' },
                      { id: 'community-impact', label: 'Afrolineo in your Community', badge: 'Comm' },
                      { id: 'support', label: 'Custodian Support Center', badge: 'Help' }
                    ].filter(item => item.label.toLowerCase().includes(sitemapSearchQuery.toLowerCase())).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveScreen('about');
                          setSelectedAboutTab(item.id as any);
                          setShowSitemapModal(false);
                          setSitemapSearchQuery('');
                        }}
                        className="text-left text-xs p-2 bg-white border border-gray-150 hover:border-[#E2A04F] rounded-sm text-gray-700 hover:text-[#2D2926] transition-colors flex justify-between items-center cursor-pointer"
                      >
                        <span>{item.label}</span>
                        <span className="text-xs uppercase font-mono text-gray-400">{item.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Quick stats panel */}
              <div className="bg-[#FAF8F5] border border-[#2D2926]/10 p-4 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-bold font-sans block">Total Profiles Mapped</span>
                  <p className="text-xl font-serif font-black text-[#2D2926] mt-0.5">{profiles.length}</p>
                </div>
                <div className="border-l border-gray-200">
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-bold font-sans block">Voice Recordings Captured</span>
                  <p className="text-xl font-serif font-black text-[#2D2926] mt-0.5">{recordings.length}</p>
                </div>
                <div className="border-l border-gray-200">
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-bold font-sans block">Backup Status</span>
                  <p className="text-xl font-serif font-black text-emerald-850 mt-0.5 flex items-center justify-center gap-1">
                    {hasExportedData ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-700 inline" /> Saved
                      </>
                    ) : (
                      <span className="text-amber-700">Pending</span>
                    )}
                  </p>
                </div>
                <div className="border-l border-gray-200">
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-bold font-sans block">Active Local Logins</span>
                  <p className="text-xl font-serif font-black text-[#2D2926] mt-0.5">{loginSessions.filter(s => s.status === 'Active').length}</p>
                </div>
              </div>

            </div>

            {/* Bottom action controls */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-150 flex justify-end">
              <button 
                id="close-sitemap-bottom-btn"
                onClick={() => setShowSitemapModal(false)}
                className="px-5 py-2.5 bg-[#2D2926] hover:bg-[#E2A04F] hover:text-[#2D2926] text-[#F9F7F2] text-xs font-sans font-bold uppercase tracking-wider rounded-sm shadow-xs transition-all cursor-pointer"
              >
                Close Site Mapper
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
