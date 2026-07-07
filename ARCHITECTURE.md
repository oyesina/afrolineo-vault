# 🗺️ Afrolineo Vault — Unified Product Architecture

This document provides a comprehensive technical overview of the system architecture, product stack, data flows, and secure pipelines that power **Afrolineo Vault**—the Sovereign African Oral Genealogy Mapping system.

---

## 🏗️ 1. High-Level System Architecture

Afrolineo Vault utilizes a fully unified full-stack architecture. In development, an Express backend seamlessly integrates Vite's Hot Module Replacement (HMR) middleware. In production, the backend serves compiled, highly optimized client assets while managing API endpoints.

```
                   ┌───────────────────────────────────────────────┐
                   │               USER BROWSER / UI               │
                   │  - Interactive Pedigree Mapping Canvas        │
                   │  - MediaRecorder Audio Capture / File Upload   │
                   │  - Local Sandbox Memory Store                 │
                   └──────────────────────┬────────────────────────┘
                                          │
                     JSON Requests /      │  Static Client Assets
                     Base64 Audio Blobs   │  (HTML, CSS, JS)
                                          ▼
   ┌───────────────────────────────────────────────────────────────────────────┐
   │                       EXPRESS RUNTIME (Node.js/CJS)                       │
   │  [Port 3000]                                                              │
   │  - Core Router & Body Parser (25MB payload threshold for base64 audio)   │
   │  - Vite Dev Middleware (Development Mode)                                 │
   │  - Express Static Asset Handler (Production Mode)                         │
   └──────────────────────────────────┬────────────────────────────────────────┘
                                      │
                        Secure API    │  Linguistic Context
                        Payloads      │  & Native Audio Stream
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │            GOOGLE GEMINI API GATEWAY             │
             │  - Model: gemini-3.5-flash                       │
             │  - Native Audio Processing (audio/webm inline)   │
             │  - Dialect / Accent Bias Mitigation & Translation│
             └──────────────────────────────────────────────────┘
```

---

## 🛠️ 2. Comprehensive Product Stack

The application's technology stack is chosen for high runtime performance, rapid local building, structural modularity, and strict type-safety:

### Front-End Canvas & Core
- **Framework:** **React 19.0 (TypeScript)** — Leverages functional components, hook-based state management, and strict module isolation.
- **Styling:** **Tailwind CSS v4.0** — Implements the custom *"Sovereign Hearth"* visual palette using native CSS variables and modern utility tracking.
- **Animations:** **Motion (motion/react)** — Powers state transitions, modal expansions, map updates, and audio wave pulsing.
- **Icons:** **Lucide React** — Standard vector utility iconography.

### Back-End Service Layer
- **Runtime Server:** **Express 4.21** — Lightweight server handling API requests, static file routing, and payload ingestion.
- **AI SDK:** **`@google/genai` (v2.4.0)** — Google's modern, recommended SDK for server-side Gemini integration.
- **Development Tooling:** **`tsx` (TypeScript Execute)** — Starts the TypeScript development server directly without premature build steps.
- **Server Compiler:** **esbuild** — Compiles and bundles TypeScript back-end server code (`server.ts`) into a single, self-contained CommonJS file (`dist/server.cjs`) to guarantee reliable native CJS execution.

---

## 🎙️ 3. The Oral History Translation & Transcription Pipeline

The defining feature of Afrolineo Vault is its ability to treat raw oral recording as a primary genealogical document. It avoids standard Speech-to-Text (STT) models which suffer from heavy dialect and accent bias.

```
 [1. Capture]         [2. Encode]        [3. Transmit]         [4. AI Process]          [5. Return]
┌───────────┐        ┌───────────┐       ┌───────────┐       ┌─────────────────┐       ┌───────────┐
│ Mic Stream│ ──────>│   Base64  │ ─────>│  /api/    │ ─────>│gemini-3.5-flash │ ─────>│ Structured│
│   WebM    │        │ Stringify │       │ transcribe│       │ Native Audio    │       │ Transcript│
└───────────┘        └───────────┘       └───────────┘       └─────────────────┘       └───────────┘
```

### Detailed Pipeline Breakdown:
1. **Audio Capture:** The client captures audio via the browser's native `MediaRecorder` API (stored as standard compressed `audio/webm` blocks) or reads elder-provided historical recordings (MP3, WAV, M4A, etc.) up to **25MB**.
2. **Sovereign Ingestion:** The client-side file reader converts raw binary audio arrays into a base64 encoded stream. This is wrapped in a JSON payload containing contextual metadata:
   - Expected Family Compound Name
   - Geographic Origins (LGA, Ward, Birthplace)
   - Tribal/Mother Tongue Language (e.g., Yoruba, Igbo, Wolof, Twi, Serer)
3. **Secure API Endpoint (`/api/transcribe`):** The Express backend receives the payload. The body parser is configured with `limit: "25mb"` to safely absorb larger oral audio narratives.
4. **Linguistic De-Biasing via Gemini:**
   - The server routes the base64 audio and metadata context straight to `gemini-3.5-flash`.
   - By embedding the cultural context directly in the instructions, the model is guided to accurately transcribe ethnic compound spellings and family lines.
   - If a local dialect or mother tongue is detected, the pipeline automatically translates the narrative to English while retaining the original transcript, extracting 3–5 high-level thematic tags (e.g., *Lineage Pride, Land Inheritance*).
5. **Elegant Fallbacks:** If no `GEMINI_API_KEY` exists in the local environment, the pipeline switches to a graceful local simulation that models historical narratives tailored to the inputted family metadata. This ensures full offline testing and operational stability.

---

## 🔗 4. Kinship Bridge Matchmaking Engine

The **Kinship Bridge** allows users to discover links between their sandboxed pedigree trees and the community registry using a localized, multi-layered matchmaking system.

### Match Level Logic:
- **Level 1 — Compounded Matching:** Compares the active family compound names against registered archives. Exact matches flag potential long-lost kinship alignments.
- **Level 2 — LGA & District Overlaps:** If direct compound registries do not overlap, the system cross-references Local Government Areas (LGAs), historical wards, and dialects to map shared cultural geographies.
- **Intelligent Kinship Synthesis (`/api/suggest-connection`):** Uses Gemini models to analyze the overlapping data matrices and return culturally contextual paragraphs explaining potential regional migrations or historic clan connections.

---

## 💾 5. Sovereign Archives Data Portability

Data sovereignty is guaranteed by avoiding central server storage of family structures. All user-authored information is retained strictly in-memory or exported into a highly standardized **`.afrolineo`** archive document.

### The `.afrolineo` Specimen Structure:
```json
{
  "version": "1.1.0",
  "exportedAt": "2026-07-07T12:00:00.000Z",
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
      "title": "Grandfather's Oral Migration",
      "audioBase64": "UklGRuD...[Raw Base64 Encoded Stream]...",
      "durationSec": 185,
      "recordedAt": "2026-07-07",
      "transcript": "We traveled south past the old trading posts...",
      "summary": "Covers Dakar migration and trade routes."
    }
  ],
  "linkedRelatives": [
    {
      "id": "link-994",
      "myProfileId": "prof-501",
      "relativeName": "Yasmine Diop",
      "clanshipType": "distant",
      "notes": "Verified alignment via Wolof oral Griot archives."
    }
  ]
}
```

---

## ⚙️ 6. Build, Compilation, and Execution Lifecycle

To guarantee full portability in both containerized environments (such as Google Cloud Run) and local machines, the application uses a strict build pipeline:

### 1. The Bundle Phase (`npm run build`)
To prevent ES module relative-import friction inside standard Node.js environments, esbuild compiles and bundles the backend server in a single step:
```bash
vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs
```
- **Vite Build:** Compiles the React SPA, generating highly compressed HTML, CSS, and JS chunks inside `dist/`.
- **Server Bundling:** Bundles the TypeScript `server.ts` into a CommonJS target (`dist/server.cjs`). Native CJS format eliminates ES module path resolution discrepancies.
- **External Dependencies:** `--packages=external` keeps third-party libraries (like Express or Dotenv) outside of the bundled code, relying safely on standard `node_modules` configurations.

### 2. The Execution Commands
- **Local Dev Server:**
  ```bash
  npm run dev
  ```
  Launches `tsx server.ts`. Runs on port `3000` with hot-reloading asset serving.
- **Production Server Startup:**
  ```bash
  npm run start
  ```
  Launches the bundled production build using standard Node: `node dist/server.cjs`.

---

## 🛡️ 7. Sovereign Security & Zero-Trust Architecture

Afrolineo Vault was built from the ground up to respect user sovereignty and prevent technical extraction:
1. **No External Client Analytics:** The application utilizes zero third-party client trackers, tracking pixels, or remote telemetry cookies.
2. **Server-Side API Proxying:** The application handles all Gemini integrations behind the backend server (`server.ts`). Secret keys like `GEMINI_API_KEY` are kept securely server-side and are **never** exposed to client browsers or client-side JavaScript.
3. **Local Encryption & Portability:** Deleting browser sessions instantly flushes local temporary structures. Long-term storage is fully owned by families, residing inside encrypted local `.afrolineo` JSON files that are created and decrypted entirely client-side.
