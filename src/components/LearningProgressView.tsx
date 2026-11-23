import React, { useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Copy,
  Download,
  FileText,
  Flame,
  FlaskConical,
  Globe,
  Mail,
  PenLine,
  Plus,
  Send,
  Share2,
  Sigma,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import type {
  LearningPlanModule,
  NavSectionId,
  SmartQuizInput,
  StartSessionInput,
  StudentProfile,
} from '../types/dashboard';
import type { AchievementBadge } from '../utils/achievementsLogic';
import {
  INITIAL_TARGET_GOALS,
  INITIAL_WIN_MILESTONES,
  PROGRESS_ACTIVITY_OPTIONS,
  PROGRESS_SUBJECT_OPTIONS,
  PROGRESS_TIMEFRAME_OPTIONS,
  buildExportReportText,
  buildProgressCoachingMessage,
  computeWeeklyKpis,
  filterStrengthsAndNeeds,
  getGrowthBarData,
  getWeeklyLineSeries,
  incrementTargetGoalProgress,
  validateShareEmail,
  type PracticeNeedItem,
  type ProgressActivityFilter,
  type ProgressSubjectFilter,
  type ProgressTimeframeFilter,
  type StrengthItem,
  type TargetGoalItem,
  type TrendMetricMode,
  type TrendViewMode,
} from '../utils/learningProgressLogic';
import { playUiSound } from '../utils/uiSounds';
import { LearningProgressCharts } from './LearningProgressCharts';

interface LearningProgressViewProps {
  profile: StudentProfile;
  streakDays: number;
  streakEarnedToday: boolean;
  onClaimDailyStreak: () => void;
  completedQuizzesCount: number;
  planModules: LearningPlanModule[];
  achievementBadges: AchievementBadge[];
  onNavigate: (section: NavSectionId) => void;
  onLaunchSmartQuiz: (input: SmartQuizInput) => void;
  onStartTopicSession: (input: StartSessionInput) => void;
  onNotify: (message: string) => void;
}

const WEEKDAY_RHYTHM = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const LearningProgressView: React.FC<LearningProgressViewProps> = ({
  profile,
  streakDays,
  streakEarnedToday,
  onClaimDailyStreak,
  completedQuizzesCount,
  planModules,
  achievementBadges,
  onNavigate,
  onLaunchSmartQuiz,
  onStartTopicSession,
  onNotify,
}) => {
  const [subjectFilter, setSubjectFilter] = useState<ProgressSubjectFilter>('All Subjects');
  const [timeframeFilter, setTimeframeFilter] = useState<ProgressTimeframeFilter>('This Month');
  const [activityFilter, setActivityFilter] = useState<ProgressActivityFilter>('All Activities');

  const [viewMode, setViewMode] = useState<TrendViewMode>('monthly');
  const [metricMode, setMetricMode] = useState<TrendMetricMode>('mastery');

  const [targetGoals, setTargetGoals] = useState<TargetGoalItem[]>(() =>
    INITIAL_TARGET_GOALS.map((g) =>
      g.id === 'tg-math-curriculum'
        ? { ...g, title: `Complete Grade ${profile.grade} Mathematics Curriculum` }
        : g
    )
  );

  const [lastExportedAt, setLastExportedAt] = useState<string>('Nov 18, 2026 at 10:30 AM');
  const [shareModalMode, setShareModalMode] = useState<'email' | 'share' | null>(null);
  const [shareRecipientEmail, setShareRecipientEmail] = useState('john.carter@example.com');
  const [shareRecipientRole, setShareRecipientRole] = useState<'parent' | 'teacher'>('parent');
  const [shareNote, setShareNote] = useState('');
  const [shareIncludeSections, setShareIncludeSections] = useState({
    charts: true,
    goals: true,
    strengthsNeeds: true,
  });
  const [shareError, setShareError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const livePlanCompletionPercent = useMemo(() => {
    if (planModules.length === 0) return 64;
    const avg =
      planModules.reduce((sum, m) => sum + (m.completed ? 100 : m.mastery), 0) /
      planModules.length;
    return Math.round(avg);
  }, [planModules]);

  const kpis = useMemo(
    () =>
      computeWeeklyKpis({
        subject: subjectFilter,
        timeframe: timeframeFilter,
        activity: activityFilter,
        liveStreakDays: streakDays,
        liveCompletedQuizzes: completedQuizzesCount,
        livePlanCompletionPercent,
      }),
    [
      subjectFilter,
      timeframeFilter,
      activityFilter,
      streakDays,
      completedQuizzesCount,
      livePlanCompletionPercent,
    ]
  );

  const barData = useMemo(
    () =>
      getGrowthBarData({
        subject: subjectFilter,
        timeframe: timeframeFilter,
        activity: activityFilter,
        viewMode,
      }),
    [subjectFilter, timeframeFilter, activityFilter, viewMode]
  );

  const lineData = useMemo(
    () =>
      getWeeklyLineSeries({
        subject: subjectFilter,
        activity: activityFilter,
      }),
    [subjectFilter, activityFilter]
  );

  const { strengths, needs } = useMemo(
    () => filterStrengthsAndNeeds(subjectFilter),
    [subjectFilter]
  );

  const averageMastery = useMemo(() => {
    if (barData.length === 0) return 75;
    return Math.round(barData.reduce((sum, d) => sum + d.mastery, 0) / barData.length);
  }, [barData]);

  const averageAccuracy = useMemo(() => {
    if (barData.length === 0) return 74;
    return Math.round(barData.reduce((sum, d) => sum + d.accuracy, 0) / barData.length);
  }, [barData]);

  const earnedBadgesCount = useMemo(
    () => achievementBadges.filter((b) => b.status === 'earned').length,
    [achievementBadges]
  );

  const coachingBannerText = useMemo(
    () =>
      buildProgressCoachingMessage({
        averageAccuracy,
        timeframe: timeframeFilter,
        subject: subjectFilter,
      }),
    [averageAccuracy, timeframeFilter, subjectFilter]
  );

  const handleToggleActivityKpi = (target: ProgressActivityFilter) => {
    playUiSound('switch');
    setActivityFilter((prev) => (prev === target ? 'All Activities' : target));
  };

  const handleBoostGoal = (goalId: string) => {
    playUiSound('pop');
    const { goals: nextGoals, updatedGoal } = incrementTargetGoalProgress(targetGoals, goalId, 5);
    setTargetGoals(nextGoals);
    if (updatedGoal) {
      if (updatedGoal.progress >= 100) {
        playUiSound('success');
        onNotify(`Target achieved: "${updatedGoal.title}" reached 100%!`);
      } else {
        onNotify(`Logged milestone: "${updatedGoal.title}" is now at ${updatedGoal.progress}%`);
      }
    }
  };

  const handlePracticeWeakArea = (need: PracticeNeedItem) => {
    playUiSound('switch');
    onLaunchSmartQuiz({
      subject: need.subject,
      topic: need.recommendedTopic,
    });
  };

  const handleTutorWeakArea = (need: PracticeNeedItem) => {
    playUiSound('switch');
    onStartTopicSession({
      helpType: 'Learn a Lesson',
      subject: need.subject,
      lessonSource: 'another-topic',
      topic: need.recommendedTopic,
      specificQuestion: need.description,
      gradeLevel: profile.grade,
    });
  };

  const handleChallengeStrength = (strength: StrengthItem) => {
    playUiSound('switch');
    onLaunchSmartQuiz({
      subject: strength.subject,
      topic: `${strength.title} (Honors Challenge)`,
    });
  };

  const formatNowTimestamp = () => {
    const now = new Date();
    const datePart = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timePart = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `${datePart} at ${timePart}`;
  };

  const handleDownloadReport = () => {
    playUiSound('success');
    const timestamp = formatNowTimestamp();
    const content = buildExportReportText({
      studentName: profile.fullName,
      grade: profile.grade,
      subject: subjectFilter,
      timeframe: timeframeFilter,
      activity: activityFilter,
      kpis,
      averageMastery,
      strengths,
      needs,
      goals: targetGoals,
      exportedAt: timestamp,
    });

    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TutorCloud-Learning-Progress-${subjectFilter
        .toLowerCase()
        .replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Safe fallback in restricted environments
    }

    setLastExportedAt(`Just now (${timestamp})`);
    onNotify(`Learning Progress report exported (${subjectFilter} · ${timeframeFilter})`);
  };

  const handleOpenShareModal = (mode: 'email' | 'share') => {
    playUiSound('pop');
    setShareError(null);
    setCopiedLink(false);
    setShareModalMode(mode);
  };

  const handleSubmitShare = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErr = validateShareEmail(shareRecipientEmail);
    if (validationErr) {
      setShareError(validationErr);
      return;
    }
    playUiSound('success');
    const timestamp = formatNowTimestamp();
    setLastExportedAt(`Just now (${timestamp})`);
    const targetLabel =
      shareModalMode === 'email'
        ? `Progress report emailed to ${shareRecipientEmail.trim()}`
        : `Progress snapshot shared with ${
            shareRecipientRole === 'parent' ? 'Parent' : 'Teacher'
          } (${shareRecipientEmail.trim()})`;
    setShareModalMode(null);
    setShareNote('');
    onNotify(targetLabel);
  };

  const handleCopyShareLink = () => {
    playUiSound('click');
    const url = `https://tutorcloud.edu/progress/shared/${profile.firstName.toLowerCase()}-${timeframeFilter
      .toLowerCase()
      .replace(/\s+/g, '-')}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2000);
  };

  const renderStrengthIcon = (icon: StrengthItem['icon']) => {
    switch (icon) {
      case 'sigma':
        return <Sigma className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />;
      case 'flask':
        return <FlaskConical className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />;
      case 'book':
        return <BookOpen className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />;
      case 'globe':
      default:
        return <Globe className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />;
    }
  };

  const renderNeedIcon = (icon: PracticeNeedItem['icon'], isHigh: boolean) => {
    const color = isHigh
      ? 'text-red-600 dark:text-red-400'
      : 'text-amber-600 dark:text-amber-400';
    switch (icon) {
      case 'edit':
        return <PenLine className={`h-4 w-4 ${color}`} />;
      case 'calendar':
        return <Calendar className={`h-4 w-4 ${color}`} />;
      case 'sigma':
        return <Sigma className={`h-4 w-4 ${color}`} />;
      case 'flask':
      default:
        return <FlaskConical className={`h-4 w-4 ${color}`} />;
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-4 pb-8">
        {/* Top Page Header + Global Interactive Filters */}
        <section className="rounded-[20px] bg-white/95 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-5 sm:px-6 py-4 shadow-[0_6px_24px_rgba(21,98,158,0.06)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Learning Progress
              </h1>
              <p className="mt-0.5 text-xs sm:text-[13px] text-slate-500 dark:text-slate-400">
                Track your learning progress, activity, and improvement over time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Subject Filter */}
              <div className="relative flex items-center">
                <select
                  value={subjectFilter}
                  onChange={(e) => {
                    playUiSound('switch');
                    setSubjectFilter(e.target.value as ProgressSubjectFilter);
                  }}
                  aria-label="Filter progress by subject"
                  className="appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#15629E] focus:outline-none cursor-pointer"
                >
                  {PROGRESS_SUBJECT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-500" />
              </div>

              {/* Timeframe Filter */}
              <div className="relative flex items-center">
                <select
                  value={timeframeFilter}
                  onChange={(e) => {
                    playUiSound('switch');
                    setTimeframeFilter(e.target.value as ProgressTimeframeFilter);
                  }}
                  aria-label="Filter progress by timeframe"
                  className="appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#15629E] focus:outline-none cursor-pointer"
                >
                  {PROGRESS_TIMEFRAME_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-500" />
              </div>

              {/* Activity Filter */}
              <div className="relative flex items-center">
                <select
                  value={activityFilter}
                  onChange={(e) => {
                    playUiSound('switch');
                    setActivityFilter(e.target.value as ProgressActivityFilter);
                  }}
                  aria-label="Filter progress by activity type"
                  className="appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#15629E] focus:outline-none cursor-pointer"
                >
                  {PROGRESS_ACTIVITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-500" />
              </div>

              {/* Quick Export Icon Button */}
              <button
                type="button"
                onClick={handleDownloadReport}
                aria-label="Quick download learning progress report"
                title="Download Progress Report"
                className="bencho-press inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#EBF4FC] hover:text-[#15629E] hover:border-[#BBD6F2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Section 1: Your Weekly Learning Progress (Banner + Asymmetric Bento KPI Grid) */}
        <section aria-labelledby="weekly-progress-heading" className="space-y-3.5">
          {/* Sub-header banner matching reference */}
          <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-5 py-3.5 shadow-[0_4px_16px_rgba(21,98,158,0.04)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF6E5] dark:bg-amber-950/50 text-[#E67E00] dark:text-amber-400">
                <TrendingUp className="h-4.5 w-4.5" />
              </span>
              <div>
                <h2
                  id="weekly-progress-heading"
                  className="font-display text-sm font-bold text-slate-900 dark:text-white"
                >
                  Your Weekly Learning Progress
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  A quick view of your learning activity and progress.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {kpis.weeklyDeltaPercent >= 0
                ? `+${kpis.weeklyDeltaPercent}% momentum`
                : `${kpis.weeklyDeltaPercent}% momentum`}{' '}
              · {timeframeFilter}
            </span>
          </div>

          {/* Asymmetric 4-Column Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Tall Left Highlight Card: Current Streak (spans 2 rows on desktop) */}
            <div
              data-testid="kpi-current-streak"
              className="lg:row-span-2 rounded-[20px] bg-gradient-to-b from-[#FFFDF7] to-[#FFF6E5] dark:from-amber-950/30 dark:to-slate-900 border border-[#F8D08B] dark:border-amber-800/70 p-5 flex flex-col justify-between shadow-[0_6px_20px_rgba(245,158,11,0.08)]"
            >
              <div>
                <div className="flex items-center gap-3.5">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-amber-700/60 text-[#E67E00] dark:text-amber-400 shadow-xs">
                    <ClipboardCheck className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">
                      {kpis.currentStreakDays} {kpis.currentStreakDays === 1 ? 'day' : 'days'}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                      Current Streak
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  You completed{' '}
                  <strong className="font-semibold text-slate-800 dark:text-white tabular-nums">
                    {kpis.scheduledSessionsCompleted}
                  </strong>{' '}
                  scheduled sessions {timeframeFilter === 'This Week' ? 'this week' : 'recently'}.
                </p>

                {/* Weekly Rhythm Dots */}
                <div className="mt-4 flex items-center justify-between gap-1">
                  {WEEKDAY_RHYTHM.map((day, i) => {
                    const active = i < Math.min(7, kpis.currentStreakDays + 2);
                    return (
                      <div key={`${day}-${i}`} className="flex flex-col items-center gap-1">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold ${
                            active
                              ? 'bg-[#F59E0B] text-white'
                              : 'bg-white/80 dark:bg-slate-800 text-slate-400 border border-amber-200/60 dark:border-slate-700'
                          }`}
                        >
                          {day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playUiSound('success');
                  onClaimDailyStreak();
                }}
                disabled={streakEarnedToday}
                className={`bencho-press mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  streakEarnedToday
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default'
                    : 'bg-[#15629E] text-white hover:bg-[#104E7E]'
                }`}
              >
                {streakEarnedToday ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Checked In Today
                  </>
                ) : (
                  <>
                    <Flame className="h-3.5 w-3.5" />
                    Check In Today (+1 Day)
                  </>
                )}
              </button>
            </div>

            {/* Top-Middle: Completion Rate */}
            <div
              data-testid="kpi-completion-rate"
              className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-[0_4px_16px_rgba(21,98,158,0.04)] flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">
                    {kpis.completionRate}%
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Completion Rate
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                {kpis.completionRate >= 70
                  ? 'Excellent progress this week!'
                  : 'Steady pace — complete 1 more module to hit 75%!'}
              </p>
            </div>

            {/* Top-Mid-Right: Tutor Session (clickable filter) */}
            <button
              type="button"
              onClick={() => handleToggleActivityKpi('Tutor Sessions')}
              aria-pressed={activityFilter === 'Tutor Sessions'}
              data-testid="kpi-tutor-sessions"
              className={`rounded-[20px] p-4 text-left transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] flex flex-col justify-between ${
                activityFilter === 'Tutor Sessions'
                  ? 'bg-[#EBF4FC] dark:bg-sky-950/50 border-[#15629E]'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-[#BBD6F2]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EBF4FC] dark:bg-sky-950/60 text-[#15629E] dark:text-sky-400">
                  <Sigma className="h-4.5 w-4.5" />
                </span>
                <span className="font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {kpis.tutorSessions}
                </span>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                Tutor Session
              </p>
            </button>

            {/* Top-Right: Practice Sets (clickable filter) */}
            <button
              type="button"
              onClick={() => handleToggleActivityKpi('Practice Sets')}
              aria-pressed={activityFilter === 'Practice Sets'}
              data-testid="kpi-practice-sets"
              className={`rounded-[20px] p-4 text-left transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] flex flex-col justify-between ${
                activityFilter === 'Practice Sets'
                  ? 'bg-[#FFF6E5] dark:bg-amber-950/50 border-[#F59E0B]'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <BookOpen className="h-4.5 w-4.5" />
                </span>
                <span className="font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {kpis.practiceSets}
                </span>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                Practice Sets
              </p>
            </button>

            {/* Bottom-Middle: Best Streak */}
            <div
              data-testid="kpi-best-streak"
              className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-[0_4px_16px_rgba(21,98,158,0.04)] flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">
                    {kpis.bestStreakDays} {kpis.bestStreakDays === 1 ? 'day' : 'days'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Best Streak</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                Your longest learning streak so far.
              </p>
            </div>

            {/* Bottom-Mid-Right: Homework (clickable filter) */}
            <button
              type="button"
              onClick={() => handleToggleActivityKpi('Homework')}
              aria-pressed={activityFilter === 'Homework'}
              data-testid="kpi-homework"
              className={`rounded-[20px] p-4 text-left transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] flex flex-col justify-between ${
                activityFilter === 'Homework'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <FlaskConical className="h-4.5 w-4.5" />
                </span>
                <span className="font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {kpis.homeworkCount}
                </span>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                Homework
              </p>
            </button>

            {/* Bottom-Right: Quizzes (clickable filter) */}
            <button
              type="button"
              onClick={() => handleToggleActivityKpi('Quizzes')}
              aria-pressed={activityFilter === 'Quizzes'}
              data-testid="kpi-quizzes"
              className={`rounded-[20px] p-4 text-left transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] flex flex-col justify-between ${
                activityFilter === 'Quizzes'
                  ? 'bg-[#EEF2FF] dark:bg-indigo-950/50 border-indigo-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Globe className="h-4.5 w-4.5" />
                </span>
                <span className="font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {kpis.quizzesCount}
                </span>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                Quizzes
              </p>
            </button>
          </div>
        </section>

        {/* Section 2: Learning Growth Trends (Dual Interactive Charts) */}
        <LearningProgressCharts
          subjectFilter={subjectFilter}
          viewMode={viewMode}
          metricMode={metricMode}
          onChangeViewMode={setViewMode}
          onChangeMetricMode={setMetricMode}
          barData={barData}
          lineData={lineData}
        />

        {/* Section 3: Your Wins So Far (Milestones & Badges + Target Goal Progress) */}
        <section
          aria-labelledby="wins-heading"
          data-testid="wins-so-far-card"
          className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-5 sm:px-6 py-5 shadow-[0_6px_24px_rgba(21,98,158,0.06)] space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4.5 w-4.5 text-[#E67E00] dark:text-amber-400" />
              <h2
                id="wins-heading"
                className="font-display text-base font-bold text-slate-900 dark:text-white"
              >
                Your Wins So Far
              </h2>
              <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                · {earnedBadgesCount} badges unlocked
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                playUiSound('switch');
                onNavigate('achievements');
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#15629E] dark:text-sky-400 hover:underline whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] rounded-md px-1 py-0.5"
            >
              View All Achievements
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Milestones & Badges */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-2.5">
              <h3 className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                Milestones & Badges
              </h3>
              <div className="space-y-2.5">
                {INITIAL_WIN_MILESTONES.map((milestone) => {
                  const toneStyles =
                    milestone.tone === 'amber'
                      ? 'bg-[#FFF9E6] dark:bg-amber-950/35 border-[#FDE68A] dark:border-amber-800/60 text-amber-800 dark:text-amber-200'
                      : milestone.tone === 'sky'
                      ? 'bg-[#EFF6FF] dark:bg-sky-950/40 border-[#BFDBFE] dark:border-sky-800/60 text-[#15629E] dark:text-sky-200'
                      : 'bg-[#ECFDF5] dark:bg-emerald-950/35 border-[#A7F3D0] dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200';
                  const iconBg =
                    milestone.tone === 'amber'
                      ? 'bg-white dark:bg-slate-800 text-amber-600'
                      : milestone.tone === 'sky'
                      ? 'bg-white dark:bg-slate-800 text-[#15629E]'
                      : 'bg-white dark:bg-slate-800 text-emerald-600';

                  return (
                    <button
                      key={milestone.id}
                      type="button"
                      onClick={() => {
                        playUiSound('switch');
                        onNavigate('achievements');
                      }}
                      className={`bencho-press w-full flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${toneStyles}`}
                    >
                      <span
                        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-2xs ${iconBg}`}
                        aria-hidden="true"
                      >
                        {milestone.icon === 'medal' ? (
                          <Award className="h-4 w-4" />
                        ) : milestone.icon === 'sparkle' ? (
                          <Sparkles className="h-4 w-4" />
                        ) : (
                          <Flame className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold leading-snug">{milestone.title}</p>
                        <p className="text-[11px] opacity-80 truncate">{milestone.subtitle}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 opacity-55 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Target Goal Progress */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  Target Goal Progress
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    playUiSound('switch');
                    onNavigate('learning-plan');
                  }}
                  className="text-[11.5px] font-semibold text-[#15629E] dark:text-sky-400 hover:underline"
                >
                  Open Learning Plan →
                </button>
              </div>

              <div className="space-y-5 flex-1 flex flex-col justify-center">
                {targetGoals.map((goal) => (
                  <div key={goal.id} data-testid={`target-goal-${goal.id}`} className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white">
                        {goal.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold tabular-nums ${
                            goal.accent === 'blue'
                              ? 'text-[#15629E] dark:text-sky-400'
                              : 'text-[#D97706] dark:text-amber-400'
                          }`}
                        >
                          {goal.progress}%
                        </span>
                        {goal.progress < 100 && (
                          <button
                            type="button"
                            onClick={() => handleBoostGoal(goal.id)}
                            aria-label={`Log 5 percent progress on ${goal.title}`}
                            className="bencho-press inline-flex items-center gap-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-[#15629E] hover:text-[#15629E] transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            5%
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div
                        initial={false}
                        animate={{ scaleX: Math.max(0.03, goal.progress / 100) }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        style={{ transformOrigin: 'left center' }}
                        className={`h-full w-full rounded-full ${
                          goal.progress >= 100
                            ? 'bg-emerald-500'
                            : goal.accent === 'blue'
                            ? 'bg-[#15629E]'
                            : 'bg-[#F59E0B]'
                        }`}
                      />
                    </div>

                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                      {goal.metaText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Strengths and Needs More Practice */}
        <section
          aria-labelledby="strengths-needs-heading"
          data-testid="strengths-needs-card"
          className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-5 sm:px-6 py-5 shadow-[0_6px_24px_rgba(21,98,158,0.06)] space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-[#15629E] dark:text-sky-400" />
              <h2
                id="strengths-needs-heading"
                className="font-display text-base font-bold text-slate-900 dark:text-white"
              >
                Strengths and Needs More Practice
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing insights for <strong className="text-slate-700 dark:text-slate-200">{subjectFilter}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Key Strengths */}
            <div className="rounded-2xl bg-[#F3FBF6] dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-display text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  Key Strengths
                </h3>
              </div>

              <div className="space-y-3.5">
                {strengths.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-white/85 dark:bg-slate-900/70 border border-emerald-100 dark:border-emerald-900/50 p-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100/80 dark:bg-emerald-900/60">
                        {renderStrengthIcon(item.icon)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </h4>
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                            {item.tagLabel}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            {item.subject}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleChallengeStrength(item)}
                            className="text-[11.5px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded"
                          >
                            Try Challenge Quiz →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Needs More Practice */}
            <div className="rounded-2xl bg-[#FEF6F6] dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/60 p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />
                <h3 className="font-display text-sm font-bold text-red-700 dark:text-red-300">
                  Needs More Practice
                </h3>
              </div>

              <div className="space-y-3.5">
                {needs.map((item) => {
                  const isHigh = item.priority === 'High Priority';
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl bg-white/90 dark:bg-slate-900/75 border border-red-100 dark:border-red-900/50 p-3.5"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isHigh
                              ? 'bg-red-100/80 dark:bg-red-950/60'
                              : 'bg-amber-100/80 dark:bg-amber-950/60'
                          }`}
                        >
                          {renderNeedIcon(item.icon, isHigh)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white">
                              {item.title}
                            </h4>
                            <span
                              className={`text-[11px] font-bold ${
                                isHigh
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-amber-700 dark:text-amber-400'
                              }`}
                            >
                              {item.priority}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {item.description}
                          </p>

                          {/* Mastery meter */}
                          <div className="mt-2.5 flex items-center gap-2.5">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                              <div
                                style={{ width: `${item.masteryPercent}%` }}
                                className={`h-full rounded-full ${
                                  isHigh ? 'bg-red-500' : 'bg-amber-500'
                                }`}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                              {item.masteryPercent}%
                            </span>
                          </div>

                          {/* Actionable practice triggers */}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handlePracticeWeakArea(item)}
                              aria-label={`Practice ${item.title} with Smart Quiz`}
                              className="bencho-press inline-flex items-center gap-1 rounded-lg bg-[#15629E] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#104E7E] transition-colors"
                            >
                              Practice Now
                              <ArrowRight className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTutorWeakArea(item)}
                              aria-label={`Launch AI Tutor session for ${item.title}`}
                              className="bencho-press inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-[#15629E] hover:text-[#15629E] transition-colors"
                            >
                              Ask AI Tutor
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Export and Share Report Card */}
        <section
          aria-labelledby="export-report-heading"
          data-testid="export-report-card"
          className="rounded-[20px] bg-gradient-to-r from-[#FFFDF7] to-[#FFF6E5] dark:from-slate-900 dark:to-amber-950/25 border border-[#F8D08B] dark:border-amber-800/70 px-5 sm:px-6 py-5 shadow-[0_6px_20px_rgba(245,158,11,0.08)]"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Share2 className="h-4.5 w-4.5 text-slate-800 dark:text-amber-300" />
                <h2
                  id="export-report-heading"
                  className="font-display text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white"
                >
                  Export and Share Report
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                Last Exported: <strong className="font-semibold">{lastExportedAt}</strong>
              </p>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                File format: Progress Summary (High Resolution) · Size: 2.4 MB
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:min-w-[290px]">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="bencho-press inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  <FileText className="h-3.5 w-3.5 text-[#15629E] dark:text-sky-400" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenShareModal('email')}
                  className="bencho-press inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  <Mail className="h-3.5 w-3.5 text-[#15629E] dark:text-sky-400" />
                  Email Report
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleOpenShareModal('share')}
                className="bencho-press w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-xs transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
              >
                <Users className="h-4 w-4" />
                Share with Parent/Teacher
              </button>
            </div>
          </div>
        </section>

        {/* Bottom Dynamic Coaching Insight Strip */}
        <section
          aria-live="polite"
          data-testid="coaching-banner"
          className="rounded-2xl bg-[#EEF2FF] dark:bg-indigo-950/40 border border-[#D8E1FF] dark:border-indigo-900/70 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <p className="text-xs sm:text-[13px] font-medium text-[#1E293B] dark:text-indigo-100">
            {coachingBannerText}
          </p>
          <button
            type="button"
            onClick={() => {
              playUiSound('switch');
              onLaunchSmartQuiz({
                subject: subjectFilter === 'All Subjects' ? 'Mathematics' : subjectFilter,
                topic: 'Consistency Boost Drill',
              });
            }}
            className="bencho-press inline-flex items-center gap-1 text-xs font-bold text-[#15629E] dark:text-sky-300 hover:underline whitespace-nowrap shrink-0"
          >
            Start 5-Min Boost Quiz
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>

        {/* Interactive Email / Share with Parent or Teacher Modal */}
        <AnimatePresence>
          {shareModalMode && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-report-modal-title"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShareModalMode(null)}
                className="fixed inset-0 bg-slate-950/55"
                aria-hidden="true"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2
                      id="share-report-modal-title"
                      className="font-display text-base font-bold text-slate-900 dark:text-white"
                    >
                      {shareModalMode === 'email'
                        ? 'Email Learning Progress Report'
                        : 'Share with Parent or Teacher'}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Snapshot scope: {subjectFilter} · {timeframeFilter}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShareModalMode(null)}
                    aria-label="Close share dialog"
                    className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmitShare} className="space-y-4">
                  {/* Quick recipient role selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShareRecipientRole('parent');
                        setShareRecipientEmail('john.carter@example.com');
                        setShareError(null);
                      }}
                      className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                        shareRecipientRole === 'parent'
                          ? 'border-[#15629E] bg-[#EBF4FC] dark:bg-sky-950/50 text-[#0B2242] dark:text-sky-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Linked Parent
                      <span className="block text-[11px] font-normal opacity-75">John Carter</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShareRecipientRole('teacher');
                        setShareRecipientEmail('elena.brooks@school.edu');
                        setShareError(null);
                      }}
                      className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                        shareRecipientRole === 'teacher'
                          ? 'border-[#15629E] bg-[#EBF4FC] dark:bg-sky-950/50 text-[#0B2242] dark:text-sky-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Homeroom Teacher
                      <span className="block text-[11px] font-normal opacity-75">
                        Ms. Elena Brooks
                      </span>
                    </button>
                  </div>

                  <div>
                    <label
                      htmlFor="share-recipient-email"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Recipient Email
                    </label>
                    <input
                      id="share-recipient-email"
                      type="email"
                      value={shareRecipientEmail}
                      onChange={(e) => {
                        setShareRecipientEmail(e.target.value);
                        if (shareError) setShareError(null);
                      }}
                      placeholder="parent@example.com"
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-[#15629E] focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                    />
                    {shareError && (
                      <p role="alert" className="mt-1 text-[11.5px] font-medium text-red-600">
                        {shareError}
                      </p>
                    )}
                  </div>

                  {/* Selectable Report Sections */}
                  <fieldset className="space-y-2">
                    <legend className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Include in Report
                    </legend>
                    <div className="space-y-1.5">
                      {[
                        { key: 'charts' as const, label: 'Learning Growth Trends & Weekly KPIs' },
                        { key: 'goals' as const, label: 'Wins & Target Goal Progress' },
                        {
                          key: 'strengthsNeeds' as const,
                          label: 'Key Strengths & Practice Recommendations',
                        },
                      ].map((sec) => (
                        <label
                          key={sec.key}
                          className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={shareIncludeSections[sec.key]}
                            onChange={() =>
                              setShareIncludeSections((prev) => ({
                                ...prev,
                                [sec.key]: !prev[sec.key],
                              }))
                            }
                            className="h-3.5 w-3.5 rounded accent-[#15629E]"
                          />
                          {sec.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <label
                      htmlFor="share-note"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Optional Note
                    </label>
                    <textarea
                      id="share-note"
                      rows={2}
                      value={shareNote}
                      onChange={(e) => setShareNote(e.target.value)}
                      placeholder="Add a brief message about this week's highlights..."
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-[#15629E] focus:bg-white dark:focus:bg-slate-800 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyShareLink}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          Link Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy View Link
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShareModalMode(null)}
                        className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bencho-press inline-flex items-center gap-1.5 rounded-xl bg-[#15629E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#104E7E] transition-colors"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {shareModalMode === 'email' ? 'Send Email' : 'Send Snapshot'}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};
