import React, { useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Filter,
  Flame,
  FolderCheck,
  Info,
  Lightbulb,
  Lock,
  Pin,
  PinOff,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import type { NavSectionId } from '../types/dashboard';
import {
  ACHIEVEMENT_CATEGORIES,
  advanceBadgeProgress,
  claimBadgeReward,
  computeAchievementStats,
  filterCategoriesAndBadges,
  formatBadgeProgressLabel,
  getBadgeProgressPercent,
  getNextBadgesToEarn,
  startTrackingBadge,
  togglePinnedBadge,
  type AchievementBadge,
  type AchievementCategory,
  type AchievementCategoryId,
  type BadgeStatus,
} from '../utils/achievementsLogic';
import { playUiSound } from '../utils/uiSounds';
import { BadgeMedallion } from './BadgeMedallion';

interface AchievementsViewProps {
  badges: AchievementBadge[];
  pinnedBadgeIds: string[];
  onUpdateBadges: (badges: AchievementBadge[]) => void;
  onUpdatePinnedBadges: (pinnedIds: string[]) => void;
  onNavigateToActivity: (section: NavSectionId) => void;
  onNotify: (message: string) => void;
}

const CONFETTI_PARTICLES = [
  { x: -110, y: -85, rotate: -140, color: '#15629E', delay: 0 },
  { x: -75, y: -115, rotate: 95, color: '#16A34A', delay: 0.03 },
  { x: -30, y: -125, rotate: -70, color: '#F59E0B', delay: 0.05 },
  { x: 24, y: -128, rotate: 110, color: '#8B5CF6', delay: 0.02 },
  { x: 76, y: -112, rotate: -95, color: '#0EA5E9', delay: 0.06 },
  { x: 112, y: -82, rotate: 135, color: '#F97316', delay: 0.04 },
  { x: -120, y: -25, rotate: 65, color: '#22C55E', delay: 0.07 },
  { x: 122, y: -20, rotate: -85, color: '#EAB308', delay: 0.03 },
  { x: -95, y: 45, rotate: 145, color: '#38BDF8', delay: 0.05 },
  { x: 96, y: 48, rotate: -120, color: '#A855F7', delay: 0.06 },
  { x: -45, y: 78, rotate: -60, color: '#F59E0B', delay: 0.04 },
  { x: 48, y: 80, rotate: 75, color: '#15629E', delay: 0.02 },
];

function renderCategoryIcon(categoryId: AchievementCategoryId) {
  switch (categoryId) {
    case 'LJ':
      return <Compass className="h-4 w-4 text-white" />;
    case 'PM':
      return <Target className="h-4 w-4 text-white" />;
    case 'AS':
      return <FolderCheck className="h-4 w-4 text-white" />;
    case 'NS':
      return <BookOpen className="h-4 w-4 text-white" />;
    case 'CD':
      return <Flame className="h-4 w-4 text-white" />;
    case 'HI':
      return <Lightbulb className="h-4 w-4 text-white" />;
    case 'IN':
      return <ShieldCheck className="h-4 w-4 text-white" />;
    case 'SP':
      return <Sparkles className="h-4 w-4 text-white" />;
    case 'AT':
    default:
      return <Trophy className="h-4 w-4 text-white" />;
  }
}

function getFormattedTodayLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  badges,
  pinnedBadgeIds,
  onUpdateBadges,
  onUpdatePinnedBadges,
  onNavigateToActivity,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BadgeStatus>('all');
  const [expandedCategories, setExpandedCategories] = useState<
    Record<AchievementCategoryId, boolean>
  >(() => {
    const initial = {} as Record<AchievementCategoryId, boolean>;
    ACHIEVEMENT_CATEGORIES.forEach((cat) => {
      initial[cat.id] = cat.defaultExpanded;
    });
    return initial;
  });

  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [xpPopDelta, setXpPopDelta] = useState<{ amount: number; key: number } | null>(null);

  const stats = useMemo(() => computeAchievementStats(badges), [badges]);
  const nextBadgesToEarn = useMemo(() => getNextBadgesToEarn(badges, 3), [badges]);
  const { groups, totalMatched } = useMemo(
    () => filterCategoriesAndBadges(ACHIEVEMENT_CATEGORIES, badges, searchQuery, statusFilter),
    [badges, searchQuery, statusFilter]
  );

  const selectedBadge = useMemo(
    () => badges.find((b) => b.id === selectedBadgeId) ?? null,
    [badges, selectedBadgeId]
  );

  const selectedCategory = useMemo(
    () =>
      selectedBadge
        ? ACHIEVEMENT_CATEGORIES.find((c) => c.id === selectedBadge.categoryId) ?? null
        : null,
    [selectedBadge]
  );

  const isFiltering = searchQuery.trim().length > 0 || statusFilter !== 'all';

  const allCurrentlyExpanded = useMemo(() => {
    if (groups.length === 0) return false;
    return groups.every((g) => expandedCategories[g.category.id]);
  }, [groups, expandedCategories]);

  const handleToggleExpandAll = () => {
    playUiSound('switch');
    const targetOpen = !allCurrentlyExpanded;
    const next = { ...expandedCategories };
    ACHIEVEMENT_CATEGORIES.forEach((cat) => {
      next[cat.id] = targetOpen;
    });
    setExpandedCategories(next);
  };

  const handleToggleCategory = (categoryId: AchievementCategoryId) => {
    playUiSound('click');
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleOpenBadge = (badge: AchievementBadge) => {
    playUiSound('pop');
    setIsCelebrating(false);
    setSelectedBadgeId(badge.id);
  };

  const triggerCelebration = (xpAmount?: number) => {
    setCelebrationKey((k) => k + 1);
    setIsCelebrating(true);
    if (xpAmount && xpAmount > 0) {
      setXpPopDelta({ amount: xpAmount, key: Date.now() });
      window.setTimeout(() => {
        setXpPopDelta((curr) => (curr && curr.amount === xpAmount ? null : curr));
      }, 2200);
    }
    window.setTimeout(() => {
      setIsCelebrating(false);
    }, 1150);
  };

  const handleAdvanceProgress = (badge: AchievementBadge) => {
    playUiSound('pop');
    const { badges: nextBadges, updatedBadge, readyToClaim } = advanceBadgeProgress(
      badges,
      badge.id
    );
    onUpdateBadges(nextBadges);
    if (readyToClaim && updatedBadge) {
      onNotify(`${updatedBadge.title} reached 100%! Click Claim Reward to unlock +${updatedBadge.xp} XP.`);
    } else if (updatedBadge) {
      onNotify(
        `Progress logged for ${updatedBadge.title} (${formatBadgeProgressLabel(updatedBadge)})`
      );
    }
  };

  const handleClaimReward = (badge: AchievementBadge) => {
    playUiSound('success');
    const { badges: nextBadges, xpAwarded, claimedBadge } = claimBadgeReward(
      badges,
      badge.id,
      getFormattedTodayLabel()
    );
    onUpdateBadges(nextBadges);
    triggerCelebration(xpAwarded);
    if (claimedBadge) {
      onNotify(`Badge unlocked: ${claimedBadge.title} (+${xpAwarded} XP)`);
    }
  };

  const handleStartTracking = (badge: AchievementBadge) => {
    playUiSound('switch');
    const { badges: nextBadges, updatedBadge } = startTrackingBadge(badges, badge.id);
    onUpdateBadges(nextBadges);
    if (updatedBadge) {
      onNotify(`Now tracking "${updatedBadge.title}" — added to your active milestones`);
    }
  };

  const handleTogglePin = (badge: AchievementBadge) => {
    playUiSound('click');
    const res = togglePinnedBadge(pinnedBadgeIds, badge.id, 3);
    if (res.action === 'limit_reached') {
      onNotify('You can showcase up to 3 earned badges at a time. Unpin one first.');
      return;
    }
    onUpdatePinnedBadges(res.pinnedIds);
    onNotify(
      res.action === 'pinned'
        ? `Pinned "${badge.title}" to your achievement showcase`
        : `Removed "${badge.title}" from your showcase`
    );
  };

  const handleResetFilters = () => {
    playUiSound('click');
    setSearchQuery('');
    setStatusFilter('all');
  };

  const handleKpiClick = (targetFilter: 'all' | BadgeStatus | 'xp') => {
    playUiSound('switch');
    if (targetFilter === 'xp') {
      setShowInfoPanel((prev) => !prev);
      return;
    }
    setStatusFilter((prev) => (prev === targetFilter ? 'all' : targetFilter));
    // Auto-expand categories when filtering by status so results are immediately visible
    if (targetFilter !== 'all') {
      const next = { ...expandedCategories };
      ACHIEVEMENT_CATEGORIES.forEach((cat) => {
        next[cat.id] = true;
      });
      setExpandedCategories(next);
    }
  };

  const renderBadgeTile = (
    badge: AchievementBadge,
    category: AchievementCategory,
    index: number,
    variant: 'spotlight' | 'grid'
  ) => {
    const progressPct = getBadgeProgressPercent(badge);
    const isPinned = pinnedBadgeIds.includes(badge.id);
    const isReadyToClaim =
      badge.status === 'in_progress' && badge.progressCurrent >= badge.progressTarget;

    return (
      <motion.button
        key={badge.id}
        type="button"
        onClick={() => handleOpenBadge(badge)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.24,
          delay: Math.min(index * 0.025, 0.25),
          ease: [0.16, 1, 0.3, 1],
        }}
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        aria-label={`${badge.title} (${badge.code}), ${
          badge.status === 'earned'
            ? `Earned, plus ${badge.xp} XP`
            : badge.status === 'in_progress'
            ? `In progress, ${formatBadgeProgressLabel(badge)}, plus ${badge.xp} XP`
            : `Locked, plus ${badge.xp} XP`
        }`}
        className={`group relative flex flex-col items-center text-center rounded-2xl px-3 py-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
          variant === 'spotlight'
            ? 'hover:bg-[#F3F8FD] dark:hover:bg-slate-800/70'
            : 'hover:bg-slate-50/90 dark:hover:bg-slate-800/60'
        }`}
      >
        <BadgeMedallion
          code={badge.code}
          categoryId={badge.categoryId}
          status={badge.status}
          iconKind={badge.iconKind}
          progressPercent={progressPct}
          size="md"
          isPinned={isPinned}
        />

        <span
          className={`mt-2.5 text-[13px] font-semibold leading-snug line-clamp-2 ${
            badge.status === 'locked'
              ? 'text-slate-500 dark:text-slate-400'
              : 'text-slate-800 dark:text-slate-100'
          }`}
        >
          {badge.title}
        </span>

        {/* Clean status text matching reference hierarchy */}
        <span
          className={`mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
            badge.status === 'earned'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
              : isReadyToClaim
              ? 'bg-[#EBF4FC] text-[#15629E] dark:bg-sky-950/60 dark:text-sky-300'
              : badge.status === 'in_progress'
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {badge.status === 'earned'
            ? 'Earned'
            : isReadyToClaim
            ? 'Ready to claim'
            : badge.status === 'in_progress'
            ? 'In progress'
            : 'Locked'}
        </span>

        <span
          className={`mt-1 text-[11.5px] font-bold tabular-nums ${
            badge.status === 'locked'
              ? 'text-slate-400 dark:text-slate-500'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          +{badge.xp} XP
        </span>

        {badge.status === 'earned' && badge.earnedDate && (
          <span className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-400 tabular-nums">
            {badge.earnedDate}
          </span>
        )}

        {badge.status === 'in_progress' && (
          <div className="mt-1 w-full max-w-[96px] flex flex-col items-center">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              {formatBadgeProgressLabel(badge)}
            </span>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: Math.max(0.06, progressPct / 100) }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  transformOrigin: 'left center',
                  backgroundColor: isReadyToClaim ? '#16A34A' : '#15629E',
                }}
                className="h-full w-full rounded-full"
              />
            </div>
          </div>
        )}

        {/* Subtle interactive hover underline cue without bloating vertical row spacing */}
        <span
          aria-hidden="true"
          className="mt-1 h-0.5 w-8 rounded-full opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          style={{ backgroundColor: category.accentHex }}
        />
      </motion.button>
    );
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-4 pb-8">
        {/* Top Page Title & Info Popover */}
        <section className="rounded-[20px] bg-white/95 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-5 sm:px-6 py-5 shadow-[0_6px_24px_rgba(21,98,158,0.06)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#15629E] dark:text-sky-400 shrink-0" />
                <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Achievements
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    playUiSound('click');
                    setShowInfoPanel((prev) => !prev);
                  }}
                  aria-expanded={showInfoPanel}
                  aria-label="How achievements and experience points work"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#15629E] dark:text-sky-400 hover:bg-[#EBF4FC] dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-xs sm:text-[13px] text-slate-500 dark:text-slate-400">
                Track your learning milestones, earned badges, and academic progress.
              </p>
            </div>

            {/* Quiet XP Level progress indicator (no pill sandwich, clean inline readout) */}
            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Level {stats.levelInfo.level} · {stats.levelInfo.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  {stats.levelInfo.xpToNext} XP to Level {stats.levelInfo.level + 1}
                </p>
              </div>
              <div className="w-24 h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ scaleX: Math.max(0.05, stats.levelInfo.progressPercent / 100) }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: 'left center' }}
                  className="h-full w-full rounded-full bg-gradient-to-r from-[#15629E] to-[#38BDF8]"
                />
              </div>
            </div>
          </div>

          {/* Expandable Achievements & XP Guide Panel */}
          <AnimatePresence initial={false}>
            {showInfoPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-2xl bg-[#F4F9FE] dark:bg-slate-800/80 border border-[#D4E6F7] dark:border-slate-700 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xs font-bold text-[#0B2242] dark:text-white">
                      How Badges & Experience Points (XP) Work
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                      Click any badge to inspect its unlock criteria, jump straight to the matching TutorCloud activity, or log completed study milestones. Unlocking badges awards XP toward your next Scholar Level, and you can pin up to 3 earned badges to your showcase.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                    <span className="font-semibold text-[#15629E] dark:text-sky-400">
                      {stats.totalXp} / {stats.levelInfo.nextLevelXp} XP
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowInfoPanel(false)}
                      aria-label="Close achievements guide"
                      className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4 KPI Summary Cards Row */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Available Badges */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => handleKpiClick('all')}
              aria-pressed={statusFilter === 'all'}
              data-testid="kpi-available-badges"
              className={`rounded-2xl px-4 py-3.5 text-left transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
                statusFilter === 'all'
                  ? 'bg-[#EAF1FA] dark:bg-slate-800 border-[#BBD6F2] dark:border-sky-800'
                  : 'bg-[#F0F5FC] dark:bg-slate-800/70 border-transparent hover:border-[#C5DDF5]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11.5px] font-semibold text-[#3B5B8C] dark:text-sky-300">
                    Available Badges
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-[#0B2242] dark:text-white tabular-nums">
                    {stats.total}
                  </p>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/75 dark:bg-slate-900/60 text-[#3B82F6] dark:text-sky-400">
                  <Trophy className="h-5 w-5" />
                </span>
              </div>
            </motion.button>

            {/* Earned Badges */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => handleKpiClick('earned')}
              aria-pressed={statusFilter === 'earned'}
              data-testid="kpi-earned-badges"
              className={`rounded-2xl px-4 py-3.5 text-left transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                statusFilter === 'earned'
                  ? 'bg-[#DCFCE7] dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700'
                  : 'bg-[#EBFBF1] dark:bg-emerald-950/35 border-transparent hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11.5px] font-semibold text-[#15803D] dark:text-emerald-300">
                    Earned Badges
                  </p>
                  <motion.p
                    key={`earned-${stats.earned}`}
                    initial={{ scale: 1.22, color: '#16A34A' }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                    className="mt-1 font-display text-2xl font-bold text-[#14532D] dark:text-emerald-100 tabular-nums"
                  >
                    {stats.earned}
                  </motion.p>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/75 dark:bg-slate-900/60 text-[#22C55E]">
                  <Wand2 className="h-5 w-5" />
                </span>
              </div>
            </motion.button>

            {/* Badges In Progress */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => handleKpiClick('in_progress')}
              aria-pressed={statusFilter === 'in_progress'}
              data-testid="kpi-in-progress-badges"
              className={`rounded-2xl px-4 py-3.5 text-left transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 ${
                statusFilter === 'in_progress'
                  ? 'bg-[#FEF3C7] dark:bg-amber-950/60 border-amber-400 dark:border-amber-700'
                  : 'bg-[#FFF7E8] dark:bg-amber-950/35 border-transparent hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11.5px] font-semibold text-[#C2410C] dark:text-amber-300">
                    Badges In Progress
                  </p>
                  <motion.p
                    key={`prog-${stats.inProgress}`}
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                    className="mt-1 font-display text-2xl font-bold text-[#9A3412] dark:text-amber-100 tabular-nums"
                  >
                    {stats.inProgress}
                  </motion.p>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/75 dark:bg-slate-900/60 text-[#EA580C]">
                  <TrendingUp className="h-5 w-5" />
                </span>
              </div>
            </motion.button>

            {/* Experience Points */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => handleKpiClick('xp')}
              data-testid="kpi-experience-points"
              className="relative rounded-2xl px-4 py-3.5 text-left transition-all border bg-[#EEF5FF] dark:bg-sky-950/40 border-transparent hover:border-[#93C5FD] dark:hover:border-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11.5px] font-semibold text-[#15629E] dark:text-sky-300">
                    Experience Points
                  </p>
                  <motion.p
                    key={`xp-${stats.totalXp}`}
                    initial={{ scale: 1.18 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                    className="mt-1 font-display text-2xl font-bold text-[#15629E] dark:text-sky-100 tabular-nums"
                  >
                    {stats.totalXp}
                  </motion.p>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#DCE9FF] dark:bg-sky-900/70 text-[11px] font-extrabold tracking-tight text-[#4F46E5] dark:text-sky-200">
                  XP
                </span>
              </div>

              {/* Floating +XP pop when reward is claimed */}
              <AnimatePresence>
                {xpPopDelta && (
                  <motion.span
                    key={xpPopDelta.key}
                    initial={{ opacity: 0, y: 10, scale: 0.85 }}
                    animate={{ opacity: 1, y: -14, scale: 1 }}
                    exit={{ opacity: 0, y: -26 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="pointer-events-none absolute top-2 right-12 rounded-lg bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-md tabular-nums"
                  >
                    +{xpPopDelta.amount} XP
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </section>

        {/* Search, Filter & Expand All Toolbar */}
        <section
          aria-label="Filter achievements"
          className="rounded-[18px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-3 shadow-[0_4px_16px_rgba(21,98,158,0.05)] flex flex-col md:flex-row md:items-center gap-3"
        >
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search badges by name or category..."
              aria-label="Search badges by name or category"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 pl-10 pr-9 py-2 text-xs sm:text-[13px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#15629E] focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear badge search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative flex items-center">
              <Filter className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | BadgeStatus)}
                aria-label="Filter badges by status"
                className="appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-8 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#15629E] focus:outline-none cursor-pointer"
              >
                <option value="all">All Badges</option>
                <option value="earned">Earned ({stats.earned})</option>
                <option value="in_progress">In Progress ({stats.inProgress})</option>
                <option value="locked">Locked ({stats.locked})</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-500" />
            </div>

            <button
              type="button"
              onClick={handleToggleExpandAll}
              className="bencho-press inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
            >
              {allCurrentlyExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Collapse All
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Expand All
                </>
              )}
            </button>
          </div>
        </section>

        {/* Next badges to earn Spotlight Card */}
        {!isFiltering && nextBadgesToEarn.length > 0 && (
          <section
            aria-labelledby="next-badges-heading"
            data-testid="next-badges-spotlight"
            className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-5 sm:px-6 py-5 shadow-[0_6px_24px_rgba(21,98,158,0.06)]"
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2
                id="next-badges-heading"
                className="font-display text-sm font-bold text-slate-900 dark:text-white"
              >
                Next badges to earn
              </h2>
              <span className="text-[11.5px] text-slate-500 dark:text-slate-400">
                Click any badge to log progress & claim XP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {nextBadgesToEarn.map((badge, idx) => {
                const cat =
                  ACHIEVEMENT_CATEGORIES.find((c) => c.id === badge.categoryId) ??
                  ACHIEVEMENT_CATEGORIES[0];
                return renderBadgeTile(badge, cat, idx, 'spotlight');
              })}
            </div>
          </section>
        )}

        {/* Active Filter Summary or Empty State */}
        {isFiltering && totalMatched === 0 ? (
          <section className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-6 py-12 text-center shadow-[0_6px_24px_rgba(21,98,158,0.05)]">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF4FC] dark:bg-slate-800 text-[#15629E] dark:text-sky-400">
              <Award className="h-6 w-6" />
            </div>
            <h2 className="mt-3 font-display text-base font-bold text-slate-900 dark:text-white">
              No matching badges found
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Try a different badge name, category code (like LJ or PM), or clear your status filter.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="bencho-press mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#15629E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#104E7E] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          </section>
        ) : (
          /* 9 Expandable Achievement Categories */
          <div className="space-y-4">
            {groups.map(({ category, badges: categoryBadges, totalInCategory, earnedInCategory }) => {
              const isExpanded = isFiltering ? true : Boolean(expandedCategories[category.id]);

              return (
                <section
                  key={category.id}
                  data-testid={`category-card-${category.id}`}
                  className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_6px_22px_rgba(21,98,158,0.05)] overflow-hidden"
                >
                  {/* Category Accordion Header */}
                  <button
                    type="button"
                    onClick={() => handleToggleCategory(category.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`category-panel-${category.id}`}
                    className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#15629E]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-xs"
                        style={{ backgroundColor: category.iconBgHex }}
                        aria-hidden="true"
                      >
                        {renderCategoryIcon(category.id)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white">
                            {category.name}
                          </h2>
                          <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                            {category.id}
                          </span>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                            ·
                          </span>
                          <span
                            className={`text-[11.5px] font-semibold tabular-nums ${
                              earnedInCategory > 0
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {earnedInCategory}/{totalInCategory} Earned
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <motion.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 dark:text-slate-400"
                      aria-hidden="true"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </button>

                  {/* Category Badge Grid */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        id={`category-panel-${category.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
                      >
                        <div className="px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-3">
                          {categoryBadges.map((badge, idx) =>
                            renderBadgeTile(badge, category, idx, 'grid')
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              );
            })}
          </div>
        )}

        {/* Interactive Badge Detail & Reward Unlock Studio Modal */}
        <AnimatePresence>
          {selectedBadge && selectedCategory && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="badge-modal-title"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              {/* Backdrop (crisp scrim without full-screen blur for silky 60fps unlock motion) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setSelectedBadgeId(null)}
                className="fixed inset-0 bg-slate-950/55"
                aria-hidden="true"
              />

              {/* Modal Surface */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="relative z-10 w-full max-w-md rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
              >
                {/* Top visual showcase stage */}
                <div className="relative flex flex-col items-center pt-7 pb-5 px-6 bg-gradient-to-b from-[#EDF5FD] via-[#F6FAFF] to-white dark:from-slate-800 dark:via-slate-850 dark:to-slate-900">
                  <button
                    type="button"
                    onClick={() => setSelectedBadgeId(null)}
                    aria-label="Close badge details"
                    className="absolute top-3.5 right-3.5 rounded-xl p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Compositor-only GPU confetti burst on unlock */}
                  <div className="relative flex items-center justify-center">
                    <AnimatePresence>
                      {isCelebrating &&
                        CONFETTI_PARTICLES.map((particle, idx) => (
                          <motion.span
                            key={`${celebrationKey}-${idx}`}
                            aria-hidden="true"
                            initial={{ x: 0, y: 0, scale: 0.2, opacity: 1, rotate: 0 }}
                            animate={{
                              x: particle.x,
                              y: particle.y,
                              scale: [0.3, 1.15, 0.85],
                              opacity: [1, 1, 0],
                              rotate: particle.rotate,
                            }}
                            transition={{
                              duration: 0.85,
                              delay: particle.delay,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            style={{ backgroundColor: particle.color }}
                            className="pointer-events-none absolute h-2.5 w-2.5 rounded-sm"
                          />
                        ))}
                    </AnimatePresence>

                    <BadgeMedallion
                      code={selectedBadge.code}
                      categoryId={selectedBadge.categoryId}
                      status={selectedBadge.status}
                      iconKind={selectedBadge.iconKind}
                      progressPercent={getBadgeProgressPercent(selectedBadge)}
                      size="lg"
                      isPinned={pinnedBadgeIds.includes(selectedBadge.id)}
                      interactiveTilt
                      celebrating={isCelebrating}
                    />
                  </div>

                  <p className="mt-3 text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">
                    {selectedCategory.name} · {selectedBadge.code}
                  </p>
                  <h2
                    id="badge-modal-title"
                    className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white text-center"
                  >
                    {selectedBadge.title}
                  </h2>
                  <div className="mt-1.5 flex items-center gap-2 text-xs font-semibold">
                    <span
                      className={
                        selectedBadge.status === 'earned'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : selectedBadge.status === 'in_progress'
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                    >
                      {selectedBadge.status === 'earned'
                        ? `Earned${selectedBadge.earnedDate ? ` · ${selectedBadge.earnedDate}` : ''}`
                        : selectedBadge.status === 'in_progress'
                        ? 'In Progress'
                        : 'Locked'}
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                      ·
                    </span>
                    <span className="text-[#15629E] dark:text-sky-400 tabular-nums">
                      +{selectedBadge.xp} XP Reward
                    </span>
                  </div>
                </div>

                {/* Body details & interactive engagement actions */}
                <div className="px-6 pb-6 pt-2 space-y-4">
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed text-center">
                    {selectedBadge.description}
                  </p>

                  {/* Requirement & animated progress meter */}
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        Unlock Requirement
                      </span>
                      <span className="font-bold text-[#15629E] dark:text-sky-400 tabular-nums">
                        {selectedBadge.status === 'earned'
                          ? '100% Complete'
                          : `${formatBadgeProgressLabel(selectedBadge)} (${getBadgeProgressPercent(
                              selectedBadge
                            )}%)`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedBadge.requirement}
                    </p>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <motion.div
                        initial={false}
                        animate={{
                          scaleX:
                            selectedBadge.status === 'earned'
                              ? 1
                              : Math.max(0.03, getBadgeProgressPercent(selectedBadge) / 100),
                        }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        style={{ transformOrigin: 'left center' }}
                        className={`h-full w-full rounded-full ${
                          selectedBadge.status === 'earned' ||
                          selectedBadge.progressCurrent >= selectedBadge.progressTarget
                            ? 'bg-emerald-500'
                            : 'bg-[#15629E]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Action Buttons tailored to badge state */}
                  {selectedBadge.status === 'earned' ? (
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(selectedBadge)}
                        className="bencho-press flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#15629E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#104E7E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
                      >
                        {pinnedBadgeIds.includes(selectedBadge.id) ? (
                          <>
                            <PinOff className="h-3.5 w-3.5" />
                            Unpin from Showcase
                          </>
                        ) : (
                          <>
                            <Pin className="h-3.5 w-3.5" />
                            Pin to Showcase
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playUiSound('success');
                          triggerCelebration();
                        }}
                        className="bencho-press inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Replay Celebration
                      </button>
                    </div>
                  ) : selectedBadge.status === 'in_progress' ? (
                    <div className="space-y-2.5">
                      {selectedBadge.progressCurrent >= selectedBadge.progressTarget ? (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleClaimReward(selectedBadge)}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Claim +{selectedBadge.xp} XP Reward
                        </motion.button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAdvanceProgress(selectedBadge)}
                          className="bencho-press w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#15629E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#104E7E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          Log Activity Progress (+{selectedBadge.stepDelta})
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          playUiSound('switch');
                          setSelectedBadgeId(null);
                          onNavigateToActivity(selectedBadge.activitySection);
                        }}
                        className="bencho-press w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        {selectedBadge.activityLabel}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => handleStartTracking(selectedBadge)}
                        className="bencho-press w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#15629E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#104E7E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Start Tracking This Badge
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playUiSound('switch');
                          setSelectedBadgeId(null);
                          onNavigateToActivity(selectedBadge.activitySection);
                        }}
                        className="bencho-press w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        {selectedBadge.activityLabel}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};
