import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  AudioLines,
  Bold,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileText,
  Globe,
  HelpCircle,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  LogOut,
  MessageSquare,
  Mic,
  MicOff,
  PanelRightClose,
  Paperclip,
  PenSquare,
  Pin,
  PlusCircle,
  RotateCcw,
  Send,
  Sigma,
  Sparkles,
  Square,
  SquarePen,
  Strikethrough,
  Type,
  Underline,
  Volume2,
  VolumeX,
  Wifi,
  X,
} from 'lucide-react';
import type { StartSessionInput, StudentProfile } from '../types/dashboard';
import {
  buildClassroomWelcome,
  formatTimerClock,
  isAnglesSession,
  resolveInteractionModeLayout,
  type ClassroomInteractionMode,
  type PlottedExpression,
} from '../utils/classroomLogic';
import {
  formatFileSizeLabel,
  isProblemSolverSession,
} from '../utils/problemSolverLogic';
import { CLASS_5_ANGLES_STAGES, type AngleLessonStage } from '../utils/anglesLogic';
import {
  WATER_CYCLE_CHAPTERS,
  isWaterCycleSession,
  type WaterCycleChapter,
} from '../utils/waterCycleLogic';
import { useTutorVoice } from '../hooks/useTutorVoice';
import {
  ClassroomRightPanel,
  type ClassroomPanelId,
  type PinnedMessageItem,
} from './ClassroomRightPanel';
import { ClassroomWhiteboard } from './ClassroomWhiteboard';
import { InkEquationPopover, MathSymbolsPopover } from './ClassroomMathPopovers';
import { AnglesInteractiveStudio } from './AnglesInteractiveStudio';
import { WaterCycleInteractiveStudio } from './WaterCycleInteractiveStudio';
import { AgentThinkingIndicator } from './ui/CraftPrimitives';
import { MascotHelperPopup } from './MascotHelperPopup';
import { SessionClosureModal } from './SessionClosureModal';
import { playUiSound } from '../utils/uiSounds';
import {
  classifySubjectPedagogy,
  mapHelpTypeToRuntimeSessionType,
} from '../utils/tutorPedagogyEngine';
import {
  analyzeWhiteboardSignals,
  applyAssessmentEventToSignals,
  createInitialMasterySignals,
  evaluateMastery,
  type MasterySignals,
  type VoiceTelemetryInput,
  type WhiteboardTelemetryInput,
} from '../utils/tutorMasteryEngine';
import {
  buildSessionClosureReport,
  inspectStudentTurn,
  type RuntimeCognitiveState,
  type SessionClosureReport,
} from '../utils/tutorRuntimeOrchestrator';

interface ClassroomChatMessage {
  id: string;
  sender: 'maya' | 'student';
  text: string;
  timestamp: string;
  chips?: string[];
  spoken?: boolean;
}

interface SessionClassroomProps {
  session: StartSessionInput;
  profile: StudentProfile;
  onEndSession: (closureReport?: SessionClosureReport) => void;
  onSaveTeacherNote?: (subject: string, topic: string, noteText: string) => void;
  onOpenMyNotes?: () => void;
}

const MayaAvatar: React.FC<{ size?: number; speaking?: boolean }> = ({
  size = 34,
  speaking = false,
}) => (
  <div className="relative shrink-0 inline-flex items-center justify-center">
    {speaking && (
      <span
        aria-hidden="true"
        className="absolute -inset-1 rounded-full border-2 border-emerald-400/80 animate-ping"
      />
    )}
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="relative rounded-full shrink-0"
    >
      <circle cx="24" cy="24" r="23" fill="#FFF7ED" stroke="#F59E0B" strokeWidth="1.5" />
      <path d="M12 24C12 14 17 9 24 9C31 9 36 14 36 24V35H12V24Z" fill="#1E293B" />
      <path d="M9 46C11 36 16 33 24 33C32 33 37 36 39 46" fill="#0F294A" />
      <circle cx="24" cy="22" r="8.5" fill="#F4C7A1" />
      <path
        d="M15.5 20C17 14 21 12 24 12C28 12 31.5 14 32.5 20C29.5 17 26.5 16 22 16.5C19 16.8 17 18.2 15.5 20Z"
        fill="#0F172A"
      />
      <circle cx="21" cy="22" r="1.2" fill="#0F172A" />
      <circle cx="27" cy="22" r="1.2" fill="#0F172A" />
      <path
        d="M21.5 26C22.8 27.5 25.2 27.5 26.5 26"
        stroke="#9A3412"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

const VoiceWaveBars: React.FC<{ active: boolean; level?: number; colorClass?: string }> = ({
  active,
  level = 0.6,
  colorClass = 'bg-emerald-500',
}) => {
  const heights = active
    ? [
        Math.max(28, Math.round(45 + level * 45)),
        Math.max(40, Math.round(70 + level * 30)),
        Math.max(32, Math.round(52 + level * 42)),
        Math.max(45, Math.round(80 + level * 20)),
        Math.max(26, Math.round(40 + level * 48)),
      ]
    : [22, 22, 22, 22, 22];

  return (
    <span className="inline-flex h-5 items-center gap-[3px]" aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full transition-all duration-150 ${colorClass}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </span>
  );
};

const INITIAL_EXPRESSIONS: PlottedExpression[] = [
  { id: 'exp-1', formula: 'y = 2x² + 4x - 1', color: '#1D4ED8', visible: true },
  { id: 'exp-2', formula: 'y = sin(x)', color: '#16A34A', visible: true },
];

const EXPRESSION_COLORS = ['#1D4ED8', '#16A34A', '#EA580C', '#9333EA', '#DC2626'];

const ANGLES_VOICE_PROMPTS = [
  'What makes an angle obtuse?',
  'Give me a real-life right angle example',
  'How do I find a missing angle on a 180° line?',
];

const PROBLEM_SOLVER_PROMPTS = [
  'Walk me through Step 1 of this problem',
  'Give me a hint, not the full answer',
  'Check my understanding of the key concept',
];

const WATER_CYCLE_PROMPTS = [
  'How does the Sun drive evaporation?',
  'Why do clouds form high in the sky?',
  'How are humidity and rain connected?',
];

function getNowClockLabel(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export const SessionClassroom: React.FC<SessionClassroomProps> = ({
  session,
  profile,
  onEndSession,
  onSaveTeacherNote,
  onOpenMyNotes,
}) => {
  const problemSolverMode = isProblemSolverSession(session);
  const problemSolver = session.problemSolver;
  const waterCycleMode = !problemSolverMode && isWaterCycleSession(session);
  const anglesMode = !problemSolverMode && !waterCycleMode && isAnglesSession(session);
  const resolvedGrade =
    session.gradeLevel || (anglesMode ? '5' : waterCycleMode ? '6' : profile.grade);
  const welcomeData = buildClassroomWelcome(session, resolvedGrade);

  // TutorCloud Production Runtime State (Sections 5, 16–22A, 25, 28–33, 51–54)
  const sessionIdRef = useRef<string>(`ses_${Date.now()}`);
  const runtimeSessionType = mapHelpTypeToRuntimeSessionType(session.helpType, problemSolverMode);
  const subjectClassification = classifySubjectPedagogy(session.subject, session.topic);
  const [masterySignals, setMasterySignals] = useState<MasterySignals>(() =>
    createInitialMasterySignals()
  );
  const masteryEvaluation = evaluateMastery(masterySignals);
  const [runtimeCognitiveState, setRuntimeCognitiveState] =
    useState<RuntimeCognitiveState>('stable_learning');
  const [consecutiveConfusionTurns, setConsecutiveConfusionTurns] = useState(0);
  const [recoveryAttemptsCount, setRecoveryAttemptsCount] = useState(0);
  const [completedActivityLabels, setCompletedActivityLabels] = useState<string[]>([]);
  const [teacherEscalation, setTeacherEscalation] = useState<{
    reason: string;
    saved: boolean;
  } | null>(null);
  const [showClosureModal, setShowClosureModal] = useState(false);
  const lastStudentActivityRef = useRef<number>(Date.now());
  const silencePromptShownRef = useRef<boolean>(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(17);
  const totalSessionSeconds = 45 * 60;

  // Voice mode active by default for Class 5 Angles voice classroom
  const [interactionMode, setInteractionMode] = useState<ClassroomInteractionMode>(
    anglesMode ? 'voice' : 'text'
  );
  const [muted, setMuted] = useState(false);
  const [activePanel, setActivePanel] = useState<ClassroomPanelId>(null);
  const [panelExpanded, setPanelExpanded] = useState(false);

  const { chatDrawerOpen, showVoiceDock } = resolveInteractionModeLayout(interactionMode);
  const isChatDrawerVisible = chatDrawerOpen && !activePanel;

  const [mathMode, setMathMode] = useState(true);
  const [teachLanguage, setTeachLanguage] = useState<'EN' | 'ES' | 'FR' | 'DE'>('EN');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activePopover, setActivePopover] = useState<'graphing' | 'ink' | 'whiteboard' | null>(
    null
  );

  // Interactive Class 5 Angles stage state
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [completedStageIds, setCompletedStageIds] = useState<string[]>([]);
  const [liveStudentAngle, setLiveStudentAngle] = useState<number>(
    CLASS_5_ANGLES_STAGES[0].initialDegrees ?? 115
  );

  // Interactive Class 6 Science: Water Cycle chapter state
  const [activeWaterCycleChapter, setActiveWaterCycleChapter] = useState(0);
  const [completedWaterCycleChapters, setCompletedWaterCycleChapters] = useState<string[]>([
    'intro',
  ]);

  const [expressions, setExpressions] = useState<PlottedExpression[]>(INITIAL_EXPRESSIONS);
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessageItem[]>(() => {
    if (problemSolverMode && problemSolver) {
      const summary = problemSolver.problemText.trim()
        ? problemSolver.problemText.trim()
        : `Uploaded problem file: ${problemSolver.attachment?.fileName ?? 'Question file'}`;
      return [
        {
          id: 'pin-problem-1',
          author: profile.firstName,
          timestamp: 'Today',
          text: `Submitted Problem: ${summary}`,
        },
      ];
    }
    if (waterCycleMode) {
      return [
        {
          id: 'pin-wc-1',
          author: 'Maya',
          timestamp: 'Today',
          text: 'Water Cycle Cheat Sheet: 1) Evaporation (Sun heats liquid → vapour), 2) Condensation (cool sky → cloud droplets), 3) Precipitation (heavy drops fall as rain/snow/hail), 4) Collection (rivers, lakes, oceans & groundwater).',
        },
      ];
    }
    return [
      {
        id: 'pin-init-1',
        author: 'Maya',
        timestamp: 'Today',
        text: anglesMode
          ? 'Angle Cheat Sheet: Acute < 90° (sharp), Right = 90° (square corner), Obtuse = 91°–179° (wide), Straight = 180° (flat line).'
          : 'It looks like that might have been a typing mistake 😊. Could you tell me which text feature feels confusing: headings, captions, or diagrams?',
      },
    ];
  });

  const [messages, setMessages] = useState<ClassroomChatMessage[]>(() => {
    if (anglesMode) {
      return [
        {
          id: 'maya-stage-intro-0',
          sender: 'maya',
          text: CLASS_5_ANGLES_STAGES[0].mayaIntroScript,
          timestamp: getNowClockLabel(),
          chips: ANGLES_VOICE_PROMPTS,
          spoken: true,
        },
      ];
    }
    if (waterCycleMode) {
      return [
        {
          id: 'maya-wc-intro-0',
          sender: 'maya',
          text: WATER_CYCLE_CHAPTERS[0].mayaIntroScript,
          timestamp: getNowClockLabel(),
          chips: WATER_CYCLE_PROMPTS,
          spoken: false,
        },
      ];
    }
    return [];
  });

  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const chatThreadRef = useRef<HTMLDivElement>(null);
  const greetedRef = useRef(false);
  const problemInitRef = useRef(false);

  const voice = useTutorVoice(muted);
  const currentStage = CLASS_5_ANGLES_STAGES[activeStageIndex] ?? CLASS_5_ANGLES_STAGES[0];
  const currentWaterCycleChapter =
    WATER_CYCLE_CHAPTERS[activeWaterCycleChapter] ?? WATER_CYCLE_CHAPTERS[0];

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsedSeconds((s) => Math.min(totalSessionSeconds, s + 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [totalSessionSeconds]);

  useEffect(() => {
    if (!isChatDrawerVisible) return;
    const el = chatThreadRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, voice.isThinking, isChatDrawerVisible]);

  // Greet the student with active Maya voice once upon entering the Angles voice classroom
  useEffect(() => {
    if (!anglesMode || greetedRef.current || muted) return;
    greetedRef.current = true;
    void voice.speakText(CLASS_5_ANGLES_STAGES[0].mayaIntroScript, 'maya-stage-intro-0');
  }, [anglesMode, muted, voice]);

  // Section 29 & 31: Gentle Silence / Inactivity Recovery (no guilt, low-pressure entry)
  useEffect(() => {
    const checkId = window.setInterval(() => {
      if (showClosureModal || voice.isSpeaking || voice.isThinking || voice.isRecording) return;
      const idleSeconds = Math.floor((Date.now() - lastStudentActivityRef.current) / 1000);
      if (idleSeconds >= 95 && !silencePromptShownRef.current) {
        silencePromptShownRef.current = true;
        setRuntimeCognitiveState((curr) => (curr === 'stable_learning' ? 'recovery' : curr));
        setMessages((prev) => [
          ...prev,
          {
            id: `maya-silence-${Date.now()}`,
            sender: 'maya',
            text: `Take all the time you need on ${session.topic}. Whenever you're ready, tell me just one small thing you notice here or ask for a quick clue.`,
            timestamp: getNowClockLabel(),
            chips: ['Give me a small clue', 'Can we simplify the next step?'],
            spoken: false,
          },
        ]);
      }
    }, 15000);
    return () => window.clearInterval(checkId);
  }, [session.topic, showClosureModal, voice.isRecording, voice.isSpeaking, voice.isThinking]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((curr) => (curr === msg ? null : curr)), 2600);
  };

  const sendMessageToMaya = useCallback(
    async (
      studentText: string,
      options?: {
        hideStudentBubble?: boolean;
        lastAttempt?: string;
        displayStudentBubbleText?: string;
        whiteboardTelemetry?: WhiteboardTelemetryInput | null;
        voiceTelemetry?: VoiceTelemetryInput | null;
      }
    ) => {
      const clean = studentText.trim();
      if (!clean) return;
      const nowTime = getNowClockLabel();
      const inactivitySeconds = Math.max(
        0,
        Math.floor((Date.now() - lastStudentActivityRef.current) / 1000)
      );
      lastStudentActivityRef.current = Date.now();
      silencePromptShownRef.current = false;

      // Client-side turn inspection to update mastery signals neutrally (Sec 34A accent neutrality)
      const inspection = inspectStudentTurn(clean);
      const updatedSignalsSnapshot = applyAssessmentEventToSignals(masterySignals, {
        type: 'tutor_chat_turn',
        showsReasoning: inspection.showsReasoningEvidence,
        showsConfusion: inspection.confusionDetected || inspection.overloadDetected,
        isAccentOrCodeSwitch:
          inspection.codeSwitchingOrAccentHint ||
          Boolean(options?.voiceTelemetry?.codeSwitchingDetected),
      });
      setMasterySignals(updatedSignalsSnapshot);

      const nextConfusionTurns =
        inspection.confusionDetected || inspection.overloadDetected
          ? consecutiveConfusionTurns + 1
          : 0;
      setConsecutiveConfusionTurns(nextConfusionTurns);

      const historySnapshot = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      if (!options?.hideStudentBubble) {
        const studentMsg: ClassroomChatMessage = {
          id: `st-${Date.now()}`,
          sender: 'student',
          text: options?.displayStudentBubbleText ?? clean,
          timestamp: nowTime,
        };
        setMessages((prev) => [...prev, studentMsg]);
      }

      const interruptedText = voice.interruptedTutorContext;
      if (interruptedText) {
        voice.clearInterruptedContext();
      }

      const { reply, runtimeDecision, error } = await voice.askTutorChat(clean, historySnapshot, {
        sessionId: sessionIdRef.current,
        studentId: profile.email || profile.firstName,
        sessionType: runtimeSessionType,
        grade: resolvedGrade,
        curriculum: profile.curriculum,
        subject: session.subject,
        topic: session.topic,
        voiceMode: interactionMode === 'voice',
        whiteboardMode: activePanel === 'whiteboard' || activePopover === 'whiteboard',
        remainingTime: Math.max(0, totalSessionSeconds - elapsedSeconds),
        currentState: runtimeCognitiveState,
        masterySignals: updatedSignalsSnapshot,
        consecutiveConfusionTurns: nextConfusionTurns,
        recoveryAttemptsCount,
        inactivitySeconds,
        whiteboardTelemetry: options?.whiteboardTelemetry ?? null,
        voiceTelemetry: options?.voiceTelemetry ?? null,
        interruptedTutorText: interruptedText,
        stageTitle: anglesMode
          ? currentStage.prompt
          : waterCycleMode
          ? currentWaterCycleChapter.title
          : problemSolverMode
          ? 'Solve my Problem'
          : session.topic,
        studentAngle: anglesMode ? liveStudentAngle : undefined,
        lastAttempt: options?.lastAttempt,
        problemContext:
          problemSolverMode && problemSolver
            ? {
                problemText: problemSolver.problemText || undefined,
                fileName: problemSolver.attachment?.fileName,
                fileMimeType: problemSolver.attachment?.mimeType,
                fileBase64: problemSolver.attachment?.base64Data,
                fileTextContent: problemSolver.attachment?.textContent,
              }
            : undefined,
      });

      if (runtimeDecision) {
        setRuntimeCognitiveState(runtimeDecision.next_state);
        if (runtimeDecision.recovery_status !== 'none') {
          setRecoveryAttemptsCount((c) => c + 1);
        }
        if (
          runtimeDecision.teacher_escalation_recommended &&
          runtimeDecision.teacher_escalation_reason
        ) {
          setTeacherEscalation({
            reason: runtimeDecision.teacher_escalation_reason,
            saved: false,
          });
        }
      }

      if (error || !reply) {
        return;
      }

      const mayaId = `maya-${Date.now() + 1}`;
      const mayaMsg: ClassroomChatMessage = {
        id: mayaId,
        sender: 'maya',
        text: reply,
        timestamp: getNowClockLabel(),
        spoken: interactionMode === 'voice' && !muted,
      };
      setMessages((prev) => [...prev, mayaMsg]);

      if (interactionMode === 'voice' && !muted) {
        const spokenLoad = runtimeDecision?.voice_analysis?.spokenCognitiveLoad ?? 'low';
        void voice.speakText(reply, mayaId, spokenLoad);
      }
    },
    [
      activePanel,
      activePopover,
      anglesMode,
      consecutiveConfusionTurns,
      currentStage.prompt,
      currentWaterCycleChapter.title,
      elapsedSeconds,
      interactionMode,
      liveStudentAngle,
      masterySignals,
      messages,
      muted,
      problemSolver,
      problemSolverMode,
      profile.curriculum,
      profile.email,
      profile.firstName,
      recoveryAttemptsCount,
      resolvedGrade,
      runtimeCognitiveState,
      runtimeSessionType,
      session.subject,
      session.topic,
      totalSessionSeconds,
      voice,
      waterCycleMode,
    ]
  );

  // Auto-launch Maya's focused problem breakdown once upon entering Solve my Problem classroom
  useEffect(() => {
    if (!problemSolverMode || !problemSolver || problemInitRef.current) return;
    problemInitRef.current = true;

    const typed = problemSolver.problemText.trim();
    const att = problemSolver.attachment;

    const promptForMaya =
      typed && att
        ? `Please help me solve this problem (I also uploaded "${att.fileName}"):\n\n${typed}`
        : typed
        ? `Please help me solve this problem:\n\n${typed}`
        : `Please inspect the uploaded question file "${att?.fileName ?? 'question file'}" and guide me through solving this problem step by step.`;

    const displayBubble =
      typed && att
        ? `${typed}\n\n[Attached file: ${att.fileName}]`
        : typed
        ? typed
        : `Uploaded question file: ${att?.fileName ?? 'question file'}`;

    void sendMessageToMaya(promptForMaya, {
      displayStudentBubbleText: displayBubble,
    });
  }, [problemSolver, problemSolverMode, sendMessageToMaya]);

  const handleSendFormMessage = (textOverride?: string) => {
    const text = (textOverride ?? draft).trim();
    if (!text) return;
    if (!textOverride) setDraft('');
    void sendMessageToMaya(text);
  };

  const handleToggleMicRecording = async () => {
    if (voice.isRecording) {
      const result = await voice.stopRecordingAndTranscribe();
      if (result?.transcript) {
        await sendMessageToMaya(result.transcript, {
          voiceTelemetry: {
            transcript: result.transcript,
            speechConfidence: result.speechConfidence,
            codeSwitchingDetected: result.codeSwitchingDetected,
            interruptedTutorText: voice.interruptedTutorContext,
            turnCountWithConfusion: consecutiveConfusionTurns,
          },
        });
      }
    } else {
      setInteractionMode('voice');
      await voice.startRecording();
    }
  };

  // Interactive Q&A + Whiteboard Mastery Signal Handlers (Sections 23–27, 37–38, 51)
  const handleHintRequested = () => {
    lastStudentActivityRef.current = Date.now();
    setMasterySignals((prev) => applyAssessmentEventToSignals(prev, { type: 'hint_requested' }));
  };

  const handlePracticeEvaluated = (payload: {
    isCorrect: boolean;
    reasoningText: string;
    usedHint: boolean;
    selectedAnswer: string;
  }) => {
    lastStudentActivityRef.current = Date.now();
    setMasterySignals((prev) =>
      applyAssessmentEventToSignals(prev, {
        type: 'practice_answer',
        isCorrect: payload.isCorrect,
        reasoningText: payload.reasoningText,
        usedHintThisQuestion: payload.usedHint,
      })
    );
    if (payload.isCorrect) {
      setCompletedActivityLabels((prev) =>
        prev.includes('Concept & Reasoning Check') ? prev : [...prev, 'Concept & Reasoning Check']
      );
    }
  };

  const handleTransferEvaluated = (payload: {
    isCorrect: boolean;
    reasoningText: string;
    usedHint: boolean;
    selectedAnswer: string;
  }) => {
    lastStudentActivityRef.current = Date.now();
    setMasterySignals((prev) =>
      applyAssessmentEventToSignals(prev, {
        type: 'transfer_answer',
        isCorrect: payload.isCorrect,
        reasoningText: payload.reasoningText,
        usedHintThisQuestion: payload.usedHint,
      })
    );
    if (payload.isCorrect) {
      setCompletedActivityLabels((prev) =>
        prev.includes('Transfer Validation Check') ? prev : [...prev, 'Transfer Validation Check']
      );
      showToast('Transfer check verified — mastery updated!');
    }
  };

  const handleShareWhiteboardStep = (telemetry: WhiteboardTelemetryInput) => {
    lastStudentActivityRef.current = Date.now();
    const analysis = analyzeWhiteboardSignals(telemetry);
    setMasterySignals((prev) =>
      applyAssessmentEventToSignals(prev, {
        type: 'whiteboard_step',
        coherent: analysis.confidence === 'high' && analysis.misconceptionIndicators.length === 0,
        misconceptionDetected: analysis.misconceptionIndicators.length > 0,
      })
    );

    const exprList =
      telemetry.expressions.length > 0
        ? telemetry.expressions.join(', ')
        : 'my current sketch on the whiteboard';

    setActivePanel(null);
    setInteractionMode('text');
    void sendMessageToMaya(
      `Can you check my current whiteboard step (${exprList}) and tell me if my reasoning is on track without finishing the problem for me?`,
      {
        displayStudentBubbleText: `Shared whiteboard step: ${exprList}`,
        whiteboardTelemetry: telemetry,
      }
    );
  };

  const handleSelectAnglesStage = (nextIdx: number) => {
    const nextStage = CLASS_5_ANGLES_STAGES[nextIdx];
    if (!nextStage) return;
    setActiveStageIndex(nextIdx);
    const introId = `maya-stage-intro-${nextIdx}-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: introId,
        sender: 'maya',
        text: nextStage.mayaIntroScript,
        timestamp: getNowClockLabel(),
        spoken: interactionMode === 'voice' && !muted,
      },
    ]);
    if (interactionMode === 'voice' && !muted) {
      void voice.speakText(nextStage.mayaIntroScript, introId);
    }
  };

  const handleAnglesStageEvaluated = (payload: {
    stage: AngleLessonStage;
    isCorrect: boolean;
    studentLabel: string;
    voicePromptForTutor: string;
    spokenFallbackSummary: string;
  }) => {
    lastStudentActivityRef.current = Date.now();
    setMasterySignals((prev) =>
      applyAssessmentEventToSignals(prev, {
        type: 'practice_answer',
        isCorrect: payload.isCorrect,
        reasoningText: payload.isCorrect
          ? `Angle measurement ${payload.studentLabel} aligns because it fits the degree rule.`
          : '',
        usedHintThisQuestion: false,
      })
    );
    if (payload.isCorrect) {
      setCompletedStageIds((prev) =>
        prev.includes(payload.stage.id) ? prev : [...prev, payload.stage.id]
      );
      setCompletedActivityLabels((prev) =>
        prev.includes(payload.stage.shortTitle) ? prev : [...prev, payload.stage.shortTitle]
      );
    }

    void sendMessageToMaya(payload.voicePromptForTutor, {
      displayStudentBubbleText: `${payload.stage.shortTitle}: ${payload.studentLabel}`,
      lastAttempt: `${payload.studentLabel} (${payload.isCorrect ? 'Correct' : 'Incorrect'})`,
    });
  };

  const handleSelectWaterCycleChapter = (nextIdx: number) => {
    const nextCh = WATER_CYCLE_CHAPTERS[nextIdx];
    if (!nextCh) return;
    setActiveWaterCycleChapter(nextIdx);
    setCompletedWaterCycleChapters((prev) =>
      prev.includes(nextCh.id) ? prev : [...prev, nextCh.id]
    );
    const introId = `maya-wc-intro-${nextIdx}-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: introId,
        sender: 'maya',
        text: nextCh.mayaIntroScript,
        timestamp: getNowClockLabel(),
        spoken: interactionMode === 'voice' && !muted,
      },
    ]);
    if (interactionMode === 'voice' && !muted) {
      void voice.speakText(nextCh.mayaIntroScript, introId);
    }
  };

  const handleWaterCycleActivityFeedback = (payload: {
    chapter: WaterCycleChapter;
    isCorrect: boolean;
    studentLabel: string;
    promptForTutor: string;
  }) => {
    lastStudentActivityRef.current = Date.now();
    setMasterySignals((prev) =>
      applyAssessmentEventToSignals(prev, {
        type: 'practice_answer',
        isCorrect: payload.isCorrect,
        reasoningText: payload.isCorrect
          ? `Water cycle process ${payload.studentLabel} works because temperature drives phase change.`
          : '',
        usedHintThisQuestion: false,
      })
    );
    setCompletedWaterCycleChapters((prev) =>
      prev.includes(payload.chapter.id) ? prev : [...prev, payload.chapter.id]
    );
    if (payload.isCorrect) {
      setCompletedActivityLabels((prev) =>
        prev.includes(payload.chapter.title) ? prev : [...prev, payload.chapter.title]
      );
    }
    void sendMessageToMaya(payload.promptForTutor, {
      displayStudentBubbleText: payload.studentLabel,
      lastAttempt: `${payload.studentLabel} (${payload.isCorrect ? 'Correct' : 'Needs Review'})`,
    });
  };

  const handleInsertIntoDraft = (snippet: string) => {
    setDraft((prev) => (prev ? `${prev} ${snippet}` : snippet));
  };

  const handleAddExpression = (formula: string) => {
    setExpressions((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}`,
        formula,
        color: EXPRESSION_COLORS[prev.length % EXPRESSION_COLORS.length],
        visible: true,
      },
    ]);
  };

  const handlePinChatMessage = (msg: ClassroomChatMessage) => {
    setPinnedMessages((prev) => {
      if (prev.some((p) => p.id === `pin-${msg.id}`)) return prev;
      return [
        {
          id: `pin-${msg.id}`,
          author: msg.sender === 'maya' ? 'Maya' : profile.firstName,
          timestamp: msg.timestamp,
          text: msg.text,
        },
        ...prev,
      ];
    });
    showToast('Message pinned to Pinned Messages');
  };

  const togglePanel = (panel: Exclude<ClassroomPanelId, null>) => {
    playUiSound('click');
    setActivePanel((curr) => (curr === panel ? null : panel));
  };

  const switchToTextMode = () => {
    playUiSound('switch');
    setActivePanel(null);
    setInteractionMode('text');
    voice.stopSpeaking();
  };

  const switchToVoiceMode = () => {
    playUiSound('switch');
    setActivePopover(null);
    setInteractionMode('voice');
  };

  const latestMayaMessage = [...messages].reverse().find((m) => m.sender === 'maya') ?? null;
  const latestStudentMessage = [...messages].reverse().find((m) => m.sender === 'student') ?? null;

  const remainingSeconds = Math.max(0, totalSessionSeconds - elapsedSeconds);

  return (
    <div
      data-testid="session-classroom"
      className="fixed inset-0 z-50 flex flex-col bg-white text-slate-900"
    >
      {/* TOP DARK NAVY HEADER BAR */}
      <header className="flex h-[62px] shrink-0 items-center justify-between gap-3 bg-[#0B2242] px-4 sm:px-5 text-white shadow-md">
        {/* Left: Avatar + Brand + Live Status/Timer */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2.5 shrink-0">
            <MayaAvatar size={36} speaking={voice.isSpeaking} />
            <div className="leading-tight">
              <span className="block font-display text-[15px] sm:text-[17px] font-bold tracking-tight text-white whitespace-nowrap">
                Lumio AI Classroom
              </span>
              {(anglesMode || waterCycleMode) && (
                <span className="hidden lg:block text-[11px] font-medium text-sky-200/90 whitespace-nowrap">
                  Class {resolvedGrade} · {session.subject} ·{' '}
                  {waterCycleMode ? 'Water Cycle & Weather' : session.topic}
                </span>
              )}
              {problemSolverMode && (
                <span className="hidden lg:block text-[11px] font-medium text-emerald-300/95 whitespace-nowrap">
                  Solve my Problem · Focused Session
                </span>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 rounded-xl border border-white/15 bg-white/8 px-3.5 py-1.5 text-[12px] whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
              <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Online</span>
            </span>
            <span className="text-white/25" aria-hidden="true">
              |
            </span>
            <span className="text-slate-300">
              Elapsed{' '}
              <strong className="font-mono text-white tabular-nums">
                {formatTimerClock(elapsedSeconds)}
              </strong>
            </span>
            <span className="text-white/25" aria-hidden="true">
              |
            </span>
            <span className="text-slate-300">
              Remaining{' '}
              <strong className="font-mono text-white tabular-nums">
                {formatTimerClock(remainingSeconds)}
              </strong>
            </span>
          </div>
        </div>

        {/* Right: Mode Switch + 5 Circular Tool Icons + Red End Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Text mode / Voice mode toggle with Obsidian/Aceternity spring pill */}
          <div
            role="group"
            aria-label="Interaction mode"
            className="inline-flex items-center rounded-full border border-white/15 bg-white/10 p-1"
          >
            <button
              type="button"
              onClick={switchToTextMode}
              aria-pressed={interactionMode === 'text'}
              className={`relative inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                interactionMode === 'text'
                  ? 'text-[#0B2242]'
                  : 'text-white/85 hover:text-white'
              }`}
            >
              {interactionMode === 'text' && (
                <motion.span
                  layoutId="classroom-mode-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-white shadow-xs"
                />
              )}
              <Type className="relative z-10 h-3.5 w-3.5" aria-hidden="true" />
              <span className="relative z-10">Text mode</span>
            </button>
            <button
              type="button"
              onClick={switchToVoiceMode}
              aria-pressed={interactionMode === 'voice'}
              className={`relative inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                interactionMode === 'voice'
                  ? 'text-[#0B2242]'
                  : 'text-white/85 hover:text-white'
              }`}
            >
              {interactionMode === 'voice' && (
                <motion.span
                  layoutId="classroom-mode-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-white shadow-xs"
                />
              )}
              <AudioLines className="relative z-10 h-3.5 w-3.5" aria-hidden="true" />
              <span className="relative z-10">Voice mode</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => togglePanel('lesson')}
            aria-label="Lesson Content panel"
            aria-pressed={activePanel === 'lesson'}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
              activePanel === 'lesson'
                ? 'border-white bg-white text-[#0B2242]'
                : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BookOpen className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => togglePanel('whiteboard')}
            aria-label="Whiteboard panel"
            aria-pressed={activePanel === 'whiteboard'}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
              activePanel === 'whiteboard'
                ? 'border-white bg-white text-[#0B2242]'
                : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <SquarePen className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => togglePanel('qa')}
            aria-label="Interactive Q&A panel"
            aria-pressed={activePanel === 'qa'}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
              activePanel === 'qa'
                ? 'border-white bg-white text-[#0B2242]'
                : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => togglePanel('pinned')}
            aria-label="Pinned Messages panel"
            aria-pressed={activePanel === 'pinned'}
            className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
              activePanel === 'pinned'
                ? 'border-white bg-white text-[#0B2242]'
                : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Pin className="h-4 w-4" />
            {pinnedMessages.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[9.5px] font-bold text-slate-950 tabular-nums">
                {pinnedMessages.length}
              </span>
            )}
          </button>

          {onOpenMyNotes && (
            <button
              type="button"
              onClick={() => {
                playUiSound('click');
                onOpenMyNotes();
              }}
              aria-label="Open My Notes and uploaded books"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-400/15 hover:bg-amber-400/25 px-3 text-xs font-semibold text-amber-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">My Notes</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Unmute tutor audio' : 'Mute tutor audio'}
            aria-pressed={muted}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              voice.stopSpeaking(false);
              setShowClosureModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#EF4444] hover:bg-[#DC2626] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors whitespace-nowrap"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>End</span>
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="relative flex-1 flex w-full min-h-0 overflow-x-clip overflow-y-hidden bg-[#F4F7FB]">
        {/* PRIMARY CLASSROOM STAGE + VOICE INTERACTION DOCK */}
        <div
          className={`flex-1 w-full min-w-0 flex flex-col min-h-0 overflow-x-hidden transition-[padding] duration-300 ease-out ${
            isChatDrawerVisible ? 'lg:pr-[450px]' : ''
          }`}
        >
          {/* Scrollable Lesson / Interactive Canvas */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 scrollbar-thin">
            {anglesMode ? (
              <div className="mx-auto w-full max-w-[960px]">
                <AnglesInteractiveStudio
                  activeStageIndex={activeStageIndex}
                  completedStageIds={completedStageIds}
                  onSelectStage={handleSelectAnglesStage}
                  onAngleChange={setLiveStudentAngle}
                  onStageEvaluated={handleAnglesStageEvaluated}
                  onRequestVoiceExplanation={(spokenText) => {
                    setMuted(false);
                    setInteractionMode('voice');
                    void voice.speakText(spokenText, `explain-${Date.now()}`);
                  }}
                />
              </div>
            ) : waterCycleMode ? (
              <div className="mx-auto w-full max-w-[960px]">
                <WaterCycleInteractiveStudio
                  activeChapterIndex={activeWaterCycleChapter}
                  completedChapterIds={completedWaterCycleChapters}
                  onSelectChapter={handleSelectWaterCycleChapter}
                  onChapterActivityFeedback={handleWaterCycleActivityFeedback}
                  onRequestVoiceExplanation={(spokenText) => {
                    setMuted(false);
                    setInteractionMode('voice');
                    void voice.speakText(spokenText, `wc-explain-${Date.now()}`);
                  }}
                />
              </div>
            ) : problemSolverMode && problemSolver ? (
              <div className="mx-auto w-full max-w-[860px] space-y-5">
                {/* Dedicated Problem Solver Focus Card (No unrelated warm-ups) */}
                <div
                  data-testid="problem-focus-card"
                  className="rounded-2xl border border-emerald-200/90 bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgba(23,163,74,0.08)] space-y-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28C768] to-[#17A34A] text-white shadow-xs">
                        <Sparkles className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="font-display text-[17px] font-bold text-slate-900">
                            Solve my Problem
                          </h1>
                          <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                            Focused ONLY on your problem
                          </span>
                        </div>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">
                          Every message with Maya in this classroom stays strictly locked onto the question you submitted below.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submitted Written Problem */}
                  {problemSolver.problemText.trim() && (
                    <div
                      data-testid="submitted-problem-text"
                      className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-1.5"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Your Submitted Problem
                      </p>
                      <p className="text-[15px] font-semibold text-slate-900 leading-relaxed whitespace-pre-wrap">
                        {problemSolver.problemText.trim()}
                      </p>
                    </div>
                  )}

                  {/* Uploaded Question File Preview */}
                  {problemSolver.attachment && (
                    <div
                      data-testid="submitted-problem-file"
                      className="rounded-xl border border-emerald-200/80 bg-emerald-50/35 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-emerald-200 text-emerald-700">
                            {problemSolver.attachment.mimeType.startsWith('image/') ? (
                              <Paperclip className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <FileText className="h-4 w-4" aria-hidden="true" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-bold text-slate-900 truncate">
                              {problemSolver.attachment.fileName}
                            </p>
                            <p className="text-[11.5px] text-emerald-800">
                              Uploaded question file · {formatFileSizeLabel(problemSolver.attachment.sizeBytes)}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-md bg-white border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 whitespace-nowrap">
                          Analyzed by Maya
                        </span>
                      </div>

                      {problemSolver.attachment.previewDataUrl && (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 flex justify-center">
                          <img
                            src={problemSolver.attachment.previewDataUrl}
                            alt={`Uploaded question: ${problemSolver.attachment.fileName}`}
                            className="max-h-[340px] w-auto rounded-lg object-contain"
                          />
                        </div>
                      )}

                      {problemSolver.attachment.textContent && (
                        <pre className="max-h-[240px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3.5 text-[13px] font-sans text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {problemSolver.attachment.textContent}
                        </pre>
                      )}
                    </div>
                  )}

                  {/* Quick Problem-Focused Helper Actions */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[11.5px] font-semibold text-slate-500">
                      Ask Maya about this problem:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PROBLEM_SOLVER_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          disabled={voice.isThinking}
                          onClick={() => handleSendFormMessage(prompt)}
                          className="rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 px-3.5 py-2 text-[12.5px] font-semibold text-emerald-900 transition-colors disabled:opacity-50"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Voice-First Centerpiece when user switches to Voice mode */}
                {showVoiceDock && (
                  <div className="rounded-2xl border border-sky-200/80 bg-white p-6 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-3">
                    <div className="mx-auto flex justify-center">
                      <MayaAvatar size={64} speaking={voice.isSpeaking || voice.isLoadingTts} />
                    </div>
                    <h2 className="font-display text-[17px] font-bold text-slate-900">
                      Live Voice Problem Solving with Maya
                    </h2>
                    <p className="mx-auto max-w-lg text-[13px] text-slate-600 leading-relaxed">
                      {latestMayaMessage
                        ? latestMayaMessage.text
                        : 'Chat drawer is minimized. Tap Speak to Maya below to talk through your submitted problem aloud.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-auto w-full max-w-[820px] space-y-5">
                {/* General Lesson Welcome & Warm-up Card */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <MayaAvatar size={40} speaking={voice.isSpeaking} />
                      <div>
                        <p className="text-[15px] font-bold text-slate-900">{welcomeData.heading}</p>
                        <p className="text-[12px] text-slate-500">
                          Grade {resolvedGrade} · {session.subject} · {session.topic}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handlePinChatMessage({
                          id: 'welcome',
                          sender: 'maya',
                          text: `${welcomeData.intro} ${welcomeData.warmupQuestion}`,
                          timestamp: getNowClockLabel(),
                        })
                      }
                      aria-label="Pin Maya welcome message"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#15629E]"
                    >
                      <Pin className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-[13.5px] text-slate-800 leading-relaxed">
                    {welcomeData.intro}
                    <br />
                    Our goal is to:
                  </p>
                  <ul className="space-y-2">
                    {welcomeData.goals.map((g) => (
                      <li
                        key={g.bold}
                        className="flex items-start gap-2.5 text-[13.5px] text-slate-800"
                      >
                        <CheckCircle2
                          className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>
                          <strong className="font-bold text-slate-900">{g.bold}</strong> {g.rest}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-xl border border-slate-200/80 bg-[#F6F5F1] px-4 py-3.5 space-y-2">
                    <p className="text-[10.5px] font-bold tracking-wider text-slate-500">
                      QUICK WARM-UP
                    </p>
                    <p className="font-mono text-[13.5px] font-medium text-[#2563EB]">
                      {welcomeData.warmupSequence}
                    </p>
                    <p className="text-[13.5px] font-medium text-slate-900">
                      {welcomeData.warmupQuestion}
                    </p>
                  </div>
                </div>

                {/* Voice-First Centerpiece when chat is minimized in general sessions */}
                {showVoiceDock && (
                  <div className="rounded-2xl border border-sky-200/80 bg-white p-6 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-3">
                    <div className="mx-auto flex justify-center">
                      <MayaAvatar size={64} speaking={voice.isSpeaking || voice.isLoadingTts} />
                    </div>
                    <h2 className="font-display text-[17px] font-bold text-slate-900">
                      Live Voice Session with Maya
                    </h2>
                    <p className="mx-auto max-w-md text-[13px] text-slate-600 leading-relaxed">
                      {latestMayaMessage
                        ? latestMayaMessage.text
                        : 'Text chat is minimized. Tap Speak to Maya below to talk through the warm-up aloud, or switch to Text mode anytime.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* VOICE MODE INTERACTION DOCK (Shown inside communication when chat is minimized) */}
          {showVoiceDock && (
            <div
              data-testid="voice-interaction-dock"
              className="shrink-0 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 shadow-[0_-6px_24px_rgba(11,34,66,0.07)]"
            >
              <div className="mx-auto w-full max-w-[960px] space-y-2.5">
                {/* Autoplay unlock notice if browser blocks initial voice audio */}
                {voice.autoplayBlocked && voice.pendingReplay && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs text-emerald-900">
                    <span>Tap to hear Maya greet you aloud in Voice mode!</span>
                    <button
                      type="button"
                      onClick={() =>
                        voice.pendingReplay &&
                        void voice.speakText(voice.pendingReplay.text, voice.pendingReplay.id)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 px-3 py-1 text-[11.5px] font-bold text-white whitespace-nowrap"
                    >
                      <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Play Maya&apos;s Voice</span>
                    </button>
                  </div>
                )}

                {/* Honest voice / API error alert */}
                {voice.voiceError && (
                  <div
                    role="alert"
                    className="flex items-start justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] text-amber-950 min-w-0 overflow-hidden"
                  >
                    <span className="inline-flex items-start gap-1.5 min-w-0 flex-1 break-words">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span className="min-w-0 break-words">{voice.voiceError}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => voice.setVoiceError(null)}
                      aria-label="Dismiss voice alert"
                      className="text-amber-700 hover:text-amber-950 shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Main Live User <-> Maya Voice Communication Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Maya Live Voice Presence + Spoken Caption */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <MayaAvatar size={40} speaking={voice.isSpeaking || voice.isLoadingTts} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-bold text-slate-900">
                          Maya · Live Voice Tutor
                        </span>
                        <span
                          data-testid="voice-dock-status"
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            voice.isRecording
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : voice.isSpeaking
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : voice.isThinking || voice.isTranscribing || voice.isLoadingTts
                              ? 'bg-sky-50 text-[#15629E] border border-sky-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {(voice.isSpeaking || voice.isRecording) && (
                            <VoiceWaveBars
                              active={true}
                              level={voice.isRecording ? voice.micLevel : 0.72}
                              colorClass={voice.isRecording ? 'bg-rose-500' : 'bg-emerald-500'}
                            />
                          )}
                          {(voice.isThinking || voice.isTranscribing || voice.isLoadingTts) && (
                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                          )}
                          <span>
                            {voice.isRecording
                              ? 'Listening to you...'
                              : voice.isTranscribing
                              ? 'Transcribing your voice...'
                              : voice.isThinking
                              ? 'Maya is preparing voice reply...'
                              : voice.isLoadingTts
                              ? 'Preparing Maya’s voice...'
                              : voice.isSpeaking
                              ? 'Maya is speaking aloud'
                              : 'Voice interaction active'}
                          </span>
                        </span>
                        {latestStudentMessage && (
                          <span className="hidden xl:inline-block max-w-[240px] truncate rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-[#15629E]">
                            You: {latestStudentMessage.text}
                          </span>
                        )}
                      </div>

                      <p
                        data-testid="voice-live-caption"
                        className="mt-1 text-[12.5px] text-slate-700 line-clamp-2 leading-snug"
                      >
                        {latestMayaMessage
                          ? latestMayaMessage.text
                          : welcomeData.warmupQuestion}
                      </p>
                    </div>
                  </div>

                  {/* Voice Action Controls + Chat Drawer Launcher */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {voice.isSpeaking ? (
                      <button
                        type="button"
                        onClick={() => voice.stopSpeaking(true)}
                        aria-label="Stop Maya speaking"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 whitespace-nowrap"
                      >
                        <Square className="h-3 w-3 fill-slate-700" aria-hidden="true" />
                        <span>Stop</span>
                      </button>
                    ) : latestMayaMessage ? (
                      <button
                        type="button"
                        onClick={() => {
                          setMuted(false);
                          void voice.speakText(latestMayaMessage.text, latestMayaMessage.id);
                        }}
                        aria-label="Replay Maya's last message"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 whitespace-nowrap"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-[#15629E]" aria-hidden="true" />
                        <span>Replay</span>
                      </button>
                    ) : null}

                    <button
                      type="button"
                      data-testid="voice-dock-mic-btn"
                      onClick={handleToggleMicRecording}
                      disabled={voice.isTranscribing || voice.isThinking}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] disabled:opacity-50 ${
                        voice.isRecording
                          ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-sm'
                          : 'bg-[#15629E] hover:bg-[#0F4D7D] text-white shadow-sm'
                      }`}
                    >
                      {voice.isTranscribing ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : voice.isRecording ? (
                        <MicOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Mic className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span>{voice.isRecording ? 'Stop & Send Voice' : 'Speak to Maya'}</span>
                    </button>

                    <button
                      type="button"
                      data-testid="open-text-chat-drawer-btn"
                      onClick={switchToTextMode}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-800 whitespace-nowrap transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-[#15629E]" aria-hidden="true" />
                      <span>Text Chat</span>
                      {messages.length > 0 && (
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#15629E]/12 px-1 text-[10px] font-bold text-[#15629E] tabular-nums">
                          {messages.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick In-Communication Spoken Prompts */}
                {(anglesMode || problemSolverMode || waterCycleMode) && (
                  <div className="flex items-center gap-2 overflow-x-auto pt-0.5 scrollbar-thin">
                    <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap shrink-0">
                      Ask Maya aloud:
                    </span>
                    {(problemSolverMode
                      ? PROBLEM_SOLVER_PROMPTS
                      : waterCycleMode
                      ? WATER_CYCLE_PROMPTS
                      : ANGLES_VOICE_PROMPTS
                    ).map(
                      (prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          disabled={voice.isThinking}
                          onClick={() => handleSendFormMessage(prompt)}
                          className="rounded-lg border border-sky-200/90 bg-sky-50/70 hover:bg-sky-100/80 px-2.5 py-1 text-[11.5px] font-medium text-[#0F4D7D] whitespace-nowrap shrink-0 transition-colors disabled:opacity-50"
                        >
                          “{prompt}”
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT-SIDE CHAT SESSION DRAWER (Opens cleanly in Text mode; Minimizes away in Voice mode) */}
        <aside
          data-testid="chat-right-drawer"
          aria-label="Text chat session with Maya"
          aria-hidden={!isChatDrawerVisible}
          className={`absolute inset-y-0 right-0 z-30 flex w-full sm:w-[430px] lg:w-[450px] flex-col border-l border-slate-200 bg-[#FBFBFD] shadow-[-12px_0_36px_rgba(11,34,66,0.14)] transition-all duration-300 ease-out ${
            isChatDrawerVisible
              ? 'translate-x-0 opacity-100 visible'
              : 'translate-x-full opacity-0 invisible pointer-events-none'
          }`}
        >
          {/* Drawer Header */}
          <div
            data-testid="maya-voice-bar"
            className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <MayaAvatar size={34} speaking={voice.isSpeaking || voice.isLoadingTts} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13.5px] font-bold text-slate-900 truncate">
                      Chat with Maya
                    </p>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-bold text-slate-600 tabular-nums">
                      {messages.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {voice.isThinking
                      ? 'Maya is preparing a reply...'
                      : voice.isSpeaking
                      ? 'Playing Maya’s audio clip'
                      : 'Text drawer open · Full transcript'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={switchToVoiceMode}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 px-2.5 py-1.5 text-[11.5px] font-semibold text-[#15629E] whitespace-nowrap transition-colors"
                >
                  <AudioLines className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Voice Mode</span>
                </button>
                <button
                  type="button"
                  onClick={switchToVoiceMode}
                  aria-label="Minimize chat drawer to Voice mode"
                  title="Minimize chat drawer to Voice mode"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <PanelRightClose className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Honest error alert inside drawer when in Text mode */}
            {voice.voiceError && (
              <div
                role="alert"
                className="flex items-start justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] text-amber-950 min-w-0 overflow-hidden"
              >
                <span className="inline-flex items-start gap-1.5 min-w-0 flex-1 break-words">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span className="min-w-0 break-words">{voice.voiceError}</span>
                </span>
                <button
                  type="button"
                  onClick={() => voice.setVoiceError(null)}
                  aria-label="Dismiss chat alert"
                  className="text-amber-700 hover:text-amber-950 shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Chat Transcript Thread */}
          <div
            ref={chatThreadRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin"
          >
            {messages.length === 0 && !problemSolverMode && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-[13px] text-slate-700 leading-relaxed space-y-2">
                <p className="font-bold text-slate-900">{welcomeData.heading}</p>
                <p>{welcomeData.warmupQuestion}</p>
              </div>
            )}

            {/* Dynamic Conversation Turns */}
            {messages.map((msg) => {
              const isThisSpeaking = voice.speakingId === msg.id && voice.isSpeaking;
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === 'student' ? 'justify-end' : ''
                  }`}
                >
                  {msg.sender === 'maya' && (
                    <MayaAvatar size={32} speaking={isThisSpeaking} />
                  )}
                  <div className={msg.sender === 'student' ? 'max-w-[82%] text-right' : 'flex-1 min-w-0'}>
                    <div
                      className={`rounded-2xl px-3.5 py-3 text-[13px] leading-relaxed ${
                        msg.sender === 'student'
                          ? 'bg-[#15629E] text-white text-left'
                          : 'border border-slate-200 bg-white text-slate-800 shadow-2xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {msg.sender === 'maya' && (
                        <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (isThisSpeaking) {
                                voice.stopSpeaking();
                              } else {
                                setMuted(false);
                                void voice.speakText(msg.text, msg.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#15629E] hover:text-[#0B2242]"
                          >
                            {isThisSpeaking ? (
                              <>
                                <Square className="h-3 w-3 fill-current" aria-hidden="true" />
                                <span>Stop Voice</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Listen to Maya</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePinChatMessage(msg)}
                            aria-label="Pin Maya reply"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-[#15629E]"
                          >
                            <Pin className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {msg.chips && msg.chips.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {msg.chips.map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => handleSendFormMessage(chip)}
                            className="rounded-full border border-[#15629E]/30 bg-blue-50/70 px-3 py-1 text-[11.5px] font-medium text-[#15629E] hover:bg-blue-100 text-left"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-[10.5px] text-slate-400 tabular-nums">
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              );
            })}

            {teacherEscalation && (
              <div
                data-testid="teacher-escalation-card"
                className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs text-amber-950">
                    <p className="font-bold">Recommended: Confirm with Your Teacher</p>
                    <p className="leading-relaxed">{teacherEscalation.reason}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  {teacherEscalation.saved ? (
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Saved to your Teacher Notes
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSaveTeacherNote?.(
                          session.subject,
                          session.topic,
                          `Question to confirm with teacher (${session.subject} · ${session.topic}): ${teacherEscalation.reason}`
                        );
                        setTeacherEscalation((curr) => (curr ? { ...curr, saved: true } : null));
                        showToast('Question saved for your teacher');
                      }}
                      className="rounded-lg bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors"
                    >
                      Save Question for Teacher
                    </button>
                  )}
                </div>
              </div>
            )}

            {voice.isThinking && (
              <div className="flex items-center gap-2.5">
                <MayaAvatar size={30} />
                <AgentThinkingIndicator label="Maya is preparing your explanation…" />
              </div>
            )}
          </div>

          {/* FLOATING MATH / WHITEBOARD POPOVER */}
          {activePopover && isChatDrawerVisible && (
            <div className="absolute bottom-[118px] left-3 right-3 z-40">
              {activePopover === 'graphing' && (
                <MathSymbolsPopover
                  onInsertEquation={handleInsertIntoDraft}
                  onClose={() => setActivePopover(null)}
                />
              )}
              {activePopover === 'ink' && (
                <InkEquationPopover
                  onInsertEquation={handleInsertIntoDraft}
                  onClose={() => setActivePopover(null)}
                />
              )}
              {activePopover === 'whiteboard' && (
                <ClassroomWhiteboard
                  variant="popover"
                  expressions={expressions}
                  onAddExpression={handleAddExpression}
                  onToggleExpression={(id) =>
                    setExpressions((prev) =>
                      prev.map((e) => (e.id === id ? { ...e, visible: !e.visible } : e))
                    )
                  }
                  onRemoveExpression={(id) =>
                    setExpressions((prev) => prev.filter((e) => e.id !== id))
                  }
                  onInsertEquation={handleInsertIntoDraft}
                  onShareStepWithTutor={handleShareWhiteboardStep}
                  onClose={() => setActivePopover(null)}
                />
              )}
            </div>
          )}

          {/* BOTTOM RICH COMPOSER & MATH TOOLBAR */}
          <div className="shrink-0 border-t border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-[#F1F3F6] px-3 py-1.5">
              <div className="flex items-center gap-0.5 flex-wrap">
                {[
                  { icon: Bold, label: 'Bold', insert: '**bold**' },
                  { icon: Italic, label: 'Italic', insert: '*italic*' },
                  { icon: Underline, label: 'Underline', insert: '__underline__' },
                  { icon: Strikethrough, label: 'Strikethrough', insert: '~~text~~' },
                ].map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.label}
                      type="button"
                      aria-label={tool.label}
                      onClick={() => handleInsertIntoDraft(tool.insert)}
                      className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-200/80 transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  );
                })}

                <button
                  type="button"
                  aria-label="Switch to voice recording"
                  onClick={handleToggleMicRecording}
                  className={`rounded-lg p-1.5 transition-colors ${
                    voice.isRecording
                      ? 'bg-[#EF4444] text-white'
                      : 'text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  <Mic className="h-3.5 w-3.5" />
                </button>

                <span className="mx-1 h-4 w-px bg-slate-300" aria-hidden="true" />

                {[
                  { icon: Link2, label: 'Insert link', insert: 'https://' },
                  { icon: List, label: 'Bulleted list', insert: '\n- ' },
                  { icon: ListOrdered, label: 'Numbered list', insert: '\n1. ' },
                ].map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.label}
                      type="button"
                      aria-label={tool.label}
                      onClick={() => handleInsertIntoDraft(tool.insert)}
                      className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-200/80 transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  );
                })}

                {mathMode && (
                  <>
                    <span className="mx-1 h-4 w-px bg-slate-300" aria-hidden="true" />
                    <button
                      type="button"
                      aria-label="Open Whiteboard popover"
                      aria-pressed={activePopover === 'whiteboard'}
                      onClick={() =>
                        setActivePopover((p) => (p === 'whiteboard' ? null : 'whiteboard'))
                      }
                      className={`rounded-lg p-1.5 transition-colors ${
                        activePopover === 'whiteboard'
                          ? 'bg-[#0E5A9E] text-white'
                          : 'text-slate-700 hover:bg-slate-200/80'
                      }`}
                    >
                      <PenSquare className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Open Ink Equation popover"
                      aria-pressed={activePopover === 'ink'}
                      onClick={() => setActivePopover((p) => (p === 'ink' ? null : 'ink'))}
                      className={`rounded-lg p-1.5 transition-colors ${
                        activePopover === 'ink'
                          ? 'bg-[#0E5A9E] text-white'
                          : 'text-slate-700 hover:bg-slate-200/80'
                      }`}
                    >
                      <SquarePen className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Open Graphing symbols popover"
                      aria-pressed={activePopover === 'graphing'}
                      onClick={() =>
                        setActivePopover((p) => (p === 'graphing' ? null : 'graphing'))
                      }
                      className={`rounded-lg p-1.5 transition-colors ${
                        activePopover === 'graphing'
                          ? 'bg-[#0E5A9E] text-white'
                          : 'text-slate-700 hover:bg-slate-200/80'
                      }`}
                    >
                      <Sigma className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex items-center gap-1 text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => setShowLangMenu((v) => !v)}
                    aria-label={`Teaching language ${teachLanguage}`}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-800 hover:bg-slate-50"
                  >
                    <Globe className="h-3 w-3 text-slate-600" aria-hidden="true" />
                    <span>{teachLanguage}</span>
                    <ChevronDown className="h-3 w-3 text-slate-500" aria-hidden="true" />
                  </button>
                  {showLangMenu && (
                    <div className="absolute bottom-8 right-0 z-30 w-24 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                      {(['EN', 'ES', 'FR', 'DE'] as const).map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setTeachLanguage(code);
                            setShowLangMenu(false);
                          }}
                          className={`block w-full rounded-lg px-2 py-1 text-left text-xs font-semibold ${
                            teachLanguage === code
                              ? 'bg-blue-50 text-[#15629E]'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMathMode((v) => !v);
                    if (mathMode) setActivePopover(null);
                  }}
                  aria-pressed={mathMode}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                    mathMode
                      ? 'border-slate-200 bg-white text-slate-900 shadow-2xs'
                      : 'border-slate-300 bg-slate-200/70 text-slate-600'
                  }`}
                >
                  <span>Σ Math</span>
                  {mathMode && <X className="h-2.5 w-2.5 text-slate-500" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendFormMessage();
              }}
              className="flex items-center gap-2.5 px-3.5 py-2.5"
            >
              <button
                type="button"
                aria-label="Open math whiteboard tool"
                onClick={() =>
                  setActivePopover((p) => (p === 'whiteboard' ? null : 'whiteboard'))
                }
                className="text-[#15629E] hover:text-[#0E4878] transition-colors shrink-0"
              >
                <PlusCircle className="h-5 w-5" />
              </button>

              <label htmlFor="classroom-message-input" className="sr-only">
                Ask Maya or type your answer
              </label>
              <input
                id="classroom-message-input"
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  problemSolverMode
                    ? 'Ask Maya a follow-up about your submitted problem...'
                    : waterCycleMode
                    ? 'Ask Maya about evaporation, clouds, rain, or weather...'
                    : 'Ask Maya about angles or type your answer...'
                }
                className="flex-1 bg-transparent text-[13.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />

              <button
                type="submit"
                disabled={voice.isThinking}
                aria-label="Send classroom message"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F39200] hover:bg-[#DF8500] disabled:opacity-50 text-white shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </aside>

        {/* RIGHT SIDE COLLAPSIBLE PANEL */}
        {activePanel && (
          <ClassroomRightPanel
            activePanel={activePanel}
            expanded={panelExpanded}
            onToggleExpand={() => setPanelExpanded((v) => !v)}
            onClose={() => setActivePanel(null)}
            grade={resolvedGrade}
            curriculum={profile.curriculum}
            subject={session.subject}
            topic={session.topic}
            sessionType={runtimeSessionType}
            subjectClassification={subjectClassification}
            masterySignals={masterySignals}
            masteryEvaluation={masteryEvaluation}
            isAngles={anglesMode}
            isWaterCycle={waterCycleMode}
            welcomeData={welcomeData}
            expressions={expressions}
            onAddExpression={handleAddExpression}
            onToggleExpression={(id) =>
              setExpressions((prev) =>
                prev.map((e) => (e.id === id ? { ...e, visible: !e.visible } : e))
              )
            }
            onRemoveExpression={(id) =>
              setExpressions((prev) => prev.filter((e) => e.id !== id))
            }
            onShareWhiteboardStep={handleShareWhiteboardStep}
            onPracticeEvaluated={handlePracticeEvaluated}
            onTransferEvaluated={handleTransferEvaluated}
            onHintRequested={handleHintRequested}
            pinnedMessages={pinnedMessages}
            onUnpinMessage={(id) =>
              setPinnedMessages((prev) => prev.filter((p) => p.id !== id))
            }
            onCopyText={(txt) => {
              navigator.clipboard?.writeText(txt).catch(() => {});
              showToast('Copied to clipboard');
            }}
          />
        )}
      </div>

      {/* Honest Session Closure Modal (Section 15) */}
      <SessionClosureModal
        open={showClosureModal}
        report={buildSessionClosureReport({
          subject: session.subject,
          topic: session.topic,
          sessionType: runtimeSessionType,
          elapsedSeconds,
          masterySignals,
          turnsCount: messages.length,
          completedActivityLabels,
        })}
        onContinueSession={() => setShowClosureModal(false)}
        onConfirmEndAndSave={(closureReport) => {
          setShowClosureModal(false);
          onEndSession(closureReport);
        }}
      />

      {/* Floating Mascot Helper Popup for Session & Solution Session */}
      <MascotHelperPopup
        context={problemSolverMode ? 'solution' : 'session'}
        subject={session.subject}
        topic={session.topic}
        isWaterCycle={waterCycleMode}
        waterCycleChapterTitle={WATER_CYCLE_CHAPTERS[activeWaterCycleChapter]?.title}
        isAngles={anglesMode}
        anglesStageTitle={CLASS_5_ANGLES_STAGES[activeStageIndex]?.shortTitle}
        problemText={problemSolver?.problemText}
        problemFileName={problemSolver?.attachment?.fileName}
        liftForVoiceDock={showVoiceDock}
        onAskTutor={(prompt) => {
          handleSendFormMessage(prompt);
        }}
        onSpeakHint={(spokenText) => {
          setMuted(false);
          void voice.speakText(spokenText, `mascot-hint-${Date.now()}`);
        }}
      />

      {/* Classroom Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-6 z-50 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
};
