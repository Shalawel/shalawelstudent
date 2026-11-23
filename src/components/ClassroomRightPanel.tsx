import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Lightbulb,
  Maximize2,
  Minimize2,
  PinOff,
  Sparkles,
  X,
} from 'lucide-react';
import {
  checkOrderingAnswer,
  type ClassroomWelcomeData,
  type PlottedExpression,
} from '../utils/classroomLogic';
import {
  PEDAGOGY_FAMILIES,
  SESSION_TYPE_PACKS,
  type RuntimeSessionType,
  type SubjectClassification,
} from '../utils/tutorPedagogyEngine';
import {
  buildSubjectAssessmentBundle,
  type MasteryEvaluationResult,
  type MasterySignals,
  type WhiteboardTelemetryInput,
} from '../utils/tutorMasteryEngine';
import { ClassroomWhiteboard } from './ClassroomWhiteboard';

export type ClassroomPanelId = 'lesson' | 'whiteboard' | 'qa' | 'pinned' | null;

export interface PinnedMessageItem {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

interface ClassroomRightPanelProps {
  activePanel: Exclude<ClassroomPanelId, null>;
  expanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
  grade: string;
  curriculum: string;
  subject: string;
  topic: string;
  sessionType: RuntimeSessionType;
  subjectClassification: SubjectClassification;
  masterySignals: MasterySignals;
  masteryEvaluation: MasteryEvaluationResult;
  isAngles?: boolean;
  isWaterCycle?: boolean;
  welcomeData: ClassroomWelcomeData;
  expressions: PlottedExpression[];
  onAddExpression: (formula: string) => void;
  onToggleExpression: (id: string) => void;
  onRemoveExpression: (id: string) => void;
  onShareWhiteboardStep?: (telemetry: WhiteboardTelemetryInput) => void;
  onPracticeEvaluated?: (payload: {
    isCorrect: boolean;
    reasoningText: string;
    usedHint: boolean;
    selectedAnswer: string;
  }) => void;
  onTransferEvaluated?: (payload: {
    isCorrect: boolean;
    reasoningText: string;
    usedHint: boolean;
    selectedAnswer: string;
  }) => void;
  onHintRequested?: () => void;
  pinnedMessages: PinnedMessageItem[];
  onUnpinMessage: (id: string) => void;
  onCopyText: (text: string) => void;
}

function bandBadgeClass(band: MasteryEvaluationResult['band']): string {
  switch (band) {
    case 'Reliable Transfer Mastery':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Stable Understanding':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'Developing Stability':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Emerging Understanding':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export const ClassroomRightPanel: React.FC<ClassroomRightPanelProps> = ({
  activePanel,
  expanded,
  onToggleExpand,
  onClose,
  grade,
  curriculum,
  subject,
  topic,
  sessionType,
  subjectClassification,
  masterySignals,
  masteryEvaluation,
  isAngles = false,
  isWaterCycle = false,
  welcomeData,
  expressions,
  onAddExpression,
  onToggleExpression,
  onRemoveExpression,
  onShareWhiteboardStep,
  onPracticeEvaluated,
  onTransferEvaluated,
  onHintRequested,
  pinnedMessages,
  onUnpinMessage,
  onCopyText,
}) => {
  const assessmentBundle = useMemo(
    () =>
      buildSubjectAssessmentBundle({
        subject,
        topic,
        primaryFamily: subjectClassification.primaryFamily,
        isAngles,
        isWaterCycle,
      }),
    [subject, topic, subjectClassification.primaryFamily, isAngles, isWaterCycle]
  );

  // Lesson Content accordion states
  const [openOverview, setOpenOverview] = useState(true);
  const [openExplanation, setOpenExplanation] = useState(false);
  const [openSteps, setOpenSteps] = useState(false);

  // Interactive Q&A — Practice + Reasoning + Hint states
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [practiceReasoning, setPracticeReasoning] = useState<string>('');
  const [showPracticeHint, setShowPracticeHint] = useState<boolean>(false);
  const [mcFeedback, setMcFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Interactive Q&A — Transfer Validation Challenge states (Section 24)
  const [selectedTransferOption, setSelectedTransferOption] = useState<string>('');
  const [transferReasoning, setTransferReasoning] = useState<string>('');
  const [transferFeedback, setTransferFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Interactive Q&A — Ordering states
  const [orderItems, setOrderItems] = useState(assessmentBundle.orderingQuestion.items);
  const [orderChecked, setOrderChecked] = useState<boolean | null>(null);

  const sessionPack = SESSION_TYPE_PACKS[sessionType];
  const familyLabels = subjectClassification.allFamilies.map(
    (id) => PEDAGOGY_FAMILIES[id].shortLabel
  );

  const panelTitle =
    activePanel === 'lesson'
      ? 'Lesson Content'
      : activePanel === 'whiteboard'
      ? 'Whiteboard'
      : activePanel === 'qa'
      ? 'Interactive Q&A'
      : 'Pinned Messages';

  const moveOrderItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= orderItems.length) return;
    const next = [...orderItems];
    [next[index], next[target]] = [next[target], next[index]];
    setOrderItems(next);
    setOrderChecked(null);
  };

  const handleRequestHint = () => {
    if (!showPracticeHint) {
      setShowPracticeHint(true);
      onHintRequested?.();
    }
  };

  const handleCheckPractice = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === assessmentBundle.practiceQuestion.correctOption;
    setMcFeedback(isCorrect ? 'correct' : 'incorrect');
    onPracticeEvaluated?.({
      isCorrect,
      reasoningText: practiceReasoning,
      usedHint: showPracticeHint,
      selectedAnswer: selectedOption,
    });
  };

  const handleCheckTransfer = () => {
    if (!selectedTransferOption) return;
    const isCorrect = selectedTransferOption === assessmentBundle.transferQuestion.correctOption;
    setTransferFeedback(isCorrect ? 'correct' : 'incorrect');
    onTransferEvaluated?.({
      isCorrect,
      reasoningText: transferReasoning,
      usedHint: false,
      selectedAnswer: selectedTransferOption,
    });
  };

  const masteryBars = [
    {
      label: 'Understanding',
      pct: Math.round(masterySignals.conceptual_understanding * 100),
      color: 'bg-[#15629E]',
    },
    {
      label: 'Reasoning',
      pct: Math.round(masterySignals.reasoning_clarity * 100),
      color: 'bg-indigo-600',
    },
    {
      label: 'Transfer',
      pct: Math.round(masterySignals.transfer_performance * 100),
      color: 'bg-emerald-600',
    },
    {
      label: 'Independence',
      pct: Math.round(masterySignals.independent_completion * 100),
      color: 'bg-amber-500',
    },
  ];

  return (
    <aside
      aria-label={panelTitle}
      className={`border-l border-slate-200 bg-white flex flex-col shrink-0 transition-all duration-200 ${
        expanded ? 'w-full md:w-[540px]' : 'w-full md:w-[375px] lg:w-[395px]'
      }`}
    >
      {/* Warm Cream Header */}
      <div className="flex items-center justify-between border-b border-amber-100/90 bg-[#FDF7ED] px-5 py-3.5 shrink-0">
        <h2 className="font-display text-[15px] font-bold text-[#6B4212]">{panelTitle}</h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={expanded ? `Collapse ${panelTitle}` : `Expand ${panelTitle}`}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-amber-100/70 transition-colors"
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${panelTitle}`}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-amber-100/70 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* PANEL 1: LESSON CONTENT + LIVE MASTERY ENGINE */}
        {activePanel === 'lesson' && (
          <div>
            {/* Title & Metadata Tags */}
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-display text-[17px] font-bold text-slate-900 leading-snug">
                {welcomeData.lessonTitle}
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                  Grade {grade}
                </span>
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                  {curriculum}
                </span>
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                  {subject}
                </span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                  {sessionPack.label}
                </span>
                {familyLabels.map((fam) => (
                  <span
                    key={fam}
                    className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800"
                  >
                    {fam}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Multi-Signal Mastery Progress Card (Sec 25, 27, 51) */}
            <div
              data-testid="classroom-mastery-card"
              className="mx-5 my-4 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                    Live Mastery Progress
                  </p>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${bandBadgeClass(
                        masteryEvaluation.band
                      )}`}
                    >
                      {masteryEvaluation.band}
                    </span>
                    <span className="text-xs font-bold text-slate-800 tabular-nums">
                      {masteryEvaluation.percent}%
                    </span>
                  </div>
                </div>
                <span className="text-[10.5px] font-semibold text-slate-500">
                  Understanding → Reasoning → Transfer
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {masteryBars.map((bar) => (
                  <div key={bar.label} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-600">{bar.label}</span>
                      <span className="font-semibold text-slate-800 tabular-nums">{bar.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${bar.color}`}
                        style={{ width: `${bar.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {(masteryEvaluation.falsePositiveSuppressed ||
                masteryEvaluation.contradictions.length > 0) && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2 text-[11.5px] text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-700" />
                  <span>
                    {masteryEvaluation.contradictions[0]?.stabilizationAction ||
                      masteryEvaluation.suppressionReason}
                  </span>
                </div>
              )}

              <p className="text-[11.5px] text-slate-600 leading-snug">
                <strong className="text-slate-800">Next focus:</strong>{' '}
                {masteryEvaluation.nextPedagogicalAction}
              </p>
            </div>

            {/* Accordion 1: MODULE OVERVIEW */}
            <div className="border-t border-b border-slate-200/80">
              <button
                type="button"
                onClick={() => setOpenOverview((v) => !v)}
                aria-expanded={openOverview}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left text-[12px] font-bold tracking-wide text-slate-900 hover:bg-slate-50"
              >
                <span>MODULE OVERVIEW</span>
                {openOverview ? (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                )}
              </button>

              {openOverview && (
                <div className="px-5 pb-5 space-y-4">
                  {/* Learning Objectives Card */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[inset_3px_0_0_0_#15803D,0_2px_8px_rgba(15,23,42,0.04)]">
                    <h4 className="text-[13.5px] font-bold text-[#166534] mb-3">
                      Learning objectives
                    </h4>
                    <ul className="space-y-2.5">
                      {welcomeData.objectives.map((obj) => (
                        <li
                          key={obj}
                          className="flex items-start gap-2.5 text-[12.5px] text-slate-700 leading-snug"
                        >
                          <CheckCircle2
                            className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Relevance Statement Card */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[inset_3px_0_0_0_#1D4ED8,0_2px_8px_rgba(15,23,42,0.04)]">
                    <h4 className="text-[13.5px] font-bold text-[#1D4ED8] mb-2">
                      Relevance Statement
                    </h4>
                    <p className="text-[12.5px] text-slate-700 leading-relaxed">
                      {welcomeData.relevance}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: STRUCTURED EXPLANATION */}
            <div className="border-b border-slate-200/80">
              <button
                type="button"
                onClick={() => setOpenExplanation((v) => !v)}
                aria-expanded={openExplanation}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left text-[12px] font-bold tracking-wide text-slate-900 hover:bg-slate-50"
              >
                <span>STRUCTURED EXPLANATION</span>
                {openExplanation ? (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                )}
              </button>
              {openExplanation && (
                <div className="px-5 pb-4 space-y-2 text-[12.5px] text-slate-700 leading-relaxed">
                  {welcomeData.structuredSteps.map((line) => (
                    <p key={line} className="rounded-xl bg-slate-50 px-3.5 py-2.5">
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Accordion 3: STEPS TO FOLLOW */}
            <div className="border-b border-slate-200/80">
              <button
                type="button"
                onClick={() => setOpenSteps((v) => !v)}
                aria-expanded={openSteps}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left text-[12px] font-bold tracking-wide text-slate-900 hover:bg-slate-50"
              >
                <span>STEPS TO FOLLOW</span>
                {openSteps ? (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                )}
              </button>
              {openSteps && (
                <ol className="px-5 pb-4 space-y-2 text-[12.5px] text-slate-700 list-decimal list-inside">
                  {welcomeData.stepsToFollow.map((step) => (
                    <li key={step} className="leading-snug">
                      {step}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}

        {/* PANEL 2: WHITEBOARD */}
        {activePanel === 'whiteboard' && (
          <div className="p-4">
            <ClassroomWhiteboard
              variant="sidebar"
              expressions={expressions}
              onAddExpression={onAddExpression}
              onToggleExpression={onToggleExpression}
              onRemoveExpression={onRemoveExpression}
              onShareStepWithTutor={onShareWhiteboardStep}
            />
          </div>
        )}

        {/* PANEL 3: INTERACTIVE Q&A (Reasoning + Hint Tracking + Transfer Validation — Sec 23–27) */}
        {activePanel === 'qa' && (
          <div className="p-4 space-y-4">
            {/* Compact Mastery Band Strip */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
              <span className="text-[11px] font-semibold text-slate-600">Current Standing</span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${bandBadgeClass(
                  masteryEvaluation.band
                )}`}
              >
                {masteryEvaluation.band} · {masteryEvaluation.percent}%
              </span>
            </div>

            {/* Card 1: Core Concept + Reasoning + Guided Hint */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10.5px] font-bold tracking-wider text-slate-500">
                  STEP 1 · CONCEPT &amp; REASONING CHECK
                </p>
                <button
                  type="button"
                  onClick={handleRequestHint}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-900 transition-colors"
                >
                  <Lightbulb className="h-3 w-3" aria-hidden="true" />
                  <span>{showPracticeHint ? 'Hint Shown' : 'Guided Hint'}</span>
                </button>
              </div>

              <p className="text-[13px] font-semibold text-slate-900 leading-snug">
                {assessmentBundle.practiceQuestion.prompt}
              </p>

              {showPracticeHint && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-[11.5px] text-amber-950 leading-snug">
                  <strong>Hint:</strong> {assessmentBundle.practiceQuestion.guidedHint}
                </div>
              )}

              <div className="space-y-2" role="radiogroup" aria-label="Concept check options">
                {assessmentBundle.practiceQuestion.options.map((opt) => {
                  const chosen = selectedOption === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={chosen}
                      onClick={() => {
                        setSelectedOption(opt);
                        setMcFeedback(null);
                      }}
                      className={`w-full flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-[12.5px] font-medium transition-colors ${
                        chosen
                          ? 'border-[#1D4ED8] bg-blue-50 text-[#1E3A8A]'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                          chosen ? 'border-[#1D4ED8]' : 'border-slate-300'
                        }`}
                      >
                        {chosen && <span className="h-2 w-2 rounded-full bg-[#1D4ED8]" />}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label
                  htmlFor="qa-practice-reasoning"
                  className="block text-[11.5px] font-semibold text-slate-700 mb-1"
                >
                  Explain your reasoning (1 sentence)
                </label>
                <textarea
                  id="qa-practice-reasoning"
                  rows={2}
                  value={practiceReasoning}
                  onChange={(e) => setPracticeReasoning(e.target.value)}
                  placeholder={assessmentBundle.practiceQuestion.reasoningPlaceholder}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#1D4ED8] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  disabled={!selectedOption}
                  onClick={handleCheckPractice}
                  className="self-start rounded-lg bg-[#1245A8] hover:bg-[#0D3585] disabled:opacity-45 px-4 py-2 text-xs font-semibold text-white transition-colors"
                >
                  Check Answer &amp; Reasoning
                </button>
                {mcFeedback === 'correct' && (
                  <p className="text-xs font-semibold text-emerald-700 leading-snug">
                    {assessmentBundle.practiceQuestion.correctExplanation}
                    {practiceReasoning.trim().length < 12 &&
                      ' Add a short "because..." sentence next time to confirm full reasoning stability.'}
                  </p>
                )}
                {mcFeedback === 'incorrect' && (
                  <p className="text-xs font-semibold text-amber-700 leading-snug">
                    {assessmentBundle.practiceQuestion.incorrectNudge}
                  </p>
                )}
              </div>
            </div>

            {/* Card 2: Transfer Validation Check (Sec 24 — novel variation required for high mastery) */}
            <div
              data-testid="transfer-validation-card"
              className="rounded-2xl border border-indigo-200/80 bg-indigo-50/35 p-4 space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider text-indigo-800">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>STEP 2 · TRANSFER VALIDATION</span>
                </span>
                <span className="rounded-full bg-white border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                  Independent Check
                </span>
              </div>
              <p className="text-[11px] font-medium text-indigo-700/90">
                {assessmentBundle.transferQuestion.variationSummary}
              </p>
              <p className="text-[13px] font-semibold text-slate-900 leading-snug">
                {assessmentBundle.transferQuestion.prompt}
              </p>

              <div className="space-y-2" role="radiogroup" aria-label="Transfer check options">
                {assessmentBundle.transferQuestion.options.map((opt) => {
                  const chosen = selectedTransferOption === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={chosen}
                      onClick={() => {
                        setSelectedTransferOption(opt);
                        setTransferFeedback(null);
                      }}
                      className={`w-full flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-[12.5px] font-medium transition-colors ${
                        chosen
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                          chosen ? 'border-indigo-600' : 'border-slate-300'
                        }`}
                      >
                        {chosen && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label
                  htmlFor="qa-transfer-reasoning"
                  className="block text-[11.5px] font-semibold text-slate-700 mb-1"
                >
                  Why does the same concept apply here?
                </label>
                <textarea
                  id="qa-transfer-reasoning"
                  rows={2}
                  value={transferReasoning}
                  onChange={(e) => setTransferReasoning(e.target.value)}
                  placeholder={assessmentBundle.transferQuestion.reasoningPlaceholder}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={!selectedTransferOption}
                  onClick={handleCheckTransfer}
                  className="self-start rounded-lg bg-indigo-700 hover:bg-indigo-800 disabled:opacity-45 px-4 py-2 text-xs font-semibold text-white transition-colors"
                >
                  Verify Transfer
                </button>
                {transferFeedback === 'correct' && (
                  <p className="text-xs font-semibold text-emerald-700 leading-snug">
                    {assessmentBundle.transferQuestion.correctExplanation}
                  </p>
                )}
                {transferFeedback === 'incorrect' && (
                  <p className="text-xs font-semibold text-amber-700 leading-snug">
                    {assessmentBundle.transferQuestion.incorrectNudge}
                  </p>
                )}
              </div>
            </div>

            {/* Card 3: Ordering Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
              <p className="text-[10.5px] font-bold tracking-wider text-slate-500">
                STEP 3 · REASONING SEQUENCE
              </p>
              <p className="text-[13px] font-semibold text-slate-900 leading-snug">
                {assessmentBundle.orderingQuestion.prompt}
              </p>

              <div className="space-y-2">
                {orderItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs text-slate-800"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700 tabular-nums">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{item.text}</span>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveOrderItem(idx, -1)}
                        aria-label={`Move step ${idx + 1} up`}
                        className="rounded p-1 text-slate-500 hover:bg-white disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === orderItems.length - 1}
                        onClick={() => moveOrderItem(idx, 1)}
                        aria-label={`Move step ${idx + 1} down`}
                        className="rounded p-1 text-slate-500 hover:bg-white disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const ok = checkOrderingAnswer(
                      orderItems.map((i) => i.id),
                      assessmentBundle.orderingQuestion.expectedOrderIds
                    );
                    setOrderChecked(ok);
                    onPracticeEvaluated?.({
                      isCorrect: ok,
                      reasoningText: ok
                        ? 'Correctly sequenced the core reasoning steps because each step builds on the prior one.'
                        : '',
                      usedHint: false,
                      selectedAnswer: 'Ordering Sequence',
                    });
                  }}
                  className="rounded-lg border border-[#1245A8] text-[#1245A8] hover:bg-blue-50 px-3.5 py-1.5 text-xs font-semibold"
                >
                  Check Order
                </button>
                {orderChecked === true && (
                  <span className="text-xs font-semibold text-emerald-700">Great sequence!</span>
                )}
                {orderChecked === false && (
                  <span className="text-xs font-semibold text-amber-700">
                    {assessmentBundle.orderingQuestion.hintOnWrong}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 4: PINNED MESSAGES */}
        {activePanel === 'pinned' && (
          <div className="p-4 space-y-3">
            {pinnedMessages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                No pinned messages yet. Click the pin icon on any classroom message to save it
                here.
              </div>
            ) : (
              pinnedMessages.map((pm) => (
                <div
                  key={pm.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{pm.author}</span>
                    <span className="text-[11px] text-slate-400 tabular-nums">{pm.timestamp}</span>
                  </div>
                  <p className="text-[12.5px] text-slate-700 leading-relaxed">{pm.text}</p>
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onCopyText(pm.text)}
                      aria-label="Copy pinned message"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUnpinMessage(pm.id)}
                      aria-label="Unpin message"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <PinOff className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
