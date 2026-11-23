export type LearningTrackMode = 'Concept Mastery' | 'Exam Prep';
export type LearningPathViewMode = 'list' | 'grid';
export type LessonStatus = 'Completed' | 'In Progress' | 'Not Started';
export type AnalysisQuestionStatus = 'Correct' | 'Incorrect' | 'Unanswered';
export type AnalysisQuestionFilter = 'all' | 'correct' | 'needs-review';

export interface LearningPathLesson {
  id: string;
  subject: string;
  trackMode: LearningTrackMode;
  title: string;
  domain: string;
  status: LessonStatus;
  sourceLabel: string;
  masteryPercent: number;
  recommendedTone?: 'amber' | 'emerald' | null;
  lastSessionLabel: string;
  durationMins: number;
}

export interface ArchivedLearningPlan {
  id: string;
  title: string;
  subject: string;
  trackMode: LearningTrackMode;
  archivedDateLabel: string;
  lessons: LearningPathLesson[];
}

export interface LearningPathState {
  lessons: LearningPathLesson[];
  archivedPlans: ArchivedLearningPlan[];
}

export interface SessionAnalysisQuestion {
  id: string;
  number: number;
  prompt: string;
  studentAnswer: string | null;
  correctAnswer: string;
  status: AnalysisQuestionStatus;
  explanation: string;
}

export interface SessionAnalysisReportData {
  lessonId: string;
  title: string;
  subject: string;
  timestampLabel: string;
  accuracyPercent: number;
  timeSpentLabel: string;
  correctAnswers: number;
  totalQuestions: number;
  recommendations: string[];
  questions: SessionAnalysisQuestion[];
}

export const LEARNING_PATH_SUBJECTS: string[] = ['English', 'Mathematics', 'Science'];

export const INITIAL_LEARNING_PATH_LESSONS: LearningPathLesson[] = [
  // Mathematics — Concept Mastery
  {
    id: 'lp-math-1',
    subject: 'Mathematics',
    trackMode: 'Concept Mastery',
    title: 'Solving Linear Equations and Inequalities in One Variable - Part 1',
    domain: 'Expressions & Equations',
    status: 'In Progress',
    sourceLabel: 'AI-Generated ILP',
    masteryPercent: 80,
    recommendedTone: null,
    lastSessionLabel: 'Jun 30, 2026, 11:52 AM',
    durationMins: 12,
  },
  {
    id: 'lp-math-2',
    subject: 'Mathematics',
    trackMode: 'Concept Mastery',
    title: 'Solving Linear Equations and Inequalities in One Variable - Part 2',
    domain: 'Expressions & Equations',
    status: 'In Progress',
    sourceLabel: 'AI-Generated ILP',
    masteryPercent: 68,
    recommendedTone: 'amber',
    lastSessionLabel: 'Jul 02, 2026, 04:15 PM',
    durationMins: 15,
  },
  {
    id: 'lp-math-3',
    subject: 'Mathematics',
    trackMode: 'Concept Mastery',
    title: 'Factoring Quadratic Expressions & Systems of Equations',
    domain: 'Expressions & Equations',
    status: 'Completed',
    sourceLabel: 'AI-Generated ILP',
    masteryPercent: 92,
    recommendedTone: 'emerald',
    lastSessionLabel: 'Jul 05, 2026, 05:10 PM',
    durationMins: 18,
  },
  // Mathematics — Exam Prep
  {
    id: 'lp-math-exam-1',
    subject: 'Mathematics',
    trackMode: 'Exam Prep',
    title: 'Timed Algebra I Midterm Drill: Equations & Inequalities',
    domain: 'Exam Readiness · Unit 1–3',
    status: 'In Progress',
    sourceLabel: 'AI-Generated ILP',
    masteryPercent: 76,
    recommendedTone: 'amber',
    lastSessionLabel: 'Jul 04, 2026, 06:00 PM',
    durationMins: 20,
  },
  {
    id: 'lp-math-exam-2',
    subject: 'Mathematics',
    trackMode: 'Exam Prep',
    title: 'Word Problem Modeling & System Verification Sprint',
    domain: 'Exam Readiness · Applied Math',
    status: 'Not Started',
    sourceLabel: 'AI-Generated ILP',
    masteryPercent: 60,
    recommendedTone: 'emerald',
    lastSessionLabel: 'Not started yet',
    durationMins: 15,
  },

  // English — Concept Mastery
  {
    id: 'lp-eng-1',
    subject: 'English',
    trackMode: 'Concept Mastery',
    title: 'Close Reading Strategies for Complex Texts - Part 1',
    domain: 'Reading Literature & Informational Texts',
    status: 'Completed',
    sourceLabel: 'AI-Generated ILP',
    masteryPercent: 84,
    recommendedTone: 'emerald',
    lastSessionLabel: 'Jun 30, 2026, 11:52 AM',
    durationMins: 12,
  },
  {
    id: 'lp-eng-2',
    subject: 'English',
    trackMode: 'Concept Mastery',
    title: 'MLA Evidence Integration & Argumentative Thesis Craft',
    domain: 'Writing & Rhetoric',
    status: 'In Progress',
    sourceLabel: 'AI-Generated ILP',
    masteryPercent: 72,
    recommendedTone: 'amber',
    lastSessionLabel: 'Jul 03, 2026, 03:40 PM',
    durationMins: 14,
  },
  {
    id: 'lp-eng-3',
    subject: 'English',
    trackMode: 'Concept Mastery',
    title: 'Evaluating Rhetorical Devices & Author Purpose',
    domain: 'Language & Critical Analysis',
    status: 'In Progress',
    sourceLabel: 'AI-Generated ILP',
    masteryPercent: 78,
    recommendedTone: null,
    lastSessionLabel: 'Jul 06, 2026, 02:20 PM',
    durationMins: 16,
  },
  // English — Exam Prep
  {
    id: 'lp-eng-exam-1',
    subject: 'English',
    trackMode: 'Exam Prep',
    title: 'Timed Passage Synthesis & Evidence-Based Essay',
    domain: 'Exam Readiness · Writing',
    status: 'In Progress',
    sourceLabel: 'AI-Generated ILP',
    masteryPercent: 80,
    recommendedTone: 'amber',
    lastSessionLabel: 'Jul 05, 2026, 01:30 PM',
    durationMins: 25,
  },

  // Science — Concept Mastery
  {
    id: 'lp-sci-1',
    subject: 'Science',
    trackMode: 'Concept Mastery',
    title: 'Balancing Chemical Equations & Conservation of Mass',
    domain: 'Physical Science & Chemistry',
    status: 'In Progress',
    sourceLabel: 'AI-Generated ILP',
    masteryPercent: 74,
    recommendedTone: 'amber',
    lastSessionLabel: 'Jul 01, 2026, 05:00 PM',
    durationMins: 14,
  },
  {
    id: 'lp-sci-2',
    subject: 'Science',
    trackMode: 'Concept Mastery',
    title: 'Cell Division, Mitosis & Genetic Continuity',
    domain: 'Life Sciences',
    status: 'Completed',
    sourceLabel: 'AI-Generated ILP',
    masteryPercent: 88,
    recommendedTone: 'emerald',
    lastSessionLabel: 'Jul 04, 2026, 10:45 AM',
    durationMins: 16,
  },
  // Science — Exam Prep
  {
    id: 'lp-sci-exam-1',
    subject: 'Science',
    trackMode: 'Exam Prep',
    title: 'Lab Data Interpretation & Experimental Controls Review',
    domain: 'Exam Readiness · Inquiry Skills',
    status: 'In Progress',
    sourceLabel: 'AI-Generated ILP',
    masteryPercent: 82,
    recommendedTone: 'emerald',
    lastSessionLabel: 'Jul 06, 2026, 04:05 PM',
    durationMins: 18,
  },
];

export const INITIAL_ARCHIVED_PLANS: ArchivedLearningPlan[] = [
  {
    id: 'archived-math-goal',
    title: 'Mathematics Goal',
    subject: 'Mathematics',
    trackMode: 'Concept Mastery',
    archivedDateLabel: 'Jun 28, 2026',
    lessons: [
      {
        id: 'lp-math-arch-1',
        subject: 'Mathematics',
        trackMode: 'Concept Mastery',
        title: 'Foundations of Rational Numbers & Integer Operations',
        domain: 'Number Systems',
        status: 'Completed',
        sourceLabel: 'AI-Generated ILP',
        masteryPercent: 94,
        recommendedTone: null,
        lastSessionLabel: 'Jun 24, 2026, 03:00 PM',
        durationMins: 14,
      },
    ],
  },
];

export function computeSubjectPathSummary(lessons: LearningPathLesson[]): {
  completedCount: number;
  inProgressCount: number;
  totalCount: number;
  overallMastery: number;
  completionPercent: number;
} {
  const totalCount = lessons.length;
  if (totalCount === 0) {
    return {
      completedCount: 0,
      inProgressCount: 0,
      totalCount: 0,
      overallMastery: 0,
      completionPercent: 0,
    };
  }

  const completedCount = lessons.filter((l) => l.status === 'Completed').length;
  const inProgressCount = lessons.filter((l) => l.status !== 'Completed').length;
  const overallMastery = Math.round(
    lessons.reduce((sum, l) => sum + l.masteryPercent, 0) / totalCount
  );
  const completionPercent = Math.round((completedCount / totalCount) * 100);

  return {
    completedCount,
    inProgressCount,
    totalCount,
    overallMastery,
    completionPercent,
  };
}

export function reorderLessonInList(
  lessons: LearningPathLesson[],
  lessonId: string,
  direction: 'up' | 'down'
): LearningPathLesson[] {
  const target = lessons.find((l) => l.id === lessonId);
  if (!target) return lessons;

  // Find indices of sibling lessons belonging to the same subject & trackMode
  const siblingIndices: number[] = [];
  lessons.forEach((l, idx) => {
    if (l.subject === target.subject && l.trackMode === target.trackMode) {
      siblingIndices.push(idx);
    }
  });

  const posInSiblings = siblingIndices.findIndex((idx) => lessons[idx].id === lessonId);
  if (posInSiblings === -1) return lessons;

  const swapPos = direction === 'up' ? posInSiblings - 1 : posInSiblings + 1;
  if (swapPos < 0 || swapPos >= siblingIndices.length) return lessons;

  const indexA = siblingIndices[posInSiblings];
  const indexB = siblingIndices[swapPos];

  const copy = [...lessons];
  const temp = copy[indexA];
  copy[indexA] = copy[indexB];
  copy[indexB] = temp;
  return copy;
}

export function validateNewTopicInput(
  title: string,
  domain: string
): string | null {
  if (title.trim().length < 3) {
    return 'Please enter a lesson topic title (at least 3 characters).';
  }
  if (domain.trim().length < 2) {
    return 'Please enter a unit or domain name (for example, Expressions & Equations).';
  }
  return null;
}

export function addLessonToPath(
  lessons: LearningPathLesson[],
  input: {
    subject: string;
    trackMode: LearningTrackMode;
    title: string;
    domain: string;
  }
): LearningPathLesson[] {
  const newLesson: LearningPathLesson = {
    id: `lp-custom-${Date.now()}`,
    subject: input.subject,
    trackMode: input.trackMode,
    title: input.title.trim(),
    domain: input.domain.trim(),
    status: 'Not Started',
    sourceLabel: 'Custom Topic',
    masteryPercent: 0,
    recommendedTone: 'amber',
    lastSessionLabel: 'Added just now',
    durationMins: 15,
  };
  return [...lessons, newLesson];
}

export function archiveSubjectPlan(
  state: LearningPathState,
  subject: string,
  trackMode: LearningTrackMode
): LearningPathState {
  const matching = state.lessons.filter(
    (l) => l.subject === subject && l.trackMode === trackMode
  );
  if (matching.length === 0) return state;

  const remaining = state.lessons.filter(
    (l) => !(l.subject === subject && l.trackMode === trackMode)
  );

  const archivedEntry: ArchivedLearningPlan = {
    id: `archived-${subject.toLowerCase()}-${Date.now()}`,
    title: `${subject} · ${trackMode}`,
    subject,
    trackMode,
    archivedDateLabel: 'Today',
    lessons: matching,
  };

  return {
    lessons: remaining,
    archivedPlans: [archivedEntry, ...state.archivedPlans],
  };
}

export function unarchivePlan(
  state: LearningPathState,
  archivedId: string
): LearningPathState {
  const plan = state.archivedPlans.find((p) => p.id === archivedId);
  if (!plan) return state;

  const existingIds = new Set(state.lessons.map((l) => l.id));
  const restoredLessons = plan.lessons.filter((l) => !existingIds.has(l.id));

  return {
    lessons: [...state.lessons, ...restoredLessons],
    archivedPlans: state.archivedPlans.filter((p) => p.id !== archivedId),
  };
}

export function formatTwoDigitCount(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(2, '0');
}

export function filterAnalysisQuestions(
  questions: SessionAnalysisQuestion[],
  filter: AnalysisQuestionFilter
): SessionAnalysisQuestion[] {
  if (filter === 'all') return questions;
  if (filter === 'correct') {
    return questions.filter((q) => q.status === 'Correct');
  }
  return questions.filter((q) => q.status !== 'Correct');
}

export function buildSessionAnalysisReport(
  lesson: LearningPathLesson
): SessionAnalysisReportData {
  const subjectLower = lesson.subject.toLowerCase();

  if (subjectLower === 'english') {
    const questions: SessionAnalysisQuestion[] = [
      {
        id: `${lesson.id}-q1`,
        number: 1,
        prompt: 'Which annotation strategy best tracks how a narrator’s tone shifts across a passage?',
        studentAnswer: 'Underline loaded diction and margin-note the emotional shift',
        correctAnswer: 'Underline loaded diction and margin-note the emotional shift',
        status: 'Correct',
        explanation:
          'Tracking emotionally charged word choices directly reveals shifts in tone and narrator perspective.',
      },
      {
        id: `${lesson.id}-q2`,
        number: 2,
        prompt: 'How should you format an MLA 9th-edition in-text citation for a quote from page 42 by Toni Morrison?',
        studentAnswer: '(Morrison 42)',
        correctAnswer: '(Morrison 42)',
        status: 'Correct',
        explanation:
          'MLA parenthetical citations include the author’s last name and page number with no comma between them.',
      },
      {
        id: `${lesson.id}-q3`,
        number: 3,
        prompt: 'Which element strengthens an argumentative claim after embedding a direct quotation?',
        studentAnswer: 'Explaining how specific words in the quote prove the claim',
        correctAnswer: 'Explaining how specific words in the quote prove the claim',
        status: 'Correct',
        explanation:
          'Unpacking key phrases connects textual evidence back to your thesis instead of leaving quotes isolated.',
      },
      {
        id: `${lesson.id}-q4`,
        number: 4,
        prompt: 'What is the primary purpose of acknowledging a counterargument in a persuasive essay?',
        studentAnswer: 'To show nuanced reasoning and refute opposing assumptions',
        correctAnswer: 'To show nuanced reasoning and refute opposing assumptions',
        status: 'Correct',
        explanation:
          'Addressing credible counterclaims builds ethos and makes your central argument more persuasive.',
      },
      {
        id: `${lesson.id}-q5`,
        number: 5,
        prompt: 'Identify the rhetorical effect of repeating an opening clause (anaphora) in a closing speech paragraph.',
        studentAnswer: null,
        correctAnswer: 'Builds rhythmic momentum and reinforces the core call to action',
        status: 'Unanswered',
        explanation:
          'Anaphora creates cadence and emphasis, helping listeners remember the speaker’s central message.',
      },
    ];

    const correctAnswers = questions.filter((q) => q.status === 'Correct').length;
    const accuracyPercent = Math.round((correctAnswers / questions.length) * 100);

    return {
      lessonId: lesson.id,
      title: lesson.title,
      subject: lesson.subject,
      timestampLabel: lesson.lastSessionLabel,
      accuracyPercent,
      timeSpentLabel: `${lesson.durationMins} mins`,
      correctAnswers,
      totalQuestions: questions.length,
      recommendations: [
        'Begin with a very short, low-stakes question (e.g., choose from 2–3 options) to ease the student into academic responses',
        'Use a brief, high-interest paragraph and model one annotation, then have the student try one annotation',
        'Set a clear participation goal (e.g., student answers every question with at least one sentence)',
        'Check for barriers (confusion about the task, discomfort, or not knowing what to say) and provide sentence starters for responses',
      ],
      questions,
    };
  }

  if (subjectLower === 'science') {
    const questions: SessionAnalysisQuestion[] = [
      {
        id: `${lesson.id}-q1`,
        number: 1,
        prompt: 'Balance the reaction: __Fe + __O₂ → __Fe₂O₃.',
        studentAnswer: '4Fe + 3O₂ → 2Fe₂O₃',
        correctAnswer: '4Fe + 3O₂ → 2Fe₂O₃',
        status: 'Correct',
        explanation:
          'Multiplying Fe₂O₃ by 2 gives 6 oxygen atoms, balanced by 3O₂ and 4Fe on the reactant side.',
      },
      {
        id: `${lesson.id}-q2`,
        number: 2,
        prompt: 'Which subatomic particles determine an element’s atomic number?',
        studentAnswer: 'Protons in the nucleus',
        correctAnswer: 'Protons in the nucleus',
        status: 'Correct',
        explanation:
          'Every element is uniquely defined by its number of protons (the atomic number Z).',
      },
      {
        id: `${lesson.id}-q3`,
        number: 3,
        prompt: 'During which phase of mitosis do sister chromatids line up along the equator of the cell?',
        studentAnswer: 'Metaphase',
        correctAnswer: 'Metaphase',
        status: 'Correct',
        explanation:
          'In metaphase, spindle fibers attach to centromeres and align chromosomes along the middle plane.',
      },
      {
        id: `${lesson.id}-q4`,
        number: 4,
        prompt: 'If total mass of reactants in a sealed flask is 48.2 g, what is the mass of the products?',
        studentAnswer: '48.2 g',
        correctAnswer: '48.2 g',
        status: 'Correct',
        explanation:
          'By the Law of Conservation of Mass, no atoms are gained or lost in a closed chemical system.',
      },
      {
        id: `${lesson.id}-q5`,
        number: 5,
        prompt: 'Why should an experiment include an unaltered control group alongside test trials?',
        studentAnswer: null,
        correctAnswer: 'To provide a baseline confirming changes are caused by the independent variable',
        status: 'Unanswered',
        explanation:
          'Comparing experimental outcomes against a control isolates the effect of the single tested variable.',
      },
    ];

    const correctAnswers = questions.filter((q) => q.status === 'Correct').length;
    const accuracyPercent = Math.round((correctAnswers / questions.length) * 100);

    return {
      lessonId: lesson.id,
      title: lesson.title,
      subject: lesson.subject,
      timestampLabel: lesson.lastSessionLabel,
      accuracyPercent,
      timeSpentLabel: `${lesson.durationMins} mins`,
      correctAnswers,
      totalQuestions: questions.length,
      recommendations: [
        'Start with an atom-inventory table before assigning stoichiometric coefficients',
        'Model one balancing step aloud while keeping polyatomic ions grouped together',
        'Ask the student to verify mass conservation by recounting each element after balancing',
        'Use structured Claim-Evidence-Reasoning sentence starters when explaining experimental controls',
      ],
      questions,
    };
  }

  // Mathematics (default — matches the exact 5 algebra questions from the Session Analysis Report reference!)
  const mathQuestions: SessionAnalysisQuestion[] = [
    {
      id: `${lesson.id}-q1`,
      number: 1,
      prompt: 'Solve for x: 5(x - 2) = 3x + 6.',
      studentAnswer: lesson.masteryPercent >= 75 ? 'x = 8' : null,
      correctAnswer: 'x = 8',
      status: lesson.masteryPercent >= 75 ? 'Correct' : 'Unanswered',
      explanation:
        'Distribute to get 5x - 10 = 3x + 6, then subtract 3x from both sides (2x - 10 = 6) and add 10 to get 2x = 16, yielding x = 8.',
    },
    {
      id: `${lesson.id}-q2`,
      number: 2,
      prompt: 'Solve the inequality: 2(3x - 4) ≥ 4x + 2.',
      studentAnswer: lesson.masteryPercent >= 75 ? 'x ≥ 5' : null,
      correctAnswer: 'x ≥ 5',
      status: lesson.masteryPercent >= 75 ? 'Correct' : 'Unanswered',
      explanation:
        'Distribute and simplify to get 6x - 8 ≥ 4x + 2, then subtract 4x and add 8 to isolate x (2x ≥ 10). The result is an inequality with boundary value x ≥ 5.',
    },
    {
      id: `${lesson.id}-q3`,
      number: 3,
      prompt: 'Factor completely: x² - 9x + 20.',
      studentAnswer: lesson.masteryPercent >= 70 ? '(x - 4)(x - 5)' : null,
      correctAnswer: '(x - 4)(x - 5)',
      status: lesson.masteryPercent >= 70 ? 'Correct' : 'Unanswered',
      explanation:
        'Find two numbers that multiply to 20 and add to -9. Those numbers are -4 and -5, giving the factored form (x - 4)(x - 5).',
    },
    {
      id: `${lesson.id}-q4`,
      number: 4,
      prompt: 'Simplify: (3x²y)(2xy³).',
      studentAnswer: lesson.masteryPercent >= 65 ? '6x³y⁴' : null,
      correctAnswer: '6x³y⁴',
      status: lesson.masteryPercent >= 65 ? 'Correct' : 'Unanswered',
      explanation:
        'Multiply coefficients: 3 × 2 = 6. Add exponents for like bases: x² · x = x³ and y · y³ = y⁴. The result is 6x³y⁴.',
    },
    {
      id: `${lesson.id}-q5`,
      number: 5,
      prompt: 'Solve the system: x + y = 7, 2x - y = 5.',
      studentAnswer: lesson.masteryPercent >= 90 ? 'x = 4, y = 3' : null,
      correctAnswer: 'x = 4, y = 3',
      status: lesson.masteryPercent >= 90 ? 'Correct' : 'Unanswered',
      explanation:
        'Add the two equations to eliminate y: 3x = 12, so x = 4. Substitute back into x + y = 7 to get y = 3.',
    },
  ];

  const correctAnswers = mathQuestions.filter((q) => q.status === 'Correct').length;
  const accuracyPercent = Math.round((correctAnswers / mathQuestions.length) * 100);

  return {
    lessonId: lesson.id,
    title: lesson.title,
    subject: lesson.subject,
    timestampLabel: lesson.lastSessionLabel,
    accuracyPercent,
    timeSpentLabel: `${lesson.durationMins} mins`,
    correctAnswers,
    totalQuestions: mathQuestions.length,
    recommendations: [
      'Begin with a very short, low-stakes warm-up equation (e.g., 2–3 choices) to build algebraic confidence before multi-step problems',
      'Model one distribution step aloud and ask the student to narrate the inverse operation on the next line',
      'Set a clear verification goal (e.g., substitute the final value of x back into the original equation on every item)',
      'Check for barriers (sign errors with negatives or skipping parentheses) and provide step-by-step equation starters',
    ],
    questions: mathQuestions,
  };
}
