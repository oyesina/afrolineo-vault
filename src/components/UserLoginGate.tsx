import React, { useState } from 'react';
import { 
  Mail, Chrome, Facebook, Apple, Twitter, Lock, Sparkles, 
  ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, HelpCircle, 
  UserCheck, Heart, Radio, Languages, Compass, Mic, Network, Shield,
  X as CloseIcon, ChevronDown, CheckCircle, Volume2,
  Globe, Briefcase, Newspaper, FileText, Users, UserPlus, Flame, 
  Settings, Plus, Download, Smile, Search, BookOpen, Gift, Play, Pause, Bookmark
} from 'lucide-react';

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

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!forgotEmail) {
      setErrorMsg('Kindly enter your registered email identifier.');
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
      setErrorMsg('Kindly enter a valid email address.');
      return;
    }
    if (!password || password.length < 5) {
      setErrorMsg('Password should be at least 5 characters long.');
      return;
    }
    if (isSignUp && !fullName) {
      setErrorMsg('Kindly tell us your name so we can label your pedigree line.');
      return;
    }

    setIsLoading(true);

    // Simulate clean, professional premium authentication process
    setTimeout(() => {
      setIsLoading(false);
      const computedName = isSignUp ? fullName : email.split('@')[0];
      setSuccessMsg(`Identity verified! Tell us a few words about your roots...`);
      
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
    <div id="login-gate-screen" className="min-h-screen bg-[#111110] text-[#fcfbfa] flex flex-col relative overflow-x-hidden select-none font-sans">
      
      {/* GLOBAL AMBIENT BACKGROUND GLOW EFFECTS */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#E2A04F]/10 blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[150px]" />
        <svg className="absolute inset-0 w-full h-full stroke-white/[0.03] stroke-[0.5]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* HEADER BAR */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 py-6 flex items-center justify-between border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-[#fcfbfa]/20 bg-[#E2A04F] flex items-center justify-center rotate-2 rounded-sm shadow-sm shrink-0">
            <Heart className="w-5 h-5 text-black fill-black" />
          </div>
          <div>
            <h2 className="font-display font-black text-xl tracking-tight text-white flex items-center gap-2 leading-none">
              Afrolineo
              <span className="text-[9px] uppercase font-sans font-bold tracking-widest bg-[#E2A04F]/20 text-[#E2A04F] py-0.5 px-2 rounded-sm">
                Sovereign Vault
              </span>
            </h2>
            <span className="text-[9px] uppercase tracking-[0.25em] text-gray-500 font-sans block mt-1 leading-none font-bold">
              Oral History & Pedigree Mapping
            </span>
          </div>
        </div>

        {/* Header CTA - Elegant login button as requested */}
        <button
          onClick={() => setIsLoginWindowOpen(true)}
          className="px-5 py-2.5 bg-[#E2A04F]/10 border border-[#E2A04F]/30 hover:border-[#E2A04F] text-[#E2A04F] hover:text-white rounded-md text-xs uppercase tracking-widest font-black transition-all cursor-pointer shadow-sm flex items-center gap-2"
        >
          <span>Unlock Vault</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#E2A04F]" />
        </button>
      </header>

      {/* HERO HERO HERO LANDING PRESENTATION SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 pt-16 pb-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E2A04F]/10 border border-[#E2A04F]/25 text-[#E2A04F] rounded-full text-[9px] font-sans font-black uppercase tracking-widest leading-none mx-auto">
          <Radio className="w-3 h-3 text-[#E2A04F] animate-pulse" />
          Welcome, Sovereign Seeker
        </div>

        <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          To reclaim what was <span className="text-[#E2A04F]">scattered</span> <br />is to define where you stand.
        </h1>

        <p className="text-gray-300 font-sans text-sm sm:text-lg leading-relaxed max-w-3xl mx-auto font-light">
          Our ancestors mapped their world not with ink on paper, but in the echoes of stories shared. For generations, family lineages were kept alive by firesides, in quiet kitchens, and on porch swings across local communities.
        </p>

        {/* LANDING PAGE ONLY HAS A LOGIN BUTTON (As requested: "Let the landing page only have a login button") */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setIsLoginWindowOpen(true)}
            className="w-full sm:w-auto px-10 py-4.5 bg-[#E2A04F] hover:bg-[#E2A04F]/90 text-black rounded-lg font-sans font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_10px_35px_rgba(226,160,79,0.25)] flex items-center justify-center gap-3 cursor-pointer group hover:scale-[1.02]"
          >
            <span>Begin Ancestral Mapping</span>
            <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Scroll Indicator Accent */}
        <div className="pt-8 flex flex-col items-center gap-2 text-gray-500 animate-bounce">
          <span className="text-[9px] uppercase tracking-widest font-bold">Discover More Underneath</span>
          <ChevronDown className="w-4 h-4 text-[#E2A04F]/60" />
        </div>
      </section>

      {/* THREE PICTURES MASSIVE ARCHIVE PORTRAITS (African descent storytelling highlights) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Elder Portrait Card */}
          <div className="group relative rounded-2xl overflow-hidden border border-gray-800/80 hover:border-[#E2A04F]/50 shadow-xl transition-all duration-300 bg-[#161514]">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#E2A04F]" />
            <div className="aspect-[4/5] w-full overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop" 
                alt="African Heritage Grandmother storytelling" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-102 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111110] via-black/30 to-transparent" />
            </div>
            <div className="p-5 relative z-10 bg-[#161514]">
              <span className="text-[8px] text-[#E2A04F] font-black uppercase tracking-[0.2em] block mb-1">SECTION I: THE ELDERS</span>
              <h3 className="font-serif font-black text-lg text-white mb-2">Preserving Oral Transcripts</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Connect your microphone to capture organic audio files of stories, accents, and local kinship paths from home before they are lost to time.
              </p>
            </div>
          </div>

          {/* Young Seeker Portrait Card */}
          <div className="group relative rounded-2xl overflow-hidden border border-gray-800/80 hover:border-[#E2A04F]/50 shadow-xl transition-all duration-300 bg-[#161514]">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#E2A04F]" />
            <div className="aspect-[4/5] w-full overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=600&auto=format&fit=crop" 
                alt="Young descendant tracing kin history" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-102 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111110] via-black/30 to-transparent" />
            </div>
            <div className="p-5 relative z-10 bg-[#161514]">
              <span className="text-[8px] text-[#E2A04F] font-black uppercase tracking-[0.2em] block mb-1">SECTION II: THE SEEKERS</span>
              <h3 className="font-serif font-black text-lg text-white mb-2">Ancestral Lineage Search</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Reconstruct pedigree nodes across communities. Cross-reference geographical coordinates of West-African lineage origins with historical records.
              </p>
            </div>
          </div>

          {/* Family Kinship Portrait Card */}
          <div className="group relative rounded-2xl overflow-hidden border border-gray-800/80 hover:border-emerald-500/50 shadow-xl transition-all duration-300 bg-[#161514]">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-500" />
            <div className="aspect-[4/5] w-full overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop" 
                alt="Diverse black family smiles" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-102 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111110] via-black/30 to-transparent" />
            </div>
            <div className="p-5 relative z-10 bg-[#161514]">
              <span className="text-[8px] text-emerald-400 font-black uppercase tracking-[0.2em] block mb-1">SECTION III: THE CLANSMEN</span>
              <h3 className="font-serif font-black text-lg text-white mb-2">Secure Sovereign Backups</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                You retain absolute ownership of your pedigree metrics. Download offline-first JSON archives with nested media links securely anytime.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* UNDERNEATH SECTION (As requested: "underneath the landing page we can have...") */}
      <section id="landing-underneath-features" className="relative z-10 w-full border-t border-white/[0.07] bg-[#141312] py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="text-[#E2A04F] text-[10px] font-sans font-black uppercase tracking-[0.22em] block">
              AUTHENTIC AFRICAN ARCHIVES METRICS
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-white leading-tight">
              An offline-first sanctuary built on zero third-party indexing constraints.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
              Too often, genealogical services turn sacred memories into commercial indices. We believe your kinship structures belong strictly to you and your progeny. Afrolineo provides high-fidelity tools to map bloodlines safely.
            </p>

            {/* Micro feature check bullets */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#E2A04F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-sans font-black text-white uppercase tracking-wider">Dynamic Kinship Node Map</h4>
                  <p className="text-xs text-gray-400">Map nodes visually, assigning custom origin details such as native clans or oral aliases.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#E2A04F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-sans font-black text-white uppercase tracking-wider">Localized Cultural Geography</h4>
                  <p className="text-xs text-gray-400">Link lineages directly to ancestral villages, physical monuments, or specific regional birthplaces.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#E2A04F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-sans font-black text-white uppercase tracking-wider">Lossless Audio Studio and Player</h4>
                  <p className="text-xs text-gray-400">Log detailed transcripts, oral minutes recorded, and link raw narration files directly into corresponding profiles.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setIsLoginWindowOpen(true)}
                className="px-6 py-3 bg-[#E2A04F] hover:bg-[#E2A04F]/90 text-black rounded-md font-sans font-black text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                Access Sovereign Vault Sandbox
              </button>
            </div>
          </div>

          <div className="relative p-6 sm:p-10 border border-white/[0.06] rounded-2xl bg-[#1a1918] overflow-hidden shadow-inner group">
            {/* Top gold line highlight */}
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-[#E2A04F]/60" />
            
            <h3 className="font-serif font-black text-xl text-white mb-6">Sovereign Vault Integrity Guidelines</h3>
            
            <div className="space-y-4 text-xs text-gray-400">
              <div className="p-3 bg-[#111110] border border-gray-800 rounded flex gap-3">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <strong className="text-white">Strict Privacy</strong>
                  <p className="mt-0.5">Your files are stored inside your browser's persistent sandbox. No metadata leaks to centralized AI models.</p>
                </div>
              </div>

              <div className="p-3 bg-[#111110] border border-gray-800 rounded flex gap-3">
                <Mic className="w-5 h-5 text-[#E2A04F] shrink-0" />
                <div>
                  <strong className="text-white">Lossless Oral Transcript Encoding</strong>
                  <p className="mt-0.5">Lossless audio logs can be integrated per pedigree node to secure raw voice accents of kin grandparents.</p>
                </div>
              </div>

              <div className="p-3 bg-[#111110] border border-gray-800 rounded flex gap-3">
                <Network className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <strong className="text-white">Structured Local Interoperability</strong>
                  <p className="mt-0.5">Full support to import and export standard JSON files easily, keeping your heritage completely independent.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-sm">
              <span className="text-[10px] text-emerald-400 font-sans tracking-widest uppercase font-black">✔ ZERO TRACKERS FOUND</span>
              <p className="text-[10px] text-gray-400 mt-1">Ready to host your family lineage records securely.</p>
            </div>
          </div>

        </div>
      </section>

      {/* RICH FOOTER BAR */}
      <footer className="relative z-10 w-full border-t border-white/[0.08] bg-[#0c0c0b] py-16 text-xs text-gray-400 font-sans">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-12 text-left">
            
            {/* Branding Column */}
            <div className="md:col-span-3 space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#E2A04F]" />
                <span className="font-sans font-black text-white tracking-wider uppercase text-sm">Afrolineo</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-serif italic max-w-sm">
                Preserving oral history, sovereign lineages, and localized cultural geography across ancestral compounds.
              </p>
              <div className="text-[10px] text-gray-500 font-mono">
                Platform Local Time: 2026 • Live Heritage Node
              </div>
            </div>

            {/* Explore Section */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#E2A04F] font-sans font-black">Explore</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveAboutTabLanding('articles'); }} className="text-gray-400 hover:text-white transition-colors">Articles</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setShowSitemapLanding(true); }} className="text-gray-400 hover:text-white font-semibold text-[#E2A04F] transition-colors">Sitemap</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveAboutTabLanding('gifts'); }} className="text-gray-400 hover:text-white transition-colors">Gifts</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveAboutTabLanding('customer-stories'); }} className="text-gray-400 hover:text-white transition-colors">Customer Stories</a></li>
              </ul>
            </div>

            {/* About Section */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#E2A04F] font-sans font-black">About</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveAboutTabLanding('dei'); }} className="text-gray-400 hover:text-white transition-colors">Diversity, Equity, and Inclusion</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveAboutTabLanding('careers'); }} className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveAboutTabLanding('newsroom'); }} className="text-gray-400 hover:text-white transition-colors">Newsroom</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveAboutTabLanding('security'); }} className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveAboutTabLanding('privacy'); }} className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveAboutTabLanding('guidelines'); }} className="text-gray-400 hover:text-white transition-colors">User Guidelines</a></li>
              </ul>
            </div>

            {/* Terms & Support Section */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#E2A04F] font-sans font-black">Terms & Support</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveAboutTabLanding('terms'); }} className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveAboutTabLanding('social-impact'); }} className="text-gray-400 hover:text-white transition-colors">Social Impact</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveAboutTabLanding('community-impact'); }} className="text-gray-400 hover:text-white transition-colors">Afrolineo in your Community</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveAboutTabLanding('support'); }} className="text-gray-400 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Social Section */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#E2A04F] font-sans font-black">Social</h4>
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
          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 text-center md:text-left">
            <p>© 2026 Afrolineo Community Heritage Vault. Trace Your Land, Live Your Story.</p>
            <p className="text-[10px] text-gray-600 font-mono">
              Built specifically for mapping sacred African and native oral genealogy networks.
            </p>
          </div>
        </div>
      </footer>

      {/* LOGIN WINDOW (MODAL DIALOG POPUP AS REQUESTED: "i want the login panel to be on the login window.") */}
      {isLoginWindowOpen && (
        <div id="login-window-overlay" className="fixed inset-0 bg-black/95 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#1a1918] border border-[#E2A04F]/50 rounded-2xl p-6 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] group">
            
            {/* Top gold highlight line styling */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E2A04F]/40 via-[#E2A04F] to-[#E2A04F]/40" />

            {/* Absolute close button */}
            <button
              onClick={() => {
                setIsLoginWindowOpen(false);
                setErrorMsg('');
                setSuccessMsg('');
                setDraftUser(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Close Login Window"
            >
              <CloseIcon className="w-4 h-4" />
            </button>

            {draftUser ? (
              /* ========================================================= */
              /* STEP 2: PERSONAL DETAILS INPUT FOR CUSTOMIZING ANCESTRY  */
              /* ========================================================= */
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-serif font-black text-white">
                    Ancestral Profiler Guidance
                  </h3>
                  <p className="text-[9px] text-[#E2A04F] tracking-wider uppercase font-sans mt-0.5 font-bold">
                    Guide the product on your ancestral roots
                  </p>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  Welcome, <strong className="text-white">{draftUser.name}</strong>. Kindly share these foundational details so we can tailor transcription helper algorithms, tree nodes, and recording checklists specifically to your lineage.
                </p>

                <div className="space-y-4 pt-1">
                  
                  {/* Select Country Focus */}
                  <div>
                    <label className="block text-[8px] uppercase tracking-[0.18em] text-gray-400 font-bold font-sans mb-1.5">
                      Country or Core Native Region
                    </label>
                    <select
                      value={ancestralCountry}
                      onChange={(e) => {
                        const country = e.target.value;
                        setAncestralCountry(country);
                        setAncestralState('');
                        setAncestralWard('');
                        const defaultEth = ETHNIC_GROUPS_BY_COUNTRY[country]?.[0] || 'Other Ancestral Group';
                        setEthnicGroup(defaultEth);
                      }}
                      className="w-full bg-[#111110] border border-gray-800 focus:border-[#E2A04F] py-2.5 px-3 rounded text-xs text-white outline-none transition-colors"
                    >
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Sierra Leone">Sierra Leone</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Zimbabwe">Zimbabwe</option>
                      <option value="Angola / Congo-Zaire">Angola / Congo-Zaire</option>
                      <option value="Other African Native Region">Other African Region</option>
                    </select>
                  </div>

                  {/* Select State / Region Focus (New Dropdown option as requested) */}
                  <div>
                    <label className="block text-[8px] uppercase tracking-[0.18em] text-gray-400 font-bold font-sans mb-1.5">
                      Ancestral State / Region / Province (Optional Dropdown)
                    </label>
                    <select
                      value={ancestralState}
                      onChange={(e) => {
                        setAncestralState(e.target.value);
                        setAncestralWard('');
                      }}
                      className="w-full bg-[#111110] border border-gray-800 focus:border-[#E2A04F] py-2.5 px-3 rounded text-xs text-white outline-none transition-colors"
                    >
                      <option value="">-- Select State/Region (Optional) --</option>
                      {(STATES_BY_COUNTRY[ancestralCountry] || []).map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Ward / District Focus (New Dropdown option as requested, visible if State matches or custom) */}
                  <div>
                    <label className="block text-[8px] uppercase tracking-[0.18em] text-gray-400 font-bold font-sans mb-1.5">
                      Ancestral Ward / District (Optional Dropdown)
                    </label>
                    <select
                      value={ancestralWard}
                      onChange={(e) => setAncestralWard(e.target.value)}
                      className="w-full bg-[#111110] border border-gray-800 focus:border-[#E2A04F] py-2.5 px-3 rounded text-xs text-white outline-none transition-colors"
                    >
                      <option value="">-- Select Ward/District (Optional) --</option>
                      {getWardsForState(ancestralState).map((wd) => (
                        <option key={wd} value={wd}>{wd}</option>
                      ))}
                    </select>
                  </div>

                  {/* Pre-colonial ethnic identity */}
                  <div>
                    <label className="block text-[8px] uppercase tracking-[0.18em] text-gray-400 font-bold font-sans mb-1.5">
                      Pre-Colonial Ethnic Group / Dialect Dropdown
                    </label>
                    <select
                      id="ancestry-ethnic"
                      value={ethnicGroup}
                      onChange={(e) => setEthnicGroup(e.target.value)}
                      className="w-full bg-[#111110] border border-gray-800 focus:border-[#E2A04F] py-2.5 px-3 rounded text-xs text-white outline-none transition-colors font-sans"
                    >
                      {getEthnicGroupsForCountry(ancestralCountry).map((eth) => (
                        <option key={eth} value={eth}>{eth}</option>
                      ))}
                    </select>
                  </div>

                  {/* Custodian Grandparent / Elder Name to write */}
                  <div>
                    <label className="block text-[8px] uppercase tracking-[0.18em] text-gray-400 font-bold font-sans mb-1.5">
                      Lead Elder Custodian to document first
                    </label>
                    <input 
                      id="ancestry-custodian"
                      type="text"
                      placeholder="e.g. Grandma Nneka, Papa Alao, Chief Olakunle"
                      value={custodianName}
                      onChange={(e) => setCustodianName(e.target.value)}
                      className="w-full bg-[#111110] border border-gray-800 focus:border-[#E2A04F] py-2.5 px-3 rounded text-xs text-white placeholder-gray-700 outline-none transition-colors font-sans"
                    />
                  </div>

                  {/* Progress / Generations known */}
                  <div>
                    <label className="block text-[8px] uppercase tracking-[0.18em] text-gray-400 font-bold font-sans mb-1.5">
                      How deep is your current lineage documentation?
                    </label>
                    <select
                      value={knowledgeLevel}
                      onChange={(e) => setKnowledgeLevel(e.target.value)}
                      className="w-full bg-[#111110] border border-gray-800 focus:border-[#E2A04F] py-2.5 px-3 rounded text-xs text-white outline-none transition-colors"
                    >
                      <option value="Just starting out">Just starting (0-1 generations known)</option>
                      <option value="Know 2-3 generations">Moderately documented (Parents, Grandparents)</option>
                      <option value="Pre-colonial dynasty archivist">Deep native archives (4+ generations mapped)</option>
                    </select>
                  </div>

                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDraftUser(null)}
                    className="flex-1 py-3 border border-gray-800 hover:border-gray-750 text-gray-400 text-[10px] font-sans font-black uppercase tracking-widest rounded-sm cursor-pointer"
                  >
                    Back
                  </button>
                  <button
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
                        ancestralWard
                      });
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-sm font-sans font-black text-[10px] uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]"
                  >
                    <span>Mount Vault</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* ========================================================= */
              /* STEP 1: INITIAL PASS CREDENTIALS SUBMISSION               */
              /* ========================================================= */
              <div className="animate-fadeIn">
                {isForgotPassword ? (
                  /* ========================================================= */
                  /* SUB-STEP: FORGOT PASSWORD RESET PROTOCOL (NEW)           */
                  /* ========================================================= */
                  <div className="space-y-6 animate-fadeIn py-2">
                    <div>
                      <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#E2A04F]/10 text-[#E2A04F] border border-[#E2A04F]/25 mb-3">
                        <HelpCircle className="w-5 h-5 text-[#E2A04F]" />
                      </div>
                      <h3 className="text-2xl font-serif font-black text-white">
                        Recover Secure Passport
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Securely restore credentials access to your local sovereign vault
                      </p>
                    </div>

                    {/* Status signals inside forgot password form */}
                    {errorMsg && (
                      <div className="p-4.5 bg-red-950/45 border border-red-800/40 text-red-200 text-xs rounded-sm flex items-center gap-2.5 animate-pulse">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="font-semibold">{errorMsg}</span>
                      </div>
                    )}

                    {successMsg && (
                      <div className="p-4.5 bg-emerald-950/45 border border-emerald-800/40 text-emerald-200 text-xs rounded-sm flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold">{successMsg}</span>
                      </div>
                    )}

                    {!isForgotSubmitted ? (
                      <form onSubmit={handleForgotSubmit} className="space-y-5">
                        <div>
                          <label className="block text-[8px] uppercase tracking-[0.18em] text-gray-400 font-bold font-sans mb-2">
                            YOUR REGISTERED EMAIL ADDRESS
                          </label>
                          <input 
                            type="email"
                            placeholder="ancestor@afrolineo.org"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-[#111110] border border-gray-800 focus:border-[#E2A04F] py-3 px-4 rounded text-xs text-white placeholder-gray-700 outline-none transition-colors"
                            required
                          />
                          <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                            We will send a temporary secure bypass authorization link to restore access. No central passwords saved on external servers.
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-[#E2A04F] hover:bg-[#E2A04F]/90 text-black py-3 rounded-sm font-sans font-black text-[10px] uppercase tracking-widest transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-1.5">
                              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-black border-t-transparent" />
                              Transmitting Recovery Signal...
                            </span>
                          ) : (
                            <>
                              <span>Send Recovery Instructions</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <div className="p-5 bg-emerald-950/20 border border-emerald-800/40 rounded-sm text-xs text-gray-300 leading-relaxed font-light space-y-2">
                        <span className="text-emerald-400 font-bold flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Recovery Transmitted Successfully!
                        </span>
                        <p>
                          We have dispatched your temporary credential bypass token to <span className="font-mono text-[#E2A04F] font-semibold">{forgotEmail}</span>.
                        </p>
                        <p className="text-gray-500 text-[11px]">
                          (In this sandbox playground mode, you can toggle back and use any credentials key to bypass login immediately!)
                        </p>
                      </div>
                    )}

                    <div className="pt-4 text-center border-t border-gray-800/40">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(false);
                          setIsForgotSubmitted(false);
                          setForgotEmail('');
                          setErrorMsg('');
                          setSuccessMsg('');
                        }}
                        className="text-xs text-[#E2A04F] hover:underline transition-colors cursor-pointer font-bold font-sans"
                      >
                        ← Return to secure account login
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header label inside login modal */}
                    <div className="mb-6 mt-2">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#E2A04F]/10 text-[#E2A04F] border border-[#E2A04F]/20 mb-2">
                        <Lock className="w-4 h-4" />
                      </div>
                      <h3 className="text-xl font-serif font-black text-white">
                        {isSignUp ? 'Generate Search Passport' : 'Access Sovereign Archives'}
                      </h3>
                      <p className="text-[9px] text-gray-400 tracking-wider uppercase font-sans mt-1">
                        {isSignUp ? 'Establish credentials for testing' : 'Validate identity credentials'}
                      </p>
                    </div>

                    {/* Error & Success status triggers inside popup window */}
                    {errorMsg && (
                      <div className="mb-4 p-3 bg-red-950/45 border border-red-800/40 text-red-200 text-xs rounded-sm flex items-center gap-2 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="font-semibold">{errorMsg}</span>
                      </div>
                    )}

                    {successMsg && (
                      <div className="mb-4 p-3 bg-emerald-950/45 border border-emerald-800/40 text-emerald-200 text-xs rounded-sm flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-semibold">{successMsg}</span>
                      </div>
                    )}

                    {/* Native Credentials Form */}
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      
                      {isSignUp && (
                        <div>
                          <label className="block text-[8px] uppercase tracking-[0.18em] text-gray-400 font-bold font-sans mb-1">
                            YOUR VISITOR REAL NAME
                          </label>
                          <input 
                            id="login-field-fullname"
                            type="text"
                            placeholder="e.g. Adefolarin Alao"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-[#111110] border border-gray-800 focus:border-[#E2A04F] py-2.5 px-3 rounded-sm text-xs text-white placeholder-gray-705 font-sans outline-none transition-colors"
                            required
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[8px] uppercase tracking-[0.18em] text-gray-400 font-bold font-sans mb-1">
                          VAULT EMAIL IDENTIFIER
                        </label>
                        <input 
                          id="login-field-email"
                          type="email"
                          placeholder="ancestor@afrolineo.org"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          className="w-full bg-[#111110] border border-gray-800 focus:border-[#E2A04F] py-2.5 px-3 rounded-sm text-xs text-white placeholder-gray-705 font-sans outline-none transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[8px] uppercase tracking-[0.18em] text-gray-400 font-bold font-sans">
                            VAULT PASSWORD KEY
                          </label>
                          {!isSignUp && (
                            <button 
                              type="button" 
                              onClick={() => alert("Credentials bypass: Put any 5+ characters password to unlock the testing sandbox.")}
                              className="text-[8px] uppercase tracking-wider text-[#E2A04F]/80 hover:text-[#E2A04F] cursor-pointer"
                            >
                              Bypass?
                            </button>
                          )}
                        </div>
                        <input 
                          id="login-field-pass"
                          type="password"
                          placeholder="••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                          className="w-full bg-[#111110] border border-gray-800 focus:border-[#E2A04F] py-2.5 px-3 rounded-sm text-xs text-white placeholder-gray-750 font-sans outline-none transition-colors"
                          required
                        />
                        {!isSignUp && (
                          <div className="text-right mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsForgotPassword(true);
                                setErrorMsg('');
                                setSuccessMsg('');
                              }}
                              className="text-[10px] text-gray-400 hover:text-[#E2A04F] transition-colors cursor-pointer font-bold font-sans tracking-wide"
                            >
                              Forgot password?
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        id="login-submit-btn"
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#E2A04F] hover:bg-[#E2A04F]/90 text-black py-2.5 rounded-sm font-sans font-black text-[10px] uppercase tracking-widest transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                      >
                        {isLoading && !activeProvider ? (
                          <span className="flex items-center gap-1.55">
                            <span className="animate-spin rounded-full h-3 w-3 border-2 border-black border-t-transparent" />
                            Validating Credentials...
                          </span>
                        ) : (
                          <>
                            {isSignUp ? 'Verify Passport Details' : 'Validate Passport Key'}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Passport identity provider divider */}
                    <div className="relative my-6 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-805" />
                      </div>
                      <span className="relative z-10 bg-[#1a1918] px-3.5 text-[7px] text-gray-500 font-sans font-bold uppercase tracking-[0.2em]">
                        OR SECURE DIRECT PASSPORT
                      </span>
                    </div>

                    {/* Social logins with realistic service colors */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      
                      <button
                        id="oauth-google"
                        onClick={() => handleOAuthClick('Google')}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-[#111110] hover:bg-[#1a1918] border border-gray-850 hover:border-[#4285F4]/40 p-2 rounded-sm text-left text-gray-300 hover:text-white transition-all cursor-pointer text-[11px] group"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.62-1.07-1.37-1.34-2.22z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span className="font-semibold truncate group-hover:text-white">Google</span>
                      </button>

                      <button
                        id="oauth-x"
                        onClick={() => handleOAuthClick('X')}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-[#111110] hover:bg-[#1a1918] border border-gray-850 hover:border-white/30 p-2 rounded-sm text-left text-gray-300 hover:text-white transition-all cursor-pointer text-[11px] group"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 fill-white opacity-85 group-hover:opacity-100" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span className="font-semibold truncate group-hover:text-white">X / Twitter</span>
                      </button>

                      <button
                        id="oauth-apple"
                        onClick={() => handleOAuthClick('Apple')}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-[#111110] hover:bg-[#1a1918] border border-gray-855 hover:border-white/30 p-2 rounded-sm text-left text-gray-300 hover:text-white transition-all cursor-pointer text-[11px] group"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 fill-white opacity-85 group-hover:opacity-100" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.12 1.12.9 1.1.9 1.1s.63-.53.92-2.43z" />
                        </svg>
                        <span className="font-semibold truncate group-hover:text-white">Apple ID</span>
                      </button>

                      <button
                        id="oauth-facebook"
                        onClick={() => handleOAuthClick('Facebook')}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-[#111110] hover:bg-[#1a1918] border border-gray-855 hover:border-[#1877F2]/40 p-2 rounded-sm text-left text-gray-300 hover:text-white transition-all cursor-pointer text-[11px] group"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 fill-[#1877F2]" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span className="font-semibold truncate group-hover:text-white">Facebook</span>
                      </button>

                    </div>

                    {/* Toggle form link inside login modal */}
                    <div className="text-center pt-2 border-t border-gray-800/40">
                      <p className="text-[11px] text-gray-400">
                        {isSignUp ? 'Already mapped some lines?' : 'First time recording ancestry?'}
                        <button
                          id="login-toggle-signup"
                          type="button"
                          onClick={() => {
                            setErrorMsg('');
                            setSuccessMsg('');
                            setIsSignUp(!isSignUp);
                          }}
                          className="text-[#E2A04F] hover:underline font-bold ml-1 cursor-pointer font-sans"
                        >
                          {isSignUp ? 'Log in here' : 'Register free passport'}
                        </button>
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* INDIVIDUAL SECURE POPUP MODAL SIMULATION FOR OAUTH CODES */}
      {showOAuthPopup && (
        <div id="oauth-popup-shadow" className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[60] animate-fadeIn select-none">
          <div className="bg-[#1a1918] border border-[#E2A04F]/60 rounded-xl p-6 max-w-sm w-full shadow-2xl relative text-center">
            
            <div className="w-12 h-12 rounded-full bg-[#E2A04F]/10 border border-[#E2A04F]/30 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6 text-[#E2A04F]" />
            </div>

            <h3 className="font-serif font-black text-white text-base">
              Secure Credentials Handshake
            </h3>
            
            <p className="text-[9px] text-[#E2A04F] uppercase tracking-widest mt-1 font-bold">
              {activeProvider} Gateway Status
            </p>

            <p className="text-xs text-gray-400 my-4 leading-relaxed font-light">
              Afrolineo is initiating a secure passport validation with your <strong className="text-white">{activeProvider}</strong> credentials to unlock your ancestry mapping chamber.
            </p>

            <div className="bg-[#111110] p-3 text-left rounded-sm border border-gray-800/80 mb-5 font-mono text-[9px] text-emerald-400">
              <span className="block text-gray-600 font-sans uppercase tracking-wider text-[7px] mb-1">Vault Authentication Key</span>
              <span className="block">✔ Handshake verified.</span>
              <span className="block">✔ Read authorization accepted.</span>
            </div>

            <div className="flex gap-3">
              <button
                id="oauth-cancel"
                onClick={() => {
                  setShowOAuthPopup(false);
                  setActiveProvider(null);
                }}
                className="flex-1 py-2 px-3 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white rounded-sm text-[9px] font-sans font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel Loop
              </button>
              
              <button
                id="oauth-confirm"
                onClick={confirmOAuthLogin}
                className="flex-1 py-2 px-3 bg-[#E2A04F] hover:bg-[#E2A04F]/90 text-black rounded-sm text-[9px] font-sans font-bold uppercase tracking-wider cursor-pointer"
              >
                Accept & Verify
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
                  <p className="text-[10px] text-gray-400 font-sans tracking-normal leading-normal">
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
                  <p className="text-[11px] text-gray-500 leading-relaxed font-serif italic">
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
                            <span className="text-[10px] text-gray-500 block mt-0.5">{item.desc}</span>
                          </div>
                          <span className="text-[8px] uppercase font-mono bg-amber-50 text-amber-800 px-1 py-0.5 rounded border border-amber-100 group-hover:bg-[#E2A04F] group-hover:text-black shrink-0">
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
                  <p className="text-[11px] text-gray-500 leading-relaxed font-serif italic">
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
                            <span className="text-[10px] text-gray-500 block mt-0.5">{item.desc}</span>
                          </div>
                          <span className="text-[8px] uppercase font-mono bg-amber-50 text-amber-800 px-1 py-0.5 rounded border border-amber-100 group-hover:bg-[#E2A04F] group-hover:text-black shrink-0">
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
                  <p className="text-[11px] text-gray-500 leading-relaxed font-serif italic">
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
                        <span className="text-[8px] uppercase font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.badge}</span>
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
                <span className="text-[8px] uppercase tracking-[0.25em] text-[#E2A04F] font-black block font-sans">
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
                <span className="text-[8.5px] uppercase font-sans tracking-[0.18em] text-gray-500 font-bold block mb-2 px-1">
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
                      <span className="text-[10px] uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">DEI Pledge</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase">Bridging the Ancestral Data Desert</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      Historically, the tools of digital archiving, database schemas, and genealogical charting have been built around Western family structures (e.g. strict monogamy, written church and town hall registries). African lineages, indigenous oral traditions, and localized compound-level geographies have suffered systemic technological exclusion.
                    </p>

                    <blockquote className="border-l-4 border-[#E2A04F] pl-4 italic text-gray-600 my-4 text-xs font-serif leading-relaxed">
                      "In many parts of Africa, a family tree is not drawn on a paper kept in a vault—it is recited in song during village festivals, or told under the shade of a sacred baobab."
                      <cite className="block text-[9px] font-mono uppercase font-bold text-gray-500 mt-1.5 not-italic">— Mazi Chinedu, Igbo Historical Elder</cite>
                    </blockquote>

                    <h5 className="font-sans font-bold text-[#2D2926] uppercase text-[10px] tracking-wider pt-1">Strategic Inclusion Imperatives:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[#FAF8F5] p-3 border border-gray-150 rounded">
                        <strong className="block text-gray-800 text-[10px] font-bold">🌍 Epistemic Equity</strong>
                        <p className="text-[10px] text-gray-600 leading-relaxed mt-1">Elevating verbal testimonies to the exact same database validity as written files.</p>
                      </div>
                      <div className="bg-[#FAF8F5] p-3 border border-gray-150 rounded">
                        <strong className="block text-gray-800 text-[10px] font-bold">🔊 Acoustic Justice</strong>
                        <p className="text-[10px] text-gray-600 leading-relaxed mt-1">Refining voice encoders to respect the deep pitch and accents of native dialects.</p>
                      </div>
                      <div className="bg-[#FAF8F5] p-3 border border-gray-150 rounded">
                        <strong className="block text-gray-800 text-[10px] font-bold">🗺️ Ancestral Geometry</strong>
                        <p className="text-[10px] text-gray-600 leading-relaxed mt-1">Replacing coordinates with traditional compounds and tribal village borders.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CAREERS */}
                {activeAboutTabLanding === 'careers' && (
                  <div className="space-y-4 animate-scaleIn text-xs">
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-[10px] uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Work With Us</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase font-sans">Build the Tools of Spoken Memory</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      Afrolineo is expanding its decentralized engineering and anthropological operations. We seek individuals passionate about restoring ancestral connections through offline-first software systems.
                    </p>

                    <div className="space-y-3 pt-1">
                      <h5 className="text-[9px] uppercase tracking-widest font-black text-gray-400 font-sans">Active Positions (2026)</h5>
                      {[
                        { title: 'Senior Heritage Ontologist', dept: 'Genealogical Systems', loc: 'Lagos, Nigeria' },
                        { title: 'Speech Signal & DSP Engineer', dept: 'Acoustic Division', loc: 'Accra, Ghana' },
                        { title: 'Diaspora Outreach & Community Lead', dept: 'Engagement', loc: 'London or Nairobi' }
                      ].map((job, idx) => (
                        <div key={idx} className="border border-gray-150 rounded p-3 bg-[#FAF8F5] flex justify-between items-center">
                          <div>
                            <strong className="font-sans font-bold text-gray-800 block text-xs">{job.title}</strong>
                            <span className="text-[9px] text-gray-500 font-mono block mt-0.5">{job.dept} • {job.loc}</span>
                          </div>
                          <button 
                            onClick={() => {
                              alert("Application submitted! Thank you for backing Afrolineo's sovereign mission.");
                            }}
                            className="px-3 py-1 bg-[#2D2926] hover:bg-[#E2A04F] hover:text-black text-white text-[9px] uppercase tracking-wider font-bold rounded-xs transition-colors shrink-0"
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
                      <span className="text-[10px] uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">News & Dispatches</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase">Afrolineo Pressroom</h4>
                    </div>

                    <div className="space-y-3">
                      {[
                        { date: 'June 18, 2026', title: 'Afrolineo Launches V3 Autonomous Offline Archive Enclaves', summary: 'New standards for browser sandboxing allow pedigree chains to survive indefinitely without database server synchronization.' },
                        { date: 'May 04, 2026', title: 'Yoruba and Igbo Oral Accents Voice Synthesis Calibrator Completed', summary: 'Successfully completed calibration of the pre-colonial ward vocabulary to automatically suggest historical compounds.' }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 border border-gray-150 rounded bg-[#FAF8F5] space-y-1">
                          <span className="text-[9px] text-[#E2A04F] font-mono block">{item.date}</span>
                          <strong className="font-sans font-bold text-gray-800 block text-xs">{item.title}</strong>
                          <p className="text-gray-600 text-[11px] leading-relaxed mt-0.5">{item.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. SECURITY */}
                {activeAboutTabLanding === 'security' && (
                  <div className="space-y-4 animate-scaleIn text-xs">
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-[10px] uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Vault Protection</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase">Zero-Knowledge Secure Handshakes</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      Unlike commercial heritage portals, Afrolineo does not host database profiles on global public clouds. Your pedigree data is cryptographically protected:
                    </p>

                    <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded space-y-2">
                      <strong className="block text-xs font-bold">✔ Browser-Hardened Sandboxing</strong>
                      <p className="text-[11px] leading-relaxed">Lineage structures are written straight to standard IndexedDB inside your device. No cloud storage is provisioned without explicit local exports, keeping tracking vectors at exactly zero.</p>
                    </div>
                  </div>
                )}

                {/* 5. PRIVACY */}
                {activeAboutTabLanding === 'privacy' && (
                  <div className="space-y-4 animate-scaleIn text-xs">
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-[10px] uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Sovereign Data Rights</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase font-sans">Privacy Enclave Declaration</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      We operate on a zero-tracking framework. You are the sole custodian of your heritage. Your files are not indexed, scanned, or used to train commercial AI speech generators.
                    </p>
                    <p className="text-gray-500 font-mono text-[10px]">
                      Latest Revision: June 2026 • Local Sandbox Compliant
                    </p>
                  </div>
                )}

                {/* 6. GUIDELINES */}
                {activeAboutTabLanding === 'guidelines' && (
                  <div className="space-y-4 animate-scaleIn text-xs">
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-[10px] uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Custodian Rules</span>
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
                      <span className="text-[10px] uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Legal Autonomy</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase">Sovereign Ancestral Memory Pact</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      Unlike generic ancestry corporations that claim global rights to reproduce, process, or sell your family’s DNA sequences and genealogical trees, Afrolineo operates on a **strictly decentralized, zero-tracking, client-controlled framework**.
                    </p>

                    <div className="bg-[#FAF8F5] p-4 border border-gray-150 rounded space-y-2.5">
                      <h5 className="font-sans font-bold text-gray-800 text-[10.5px] uppercase tracking-wide">Standard Rules of Ownership:</h5>
                      <div className="space-y-2 text-[10.5px] text-gray-600">
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
                      <p className="text-[10px] text-gray-500 leading-normal">
                        By checking this box, you formally pledge to map lineages with accuracy, seek consent from elders, and keep these records as a sacred family inheritance.
                      </p>

                      {!pactSignedLanding ? (
                        <button
                          type="button"
                          onClick={() => setPactSignedLanding(true)}
                          className="w-full sm:w-auto px-4 py-2 bg-[#2D2926] hover:bg-[#E2A04F] text-[#F9F7F2] hover:text-[#2D2926] text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                        >
                          Sign & Affirm Pact
                        </button>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3 rounded flex items-center justify-between text-[11px] font-bold animate-scaleIn">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> Pact Signed & Sealed on Your Browser
                          </span>
                          <button
                            type="button"
                            onClick={() => setPactSignedLanding(false)}
                            className="text-[9px] text-[#2D2926] hover:underline font-mono uppercase"
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
                      <span className="text-[10px] uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Cultural Mission</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase">Reversing the Digital Erasure of Oral Lineages</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      Across sub-Saharan Africa, thousands of complex family histories exist only in the minds of aging oral custodians. Every time an elder passes, a library of immense geographical and tribal context is lost forever. Afrolineo works to democratize high-fidelity oral recording tools.
                    </p>

                    {/* Stats strip */}
                    <div className="grid grid-cols-3 gap-2.5 py-1 text-center">
                      <div className="bg-[#FAF8F5] border border-gray-150 p-2.5 rounded">
                        <strong className="block text-[#E2A04F] text-sm font-sans font-black">14,200+</strong>
                        <span className="text-[9px] text-gray-500 font-mono">Elder Logs Saved</span>
                      </div>
                      <div className="bg-[#FAF8F5] border border-gray-150 p-2.5 rounded">
                        <strong className="block text-[#E2A04F] text-sm font-sans font-black">350+</strong>
                        <span className="text-[9px] text-gray-500 font-mono">Compounds Mapped</span>
                      </div>
                      <div className="bg-[#FAF8F5] border border-gray-150 p-2.5 rounded">
                        <strong className="block text-[#E2A04F] text-sm font-sans font-black">1.2M+</strong>
                        <span className="text-[9px] text-gray-500 font-mono font-sans">Words Transcribed</span>
                      </div>
                    </div>

                    {/* Interactive Sponsor Form */}
                    <div className="border border-gray-200 p-4 rounded bg-white space-y-3">
                      <h5 className="font-sans font-bold text-gray-800 text-xs uppercase tracking-wide">Sponsor a Village Elder Compound</h5>
                      <p className="text-[10px] text-gray-500 leading-relaxed">
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
                            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                          >
                            Submit Nomination Request
                          </button>
                        </form>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded text-center space-y-2 animate-scaleIn">
                          <p className="font-bold text-xs flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> Nomination Staged Successfully!
                          </p>
                          <p className="text-[10.5px] text-emerald-700 leading-relaxed">
                            Thank you! Your nomination for <strong>{sponsorshipCompoundLanding}</strong> located in <strong>{sponsorshipLGALanding}</strong> has been logged in your client buffer and staged for review by our regional field coordinators.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSponsorshipSubmittedLanding(false);
                              setSponsorshipCompoundLanding('');
                              setSponsorshipLGALanding('');
                            }}
                            className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-mono text-[9px] uppercase font-bold rounded"
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
                      <span className="text-[10px] uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Local Outreach</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase">Afrolineo in Your Community</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      We believe that family history should be built together. We organize regular physical Workshops, Compound Gatherings, and Tribal Townhalls across West African cities and diaspora circles (London, Houston, Nairobi, Atlanta).
                    </p>

                    <div className="space-y-3 pt-1">
                      <div className="border border-gray-150 p-3 rounded bg-[#FAF8F5]">
                        <strong className="block text-gray-800 text-xs">🏡 Community Archivist Toolkits</strong>
                        <p className="text-gray-600 text-[11px] leading-relaxed mt-1">
                          We provide physical recording booklets, high-sensitivity microphone adapters, and offline lineage maps for family compound unions.
                        </p>
                      </div>

                      <div className="border border-gray-150 p-3 rounded bg-[#FAF8F5]">
                        <strong className="block text-gray-800 text-xs">🤝 Tribal Townhall & Dialect Gatherings</strong>
                        <p className="text-gray-600 text-[11px] leading-relaxed mt-1">
                          We partner with local cultural unions (e.g. Egbe Omo Oduduwa, Igbo Progressive Association) to host lineage validation workshops.
                        </p>
                      </div>
                    </div>

                    {/* Interactive Workshop Booker */}
                    <div className="border border-amber-200 bg-amber-50/20 p-4 rounded space-y-3">
                      <h5 className="font-sans font-bold text-gray-800 text-xs uppercase tracking-wide">Request a Local Workshop Prep Kit</h5>
                      <p className="text-[10px] text-gray-500 leading-relaxed">
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
                            className="px-4 py-2 bg-[#2D2926] hover:bg-[#E2A04F] text-[#F9F7F2] hover:text-[#2D2926] text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer shrink-0"
                          >
                            Book Workshop Date
                          </button>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded animate-scaleIn space-y-2 text-center sm:text-left">
                          <p className="font-bold text-xs flex items-center justify-center sm:justify-start gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> Workshop Date Registered!
                          </p>
                          <p className="text-[10.5px] text-emerald-700 leading-relaxed">
                            Excellent! We have flagged your family gathering date (<strong>{workshopDateLanding}</strong>). A physical preparation pack containing memory logs and microphone guidelines is queued to be dispatched.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setWorkshopBookedLanding(false);
                              setWorkshopDateLanding('');
                            }}
                            className="text-[9px] text-[#2D2926] hover:underline uppercase font-bold font-mono"
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
                      <span className="text-[10px] uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Assistance Portal</span>
                      <h4 className="font-serif font-black text-base text-[#2D2926] uppercase font-sans">Custodian Help & Support Desk</h4>
                    </div>

                    <p className="text-gray-700 leading-relaxed font-light">
                      Experiencing difficulties capturing voice diaries, exporting JSON database backups, or nesting generational linkages? Browse our offline guides or submit an inquiry ticket.
                    </p>

                    {/* Interactive FAQ accordions */}
                    <div className="space-y-2">
                      <h5 className="font-sans font-bold text-gray-800 text-[10px] uppercase tracking-wider">Frequently Answered Protocols:</h5>
                      
                      {[
                        { q: 'Will my files vanish if I clear my browser cookies?', a: 'Yes. Since Afrolineo operates in a zero-knowledge local sandbox, clearing your browser\'s cache/history will wipe local database memory. ALWAYS download a sovereign backup (.afrolineo archive) after completing updates.' },
                        { q: 'How do I combine family tree segments with my cousins?', a: 'Open the Active Sitemap and launch the "Sovereign Offline Backup" panel. Export your tree as JSON, send it to your cousin, and they can run the import utility to merge matching compound directories.' },
                        { q: 'Do you offer offline recording support for villages?', a: 'Yes! Our community teams distribute physical audio dictation machines and mesh WiFi local hub units to elder squares with low internet connectivity.' }
                      ].map((faq, idx) => (
                        <div key={idx} className="border border-gray-150 rounded">
                          <button
                            type="button"
                            onClick={() => setFaqOpenLanding(faqOpenLanding === idx ? null : idx)}
                            className="w-full text-left p-2.5 bg-[#FAF8F5] hover:bg-gray-50 flex justify-between items-center text-[10.5px] font-bold text-gray-800 cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${faqOpenLanding === idx ? 'rotate-180' : ''}`} />
                          </button>
                          {faqOpenLanding === idx && (
                            <div className="p-3 bg-white text-[10.5px] text-gray-600 border-t border-gray-100 leading-relaxed animate-slideDown font-serif">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Support ticket submission form */}
                    <div className="border border-gray-200 p-4 rounded bg-white space-y-3 mt-1">
                      <h5 className="font-sans font-bold text-gray-800 text-xs uppercase tracking-wide">Log a Support & Diagnostic Ticket</h5>
                      <p className="text-[10px] text-gray-500 leading-relaxed">
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
                            className="px-4 py-2 bg-[#2D2926] hover:bg-[#E2A04F] text-[#F9F7F2] hover:text-[#2D2926] text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                          >
                            Generate Help Desk Ticket
                          </button>
                        </form>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded text-center space-y-2 animate-scaleIn">
                          <p className="font-bold text-xs flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> Support Ticket Generated!
                          </p>
                          <p className="text-[10.5px] text-emerald-700 leading-relaxed">
                            Your help desk ticket <strong>#AFR-2026-{(Math.floor(Math.random() * 8999) + 1000)}</strong> has been registered in your client browser cookie state. An encrypted diagnostic log has been staged.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSupportSubmittedLanding(false);
                              setSupportMessageLanding('');
                              setSupportEmailLanding('');
                            }}
                            className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-mono text-[9px] uppercase font-bold rounded"
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
                        <span className="text-[10px] uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Knowledge Hub</span>
                        <h4 className="font-serif font-black text-lg text-[#2D2926] uppercase">Oral Genealogy & Preservation Articles</h4>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">Curated by Academic Councils</span>
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
                              className="text-[#E2A04F] hover:underline font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                            >
                              ← Return to Articles Directory
                            </button>
                            <div className="bg-[#FAF8F5] border border-gray-200 p-6 rounded-md space-y-4 text-left">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
                                <span className="bg-[#2D2926] text-white px-2 py-0.5 rounded-[3px] text-[9px] font-bold uppercase tracking-wider">{article.category}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-gray-400 font-mono">{article.date} • {article.readTime}</span>
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
                              <p className="text-[10.5px] text-gray-500 font-serif italic border-l-2 border-[#E2A04F] pl-3 text-left">Written by {article.author}</p>
                              
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
                              className="text-[9px] text-[#2D2926] underline uppercase font-bold hover:text-[#E2A04F]"
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
                                    <span className="text-[9px] uppercase font-mono tracking-widest text-[#E2A04F] font-bold">{art.category}</span>
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
                                  <p className="text-[11px] text-gray-600 leading-relaxed font-light">{art.excerpt}</p>
                                </div>
                                <div className="flex items-center justify-between pt-1 border-t border-gray-200/50">
                                  <span className="text-[10px] text-gray-500 font-mono italic">By {art.author} • {art.readTime}</span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedArticleIdLanding(art.id)}
                                    className="px-3 py-1.5 bg-[#2D2926] hover:bg-[#E2A04F] text-white hover:text-[#2D2926] text-[9px] uppercase font-bold rounded transition-colors cursor-pointer"
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
                        <span className="text-[10px] uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Preservation Shop</span>
                        <h4 className="font-serif font-black text-lg text-[#2D2926] uppercase">Custom Family Heritage Artifacts</h4>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">100% of proceeds fund offline village hardware</span>
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
                              className="text-[#E2A04F] hover:underline font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                            >
                              ← Back to Heritage Shop Catalog
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-left">
                              {/* Left Column: Interactive Design Simulation Mockup */}
                              <div className="border border-gray-250 bg-[#2D2926] text-[#F9F7F2] p-6 rounded-md text-center space-y-4 shadow-inner relative overflow-hidden min-h-[250px] flex flex-col justify-center items-center">
                                {/* Simulated gold borders representing high luxury */}
                                <div className="absolute inset-2 border border-[#E2A04F]/20 pointer-events-none rounded"></div>
                                <div className="absolute inset-3 border border-[#E2A04F]/5 pointer-events-none rounded"></div>
                                
                                <span className="text-[8px] uppercase tracking-[0.25em] text-[#E2A04F] font-black font-sans">
                                  ARCHIVAL DEMO SPECIFICATION
                                </span>

                                {gift.id === 'gift-1' && (
                                  <div className="space-y-3">
                                    <div className="w-12 h-12 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto text-[#2D2926] shadow-md border-2 border-[#E2A04F]">
                                      <Mic className="w-6 h-6 text-[#E2A04F]" />
                                    </div>
                                    <h5 className="font-serif font-bold text-sm tracking-wide text-white">HERITAGE AUDIO CAPSULE</h5>
                                    <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Laser Engraved:</p>
                                    <div className="bg-[#1a1918] py-2 px-4 rounded border border-[#E2A04F]/40 inline-block font-serif font-black text-amber-100 text-xs tracking-wider italic">
                                      "{famName} Archives"
                                    </div>
                                  </div>
                                )}

                                {gift.id === 'gift-2' && (
                                  <div className="space-y-3">
                                    <div className="w-16 h-12 bg-transparent border-2 border-dashed border-[#E2A04F]/40 flex items-center justify-center mx-auto rounded">
                                      <span className="text-[8px] text-gray-400 font-mono">5-Gen Blueprint</span>
                                    </div>
                                    <h5 className="font-serif font-black text-sm text-[#E2A04F] uppercase tracking-wider">{famName} Historical Tree</h5>
                                    <p className="text-[10px] text-gray-300 font-sans leading-relaxed">Archival Canvas Specimen</p>
                                    <div className="bg-[#1a1918]/60 py-1.5 px-3 rounded text-[9px] font-mono text-[#E2A04F]">
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
                                    <p className="text-[9px] text-gray-400 font-serif italic">Embossed in Gold Leaf Leather:</p>
                                    <div className="bg-amber-950 py-1.5 px-3 rounded border border-amber-500/40 font-sans font-bold text-amber-300 text-[10px] uppercase">
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
                                    <p className="text-[9px] text-gray-400 font-mono">STAGED HUB LOCATION:</p>
                                    <div className="bg-emerald-950/80 py-1.5 px-3 rounded border border-emerald-500/40 font-mono font-bold text-emerald-300 text-[9px] uppercase">
                                      {famName} • {regName.toUpperCase()}
                                    </div>
                                  </div>
                                )}

                                <div className="text-[9px] font-mono text-gray-500 pt-2">
                                  Interactive Design Preview
                                </div>
                              </div>

                              {/* Right Column: Customizer inputs */}
                              <div className="space-y-4 border border-gray-200 p-5 rounded-md bg-white">
                                <span className="bg-amber-100 text-[#2D2926] px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider">{gift.badge} Customizer</span>
                                <h3 className="font-serif font-black text-base text-[#2D2926]">{gift.name}</h3>
                                <p className="text-[11px] text-gray-500 leading-relaxed font-light">{gift.description}</p>
                                <span className="block text-[#E2A04F] text-base font-sans font-black">${gift.price.toFixed(2)}</span>

                                <div className="space-y-3 pt-2">
                                  <div>
                                    <label className="block text-[10px] uppercase font-sans font-bold text-gray-600 mb-1">
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
                                      <label className="block text-[10px] uppercase font-sans font-bold text-gray-600 mb-1">
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
                                    className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-[10px] font-sans font-bold uppercase tracking-wider rounded transition-colors cursor-pointer text-center"
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
                                    className="px-4 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer"
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
                                <span className="absolute top-3 left-3 bg-[#2D2926] text-white px-2 py-0.5 rounded-[3px] text-[8.5px] font-bold uppercase tracking-wider">
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
                                  <p className="text-[10.5px] text-gray-500 leading-relaxed font-light">{gift.description}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedGiftIdLanding(gift.id);
                                    setCustomFamilyNameLanding('');
                                    setCustomRegionLanding('');
                                  }}
                                  className="w-full py-2 bg-[#FAF8F5] hover:bg-[#2D2926] hover:text-white border border-[#2D2926]/30 text-[#2D2926] text-[10px] font-sans font-bold uppercase tracking-wider rounded transition-all cursor-pointer"
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
                            <p className="text-[10px] text-gray-500">
                              These customized items are prepared in your temporary client session buffer. To place a real order or apply village sponsorship credit vouchers, proceed to the secure gateway setup.
                            </p>
                            <div className="space-y-2.5">
                              {stagedGiftsLanding.map((item) => (
                                <div key={item.id} className="bg-white border border-gray-150 p-3 rounded flex items-center justify-between text-xs font-sans">
                                  <div>
                                    <p className="font-bold text-gray-800">{item.originalName}</p>
                                    <p className="text-[10px] text-[#E2A04F] font-serif italic">Custom Title: "{item.customName}" {item.customRegion ? `• Region: ${item.customRegion}` : ''}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <strong className="text-gray-800 font-black">${item.price.toFixed(2)}</strong>
                                    <button
                                      type="button"
                                      onClick={() => setStagedGiftsLanding(stagedGiftsLanding.filter(g => g.id !== item.id))}
                                      className="text-red-600 hover:underline text-[9px] uppercase font-mono"
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
                        <span className="text-[10px] uppercase tracking-wider text-[#E2A04F] font-bold block mb-1">Impact Testimonials</span>
                        <h4 className="font-serif font-black text-lg text-[#2D2926] uppercase">Custodian Success Chronicles</h4>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">Real Diaspora Breakthroughs</span>
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
                            className={`px-3 py-1.5 rounded text-[9.5px] uppercase font-bold transition-all cursor-pointer ${
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
                                    <span className="text-[9px] uppercase font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">{story.ethnic} ({story.region})</span>
                                    <h5 className="font-serif font-black text-sm text-[#2D2926] mt-1">{story.name}</h5>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-[#E2A04F]">{story.yearsTrace}</span>
                                </div>

                                <p className="text-[11px] text-gray-700 font-serif font-bold italic">"{story.summary}"</p>
                                <p className="text-[11px] text-gray-600 font-light leading-relaxed font-serif whitespace-pre-line">{story.details}</p>

                                <div className="bg-white border border-gray-150 p-3 rounded flex flex-col sm:flex-row items-center justify-between gap-3">
                                  <span className="text-[10.5px] text-gray-500 font-sans">Oral Scribe: <strong>{story.speaker || 'Anonymous'}</strong></span>
                                  
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
                                      className="px-3 py-1.5 bg-[#2D2926] hover:bg-[#E2A04F] hover:text-[#2D2926] text-white text-[9px] uppercase font-bold tracking-wider rounded transition-colors flex items-center gap-1 cursor-pointer font-sans"
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
                        <p className="text-[11px] text-gray-500 leading-relaxed">
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
                            className="px-5 py-2.5 bg-[#2D2926] hover:bg-[#E2A04F] text-[#F9F7F2] hover:text-[#2D2926] text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
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
