import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_PAST_ACTIVITIES,
  INITIAL_REVISIT_CONCEPTS,
  INITIAL_SAVED_PRACTICE,
  INITIAL_TEACHER_ASSIGNMENTS,
  buildSummaryForItem,
  computeWeeklyPracticeAverage,
  filterPastActivities,
  filterRevisitConcepts,
  filterSavedPractice,
  filterTeacherAssignments,
  recordCompletedPracticeAttempt,
} from './readinessPracticeLogic';

test('global subject and status filters narrow saved practice and revisit concepts accurately', () => {
  const mathSaved = filterSavedPractice(
    INITIAL_SAVED_PRACTICE,
    'Mathematics',
    'All Status'
  );
  assert.equal(mathSaved.length, 1);
  assert.equal(mathSaved[0].subject, 'Mathematics');

  const completedSaved = filterSavedPractice(
    INITIAL_SAVED_PRACTICE,
    'All Subjects',
    'Completed'
  );
  assert.equal(completedSaved.length, 0);

  const englishRevisit = filterRevisitConcepts(
    INITIAL_REVISIT_CONCEPTS,
    'English',
    'Needs Review (<80%)'
  );
  assert.equal(englishRevisit.length, 1);
  assert.equal(englishRevisit[0].subject, 'English');
  assert.ok(englishRevisit[0].accuracyPercent < 80);
});

test('teacher assignment filter splits active vs completed and respects Needs Review status', () => {
  const defaultRes = filterTeacherAssignments(
    INITIAL_TEACHER_ASSIGNMENTS,
    'All Subjects',
    'All Status'
  );
  assert.equal(defaultRes.active.length, 0);
  assert.equal(defaultRes.completed.length, 1);
  assert.equal(defaultRes.completed[0].title, 'Readiness Check - English');

  const needsReviewRes = filterTeacherAssignments(
    INITIAL_TEACHER_ASSIGNMENTS,
    'All Subjects',
    'Needs Review (<80%)'
  );
  // Seed English readiness check has 86% accuracy, so excluded from <80% filter
  assert.equal(needsReviewRes.completed.length, 0);
});

test('past activity filter combines local subject override, activity type, and status', () => {
  const onlyQuizzes = filterPastActivities(
    INITIAL_PAST_ACTIVITIES,
    'All Subjects',
    'All Subjects',
    'Quiz',
    'All Status'
  );
  assert.equal(onlyQuizzes.length, 2);
  assert.ok(onlyQuizzes.every((a) => a.activityType === 'Quiz'));

  // Local subject filter overrides global "All Subjects"
  const mathOnly = filterPastActivities(
    INITIAL_PAST_ACTIVITIES,
    'All Subjects',
    'Mathematics',
    'All activity Types',
    'Needs Review (<80%)'
  );
  assert.equal(mathOnly.length, 2);
  assert.ok(mathOnly.every((a) => a.subject === 'Mathematics' && a.accuracyPercent < 80));
});

test('computeWeeklyPracticeAverage formats badge coaching message below and at 80%', () => {
  const lowStats = computeWeeklyPracticeAverage(INITIAL_PAST_ACTIVITIES);
  assert.equal(lowStats.badgeUnlocked, false);
  assert.match(lowStats.bannerMessage, /Keep it above 80% to earn your Consistency Badge/);

  const highStats = computeWeeklyPracticeAverage([
    {
      id: 'p1',
      title: 'Algebra Mastery',
      subject: 'Mathematics',
      activityType: 'Quiz',
      dateLabel: 'Today',
      accuracyPercent: 90,
      durationLabel: '2 min',
      statusNote: 'Mastery Reached',
    },
    {
      id: 'p2',
      title: 'Essay Analysis',
      subject: 'English',
      activityType: 'Practice',
      dateLabel: 'Today',
      accuracyPercent: 84,
      durationLabel: '3 min',
      statusNote: 'Mastery Reached',
    },
  ]);
  assert.equal(highStats.averageAccuracy, 87);
  assert.equal(highStats.badgeUnlocked, true);
  assert.match(highStats.bannerMessage, /above the 80% Consistency Badge target/);
});

test('recordCompletedPracticeAttempt removes finished saved item, graduates >=80% revisit concept, and prepends history', () => {
  const initialState = {
    savedPractice: INITIAL_SAVED_PRACTICE,
    revisitConcepts: INITIAL_REVISIT_CONCEPTS,
    pastActivities: INITIAL_PAST_ACTIVITIES,
  };

  // Completing the saved Mathematics linear equalities topic with 90%
  const afterSaved = recordCompletedPracticeAttempt(initialState, {
    subject: 'Mathematics',
    topic: 'Solving Linear Equalities in One Variable - Part 2',
    score: 90,
    activityType: 'Practice',
  });
  assert.equal(afterSaved.savedPractice.length, initialState.savedPractice.length - 1);
  assert.equal(afterSaved.pastActivities[0].accuracyPercent, 90);
  assert.equal(afterSaved.pastActivities[0].statusNote, 'Mastery Reached');

  // Retrying a weak concept and scoring 85% graduates it out of Concepts You Should Revisit
  const afterGraduate = recordCompletedPracticeAttempt(afterSaved, {
    subject: 'Mathematics',
    topic: 'Evaluating the Validity of Number System Arguments',
    score: 85,
    activityType: 'Practice',
  });
  assert.equal(
    afterGraduate.revisitConcepts.some(
      (c) => c.title === 'Evaluating the Validity of Number System Arguments'
    ),
    false
  );
});

test('buildSummaryForItem generates subject-specific questions and accuracy-aware tutor tip', () => {
  const mathSummary = buildSummaryForItem({
    id: 'sum-1',
    title: 'Evaluating the Validity of Number System Arguments',
    subject: 'Mathematics',
    activityType: 'Practice',
    dateLabel: 'Jun 19',
    accuracyPercent: 60,
  });
  assert.equal(mathSummary.questions.length, 3);
  assert.match(mathSummary.tutorTip, /lift accuracy above 80%/);

  const engSummary = buildSummaryForItem({
    id: 'sum-2',
    title: 'Readiness Check - English',
    subject: 'English',
    activityType: 'Readiness',
    dateLabel: 'Jul 06',
    accuracyPercent: 86,
  });
  assert.equal(engSummary.questions.length, 3);
  assert.match(engSummary.tutorTip, /Great mastery in English/);
});
