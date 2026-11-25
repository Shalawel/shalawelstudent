import React, { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import {
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileText,
  Info,
  LayoutGrid,
  List,
  Play,
  Plus,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import type { SmartQuizInput, StartSessionInput } from '../types/dashboard';
import {
  LEARNING_PLAN_SUBJECTS,
  computeLearningPlanOverview,
  createRequestedTopicLesson,
  filterLearningPlanLessons,
  markLessonStarted,
  recordLessonPracticeProgress,
  validateTopicRequest,
  type LearningPlanLesson,
  type LearningPlanMode,
  type LearningPlanSubject,
  type LearningPlanViewMode,
} from '../utils/learningPlanLogic';
import { playUiSound } from '../utils/uiSounds';

interface LearningPlanViewProps {
  lessons: LearningPlanLesson[];
  onUpdateLessons: React.Dispatch<React.SetStateAction<LearningPlanLesson[]>>;
  onStartTopicSession: (input: StartSessionInput) => void;
  onLaunchSmartQuiz: (input: SmartQuizInput, lessonId?: string) => void;
  onOpenLessonNotes: (lesson: LearningPlanLesson) => void;
  onNotify: (message: string) => void;
}

const SPRING_TAB = { type: 'spring' as const, stiffness: 460, damping: 34 };
const SPRING_CARD = { type: 'spring' as const, stiffness: 360, damping: 30 };

export const LearningPlanView: React.FC<LearningPlanViewProps> = ({
  lessons,
  onUpdateLessons,
  onStartTopicSession,
  onLaunchSmartQuiz,
  onOpenLessonNotes,
  onNotify,
}) => {
  const [mode, setMode] = useState<LearningPlanMode>('concept-mastery');
  const [viewMode, setViewMode] = useState<LearningPlanViewMode>('list');
  const [activeSubject, setActiveSubject] = useState<LearningPlanSubject>('English');
  const [activeInfoTip, setActiveInfoTip] = useState<'mastery' | 'completed' | null>(null);

  // Interactive Summary Modal
  const [summaryLessonId, setSummaryLessonId] = useState<string | null>(null);

  // Interactive Request a Topic Modal
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [requestSubject, setRequestSubject] = useState<LearningPlanSubject>('English');
  const [requestMode, setRequestMode] = useState<LearningPlanMode>('concept-mastery');
  const [requestTitle, setRequestTitle] = useState<string>('');
  const [requestCategory, setRequestCategory] = useState<string>('');
  const [requestNote, setRequestNote] = useState<string>('');
  const [requestError, setRequestError] = useState<string | null>(null);

  const visibleLessons = useMemo(
    () => filterLearningPlanLessons(lessons, activeSubject, mode),
    [lessons, activeSubject, mode]
  );

  const overview = useMemo(
    () => computeLearningPlanOverview(lessons, activeSubject, mode),
    [lessons, activeSubject, mode]
  );

  const summaryLesson = useMemo(
    () => lessons.find((l) => l.id === summaryLessonId) ?? null,
    [lessons, summaryLessonId]
  );

  const handleOpenRequestModal = () => {
    playUiSound('pop');
    setRequestSubject(activeSubject);
    setRequestMode(mode);
    setRequestTitle('');
    setRequestCategory('');
    setRequestNote('');
    setRequestError(null);
    setShowRequestModal(true);
  };

  const handleSubmitTopicRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateTopicRequest({
      subject: requestSubject,
      mode: requestMode,
      title: requestTitle,
      category: requestCategory,
      note: requestNote,
    });
    if (error) {
      setRequestError(error);
      playUiSound('subtle');
      return;
    }

    const created = createRequestedTopicLesson({
      subject: requestSubject,
      mode: requestMode,
      title: requestTitle,
      category: requestCategory,
      note: requestNote,
    });

    playUiSound('success');
    onUpdateLessons((prev) => [created, ...prev]);
    setActiveSubject(requestSubject);
    setMode(requestMode);
    setShowRequestModal(false);
    onNotify(`Topic "${created.title}" added to your ${requestSubject} Learning Plan.`);
  };

  const handleStartLesson = (lesson: LearningPlanLesson) => {
    playUiSound('switch');
    onUpdateLessons((prev) => markLessonStarted(prev, lesson.id));
    onStartTopicSession({
      helpType: lesson.mode === 'test-prep' ? 'Prepare for a Test' : 'Learn a Lesson',
      subject: lesson.subject,
      lessonSource: 'learning-plan',
      topic: lesson.title,
      specificQuestion: `Guide me step-by-step through "${lesson.title}" (${lesson.category}).`,
    });
  };

  const handlePracticeOrQuiz = (lesson: LearningPlanLesson) => {
    playUiSound('switch');
    onLaunchSmartQuiz(
      {
        subject: lesson.subject,
        topic: lesson.title,
      },
      lesson.id
    );
  };

  const handleBoostMasteryInSummary = (lesson: LearningPlanLesson) => {
    playUiSound('success');
    const nextScore = Math.min(100, Math.max(85, lesson.masteryPercent + 10));
    onUpdateLessons((prev) => recordLessonPracticeProgress(prev, lesson.id, nextScore));
    onNotify(`Updated mastery for "${lesson.title}" to ${nextScore}%.`);
  };

  const getMasteryTextColor = (percent: number) => {
    if (percent >= 70) return 'text-emerald-600 dark:text-emerald-400';
    return 'text-[#D97706] dark:text-amber-400';
  };

  return (
    <LayoutGroup id="my-learning-plan-workspace">
      <div
        data-testid="learning-plan-view"
        className="space-y-4 pb-8 max-w-[1320px] mx-auto"
      >
        {/* Top Page Heading */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-xl sm:text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">
            My Learning Plan
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">
            Track your lessons, progress, and learning goals.
          </p>
        </motion.div>

        {/* Row 1: Mode Switcher (Concept Mastery / Test Prep) + List/Grid + Request a Topic */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.03, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 px-4 py-3 shadow-[0_3px_14px_rgba(15,23,42,0.04)] flex flex-wrap items-center justify-between gap-3"
        >
          {/* Mode Segmented Tabs */}
          <div
            role="tablist"
            aria-label="Learning plan mode"
            className="inline-flex items-center gap-1 rounded-xl bg-[#EEF4FB] dark:bg-slate-800/80 p-1"
          >
            {(
              [
                {
                  id: 'concept-mastery' as const,
                  label: 'Concept Mastery',
                },
                {
                  id: 'test-prep' as const,
                  label: 'Test Prep',
                },
              ] as const
            ).map((tab) => {
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-testid={`mode-tab-${tab.id}`}
                  onClick={() => {
                    if (mode !== tab.id) {
                      playUiSound('switch');
                      setMode(tab.id);
                    }
                  }}
                  className={`relative inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6] ${
                    active
                      ? tab.id === 'concept-mastery'
                        ? 'text-[#D97706] dark:text-amber-300'
                        : 'text-[#15629E] dark:text-sky-300'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="lp-mode-active-pill"
                      transition={SPRING_TAB}
                      aria-hidden="true"
                      className="absolute inset-0 rounded-lg bg-white dark:bg-slate-900 border-[1.5px] border-slate-900 dark:border-sky-400 shadow-[0_2px_8px_rgba(15,23,42,0.08)]"
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {tab.id === 'concept-mastery' ? (
                      <Target
                        className="h-4 w-4 text-[#EA580C] dark:text-amber-400 shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <ClipboardList
                        className="h-4 w-4 text-[#2563EB] dark:text-sky-400 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: List / Grid + Request a Topic */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Lesson view layout"
              className="inline-flex items-center gap-1.5"
            >
              {(
                [
                  { id: 'list' as const, label: 'List', Icon: List },
                  { id: 'grid' as const, label: 'Grid', Icon: LayoutGrid },
                ] as const
              ).map(({ id, label, Icon }) => {
                const active = viewMode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    data-testid={`view-toggle-${id}`}
                    onClick={() => {
                      if (viewMode !== id) {
                        playUiSound('click');
                        setViewMode(id);
                      }
                    }}
                    className={`relative inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6] ${
                      active
                        ? 'text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="lp-view-toggle-pill"
                        transition={SPRING_TAB}
                        aria-hidden="true"
                        className="absolute inset-0 rounded-lg bg-[#0095F6] shadow-[0_2px_10px_rgba(0,149,246,0.28)]"
                      />
                    )}
                    <Icon className="relative z-10 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="relative z-10">{label}</span>
                  </button>
                );
              })}
            </div>

            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 520, damping: 32 }}
              onClick={handleOpenRequestModal}
              data-testid="request-topic-button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#E08E00] px-4 py-2 text-xs font-semibold text-white shadow-[0_3px_10px_rgba(245,158,11,0.28)] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
            >
              <ClipboardCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Request a Topic</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Row 2: Subject Selector Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 px-4 py-2.5 shadow-[0_3px_14px_rgba(15,23,42,0.04)] flex flex-wrap items-center gap-3"
        >
          <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 pl-2 pr-1 shrink-0">
            Subject
          </span>

          <div
            role="tablist"
            aria-label="Filter by subject"
            className="flex-1 min-w-0 rounded-xl bg-[#F0F7FF] dark:bg-slate-800/75 p-1 flex items-center gap-1 overflow-x-auto"
          >
            {LEARNING_PLAN_SUBJECTS.map((subj) => {
              const active = activeSubject === subj;
              return (
                <button
                  key={subj}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-testid={`subject-tab-${subj.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => {
                    if (activeSubject !== subj) {
                      playUiSound('click');
                      setActiveSubject(subj);
                      setActiveInfoTip(null);
                    }
                  }}
                  className={`relative rounded-lg px-4 py-2 text-xs sm:text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6] ${
                    active
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="lp-subject-active-card"
                      transition={SPRING_TAB}
                      aria-hidden="true"
                      className="absolute inset-0 rounded-lg bg-white dark:bg-slate-900 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
                    />
                  )}
                  <span className="relative z-10">{subj}</span>
                  {active && (
                    <motion.span
                      layoutId="lp-subject-active-underline"
                      transition={SPRING_TAB}
                      aria-hidden="true"
                      className="absolute left-3.5 right-3.5 bottom-1 h-[2.5px] rounded-full bg-[#F59E0B] z-10"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Main White Workspace Card */}
        <motion.section
          aria-labelledby="learning-plan-subject-heading"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.09, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 p-4 sm:p-6 shadow-[0_6px_24px_rgba(15,23,42,0.04)] space-y-4"
        >
          {/* Subject Overview Summary Box */}
          <div
            data-testid="learning-plan-overview-card"
            className="rounded-2xl bg-[#FCFDFF] dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800 p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h2
                  id="learning-plan-subject-heading"
                  className="font-display text-base sm:text-[17px] font-bold text-slate-900 dark:text-white"
                >
                  {activeSubject}
                </h2>
                <p
                  data-testid="learning-plan-overview-counts"
                  className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums"
                >
                  {overview.masteredCount} of {overview.totalCurriculumLessons} lessons mastered ·{' '}
                  {overview.inProgressCount} in progress
                </p>
              </div>

              <div className="sm:text-right">
                <motion.p
                  key={`${activeSubject}-${mode}-${overview.overallMasteryPercent}`}
                  initial={{ opacity: 0.4, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  data-testid="learning-plan-overall-mastery"
                  className="font-display text-2xl sm:text-[26px] font-bold text-[#0F3D6E] dark:text-sky-300 tabular-nums leading-none"
                >
                  {overview.overallMasteryPercent}%
                </motion.p>
                <div className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>Overall Mastery</span>
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound('subtle');
                      setActiveInfoTip((prev) => (prev === 'mastery' ? null : 'mastery'));
                    }}
                    aria-label="About Overall Mastery"
                    aria-expanded={activeInfoTip === 'mastery'}
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#0095F6] hover:bg-sky-50 dark:hover:bg-sky-950/60 transition-colors cursor-pointer"
                  >
                    <Info className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Lessons Completed Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                  <span>Lessons Completed</span>
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound('subtle');
                      setActiveInfoTip((prev) => (prev === 'completed' ? null : 'completed'));
                    }}
                    aria-label="About Lessons Completed"
                    aria-expanded={activeInfoTip === 'completed'}
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#0095F6] hover:bg-sky-50 dark:hover:bg-sky-950/60 transition-colors cursor-pointer"
                  >
                    <Info className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
                <span
                  data-testid="learning-plan-completed-percent"
                  className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums"
                >
                  {overview.lessonsCompletedPercent}%
                </span>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(2, overview.lessonsCompletedPercent)}%` }}
                  transition={{ type: 'spring', stiffness: 160, damping: 24 }}
                  className="h-full rounded-full bg-[#0095F6]"
                />
              </div>
            </div>

            {/* Collapsible Animated Info Callout */}
            <AnimatePresence initial={false}>
              {activeInfoTip && (
                <motion.div
                  key={activeInfoTip}
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl bg-[#F0F7FF] dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2">
                    <span>
                      {activeInfoTip === 'mastery'
                        ? 'Overall Mastery reflects your verified accuracy across mastered and in-progress lessons in this track.'
                        : 'Lessons Completed shows the percentage of curriculum lessons mastered out of the full grade-level catalog.'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveInfoTip(null)}
                      aria-label="Close explanation"
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white shrink-0 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Lesson Cards (List or Grid with Layout Motion) */}
          <div
            data-testid="learning-plan-lessons-container"
            data-layout={viewMode}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                : 'space-y-3.5'
            }
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleLessons.map((lesson, idx) => {
                const isMastered = lesson.status === 'Mastered';
                const isInProgress = lesson.status === 'In Progress';

                return (
                  <motion.article
                    key={lesson.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{
                      layout: SPRING_CARD,
                      opacity: { duration: 0.2 },
                      y: { duration: 0.24, delay: Math.min(idx * 0.035, 0.18) },
                    }}
                    whileHover={{ y: -2 }}
                    data-testid={`learning-plan-lesson-${lesson.id}`}
                    className={`rounded-2xl border p-4 sm:p-5 transition-shadow duration-200 hover:shadow-[0_8px_22px_rgba(15,23,42,0.06)] ${
                      isMastered
                        ? 'bg-[#FAFAFC] dark:bg-slate-800/55 border-slate-300/90 dark:border-slate-700'
                        : 'bg-[#FAFAFC] dark:bg-slate-800/40 border-slate-200/90 dark:border-slate-800'
                    } ${
                      viewMode === 'grid'
                        ? 'flex flex-col justify-between gap-4'
                        : 'flex flex-col lg:flex-row lg:items-center justify-between gap-4'
                    }`}
                  >
                    {/* Left: Title + Status/Source Tags + Category + Mastery Bar */}
                    <div
                      className={`min-w-0 space-y-2.5 ${
                        viewMode === 'list' ? 'flex-1 lg:max-w-[58%]' : 'w-full'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {isMastered ? (
                          <CheckCircle2
                            className="h-4 w-4 text-slate-900 dark:text-emerald-400 shrink-0"
                            aria-hidden="true"
                          />
                        ) : isInProgress ? (
                          <Clock
                            className="h-4 w-4 text-[#D97706] dark:text-amber-400 shrink-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <Target
                            className="h-4 w-4 text-slate-700 dark:text-slate-300 shrink-0"
                            aria-hidden="true"
                          />
                        )}

                        <h3 className="text-[14px] sm:text-[15px] font-semibold text-slate-900 dark:text-white leading-snug">
                          {lesson.title}
                        </h3>

                        {/* Status Label matching reference */}
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap border ${
                            isMastered
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800'
                              : isInProgress
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {lesson.status}
                        </span>

                        {/* Source Tag matching reference */}
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap border ${
                            lesson.sourceTag === 'Requested Topic'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800'
                              : lesson.sourceTag === 'AI-Recommended'
                              ? 'bg-sky-50 dark:bg-sky-950/40 text-[#0F5C99] dark:text-sky-300 border-sky-200/80 dark:border-sky-800'
                              : 'bg-[#E6FAF5] dark:bg-teal-950/45 text-[#0F766E] dark:text-teal-300 border-[#B5EAE0] dark:border-teal-800'
                          }`}
                        >
                          {lesson.sourceTag}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lesson.category}
                      </p>

                      {/* Mastery Level + Animated Progress Bar */}
                      <div className="space-y-1.5 pt-0.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Mastery Level</span>
                          <span
                            className={`font-semibold tabular-nums ${getMasteryTextColor(
                              lesson.masteryPercent
                            )}`}
                          >
                            {lesson.masteryPercent}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/75 dark:bg-slate-700/80">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${lesson.masteryPercent}%` }}
                            transition={{ type: 'spring', stiffness: 170, damping: 24 }}
                            className="h-full rounded-full bg-[#0095F6]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: Interactive Action Buttons matching screenshot */}
                    <div
                      className={`flex flex-wrap items-center gap-2 shrink-0 ${
                        viewMode === 'grid'
                          ? 'pt-3 border-t border-slate-200/70 dark:border-slate-700/70'
                          : 'lg:justify-end'
                      }`}
                    >
                      {isMastered ? (
                        <>
                          <motion.button
                            type="button"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              playUiSound('click');
                              setSummaryLessonId(lesson.id);
                            }}
                            data-testid={`btn-view-summary-${lesson.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0095F6] hover:bg-[#0080D6] px-3.5 py-2 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(0,149,246,0.22)] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>View Summary</span>
                          </motion.button>

                          <motion.button
                            type="button"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handlePracticeOrQuiz(lesson)}
                            data-testid={`btn-practice-${lesson.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B3B66] hover:bg-[#082B4B] px-3.5 py-2 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6]"
                          >
                            <Play className="h-3.5 w-3.5 fill-current shrink-0" aria-hidden="true" />
                            <span>Practice</span>
                          </motion.button>

                          <motion.button
                            type="button"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              playUiSound('click');
                              onOpenLessonNotes(lesson);
                            }}
                            data-testid={`btn-notes-${lesson.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6]"
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>{lesson.hasNotes ? 'View Notes' : 'Add Notes'}</span>
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            type="button"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleStartLesson(lesson)}
                            data-testid={`btn-start-lesson-${lesson.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0095F6] hover:bg-[#0080D6] px-3.5 py-2 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(0,149,246,0.22)] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
                          >
                            <Play className="h-3.5 w-3.5 fill-current shrink-0" aria-hidden="true" />
                            <span>{isInProgress ? 'Continue Lesson' : 'Start Lesson'}</span>
                          </motion.button>

                          <motion.button
                            type="button"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handlePracticeOrQuiz(lesson)}
                            data-testid={`btn-quiz-${lesson.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6]"
                          >
                            <Target className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>Take a Quiz</span>
                          </motion.button>

                          <motion.button
                            type="button"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              playUiSound('click');
                              onOpenLessonNotes(lesson);
                            }}
                            data-testid={`btn-notes-${lesson.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6]"
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>{lesson.hasNotes ? 'View Notes' : 'Add Notes'}</span>
                          </motion.button>
                        </>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>

            {visibleLessons.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/30 p-8 text-center space-y-2.5"
              >
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No lessons in {activeSubject} ({mode === 'concept-mastery' ? 'Concept Mastery' : 'Test Prep'}) yet.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Request a topic to add your first personalized lesson to this track.
                </p>
                <button
                  type="button"
                  onClick={handleOpenRequestModal}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#E08E00] px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Request a Topic
                </button>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Interactive Lesson Summary Modal */}
        <AnimatePresence>
          {summaryLesson && (
            <motion.div
              key="summary-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-4"
              onClick={() => setSummaryLessonId(null)}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="lesson-summary-title"
                data-testid="lesson-summary-modal"
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={SPRING_CARD}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
              >
                <div className="bg-[#0B3B66] px-5 py-4 flex items-start justify-between gap-3 text-white">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-sky-200">
                      {summaryLesson.subject} · {summaryLesson.category}
                    </p>
                    <h2
                      id="lesson-summary-title"
                      className="mt-0.5 font-display text-base sm:text-lg font-bold leading-snug"
                    >
                      {summaryLesson.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSummaryLessonId(null)}
                    aria-label="Close lesson summary"
                    className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Mastery & Timing strip */}
                  <div className="rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        Verified Mastery Level
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {summaryLesson.masteryPercent}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${summaryLesson.masteryPercent}%` }}
                        transition={{ type: 'spring', stiffness: 180, damping: 24 }}
                        className="h-full rounded-full bg-[#0095F6]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {summaryLesson.lastActivityLabel} · Est. review {summaryLesson.estimatedMinutes} min
                    </p>
                  </div>

                  {/* Teacher / Coach Note */}
                  <div className="rounded-xl bg-[#F0F7FF] dark:bg-sky-950/35 border border-sky-200/70 dark:border-sky-800/60 p-3.5">
                    <p className="text-[11px] font-bold text-[#0F5C99] dark:text-sky-300">
                      Instructor Feedback
                    </p>
                    <p className="mt-1 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      {summaryLesson.teacherNote}
                    </p>
                  </div>

                  {/* Key Takeaways */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Key Concepts Mastered
                    </p>
                    <ul className="space-y-1.5">
                      {summaryLesson.summaryPoints.map((pt, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
                        >
                          <CheckCircle2
                            className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                    {summaryLesson.masteryPercent < 100 && (
                      <button
                        type="button"
                        onClick={() => handleBoostMasteryInSummary(summaryLesson)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition-colors cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Log Review (+10%)</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => {
                          const target = summaryLesson;
                          setSummaryLessonId(null);
                          handleStartLesson(target);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        Review with Tutor
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const target = summaryLesson;
                          setSummaryLessonId(null);
                          handlePracticeOrQuiz(target);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0095F6] hover:bg-[#0080D6] px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                        <span>Practice Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Request a Topic Modal */}
        <AnimatePresence>
          {showRequestModal && (
            <motion.div
              key="request-topic-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-4"
              onClick={() => setShowRequestModal(false)}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="request-topic-modal-title"
                data-testid="request-topic-modal"
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={SPRING_CARD}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
              >
                <div className="bg-[#0B3B66] px-5 py-4 flex items-center justify-between gap-3 text-white">
                  <div>
                    <h2
                      id="request-topic-modal-title"
                      className="font-display text-base font-bold"
                    >
                      Request a Topic
                    </h2>
                    <p className="text-xs text-sky-200 mt-0.5">
                      Add a custom lesson directly to your Learning Plan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    aria-label="Close request a topic modal"
                    className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmitTopicRequest} className="p-5 space-y-4" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="req-topic-subject"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                      >
                        Subject
                      </label>
                      <select
                        id="req-topic-subject"
                        value={requestSubject}
                        onChange={(e) => setRequestSubject(e.target.value as LearningPlanSubject)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6]"
                      >
                        {LEARNING_PLAN_SUBJECTS.map((subj) => (
                          <option key={subj} value={subj}>
                            {subj}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="req-topic-mode"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                      >
                        Track
                      </label>
                      <select
                        id="req-topic-mode"
                        value={requestMode}
                        onChange={(e) => setRequestMode(e.target.value as LearningPlanMode)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6]"
                      >
                        <option value="concept-mastery">Concept Mastery</option>
                        <option value="test-prep">Test Prep</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="req-topic-title"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                    >
                      Topic Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="req-topic-title"
                      type="text"
                      value={requestTitle}
                      onChange={(e) => {
                        setRequestTitle(e.target.value);
                        if (requestError) setRequestError(null);
                      }}
                      placeholder="e.g., Modifiers & Parallel Structure"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="req-topic-category"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                    >
                      Unit / Category <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="req-topic-category"
                      type="text"
                      value={requestCategory}
                      onChange={(e) => {
                        setRequestCategory(e.target.value);
                        if (requestError) setRequestError(null);
                      }}
                      placeholder="e.g., Grammar & Language"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="req-topic-note"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                    >
                      Learning Goal or Note (optional)
                    </label>
                    <textarea
                      id="req-topic-note"
                      rows={2}
                      value={requestNote}
                      onChange={(e) => setRequestNote(e.target.value)}
                      placeholder="Share what you want to focus on or upcoming test dates..."
                      className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6]"
                    />
                  </div>

                  {requestError && (
                    <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
                      {requestError}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRequestModal(false)}
                      className="rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      data-testid="submit-request-topic-button"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#E08E00] px-4 py-2 text-xs font-semibold text-white shadow-[0_3px_10px_rgba(245,158,11,0.28)] transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Add to Learning Plan</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
};
