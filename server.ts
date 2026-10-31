import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';
import { executeEnquiryAlert, sanitizeText, setConfiguredOwnerWhatsAppNumber, getConfiguredOwnerWhatsAppNumber, setWhatsAppSchedule, getWhatsAppSchedule } from './src/functions/enquiryAlert';
import { handleFirestoreFormSubmission } from './src/functions/firestoreTrigger';
import { sendEnquiryConfirmationEmail } from './src/services/autoReplyService';
import { PRODUCTS } from './src/data/siteData';

dotenv.config();

// Pre-Deployment Check 1: Environment Variables Validation
function validateEnvironment(): { valid: boolean; warnings: string[] } {
  const isProd = process.env.NODE_ENV === 'production';
  const warnings: string[] = [];

  // Critical Variables
  if (!process.env.GEMINI_API_KEY) {
    if (isProd) {
      console.error('FATAL STARTUP CHECK FAILURE: GEMINI_API_KEY environment variable is required in production.');
      process.exit(1);
    } else {
      warnings.push('GEMINI_API_KEY is not defined in .env. AI Concierge and Scent Match will use offline fallback synthesis.');
    }
  }

  // Non-critical variables with clean fallbacks
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    warnings.push('Twilio credentials not configured in environment. WhatsApp notifications will operate in zero-latency click-to-chat fallback mode.');
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    warnings.push('SMTP mailer credentials not configured in environment. Auto-replies will operate via jsonTransport simulation.');
  }

  return { valid: true, warnings };
}

const envStatus = validateEnvironment();
if (envStatus.warnings.length > 0) {
  envStatus.warnings.forEach((w) => console.warn(`[ENV CHECK WARNING] ${w}`));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Environment constraint: dev server must run on port 3000
const args = process.argv.slice(2);
let cliPort: number | null = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    cliPort = parseInt(args[i + 1], 10);
  }
}
const PORT = cliPort || 3000;

// Pre-Deployment Check 4: Security Headers via Helmet & Strict-Transport-Security
// Notice: In Google AI Studio, the application preview renders in an iFrame.
// We configure frameguard: false with Content-Security-Policy frameAncestors allowing AI Studio domains,
// while enforcing X-Content-Type-Options: nosniff and HSTS (max-age 1 year).
app.use(
  helmet({
    xContentTypeOptions: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://apis.google.com', 'https://maps.googleapis.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
        connectSrc: ["'self'", 'https:', 'wss:', 'http://localhost:*', 'ws://localhost:*'],
        frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com', 'https://*.firebaseapp.com'],
        frameAncestors: ["'self'", 'https://*.google.com', 'https://*.run.app'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// Pre-Deployment Check 6: CORS Configuration (Restricted from wildcard '*')
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://ais-dev-zdjfjzinlr4pz7cnm4d6vu-8459846797.asia-east1.run.app',
  'https://ais-pre-zdjfjzinlr4pz7cnm4d6vu-8459846797.asia-east1.run.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowedExplicit = ALLOWED_ORIGINS.includes(origin);
      const isAisCloudRun = /^https:\/\/ais-(dev|pre)-[a-z0-9\-]+\.[a-z0-9\-]+\.run\.app$/.test(origin);
      if (isAllowedExplicit || isAisCloudRun) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy violation: Origin '${origin}' is not allowed.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-email', 'x-admin-key'],
  })
);

// Attack Path Defense: Block direct access to internal dotfiles, .env, .git, and path traversal
app.use((req: Request, res: Response, next: NextFunction) => {
  const normalizedPath = decodeURIComponent(req.path).toLowerCase();
  const blockedPatterns = [
    /^\/\.env/i,
    /^\/\.git/i,
    /^\/\.aistudio/i,
    /package(\.json|-lock\.json)/i,
    /tsconfig\.json/i,
    /server\.ts/i,
    /firestore\.rules/i,
    /firebase-blueprint\.json/i,
    /\.\./,
  ];

  if (blockedPatterns.some((pattern) => pattern.test(normalizedPath))) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  next();
});

app.use(express.json({ limit: '1mb' }));

// Owner contact constants protected on server-side
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'worktail37@gmail.com';
const OWNER_WHATSAPP_NUMBER = process.env.OWNER_WHATSAPP_NUMBER || '';

// Pre-Deployment Check 3: Standardized Error Handling with Correlation IDs
// Client never receives stack traces, file paths, or internal server info
function sendSanitizedError(res: Response, status: number, userFacingMessage: string, internalError?: any): Response {
  const correlationId = `err_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  if (internalError) {
    console.error(`[CorrelationID: ${correlationId}] Internal Server Error:`, internalError?.stack || internalError?.message || internalError);
  }
  return res.status(status).json({
    error: userFacingMessage,
    correlationId,
  });
}

// Pre-Deployment Check 5: Multi-Tier Rate Limiting
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

function createRateLimiter(config: RateLimitConfig) {
  const store = new Map<string, { count: number; resetTime: number }>();

  // Cleanup loop
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = store.get(ip);

    if (!record || now > record.resetTime) {
      store.set(ip, { count: 1, resetTime: now + config.windowMs });
      return next();
    }

    if (record.count >= config.maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      const correlationId = `rate_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      return res.status(429).json({
        error: config.message,
        retryAfter: retryAfterSeconds,
        correlationId,
      });
    }

    record.count += 1;
    return next();
  };
}

// 1. Auth endpoints & user sync: 5 attempts per minute per IP
const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: 'Authentication rate limit reached. Maximum 5 attempts per minute per IP.',
});

// 2. Sensitive account data deletion: 3 attempts per hour per IP
const accountDeletionRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
  message: 'Account data erasure rate limit reached. Maximum 3 requests per hour.',
});

// 3. Enquiry & consultation submissions: 10 attempts per 10 minutes per IP
const enquiryRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 10,
  message: 'Inquiry submission rate limit reached. Please wait a few moments before resubmitting.',
});

// 4. Admin channel verification: 3 attempts per 10 minutes per IP
const adminVerificationRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 3,
  message: 'Channel verification dispatch rate limit reached. Please wait before verifying again.',
});

// 5. AI Concierge, Scent Match, and Moodboard generation: 20 requests per 5 minutes per IP (Feature Abuse / Financial DDoS defense)
const aiRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 20,
  message: 'Sensory concierge rate limit reached. Please allow a few moments for olfactory alchemists to compose recommendations.',
});

// Cryptographic Firebase Auth Bearer Token Verifier (Defense against Login Bypass, BOLA, & Privilege Escalation)
interface VerifiedAuthUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
}

const tokenVerificationCache = new Map<string, { user: VerifiedAuthUser; expiresAt: number }>();

async function verifyBearerToken(req: Request): Promise<VerifiedAuthUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const now = Date.now();
  const cached = tokenVerificationCache.get(token);
  if (cached && now < cached.expiresAt) {
    return cached.user;
  }

  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
    if (!response.ok) {
      return null;
    }
    const tokenInfo = (await response.json()) as any;
    if (!tokenInfo || !tokenInfo.sub) {
      return null;
    }

    const email = (tokenInfo.email || '').toLowerCase();
    const emailVerified = tokenInfo.email_verified === 'true' || tokenInfo.email_verified === true;
    const isOwnerAdmin = email === OWNER_EMAIL.toLowerCase();

    const user: VerifiedAuthUser = {
      uid: tokenInfo.sub,
      email,
      emailVerified,
      isAdmin: isOwnerAdmin,
    };

    tokenVerificationCache.set(token, { user, expiresAt: now + 5 * 60 * 1000 });
    return user;
  } catch (err) {
    console.error('Token verification error:', err);
    return null;
  }
}

async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  // Allow fallback if an explicitly configured server-side ADMIN_SECRET_KEY is supplied
  const adminSecretHeader = req.headers['x-admin-key'];
  if (process.env.ADMIN_SECRET_KEY && adminSecretHeader === process.env.ADMIN_SECRET_KEY) {
    return next();
  }

  const user = await verifyBearerToken(req);
  if (!user || !user.isAdmin) {
    return res.status(403).json({
      error: 'Access denied: Validated Maison Owner credentials required.',
      correlationId: `auth_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    });
  }
  (req as any).user = user;
  return next();
}

// Input sanitizer to avoid header/HTML injection
function sanitize(input: unknown, maxLen = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

// In-memory notifications store for Maison Admin review
interface NotificationRecord {
  id: string;
  type: 'consultation' | 'enquiry' | 'signin';
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  boutique?: string;
  date?: string;
  notes?: string;
  savedFragrancesSummary?: string;
  createdAt: string;
  status: 'delivered';
}

let recentNotifications: NotificationRecord[] = [];

// Initialize Mailer Transporter
let mailTransporter: any = null;
async function getMailTransporter() {
  if (mailTransporter) return mailTransporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate a fallback json/test transport for smooth operation without hard requirement of external SMTP credentials
    mailTransporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }
  return mailTransporter;
}

// Initialize Google Gen AI with server-side environment key
const ai = new GoogleGenAI();

const SYSTEM_INSTRUCTION = `You are "The Nose of Avelore" — Master Perfumer and Head Olfactory Concierge for AVELORE Haute Parfumerie.
AVELORE brand voice: Quiet luxury, confident, sensory, poetic, and refined. Never commercial, loud, or salesy.
Tagline: "Scent, composed with intention."
You assist distinguished patrons with:
1. Raw ingredient alchemy: Orris butter, Bourbon vetiver, Ambergris, Rose de Mai, Sandalwood Mysore, Frankincense, Rare Extraits.
2. Scent layering rituals and seasonal perfume wardrobes.
3. Recommendations from the Avelore catalog:
   - Exclusive Perfumes: L'Heure Ambrée (Amber & Iris), Cuir Nocturne (Smoky Leather), Rose Sépale (Spiced Damask), Bois Céleste (Sacred Cedar), Fleur d'Opale (Night Tuberose), Néroli Sauvage (Bitter Orange).
   - Fine Fragrance, Body & Bath, Home Fragrance, and Beauty & Cosmetics.
4. Flagship Ateliers & Boutiques:
   - Paris Flagship: 14 Place Vendôme, 75001 Paris
   - London Salon: 28 Mount Street, Mayfair, London W1K 2SX
   - New York Atelier: 742 Madison Avenue, Upper East Side, NY 10065
   - Tokyo Sanctuary: 6-10-1 Ginza, Chuo-ku, Tokyo 104-0061
5. When patrons ask about locations, addresses, store hours, or directions, provide grounded boutique context with elegance.

Always keep your answers structured, evocative, and helpful. Format key fragrance notes or pairings cleanly.`;

// Olfactory Concierge Chat API
app.post('/api/concierge', aiRateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      messages,
      model = 'gemini-3.8-flash',
      useMaps = false,
      userLocation,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const validModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-4-argon'];
    const chosenModel = validModels.includes(model) ? model : 'gemini-3.8-flash';

    const lastUserMessage = messages[messages.length - 1]?.text || '';
    const locationKeywords = ['store', 'boutique', 'salon', 'atelier', 'where', 'find', 'location', 'address', 'visit', 'paris', 'london', 'new york', 'tokyo', 'directions', 'place vendome', 'mayfair', 'madison', 'ginza'];
    const shouldEnableMaps = Boolean(
      useMaps || locationKeywords.some((kw) => lastUserMessage.toLowerCase().includes(kw))
    );

    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
    };

    if (shouldEnableMaps) {
      config.tools = [{ googleMaps: {} }];
      if (userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number') {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
          },
        };
      }
    }

    let response: any;
    let actualModel = chosenModel;

    try {
      response = await ai.models.generateContent({
        model: chosenModel,
        contents,
        config,
      });
    } catch (primaryErr: any) {
      console.warn(`Primary model ${chosenModel} warning:`, primaryErr.message);
      const isTransient = primaryErr.message?.includes('503') || primaryErr.message?.includes('high demand') || primaryErr.message?.includes('429');
      if (isTransient) {
        await new Promise((r) => setTimeout(r, 600));
        try {
          actualModel = 'gemini-3.1-flash-lite';
          response = await ai.models.generateContent({
            model: actualModel,
            contents,
            config,
          });
        } catch (fallbackErr: any) {
          throw primaryErr;
        }
      } else {
        throw primaryErr;
      }
    }

    const replyText = response.text || 'I invite you to explore the sensory chapters of Avelore.';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const mapSources: Array<{ title: string; uri: string }> = [];
    if (Array.isArray(groundingChunks)) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.maps?.uri) {
          mapSources.push({
            title: chunk.maps.title || 'View Atelier on Google Maps',
            uri: chunk.maps.uri,
          });
        }
      });
    }

    return res.json({
      text: replyText,
      groundingChunks,
      mapSources,
      modelUsed: actualModel,
      mapsUsed: shouldEnableMaps,
    });
  } catch (error: any) {
    return sendSanitizedError(
      res,
      500,
      'The Olfactory Concierge is momentarily unavailable. Please quote the reference ID if this persists.',
      error
    );
  }
});

// AI Scent Match API: Matches visitor vibe, mood & notes with Avelore perfume catalog
app.post('/api/scent-match', aiRateLimiter, async (req: Request, res: Response) => {
  try {
    const { vibe, atmosphere, accords = [], silhouette, customVibe } = req.body || {};

    const availablePerfumes = PRODUCTS.filter((p) => p.category === 'exclusive' || p.category === 'fragrance');
    const catalogSummary = availablePerfumes.map((p) => ({
      id: p.id,
      name: p.name,
      subtitle: p.subtitle,
      description: p.description,
      topNotes: p.notes?.top || [],
      heartNotes: p.notes?.heart || [],
      baseNotes: p.notes?.base || [],
      collectionId: p.collectionId,
    }));

    const prompt = `You are the Master Perfumer and Head Olfactory Alchemist of AVELORE Haute Parfumerie.
A patron has provided their sensory aesthetic profile to discover their suited signature fragrance.

PATRON SENSORY PROFILE:
- Core Vibe / Persona: ${vibe || 'Mysterious and nuanced'}
- Atmospheric Setting: ${atmosphere || 'Candlelit salon at dusk'}
- Preferred Accords: ${Array.isArray(accords) ? accords.join(', ') : accords || 'Amber, Woods, Leather'}
- Scent Silhouette (Sillage): ${silhouette || 'Magnetic lingering aura'}
- Personal Aesthetic & Mood (In their own words): "${customVibe || 'Quietly confident, seeking an enduring signature.'}"

AVELORE CATALOG OF PERFUMES TO MATCH FROM:
${JSON.stringify(catalogSummary, null, 2)}

INSTRUCTIONS:
1. Select the single BEST matched perfume from the catalog above (use the exact 'id' from the list).
2. Select an alternative complementary perfume (also using exact 'id').
3. Calculate an affinity match percentage between 93 and 99.
4. Give a poetic, evocative persona title for the patron (e.g. "The Nocturnal Intellectual", "The Solar Alchemist", "The Velvet Intimate").
5. Write a refined 2-3 sentence poetic analysis explaining specifically WHY this fragrance composition captures their aesthetic, vibe, and notes.
6. Provide a bespoke "wearing ritual" (how and where they should apply it).
7. Write a 1-sentence explanation of why the alternative perfume serves as a captivating counterpoint.

Return ONLY a valid JSON object with this exact structure:
{
  "matchedProductId": "exact-id-from-catalog",
  "matchAffinity": 97,
  "vibeTitle": "The Nocturnal Intellectual",
  "poeticAnalysis": "Analysis here...",
  "wearingRitual": "Application advice here...",
  "alternativeProductId": "exact-id-from-catalog",
  "alternativeReason": "Counterpoint reason here..."
}`;

    let matchResult: any = null;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const rawText = response.text || '';
      try {
        matchResult = JSON.parse(rawText);
      } catch {
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        matchResult = JSON.parse(cleaned);
      }
    } catch (modelErr: any) {
      console.warn('Gemini Scent Match warning, invoking deterministic olfactory engine:', modelErr.message);
    }

    // Fallback or validation if model output missing or invalid id
    if (!matchResult || !matchResult.matchedProductId) {
      const vibeStr = `${vibe} ${accords.join(' ')} ${customVibe}`.toLowerCase();
      let pickedId = 'reserve-ambre-imperial';
      let altId = 'cuir-nocturne';
      let title = 'The Nocturnal Alchemist';

      if (vibeStr.includes('solar') || vibeStr.includes('citrus') || vibeStr.includes('neroli')) {
        pickedId = 'neroli-sauvage';
        altId = 'solene';
        title = 'The Solar Luminous';
      } else if (vibeStr.includes('rose') || vibeStr.includes('floral') || vibeStr.includes('opulent')) {
        pickedId = 'reserve-rose-centifolia-pur';
        altId = 'rose-sepale';
        title = 'The Velvet Botanist';
      } else if (vibeStr.includes('leather') || vibeStr.includes('smoke') || vibeStr.includes('cade')) {
        pickedId = 'reserve-cuir-nocturne';
        altId = 'cuir-nocturne';
        title = 'The Nocturne Bibliophile';
      } else if (vibeStr.includes('wood') || vibeStr.includes('sanctuary') || vibeStr.includes('oud') || vibeStr.includes('cedar')) {
        pickedId = 'reserve-oud-meridian';
        altId = 'bois-celeste';
        title = 'The Sacred Contemplative';
      } else if (vibeStr.includes('iris') || vibeStr.includes('cashmere') || vibeStr.includes('skin') || vibeStr.includes('whisper')) {
        pickedId = 'reserve-iris-pale';
        altId = 'fleur-d-opale';
        title = 'The Intimate Minimalist';
      }

      matchResult = {
        matchedProductId: pickedId,
        matchAffinity: 97,
        vibeTitle: title,
        poeticAnalysis: 'Distilled to harmonize your distinct aesthetic temperature with our single-estate botanicals, this composition mirrors your love for nuanced depth and lingering intimacy.',
        wearingRitual: 'Mists once across the collarbone and inner wrists at twilight, allowing the body warmth to release the precious resinous core.',
        alternativeProductId: altId,
        alternativeReason: 'A complementary formulation offering a lighter or contrasting texture for alternate moods.',
      };
    }

    // Enrich with full product structures
    const matchedProduct = PRODUCTS.find((p) => p.id === matchResult.matchedProductId) || availablePerfumes[0];
    const alternativeProduct = PRODUCTS.find((p) => p.id === matchResult.alternativeProductId) || availablePerfumes[1];

    return res.json({
      success: true,
      match: {
        ...matchResult,
        product: matchedProduct,
        alternativeProduct,
      },
    });
  } catch (error: any) {
    return sendSanitizedError(
      res,
      500,
      'Unable to formulate signature scent recommendation at this time. Please retry shortly.',
      error
    );
  }
});

// AI Visual Moodboard API: Generates bespoke luxury collage using Imagen 3 & Gemini
app.post('/api/moodboard', aiRateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      scentFamily = 'Smoked Amber & Resins',
      perfumeId,
      perfumeName,
      atmosphere = 'Parisian twilight salon with candlelit drapes and cognac',
      lighting = 'Warm chiaroscuro, amber shadows, crystal refractions',
      paletteTheme = 'Burnt Merlot (#3B0000), Golden Apricot (#FFD482), Smoked Glass, Warm Parchment',
      customNotes = 'Intimate, mysterious, timeless Haute Parfumerie luxury',
    } = req.body || {};

    // Match candidate perfumes from Avelore catalog
    const availablePerfumes = PRODUCTS.filter((p) => p.category === 'exclusive' || p.category === 'fragrance');
    let matchedPerfumes = availablePerfumes.slice(0, 3);
    if (perfumeId) {
      const selected = availablePerfumes.find((p) => p.id === perfumeId);
      if (selected) {
        matchedPerfumes = [selected, ...availablePerfumes.filter((p) => p.id !== perfumeId).slice(0, 2)];
      }
    } else if (perfumeName) {
      const selected = availablePerfumes.find((p) => p.name.toLowerCase().includes(perfumeName.toLowerCase()));
      if (selected) {
        matchedPerfumes = [selected, ...availablePerfumes.filter((p) => p.id !== selected.id).slice(0, 2)];
      }
    }

    // Step 1: Synthesize art direction & image prompt via Gemini 3.8 Flash
    const enricherPrompt = `You are the Creative Director and Visual Alchemist for AVELORE Haute Parfumerie, Place Vendôme, Paris.
Craft a bespoke visual moodboard collage concept for a patron whose fragrance aesthetic is:
- Fragrance Inspiration: ${perfumeName || matchedPerfumes[0]?.name || 'Atelier Bespoke'}
- Scent Family / Chapter: ${scentFamily}
- Atmospheric Setting: ${atmosphere}
- Lighting & Texture: ${lighting}
- Desired Color Palette: ${paletteTheme}
- Patron Sensory Notes: "${customNotes}"

INSTRUCTIONS:
1. Write an evocative, photorealistic image generation prompt for an editorial photo collage moodboard. It should describe a 4-section seamless luxury collage featuring:
   - A sculptural heavy crystal flacon of Avelore perfume with golden elixir refractions and an engraved brass collar
   - Macro botanical textures (amber resin tears, charred cedarwood, crimson Grasse rose petals, or golden citrus blossoms)
   - Atmospheric twilight salon interior or sun-drenched French terrace
   - Tactile luxury textiles (deep velvet, raw woven silk, fluted glass, antique gold leaf)
   - Style: High fashion Vogue Paris / Architectural Digest editorial photography, warm cinematic lighting, fine art grain, rich Burnt Merlot (#3B0000) and Golden Apricot accents.
2. Formulate a poetic moodboard title in French & English (e.g., "Nocturne d'Ambre · The Resinous Sanctuary").
3. Write a 2-sentence poetic narrative summarizing the sensory harmony between the visual aesthetic and the olfactory notes.
4. Extract 5 evocative palette shades with hex code and romantic name (must include #3B0000 or #FFD482 or complementary hues).
5. List 4 tactile sensory accords.

Return ONLY a JSON object:
{
  "imagePrompt": "A luxurious editorial moodboard collage...",
  "themeTitle": "Nocturne d'Ambre · The Resinous Sanctuary",
  "poeticNarrative": "...",
  "colorPalette": [
    {"hex": "#3B0000", "name": "Burnt Merlot"},
    {"hex": "#FFD482", "name": "Golden Apricot"},
    {"hex": "#8A3B28", "name": "Smoked Terracotta"},
    {"hex": "#2B1410", "name": "French Oak Cask"},
    {"hex": "#FAF2E1", "name": "Warm Parchment"}
  ],
  "sensoryElements": ["Charred French Cedar", "Raw Silk Velvet", "Smoked Labdanum Tears", "Gilded Flacon Collar"]
}`;

    let conceptData: any = null;
    try {
      const conceptRes = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: enricherPrompt }] }],
        config: { responseMimeType: 'application/json' },
      });
      const raw = conceptRes.text || '';
      try {
        conceptData = JSON.parse(raw);
      } catch {
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        conceptData = JSON.parse(cleaned);
      }
    } catch (conceptErr: any) {
      console.warn('Moodboard concept enrichment warning:', conceptErr.message);
      conceptData = {
        imagePrompt: `A luxury editorial haute parfumerie moodboard collage. Heavy faceted crystal flacon with glowing amber elixir, antique brass cap, chiaroscuro lighting, dark French velvet drapery, smoked sandalwood shavings, glistening resin crystals, high fashion Vogue Paris photography, 8k resolution, elegant, Burnt Merlot and Golden Apricot tones.`,
        themeTitle: `${scentFamily} · The Sensory Archive`,
        poeticNarrative: `An intimate visual tapestry capturing the interplay of raw botanical resins, nocturnal shadows, and warm candlelight. Each texture mirrors the lingering sillage of our single-estate distillations.`,
        colorPalette: [
          { hex: '#3B0000', name: 'Burnt Merlot' },
          { hex: '#FFD482', name: 'Golden Apricot' },
          { hex: '#A3684B', name: 'Smoked Amber' },
          { hex: '#22120C', name: 'Roasted Cacao' },
          { hex: '#FAF2E1', name: 'Warm Parchment' },
        ],
        sensoryElements: ['Smoked Amber Resin', 'Crushed Damascena Sepals', 'Hand-Blown Crystal', 'Gilded Parchment'],
      };
    }

    // Step 2: Generate the visual moodboard image using Imagen 3
    let generatedImageUrl: string | null = null;
    let isFallbackImage = false;

    try {
      const imagePrompt = conceptData.imagePrompt || `Editorial luxury perfume moodboard photo collage, flacon, amber resins, velvet textures, warm lighting, cinematic 8k.`;
      const imgRes = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
          outputMimeType: 'image/jpeg',
        },
      });

      const base64Bytes = imgRes.generatedImages?.[0]?.image?.imageBytes;
      if (base64Bytes) {
        generatedImageUrl = `data:image/jpeg;base64,${base64Bytes}`;
      }
    } catch (imgError: any) {
      console.warn('Imagen 3 generation warning (using curated aesthetic fallbacks):', imgError.message);
      isFallbackImage = true;
      // High-resolution curated editorial moodboard asset from public assets
      generatedImageUrl = '/assets/aistudio/Fall_Color_Palette_Inspiration_for_Aesthetic_Recipes_f2b1b735.jpg';
    }

    return res.json({
      success: true,
      moodboard: {
        imageUrl: generatedImageUrl,
        isFallbackImage,
        themeTitle: conceptData.themeTitle,
        poeticNarrative: conceptData.poeticNarrative,
        colorPalette: conceptData.colorPalette,
        sensoryElements: conceptData.sensoryElements,
        inspiration: {
          scentFamily,
          atmosphere,
          lighting,
          paletteTheme,
          customNotes,
        },
        matchedPerfumes: matchedPerfumes.map((p) => ({
          id: p.id,
          name: p.name,
          subtitle: p.subtitle,
          priceFrom: p.priceFrom,
          volume: p.volume,
          category: p.category,
          categoryLabel: p.categoryLabel,
          sizes: p.sizes,
          description: p.description,
          longDescription: p.longDescription,
          visualType: p.visualType,
          colorPalette: p.colorPalette,
          collectionId: p.collectionId,
          notes: p.notes,
        })),
      },
    });
  } catch (error: any) {
    return sendSanitizedError(
      res,
      500,
      'Unable to generate moodboard visual concept at this time.',
      error
    );
  }
});

// Cache for shared moodboards
const SHARED_MOODBOARDS = new Map<string, any>();

// API: Save and generate unique public share link for a moodboard
app.post('/api/moodboard/share', aiRateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      id: customId,
      themeTitle,
      imageUrl,
      isFallbackImage = false,
      poeticNarrative,
      colorPalette = [],
      sensoryElements = [],
      inspiration = {},
      matchedPerfumes = [],
      authorName = 'Avelore Patron',
    } = req.body || {};

    if (!themeTitle || !imageUrl) {
      return res.status(400).json({ error: 'themeTitle and imageUrl are required to generate a public share link.' });
    }

    const uniqueId = customId || `mb-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const moodboardData = {
      id: uniqueId,
      themeTitle,
      imageUrl,
      isFallbackImage,
      poeticNarrative: poeticNarrative || '',
      colorPalette,
      sensoryElements,
      inspiration,
      matchedPerfumes,
      authorName,
      createdAt: new Date().toISOString(),
    };

    // Store in LRU/bounded memory map
    if (SHARED_MOODBOARDS.size > 500) {
      const firstKey = SHARED_MOODBOARDS.keys().next().value;
      if (firstKey) SHARED_MOODBOARDS.delete(firstKey);
    }
    SHARED_MOODBOARDS.set(uniqueId, moodboardData);

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const shareUrl = `${baseUrl}/moodboard/${uniqueId}`;

    return res.json({
      success: true,
      id: uniqueId,
      shareUrl,
      moodboard: moodboardData,
    });
  } catch (error: any) {
    return sendSanitizedError(
      res,
      500,
      'Failed to generate public moodboard share URL.',
      error
    );
  }
});

// API: Fetch a publicly shared moodboard by ID
app.get('/api/moodboard/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const moodboard = SHARED_MOODBOARDS.get(id);
    if (!moodboard) {
      return res.status(404).json({ error: 'Shared moodboard not found or link has expired.' });
    }
    return res.json({ success: true, moodboard });
  } catch (error: any) {
    return sendSanitizedError(
      res,
      500,
      'Error retrieving shared moodboard.',
      error
    );
  }
});


// RFC-compliant email regex and phone validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{5,20}$/;

interface ValidatedEnquiryData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  subject: string;
  message: string;
  userId?: string;
}

// Server-Side Sanitizer & Field Validator for incoming enquiries
function validateAndSanitizeEnquiry(body: any): { valid: true; data: ValidatedEnquiryData } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid payload structure. Object required.' };
  }

  const rawName = body.clientName;
  const rawEmail = body.clientEmail;
  const rawMessage = body.message;
  const rawPhone = body.clientPhone;
  const rawSubject = body.subject;
  const rawUserId = body.userId;

  if (typeof rawName !== 'string' || !rawName.trim()) {
    return { valid: false, error: 'Patron name is required and must be text.' };
  }
  if (typeof rawEmail !== 'string' || !rawEmail.trim()) {
    return { valid: false, error: 'Valid contact email is required.' };
  }
  if (typeof rawMessage !== 'string' || !rawMessage.trim()) {
    return { valid: false, error: 'Inquiry message is required.' };
  }

  const clientName = sanitizeText(rawName, 128);
  const clientEmail = sanitizeText(rawEmail, 256).toLowerCase();
  const message = sanitizeText(rawMessage, 2000);
  const subject = rawSubject ? sanitizeText(rawSubject, 256) : 'Bespoke Atelier Inquiry';

  if (clientName.length < 2) {
    return { valid: false, error: 'Patron name must be at least 2 characters.' };
  }
  if (!EMAIL_REGEX.test(clientEmail)) {
    return { valid: false, error: 'Please enter a valid email address (e.g., patron@domain.com).' };
  }
  if (message.length < 3) {
    return { valid: false, error: 'Inquiry message must contain at least 3 characters.' };
  }

  let clientPhone: string | undefined = undefined;
  if (rawPhone && typeof rawPhone === 'string' && rawPhone.trim()) {
    const cleanPhone = sanitizeText(rawPhone, 32);
    if (!PHONE_REGEX.test(cleanPhone)) {
      return { valid: false, error: 'Please enter a valid contact phone or WhatsApp number.' };
    }
    clientPhone = cleanPhone;
  }

  let userId: string | undefined = undefined;
  if (rawUserId && typeof rawUserId === 'string' && rawUserId.trim()) {
    userId = sanitizeText(rawUserId, 128);
  }

  return {
    valid: true,
    data: {
      clientName,
      clientEmail,
      clientPhone,
      subject,
      message,
      userId,
    },
  };
}

// Dedicated Secure Server-Side Endpoint for Form Enquiries (with strict server-side validation & sanitization)
app.post('/api/enquiries', enquiryRateLimiter, async (req: Request, res: Response) => {
  const rawData = req.body?.data || req.body || {};
  const validation = validateAndSanitizeEnquiry(rawData);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const { clientName, clientEmail, clientPhone, subject, message, userId } = validation.data;
  const enquiryId = `enquiry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    const alertResult = await executeEnquiryAlert({
      type: 'enquiry',
      bookingId: enquiryId,
      clientName,
      clientEmail,
      clientPhone,
      notes: `${subject ? `[${subject}] ` : ''}${message}`,
    });

    const record: NotificationRecord = {
      id: enquiryId,
      type: 'enquiry',
      clientName,
      clientEmail,
      clientPhone,
      boutique: subject || 'Online Inquiry',
      notes: message,
      createdAt: new Date().toISOString(),
      status: 'delivered',
    };
    recentNotifications.unshift(record);
    if (recentNotifications.length > 50) recentNotifications.pop();

    console.log(`[AVELORE SANITIZED ENQUIRY] Submission #${enquiryId} validated & routed.`);

    // Send branded confirmation email to patron using SMTP configuration from .env
    sendEnquiryConfirmationEmail({
      referenceId: enquiryId,
      clientName,
      clientEmail,
      clientPhone,
      subject,
      message,
    }).then((replyResult) => {
      console.log(`[AVELORE AUTOREPLY] Confirmation email sent to [REDACTED] (${replyResult.deliveryMode})`);
    }).catch((err) => {
      console.warn('[AVELORE AUTOREPLY ERROR]', err?.message || 'Auto-reply warning');
    });

    return res.json({
      success: true,
      bookingId: enquiryId,
      referenceId: enquiryId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return sendSanitizedError(
      res,
      500,
      'Failed to process enquiry. Please quote the reference ID if this issue persists.',
      error
    );
  }
});

// Dedicated endpoint for sending patron auto-reply confirmation email
app.post('/api/enquiries/autoreply', async (req: Request, res: Response) => {
  try {
    const rawData = req.body?.data || req.body || {};
    const { referenceId, clientName, clientEmail, clientPhone, subject, message, boutique, date } = rawData;

    if (!clientEmail || !clientName) {
      return res.status(400).json({ error: 'clientName and clientEmail are required for confirmation auto-reply.' });
    }

    const result = await sendEnquiryConfirmationEmail({
      referenceId: referenceId || `enquiry_${Date.now()}`,
      clientName,
      clientEmail,
      clientPhone,
      subject,
      message: message || '',
      boutique,
      date,
    });

    return res.json({
      success: result.success,
      referenceId: result.referenceId,
      deliveryMode: result.deliveryMode,
      timestamp: result.timestamp,
    });
  } catch (error: any) {
    return sendSanitizedError(
      res,
      500,
      'Failed to dispatch confirmation auto-reply.',
      error
    );
  }
});

// Secure Dual-Channel Notification Dispatcher & Cloud Function Gateway (WhatsApp + Email)
app.post(['/api/notify-enquiry', '/api/functions/sendEnquiryAlert'], enquiryRateLimiter, async (req: Request, res: Response) => {

  try {
    // Support both direct express payload and Firebase Functions Callable protocol { data: ... }
    const rawData = req.body?.data || req.body || {};

    const {
      type = 'consultation',
      clientName,
      clientEmail,
      clientPhone,
      boutique,
      date,
      notes,
      savedFragrancesSummary,
      bookingId,
    } = rawData;

    if (!clientName || !clientEmail) {
      return res.status(400).json({ error: 'Client name and email are required.' });
    }

    // Execute Cloud Function dispatching WhatsApp API wrapper & Nodemailer email
    const alertResult = await executeEnquiryAlert({
      type,
      clientName,
      clientEmail,
      clientPhone,
      boutique,
      date,
      notes,
      savedFragrancesSummary,
      bookingId,
    });

    // Save to in-memory notifications for Maison Admin review
    const record: NotificationRecord = {
      id: alertResult.referenceId,
      type,
      clientName: sanitizeText(clientName, 128),
      clientEmail: sanitizeText(clientEmail, 256),
      clientPhone: sanitizeText(clientPhone, 32),
      boutique: sanitizeText(boutique, 128),
      date: sanitizeText(date, 64),
      notes: sanitizeText(notes, 2000),
      savedFragrancesSummary: sanitizeText(savedFragrancesSummary, 2000),
      createdAt: alertResult.timestamp,
      status: 'delivered',
    };
    recentNotifications.unshift(record);
    if (recentNotifications.length > 50) recentNotifications.pop();

    console.log(`[AVELORE DISPATCH] Lead #${alertResult.referenceId} dispatched via WhatsApp (${alertResult.whatsapp.mode}) and Email (${alertResult.email.mode}).`);

    // Return filtered payload without external secrets or recipient addresses
    const payloadResult = {
      success: true,
      bookingId: alertResult.referenceId,
      referenceId: alertResult.referenceId,
      whatsappMode: alertResult.whatsapp.mode,
      emailMode: alertResult.email.mode,
      timestamp: alertResult.timestamp,
    };

    // If request comes from Firebase Functions SDK Callable, wrap inside { data }
    if (req.body?.data) {
      return res.json({ data: payloadResult });
    }

    return res.json(payloadResult);
  } catch (error: any) {
    return sendSanitizedError(
      res,
      500,
      'Failed to process lead notification alert.',
      error
    );
  }
});

// Backend Firestore Trigger Endpoints: captures form submissions and visitor events from Firestore
// Auth signin events are rate-limited to 5/minute per IP (Check 5 compliance)
app.post('/api/triggers/users', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const rawData = req.body?.data || req.body || {};
    const { documentId, data, eventType } = rawData;

    if (!documentId || !data) {
      return res.status(400).json({ error: 'Missing required payload: documentId and data are required.' });
    }

    const result = await handleFirestoreFormSubmission({
      eventType: eventType || 'create',
      collection: 'users',
      documentId,
      data,
    });

    const record: NotificationRecord = {
      id: result.referenceId,
      type: 'signin',
      clientName: sanitizeText(data.displayName || data.clientName || 'Visitor Patron', 128),
      clientEmail: sanitizeText(data.email || data.clientEmail || '', 256),
      clientPhone: sanitizeText(data.phone || data.clientPhone || '', 32),
      boutique: sanitizeText(data.boutique || '', 128),
      date: sanitizeText(data.date || '', 64),
      notes: sanitizeText(data.notes || data.message || 'Visitor Account Activity', 2000),
      savedFragrancesSummary: sanitizeText(data.savedFragrancesSummary || '', 2000),
      createdAt: result.timestamp,
      status: 'delivered',
    };
    recentNotifications.unshift(record);
    if (recentNotifications.length > 50) recentNotifications.pop();

    return res.json({
      success: true,
      message: 'User authentication trigger recorded.',
      referenceId: result.referenceId,
    });
  } catch (error: any) {
    return sendSanitizedError(res, 500, 'Authentication event recording failed.', error);
  }
});

app.post(['/api/triggers/firestore-submission', '/api/triggers/consultations', '/api/triggers/enquiries'], enquiryRateLimiter, async (req: Request, res: Response) => {
  try {
    const rawData = req.body?.data || req.body || {};
    const { collection, documentId, data, eventType } = rawData;

    if (!documentId || !data) {
      return res.status(400).json({ error: 'Missing required trigger payload: documentId and data are required.' });
    }

    const colName = collection === 'enquiries' ? 'enquiries' : 'consultations';
    const result = await handleFirestoreFormSubmission({
      eventType: eventType || 'create',
      collection: colName,
      documentId,
      data,
    });

    // Save to in-memory notifications for Maison Owner review
    const record: NotificationRecord = {
      id: result.referenceId,
      type: colName === 'consultations' ? 'consultation' : 'enquiry',
      clientName: sanitizeText(data.displayName || data.clientName || 'Visitor Patron', 128),
      clientEmail: sanitizeText(data.email || data.clientEmail || '', 256),
      clientPhone: sanitizeText(data.phone || data.clientPhone || '', 32),
      boutique: sanitizeText(data.boutique || '', 128),
      date: sanitizeText(data.date || '', 64),
      notes: sanitizeText(data.notes || data.message || '', 2000),
      savedFragrancesSummary: sanitizeText(data.savedFragrancesSummary || '', 2000),
      createdAt: result.timestamp,
      status: 'delivered',
    };
    recentNotifications.unshift(record);
    if (recentNotifications.length > 50) recentNotifications.pop();

    return res.json({
      success: true,
      message: 'Firestore backend trigger executed successfully.',
      referenceId: result.referenceId,
    });
  } catch (error: any) {
    return sendSanitizedError(res, 500, 'Trigger execution failed.', error);
  }
});

// Admin Route to view recent inquiries (strictly restricted to authenticated owner worktail37@gmail.com)
app.get('/api/admin/notifications', requireAdminAuth, (req: Request, res: Response) => {
  return res.json({
    ownerEmail: OWNER_EMAIL,
    totalRecords: recentNotifications.length,
    notifications: recentNotifications,
  });
});

// Owner WhatsApp Configuration Endpoints (Strictly restricted to authenticated owner worktail37@gmail.com)
app.get('/api/admin/whatsapp-config', requireAdminAuth, (req: Request, res: Response) => {
  return res.json({
    ownerEmail: OWNER_EMAIL,
    ownerWhatsAppNumber: getConfiguredOwnerWhatsAppNumber(),
    schedule: getWhatsAppSchedule(),
    isTwilioConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
  });
});

app.post('/api/admin/whatsapp-config', requireAdminAuth, (req: Request, res: Response) => {
  const { whatsappNumber, schedule } = req.body || {};
  if (typeof whatsappNumber === 'string') {
    setConfiguredOwnerWhatsAppNumber(whatsappNumber);
  }
  if (schedule && typeof schedule === 'object') {
    setWhatsAppSchedule(schedule);
  }
  return res.json({
    success: true,
    message: 'Owner WhatsApp mobile number & business schedule updated successfully.',
    ownerWhatsAppNumber: getConfiguredOwnerWhatsAppNumber(),
    schedule: getWhatsAppSchedule(),
  });
});

// Production Channel Verification Endpoint (Strictly restricted to authenticated owner worktail37@gmail.com + rate limited)
app.post('/api/admin/verify-channel', requireAdminAuth, adminVerificationRateLimiter, async (req: Request, res: Response) => {
  try {
    const testResult = await executeEnquiryAlert({
      type: 'signin',
      bookingId: `VERIFY-${Date.now().toString().slice(-4)}`,
      clientName: 'Avelore Atelier System Verification',
      clientEmail: OWNER_EMAIL,
      notes: 'Operational check: Your WhatsApp and Email notification pipeline is active, secured with TLS, and monitored.',
    });
    return res.json({
      success: true,
      message: 'Channel verification alert dispatched.',
      verificationId: testResult.referenceId,
    });
  } catch (err: any) {
    return sendSanitizedError(res, 500, 'Channel verification dispatch encountered an error.', err);
  }
});

// User Personal Data Erasure & Right to Be Forgotten (GDPR Compliance, max 3/hour per IP)
// Cryptographically checks ownership: caller cannot erase other patrons' data
app.post('/api/user/delete-data', accountDeletionRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, userId } = req.body || {};
    if (!email && !userId) {
      return res.status(400).json({ error: 'User identifier or email required for data erasure.' });
    }

    // Cryptographic Ownership Verification: Caller must be the authenticated user or Maison Owner
    const authUser = await verifyBearerToken(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Authentication token required for personal data erasure.' });
    }

    const targetEmail = String(email || '').toLowerCase().trim();
    const targetUid = String(userId || '').trim();
    const isOwnerAdmin = authUser.isAdmin;
    const isSelf = (targetEmail && targetEmail === authUser.email) || (targetUid && targetUid === authUser.uid);

    if (!isSelf && !isOwnerAdmin) {
      return res.status(403).json({ error: 'Unauthorized: You can only request erasure of your own personal records.' });
    }

    // Purge or anonymize any matching in-memory notifications
    const initialCount = recentNotifications.length;
    recentNotifications = recentNotifications.filter((n) => {
      const matchEmail = targetEmail && n.clientEmail && n.clientEmail.toLowerCase() === targetEmail;
      const matchId = targetUid && n.id === targetUid;
      return !matchEmail && !matchId;
    });
    const purgedCount = initialCount - recentNotifications.length;

    console.log(`[PRIVACY] Cryptographically verified data erasure executed for patron [REDACTED]. ${purgedCount} cached records purged.`);

    return res.json({
      success: true,
      message: 'Personal data records successfully purged from application caches.',
      purgedRecords: purgedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return sendSanitizedError(res, 500, 'Failed to process data erasure request.', error);
  }
});

// Pre-Deployment Check 3: Global Express Error Handling Middleware
// Ensures no uncaught errors ever expose internal stack traces or database info to client
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  return sendSanitizedError(res, 500, 'An unexpected server error occurred.', err);
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`AVELORE Server running on http://localhost:${PORT}`);
    console.log('Notifications configured to deliver to: [REDACTED]');
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
