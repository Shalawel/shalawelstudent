import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceStreak,
  buildIlpModuleFromGeneration,
  buildSessionOpeningPrompt,
  calculateQuizResult,
  computeProfileCompletion,
  createGoal,
  formatReadableDate,
  getActiveDashboardGoals,
  getDashboardVisibleActions,
  groupSessionsByStatus,
  markActionIlpCompleted,
  markActionIlpInProgress,
  paginateItems,
  rescheduleSession,
  toggleGoalCompletion,
  updateActionAfterCheck,
  validateGoalInput,
  validateStartSessionInput,
} from './dashboardLogic';
import type {
  CalendarSession,
  LearningAction,
  LearningGoal,
  QuizQuestion,
  StudentProfile,
} from '../types/dashboard';

test('validateGoalInput rejects empty fields and accepts valid input', () => {
  const invalid = validateGoalInput({
    title: '  ',
    subject: '',
    category: '',
    dueDate: '',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.title);
  assert.ok(invalid.errors.subject);
  assert.ok(invalid.errors.dueDate);

  const valid = validateGoalInput({
    title: 'Algebra Linear Equations',
    subject: 'Mathematics',
    category: 'Concept Mastery',
    dueDate: '2026-08-15',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('createGoal prepends formatted goal without mutating original array', () => {
  const existing: LearningGoal[] = [
    {
      id: 'g1',
      label: 'Goal 1',
      dueDate: '30 Jul, 2026',
      category: 'Concept Mastery',
      subject: 'English',
      title: 'Readiness Check - English',
      progress: 40,
      completed: false,
    },
  ];
  const updated = createGoal(existing, {
    title: 'Quadratic Functions Mastery',
    subject: 'Mathematics',
    category: 'Exam Preparation',
    dueDate: '2026-08-12',
  });
  assert.equal(existing.length, 1);
  assert.equal(updated.length, 2);
  assert.equal(updated[0].label, 'Goal 2');
  assert.equal(updated[0].dueDate, '12 Aug, 2026');
  assert.equal(updated[0].title, 'Quadratic Functions Mastery');
});

test('formatReadableDate formats ISO string cleanly', () => {
  assert.equal(formatReadableDate('2026-07-30'), '30 Jul, 2026');
  assert.equal(formatReadableDate('2026-01-05'), '05 Jan, 2026');
});

test('toggleGoalCompletion flips completion and progress', () => {
  const goals: LearningGoal[] = [
    {
      id: 'g1',
      label: 'Goal 1',
      dueDate: '30 Jul, 2026',
      category: 'Concept Mastery',
      subject: 'English',
      title: 'Readiness Check - English',
      progress: 40,
      completed: false,
    },
  ];
  const completed = toggleGoalCompletion(goals, 'g1');
  assert.equal(completed[0].completed, true);
  assert.equal(completed[0].progress, 100);
});

test('paginateItems clamps out-of-range page index safely', () => {
  const items = [1, 2, 3, 4, 5, 6, 7];
  const p0 = paginateItems(items, 0, 3);
  assert.deepEqual(p0.items, [1, 2, 3]);
  assert.equal(p0.totalPages, 3);

  const pOverflow = paginateItems(items, 10, 3);
  assert.equal(pOverflow.safePage, 2);
  assert.deepEqual(pOverflow.items, [7]);
});

test('rescheduleSession and groupSessionsByStatus transition session cleanly', () => {
  const sessions: CalendarSession[] = [
    {
      id: 's1',
      dateKey: '2026-07-15',
      time: '09:00',
      meridiem: 'AM',
      title: 'Design Workshop',
      description: 'Interactive components session',
      status: 'missed',
      tutorName: 'Ms. Rivera',
      subject: 'English',
    },
    {
      id: 's2',
      dateKey: '2026-07-15',
      time: '01:00',
      meridiem: 'PM',
      title: 'Feedback Round',
      description: 'Discuss progress',
      status: 'scheduled',
      tutorName: 'Mr. Patel',
      subject: 'Mathematics',
    },
  ];

  const moved = rescheduleSession(sessions, 's1', 'scheduled');
  const grouped = groupSessionsByStatus(moved, '2026-07-15');
  assert.equal(grouped.missed.length, 0);
  assert.equal(grouped.scheduled.length, 2);
});

test('calculateQuizResult computes exact score and readiness tier', () => {
  const questions: QuizQuestion[] = [
    {
      id: 'q1',
      subject: 'English',
      prompt: 'Q1',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 1,
      explanation: 'Exp 1',
    },
    {
      id: 'q2',
      subject: 'English',
      prompt: 'Q2',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 2,
      explanation: 'Exp 2',
    },
    {
      id: 'q3',
      subject: 'English',
      prompt: 'Q3',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
      explanation: 'Exp 3',
    },
    {
      id: 'q4',
      subject: 'English',
      prompt: 'Q4',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 3,
      explanation: 'Exp 4',
    },
  ];

  const res = calculateQuizResult(questions, { q1: 1, q2: 2, q3: 0, q4: 1 });
  assert.equal(res.correctCount, 3);
  assert.equal(res.percentage, 75);
  assert.equal(res.readinessTier, 'Proficient');
});

test('computeProfileCompletion detects missing fields accurately', () => {
  const partial: StudentProfile = {
    firstName: 'Jane',
    fullName: 'Jane Carter',
    grade: '9',
    curriculum: 'CCSS',
    subjects: ['English'],
    learningStyle: 'Interactive',
    dailyTargetMinutes: 30,
    email: 'jane@tutorcloud.edu',
  };
  const partialResult = computeProfileCompletion(partial);
  assert.equal(partialResult.percent, 83);
  assert.deepEqual(partialResult.missingFields, ['At least 2 Subjects']);

  const fullResult = computeProfileCompletion({
    ...partial,
    subjects: ['English', 'Mathematics'],
  });
  assert.equal(fullResult.percent, 100);
  assert.deepEqual(fullResult.missingFields, []);
});

test('advanceStreak increments once per day only', () => {
  const first = advanceStreak(1, false);
  assert.deepEqual(first, { streakDays: 2, earnedToday: true });

  const second = advanceStreak(first.streakDays, first.earnedToday);
  assert.deepEqual(second, { streakDays: 2, earnedToday: true });
});

test('updateActionAfterCheck marks learning action completed with score', () => {
  const actions: LearningAction[] = [
    {
      id: 'act-1',
      category: 'Readiness Check',
      focus: 'Concept Mastery',
      status: 'Term 2',
      subject: 'English',
      description: 'Help me understand your current level.',
      primaryCta: 'Start Readiness Check',
      hasGeneratePlan: true,
      unitTopic: 'Argumentative Writing',
    },
  ];
  const updated = updateActionAfterCheck(actions, 'act-1', 88);
  assert.equal(updated[0].status, 'Completed');
  assert.equal(updated[0].score, 88);
  assert.equal(updated[0].primaryCta, 'View Readiness Report');
});

test('validateStartSessionInput requires subject and topic', () => {
  const empty = validateStartSessionInput({ subject: '', topic: ' ' });
  assert.equal(empty.valid, false);
  assert.ok(empty.errors.subject);
  assert.ok(empty.errors.topic);

  const ok = validateStartSessionInput({ subject: 'Mathematics', topic: 'Linear Equations' });
  assert.equal(ok.valid, true);
  assert.deepEqual(ok.errors, {});
});

test('buildSessionOpeningPrompt includes optional specific question when provided', () => {
  const withoutQ = buildSessionOpeningPrompt({
    helpType: 'Learn a Lesson',
    subject: 'English',
    topic: 'Thesis Statements',
  });
  assert.equal(withoutQ, 'Learn a Lesson (English): Thesis Statements');

  const withQ = buildSessionOpeningPrompt({
    helpType: 'Prepare for a Test',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    specificQuestion: 'How do I find slope from two points?',
  });
  assert.equal(
    withQ,
    'Prepare for a Test (Mathematics): Linear Equations — Question: How do I find slope from two points?'
  );
});

test('getActiveDashboardGoals removes completed goals and 100% progress goals from Dashboard', () => {
  const goals: LearningGoal[] = [
    {
      id: 'g1',
      label: 'Goal 1',
      dueDate: '30 Jul, 2026',
      category: 'Concept Mastery',
      subject: 'English',
      title: 'Readiness Check - English',
      progress: 60,
      completed: false,
    },
    {
      id: 'g2',
      label: 'Goal 2',
      dueDate: '30 Jul, 2026',
      category: 'Concept Mastery',
      subject: 'Mathematics',
      title: 'Mathematics Goal',
      progress: 45,
      completed: false,
    },
  ];

  // Completing g1 via toggleGoalCompletion removes it from active Dashboard goals
  const afterComplete = toggleGoalCompletion(goals, 'g1');
  const visible = getActiveDashboardGoals(afterComplete);
  assert.equal(visible.length, 1);
  assert.equal(visible[0].id, 'g2');

  // Completing g2 via 100% progress also removes it from Dashboard
  const allDone = afterComplete.map((g) => (g.id === 'g2' ? { ...g, progress: 100 } : g));
  assert.equal(getActiveDashboardGoals(allDone).length, 0);
});

test('Next Learning Action lifecycle: Readiness Check -> Pause ILP -> Resume ILP -> Complete removes from Dashboard', () => {
  const initial: LearningAction[] = [
    {
      id: 'act-math',
      category: 'Readiness Check',
      focus: 'Concept Mastery',
      status: 'Term 2',
      subject: 'Mathematics',
      description: 'Help me understand your current level.',
      primaryCta: 'Start Readiness Check',
      hasGeneratePlan: true,
      unitTopic: 'Linear Equations & Proportional Reasoning',
    },
    {
      id: 'act-sci',
      category: 'Readiness Check',
      focus: 'Exam Preparation',
      status: 'Final',
      subject: 'Science',
      description: 'Help me understand your current level.',
      primaryCta: 'Start Readiness Check',
      hasGeneratePlan: true,
      unitTopic: 'Water Cycle & Earth Systems',
    },
  ];

  // 1. Completing Readiness Check marks action Completed (still visible so student can generate ILP)
  const afterCheck = updateActionAfterCheck(initial, 'act-math', 85);
  assert.equal(getDashboardVisibleActions(afterCheck).length, 2);

  // 2. Closing ILP Generator in the middle transitions it to In Progress + Resume ILP Generation
  const afterPause = markActionIlpInProgress(afterCheck, 'act-math', 'Linear Equations Deep Dive');
  const pausedMath = afterPause.find((a) => a.id === 'act-math')!;
  assert.equal(pausedMath.status, 'In Progress');
  assert.equal(pausedMath.primaryCta, 'Resume ILP Generation');
  assert.equal(pausedMath.hasGeneratePlan, false);
  assert.equal(pausedMath.unitTopic, 'Linear Equations Deep Dive');
  assert.equal(getDashboardVisibleActions(afterPause).length, 2);

  // 3. Completing ILP Generation marks Plan Ready and removes it from Dashboard
  const afterComplete = markActionIlpCompleted(afterPause, 'act-math', 'Linear Equations Deep Dive');
  const visibleAfterComplete = getDashboardVisibleActions(afterComplete);
  assert.equal(visibleAfterComplete.length, 1);
  assert.equal(visibleAfterComplete[0].id, 'act-sci');

  // 4. Attempting to pause an already completed plan never resurrects it on Dashboard
  const afterExtraPause = markActionIlpInProgress(afterComplete, 'act-math');
  assert.equal(getDashboardVisibleActions(afterExtraPause).length, 1);
});

test('buildIlpModuleFromGeneration maps study pace to estimated minutes cleanly', () => {
  const mod30 = buildIlpModuleFromGeneration({
    subject: 'Mathematics',
    moduleTitle: 'Linear Equations Deep Dive',
    pace: 'Balanced (30m/day)',
    existingCount: 3,
    nowMs: 12345,
  });
  assert.equal(mod30.id, 'mod-12345');
  assert.equal(mod30.week, 'Week 4');
  assert.equal(mod30.estimatedMinutes, 30);
  assert.equal(mod30.completed, false);

  const mod60 = buildIlpModuleFromGeneration({
    subject: 'Science',
    moduleTitle: 'Water Cycle Mastery',
    pace: 'Exam Sprint (60m/day)',
    existingCount: 4,
    nowMs: 99999,
  });
  assert.equal(mod60.estimatedMinutes, 60);
  assert.equal(mod60.week, 'Week 5');
});


