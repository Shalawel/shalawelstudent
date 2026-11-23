import type { QuizQuestion, SmartQuizInput } from '../types/dashboard';

export interface SmartQuizValidationResult {
  valid: boolean;
  errors: {
    subject?: string;
    topic?: string;
  };
}

export interface SmartQuizScoreSummary {
  correctCount: number;
  total: number;
  percent: number;
  results: {
    questionId: string;
    selectedIndex: number | undefined;
    correctIndex: number;
    isCorrect: boolean;
  }[];
}

export const SUBJECT_SUGGESTED_TOPICS: Record<string, string[]> = {
  English: [
    'Literary Theme & Summarizing',
    'Argumentative Thesis & Evidence',
    'Parallel Structure & Grammar',
  ],
  Mathematics: [
    'Linear Equations & Slope',
    'Quadratic Factoring',
    'Integers & Absolute Value',
  ],
  Science: [
    'Cellular Respiration & ATP',
    'Newton’s Laws of Motion',
    'Periodic Table & Bonding',
  ],
  History: [
    'Primary Source Synthesis',
    'Industrial Revolution Impacts',
    'Constitutional Checks & Balances',
  ],
  'Computer Science': [
    'Algorithms & Time Complexity',
    'Boolean Logic & Conditionals',
    'Data Structures Basics',
  ],
  Spanish: [
    'Preterite vs. Imperfect Tense',
    'Everyday Academic Vocabulary',
    'Subject-Verb Agreement',
  ],
};

export function validateSmartQuizInput(
  input: Partial<SmartQuizInput>
): SmartQuizValidationResult {
  const errors: SmartQuizValidationResult['errors'] = {};
  const subject = input.subject?.trim() ?? '';
  const topic = input.topic?.trim() ?? '';

  if (!subject) {
    errors.subject = 'Please select a subject for your quiz.';
  }
  if (topic.length < 2) {
    errors.topic = 'Please enter a quiz topic (at least 2 characters).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

const SUBJECT_QUESTION_BANKS: Record<string, Omit<QuizQuestion, 'id' | 'subject'>[]> = {
  English: [
    {
      prompt: 'Which sentence best integrates textual evidence into a literary analysis paragraph?',
      options: [
        'The author uses imagery. "The iron sky pressed down over the harbor."',
        'By describing how "the iron sky pressed down," the narrator builds an oppressive mood.',
        'This quote talks about the sky pressing down over the harbor.',
      ],
      correctIndex: 1,
      explanation:
        'Embedding a short quoted phrase smoothly inside your analytical claim links evidence directly to meaning.',
    },
    {
      prompt: 'What distinguishes a story’s central theme from its plot?',
      options: [
        'Plot is the sequence of events; theme is the underlying universal message.',
        'Theme lists the main characters; plot describes the physical setting.',
        'Plot only appears in the conclusion, while theme appears in the title.',
      ],
      correctIndex: 0,
      explanation:
        'Plot answers what happens in the story, whereas theme captures the deeper insight about life or human nature.',
    },
    {
      prompt: 'In an argumentative essay, why should a writer address a counterargument?',
      options: [
        'To fill extra space when supporting evidence runs short',
        'To build credibility and strengthen the main claim through reasoned rebuttal',
        'To switch sides halfway through the essay',
      ],
      correctIndex: 1,
      explanation:
        'Fairly acknowledging and refuting an opposing view demonstrates ethos and reinforces why your claim holds.',
    },
    {
      prompt: 'Which revision fixes faulty parallel structure?',
      options: [
        'She enjoys drafting outlines, revising essays, and to read poetry.',
        'She enjoys drafting outlines, revising essays, and reading poetry.',
        'She enjoys to draft outlines, revising essays, and reading poetry.',
      ],
      correctIndex: 1,
      explanation:
        'All three items use matching gerund phrases ("drafting", "revising", "reading") for balanced syntax.',
    },
    {
      prompt: 'Which element belongs in an objective summary of a fiction chapter?',
      options: [
        'Personal opinions about which character you disliked most',
        'Key turning points and character decisions in chronological order',
        'Every piece of dialogue copied word-for-word from the chapter',
      ],
      correctIndex: 1,
      explanation:
        'An objective summary distills the central events and turning points without personal bias or unnecessary detail.',
    },
    {
      prompt: 'When an author repeats a concrete image across three chapters, it most likely functions as a:',
      options: ['Recurring motif reinforcing the theme', 'Random background detail', 'Bibliographic citation'],
      correctIndex: 0,
      explanation:
        'A motif is a repeated image, phrase, or symbol that develops and deepens the work’s central theme.',
    },
  ],
  Mathematics: [
    {
      prompt: 'What is the slope of the line given by 3x − 2y = 12?',
      options: ['−3/2', '3/2', '2/3'],
      correctIndex: 1,
      explanation:
        'Rearranging to slope-intercept form gives −2y = −3x + 12, so y = (3/2)x − 6. The slope m is 3/2.',
    },
    {
      prompt: 'Which point represents the y-intercept of y = −4x + 7?',
      options: ['(7, 0)', '(0, 7)', '(0, −4)'],
      correctIndex: 1,
      explanation:
        'At the y-intercept, x = 0. Substituting x = 0 yields y = 7, so the intercept is (0, 7).',
    },
    {
      prompt: 'Which integers are ordered accurately from least to greatest?',
      options: ['−1, −4, 0, 2', '−4, −1, 0, 2', '0, −1, −4, 2'],
      correctIndex: 1,
      explanation:
        'Further left on the number line means smaller in value: −4 < −1 < 0 < 2.',
    },
    {
      prompt: 'What are the solutions to the factored quadratic (x − 5)(x + 2) = 0?',
      options: ['x = 5 or x = −2', 'x = −5 or x = 2', 'x = 5 or x = 2'],
      correctIndex: 0,
      explanation:
        'By the Zero Product Property, x − 5 = 0 gives x = 5 and x + 2 = 0 gives x = −2.',
    },
    {
      prompt: 'Two lines have the same slope m = 2 but different y-intercepts. How many solutions does the system have?',
      options: ['Exactly one solution', 'No solution (parallel lines)', 'Infinitely many solutions'],
      correctIndex: 1,
      explanation:
        'Equal slopes with distinct intercepts create parallel lines that never intersect, meaning zero solutions.',
    },
    {
      prompt: 'What is the value of |−9| + |3|?',
      options: ['−6', '6', '12'],
      correctIndex: 2,
      explanation:
        'Absolute value measures distance from zero: |−9| = 9 and |3| = 3, so 9 + 3 = 12.',
    },
  ],
  Science: [
    {
      prompt: 'Which stage of cellular respiration produces the largest amount of ATP?',
      options: ['Glycolysis in the cytoplasm', 'Oxidative phosphorylation (ETC)', 'Lactic acid fermentation'],
      correctIndex: 1,
      explanation:
        'The electron transport chain and chemiosmosis in the inner mitochondrial membrane yield ~32–34 ATP.',
    },
    {
      prompt: 'According to Newton’s Second Law (F = ma), doubling the net force on a fixed mass will:',
      options: ['Halve its acceleration', 'Double its acceleration', 'Leave its velocity unchanged'],
      correctIndex: 1,
      explanation:
        'Acceleration is directly proportional to net force when mass remains constant.',
    },
    {
      prompt: 'Which subatomic particle determines an element’s atomic number and chemical identity?',
      options: ['Neutrons in the nucleus', 'Protons in the nucleus', 'Valence electrons only'],
      correctIndex: 1,
      explanation:
        'Every element is uniquely defined by its number of protons (atomic number Z).',
    },
    {
      prompt: 'During a controlled experiment, why is only one independent variable changed at a time?',
      options: [
        'To isolate its direct effect on the dependent variable',
        'To avoid taking repeated measurements',
        'To eliminate the need for a control group',
      ],
      correctIndex: 0,
      explanation:
        'Changing one variable at a time ensures observed shifts in the outcome can be attributed clearly to that factor.',
    },
    {
      prompt: 'What happens to the rate of photosynthesis if stomata stay closed for an extended dry period?',
      options: [
        'It speeds up due to trapped oxygen',
        'It slows down because CO₂ intake drops sharply',
        'It remains constant regardless of gas exchange',
      ],
      correctIndex: 1,
      explanation:
        'Closed stomata conserve water but restrict carbon dioxide entering the leaf for the Calvin cycle.',
    },
    {
      prompt: 'Which type of chemical bond forms when two nonmetal atoms share pairs of electrons?',
      options: ['Covalent bond', 'Ionic bond', 'Metallic lattice'],
      correctIndex: 0,
      explanation:
        'Nonmetals typically achieve stable outer shells by sharing valence electrons in covalent bonds.',
    },
  ],
  History: [
    {
      prompt: 'Which source qualifies as a primary source when researching the 19th-century Industrial Revolution?',
      options: [
        'A factory worker’s 1842 diary entry',
        'A modern world history textbook chapter',
        'A documentary filmed in 2020',
      ],
      correctIndex: 0,
      explanation:
        'Primary sources are firsthand accounts or artifacts created during the historical period being studied.',
    },
    {
      prompt: 'What is the main constitutional purpose of checks and balances?',
      options: [
        'To speed up emergency legislation without review',
        'To prevent any single branch of government from accumulating unchecked power',
        'To merge judicial and executive authority',
      ],
      correctIndex: 1,
      explanation:
        'Dividing authority across branches allows each branch to oversee and limit the others.',
    },
    {
      prompt: 'How did mechanized textile mills transform labor patterns in the early 1800s?',
      options: [
        'Production shifted from rural cottages into urban factories with timed shifts',
        'Artisan guilds expanded across every rural village',
        'Railroads eliminated all urban population growth',
      ],
      correctIndex: 0,
      explanation:
        'Mechanization concentrated workers in factory towns governed by clock schedules and wage labor.',
    },
    {
      prompt: 'When corroborating two conflicting eyewitness accounts, a historian should first:',
      options: [
        'Discard both accounts immediately',
        'Compare each author’s perspective, date, and corroborating evidence',
        'Choose whichever account is longer',
      ],
      correctIndex: 1,
      explanation:
        'Sourcing and corroboration help historians evaluate reliability and explain why perspectives differ.',
    },
    {
      prompt: 'Which geographic factor most aided early river valley civilizations?',
      options: [
        'Seasonal flooding that deposited nutrient-rich silt for agriculture',
        'Complete isolation from trade networks',
        'Permanent permafrost soil',
      ],
      correctIndex: 0,
      explanation:
        'Fertile alluvial soil and irrigation water enabled reliable food surpluses and settled cities.',
    },
    {
      prompt: 'A strong historical thesis statement must:',
      options: [
        'List three unrelated dates without an argument',
        'Make a defensible claim that establishes a line of reasoning',
        'Repeat the essay prompt word-for-word',
      ],
      correctIndex: 1,
      explanation:
        'Historical arguments take an interpretive stance backed by specific evidence and reasoning.',
    },
  ],
  'Computer Science': [
    {
      prompt: 'What is the worst-case time complexity of binary search on a sorted array of n items?',
      options: ['O(1)', 'O(log n)', 'O(n²)'],
      correctIndex: 1,
      explanation:
        'Binary search halves the remaining search interval on every comparison, taking at most log₂(n) steps.',
    },
    {
      prompt: 'Which expression evaluates to true when a = true and b = false?',
      options: ['a && b', 'a || b', '!a && !b'],
      correctIndex: 1,
      explanation:
        'Logical OR (||) returns true whenever at least one operand is true.',
    },
    {
      prompt: 'Which data structure follows Last-In, First-Out (LIFO) ordering?',
      options: ['Queue', 'Stack', 'Hash Table'],
      correctIndex: 1,
      explanation:
        'A stack pushes and pops elements from the top, making the newest item the first removed.',
    },
    {
      prompt: 'Why are pure functions easier to test and reason about?',
      options: [
        'They always return the same output for the same inputs with no side effects',
        'They automatically mutate global state for speed',
        'They skip type checking at compile time',
      ],
      correctIndex: 0,
      explanation:
        'Deterministic outputs and zero external mutations make pure functions predictable and simple to unit test.',
    },
    {
      prompt: 'What prevents infinite recursion in a recursive function?',
      options: [
        'A reachable base case that stops further self-calls',
        'Declaring more local variables inside the loop',
        'Returning null on every branch',
      ],
      correctIndex: 0,
      explanation:
        'Each recursive call must progress toward a base case so the call stack eventually unwinds.',
    },
    {
      prompt: 'Which HTTP status code indicates a resource was successfully created?',
      options: ['201 Created', '304 Not Modified', '404 Not Found'],
      correctIndex: 0,
      explanation:
        'HTTP 201 signals that the request succeeded and resulted in a new resource being created.',
    },
  ],
  Spanish: [
    {
      prompt: 'Which sentence correctly uses the preterite tense for a completed action yesterday?',
      options: [
        'Ayer yo estudié para el examen.',
        'Ayer yo estudiaba cada día.',
        'Ayer yo estudio en la biblioteca.',
      ],
      correctIndex: 0,
      explanation:
        '"Estudié" is the first-person singular preterite form used for a completed past event.',
    },
    {
      prompt: 'Choose the correct adjective agreement: "Las clases son muy ___."',
      options: ['interesante', 'interesantes', 'interesanto'],
      correctIndex: 1,
      explanation:
        'Plural nouns ("las clases") require the plural adjective form "interesantes".',
    },
    {
      prompt: 'When do you use "estar" instead of "ser"?',
      options: [
        'For temporary states, feelings, and physical locations',
        'For telling time and permanent professions',
        'For stating nationality and origin',
      ],
      correctIndex: 0,
      explanation:
        '"Estar" expresses location and changeable conditions, while "ser" expresses identity, origin, and time.',
    },
    {
      prompt: 'Which phrase means "Can you repeat that, please?"',
      options: [
        '¿Puede repetir eso, por favor?',
        '¿Dónde está la biblioteca?',
        '¿Qué hora es ahora?',
      ],
      correctIndex: 0,
      explanation:
        '"Repetir" means to repeat; "¿Puede repetir eso, por favor?" is the polite classroom request.',
    },
    {
      prompt: 'Select the correct imperfect form for habitual childhood actions: "Cuando era niño, ___ fútbol."',
      options: ['jugué', 'jugaba', 'juego'],
      correctIndex: 1,
      explanation:
        'The imperfect tense ("jugaba") describes ongoing or repeated actions in the past.',
    },
    {
      prompt: 'Which connector best introduces a contrasting idea in a paragraph?',
      options: ['Sin embargo', 'Además', 'Por ejemplo'],
      correctIndex: 0,
      explanation:
        '"Sin embargo" translates to "however" and signals a contrast with the previous clause.',
    },
  ],
};

export function buildSmartQuizDeck(subject: string, topic: string): QuizQuestion[] {
  const cleanSubject = subject.trim() || 'English';
  const topicSlug = (topic.trim() || 'core').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const bank = SUBJECT_QUESTION_BANKS[cleanSubject] ?? SUBJECT_QUESTION_BANKS.English;

  return bank.map((item, idx) => ({
    id: `sq-${cleanSubject.toLowerCase().replace(/\s+/g, '-')}-${topicSlug}-${idx + 1}`,
    subject: cleanSubject,
    prompt: item.prompt,
    options: item.options,
    correctIndex: item.correctIndex,
    explanation: item.explanation,
  }));
}

export function scoreSmartQuiz(
  questions: QuizQuestion[],
  answers: Record<number, number>
): SmartQuizScoreSummary {
  if (questions.length === 0) {
    return { correctCount: 0, total: 0, percent: 0, results: [] };
  }

  const results = questions.map((q, index) => {
    const selectedIndex = answers[index];
    const isCorrect = selectedIndex === q.correctIndex;
    return {
      questionId: q.id,
      selectedIndex,
      correctIndex: q.correctIndex,
      isCorrect,
    };
  });

  const correctCount = results.filter((r) => r.isCorrect).length;
  const percent = Math.round((correctCount / questions.length) * 100);

  return {
    correctCount,
    total: questions.length,
    percent,
    results,
  };
}

export function resolveSwipeDirection(
  offsetX: number,
  velocityX: number
): 'next' | 'prev' | null {
  const swipePower = Math.abs(offsetX) * 0.6 + Math.abs(velocityX) * 0.25;
  if (offsetX <= -70 || (offsetX < -30 && swipePower > 160)) {
    return 'next';
  }
  if (offsetX >= 70 || (offsetX > 30 && swipePower > 160)) {
    return 'prev';
  }
  return null;
}
