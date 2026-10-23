import React, { useEffect, useState } from 'react';
import { 
  Mail, Chrome, Facebook, Apple, Twitter, Lock, Sparkles, 
  ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, HelpCircle, 
  UserCheck, Heart, Radio, Languages, Compass, Mic, Network, Shield,
  X as CloseIcon, ChevronDown, CheckCircle, Volume2,
  Globe, Briefcase, Newspaper, FileText, Users, UserPlus, Flame, 
  Settings, Plus, Download, Smile, Search, BookOpen, Gift, Play, Pause, Bookmark, Check
} from 'lucide-react';
import LineageMark from './LineageMark';
import { track } from '../lib/analytics';

import { ARTICLES, GIFTS, STORIES } from '../data/exploreData';

interface UserLoginGateProps {
  onLoginSuccess: (userData: { 
    email: string; 
    name: string; 
    provider: string;
    ancestralCountry?: string;
    ethnicGroup?: string;
    custodianName?: string;
    knowledgeLevel?: string;
    ancestralState?: string;
    ancestralWard?: string;
  }) => void;
}

const STATES_BY_COUNTRY: Record<string, string[]> = {
  Nigeria: [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
    'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe', 'Imo', 'Jigawa',
    'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
    'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ],
  Ghana: [
    'Greater Accra', 'Ashanti', 'Eastern', 'Western', 'Western North', 'Central', 'Volta', 'Oti',
    'Northern', 'Savannah', 'North East', 'Upper East', 'Upper West', 'Bono', 'Bono East', 'Ahafo'
  ],
  'Sierra Leone': [
    'Western Area Urban', 'Western Area Rural', 'Northern Province', 'North West Province', 'Eastern Province', 'Southern Province'
  ],
  Kenya: [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo',
    'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui',
    'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori',
    'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
    'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana',
    'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ],
  'South Africa': [
    'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'
  ],
  Zimbabwe: [
    'Harare', 'Bulawayo', 'Manicaland', 'Midlands', 'Masvingo', 'Mashonaland West', 'Mashonaland East', 'Mashonaland Central', 'Matabeleland North', 'Matabeleland South'
  ],
  'Angola / Congo-Zaire': [
    'Luanda', 'Kinshasa', 'Cabinda', 'Benguela', 'Huambo', 'Lubumbashi', 'Kisangani', 'Goma', 'Bandundu',
    'Bas-Congo', 'Katanga', 'Kasaï-Oriental', 'Kasaï-Occidental', 'Equateur', 'Orientale', 'Kivu', 'Namibe', 'Cuanza Sul', 'Uige', 'Zaire'
  ],
  'Other African Native Region': ['Other Regional Territory']
};

const WARDS_BY_STATE: Record<string, string[]> = {
  // Nigeria - Comprehensive Wards for Core States
  'Lagos': ['Ward A1 (Lagos Island)', 'Ward B2 (Alimosho)', 'Ward C3 (Ikeja)', 'Ward D4 (Surulere)', 'Ward E5 (Badagry)', 'Ward F6 (Epe)', 'Ward G7 (Ikorodu)', 'Ward H8 (Apapa)', 'Ward J9 (Kosofe)', 'Other Ward'],
  'Oyo': ['Ward 01 (Ibadan North)', 'Ward 02 (Ogbomosho)', 'Ward 03 (Oyo East)', 'Ward 04 (Iseyin)', 'Ward 05 (Saki East)', 'Ward 06 (Egbeda)', 'Other Ward'],
  'Osun': ['Ward 01 (Osogbo)', 'Ward 02 (Ile-Ife)', 'Ward 03 (Ilesa)', 'Ward 04 (Ede)', 'Ward 05 (Iwo)', 'Other Ward'],
  'Ogun': ['Ward 01 (Abeokuta South)', 'Ward 02 (Ijebu Ode)', 'Ward 03 (Sagamu)', 'Ward 04 (Ota)', 'Ward 05 (Ilaro)', 'Other Ward'],
  'Ondo': ['Ward 01 (Akure South)', 'Ward 02 (Owo)', 'Ward 03 (Ondo West)', 'Ward 04 (Okitipupa)', 'Other Ward'],
  'Ekiti': ['Ward 01 (Ado Central)', 'Ward 02 (Ikere East)', 'Ward 03 (Oye)', 'Ward 04 (Ijero)', 'Other Ward'],
  'Anambra': ['Otolo Ward 1 (Nnewi)', 'Umudim Ward 2 (Nnewi)', 'Ward 01 (Awka)', 'Ward 02 (Onitsha)', 'Ward 03 (Ekwulobia)', 'Other Ward'],
  'Enugu': ['Ward 01 (Enugu North)', 'Ward 02 (Nsukka)', 'Ward 03 (Udi)', 'Other Ward'],
  'Rivers': ['Ward 01 (Port Harcourt)', 'Ward 02 (Obio-Akpor)', 'Ward 03 (Bonny Island)', 'Other Ward'],
  'Kano': ['Ward 01 (Fagge)', 'Ward 02 (Dala)', 'Ward 03 (Gwale)', 'Ward 04 (Nassarawa)', 'Other Ward'],
  'Kaduna': ['Ward 01 (Kaduna North)', 'Ward 02 (Zaria)', 'Ward 03 (Kafanchan)', 'Other Ward'],
  'Kwara': ['Ward 01 (Ilorin West)', 'Ward 02 (Offa)', 'Other Ward'],
  'Kogi': ['Ward 01 (Lokoja)', 'Ward 02 (Okene)', 'Other Ward'],
  'Edo': ['Ward 01 (Oredo-Benin)', 'Ward 02 (Esan North)', 'Other Ward'],
  'Delta': ['Ward 01 (Warri)', 'Ward 02 (Asaba)', 'Other Ward'],
  'FCT Abuja': ['Ward 01 (Garki)', 'Ward 02 (Wuse)', 'Ward 03 (Maitama)', 'Ward 04 (Asokoro)', 'Ward 05 (Gwagwalada)', 'Other Ward'],

  // Ghana - Core Wards
  'Greater Accra': ['Accra Central Ward', 'Tema West Ward', 'Adentan Ward', 'Ashaiman Ward', 'Madina Ward', 'Other Ward'],
  'Ashanti': ['Kumasi Central Ward', 'Obuasi Ward', 'Mampong Ward', 'Konongo Ward', 'Other Ward'],
  'Western': ['Sekondi-Takoradi Ward', 'Tarkwa Ward', 'Other Ward'],
  'Volta': ['Ho Municipal Ward', 'Keta Ward', 'Other Ward'],

  // Kenya - Core Wards/Sub-counties
  'Nairobi': ['Nairobi West Ward', 'Kibra Ward', 'Westlands Ward', 'Makadara Ward', 'Embakasi Ward', 'Other Ward'],
  'Mombasa': ['Mvita Ward', 'Nyali Ward', 'Likoni Ward', 'Changamwe Ward', 'Other Ward'],
  'Kisumu': ['Kisumu Central Ward', 'Kisumu East Ward', 'Other Ward'],
  'Nakuru': ['Nakuru Town Ward', 'Naivasha Ward', 'Other Ward'],
  'Kiambu': ['Thika Ward', 'Ruiru Ward', 'Kiambu Town Ward', 'Other Ward'],

  // South Africa - Core Wards
  'Gauteng': ['Johannesburg North', 'Tshwane South', 'Soweto East', 'Sandton Ward', 'Other Ward'],
  'Western Cape': ['Cape Town Ward', 'Stellenbosch Ward', 'George Ward', 'Other Ward'],
  'KwaZulu-Natal': ['Durban Central', 'Pietermaritzburg', 'Other Ward'],

  // Sierra Leone - Core Wards
  'Western Area Urban': ['Central Ward (Freetown)', 'East Ward (Freetown)', 'West Ward (Freetown)', 'Other Ward'],

  // Zimbabwe
  'Harare': ['Harare Central Ward', 'Avondale Ward', 'Mbare Ward', 'Other Ward'],
  'Bulawayo': ['Bulawayo Central Ward', 'Other Ward'],

  // Angola & Congo
  'Luanda': ['Maianga Ward', 'Samba Ward', 'Ingombota Ward', 'Other Ward'],
  'Kinshasa': ['Gombe Ward', 'Limete Ward', 'Ngaliema Ward', 'Other Ward']
};

const getWardsForState = (stateName: string): string[] => {
  if (!stateName) return ['Ward 01', 'Ward 02', 'Ward 03', 'Ward 04', 'Other Ward'];
  if (WARDS_BY_STATE[stateName]) return WARDS_BY_STATE[stateName];
  return [
    `${stateName} Central Ward`,
    `${stateName} Ward 01`,
    `${stateName} Ward 02`,
    `${stateName} Zone Alpha`,
    `Other ${stateName} Ward`
  ];
};

const ETHNIC_GROUPS_BY_COUNTRY: Record<string, string[]> = {
  Nigeria: ['Yoruba', 'Igbo', 'Hausa', 'Fulani', 'Ijaw', 'Kanuri', 'Edo', 'Tiv', 'Ibibio', 'Nupe', 'Urhobo', 'Other Nigerian Ethnic Group'],
  Ghana: ['Akan', 'Ashanti', 'Fante', 'Ewe', 'Ga-Adangbe', 'Dagomba', 'Nzema', 'Guan', 'Other Ghanaian Ethnic Group'],
  'Sierra Leone': ['Temne', 'Mende', 'Limba', 'Kono', 'Krio', 'Mandingo', 'Sherbro', 'Loko', 'Other Sierra Leonean Ethnic Group'],
  Kenya: ['Kikuyu', 'Luhya', 'Luo', 'Kalenjin', 'Kamba', 'Kisii', 'Meru', 'Mijikenda', 'Maasai', 'Other Kenyan Ethnic Group'],
  'South Africa': ['Zulu', 'Xhosa', 'Sotho', 'Pedi', 'Tswana', 'Tsonga', 'Swati', 'Venda', 'Ndebele', 'Other South African Ethnic Group'],
  Zimbabwe: ['Shona', 'Ndebele', 'Tonga', 'Venda', 'Kalanga', 'Other Zimbabwean Ethnic Group'],
  'Angola / Congo-Zaire': ['Bakongo (Kongo)', 'Luba', 'Mongo', 'Chokwe', 'Ovimbundu', 'Mbundu', 'Mangbetu', 'Azande', 'Teke', 'Ngbaka', 'Other Native Ethnic Group'],
  'Other African Native Region': ['Wolof', 'Mandinka', 'Bambara', 'Fula', 'Somali', 'Amhara', 'Oromo', 'Tigrayan', 'Nubian', 'Tuareg', 'Other Ancestral Group']
};

const getEthnicGroupsForCountry = (country: string): string[] => {
  return ETHNIC_GROUPS_BY_COUNTRY[country] || ['Other Ancestral Group'];
};

// ---------- Landing page content ----------

const WAVEFORM = [30, 55, 40, 70, 85, 60, 45, 75, 95, 65, 50, 80, 70, 40, 55, 90, 75, 50, 35, 60, 80, 65, 45, 70, 55, 40, 60, 75, 50, 35, 45, 65, 55, 40, 30, 50, 40, 30, 25, 35];

const HOW_IT_WORKS = [
  {
    icon: Mic,
    tint: 'bg-ochre-tint text-paternal-ink',
    title: 'Record an elder',
    body: 'Press record and let them talk, or upload a voice note a relative sent you. Each story is transcribed and filed under that person\u2019s name.',
  },
  {
    icon: LineageMark,
    tint: 'bg-forest-tint text-forest',
    title: 'Map your lineage',
    body: 'Add parents, grandparents and siblings. Note each person\u2019s family compound, town and language, the details paper records leave out.',
  },
  {
    icon: Users,
    tint: 'bg-indigo-tint text-indigo',
    title: 'Find your kin',
    body: 'When another family names the same compound or district, we let you know. You decide whether to connect.',
  },
];

const SAMPLE_TRANSCRIPT = [
  { time: '0:12', text: 'My grandchildren, remember this. Our people did not begin in this town.' },
  { time: '0:31', text: 'We left in the dry season, carrying the seed yams and the names of our fathers.' },
  { time: '0:54', text: 'The market women of Onitsha knew my mother by her cloth\u2026' },
];

const STORY_POINTS = [
  { title: 'In their own language.', body: 'Yoruba, Igbo, Hausa, Wolof, Twi and more.' },
  { title: 'Searchable transcripts.', body: 'Find every mention of a town or a name.' },
  { title: 'Attached to the person.', body: 'Open anyone in the tree to hear them.' },
];

const PRIVACY_POINTS = [
  { icon: Lock, title: 'Your stories stay with you', body: 'Recordings, transcripts and notes are stored in your own browser. We keep only your account, an outline of your tree (names and relationships) and how you use the app.' },
  { icon: Download, title: 'Export everything', body: 'Download your whole archive, with audio and transcripts, as one file whenever you want.' },
  { icon: ShieldCheck, title: 'You choose who connects', body: 'Other families only see a match if you both agree to link.' },
];

const FOOTER_LINKS: { label: string; tab?: string }[] = [
  { label: 'Articles', tab: 'articles' },
  { label: 'Family stories', tab: 'customer-stories' },
  { label: 'Gifts', tab: 'gifts' },
  { label: 'Privacy', tab: 'privacy' },
  { label: 'Terms', tab: 'terms' },
  { label: 'Help', tab: 'support' },
  { label: 'All pages' },
];

function PreviewAvatar({ initials, dashed, size = 'md', className = '' }: { initials?: string; dashed?: boolean; size?: 'md' | 'lg'; className?: string }) {
  const dims = size === 'lg' ? 'w-13 h-13 text-[15px]' : 'w-11 h-11 text-sm';
  if (dashed) {
    return <span className={`${dims} rounded-full border-[1.5px] border-dashed border-line-strong text-[#8C8174] flex items-center justify-center text-xl`}>+</span>;
  }
  return <span className={`${dims} rounded-full font-bold flex items-center justify-center ${className}`}>{initials}</span>;
}

/** Thin strip of brand colours, inspired by woven kente cloth. */
function PatternBand() {
  const colours = ['bg-ochre', 'bg-ink', 'bg-forest', 'bg-sand', 'bg-[#9A5B14]', 'bg-indigo'];
  return (
    <div aria-hidden="true" className="flex h-2.5 overflow-hidden">
      {Array.from({ length: 60 }, (_, i) => (
        <span key={i} className={`flex-[1_0_30px] ${colours[i % colours.length]}`} />
      ))}
    </div>
  );
}

// ---------- Sign-in window ----------

const FIELD_CLASS =
  'w-full h-12 px-4 rounded-xl bg-white border border-line text-[15px] text-ink outline-none transition focus:border-ochre focus:ring-2 focus:ring-ochre/25 disabled:opacity-60';
const LABEL_CLASS = 'block text-sm font-semibold text-ink-soft mb-1.5';
const PRIMARY_BUTTON_CLASS =
  'w-full h-12 rounded-full bg-ochre hover:brightness-95 text-ink font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60';

const KNOWLEDGE_OPTIONS = [
  { value: 'Just starting out', title: 'Just starting', body: 'I know my parents, maybe a grandparent.' },
  { value: 'Know 2-3 generations', title: 'Some generations', body: 'I know my parents and grandparents.' },
  { value: 'Pre-colonial dynasty archivist', title: 'Deep history', body: 'I know four or more generations.' },
];

const OAUTH_PROVIDERS: { id: string; label: string; icon: React.ReactNode }[] = [
  {
    id: 'Google',
    label: 'Google',
    icon: (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.62-1.07-1.37-1.34-2.22z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    ),
  },
  {
    id: 'Apple',
    label: 'Apple',
    icon: (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0 fill-current" aria-hidden="true">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.12 1.12.9 1.1.9 1.1s.63-.53.92-2.43z" />
      </svg>
    ),
  },
  {
    id: 'X',
    label: 'X',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 fill-current" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'Facebook',
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0 fill-[#1877F2]" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

function Spinner() {
  return <span aria-hidden="true" className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />;
}

function StatusMessage({ error, success }: { error?: string; success?: string }) {
  if (error) {
    return (
      <div role="alert" className="mb-4 mt-4 p-3.5 rounded-xl bg-[#FDECEA] text-[#8A1C12] text-sm flex items-start gap-2.5">
        <AlertCircle className="w-[18px] h-[18px] shrink-0 mt-px" aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }
  if (success) {
    return (
      <div role="status" className="mb-4 mt-4 p-3.5 rounded-xl bg-forest-tint text-forest text-sm flex items-start gap-2.5">
        <CheckCircle2 className="w-[18px] h-[18px] shrink-0 mt-px" aria-hidden="true" />
        <span>{success}</span>
      </div>
    );
  }
  return null;
}

export default function UserLoginGate({ onLoginSuccess }: UserLoginGateProps) {
  // Navigation & Interactive modal state
  const [isLoginWindowOpen, setIsLoginWindowOpen] = useState(false);
  const [showSitemapLanding, setShowSitemapLanding] = useState(false);
  const [activeAboutTabLanding, setActiveAboutTabLanding] = useState<string | null>(null);
  const [sitemapSearchQuery, setSitemapSearchQuery] = useState('');

  // Interactive states for Terms, Social Impact, Community & Support (Landing)
  const [pactSignedLanding, setPactSignedLanding] = useState(false);
  const [sponsorshipCompoundLanding, setSponsorshipCompoundLanding] = useState('');
  const [sponsorshipLGALanding, setSponsorshipLGALanding] = useState('');
  const [sponsorshipSubmittedLanding, setSponsorshipSubmittedLanding] = useState(false);
  const [workshopBookedLanding, setWorkshopBookedLanding] = useState(false);
  const [workshopDateLanding, setWorkshopDateLanding] = useState('');
  const [supportSubmittedLanding, setSupportSubmittedLanding] = useState(false);
  const [supportCategoryLanding, setSupportCategoryLanding] = useState('offline');
  const [supportMessageLanding, setSupportMessageLanding] = useState('');
  const [supportEmailLanding, setSupportEmailLanding] = useState('');
  const [faqOpenLanding, setFaqOpenLanding] = useState<number | null>(null);

  // Interactive states for Explore section (Articles, Gifts, Customer Stories) - Landing
  const [selectedArticleIdLanding, setSelectedArticleIdLanding] = useState<string | null>(null);
  const [savedArticlesLanding, setSavedArticlesLanding] = useState<string[]>([]);
  const [articleSearchQueryLanding, setArticleSearchQueryLanding] = useState('');
  const [articleFilterLanding, setArticleFilterLanding] = useState('all');

  const [selectedGiftIdLanding, setSelectedGiftIdLanding] = useState<string | null>(null);
  const [customFamilyNameLanding, setCustomFamilyNameLanding] = useState('');
  const [customRegionLanding, setCustomRegionLanding] = useState('');
  const [giftCustomizedLanding, setGiftCustomizedLanding] = useState(false);
  const [stagedGiftsLanding, setStagedGiftsLanding] = useState<any[]>([]);

  const [storyRegionFilterLanding, setStoryRegionFilterLanding] = useState('all');
  const [playingStoryIdLanding, setPlayingStoryIdLanding] = useState<string | null>(null);
  const [newStoryNameLanding, setNewStoryNameLanding] = useState('');
  const [newStoryRegionLanding, setNewStoryRegionLanding] = useState('');
  const [newStoryTextLanding, setNewStoryTextLanding] = useState('');
  const [submittedStoriesLanding, setSubmittedStoriesLanding] = useState<any[]>([]);

  // Authentication credentials state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSubmitted, setIsForgotSubmitted] = useState(false);
  
  // Interactive UI states for auth status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  // Verification popup for individual providers
  const [showOAuthPopup, setShowOAuthPopup] = useState(false);

  // User personal details config step states before complete unlock
  const [draftUser, setDraftUser] = useState<{ email: string; name: string; provider: string } | null>(null);
  const [ancestralCountry, setAncestralCountry] = useState('Nigeria');
  const [ancestralState, setAncestralState] = useState('');
  const [ancestralWard, setAncestralWard] = useState('');
  const [ethnicGroup, setEthnicGroup] = useState('Yoruba');
  const [custodianName, setCustodianName] = useState('');
  const [knowledgeLevel, setKnowledgeLevel] = useState('Know 2-3 generations');

  const closeLoginWindow = () => {
    setIsLoginWindowOpen(false);
    setErrorMsg('');
    setSuccessMsg('');
    setDraftUser(null);
    setIsForgotPassword(false);
  };

  // Close the sign-in window with the Escape key
  useEffect(() => {
    if (!isLoginWindowOpen || showOAuthPopup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLoginWindow();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLoginWindowOpen, showOAuthPopup]);

  // Count each landing page visit once per page load
  useEffect(() => {
    track('landing_viewed', { referrer: document.referrer ? new URL(document.referrer).hostname : 'direct' });
  }, []);

  const openSignIn = () => {
    track('auth_opened', { mode: 'sign_in' });
    setIsSignUp(false);
    setIsLoginWindowOpen(true);
  };

  const openSignUp = () => {
    track('auth_opened', { mode: 'sign_up' });
    setIsSignUp(true);
    setIsLoginWindowOpen(true);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!forgotEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsForgotSubmitted(true);
      setSuccessMsg('Reset protocol active: Check your inbox for your security recovery link.');
    }, 1200);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password || password.length < 5) {
      setErrorMsg('Your password needs at least 5 characters.');
      return;
    }
    if (isSignUp && !fullName) {
      setErrorMsg('Please enter your name.');
      return;
    }

    setIsLoading(true);

    // Simulate clean, professional premium authentication process
    setTimeout(() => {
      setIsLoading(false);
      const computedName = isSignUp ? fullName : email.split('@')[0];
      setSuccessMsg('Signed in. Just a few questions about your roots…');
      
      setTimeout(() => {
        setSuccessMsg('');
        setDraftUser({
          email: email,
          name: computedName,
          provider: 'Email Vault'
        });
      }, 1000);
    }, 1200);
  };

  const handleOAuthClick = (provider: string) => {
    setErrorMsg('');
    setActiveProvider(provider);
    setShowOAuthPopup(true);
    setIsLoading(true);

    // Simulate passport modal handshake loop
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const confirmOAuthLogin = () => {
    if (!activeProvider) return;
    setShowOAuthPopup(false);
    
    // Auto-generate generic user names based on provider
    const sampleNames: Record<string, string> = {
      Google: 'Adefolarin Alao',
      X: '@ancestrykeeper',
      Apple: 'Sovereign Clan Member',
      Facebook: 'Babajide Kinship'
    };

    const chosenName = sampleNames[activeProvider] || 'Heritage Archer';
    const computedEmail = `${chosenName.toLowerCase().replace(/[@\s]/g, '') || 'seeker'}@afrolineo-vault.org`;

    setDraftUser({
      email: computedEmail,
      name: chosenName,
      provider: activeProvider
    });
  };

  return (
    <div id="login-gate-screen" className="min-h-screen bg-cream text-[#fcfbfa] flex flex-col relative overflow-x-hidden font-sans">
      
      {/* ===================== LANDING PAGE ===================== */}
      <div className="relative z-10 bg-cream text-ink min-h-screen">

        {/* Header */}
        <header className="border-b border-line">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
            <a href="#top" className="flex items-center gap-2.5 text-ink no-underline">
              <span className="w-9 h-9 rounded-[10px] bg-ink flex items-center justify-center">
                <LineageMark className="w-5 h-5 text-[#E2A04F]" />
              </span>
              <span className="font-display text-xl sm:text-[22px] font-semibold tracking-tight">Afrolineo</span>
            </a>
            <nav aria-label="Main" className="hidden md:flex gap-7 text-[15px] font-medium">
              <a href="#how" className="text-ink-soft hover:text-ink">How it works</a>
              <a href="#stories" className="text-ink-soft hover:text-ink">Stories</a>
              <a href="#privacy" className="text-ink-soft hover:text-ink">Privacy</a>
            </nav>
            <div className="flex items-center gap-1">
              <button type="button" onClick={openSignIn} className="px-3 sm:px-4 py-3 text-[15px] font-semibold text-ink rounded-full hover:bg-sand cursor-pointer whitespace-nowrap">
                Sign in
              </button>
              <button type="button" onClick={openSignUp} className="px-4 sm:px-5 py-3 text-[15px] font-semibold text-ink bg-ochre hover:brightness-95 rounded-full cursor-pointer whitespace-nowrap">
                Start free
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section id="top" className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20 sm:pt-20 sm:pb-24 grid gap-14 lg:grid-cols-2 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-paternal-ink bg-ochre-tint px-3.5 py-1.5 rounded-full">
              <Mic className="w-4 h-4" aria-hidden="true" />
              Oral history &amp; family trees for African families
            </p>
            <h1 className="mt-5 font-display font-medium text-[42px] sm:text-6xl lg:text-[68px] leading-[1.04] tracking-[-0.025em]">
              Every family has a story. <span className="italic text-[#9A5B14]">Keep yours.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-[19px] leading-relaxed text-[#4A423A] max-w-[520px]">
              Record your elders in their own voices, map your lineage back to the family compound, and keep it all somewhere only your family controls.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button type="button" onClick={openSignUp} className="inline-flex items-center gap-2.5 bg-ochre hover:brightness-95 text-ink font-semibold px-7 py-4 rounded-full cursor-pointer group">
                Start your family tree
                <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
              <a href="#how" className="inline-flex items-center gap-2.5 border-[1.5px] border-[#CFC4B4] hover:border-ink text-ink font-semibold px-6 py-[15px] rounded-full">
                See how it works
              </a>
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2.5 text-[14.5px] text-[#4A423A]">
              {['Free to start', 'Works in your browser', 'Export everything, anytime'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="w-[18px] h-[18px] text-forest" strokeWidth={2.4} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Product preview */}
          <div className="flex flex-col" aria-hidden="true">
            <div className="bg-white border border-[#E6DED2] rounded-[22px] px-6 pt-6 pb-[72px] shadow-[0_24px_60px_-30px_rgba(60,40,15,0.35)]">
              <div className="flex justify-between items-center gap-3 mb-7">
                <div>
                  <div className="font-display text-xl font-semibold">Babajide family</div>
                  <div className="text-[13px] text-muted">8 people · 3 generations</div>
                </div>
                <span className="text-[13px] font-semibold text-forest bg-forest-tint px-3 py-1 rounded-full">4 stories</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex gap-12">
                  <div className="flex gap-2.5">
                    <PreviewAvatar initials="AO" className="bg-paternal-tint text-paternal-ink" />
                    <PreviewAvatar dashed />
                  </div>
                  <div className="flex gap-2.5">
                    <PreviewAvatar dashed />
                    <PreviewAvatar initials="GN" className="bg-forest-tint text-forest ring-2 ring-ochre ring-offset-[3px]" />
                  </div>
                </div>
                <div className="flex gap-[150px] h-6.5">
                  <span className="w-0.5 bg-[#D5C8B5]" />
                  <span className="w-0.5 bg-[#D5C8B5]" />
                </div>
                <div className="flex items-center">
                  <PreviewAvatar initials="OB" size="lg" className="bg-paternal-tint text-paternal-ink" />
                  <span className="w-[100px] h-0.5 bg-[#D5C8B5]" />
                  <PreviewAvatar initials="ZO" size="lg" className="bg-forest-tint text-forest" />
                </div>
                <span className="w-0.5 h-6.5 bg-[#D5C8B5]" />
                <div className="flex flex-col items-center gap-1.5">
                  <span className="w-[60px] h-[60px] rounded-full bg-ink text-cream font-bold flex items-center justify-center">AA</span>
                  <span className="text-[13px] font-semibold">You</span>
                </div>
              </div>
            </div>
            <div className="relative -mt-13 ml-auto w-full max-w-[380px] bg-ink text-[#F3EDE3] rounded-[20px] p-5 shadow-[0_24px_50px_-24px_rgba(31,27,23,0.6)]">
              <div className="flex gap-3.5 items-center">
                <span className="shrink-0 w-12 h-12 rounded-full bg-ochre flex items-center justify-center">
                  <Play className="w-5 h-5 text-ink fill-ink ml-0.5" />
                </span>
                <div className="min-w-0">
                  <div className="font-semibold text-[15.5px]">Anambra migration &amp; market roots</div>
                  <div className="text-[13px] text-[#BDB2A4]">Grandmother Nneka · 2:58</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-[3px] h-9">
                {WAVEFORM.map((h, i) => (
                  <span key={i} className={`flex-1 rounded-[2px] ${i < 15 ? 'bg-ochre' : 'bg-[#5A5047]'}`} style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="mt-3.5 font-display italic text-[15px] leading-normal text-[#E5DCCD]">
                “We left in the dry season, carrying the seed yams and the names of our fathers…”
              </p>
            </div>
          </div>
        </section>

        <PatternBand />

        {/* How it works */}
        <section id="how" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 scroll-mt-4">
          <p className="text-sm font-bold tracking-[0.08em] uppercase text-ochre-deep">How it works</p>
          <h2 className="mt-3 font-display font-medium text-[32px] sm:text-[44px] leading-[1.12] tracking-[-0.02em] max-w-[760px]">
            From a grandmother’s voice to a family tree you can pass on.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <article key={step.title} className="bg-white border border-[#E6DED2] rounded-[20px] p-7 sm:p-8">
                <div className="flex justify-between items-center">
                  <span className={`w-13 h-13 rounded-[14px] flex items-center justify-center ${step.tint}`}>
                    <step.icon className="w-6 h-6" aria-hidden="true" />
                  </span>
                  <span className="font-display text-[28px] text-[#B8AB98]">0{i + 1}</span>
                </div>
                <h3 className="mt-7 mb-2 font-sans text-[21px] font-semibold">{step.title}</h3>
                <p className="text-[#4A423A] leading-relaxed">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Stories */}
        <section id="stories" className="bg-sand scroll-mt-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 grid gap-14 lg:grid-cols-2 items-center">
            <div className="bg-white border border-line rounded-[22px] p-6 sm:p-7">
              <div className="flex items-center gap-3.5">
                <span className="w-12 h-12 rounded-full bg-forest-tint text-forest font-bold flex items-center justify-center">GN</span>
                <div>
                  <div className="font-semibold">Grandmother Nneka</div>
                  <div className="text-[13.5px] text-muted">Recorded in Igbo · Okeke Palace Compound</div>
                </div>
                <span className="ml-auto text-[12.5px] font-semibold text-muted border border-line px-2.5 py-1 rounded-full">Sample</span>
              </div>
              <div className="mt-6 flex flex-col gap-4">
                {SAMPLE_TRANSCRIPT.map((line, i) => (
                  <div key={line.time} className={`flex gap-4 ${i === 1 ? 'bg-[#FBF4E8] -mx-3 p-3 rounded-xl' : ''}`}>
                    <span className="shrink-0 w-10 pt-1 text-[13px] font-semibold text-ochre-deep">{line.time}</span>
                    <p className={`font-display text-lg leading-relaxed ${i === 2 ? 'text-muted' : 'text-[#2D2926]'}`}>{line.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold tracking-[0.08em] uppercase text-ochre-deep">Stories</p>
              <h2 className="mt-3 font-display font-medium text-[32px] sm:text-[44px] leading-[1.12] tracking-[-0.02em]">Voices, not just names.</h2>
              <p className="mt-5 text-lg text-[#4A423A] max-w-[480px] leading-relaxed">
                A name on a chart tells you who someone was. Their voice tells you how they spoke, what they remembered and what they wanted you to know.
              </p>
              <ul className="mt-8 flex flex-col gap-5">
                {STORY_POINTS.map((point) => (
                  <li key={point.title} className="flex gap-3.5">
                    <Check className="w-[22px] h-[22px] text-forest shrink-0 mt-0.5" strokeWidth={2.4} aria-hidden="true" />
                    <span><strong className="font-semibold">{point.title}</strong> <span className="text-[#4A423A]">{point.body}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section id="privacy" className="bg-ink text-[#F3EDE3] scroll-mt-4">
          <PatternBand />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
            <h2 className="font-display font-medium text-[32px] sm:text-[44px] leading-[1.12] tracking-[-0.02em] text-cream max-w-[720px]">
              Your family’s memory belongs to your family.
            </h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {PRIVACY_POINTS.map((point) => (
                <div key={point.title}>
                  <point.icon className="w-7 h-7 text-[#E2A04F]" strokeWidth={1.8} aria-hidden="true" />
                  <h3 className="mt-4 mb-2 font-sans text-[19px] font-semibold text-cream">{point.title}</h3>
                  <p className="text-[#C9BFB1] leading-relaxed">{point.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final call to action */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-28 text-center">
          <h2 className="font-display font-medium text-4xl sm:text-[56px] leading-[1.08] tracking-[-0.02em]">Start with one story.</h2>
          <p className="mt-4 mx-auto text-lg sm:text-[19px] text-[#4A423A] max-w-[520px]">
            Begin with the oldest person you know. One recording is enough to start a family archive.
          </p>
          <button type="button" onClick={openSignUp} className="mt-9 inline-flex items-center gap-2.5 bg-ochre hover:brightness-95 text-ink font-semibold text-[17px] px-8 py-[18px] rounded-full cursor-pointer group">
            Start your family tree
            <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#E6DED2]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap justify-between items-center gap-4 text-[14.5px] text-muted">
            <span><span className="font-display font-semibold text-ink text-[17px]">Afrolineo</span> · © 2026</span>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => (link.tab ? setActiveAboutTabLanding(link.tab) : setShowSitemapLanding(true))}
                  className="text-muted hover:text-ink underline-offset-4 hover:underline cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        </footer>
      </div>

      {/* ===================== SIGN-IN WINDOW ===================== */}
      {isLoginWindowOpen && (
        <div
          id="login-window-overlay"
          className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLoginWindow();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-window-title"
            className="relative w-full sm:max-w-[440px] max-h-[94vh] overflow-y-auto bg-cream text-ink rounded-t-3xl sm:rounded-3xl px-6 pt-7 pb-8 sm:px-8 shadow-[0_30px_80px_-20px_rgba(31,27,23,0.55)]"
          >
            <button
              type="button"
              onClick={closeLoginWindow}
              aria-label="Close"
              className="absolute top-3 right-3 w-11 h-11 rounded-full text-muted hover:text-ink hover:bg-sand flex items-center justify-center cursor-pointer"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            {draftUser ? (
              /* ---------- Step 2: about your roots ---------- */
              <div className="animate-fadeIn">
                <p className="text-sm font-semibold text-ochre-deep">Step 2 of 2</p>
                <h2 id="login-window-title" className="mt-1 font-display font-medium text-[28px] leading-tight tracking-[-0.01em]">
                  Tell us about your roots
                </h2>
                <p className="mt-2 text-[15px] text-muted leading-relaxed">
                  Welcome, <strong className="text-ink font-semibold">{draftUser.name}</strong>. This helps us suggest the right languages and interview questions for your family.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="ancestry-country" className={LABEL_CLASS}>Country</label>
                    <select
                      id="ancestry-country"
                      value={ancestralCountry}
                      onChange={(e) => {
                        const country = e.target.value;
                        setAncestralCountry(country);
                        setAncestralState('');
                        setAncestralWard('');
                        setEthnicGroup(ETHNIC_GROUPS_BY_COUNTRY[country]?.[0] || 'Other Ancestral Group');
                      }}
                      className={FIELD_CLASS}
                    >
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Sierra Leone">Sierra Leone</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Zimbabwe">Zimbabwe</option>
                      <option value="Angola / Congo-Zaire">Angola / Congo-Zaire</option>
                      <option value="Other African Native Region">Another African country</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ancestry-state" className={LABEL_CLASS}>
                        State or region <span className="font-normal text-muted">(optional)</span>
                      </label>
                      <select
                        id="ancestry-state"
                        value={ancestralState}
                        onChange={(e) => {
                          setAncestralState(e.target.value);
                          setAncestralWard('');
                        }}
                        className={FIELD_CLASS}
                      >
                        <option value="">Choose…</option>
                        {(STATES_BY_COUNTRY[ancestralCountry] || []).map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="ancestry-ward" className={LABEL_CLASS}>
                        Ward or district <span className="font-normal text-muted">(optional)</span>
                      </label>
                      <select
                        id="ancestry-ward"
                        value={ancestralWard}
                        onChange={(e) => setAncestralWard(e.target.value)}
                        className={FIELD_CLASS}
                      >
                        <option value="">Choose…</option>
                        {getWardsForState(ancestralState).map((wd) => (
                          <option key={wd} value={wd}>{wd}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="ancestry-ethnic" className={LABEL_CLASS}>Ethnic group or language</label>
                    <select
                      id="ancestry-ethnic"
                      value={ethnicGroup}
                      onChange={(e) => setEthnicGroup(e.target.value)}
                      className={FIELD_CLASS}
                    >
                      {getEthnicGroupsForCountry(ancestralCountry).map((eth) => (
                        <option key={eth} value={eth}>{eth}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="ancestry-custodian" className={LABEL_CLASS}>
                      Who would you like to record first? <span className="font-normal text-muted">(optional)</span>
                    </label>
                    <input
                      id="ancestry-custodian"
                      type="text"
                      placeholder="e.g. Grandma Nneka, Papa Alao"
                      value={custodianName}
                      onChange={(e) => setCustodianName(e.target.value)}
                      className={FIELD_CLASS}
                    />
                  </div>

                  <fieldset>
                    <legend className={LABEL_CLASS}>How much of your family history do you know?</legend>
                    <div className="grid gap-2">
                      {KNOWLEDGE_OPTIONS.map((opt) => {
                        const checked = knowledgeLevel === opt.value;
                        return (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                              checked ? 'border-ochre bg-white ring-2 ring-ochre/25' : 'border-line bg-white/60 hover:bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="knowledge-level"
                              value={opt.value}
                              checked={checked}
                              onChange={() => setKnowledgeLevel(opt.value)}
                              className="w-4 h-4 accent-[#9A5B14]"
                            />
                            <span>
                              <span className="block text-[15px] font-semibold leading-tight">{opt.title}</span>
                              <span className="block text-[13px] text-muted">{opt.body}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </div>

                <div className="mt-7 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDraftUser(null)}
                    className="h-12 px-5 rounded-full border-[1.5px] border-[#CFC4B4] font-semibold hover:border-ink cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLoginSuccess({
                        email: draftUser.email,
                        name: draftUser.name,
                        provider: draftUser.provider,
                        ancestralCountry,
                        ethnicGroup,
                        custodianName: custodianName || 'Grandmother Nneka',
                        knowledgeLevel,
                        ancestralState,
                        ancestralWard,
                      });
                    }}
                    className="flex-1 h-12 rounded-full bg-ochre hover:brightness-95 text-ink font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Open my family tree
                    <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : isForgotPassword ? (
              /* ---------- Forgot password ---------- */
              <div className="animate-fadeIn">
                <h2 id="login-window-title" className="font-display font-medium text-[28px] leading-tight tracking-[-0.01em]">
                  Reset your password
                </h2>
                <p className="mt-2 text-[15px] text-muted">Enter your email and we’ll send you a link to choose a new one.</p>

                <StatusMessage error={errorMsg} success={isForgotSubmitted ? '' : successMsg} />

                {!isForgotSubmitted ? (
                  <form onSubmit={handleForgotSubmit} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="forgot-email" className={LABEL_CLASS}>Email</label>
                      <input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        disabled={isLoading}
                        className={FIELD_CLASS}
                        required
                      />
                    </div>
                    <button type="submit" disabled={isLoading} className={PRIMARY_BUTTON_CLASS}>
                      {isLoading ? <><Spinner /> Sending…</> : 'Send reset link'}
                    </button>
                  </form>
                ) : (
                  <div role="status" className="mt-6 p-4 rounded-2xl bg-forest-tint text-forest">
                    <p className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> Check your inbox
                    </p>
                    <p className="mt-1 text-[14px] text-ink-soft">
                      If an account exists for <strong className="font-semibold">{forgotEmail}</strong>, a reset link is on its way.
                    </p>
                    <p className="mt-2 text-[13px] text-muted">Demo mode: no email is actually sent. Go back and sign in with any password.</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setIsForgotSubmitted(false);
                    setForgotEmail('');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="mt-6 text-[15px] font-semibold text-ochre-deep hover:underline underline-offset-4 cursor-pointer"
                >
                  ← Back to sign in
                </button>
              </div>
            ) : (
              /* ---------- Step 1: sign in / create account ---------- */
              <div className="animate-fadeIn">
                <span className="w-11 h-11 rounded-xl bg-ink flex items-center justify-center">
                  <LineageMark className="w-6 h-6 text-[#E2A04F]" />
                </span>
                <h2 id="login-window-title" className="mt-4 font-display font-medium text-[28px] leading-tight tracking-[-0.01em]">
                  {isSignUp ? 'Start your family archive' : 'Welcome back'}
                </h2>
                <p className="mt-1.5 text-[15px] text-muted">
                  {isSignUp ? 'Free to start. Your recordings stay on your device.' : 'Sign in to continue your family tree.'}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2.5">
                  {OAUTH_PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      id={`oauth-${p.id.toLowerCase()}`}
                      type="button"
                      onClick={() => handleOAuthClick(p.id)}
                      disabled={isLoading}
                      className="h-12 flex items-center justify-center gap-2.5 rounded-xl bg-white border border-line hover:border-ink-soft text-[15px] font-semibold cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      {p.icon}
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="my-6 flex items-center gap-3 text-sm text-muted">
                  <span className="flex-1 h-px bg-line" />
                  or use email
                  <span className="flex-1 h-px bg-line" />
                </div>

                <StatusMessage error={errorMsg} success={successMsg} />

                <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
                  {isSignUp && (
                    <div>
                      <label htmlFor="login-field-fullname" className={LABEL_CLASS}>Your name</label>
                      <input
                        id="login-field-fullname"
                        type="text"
                        autoComplete="name"
                        placeholder="e.g. Adefolarin Alao"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={isLoading}
                        className={FIELD_CLASS}
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="login-field-email" className={LABEL_CLASS}>Email</label>
                    <input
                      id="login-field-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className={FIELD_CLASS}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline">
                      <label htmlFor="login-field-pass" className={LABEL_CLASS}>Password</label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setErrorMsg('');
                            setSuccessMsg('');
                          }}
                          className="text-sm font-semibold text-ochre-deep hover:underline underline-offset-4 cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      id="login-field-pass"
                      type="password"
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      placeholder={isSignUp ? 'At least 5 characters' : ''}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className={FIELD_CLASS}
                    />
                  </div>

                  <button id="login-submit-btn" type="submit" disabled={isLoading} className={PRIMARY_BUTTON_CLASS}>
                    {isLoading && !activeProvider ? (
                      <><Spinner /> {isSignUp ? 'Creating account…' : 'Signing in…'}</>
                    ) : (
                      isSignUp ? 'Create account' : 'Sign in'
                    )}
                  </button>
                  <p className="text-[13px] text-muted text-center">
                    Demo mode: any email and a password of 5+ characters will work.
                  </p>
                </form>

                <p className="mt-6 pt-5 border-t border-line text-center text-[15px] text-muted">
                  {isSignUp ? 'Already have an account?' : 'New to Afrolineo?'}{' '}
                  <button
                    id="login-toggle-signup"
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setIsSignUp(!isSignUp);
                    }}
                    className="font-semibold text-ochre-deep hover:underline underline-offset-4 cursor-pointer"
                  >
                    {isSignUp ? 'Sign in' : 'Create an account'}
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Demo stand-in for a social sign-in pop-up */}
      {showOAuthPopup && (
        <div id="oauth-popup-shadow" className="fixed inset-0 bg-ink/60 flex items-center justify-center p-4 z-[60] animate-fadeIn">
          <div role="dialog" aria-modal="true" aria-labelledby="oauth-title" className="bg-cream text-ink rounded-3xl p-7 max-w-sm w-full shadow-2xl text-center">
            <span className="w-12 h-12 rounded-full bg-white border border-line flex items-center justify-center mx-auto">
              {OAUTH_PROVIDERS.find((p) => p.id === activeProvider)?.icon ?? <ShieldCheck className="w-6 h-6" />}
            </span>
            <h2 id="oauth-title" className="mt-4 font-display font-medium text-2xl">Continue with {activeProvider}</h2>
            <p className="mt-2 text-[15px] text-muted leading-relaxed">
              This is a demo, so no {activeProvider} account is connected. Continue to try Afrolineo with a sample profile.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                id="oauth-cancel"
                type="button"
                onClick={() => {
                  setShowOAuthPopup(false);
                  setActiveProvider(null);
                  setIsLoading(false);
                }}
                className="flex-1 h-12 rounded-full border-[1.5px] border-[#CFC4B4] font-semibold hover:border-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="oauth-confirm"
                type="button"
                onClick={confirmOAuthLogin}
                disabled={isLoading}
                className="flex-1 h-12 rounded-full bg-ochre hover:brightness-95 text-ink font-semibold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? <><Spinner /> One moment</> : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. VISITOR LANDING SITEMAP MODAL */}
      {showSitemapLanding && (
        <div id="interactive-sitemap-modal-landing" className="fixed inset-0 bg-[#1a1918]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto z-50">
          <div className="bg-[#FAF8F5] border border-[#2D2926]/20 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden animate-scaleIn text-[#2D2926]">
            
            {/* Header banner */}
            <div className="bg-[#2D2926] p-6 text-[#F9F7F2] flex items-center justify-between border-b border-[#E2A04F]/20">
              <div className="flex items-center gap-3 text-left">
                <Network className="w-6 h-6 text-[#E2A04F]" />
                <div>
                  <h3 className="font-sans font-bold text-lg uppercase tracking-wider text-white">Afrolineo Directory Sitemap</h3>
                  <p className="text-xs text-gray-400 font-sans tracking-normal leading-normal">
                    Interactive portal mapper offering direct preview access to lineage tools and cultural directories.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setShowSitemapLanding(false); setSitemapSearchQuery(''); }} 
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Close Sitemap"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Sitemap Search Panel */}
            <div className="px-6 md:px-8 pt-6">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sitemap nodes (e.g. Pedigree, Careers, Privacy)..."
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
                    Requires credential verification to establish secure lineage nodes.
                  </p>
                  
                  <ul className="space-y-2">
                    {[
                      { name: 'Interactive Pedigree Map', desc: 'Manage 3 generations of ancestry nodes.' },
                      { name: 'Oral Discovery Hub', desc: 'Browse tribal speech catalogs.' },
                      { name: 'Kinship Vault & Matcher', desc: 'Coordinate regional compound matchers.' },
                      { name: 'Growth Loop & Telemetry', desc: 'Examine live historical archive stats.' }
                    ].filter(item => item.name.toLowerCase().includes(sitemapSearchQuery.toLowerCase()) || item.desc.toLowerCase().includes(sitemapSearchQuery.toLowerCase())).map((item) => (
                      <li key={item.name}>
                        <button 
                          onClick={() => {
                            setShowSitemapLanding(false);
                            setIsLoginWindowOpen(true);
                          }}
                          className="w-full text-left p-2.5 bg-white border border-gray-200 hover:border-[#E2A04F] rounded-md transition-all flex items-center justify-between text-xs cursor-pointer group"
                        >
                          <div>
                            <span className="font-sans font-bold text-gray-800 block text-xs">{item.name}</span>
                            <span className="text-xs text-gray-500 block mt-0.5">{item.desc}</span>
                          </div>
                          <span className="text-xs uppercase font-mono bg-amber-50 text-amber-800 px-1 py-0.5 rounded border border-amber-100 group-hover:bg-[#E2A04F] group-hover:text-black shrink-0">
                            Unlock
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
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D2926] font-sans">Custodian Tools</h4>
                  </div>
                  <p className="text-[12.5px] text-gray-500 leading-relaxed font-serif italic">
                    Actionable sub-modules for oral logs and secure offline backups.
                  </p>

                  <ul className="space-y-2">
                    {[
                      { name: 'Launch Spoken Recording Studio', desc: 'Record high fidelity oral stories.' },
                      { name: 'Sovereign Offline Backup', desc: 'Export secure offline JSON records.' },
                      { name: 'Secret PM Feedback Panel', desc: 'Direct feedback channels.' }
                    ].filter(item => item.name.toLowerCase().includes(sitemapSearchQuery.toLowerCase()) || item.desc.toLowerCase().includes(sitemapSearchQuery.toLowerCase())).map((item) => (
                      <li key={item.name}>
                        <button 
                          onClick={() => {
                            setShowSitemapLanding(false);
                            setIsLoginWindowOpen(true);
                          }}
                          className="w-full text-left p-2.5 bg-white border border-gray-200 hover:border-[#E2A04F] rounded-md transition-all flex items-center justify-between text-xs cursor-pointer group"
                        >
                          <div>
                            <span className="font-sans font-bold text-gray-800 block text-xs">{item.name}</span>
                            <span className="text-xs text-gray-500 block mt-0.5">{item.desc}</span>
                          </div>
                          <span className="text-xs uppercase font-mono bg-amber-50 text-amber-800 px-1 py-0.5 rounded border border-amber-100 group-hover:bg-[#E2A04F] group-hover:text-black shrink-0">
                            Unlock
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Corporate & About Pages */}
                <div className="space-y-4">
                  <div className="border-b border-[#2D2926]/10 pb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#E2A04F]" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D2926] font-sans">About Directory</h4>
                  </div>
                  <p className="text-[12.5px] text-gray-500 leading-relaxed font-serif italic">
                    Public directories and guidelines accessible without logging in.
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
                          setActiveAboutTabLanding(item.id);
                          setShowSitemapLanding(false);
                        }}
                        className="text-left text-xs p-2.5 bg-white border border-gray-200 hover:border-[#E2A04F] rounded-md text-gray-750 hover:text-[#2D2926] transition-colors flex justify-between items-center cursor-pointer"
                      >
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs uppercase font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom action controls */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-150 flex justify-end">
              <button 
                onClick={() => { setShowSitemapLanding(false); setSitemapSearchQuery(''); }}
                className="px-5 py-2.5 bg-[#2D2926] hover:bg-[#E2A04F] hover:text-[#2D2926] text-[#F9F7F2] text-xs font-sans font-bold uppercase tracking-wider rounded-sm shadow-xs transition-all cursor-pointer"
              >
                Close Directory Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC ABOUT DIRECTORY DETAILS MODAL FOR LANDING PAGE */}
      {activeAboutTabLanding && (
        <div id="about-directory-modal-landing" className="fixed inset-0 bg-[#1a1918]/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto z-50">
          <div className="bg-[#FAF8F5] border border-[#2D2926]/20 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden animate-scaleIn text-[#2D2926]">
            
            {/* Top Header Banner */}
            <div className="bg-[#2D2926] text-[#F9F7F2] p-6 flex justify-between items-center border-b border-[#E2A04F]/20">
              <div className="text-left">
                <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-black block font-sans">
                  Corporate & Cultural Directory
                </span>
                <h3 className="text-lg font-serif font-black uppercase text-white mt-1">
                  About Afrolineo Platform
                </h3>
              </div>
              <button 
                onClick={() => setActiveAboutTabLanding(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Close Section"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Main Tabs Layout inside Modal */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 md:p-8 items-start max-h-[70vh] overflow-y-auto">
              
              {/* Tab Navigation Menu */}
              <div className="md:col-span-1 bg-white border border-[#2D2926]/12 rounded-sm p-4 space-y-2 shadow-xs text-left">
                <span className="text-xs uppercase font-sans tracking-[0.18em] text-gray-500 font-bold block mb-2 px-1">
                  Browse Sections
                </span>
                <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-1 md:gap-2">
                  {[
                    { id: 'dei', label: 'Diversity & DEI' },
                    { id: 'careers', label: 'Careers' },
                    { id: 'newsroom', label: 'Newsroom' },
                    { id: 'security', label: 'Security' },
                    { id: 'privacy', label: 'Privacy' },
                    { id: 'guidelines', label: 'Guidelines' },
                    { id: 'terms', label: 'Terms & Pact' },
                    { id: 'social-impact', label: 'Social Impact' },
                    { id: 'community-impact', label: 'Community Hub' },
                    { id: 'support', label: 'Support Desk' },
                    { id: 'articles', label: 'Articles & Essays' },
                    { id: 'gifts', label: 'Heritage Gifts' },
                    { id: 'customer-stories', label: 'Custodian Stories' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveAboutTabLanding(tab.id)}
                      className={`w-full text-left text-xs px-3 py-2.5 rounded-sm transition-all font-sans font-bold shrink-0 cursor-pointer ${
                        activeAboutTabLanding === tab.id ? 'bg-[#2D2926] text-[#E2A04F] shadow-sm' : 'text-gray-750 hover:bg-gray-150 hover:text-black'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content Canvas */}
              <div className="md:col-span-3 bg-white border border-[#2D2926]/12 rounded-sm p-6 shadow-xs min-h-[350px] text-left">
                
                {/* 1. DIVERSITY, EQUITY, & INCLUSION */}
                {activeAboutTabLanding === 'dei' && (
                  <div className="space-y-4 animate-scaleIn text-xs">
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">DEI Pledge</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase">Bridging the Ancestral Data Desert</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      Historically, the tools of digital archiving, database schemas, and genealogical charting have been built around Western family structures (e.g. strict monogamy, written church and town hall registries). African lineages, indigenous oral traditions, and localized compound-level geographies have suffered systemic technological exclusion.
                    </p>

                    <blockquote className="border-l-4 border-[#E2A04F] pl-4 italic text-gray-600 my-4 text-xs font-serif leading-relaxed">
                      "In many parts of Africa, a family tree is not drawn on a paper kept in a vault—it is recited in song during village festivals, or told under the shade of a sacred baobab."
                      <cite className="block text-xs font-mono uppercase font-bold text-gray-500 mt-1.5 not-italic">— Mazi Chinedu, Igbo Historical Elder</cite>
                    </blockquote>

                    <h5 className="font-sans font-bold text-[#2D2926] uppercase text-xs tracking-wider pt-1">Strategic Inclusion Imperatives:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[#FAF8F5] p-3 border border-gray-150 rounded">
                        <strong className="block text-gray-800 text-xs font-bold">🌍 Epistemic Equity</strong>
                        <p className="text-xs text-gray-600 leading-relaxed mt-1">Elevating verbal testimonies to the exact same database validity as written files.</p>
                      </div>
                      <div className="bg-[#FAF8F5] p-3 border border-gray-150 rounded">
                        <strong className="block text-gray-800 text-xs font-bold">🔊 Acoustic Justice</strong>
                        <p className="text-xs text-gray-600 leading-relaxed mt-1">Refining voice encoders to respect the deep pitch and accents of native dialects.</p>
                      </div>
                      <div className="bg-[#FAF8F5] p-3 border border-gray-150 rounded">
                        <strong className="block text-gray-800 text-xs font-bold">🗺️ Ancestral Geometry</strong>
                        <p className="text-xs text-gray-600 leading-relaxed mt-1">Replacing coordinates with traditional compounds and tribal village borders.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CAREERS */}
                {activeAboutTabLanding === 'careers' && (
                  <div className="space-y-4 animate-scaleIn text-xs">
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Work With Us</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase font-sans">Build the Tools of Spoken Memory</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      Afrolineo is expanding its decentralized engineering and anthropological operations. We seek individuals passionate about restoring ancestral connections through offline-first software systems.
                    </p>

                    <div className="space-y-3 pt-1">
                      <h5 className="text-xs uppercase tracking-widest font-black text-gray-400 font-sans">Active Positions (2026)</h5>
                      {[
                        { title: 'Senior Heritage Ontologist', dept: 'Genealogical Systems', loc: 'Lagos, Nigeria' },
                        { title: 'Speech Signal & DSP Engineer', dept: 'Acoustic Division', loc: 'Accra, Ghana' },
                        { title: 'Diaspora Outreach & Community Lead', dept: 'Engagement', loc: 'London or Nairobi' }
                      ].map((job, idx) => (
                        <div key={idx} className="border border-gray-150 rounded p-3 bg-[#FAF8F5] flex justify-between items-center">
                          <div>
                            <strong className="font-sans font-bold text-gray-800 block text-xs">{job.title}</strong>
                            <span className="text-xs text-gray-500 font-mono block mt-0.5">{job.dept} • {job.loc}</span>
                          </div>
                          <button 
                            onClick={() => {
                              alert("Application submitted! Thank you for backing Afrolineo's sovereign mission.");
                            }}
                            className="px-3 py-1 bg-[#2D2926] hover:bg-[#E2A04F] hover:text-black text-white text-xs uppercase tracking-wider font-bold rounded-xs transition-colors shrink-0"
                          >
                            Apply
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. NEWSROOM */}
                {activeAboutTabLanding === 'newsroom' && (
                  <div className="space-y-4 animate-scaleIn text-xs">
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">News & Dispatches</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase">Afrolineo Pressroom</h4>
                    </div>

                    <div className="space-y-3">
                      {[
                        { date: 'June 18, 2026', title: 'Afrolineo Launches V3 Autonomous Offline Archive Enclaves', summary: 'New standards for browser sandboxing allow pedigree chains to survive indefinitely without database server synchronization.' },
                        { date: 'May 04, 2026', title: 'Yoruba and Igbo Oral Accents Voice Synthesis Calibrator Completed', summary: 'Successfully completed calibration of the pre-colonial ward vocabulary to automatically suggest historical compounds.' }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 border border-gray-150 rounded bg-[#FAF8F5] space-y-1">
                          <span className="text-xs text-[#E2A04F] font-mono block">{item.date}</span>
                          <strong className="font-sans font-bold text-gray-800 block text-xs">{item.title}</strong>
                          <p className="text-gray-600 text-[12.5px] leading-relaxed mt-0.5">{item.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. SECURITY */}
                {activeAboutTabLanding === 'security' && (
                  <div className="space-y-4 animate-scaleIn text-xs">
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Vault Protection</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase">Zero-Knowledge Secure Handshakes</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      Unlike commercial heritage portals, Afrolineo does not host database profiles on global public clouds. Your pedigree data is cryptographically protected:
                    </p>

                    <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded space-y-2">
                      <strong className="block text-xs font-bold">✔ Browser-Hardened Sandboxing</strong>
                      <p className="text-[12.5px] leading-relaxed">Lineage structures are written straight to standard IndexedDB inside your device. No cloud storage is provisioned without explicit local exports, keeping tracking vectors at exactly zero.</p>
                    </div>
                  </div>
                )}

                {/* 5. PRIVACY */}
                {activeAboutTabLanding === 'privacy' && (
                  <div className="space-y-4 animate-scaleIn text-xs">
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Sovereign Data Rights</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase font-sans">Privacy Enclave Declaration</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      Your recordings, transcripts and notes are stored only in your browser. To run and improve Afrolineo we keep your account details, an outline of your family tree (names and relationships) and a record of which features you use. We never sell this data or use it for advertising, and your recordings are not used to train AI. If you use automatic transcription, the audio is sent to Google’s Gemini service to be transcribed and is not kept by Afrolineo.
                    </p>
                    <p className="text-gray-500 font-mono text-xs">
                      Latest Revision: June 2026 • Local Sandbox Compliant
                    </p>
                  </div>
                )}

                {/* 6. GUIDELINES */}
                {activeAboutTabLanding === 'guidelines' && (
                  <div className="space-y-4 animate-scaleIn text-xs">
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Custodian Rules</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase">Lineage Mapping Code of Ethos</h4>
                    </div>

                    <div className="space-y-3 font-light text-gray-700 leading-relaxed">
                      <p>
                        <strong>1. Respect Living Eldership:</strong> Always ask permission from grandparent narrators prior to capturing oral minutes or voice records.
                      </p>
                      <p>
                        <strong>2. Ground in Village Integrity:</strong> Input accurate traditional states, region wards, and native compounds to secure localized pedigree mappings.
                      </p>
                      <p>
                        <strong>3. Secure Routine Backups:</strong> Use the Sovereign Offline Backup tool weekly to keep nested records safe on physical storage drives.
                      </p>
                    </div>
                  </div>
                )}

                {/* 7. TERMS & SOVEREIGN PACT */}
                {activeAboutTabLanding === 'terms' && (
                  <div className="space-y-4 animate-scaleIn text-xs">
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Legal Autonomy</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase">Sovereign Ancestral Memory Pact</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      Unlike generic ancestry corporations that claim global rights to reproduce, process, or sell your family’s DNA sequences and genealogical trees, Afrolineo keeps your <strong>recordings and transcripts on your own device</strong> and only keeps a minimal account record, tree outline and usage history on its servers.
                    </p>

                    <div className="bg-[#FAF8F5] p-4 border border-gray-150 rounded space-y-2.5">
                      <h5 className="font-sans font-bold text-gray-800 text-xs uppercase tracking-wide">Standard Rules of Ownership:</h5>
                      <div className="space-y-2 text-xs text-gray-600">
                        <p><strong>1. Zero Data Lock-In:</strong> All family mappings, audio sound files, and geographical notes remain in your device’s local memory sandbox. You can download and delete them instantly.</p>
                        <p><strong>2. Commercial Ban:</strong> Afrolineo is legally barred from indexing your family’s oral archives for commercial advertising, public searches, or corporate translation API training.</p>
                        <p><strong>3. Absolute Custodianship:</strong> You represent that you have obtained verbal or physical consent from elders prior to registering their voice files inside this sandbox.</p>
                      </div>
                    </div>

                    {/* Interactive pact signing card */}
                    <div className="border border-[#E2A04F]/40 bg-[#FAF8F5] rounded p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#E2A04F]" />
                        <span className="font-sans font-bold text-xs text-[#2D2926] uppercase">Affirm the Ancestral Stewardship Pact</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-normal">
                        By checking this box, you formally pledge to map lineages with accuracy, seek consent from elders, and keep these records as a sacred family inheritance.
                      </p>

                      {!pactSignedLanding ? (
                        <button
                          type="button"
                          onClick={() => setPactSignedLanding(true)}
                          className="w-full sm:w-auto px-4 py-2 bg-[#2D2926] hover:bg-[#E2A04F] text-[#F9F7F2] hover:text-[#2D2926] text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                        >
                          Sign & Affirm Pact
                        </button>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3 rounded flex items-center justify-between text-[12.5px] font-bold animate-scaleIn">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> Pact Signed & Sealed on Your Browser
                          </span>
                          <button
                            type="button"
                            onClick={() => setPactSignedLanding(false)}
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
                {activeAboutTabLanding === 'social-impact' && (
                  <div className="space-y-4 animate-scaleIn text-xs">
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Cultural Mission</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase">Reversing the Digital Erasure of Oral Lineages</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      Across sub-Saharan Africa, thousands of complex family histories exist only in the minds of aging oral custodians. Every time an elder passes, a library of immense geographical and tribal context is lost forever. Afrolineo works to democratize high-fidelity oral recording tools.
                    </p>

                    {/* Stats strip */}
                    <div className="grid grid-cols-3 gap-2.5 py-1 text-center">
                      <div className="bg-[#FAF8F5] border border-gray-150 p-2.5 rounded">
                        <strong className="block text-[#E2A04F] text-sm font-sans font-black">14,200+</strong>
                        <span className="text-xs text-gray-500 font-mono">Elder Logs Saved</span>
                      </div>
                      <div className="bg-[#FAF8F5] border border-gray-150 p-2.5 rounded">
                        <strong className="block text-[#E2A04F] text-sm font-sans font-black">350+</strong>
                        <span className="text-xs text-gray-500 font-mono">Compounds Mapped</span>
                      </div>
                      <div className="bg-[#FAF8F5] border border-gray-150 p-2.5 rounded">
                        <strong className="block text-[#E2A04F] text-sm font-sans font-black">1.2M+</strong>
                        <span className="text-xs text-gray-500 font-mono font-sans">Words Transcribed</span>
                      </div>
                    </div>

                    {/* Interactive Sponsor Form */}
                    <div className="border border-gray-200 p-4 rounded bg-white space-y-3">
                      <h5 className="font-sans font-bold text-gray-800 text-xs uppercase tracking-wide">Sponsor a Village Elder Compound</h5>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        We deploy low-cost physical mesh-WiFi server nodes to remote African villages. Nominate an elder compound in your hometown to receive sponsored equipment.
                      </p>

                      {!sponsorshipSubmittedLanding ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!sponsorshipCompoundLanding || !sponsorshipLGALanding) return;
                            setSponsorshipSubmittedLanding(true);
                          }}
                          className="space-y-2.5 pt-1"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Compound / Family Name (e.g. Alao Compound)"
                              required
                              value={sponsorshipCompoundLanding}
                              onChange={(e) => setSponsorshipCompoundLanding(e.target.value)}
                              className="text-xs p-2 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white w-full"
                            />
                            <input
                              type="text"
                              placeholder="Local State & Ward (e.g. Oyo State, Ward 4)"
                              required
                              value={sponsorshipLGALanding}
                              onChange={(e) => setSponsorshipLGALanding(e.target.value)}
                              className="text-xs p-2 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white w-full"
                            />
                          </div>
                          <button
                            type="submit"
                            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                          >
                            Submit Nomination Request
                          </button>
                        </form>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded text-center space-y-2 animate-scaleIn">
                          <p className="font-bold text-xs flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> Nomination Staged Successfully!
                          </p>
                          <p className="text-xs text-emerald-700 leading-relaxed">
                            Thank you! Your nomination for <strong>{sponsorshipCompoundLanding}</strong> located in <strong>{sponsorshipLGALanding}</strong> has been logged in your client buffer and staged for review by our regional field coordinators.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSponsorshipSubmittedLanding(false);
                              setSponsorshipCompoundLanding('');
                              setSponsorshipLGALanding('');
                            }}
                            className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-mono text-xs uppercase font-bold rounded"
                          >
                            Nominate another compound
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 9. AFROLINEO IN YOUR COMMUNITY */}
                {activeAboutTabLanding === 'community-impact' && (
                  <div className="space-y-4 animate-scaleIn text-xs">
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Local Outreach</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase">Afrolineo in Your Community</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      We believe that family history should be built together. We organize regular physical Workshops, Compound Gatherings, and Tribal Townhalls across West African cities and diaspora circles (London, Houston, Nairobi, Atlanta).
                    </p>

                    <div className="space-y-3 pt-1">
                      <div className="border border-gray-150 p-3 rounded bg-[#FAF8F5]">
                        <strong className="block text-gray-800 text-xs">🏡 Community Archivist Toolkits</strong>
                        <p className="text-gray-600 text-[12.5px] leading-relaxed mt-1">
                          We provide physical recording booklets, high-sensitivity microphone adapters, and offline lineage maps for family compound unions.
                        </p>
                      </div>

                      <div className="border border-gray-150 p-3 rounded bg-[#FAF8F5]">
                        <strong className="block text-gray-800 text-xs">🤝 Tribal Townhall & Dialect Gatherings</strong>
                        <p className="text-gray-600 text-[12.5px] leading-relaxed mt-1">
                          We partner with local cultural unions (e.g. Egbe Omo Oduduwa, Igbo Progressive Association) to host lineage validation workshops.
                        </p>
                      </div>
                    </div>

                    {/* Interactive Workshop Booker */}
                    <div className="border border-amber-200 bg-amber-50/20 p-4 rounded space-y-3">
                      <h5 className="font-sans font-bold text-gray-800 text-xs uppercase tracking-wide">Request a Local Workshop Prep Kit</h5>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Planning an upcoming family reunion or compound union? Book a virtual training session and receive a physical preparation pack.
                      </p>

                      {!workshopBookedLanding ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="date"
                            value={workshopDateLanding}
                            onChange={(e) => setWorkshopDateLanding(e.target.value)}
                            className="text-xs p-2 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white text-gray-700 font-sans"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!workshopDateLanding) {
                                alert("Please select a valid target reunion date first.");
                                return;
                              }
                              setWorkshopBookedLanding(true);
                            }}
                            className="px-4 py-2 bg-[#2D2926] hover:bg-[#E2A04F] text-[#F9F7F2] hover:text-[#2D2926] text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer shrink-0"
                          >
                            Book Workshop Date
                          </button>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded animate-scaleIn space-y-2 text-center sm:text-left">
                          <p className="font-bold text-xs flex items-center justify-center sm:justify-start gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> Workshop Date Registered!
                          </p>
                          <p className="text-xs text-emerald-700 leading-relaxed">
                            Excellent! We have flagged your family gathering date (<strong>{workshopDateLanding}</strong>). A physical preparation pack containing memory logs and microphone guidelines is queued to be dispatched.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setWorkshopBookedLanding(false);
                              setWorkshopDateLanding('');
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
                {activeAboutTabLanding === 'support' && (
                  <div className="space-y-4 animate-scaleIn text-xs">
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Assistance Portal</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase font-sans">Custodian Help & Support Desk</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      Experiencing difficulties capturing voice diaries, exporting JSON database backups, or nesting generational linkages? Browse our offline guides or submit an inquiry ticket.
                    </p>

                    {/* Interactive FAQ accordions */}
                    <div className="space-y-2">
                      <h5 className="font-sans font-bold text-gray-800 text-xs uppercase tracking-wider">Frequently Answered Protocols:</h5>
                      
                      {[
                        { q: 'Will my files vanish if I clear my browser cookies?', a: 'Yes. Your recordings and full tree are stored only in your browser, so clearing your browser\'s cache/history will wipe them. ALWAYS download a sovereign backup (.afrolineo archive) after completing updates.' },
                        { q: 'How do I combine family tree segments with my cousins?', a: 'Open the Active Sitemap and launch the "Sovereign Offline Backup" panel. Export your tree as JSON, send it to your cousin, and they can run the import utility to merge matching compound directories.' },
                        { q: 'Do you offer offline recording support for villages?', a: 'Yes! Our community teams distribute physical audio dictation machines and mesh WiFi local hub units to elder squares with low internet connectivity.' }
                      ].map((faq, idx) => (
                        <div key={idx} className="border border-gray-150 rounded">
                          <button
                            type="button"
                            onClick={() => setFaqOpenLanding(faqOpenLanding === idx ? null : idx)}
                            className="w-full text-left p-2.5 bg-[#FAF8F5] hover:bg-gray-50 flex justify-between items-center text-xs font-bold text-gray-800 cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${faqOpenLanding === idx ? 'rotate-180' : ''}`} />
                          </button>
                          {faqOpenLanding === idx && (
                            <div className="p-3 bg-white text-xs text-gray-600 border-t border-gray-100 leading-relaxed animate-slideDown font-serif">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Support ticket submission form */}
                    <div className="border border-gray-200 p-4 rounded bg-white space-y-3 mt-1">
                      <h5 className="font-sans font-bold text-gray-800 text-xs uppercase tracking-wide">Log a Support & Diagnostic Ticket</h5>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Need technical help? Submit a local ticket to draft a diagnostic package.
                      </p>

                      {!supportSubmittedLanding ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!supportEmailLanding || !supportMessageLanding) return;
                            setSupportSubmittedLanding(true);
                          }}
                          className="space-y-2.5"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="email"
                              placeholder="Custodian Email Address *"
                              required
                              value={supportEmailLanding}
                              onChange={(e) => setSupportEmailLanding(e.target.value)}
                              className="text-xs p-2 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white w-full"
                            />
                            <select
                              value={supportCategoryLanding}
                              onChange={(e) => setSupportCategoryLanding(e.target.value)}
                              className="text-xs p-2 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white text-gray-700 w-full font-sans"
                            >
                              <option value="offline">Offline backup & restore issue</option>
                              <option value="recording">Recording voice memos help</option>
                              <option value="sitemap">Sitemap & navigation error</option>
                              <option value="other">Other ancestral node error</option>
                            </select>
                          </div>
                          <textarea
                            placeholder="Please describe what specific ancestral node linkage or audio asset is malfunctioning..."
                            rows={2}
                            required
                            value={supportMessageLanding}
                            onChange={(e) => setSupportMessageLanding(e.target.value)}
                            className="text-xs p-2 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white w-full"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#2D2926] hover:bg-[#E2A04F] text-[#F9F7F2] hover:text-[#2D2926] text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                          >
                            Generate Help Desk Ticket
                          </button>
                        </form>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded text-center space-y-2 animate-scaleIn">
                          <p className="font-bold text-xs flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> Support Ticket Generated!
                          </p>
                          <p className="text-xs text-emerald-700 leading-relaxed">
                            Your help desk ticket <strong>#AFR-2026-{(Math.floor(Math.random() * 8999) + 1000)}</strong> has been registered in your client browser cookie state. An encrypted diagnostic log has been staged.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSupportSubmittedLanding(false);
                              setSupportMessageLanding('');
                              setSupportEmailLanding('');
                            }}
                            className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-mono text-xs uppercase font-bold rounded"
                          >
                            Submit another support ticket
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 11. ARTICLES & ESSAYS */}
                {activeAboutTabLanding === 'articles' && (
                  <div className="space-y-6 animate-scaleIn text-xs text-[#2D2926]">
                    <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Knowledge Hub</span>
                        <h4 className="font-serif font-black text-lg text-[#2D2926] uppercase">Oral Genealogy & Preservation Articles</h4>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">Curated by Academic Councils</span>
                    </div>

                    {selectedArticleIdLanding ? (
                      // Rich Article Reader view
                      (() => {
                        const article = ARTICLES.find(a => a.id === selectedArticleIdLanding);
                        if (!article) return null;
                        const isSaved = savedArticlesLanding.includes(article.id);
                        return (
                          <div className="space-y-5 text-left">
                            <button
                              type="button"
                              onClick={() => setSelectedArticleIdLanding(null)}
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
                                        setSavedArticlesLanding(savedArticlesLanding.filter(id => id !== article.id));
                                      } else {
                                        setSavedArticlesLanding([...savedArticlesLanding, article.id]);
                                      }
                                    }}
                                    className="p-1 rounded hover:bg-gray-200 text-gray-600 cursor-pointer flex items-center"
                                    title={isSaved ? "Remove Bookmark" : "Bookmark Article"}
                                  >
                                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#E2A04F] text-[#E2A04F]' : 'text-gray-450'}`} />
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
                              value={articleSearchQueryLanding}
                              onChange={(e) => setArticleSearchQueryLanding(e.target.value)}
                              className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white font-sans text-gray-850"
                            />
                          </div>
                          <select
                            value={articleFilterLanding}
                            onChange={(e) => setArticleFilterLanding(e.target.value)}
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
                        {savedArticlesLanding.length > 0 && (
                          <div className="bg-amber-50/20 border border-[#E2A04F]/30 p-3 rounded-sm flex items-center justify-between text-xs font-medium">
                            <span className="text-gray-700 font-sans flex items-center gap-1.5">
                              <Bookmark className="w-3.5 h-3.5 text-[#E2A04F] fill-[#E2A04F]" /> You bookmarked <strong>{savedArticlesLanding.length}</strong> essays for offline reading.
                            </span>
                            <button
                              type="button"
                              onClick={() => setSavedArticlesLanding([])}
                              className="text-xs text-[#2D2926] underline uppercase font-bold hover:text-[#E2A04F]"
                            >
                              Clear List
                            </button>
                          </div>
                        )}

                        {/* List Grid */}
                        <div className="grid grid-cols-1 gap-4">
                          {ARTICLES.filter(art => {
                            const matchQuery = art.title.toLowerCase().includes(articleSearchQueryLanding.toLowerCase()) || 
                                               art.excerpt.toLowerCase().includes(articleSearchQueryLanding.toLowerCase()) ||
                                               art.author.toLowerCase().includes(articleSearchQueryLanding.toLowerCase());
                            const matchFilter = articleFilterLanding === 'all' || art.category === articleFilterLanding;
                            return matchQuery && matchFilter;
                          }).map(art => {
                            const isSaved = savedArticlesLanding.includes(art.id);
                            return (
                              <div key={art.id} className="border border-gray-200 hover:border-gray-300 p-4 rounded-md bg-[#FAF8F5] transition-all flex flex-col justify-between space-y-3 text-left">
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase font-mono tracking-widest text-[#E2A04F] font-bold">{art.category}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isSaved) {
                                          setSavedArticlesLanding(savedArticlesLanding.filter(id => id !== art.id));
                                        } else {
                                          setSavedArticlesLanding([...savedArticlesLanding, art.id]);
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
                                    onClick={() => setSelectedArticleIdLanding(art.id)}
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

                {/* 12. HERITAGE GIFTS */}
                {activeAboutTabLanding === 'gifts' && (
                  <div className="space-y-6 animate-scaleIn text-xs text-[#2D2926]">
                    <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Preservation Shop</span>
                        <h4 className="font-serif font-black text-lg text-[#2D2926] uppercase">Custom Family Heritage Artifacts</h4>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">100% of proceeds fund offline village hardware</span>
                    </div>

                    {selectedGiftIdLanding ? (
                      // Product Customization Panel
                      (() => {
                        const gift = GIFTS.find(g => g.id === selectedGiftIdLanding);
                        if (!gift) return null;
                        const famName = customFamilyNameLanding || 'Alao Family';
                        const regName = customRegionLanding || 'Oyo State, Nigeria';
                        return (
                          <div className="space-y-5 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedGiftIdLanding(null);
                                setGiftCustomizedLanding(false);
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
                                      value={customFamilyNameLanding}
                                      onChange={(e) => {
                                        setCustomFamilyNameLanding(e.target.value);
                                        setGiftCustomizedLanding(true);
                                      }}
                                      className="w-full text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white font-sans text-gray-800"
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
                                        value={customRegionLanding}
                                        onChange={(e) => {
                                          setCustomRegionLanding(e.target.value);
                                          setGiftCustomizedLanding(true);
                                        }}
                                        className="w-full text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white font-sans text-gray-800"
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
                                        customName: customFamilyNameLanding || gift.customPlaceholder,
                                        customRegion: customRegionLanding,
                                        price: gift.price,
                                        badge: gift.badge
                                      };
                                      setStagedGiftsLanding([...stagedGiftsLanding, customizedItem]);
                                      alert(`Success! "${customizedItem.customName}" customization added to your staged dispatch manifest.`);
                                      setSelectedGiftIdLanding(null);
                                      setCustomFamilyNameLanding('');
                                      setCustomRegionLanding('');
                                      setGiftCustomizedLanding(false);
                                    }}
                                    className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-sans font-bold uppercase tracking-wider rounded transition-colors cursor-pointer text-center"
                                  >
                                    Stage Custom Dispatch
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedGiftIdLanding(null);
                                      setCustomFamilyNameLanding('');
                                      setCustomRegionLanding('');
                                      setGiftCustomizedLanding(false);
                                    }}
                                    className="px-4 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs uppercase font-bold tracking-wider rounded transition-all cursor-pointer"
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
                              <div className="relative h-44 w-full bg-gray-100">
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
                                    setSelectedGiftIdLanding(gift.id);
                                    setCustomFamilyNameLanding('');
                                    setCustomRegionLanding('');
                                  }}
                                  className="w-full py-2 bg-[#FAF8F5] hover:bg-[#2D2926] hover:text-white border border-[#2D2926]/30 text-[#2D2926] text-xs font-sans font-bold uppercase tracking-wider rounded transition-all cursor-pointer"
                                >
                                  Configure & Preview Artifact →
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Staged delivery manifest list */}
                        {stagedGiftsLanding.length > 0 && (
                          <div className="bg-[#FAF8F5] border border-gray-200 p-5 rounded-md text-left space-y-3.5">
                            <h5 className="font-sans font-bold text-xs uppercase text-[#2D2926] flex items-center gap-2">
                              🎁 Your Staged Dispatch Manifest ({stagedGiftsLanding.length})
                            </h5>
                            <p className="text-xs text-gray-500">
                              These customized items are prepared in your temporary client session buffer. To place a real order or apply village sponsorship credit vouchers, proceed to the secure gateway setup.
                            </p>
                            <div className="space-y-2.5">
                              {stagedGiftsLanding.map((item) => (
                                <div key={item.id} className="bg-white border border-gray-150 p-3 rounded flex items-center justify-between text-xs font-sans">
                                  <div>
                                    <p className="font-bold text-gray-800">{item.originalName}</p>
                                    <p className="text-xs text-[#E2A04F] font-serif italic">Custom Title: "{item.customName}" {item.customRegion ? `• Region: ${item.customRegion}` : ''}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <strong className="text-gray-800 font-black">${item.price.toFixed(2)}</strong>
                                    <button
                                      type="button"
                                      onClick={() => setStagedGiftsLanding(stagedGiftsLanding.filter(g => g.id !== item.id))}
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
                                ${stagedGiftsLanding.reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 13. CUSTODIAN STORIES */}
                {activeAboutTabLanding === 'customer-stories' && (
                  <div className="space-y-6 animate-scaleIn text-xs text-[#2D2926]">
                    <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Impact Testimonials</span>
                        <h4 className="font-serif font-black text-lg text-[#2D2926] uppercase">Custodian Success Chronicles</h4>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">Real Diaspora Breakthroughs</span>
                    </div>

                    <p className="text-gray-750 leading-relaxed font-light text-xs text-left">
                      Read about real family archivists who broke through decades of genealogical silences by integrating verbal praise-songs, geographical wards, and localized audio recordings.
                    </p>

                    {/* Filter and Story list */}
                    <div className="space-y-5">
                      <div className="flex gap-2 justify-start">
                        {['all', 'Nigeria', 'Senegal', 'Diaspora'].map(reg => (
                          <button
                            key={reg}
                            onClick={() => setStoryRegionFilterLanding(reg)}
                            className={`px-3 py-1.5 rounded text-xs uppercase font-bold transition-all cursor-pointer ${
                              storyRegionFilterLanding === reg ? 'bg-[#2D2926] text-[#E2A04F]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {reg === 'all' ? 'All Regions' : reg}
                          </button>
                        ))}
                      </div>

                      {/* Display stories list */}
                      <div className="grid grid-cols-1 gap-5">
                        {/* Static stories + user submitted stories */}
                        {[...STORIES, ...submittedStoriesLanding]
                          .filter(s => storyRegionFilterLanding === 'all' || s.region === storyRegionFilterLanding)
                          .map(story => {
                            const isPlaying = playingStoryIdLanding === story.id;
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
                                          setPlayingStoryIdLanding(null);
                                        } else {
                                          setPlayingStoryIdLanding(story.id);
                                          // Simulate an automatic pause after 20 seconds
                                          setTimeout(() => {
                                            setPlayingStoryIdLanding(prev => prev === story.id ? null : prev);
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
                            if (!newStoryNameLanding || !newStoryTextLanding) return;
                            const customStory = {
                              id: `custom-story-${Date.now()}`,
                              name: `${newStoryNameLanding} Ancestral Record`,
                              region: newStoryRegionLanding || 'Diaspora',
                              ethnic: 'Oral Historian',
                              yearsTrace: 'Newly Restored',
                              summary: 'Preserving a living memory sandbox breakthrough.',
                              details: newStoryTextLanding,
                              speaker: newStoryNameLanding,
                              audioDuration: 'Live Tape'
                            };
                            setSubmittedStoriesLanding([customStory, ...submittedStoriesLanding]);
                            setNewStoryNameLanding('');
                            setNewStoryRegionLanding('');
                            setNewStoryTextLanding('');
                            alert("Thank you! Your ancestral breakthrough story has been published to your browser's local sandbox.");
                          }}
                          className="space-y-3 animate-none"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Your Family or Compound Name (e.g., Sowande Clan)"
                              required
                              value={newStoryNameLanding}
                              onChange={(e) => setNewStoryNameLanding(e.target.value)}
                              className="text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#E2A04F] bg-white w-full"
                            />
                            <select
                              value={newStoryRegionLanding}
                              onChange={(e) => setNewStoryRegionLanding(e.target.value)}
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
                            value={newStoryTextLanding}
                            onChange={(e) => setNewStoryTextLanding(e.target.value)}
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

            {/* Bottom action controls */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-150 flex justify-end">
              <button 
                onClick={() => setActiveAboutTabLanding(null)}
                className="px-5 py-2.5 bg-[#2D2926] hover:bg-[#E2A04F] hover:text-[#2D2926] text-[#F9F7F2] text-xs font-sans font-bold uppercase tracking-wider rounded-sm shadow-xs transition-all cursor-pointer"
              >
                Close Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
