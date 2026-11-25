export type LearningPlanMode = 'concept-mastery' | 'test-prep';
export type LearningPlanViewMode = 'list' | 'grid';
export type LearningPlanLessonStatus = 'Mastered' | 'In Progress' | 'Not Started';

export type LearningPlanSubject =
  | 'English'
  | 'Mathematics'
  | 'Science'
  | 'Social Science'
  | 'Social Studies';

export const LEARNING_PLAN_SUBJECTS: LearningPlanSubject[] = [
  'English',
  'Mathematics',
  'Science',
  'Social Science',
  'Social Studies',
];

export interface LearningPlanLesson {
  id: string;
  subject: LearningPlanSubject;
  mode: LearningPlanMode;
  title: string;
  category: string;
  status: LearningPlanLessonStatus;
  sourceTag: 'From Your Teacher' | 'AI-Recommended' | 'Requested Topic';
  masteryPercent: number;
  hasNotes: boolean;
  estimatedMinutes: number;
  teacherNote: string;
  summaryPoints: string[];
  lastActivityLabel: string;
}

export interface SubjectCurriculumMeta {
  totalCurriculumLessons: number;
  priorMasteredCount: number;
  priorInProgressCount: number;
  baselineMasterySeed: number;
}

export const SUBJECT_CURRICULUM_META: Record<
  LearningPlanSubject,
  Record<LearningPlanMode, SubjectCurriculumMeta>
> = {
  English: {
    'concept-mastery': {
      totalCurriculumLessons: 199,
      priorMasteredCount: 3,
      priorInProgressCount: 2,
      baselineMasterySeed: 50,
    },
    'test-prep': {
      totalCurriculumLessons: 48,
      priorMasteredCount: 5,
      priorInProgressCount: 1,
      baselineMasterySeed: 64,
    },
  },
  Mathematics: {
    'concept-mastery': {
      totalCurriculumLessons: 164,
      priorMasteredCount: 9,
      priorInProgressCount: 2,
      baselineMasterySeed: 68,
    },
    'test-prep': {
      totalCurriculumLessons: 42,
      priorMasteredCount: 4,
      priorInProgressCount: 2,
      baselineMasterySeed: 58,
    },
  },
  Science: {
    'concept-mastery': {
      totalCurriculumLessons: 132,
      priorMasteredCount: 6,
      priorInProgressCount: 1,
      baselineMasterySeed: 62,
    },
    'test-prep': {
      totalCurriculumLessons: 36,
      priorMasteredCount: 3,
      priorInProgressCount: 1,
      baselineMasterySeed: 54,
    },
  },
  'Social Science': {
    'concept-mastery': {
      totalCurriculumLessons: 96,
      priorMasteredCount: 4,
      priorInProgressCount: 1,
      baselineMasterySeed: 56,
    },
    'test-prep': {
      totalCurriculumLessons: 28,
      priorMasteredCount: 2,
      priorInProgressCount: 1,
      baselineMasterySeed: 48,
    },
  },
  'Social Studies': {
    'concept-mastery': {
      totalCurriculumLessons: 118,
      priorMasteredCount: 5,
      priorInProgressCount: 2,
      baselineMasterySeed: 60,
    },
    'test-prep': {
      totalCurriculumLessons: 32,
      priorMasteredCount: 3,
      priorInProgressCount: 1,
      baselineMasterySeed: 52,
    },
  },
};

export const INITIAL_LEARNING_PLAN_LESSONS: LearningPlanLesson[] = [
  // English — Concept Mastery (First 3 match attached reference verbatim)
  {
    id: 'plan-eng-cm-1',
    subject: 'English',
    mode: 'concept-mastery',
    title: 'Parts of Speech in Context',
    category: 'Grammar & Language',
    status: 'Mastered',
    sourceTag: 'From Your Teacher',
    masteryPercent: 80,
    hasNotes: true,
    estimatedMinutes: 18,
    teacherNote:
      'Strong recognition of nouns, verbs, and modifiers in complex sentences. Review participial adjectives during quick practice.',
    summaryPoints: [
      'Distinguished functional roles of words that shift parts of speech based on sentence context.',
      'Identified noun clauses, prepositional phrases, and adverbial modifiers with 80% verified accuracy.',
      'Applied parallel structure when revising compound sentences.',
    ],
    lastActivityLabel: 'Completed 2 days ago',
  },
  {
    id: 'plan-eng-cm-2',
    subject: 'English',
    mode: 'concept-mastery',
    title: 'Tenses and Consistency',
    category: 'Grammar & Language',
    status: 'Not Started',
    sourceTag: 'From Your Teacher',
    masteryPercent: 0,
    hasNotes: false,
    estimatedMinutes: 20,
    teacherNote:
      'Focus on preventing accidental shifts between past and present tense in narrative paragraphs.',
    summaryPoints: [
      'Maintain consistent verb tense across connected clauses and multi-paragraph narratives.',
      'Recognize intentional tense shifts for flashbacks and universal truths.',
      'Master perfect tenses (has/have/had) for sequencing events clearly.',
    ],
    lastActivityLabel: 'Assigned by Ms. Elena Rivera',
  },
  {
    id: 'plan-eng-cm-3',
    subject: 'English',
    mode: 'concept-mastery',
    title: 'Subject-Verb Agreement (Including Compound Subjects)',
    category: 'Grammar & Language',
    status: 'Not Started',
    sourceTag: 'From Your Teacher',
    masteryPercent: 0,
    hasNotes: false,
    estimatedMinutes: 22,
    teacherNote:
      'Watch for intervening prepositional phrases and subjects joined by either/or vs. and.',
    summaryPoints: [
      'Match singular and plural verbs accurately when compound subjects use "and" vs. "or / nor".',
      'Ignore distracting prepositional phrases sitting between the subject and main verb.',
      'Handle collective nouns and indefinite pronouns (each, everyone, neither) confidently.',
    ],
    lastActivityLabel: 'Assigned by Ms. Elena Rivera',
  },
  {
    id: 'plan-eng-cm-4',
    subject: 'English',
    mode: 'concept-mastery',
    title: 'Close Reading & Textual Evidence Synthesis',
    category: 'Reading & Comprehension',
    status: 'In Progress',
    sourceTag: 'AI-Recommended',
    masteryPercent: 55,
    hasNotes: true,
    estimatedMinutes: 25,
    teacherNote:
      'Great start citing direct quotations—next step is unpacking diction to connect evidence back to your claim.',
    summaryPoints: [
      'Select concise, high-impact quotations that directly prove an analytical thesis.',
      'Embed quotes seamlessly using signal phrases and MLA parenthetical citations.',
      'Analyze author tone shifts through word choice and syntax.',
    ],
    lastActivityLabel: 'Active session yesterday',
  },

  // English — Test Prep
  {
    id: 'plan-eng-tp-1',
    subject: 'English',
    mode: 'test-prep',
    title: 'Timed Grammar & Usage Diagnostic Set',
    category: 'Standardized Test Skills',
    status: 'Mastered',
    sourceTag: 'From Your Teacher',
    masteryPercent: 86,
    hasNotes: true,
    estimatedMinutes: 25,
    teacherNote: 'Completed under target pace with strong accuracy on punctuation and conciseness.',
    summaryPoints: [
      'Eliminated redundancy and comma splices across 20 timed multiple-choice passages.',
      'Maintained 1.1 min/question pacing with zero skipped items.',
      'Verified pronoun-antecedent clarity under exam time pressure.',
    ],
    lastActivityLabel: 'Completed 3 days ago',
  },
  {
    id: 'plan-eng-tp-2',
    subject: 'English',
    mode: 'test-prep',
    title: 'Paired Passage Inference & Author Purpose Sprint',
    category: 'Reading Comprehension Prep',
    status: 'In Progress',
    sourceTag: 'AI-Recommended',
    masteryPercent: 45,
    hasNotes: false,
    estimatedMinutes: 30,
    teacherNote: 'Practice comparing two authors’ claims before reading the answer choices.',
    summaryPoints: [
      'Map main claims and counterarguments across dual nonfiction excerpts.',
      'Spot extreme-word distractor choices quickly.',
      'Cross-verify inference questions with exact line evidence.',
    ],
    lastActivityLabel: 'In progress · 12 mins logged',
  },
  {
    id: 'plan-eng-tp-3',
    subject: 'English',
    mode: 'test-prep',
    title: 'Evidence-Based Essay Outline & Rubric Drill',
    category: 'Timed Writing Prep',
    status: 'Not Started',
    sourceTag: 'From Your Teacher',
    masteryPercent: 0,
    hasNotes: false,
    estimatedMinutes: 35,
    teacherNote: 'Use a 5-minute thesis + evidence outline before drafting body paragraphs.',
    summaryPoints: [
      'Draft a clear, defensible claim with two structured lines of reasoning.',
      'Integrate counterargument and rebuttal smoothly.',
      'Reserve 4 minutes for final verb-tense and transition proofreading.',
    ],
    lastActivityLabel: 'Scheduled for Term 2 Prep',
  },

  // Mathematics — Concept Mastery
  {
    id: 'plan-math-cm-1',
    subject: 'Mathematics',
    mode: 'concept-mastery',
    title: 'Linear Equations & Inequalities in One Variable',
    category: 'Algebra & Expressions',
    status: 'Mastered',
    sourceTag: 'From Your Teacher',
    masteryPercent: 85,
    hasNotes: true,
    estimatedMinutes: 20,
    teacherNote: 'Excellent command of inverse operations and inequality sign flips when dividing by negatives.',
    summaryPoints: [
      'Solved multi-step equations involving distribution and variables on both sides.',
      'Graphed solution sets of compound inequalities on number lines.',
      'Verified answers by back-substitution.',
    ],
    lastActivityLabel: 'Completed yesterday',
  },
  {
    id: 'plan-math-cm-2',
    subject: 'Mathematics',
    mode: 'concept-mastery',
    title: 'Systems of Linear Equations (Substitution & Elimination)',
    category: 'Algebra & Expressions',
    status: 'In Progress',
    sourceTag: 'From Your Teacher',
    masteryPercent: 52,
    hasNotes: true,
    estimatedMinutes: 25,
    teacherNote: 'Compare when elimination saves steps over substitution in word problems.',
    summaryPoints: [
      'Identify whether a system has one solution, no solution, or infinitely many solutions.',
      'Model real-world rate and mixture scenarios with two-variable equations.',
      'Cross-check intersection points graphically.',
    ],
    lastActivityLabel: 'Last practiced 2 days ago',
  },
  {
    id: 'plan-math-cm-3',
    subject: 'Mathematics',
    mode: 'concept-mastery',
    title: 'Factoring Quadratic Expressions & Zero Product Property',
    category: 'Polynomials & Quadratics',
    status: 'Not Started',
    sourceTag: 'From Your Teacher',
    masteryPercent: 0,
    hasNotes: false,
    estimatedMinutes: 24,
    teacherNote: 'Always factor out the greatest common factor (GCF) first before splitting the middle term.',
    summaryPoints: [
      'Factor trinomials of the form ax² + bx + c and difference of squares.',
      'Solve quadratic equations by setting each linear factor equal to zero.',
      'Connect x-intercepts of a parabola to its factored roots.',
    ],
    lastActivityLabel: 'Assigned by Mr. Aaron Patel',
  },

  // Mathematics — Test Prep
  {
    id: 'plan-math-tp-1',
    subject: 'Mathematics',
    mode: 'test-prep',
    title: 'Algebra I Unit 1–3 Mixed Timed Problem Set',
    category: 'Midterm Exam Prep',
    status: 'Mastered',
    sourceTag: 'From Your Teacher',
    masteryPercent: 82,
    hasNotes: true,
    estimatedMinutes: 30,
    teacherNote: 'Consistent pacing across multi-step word problems and slope calculations.',
    summaryPoints: [
      'Completed 15 mixed-topic algebra questions within a 25-minute window.',
      'Avoided distribution sign errors on negative coefficients.',
      'Applied back-solving strategy on multiple-choice systems.',
    ],
    lastActivityLabel: 'Completed 4 days ago',
  },
  {
    id: 'plan-math-tp-2',
    subject: 'Mathematics',
    mode: 'test-prep',
    title: 'Graph Interpretation & Functions Speed Check',
    category: 'Midterm Exam Prep',
    status: 'Not Started',
    sourceTag: 'AI-Recommended',
    masteryPercent: 0,
    hasNotes: false,
    estimatedMinutes: 20,
    teacherNote: 'Read axis units carefully before computing average rate of change.',
    summaryPoints: [
      'Translate slope and y-intercept directly into real-world context.',
      'Evaluate function notation f(x) from tables and graphs.',
      'Compare linear vs. exponential growth curves quickly.',
    ],
    lastActivityLabel: 'Recommended for upcoming quiz',
  },

  // Science — Concept Mastery
  {
    id: 'plan-sci-cm-1',
    subject: 'Science',
    mode: 'concept-mastery',
    title: 'The Water Cycle & Atmospheric Energy Transfer',
    category: 'Earth & Space Science',
    status: 'Mastered',
    sourceTag: 'From Your Teacher',
    masteryPercent: 88,
    hasNotes: true,
    estimatedMinutes: 20,
    teacherNote: 'Clear explanation of solar-driven evaporation, condensation nuclei, and runoff pathways.',
    summaryPoints: [
      'Explained how thermal energy drives evaporation and transpiration.',
      'Modeled condensation, cloud formation, and gravity-driven precipitation.',
      'Connected watershed runoff to groundwater recharge.',
    ],
    lastActivityLabel: 'Completed 1 day ago',
  },
  {
    id: 'plan-sci-cm-2',
    subject: 'Science',
    mode: 'concept-mastery',
    title: 'Balancing Chemical Equations & Conservation of Mass',
    category: 'Physical Science & Chemistry',
    status: 'In Progress',
    sourceTag: 'From Your Teacher',
    masteryPercent: 48,
    hasNotes: false,
    estimatedMinutes: 22,
    teacherNote: 'Remember to adjust coefficients only—never change chemical subscripts.',
    summaryPoints: [
      'Build atom-inventory tables for reactants and products.',
      'Balance synthesis, decomposition, and combustion reactions accurately.',
      'Verify total mass conservation in closed chemical systems.',
    ],
    lastActivityLabel: 'Started 3 days ago',
  },
  {
    id: 'plan-sci-cm-3',
    subject: 'Science',
    mode: 'concept-mastery',
    title: 'Cell Division, Mitosis & Genetic Continuity',
    category: 'Life Sciences',
    status: 'Not Started',
    sourceTag: 'From Your Teacher',
    masteryPercent: 0,
    hasNotes: false,
    estimatedMinutes: 25,
    teacherNote: 'Sequence PMAT phases and explain how spindle fibers ensure identical daughter cells.',
    summaryPoints: [
      'Track chromosome replication during interphase and alignment in metaphase.',
      'Compare cytokinesis in plant versus animal cells.',
      'Explain cell cycle checkpoints and tissue repair.',
    ],
    lastActivityLabel: 'Assigned by Dr. Clara Chen',
  },

  // Science — Test Prep
  {
    id: 'plan-sci-tp-1',
    subject: 'Science',
    mode: 'test-prep',
    title: 'Lab Data Analysis & Experimental Controls Drill',
    category: 'Scientific Inquiry Prep',
    status: 'In Progress',
    sourceTag: 'From Your Teacher',
    masteryPercent: 60,
    hasNotes: true,
    estimatedMinutes: 25,
    teacherNote: 'Strong identification of independent variables; practice citing error bars in conclusions.',
    summaryPoints: [
      'Distinguish independent, dependent, and controlled variables from lab scenarios.',
      'Interpret multi-series scatter plots and trend lines.',
      'Write concise Claim-Evidence-Reasoning responses.',
    ],
    lastActivityLabel: 'In progress · 60% complete',
  },
  {
    id: 'plan-sci-tp-2',
    subject: 'Science',
    mode: 'test-prep',
    title: 'Chemistry & Earth Systems Cumulative Review',
    category: 'Unit Exam Prep',
    status: 'Not Started',
    sourceTag: 'AI-Recommended',
    masteryPercent: 0,
    hasNotes: false,
    estimatedMinutes: 30,
    teacherNote: 'Covers stoichiometry basics, phase changes, and atmospheric pressure.',
    summaryPoints: [
      'Connect particle kinetic energy to states of matter and phase graphs.',
      'Verify balanced equations under timed conditions.',
      'Analyze climate and weather system diagrams.',
    ],
    lastActivityLabel: 'Ready to start',
  },

  // Social Science — Concept Mastery
  {
    id: 'plan-socsci-cm-1',
    subject: 'Social Science',
    mode: 'concept-mastery',
    title: 'Supply, Demand & Market Equilibrium Basics',
    category: 'Economics & Society',
    status: 'Mastered',
    sourceTag: 'From Your Teacher',
    masteryPercent: 84,
    hasNotes: true,
    estimatedMinutes: 18,
    teacherNote: 'Great distinction between movement along a curve and a full demand shift.',
    summaryPoints: [
      'Graph supply and demand curves to identify equilibrium price and quantity.',
      'Predict market surpluses and shortages caused by price floors or ceilings.',
      'Analyze real-world consumer behavior shifts.',
    ],
    lastActivityLabel: 'Completed 5 days ago',
  },
  {
    id: 'plan-socsci-cm-2',
    subject: 'Social Science',
    mode: 'concept-mastery',
    title: 'Research Methods, Surveys & Sampling Bias',
    category: 'Sociology & Inquiry',
    status: 'Not Started',
    sourceTag: 'From Your Teacher',
    masteryPercent: 0,
    hasNotes: false,
    estimatedMinutes: 20,
    teacherNote: 'Evaluate sample size, random selection, and neutral wording in survey design.',
    summaryPoints: [
      'Compare qualitative interviews with quantitative longitudinal studies.',
      'Spot selection bias and leading questions in real polling data.',
      'Distinguish correlation from causation in social research.',
    ],
    lastActivityLabel: 'Assigned this week',
  },

  // Social Science — Test Prep
  {
    id: 'plan-socsci-tp-1',
    subject: 'Social Science',
    mode: 'test-prep',
    title: 'Economic Charts & Policy Scenarios Mock Quiz',
    category: 'Applied Economics Prep',
    status: 'Not Started',
    sourceTag: 'AI-Recommended',
    masteryPercent: 0,
    hasNotes: false,
    estimatedMinutes: 22,
    teacherNote: 'Practice reading inflation, GDP, and elasticity graphs rapidly.',
    summaryPoints: [
      'Interpret shifts in aggregate demand and consumer price index trends.',
      'Evaluate fiscal vs. monetary policy trade-offs.',
      'Eliminate distractors in multi-part scenario prompts.',
    ],
    lastActivityLabel: 'Ready to start',
  },

  // Social Studies — Concept Mastery
  {
    id: 'plan-socstud-cm-1',
    subject: 'Social Studies',
    mode: 'concept-mastery',
    title: 'Constitutional Checks, Balances & Federalism',
    category: 'Civics & Government',
    status: 'Mastered',
    sourceTag: 'From Your Teacher',
    masteryPercent: 90,
    hasNotes: true,
    estimatedMinutes: 20,
    teacherNote: 'Thorough understanding of legislative, executive, and judicial powers.',
    summaryPoints: [
      'Mapped how each branch checks the authority of the other two branches.',
      'Differentiated enumerated federal powers from reserved state powers.',
      'Connected landmark Supreme Court rulings to constitutional principles.',
    ],
    lastActivityLabel: 'Completed 3 days ago',
  },
  {
    id: 'plan-socstud-cm-2',
    subject: 'Social Studies',
    mode: 'concept-mastery',
    title: 'Primary Source Analysis: Industrial Revolution Era',
    category: 'World History',
    status: 'In Progress',
    sourceTag: 'From Your Teacher',
    masteryPercent: 40,
    hasNotes: false,
    estimatedMinutes: 24,
    teacherNote: 'Always corroborate author point of view and historical context when reading 19th-century accounts.',
    summaryPoints: [
      'Apply HIPP (Historical context, Intended audience, Purpose, Point of view) to documents.',
      'Compare factory labor testimonies with parliamentary commission reports.',
      'Trace urbanization and global trade expansion.',
    ],
    lastActivityLabel: 'In progress · 40% complete',
  },
  {
    id: 'plan-socstud-cm-3',
    subject: 'Social Studies',
    mode: 'concept-mastery',
    title: 'Global Trade Networks & Cultural Diffusion',
    category: 'Geography & History',
    status: 'Not Started',
    sourceTag: 'AI-Recommended',
    masteryPercent: 0,
    hasNotes: false,
    estimatedMinutes: 20,
    teacherNote: 'Connect geographic chokepoints and maritime routes to technological exchange.',
    summaryPoints: [
      'Trace Silk Road and Indian Ocean trade corridors on historical maps.',
      'Analyze how commerce spread astronomy, printing, and agricultural crops.',
      'Evaluate environmental impacts of long-distance trade.',
    ],
    lastActivityLabel: 'Recommended next unit',
  },

  // Social Studies — Test Prep
  {
    id: 'plan-socstud-tp-1',
    subject: 'Social Studies',
    mode: 'test-prep',
    title: 'Document-Based Question (DBQ) Timed Practice',
    category: 'History Exam Prep',
    status: 'Not Started',
    sourceTag: 'From Your Teacher',
    masteryPercent: 0,
    hasNotes: false,
    estimatedMinutes: 35,
    teacherNote: 'Group at least 4 documents into clear thematic buckets before writing your thesis.',
    summaryPoints: [
      'Craft a historically defensible thesis addressing causation or continuity/change.',
      'Cite source perspective and outside historical evidence cleanly.',
      'Pace document reading and essay writing within 35 minutes.',
    ],
    lastActivityLabel: 'Scheduled for Unit Review',
  },
];

export function filterLearningPlanLessons(
  lessons: LearningPlanLesson[],
  subject: LearningPlanSubject,
  mode: LearningPlanMode
): LearningPlanLesson[] {
  return lessons.filter((lesson) => lesson.subject === subject && lesson.mode === mode);
}

export interface LearningPlanOverviewStats {
  masteredCount: number;
  inProgressCount: number;
  totalCurriculumLessons: number;
  overallMasteryPercent: number;
  lessonsCompletedPercent: number;
}

export function computeLearningPlanOverview(
  allLessons: LearningPlanLesson[],
  subject: LearningPlanSubject,
  mode: LearningPlanMode
): LearningPlanOverviewStats {
  const activeLessons = filterLearningPlanLessons(allLessons, subject, mode);
  const meta = SUBJECT_CURRICULUM_META[subject][mode];

  const visibleMastered = activeLessons.filter((l) => l.status === 'Mastered').length;
  const visibleInProgress = activeLessons.filter((l) => l.status === 'In Progress').length;
  const customAddedCount = activeLessons.filter((l) => l.sourceTag === 'Requested Topic').length;

  const totalCurriculumLessons = meta.totalCurriculumLessons + customAddedCount;
  const masteredCount = meta.priorMasteredCount + visibleMastered;
  const inProgressCount = meta.priorInProgressCount + visibleInProgress;

  // Compute live mastery anchored cleanly around baseline + visible progress updates
  const initialMatching = filterLearningPlanLessons(INITIAL_LEARNING_PLAN_LESSONS, subject, mode);
  const initialAvg =
    initialMatching.length > 0
      ? initialMatching.reduce((sum, l) => sum + l.masteryPercent, 0) / initialMatching.length
      : 0;
  const currentAvg =
    activeLessons.length > 0
      ? activeLessons.reduce((sum, l) => sum + l.masteryPercent, 0) / activeLessons.length
      : 0;

  const masteryDelta = Math.round(currentAvg - initialAvg);
  const overallMasteryPercent = Math.max(
    0,
    Math.min(100, meta.baselineMasterySeed + masteryDelta)
  );

  const lessonsCompletedPercent =
    totalCurriculumLessons > 0
      ? Math.max(1, Math.min(100, Math.round((masteredCount / totalCurriculumLessons) * 100)))
      : 0;

  return {
    masteredCount,
    inProgressCount,
    totalCurriculumLessons,
    overallMasteryPercent,
    lessonsCompletedPercent,
  };
}

export interface TopicRequestInput {
  subject: LearningPlanSubject;
  mode: LearningPlanMode;
  title: string;
  category: string;
  note: string;
}

export function validateTopicRequest(input: TopicRequestInput): string | null {
  if (input.title.trim().length < 3) {
    return 'Please enter a topic title with at least 3 characters.';
  }
  if (input.category.trim().length < 2) {
    return 'Please enter a unit or category (for example, Grammar & Language).';
  }
  return null;
}

export function createRequestedTopicLesson(input: TopicRequestInput): LearningPlanLesson {
  const cleanTitle = input.title.trim();
  const cleanCategory = input.category.trim();
  const cleanNote = input.note.trim();

  return {
    id: `plan-req-${Date.now()}`,
    subject: input.subject,
    mode: input.mode,
    title: cleanTitle,
    category: cleanCategory,
    status: 'Not Started',
    sourceTag: 'Requested Topic',
    masteryPercent: 0,
    hasNotes: false,
    estimatedMinutes: 20,
    teacherNote:
      cleanNote ||
      `Custom topic requested by student for ${input.subject} (${
        input.mode === 'concept-mastery' ? 'Concept Mastery' : 'Test Prep'
      }).`,
    summaryPoints: [
      `Build foundational understanding of ${cleanTitle}.`,
      `Practice guided examples within ${cleanCategory}.`,
      'Complete a mastery check to lock in retention.',
    ],
    lastActivityLabel: 'Requested just now',
  };
}

export function markLessonStarted(
  lessons: LearningPlanLesson[],
  lessonId: string
): LearningPlanLesson[] {
  return lessons.map((lesson) => {
    if (lesson.id !== lessonId) return lesson;
    if (lesson.status === 'Mastered') return lesson;
    return {
      ...lesson,
      status: 'In Progress',
      masteryPercent: Math.max(lesson.masteryPercent, 20),
      lastActivityLabel: 'Started just now',
    };
  });
}

export function recordLessonPracticeProgress(
  lessons: LearningPlanLesson[],
  lessonId: string,
  scorePercent: number
): LearningPlanLesson[] {
  const clampedScore = Math.max(0, Math.min(100, Math.round(scorePercent)));
  return lessons.map((lesson) => {
    if (lesson.id !== lessonId) return lesson;
    const nextMastery = Math.max(lesson.masteryPercent, clampedScore);
    const nextStatus: LearningPlanLessonStatus =
      nextMastery >= 80 ? 'Mastered' : nextMastery > 0 ? 'In Progress' : lesson.status;
    return {
      ...lesson,
      masteryPercent: nextMastery,
      status: nextStatus,
      lastActivityLabel: 'Updated just now',
    };
  });
}

export function markLessonHasNotes(
  lessons: LearningPlanLesson[],
  subject: string,
  topicTitle?: string
): LearningPlanLesson[] {
  const normalizedTopic = topicTitle?.trim().toLowerCase();
  return lessons.map((lesson) => {
    const sameSubject = lesson.subject.toLowerCase() === subject.toLowerCase();
    const matchesTopic =
      normalizedTopic &&
      (lesson.title.toLowerCase().includes(normalizedTopic) ||
        normalizedTopic.includes(lesson.title.toLowerCase()));
    if (sameSubject && matchesTopic) {
      return { ...lesson, hasNotes: true };
    }
    return lesson;
  });
}
