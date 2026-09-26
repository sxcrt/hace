require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

let mammoth = null;
try { mammoth = require("mammoth"); } catch (e) { console.warn("mammoth not available", e.message); }

let pdfParse = null;
try { pdfParse = require("pdf-parse"); } catch (e) { console.warn("pdf-parse not available", e.message); }

const { GoogleGenAI, Type } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();
const OPENROUTER_API_KEY = (process.env.OPENROUTER_API_KEY || "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").trim();
const OPENROUTER_MODEL = (process.env.OPENROUTER_MODEL || "google/gemini-3-flash-preview").trim();

let ai = null;
if (GEMINI_API_KEY) {
    ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY,
        httpOptions: {
            headers: {
                'User-Agent': 'aistudio-build'
            }
        }
    });
}

const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "data", "users") : path.join(__dirname, "data", "users");
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 30 * 1024 * 1024
    }
});

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const COOKIE_NAME = "studyverse_uid";
app.use((req, res, next) => {
    let uid = req.cookies[COOKIE_NAME];
    if (!uid || typeof uid !== "string" || !/^sv_usr_[a-zA-Z0-9_-]+$/.test(uid)) {
        uid = `sv_usr_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
        res.cookie(COOKIE_NAME, uid, {
            maxAge: 365 * 24 * 60 * 60 * 1000,
            httpOnly: false,
            sameSite: "lax",
            path: "/"
        });
        req.cookies[COOKIE_NAME] = uid;
    }
    req.studyverseUid = uid;
    next();
});

const SPA_ROUTES = [
    "/",
    "/dashboard",
    "/flashcards",
    "/flashcards/",
    "/pomodoro",
    "/pomodoro/",
    "/tasks",
    "/tasks/",
    "/notes",
    "/notes/",
    "/calendar",
    "/calendar/",
    "/courses",
    "/courses/",
    "/Homepage.html",
    "/homepage",
    "/calendar.html",
    "/tasks.html",
    "/todo",
    "/todo.html",
    "/notes.html",
    "/flash.html",
    "/flashcards.html",
    "/pomodoro.html",
    "/courses.html"
];

app.get(SPA_ROUTES, (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.use(express.static(path.join(__dirname), { index: false }));

function getUserFilePath(uid) {
    const safeUid = uid.replace(/[^a-zA-Z0-9_-]/g, "");
    return path.join(DATA_DIR, `${safeUid}.json`);
}

function readUserData(uid) {
    const filePath = getUserFilePath(uid);
    let loaded = null;
    if (fs.existsSync(filePath)) {
        try {
            const raw = fs.readFileSync(filePath, "utf8");
            loaded = JSON.parse(raw);
        } catch (e) {
            console.error("Failed to read user data:", e);
        }
    }

    const defaultProfile = {
        username: "Scholar",
        pfp: "star",
        customAvatarUrl: null,
        streak: 1,
        lastActiveDate: new Date().toISOString().split("T")[0]
    };

    const defaultMetrics = [];

    if (!loaded) {
        return {
            uid,
            createdAt: new Date().toISOString(),
            profile: defaultProfile,
            metrics: defaultMetrics,
            tasks: [],
            notes: [],
            events: [],
            courses: [],
            decks: [],
            pomodoro: {
                completedSessions: 0,
                totalFocusMinutes: 0,
                activeSession: null
            }
        };
    }

    return {
        ...loaded,
        uid,
        profile: { ...defaultProfile, ...(loaded.profile || {}) },
        metrics: Array.isArray(loaded.metrics) ? loaded.metrics : [],
        tasks: Array.isArray(loaded.tasks) ? loaded.tasks : [],
        notes: Array.isArray(loaded.notes) ? loaded.notes : [],
        events: Array.isArray(loaded.events) ? loaded.events : [],
        courses: Array.isArray(loaded.courses) ? loaded.courses : [],
        decks: Array.isArray(loaded.decks) ? loaded.decks : [],
        pomodoro: loaded.pomodoro || { completedSessions: 0, totalFocusMinutes: 0, activeSession: null }
    };
}

function writeUserData(uid, data) {
    const filePath = getUserFilePath(uid);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
        return true;
    } catch (e) {
        console.error("Failed to write user data:", e);
        return false;
    }
}

app.get("/api/user-data", (req, res) => {
    const uid = req.studyverseUid;
    const userData = readUserData(uid);
    res.json({
        success: true,
        uid,
        data: userData
    });
});

app.post("/api/user-data", (req, res) => {
    const uid = req.studyverseUid;
    const incomingData = req.body || {};
    const existing = readUserData(uid);
    const updated = {
        ...existing,
        ...incomingData,
        uid,
        updatedAt: new Date().toISOString()
    };
    const saved = writeUserData(uid, updated);
    res.json({
        success: saved,
        uid,
        data: updated
    });
});

app.post("/api/user-data/reset", (req, res) => {
    const uid = req.studyverseUid;
    const existing = readUserData(uid);
    const blank = {
        uid,
        createdAt: new Date().toISOString(),
        profile: {
            username: (existing.profile && existing.profile.username) || "Scholar",
            pfp: (existing.profile && existing.profile.pfp) || "star",
            customAvatarUrl: null,
            streak: 1,
            lastActiveDate: new Date().toISOString().split("T")[0],
            theme: (existing.profile && existing.profile.theme) || "light"
        },
        metrics: [],
        tasks: [],
        notes: [],
        events: [],
        courses: [],
        decks: [],
        pomodoro: {
            completedSessions: 0,
            totalFocusMinutes: 0,
            activeSession: null
        }
    };
    writeUserData(uid, blank);
    res.json({ success: true, message: "Workspace reset to blank slate", data: blank });
});

async function extractTextFromPDF(buffer) {
    if (!pdfParse) {
        return { text: buffer.toString("utf8"), pages: null };
    }
    const data = await pdfParse(buffer);
    return {
        text: (data.text || "").trim(),
        pages: data.numpages || null
    };
}

async function extractTextFromDocx(buffer) {
    if (!mammoth) {
        return { text: buffer.toString("utf8"), pages: null };
    }
    const result = await mammoth.extractRawText({ buffer });
    return {
        text: (result.value || "").trim(),
        pages: null
    };
}

app.post("/api/upload-file", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file was uploaded." });
        }

        const filename = req.file.originalname;
        const extension = path.extname(filename).toLowerCase();
        const buffer = req.file.buffer;

        let extracted = { text: "", pages: null };

        if (extension === ".pdf") {
            extracted = await extractTextFromPDF(buffer);
        } else if (extension === ".docx") {
            extracted = await extractTextFromDocx(buffer);
        } else if (extension === ".txt" || extension === ".md" || extension === ".csv") {
            extracted = { text: buffer.toString("utf8").trim(), pages: null };
        } else {
            extracted = { text: buffer.toString("utf8").replace(/[^\x20-\x7E\r\n\t]/g, " ").trim(), pages: null };
        }

        if (!extracted.text || extracted.text.length < 5) {
            return res.status(400).json({
                success: false,
                error: "Could not extract readable text from the file. Please ensure it contains readable text."
            });
        }

        return res.json({
            success: true,
            fileName: filename,
            fileSize: req.file.size,
            fileType: extension,
            text: extracted.text,
            pages: extracted.pages
        });
    } catch (err) {
        console.error("Upload error:", err);
        return res.status(500).json({
            success: false,
            error: err.message || "Failed to process file."
        });
    }
});

function cleanTerm(term) {
    return term.replace(/^[\s●•\-\d\.\)]+/g, "").trim();
}

function generateSmartEducationalFlashcards(text, count = 10) {
    const rawSegments = text
        .replace(/([●•])/g, "\n$1")
        .replace(/(\d+\.\s+)/g, "\n$1")
        .split(/(?:\r?\n|;\s*|\.\s+(?=[A-Z●•\d]))/)
        .map(l => l.trim())
        .filter(l => l.length > 2);

    const cards = [];
    const seenTerms = new Set();

    for (let i = 0; i < rawSegments.length; i++) {
        if (cards.length >= count) break;
        const line = rawSegments[i];

        const colonIdx = line.indexOf(":");
        if (colonIdx > 2 && colonIdx < 50) {
            const rawTerm = cleanTerm(line.slice(0, colonIdx));
            const explanation = line.slice(colonIdx + 1).trim();
            if (rawTerm.length >= 3 && explanation.length >= 4 && !seenTerms.has(rawTerm.toLowerCase())) {
                seenTerms.add(rawTerm.toLowerCase());
                cards.push({
                    id: `fc_${Date.now()}_${cards.length}`,
                    question: `What is ${rawTerm}, and how is it used or applied?`,
                    answer: explanation,
                    concept: rawTerm,
                    hint: `Focus on the definition and function of ${rawTerm}.`
                });
                continue;
            }
        }

        const dashMatch = line.match(/^([^–—\-]{3,40})\s*[-–—]\s*(.+)$/);
        if (dashMatch) {
            const rawTerm = cleanTerm(dashMatch[1]);
            const explanation = dashMatch[2].trim();
            if (rawTerm.length >= 3 && explanation.length >= 4 && !seenTerms.has(rawTerm.toLowerCase())) {
                seenTerms.add(rawTerm.toLowerCase());
                cards.push({
                    id: `fc_${Date.now()}_${cards.length}`,
                    question: `How is "${rawTerm}" defined and characterized in this context?`,
                    answer: explanation,
                    concept: rawTerm,
                    hint: `Key terminology and core concepts`
                });
                continue;
            }
        }

        if (/^[●•\-\d\.]+\s+/.test(line) && i + 1 < rawSegments.length && !/^[●•\-\d\.]+\s+/.test(rawSegments[i + 1])) {
            const rawTerm = cleanTerm(line);
            const explanation = rawSegments[i + 1].trim();
            if (rawTerm.length >= 3 && explanation.length >= 5 && !seenTerms.has(rawTerm.toLowerCase())) {
                seenTerms.add(rawTerm.toLowerCase());
                cards.push({
                    id: `fc_${Date.now()}_${cards.length}`,
                    question: `What are the key elements and function of ${rawTerm}?`,
                    answer: explanation,
                    concept: rawTerm,
                    hint: `Think of examples and application for ${rawTerm}.`
                });
                i++;
                continue;
            }
        }
    }

    if (cards.length < count) {
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 35);
        paragraphs.forEach((p, idx) => {
            if (cards.length >= count) return;
            const sentences = p.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 10);
            if (sentences.length >= 2) {
                const topicSentence = sentences[0].replace(/^[\s●•\-\d\.]+/g, "").trim();
                cards.push({
                    id: `fc_${Date.now()}_${cards.length}`,
                    question: `Explain the fundamental concept behind: "${topicSentence}"`,
                    answer: sentences.slice(1).join(" "),
                    concept: `Key Concept ${idx + 1}`,
                    hint: `Synthesize the primary mechanism or reasoning.`
                });
            }
        });
    }

    if (cards.length === 0) {
        cards.push({
            id: `fc_${Date.now()}_0`,
            question: "What is the primary synthesis and takeaway of this study material?",
            answer: text.slice(0, 320),
            concept: "General Summary",
            hint: "Review core definitions and applications."
        });
    }

    return cards.slice(0, count);
}

app.post("/api/generate-flashcards", async (req, res) => {
    try {
        const studyText = (req.body?.studyText || "").trim();
        const deckTitle = (req.body?.deckTitle || "Untitled Deck").trim();
        const requestedCount = Math.min(Math.max(parseInt(req.body?.cardCount, 10) || 10, 3), 30);
        const focusTopic = (req.body?.focusTopic || "").trim();

        if (!studyText || studyText.length < 10) {
            return res.status(400).json({
                success: false,
                error: "Please provide sufficient study text or upload a study document (PDF/Doc)."
            });
        }

        let generatedCards = null;
        let generatedTitle = deckTitle;
        let usedModel = null;

        const prompt = `You are a world-class academic tutor crafting high-yield Anki flashcards for university students.
Your mission is to generate thoughtful, active-recall flashcards that genuinely test understanding, mechanisms, and application rather than superficial word-matching.

Task:
Analyze the provided study material and generate exactly ${requestedCount} distinct, high-yield flashcards.
${focusTopic ? `Ensure strong emphasis on: "${focusTopic}".` : ""}

CRITICAL FLASHCARD WRITING RULES:
1. "question": Must be phrased as a clear, rigorous active-recall question. Formulate diverse styles:
   - Conceptual understanding: "What are the primary characteristics of X, and how does it function?"
   - Comparison & contrast: "How does X differ from Y in terms of mechanism and outcome?"
   - Practical application/scenario: "In what scenario would X be preferred over Y, and why?"
   - Component/type breakdown: "What are the key channels/components of X, and what is the role of each?"
   NEVER write mechanical phrases like "What is - Term?", "Explain the concept: Bullet", or raw cut fragments. Completely strip bullets (●, •, -) and numbering.
2. "answer": Comprehensive, accurate, high-yield explanation. Highlight key terms and concise examples where applicable.
3. "concept": Short 1-3 word topic tag or category.
4. "hint": A subtle, helpful memory clue or mnemonic.

Format as JSON:
{
  "deckTitle": "A concise, descriptive title for this deck",
  "cards": [
    {
      "question": "Clear question here",
      "answer": "Detailed answer here",
      "concept": "Topic tag",
      "hint": "Helpful mnemonic or clue"
    }
  ]
}

Study Material:
${studyText.slice(0, 35000)}
`;

        if (OPENROUTER_API_KEY && !generatedCards) {
            try {
                const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://studyverse.app",
                        "X-Title": "StudyVerse"
                    },
                    body: JSON.stringify({
                        model: OPENROUTER_MODEL,
                        messages: [
                            {
                                role: "system",
                                content: "You are an expert academic tutor and flashcard architect. Output valid JSON only with structure {\"deckTitle\": string, \"cards\": [{\"question\": string, \"answer\": string, \"concept\": string, \"hint\": string}]}."
                            },
                            {
                                role: "user",
                                content: prompt
                            }
                        ],
                        response_format: { type: "json_object" },
                        temperature: 0.3
                    })
                });

                if (orResponse.ok) {
                    const orData = await orResponse.json();
                    const rawContent = orData.choices?.[0]?.message?.content;
                    if (rawContent) {
                        let parsed = null;
                        try {
                            parsed = JSON.parse(rawContent);
                        } catch (e) {
                            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
                            if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
                        }

                        if (parsed && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
                            generatedCards = parsed.cards.map((c, idx) => ({
                                id: `fc_${Date.now()}_${idx}`,
                                question: cleanTerm((c.question || "").trim()),
                                answer: (c.answer || "").trim(),
                                concept: (c.concept || "Key Concept").trim(),
                                hint: (c.hint || "").trim(),
                                repetitions: 0,
                                interval: 0,
                                easeFactor: 2.5,
                                dueDate: new Date().toISOString(),
                                status: "new"
                            }));
                            generatedTitle = parsed.deckTitle || deckTitle;
                            usedModel = OPENROUTER_MODEL;
                        }
                    }
                } else {
                    const errText = await orResponse.text();
                    console.warn("OpenRouter API error response:", errText);
                }
            } catch (orErr) {
                console.warn("OpenRouter fetch error:", orErr.message || orErr);
            }
        }

        if (ai && !generatedCards) {
            const modelsToTry = ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
            for (const modelName of modelsToTry) {
                try {
                    const response = await ai.models.generateContent({
                        model: modelName,
                        contents: prompt,
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                    deckTitle: {
                                        type: Type.STRING,
                                        description: "A clear, descriptive academic title for this deck."
                                    },
                                    cards: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                question: { type: Type.STRING },
                                                answer: { type: Type.STRING },
                                                concept: { type: Type.STRING },
                                                hint: { type: Type.STRING }
                                            },
                                            required: ["question", "answer", "concept"]
                                        }
                                    }
                                },
                                required: ["cards"]
                            }
                        }
                    });

                    const rawJson = response.text;
                    if (rawJson) {
                        const parsed = JSON.parse(rawJson);
                        if (Array.isArray(parsed.cards) && parsed.cards.length > 0) {
                            generatedCards = parsed.cards.map((c, idx) => ({
                                id: `fc_${Date.now()}_${idx}`,
                                question: cleanTerm(c.question.trim()),
                                answer: c.answer.trim(),
                                concept: (c.concept || "Key Concept").trim(),
                                hint: (c.hint || "").trim(),
                                repetitions: 0,
                                interval: 0,
                                easeFactor: 2.5,
                                dueDate: new Date().toISOString(),
                                status: "new"
                            }));
                            generatedTitle = parsed.deckTitle || deckTitle;
                            usedModel = modelName;
                            break;
                        }
                    }
                } catch (geminiError) {
                    console.warn(`Gemini generation with ${modelName} encountered an issue:`, geminiError.message || geminiError);
                }
            }
        }

        if (generatedCards && generatedCards.length > 0) {
            return res.json({
                success: true,
                generatedWith: usedModel,
                deckTitle: generatedTitle,
                cards: generatedCards
            });
        }

        const fallbackCards = generateSmartEducationalFlashcards(studyText, requestedCount).map((c, idx) => ({
            ...c,
            repetitions: 0,
            interval: 0,
            easeFactor: 2.5,
            dueDate: new Date().toISOString(),
            status: "new"
        }));

        return res.json({
            success: true,
            generatedWith: "smart-educational-synthesizer",
            deckTitle: deckTitle || "Synthesized Study Deck",
            cards: fallbackCards
        });

    } catch (err) {
        console.error("Flashcard generation route error:", err);
        return res.status(500).json({
            success: false,
            error: err.message || "Failed to generate flashcards."
        });
    }
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        app: "StudyVerse",
        timestamp: new Date().toISOString(),
        geminiConfigured: Boolean(GEMINI_API_KEY)
    });
});

app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({ success: false, error: "API route not found" });
    }
    res.sendFile(path.join(__dirname, "index.html"));
});

if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`StudyVerse server running on http://0.0.0.0:${PORT}`);
    });
}

module.exports = app;
