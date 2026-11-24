import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  assembleProductionTutorPrompt,
  type RuntimeCognitiveState,
} from './src/utils/tutorRuntimeOrchestrator';
import {
  analyzeVoiceSignals,
  createInitialMasterySignals,
  type MasterySignals,
  type VoiceTelemetryInput,
  type WhiteboardTelemetryInput,
} from './src/utils/tutorMasteryEngine';
import type { RuntimeSessionType } from './src/utils/tutorPedagogyEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getGeminiClient(apiVersion?: string): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add it in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    ...(apiVersion ? { apiVersion } : {}),
    httpOptions: {
      ...(apiVersion ? { apiVersion } : {}),
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface ProblemContextPayload {
  problemText?: string;
  fileName?: string;
  fileMimeType?: string;
  fileBase64?: string;
  fileTextContent?: string;
}

function buildProblemSolverSystemInstruction(
  problemContext: ProblemContextPayload,
  grade?: string
): string {
  const gradeLabel = grade ? `Grade ${grade}` : 'school';
  const problemSummaryParts: string[] = [];
  if (problemContext.problemText?.trim()) {
    problemSummaryParts.push(`Student's written problem: "${problemContext.problemText.trim()}"`);
  }
  if (problemContext.fileName) {
    problemSummaryParts.push(`Student's uploaded question file: "${problemContext.fileName}"`);
  }
  if (problemContext.fileTextContent?.trim()) {
    problemSummaryParts.push(
      `Extracted content from the uploaded file:\n${problemContext.fileTextContent.trim().slice(0, 4000)}`
    );
  }

  return [
    `You are Maya, an encouraging, clear ${gradeLabel} AI Tutor inside a dedicated "Solve my Problem" classroom session.`,
    'STRICT SCOPE RULE: Base your ENTIRE conversation exclusively on the specific problem the student uploaded or wrote below. Do NOT bring up unrelated topics, random warm-ups, or outside lessons.',
    'If the student asks about something unrelated to their submitted problem, gently remind them this classroom is focused on their submitted problem and steer them back to the next step of solving it.',
    'Guide the student step-by-step: first restate the key given information from their problem, then walk through the reasoning clearly, check their understanding, and if they make a mistake explain why and show the right step.',
    'Keep replies warm, structured, clear, and concise (3 to 5 crisp sentences without raw markdown code fences so they read cleanly in text and sound natural if read aloud).',
    ...problemSummaryParts,
  ]
    .filter(Boolean)
    .join(' ');
}

function buildAnglesSystemInstruction(context?: {
  grade?: string;
  subject?: string;
  topic?: string;
  stageTitle?: string;
  studentAngle?: number;
  lastAttempt?: string;
  problemContext?: ProblemContextPayload;
}): string {
  if (context?.problemContext) {
    return buildProblemSolverSystemInstruction(context.problemContext, context.grade);
  }

  const grade = context?.grade || '5';
  const subject = context?.subject || 'Mathematics';
  const topic = context?.topic || 'Angles';
  const stageLine = context?.stageTitle
    ? `Current classroom activity: ${context.stageTitle}.`
    : '';
  const angleLine =
    typeof context?.studentAngle === 'number'
      ? `The student's interactive protractor ray is currently set to ${context.studentAngle} degrees.`
      : '';
  const attemptLine = context?.lastAttempt
    ? `Most recent student action: ${context.lastAttempt}.`
    : '';

  const isWaterCycle =
    topic.toLowerCase().includes('water cycle') ||
    (subject.toLowerCase().includes('science') &&
      (topic.toLowerCase().includes('water') ||
        topic.toLowerCase().includes('weather') ||
        topic.toLowerCase().includes('evaporation')));

  if (isWaterCycle) {
    return [
      'You are Maya, an experienced, warm, encouraging Class 6 Science teacher (for 11–12 year old students) leading an interactive animated session on "Water Cycle and Weather".',
      'Use simple, conversational, age-appropriate English. Clearly explain scientific terms like Evaporation, Condensation, Precipitation, Collection, Temperature, Humidity, Wind, and Cloud Cover using real-world everyday examples (a sunny puddle drying up, water droplets on a cold glass of lemonade, dark storm clouds).',
      'Keep replies natural, spoken-friendly, and concise (2 to 4 short sentences, no markdown bullets or asterisks so they read cleanly in text chat and sound natural when read aloud in Voice mode).',
      'Whenever the student gets an activity or quiz question wrong: kindly explain why in simple Class 6 words, highlight the right scientific process, and encourage them to keep exploring.',
      stageLine,
      attemptLine,
    ]
      .filter(Boolean)
      .join(' ');
  }

  return [
    `You are Maya, a warm, lively, encouraging AI Tutor teaching Class ${grade} ${subject} on the topic "${topic}".`,
    'You are speaking aloud with a Class 5 student in an interactive voice classroom.',
    'Keep every reply natural, spoken-friendly, and concise (2 to 4 short sentences, no markdown bullets, asterisks, or raw LaTeX symbols so it sounds great when read aloud).',
    'Whenever the student gets an answer or drawn angle wrong: gently explain WHY their choice was off, clearly state the CORRECT answer, give one relatable Class 5 real-world example (like a pizza slice, notebook corner, open door, or clock hands), and invite them to try again or move forward.',
    'Whenever the student succeeds: celebrate specifically what they got right and ask a quick curious follow-up or guide them to the next interactive angle challenge.',
    stageLine,
    angleLine,
    attemptLine,
  ]
    .filter(Boolean)
    .join(' ');
}

interface TutorHistoryTurn {
  sender: 'maya' | 'student';
  text: string;
}

function formatGeminiError(
  err: unknown,
  fallback: string,
  scope: 'chat' | 'tts' | 'transcribe' = 'chat'
): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  if (raw.includes('GEMINI_API_KEY is not configured')) {
    return { status: 500, message: raw };
  }
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('Quota exceeded')) {
    return {
      status: 429,
      message:
        scope === 'tts'
          ? 'Voice audio quota limit reached for now. Please retry later or use Text mode.'
          : scope === 'transcribe'
          ? 'Voice transcription quota limit reached for now. Please type your message instead.'
          : 'AI Tutor rate limit reached for now. Please wait a moment and try again.',
    };
  }
  if (raw.includes('503') || raw.includes('UNAVAILABLE') || raw.includes('high demand')) {
    return {
      status: 503,
      message: 'Maya is briefly busy due to high demand. Please try again in a few seconds.',
    };
  }
  // Never dump raw multi-kilobyte JSON stack payloads into the UI
  if (raw.startsWith('{') || raw.length > 180) {
    return { status: 502, message: fallback };
  }
  return { status: 500, message: raw || fallback };
}

type ServerAccountRole = 'student' | 'parent' | 'teacher' | 'school';

interface StoredAuthUser {
  id: string;
  email: string;
  userId: string;
  fullName: string;
  role: ServerAccountRole;
  grade: string;
  curriculum: string;
  subjects: string[];
  learningStyle: 'Visual' | 'Interactive' | 'Step-by-Step' | 'Practice-First';
  organizationName?: string;
  childName?: string;
  authProvider: 'password' | 'google' | 'microsoft' | 'organisation';
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
}

interface ActiveSessionRecord {
  userId: string;
  email: string;
  expiresAt: number;
}

const VALID_ROLES = new Set<ServerAccountRole>(['student', 'parent', 'teacher', 'school']);
const VALID_STYLES = new Set(['Visual', 'Interactive', 'Step-by-Step', 'Practice-First']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const authUsersByEmail = new Map<string, StoredAuthUser>();
const authSessionsByToken = new Map<string, ActiveSessionRecord>();

function hashPasswordScrypt(password: string, saltHex?: string): { salt: string; hash: string } {
  const salt = saltHex ?? crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash: derived };
}

function verifyPasswordScrypt(password: string, salt: string, expectedHashHex: string): boolean {
  const actualBuf = crypto.scryptSync(password, salt, 64);
  const expectedBuf = Buffer.from(expectedHashHex, 'hex');
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

function seedDemoAuthAccount() {
  const demoEmail = 'you@your.edu';
  if (authUsersByEmail.has(demoEmail)) return;
  const { salt, hash } = hashPasswordScrypt('You1234');
  authUsersByEmail.set(demoEmail, {
    id: 'usr_demo_student',
    email: demoEmail,
    userId: 'you',
    fullName: 'Jane Carter',
    role: 'student',
    grade: '9',
    curriculum: 'CCSS',
    subjects: ['English', 'Mathematics', 'Science'],
    learningStyle: 'Interactive',
    authProvider: 'password',
    passwordSalt: salt,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  });
}

seedDemoAuthAccount();

function sanitizePublicUser(user: StoredAuthUser) {
  return {
    id: user.id,
    email: user.email,
    userId: user.userId,
    fullName: user.fullName,
    role: user.role,
    grade: user.grade,
    curriculum: user.curriculum,
    subjects: user.subjects,
    learningStyle: user.learningStyle,
    organizationName: user.organizationName,
    childName: user.childName,
  };
}

function issueSessionToken(user: StoredAuthUser, rememberMe = false): string {
  const token = crypto.randomBytes(32).toString('hex');
  const ttlMs = rememberMe ? 1000 * 60 * 60 * 24 * 14 : 1000 * 60 * 60 * 12;
  authSessionsByToken.set(token, {
    userId: user.id,
    email: user.email,
    expiresAt: Date.now() + ttlMs,
  });
  return token;
}

function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // 0. Authentication & Registration Endpoints (scrypt hashed passwords + Bearer session tokens)
  app.post('/api/auth/register', (req, res) => {
    const body = req.body as {
      fullName?: string;
      email?: string;
      password?: string;
      role?: string;
      grade?: string;
      curriculum?: string;
      subjects?: unknown;
      learningStyle?: string;
      organizationName?: string;
      childName?: string;
    };

    const fullName = String(body.fullName ?? '').trim().slice(0, 120);
    const email = String(body.email ?? '').trim().toLowerCase().slice(0, 254);
    const password = String(body.password ?? '');
    const role = (VALID_ROLES.has(body.role as ServerAccountRole)
      ? body.role
      : 'student') as ServerAccountRole;

    if (fullName.length < 2) {
      res.status(400).json({ error: 'Full name must be at least 2 characters.' });
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
      return;
    }
    if (authUsersByEmail.has(email)) {
      res.status(409).json({
        error: 'An account with this email already exists. Please sign in instead.',
      });
      return;
    }

    const { salt, hash } = hashPasswordScrypt(password);
    const subjects = Array.isArray(body.subjects)
      ? body.subjects
          .map((s) => String(s).trim())
          .filter(Boolean)
          .slice(0, 8)
      : ['Mathematics', 'Science', 'English'];
    const learningStyle = VALID_STYLES.has(String(body.learningStyle ?? ''))
      ? (body.learningStyle as StoredAuthUser['learningStyle'])
      : 'Interactive';

    const user: StoredAuthUser = {
      id: `usr_${crypto.randomBytes(8).toString('hex')}`,
      email,
      userId: email.split('@')[0],
      fullName,
      role,
      grade: String(body.grade ?? '9').trim().slice(0, 24) || '9',
      curriculum: String(body.curriculum ?? 'CCSS').trim().slice(0, 32) || 'CCSS',
      subjects: subjects.length > 0 ? subjects : ['Mathematics', 'Science', 'English'],
      learningStyle,
      organizationName: body.organizationName
        ? String(body.organizationName).trim().slice(0, 120)
        : undefined,
      childName: body.childName ? String(body.childName).trim().slice(0, 100) : undefined,
      authProvider: 'password',
      passwordSalt: salt,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    };

    authUsersByEmail.set(email, user);
    const token = issueSessionToken(user, true);

    res.status(201).json({
      token,
      user: sanitizePublicUser(user),
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const body = req.body as {
      identifier?: string;
      password?: string;
      rememberMe?: boolean;
    };

    const identifier = String(body.identifier ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!identifier || !password) {
      res.status(400).json({ error: 'User ID / email and password are required.' });
      return;
    }

    let matchedUser = authUsersByEmail.get(identifier);
    if (!matchedUser) {
      for (const candidate of authUsersByEmail.values()) {
        if (candidate.userId.toLowerCase() === identifier) {
          matchedUser = candidate;
          break;
        }
      }
    }

    if (
      !matchedUser ||
      !verifyPasswordScrypt(password, matchedUser.passwordSalt, matchedUser.passwordHash)
    ) {
      res.status(401).json({
        error: 'Invalid credentials. Check your email/User ID and password, or create a free account.',
      });
      return;
    }

    const token = issueSessionToken(matchedUser, Boolean(body.rememberMe));
    res.json({
      token,
      user: sanitizePublicUser(matchedUser),
    });
  });

  app.post('/api/auth/sso', (req, res) => {
    const body = req.body as {
      provider?: string;
      email?: string;
      fullName?: string;
      organizationName?: string;
      role?: string;
    };

    const allowedProviders = new Set(['google', 'microsoft', 'organisation']);
    const provider = String(body.provider ?? '').toLowerCase();
    if (!allowedProviders.has(provider)) {
      res.status(400).json({ error: 'Unsupported sign-in provider.' });
      return;
    }

    const email = String(body.email ?? '').trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      res.status(400).json({ error: 'Please enter a valid account or school email address.' });
      return;
    }

    let user = authUsersByEmail.get(email);
    if (user && user.authProvider !== provider) {
      res.status(409).json({
        error:
          user.authProvider === 'password'
            ? 'This email is registered with a password. Please sign in with your email and password.'
            : `This email is linked with ${user.authProvider} sign-in. Please continue with that provider.`,
      });
      return;
    }
    if (!user) {
      const derivedName =
        String(body.fullName ?? '').trim().slice(0, 120) ||
        email
          .split('@')[0]
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (ch) => ch.toUpperCase());
      const role = (VALID_ROLES.has(body.role as ServerAccountRole)
        ? body.role
        : provider === 'organisation'
        ? 'school'
        : 'student') as ServerAccountRole;
      const randomNonce = crypto.randomBytes(24).toString('hex');
      const { salt, hash } = hashPasswordScrypt(randomNonce);
      user = {
        id: `usr_${crypto.randomBytes(8).toString('hex')}`,
        email,
        userId: email.split('@')[0],
        fullName: derivedName,
        role,
        grade: role === 'school' ? 'K-12' : '9',
        curriculum: 'CCSS',
        subjects: ['Mathematics', 'Science', 'English'],
        learningStyle: 'Interactive',
        organizationName: body.organizationName
          ? String(body.organizationName).trim().slice(0, 120)
          : undefined,
        authProvider: provider as 'google' | 'microsoft' | 'organisation',
        passwordSalt: salt,
        passwordHash: hash,
        createdAt: new Date().toISOString(),
      };
      authUsersByEmail.set(email, user);
    }

    const token = issueSessionToken(user, true);
    res.json({
      token,
      user: sanitizePublicUser(user),
    });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const email = String((req.body as { email?: string })?.email ?? '').trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    // Always return neutral confirmation to prevent account enumeration
    res.json({
      ok: true,
      message: `If an account exists for ${email}, password reset instructions have been sent.`,
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const session = authSessionsByToken.get(token);
    if (!session || session.expiresAt < Date.now()) {
      if (session) authSessionsByToken.delete(token);
      res.status(401).json({ error: 'Session expired. Please sign in again.' });
      return;
    }
    const user = authUsersByEmail.get(session.email);
    if (!user) {
      res.status(401).json({ error: 'Account not found.' });
      return;
    }
    res.json({ user: sanitizePublicUser(user) });
  });

  app.post('/api/auth/logout', (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    if (token) {
      authSessionsByToken.delete(token);
    }
    res.json({ ok: true });
  });

  // 1. Conversational AI Tutor endpoint (gemini-4-hydrogen + 9-Layer Production Prompt Pack v1.0)
  app.post('/api/tutor/chat', async (req, res) => {
    try {
      const { message, history = [], context } = req.body as {
        message?: string;
        history?: TutorHistoryTurn[];
        context?: {
          sessionId?: string;
          studentId?: string;
          sessionType?: RuntimeSessionType;
          grade?: string;
          curriculum?: string;
          subject?: string;
          topic?: string;
          voiceMode?: boolean;
          whiteboardMode?: boolean;
          remainingTime?: number;
          currentState?: RuntimeCognitiveState;
          masterySignals?: MasterySignals;
          consecutiveConfusionTurns?: number;
          recoveryAttemptsCount?: number;
          inactivitySeconds?: number;
          isClosingPhase?: boolean;
          whiteboardTelemetry?: WhiteboardTelemetryInput | null;
          voiceTelemetry?: VoiceTelemetryInput | null;
          interruptedTutorText?: string | null;
          stageTitle?: string;
          studentAngle?: number;
          lastAttempt?: string;
          problemContext?: ProblemContextPayload;
        };
      };

      const trimmedMessage = (message ?? '').trim();
      if (!trimmedMessage) {
        res.status(400).json({ error: 'Message text is required.' });
        return;
      }

      // Deterministic 9-Layer Runtime Prompt Assembly & Authority Hierarchy Enforcement (Sec 52–54)
      const orchestrated = assembleProductionTutorPrompt({
        runtimeVars: {
          session_id: context?.sessionId,
          student_id: context?.studentId,
          session_type:
            context?.sessionType ??
            (context?.problemContext ? 'homework_help' : 'concept_mastery'),
          subject: context?.subject || 'Mathematics',
          grade_level: context?.grade || '9',
          curriculum_framework: context?.curriculum || 'CCSS',
          lesson: context?.topic || 'Guided Lesson',
          topic: context?.topic || 'Core Concept',
          voice_mode: Boolean(context?.voiceMode),
          whiteboard_mode: Boolean(context?.whiteboardMode),
          remaining_time: context?.remainingTime,
        },
        studentMessage: trimmedMessage,
        currentState: context?.currentState ?? 'stable_learning',
        masterySignals: context?.masterySignals ?? createInitialMasterySignals(),
        consecutiveConfusionTurns: context?.consecutiveConfusionTurns ?? 0,
        recoveryAttemptsCount: context?.recoveryAttemptsCount ?? 0,
        inactivitySeconds: context?.inactivitySeconds ?? 0,
        isClosingPhase: Boolean(context?.isClosingPhase),
        whiteboardTelemetry: context?.whiteboardTelemetry ?? null,
        voiceTelemetry:
          context?.voiceTelemetry ??
          (context?.interruptedTutorText
            ? {
                transcript: trimmedMessage,
                interruptedTutorText: context.interruptedTutorText,
                turnCountWithConfusion: context?.consecutiveConfusionTurns ?? 0,
              }
            : null),
        problemContext: context?.problemContext
          ? {
              problemText: context.problemContext.problemText,
              fileName: context.problemContext.fileName,
              fileTextContent: context.problemContext.fileTextContent,
            }
          : null,
        stageTitle: context?.stageTitle,
        studentAngle: context?.studentAngle,
        lastAttempt: context?.lastAttempt,
      });

      // Section 6: Prompt Injection Safety — calmly redirect without invoking model override
      if (orchestrated.decision.direct_safe_reply) {
        res.json({
          reply: orchestrated.decision.direct_safe_reply,
          runtimeDecision: orchestrated.decision,
        });
        return;
      }

      const ai = getGeminiClient();

      // Attach uploaded image/PDF as inlineData on the initial problem context turn so Gemini reads it directly
      const userParts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      > = [];
      const pCtx = context?.problemContext;
      if (
        pCtx?.fileBase64 &&
        pCtx.fileMimeType &&
        (pCtx.fileMimeType.startsWith('image/') || pCtx.fileMimeType === 'application/pdf')
      ) {
        userParts.push({
          inlineData: {
            mimeType: pCtx.fileMimeType,
            data: pCtx.fileBase64,
          },
        });
      }
      userParts.push({ text: trimmedMessage });

      const contents = [
        ...history.slice(-8).map((turn) => ({
          role: turn.sender === 'student' ? 'user' : 'model',
          parts: [{ text: turn.text }],
        })),
        {
          role: 'user',
          parts: userParts,
        },
      ];

      // Combine legacy classroom-specific nuance (if Angles/WaterCycle) under the 9-Layer Governance Instruction
      const systemInstruction = orchestrated.systemInstruction;
      const chatModels: Array<{ model: string; useThinking: boolean }> = [
        { model: 'gemini-4-hydrogen', useThinking: true },
        { model: 'gemini-3.1-flash-lite', useThinking: false },
      ];

      let response;
      let lastErr: unknown = null;
      for (let idx = 0; idx < chatModels.length; idx++) {
        const candidate = chatModels[idx];
        try {
          response = await ai.models.generateContent({
            model: candidate.model,
            contents,
            config: {
              systemInstruction,
              ...(candidate.useThinking
                ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
                : {}),
            },
          });
          lastErr = null;
          break;
        } catch (innerErr: unknown) {
          lastErr = innerErr;
          const msg = innerErr instanceof Error ? innerErr.message : String(innerErr ?? '');
          const isRetryable =
            msg.includes('429') ||
            msg.includes('RESOURCE_EXHAUSTED') ||
            msg.includes('Quota exceeded') ||
            msg.includes('503') ||
            msg.includes('UNAVAILABLE');
          if (idx < chatModels.length - 1 && isRetryable) {
            await new Promise((r) => setTimeout(r, 350));
            continue;
          }
          throw innerErr;
        }
      }
      if (lastErr && !response) {
        throw lastErr;
      }

      const reply = response?.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'Maya returned an empty response. Please try again.' });
        return;
      }

      res.json({ reply, runtimeDecision: orchestrated.decision });
    } catch (err: unknown) {
      console.error('[POST /api/tutor/chat]', err);
      const formatted = formatGeminiError(err, 'Failed to reach AI Tutor service.', 'chat');
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // In-memory TTS cache + per-model quota cooldown to preserve free-tier daily quota
  const ttsAudioCache = new Map<string, { audioBase64: string; mimeType: string }>();
  const ttsModelCooldownUntil = new Map<string, number>();

  // 2. Text-to-Speech endpoint (gemini-3.8-flash-lite-tts -> gemini-3.8-flash-tts -> browser speech fallback)
  app.post('/api/tutor/tts', async (req, res) => {
    try {
      const { text, spokenCognitiveLoad = 'low' } = req.body as {
        text?: string;
        spokenCognitiveLoad?: 'low' | 'moderate' | 'high';
      };
      const cleanText = (text ?? '').replace(/[*_`#]/g, '').trim();
      if (!cleanText) {
        res.status(400).json({ error: 'Text is required for speech synthesis.' });
        return;
      }

      const cacheKey = `${spokenCognitiveLoad}::${cleanText}`;
      const cached = ttsAudioCache.get(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const ai = getGeminiClient('v1beta');
      const ttsModels = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];
      const now = Date.now();
      let quotaExhausted = false;
      let lastNonQuotaErr: unknown = null;

      // Section 34 & 35: Adapt spoken delivery style to cognitive load
      const speechStyle =
        spokenCognitiveLoad === 'high'
          ? 'Calm, unhurried, gentle school tutor speaking slowly with clear pauses'
          : spokenCognitiveLoad === 'moderate'
          ? 'Warm, steady, patient school tutor with clear articulation'
          : 'Warm, encouraging school tutor with clear conversational pronunciation';

      for (const modelName of ttsModels) {
        const cooldownUntil = ttsModelCooldownUntil.get(modelName) ?? 0;
        if (cooldownUntil > now) {
          quotaExhausted = true;
          continue;
        }

        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: cleanText,
                    speechMetadata: {
                      style: speechStyle,
                    },
                  },
                ],
              },
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
              },
            },
          });

          const inlineAudio =
            response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          const audioBase64 = inlineAudio?.data;

          if (audioBase64) {
            const payload = {
              audioBase64,
              mimeType: inlineAudio?.mimeType || 'audio/wav',
            };
            if (ttsAudioCache.size >= 60) {
              const firstKey = ttsAudioCache.keys().next().value;
              if (firstKey) ttsAudioCache.delete(firstKey);
            }
            ttsAudioCache.set(cacheKey, payload);
            res.json(payload);
            return;
          }
        } catch (modelErr: unknown) {
          const msg = modelErr instanceof Error ? modelErr.message : String(modelErr ?? '');
          const isQuotaOrRateLimit =
            msg.includes('429') ||
            msg.includes('RESOURCE_EXHAUSTED') ||
            msg.includes('Quota exceeded');

          if (isQuotaOrRateLimit) {
            quotaExhausted = true;
            // Pause retrying this specific TTS model for 15 minutes to avoid repeated 429s
            ttsModelCooldownUntil.set(modelName, Date.now() + 15 * 60 * 1000);
            continue;
          }

          if (msg.includes('503') || msg.includes('UNAVAILABLE')) {
            lastNonQuotaErr = modelErr;
            continue;
          }

          throw modelErr;
        }
      }

      if (quotaExhausted) {
        console.warn(
          '[POST /api/tutor/tts] Gemini TTS free-tier quota reached; delegating playback to browser speech synthesis.'
        );
        res.json({
          fallbackMode: 'browser_speech',
          notice: 'Using built-in browser voice while Gemini TTS daily free-tier quota resets.',
        });
        return;
      }

      if (lastNonQuotaErr) {
        throw lastNonQuotaErr;
      }

      res.status(502).json({ error: 'Speech synthesis did not return audio data.' });
    } catch (err: unknown) {
      console.error('[POST /api/tutor/tts]', err);
      const formatted = formatGeminiError(err, 'Failed to synthesize tutor voice.', 'tts');
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // 3. Audio Transcription endpoint (gemini-3.5-transcribe)
  app.post('/api/tutor/transcribe', async (req, res) => {
    try {
      const { audioBase64, mimeType = 'audio/webm' } = req.body as {
        audioBase64?: string;
        mimeType?: string;
      };

      if (!audioBase64) {
        res.status(400).json({ error: 'Audio recording data is required.' });
        return;
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
            {
              text: 'Transcribe what the student said accurately. Respect diverse accents, hesitations, and multilingual code-switching faithfully without inventing unclear words. Return only the spoken words.',
            },
          ],
        },
      });

      const transcript = response.text?.trim() ?? '';
      const voiceAnalysis = analyzeVoiceSignals({ transcript });
      res.json({
        transcript,
        speechConfidence: voiceAnalysis.speechConfidence,
        codeSwitchingDetected:
          /\b(matlab|samajh|nahi|pero|entonces|donc|yaani|kya|por qué)\b/i.test(transcript),
      });
    } catch (err: unknown) {
      console.error('[POST /api/tutor/transcribe]', err);
      const formatted = formatGeminiError(err, 'Failed to transcribe voice input.', 'transcribe');
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // Vite middleware in dev; static bundle in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tutor Cloud server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
