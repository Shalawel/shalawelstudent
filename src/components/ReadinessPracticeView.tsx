import React, { useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  RotateCcw,
} from 'lucide-react';
import type {
  LearningAction,
  NavSectionId,
  SmartQuizInput,
  StartSessionInput,
} from '../types/dashboard';
import {
  ACTIVITY_TYPE_OPTIONS,
  PRACTICE_STATUS_OPTIONS,
  PRACTICE_SUBJECT_OPTIONS,
  buildSummaryForItem,
  computeWeeklyPracticeAverage,
  filterPastActivities,
  filterRevisitConcepts,
  filterSavedPractice,
  filterTeacherAssignments,
  type ActivityReviewDetail,
  type ActivityTypeFilter,
  type PracticeStatusFilter,
  type PracticeWorkspaceState,
  type TeacherAssignment,
} from '../utils/readinessPracticeLogic';
import { PracticeSummaryModal } from './PracticeSummaryModal';
import { playUiSound } from '../utils/uiSounds';

interface ReadinessPracticeViewProps {
  workspace: PracticeWorkspaceState;
  actions: LearningAction[];
  weakAreaCount: number;
  onOpenStartSession: () => void;
  onOpenSmartQuizDrawer: () => void;
  onOpenWeakAreas: () => void;
  onLaunchSmartQuiz: (input: SmartQuizInput) => void;
  onStartTopicSession: (input: StartSessionInput) => void;
  onTriggerReadinessAction: (action: LearningAction) => void;
  onNavigate: (section: NavSectionId) => void;
  onOpenMyNotes?: () => void;
}

const StartTutoringArt: React.FC = () => (
  <svg
    viewBox="0 0 64 64"
    className="h-14 w-14 shrink-0"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="rp-play-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FB923C" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
    </defs>
    <rect x="6" y="10" width="52" height="44" rx="14" fill="url(#rp-play-grad)" />
    <rect x="9" y="13" width="46" height="38" rx="11" fill="none" stroke="#FED7AA" strokeOpacity="0.45" strokeWidth="1.5" />
    <path d="M26 22.5L43 32L26 41.5V22.5Z" fill="#FFFFFF" />
  </svg>
);

const PracticeQuizArt: React.FC = () => (
  <svg
    viewBox="0 0 64 64"
    className="h-14 w-14 shrink-0"
    aria-hidden="true"
  >
    <rect x="13" y="11" width="38" height="45" rx="9" fill="#FFFFFF" stroke="#86EFAC" strokeWidth="2.5" />
    <rect x="23" y="7" width="18" height="8" rx="4" fill="#16A34A" />
    <rect x="20" y="21" width="10" height="8" rx="2.5" fill="#FDE047" />
    <circle cx="38" cy="25" r="4" fill="#38BDF8" />
    <path d="M20 36L24.5 29.5L29 36H20Z" fill="#4ADE80" />
    <rect x="34" y="31" width="10" height="5" rx="2" fill="#F472B6" />
    <rect x="20" y="42" width="24" height="3" rx="1.5" fill="#CBD5E1" />
    <rect x="20" y="48" width="16" height="3" rx="1.5" fill="#E2E8F0" />
  </svg>
);

const ReviewWeakAreasArt: React.FC = () => (
  <svg
    viewBox="0 0 64 64"
    className="h-14 w-14 shrink-0"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="rp-lens-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    <rect
      x="38"
      y="39"
      width="8"
      height="19"
      rx="4"
      transform="rotate(-42 38 39)"
      fill="#F472B6"
    />
    <circle cx="28" cy="27" r="16" fill="url(#rp-lens-grad)" />
    <circle cx="28" cy="27" r="11" fill="#E0F2FE" />
    <path d="M25 22H31M25 27H29M25 32H31" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const ReadinessPracticeView: React.FC<ReadinessPracticeViewProps> = ({
  workspace,
  actions,
  weakAreaCount,
  onOpenStartSession,
  onOpenSmartQuizDrawer,
  onOpenWeakAreas,
  onLaunchSmartQuiz,
  onStartTopicSession,
  onTriggerReadinessAction,
  onNavigate,
  onOpenMyNotes,
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Global top filters
  const [globalSubject, setGlobalSubject] = useState<string>('All Subjects');
  const [statusFilter, setStatusFilter] = useState<PracticeStatusFilter>('All Status');

  // Local Past Practice & Quiz Activity filters
  const [pastSubject, setPastSubject] = useState<string>('All Subjects');
  const [pastType, setPastType] = useState<ActivityTypeFilter>('All activity Types');

  // Section disclosures & contextual info popovers
  const [teacherSectionOpen, setTeacherSectionOpen] = useState<boolean>(true);
  const [revisitSectionOpen, setRevisitSectionOpen] = useState<boolean>(true);
  const [openInfoPopover, setOpenInfoPopover] = useState<'teacher' | 'revisit' | null>(null);

  // Summary modal state
  const [activeSummary, setActiveSummary] = useState<ActivityReviewDetail | null>(null);

  // Horizontal carousel ref for Concepts You Should Revisit
  const revisitTrackRef = useRef<HTMLDivElement | null>(null);

  // Derive teacher assignments: keep clean reference baseline (0 active by default + Readiness Check - English completed),
  // and reflect any newly completed readiness checks from live app actions.
  const teacherAssignments = useMemo<TeacherAssignment[]>(() => {
    const completedFromActions: TeacherAssignment[] = actions
      .filter((a) => a.status === 'Completed' || a.status === 'Plan Ready')
      .filter((a) => a.subject.toLowerCase() !== 'english')
      .map((a) => ({
        id: `assign-${a.id}`,
        title: `Readiness Check - ${a.subject}`,
        subject: a.subject,
        activityType: 'Readiness',
        status: 'completed',
        completedDateLabel: 'Today',
        accuracyPercent: a.score ?? 82,
        durationLabel: '5 min 30 sec',
      }));

    return [
      {
        id: 'assign-readiness-english',
        title: 'Readiness Check - English',
        subject: 'English',
        activityType: 'Readiness',
        status: 'completed',
        completedDateLabel: 'Jul 06',
        accuracyPercent: 86,
        durationLabel: '6 min 15 sec',
      },
      ...completedFromActions,
    ];
  }, [actions]);

  const filteredSavedPractice = useMemo(
    () => filterSavedPractice(workspace.savedPractice, globalSubject, statusFilter),
    [workspace.savedPractice, globalSubject, statusFilter]
  );

  const filteredAssignments = useMemo(
    () => filterTeacherAssignments(teacherAssignments, globalSubject, statusFilter),
    [teacherAssignments, globalSubject, statusFilter]
  );

  const filteredRevisit = useMemo(
    () => filterRevisitConcepts(workspace.revisitConcepts, globalSubject, statusFilter),
    [workspace.revisitConcepts, globalSubject, statusFilter]
  );

  const filteredPastActivities = useMemo(
    () =>
      filterPastActivities(
        workspace.pastActivities,
        globalSubject,
        pastSubject,
        pastType,
        statusFilter
      ),
    [workspace.pastActivities, globalSubject, pastSubject, pastType, statusFilter]
  );

  const weeklyStats = useMemo(
    () => computeWeeklyPracticeAverage(workspace.pastActivities),
    [workspace.pastActivities]
  );

  const hasActiveGlobalFilters =
    globalSubject !== 'All Subjects' || statusFilter !== 'All Status';

  const nextAvailableReadinessAction = useMemo(() => {
    const completedSubjects = new Set(
      teacherAssignments
        .filter((a) => a.status === 'completed')
        .map((a) => a.subject.toLowerCase())
    );
    return (
      actions.find(
        (a) =>
          a.status !== 'Completed' &&
          a.status !== 'Plan Ready' &&
          !completedSubjects.has(a.subject.toLowerCase()) &&
          (globalSubject === 'All Subjects' || a.subject === globalSubject)
      ) ?? null
    );
  }, [actions, teacherAssignments, globalSubject]);

  const handleResetFilters = () => {
    playUiSound('click');
    setGlobalSubject('All Subjects');
    setStatusFilter('All Status');
    setPastSubject('All Subjects');
    setPastType('All activity Types');
  };

  const handleAskTutorOnTopic = (subject: string, topic: string) => {
    playUiSound('switch');
    onStartTopicSession({
      helpType: 'Learn a Lesson',
      subject,
      lessonSource: 'another-topic',
      topic,
      specificQuestion: `Walk me through ${topic} step by step and help me fix common mistakes.`,
    });
  };

  const handleRetryTopic = (subject: string, topic: string) => {
    playUiSound('switch');
    onLaunchSmartQuiz({ subject, topic });
  };

  const scrollRevisitTrack = (direction: 'prev' | 'next') => {
    if (!revisitTrackRef.current) return;
    const offset = direction === 'next' ? 350 : -350;
    revisitTrackRef.current.scrollBy({
      left: offset,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <div
      data-testid="readiness-practice-view"
      className="space-y-5 pb-6 max-w-[1320px] mx-auto"
    >
      {/* Top Page Header + Global Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Readiness and Practice
          </h1>
          <p className="mt-1 text-xs sm:text-[13px] text-slate-500 dark:text-slate-400">
            Practice lessons, test your understanding, and improve weak areas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {hasActiveGlobalFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-[#15629E] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </button>
          )}

          {onOpenMyNotes && (
            <button
              type="button"
              onClick={() => {
                playUiSound('click');
                onOpenMyNotes();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#F5B74C] bg-[#FFF8EB] dark:bg-amber-950/40 px-3.5 py-2 text-xs font-semibold text-[#B86E00] dark:text-amber-300 hover:bg-[#FFF0D4] dark:hover:bg-amber-900/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              My Notes
            </button>
          )}

          <div className="relative">
            <label htmlFor="rp-global-subject" className="sr-only">
              Filter page by subject
            </label>
            <select
              id="rp-global-subject"
              value={globalSubject}
              onChange={(e) => {
                playUiSound('click');
                setGlobalSubject(e.target.value);
              }}
              className="appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3.5 pr-9 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:border-[#15629E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] cursor-pointer"
            >
              {PRACTICE_SUBJECT_OPTIONS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj === 'All Subjects' ? 'All Subject' : subj}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
              aria-hidden="true"
            />
          </div>

          <div className="relative">
            <label htmlFor="rp-global-status" className="sr-only">
              Filter page by status
            </label>
            <select
              id="rp-global-status"
              value={statusFilter}
              onChange={(e) => {
                playUiSound('click');
                setStatusFilter(e.target.value as PracticeStatusFilter);
              }}
              className="appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3.5 pr-9 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:border-[#15629E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] cursor-pointer"
            >
              {PRACTICE_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'All Status' ? 'Filter' : opt}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Section 1: Continue your practice */}
      <section
        aria-labelledby="continue-practice-heading"
        data-testid="continue-practice-card"
        className="rounded-[20px] bg-gradient-to-b from-[#FFFDF7] to-[#FFF9EC] dark:from-amber-950/25 dark:to-slate-900 border border-[#F5C065] dark:border-amber-700/70 p-5 sm:p-6 shadow-[0_6px_22px_rgba(245,158,11,0.06)] space-y-4"
      >
        <div>
          <h2
            id="continue-practice-heading"
            className="font-display text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white"
          >
            Continue your practice
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Pick up where you left off — your answers and question progress are saved.
          </p>
        </div>

        {filteredSavedPractice.length > 0 ? (
          <div className="space-y-3">
            {filteredSavedPractice.map((item) => (
              <div
                key={item.id}
                data-testid={`saved-practice-${item.id}`}
                className="rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
              >
                <div className="min-w-0">
                  <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white">
                    {item.subject}
                  </p>
                  <p className="mt-0.5 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 truncate">
                    {item.topic}
                  </p>
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                    Question {item.answeredCount} of {item.totalQuestions} · {item.lastSavedLabel}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRetryTopic(item.subject, item.topic)}
                  aria-label={`Go to Practice for ${item.topic}`}
                  className="bencho-press self-start sm:self-center inline-flex items-center justify-center rounded-xl bg-[#E69300] hover:bg-[#CC8200] px-5 py-2.5 text-xs font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E69300] focus-visible:ring-offset-2 whitespace-nowrap shrink-0"
                >
                  Go to Practice
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-amber-200/70 dark:border-slate-800 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {workspace.savedPractice.length === 0
                ? 'All caught up! Start a fresh Smart Quiz or Readiness Check below.'
                : `No saved practice sessions match ${globalSubject} (${statusFilter}).`}
            </p>
            <button
              type="button"
              onClick={() => {
                playUiSound('switch');
                if (hasActiveGlobalFilters) {
                  handleResetFilters();
                } else {
                  onOpenSmartQuizDrawer();
                }
              }}
              className="self-start sm:self-center rounded-xl bg-[#E69300] hover:bg-[#CC8200] px-4 py-2 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0"
            >
              {hasActiveGlobalFilters ? 'Show All Practice' : 'Start New Practice'}
            </button>
          </div>
        )}
      </section>

      {/* Section 2: 3 Feature Action Cards */}
      <section aria-label="Quick practice launchers">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Start Tutoring */}
          <motion.button
            type="button"
            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
            onClick={() => {
              playUiSound('switch');
              onOpenStartSession();
            }}
            data-testid="action-card-start-tutoring"
            className="group rounded-[20px] bg-[#FFF8EE] dark:bg-amber-950/25 border border-[#F8C87A] dark:border-amber-800/70 p-5 text-left flex items-center gap-4 hover:shadow-[0_10px_24px_rgba(234,88,12,0.10)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E69300]"
          >
            <StartTutoringArt />
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-[17px] font-bold text-slate-900 dark:text-white group-hover:text-[#B45309] dark:group-hover:text-amber-300 transition-colors">
                Start Tutoring
              </h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Learn a New Lesson with Your Tutor AI
              </p>
            </div>
          </motion.button>

          {/* Card 2: Practice & Quiz */}
          <motion.button
            type="button"
            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
            onClick={() => {
              playUiSound('switch');
              onOpenSmartQuizDrawer();
            }}
            data-testid="action-card-practice-quiz"
            className="group rounded-[20px] bg-[#ECFAF2] dark:bg-emerald-950/25 border border-[#8CE3B1] dark:border-emerald-800/70 p-5 text-left flex items-center gap-4 hover:shadow-[0_10px_24px_rgba(16,185,129,0.10)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <PracticeQuizArt />
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-[17px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                Practice &amp; Quiz
              </h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Practice what you learned or Test your Understanding.
              </p>
            </div>
          </motion.button>

          {/* Card 3: Review Weak Areas */}
          <motion.button
            type="button"
            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
            onClick={() => {
              playUiSound('switch');
              onOpenWeakAreas();
            }}
            data-testid="action-card-review-weak-areas"
            className="group rounded-[20px] bg-[#F5F1FF] dark:bg-violet-950/25 border border-[#CFC0FA] dark:border-violet-800/70 p-5 text-left flex items-center gap-4 hover:shadow-[0_10px_24px_rgba(124,58,237,0.10)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
          >
            <ReviewWeakAreasArt />
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-[17px] font-bold text-slate-900 dark:text-white group-hover:text-violet-800 dark:group-hover:text-violet-300 transition-colors">
                Review Weak Areas
              </h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Review lessons where you need more practice
                {weakAreaCount > 0 ? ` (${weakAreaCount} tracked).` : '.'}
              </p>
            </div>
          </motion.button>
        </div>
      </section>

      {/* Section 3: Assigned by your Teacher */}
      <section
        aria-labelledby="teacher-assigned-heading"
        data-testid="teacher-assigned-card"
        className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-5 sm:px-6 py-5 shadow-[0_6px_24px_rgba(21,98,158,0.05)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2
                id="teacher-assigned-heading"
                className="font-display text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white"
              >
                Assigned by your Teacher
              </h2>
              <button
                type="button"
                onClick={() =>
                  setOpenInfoPopover((prev) => (prev === 'teacher' ? null : 'teacher'))
                }
                aria-label="About teacher assignments"
                aria-expanded={openInfoPopover === 'teacher'}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#15629E] dark:text-sky-400 hover:bg-[#EBF4FC] dark:hover:bg-sky-950/60 transition-colors"
              >
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {filteredAssignments.active.length} active{' '}
              {filteredAssignments.active.length === 1 ? 'assignment' : 'assignments'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              setTeacherSectionOpen((v) => !v);
            }}
            aria-expanded={teacherSectionOpen}
            aria-label={
              teacherSectionOpen
                ? 'Collapse Assigned by your Teacher'
                : 'Expand Assigned by your Teacher'
            }
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                teacherSectionOpen ? 'rotate-0' : '-rotate-90'
              }`}
              aria-hidden="true"
            />
          </button>
        </div>

        {openInfoPopover === 'teacher' && (
          <div className="mt-3 rounded-xl bg-[#EBF4FC] dark:bg-sky-950/40 border border-[#C6E0F7] dark:border-sky-800/60 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300">
            Readiness checks and practice assignments from your classroom teacher appear here automatically. Completed checks remain available for full question review.
          </div>
        )}

        {teacherSectionOpen && (
          <div className="mt-4 space-y-5">
            {filteredAssignments.active.length === 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <p>No active assignments right now. Past due assignments are hidden.</p>
                {nextAvailableReadinessAction && (
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound('switch');
                      onTriggerReadinessAction(nextAvailableReadinessAction);
                    }}
                    className="font-semibold text-[#15629E] dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
                  >
                    Take {nextAvailableReadinessAction.subject} Readiness Check →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredAssignments.active.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200/80 dark:border-slate-800 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {item.subject} · {item.activityType}
                        {item.dueDateLabel ? ` · Due ${item.dueDateLabel}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRetryTopic(item.subject, item.title)}
                      className="self-start sm:self-center rounded-xl bg-[#E69300] hover:bg-[#CC8200] px-4 py-2 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0"
                    >
                      Start Assignment
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Assignment Sub-section */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white">
                  Completed Assignment
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  View your results, question review, and learning plan.
                </p>
              </div>

              {filteredAssignments.completed.length > 0 ? (
                <div className="space-y-2.5">
                  {filteredAssignments.completed.map((item) => (
                    <div
                      key={item.id}
                      data-testid={`completed-assignment-${item.id}`}
                      className="rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                          {item.subject} · {item.activityType}
                          {item.accuracyPercent !== undefined
                            ? ` · ${item.accuracyPercent}% score`
                            : ''}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          playUiSound('click');
                          setActiveSummary(
                            buildSummaryForItem({
                              id: item.id,
                              title: item.title,
                              subject: item.subject,
                              activityType: item.activityType,
                              dateLabel: item.completedDateLabel ?? 'Jul 06',
                              accuracyPercent: item.accuracyPercent ?? 86,
                              durationLabel: item.durationLabel ?? '6 min 15 sec',
                            })
                          );
                        }}
                        aria-label={`View Results for ${item.title}`}
                        className="bencho-press self-start sm:self-center rounded-xl border border-[#F5B74C] dark:border-amber-600/80 bg-white dark:bg-slate-900 px-5 py-2 text-xs font-semibold text-[#C87D00] dark:text-amber-400 hover:bg-[#FFF9EC] dark:hover:bg-amber-950/30 transition-colors whitespace-nowrap shrink-0"
                      >
                        View Results
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                  No completed assignments match the active filter.
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Section 4: Concepts You Should Revisit */}
      <section
        aria-labelledby="revisit-concepts-heading"
        data-testid="revisit-concepts-card"
        className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-5 sm:px-6 py-5 shadow-[0_6px_24px_rgba(21,98,158,0.05)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2
                id="revisit-concepts-heading"
                className="font-display text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white"
              >
                Concepts You Should Revisit
              </h2>
              <button
                type="button"
                onClick={() =>
                  setOpenInfoPopover((prev) => (prev === 'revisit' ? null : 'revisit'))
                }
                aria-label="About concepts to revisit"
                aria-expanded={openInfoPopover === 'revisit'}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#15629E] dark:text-sky-400 hover:bg-[#EBF4FC] dark:hover:bg-sky-950/60 transition-colors"
              >
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Topics below 80% mastery - quick review sessions available
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {revisitSectionOpen && filteredRevisit.length > 2 && (
              <div className="hidden sm:flex items-center gap-1 mr-1">
                <button
                  type="button"
                  onClick={() => scrollRevisitTrack('prev')}
                  aria-label="Scroll concepts left"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRevisitTrack('next')}
                  aria-label="Scroll concepts right"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                playUiSound('click');
                setRevisitSectionOpen((v) => !v);
              }}
              aria-expanded={revisitSectionOpen}
              aria-label={
                revisitSectionOpen
                  ? 'Collapse Concepts You Should Revisit'
                  : 'Expand Concepts You Should Revisit'
              }
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  revisitSectionOpen ? 'rotate-0' : '-rotate-90'
                }`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {openInfoPopover === 'revisit' && (
          <div className="mt-3 rounded-xl bg-[#EBF4FC] dark:bg-sky-950/40 border border-[#C6E0F7] dark:border-sky-800/60 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300">
            Any topic where your recent accuracy is under 80% appears here. Score 80% or higher on a retry to graduate the concept to Mastered.
          </div>
        )}

        {revisitSectionOpen && (
          <div className="mt-4">
            {filteredRevisit.length > 0 ? (
              <div
                ref={revisitTrackRef}
                className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth"
              >
                {filteredRevisit.map((concept) => (
                  <article
                    key={concept.id}
                    data-testid={`revisit-card-${concept.id}`}
                    className="snap-start shrink-0 w-[290px] sm:w-[348px] rounded-2xl bg-white dark:bg-slate-950/50 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)]"
                  >
                    <div className="space-y-3">
                      <div>
                        <h3 className="min-h-[38px] text-[13.5px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                          {concept.title}
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-[#15629E] dark:text-sky-400">
                            {concept.activityType}
                          </span>
                          <span className="mx-1.5" aria-hidden="true">
                            ·
                          </span>
                          <span>{concept.subject}</span>
                        </p>
                      </div>

                      {/* Accuracy meter */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Accuracy</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                            {concept.accuracyPercent}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            style={{ width: `${concept.accuracyPercent}%` }}
                            className="h-full rounded-full bg-[#E69300]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                        <span>Last attempt: {concept.lastAttemptLabel}</span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {concept.coachingNote}
                      </p>
                    </div>

                    {/* Action Button Stack */}
                    <div className="space-y-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          playUiSound('click');
                          setActiveSummary(
                            buildSummaryForItem({
                              id: concept.id,
                              title: concept.title,
                              subject: concept.subject,
                              activityType: concept.activityType,
                              dateLabel: concept.lastAttemptLabel,
                              accuracyPercent: concept.accuracyPercent,
                            })
                          );
                        }}
                        aria-label={`View Summary for ${concept.title}`}
                        className="bencho-press w-full rounded-xl bg-[#E69300] hover:bg-[#CC8200] px-4 py-2.5 text-xs font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E69300] whitespace-nowrap"
                      >
                        View Summary
                      </button>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleAskTutorOnTopic(concept.subject, concept.title)
                          }
                          aria-label={`Ask tutor about ${concept.title}`}
                          className="bencho-press rounded-xl border border-[#38BDF8] dark:border-sky-600/80 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-[#15629E] dark:text-sky-400 hover:bg-[#EBF4FC] dark:hover:bg-sky-950/40 transition-colors whitespace-nowrap"
                        >
                          Ask tutor
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRetryTopic(concept.subject, concept.title)}
                          aria-label={`Try again on ${concept.title}`}
                          className="bencho-press rounded-xl border border-[#F5B74C] dark:border-amber-600/80 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-[#C87D00] dark:text-amber-400 hover:bg-[#FFF9EC] dark:hover:bg-amber-950/30 transition-colors whitespace-nowrap"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-900/60 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-emerald-900 dark:text-emerald-200">
                  {hasActiveGlobalFilters
                    ? `No concepts under 80% mastery match ${globalSubject} (${statusFilter}).`
                    : 'Every tracked concept is at 80% mastery or higher. Great work!'}
                </p>
                {hasActiveGlobalFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="self-start sm:self-center text-xs font-semibold text-[#15629E] dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Section 5: Past Practice & Quiz Activity */}
      <section
        aria-labelledby="past-activity-heading"
        data-testid="past-activity-card"
        className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-5 sm:px-6 py-5 shadow-[0_6px_24px_rgba(21,98,158,0.05)] space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2
              id="past-activity-heading"
              className="font-display text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white"
            >
              Past Practice &amp; Quiz Activity
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Review and retry previous practice and quiz activities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <label htmlFor="rp-past-subject" className="sr-only">
                Filter past activities by subject
              </label>
              <select
                id="rp-past-subject"
                value={pastSubject}
                onChange={(e) => {
                  playUiSound('click');
                  setPastSubject(e.target.value);
                }}
                className="appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3.5 pr-9 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#15629E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] cursor-pointer"
              >
                {PRACTICE_SUBJECT_OPTIONS.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj === 'All Subjects' ? 'All Subject' : subj}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
                aria-hidden="true"
              />
            </div>

            <div className="relative">
              <label htmlFor="rp-past-type" className="sr-only">
                Filter past activities by type
              </label>
              <select
                id="rp-past-type"
                value={pastType}
                onChange={(e) => {
                  playUiSound('click');
                  setPastType(e.target.value as ActivityTypeFilter);
                }}
                className="appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3.5 pr-9 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#15629E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] cursor-pointer"
              >
                {ACTIVITY_TYPE_OPTIONS.map((typeOpt) => (
                  <option key={typeOpt} value={typeOpt}>
                    {typeOpt}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {filteredPastActivities.length > 0 ? (
          <div className="space-y-3">
            {filteredPastActivities.map((activity) => (
              <div
                key={activity.id}
                data-testid={`past-activity-${activity.id}`}
                className="rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 px-4 sm:px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug">
                    {activity.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activity.dateLabel}
                    <span className="mx-1.5" aria-hidden="true">
                      ·
                    </span>
                    {activity.subject}
                    <span className="mx-1.5" aria-hidden="true">
                      ·
                    </span>
                    {activity.activityType}
                  </p>
                  <p className="text-xs tabular-nums">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {activity.accuracyPercent}% accuracy
                    </span>
                    <span className="ml-3 text-slate-500 dark:text-slate-400">
                      {activity.durationLabel}
                    </span>
                  </p>
                  <p
                    className={`text-xs ${
                      activity.accuracyPercent >= 80
                        ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {activity.statusNote}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRetryTopic(activity.subject, activity.title)}
                    aria-label={`Try Again on ${activity.title}`}
                    className="bencho-press rounded-xl border border-[#F5B74C] dark:border-amber-600/80 bg-white dark:bg-slate-900 px-5 py-2 text-xs font-semibold text-[#C87D00] dark:text-amber-400 hover:bg-[#FFF9EC] dark:hover:bg-amber-950/30 transition-colors whitespace-nowrap shrink-0"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      setActiveSummary(
                        buildSummaryForItem({
                          id: activity.id,
                          title: activity.title,
                          subject: activity.subject,
                          activityType: activity.activityType,
                          dateLabel: activity.dateLabel,
                          accuracyPercent: activity.accuracyPercent,
                          durationLabel: activity.durationLabel,
                        })
                      );
                    }}
                    aria-label={`View Summary for ${activity.title} (${activity.dateLabel})`}
                    className="bencho-press rounded-xl bg-[#E69300] hover:bg-[#CC8200] px-5 py-2 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    View Summary
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 px-5 py-6 text-center space-y-2.5">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              No past practice or quiz activities match your selected filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#15629E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#104E7E] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Section 6: Bottom Consistency Badge Coaching Banner */}
      <aside
        data-testid="practice-consistency-banner"
        aria-label="Weekly accuracy badge reminder"
        className="rounded-2xl bg-[#EFE9FE] dark:bg-violet-950/40 border border-[#DDD1FC] dark:border-violet-800/60 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
      >
        <p className="text-xs sm:text-[13px] font-medium text-slate-800 dark:text-violet-100 tabular-nums">
          {weeklyStats.bannerMessage}
        </p>
        <button
          type="button"
          onClick={() => {
            playUiSound('switch');
            onNavigate('achievements');
          }}
          className="self-start sm:self-center inline-flex items-center gap-1 text-xs font-semibold text-[#5B21B6] dark:text-violet-300 hover:underline whitespace-nowrap shrink-0"
        >
          View Badges
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </aside>

      {/* Interactive Activity Summary & Question Review Modal */}
      <PracticeSummaryModal
        detail={activeSummary}
        onClose={() => setActiveSummary(null)}
        onTryAgain={handleRetryTopic}
        onAskTutor={handleAskTutorOnTopic}
        onOpenLearningPlan={() => onNavigate('learning-plan')}
      />
    </div>
  );
};
