import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACHIEVEMENT_CATEGORIES,
  INITIAL_ACHIEVEMENT_BADGES,
  advanceBadgeProgress,
  claimBadgeReward,
  computeAchievementStats,
  computeXpLevel,
  filterCategoriesAndBadges,
  formatBadgeProgressLabel,
  getNextBadgesToEarn,
  startTrackingBadge,
  togglePinnedBadge,
} from './achievementsLogic';

test('initial achievement seed matches exact reference KPI counts (50 total, 6 earned, 7 in progress, 415 XP)', () => {
  const stats = computeAchievementStats(INITIAL_ACHIEVEMENT_BADGES);
  assert.equal(ACHIEVEMENT_CATEGORIES.length, 9);
  assert.equal(stats.total, 50);
  assert.equal(stats.earned, 6);
  assert.equal(stats.inProgress, 7);
  assert.equal(stats.locked, 37);
  assert.equal(stats.totalXp, 415);
  assert.equal(stats.levelInfo.level, 3);
  assert.equal(stats.levelInfo.title, 'Rising Scholar');
});

test('getNextBadgesToEarn returns Learning Voyager, Practice Navigator, and Learning Centurion in order initially', () => {
  const nextThree = getNextBadgesToEarn(INITIAL_ACHIEVEMENT_BADGES, 3);
  assert.deepEqual(
    nextThree.map((b) => b.title),
    ['Learning Voyager', 'Practice Navigator', 'Learning Centurion']
  );
  assert.equal(formatBadgeProgressLabel(nextThree[0]), '37/50');
  assert.equal(formatBadgeProgressLabel(nextThree[1]), '29/50');
  assert.equal(formatBadgeProgressLabel(nextThree[2]), '37%');
});

test('filterCategoriesAndBadges filters accurately by search query and status', () => {
  const earnedOnly = filterCategoriesAndBadges(
    ACHIEVEMENT_CATEGORIES,
    INITIAL_ACHIEVEMENT_BADGES,
    '',
    'earned'
  );
  assert.equal(earnedOnly.totalMatched, 6);
  assert.equal(earnedOnly.groups.length, 2);

  const quizQuery = filterCategoriesAndBadges(
    ACHIEVEMENT_CATEGORIES,
    INITIAL_ACHIEVEMENT_BADGES,
    'Quiz',
    'all'
  );
  assert.equal(quizQuery.totalMatched, 3);
  assert.equal(quizQuery.groups[0].category.id, 'PM');

  const categoryQuery = filterCategoriesAndBadges(
    ACHIEVEMENT_CATEGORIES,
    INITIAL_ACHIEVEMENT_BADGES,
    'Consistency',
    'all'
  );
  assert.equal(categoryQuery.groups.length, 1);
  assert.equal(categoryQuery.totalMatched, 6);
});

test('advanceBadgeProgress and claimBadgeReward unlock badge, award XP, and update KPIs', () => {
  // Learning Voyager starts at 37/50 (+125 XP)
  const step1 = advanceBadgeProgress(INITIAL_ACHIEVEMENT_BADGES, 'LJ-04', 10);
  assert.equal(step1.updatedBadge?.progressCurrent, 47);
  assert.equal(step1.readyToClaim, false);

  const step2 = advanceBadgeProgress(step1.badges, 'LJ-04', 5);
  assert.equal(step2.updatedBadge?.progressCurrent, 50);
  assert.equal(step2.readyToClaim, true);

  const claimed = claimBadgeReward(step2.badges, 'LJ-04', 'Nov 22, 2026');
  assert.equal(claimed.xpAwarded, 125);
  assert.equal(claimed.claimedBadge?.status, 'earned');
  assert.equal(claimed.claimedBadge?.earnedDate, 'Nov 22, 2026');

  const updatedStats = computeAchievementStats(claimed.badges);
  assert.equal(updatedStats.earned, 7);
  assert.equal(updatedStats.inProgress, 6);
  assert.equal(updatedStats.totalXp, 540);

  // Next badges to earn automatically promotes the next closest in-progress badge
  const nextThree = getNextBadgesToEarn(claimed.badges, 3);
  assert.ok(!nextThree.some((b) => b.id === 'LJ-04'));
  assert.equal(nextThree[0].title, 'Practice Navigator');
});

test('startTrackingBadge transitions a locked badge into in_progress cleanly', () => {
  const res = startTrackingBadge(INITIAL_ACHIEVEMENT_BADGES, 'LJ-11');
  assert.equal(res.updatedBadge?.status, 'in_progress');
  const stats = computeAchievementStats(res.badges);
  assert.equal(stats.inProgress, 8);
  assert.equal(stats.locked, 36);
});

test('togglePinnedBadge enforces a maximum of 3 pinned badges and supports unpinning', () => {
  const r1 = togglePinnedBadge(['LJ-01', 'LJ-02'], 'LJ-03', 3);
  assert.equal(r1.action, 'pinned');
  assert.equal(r1.pinnedIds.length, 3);

  const r2 = togglePinnedBadge(r1.pinnedIds, 'PM-01', 3);
  assert.equal(r2.action, 'limit_reached');
  assert.equal(r2.pinnedIds.length, 3);

  const r3 = togglePinnedBadge(r1.pinnedIds, 'LJ-02', 3);
  assert.equal(r3.action, 'unpinned');
  assert.deepEqual(r3.pinnedIds, ['LJ-01', 'LJ-03']);
});

test('computeXpLevel handles progression across tiers cleanly', () => {
  const lvl1 = computeXpLevel(0);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.progressPercent, 0);

  const lvl4 = computeXpLevel(850);
  assert.equal(lvl4.level, 4);
  assert.equal(lvl4.title, 'Concept Voyager');
  assert.equal(lvl4.xpToNext, 250);
});
