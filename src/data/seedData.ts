import type {
  AiLesson,
  CalendarDay,
  CalendarSession,
  ChatTurn,
  LearningAction,
  LearningGoal,
  LearningPlanModule,
  NotificationItem,
  QuizQuestion,
  StudentProfile,
  StudyNote,
  TutorMessageThread,
} from '../types/dashboard';

export const INITIAL_PROFILE: StudentProfile = {
  firstName: 'Jane',
  fullName: 'Jane Carter',
  grade: '9',
  curriculum: 'CCSS',
  subjects: ['English', 'Mathematics', 'Science'],
  learningStyle: 'Interactive',
  dailyTargetMinutes: 30,
  email: 'jane.carter@tutorcloud.edu',
};

export const INITIAL_LEARNING_ACTIONS: LearningAction[] = [
  {
    id: 'act-ilp-1',
    category: 'Readiness Check',
    focus: 'Concept Mastery',
    status: 'In Progress',
    subject: 'English',
    description: 'Help me understand your current level so I can design the right plan for you.',
    primaryCta: 'Resume ILP Generation',
    hasGeneratePlan: false,
    unitTopic: 'Reading Comprehension & Evidence Citation',
  },
  {
    id: 'act-term2-2',
    category: 'Readiness Check',
    focus: 'Concept Mastery',
    status: 'Term 2',
    subject: 'Mathematics',
    description: 'Help me understand your current level so I can design the right plan for you.',
    primaryCta: 'Start Readiness Check',
    hasGeneratePlan: true,
    unitTopic: 'Linear Equations & Proportional Reasoning',
  },
  {
    id: 'act-final-3',
    category: 'Readiness Check',
    focus: 'Exam Preparation',
    status: 'Final',
    subject: 'Science',
    description: 'Help me understand your current level so I can design the right plan for you.',
    primaryCta: 'Start Readiness Check',
    hasGeneratePlan: true,
    unitTopic: 'Water Cycle, Earth Systems & Scientific Inquiry',
  },
];

export const INITIAL_GOALS: LearningGoal[] = [
  {
    id: 'goal-1',
    label: 'Goal 1',
    dueDate: '30 Jul, 2026',
    category: 'Concept Mastery',
    subject: 'English',
    title: 'Readiness Check - English',
    progress: 60,
    completed: false,
  },
  {
    id: 'goal-2',
    label: 'Goal 2',
    dueDate: '30 Jul, 2026',
    category: 'Concept Mastery',
    subject: 'Mathematics',
    title: 'Mathematics Goal',
    progress: 45,
    completed: false,
  },
  {
    id: 'goal-3',
    label: 'Goal 3',
    dueDate: '30 Jul, 2026',
    category: 'Concept Mastery',
    subject: 'Mathematics',
    title: 'Mathematics - Term 2',
    progress: 25,
    completed: false,
  },
  {
    id: 'goal-4',
    label: 'Goal 4',
    dueDate: '08 Aug, 2026',
    category: 'Exam Preparation',
    subject: 'Science',
    title: 'Cellular Respiration Lab Prep',
    progress: 35,
    completed: false,
  },
  {
    id: 'goal-5',
    label: 'Goal 5',
    dueDate: '14 Aug, 2026',
    category: 'Concept Mastery',
    subject: 'English',
    title: 'Literary Theme Analysis Essay',
    progress: 80,
    completed: false,
  },
  {
    id: 'goal-6',
    label: 'Goal 6',
    dueDate: '22 Aug, 2026',
    category: 'Exam Preparation',
    subject: 'History',
    title: 'Primary Source Synthesis Check',
    progress: 15,
    completed: false,
  },
  {
    id: 'goal-7',
    label: 'Goal 7',
    dueDate: '29 Aug, 2026',
    category: 'Concept Mastery',
    subject: 'Mathematics',
    title: 'Quadratic Equations Fluency',
    progress: 50,
    completed: false,
  },
];

export const CALENDAR_DAYS: CalendarDay[] = [
  { dateKey: '2026-07-13', weekday: 'Mo', dayNumber: 13 },
  { dateKey: '2026-07-14', weekday: 'Tu', dayNumber: 14 },
  { dateKey: '2026-07-15', weekday: 'We', dayNumber: 15 },
  { dateKey: '2026-07-16', weekday: 'Th', dayNumber: 16 },
  { dateKey: '2026-07-17', weekday: 'Fr', dayNumber: 17 },
  { dateKey: '2026-07-18', weekday: 'Sa', dayNumber: 18 },
  { dateKey: '2026-07-19', weekday: 'Su', dayNumber: 19 },
  { dateKey: '2026-07-20', weekday: 'Mo', dayNumber: 20 },
  { dateKey: '2026-07-21', weekday: 'Tu', dayNumber: 21 },
  { dateKey: '2026-07-22', weekday: 'We', dayNumber: 22 },
  { dateKey: '2026-07-23', weekday: 'Th', dayNumber: 23 },
  { dateKey: '2026-07-24', weekday: 'Fr', dayNumber: 24 },
  { dateKey: '2026-07-25', weekday: 'Sa', dayNumber: 25 },
  { dateKey: '2026-07-26', weekday: 'Su', dayNumber: 26 },
  { dateKey: '2026-07-27', weekday: 'Mo', dayNumber: 27 },
  { dateKey: '2026-07-28', weekday: 'Tu', dayNumber: 28 },
  { dateKey: '2026-07-29', weekday: 'We', dayNumber: 29 },
  { dateKey: '2026-07-30', weekday: 'Th', dayNumber: 30 },
  { dateKey: '2026-07-31', weekday: 'Fr', dayNumber: 31 },
  { dateKey: '2026-08-01', weekday: 'Sa', dayNumber: 1 },
  { dateKey: '2026-08-02', weekday: 'Su', dayNumber: 2 },
  { dateKey: '2026-08-03', weekday: 'Mo', dayNumber: 3 },
  { dateKey: '2026-08-04', weekday: 'Tu', dayNumber: 4 },
  { dateKey: '2026-08-05', weekday: 'We', dayNumber: 5 },
  { dateKey: '2026-08-06', weekday: 'Th', dayNumber: 6 },
];

export const INITIAL_SESSIONS: CalendarSession[] = [
  // Wed 15 (Default active date — matches mockup structure faithfully)
  {
    id: 'ses-15-m1',
    dateKey: '2026-07-15',
    time: '09:00',
    meridiem: 'AM',
    title: 'Design Workshop',
    description: 'Interactive components session',
    status: 'missed',
    tutorName: 'Ms. Elena Rivera',
    subject: 'English',
  },
  {
    id: 'ses-15-m2',
    dateKey: '2026-07-15',
    time: '01:00',
    meridiem: 'PM',
    title: 'Feedback Round',
    description: 'Discuss progress and challenges with team members',
    status: 'missed',
    tutorName: 'Mr. Aaron Patel',
    subject: 'Mathematics',
  },
  {
    id: 'ses-15-m3',
    dateKey: '2026-07-15',
    time: '03:30',
    meridiem: 'PM',
    title: 'Client Presentation',
    description: 'Showcase design concepts and gather client feedback',
    status: 'missed',
    tutorName: 'Dr. Clara Chen',
    subject: 'English',
  },
  {
    id: 'ses-15-u1',
    dateKey: '2026-07-15',
    time: '09:00',
    meridiem: 'AM',
    title: 'Design Workshop',
    description: 'Interactive components session',
    status: 'upcoming',
    tutorName: 'Ms. Elena Rivera',
    subject: 'English',
  },
  {
    id: 'ses-15-u2',
    dateKey: '2026-07-15',
    time: '01:00',
    meridiem: 'PM',
    title: 'Feedback Round',
    description: 'Discuss progress and challenges with team members',
    status: 'upcoming',
    tutorName: 'Mr. Aaron Patel',
    subject: 'Mathematics',
  },
  {
    id: 'ses-15-u3',
    dateKey: '2026-07-15',
    time: '03:30',
    meridiem: 'PM',
    title: 'Client Presentation',
    description: 'Showcase design concepts and gather client feedback',
    status: 'upcoming',
    tutorName: 'Dr. Clara Chen',
    subject: 'Science',
  },
  {
    id: 'ses-15-s1',
    dateKey: '2026-07-15',
    time: '09:00',
    meridiem: 'AM',
    title: 'Design Workshop',
    description: 'Interactive components session',
    status: 'scheduled',
    tutorName: 'Ms. Elena Rivera',
    subject: 'English',
  },
  {
    id: 'ses-15-s2',
    dateKey: '2026-07-15',
    time: '01:00',
    meridiem: 'PM',
    title: 'Feedback Round',
    description: 'Discuss progress and challenges with team members',
    status: 'scheduled',
    tutorName: 'Mr. Aaron Patel',
    subject: 'Mathematics',
  },
  {
    id: 'ses-15-s3',
    dateKey: '2026-07-15',
    time: '03:30',
    meridiem: 'PM',
    title: 'Client Presentation',
    description: 'Showcase design concepts and gather client feedback',
    status: 'scheduled',
    tutorName: 'Dr. Clara Chen',
    subject: 'History',
  },

  // Thu 16
  {
    id: 'ses-16-m1',
    dateKey: '2026-07-16',
    time: '08:30',
    meridiem: 'AM',
    title: 'Vocabulary Warmup',
    description: 'Academic root words and context clues drill',
    status: 'missed',
    tutorName: 'Ms. Elena Rivera',
    subject: 'English',
  },
  {
    id: 'ses-16-u1',
    dateKey: '2026-07-16',
    time: '10:30',
    meridiem: 'AM',
    title: 'Algebra Linear Systems',
    description: 'Solving two-variable equations by substitution',
    status: 'upcoming',
    tutorName: 'Mr. Aaron Patel',
    subject: 'Mathematics',
  },
  {
    id: 'ses-16-u2',
    dateKey: '2026-07-16',
    time: '02:00',
    meridiem: 'PM',
    title: 'Thesis Coaching',
    description: 'Strengthening claim clarity and textual evidence',
    status: 'upcoming',
    tutorName: 'Ms. Elena Rivera',
    subject: 'English',
  },
  {
    id: 'ses-16-s1',
    dateKey: '2026-07-16',
    time: '04:15',
    meridiem: 'PM',
    title: 'Biology Cell Lab Review',
    description: 'Mitosis checkpoints and lab report rubric walk-through',
    status: 'scheduled',
    tutorName: 'Dr. Clara Chen',
    subject: 'Science',
  },

  // Fri 17
  {
    id: 'ses-17-u1',
    dateKey: '2026-07-17',
    time: '11:00',
    meridiem: 'AM',
    title: 'Smart Quiz Debrief',
    description: 'Reviewing missed questions from Term 2 check',
    status: 'upcoming',
    tutorName: 'Ms. Elena Rivera',
    subject: 'English',
  },
  {
    id: 'ses-17-s1',
    dateKey: '2026-07-17',
    time: '02:30',
    meridiem: 'PM',
    title: 'Geometry Proofs Clinic',
    description: 'Triangle congruence postulates and flow proofs',
    status: 'scheduled',
    tutorName: 'Mr. Aaron Patel',
    subject: 'Mathematics',
  },
  {
    id: 'ses-17-s2',
    dateKey: '2026-07-17',
    time: '04:00',
    meridiem: 'PM',
    title: 'Weekly Goal Check-In',
    description: 'Adjusting next week study plan milestones',
    status: 'scheduled',
    tutorName: 'Dr. Clara Chen',
    subject: 'English',
  },

  // Tue 14
  {
    id: 'ses-14-m1',
    dateKey: '2026-07-14',
    time: '09:30',
    meridiem: 'AM',
    title: 'Grammar Mechanics Check',
    description: 'Parallel structure and semicolon punctuation',
    status: 'missed',
    tutorName: 'Ms. Elena Rivera',
    subject: 'English',
  },
  {
    id: 'ses-14-s1',
    dateKey: '2026-07-14',
    time: '03:00',
    meridiem: 'PM',
    title: 'Quadratic Graphing Lab',
    description: 'Vertex form transformations and intercepts',
    status: 'scheduled',
    tutorName: 'Mr. Aaron Patel',
    subject: 'Mathematics',
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-eng-1',
    subject: 'English',
    prompt:
      'Which sentence best integrates textual evidence into a Grade 9 literary analysis paragraph?',
    options: [
      'The author uses imagery. "The iron sky pressed down over the harbor."',
      'By describing how "the iron sky pressed down over the harbor," the narrator conveys an oppressive mood before the storm.',
      'In this quote it says the iron sky pressed down which is imagery.',
      'Imagery is used in chapter two to talk about the harbor sky.',
    ],
    correctIndex: 1,
    explanation:
      'Weaving a concise quoted phrase directly into an analytical sentence keeps flow tight and connects evidence to meaning.',
  },
  {
    id: 'q-eng-2',
    subject: 'English',
    prompt:
      'In an argumentative essay, what is the primary purpose of addressing a counterargument?',
    options: [
      'To prove the opposing viewpoint is completely irrelevant',
      'To increase word count without adding new sources',
      'To demonstrate fairness and strengthen your claim through reasoned rebuttal',
      'To replace the conclusion paragraph with a debate summary',
    ],
    correctIndex: 2,
    explanation:
      'Acknowledging and refuting a credible counterargument builds ethos and reinforces why your thesis holds.',
  },
  {
    id: 'q-math-1',
    subject: 'Mathematics',
    prompt: 'What is the slope of the line represented by the equation 3x - 2y = 12?',
    options: ['-3/2', '3/2', '2/3', '-6'],
    correctIndex: 1,
    explanation:
      'Rewriting in slope-intercept form gives -2y = -3x + 12, so y = (3/2)x - 6. The slope m is 3/2.',
  },
  {
    id: 'q-eng-3',
    subject: 'English',
    prompt: 'Which revision corrects faulty parallel structure?',
    options: [
      'She likes drafting outlines, revising essays, and to read poetry.',
      'She likes to draft outlines, revising essays, and reading poetry.',
      'She likes drafting outlines, revising essays, and reading poetry.',
      'She likes drafting outlines, to revise essays, and reading poetry.',
    ],
    correctIndex: 2,
    explanation:
      'All three gerund phrases ("drafting...", "revising...", "reading...") share the same grammatical form.',
  },
];

export const INITIAL_AI_LESSONS: AiLesson[] = [
  {
    id: 'les-1',
    title: 'Crafting High-Impact Thesis Statements',
    subject: 'English',
    duration: '12 min',
    difficulty: 'Core',
    summary:
      'Learn how to transform broad topic sentences into defensible, nuanced claims aligned to CCSS W.9-10.1.',
    chapters: [
      {
        title: '1. Topic vs. Arguable Claim',
        timestamp: '00:00',
        content:
          'A topic announces what you are writing about; a claim takes a position someone could reasonably challenge using evidence.',
      },
      {
        title: '2. Adding the "Because" Blueprint',
        timestamp: '04:15',
        content:
          'Linking your claim to two distinct analytical pillars naturally structures your body paragraphs and keeps transitions tight.',
      },
      {
        title: '3. Live Rewrite Walkthrough',
        timestamp: '08:40',
        content:
          'Compare weak vs. honors-level revisions and test your thesis with the "So what?" significance check.',
      },
    ],
    completed: false,
  },
  {
    id: 'les-2',
    title: 'Visualizing Systems of Linear Equations',
    subject: 'Mathematics',
    duration: '15 min',
    difficulty: 'Core',
    summary:
      'Master substitution, elimination, and graphical intersection points with step-by-step algebra models.',
    chapters: [
      {
        title: '1. What an Intersection Means',
        timestamp: '00:00',
        content:
          'Every point on a line satisfies its equation; the intersection (x, y) satisfies both equations simultaneously.',
      },
      {
        title: '2. Choosing Elimination vs. Substitution',
        timestamp: '05:20',
        content:
          'Use substitution when a variable already has coefficient 1, and elimination when terms align cleanly to cancel.',
      },
      {
        title: '3. Special Cases: Parallel & Coincident',
        timestamp: '10:50',
        content:
          'Spot 0-solution parallel lines (same slope, different intercept) and infinite-solution identical lines immediately.',
      },
    ],
    completed: true,
  },
  {
    id: 'les-3',
    title: 'Rhetorical Appeals: Ethos, Pathos & Logos',
    subject: 'English',
    duration: '10 min',
    difficulty: 'Honors',
    summary:
      'Identify persuasive devices in speeches and non-fiction articles to elevate close-reading annotations.',
    chapters: [
      {
        title: '1. Credibility & Authority (Ethos)',
        timestamp: '00:00',
        content:
          'Track how speakers establish trust through tone, domain expertise, and fair concessions.',
      },
      {
        title: '2. Logic & Evidence (Logos)',
        timestamp: '03:30',
        content:
          'Separate verifiable statistics and causal reasoning from emotional generalizations.',
      },
      {
        title: '3. Annotating Speeches Quickly',
        timestamp: '07:10',
        content:
          'Use a 3-symbol margin code (E, P, L) during timed exams to locate quotes in seconds.',
      },
    ],
    completed: false,
  },
];

export const INITIAL_PLAN_MODULES: LearningPlanModule[] = [
  {
    id: 'mod-1',
    subject: 'English',
    title: 'Close Reading & Textual Evidence (CCSS RL.9-10.1)',
    week: 'Week 1',
    estimatedMinutes: 45,
    completed: true,
    mastery: 92,
  },
  {
    id: 'mod-2',
    subject: 'English',
    title: 'Argumentative Claims & Counterarguments',
    week: 'Week 2',
    estimatedMinutes: 50,
    completed: false,
    mastery: 64,
  },
  {
    id: 'mod-3',
    subject: 'Mathematics',
    title: 'Linear Functions & Slope-Intercept Modeling',
    week: 'Week 2',
    estimatedMinutes: 40,
    completed: true,
    mastery: 88,
  },
  {
    id: 'mod-4',
    subject: 'Mathematics',
    title: 'Quadratic Factoring & Vertex Form',
    week: 'Week 3',
    estimatedMinutes: 55,
    completed: false,
    mastery: 48,
  },
  {
    id: 'mod-5',
    subject: 'English',
    title: 'Timed Synthesis Essay Exam Simulation',
    week: 'Week 4',
    estimatedMinutes: 60,
    completed: false,
    mastery: 20,
  },
  {
    id: 'mod-6',
    subject: 'Science',
    title: 'Water Cycle & Weather',
    week: 'Week 2',
    estimatedMinutes: 45,
    completed: false,
    mastery: 0,
  },
];

export const INITIAL_NOTES: StudyNote[] = [
  {
    id: 'note-1',
    subject: 'English',
    title: 'Thesis Formula & Evidence Sandwich',
    content:
      '1. Context sentence introducing speaker/scene.\n2. Embedded 5-8 word quote.\n3. Two sentences unpacking specific word choice and linking back to the thesis.',
    updatedAt: '07 Jul, 2026',
    pinned: true,
  },
  {
    id: 'note-2',
    subject: 'Mathematics',
    title: 'Slope-Intercept vs. Point-Slope Cheat Sheet',
    content:
      'Slope-intercept: y = mx + b (best when y-intercept is known).\nPoint-slope: y - y1 = m(x - x1) (fastest when given slope and any single point).',
    updatedAt: '06 Jul, 2026',
    pinned: true,
  },
  {
    id: 'note-3',
    subject: 'Science',
    title: 'ATP Yield in Cellular Respiration',
    content:
      'Glycolysis (cytoplasm): 2 ATP net. Citric Acid Cycle: 2 ATP. Oxidative phosphorylation (ETC): ~32-34 ATP.',
    updatedAt: '04 Jul, 2026',
    pinned: false,
  },
];

export const INITIAL_THREADS: TutorMessageThread[] = [
  {
    id: 'thr-1',
    tutorName: 'Ms. Elena Rivera',
    role: 'English Lead Tutor',
    subject: 'English',
    unread: 1,
    messages: [
      {
        id: 'm1',
        sender: 'tutor',
        text: 'Hi Jane! Great improvement on your thesis draft yesterday. Ready to review your Term 2 Readiness Check before our next workshop?',
        time: '09:15 AM',
      },
      {
        id: 'm2',
        sender: 'student',
        text: 'Thanks Ms. Rivera! I am starting the English Readiness Check right after lunch.',
        time: '10:02 AM',
      },
      {
        id: 'm3',
        sender: 'tutor',
        text: 'Awesome — pay extra attention to embedding quotations smoothly. Ping me if any question feels tricky!',
        time: '10:08 AM',
      },
    ],
  },
  {
    id: 'thr-2',
    tutorName: 'Mr. Aaron Patel',
    role: 'Mathematics Tutor',
    subject: 'Mathematics',
    unread: 0,
    messages: [
      {
        id: 'm4',
        sender: 'tutor',
        text: 'I added two linear systems practice sets to your Term 2 goal. Let me know how the elimination problems feel.',
        time: 'Yesterday',
      },
    ],
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'ILP Generation Ready to Resume',
    detail: 'Your Grade 9 English Individualized Learning Plan is 70% configured.',
    time: '10m ago',
    read: false,
    type: 'plan',
  },
  {
    id: 'notif-2',
    title: 'Upcoming Session: Design Workshop',
    detail: 'Starts at 09:00 AM with Ms. Elena Rivera.',
    time: '1h ago',
    read: false,
    type: 'session',
  },
  {
    id: 'notif-3',
    title: 'Keep Your Streak Alive!',
    detail: 'Complete one Smart Quiz or Readiness Check today to reach Day-2.',
    time: '3h ago',
    read: true,
    type: 'streak',
  },
];

export const INITIAL_CHAT_HISTORY: ChatTurn[] = [
  {
    id: 'chat-welcome',
    sender: 'ai',
    text: 'Hi Jane! I am your Tutor Cloud AI Tutor for Grade 9 CCSS. What would you like to work on today — English essay structure, Algebra equations, or preparing for your Readiness Check?',
    timestamp: 'Just now',
    suggestionChips: [
      'Help me write a strong thesis statement',
      'Explain slope-intercept form in Algebra',
      'Give me a quick exam prep strategy',
    ],
  },
];

export const AVAILABLE_SUBJECTS = [
  'English',
  'Mathematics',
  'Science',
  'Social Studies',
  'History',
  'Economics',
  'Computer Science',
  'Physics',
  'Philosophy & Debate',
  'Spanish',
];

export const AVAILABLE_CURRICULA = ['CCSS', 'IB MYP', 'AP Prep', 'IGCSE', 'NGSS'];
