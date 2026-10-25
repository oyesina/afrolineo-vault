import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { mountAnalytics } from "./server/analytics";
import { mountLocale } from "./server/locale";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON body handling with elevated limit for audio uploads
app.use(express.json({ limit: "25mb" }));

// Usage analytics + password-protected admin API (see server/analytics.ts)
mountAnalytics(app);

// Visitor country for choosing a display language (see server/locale.ts)
mountLocale(app);

// Initialize Google Gemini Client securely if key exists
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Secure Server-Side Gemini AI Client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
  }
} else {
  console.warn("GEMINI_API_KEY environment variable is not defined. AI transcription fallbacks activated.");
}

// Global mockup historical African database seed for relative tracing / discovery
const HISTORICAL_DB = [
  {
    id: "hist-1",
    fullName: "Adebayo Olukunle",
    gender: "Male" as const,
    role: "paternal_grandfather" as const,
    birthYear: "1932",
    birthPlace: "Ogbomoso, Oyo State",
    language: "Yoruba",
    lga: "Ogbomoso North",
    ward: "Ward 04",
    familyCompound: "Olukunle House",
    familySizeEstimate: 45,
    notes: "A merchant leader who established agricultural trade roots to coastal villages.",
    isAlive: false,
    avatarColor: "bg-amber-100 text-amber-800",
  },
  {
    id: "hist-2",
    fullName: "Nneka Okeke",
    gender: "Female" as const,
    role: "maternal_grandmother" as const,
    birthYear: "1928",
    birthPlace: "Nnewi",
    language: "Igbo (Central)",
    lga: "Nnewi North",
    ward: "Otolo Ward 1",
    familyCompound: "Okeke Ancestral Compound",
    familySizeEstimate: 80,
    notes: "Oral historian of the clan, remembered for her knowledge of traditional medicine and folk wisdom.",
    isAlive: false,
    avatarColor: "bg-emerald-100 text-emerald-850",
  },
  {
    id: "hist-3",
    fullName: "Nana Kwesi Prempeh",
    gender: "Male" as const,
    role: "grandfather" as const,
    birthYear: "1940",
    birthPlace: "Kumasi, Ashanti Region",
    language: "Twi (Asante)",
    lga: "Kumasi Metro",
    ward: "Manhyia Sub-Metro",
    familyCompound: "Akyerema Compound",
    familySizeEstimate: 60,
    notes: "Traditional linguist at the Chief's palace. Expert in proverb interpretation and drum communication.",
    isAlive: false,
    avatarColor: "bg-rose-100 text-rose-800",
  }
];

// 1. API Endpoint: Transcribe Oral History
// This converts either captured microphone base64 audio, OR acts as an AI oral memoir storyteller.
app.post("/api/transcribe", async (req, res) => {
  const { audioBase64String, metadata, promptQuestion } = req.body;

  if (!ai) {
    // Elegant fallback simulation if no Gemini key was supplied
    return res.json({
      transcript: `[Simulated Transcription of Oral Record regarding the ${metadata?.familyCompound || 'family'} compound]:\n"We traveled many moons ago from the highlands of ${metadata?.birthPlace || 'the old village'}, settled right inside ${metadata?.familyCompound || 'our compound'} inside ${metadata?.lga || 'this LGA'}. My grandfather, who spoke beautiful ${metadata?.language || 'mother tongue'}, taught us to never forget where our compound walls began. We estimate our lineage has grown to encompass over ${metadata?.familySizeEstimate || 50} kin. May this voice guide the children to find their true path back."`,
      summary: "Origins, Migration, Identity, Oral Legacy Symbolism",
      isFallback: true
    });
  }

  try {
    let transcriptText = "";
    
    if (audioBase64String) {
      // User captured real microphone audio! Let's pass it directly to Gemini for Native Audio processing:
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              // Standard web compressed recording format
              mimeType: "audio/webm",
              data: audioBase64String,
            }
          },
          `Context of Speaker:
           Name: ${metadata?.fullName || 'Unknown'}
           Compound: ${metadata?.familyCompound || 'Unknown'}
           LGA/Region: ${metadata?.lga || 'Unknown'}
           Language: ${metadata?.language || 'Unknown'}
           Question Prompt asked of Elder: "${promptQuestion || 'Introduce the generational story'}"

           Please act as a dedicated linguistic archivist specializing in African genealogies and accents.
           1. First, provide a highly accurate, word-for-word transcript of the recording. Correct phonetic spelling of compound names, West/East African place names, and lineages, referencing the speaker context above if those names are spoken.
           2. If they are speaking a local dialect or mother tongue, translate the core message to English and put it below the transcription.
           3. Extract and list key themes / tags from their spoken heritage.`
        ]
      });
      
      transcriptText = response.text || "Could not extract speech text from model response.";
    } else {
      // Cinematic backup generating a simulated beautiful transcription based on elders' inputs!
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Create a highly realistic, evocative, first-person poetic transcript of a grandmother/grandfather reciting oral history.
                   Here is the context of their profile:
                   Elder Full Name: ${metadata?.fullName || 'Chief'}
                   Estimated Birth Year: ${metadata?.birthYear || 'Mid-20th century'}
                   Mother tongue spoken: ${metadata?.language || 'Local Dialect'}
                   Local Government Area: ${metadata?.lga || 'Ancestral LGA'}
                   Ward: ${metadata?.ward || 'Ancestral Ward'}
                   Family Compound Name: ${metadata?.familyCompound || 'Elders Compound'}
                   Estimated Clan Size: ${metadata?.familySizeEstimate || 'numerous'} members
                   Prompt/Question Answered: "${promptQuestion || 'Reflect on early life and compound origin'}"
                   
                   Create the transcript with realistic conversational pauses, traditional proverbs, and mention of their family compound. Make it deeply emotional, beautiful, and authentic to African oral heritage.`
      });
      
      transcriptText = response.text || " Memorable ancestral narrative failed to generate.";
    }

    // Extract tags/summary using secondary lightweight generation
    const tagsResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Given this oral record: "${transcriptText}", return a short comma-separated list of 3-5 main themes, e.g. "Lineage Pride, Pre-War Migration, Proverbial Wisdom, Land Inheritance". Do not return any other text.`
    });

    res.json({
      transcript: transcriptText,
      summary: tagsResponse.text?.trim() || "Oral History, Regional Roots, Compound Legacy",
      isFallback: false
    });

  } catch (error: any) {
    console.error("Gemini processing error:", error);
    res.status(500).json({
      error: "Transcription Pipeline failed",
      details: error?.message || error
    });
  }
});

// 2. API Endpoint: Fetch historical matches / suggest connections
app.post("/api/suggest-connection", async (req, res) => {
  const { profile } = req.body;

  if (!profile) {
    return res.status(400).json({ error: "Profile context is required." });
  }

  // Find exact overlap or close connections mock
  const systemMatches = HISTORICAL_DB.filter(hist => 
    (profile.familyCompound && hist.familyCompound.toLowerCase().includes(profile.familyCompound.toLowerCase())) ||
    (profile.lga && hist.lga.toLowerCase() === profile.lga.toLowerCase()) ||
    (profile.ward && hist.ward.toLowerCase() === profile.ward.toLowerCase()) ||
    (profile.language && hist.language.toLowerCase().includes(profile.language.toLowerCase()))
  );

  if (!ai) {
    // Basic connection analysis
    return res.json({
      matches: systemMatches,
      aiAnalysis: `Based on your Compound (${profile.familyCompound || 'Not specified'}) and LGA (${profile.lga || 'Not specified'}), we trace corresponding roots to historical migrations. Map indicators suggest related lineages are registered in this vicinity. Configure a Gemini API key in Settings > Secrets to unlock full intelligent migration overlap analysis.`
    });
  }

  try {
    const analysisPrompt = `Compare this user's regional profile to our historical archives.
    
    User Profile:
    Name: ${profile.fullName}
    LGA: ${profile.lga}
    Ward: ${profile.ward}
    Compound: ${profile.familyCompound}
    Language: ${profile.language}
    Estimated Lineage Size: ${profile.familySizeEstimate}
    
    Historical Archives:
    ${JSON.stringify(HISTORICAL_DB, null, 2)}
    
    Deliver a brief, highly personalized, culturally informed paragraph to the user (2-3 sentences), explaining possible connection routes, migration patterns, or cultural meanings of their compound and LGA origins. Be supportive and historical.`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: analysisPrompt
    });

    res.json({
      matches: systemMatches,
      aiAnalysis: aiResponse.text || "Ancestral geography analysis completed successfully."
    });

  } catch (error: any) {
    res.json({
      matches: systemMatches,
      aiAnalysis: `Geographical match calculated. Potential alignment within the ${profile.lga || 'local'} district.`
    });
  }
});

// Serve static resources in production, or mount Vite middleware in development
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT MODE with active Vite Hot Middleware.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION MODE serving compiled assets.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Afrolineo running on port ${PORT}`);
  });
};

startServer();
