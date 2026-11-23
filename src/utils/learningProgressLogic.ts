export type ProgressSubjectFilter =
  | 'All Subjects'
  | 'Mathematics'
  | 'English'
  | 'Science'
  | 'Social Studies';

export type ProgressTimeframeFilter =
  | 'This Week'
  | 'This Month'
  | 'This Term'
  | 'All Time';

export type ProgressActivityFilter =
  | 'All Activities'
  | 'Tutor Sessions'
  | 'Practice Sets'
  | 'Homework'
  | 'Quizzes';

export type TrendViewMode = 'monthly' | 'subject' | 'weekly';
export type TrendMetricMode = 'mastery' | 'accuracy' | 'hours';

export interface WeeklyKpiSummary {
  currentStreakDays: number;
  bestStreakDays: number;
  scheduledSessionsCompleted: number;
  completionRate: number;
  tutorSessions: number;
  practiceSets: number;
  homeworkCount: number;
  quizzesCount: number;
  weeklyDeltaPercent: number;
}

export interface MonthlyBarDatum {
  key: string;
  label: string;
  mastery: number;
  accuracy: number;
  hours: number;
  sessions: number;
  highlighted?: boolean;
  deltaFromPrev: number;
}

export interface WeeklyTrendPoint {
  week: string;
  yourMastery: number;
  aiPrediction: number;
  classAverage: number;
}

export interface TargetGoalItem {
  id: string;
  title: string;
  subject: Exclude<ProgressSubjectFilter, 'All Subjects'>;
  progress: number;
  metaText: string;
  accent: 'blue' | 'amber';
}

export interface StrengthItem {
  id: string;
  title: string;
  subject: Exclude<ProgressSubjectFilter, 'All Subjects'>;
  tagLabel: string;
  description: string;
  scorePercent: number;
  icon: 'sigma' | 'flask' | 'book' | 'globe';
}

export interface PracticeNeedItem {
  id: string;
  title: string;
  subject: Exclude<ProgressSubjectFilter, 'All Subjects'>;
  priority: 'High Priority' | 'Medium';
  description: string;
  masteryPercent: number;
  recommendedTopic: string;
  icon: 'edit' | 'calendar' | 'sigma' | 'flask';
}

export interface WinMilestoneItem {
  id: string;
  title: string;
  subtitle: string;
  tone: 'amber' | 'sky' | 'emerald';
  icon: 'medal' | 'sparkle' | 'flame';
}

export const PROGRESS_SUBJECT_OPTIONS: ProgressSubjectFilter[] = [
  'All Subjects',
  'Mathematics',
  'English',
  'Science',
  'Social Studies',
];

export const PROGRESS_TIMEFRAME_OPTIONS: ProgressTimeframeFilter[] = [
  'This Week',
  'This Month',
  'This Term',
  'All Time',
];

export const PROGRESS_ACTIVITY_OPTIONS: ProgressActivityFilter[] = [
  'All Activities',
  'Tutor Sessions',
  'Practice Sets',
  'Homework',
  'Quizzes',
];

export const INITIAL_TARGET_GOALS: TargetGoalItem[] = [
  {
    id: 'tg-math-curriculum',
    title: 'Complete Grade 9 Mathematics Curriculum',
    subject: 'Mathematics',
    progress: 85,
    metaText: 'Due in 4 weeks · 3 modules remaining',
    accent: 'blue',
  },
  {
    id: 'tg-writing-lexicon',
    title: 'Improve Creative Writing Lexicon Score',
    subject: 'English',
    progress: 62,
    metaText: 'Personal Goal · Active engagement required',
    accent: 'amber',
  },
];

export const INITIAL_WIN_MILESTONES: WinMilestoneItem[] = [
  {
    id: 'win-weekly-hero',
    title: 'Weekly Hero',
    subtitle: 'Awarded for top engagement',
    tone: 'amber',
    icon: 'medal',
  },
  {
    id: 'win-math-wizard',
    title: 'Math Wizard',
    subtitle: 'Perfect algebra score',
    tone: 'sky',
    icon: 'sparkle',
  },
  {
    id: 'win-7day-streak',
    title: '7-Day Streak',
    subtitle: 'Consistent daily practice',
    tone: 'emerald',
    icon: 'flame',
  },
];

export const ALL_STRENGTHS: StrengthItem[] = [
  {
    id: 'str-algebra',
    title: 'Algebraic Reasoning',
    subject: 'Mathematics',
    tagLabel: 'Mastery 95%',
    description:
      'Consistently scores above 95% in linear equations and complex variable substitution.',
    scorePercent: 95,
    icon: 'sigma',
  },
  {
    id: 'str-scientific',
    title: 'Scientific Methodology',
    subject: 'Science',
    tagLabel: 'Expert',
    description:
      'Strong understanding of experimental design and empirical data analysis.',
    scorePercent: 92,
    icon: 'flask',
  },
  {
    id: 'str-reading',
    title: 'Literary Theme Analysis',
    subject: 'English',
    tagLabel: 'Mastery 91%',
    description:
      'Accurately identifies central motifs and supports textual claims with clear evidence.',
    scorePercent: 91,
    icon: 'book',
  },
  {
    id: 'str-civics',
    title: 'Primary Source Interpretation',
    subject: 'Social Studies',
    tagLabel: 'Mastery 89%',
    description:
      'Synthesizes historical documents and connects cause-and-effect across regions.',
    scorePercent: 89,
    icon: 'globe',
  },
];

export const ALL_PRACTICE_NEEDS: PracticeNeedItem[] = [
  {
    id: 'need-mla',
    title: 'Writing Structure (MLA)',
    subject: 'English',
    priority: 'High Priority',
    description:
      'Needs sharper mastery of correctly formatted in-text citations. Practice Module 4 recommended.',
    masteryPercent: 42,
    recommendedTopic: 'MLA In-Text Citations & Essay Structure',
    icon: 'edit',
  },
  {
    id: 'need-chronology',
    title: 'Chronological Sequencing',
    subject: 'Social Studies',
    priority: 'Medium',
    description:
      'Historical timelines in Social Studies. Focus on the Renaissance period links.',
    masteryPercent: 58,
    recommendedTopic: 'Renaissance Historical Timelines',
    icon: 'calendar',
  },
  {
    id: 'need-quadratics',
    title: 'Quadratic Factoring & Graphs',
    subject: 'Mathematics',
    priority: 'Medium',
    description:
      'Occasional sign errors when factoring non-monic quadratics and locating vertex coordinates.',
    masteryPercent: 61,
    recommendedTopic: 'Factoring Quadratics & Parabola Vertices',
    icon: 'sigma',
  },
  {
    id: 'need-stoichiometry',
    title: 'Balancing Chemical Equations',
    subject: 'Science',
    priority: 'High Priority',
    description:
      'Review conservation of mass ratios for polyatomic reactions before the upcoming lab quiz.',
    masteryPercent: 48,
    recommendedTopic: 'Balancing Chemical Reactions',
    icon: 'flask',
  },
];

const SUBJECT_MODIFIERS: Record<
  ProgressSubjectFilter,
  { masteryOffset: number; accuracyOffset: number; hoursMultiplier: number; activityScale: number }
> = {
  'All Subjects': { masteryOffset: 0, accuracyOffset: 0, hoursMultiplier: 1, activityScale: 1 },
  Mathematics: { masteryOffset: 6, accuracyOffset: 5, hoursMultiplier: 0.42, activityScale: 0.45 },
  English: { masteryOffset: -4, accuracyOffset: -3, hoursMultiplier: 0.28, activityScale: 0.35 },
  Science: { masteryOffset: 3, accuracyOffset: 4, hoursMultiplier: 0.3, activityScale: 0.35 },
  'Social Studies': { masteryOffset: -6, accuracyOffset: -4, hoursMultiplier: 0.22, activityScale: 0.25 },
};

const TIMEFRAME_MULTIPLIER: Record<ProgressTimeframeFilter, number> = {
  'This Week': 0.5,
  'This Month': 1,
  'This Term': 3,
  'All Time': 5,
};

const BASE_MONTHLY_SERIES: {
  key: string;
  label: string;
  mastery: number;
  accuracy: number;
  hours: number;
  sessions: number;
  highlighted?: boolean;
}[] = [
  { key: 'jan', label: 'Jan', mastery: 44, accuracy: 48, hours: 6.2, sessions: 4 },
  { key: 'feb', label: 'Feb', mastery: 56, accuracy: 59, hours: 7.5, sessions: 5 },
  { key: 'mar', label: 'Mar', mastery: 62, accuracy: 64, hours: 8.1, sessions: 6 },
  { key: 'apr', label: 'Apr', mastery: 74, accuracy: 72, hours: 9.4, sessions: 7 },
  { key: 'may', label: 'May', mastery: 80, accuracy: 78, hours: 10.2, sessions: 8 },
  { key: 'jun', label: 'Jun', mastery: 88, accuracy: 86, hours: 12.6, sessions: 10, highlighted: true },
  { key: 'jul', label: 'July', mastery: 81, accuracy: 80, hours: 11.0, sessions: 9 },
  { key: 'aug', label: 'Aug', mastery: 50, accuracy: 54, hours: 5.8, sessions: 4, highlighted: true },
  { key: 'sep', label: 'Sep', mastery: 82, accuracy: 81, hours: 10.8, sessions: 8 },
  { key: 'oct', label: 'Oct', mastery: 70, accuracy: 73, hours: 9.2, sessions: 7, highlighted: true },
  { key: 'nov', label: 'Nov', mastery: 81, accuracy: 83, hours: 11.4, sessions: 9 },
  { key: 'dec', label: 'Dec', mastery: 70, accuracy: 74, hours: 9.0, sessions: 7, highlighted: true },
];

const BASE_WEEKLY_SERIES: WeeklyTrendPoint[] = [
  { week: 'Week 1', yourMastery: 65, aiPrediction: 63, classAverage: 65 },
  { week: 'Week 2', yourMastery: 69, aiPrediction: 68, classAverage: 68 },
  { week: 'Week 3', yourMastery: 72, aiPrediction: 71, classAverage: 72 },
  { week: 'Week 4', yourMastery: 78, aiPrediction: 76, classAverage: 77 },
  { week: 'Week 5', yourMastery: 75, aiPrediction: 79, classAverage: 75 },
  { week: 'Week 6', yourMastery: 83, aiPrediction: 84, classAverage: 83 },
  { week: 'Week 7', yourMastery: 87, aiPrediction: 88, classAverage: 86 },
  { week: 'Week 8', yourMastery: 90, aiPrediction: 91, classAverage: 89 },
];

function clampPercent(val: number): number {
  return Math.max(12, Math.min(100, Math.round(val)));
}

export function computeWeeklyKpis(params: {
  subject: ProgressSubjectFilter;
  timeframe: ProgressTimeframeFilter;
  activity: ProgressActivityFilter;
  liveStreakDays: number;
  liveCompletedQuizzes: number;
  livePlanCompletionPercent: number;
}): WeeklyKpiSummary {
  const {
    subject,
    timeframe,
    activity,
    liveStreakDays,
    liveCompletedQuizzes,
    livePlanCompletionPercent,
  } = params;

  const subMod = SUBJECT_MODIFIERS[subject];
  const tfMult = TIMEFRAME_MULTIPLIER[timeframe];

  // Keep default ("All Subjects" + "This Month" + "All Activities") close to reference while honoring live app state
  const isDefaultView =
    subject === 'All Subjects' &&
    timeframe === 'This Month' &&
    activity === 'All Activities';

  const baseTutor = isDefaultView ? 3 : Math.max(1, Math.round(4 * tfMult * subMod.activityScale));
  const basePractice = isDefaultView
    ? 4
    : Math.max(1, Math.round(5 * tfMult * subMod.activityScale));
  const baseHomework = isDefaultView
    ? 2
    : Math.max(1, Math.round(3 * tfMult * subMod.activityScale));
  const baseQuizzes = isDefaultView
    ? Math.max(1, 1 + liveCompletedQuizzes)
    : Math.max(1, Math.round((2 + liveCompletedQuizzes) * tfMult * subMod.activityScale));

  const completionRate = isDefaultView
    ? Math.max(10, Math.min(100, livePlanCompletionPercent > 0 ? livePlanCompletionPercent : 64))
    : clampPercent(
        (livePlanCompletionPercent > 0 ? livePlanCompletionPercent : 64) +
          subMod.masteryOffset +
          (timeframe === 'This Term' ? 8 : timeframe === 'All Time' ? 12 : 0)
      );

  return {
    currentStreakDays: Math.max(1, liveStreakDays),
    bestStreakDays: Math.max(liveStreakDays, timeframe === 'All Time' ? 12 : timeframe === 'This Term' ? 7 : Math.max(liveStreakDays, 4)),
    scheduledSessionsCompleted: Math.max(1, Math.round(3 * tfMult * subMod.activityScale)),
    completionRate,
    tutorSessions:
      activity === 'All Activities' || activity === 'Tutor Sessions' ? baseTutor : 0,
    practiceSets:
      activity === 'All Activities' || activity === 'Practice Sets' ? basePractice : 0,
    homeworkCount:
      activity === 'All Activities' || activity === 'Homework' ? baseHomework : 0,
    quizzesCount:
      activity === 'All Activities' || activity === 'Quizzes' ? baseQuizzes : 0,
    weeklyDeltaPercent: Math.round(6 + subMod.masteryOffset * 0.5),
  };
}

export function getGrowthBarData(params: {
  subject: ProgressSubjectFilter;
  timeframe: ProgressTimeframeFilter;
  activity: ProgressActivityFilter;
  viewMode: TrendViewMode;
}): MonthlyBarDatum[] {
  const { subject, timeframe, activity, viewMode } = params;
  const subMod = SUBJECT_MODIFIERS[subject];
  const activityOffset =
    activity === 'Quizzes'
      ? 4
      : activity === 'Tutor Sessions'
      ? 5
      : activity === 'Homework'
      ? -2
      : activity === 'Practice Sets'
      ? 2
      : 0;
  const tfOffset =
    timeframe === 'This Week' ? -3 : timeframe === 'This Term' ? 3 : timeframe === 'All Time' ? 5 : 0;

  if (viewMode === 'subject') {
    const subjects: {
      key: string;
      label: string;
      mastery: number;
      accuracy: number;
      hours: number;
      sessions: number;
      highlighted?: boolean;
    }[] = [
      { key: 'math', label: 'Math', mastery: 88, accuracy: 91, hours: 14.5, sessions: 11, highlighted: true },
      { key: 'eng', label: 'English', mastery: 72, accuracy: 74, hours: 9.8, sessions: 8 },
      { key: 'sci', label: 'Science', mastery: 84, accuracy: 86, hours: 11.2, sessions: 9, highlighted: true },
      { key: 'soc', label: 'Social', mastery: 66, accuracy: 69, hours: 7.4, sessions: 6 },
      { key: 'writing', label: 'Writing', mastery: 58, accuracy: 61, hours: 6.5, sessions: 5, highlighted: true },
      { key: 'logic', label: 'Logic', mastery: 79, accuracy: 82, hours: 8.6, sessions: 7 },
    ];
    return subjects.map((item, idx) => {
      const m = clampPercent(item.mastery + activityOffset + tfOffset);
      const a = clampPercent(item.accuracy + activityOffset + tfOffset);
      const prevM = idx > 0 ? clampPercent(subjects[idx - 1].mastery + activityOffset + tfOffset) : m;
      return {
        ...item,
        mastery: m,
        accuracy: a,
        hours: Number((item.hours * (timeframe === 'This Week' ? 0.35 : 1)).toFixed(1)),
        deltaFromPrev: m - prevM,
      };
    });
  }

  if (viewMode === 'weekly') {
    const days = [
      { key: 'mon', label: 'Mon', mastery: 68, accuracy: 70, hours: 1.2, sessions: 1 },
      { key: 'tue', label: 'Tue', mastery: 74, accuracy: 76, hours: 1.5, sessions: 2 },
      { key: 'wed', label: 'Wed', mastery: 86, accuracy: 88, hours: 2.1, sessions: 2, highlighted: true },
      { key: 'thu', label: 'Thu', mastery: 71, accuracy: 73, hours: 1.4, sessions: 1 },
      { key: 'fri', label: 'Fri', mastery: 89, accuracy: 90, hours: 2.4, sessions: 3, highlighted: true },
      { key: 'sat', label: 'Sat', mastery: 64, accuracy: 67, hours: 1.0, sessions: 1 },
      { key: 'sun', label: 'Sun', mastery: 78, accuracy: 80, hours: 1.6, sessions: 2, highlighted: true },
    ];
    return days.map((item, idx) => {
      const m = clampPercent(item.mastery + subMod.masteryOffset + activityOffset);
      const a = clampPercent(item.accuracy + subMod.accuracyOffset + activityOffset);
      const prevM = idx > 0 ? clampPercent(days[idx - 1].mastery + subMod.masteryOffset + activityOffset) : m;
      return {
        ...item,
        mastery: m,
        accuracy: a,
        hours: Number(Math.max(0.4, item.hours * subMod.hoursMultiplier + 0.4).toFixed(1)),
        deltaFromPrev: m - prevM,
      };
    });
  }

  return BASE_MONTHLY_SERIES.map((item, idx) => {
    const mastery = clampPercent(item.mastery + subMod.masteryOffset + activityOffset + tfOffset);
    const accuracy = clampPercent(item.accuracy + subMod.accuracyOffset + activityOffset + tfOffset);
    const prevMastery =
      idx > 0
        ? clampPercent(
            BASE_MONTHLY_SERIES[idx - 1].mastery +
              subMod.masteryOffset +
              activityOffset +
              tfOffset
          )
        : mastery;
    return {
      ...item,
      mastery,
      accuracy,
      hours: Number(Math.max(1.2, item.hours * subMod.hoursMultiplier).toFixed(1)),
      sessions: Math.max(1, Math.round(item.sessions * subMod.activityScale)),
      deltaFromPrev: mastery - prevMastery,
    };
  });
}

export function getWeeklyLineSeries(params: {
  subject: ProgressSubjectFilter;
  activity: ProgressActivityFilter;
}): WeeklyTrendPoint[] {
  const subMod = SUBJECT_MODIFIERS[params.subject];
  const actOffset =
    params.activity === 'Quizzes'
      ? 3
      : params.activity === 'Tutor Sessions'
      ? 4
      : params.activity === 'Homework'
      ? -2
      : 0;

  return BASE_WEEKLY_SERIES.map((pt) => ({
    week: pt.week,
    yourMastery: clampPercent(pt.yourMastery + subMod.masteryOffset + actOffset),
    aiPrediction: clampPercent(pt.aiPrediction + subMod.masteryOffset + actOffset + 2),
    classAverage: clampPercent(pt.classAverage + Math.round(subMod.masteryOffset * 0.35)),
  }));
}

export function filterStrengthsAndNeeds(subject: ProgressSubjectFilter): {
  strengths: StrengthItem[];
  needs: PracticeNeedItem[];
} {
  if (subject === 'All Subjects') {
    return {
      strengths: ALL_STRENGTHS.slice(0, 2),
      needs: ALL_PRACTICE_NEEDS.slice(0, 2),
    };
  }
  const strengths = ALL_STRENGTHS.filter((s) => s.subject === subject);
  const needs = ALL_PRACTICE_NEEDS.filter((n) => n.subject === subject);
  return {
    strengths: strengths.length > 0 ? strengths : ALL_STRENGTHS.slice(0, 1),
    needs: needs.length > 0 ? needs : ALL_PRACTICE_NEEDS.slice(0, 1),
  };
}

export function incrementTargetGoalProgress(
  goals: TargetGoalItem[],
  goalId: string,
  delta = 5
): { goals: TargetGoalItem[]; updatedGoal: TargetGoalItem | null } {
  let updatedGoal: TargetGoalItem | null = null;
  const next = goals.map((goal) => {
    if (goal.id !== goalId) return goal;
    const nextProgress = Math.min(100, Math.max(0, goal.progress + delta));
    const updated: TargetGoalItem = {
      ...goal,
      progress: nextProgress,
      metaText:
        nextProgress >= 100
          ? 'Target reached · Ready to celebrate!'
          : goal.metaText,
    };
    updatedGoal = updated;
    return updated;
  });
  return { goals: next, updatedGoal };
}

export function buildProgressCoachingMessage(params: {
  averageAccuracy: number;
  timeframe: ProgressTimeframeFilter;
  subject: ProgressSubjectFilter;
}): string {
  const scope = params.subject === 'All Subjects' ? 'across all subjects' : `in ${params.subject}`;
  const period = params.timeframe.toLowerCase();
  if (params.averageAccuracy >= 80) {
    return `Your average accuracy ${period} ${scope} is ${params.averageAccuracy}%. Great consistency — you are on track for the Consistency Badge!`;
  }
  return `Your average accuracy ${period} ${scope} is ${params.averageAccuracy}%. Keep it above 80% to earn your Consistency Badge.`;
}

export function buildExportReportText(params: {
  studentName: string;
  grade: string;
  subject: ProgressSubjectFilter;
  timeframe: ProgressTimeframeFilter;
  activity: ProgressActivityFilter;
  kpis: WeeklyKpiSummary;
  averageMastery: number;
  strengths: StrengthItem[];
  needs: PracticeNeedItem[];
  goals: TargetGoalItem[];
  exportedAt: string;
}): string {
  const lines = [
    `TUTORCLOUD LEARNING PROGRESS REPORT`,
    `===================================`,
    `Student: ${params.studentName} (Grade ${params.grade})`,
    `Filters: ${params.subject} | ${params.timeframe} | ${params.activity}`,
    `Generated: ${params.exportedAt}`,
    ``,
    `WEEKLY SNAPSHOT`,
    `- Current Streak: ${params.kpis.currentStreakDays} days (Best: ${params.kpis.bestStreakDays} days)`,
    `- Completion Rate: ${params.kpis.completionRate}%`,
    `- Average Mastery: ${params.averageMastery}%`,
    `- Activities: ${params.kpis.tutorSessions} Tutor Sessions, ${params.kpis.practiceSets} Practice Sets, ${params.kpis.homeworkCount} Homework, ${params.kpis.quizzesCount} Quizzes`,
    ``,
    `TARGET GOAL PROGRESS`,
    ...params.goals.map((g) => `- ${g.title}: ${g.progress}% (${g.metaText})`),
    ``,
    `KEY STRENGTHS`,
    ...params.strengths.map((s) => `- ${s.title} (${s.tagLabel}): ${s.description}`),
    ``,
    `NEEDS MORE PRACTICE`,
    ...params.needs.map(
      (n) => `- ${n.title} [${n.priority} · ${n.masteryPercent}%]: ${n.description}`
    ),
  ];
  return lines.join('\n');
}

export function validateShareEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return 'Please enter a recipient email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'Please enter a valid email address (e.g. parent@example.com).';
  }
  return null;
}
