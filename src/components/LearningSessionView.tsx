import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  FileBarChart2,
  FlaskConical,
  Info,
  LayoutGrid,
  List,
  PenTool,
  Plus,
  RotateCcw,
  X,
  Zap,
} from 'lucide-react';
import type {
  LearningAction,
  SmartQuizInput,
  StartSessionInput,
} from '../types/dashboard';
import {
  LEARNING_PATH_SUBJECTS,
  addLessonToPath,
  archiveSubjectPlan,
  buildSessionAnalysisReport,
  computeSubjectPathSummary,
  reorderLessonInList,
  unarchivePlan,
  validateNewTopicInput,
  type LearningPathLesson,
  type LearningPathState,
  type LearningPathViewMode,
  type LearningTrackMode,
  type SessionAnalysisReportData,
} from '../utils/learningSessionLogic';
import { SessionAnalysisView } from './SessionAnalysisView';
import { playUiSound } from '../utils/uiSounds';

interface LearningSessionViewProps {
  pathState: LearningPathState;
  onUpdatePathState: React.Dispatch<React.SetStateAction<LearningPathState>>;
  actions: LearningAction[];
  onStartTopicSession: (input: StartSessionInput) => void;
  onLaunchSmartQuiz: (input: SmartQuizInput) => void;
  onOpenSetGoal: () => void;
  onOpenOnboardingWizard: () => void;
  onTriggerReadinessAction: (action: LearningAction) => void;
  onGeneratePlan: (action: LearningAction) => void;
  onNotify: (message: string) => void;
}

const ModifyGoalIcon: React.FC = () => (
  <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
    <circle cx="24" cy="24" r="16" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2.5" />
    <circle cx="24" cy="24" r="10" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2.5" />
    <circle cx="24" cy="24" r="4.5" fill="#EF4444" />
    <path d="M27 21L38 10M38 10H32M38 10V16" stroke="#15629E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="33" cy="34" r="6" fill="#10B981" />
    <path d="M30.5 34L32.2 35.7L35.6 32.3" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AddTopicIcon: React.FC = () => (
  <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
    <rect x="11" y="9" width="26" height="32" rx="6" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="18" y="6" width="12" height="6" rx="3" fill="#F59E0B" />
    <circle cx="24" cy="26" r="8" fill="#10B981" />
    <path d="M24 22V30M20 26H28" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const ArchivePlanIcon: React.FC = () => (
  <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
    <rect x="9" y="18" width="30" height="22" rx="5" fill="#F59E0B" />
    <path d="M13 18L19 11H29L35 18" fill="#38BDF8" />
    <rect x="15" y="13" width="18" height="7" rx="2" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1.5" />
    <circle cx="34" cy="34" r="6.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M31.5 34L33.2 35.7L36.5 32.4" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ReorderLessonsIcon: React.FC = () => (
  <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
    <rect x="10" y="12" width="22" height="5" rx="2.5" fill="#F59E0B" />
    <rect x="10" y="21" width="22" height="5" rx="2.5" fill="#CBD5E1" />
    <rect x="10" y="30" width="22" height="5" rx="2.5" fill="#F59E0B" />
    <path d="M37 12V35M37 12L33.5 15.5M37 12L40.5 15.5M37 35L33.5 31.5M37 35L40.5 31.5" stroke="#15629E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const OnboardingWizardIcon: React.FC = () => (
  <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
    <rect x="10" y="11" width="28" height="20" rx="4" fill="#EFF6FF" stroke="#60A5FA" strokeWidth="2" />
    <circle cx="24" cy="21" r="6" fill="#FED7AA" stroke="#F97316" strokeWidth="2" />
    <circle cx="24" cy="21" r="2.2" fill="#EA580C" />
    <path d="M24 31V39M17 39L24 34L31 39" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LearningSessionView: React.FC<LearningSessionViewProps> = ({
  pathState,
  onUpdatePathState,
  actions,
  onStartTopicSession,
  onLaunchSmartQuiz,
  onOpenSetGoal,
  onOpenOnboardingWizard,
  onTriggerReadinessAction,
  onGeneratePlan,
  onNotify,
}) => {
  const [trackMode, setTrackMode] = useState<LearningTrackMode>('Concept Mastery');
  const [viewMode, setViewMode] = useState<LearningPathViewMode>('list');
  const [activeSubject, setActiveSubject] = useState<string>('Mathematics');
  const [reorderMode, setReorderMode] = useState<boolean>(false);
  const [openInfoTip, setOpenInfoTip] = useState<'mastery' | 'progress' | 'evolve' | null>(null);

  // Add new topic inline drawer/panel state
  const [showAddTopic, setShowAddTopic] = useState<boolean>(false);
  const [newTopicTitle, setNewTopicTitle] = useState<string>('');
  const [newTopicDomain, setNewTopicDomain] = useState<string>('');
  const [newTopicError, setNewTopicError] = useState<string | null>(null);

  // Session Analysis Report state
  const [activeReport, setActiveReport] = useState<SessionAnalysisReportData | null>(null);

  const visibleLessons = useMemo(
    () =>
      pathState.lessons.filter(
        (l) => l.subject === activeSubject && l.trackMode === trackMode
      ),
    [pathState.lessons, activeSubject, trackMode]
  );

  const summary = useMemo(
    () => computeSubjectPathSummary(visibleLessons),
    [visibleLessons]
  );

  // Build readiness check list synced with live actions
  const readinessChecks = useMemo(() => {
    if (actions.length > 0) return actions;
    return [
      {
        id: 'rc-english-default',
        category: 'Readiness Check',
        focus: 'Concept Mastery',
        status: 'In Progress' as const,
        subject: 'English',
        description: 'Diagnostic readiness check for English.',
        primaryCta: 'Start Readiness Check' as const,
        hasGeneratePlan: true,
        unitTopic: 'Close Reading & Evidence Synthesis',
      },
    ];
  }, [actions]);

  const handleMoveLesson = (lessonId: string, direction: 'up' | 'down') => {
    playUiSound('click');
    onUpdatePathState((prev) => ({
      ...prev,
      lessons: reorderLessonInList(prev.lessons, lessonId, direction),
    }));
  };

  const handleAddTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateNewTopicInput(newTopicTitle, newTopicDomain);
    if (err) {
      setNewTopicError(err);
      return;
    }
    setNewTopicError(null);
    playUiSound('success');
    onUpdatePathState((prev) => ({
      ...prev,
      lessons: addLessonToPath(prev.lessons, {
        subject: activeSubject,
        trackMode,
        title: newTopicTitle,
        domain: newTopicDomain,
      }),
    }));
    onNotify(`Added "${newTopicTitle.trim()}" to ${activeSubject} (${trackMode})`);
    setNewTopicTitle('');
    setNewTopicDomain('');
    setShowAddTopic(false);
  };

  const handleArchiveCurrentPlan = () => {
    if (visibleLessons.length === 0) {
      onNotify(`No active lessons left to archive in ${activeSubject} (${trackMode}).`);
      return;
    }
    playUiSound('switch');
    onUpdatePathState((prev) => archiveSubjectPlan(prev, activeSubject, trackMode));
    onNotify(`Archived ${activeSubject} · ${trackMode} learning plan.`);
  };

  const handleUnarchivePlan = (archivedId: string, title: string, subject: string, mode: LearningTrackMode) => {
    playUiSound('success');
    onUpdatePathState((prev) => unarchivePlan(prev, archivedId));
    setActiveSubject(subject);
    setTrackMode(mode);
    onNotify(`Restored "${title}" back to your active learning path.`);
  };

  const handleContinueLesson = (lesson: LearningPathLesson) => {
    playUiSound('switch');
    onStartTopicSession({
      helpType: trackMode === 'Exam Prep' ? 'Prepare for a Test' : 'Learn a Lesson',
      subject: lesson.subject,
      lessonSource: 'learning-plan',
      topic: lesson.title,
      specificQuestion: `Continue my ${trackMode} lesson on ${lesson.title} (${lesson.domain}).`,
    });
  };

  const handleOpenAnalysis = (lesson: LearningPathLesson) => {
    playUiSound('click');
    setActiveReport(buildSessionAnalysisReport(lesson));
  };

  const renderSubjectIcon = (subj: string) => {
    if (subj === 'English') return <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />;
    if (subj === 'Mathematics') return <PenTool className="h-3.5 w-3.5" aria-hidden="true" />;
    return <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />;
  };

  const progressFillClass =
    summary.completionPercent >= 80
      ? 'bg-emerald-600'
      : summary.completionPercent >= 25
      ? 'bg-[#E69300]'
      : 'bg-red-600';

  return (
    <div
      data-testid="learning-session-view"
      className="space-y-5 pb-6 max-w-[1320px] mx-auto"
    >
      {/* Top Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Learning Path
          </h1>
          <p className="mt-1 text-xs sm:text-[13px] text-slate-500 dark:text-slate-400">
            Track your lessons, progress, and learning goals.
          </p>
        </div>

        {visibleLessons.length > 0 && (
          <button
            type="button"
            onClick={() => handleOpenAnalysis(visibleLessons[0])}
            data-testid="open-latest-session-analysis"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-[#15629E]/30 dark:border-sky-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-[#15629E] dark:text-sky-300 hover:bg-[#EBF4FC] dark:hover:bg-sky-950/50 transition-colors whitespace-nowrap shrink-0"
          >
            <FileBarChart2 className="h-3.5 w-3.5" aria-hidden="true" />
            Latest Session Analysis
          </button>
        )}
      </div>

      {/* Mode Switcher + List/Grid Toggle Bar */}
      <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-3 shadow-[0_4px_16px_rgba(21,98,158,0.04)] flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Learning path focus" className="flex flex-wrap items-center gap-2.5">
          {(['Concept Mastery', 'Exam Prep'] as LearningTrackMode[]).map((mode) => {
            const active = trackMode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  playUiSound('click');
                  setTrackMode(mode);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all border whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#FFF9EC] dark:bg-amber-950/35 border-[#F5B74C] dark:border-amber-600 text-slate-900 dark:text-amber-100'
                    : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                {mode === 'Concept Mastery' ? (
                  <BookOpen
                    className={`h-3.5 w-3.5 ${active ? 'text-[#E69300]' : 'text-slate-500'}`}
                    aria-hidden="true"
                  />
                ) : (
                  <PenTool
                    className={`h-3.5 w-3.5 ${active ? 'text-[#E69300]' : 'text-slate-500'}`}
                    aria-hidden="true"
                  />
                )}
                {mode}
              </button>
            );
          })}
        </div>

        {/* List / Grid View Switcher */}
        <div
          role="group"
          aria-label="Lesson layout view"
          className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5"
        >
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              setViewMode('list');
            }}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-[#E69300] text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <List className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              setViewMode('grid');
            }}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#E69300] text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Subject Selector Bar */}
      <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-3 shadow-[0_4px_16px_rgba(21,98,158,0.04)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white">
          <Zap className="h-4 w-4 text-[#E69300]" aria-hidden="true" />
          <span>Subject</span>
        </div>

        <div role="tablist" aria-label="Select subject" className="flex flex-wrap items-center gap-2">
          {LEARNING_PATH_SUBJECTS.map((subj) => {
            const active = activeSubject === subj;
            return (
              <button
                key={subj}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  playUiSound('click');
                  setActiveSubject(subj);
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#FFF9EC] dark:bg-amber-950/35 border-[#F5B74C] dark:border-amber-600 text-slate-900 dark:text-amber-100'
                    : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span className={active ? 'text-[#E69300]' : 'text-slate-500'}>
                  {renderSubjectIcon(subj)}
                </span>
                {subj}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Active Subject Path Card */}
      <section
        aria-labelledby="active-subject-path-heading"
        data-testid="active-subject-path-card"
        className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-[0_6px_24px_rgba(21,98,158,0.05)] space-y-4"
      >
        {/* Sky-Blue Outlined Subject Overview Banner */}
        <div className="rounded-2xl bg-[#F4F9FF] dark:bg-sky-950/30 border border-[#60A5FA]/80 dark:border-sky-700/70 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              {/* 2x3 Amber Dot Grid Emblem matching Reference */}
              <div
                aria-hidden="true"
                className="grid grid-cols-2 gap-1.5 px-2 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-sky-200/70 dark:border-sky-800/60"
              >
                {Array.from({ length: 6 }).map((_, idx) => (
                  <span
                    key={idx}
                    className="h-1.5 w-1.5 rounded-full bg-[#E69300]"
                  />
                ))}
              </div>
              <div>
                <h2
                  id="active-subject-path-heading"
                  className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                >
                  {activeSubject}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {summary.completedCount} completed · {summary.inProgressCount} in progress ·{' '}
                  {summary.totalCount} {summary.totalCount === 1 ? 'lesson' : 'lessons'}
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="font-display text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
                {summary.overallMastery}%
              </p>
              <div className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <span>Overall Mastery</span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenInfoTip((prev) => (prev === 'mastery' ? null : 'mastery'))
                  }
                  aria-label="About Overall Mastery"
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#15629E] dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50"
                >
                  <Info className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Completion Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                <span>Completion Progress</span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenInfoTip((prev) => (prev === 'progress' ? null : 'progress'))
                  }
                  aria-label="About Completion Progress"
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#15629E] dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50"
                >
                  <Info className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                {summary.completionPercent}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
              <div
                style={{ width: `${Math.max(4, summary.completionPercent)}%` }}
                className={`h-full rounded-full transition-all duration-300 ${progressFillClass}`}
              />
            </div>
          </div>

          {openInfoTip && (openInfoTip === 'mastery' || openInfoTip === 'progress') && (
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2">
              <span>
                {openInfoTip === 'mastery'
                  ? 'Overall Mastery averages your verified accuracy across all active lessons in this subject track.'
                  : 'Completion Progress tracks the share of lessons marked Completed in this track.'}
              </span>
              <button
                type="button"
                onClick={() => setOpenInfoTip(null)}
                aria-label="Dismiss tip"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Active Reorder Mode Banner */}
        {reorderMode && (
          <div className="rounded-xl bg-[#FFF9EC] dark:bg-amber-950/35 border border-[#F5B74C] dark:border-amber-700 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
            <span className="font-medium text-amber-900 dark:text-amber-200">
              Reorder mode active — use the ↑ and ↓ arrows on any lesson to adjust your sequence.
            </span>
            <button
              type="button"
              onClick={() => {
                playUiSound('click');
                setReorderMode(false);
              }}
              className="rounded-lg bg-[#E69300] px-3 py-1 font-semibold text-white hover:bg-[#CC8200] whitespace-nowrap shrink-0"
            >
              Done
            </button>
          </div>
        )}

        {/* Lesson List or 2-Column Grid */}
        {visibleLessons.length > 0 ? (
          <div
            data-testid="learning-path-lessons"
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                : 'divide-y divide-slate-100 dark:divide-slate-800'
            }
          >
            {visibleLessons.map((lesson, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === visibleLessons.length - 1;
              return (
                <article
                  key={lesson.id}
                  data-testid={`lesson-item-${lesson.id}`}
                  className={
                    viewMode === 'grid'
                      ? `rounded-2xl border p-4 sm:p-5 flex flex-col justify-between gap-4 transition-colors ${
                          reorderMode
                            ? 'border-[#F5B74C] bg-[#FFFDF8] dark:bg-amber-950/15'
                            : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950/40'
                        }`
                      : `py-4 first:pt-2 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          reorderMode ? 'bg-[#FFFDF8]/70 dark:bg-amber-950/10 px-2 rounded-xl' : ''
                        }`
                  }
                >
                  {/* Left: Lesson Icon + Details */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <span
                      className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[#15629E] dark:text-sky-400"
                      aria-hidden="true"
                    >
                      <ClipboardList className="h-4.5 w-4.5" />
                    </span>

                    <div className="min-w-0 flex-1 space-y-1">
                      {lesson.recommendedTone && (
                        <p
                          className={`text-[11px] font-semibold ${
                            lesson.recommendedTone === 'emerald'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-[#C87D00] dark:text-amber-400'
                          }`}
                        >
                          Recommended
                        </p>
                      )}

                      <h3 className="text-[13.5px] sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {lesson.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        <span
                          className={`font-semibold ${
                            lesson.status === 'Completed'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : lesson.status === 'In Progress'
                              ? 'text-[#C87D00] dark:text-amber-400'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {lesson.status}
                        </span>
                        <span className="mx-1.5" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-violet-700 dark:text-violet-300 font-medium">
                          {lesson.sourceLabel}
                        </span>
                      </p>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {lesson.domain}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        Mastery Level:{' '}
                        <strong className="font-semibold text-slate-700 dark:text-slate-200">
                          {lesson.masteryPercent}%
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* Right: Reorder Arrows + Primary CTA & Dual Analysis/Quiz Buttons */}
                  <div
                    className={`flex items-center gap-3 shrink-0 ${
                      viewMode === 'grid' ? 'justify-between pt-2 border-t border-slate-100 dark:border-slate-800' : ''
                    }`}
                  >
                    {/* Reorder Up/Down Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMoveLesson(lesson.id, 'down')}
                        aria-label={`Move ${lesson.title} down`}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                          isLast
                            ? 'border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            : reorderMode
                            ? 'border-[#F5B74C] bg-[#FFF9EC] text-[#C87D00] hover:bg-amber-100'
                            : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMoveLesson(lesson.id, 'up')}
                        aria-label={`Move ${lesson.title} up`}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                          isFirst
                            ? 'border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            : reorderMode
                            ? 'border-[#F5B74C] bg-[#FFF9EC] text-[#C87D00] hover:bg-amber-100'
                            : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Continue Learning + Quiz & Analysis Buttons */}
                    <div className="w-[152px] space-y-2">
                      <button
                        type="button"
                        onClick={() => handleContinueLesson(lesson)}
                        aria-label={`Continue Learning ${lesson.title}`}
                        className="bencho-press w-full rounded-xl bg-[#E69300] hover:bg-[#CC8200] px-4 py-2 text-xs font-semibold text-white transition-colors whitespace-nowrap"
                      >
                        {lesson.status === 'Not Started' ? 'Start Lesson' : 'Continue Learning'}
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            playUiSound('switch');
                            onLaunchSmartQuiz({
                              subject: lesson.subject,
                              topic: lesson.title,
                            });
                          }}
                          title="Practice Quiz"
                          aria-label={`Practice quiz for ${lesson.title}`}
                          className="bencho-press inline-flex items-center justify-center rounded-lg border border-[#38BDF8] dark:border-sky-600 bg-white dark:bg-slate-900 py-1.5 text-[#15629E] dark:text-sky-400 hover:bg-[#EBF4FC] dark:hover:bg-sky-950/50 transition-colors"
                        >
                          <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAnalysis(lesson)}
                          title="Session Analysis Report"
                          aria-label={`Open Session Analysis Report for ${lesson.title}`}
                          className="bencho-press inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 text-slate-600 dark:text-slate-300 hover:border-[#15629E] hover:text-[#15629E] dark:hover:text-sky-300 transition-colors"
                        >
                          <FileBarChart2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 px-5 py-6 text-center space-y-2.5">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              No active lessons in {activeSubject} ({trackMode}).
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Restore an archived plan below or add a new topic to start learning.
            </p>
            <button
              type="button"
              onClick={() => setShowAddTopic(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#E69300] hover:bg-[#CC8200] px-4 py-2 text-xs font-semibold text-white transition-colors"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add New Topic
            </button>
          </div>
        )}
      </section>

      {/* Section: Adjust or Evolve Your Plan */}
      <section
        aria-labelledby="adjust-plan-heading"
        data-testid="adjust-plan-card"
        className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-5 sm:px-6 py-5 shadow-[0_6px_24px_rgba(21,98,158,0.05)] space-y-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <h2
              id="adjust-plan-heading"
              className="font-display text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white"
            >
              Adjust or Evolve Your Plan
            </h2>
            <button
              type="button"
              onClick={() =>
                setOpenInfoTip((prev) => (prev === 'evolve' ? null : 'evolve'))
              }
              aria-label="About adjusting your learning plan"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#15629E] dark:text-sky-400 hover:bg-[#EBF4FC] dark:hover:bg-sky-950/50"
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Customize your learning journey
          </p>
        </div>

        {openInfoTip === 'evolve' && (
          <div className="rounded-xl bg-[#EBF4FC] dark:bg-sky-950/40 border border-[#C6E0F7] dark:border-sky-800/60 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300">
            Add custom study topics, reorder your lesson sequence, archive completed tracks, or adjust goals anytime without losing your progress.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => {
              playUiSound('switch');
              onOpenSetGoal();
            }}
            className="bencho-press rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950/50 p-4 flex flex-col items-center text-center gap-2 hover:border-[#F5B74C] hover:bg-[#FFFDF8] dark:hover:bg-slate-800/70 transition-all"
          >
            <ModifyGoalIcon />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Modify Goal</p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Create or update goal
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              setShowAddTopic((v) => !v);
              setNewTopicError(null);
            }}
            aria-expanded={showAddTopic}
            data-testid="tile-add-new-topic"
            className={`bencho-press rounded-2xl border p-4 flex flex-col items-center text-center gap-2 transition-all ${
              showAddTopic
                ? 'border-[#15629E] bg-[#EBF4FC]/60 dark:bg-sky-950/40'
                : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-[#F5B74C] hover:bg-[#FFFDF8] dark:hover:bg-slate-800/70'
            }`}
          >
            <AddTopicIcon />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Add new topic</p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Expand your plan
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleArchiveCurrentPlan}
            data-testid="tile-archive-plan"
            className="bencho-press rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950/50 p-4 flex flex-col items-center text-center gap-2 hover:border-[#F5B74C] hover:bg-[#FFFDF8] dark:hover:bg-slate-800/70 transition-all"
          >
            <ArchivePlanIcon />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Archive Learning Plan
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Hide this plan
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              setReorderMode((v) => !v);
            }}
            aria-pressed={reorderMode}
            data-testid="tile-reorder-lessons"
            className={`bencho-press rounded-2xl border p-4 flex flex-col items-center text-center gap-2 transition-all ${
              reorderMode
                ? 'border-[#F5B74C] bg-[#FFF9EC] dark:bg-amber-950/35'
                : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-[#F5B74C] hover:bg-[#FFFDF8] dark:hover:bg-slate-800/70'
            }`}
          >
            <ReorderLessonsIcon />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Re-order Lessons
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Arrows or move cards
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              playUiSound('switch');
              onOpenOnboardingWizard();
            }}
            className="bencho-press col-span-2 sm:col-span-1 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950/50 p-4 flex flex-col items-center text-center gap-2 hover:border-[#F5B74C] hover:bg-[#FFFDF8] dark:hover:bg-slate-800/70 transition-all"
          >
            <OnboardingWizardIcon />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Goal &amp; plan setup
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Onboarding wizard
              </p>
            </div>
          </button>
        </div>

        {/* Inline Add New Topic Form */}
        {showAddTopic && (
          <form
            onSubmit={handleAddTopicSubmit}
            data-testid="add-topic-form"
            className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Add a Custom Lesson to {activeSubject} ({trackMode})
              </p>
              <button
                type="button"
                onClick={() => setShowAddTopic(false)}
                aria-label="Close add topic form"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="new-topic-title"
                  className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1"
                >
                  Lesson Topic Title
                </label>
                <input
                  id="new-topic-title"
                  type="text"
                  value={newTopicTitle}
                  onChange={(e) => {
                    setNewTopicTitle(e.target.value);
                    if (newTopicError) setNewTopicError(null);
                  }}
                  placeholder="e.g., Quadratic Systems Review"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
                />
              </div>

              <div>
                <label
                  htmlFor="new-topic-domain"
                  className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1"
                >
                  Unit / Domain
                </label>
                <input
                  id="new-topic-domain"
                  type="text"
                  value={newTopicDomain}
                  onChange={(e) => {
                    setNewTopicDomain(e.target.value);
                    if (newTopicError) setNewTopicError(null);
                  }}
                  placeholder="e.g., Expressions & Equations"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
                />
              </div>
            </div>

            {newTopicError && (
              <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                {newTopicError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddTopic(false)}
                className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bencho-press inline-flex items-center gap-1.5 rounded-xl bg-[#15629E] hover:bg-[#104E7E] px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add to Path
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Section: Archived Learning Plans */}
      <section
        aria-labelledby="archived-plans-heading"
        data-testid="archived-plans-card"
        className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-5 sm:px-6 py-5 shadow-[0_6px_24px_rgba(21,98,158,0.05)] space-y-4"
      >
        <div>
          <h2
            id="archived-plans-heading"
            className="font-display text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white"
          >
            Archived Learning Plans
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Archived plans are hidden from active learning path — restore them here
          </p>
        </div>

        {pathState.archivedPlans.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pathState.archivedPlans.map((plan) => (
              <div
                key={plan.id}
                data-testid={`archived-plan-${plan.id}`}
                className="py-3 first:pt-1 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                    {plan.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {plan.subject} · {plan.lessons.length}{' '}
                    {plan.lessons.length === 1 ? 'lesson' : 'lessons'} · Archived{' '}
                    {plan.archivedDateLabel}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleUnarchivePlan(plan.id, plan.title, plan.subject, plan.trackMode)
                  }
                  aria-label={`Unarchive ${plan.title}`}
                  className="bencho-press self-start sm:self-center inline-flex items-center gap-1.5 rounded-xl border border-[#F5B74C] dark:border-amber-600/80 bg-white dark:bg-slate-900 px-5 py-2 text-xs font-semibold text-[#C87D00] dark:text-amber-400 hover:bg-[#FFF9EC] dark:hover:bg-amber-950/30 transition-colors whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  Unarchive
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
            No archived learning plans right now.
          </p>
        )}
      </section>

      {/* Section: Complete Your Readiness Check */}
      <section
        aria-labelledby="complete-readiness-heading"
        data-testid="complete-readiness-card"
        className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-5 sm:px-6 py-5 shadow-[0_6px_24px_rgba(21,98,158,0.05)] space-y-4"
      >
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2
            id="complete-readiness-heading"
            className="font-display text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white"
          >
            Complete Your Readiness Check
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Complete a readiness check to unlock your personalized learning path.
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {readinessChecks.map((action) => (
            <div
              key={action.id}
              data-testid={`readiness-row-${action.id}`}
              className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                  Readiness Check {action.subject}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {action.subject} · {action.focus}
                  {action.status === 'Plan Ready' ? ' · Plan Ready' : ''}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    playUiSound('switch');
                    onGeneratePlan(action);
                  }}
                  aria-label={`Generate ILP for ${action.subject}`}
                  className="bencho-press rounded-xl border border-[#F5B74C] dark:border-amber-600/80 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-[#C87D00] dark:text-amber-400 hover:bg-[#FFF9EC] dark:hover:bg-amber-950/30 transition-colors whitespace-nowrap shrink-0"
                >
                  Generate ILP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playUiSound('switch');
                    onTriggerReadinessAction(action);
                  }}
                  aria-label={`Start Readiness Check for ${action.subject}`}
                  className="bencho-press rounded-xl bg-[#E69300] hover:bg-[#CC8200] px-4 py-2 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0"
                >
                  Readiness Check
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Full Session Analysis Report Page/Overlay */}
      <SessionAnalysisView
        report={activeReport}
        onClose={() => setActiveReport(null)}
        onRetryPractice={(subject, topic) => onLaunchSmartQuiz({ subject, topic })}
        onAskTutor={(subject, topic) =>
          onStartTopicSession({
            helpType: 'Learn a Lesson',
            subject,
            lessonSource: 'learning-plan',
            topic,
            specificQuestion: `Review the missed and unanswered items from my Session Analysis Report on ${topic}.`,
          })
        }
      />
    </div>
  );
};
