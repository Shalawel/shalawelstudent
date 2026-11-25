import type { NavSectionId } from '../types/dashboard';

export type BadgeStatus = 'earned' | 'in_progress' | 'locked';

export type AchievementCategoryId =
  | 'LJ'
  | 'PM'
  | 'AS'
  | 'NS'
  | 'CD'
  | 'HI'
  | 'IN'
  | 'SP'
  | 'AT';

export type BadgeIconKind =
  | 'academy'
  | 'compass'
  | 'trophy'
  | 'target'
  | 'quiz'
  | 'folder'
  | 'notebook'
  | 'flame'
  | 'lightbulb'
  | 'shield'
  | 'sparkle'
  | 'crown'
  | 'flag'
  | 'check'
  | 'rocket';

export interface AchievementCategory {
  id: AchievementCategoryId;
  name: string;
  description: string;
  accentHex: string;
  accentLightHex: string;
  iconBgHex: string;
  defaultExpanded: boolean;
}

export interface AchievementBadge {
  id: string;
  code: string;
  categoryId: AchievementCategoryId;
  title: string;
  description: string;
  requirement: string;
  status: BadgeStatus;
  xp: number;
  earnedDate?: string;
  progressCurrent: number;
  progressTarget: number;
  displayFormat: 'fraction' | 'percent';
  iconKind: BadgeIconKind;
  activitySection: NavSectionId;
  activityLabel: string;
  stepDelta: number;
  spotlightPriority?: number;
}

export interface AchievementStats {
  total: number;
  earned: number;
  inProgress: number;
  locked: number;
  totalXp: number;
  levelInfo: XpLevelInfo;
}

export interface XpLevelInfo {
  level: number;
  title: string;
  currentLevelMinXp: number;
  nextLevelXp: number;
  progressPercent: number;
  xpToNext: number;
}

export interface FilteredCategoryGroup {
  category: AchievementCategory;
  badges: AchievementBadge[];
  totalInCategory: number;
  earnedInCategory: number;
}

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  {
    id: 'LJ',
    name: 'Learning Journey',
    description: 'Badges for moving through your lessons and goals.',
    accentHex: '#2E7FB2',
    accentLightHex: '#6DB6DF',
    iconBgHex: '#0EA5E9',
    defaultExpanded: true,
  },
  {
    id: 'PM',
    name: 'Practice & Mastery',
    description: 'Badges for practice, quizzes, and getting better at a subject.',
    accentHex: '#8B5CF6',
    accentLightHex: '#C4B5FD',
    iconBgHex: '#8B5CF6',
    defaultExpanded: true,
  },
  {
    id: 'AS',
    name: 'Assignments & Submissions',
    description: 'Badges for finishing and turning in your assignments.',
    accentHex: '#D97706',
    accentLightHex: '#FCD34D',
    iconBgHex: '#F59E0B',
    defaultExpanded: false,
  },
  {
    id: 'NS',
    name: 'Notes & Study Skills',
    description: 'Badges for writing notes and building study habits.',
    accentHex: '#0284C7',
    accentLightHex: '#7DD3FC',
    iconBgHex: '#06B6D4',
    defaultExpanded: false,
  },
  {
    id: 'CD',
    name: 'Consistency & Discipline',
    description: 'Badges for showing up and learning on a steady schedule.',
    accentHex: '#EA580C',
    accentLightHex: '#FDBA74',
    iconBgHex: '#F97316',
    defaultExpanded: false,
  },
  {
    id: 'HI',
    name: 'Help & Improvement',
    description: 'Badges for asking for help and learning from mistakes.',
    accentHex: '#16A34A',
    accentLightHex: '#86EFAC',
    iconBgHex: '#22C55E',
    defaultExpanded: false,
  },
  {
    id: 'IN',
    name: 'Integrity & Responsible Use',
    description: 'Badges for learning honestly and staying focused.',
    accentHex: '#DC2626',
    accentLightHex: '#FCA5A5',
    iconBgHex: '#EF4444',
    defaultExpanded: false,
  },
  {
    id: 'SP',
    name: 'Special & Seasonal',
    description: 'Badges for special events and limited-time challenges.',
    accentHex: '#C026D3',
    accentLightHex: '#F0ABFC',
    iconBgHex: '#D946EF',
    defaultExpanded: false,
  },
  {
    id: 'AT',
    name: 'Achievement Titles',
    description: 'Badges for earning enough badges and experience across TutorCloud.',
    accentHex: '#CA8A04',
    accentLightHex: '#FDE047',
    iconBgHex: '#EAB308',
    defaultExpanded: false,
  },
];

export const INITIAL_ACHIEVEMENT_BADGES: AchievementBadge[] = [
  // Learning Journey (13 badges: 3 Earned, 3 In Progress, 7 Locked)
  {
    id: 'LJ-01',
    code: 'LJ - 01',
    categoryId: 'LJ',
    title: 'First Step',
    description: 'Complete your very first guided AI Tutor lesson on TutorCloud.',
    requirement: 'Complete 1 lesson in any subject',
    status: 'earned',
    xp: 50,
    earnedDate: 'Nov 3, 2026',
    progressCurrent: 1,
    progressTarget: 1,
    displayFormat: 'fraction',
    iconKind: 'academy',
    activitySection: 'learning-plan',
    activityLabel: 'Open Learning Plan',
    stepDelta: 1,
  },
  {
    id: 'LJ-02',
    code: 'LJ - 02',
    categoryId: 'LJ',
    title: 'Steady Starter',
    description: 'Build early learning momentum across multiple guided lessons.',
    requirement: 'Complete 5 lessons across your active subjects',
    status: 'earned',
    xp: 75,
    earnedDate: 'Nov 5, 2026',
    progressCurrent: 5,
    progressTarget: 5,
    displayFormat: 'fraction',
    iconKind: 'academy',
    activitySection: 'learning-plan',
    activityLabel: 'Open Learning Plan',
    stepDelta: 1,
  },
  {
    id: 'LJ-03',
    code: 'LJ - 03',
    categoryId: 'LJ',
    title: 'Concept Pathfinder',
    description: 'Explore core concepts deeply and clear foundational checkpoints.',
    requirement: 'Complete 15 guided lessons with concept check-ins',
    status: 'earned',
    xp: 100,
    earnedDate: 'Nov 6, 2026',
    progressCurrent: 15,
    progressTarget: 15,
    displayFormat: 'fraction',
    iconKind: 'academy',
    activitySection: 'learning-plan',
    activityLabel: 'Open Learning Plan',
    stepDelta: 3,
  },
  {
    id: 'LJ-04',
    code: 'LJ - 04',
    categoryId: 'LJ',
    title: 'Learning Voyager',
    description: 'Navigate through 50 interactive lessons across your curriculum track.',
    requirement: 'Complete 50 lessons across your learning roadmap',
    status: 'in_progress',
    xp: 125,
    progressCurrent: 37,
    progressTarget: 50,
    displayFormat: 'fraction',
    iconKind: 'academy',
    activitySection: 'learning-plan',
    activityLabel: 'Continue Learning Plan',
    stepDelta: 5,
    spotlightPriority: 1,
  },
  {
    id: 'LJ-05',
    code: 'LJ - 05',
    categoryId: 'LJ',
    title: 'Learning Centurion',
    description: 'Reach 100 completed lessons and show long-term academic dedication.',
    requirement: 'Complete 100 guided lessons across TutorCloud',
    status: 'in_progress',
    xp: 150,
    progressCurrent: 37,
    progressTarget: 100,
    displayFormat: 'percent',
    iconKind: 'academy',
    activitySection: 'learning-plan',
    activityLabel: 'Continue Learning Plan',
    stepDelta: 15,
    spotlightPriority: 3,
  },
  {
    id: 'LJ-06',
    code: 'LJ - 06',
    categoryId: 'LJ',
    title: 'Learning Marathoner',
    description: 'Sustain extraordinary dedication through 200 completed lessons.',
    requirement: 'Complete 200 guided lessons across all subjects',
    status: 'in_progress',
    xp: 200,
    progressCurrent: 37,
    progressTarget: 200,
    displayFormat: 'fraction',
    iconKind: 'academy',
    activitySection: 'learning-plan',
    activityLabel: 'Continue Learning Plan',
    stepDelta: 25,
    spotlightPriority: 5,
  },
  {
    id: 'LJ-07',
    code: 'LJ - 07',
    categoryId: 'LJ',
    title: 'Unit Finisher',
    description: 'Complete every lesson and wrap-up checkpoint in an entire unit.',
    requirement: 'Finish 1 full curriculum unit at 80%+ mastery',
    status: 'locked',
    xp: 150,
    progressCurrent: 0,
    progressTarget: 1,
    displayFormat: 'fraction',
    iconKind: 'flag',
    activitySection: 'learning-plan',
    activityLabel: 'View Units',
    stepDelta: 1,
  },
  {
    id: 'LJ-08',
    code: 'LJ - 08',
    categoryId: 'LJ',
    title: 'Dual Unit Pathfinder',
    description: 'Conquer two complete curriculum units across one or more subjects.',
    requirement: 'Finish 2 full curriculum units',
    status: 'locked',
    xp: 300,
    progressCurrent: 0,
    progressTarget: 2,
    displayFormat: 'fraction',
    iconKind: 'compass',
    activitySection: 'learning-plan',
    activityLabel: 'View Units',
    stepDelta: 1,
  },
  {
    id: 'LJ-09',
    code: 'LJ - 09',
    categoryId: 'LJ',
    title: 'Track Achiever',
    description: 'Complete an entire subject learning track from start to finish.',
    requirement: 'Complete 1 full subject track in your Learning Plan',
    status: 'locked',
    xp: 250,
    progressCurrent: 0,
    progressTarget: 1,
    displayFormat: 'fraction',
    iconKind: 'rocket',
    activitySection: 'learning-plan',
    activityLabel: 'Open Learning Plan',
    stepDelta: 1,
  },
  {
    id: 'LJ-10',
    code: 'LJ - 10',
    categoryId: 'LJ',
    title: 'Learning Plan Completer',
    description: 'Finish every milestone in your personalized Individual Learning Plan.',
    requirement: 'Complete 100% of your active Individual Learning Plan',
    status: 'locked',
    xp: 400,
    progressCurrent: 0,
    progressTarget: 4,
    displayFormat: 'fraction',
    iconKind: 'trophy',
    activitySection: 'learning-plan',
    activityLabel: 'Open Learning Plan',
    stepDelta: 1,
  },
  {
    id: 'LJ-11',
    code: 'LJ - 11',
    categoryId: 'LJ',
    title: 'Goal Setter',
    description: 'Define clear, measurable weekly study goals to steer your progress.',
    requirement: 'Create and track 3 personal learning goals',
    status: 'locked',
    xp: 75,
    progressCurrent: 0,
    progressTarget: 3,
    displayFormat: 'fraction',
    iconKind: 'target',
    activitySection: 'dashboard',
    activityLabel: 'Set a Learning Goal',
    stepDelta: 1,
  },
  {
    id: 'LJ-12',
    code: 'LJ - 12',
    categoryId: 'LJ',
    title: 'Goal Achiever',
    description: 'Follow through and reach 100% completion on your learning goals.',
    requirement: 'Complete 5 personal learning goals',
    status: 'locked',
    xp: 200,
    progressCurrent: 0,
    progressTarget: 5,
    displayFormat: 'fraction',
    iconKind: 'trophy',
    activitySection: 'dashboard',
    activityLabel: 'View Learning Goals',
    stepDelta: 1,
  },
  {
    id: 'LJ-13',
    code: 'LJ - 13',
    categoryId: 'LJ',
    title: 'Readiness Check complete',
    description: 'Complete your diagnostic readiness assessment to personalize your roadmap.',
    requirement: 'Finish a subject Readiness Check assessment',
    status: 'locked',
    xp: 50,
    progressCurrent: 0,
    progressTarget: 1,
    displayFormat: 'fraction',
    iconKind: 'check',
    activitySection: 'practice',
    activityLabel: 'Take Readiness Check',
    stepDelta: 1,
  },

  // Practice & Mastery (11 badges: 3 Earned, 3 In Progress, 5 Locked)
  {
    id: 'PM-01',
    code: 'PM - 01',
    categoryId: 'PM',
    title: 'Practice Initiator',
    description: 'Complete your first interactive practice drill with TutorCloud.',
    requirement: 'Solve 10 practice questions',
    status: 'earned',
    xp: 40,
    earnedDate: 'Nov 4, 2026',
    progressCurrent: 10,
    progressTarget: 10,
    displayFormat: 'fraction',
    iconKind: 'quiz',
    activitySection: 'practice',
    activityLabel: 'Open Practice & Readiness',
    stepDelta: 5,
  },
  {
    id: 'PM-02',
    code: 'PM - 02',
    categoryId: 'PM',
    title: 'Practice Navigator',
    description: 'Sharpen your recall by completing 50 targeted practice problems.',
    requirement: 'Complete 50 practice questions across subjects',
    status: 'in_progress',
    xp: 80,
    progressCurrent: 29,
    progressTarget: 50,
    displayFormat: 'fraction',
    iconKind: 'quiz',
    activitySection: 'practice',
    activityLabel: 'Start Practice Drill',
    stepDelta: 7,
    spotlightPriority: 2,
  },
  {
    id: 'PM-03',
    code: 'PM - 03',
    categoryId: 'PM',
    title: 'Practice Strategist',
    description: 'Master problem patterns through 150 deliberate practice questions.',
    requirement: 'Complete 150 practice questions',
    status: 'in_progress',
    xp: 150,
    progressCurrent: 29,
    progressTarget: 150,
    displayFormat: 'fraction',
    iconKind: 'quiz',
    activitySection: 'practice',
    activityLabel: 'Start Practice Drill',
    stepDelta: 20,
    spotlightPriority: 6,
  },
  {
    id: 'PM-04',
    code: 'PM - 04',
    categoryId: 'PM',
    title: 'Quiz Challenger',
    description: 'Put your understanding to the test in your first Smart Quiz.',
    requirement: 'Finish 1 Smart Quiz with at least 70% accuracy',
    status: 'earned',
    xp: 50,
    earnedDate: 'Nov 5, 2026',
    progressCurrent: 1,
    progressTarget: 1,
    displayFormat: 'fraction',
    iconKind: 'quiz',
    activitySection: 'practice',
    activityLabel: 'Launch Smart Quiz',
    stepDelta: 1,
  },
  {
    id: 'PM-05',
    code: 'PM - 05',
    categoryId: 'PM',
    title: 'Quiz Achiever',
    description: 'Deliver high accuracy across consecutive subject quizzes.',
    requirement: 'Score 85% or higher on 3 Smart Quizzes',
    status: 'earned',
    xp: 100,
    earnedDate: 'Nov 5, 2026',
    progressCurrent: 3,
    progressTarget: 3,
    displayFormat: 'fraction',
    iconKind: 'quiz',
    activitySection: 'practice',
    activityLabel: 'Launch Smart Quiz',
    stepDelta: 1,
  },
  {
    id: 'PM-06',
    code: 'PM - 06',
    categoryId: 'PM',
    title: 'Quiz Specialist',
    description: 'Achieve 90%+ mastery across 3 advanced topic quizzes.',
    requirement: 'Score 90%+ on 3 specialist quizzes',
    status: 'in_progress',
    xp: 180,
    progressCurrent: 1,
    progressTarget: 3,
    displayFormat: 'fraction',
    iconKind: 'quiz',
    activitySection: 'practice',
    activityLabel: 'Launch Smart Quiz',
    stepDelta: 1,
    spotlightPriority: 4,
  },
  {
    id: 'PM-07',
    code: 'PM - 07',
    categoryId: 'PM',
    title: 'Mastery Builder',
    description: 'Raise any developing topic above 85% verified mastery.',
    requirement: 'Reach 85% mastery in 3 curriculum topics',
    status: 'locked',
    xp: 120,
    progressCurrent: 0,
    progressTarget: 3,
    displayFormat: 'fraction',
    iconKind: 'target',
    activitySection: 'progress',
    activityLabel: 'View Learning Progress',
    stepDelta: 1,
  },
  {
    id: 'PM-08',
    code: 'PM - 08',
    categoryId: 'PM',
    title: 'Mastery Accelerator',
    description: 'Demonstrate rapid mastery gains across multiple subject domains.',
    requirement: 'Reach 90% mastery in 5 curriculum topics',
    status: 'locked',
    xp: 220,
    progressCurrent: 0,
    progressTarget: 5,
    displayFormat: 'fraction',
    iconKind: 'rocket',
    activitySection: 'progress',
    activityLabel: 'View Learning Progress',
    stepDelta: 1,
  },
  {
    id: 'PM-09',
    code: 'PM - 09',
    categoryId: 'PM',
    title: 'Exam Prep Initiator',
    description: 'Start your first timed exam-style practice simulation.',
    requirement: 'Complete 1 Exam Prep practice session',
    status: 'locked',
    xp: 100,
    progressCurrent: 0,
    progressTarget: 1,
    displayFormat: 'fraction',
    iconKind: 'quiz',
    activitySection: 'practice',
    activityLabel: 'Open Exam Prep',
    stepDelta: 1,
  },
  {
    id: 'PM-10',
    code: 'PM - 10',
    categoryId: 'PM',
    title: 'Exam Prep Improver',
    description: 'Beat your previous exam simulation score by at least 15%.',
    requirement: 'Improve exam prep score by 15% across 2 sessions',
    status: 'locked',
    xp: 200,
    progressCurrent: 0,
    progressTarget: 2,
    displayFormat: 'fraction',
    iconKind: 'trophy',
    activitySection: 'practice',
    activityLabel: 'Open Exam Prep',
    stepDelta: 1,
  },
  {
    id: 'PM-11',
    code: 'PM - 11',
    categoryId: 'PM',
    title: 'Readiness Check Complete',
    description: 'Finish your practice readiness benchmark to calibrate difficulty.',
    requirement: 'Complete 1 full Readiness Benchmark in Practice',
    status: 'locked',
    xp: 50,
    progressCurrent: 0,
    progressTarget: 1,
    displayFormat: 'fraction',
    iconKind: 'check',
    activitySection: 'practice',
    activityLabel: 'Take Readiness Check',
    stepDelta: 1,
  },

  // Assignments & Submissions (5 badges: 0 Earned)
  {
    id: 'AS-01',
    code: 'AS - 01',
    categoryId: 'AS',
    title: 'First Submission',
    description: 'Turn in your first completed homework or study assignment on time.',
    requirement: 'Submit 1 assignment before its deadline',
    status: 'locked',
    xp: 45,
    progressCurrent: 0,
    progressTarget: 1,
    displayFormat: 'fraction',
    iconKind: 'folder',
    activitySection: 'sessions',
    activityLabel: 'Open Learning Plan',
    stepDelta: 1,
  },
  {
    id: 'AS-02',
    code: 'AS - 02',
    categoryId: 'AS',
    title: 'On-Time Finisher',
    description: 'Build reliability by submitting five assignments ahead of schedule.',
    requirement: 'Submit 5 assignments on time',
    status: 'locked',
    xp: 90,
    progressCurrent: 0,
    progressTarget: 5,
    displayFormat: 'fraction',
    iconKind: 'folder',
    activitySection: 'sessions',
    activityLabel: 'Open Learning Plan',
    stepDelta: 1,
  },
  {
    id: 'AS-03',
    code: 'AS - 03',
    categoryId: 'AS',
    title: 'Precision Submitter',
    description: 'Earn top feedback for neat, thorough problem-solving steps.',
    requirement: 'Achieve 90%+ quality score on 3 assignments',
    status: 'locked',
    xp: 120,
    progressCurrent: 0,
    progressTarget: 3,
    displayFormat: 'fraction',
    iconKind: 'check',
    activitySection: 'sessions',
    activityLabel: 'Open Learning Plan',
    stepDelta: 1,
  },
  {
    id: 'AS-04',
    code: 'AS - 04',
    categoryId: 'AS',
    title: 'Early Bird',
    description: 'Submit assignments at least 24 hours before the scheduled due time.',
    requirement: 'Turn in 3 assignments 24+ hours early',
    status: 'locked',
    xp: 110,
    progressCurrent: 0,
    progressTarget: 3,
    displayFormat: 'fraction',
    iconKind: 'rocket',
    activitySection: 'schedule',
    activityLabel: 'Check Schedule',
    stepDelta: 1,
  },
  {
    id: 'AS-05',
    code: 'AS - 05',
    categoryId: 'AS',
    title: 'Assignment Champion',
    description: 'Maintain a spotless submission record across an entire month.',
    requirement: 'Complete 10 consecutive assignments without missing one',
    status: 'locked',
    xp: 220,
    progressCurrent: 0,
    progressTarget: 10,
    displayFormat: 'fraction',
    iconKind: 'trophy',
    activitySection: 'sessions',
    activityLabel: 'Open Learning Plan',
    stepDelta: 2,
  },

  // Notes & Study Skills (5 badges: 0 Earned)
  {
    id: 'NS-01',
    code: 'NS - 01',
    categoryId: 'NS',
    title: 'Note Starter',
    description: 'Capture your first structured study note after a lesson.',
    requirement: 'Create 1 study note in Notes & Resources',
    status: 'locked',
    xp: 40,
    progressCurrent: 0,
    progressTarget: 1,
    displayFormat: 'fraction',
    iconKind: 'notebook',
    activitySection: 'notes',
    activityLabel: 'Open Notes & Resources',
    stepDelta: 1,
  },
  {
    id: 'NS-02',
    code: 'NS - 02',
    categoryId: 'NS',
    title: 'Organized Thinker',
    description: 'Pin and categorize key notes so exam revision stays effortless.',
    requirement: 'Pin 3 study notes across 2 subjects',
    status: 'locked',
    xp: 75,
    progressCurrent: 0,
    progressTarget: 3,
    displayFormat: 'fraction',
    iconKind: 'notebook',
    activitySection: 'notes',
    activityLabel: 'Open Notes & Resources',
    stepDelta: 1,
  },
  {
    id: 'NS-03',
    code: 'NS - 03',
    categoryId: 'NS',
    title: 'Summary Crafter',
    description: 'Turn complex topics into clear, own-words revision sheets.',
    requirement: 'Write 5 detailed revision notes',
    status: 'locked',
    xp: 120,
    progressCurrent: 0,
    progressTarget: 5,
    displayFormat: 'fraction',
    iconKind: 'notebook',
    activitySection: 'notes',
    activityLabel: 'Open Notes & Resources',
    stepDelta: 1,
  },
  {
    id: 'NS-04',
    code: 'NS - 04',
    categoryId: 'NS',
    title: 'Weak-Area Reviewer',
    description: 'Upload or refine study notes for weak areas to close concept gaps.',
    requirement: 'Update 3 weak-area study guides',
    status: 'locked',
    xp: 140,
    progressCurrent: 0,
    progressTarget: 3,
    displayFormat: 'fraction',
    iconKind: 'lightbulb',
    activitySection: 'notes',
    activityLabel: 'Open Notes & Resources',
    stepDelta: 1,
  },
  {
    id: 'NS-05',
    code: 'NS - 05',
    categoryId: 'NS',
    title: 'Study Vault Master',
    description: 'Build a comprehensive library of 15 well-organized study notes.',
    requirement: 'Build a library of 15 study notes',
    status: 'locked',
    xp: 200,
    progressCurrent: 0,
    progressTarget: 15,
    displayFormat: 'fraction',
    iconKind: 'trophy',
    activitySection: 'notes',
    activityLabel: 'Open Notes & Resources',
    stepDelta: 3,
  },

  // Consistency & Discipline (6 badges: 0 Earned, 1 In Progress -> brings total In Progress to 7!)
  {
    id: 'CD-01',
    code: 'CD - 01',
    categoryId: 'CD',
    title: '3-Day Spark',
    description: 'Keep your study habit alive by learning three days in a row.',
    requirement: 'Maintain a 3-day active study streak',
    status: 'in_progress',
    xp: 60,
    progressCurrent: 1,
    progressTarget: 3,
    displayFormat: 'fraction',
    iconKind: 'flame',
    activitySection: 'schedule',
    activityLabel: 'View Study Schedule',
    stepDelta: 1,
    spotlightPriority: 7,
  },
  {
    id: 'CD-02',
    code: 'CD - 02',
    categoryId: 'CD',
    title: 'Weekly Rhythm',
    description: 'Show up every single day for a complete 7-day learning week.',
    requirement: 'Maintain a 7-day learning streak',
    status: 'locked',
    xp: 120,
    progressCurrent: 0,
    progressTarget: 7,
    displayFormat: 'fraction',
    iconKind: 'flame',
    activitySection: 'schedule',
    activityLabel: 'View Study Schedule',
    stepDelta: 2,
  },
  {
    id: 'CD-03',
    code: 'CD - 03',
    categoryId: 'CD',
    title: 'Fortnight Focus',
    description: 'Sustain 14 consecutive days of purposeful learning sessions.',
    requirement: 'Maintain a 14-day learning streak',
    status: 'locked',
    xp: 200,
    progressCurrent: 0,
    progressTarget: 14,
    displayFormat: 'fraction',
    iconKind: 'flame',
    activitySection: 'schedule',
    activityLabel: 'View Study Schedule',
    stepDelta: 3,
  },
  {
    id: 'CD-04',
    code: 'CD - 04',
    categoryId: 'CD',
    title: 'Schedule Keeper',
    description: 'Attend five scheduled sessions right on time without rescheduling.',
    requirement: 'Attend 5 scheduled sessions on time',
    status: 'locked',
    xp: 130,
    progressCurrent: 0,
    progressTarget: 5,
    displayFormat: 'fraction',
    iconKind: 'check',
    activitySection: 'schedule',
    activityLabel: 'View Study Schedule',
    stepDelta: 1,
  },
  {
    id: 'CD-05',
    code: 'CD - 05',
    categoryId: 'CD',
    title: 'Weekend Scholar',
    description: 'Dedicate focused study time across four weekend review sessions.',
    requirement: 'Complete 4 weekend review sessions',
    status: 'locked',
    xp: 150,
    progressCurrent: 0,
    progressTarget: 4,
    displayFormat: 'fraction',
    iconKind: 'compass',
    activitySection: 'schedule',
    activityLabel: 'View Study Schedule',
    stepDelta: 1,
  },
  {
    id: 'CD-06',
    code: 'CD - 06',
    categoryId: 'CD',
    title: '30-Day Unstoppable',
    description: 'Reach a full 30-day streak of consistent academic growth.',
    requirement: 'Maintain a 30-day learning streak',
    status: 'locked',
    xp: 350,
    progressCurrent: 0,
    progressTarget: 30,
    displayFormat: 'fraction',
    iconKind: 'trophy',
    activitySection: 'schedule',
    activityLabel: 'View Study Schedule',
    stepDelta: 5,
  },

  // Help & Improvement (3 badges: 0 Earned)
  {
    id: 'HI-01',
    code: 'HI - 01',
    categoryId: 'HI',
    title: 'Curious Questioner',
    description: 'Ask clarifying follow-up questions during AI Tutor sessions.',
    requirement: 'Ask 5 thoughtful questions in AI Classroom',
    status: 'locked',
    xp: 50,
    progressCurrent: 0,
    progressTarget: 5,
    displayFormat: 'fraction',
    iconKind: 'lightbulb',
    activitySection: 'messages',
    activityLabel: 'Open Tutor Messages',
    stepDelta: 1,
  },
  {
    id: 'HI-02',
    code: 'HI - 02',
    categoryId: 'HI',
    title: 'Mistake Transformer',
    description: 'Revisit missed quiz questions and turn them into mastered skills.',
    requirement: 'Correct 10 previously missed practice items',
    status: 'locked',
    xp: 110,
    progressCurrent: 0,
    progressTarget: 10,
    displayFormat: 'fraction',
    iconKind: 'lightbulb',
    activitySection: 'practice',
    activityLabel: 'Practice Weak Areas',
    stepDelta: 2,
  },
  {
    id: 'HI-03',
    code: 'HI - 03',
    categoryId: 'HI',
    title: 'Growth Mindset',
    description: 'Boost a weak topic score by 25% or more through guided revision.',
    requirement: 'Raise a weak-area score by +25%',
    status: 'locked',
    xp: 160,
    progressCurrent: 0,
    progressTarget: 1,
    displayFormat: 'fraction',
    iconKind: 'rocket',
    activitySection: 'progress',
    activityLabel: 'View Learning Progress',
    stepDelta: 1,
  },

  // Integrity & Responsible Use (2 badges: 0 Earned)
  {
    id: 'IN-01',
    code: 'IN - 01',
    categoryId: 'IN',
    title: 'Honest Solver',
    description: 'Work through hints step-by-step instead of skipping straight to answers.',
    requirement: 'Solve 5 homework problems using guided hints',
    status: 'locked',
    xp: 80,
    progressCurrent: 0,
    progressTarget: 5,
    displayFormat: 'fraction',
    iconKind: 'shield',
    activitySection: 'sessions',
    activityLabel: 'Open Learning Plan',
    stepDelta: 1,
  },
  {
    id: 'IN-02',
    code: 'IN - 02',
    categoryId: 'IN',
    title: 'Focused Scholar',
    description: 'Complete full study sessions cleanly without distraction breaks.',
    requirement: 'Complete 5 uninterrupted study sessions',
    status: 'locked',
    xp: 140,
    progressCurrent: 0,
    progressTarget: 5,
    displayFormat: 'fraction',
    iconKind: 'shield',
    activitySection: 'sessions',
    activityLabel: 'Open Learning Plan',
    stepDelta: 1,
  },

  // Special & Seasonal (3 badges: 0 Earned)
  {
    id: 'SP-01',
    code: 'SP - 01',
    categoryId: 'SP',
    title: 'Autumn Sprint',
    description: 'Join the seasonal Term Sprint challenge and complete 3 bonus goals.',
    requirement: 'Complete 3 Term Sprint seasonal challenges',
    status: 'locked',
    xp: 120,
    progressCurrent: 0,
    progressTarget: 3,
    displayFormat: 'fraction',
    iconKind: 'sparkle',
    activitySection: 'dashboard',
    activityLabel: 'Go to Dashboard',
    stepDelta: 1,
  },
  {
    id: 'SP-02',
    code: 'SP - 02',
    categoryId: 'SP',
    title: 'STEM Showcase',
    description: 'Excel in both Mathematics and Science challenges in the same week.',
    requirement: 'Complete 1 Math + 1 Science challenge in a week',
    status: 'locked',
    xp: 150,
    progressCurrent: 0,
    progressTarget: 2,
    displayFormat: 'fraction',
    iconKind: 'sparkle',
    activitySection: 'practice',
    activityLabel: 'Open Practice & Readiness',
    stepDelta: 1,
  },
  {
    id: 'SP-03',
    code: 'SP - 03',
    categoryId: 'SP',
    title: 'Holiday Brain Boost',
    description: 'Keep your mind sharp with a short refresher during term break.',
    requirement: 'Finish 2 break-time refresher lessons',
    status: 'locked',
    xp: 100,
    progressCurrent: 0,
    progressTarget: 2,
    displayFormat: 'fraction',
    iconKind: 'sparkle',
    activitySection: 'learning-plan',
    activityLabel: 'Open Learning Plan',
    stepDelta: 1,
  },

  // Achievement Titles (2 badges: 0 Earned)
  {
    id: 'AT-01',
    code: 'AT - 01',
    categoryId: 'AT',
    title: 'Rising Scholar',
    description: 'Earn 10 TutorCloud badges and cross 1,000 Experience Points.',
    requirement: 'Earn 10 badges across any categories',
    status: 'locked',
    xp: 300,
    progressCurrent: 6,
    progressTarget: 10,
    displayFormat: 'fraction',
    iconKind: 'crown',
    activitySection: 'progress',
    activityLabel: 'View Progress',
    stepDelta: 1,
  },
  {
    id: 'AT-02',
    code: 'AT - 02',
    categoryId: 'AT',
    title: 'TutorCloud Luminary',
    description: 'The pinnacle student honor for earning 25+ badges across all pillars.',
    requirement: 'Earn 25 badges and reach 2,500 XP',
    status: 'locked',
    xp: 500,
    progressCurrent: 6,
    progressTarget: 25,
    displayFormat: 'fraction',
    iconKind: 'crown',
    activitySection: 'progress',
    activityLabel: 'View Progress',
    stepDelta: 2,
  },
];

const XP_LEVEL_TIERS: { level: number; title: string; minXp: number }[] = [
  { level: 1, title: 'Curious Explorer', minXp: 0 },
  { level: 2, title: 'Steady Learner', minXp: 200 },
  { level: 3, title: 'Rising Scholar', minXp: 400 },
  { level: 4, title: 'Concept Voyager', minXp: 700 },
  { level: 5, title: 'Mastery Strategist', minXp: 1100 },
  { level: 6, title: 'Academic Trailblazer', minXp: 1600 },
  { level: 7, title: 'TutorCloud Luminary', minXp: 2300 },
];

export function computeXpLevel(totalXp: number): XpLevelInfo {
  const safeXp = Math.max(0, totalXp);
  let currentTier = XP_LEVEL_TIERS[0];
  let nextTier = XP_LEVEL_TIERS[1];

  for (let i = 0; i < XP_LEVEL_TIERS.length; i++) {
    if (safeXp >= XP_LEVEL_TIERS[i].minXp) {
      currentTier = XP_LEVEL_TIERS[i];
      nextTier = XP_LEVEL_TIERS[i + 1] ?? {
        level: currentTier.level + 1,
        title: 'Grand Scholar',
        minXp: currentTier.minXp + 1000,
      };
    }
  }

  const span = Math.max(1, nextTier.minXp - currentTier.minXp);
  const gained = Math.max(0, safeXp - currentTier.minXp);
  const progressPercent = Math.min(100, Math.round((gained / span) * 100));
  const xpToNext = Math.max(0, nextTier.minXp - safeXp);

  return {
    level: currentTier.level,
    title: currentTier.title,
    currentLevelMinXp: currentTier.minXp,
    nextLevelXp: nextTier.minXp,
    progressPercent,
    xpToNext,
  };
}

export function computeAchievementStats(badges: AchievementBadge[]): AchievementStats {
  let earned = 0;
  let inProgress = 0;
  let locked = 0;
  let totalXp = 0;

  for (const badge of badges) {
    if (badge.status === 'earned') {
      earned += 1;
      totalXp += badge.xp;
    } else if (badge.status === 'in_progress') {
      inProgress += 1;
    } else {
      locked += 1;
    }
  }

  return {
    total: badges.length,
    earned,
    inProgress,
    locked,
    totalXp,
    levelInfo: computeXpLevel(totalXp),
  };
}

export function getBadgeProgressPercent(badge: AchievementBadge): number {
  if (badge.status === 'earned') return 100;
  if (badge.progressTarget <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((badge.progressCurrent / badge.progressTarget) * 100)));
}

export function formatBadgeProgressLabel(badge: AchievementBadge): string {
  if (badge.displayFormat === 'percent') {
    return `${getBadgeProgressPercent(badge)}%`;
  }
  return `${Math.min(badge.progressCurrent, badge.progressTarget)}/${badge.progressTarget}`;
}

export function getNextBadgesToEarn(
  badges: AchievementBadge[],
  limit = 3
): AchievementBadge[] {
  const inProgress = badges.filter((b) => b.status === 'in_progress');
  return [...inProgress]
    .sort((a, b) => {
      const pctDiff = getBadgeProgressPercent(b) - getBadgeProgressPercent(a);
      if (pctDiff !== 0) return pctDiff;
      const prioA = a.spotlightPriority ?? 99;
      const prioB = b.spotlightPriority ?? 99;
      if (prioA !== prioB) return prioA - prioB;
      return b.xp - a.xp;
    })
    .slice(0, limit);
}

export function filterCategoriesAndBadges(
  categories: AchievementCategory[],
  badges: AchievementBadge[],
  query: string,
  statusFilter: 'all' | BadgeStatus
): { groups: FilteredCategoryGroup[]; totalMatched: number } {
  const normalizedQuery = query.trim().toLowerCase();
  const groups: FilteredCategoryGroup[] = [];
  let totalMatched = 0;

  for (const category of categories) {
    const categoryBadges = badges.filter((b) => b.categoryId === category.id);
    const earnedInCategory = categoryBadges.filter((b) => b.status === 'earned').length;
    const categoryMatchesQuery =
      normalizedQuery.length > 0 &&
      (category.name.toLowerCase().includes(normalizedQuery) ||
        category.id.toLowerCase() === normalizedQuery);

    const filtered = categoryBadges.filter((badge) => {
      const statusMatches = statusFilter === 'all' || badge.status === statusFilter;
      if (!statusMatches) return false;
      if (!normalizedQuery) return true;
      if (categoryMatchesQuery) return true;
      return (
        badge.title.toLowerCase().includes(normalizedQuery) ||
        badge.code.toLowerCase().includes(normalizedQuery)
      );
    });

    if (filtered.length > 0 || (!normalizedQuery && statusFilter === 'all')) {
      groups.push({
        category,
        badges: filtered,
        totalInCategory: categoryBadges.length,
        earnedInCategory,
      });
      totalMatched += filtered.length;
    }
  }

  return { groups, totalMatched };
}

export function advanceBadgeProgress(
  badges: AchievementBadge[],
  badgeId: string,
  delta?: number
): { badges: AchievementBadge[]; updatedBadge: AchievementBadge | null; readyToClaim: boolean } {
  let updatedBadge: AchievementBadge | null = null;
  let readyToClaim = false;

  const next = badges.map((badge) => {
    if (badge.id !== badgeId || badge.status === 'earned') return badge;
    const step = delta ?? badge.stepDelta ?? 1;
    const nextCurrent = Math.min(badge.progressTarget, badge.progressCurrent + step);
    const nextBadge: AchievementBadge = {
      ...badge,
      status: 'in_progress',
      progressCurrent: nextCurrent,
    };
    updatedBadge = nextBadge;
    readyToClaim = nextCurrent >= badge.progressTarget;
    return nextBadge;
  });

  return { badges: next, updatedBadge, readyToClaim };
}

export function claimBadgeReward(
  badges: AchievementBadge[],
  badgeId: string,
  earnedDateLabel = 'Nov 22, 2026'
): { badges: AchievementBadge[]; xpAwarded: number; claimedBadge: AchievementBadge | null } {
  let xpAwarded = 0;
  let claimedBadge: AchievementBadge | null = null;

  const next = badges.map((badge) => {
    if (badge.id !== badgeId || badge.status === 'earned') return badge;
    xpAwarded = badge.xp;
    const completed: AchievementBadge = {
      ...badge,
      status: 'earned',
      progressCurrent: badge.progressTarget,
      earnedDate: earnedDateLabel,
    };
    claimedBadge = completed;
    return completed;
  });

  // Sync Achievement Titles earned-count progress automatically
  const earnedCount = next.filter((b) => b.status === 'earned').length;
  const synced = next.map((badge) => {
    if (badge.categoryId === 'AT' && badge.status !== 'earned') {
      return {
        ...badge,
        progressCurrent: Math.min(badge.progressTarget, earnedCount),
      };
    }
    return badge;
  });

  return { badges: synced, xpAwarded, claimedBadge };
}

export function startTrackingBadge(
  badges: AchievementBadge[],
  badgeId: string
): { badges: AchievementBadge[]; updatedBadge: AchievementBadge | null } {
  let updatedBadge: AchievementBadge | null = null;

  const next = badges.map((badge) => {
    if (badge.id !== badgeId || badge.status !== 'locked') return badge;
    const started: AchievementBadge = {
      ...badge,
      status: 'in_progress',
      progressCurrent: Math.max(badge.progressCurrent, 0),
    };
    updatedBadge = started;
    return started;
  });

  return { badges: next, updatedBadge };
}

export function togglePinnedBadge(
  pinnedIds: string[],
  badgeId: string,
  maxPinned = 3
): { pinnedIds: string[]; action: 'pinned' | 'unpinned' | 'limit_reached' } {
  if (pinnedIds.includes(badgeId)) {
    return {
      pinnedIds: pinnedIds.filter((id) => id !== badgeId),
      action: 'unpinned',
    };
  }
  if (pinnedIds.length >= maxPinned) {
    return {
      pinnedIds,
      action: 'limit_reached',
    };
  }
  return {
    pinnedIds: [...pinnedIds, badgeId],
    action: 'pinned',
  };
}
