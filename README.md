# 🌍 Afrolineo Vault — African Oral Genealogy Mapping & Kinship Springboard

[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React v19](https://img.shields.io/badge/Frontend-React_19-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Build-Vite-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express Backend](https://img.shields.io/badge/Backend-Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini 3.5 Flash](https://img.shields.io/badge/AI_Engine-Gemini_3.5_Flash-e5a04f?style=flat-square&logo=google&logoColor=white)](#-ai-speech-to-text--story-synthesis-pipeline)

Traditional Western genealogy frameworks depend almost entirely on comprehensive written registries, censuses, and public birth certificates. In the African continent and diaspora, these structured databases represent a **"Data Desert."** Heritage, lineage, and legacy are historically sustained instead through **Oral Tradition, Storytelling, and Local Elders**. 

**Afrolineo Vault** reverses this status-quo by placing oral history as the focal, primary record. Individual family branches gain structure not through static dates, but through audio recitations of migrations, clan compounds, and ancestral wisdom.

---

## 📖 Table of Contents

1. [🎯 The Problem Statement](#-the-problem-statement)
2. [✊ The Mission Statement](#-the-mission-statement)
3. [✨ Interactive Key Features](#-interactive-key-features)
4. [🗺️ Unified System Architecture](#%EF%B8%8F-unified-system-architecture)
5. [📁 Folder Layout & File Tree](#-folder-layout--file-tree)
6. [🛠️ Technical Specifications & Stack](#%EF%B8%8F-technical-specifications--stack)
7. [💾 Relational Data Schema](#-relational-data-schema)
8. [🎙️ Speech-to-Text & Story Synthesis Pipeline](#-speech-to-text--story-synthesis-pipeline)
9. [⚙️ Local Installation & Development Guide](#%EF%B8%8F-local-installation--development-guide)
10. [🛡️ Sovereign Archive & Data Security](#%EF%B8%8F-sovereign-archive--data-security)

---

## 🎯 The Problem Statement

Traditional genealogical platforms and databases are systematically biased toward written historical records—census sheets, parish books, birth certificates, and physical registries. This presents four severe systemic challenges for African and Diaspora lineage preservation:

1. **The "Data Desert" of Written Records**: Due to historical displacement, colonial gaps, and administrative omission, sub-Saharan African and Diaspora ancestral records are frequently absent from Western written historical registries. Traditional genealogy portals return empty queries, leading families to frustrating dead-ends.
2. **Acoustic and Oral Erasure**: African heritage has historically been maintained through **oral tradition, meter, praise-chants (such as Oríkì), and generational storytelling**. Standard genealogical software completely lacks the data structure or visual layout to treat raw vocal recordings as primary, authoritative historical records.
3. **Exploitative Centralization & Privacy Threats**: Commercial ancestry platforms centralize, monetize, and sometimes license sensitive genetic or personal historical archives to third parties. This directly violates **cultural data sovereignty**, deterring indigenous families and custodians from digitizing their legacy.
4. **Dialect and Accent Bias in NLP**: Conventional automated Speech-to-Text (STT) models exhibit severe accuracy drops and hallucination patterns when transcribing non-Western names, indigenous words, historical compounds, and regional dialects (e.g., Yoruba, Serer, Igbo, or Twi).

### 💡 The Solution: Afrolineo Vault
**Afrolineo Vault** reverses this paradigm by making oral testimony the focal, primary structural unit of genealogy. It provides an elegant, client-side sandboxed pedigree mapping canvas, a localized administrative classification system (compounds, wards, LGAs, and dialects), and a specialized translation pipeline using multimodal models optimized for cultural accuracy. This guarantees family records are permanently preserved, searchable, and fully owned by the family.

---

## ✊ The Mission Statement

At the heart of **Afrolineo Vault** is a commitment to cultural recovery and technological decolonization. 

> **Our Mission is to empower African and Diaspora families to reclaim, reconstruct, and permanently preserve their lineages by providing decentralized, high-integrity technology that honors oral history as primary, authoritative historical truth.**

### 🕊️ Guided Principles of our Mission:
- **Oral-First Legitimacy**: We believe that vocal tone, praise-chants, and ancestral recitations carry deeper historical context than two-dimensional paper records. Audio is not a supplementary attachment; it is our foundation.
- **Data Sovereignty by Design**: We reject the centralization and corporate monetization of ancestral memory. Your family's archive is built to reside securely in local sandboxes and offline community nodes under your absolute control.
- **Bridging the Great Divide**: We serve as a digital springboard connecting Diaspora searchers with sub-Saharan continental roots. By cataloging physical landmarks, local compounds, and regional dialects, we close the gaps left by physical displacement.
- **Linguistic and Cultural De-biasing**: We build localized AI translation and audio transcription pipelines that actively honor ethnic dialects and ancestral accents, giving oral histories the accurate representations they deserve.

---

## ✨ Interactive Key Features

*   **Pedigree Node Mapping (Up to 3-Generations)**  
    An elegant, fluid horizontal visual tree illustrating direct lineage vectors and 1st-degree lateral lineages (siblings, maternal/paternal uncles, and aunts) without polluting the responsive layout.
    
*   **Collapsible Premium Left Sidebar**  
    A sleek, dark charcoal navigation bar that adapts dynamically across desktop and mobile. Built with smooth structural transition animations and state persistent survive logic via `localStorage`.

*   **Kinship Community Springboard**  
    A cooperative network enabling users to link their local profiles as close or distant relatives. Our engine dynamically scans and flags **Lineage Intersection Points** (shared compounds or identical local government districts/LGAs) to link distinct family lines collectively.

*   **Recording Studio & Relatives Audio Uploader**  
    Capture oral memories on the spot using standard microphone access, or use the high-fidelity **File Upload** area. Supports dragging and dropping or browsing external audio files (MP3, WAV, M4A, WEBM, OGG under 25MB) received from relatives worldwide.

*   **Custom Ancestral Geographical Drill-downs**  
    Ditch standard Western county inputs. Log ancestral branches using authentic administrative metrics: **Family Compound House**, **Ward**, **LGA / Local District**, **Mother Tongue**, and **Pre-Colonial Ethnic Group / Dialect Dropdown**.

*   **Discovery Vault Review Hub**  
    A central global library aggregating collective records, language groupings, audio timelines, and transcript summaries generated via machine learning.

*   **Sovereign Backup & Restore (.afrolineo JSON)**  
    A simple, one-click export and import tool allowing users to download their entire custom tree, profile details, and voice recordings as a secure, local-first archive.

---

## 🗺️ Unified System Architecture

Built on a **Modular Monolith** using full-stack **Express + React (Vite)** architecture to balance clean context division with high-perf and cold-start speed behind an Nginx reverse proxy.

```
                  ┌────────────────────────────────────────────────────────┐
                  │                      Client Web (SPA)                  │
                  │  ┌──────────────────┐  ┌────────────────────────────┐  │
                  │  │   Interactive    │  │   Recording Studio / UI    │  │
                  │  │   Lineage Tree   │  │   (Drag & Drop File Upload)│  │
                  │  └────────┬─────────┘  └─────────────┬──────────────┘  │
                  │           │                          │                 │
                  └───────────┼──────────────────────────┼─────────────────┘
                              │ API Requests             │ Audio Payload
                              ▼ (JSON)                   ▼ (Base64 WebM/WAV)
                  ┌───────────┴──────────────────────────┴─────────────────┐
                  │                    Express API Server                  │
                  │  ┌──────────────────┐  ┌────────────────────────────┐  │
                  │  │ Profile & Story  │  │   Gemini Transcriber       │  │
                  │  │  Controllers     │  │   & Narrative Analyzer     │  │
                  │  └──────────────────┘  └─────────────┬──────────────┘  │
                  └──────────────────────────────────────┼─────────────────┘
                                                         │ Secure SDK Call
                                                         ▼ (GEMINI_API_KEY)
                                                   ┌───────────┐
                                                   │ Google    │
                                                   │ Gemini AI │
                                                   └───────────┘
```

---

## 📁 Folder Layout & File Tree

The codebase splits into clean, modular components conforming to Vite structures:

```text
├── server.ts               # Express Backend API, serving static SPA in production
├── package.json            # Scripts compiler and production dependency configs
├── vite.config.ts          # Front-end bundler & Proxy routes setup for development
├── index.html              # Core application frame
├── src/
│   ├── main.tsx            # Vite root mounting gate
│   ├── index.css           # Global typography definitions (Space Grotesk + Inter)
│   ├── App.tsx             # State Coordinator, Local-Storage managers & App Layout
│   ├── types.ts            # Central Unified Model definitions, Interfaces and Enums
│   └── components/
│       ├── FamilyTree.tsx         # Render block for the pedigree node connections
│       ├── OriginsProfileForm.tsx # Modal form for ancestral and LGA geographical parameters
│       ├── RecordingStudio.tsx    # Live audio recorder & Drag-and-drop external audio uploader
│       ├── DiscoveryHub.tsx       # Transcripts dictionary, recordings timeline and global player
│       ├── CommunityVault.tsx     # Kinship Springboard for linking community relatives
│       └── UserLoginGate.tsx      # Secure credential validator and ethnic group picker
```

---

## 🛠️ Technical Specifications & Stack

*   **Frontend UI:** React v19, TypeScript
*   **Styling & Themes:** Tailwind CSS utilities paired with elegant Earthy visual elements.
*   **Micro-Animations:** Fluid state motion transitions sourced via `motion/react`.
*   **Media Controllers:** HTML5 Media Capture core + web audio interface pipelines.
*   **AI Transcription Engine:** Google GenAI `@google/genai` on server-side using **`gemini-3.5-flash`** for highly accurate vocal-to-text outputs tuned to non-Western dialects.

---

## 💾 Relational Data Schema

Relational models are mapped out clean to ensure smooth future synchronization with PostgreSQL, Cloud SQL, or Neon DB.

### 👥 Profiles Table
Stores ancestral credentials and cultural geographical indicators.

| Column | Type | Explanation |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique identification key |
| `fullName` | `VARCHAR` | Full biological or ancestral name |
| `gender` | `VARCHAR` | Gender selection |
| `role` | `ENUM` | Roles: `self`, `father`, `mother`, `grandfather`, `grandmother`, `sibling`, `maternal_uncle`, `paternal_uncle`, `maternal_aunt`, `paternal_aunt` |
| `birthYear` | `INTEGER` | Birth approximation year |
| `birthPlace` | `VARCHAR` | Town, city, or birth region |
| `paternalLineId` | `UUID` (FK) | Parent profile self reference |
| `maternalLineId` | `UUID` (FK) | Parent profile self reference |
| `familyCompound` | `VARCHAR` | Deep historical ancestral compound name |
| `lga` | `VARCHAR` | Local Government Area / administrative district |
| `language` | `VARCHAR` | Native mother dialect |
| `familySize` | `INTEGER` | Estimated size of the specific lineage branch |
| `notes` | `TEXT` | Summary notes or memories |

### 🎙️ Recordings (Oral Stories) Table
Links rich voice logs directly to node profiles.

| Column | Type | Explanation |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique record key |
| `profileId` | `UUID` (FK) | Lineage node pointing to `Profiles.id` |
| `title` | `VARCHAR` | Story segment moniker |
| `audioBase64` | `TEXT` | Base64 encoded audio string |
| `durationSec` | `INTEGER` | Duration computed in seconds |
| `recordedAt` | `DATETIME` | Audit timestamp |
| `transcript` | `TEXT` | Context-sensitive transcription |
| `summary` | `TEXT` | Topic extractions, proverbs, and tags parsed via AI |

### 🔗 Linked Relatives Table
Tracks shared community relatives linked through kinship declarations.

| Column | Type | Explanation |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique connection key |
| `myProfileId` | `UUID` (FK) | Local node within user's tree |
| `relativeName` | `VARCHAR` | Commenced relative's name |
| `relativeCompound` | `VARCHAR` | Co-shared ancestry compound |
| `relativeLga` | `VARCHAR` | Local Government Area of relative |
| `clanshipType` | `VARCHAR` | Depth marker: `'close'` or `'distant'` relatives |
| `notes` | `TEXT` | Custom clanship details |
| `linkedAt` | `VARCHAR` | Declaration date |

---

## 🎙️ Speech-to-Text & Story Synthesis Pipeline

Traditional speech recognition models drop accuracy drastically when dealing with native West, East, or Southern African dialects, surnames, and accents.

Afrolineo Vault bypasses this constraint by leveraging the multimodal capabilities of `gemini-3.5-flash`:
1.  Audio is acquired via standard mics or uploaded via drag-and-drop.
2.  Backend transforms data into standard Base64 payloads.
3.  The request mounts a specialized translation prompt instructing Gemini to transcribe with high ethnic grammar attention—mapping words from Yoruba, Igbo, Twi, Zulu, Hausa seamlessly while extracting cultural themes, moral proverbs, and custom tags.

---

## ⚙️ Local Installation & Development Guide

Follow these simple steps to run Afrolineo Vault on your local workspace:

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed on your workstation.

### 2. Install Project Dependencies
Run npm install in the project's root folder:
```bash
npm install
```

### 3. Setup Environment variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Provide your API keys accordingly:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Boot Dev Server
Runs both front-end Vite and back-end Express concurrently using `tsx`:
```bash
npm run dev
```
Open your web browser and navigate to `http://localhost:3000`.

### 5. Production Build & Execution
Build the fully optimized production bundles:
```bash
npm run build
npm start
```

---

## 🛡️ Sovereign Archive & Data Security

Data Sovereignty is central to African genealogy research. Consequently, Afrolineo does not lock or monetize your ancestral information:
*   **Browser Isolation:** All critical states are persisted completely offline inside sandbox `localStorage`.
*   **On-Demand Export:** Users can pack their entire oral library and genealogy chart into a `.afrolineo` metadata JSON file instantly - keeping precious records safely backed up onto private physical hard drives.

---
*Built with ❤️ for the preservation of Sovereign African Legacies.*

---

## Admin console

A password-protected dashboard at **`/admin`** shows how people use Afrolineo: growth, activation funnel, weekly retention, feature usage, audience, and a searchable user list with each person's activity and tree outline.

**Setup**
1. Set `ADMIN_PASSWORD` on the server (see `.env.example`). The console stays disabled while it is unset.
2. Optionally set `ANALYTICS_DIR` to a folder on a persistent disk. The default is `./data`, which hosts like Cloud Run wipe on every redeploy.
3. Restart the server and open `/admin`.

**What is collected** (see `server/analytics.ts`): account details (name, email, sign-in method, onboarding answers), activity events (sign-ins, screens, people added, stories recorded and their length, playback, links, exports), and an outline of each tree (names, relationships, living status). Recordings, transcripts and notes are never sent.
