import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeRoadmapProgress,
  createInitialOnboardingState,
  filterDashboardActionsAfterPopup,
  filterDashboardGoalsAfterPopup,
  generatePersonalizedPlanModules,
  getAvailableReadinessChecks,
  getMascotRoadmapMessage,
  gradeReadinessQuiz,
  recordLoginDay,
  shouldAutoShowOnboardingPopup,
  shouldShowDashboardLearningGoals,
  type OnboardingGoalRecord,
} from './onboardingRoadmapLogic';
import {
  INITIAL_GOALS,
  INITIAL_LEARNING_ACTIONS,
  INITIAL_PROFILE,
} from '../data/seedData';

test('multi-subject student follows 3-step conditional progression strictly', () => {
  const checks = getAvailableReadinessChecks(['English', 'Mathematics', 'Science'], '9');
  assert.equal(checks.length, 3);

  let state = createInitialOnboardingState('2026-07-15');

  // Step 0: Nothing completed -> 0 of 3, Milestone 01 active, 02 & 03 pending
  let progress = computeRoadmapProgress(state, checks);
  assert.equal(progress.totalSteps, 3);
  assert.equal(progress.completedSteps, 0);
  assert.equal(progress.hasSecondMilestone, true);
  assert.equal(progress.nextAction, 'start-first-readiness');
  assert.equal(progress.milestones[0].status, 'active');
  assert.equal(progress.milestones[1].status, 'pending');
  assert.equal(progress.milestones[2].status, 'pending');

  // Step 1: Submitting first readiness check completes M1 and unlocks M2 (not M3 yet)
  const firstCheck = checks[0];
  const firstResult = gradeReadinessQuiz(firstCheck, {
    [firstCheck.questions[0].id]: firstCheck.questions[0].correctIndex,
    [firstCheck.questions[1].id]: firstCheck.questions[1].correctIndex,
    [firstCheck.questions[2].id]: firstCheck.questions[2].correctIndex,
  });
  assert.equal(firstResult.scorePercent, 100);

  state = {
    ...state,
    completedAssessments: {
      ...state.completedAssessments,
      [firstCheck.id]: firstResult,
    },
  };
  progress = computeRoadmapProgress(state, checks);
  assert.equal(progress.completedSteps, 1);
  assert.equal(progress.nextAction, 'complete-remaining-readiness');
  assert.equal(progress.milestones[0].status, 'completed');
  assert.equal(progress.milestones[1].status, 'active');
  assert.equal(progress.milestones[2].status, 'pending');
  assert.equal(progress.remainingAssessments.length, 2);

  // Step 2: Completing second check still leaves 1 remaining -> M2 stays active
  const secondCheck = checks[1];
  state = {
    ...state,
    completedAssessments: {
      ...state.completedAssessments,
      [secondCheck.id]: gradeReadinessQuiz(secondCheck, {
        [secondCheck.questions[0].id]: secondCheck.questions[0].correctIndex,
      }),
    },
  };
  progress = computeRoadmapProgress(state, checks);
  assert.equal(progress.completedSteps, 1);
  assert.equal(progress.milestones[1].status, 'active');
  assert.equal(progress.remainingAssessments.length, 1);

  // Step 3: Completing final check completes M2 and unlocks M3 (Goal Setting)
  const thirdCheck = checks[2];
  state = {
    ...state,
    completedAssessments: {
      ...state.completedAssessments,
      [thirdCheck.id]: gradeReadinessQuiz(thirdCheck, {
        [thirdCheck.questions[0].id]: thirdCheck.questions[0].correctIndex,
        [thirdCheck.questions[1].id]: thirdCheck.questions[1].correctIndex,
      }),
    },
  };
  progress = computeRoadmapProgress(state, checks);
  assert.equal(progress.completedSteps, 2);
  assert.equal(progress.nextAction, 'set-goals');
  assert.equal(progress.milestones[1].status, 'completed');
  assert.equal(progress.milestones[2].status, 'active');

  // Step 4: Saving goals completes M3 (3 of 3) and readies Learning Plan
  const goal: OnboardingGoalRecord = {
    id: 'g-onb-1',
    title: 'Master Linear Equations & Functions',
    subject: 'Mathematics',
    focusArea: 'Concept Mastery',
    dailyMinutes: 30,
    dueDate: '30 Aug, 2026',
  };
  state = {
    ...state,
    savedGoals: [goal],
    learningPlanGenerated: true,
  };
  progress = computeRoadmapProgress(state, checks);
  assert.equal(progress.completedSteps, 3);
  assert.equal(progress.percentComplete, 100);
  assert.equal(progress.isComplete, true);
  assert.equal(progress.nextAction, 'view-learning-plan');

  // Personalized Learning Plan modules generated from assessments + goals
  const modules = generatePersonalizedPlanModules(
    state.completedAssessments,
    state.savedGoals,
    INITIAL_PROFILE
  );
  assert.equal(modules.length, 4);
  assert.ok(modules.some((m) => m.subject === 'Mathematics'));
  assert.ok(modules.some((m) => m.title.includes('Master Linear Equations')));
});

test('single-subject student automatically skips Milestone 02 and uses 2-step journey', () => {
  const checks = getAvailableReadinessChecks(['Mathematics'], '9');
  assert.equal(checks.length, 1);

  let state = createInitialOnboardingState('2026-07-15');
  let progress = computeRoadmapProgress(state, checks);

  assert.equal(progress.hasSecondMilestone, false);
  assert.equal(progress.totalSteps, 2);
  assert.equal(progress.visibleMilestones.length, 2);
  assert.equal(progress.milestones[1].status, 'skipped');
  assert.equal(progress.visibleMilestones[0].numberLabel, '01');
  assert.equal(progress.visibleMilestones[1].numberLabel, '03');

  // Completing the only readiness check jumps directly to Goal Setting
  const onlyCheck = checks[0];
  state = {
    ...state,
    completedAssessments: {
      [onlyCheck.id]: gradeReadinessQuiz(onlyCheck, {
        [onlyCheck.questions[0].id]: onlyCheck.questions[0].correctIndex,
      }),
    },
  };
  progress = computeRoadmapProgress(state, checks);
  assert.equal(progress.completedSteps, 1);
  assert.equal(progress.totalSteps, 2);
  assert.equal(progress.percentComplete, 50);
  assert.equal(progress.nextAction, 'set-goals');
  assert.equal(progress.milestones[2].status, 'active');
});

test('popup display rules honor Day 1/2/3 reminders, active session suppression, and same-session dismissal', () => {
  const checks = getAvailableReadinessChecks(['Mathematics', 'Science'], '9');
  let state = createInitialOnboardingState('2026-07-15');
  const incompleteProgress = computeRoadmapProgress(state, checks);

  // Day 1 login on dashboard -> auto-show
  assert.equal(
    shouldAutoShowOnboardingPopup({
      state,
      progress: incompleteProgress,
      isDismissedThisSession: false,
      hasActiveSession: false,
      isAuthenticated: true,
    }),
    true
  );

  // Active learning session -> NEVER interrupt
  assert.equal(
    shouldAutoShowOnboardingPopup({
      state,
      progress: incompleteProgress,
      isDismissedThisSession: false,
      hasActiveSession: true,
      isAuthenticated: true,
    }),
    false
  );

  // Dismissed within same login session -> do NOT pop up again
  assert.equal(
    shouldAutoShowOnboardingPopup({
      state,
      progress: incompleteProgress,
      isDismissedThisSession: true,
      hasActiveSession: false,
      isAuthenticated: true,
    }),
    false
  );

  // Day 2 & Day 3 new login sessions when still incomplete -> show again with welcome-back mascot copy
  state = recordLoginDay(state, '2026-07-16');
  assert.equal(state.loginDays.length, 2);
  assert.equal(
    shouldAutoShowOnboardingPopup({
      state,
      progress: incompleteProgress,
      isDismissedThisSession: false,
      hasActiveSession: false,
      isAuthenticated: true,
    }),
    true
  );
  const day2Mascot = getMascotRoadmapMessage(incompleteProgress, 'Jane', state.loginDays.length);
  assert.ok(day2Mascot.headline.includes('Day 2'));

  // Completed setup -> stop auto-showing
  const doneState = {
    ...state,
    learningPlanGenerated: true,
  };
  assert.equal(
    shouldAutoShowOnboardingPopup({
      state: doneState,
      progress: incompleteProgress,
      isDismissedThisSession: false,
      hasActiveSession: false,
      isAuthenticated: true,
    }),
    false
  );
});

test('completing readiness checks and learning goals in popup removes them from the Dashboard', () => {
  const checks = getAvailableReadinessChecks(['English', 'Mathematics', 'Science'], '9');
  let state = createInitialOnboardingState('2026-07-15');

  // Before any popup completion -> all 3 readiness actions & learning goals remain on Dashboard
  assert.equal(
    filterDashboardActionsAfterPopup(INITIAL_LEARNING_ACTIONS, state, checks).length,
    3
  );
  assert.equal(shouldShowDashboardLearningGoals(state), true);
  assert.equal(filterDashboardGoalsAfterPopup(INITIAL_GOALS, state).length, INITIAL_GOALS.length);

  // Completing English readiness check in popup removes English from Dashboard actions & Readiness Check - English goal
  const englishCheck = checks[0];
  state = {
    ...state,
    completedAssessments: {
      [englishCheck.id]: gradeReadinessQuiz(englishCheck, {
        [englishCheck.questions[0].id]: englishCheck.questions[0].correctIndex,
      }),
    },
  };
  const afterEnglishActions = filterDashboardActionsAfterPopup(
    INITIAL_LEARNING_ACTIONS,
    state,
    checks
  );
  assert.equal(afterEnglishActions.length, 2);
  assert.ok(afterEnglishActions.every((a) => a.subject !== 'English'));
  const afterEnglishGoals = filterDashboardGoalsAfterPopup(INITIAL_GOALS, state);
  assert.ok(afterEnglishGoals.every((g) => g.title !== 'Readiness Check - English'));

  // Completing all remaining checks removes all readiness check actions from Dashboard
  for (const check of checks.slice(1)) {
    state = {
      ...state,
      completedAssessments: {
        ...state.completedAssessments,
        [check.id]: gradeReadinessQuiz(check, {
          [check.questions[0].id]: check.questions[0].correctIndex,
        }),
      },
    };
  }
  assert.equal(
    filterDashboardActionsAfterPopup(INITIAL_LEARNING_ACTIONS, state, checks).length,
    0
  );

  // Completing Learning Goals in popup removes Learning Goals from Dashboard
  state = {
    ...state,
    savedGoals: [
      {
        id: 'onb-g-1',
        title: 'Master Linear Equations',
        subject: 'Mathematics',
        focusArea: 'Concept Mastery',
        dailyMinutes: 30,
        dueDate: '30 Aug, 2026',
      },
    ],
  };
  assert.equal(shouldShowDashboardLearningGoals(state), false);
  assert.deepEqual(filterDashboardGoalsAfterPopup(INITIAL_GOALS, state), []);
});
