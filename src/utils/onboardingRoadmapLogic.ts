import type {
  LearningAction,
  LearningGoal,
  LearningPlanModule,
  StudentProfile,
} from '../types/dashboard';

export type MilestoneStatus = 'pending' | 'active' | 'completed' | 'skipped';

export interface ReadinessQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  concept: string;
}

export interface ReadinessAssessmentSpec {
  id: string;
  subject: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  gradeTag: string;
  accentHex: string;
  questions: ReadinessQuizQuestion[];
}

export interface CompletedReadinessRecord {
  assessmentId: string;
  subject: string;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  completedAt: string;
}

export type GoalFocusArea =
  | 'Concept Mastery'
  | 'Exam Preparation'
  | 'Homework Confidence'
  | 'Ahead of Grade';

export interface OnboardingGoalRecord {
  id: string;
  title: string;
  subject: string;
  focusArea: GoalFocusArea;
  dailyMinutes: number;
  dueDate: string;
}

export interface OnboardingState {
  completedAssessments: Record<string, CompletedReadinessRecord>;
  savedGoals: OnboardingGoalRecord[];
  learningPlanGenerated: boolean;
  loginDays: string[]; // Unique ISO YYYY-MM-DD login date keys (Day 1, Day 2, Day 3...)
  lastDismissedDate: string | null;
}

export interface MilestoneViewModel {
  id: 'm1' | 'm2' | 'm3';
  numberLabel: '01' | '02' | '03';
  title: string;
  description: string;
  ctaLabel: string;
  status: MilestoneStatus;
  metaText: string;
}

export type RoadmapNextAction =
  | 'start-first-readiness'
  | 'complete-remaining-readiness'
  | 'set-goals'
  | 'view-learning-plan';

export interface RoadmapProgressSummary {
  milestones: MilestoneViewModel[];
  visibleMilestones: MilestoneViewModel[];
  completedSteps: number;
  totalSteps: number;
  percentComplete: number;
  hasSecondMilestone: boolean;
  completedAssessmentCount: number;
  totalAssessmentCount: number;
  remainingAssessments: ReadinessAssessmentSpec[];
  nextAction: RoadmapNextAction;
  isComplete: boolean;
}

const READINESS_BANK: Record<
  string,
  Omit<ReadinessAssessmentSpec, 'id' | 'gradeTag'>
> = {
  Mathematics: {
    subject: 'Mathematics',
    title: 'Mathematics Readiness Check',
    subtitle: 'Algebraic reasoning, ratios, and linear equations',
    estimatedMinutes: 4,
    accentHex: '#085891',
    questions: [
      {
        id: 'math-r1',
        prompt: 'If 3x + 7 = 22, what is the value of x?',
        options: ['x = 3', 'x = 5', 'x = 7', 'x = 15'],
        correctIndex: 1,
        concept: 'Linear Equations',
      },
      {
        id: 'math-r2',
        prompt: 'A line passes through (0, 2) and has a slope of 3. Which equation represents it?',
        options: ['y = 2x + 3', 'y = 3x + 2', 'y = 3x - 2', 'y = x + 5'],
        correctIndex: 1,
        concept: 'Slope-Intercept Form',
      },
      {
        id: 'math-r3',
        prompt: 'A recipe uses 2 cups of flour for every 3 cups of milk. How much flour is needed for 12 cups of milk?',
        options: ['6 cups', '8 cups', '9 cups', '10 cups'],
        correctIndex: 1,
        concept: 'Proportional Reasoning',
      },
    ],
  },
  English: {
    subject: 'English',
    title: 'English Readiness Check',
    subtitle: 'Reading comprehension, textual evidence, and clarity',
    estimatedMinutes: 4,
    accentHex: '#0D9488',
    questions: [
      {
        id: 'eng-r1',
        prompt: 'Which strategy makes textual evidence strongest in an analytical paragraph?',
        options: [
          'Dropping a long quote with no explanation',
          'Embedding a brief quote and explaining how it proves your claim',
          'Summarizing the whole chapter instead of quoting',
          'Ending the paragraph immediately after the quote',
        ],
        correctIndex: 1,
        concept: 'Textual Evidence',
      },
      {
        id: 'eng-r2',
        prompt: 'Choose the sentence with correct parallel structure.',
        options: [
          'She likes reading novels, to paint landscapes, and swimming.',
          'She likes reading novels, painting landscapes, and swimming.',
          'She likes to read novels, painting landscapes, and swim.',
          'She likes reading novels, paint landscapes, and to swim.',
        ],
        correctIndex: 1,
        concept: 'Grammar & Style',
      },
      {
        id: 'eng-r3',
        prompt: 'What is the main purpose of a counterargument in a persuasive essay?',
        options: [
          'To confuse the reader about your thesis',
          'To address an opposing view fairly and strengthen your own position',
          'To add extra word count to the conclusion',
          'To repeat the introduction word for word',
        ],
        correctIndex: 1,
        concept: 'Argumentative Writing',
      },
    ],
  },
  Science: {
    subject: 'Science',
    title: 'Science Readiness Check',
    subtitle: 'Scientific inquiry, Earth systems, and energy transfer',
    estimatedMinutes: 4,
    accentHex: '#F19500',
    questions: [
      {
        id: 'sci-r1',
        prompt: 'Which process in the water cycle turns rising water vapour back into tiny liquid cloud droplets?',
        options: ['Evaporation', 'Condensation', 'Collection', 'Infiltration'],
        correctIndex: 1,
        concept: 'Water Cycle & Weather',
      },
      {
        id: 'sci-r2',
        prompt: 'In a controlled experiment testing plant growth under different light colors, what is the independent variable?',
        options: [
          'The height of the plant after 2 weeks',
          'The color of light each plant receives',
          'The amount of water given to every plant',
          'The type of soil in all pots',
        ],
        correctIndex: 1,
        concept: 'Experimental Design',
      },
      {
        id: 'sci-r3',
        prompt: 'Why is the Sun considered the primary driver of Earth’s weather and water cycle?',
        options: [
          'It pulls ocean waves upward with gravity',
          'Its thermal energy drives evaporation and heats air unevenly, creating wind',
          'It freezes water vapor at high altitudes',
          'It stops clouds from moving across continents',
        ],
        correctIndex: 1,
        concept: 'Solar Energy & Systems',
      },
    ],
  },
  History: {
    subject: 'History',
    title: 'History Readiness Check',
    subtitle: 'Primary sources, chronology, and cause-and-effect',
    estimatedMinutes: 3,
    accentHex: '#7C3AED',
    questions: [
      {
        id: 'hist-r1',
        prompt: 'Which item is the clearest example of a primary historical source?',
        options: [
          'A modern textbook chapter about 1920',
          'A diary written by a witness during the 1920 event',
          'An encyclopedia summary written last year',
          'A documentary movie produced decades later',
        ],
        correctIndex: 1,
        concept: 'Primary Sources',
      },
      {
        id: 'hist-r2',
        prompt: 'Why do historians compare multiple sources from the same period?',
        options: [
          'To pick the shortest account',
          'To corroborate facts and uncover differing perspectives or bias',
          'To avoid quoting real dates',
          'To replace chronological timelines',
        ],
        correctIndex: 1,
        concept: 'Historical Corroboration',
      },
      {
        id: 'hist-r3',
        prompt: 'How did navigable rivers most directly support early civilizations?',
        options: [
          'They prevented all trade between towns',
          'They enabled fertile agriculture, freshwater access, and trade routes',
          'They blocked seasonal farming',
          'They eliminated the need for written records',
        ],
        correctIndex: 1,
        concept: 'Geography & Civilizations',
      },
    ],
  },
  'Computer Science': {
    subject: 'Computer Science',
    title: 'Computer Science Readiness Check',
    subtitle: 'Algorithms, conditionals, and logical decomposition',
    estimatedMinutes: 3,
    accentHex: '#2563EB',
    questions: [
      {
        id: 'cs-r1',
        prompt: 'What does breaking a large coding problem into smaller sub-tasks illustrate?',
        options: ['Decomposition', 'Infinite looping', 'Syntax error', 'Hardware buffering'],
        correctIndex: 0,
        concept: 'Computational Thinking',
      },
      {
        id: 'cs-r2',
        prompt: 'If a loop runs while count < 5 starting at count = 0 (incrementing by 1), how many times does it execute?',
        options: ['4 times', '5 times', '6 times', 'Infinite times'],
        correctIndex: 1,
        concept: 'Control Flow & Loops',
      },
      {
        id: 'cs-r3',
        prompt: 'Which data structure stores items in an ordered sequence accessed by index?',
        options: ['Boolean', 'Array / List', 'Single character', 'Null pointer'],
        correctIndex: 1,
        concept: 'Data Structures',
      },
    ],
  },
};

export function createInitialOnboardingState(todayKey?: string): OnboardingState {
  const initialDays = todayKey ? [todayKey] : [];
  return {
    completedAssessments: {},
    savedGoals: [],
    learningPlanGenerated: false,
    loginDays: initialDays,
    lastDismissedDate: null,
  };
}

export function getTodayDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function recordLoginDay(
  state: OnboardingState,
  todayKey: string
): OnboardingState {
  if (!todayKey || state.loginDays.includes(todayKey)) {
    return state;
  }
  return {
    ...state,
    loginDays: [...state.loginDays, todayKey],
  };
}

export function getAvailableReadinessChecks(
  subjects: string[],
  grade: string
): ReadinessAssessmentSpec[] {
  const normalizedSubjects = Array.from(
    new Set(
      (subjects.length > 0 ? subjects : ['Mathematics']).map((s) => s.trim()).filter(Boolean)
    )
  );

  const gradeTag = grade ? `Grade ${grade}` : 'Core Level';

  return normalizedSubjects.map((subject) => {
    const preset = READINESS_BANK[subject];
    if (preset) {
      return {
        ...preset,
        id: `rc-${subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        gradeTag,
      };
    }

    return {
      id: `rc-${subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      subject,
      title: `${subject} Readiness Check`,
      subtitle: `Core concepts and problem-solving in ${subject}`,
      estimatedMinutes: 3,
      gradeTag,
      accentHex: '#085891',
      questions: [
        {
          id: `${subject.toLowerCase()}-q1`,
          prompt: `Which habit best accelerates mastery when starting a new ${subject} unit?`,
          options: [
            'Connecting new concepts to prior examples and practicing actively',
            'Memorizing definitions once without solving problems',
            'Skipping foundational vocabulary',
            'Avoiding feedback on practice errors',
          ],
          correctIndex: 0,
          concept: 'Core Foundations',
        },
        {
          id: `${subject.toLowerCase()}-q2`,
          prompt: `When you encounter a challenging ${subject} question, what is the strongest first step?`,
          options: [
            'Guess immediately without reading the prompt',
            'Identify what is given, what is asked, and break it into smaller steps',
            'Skip the entire topic permanently',
            'Copy the answer without checking the reasoning',
          ],
          correctIndex: 1,
          concept: 'Problem Decomposition',
        },
        {
          id: `${subject.toLowerCase()}-q3`,
          prompt: `How does spacing practice across the week help in ${subject}?`,
          options: [
            'It weakens recall over time',
            'It strengthens long-term memory and confidence before assessments',
            'It removes the need to understand concepts',
            'It only works for reading subjects',
          ],
          correctIndex: 1,
          concept: 'Spaced Practice',
        },
      ],
    };
  });
}

export function gradeReadinessQuiz(
  assessment: ReadinessAssessmentSpec,
  selectedAnswers: Record<string, number>,
  completedAt: string = new Date().toISOString()
): CompletedReadinessRecord {
  const totalQuestions = assessment.questions.length;
  let correctCount = 0;
  for (const q of assessment.questions) {
    if (selectedAnswers[q.id] === q.correctIndex) {
      correctCount += 1;
    }
  }
  const scorePercent =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;

  return {
    assessmentId: assessment.id,
    subject: assessment.subject,
    scorePercent,
    correctCount,
    totalQuestions,
    completedAt,
  };
}

export function computeRoadmapProgress(
  state: OnboardingState,
  availableChecks: ReadinessAssessmentSpec[]
): RoadmapProgressSummary {
  const validChecks =
    availableChecks.length > 0
      ? availableChecks
      : getAvailableReadinessChecks(['Mathematics'], '9');

  const completedList = validChecks.filter(
    (check) => Boolean(state.completedAssessments[check.id])
  );
  const remainingAssessments = validChecks.filter(
    (check) => !state.completedAssessments[check.id]
  );

  const hasSecondMilestone = validChecks.length > 1;
  const totalSteps = hasSecondMilestone ? 3 : 2;

  const firstCompleted = completedList.length >= 1;
  const allAssessmentsCompleted =
    validChecks.length > 0 && completedList.length >= validChecks.length;
  const goalsCompleted = state.savedGoals.length > 0;

  // Milestone 01 status
  const m1Status: MilestoneStatus = firstCompleted ? 'completed' : 'active';

  // Milestone 02 status (conditional)
  let m2Status: MilestoneStatus;
  if (!hasSecondMilestone) {
    m2Status = 'skipped';
  } else if (allAssessmentsCompleted) {
    m2Status = 'completed';
  } else if (firstCompleted) {
    m2Status = 'active';
  } else {
    m2Status = 'pending';
  }

  // Milestone 03 status
  let m3Status: MilestoneStatus;
  if (goalsCompleted && allAssessmentsCompleted) {
    m3Status = 'completed';
  } else if (allAssessmentsCompleted) {
    m3Status = 'active';
  } else {
    m3Status = 'pending';
  }

  const completedSteps =
    (m1Status === 'completed' ? 1 : 0) +
    (m2Status === 'completed' ? 1 : 0) +
    (m3Status === 'completed' ? 1 : 0);

  const percentComplete = Math.round((completedSteps / totalSteps) * 100);

  // Strict Section 5 progression decision
  let nextAction: RoadmapNextAction;
  if (!firstCompleted) {
    nextAction = 'start-first-readiness';
  } else if (hasSecondMilestone && !allAssessmentsCompleted) {
    nextAction = 'complete-remaining-readiness';
  } else if (!goalsCompleted) {
    nextAction = 'set-goals';
  } else {
    nextAction = 'view-learning-plan';
  }

  const firstCompletedRecord = completedList[0]
    ? state.completedAssessments[completedList[0].id]
    : null;

  const m1: MilestoneViewModel = {
    id: 'm1',
    numberLabel: '01',
    title: 'Discover Your Learning Level',
    description:
      "Let's understand what you already know so we can create a learning plan that fits you.",
    ctaLabel:
      m1Status === 'completed'
        ? 'View Completed Check'
        : 'Start Readiness Check',
    status: m1Status,
    metaText:
      m1Status === 'completed' && firstCompletedRecord
        ? `${firstCompletedRecord.subject} scored ${firstCompletedRecord.scorePercent}%`
        : `${validChecks.length} subject ${validChecks.length === 1 ? 'check' : 'checks'} ready`,
  };

  const m2: MilestoneViewModel = {
    id: 'm2',
    numberLabel: '02',
    title: 'Complete Your Other Assessments',
    description:
      'Have more subjects to explore? Complete another readiness check to make your learning plan even more personalized.',
    ctaLabel:
      m2Status === 'completed'
        ? 'All Assessments Complete'
        : `Complete Remaining (${remainingAssessments.length})`,
    status: m2Status,
    metaText:
      m2Status === 'completed'
        ? `All ${validChecks.length} subject checks completed`
        : m2Status === 'active'
        ? `${remainingAssessments.length} more ${
            remainingAssessments.length === 1 ? 'subject' : 'subjects'
          } remaining`
        : `Unlocks after Milestone 01`,
  };

  const m3: MilestoneViewModel = {
    id: 'm3',
    numberLabel: '03',
    title: 'Set Your Learning Goals',
    description:
      'Tell us what you want to achieve. Your goals will help shape your personalized learning journey.',
    ctaLabel: m3Status === 'completed' ? 'Goals Saved' : 'Set My Goals',
    status: m3Status,
    metaText:
      m3Status === 'completed'
        ? `${state.savedGoals.length} learning ${
            state.savedGoals.length === 1 ? 'goal' : 'goals'
          } saved`
        : m3Status === 'active'
        ? 'Ready — takes under 1 minute'
        : hasSecondMilestone
        ? 'Unlocks after readiness checks'
        : 'Unlocks after Milestone 01',
  };

  const milestones: MilestoneViewModel[] = [m1, m2, m3];
  const visibleMilestones = milestones.filter((m) => m.status !== 'skipped');

  return {
    milestones,
    visibleMilestones,
    completedSteps,
    totalSteps,
    percentComplete,
    hasSecondMilestone,
    completedAssessmentCount: completedList.length,
    totalAssessmentCount: validChecks.length,
    remainingAssessments,
    nextAction,
    isComplete: completedSteps === totalSteps && allAssessmentsCompleted && goalsCompleted,
  };
}

export interface AutoShowCheckParams {
  state: OnboardingState;
  progress: RoadmapProgressSummary;
  isDismissedThisSession: boolean;
  hasActiveSession: boolean;
  isAuthenticated: boolean;
}

export function shouldAutoShowOnboardingPopup({
  state,
  progress,
  isDismissedThisSession,
  hasActiveSession,
  isAuthenticated,
}: AutoShowCheckParams): boolean {
  if (!isAuthenticated) return false;
  if (hasActiveSession) return false;
  if (isDismissedThisSession) return false;
  if (state.learningPlanGenerated || progress.isComplete) return false;
  // Show on Day 1 (first login), Day 2, Day 3, and subsequent logins until required setup is complete
  return true;
}

export function getMascotRoadmapMessage(
  progress: RoadmapProgressSummary,
  firstName: string,
  loginDayNumber: number
): { headline: string; body: string; mood: 'welcome' | 'encourage' | 'celebrate' } {
  const name = firstName?.trim() || 'Explorer';
  if (progress.isComplete) {
    return {
      headline: `Way to go, ${name}!`,
      body: 'Every milestone is unlocked! Your personalized Learning Plan is ready to explore.',
      mood: 'celebrate',
    };
  }
  if (progress.nextAction === 'set-goals') {
    return {
      headline: 'Readiness checks crushed!',
      body: 'One last stop: tell me your learning goals so we can craft your custom study path.',
      mood: 'encourage',
    };
  }
  if (progress.nextAction === 'complete-remaining-readiness') {
    const remaining = progress.remainingAssessments.length;
    return {
      headline: 'Awesome start on Milestone 01!',
      body: `You have ${remaining} more subject ${
        remaining === 1 ? 'assessment' : 'assessments'
      } waiting. Finish ${remaining === 1 ? 'it' : 'them'} to unlock Goal Setting!`,
      mood: 'encourage',
    };
  }
  if (loginDayNumber >= 2) {
    return {
      headline: `Welcome back on Day ${loginDayNumber}, ${name}!`,
      body: 'Pick up right where you left off — one quick readiness check gets your Learning Plan rolling.',
      mood: 'welcome',
    };
  }
  return {
    headline: `Hey ${name}, I'm your TutorCloud guide!`,
    body: "Let's map out your adventure together. Start with a quick 3-question Readiness Check!",
    mood: 'welcome',
  };
}

export function generatePersonalizedPlanModules(
  completedAssessments: Record<string, CompletedReadinessRecord>,
  savedGoals: OnboardingGoalRecord[],
  profile: StudentProfile
): LearningPlanModule[] {
  const modules: LearningPlanModule[] = [];
  const records = Object.values(completedAssessments);

  records.forEach((rec, idx) => {
    const tier =
      rec.scorePercent >= 85
        ? 'Honors Challenge'
        : rec.scorePercent >= 60
        ? 'Core Mastery Track'
        : 'Foundations Booster';
    modules.push({
      id: `ilp-onb-${rec.assessmentId}-${idx + 1}`,
      subject: rec.subject,
      title: `${rec.subject}: ${tier} (Grade ${profile.grade} ${profile.curriculum})`,
      week: `Week ${idx + 1}`,
      estimatedMinutes: savedGoals[0]?.dailyMinutes || profile.dailyTargetMinutes || 30,
      completed: false,
      mastery: Math.max(15, Math.min(85, Math.round(rec.scorePercent * 0.8))),
    });
  });

  savedGoals.forEach((goal, idx) => {
    modules.push({
      id: `ilp-goal-${goal.id}`,
      subject: goal.subject,
      title: `${goal.focusArea}: ${goal.title}`,
      week: `Week ${records.length + idx + 1}`,
      estimatedMinutes: goal.dailyMinutes,
      completed: false,
      mastery: 10,
    });
  });

  return modules;
}

export function filterDashboardActionsAfterPopup(
  actions: LearningAction[],
  state: OnboardingState,
  availableChecks: ReadinessAssessmentSpec[]
): LearningAction[] {
  const completedRecords = Object.values(state.completedAssessments);
  if (completedRecords.length === 0) return actions;

  const completedSubjects = new Set(
    completedRecords.map((rec) => rec.subject.trim().toLowerCase())
  );

  const allAvailableCompleted =
    availableChecks.length > 0 &&
    availableChecks.every((check) => Boolean(state.completedAssessments[check.id]));

  return actions.filter((action) => {
    const isReadinessAction =
      action.category.toLowerCase().includes('readiness') ||
      action.primaryCta === 'Start Readiness Check';

    if (!isReadinessAction) return true;
    if (allAvailableCompleted) return false;

    return !completedSubjects.has(action.subject.trim().toLowerCase());
  });
}

export function shouldShowDashboardLearningGoals(state: OnboardingState): boolean {
  return state.savedGoals.length === 0;
}

export function filterDashboardGoalsAfterPopup(
  goals: LearningGoal[],
  state: OnboardingState
): LearningGoal[] {
  // Once the student completes Learning Goals in the onboarding popup, remove Learning Goals from the Dashboard
  if (!shouldShowDashboardLearningGoals(state)) {
    return [];
  }

  const completedSubjects = new Set(
    Object.values(state.completedAssessments).map((rec) =>
      rec.subject.trim().toLowerCase()
    )
  );
  if (completedSubjects.size === 0) return goals;

  // Also remove any placeholder "Readiness Check - <Subject>" goal card whose readiness check was completed in the popup
  return goals.filter((goal) => {
    const isReadinessGoal = goal.title.toLowerCase().includes('readiness check');
    if (!isReadinessGoal) return true;
    return !completedSubjects.has(goal.subject.trim().toLowerCase());
  });
}

const STORAGE_PREFIX = 'tutorcloud_onboarding_v1:';

export function getOnboardingStorageKey(email: string): string {
  const normalized = (email || 'student@tutorcloud.edu').trim().toLowerCase();
  return `${STORAGE_PREFIX}${normalized}`;
}

export function loadOnboardingState(
  email: string,
  todayKey: string = getTodayDateKey()
): OnboardingState {
  const fallback = createInitialOnboardingState(todayKey);
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(getOnboardingStorageKey(email));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    const hydrated: OnboardingState = {
      completedAssessments:
        parsed.completedAssessments && typeof parsed.completedAssessments === 'object'
          ? parsed.completedAssessments
          : {},
      savedGoals: Array.isArray(parsed.savedGoals) ? parsed.savedGoals : [],
      learningPlanGenerated: Boolean(parsed.learningPlanGenerated),
      loginDays: Array.isArray(parsed.loginDays) ? parsed.loginDays : [],
      lastDismissedDate:
        typeof parsed.lastDismissedDate === 'string' ? parsed.lastDismissedDate : null,
    };
    return recordLoginDay(hydrated, todayKey);
  } catch {
    return fallback;
  }
}

export function saveOnboardingState(email: string, state: OnboardingState): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(getOnboardingStorageKey(email), JSON.stringify(state));
  } catch {
    // Ignore quota/private-mode storage errors cleanly
  }
}
