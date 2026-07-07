# 🌿 Afrolineo Vault — UI/UX Design System & Architectural Blueprint

Welcome to the internal visual standard and engineering blueprint for **Afrolineo Vault (Sovereign African Oral Genealogy Mapping)**. 

Unlike Western lineage trackers that feel clinical, transactional, and rely heavily on black-and-white government registries, Afrolineo Vault is styled as an **immersive, living, earthy virtual capsule**. It represents oral archives through balanced typography, tactile layouts, warm tones, and cooperative kinship mapping channels.

---

## 🎨 1. Core Visual Grammar & Design Philosophy

### The "Sovereign Hearth" Palette
The color scheme is designed to feel warm, organic, and grounded, moving away from standard technical blues or deep grays.

*   **Dark Slate Core (`#1a1918`):** Applied exclusively on margins, headers, and the collapsible sidebar to ground the page in focus.
*   **Warm Off-white (`#FCFBFA` / `#FAF8F5`):** Used as the primary background page canvas to ensure comfortable reading without high-contrast strain.
*   **Gold Ochre (`#E2A04F` / hover: `#d0903f`):** Used to draw focus to core interactive elements like active node links, primary buttons, and alerts.
*   **Crimson (`#9B2C2C`):** Used on absolute recording utilities to signify live mics.

### Elegant Typography System
Rather than generic fonts, Afrolineo utilizes standard modern pairings configured dynamically in Tailwind CSS:

*   **Display / Titles:** **Space Grotesk** — pairing a technical, clean feeling with unique glyph characters designed for tracking prominence.
*   **Interface Elements:** **Inter** — selected for its high readability on buttons, badges, selectors, inputs, and small text.
*   **Oral Stories & Notes:** **System Serif (Georgia/Poly / Cambria)** — Used on transcripts, notes, and quotes to evoke an editorial, historic book aesthetic.

---

## 📂 2. Structured Component Hierarchy

The front-end state flows down from a central coordinate manager inside `App.tsx` through specific child directories:

```
                   ┌──────────────────────────────────────┐
                   │               App.tsx                │
                   │ (State Coordinator & Sovereign-Store)│
                   └──────────────────┬───────────────────┘
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│  FamilyTree.tsx  │        │ CommunityVault   │        │ RecordingStudio  │
│ (Pedigree Nodes) │        │ (Kinship Bridge) │        │ (Mic & Uploader) │
└────────┬─────────┘        └──────────────────┘        └──────────────────┘
         │
         ▼
┌──────────────────┐
│OriginsProfileForm│
│(Compound & LGA)  │
└──────────────────┘
```

---

## 🎙️ 3. Audio Handshake & Sovereign Uploader

The audio recording engine supports two modes of interaction to capture ancestral stories:

### A. Live Microphone Recording
Uses the browser's `MediaRecorder` API to pipe raw WebM/WAV streams into state chunks. Once complete, these are formatted into raw audio blobs.

### B. Drag-and-Drop Relatives Audio Uploader
Provides an upload option for pre-recorded files sent to users by relative elders.
1.  **Validation Check:** Accepts `audio/*` mime-types and standard formats (MP3, WAV, M4A, WEBM, OGG, FLAC) under 25MB.
2.  **Interactive States:** Includes a dynamic drag-and-drop file target area styled with dashed amber borders that animate to indicate active drops.
3.  **Base64 Encoder:** Converts files to standard Base64 chunks using a `FileReader` reader interface, automatically generating proxy playbacks via virtual Object URLs.

---

## 🔗 4. The Kinship Bridge & Overlap Matching

```
       User family Compound                         Community Directory Compound
┌────────────────────────────────┐               ┌────────────────────────────────┐
│   e.g. "Babajide Compound"     │ <───────────> │   e.g. "Babajide Compound"     │
└────────────────────────────────┘  Overlap      └────────────────────────────────┘
                                    Detection
       User Local District (LGA)                    Community Directory LGA
┌────────────────────────────────┐               ┌────────────────────────────────┐
│     e.g. "Lagos Island"        │ <───────────> │     e.g. "Lagos Island"        │
└────────────────────────────────┘  Intersection └────────────────────────────────┘
                                    Alert
```

An intuitive matching algorithm acts as a bridge for user profiles and the cooperative community registry:
*   **Level 1 — Shared Ancestral Compound:** The system identifies exact matches between user compounds and community registers to surface overlapping lineage branches.
*   **Level 2 — Shared LGA District:** If no compound match resides, it flags mutual Local Government Areas to indicate geographic roots.
*   **Link Specification:** Users can establish direct relative alignments to link community nodes, choosing between **Close Kin** and **Distant Kin** with support for custom relational notes.

---

## 💾 5. Sovereign Archives (.afrolineo Draft Schema)

The user's database is fully portable. The backup module formats state models into structured, human-readable JSON payloads:

```json
{
  "version": "1.1.0",
  "exportedAt": "2026-06-19T15:20:00.000Z",
  "currentUser": {
    "name": "Seydou Diallo",
    "email": "seydou@example.com",
    "provider": "Sovereign ID"
  },
  "profiles": [
    {
      "id": "prof-501",
      "fullName": "Baba Diallo",
      "role": "grandfather",
      "gender": "male",
      "birthYear": 1941,
      "paternalLineId": "prof-505",
      "maternalLineId": "prof-506",
      "familyCompound": "Dakar Diallo House",
      "lga": "Dakar Plateau",
      "language": "Wolof"
    }
  ],
  "recordings": [
    {
      "id": "rec-102",
      "profileId": "prof-501",
      "title": "Grandfather's Oral Migration from Saint-Louis",
      "audioBase64": "UklGRuD...rawBase64Stream...",
      "durationSec": 185,
      "recordedAt": "2026-06-19",
      "transcript": "We traveled south past the old trading posts...",
      "summary": "Covers Dakar migration and trade routes."
    }
  ],
  "linkedRelatives": [
    {
      "id": "link-994",
      "myProfileId": "prof-501",
      "relativeName": "Yasmine Diop",
      "relativeCompound": "Griot House of Medina",
      "relativeLga": "Dakar Plateau",
      "clanshipType": "distant",
      "notes": "Verified alignment via Wolof oral Griot archives."
    }
  ]
}
```

---
*Created and maintained as a sovereign standard for collective cultural preservation.*
