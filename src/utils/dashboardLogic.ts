import type {
  CalendarSession,
  LearningAction,
  LearningGoal,
  LearningPlanModule,
  QuizQuestion,
  SessionColumnStatus,
  StudentProfile,
} from '../types/dashboard';
import { inspectStudentTurn } from './tutorRuntimeOrchestrator';

export interface GoalFormInput {
  title: string;
  subject: string;
  category: string;
  dueDate: string;
}

export interface GoalValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof GoalFormInput, string>>;
}

export function validateGoalInput(input: GoalFormInput): GoalValidationResult {
  const errors: Partial<Record<keyof GoalFormInput, string>> = {};
  if (!input.title.trim() || input.title.trim().length < 3) {
    errors.title = 'Enter a goal title (at least 3 characters).';
  }
  if (!input.subject.trim()) {
    errors.subject = 'Choose a subject.';
  }
  if (!input.category.trim()) {
    errors.category = 'Choose a goal focus.';
  }
  if (!input.dueDate.trim()) {
    errors.dueDate = 'Select a target completion date.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatReadableDate(isoDate: string): string {
  if (!isoDate.includes('-')) return isoDate;
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const m = months[month - 1] ?? 'Jul';
  const paddedDay = String(day).padStart(2, '0');
  return `${paddedDay} ${m}, ${year}`;
}

export function createGoal(goals: LearningGoal[], input: GoalFormInput): LearningGoal[] {
  const nextNumber = goals.length + 1;
  const newGoal: LearningGoal = {
    id: `goal-${Date.now()}-${nextNumber}`,
    label: `Goal ${nextNumber}`,
    dueDate: formatReadableDate(input.dueDate),
    category: input.category.trim(),
    subject: input.subject.trim(),
    title: input.title.trim(),
    progress: 0,
    completed: false,
  };
  return [newGoal, ...goals];
}

export function toggleGoalCompletion(goals: LearningGoal[], goalId: string): LearningGoal[] {
  return goals.map((goal) => {
    if (goal.id !== goalId) return goal;
    const nextCompleted = !goal.completed;
    return {
      ...goal,
      completed: nextCompleted,
      progress: nextCompleted ? 100 : Math.min(goal.progress, 50),
    };
  });
}

export function paginateItems<T>(
  items: T[],
  pageIndex: number,
  pageSize: number
): {
  items: T[];
  totalPages: number;
  safePage: number;
} {
  const safeSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / safeSize));
  const safePage = Math.min(Math.max(0, pageIndex), totalPages - 1);
  const start = safePage * safeSize;
  return {
    items: items.slice(start, start + safeSize),
    totalPages,
    safePage,
  };
}

export function rescheduleSession(
  sessions: CalendarSession[],
  sessionId: string,
  newStatus: SessionColumnStatus,
  newDateKey?: string
): CalendarSession[] {
  return sessions.map((session) =>
    session.id === sessionId
      ? {
          ...session,
          status: newStatus,
          dateKey: newDateKey ?? session.dateKey,
        }
      : session
  );
}

export function groupSessionsByStatus(
  sessions: CalendarSession[],
  dateKey: string
): Record<SessionColumnStatus, CalendarSession[]> {
  const forDay = sessions.filter((s) => s.dateKey === dateKey);
  return {
    missed: forDay.filter((s) => s.status === 'missed'),
    upcoming: forDay.filter((s) => s.status === 'upcoming'),
    scheduled: forDay.filter((s) => s.status === 'scheduled'),
  };
}

export interface QuizEvaluation {
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  readinessTier: 'Needs Foundation' | 'Developing' | 'Proficient' | 'Mastery';
}

export function calculateQuizResult(
  questions: QuizQuestion[],
  selectedAnswers: Record<string, number>
): QuizEvaluation {
  const totalQuestions = questions.length;
  if (totalQuestions === 0) {
    return {
      correctCount: 0,
      totalQuestions: 0,
      percentage: 0,
      readinessTier: 'Needs Foundation',
    };
  }
  const correctCount = questions.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  let readinessTier: QuizEvaluation['readinessTier'] = 'Needs Foundation';
  if (percentage >= 90) readinessTier = 'Mastery';
  else if (percentage >= 70) readinessTier = 'Proficient';
  else if (percentage >= 50) readinessTier = 'Developing';

  return {
    correctCount,
    totalQuestions,
    percentage,
    readinessTier,
  };
}

export function computeProfileCompletion(profile: StudentProfile): {
  percent: number;
  missingFields: string[];
} {
  const missing: string[] = [];
  if (!profile.fullName.trim()) missing.push('Full Name');
  if (!profile.grade.trim()) missing.push('Grade Level');
  if (!profile.curriculum.trim()) missing.push('Curriculum');
  if (profile.subjects.length < 2) missing.push('At least 2 Subjects');
  if (!profile.learningStyle) missing.push('Learning Style');
  if (profile.dailyTargetMinutes < 15) missing.push('Daily Study Target');

  const totalChecks = 6;
  const completedChecks = totalChecks - missing.length;
  return {
    percent: Math.round((completedChecks / totalChecks) * 100),
    missingFields: missing,
  };
}

export function advanceStreak(
  currentStreakDays: number,
  alreadyEarnedToday: boolean
): { streakDays: number; earnedToday: boolean } {
  if (alreadyEarnedToday) {
    return { streakDays: currentStreakDays, earnedToday: true };
  }
  return { streakDays: currentStreakDays + 1, earnedToday: true };
}

export function updateActionAfterCheck(
  actions: LearningAction[],
  actionId: string,
  scorePercent: number
): LearningAction[] {
  return actions.map((action) =>
    action.id === actionId
      ? {
          ...action,
          status: 'Completed',
          score: scorePercent,
          primaryCta: 'View Readiness Report',
          description: `Readiness check completed with ${scorePercent}% mastery. Your individualized plan is ready to customize.`,
        }
      : action
  );
}

export function generateTutorReply(
  userPrompt: string,
  subjectHint: string
): { reply: string; chips: string[] } {
  const inspection = inspectStudentTurn(userPrompt);
  if (inspection.promptInjectionDetected) {
    return {
      reply: `I'm here to help you build genuine understanding in ${subjectHint}, so I can't bypass tutoring rules or change mastery checks. Tell me which topic or step you'd like to practice next!`,
      chips: [
        `Walk me through a ${subjectHint} example`,
        'Check my reasoning on a practice question',
      ],
    };
  }
  if (inspection.hallucinationTrapDetected) {
    return {
      reply:
        "I don't have access to unpublished page numbers or future unverified facts, so I won't make them up. Paste the exact question or concept here and we'll work through the reasoning together!",
      chips: ['I will paste the question here', 'Review the core concept instead'],
    };
  }
  if (inspection.answerDumpRequested) {
    return {
      reply:
        "Instead of handing over the finished answer, let's solve it together one step at a time so it really sticks. What is the very first piece of given information or rule you notice in your problem?",
      chips: ['Give me a small first-step clue', 'Help me set up Step 1'],
    };
  }
  if (inspection.incompleteOrAmbiguousQuestion) {
    return {
      reply: `I'd love to help, but a key detail is missing (${inspection.ambiguityReason || 'problem values or constraints'}). Could you share the exact numbers, equation, or passage line first?`,
      chips: ['Here are the exact numbers', 'Walk me through a similar example first'],
    };
  }
  if (inspection.frustrationDetected || inspection.overloadDetected) {
    return {
      reply: `It's completely fine when ${subjectHint} feels heavy — let's slow down and take just one small piece at a time. Tell me one single part that feels unclear and we'll unpack only that step.`,
      chips: ['Explain just the first step simply', 'Try a quick warm-up example'],
    };
  }

  const lower = userPrompt.toLowerCase();

  if (lower.includes('essay') || lower.includes('thesis') || lower.includes('english')) {
    return {
      reply:
        'A strong Grade 9 CCSS thesis statement makes a clear, arguable claim and previews your supporting reasoning. Try this formula: "[Topic] demonstrates [specific argument] because [Reason A] and [Reason B]." Want to draft one together from your current English reading?',
      chips: [
        'Check my thesis statement',
        'Show a literary analysis example',
        'Practice rhetorical devices',
      ],
    };
  }

  if (
    lower.includes('algebra') ||
    lower.includes('equation') ||
    lower.includes('quadratic') ||
    lower.includes('math') ||
    lower.includes('slope')
  ) {
    return {
      reply:
        'For linear equations in slope-intercept form (y = mx + b), start by identifying the slope m (rise over run) and the y-intercept b. For example, in 2y - 6x = 8, add 6x to both sides to get 2y = 6x + 8, then divide by 2: y = 3x + 4 (slope = 3, y-intercept = 4). Ready for a practice problem?',
      chips: [
        'Give me a practice equation',
        'Explain factoring quadratics',
        'How do I graph inequalities?',
      ],
    };
  }

  if (lower.includes('quiz') || lower.includes('test') || lower.includes('exam')) {
    return {
      reply: `Great strategy! For your upcoming ${subjectHint} assessment, focus on spaced recall: review 3 core concepts for 10 minutes, solve 4 timed questions without notes, and revisit only the missed steps. Would you like a 3-question rapid drill right now?`,
      chips: [
        'Start 3-question rapid drill',
        'Build a 7-day study checklist',
        'Review my weak topics',
      ],
    };
  }

  return {
    reply: `Let's tackle "${userPrompt.trim()}" step by step under Grade 9 CCSS (${subjectHint}). First, tell me which part feels trickiest — understanding the core rule, applying it to word problems, or checking your work under time pressure?`,
    chips: [
      'Walk through the core rule',
      'Try a guided example',
      'Quiz me on this topic',
    ],
  };
}

export interface StartSessionValidationResult {
  valid: boolean;
  errors: {
    subject?: string;
    topic?: string;
  };
}

export function validateStartSessionInput(input: {
  subject: string;
  topic: string;
}): StartSessionValidationResult {
  const errors: StartSessionValidationResult['errors'] = {};
  if (!input.subject.trim()) {
    errors.subject = 'Please select a subject.';
  }
  if (!input.topic.trim() || input.topic.trim().length < 2) {
    errors.topic = 'Please enter or choose a lesson or topic.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildSessionOpeningPrompt(input: {
  helpType: string;
  subject: string;
  topic: string;
  specificQuestion?: string;
}): string {
  const base = `${input.helpType} (${input.subject}): ${input.topic.trim()}`;
  const q = input.specificQuestion?.trim();
  return q ? `${base} — Question: ${q}` : base;
}

/**
 * Returns only incomplete Learning Goals for display on the Dashboard.
 * Once a student completes a goal (completed === true or progress >= 100),
 * it is removed from the Dashboard while remaining in overall progress records.
 */
export function getActiveDashboardGoals(goals: LearningGoal[]): LearningGoal[] {
  return goals.filter((goal) => !goal.completed && goal.progress < 100);
}

/**
 * Transitions a Next Learning Action to "In Progress" with "Resume ILP Generation"
 * when a student closes the Learning Plan Generator before completing it.
 * Never re-opens an action whose Learning Plan is already completed ('Plan Ready').
 */
export function markActionIlpInProgress(
  actions: LearningAction[],
  actionId: string,
  draftTopic?: string
): LearningAction[] {
  return actions.map((action) => {
    if (action.id !== actionId) return action;
    if (action.status === 'Plan Ready') return action;
    return {
      ...action,
      status: 'In Progress',
      primaryCta: 'Resume ILP Generation',
      hasGeneratePlan: false,
      unitTopic: draftTopic && draftTopic.trim() ? draftTopic.trim() : action.unitTopic,
      description:
        'ILP generation was paused in progress. Resume anytime to finish creating your personalized Learning Plan.',
    };
  });
}

/**
 * Marks a Next Learning Action as completed ('Plan Ready') after ILP generation finishes
 * so it is removed from the Dashboard and shown only on the Learning Plan page.
 */
export function markActionIlpCompleted(
  actions: LearningAction[],
  actionId: string,
  moduleTitle: string
): LearningAction[] {
  return actions.map((action) =>
    action.id === actionId
      ? {
          ...action,
          status: 'Plan Ready',
          hasGeneratePlan: false,
          unitTopic: moduleTitle.trim() || action.unitTopic,
          description: `Learning Plan "${moduleTitle.trim() || action.unitTopic}" generated and moved to your Learning Plan page.`,
        }
      : action
  );
}

/**
 * Filters out Next Learning Actions whose Learning Plan generation is complete ('Plan Ready')
 * so completed Learning Plans only appear in the Learning Plan page, not on the Dashboard.
 */
export function getDashboardVisibleActions(actions: LearningAction[]): LearningAction[] {
  return actions.filter((action) => action.status !== 'Plan Ready');
}

export function buildIlpModuleFromGeneration(input: {
  subject: string;
  moduleTitle: string;
  pace: string;
  existingCount: number;
  nowMs?: number;
}): LearningPlanModule {
  const estimatedMinutes = input.pace.includes('60')
    ? 60
    : input.pace.includes('30')
    ? 30
    : 45;
  return {
    id: `mod-${input.nowMs ?? Date.now()}`,
    subject: input.subject.trim() || 'Mathematics',
    title: input.moduleTitle.trim() || `${input.subject} Personalized Track`,
    week: `Week ${input.existingCount + 1}`,
    estimatedMinutes,
    completed: false,
    mastery: 15,
  };
}


