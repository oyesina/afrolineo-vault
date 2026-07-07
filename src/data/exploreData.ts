export interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  readTime: string;
  date: string;
  excerpt: string;
  tags: string[];
  content: string;
}

export interface HeritageGift {
  id: string;
  name: string;
  price: number;
  rating: string;
  description: string;
  badge: string;
  imageUrl: string;
  customPlaceholder: string;
}

export interface CustodianStory {
  id: string;
  name: string;
  region: string;
  ethnic: string;
  yearsTrace: string;
  summary: string;
  details: string;
  speaker: string;
  audioDuration: string;
}

export const ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'The Breath of the Ancestors: Decolonizing Oral Historiography',
    category: 'Oral Traditions',
    author: 'Dr. Kehinde Adebayo',
    readTime: '6 min read',
    date: 'June 2026',
    excerpt: 'How western genealogical frameworks fail to grasp the multidimensional nature of African oral recitation, and what custodians can do to preserve acoustic history.',
    tags: ['Oral History', 'Theory', 'Academic'],
    content: `For centuries, the academic discipline of genealogy has been anchored on the material preservation of written texts—parish logs, town hall registers, and census sheets. However, sub-Saharan ancestral lineage mapping was traditionally acoustic. The Griots, Babalawos, and family elders did not preserve history on vellum; they stored it in meter, cadence, and breath.\n\nTo decolonize genealogy is to understand that a vocal recitation carries tonal context, localized family cues, and historical nuances that cannot be fully encapsulated in a two-dimensional visual box. In this essay, we outline the primary methodologies of acoustic mapping, including dialect alignment and state-by-state ward calibrations, illustrating why recording high-fidelity audio files directly alongside kinship cards is a critical act of cultural resistance.`
  },
  {
    id: 'art-2',
    title: 'A Custodian Guide: How to Interview Your Living Grandparents',
    category: 'Research Techniques',
    author: 'Funmi Sowande, Lead Field Archivist',
    readTime: '5 min read',
    date: 'May 2026',
    excerpt: 'Step-by-step conversational prompts, microphone placement, and social etiquette guidelines for interviewing family elders before their stories are lost.',
    tags: ['Interviewing', 'Guidelines', 'Practical'],
    content: `Approaching an elder to map their lineage requires deep cultural deference. It is not a standard corporate Q&A session; it is a collaborative ceremony.\n\n1. Begin with humility. Bring a small, traditional token of respect—kola nuts, tea, or a home-cooked meal.\n\n2. Do not ask for dry names first. Ask about sensory recollections: "What did the compound look like during harvest when you were ten?" "What songs were sung when a newborn was brought home?"\n\n3. Set up your phone or recording capsule at a comfortable height. Do not point it aggressively. Let the tape run continuously so you capture the long, rich pauses of recollection.\n\n4. Document the Story Gap. When you notice they skip a branch or look quiet, do not pressure them. Ask gently: "Is there a story behind this name that we should remember?"`
  },
  {
    id: 'art-3',
    title: 'Sovereign Nodes: Why We Reject Centralized Family Clouds',
    category: 'Tech & Privacy',
    author: 'Chika Ndiaye, Chief Technology Custodian',
    readTime: '4 min read',
    date: 'April 2026',
    excerpt: 'Exploring the technical and philosophical reasons behind Afrolineo\'s zero-tracking architecture, and how client-side state preserves family integrity.',
    tags: ['Privacy', 'Sovereignty', 'Architecture'],
    content: `Commercial DNA and genealogical registries are built around a predatory monetization engine: the centralization of ancestral biodata. Once you upload your lineage and DNA markers, they are owned by corporate clouds, who lease or sell them to pharmaceutical and insurance entities.\n\nAfrolineo is engineered on the principle of Sovereignty. Your family’s oral archives and structural mappings are saved strictly in your client-side browser Sandbox (using local IndexedDB state). There is no central database that can be hacked, sold, or index-linked. Your files are your own. This article explains how you can use our "Sovereign Offline Backup" to securely manage, export, and merge family nodes completely independent of external surveillance.`
  },
  {
    id: 'art-4',
    title: 'The Geography of Names: Translating Compound Wards',
    category: 'Historical Records',
    author: 'Prof. Amara Shumba',
    readTime: '7 min read',
    date: 'March 2026',
    excerpt: 'Understanding the physical spatial boundaries of lineage: how traditional compounds, municipal wards, and historical landmarks define African identity.',
    tags: ['Geography', 'Mapping', 'History'],
    content: `In standard genealogy platforms, a birthplace is simply a city or a country. But in the African context, a birth location is nested within three layers of local geography: the Compound (traditional ancestral manor), the Ward (administrative municipal grouping), and the Local Government Area.\n\nWithout these subdivisions, the lineage is rootless. For example, knowing someone was born in "Ogbomoso" is practically useless for tracing their ancestors without knowing the specific Compound (e.g., Alao Compound) and the Municipal Ward. This essay explores how we can map historical African territories and connect names back to their ancestral soil.`
  }
];

export const GIFTS: HeritageGift[] = [
  {
    id: 'gift-1',
    name: 'Voice Dictation Heritage Capsule',
    price: 45.00,
    rating: '5.0',
    description: 'A pocket-sized, high-sensitivity stereophonic voice recorder with native noise reduction, customized with your family compound name. Includes an offline microSD card and memory guide booklets.',
    badge: 'Hardware',
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=400',
    customPlaceholder: 'Oyerinde Compound'
  },
  {
    id: 'gift-2',
    name: 'Museum-Quality 5-Gen Cotton Canvas',
    price: 85.00,
    rating: '4.9',
    description: 'A beautifully structured 5-generation family tree chart printed on 100% archival organic cotton canvas. Hand-pressed with gold leaf lining and tailored to your ancestral state/region.',
    badge: 'Art Print',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400',
    customPlaceholder: 'Oyo State, Nigeria'
  },
  {
    id: 'gift-3',
    name: 'Embossed Leather Custodian Journal',
    price: 32.00,
    rating: '4.8',
    description: 'Genuine full-grain leather bound diary with pre-formatted interview charts, verbal family covenants, and secure document sleeves for ancestral letters and vintage family photographs.',
    badge: 'Scribe Book',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400',
    customPlaceholder: 'Adeyemi Lineage'
  },
  {
    id: 'gift-4',
    name: 'Village Mesh Server Node',
    price: 120.00,
    rating: '5.0',
    description: 'A low-energy localized backup server box. Deploy this node in your family compound to enable up to 50 local mobile devices to link family trees entirely offline with zero web access.',
    badge: 'Sovereign Node',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=400',
    customPlaceholder: 'Ogbomoso Hub Node'
  }
];

export const STORIES: CustodianStory[] = [
  {
    id: 'story-1',
    name: 'The Alao Family Union',
    region: 'Nigeria',
    ethnic: 'Yoruba',
    yearsTrace: '7 Generations',
    summary: 'How the Alao weavers of Ogbomoso reconstructed their family lines back to the late 1800s, matching geographical landmark clues from ancient drum chants.',
    details: 'During our annual compound festival, we sat down with Auntie Ronke and used Afrolineo to log the lineages. We found a gap in our 4th generation. However, using the "Acoustic Mapping" tool, we captured Aunty reciting a traditional praise-song (Oríkì) dedicated to our ancestor, Baba Alao. The song mentioned "The blacksmith of Isale-Lere who migrated after the Oyo wars." This geographical keyword immediately unlocked the node, and we re-connected with our long-lost cousins who still live in Isale-Lere!',
    speaker: 'Adebayo Alao, Family Scribe',
    audioDuration: '1:45'
  },
  {
    id: 'story-2',
    name: 'Transatlantic Reconnection',
    region: 'Diaspora',
    ethnic: 'Bahian-Yoruba',
    yearsTrace: '5 Generations',
    summary: 'A Salvador da Bahia native reconstructs her maternal roots and validates traditional Candomblé dialect chants with Oyo State municipal wards.',
    details: 'Our family has lived in Bahia, Brazil for five generations. We kept three Yoruba phrases alive in our ancestral altar prayers. Using Afrolineo, we mapped our maternal line as far back as oral memory went, and inputted the phonetic dialect keywords into the regional lookup. The system matched our phrases with Omo-Odo and Ward 4 in Oyo State. After nominating our home compound for a server node, we verified historical linkages that are now permanently preserved on our local archives.',
    speaker: 'Maria Sowande, Cultural Artist',
    audioDuration: '2:10'
  },
  {
    id: 'story-3',
    name: 'The Griots of Sine-Saloum',
    region: 'Senegal',
    ethnic: 'Serer',
    yearsTrace: '9 Generations',
    summary: 'Archiving 4 hours of raw genealogy recitations by a legendary village historian, establishing node-by-node verbal verified linkages.',
    details: 'We traveled to our ancestral village in Senegal with an Afrolineo recording capsule. The village Elder Griot, Ousmane Ndiaye, recited the entire royal registry of our clan from memory. We mapped 120 family profiles on the sitemap. Every single link has an attached 2-minute voice tag of the Griot reciting that person\'s deeds. This is the first time our lineage is saved in a decentralized, zero-risk digital archive.',
    speaker: 'Ousmane Ndiaye Jr., Scholar',
    audioDuration: '3:05'
  }
];
