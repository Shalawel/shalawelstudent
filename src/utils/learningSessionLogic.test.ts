import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_ARCHIVED_PLANS,
  INITIAL_LEARNING_PATH_LESSONS,
  addLessonToPath,
  archiveSubjectPlan,
  buildSessionAnalysisReport,
  computeSubjectPathSummary,
  filterAnalysisQuestions,
  formatTwoDigitCount,
  reorderLessonInList,
  unarchivePlan,
  validateNewTopicInput,
} from './learningSessionLogic';

test('computeSubjectPathSummary accurately calculates counts, mastery average, and completion percent', () => {
  const mathLessons = INITIAL_LEARNING_PATH_LESSONS.filter(
    (l) => l.subject === 'Mathematics' && l.trackMode === 'Concept Mastery'
  );
  const summary = computeSubjectPathSummary(mathLessons);
  assert.equal(summary.totalCount, 3);
  assert.equal(summary.completedCount, 1);
  assert.equal(summary.inProgressCount, 2);
  assert.equal(summary.completionPercent, 33);
  assert.equal(summary.overallMastery, 80);

  const emptySummary = computeSubjectPathSummary([]);
  assert.equal(emptySummary.totalCount, 0);
  assert.equal(emptySummary.overallMastery, 0);
});

test('reorderLessonInList swaps sibling lessons within same subject and track without mutating boundaries', () => {
  const mathBefore = INITIAL_LEARNING_PATH_LESSONS.filter(
    (l) => l.subject === 'Mathematics' && l.trackMode === 'Concept Mastery'
  );
  const firstId = mathBefore[0].id;
  const secondId = mathBefore[1].id;

  // Moving first item up is a no-op
  const afterUp = reorderLessonInList(INITIAL_LEARNING_PATH_LESSONS, firstId, 'up');
  const mathAfterUp = afterUp.filter(
    (l) => l.subject === 'Mathematics' && l.trackMode === 'Concept Mastery'
  );
  assert.equal(mathAfterUp[0].id, firstId);

  // Moving first item down swaps with second item
  const afterDown = reorderLessonInList(INITIAL_LEARNING_PATH_LESSONS, firstId, 'down');
  const mathAfterDown = afterDown.filter(
    (l) => l.subject === 'Mathematics' && l.trackMode === 'Concept Mastery'
  );
  assert.equal(mathAfterDown[0].id, secondId);
  assert.equal(mathAfterDown[1].id, firstId);
});

test('validateNewTopicInput rejects blank fields and addLessonToPath appends custom topic cleanly', () => {
  assert.ok(validateNewTopicInput('', 'Algebra'));
  assert.ok(validateNewTopicInput('Quadratic Equations', ''));
  assert.equal(validateNewTopicInput('Quadratic Systems Review', 'Algebra & Functions'), null);

  const updated = addLessonToPath(INITIAL_LEARNING_PATH_LESSONS, {
    subject: 'Mathematics',
    trackMode: 'Concept Mastery',
    title: 'Quadratic Systems Review',
    domain: 'Algebra & Functions',
  });
  assert.equal(updated.length, INITIAL_LEARNING_PATH_LESSONS.length + 1);
  const last = updated[updated.length - 1];
  assert.equal(last.title, 'Quadratic Systems Review');
  assert.equal(last.sourceLabel, 'Custom Topic');
  assert.equal(last.status, 'Not Started');
});

test('archiveSubjectPlan hides active track lessons and unarchivePlan restores them cleanly', () => {
  const initialState = {
    lessons: INITIAL_LEARNING_PATH_LESSONS,
    archivedPlans: INITIAL_ARCHIVED_PLANS,
  };

  const afterArchive = archiveSubjectPlan(initialState, 'Science', 'Concept Mastery');
  const remainingSci = afterArchive.lessons.filter(
    (l) => l.subject === 'Science' && l.trackMode === 'Concept Mastery'
  );
  assert.equal(remainingSci.length, 0);
  assert.equal(afterArchive.archivedPlans.length, initialState.archivedPlans.length + 1);

  const archivedId = afterArchive.archivedPlans[0].id;
  const afterRestore = unarchivePlan(afterArchive, archivedId);
  const restoredSci = afterRestore.lessons.filter(
    (l) => l.subject === 'Science' && l.trackMode === 'Concept Mastery'
  );
  assert.equal(restoredSci.length, 2);
  assert.equal(afterRestore.archivedPlans.length, initialState.archivedPlans.length);
});

test('buildSessionAnalysisReport produces accurate 5-question math report, two-digit formatting, and working question filter', () => {
  const mathLesson = INITIAL_LEARNING_PATH_LESSONS.find((l) => l.id === 'lp-math-1')!;
  const report = buildSessionAnalysisReport(mathLesson);

  assert.equal(report.totalQuestions, 5);
  assert.equal(report.correctAnswers, 4);
  assert.equal(report.accuracyPercent, 80);
  assert.equal(formatTwoDigitCount(report.correctAnswers), '04');
  assert.equal(formatTwoDigitCount(report.totalQuestions), '05');
  assert.equal(report.recommendations.length, 4);

  const correctOnly = filterAnalysisQuestions(report.questions, 'correct');
  const needsReviewOnly = filterAnalysisQuestions(report.questions, 'needs-review');
  assert.equal(correctOnly.length, 4);
  assert.equal(needsReviewOnly.length, 1);
  assert.equal(needsReviewOnly[0].status, 'Unanswered');
});
