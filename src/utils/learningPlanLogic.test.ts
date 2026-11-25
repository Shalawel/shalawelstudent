import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_LEARNING_PLAN_LESSONS,
  LEARNING_PLAN_SUBJECTS,
  computeLearningPlanOverview,
  createRequestedTopicLesson,
  filterLearningPlanLessons,
  markLessonHasNotes,
  markLessonStarted,
  recordLessonPracticeProgress,
  validateTopicRequest,
} from './learningPlanLogic';

test('exposes all five subjects matching the Learning Plan design', () => {
  assert.deepEqual(LEARNING_PLAN_SUBJECTS, [
    'English',
    'Mathematics',
    'Science',
    'Social Science',
    'Social Studies',
  ]);
});

test('computes initial English Concept Mastery overview matching reference metrics', () => {
  const overview = computeLearningPlanOverview(
    INITIAL_LEARNING_PLAN_LESSONS,
    'English',
    'concept-mastery'
  );
  assert.equal(overview.masteredCount, 4);
  assert.equal(overview.totalCurriculumLessons, 199);
  assert.equal(overview.inProgressCount, 3);
  assert.equal(overview.overallMasteryPercent, 50);
  assert.equal(overview.lessonsCompletedPercent, 2);
});

test('filters lessons accurately by subject and mode', () => {
  const engConcept = filterLearningPlanLessons(
    INITIAL_LEARNING_PLAN_LESSONS,
    'English',
    'concept-mastery'
  );
  assert.equal(engConcept[0].title, 'Parts of Speech in Context');
  assert.equal(engConcept[0].status, 'Mastered');
  assert.equal(engConcept[1].title, 'Tenses and Consistency');
  assert.equal(engConcept[2].title, 'Subject-Verb Agreement (Including Compound Subjects)');

  const engTestPrep = filterLearningPlanLessons(
    INITIAL_LEARNING_PLAN_LESSONS,
    'English',
    'test-prep'
  );
  assert.ok(engTestPrep.length >= 2);
  assert.ok(engTestPrep.every((l) => l.mode === 'test-prep' && l.subject === 'English'));
});

test('validates and creates a requested topic lesson cleanly', () => {
  assert.ok(
    validateTopicRequest({
      subject: 'English',
      mode: 'concept-mastery',
      title: 'Hi',
      category: 'Grammar',
      note: '',
    })
  );

  assert.equal(
    validateTopicRequest({
      subject: 'English',
      mode: 'concept-mastery',
      title: 'Parallel Structure in Essays',
      category: 'Grammar & Language',
      note: 'Need extra examples for my Friday essay.',
    }),
    null
  );

  const created = createRequestedTopicLesson({
    subject: 'English',
    mode: 'concept-mastery',
    title: 'Parallel Structure in Essays',
    category: 'Grammar & Language',
    note: 'Need extra examples for my Friday essay.',
  });
  assert.equal(created.sourceTag, 'Requested Topic');
  assert.equal(created.status, 'Not Started');
  assert.equal(created.masteryPercent, 0);
});

test('starting and mastering lessons updates lesson state and overall metrics', () => {
  const started = markLessonStarted(INITIAL_LEARNING_PLAN_LESSONS, 'plan-eng-cm-2');
  const targetStarted = started.find((l) => l.id === 'plan-eng-cm-2');
  assert.equal(targetStarted?.status, 'In Progress');
  assert.ok((targetStarted?.masteryPercent ?? 0) >= 20);

  const mastered = recordLessonPracticeProgress(started, 'plan-eng-cm-2', 90);
  const targetMastered = mastered.find((l) => l.id === 'plan-eng-cm-2');
  assert.equal(targetMastered?.status, 'Mastered');
  assert.equal(targetMastered?.masteryPercent, 90);

  const updatedOverview = computeLearningPlanOverview(mastered, 'English', 'concept-mastery');
  assert.equal(updatedOverview.masteredCount, 5);
  assert.ok(updatedOverview.overallMasteryPercent > 50);
});

test('marks lesson hasNotes true when a matching note is saved', () => {
  const updated = markLessonHasNotes(
    INITIAL_LEARNING_PLAN_LESSONS,
    'English',
    'Tenses and Consistency'
  );
  const target = updated.find((l) => l.id === 'plan-eng-cm-2');
  assert.equal(target?.hasNotes, true);
});
