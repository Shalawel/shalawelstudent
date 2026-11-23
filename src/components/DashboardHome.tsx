import React, { useState } from 'react';
import {
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Compass,
  Flame,
  Info,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type {
  CalendarDay,
  CalendarSession,
  LearningAction,
  LearningGoal,
  NotificationItem,
  SessionColumnStatus,
  StudentProfile,
} from '../types/dashboard';
import {
  computeProfileCompletion,
  groupSessionsByStatus,
  paginateItems,
} from '../utils/dashboardLogic';
import { AiMascotRobot, PeerAvatarStack, StudentAvatar } from './BrandAssets';
import {
  AnimatedProgressBar,
  HorizonHeroSurface,
  SpotlightCard,
  TactileButton,
  TiltActionCard,
} from './ui/CraftPrimitives';
import { playUiSound } from '../utils/uiSounds';

interface DashboardHomeProps {
  profile: StudentProfile;
  streakDays: number;
  streakEarnedToday: boolean;
  onClaimDailyStreak: () => void;
  actions: LearningAction[];
  onRefreshActions: () => void;
  isRefreshingActions: boolean;
  onTriggerAction: (action: LearningAction) => void;
  onGeneratePlan: (action: LearningAction) => void;
  goals: LearningGoal[];
  showLearningGoals?: boolean;
  goalPage: number;
  onChangeGoalPage: (page: number) => void;
  onOpenSetGoal: () => void;
  onSelectGoal: (goal: LearningGoal) => void;
  calendarDays: CalendarDay[];
  selectedDateKey: string;
  onSelectDateKey: (dateKey: string) => void;
  sessions: CalendarSession[];
  onSelectSession: (session: CalendarSession) => void;
  onOpenAddSession: (defaultStatus?: SessionColumnStatus) => void;
  notifications: NotificationItem[];
  onMarkAllNotificationsRead: () => void;
  onOpenProfileModal: () => void;
  onOpenStartSession: () => void;
  onOpenAnglesVoiceClassroom: () => void;
  onOpenSolveProblem: () => void;
  onOpenSmartQuiz: () => void;
  onOpenAiLessons: () => void;
  onboardingBanner?: {
    completedSteps: number;
    totalSteps: number;
    percentComplete: number;
    nextStepLabel: string;
    onResume: () => void;
  } | null;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  profile,
  streakDays,
  streakEarnedToday,
  onClaimDailyStreak,
  actions,
  onRefreshActions,
  isRefreshingActions,
  onTriggerAction,
  onGeneratePlan,
  goals,
  showLearningGoals = true,
  goalPage,
  onChangeGoalPage,
  onOpenSetGoal,
  onSelectGoal,
  calendarDays,
  selectedDateKey,
  onSelectDateKey,
  sessions,
  onSelectSession,
  onOpenAddSession,
  notifications,
  onMarkAllNotificationsRead,
  onOpenProfileModal,
  onOpenStartSession,
  onOpenAnglesVoiceClassroom,
  onOpenSolveProblem,
  onOpenSmartQuiz,
  onOpenAiLessons,
  onboardingBanner,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [infoPopover, setInfoPopover] = useState<'actions' | 'goals' | null>(null);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const profileProgress = computeProfileCompletion(profile);
  const goalPagination = paginateItems(goals, goalPage, 3);
  const groupedSessions = groupSessionsByStatus(sessions, selectedDateKey);

  const datesWithSessions = new Set(sessions.map((s) => s.dateKey));

  return (
    <div className="space-y-5">
      {/* Non-blocking Learning Roadmap setup reminder banner when onboarding is incomplete */}
      {onboardingBanner && (
        <div
          data-testid="onboarding-resume-banner"
          className="rounded-2xl border border-[#F19500]/45 bg-gradient-to-r from-[#FFF9EE] via-white to-[#EEF6FF] px-4 sm:px-5 py-3.5 shadow-[0_6px_20px_rgba(8,88,145,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#085891] text-white shadow-xs">
              <Compass className="h-5 w-5 text-[#F19500]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-roadmap-display text-[14.5px] font-bold text-[#0B2545]">
                  Continue Your Learning Roadmap
                </h2>
                <span className="inline-flex items-center rounded-full bg-[#085891]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#085891] tabular-nums">
                  {onboardingBanner.completedSteps} of {onboardingBanner.totalSteps} steps completed
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-slate-600">
                Next up: <span className="font-semibold text-slate-800">{onboardingBanner.nextStepLabel}</span> — finish setup to unlock your personalized Learning Plan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playUiSound('pop');
              onboardingBanner.onResume();
            }}
            className="bencho-press self-start sm:self-center inline-flex items-center gap-1.5 rounded-xl bg-[#F19500] hover:bg-[#DC8700] px-4 py-2.5 text-xs font-bold text-slate-950 whitespace-nowrap shrink-0 shadow-[0_4px_12px_rgba(241,149,0,0.28)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#085891]"
          >
            <span>Resume Setup</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
      {/* ROW 1: Welcome & Streak Card + HorizonX Atmospheric AI Tutor Hero Banner */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Welcome & Profile & Streak Card */}
        <SpotlightCard
          glowTone="amber"
          className="xl:col-span-6 p-5 sm:p-6"
        >
          <div className="flex flex-col justify-between gap-4 h-full">
          {/* Greeting Row */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-[24px] font-bold tracking-tight text-slate-900 leading-tight">
                Hi, {profile.firstName}! <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-1 text-[13.5px] text-slate-500">
                Ready to learn something awesome?
              </p>
            </div>

            {/* Bell & Avatar */}
            <div className="relative flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowNotifs((v) => !v)}
                aria-label={`Notifications, ${unreadNotifCount} unread`}
                aria-expanded={showNotifs}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
              >
                <Bell className="h-[18px] w-[18px]" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white tabular-nums">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={onOpenProfileModal}
                aria-label="Open student profile"
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
              >
                <StudentAvatar size={40} />
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-12 z-30 w-80 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h2 className="text-xs font-bold text-slate-900">Notifications</h2>
                    {unreadNotifCount > 0 && (
                      <button
                        type="button"
                        onClick={onMarkAllNotificationsRead}
                        className="text-[11px] font-semibold text-[#15629E] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`rounded-xl p-2.5 text-left ${
                          n.read ? 'bg-slate-50/80' : 'bg-blue-50/70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">
                            {n.time}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11.5px] text-slate-600 leading-snug">
                          {n.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Complete your profile sub-card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[14.5px] font-bold text-slate-900">
                  {profileProgress.percent === 100
                    ? 'Your profile is personalized'
                    : 'Complete your profile'}
                </h2>
                <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                  {profileProgress.percent}%
                </span>
              </div>
              <p className="mt-0.5 text-[12.5px] text-slate-500">
                {profileProgress.percent === 100
                  ? `${profile.subjects.join(', ')} · Grade ${profile.grade} (${profile.curriculum})`
                  : 'Add subjects and curriculum to personalize your learning.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="self-start sm:self-center rounded-full bg-[#C86400] hover:bg-[#B05700] px-5 py-2.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Go to Profile
            </button>
          </div>

          {/* Streak banner */}
          <div className="rounded-2xl border border-[#F5B041] bg-[#FFF9F0] px-5 py-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#C2410C]">
                <Flame className="h-4 w-4 text-[#EA580C] shrink-0" aria-hidden="true" />
                <span>
                  {streakEarnedToday
                    ? 'Daily streak locked in!'
                    : 'Start your streak today!'}
                </span>
              </p>
              <p className="mt-0.5 text-[12px] text-slate-700">
                Keep learning daily to unlock badges and rewards.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                playUiSound(streakEarnedToday ? 'subtle' : 'success');
                onClaimDailyStreak();
              }}
              aria-label={`Daily streak Day-${streakDays}${
                streakEarnedToday ? ', completed today' : ', click to check in'
              }`}
              className={`bencho-press rounded-full border px-4 py-1.5 text-xs font-bold tabular-nums whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                streakEarnedToday
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-[#F5A623] bg-white text-[#B45309] hover:bg-amber-50'
              }`}
            >
              Day-{streakDays}
            </button>
          </div>
          </div>
        </SpotlightCard>

        {/* AI Tutor Hero Card — HorizonX Atmospheric Surface + Bencho Tactile CTAs */}
        <HorizonHeroSurface className="xl:col-span-6 p-5 sm:p-6 text-white">
          <div className="flex items-center justify-between gap-3 sm:gap-4 my-auto">
            <div className="flex items-start gap-3 sm:gap-4 max-w-[360px]">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-white/12 border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-xs">
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-display text-[20px] sm:text-[24px] font-bold leading-snug tracking-tight text-white [text-wrap:balance]">
                  What do you want to learn today?
                </h2>
                <p className="mt-1 text-[13px] sm:text-[13.5px] text-blue-100/90">
                  Your AI tutor is ready to help.
                </p>
              </div>
            </div>

            <div className="shrink-0 -mr-1">
              <AiMascotRobot className="w-[84px] h-[84px] sm:w-[136px] sm:h-[136px]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <TactileButton
              sound="pop"
              onClick={onOpenStartSession}
              className="w-full rounded-xl bg-[#18689E]/95 hover:bg-[#1E7BB8] border border-white/25 py-3.5 px-4 text-[13.5px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              Start Learning
            </TactileButton>
            <TactileButton
              sound="pop"
              onClick={onOpenAnglesVoiceClassroom}
              className="w-full rounded-xl bg-[#F39200] hover:bg-[#DF8500] py-3.5 px-4 text-[13.5px] font-semibold text-slate-950 shadow-[0_4px_14px_rgba(243,146,0,0.32)] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Class 5 Math: Angles (Voice)
            </TactileButton>
          </div>
        </HorizonHeroSurface>
      </section>

      {/* ROW 2: Next Learning Actions (removed once completed in popup) + For You */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Next Learning Actions */}
        {actions.length > 0 && (
          <SpotlightCard
            glowTone="sky"
            data-testid="dashboard-readiness-section"
            className="xl:col-span-8 p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="relative flex items-center gap-2">
                <h2 className="font-display text-[17px] font-bold text-slate-900">
                  Next Learning Actions
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setInfoPopover((p) => (p === 'actions' ? null : 'actions'))
                  }
                  aria-label="About Next Learning Actions"
                  aria-expanded={infoPopover === 'actions'}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#15629E] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
                >
                  <Info className="h-4 w-4" />
                </button>
                {infoPopover === 'actions' && (
                  <div className="absolute left-0 top-8 z-20 w-72 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-lg">
                    Complete Readiness Checks so Tutor Cloud can calibrate your Grade {profile.grade}{' '}
                    {profile.curriculum} Individualized Learning Plan (ILP).
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onRefreshActions}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isRefreshingActions ? 'animate-spin text-[#15629E]' : ''}`}
                />
                <span>Refresh</span>
              </button>
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-between">
              {actions.map((action) => {
                const isCompleted = action.status === 'Completed';
                return (
                  <article
                    key={action.id}
                    data-testid={`learning-action-${action.id}`}
                    className="rounded-2xl border border-slate-200/85 bg-white px-4 sm:px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-200 transition-colors"
                  >
                    <div className="min-w-0">
                      {/* Crisp status tags matching mockup */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className="inline-block rounded-md border border-sky-400/70 bg-sky-50/70 px-2.5 py-0.5 text-[11px] font-medium text-[#0369A1]">
                          {action.category}
                        </span>
                        <span className="inline-block rounded-md border border-sky-400/70 bg-sky-50/70 px-2.5 py-0.5 text-[11px] font-medium text-[#0369A1]">
                          {action.focus}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-[11px] font-semibold ${
                            isCompleted
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                              : action.status === 'Plan Ready'
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                              : 'border-amber-400 bg-amber-50 text-[#B45309]'
                          }`}
                        >
                          {isCompleted && <Check className="h-3 w-3" aria-hidden="true" />}
                          <span>
                            {action.status}
                            {typeof action.score === 'number' ? ` · ${action.score}%` : ''}
                          </span>
                        </span>
                      </div>

                      <h3 className="text-[15px] font-bold text-slate-900">
                        {action.subject}
                      </h3>
                      <p className="mt-0.5 text-[12.5px] text-slate-500 leading-snug">
                        {action.description}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onTriggerAction(action)}
                        className="rounded-xl bg-[#F39200] hover:bg-[#DF8500] px-4 py-2.5 text-[12.5px] font-semibold text-slate-950 whitespace-nowrap transition-colors shadow-[0_2px_8px_rgba(243,146,0,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      >
                        {action.primaryCta}
                      </button>

                      {action.hasGeneratePlan && (
                        <button
                          type="button"
                          onClick={() => onGeneratePlan(action)}
                          className="rounded-xl border border-[#2563EB] bg-white hover:bg-blue-50 px-4 py-2.5 text-[12.5px] font-semibold text-[#1D4ED8] whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          Generate Learning Plan
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </SpotlightCard>
        )}

        {/* For You Bento Card — expands full width cleanly when all Readiness Checks are removed */}
        <SpotlightCard
          glowTone="emerald"
          className={`${actions.length > 0 ? 'xl:col-span-4' : 'xl:col-span-12'} p-5 sm:p-6`}
        >
          <h2 className="font-display text-[17px] font-bold text-slate-900 mb-4">For You</h2>

          <div
            className={`grid grid-cols-1 gap-3.5 flex-1 ${
              actions.length > 0 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
            }`}
          >
            {/* Tall Emerald Solve my Problem Card */}
            <TiltActionCard
              data-testid="solve-my-problem-card"
              sound="pop"
              sheenColor="rgba(255, 255, 255, 0.28)"
              onClick={onOpenSolveProblem}
              className={`group rounded-2xl bg-gradient-to-b from-[#28C768] to-[#17A34A] p-4 text-left text-white flex flex-col justify-between shadow-[0_8px_20px_rgba(23,163,74,0.26)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                actions.length > 0 ? 'min-h-[230px]' : 'min-h-[168px]'
              }`}
            >
              {/* Soft decorative rings matching mockup */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/15"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 -right-8 h-20 w-20 rounded-full bg-white/10"
              />

              <div className="relative z-10">
                <span className="inline-block rounded-full bg-white/25 px-3 py-1 text-[11px] font-semibold text-white">
                  Solve Now
                </span>
                <h3 className="mt-3 font-display text-[17px] font-bold text-white leading-snug">
                  Solve my Problem
                </h3>
                <p className="mt-1 text-[12px] text-white/90 leading-snug">
                  Upload a question or write your problem
                </p>
              </div>

              <div className="relative z-10 flex items-center justify-between pt-4">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white tabular-nums">
                  <span className="h-2 w-2 rounded-full bg-white/80" aria-hidden="true" />
                  <span>45 min</span>
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/25 group-hover:bg-white/35 transition-colors">
                  <Play className="h-4 w-4 fill-white text-white ml-0.5" aria-hidden="true" />
                </span>
              </div>
            </TiltActionCard>

            {/* Smart Quiz & AI Lessons — stacked when beside Next Learning Actions, or sibling cards when full-width */}
            <div className={actions.length > 0 ? 'flex flex-col gap-3.5' : 'contents'}>
              <TiltActionCard
                aria-label="Smart Quiz — 12 peers active"
                sound="pop"
                sheenColor="rgba(245, 166, 35, 0.16)"
                onClick={onOpenSmartQuiz}
                className="group flex-1 rounded-2xl border border-slate-200/90 bg-white p-4 text-left flex flex-col justify-between hover:border-[#F5A623] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
              >
                <div className="relative z-10">
                  <h3 className="font-display text-[15px] font-bold text-slate-900">
                    Smart Quiz
                  </h3>
                  <div className="mt-2.5">
                    <PeerAvatarStack />
                  </div>
                </div>
                <span className="relative z-10 mt-3 inline-flex items-center text-[#D97706] group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </TiltActionCard>

              <TiltActionCard
                data-testid="accelerate-knowledge-card"
                aria-label="Accelerate Your Knowledge — Target weak areas with sessions and notes"
                sound="click"
                sheenColor="rgba(21, 98, 158, 0.12)"
                onClick={onOpenAiLessons}
                className="group flex-1 rounded-2xl border border-slate-200/90 bg-white p-4 text-left flex flex-col justify-between hover:border-[#F5A623] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
              >
                <div className="relative z-10">
                  <h3 className="font-display text-[15px] font-bold text-slate-900 leading-snug">
                    Accelerate Your Knowledge
                  </h3>
                  <p className="mt-1 text-[12px] text-slate-500 leading-snug">
                    Weak areas, live sessions &amp; AI notes
                  </p>
                </div>
                <span className="relative z-10 mt-3 inline-flex items-center text-[#D97706] group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </TiltActionCard>
            </div>
          </div>
        </SpotlightCard>
      </section>

      {/* ROW 3: Learning Goals Carousel (removed once completed in popup) + Interactive Schedule Board */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Learning Goals Card */}
        {showLearningGoals && goals.length > 0 && (
          <SpotlightCard
            glowTone="amber"
            data-testid="dashboard-learning-goals-section"
            className="xl:col-span-6 p-5 sm:p-6"
          >
          <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="relative flex items-center gap-2">
                <h2 className="font-display text-[17px] font-bold text-slate-900">
                  Learning Goals
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setInfoPopover((p) => (p === 'goals' ? null : 'goals'))
                  }
                  aria-label="About Learning Goals"
                  aria-expanded={infoPopover === 'goals'}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#15629E] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
                >
                  <Info className="h-4 w-4" />
                </button>
                {infoPopover === 'goals' && (
                  <div className="absolute left-0 top-8 z-20 w-72 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-lg">
                    Click any goal card to update mastery progress or mark it complete. Use Set
                    Goal to add new milestones.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onOpenSetGoal}
                className="rounded-lg px-2.5 py-1 text-[13.5px] font-semibold text-[#C2410C] hover:bg-amber-50 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                Set Goal
              </button>
            </div>

            {/* 3 Goal Cards — TiltActionCard + Obsidian AnimatedProgressBar */}
            <div
              data-testid="goals-grid"
              className="grid grid-cols-1 sm:grid-cols-3 gap-3.5"
            >
              {goalPagination.items.map((goal) => (
                <TiltActionCard
                  key={goal.id}
                  sound="click"
                  sheenColor={goal.completed ? 'rgba(16, 185, 129, 0.16)' : 'rgba(245, 166, 35, 0.18)'}
                  onClick={() => onSelectGoal(goal)}
                  className={`rounded-2xl border p-4 text-left flex flex-col justify-between min-h-[186px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    goal.completed
                      ? 'border-emerald-400 bg-emerald-50/70'
                      : 'border-[#F5B041] bg-[#FFF9F0] hover:border-[#D97706] hover:shadow-md'
                  }`}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11.5px] font-semibold text-slate-700">
                        {goal.label}
                      </span>
                      {goal.completed && (
                        <CheckCircle2
                          className="h-4 w-4 text-emerald-600 shrink-0"
                          aria-label="Completed"
                        />
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 tabular-nums">
                      {goal.dueDate}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="inline-block rounded-md border border-sky-400/70 bg-white/90 px-2 py-0.5 text-[10px] font-medium text-[#0369A1]">
                        {goal.category}
                      </span>
                      <span className="inline-block rounded-md border border-sky-400/70 bg-white/90 px-2 py-0.5 text-[10px] font-medium text-[#0369A1]">
                        {goal.subject}
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 mt-4">
                    <h3 className="text-[13.5px] font-bold text-slate-900 leading-snug">
                      {goal.title}
                    </h3>
                    <div className="mt-2.5">
                      <AnimatedProgressBar percent={goal.progress} completed={goal.completed} />
                    </div>
                  </div>
                </TiltActionCard>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Goal pages">
            {Array.from({ length: goalPagination.totalPages }).map((_, idx) => {
              const active = idx === goalPagination.safePage;
              return (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Goal page ${idx + 1} of ${goalPagination.totalPages}`}
                  onClick={() => {
                    playUiSound('switch');
                    onChangeGoalPage(idx);
                  }}
                  className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
                    active
                      ? 'w-6 bg-[#15629E]'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              );
            })}
          </div>
            </div>
          </SpotlightCard>
        )}

        {/* Interactive Schedule Board — expands full width cleanly when Learning Goals are removed */}
        <SpotlightCard
          glowTone="sky"
          className={`${showLearningGoals && goals.length > 0 ? 'xl:col-span-6' : 'xl:col-span-12'} p-5`}
        >
          {/* Date Strip — clean right fade & compact evenly spaced items */}
          <div className="relative">
            <div
              className="flex items-center gap-0.5 overflow-x-auto scrollbar-thin pb-2 pr-6"
              role="tablist"
              aria-label="Schedule dates"
            >
              {calendarDays.map((day) => {
                const isSelected = day.dateKey === selectedDateKey;
                const hasItems = datesWithSessions.has(day.dateKey);
                return (
                  <button
                    key={day.dateKey}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-label={`${day.weekday} ${day.dayNumber}`}
                    onClick={() => onSelectDateKey(day.dateKey)}
                    className={`flex flex-col items-center justify-center rounded-xl px-1.5 py-1.5 min-w-[32px] shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
                      isSelected
                        ? 'bg-[#15629E] text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-medium ${
                        isSelected ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      {day.weekday}
                    </span>
                    <span className="mt-0.5 text-[12px] font-bold tabular-nums">
                      {day.dayNumber}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 h-1 w-1 rounded-full ${
                        hasItems
                          ? isSelected
                            ? 'bg-amber-300'
                            : 'bg-[#15629E]/50'
                          : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent"
            />
          </div>

          {/* 3 Vivid Status Columns: MISSED, TODAY UPCOMING, SCHEDULED */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
            {(
              [
                {
                  key: 'missed' as const,
                  heading: 'MISSED',
                  bgClass: 'bg-[#E53935]',
                  hoverClass: 'hover:bg-white/15',
                  items: groupedSessions.missed,
                },
                {
                  key: 'upcoming' as const,
                  heading: 'TODAY UPCOMING',
                  bgClass: 'bg-[#15803D]',
                  hoverClass: 'hover:bg-white/15',
                  items: groupedSessions.upcoming,
                },
                {
                  key: 'scheduled' as const,
                  heading: 'SCHEDULED',
                  bgClass: 'bg-[#0284C7]',
                  hoverClass: 'hover:bg-white/15',
                  items: groupedSessions.scheduled,
                },
              ]
            ).map((col) => (
              <div key={col.key} className="flex flex-col">
                <h3 className="text-center text-[11px] font-bold tracking-wider text-slate-700 mb-2">
                  {col.heading}
                </h3>
                <div
                  data-testid={`schedule-col-${col.key}`}
                  className={`${col.bgClass} rounded-2xl p-2.5 text-white flex-1 flex flex-col justify-between gap-2 min-h-[210px]`}
                >
                  {col.items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center text-center py-6 px-2">
                      <p className="text-xs font-medium text-white/90">No sessions</p>
                      <button
                        type="button"
                        onClick={() => onOpenAddSession(col.key)}
                        className="mt-2 inline-flex items-center gap-1 rounded-lg bg-white/20 hover:bg-white/30 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {col.items.map((session) => (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() => onSelectSession(session)}
                          className={`w-full rounded-xl p-1.5 text-left transition-colors ${col.hoverClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="shrink-0 w-[34px] text-center leading-tight pt-0.5">
                              <span className="block text-[11.5px] font-bold tabular-nums text-white">
                                {session.time}
                              </span>
                              <span className="block text-[9px] font-semibold text-white/85">
                                {session.meridiem}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11.5px] font-bold text-white leading-snug">
                                {session.title}
                              </p>
                              <p className="mt-0.5 text-[10px] text-white/90 leading-snug">
                                {session.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </section>
    </div>
  );
};
