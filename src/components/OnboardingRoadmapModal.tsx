import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Flag,
  Lock,
  RefreshCw,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import type { StudentProfile } from '../types/dashboard';
import {
  computeRoadmapProgress,
  getAvailableReadinessChecks,
  getMascotRoadmapMessage,
  gradeReadinessQuiz,
  type CompletedReadinessRecord,
  type GoalFocusArea,
  type MilestoneViewModel,
  type OnboardingGoalRecord,
  type OnboardingState,
  type ReadinessAssessmentSpec,
} from '../utils/onboardingRoadmapLogic';
import { playUiSound } from '../utils/uiSounds';
import readinessArt from '../assets/images/roadmap_milestone_readiness_1795284505585.jpg';
import assessmentsArt from '../assets/images/roadmap_milestone_assessments_1795284522455.jpg';
import goalsArt from '../assets/images/roadmap_milestone_goals_1795284506695.jpg';

const MASCOTS = {
  maya: {
    name: 'Maya',
    role: 'TutorCloud Guide',
    image: '/assets/aistudio/Enthusiastic_Tutor_with_Idea_Rays_3462c79e.png',
  },
  leo: {
    name: 'Leo',
    role: 'TutorCloud Mentor',
    image: '/assets/aistudio/Cartoon_Teacher_with_Book_and_Idea_Gesture_c36e5a65.png',
  },
} as const;

type MascotId = keyof typeof MASCOTS;
type ModalView = 'roadmap' | 'readiness-select' | 'readiness-quiz' | 'goals' | 'celebration';

const FOCUS_AREAS: { id: GoalFocusArea; tagline: string }[] = [
  { id: 'Concept Mastery', tagline: 'Build deep understanding step by step' },
  { id: 'Exam Preparation', tagline: 'Boost scores with targeted review' },
  { id: 'Homework Confidence', tagline: 'Solve daily assignments faster' },
  { id: 'Ahead of Grade', tagline: 'Unlock honors & challenge topics' },
];

const GOAL_PRESETS: Record<string, string[]> = {
  Mathematics: [
    'Master Linear Equations & Functions',
    'Score 90%+ on Algebra & Geometry Quizzes',
  ],
  Science: [
    'Master Water Cycle, Weather & Earth Systems',
    'Ace Upcoming Lab & Science Unit Assessments',
  ],
  English: [
    'Write Stronger Evidence-Based Analytical Essays',
    'Expand Reading Comprehension & Vocabulary',
  ],
  History: [
    'Analyze Primary Sources & Timelines Confidently',
    'Prepare for Term History Document Essay',
  ],
};

interface OnboardingRoadmapModalProps {
  open: boolean;
  profile: StudentProfile;
  onboardingState: OnboardingState;
  onDismiss: () => void;
  onSubmitReadinessQuiz: (record: CompletedReadinessRecord) => void;
  onSaveGoalsAndGeneratePlan: (goals: OnboardingGoalRecord[]) => void;
  onViewLearningPlan: () => void;
}

const MILESTONE_ART: Record<MilestoneViewModel['id'], { src: string; alt: string; badge: string }> =
  {
    m1: {
      src: readinessArt,
      alt: '3D discovery compass and crystal illustrating readiness check',
      badge: 'Readiness Discovery',
    },
    m2: {
      src: assessmentsArt,
      alt: '3D books and floating assessment cards illustrating subject checks',
      badge: 'Multi-Subject Insights',
    },
    m3: {
      src: goalsArt,
      alt: '3D golden trophy and bullseye target illustrating learning goals',
      badge: 'Goal Blueprint',
    },
  };

export const OnboardingRoadmapModal: React.FC<OnboardingRoadmapModalProps> = ({
  open,
  profile,
  onboardingState,
  onDismiss,
  onSubmitReadinessQuiz,
  onSaveGoalsAndGeneratePlan,
  onViewLearningPlan,
}) => {
  const availableChecks = useMemo(
    () => getAvailableReadinessChecks(profile.subjects, profile.grade),
    [profile.subjects, profile.grade]
  );

  const progress = useMemo(
    () => computeRoadmapProgress(onboardingState, availableChecks),
    [onboardingState, availableChecks]
  );

  const [mascotId, setMascotId] = useState<MascotId>('maya');
  const [view, setView] = useState<ModalView>(() =>
    progress.isComplete ? 'celebration' : 'roadmap'
  );
  const [activeAssessment, setActiveAssessment] = useState<ReadinessAssessmentSpec | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizError, setQuizError] = useState<string | null>(null);
  const [recentCelebrationNote, setRecentCelebrationNote] = useState<string | null>(null);

  // Goal-setting interactive form state
  const defaultSubject = profile.subjects[0] || 'Mathematics';
  const [goalFocus, setGoalFocus] = useState<GoalFocusArea>('Concept Mastery');
  const [goalSubject, setGoalSubject] = useState<string>(defaultSubject);
  const [dailyMinutes, setDailyMinutes] = useState<number>(profile.dailyTargetMinutes || 30);
  const [goalTitle, setGoalTitle] = useState<string>(
    GOAL_PRESETS[defaultSubject]?.[0] || `Master Grade ${profile.grade} ${defaultSubject}`
  );
  const [goalDueDate, setGoalDueDate] = useState<string>('2026-08-30');
  const [goalError, setGoalError] = useState<string | null>(null);

  if (!open) return null;

  const mascot = MASCOTS[mascotId];
  const loginDayNumber = Math.max(1, onboardingState.loginDays.length);
  const mascotMsg = getMascotRoadmapMessage(progress, profile.firstName, loginDayNumber);

  const handleOpenMilestone = (milestone: MilestoneViewModel) => {
    if (milestone.status === 'pending') return;
    playUiSound('pop');
    setRecentCelebrationNote(null);

    if (milestone.id === 'm1' || milestone.id === 'm2') {
      // If there's only 1 check total and it's not done yet, jump straight into selector so student sees subject details cleanly
      setView('readiness-select');
      return;
    }

    if (milestone.id === 'm3') {
      if (progress.isComplete) {
        setView('celebration');
      } else {
        setView('goals');
      }
    }
  };

  const handlePrimaryFooterAction = () => {
    playUiSound('pop');
    setRecentCelebrationNote(null);
    if (progress.nextAction === 'start-first-readiness') {
      setView('readiness-select');
    } else if (progress.nextAction === 'complete-remaining-readiness') {
      setView('readiness-select');
    } else if (progress.nextAction === 'set-goals') {
      setView('goals');
    } else {
      setView('celebration');
    }
  };

  const handleStartAssessment = (assessment: ReadinessAssessmentSpec) => {
    playUiSound('click');
    setActiveAssessment(assessment);
    setQuizAnswers({});
    setQuizError(null);
    setView('readiness-quiz');
  };

  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssessment) return;
    const unanswered = activeAssessment.questions.filter(
      (q) => typeof quizAnswers[q.id] !== 'number'
    );
    if (unanswered.length > 0) {
      setQuizError(
        `Please answer all ${activeAssessment.questions.length} questions before submitting.`
      );
      return;
    }

    const result = gradeReadinessQuiz(activeAssessment, quizAnswers);
    onSubmitReadinessQuiz(result);
    playUiSound('success');
    setActiveAssessment(null);
    setQuizAnswers({});
    setQuizError(null);
    setRecentCelebrationNote(
      `${result.subject} Readiness Check submitted — ${result.scorePercent}% (${result.correctCount}/${result.totalQuestions})! Milestone progress updated.`
    );
    setView('roadmap');
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedTitle = goalTitle.trim();
    if (cleanedTitle.length < 3) {
      setGoalError('Please enter a short learning goal (at least 3 characters).');
      return;
    }
    setGoalError(null);

    const formattedDate = goalDueDate
      ? new Date(`${goalDueDate}T00:00:00`).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '30 Aug, 2026';

    const newGoal: OnboardingGoalRecord = {
      id: `onb-goal-${Date.now()}`,
      title: cleanedTitle,
      subject: goalSubject,
      focusArea: goalFocus,
      dailyMinutes,
      dueDate: formattedDate,
    };

    onSaveGoalsAndGeneratePlan([newGoal]);
    playUiSound('success');
    setView('celebration');
  };

  const footerPrimaryLabel =
    progress.nextAction === 'start-first-readiness'
      ? 'Start Readiness Check'
      : progress.nextAction === 'complete-remaining-readiness'
      ? 'Continue Remaining Checks'
      : progress.nextAction === 'set-goals'
      ? 'Set My Goals'
      : 'View My Learning Plan';

  const visibleMilestones = progress.visibleMilestones;
  const completedCount = progress.completedSteps;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 sm:p-5 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-roadmap-heading"
      data-testid="onboarding-roadmap-modal"
    >
      <div className="animate-roadmap-pop font-roadmap-body relative w-full max-w-[960px] h-[94dvh] sm:h-auto sm:max-h-[88vh] flex flex-col rounded-[26px] bg-[#FAFBFD] shadow-[0_28px_80px_rgba(8,88,145,0.28)] border border-white/80 overflow-hidden">
        {/* Top Atmospheric Brand Header */}
        <header className="relative shrink-0 bg-gradient-to-r from-[#F4F9FF] via-white to-[#FFF8EC] border-b border-slate-200/80 px-4 sm:px-6 pt-3.5 sm:pt-4 pb-3">
          <div className="flex items-start justify-between gap-3 pr-9">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#085891]/10 px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide text-[#085891]">
                  <Compass className="h-3 w-3 text-[#F19500]" aria-hidden="true" />
                  <span>TUTORCLOUD LEARNING ROADMAP</span>
                </span>
                {loginDayNumber >= 2 && !progress.isComplete && (
                  <span className="inline-flex items-center rounded-full bg-[#F19500]/15 px-2.5 py-0.5 text-[10.5px] font-semibold text-[#B45309]">
                    Day {loginDayNumber} Reminder
                  </span>
                )}
              </div>

              <h1
                id="onboarding-roadmap-heading"
                className="font-roadmap-display text-[19px] sm:text-[23px] font-extrabold tracking-tight text-[#0B2545] leading-tight"
              >
                {view === 'celebration'
                  ? 'Setup Complete — Ready to Learn!'
                  : "Let's Build Your Learning Journey!"}
              </h1>
              {view !== 'celebration' && (
                <p className="mt-0.5 text-[12px] sm:text-[13px] text-slate-600 max-w-[680px] leading-snug">
                  Complete a few quick steps so we can create a learning plan that matches your
                  knowledge, needs, and goals.
                </p>
              )}
            </div>
          </div>

          {/* Visible Top-Right Close Icon */}
          <button
            type="button"
            onClick={() => {
              playUiSound('subtle');
              onDismiss();
            }}
            aria-label="Close onboarding roadmap"
            className="absolute right-3.5 top-3.5 sm:right-5 sm:top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#085891]"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Dynamic Progress Strip + Interactive Mascot Companion */}
          <div className="mt-2.5 grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-center">
            {/* Progress Meter */}
            <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200/80 px-3.5 py-2 shadow-[0_2px_10px_rgba(8,88,145,0.04)]">
              <div className="flex items-center justify-between gap-2 text-[11.5px]">
                <span
                  data-testid="onboarding-progress-label"
                  className="font-semibold text-[#0B2545]"
                >
                  Your Setup Progress: {progress.completedSteps} of {progress.totalSteps} steps
                  completed
                </span>
                <span className="font-bold text-[#085891] tabular-nums">
                  {progress.percentComplete}%
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#085891] via-[#0D9488] to-[#F19500] transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(progress.percentComplete, 6)}%` }}
                />
              </div>
            </div>

            {/* Interactive Mascot Companion */}
            <div className="lg:col-span-6 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#085891]/[0.05] to-[#F19500]/[0.09] border border-[#F19500]/25 px-3 py-1.5">
              <div className="relative h-11 w-11 shrink-0 rounded-2xl bg-white border border-amber-200/80 overflow-hidden shadow-xs flex items-end justify-center">
                <img
                  src={mascot.image}
                  alt={`${mascot.name}, your TutorCloud companion`}
                  className="h-11 w-11 object-contain object-bottom"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-[#085891] leading-tight">
                    <span className="sm:hidden">{mascot.name} · Guide</span>
                    <span className="hidden sm:inline">
                      {mascot.name} · {mascotMsg.headline}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound('switch');
                      setMascotId((curr) => (curr === 'maya' ? 'leo' : 'maya'));
                    }}
                    aria-label={`Switch companion to ${mascotId === 'maya' ? 'Leo' : 'Maya'}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/90 hover:bg-white border border-slate-200 px-2 py-0.5 text-[10.5px] font-semibold text-slate-600 hover:text-[#085891] shrink-0 transition-colors"
                  >
                    <RefreshCw className="h-2.5 w-2.5" aria-hidden="true" />
                    <span>{mascotId === 'maya' ? 'Leo' : 'Maya'}</span>
                  </button>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-600 leading-snug line-clamp-2">
                  {recentCelebrationNote || mascotMsg.body}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Canvas */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 py-3.5">
          {/* VIEW 1: INTERACTIVE ILLUSTRATED WINDING ROADMAP */}
          {view === 'roadmap' && (
            <div data-testid="roadmap-journey-view" className="relative">
              {/* Desktop / Tablet Winding Pathway Layout */}
              <div className="hidden md:block relative max-w-[840px] mx-auto py-2">
                {/* Center Illustrated Winding S-Curve SVG */}
                <svg
                  aria-hidden="true"
                  viewBox={visibleMilestones.length === 3 ? '0 0 220 580' : '0 0 220 380'}
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-6 bottom-6 w-[180px] h-[calc(100%-48px)]"
                >
                  <defs>
                    <linearGradient id="tcRoadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#085891" />
                      <stop offset="50%" stopColor="#0D9488" />
                      <stop offset="100%" stopColor="#F19500" />
                    </linearGradient>
                  </defs>
                  {visibleMilestones.length === 3 ? (
                    <>
                      {/* Soft outer road glow/bed */}
                      <path
                        d="M 110 24 C 175 95, 175 185, 110 275 C 45 365, 45 455, 110 552"
                        fill="none"
                        stroke="#E2ECF7"
                        strokeWidth="28"
                        strokeLinecap="round"
                      />
                      {/* Colored brand path */}
                      <path
                        d="M 110 24 C 175 95, 175 185, 110 275 C 45 365, 45 455, 110 552"
                        fill="none"
                        stroke="url(#tcRoadGrad)"
                        strokeWidth="16"
                        strokeLinecap="round"
                        opacity={completedCount === 0 ? 0.35 : 0.92}
                      />
                      {/* Crisp dashed adventure centerline */}
                      <path
                        d="M 110 24 C 175 95, 175 185, 110 275 C 45 365, 45 455, 110 552"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        strokeDasharray="7 8"
                        strokeLinecap="round"
                      />
                    </>
                  ) : (
                    <>
                      <path
                        d="M 110 26 C 175 120, 45 250, 110 352"
                        fill="none"
                        stroke="#E2ECF7"
                        strokeWidth="28"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 110 26 C 175 120, 45 250, 110 352"
                        fill="none"
                        stroke="url(#tcRoadGrad)"
                        strokeWidth="16"
                        strokeLinecap="round"
                        opacity={completedCount === 0 ? 0.35 : 0.92}
                      />
                      <path
                        d="M 110 26 C 175 120, 45 250, 110 352"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        strokeDasharray="7 8"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </svg>

                {/* Alternating Left/Right Milestone Rows */}
                <div className="relative z-10 space-y-3.5">
                  {visibleMilestones.map((milestone, idx) => {
                    const cardOnLeft = idx % 2 === 0;
                    const art = MILESTONE_ART[milestone.id];
                    const isCompleted = milestone.status === 'completed';
                    const isActive = milestone.status === 'active';
                    const isPending = milestone.status === 'pending';

                    const cardNode = (
                      <article
                        data-testid={`roadmap-milestone-${milestone.id}`}
                        data-status={milestone.status}
                        className={`relative rounded-2xl p-3.5 sm:px-4 sm:py-3.5 transition-all ${
                          isActive
                            ? 'bg-white border-2 border-[#F19500]/75 shadow-[0_12px_28px_rgba(241,149,0,0.14)]'
                            : isCompleted
                            ? 'bg-emerald-50/45 border border-emerald-300 shadow-[0_6px_18px_rgba(16,185,129,0.08)]'
                            : 'bg-white/90 border border-slate-200/90 shadow-[0_4px_12px_rgba(15,23,42,0.04)] opacity-85'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isActive
                                ? 'bg-[#F19500]/15 text-[#B45309]'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <Check className="h-3 w-3" aria-hidden="true" />
                                <span>Completed</span>
                              </>
                            ) : isActive ? (
                              <>
                                <Sparkles className="h-3 w-3" aria-hidden="true" />
                                <span>Current Step</span>
                              </>
                            ) : (
                              <>
                                <Lock className="h-3 w-3" aria-hidden="true" />
                                <span>Up Next</span>
                              </>
                            )}
                          </span>
                          <span className="text-[10.5px] font-medium text-slate-500">
                            {milestone.metaText}
                          </span>
                        </div>

                        <h2 className="font-roadmap-display text-[15px] font-bold text-[#0B2545] leading-snug">
                          {milestone.title}
                        </h2>
                        <p className="mt-1 text-[12px] text-slate-600 leading-snug">
                          {milestone.description}
                        </p>

                        <div className="mt-2.5">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleOpenMilestone(milestone)}
                            className={`bencho-press inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#085891] ${
                              isActive
                                ? 'bg-[#F19500] hover:bg-[#DC8700] text-slate-950 shadow-[0_5px_14px_rgba(241,149,0,0.3)]'
                                : isCompleted
                                ? 'bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <span>{milestone.ctaLabel}</span>
                            {!isPending && <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
                          </button>
                        </div>
                      </article>
                    );

                    const illustrationNode = (
                      <div className="flex items-center justify-center">
                        <div className="relative w-[162px] rounded-2xl bg-white border border-slate-200/80 px-3 py-2.5 shadow-[0_8px_24px_rgba(8,88,145,0.07)] flex flex-col items-center text-center">
                          <img
                            src={art.src}
                            alt={art.alt}
                            className="h-[82px] w-[124px] object-contain mix-blend-multiply [mask-image:radial-gradient(closest-side,#000_74%,transparent_100%)]"
                          />
                          <span className="mt-1 text-[10.5px] font-semibold tracking-wide text-[#085891]">
                            {art.badge}
                          </span>
                        </div>
                      </div>
                    );

                    return (
                      <div
                        key={milestone.id}
                        className="grid grid-cols-[1fr_116px_1fr] items-center gap-2"
                      >
                        {/* Left Column */}
                        <div className="relative">
                          {cardOnLeft ? cardNode : illustrationNode}
                        </div>

                        {/* Center Milestone Circle + Dotted Connectors */}
                        <div className="relative flex items-center justify-center">
                          {/* Dotted horizontal connector line */}
                          <div
                            aria-hidden="true"
                            className={`absolute top-1/2 -translate-y-1/2 w-[54px] border-t-2 border-dotted ${
                              cardOnLeft ? 'left-0' : 'right-0'
                            } ${
                              isCompleted
                                ? 'border-emerald-400'
                                : isActive
                                ? 'border-[#F19500]'
                                : 'border-slate-300'
                            }`}
                          />

                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleOpenMilestone(milestone)}
                            aria-label={`Milestone ${milestone.numberLabel}: ${milestone.title} (${milestone.status})`}
                            className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white font-roadmap-display text-[17px] font-extrabold transition-transform ${
                              isCompleted
                                ? 'bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:scale-105'
                                : isActive
                                ? 'bg-[#F19500] text-slate-950 ring-[6px] ring-[#F19500]/25 shadow-[0_8px_22px_rgba(241,149,0,0.4)] hover:scale-105'
                                : 'bg-[#085891]/15 text-[#085891] cursor-not-allowed'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="h-6 w-6 stroke-[3]" aria-hidden="true" />
                            ) : (
                              milestone.numberLabel
                            )}
                          </button>
                        </div>

                        {/* Right Column */}
                        <div className="relative">
                          {cardOnLeft ? illustrationNode : cardNode}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Vertical Pathway Layout (< 768px) */}
              <div className="md:hidden relative pl-12 space-y-4">
                {/* Vertical gradient rail */}
                <div
                  aria-hidden="true"
                  className="absolute left-[19px] top-5 bottom-5 w-1.5 rounded-full bg-gradient-to-b from-[#085891] via-[#0D9488] to-[#F19500]/75"
                />

                {visibleMilestones.map((milestone) => {
                  const art = MILESTONE_ART[milestone.id];
                  const isCompleted = milestone.status === 'completed';
                  const isActive = milestone.status === 'active';
                  const isPending = milestone.status === 'pending';

                  return (
                    <div key={milestone.id} className="relative">
                      {/* Left Rail Node */}
                      <div
                        aria-hidden="true"
                        className={`absolute -left-12 top-4 flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#FAFBFD] font-roadmap-display text-[13px] font-extrabold ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isActive
                            ? 'bg-[#F19500] text-slate-950 ring-4 ring-[#F19500]/25'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4 stroke-[3]" />
                        ) : (
                          milestone.numberLabel
                        )}
                      </div>

                      <article
                        className={`rounded-2xl p-4 ${
                          isActive
                            ? 'bg-white border-2 border-[#F19500]/75 shadow-[0_10px_24px_rgba(241,149,0,0.14)]'
                            : isCompleted
                            ? 'bg-emerald-50/50 border border-emerald-300'
                            : 'bg-white border border-slate-200 opacity-85'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={art.src}
                            alt={art.alt}
                            className="h-14 w-16 shrink-0 rounded-xl bg-white object-contain mix-blend-multiply [mask-image:radial-gradient(closest-side,#000_74%,transparent_100%)]"
                          />
                          <div className="min-w-0 flex-1">
                            <span
                              className={`inline-block text-[10.5px] font-bold uppercase tracking-wide ${
                                isCompleted
                                  ? 'text-emerald-700'
                                  : isActive
                                  ? 'text-[#B45309]'
                                  : 'text-slate-400'
                              }`}
                            >
                              {milestone.metaText}
                            </span>
                            <h2 className="font-roadmap-display text-[15px] font-bold text-[#0B2545] leading-snug">
                              {milestone.title}
                            </h2>
                          </div>
                        </div>

                        <p className="mt-2 text-[12.5px] text-slate-600 leading-relaxed">
                          {milestone.description}
                        </p>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleOpenMilestone(milestone)}
                          className={`mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-colors ${
                            isActive
                              ? 'bg-[#F19500] hover:bg-[#DC8700] text-slate-950'
                              : isCompleted
                              ? 'bg-white border border-emerald-300 text-emerald-800'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <span>{milestone.ctaLabel}</span>
                          {!isPending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                        </button>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: READINESS CHECK SELECTOR */}
          {view === 'readiness-select' && (
            <div data-testid="readiness-select-view" className="max-w-[760px] mx-auto space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setView('roadmap')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Back to Roadmap</span>
                </button>
                <span className="text-xs font-semibold text-[#085891]">
                  {progress.completedAssessmentCount} of {progress.totalAssessmentCount} subject
                  checks submitted
                </span>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
                <h2 className="font-roadmap-display text-[18px] font-bold text-[#0B2545]">
                  Choose a Readiness Check for Grade {profile.grade} ({profile.curriculum})
                </h2>
                <p className="mt-1 text-[13px] text-slate-600">
                  Each check takes ~3–4 minutes. Submit at least one quiz to complete Milestone 01
                  {progress.hasSecondMilestone
                    ? ', then finish remaining subjects to unlock Goal Setting.'
                    : ' and unlock Goal Setting.'}
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {availableChecks.map((check) => {
                    const record = onboardingState.completedAssessments[check.id];
                    const isDone = Boolean(record);
                    return (
                      <div
                        key={check.id}
                        data-testid={`readiness-card-${check.id}`}
                        className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                          isDone
                            ? 'border-emerald-300 bg-emerald-50/45'
                            : 'border-slate-200 bg-[#FAFBFD] hover:border-[#085891]/40 hover:bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#085891]">
                              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{check.gradeTag}</span>
                            </span>
                            {isDone ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                <span>Scored {record.scorePercent}%</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                <Clock className="h-3 w-3" aria-hidden="true" />
                                <span>~{check.estimatedMinutes} min</span>
                              </span>
                            )}
                          </div>

                          <h3 className="mt-2 font-roadmap-display text-[15.5px] font-bold text-slate-900">
                            {check.title}
                          </h3>
                          <p className="mt-1 text-[12px] text-slate-600 leading-snug">
                            {check.subtitle}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleStartAssessment(check)}
                          className={`bencho-press w-full rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
                            isDone
                              ? 'bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                              : 'bg-[#085891] hover:bg-[#064572] text-white'
                          }`}
                        >
                          {isDone ? 'Retake Check' : `Start ${check.subject} Check`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: INTERACTIVE READINESS QUIZ RUNNER */}
          {view === 'readiness-quiz' && activeAssessment && (
            <form
              onSubmit={handleSubmitQuiz}
              data-testid="readiness-quiz-form"
              className="max-w-[720px] mx-auto space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Explicitly exiting without submitting preserves prior progress and never marks complete
                    setActiveAssessment(null);
                    setQuizAnswers({});
                    setQuizError(null);
                    setView('readiness-select');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Exit Without Submitting</span>
                </button>
                <span className="text-xs font-bold text-[#085891]">
                  {activeAssessment.title} · {Object.keys(quizAnswers).length}/
                  {activeAssessment.questions.length} answered
                </span>
              </div>

              <div className="space-y-4">
                {activeAssessment.questions.map((question, qIdx) => (
                  <fieldset
                    key={question.id}
                    className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs"
                  >
                    <legend className="text-[11px] font-bold uppercase tracking-wider text-[#085891] px-1">
                      Question {qIdx + 1} · {question.concept}
                    </legend>
                    <p className="mt-1.5 font-roadmap-display text-[15px] font-semibold text-slate-900">
                      {question.prompt}
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {question.options.map((opt, optIdx) => {
                        const selected = quizAnswers[question.id] === optIdx;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              playUiSound('click');
                              setQuizAnswers((prev) => ({ ...prev, [question.id]: optIdx }));
                              setQuizError(null);
                            }}
                            aria-pressed={selected}
                            className={`w-full rounded-xl border px-3.5 py-2.5 text-left text-[13px] font-medium flex items-center gap-3 transition-all ${
                              selected
                                ? 'border-[#085891] bg-[#085891]/[0.07] text-[#0B2545] font-semibold'
                                : 'border-slate-200 bg-[#FAFBFD] text-slate-700 hover:border-slate-300 hover:bg-white'
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                                selected
                                  ? 'border-[#085891] bg-[#085891] text-white'
                                  : 'border-slate-300 bg-white text-slate-500'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>

              {quizError && (
                <p
                  role="alert"
                  className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs font-semibold text-rose-700"
                >
                  {quizError}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAssessment(null);
                    setView('readiness-select');
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bencho-press inline-flex items-center justify-center gap-2 rounded-xl bg-[#F19500] hover:bg-[#DC8700] px-6 py-2.5 text-[13px] font-bold text-slate-950 shadow-[0_6px_16px_rgba(241,149,0,0.28)]"
                >
                  <span>Submit Readiness Check</span>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </form>
          )}

          {/* VIEW 4: INTERACTIVE GOAL SETTING */}
          {view === 'goals' && (
            <form
              onSubmit={handleSaveGoals}
              data-testid="onboarding-goals-form"
              className="max-w-[740px] mx-auto space-y-5"
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setView('roadmap')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Back to Roadmap</span>
                </button>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#085891]">
                  <Target className="h-3.5 w-3.5 text-[#F19500]" aria-hidden="true" />
                  <span>Final Step · Personalize Your Plan</span>
                </span>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-5">
                <div>
                  <h2 className="font-roadmap-display text-[18px] font-bold text-[#0B2545]">
                    Set Your Learning Goals
                  </h2>
                  <p className="mt-1 text-[13px] text-slate-600">
                    Tell us what you want to achieve. Your goals will help shape your personalized
                    learning journey.
                  </p>
                </div>

                {/* Focus Area Cards */}
                <div>
                  <span className="block text-xs font-bold text-slate-700 mb-2">
                    1. Choose your main learning focus
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FOCUS_AREAS.map((area) => {
                      const active = goalFocus === area.id;
                      return (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => {
                            playUiSound('click');
                            setGoalFocus(area.id);
                          }}
                          className={`rounded-xl border p-3 text-left transition-all ${
                            active
                              ? 'border-[#085891] bg-[#085891]/[0.06] shadow-xs'
                              : 'border-slate-200 bg-[#FAFBFD] hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[13px] font-bold text-[#0B2545]">{area.id}</span>
                            {active && (
                              <CheckCircle2 className="h-4 w-4 text-[#085891]" aria-hidden="true" />
                            )}
                          </div>
                          <p className="mt-0.5 text-[11.5px] text-slate-500">{area.tagline}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subject & Daily Pace */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="onboarding-goal-subject"
                      className="block text-xs font-bold text-slate-700 mb-1.5"
                    >
                      2. Priority subject
                    </label>
                    <select
                      id="onboarding-goal-subject"
                      value={goalSubject}
                      onChange={(e) => {
                        const subj = e.target.value;
                        setGoalSubject(subj);
                        const preset = GOAL_PRESETS[subj]?.[0];
                        if (preset) setGoalTitle(preset);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] px-3.5 py-2.5 text-[13px] font-medium text-slate-900 focus:border-[#085891] focus:bg-white focus:outline-none"
                    >
                      {(profile.subjects.length > 0
                        ? profile.subjects
                        : ['Mathematics', 'Science', 'English']
                      ).map((subj) => (
                        <option key={subj} value={subj}>
                          {subj}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs font-bold text-slate-700 mb-1.5">
                      3. Daily study pace
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 30, 45].map((mins) => {
                        const selected = dailyMinutes === mins;
                        return (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => {
                              playUiSound('click');
                              setDailyMinutes(mins);
                            }}
                            className={`rounded-xl border py-2.5 text-xs font-bold tabular-nums transition-colors ${
                              selected
                                ? 'border-[#F19500] bg-[#F19500]/15 text-[#9A3412]'
                                : 'border-slate-200 bg-[#FAFBFD] text-slate-700 hover:bg-white'
                            }`}
                          >
                            {mins} min
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Goal Title & Target Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="onboarding-goal-title"
                      className="block text-xs font-bold text-slate-700 mb-1.5"
                    >
                      4. Your goal milestone
                    </label>
                    <input
                      id="onboarding-goal-title"
                      type="text"
                      value={goalTitle}
                      onChange={(e) => {
                        setGoalTitle(e.target.value);
                        setGoalError(null);
                      }}
                      placeholder="e.g. Master Linear Equations & Graphs"
                      className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] px-3.5 py-2.5 text-[13px] text-slate-900 focus:border-[#085891] focus:bg-white focus:outline-none"
                    />
                    {GOAL_PRESETS[goalSubject] && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {GOAL_PRESETS[goalSubject].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setGoalTitle(preset);
                              setGoalError(null);
                            }}
                            className="rounded-lg bg-slate-100 hover:bg-[#085891]/10 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:text-[#085891] transition-colors"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="onboarding-goal-date"
                      className="block text-xs font-bold text-slate-700 mb-1.5"
                    >
                      Target date
                    </label>
                    <div className="relative">
                      <Calendar
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                        aria-hidden="true"
                      />
                      <input
                        id="onboarding-goal-date"
                        type="date"
                        value={goalDueDate}
                        onChange={(e) => setGoalDueDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] pl-9 pr-3 py-2.5 text-[13px] text-slate-900 focus:border-[#085891] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {goalError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs font-semibold text-rose-700"
                  >
                    {goalError}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setView('roadmap')}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="bencho-press inline-flex items-center justify-center gap-2 rounded-xl bg-[#F19500] hover:bg-[#DC8700] px-6 py-2.5 text-[13px] font-bold text-slate-950 shadow-[0_6px_18px_rgba(241,149,0,0.3)]"
                  >
                    <Flag className="h-4 w-4" aria-hidden="true" />
                    <span>Save Goals &amp; Generate Plan</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* VIEW 5: CELEBRATION & LEARNING PLAN READY */}
          {view === 'celebration' && (
            <div
              data-testid="onboarding-celebration-view"
              className="max-w-[740px] mx-auto text-center space-y-5 py-2"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#085891] via-[#0B67A8] to-[#084472] p-6 sm:p-8 text-white shadow-[0_18px_44px_rgba(8,88,145,0.28)]">
                {/* Decorative brand accents */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#F19500]/25"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-white/10"
                />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-white/95 border-2 border-[#F19500] overflow-hidden shadow-lg flex items-end justify-center p-1">
                      <img
                        src={mascot.image}
                        alt={`${mascot.name} celebrating your completed setup`}
                        className="h-full w-full object-contain object-bottom"
                      />
                    </div>
                  </div>

                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#F19500] px-3.5 py-1 text-[11.5px] font-extrabold text-slate-950">
                    <Award className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>SETUP COMPLETE · {progress.totalSteps} OF {progress.totalSteps} MILESTONES</span>
                  </span>

                  <h2 className="mt-3 font-roadmap-display text-[24px] sm:text-[30px] font-extrabold tracking-tight text-white">
                    Your Learning Plan Is Ready!
                  </h2>
                  <p className="mt-2 max-w-[520px] text-[13.5px] sm:text-[14.5px] text-blue-100 leading-relaxed">
                    We&apos;ve created a learning journey based on your readiness and goals.
                    Let&apos;s get started!
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        playUiSound('success');
                        onViewLearningPlan();
                      }}
                      className="bencho-press w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#F19500] hover:bg-[#DC8700] px-7 py-3.5 text-[14px] font-extrabold text-slate-950 shadow-[0_10px_26px_rgba(241,149,0,0.38)]"
                    >
                      <span>View My Learning Plan</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Personalized Summary Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
                <div className="rounded-2xl bg-white border border-slate-200/90 p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#085891]">
                    Readiness Highlights
                  </span>
                  <div className="mt-2 space-y-1.5">
                    {Object.values(onboardingState.completedAssessments).map((rec) => (
                      <div
                        key={rec.assessmentId}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-slate-800">{rec.subject}</span>
                        <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-bold text-emerald-700 tabular-nums">
                          {rec.scorePercent}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200/90 p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B45309]">
                    Active Learning Goal
                  </span>
                  {onboardingState.savedGoals.slice(0, 2).map((goal) => (
                    <div key={goal.id} className="mt-2">
                      <p className="text-[13px] font-bold text-slate-900">{goal.title}</p>
                      <p className="mt-0.5 text-[11.5px] text-slate-500">
                        {goal.subject} · {goal.focusArea} · {goal.dailyMinutes} min/day · Target{' '}
                        {goal.dueDate}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Non-Blocking Footer Bar (Roadmap View) */}
        {view === 'roadmap' && (
          <footer className="shrink-0 bg-white border-t border-slate-200/80 px-4 sm:px-6 py-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                playUiSound('subtle');
                onDismiss();
              }}
              className="rounded-xl px-4 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-center"
            >
              I&apos;ll do this later · Explore Dashboard
            </button>

            <button
              type="button"
              onClick={handlePrimaryFooterAction}
              className="hidden sm:inline-flex bencho-press items-center justify-center gap-2 rounded-xl bg-[#085891] hover:bg-[#064572] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_6px_18px_rgba(8,88,145,0.24)] transition-colors"
            >
              <span>{footerPrimaryLabel}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};
