import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_TARGET_GOALS,
  buildExportReportText,
  buildProgressCoachingMessage,
  computeWeeklyKpis,
  filterStrengthsAndNeeds,
  getGrowthBarData,
  getWeeklyLineSeries,
  incrementTargetGoalProgress,
  validateShareEmail,
} from './learningProgressLogic';

test('computeWeeklyKpis respects subject, timeframe, activity filters and live app state', () => {
  const defaultKpi = computeWeeklyKpis({
    subject: 'All Subjects',
    timeframe: 'This Month',
    activity: 'All Activities',
    liveStreakDays: 3,
    liveCompletedQuizzes: 2,
    livePlanCompletionPercent: 72,
  });
  assert.equal(defaultKpi.currentStreakDays, 3);
  assert.equal(defaultKpi.quizzesCount, 3);
  assert.equal(defaultKpi.completionRate, 72);
  assert.ok(defaultKpi.tutorSessions > 0);

  const quizzesOnly = computeWeeklyKpis({
    subject: 'Mathematics',
    timeframe: 'This Month',
    activity: 'Quizzes',
    liveStreakDays: 3,
    liveCompletedQuizzes: 2,
    livePlanCompletionPercent: 72,
  });
  assert.equal(quizzesOnly.tutorSessions, 0);
  assert.equal(quizzesOnly.practiceSets, 0);
  assert.equal(quizzesOnly.homeworkCount, 0);
  assert.ok(quizzesOnly.quizzesCount >= 1);
});

test('getGrowthBarData supports monthly (12), subject (6), and weekly (7) modes accurately', () => {
  const monthly = getGrowthBarData({
    subject: 'All Subjects',
    timeframe: 'This Month',
    activity: 'All Activities',
    viewMode: 'monthly',
  });
  assert.equal(monthly.length, 12);
  assert.equal(monthly[5].label, 'Jun');
  assert.equal(monthly[5].mastery, 88);
  assert.equal(monthly[5].highlighted, true);

  const bySubject = getGrowthBarData({
    subject: 'All Subjects',
    timeframe: 'This Month',
    activity: 'All Activities',
    viewMode: 'subject',
  });
  assert.equal(bySubject.length, 6);
  assert.equal(bySubject[0].label, 'Math');

  const weekly = getGrowthBarData({
    subject: 'Mathematics',
    timeframe: 'This Week',
    activity: 'All Activities',
    viewMode: 'weekly',
  });
  assert.equal(weekly.length, 7);
  assert.equal(weekly[0].label, 'Mon');
});

test('getWeeklyLineSeries returns 8 weeks with bounded mastery, prediction, and class average values', () => {
  const series = getWeeklyLineSeries({
    subject: 'Mathematics',
    activity: 'Tutor Sessions',
  });
  assert.equal(series.length, 8);
  assert.equal(series[0].week, 'Week 1');
  assert.equal(series[7].week, 'Week 8');
  for (const pt of series) {
    assert.ok(pt.yourMastery >= 12 && pt.yourMastery <= 100);
    assert.ok(pt.aiPrediction >= 12 && pt.aiPrediction <= 100);
    assert.ok(pt.classAverage >= 12 && pt.classAverage <= 100);
  }
});

test('filterStrengthsAndNeeds filters items cleanly by subject', () => {
  const all = filterStrengthsAndNeeds('All Subjects');
  assert.equal(all.strengths.length, 2);
  assert.equal(all.needs.length, 2);
  assert.equal(all.strengths[0].title, 'Algebraic Reasoning');
  assert.equal(all.needs[0].title, 'Writing Structure (MLA)');

  const mathOnly = filterStrengthsAndNeeds('Mathematics');
  assert.equal(mathOnly.strengths[0].subject, 'Mathematics');
  assert.equal(mathOnly.needs[0].subject, 'Mathematics');
});

test('incrementTargetGoalProgress clamps at 100% and updates completion copy', () => {
  const step1 = incrementTargetGoalProgress(INITIAL_TARGET_GOALS, 'tg-math-curriculum', 5);
  assert.equal(step1.updatedGoal?.progress, 90);

  const step2 = incrementTargetGoalProgress(step1.goals, 'tg-math-curriculum', 20);
  assert.equal(step2.updatedGoal?.progress, 100);
  assert.ok(step2.updatedGoal?.metaText.includes('Target reached'));
});

test('buildProgressCoachingMessage, buildExportReportText, and validateShareEmail work deterministically', () => {
  const lowMsg = buildProgressCoachingMessage({
    averageAccuracy: 64,
    timeframe: 'This Week',
    subject: 'English',
  });
  assert.ok(lowMsg.includes('64%'));
  assert.ok(lowMsg.includes('above 80%'));

  const highMsg = buildProgressCoachingMessage({
    averageAccuracy: 86,
    timeframe: 'This Month',
    subject: 'All Subjects',
  });
  assert.ok(highMsg.includes('86%'));
  assert.ok(highMsg.includes('on track'));

  assert.equal(validateShareEmail(''), 'Please enter a recipient email address.');
  assert.equal(
    validateShareEmail('bad-email'),
    'Please enter a valid email address (e.g. parent@example.com).'
  );
  assert.equal(validateShareEmail('john.carter@example.com'), null);

  const report = buildExportReportText({
    studentName: 'Jane Carter',
    grade: '9',
    subject: 'All Subjects',
    timeframe: 'This Month',
    activity: 'All Activities',
    kpis: computeWeeklyKpis({
      subject: 'All Subjects',
      timeframe: 'This Month',
      activity: 'All Activities',
      liveStreakDays: 2,
      liveCompletedQuizzes: 1,
      livePlanCompletionPercent: 68,
    }),
    averageMastery: 76,
    strengths: filterStrengthsAndNeeds('All Subjects').strengths,
    needs: filterStrengthsAndNeeds('All Subjects').needs,
    goals: INITIAL_TARGET_GOALS,
    exportedAt: 'Nov 22, 2026 at 11:50 PM',
  });
  assert.ok(report.includes('TUTORCLOUD LEARNING PROGRESS REPORT'));
  assert.ok(report.includes('Jane Carter'));
  assert.ok(report.includes('Algebraic Reasoning'));
  assert.ok(report.includes('Writing Structure (MLA)'));
});
