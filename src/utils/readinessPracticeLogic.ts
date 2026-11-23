export type PracticeActivityType = 'Practice' | 'Quiz' | 'Readiness';

export type PracticeStatusFilter =
  | 'All Status'
  | 'Needs Review (<80%)'
  | 'In Progress'
  | 'Completed';

export type ActivityTypeFilter = 'All activity Types' | PracticeActivityType;

export interface ReviewQuestionItem {
  id: string;
  prompt: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ActivityReviewDetail {
  id: string;
  title: string;
  subject: string;
  activityType: PracticeActivityType;
  dateLabel: string;
  accuracyPercent: number;
  durationLabel: string;
  statusNote: string;
  tutorTip: string;
  questions: ReviewQuestionItem[];
}

export interface SavedPracticeSession {
  id: string;
  subject: string;
  topic: string;
  answeredCount: number;
  totalQuestions: number;
  lastSavedLabel: string;
}

export interface TeacherAssignment {
  id: string;
  title: string;
  subject: string;
  activityType: PracticeActivityType;
  status: 'active' | 'completed';
  dueDateLabel?: string;
  completedDateLabel?: string;
  accuracyPercent?: number;
  durationLabel?: string;
}

export interface RevisitConcept {
  id: string;
  title: string;
  subject: string;
  activityType: PracticeActivityType;
  accuracyPercent: number;
  lastAttemptLabel: string;
  coachingNote: string;
}

export interface PracticeActivityRecord {
  id: string;
  title: string;
  subject: string;
  activityType: PracticeActivityType;
  dateLabel: string;
  accuracyPercent: number;
  durationLabel: string;
  statusNote: string;
}

export interface PracticeWorkspaceState {
  savedPractice: SavedPracticeSession[];
  revisitConcepts: RevisitConcept[];
  pastActivities: PracticeActivityRecord[];
}

export const PRACTICE_SUBJECT_OPTIONS: string[] = [
  'All Subjects',
  'Mathematics',
  'English',
  'Science',
  'History',
];

export const PRACTICE_STATUS_OPTIONS: PracticeStatusFilter[] = [
  'All Status',
  'Needs Review (<80%)',
  'In Progress',
  'Completed',
];

export const ACTIVITY_TYPE_OPTIONS: ActivityTypeFilter[] = [
  'All activity Types',
  'Practice',
  'Quiz',
  'Readiness',
];

export const INITIAL_SAVED_PRACTICE: SavedPracticeSession[] = [
  {
    id: 'saved-math-linear-p2',
    subject: 'Mathematics',
    topic: 'Solving Linear Equalities in One Variable - Part 2',
    answeredCount: 3,
    totalQuestions: 5,
    lastSavedLabel: 'Saved 2h ago',
  },
  {
    id: 'saved-science-forces',
    subject: 'Science',
    topic: "Newton's Second Law & Net Force Diagrams",
    answeredCount: 2,
    totalQuestions: 5,
    lastSavedLabel: 'Saved yesterday',
  },
];

export const INITIAL_TEACHER_ASSIGNMENTS: TeacherAssignment[] = [
  {
    id: 'assign-readiness-english',
    title: 'Readiness Check - English',
    subject: 'English',
    activityType: 'Readiness',
    status: 'completed',
    completedDateLabel: 'Jul 06',
    accuracyPercent: 86,
    durationLabel: '6 min 15 sec',
  },
];

export const INITIAL_REVISIT_CONCEPTS: RevisitConcept[] = [
  {
    id: 'revisit-num-sys',
    title: 'Evaluating the Validity of Number System Arguments',
    subject: 'Mathematics',
    activityType: 'Practice',
    accuracyPercent: 60,
    lastAttemptLabel: 'Jun 19',
    coachingNote: "Let's spend a bit more time on this skill.",
  },
  {
    id: 'revisit-linear-ineq',
    title: 'Solving Multi-Step Linear Inequalities',
    subject: 'Mathematics',
    activityType: 'Practice',
    accuracyPercent: 65,
    lastAttemptLabel: 'Jun 24',
    coachingNote: 'Watch sign flips when dividing by a negative number.',
  },
  {
    id: 'revisit-mla-citations',
    title: 'MLA Citations & Evidence Integration',
    subject: 'English',
    activityType: 'Quiz',
    accuracyPercent: 54,
    lastAttemptLabel: 'Jun 28',
    coachingNote: 'Practice pairing direct quotes with page citations.',
  },
  {
    id: 'revisit-stoichiometry',
    title: 'Balancing Chemical Equations & Stoichiometry',
    subject: 'Science',
    activityType: 'Practice',
    accuracyPercent: 58,
    lastAttemptLabel: 'Jul 02',
    coachingNote: 'Balance polyatomic ions as intact groups first.',
  },
  {
    id: 'revisit-primary-sources',
    title: 'Primary Source Perspective & Context Analysis',
    subject: 'History',
    activityType: 'Readiness',
    accuracyPercent: 68,
    lastAttemptLabel: 'Jul 05',
    coachingNote: 'Compare author intent alongside historical date.',
  },
];

export const INITIAL_PAST_ACTIVITIES: PracticeActivityRecord[] = [
  {
    id: 'past-num-sys-1',
    title: 'Evaluating the Validity of Number System Arguments',
    subject: 'Mathematics',
    activityType: 'Practice',
    dateLabel: 'Jul 13',
    accuracyPercent: 40,
    durationLabel: '11 sec',
    statusNote: 'Keep Practicing',
  },
  {
    id: 'past-linear-eq-2',
    title: 'Linear Equations & Slope-Intercept Verification',
    subject: 'Mathematics',
    activityType: 'Quiz',
    dateLabel: 'Jul 11',
    accuracyPercent: 60,
    durationLabel: '2 min 18 sec',
    statusNote: 'Building Confidence',
  },
  {
    id: 'past-mla-essay-3',
    title: 'Argumentative Thesis & MLA Evidence Check',
    subject: 'English',
    activityType: 'Quiz',
    dateLabel: 'Jul 09',
    accuracyPercent: 54,
    durationLabel: '3 min 05 sec',
    statusNote: 'Keep Practicing',
  },
  {
    id: 'past-cell-mitosis-4',
    title: 'Cell Division & Mitosis Quick Diagnostic',
    subject: 'Science',
    activityType: 'Readiness',
    dateLabel: 'Jul 07',
    accuracyPercent: 80,
    durationLabel: '4 min 12 sec',
    statusNote: 'Mastery Reached',
  },
];

export function getAccuracyStatusNote(accuracyPercent: number): string {
  if (accuracyPercent >= 80) return 'Mastery Reached';
  if (accuracyPercent >= 60) return 'Building Confidence';
  return 'Keep Practicing';
}

export function filterSavedPractice(
  items: SavedPracticeSession[],
  subjectFilter: string,
  statusFilter: PracticeStatusFilter
): SavedPracticeSession[] {
  if (statusFilter === 'Completed') return [];
  return items.filter((item) => {
    if (subjectFilter !== 'All Subjects' && item.subject !== subjectFilter) {
      return false;
    }
    return true;
  });
}

export function filterTeacherAssignments(
  assignments: TeacherAssignment[],
  subjectFilter: string,
  statusFilter: PracticeStatusFilter
): { active: TeacherAssignment[]; completed: TeacherAssignment[] } {
  const bySubject = assignments.filter((a) =>
    subjectFilter === 'All Subjects' ? true : a.subject === subjectFilter
  );

  const active =
    statusFilter === 'Completed'
      ? []
      : bySubject.filter((a) => a.status === 'active');

  const completed =
    statusFilter === 'In Progress'
      ? []
      : bySubject.filter((a) => {
          if (a.status !== 'completed') return false;
          if (statusFilter === 'Needs Review (<80%)') {
            return (a.accuracyPercent ?? 100) < 80;
          }
          return true;
        });

  return { active, completed };
}

export function filterRevisitConcepts(
  concepts: RevisitConcept[],
  subjectFilter: string,
  statusFilter: PracticeStatusFilter
): RevisitConcept[] {
  if (statusFilter === 'Completed') return [];
  return concepts.filter((concept) => {
    if (concept.accuracyPercent >= 80) return false;
    if (subjectFilter !== 'All Subjects' && concept.subject !== subjectFilter) {
      return false;
    }
    return true;
  });
}

export function filterPastActivities(
  activities: PracticeActivityRecord[],
  globalSubject: string,
  localSubject: string,
  activityType: ActivityTypeFilter,
  statusFilter: PracticeStatusFilter
): PracticeActivityRecord[] {
  const effectiveSubject =
    localSubject !== 'All Subjects' ? localSubject : globalSubject;

  return activities.filter((item) => {
    if (effectiveSubject !== 'All Subjects' && item.subject !== effectiveSubject) {
      return false;
    }
    if (activityType !== 'All activity Types' && item.activityType !== activityType) {
      return false;
    }
    if (statusFilter === 'Needs Review (<80%)' && item.accuracyPercent >= 80) {
      return false;
    }
    if (statusFilter === 'In Progress') {
      return false;
    }
    return true;
  });
}

export function computeWeeklyPracticeAverage(
  activities: PracticeActivityRecord[]
): {
  averageAccuracy: number;
  targetAccuracy: number;
  badgeUnlocked: boolean;
  bannerMessage: string;
} {
  const targetAccuracy = 80;
  if (activities.length === 0) {
    return {
      averageAccuracy: 0,
      targetAccuracy,
      badgeUnlocked: false,
      bannerMessage:
        'Complete a practice set or quiz this week to start tracking toward your Consistency Badge.',
    };
  }

  const total = activities.reduce((sum, item) => sum + item.accuracyPercent, 0);
  const averageAccuracy = Math.round(total / activities.length);
  const badgeUnlocked = averageAccuracy >= targetAccuracy;

  const bannerMessage = badgeUnlocked
    ? `Your average accuracy this week is ${averageAccuracy}%. You are above the 80% Consistency Badge target!`
    : `Your average accuracy this week is ${averageAccuracy}%. Keep it above 80% to earn your Consistency Badge.`;

  return {
    averageAccuracy,
    targetAccuracy,
    badgeUnlocked,
    bannerMessage,
  };
}

export function recordCompletedPracticeAttempt(
  state: PracticeWorkspaceState,
  attempt: {
    subject: string;
    topic: string;
    score: number;
    activityType?: PracticeActivityType;
    durationLabel?: string;
    dateLabel?: string;
  }
): PracticeWorkspaceState {
  const clampedScore = Math.max(0, Math.min(100, Math.round(attempt.score)));
  const activityType = attempt.activityType ?? 'Practice';
  const dateLabel = attempt.dateLabel ?? 'Today';
  const durationLabel = attempt.durationLabel ?? '1 min 45 sec';
  const normalizedTopic = attempt.topic.trim().toLowerCase();

  // 1. Remove matching saved in-progress practice item once finished
  const nextSaved = state.savedPractice.filter(
    (s) =>
      !(
        s.subject.toLowerCase() === attempt.subject.toLowerCase() &&
        s.topic.trim().toLowerCase() === normalizedTopic
      )
  );

  // 2. Update or graduate matching Revisit Concept
  let matchedRevisit = false;
  const nextRevisit: RevisitConcept[] = [];
  for (const concept of state.revisitConcepts) {
    const sameTopic =
      concept.subject.toLowerCase() === attempt.subject.toLowerCase() &&
      concept.title.trim().toLowerCase() === normalizedTopic;
    if (sameTopic) {
      matchedRevisit = true;
      if (clampedScore < 80) {
        nextRevisit.push({
          ...concept,
          accuracyPercent: clampedScore,
          lastAttemptLabel: dateLabel,
          coachingNote:
            clampedScore >= 65
              ? 'Strong improvement — one more review will lock in mastery.'
              : "Let's spend a bit more time on this skill.",
        });
      }
      // If >= 80%, the concept graduates out of "Concepts You Should Revisit"
    } else {
      nextRevisit.push(concept);
    }
  }

  if (!matchedRevisit && clampedScore < 80) {
    nextRevisit.unshift({
      id: `revisit-${Date.now()}`,
      title: attempt.topic,
      subject: attempt.subject,
      activityType,
      accuracyPercent: clampedScore,
      lastAttemptLabel: dateLabel,
      coachingNote: "Let's spend a bit more time on this skill.",
    });
  }

  // 3. Prepend to Past Practice & Quiz Activity
  const nextPast: PracticeActivityRecord[] = [
    {
      id: `past-${Date.now()}`,
      title: attempt.topic,
      subject: attempt.subject,
      activityType,
      dateLabel,
      accuracyPercent: clampedScore,
      durationLabel,
      statusNote: getAccuracyStatusNote(clampedScore),
    },
    ...state.pastActivities,
  ];

  return {
    savedPractice: nextSaved,
    revisitConcepts: nextRevisit,
    pastActivities: nextPast,
  };
}

export function buildSummaryForItem(input: {
  id: string;
  title: string;
  subject: string;
  activityType: PracticeActivityType;
  dateLabel: string;
  accuracyPercent: number;
  durationLabel?: string;
}): ActivityReviewDetail {
  const accuracy = Math.max(0, Math.min(100, Math.round(input.accuracyPercent)));
  const subjectLower = input.subject.toLowerCase();

  let questions: ReviewQuestionItem[];

  if (subjectLower === 'mathematics') {
    questions = [
      {
        id: `${input.id}-q1`,
        prompt: 'Which number belongs to the set of irrational numbers?',
        studentAnswer: '√7',
        correctAnswer: '√7',
        isCorrect: true,
        explanation:
          '√7 cannot be expressed as a terminating or repeating fraction of integers.',
      },
      {
        id: `${input.id}-q2`,
        prompt: 'Is the sum of a nonzero rational number and an irrational number always irrational?',
        studentAnswer: accuracy >= 75 ? 'Yes, always irrational' : 'Sometimes rational',
        correctAnswer: 'Yes, always irrational',
        isCorrect: accuracy >= 75,
        explanation:
          'Assuming r + i = q leads to i = q - r (a rational number), which is a contradiction.',
      },
      {
        id: `${input.id}-q3`,
        prompt: 'When solving -3x + 4 > 19, what happens to the inequality sign after dividing by -3?',
        studentAnswer: accuracy >= 60 ? 'It reverses to x < -5' : 'It stays x > -5',
        correctAnswer: 'It reverses to x < -5',
        isCorrect: accuracy >= 60,
        explanation:
          'Multiplying or dividing both sides of an inequality by a negative number flips the sign.',
      },
    ];
  } else if (subjectLower === 'english') {
    questions = [
      {
        id: `${input.id}-q1`,
        prompt: 'Which in-text citation correctly follows MLA 9th edition formatting?',
        studentAnswer: '(Morrison 42)',
        correctAnswer: '(Morrison 42)',
        isCorrect: true,
        explanation: 'MLA uses the author last name and page number with no comma between them.',
      },
      {
        id: `${input.id}-q2`,
        prompt: 'Where does the period belong when ending a sentence with an MLA parenthetical citation?',
        studentAnswer: accuracy >= 70 ? 'After the closing parenthesis' : 'Inside the quotation marks before the citation',
        correctAnswer: 'After the closing parenthesis',
        isCorrect: accuracy >= 70,
        explanation:
          'Place the sentence-ending period after the parenthetical citation: "...quote" (Author 18).',
      },
      {
        id: `${input.id}-q3`,
        prompt: 'Which transition best connects textual evidence to an analytical claim?',
        studentAnswer: 'This imagery underscores the narrator’s growing hesitation...',
        correctAnswer: 'This imagery underscores the narrator’s growing hesitation...',
        isCorrect: true,
        explanation:
          'Analytical verbs like "underscores" and "reveals" explain how evidence proves your claim.',
      },
    ];
  } else if (subjectLower === 'science') {
    questions = [
      {
        id: `${input.id}-q1`,
        prompt: 'In the balanced equation 2H₂ + O₂ → 2H₂O, how many total hydrogen atoms are on each side?',
        studentAnswer: '4 hydrogen atoms',
        correctAnswer: '4 hydrogen atoms',
        isCorrect: true,
        explanation: 'Multiply the coefficient (2) by the subscript (2) to get 4 hydrogen atoms.',
      },
      {
        id: `${input.id}-q2`,
        prompt: 'Which phase of mitosis aligns sister chromatids along the cell equator?',
        studentAnswer: accuracy >= 70 ? 'Metaphase' : 'Anaphase',
        correctAnswer: 'Metaphase',
        isCorrect: accuracy >= 70,
        explanation: 'Remember "M for Middle": chromosomes line up at the metaphase plate.',
      },
      {
        id: `${input.id}-q3`,
        prompt: 'What law states that mass is neither created nor destroyed in a chemical reaction?',
        studentAnswer: 'Law of Conservation of Mass',
        correctAnswer: 'Law of Conservation of Mass',
        isCorrect: true,
        explanation: 'Every atom present in the reactants must be accounted for in the products.',
      },
    ];
  } else {
    questions = [
      {
        id: `${input.id}-q1`,
        prompt: 'What makes a diary entry from 1776 a primary source?',
        studentAnswer: 'It was created firsthand during the historical event.',
        correctAnswer: 'It was created firsthand during the historical event.',
        isCorrect: true,
        explanation: 'Primary sources provide direct contemporary evidence from the period studied.',
      },
      {
        id: `${input.id}-q2`,
        prompt: 'Why should historians evaluate a primary source author’s intended audience?',
        studentAnswer: accuracy >= 75 ? 'To identify bias, purpose, and rhetorical framing' : 'To check if it is printed in a textbook',
        correctAnswer: 'To identify bias, purpose, and rhetorical framing',
        isCorrect: accuracy >= 75,
        explanation:
          'Knowing who the author addressed reveals what perspectives were emphasized or omitted.',
      },
    ];
  }

  const tutorTip =
    accuracy >= 80
      ? `Great mastery in ${input.subject}! Try a harder timed quiz or advance to the next unit in your Learning Plan.`
      : `Focus on the missed reasoning steps in ${input.title}. A 5-minute AI Tutor walkthrough before retrying will lift accuracy above 80%.`;

  return {
    id: input.id,
    title: input.title,
    subject: input.subject,
    activityType: input.activityType,
    dateLabel: input.dateLabel,
    accuracyPercent: accuracy,
    durationLabel: input.durationLabel ?? '2 min 10 sec',
    statusNote: getAccuracyStatusNote(accuracy),
    tutorTip,
    questions,
  };
}
