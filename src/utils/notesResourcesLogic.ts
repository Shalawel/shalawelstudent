export type NotesFilterTab = 'my-notes' | 'bookmarked' | 'resources' | 'shared';
export type NotesLayoutMode = 'grid' | 'list';
export type UploadSaveDestination = 'note' | 'resource' | 'both';
export type NoteAttachmentKind = 'pdf' | 'image' | 'doc';
export type LearningResourceType = 'pdf' | 'book' | 'chapter-image' | 'video';

export interface NoteAttachment {
  id: string;
  name: string;
  sizeLabel: string;
  kind: NoteAttachmentKind;
  pinned: boolean;
  dataUrl?: string;
  chapterRef?: string;
  uploadedAt: string;
}

export interface NoteKeyComponent {
  id: string;
  term: string;
  detail: string;
}

export interface RichNoteItem {
  id: string;
  shortTitle: string;
  title: string;
  previewText: string;
  subject: string;
  grade: string;
  tags: string[];
  overviewHeading: string;
  introParagraph: string;
  keyComponents: NoteKeyComponent[];
  exampleQuote: string;
  exampleCaption: string;
  usageHeading: string;
  usageParagraph: string;
  pinned: boolean;
  bookmarked: boolean;
  sharedBy?: string;
  lastEdited: string;
  coverTone: 'blue' | 'mint' | 'amber';
  coverImageUrl?: string;
  attachments: NoteAttachment[];
}

export interface LearningResourceItem {
  id: string;
  title: string;
  subject: string;
  resourceType: LearningResourceType;
  authorOrMeta: string;
  sizeOrDuration: string;
  bookmarked: boolean;
  sharedBy?: string;
  uploadedAt: string;
  previewDataUrl?: string;
  chapterRef?: string;
  summary: string;
  chapterHighlights: string[];
  progressPercent?: number;
}

export interface UploadChapterInput {
  fileName: string;
  fileSizeBytes: number;
  fileMimeType: string;
  previewDataUrl?: string;
  title: string;
  subject: string;
  chapterRef: string;
  notesText: string;
  destination: UploadSaveDestination;
  grade?: string;
}

export interface StudyKitFlashcard {
  id: string;
  front: string;
  back: string;
  tag: string;
}

export interface StudyKitBundle {
  subject: string;
  sourceNoteTitle: string;
  summaryHeadline: string;
  summaryPoints: string[];
  flashcards: StudyKitFlashcard[];
  quizSubject: string;
  quizTopic: string;
}

export const NOTES_SUBJECTS = [
  'English',
  'Mathematics',
  'Science',
  'History',
  'Computer Science',
] as const;

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.txt',
  '.md',
  '.doc',
  '.docx',
  '.epub',
];

export const INITIAL_RICH_NOTES: RichNoteItem[] = [
  {
    id: 'note-eng-grammar',
    shortTitle: 'English Grammar',
    title: 'English Grammar: Complex Sentence Structures',
    previewText: 'Deep dive into complex sentence structures, independent and dependent clauses...',
    subject: 'English',
    grade: 'Grade 11',
    tags: ['Grammar', 'Writing', 'SATPrep'],
    overviewHeading: 'Overview: Independent vs Dependent Clauses',
    introParagraph:
      'A complex sentence is an independent clause joined by one or more dependent clauses. A dependent clause either lacks a subject or a verb or has both a subject and a verb that does not express a complete thought.',
    keyComponents: [
      {
        id: 'kc-1',
        term: 'Independent Clause',
        detail: 'Can stand alone as a sentence. It expresses a complete thought.',
      },
      {
        id: 'kc-2',
        term: 'Dependent Clause',
        detail: 'Cannot stand alone. It relies on the independent clause for context.',
      },
      {
        id: 'kc-3',
        term: 'Subordinating Conjunctions',
        detail: "Words like 'although', 'because', 'since', 'while' that link clauses.",
      },
    ],
    exampleQuote:
      '"Although she was tired, she continued to study for the English finals."',
    exampleCaption: 'Example Case',
    usageHeading: 'USAGE IN ACADEMIC WRITING',
    usageParagraph:
      'Mastering complex sentences allows writers to convey sophisticated relationships between ideas. They are essential for achieving higher scores in SAT Writing and academic essays by improving sentence variety and flow.',
    pinned: true,
    bookmarked: false,
    lastEdited: 'Yesterday',
    coverTone: 'blue',
    attachments: [
      {
        id: 'att-slides',
        name: 'Lesson_Slides.pdf',
        sizeLabel: '2.4 MB',
        kind: 'pdf',
        pinned: true,
        chapterRef: 'Unit 3 · Sentence Craft',
        uploadedAt: 'Yesterday',
      },
      {
        id: 'att-cheat',
        name: 'Grammar_Cheat_Sheet.png',
        sizeLabel: '856 KB',
        kind: 'image',
        pinned: true,
        chapterRef: 'Quick Clause Reference',
        uploadedAt: 'Yesterday',
      },
    ],
  },
  {
    id: 'note-math-integration',
    shortTitle: 'Integration Rules',
    title: 'Integration Rules: Definite & Indefinite Integrals',
    previewText: 'Summary of definite and indefinite integration rules, u-substitution, and bounds...',
    subject: 'Mathematics',
    grade: 'Grade 11',
    tags: ['Math', 'Calculus'],
    overviewHeading: 'Overview: Antiderivatives & Area Under Curves',
    introParagraph:
      'Integration reverses differentiation and lets us compute accumulated quantities and exact area bounded by a curve. Indefinite integrals include an arbitrary constant C, while definite integrals evaluate net signed area between limits a and b.',
    keyComponents: [
      {
        id: 'kc-m1',
        term: 'Power Rule for Integrals',
        detail: 'For n != -1, the integral of x^n dx equals x^(n+1) / (n + 1) + C.',
      },
      {
        id: 'kc-m2',
        term: 'Fundamental Theorem of Calculus',
        detail: 'Evaluate F(b) - F(a) where F is any antiderivative of continuous f(x).',
      },
      {
        id: 'kc-m3',
        term: 'U-Substitution',
        detail: 'Rewrites composite integrands by matching inner function u = g(x) and du = g\'(x) dx.',
      },
    ],
    exampleQuote:
      '"To integrate 2x * cos(x^2) dx, set u = x^2 so du = 2x dx, yielding sin(x^2) + C."',
    exampleCaption: 'Worked Example',
    usageHeading: 'EXAM & PRACTICE TIPS',
    usageParagraph:
      'Always differentiate your final antiderivative mentally to verify signs and chain-rule factors. When solving definite integrals with u-substitution, convert the original x-limits into u-limits to save steps.',
    pinned: false,
    bookmarked: true,
    lastEdited: '3 days ago',
    coverTone: 'mint',
    attachments: [
      {
        id: 'att-calc-sheet',
        name: 'Calculus_Integration_Table.pdf',
        sizeLabel: '1.6 MB',
        kind: 'pdf',
        pinned: true,
        chapterRef: 'Chapter 5 · Integrals',
        uploadedAt: '3 days ago',
      },
    ],
  },
  {
    id: 'note-sci-energy',
    shortTitle: 'Cellular Respiration',
    title: 'Science Notes: Cellular Respiration & ATP Yield',
    previewText: 'Breakdown of glycolysis, Krebs cycle, and oxidative phosphorylation in mitochondria...',
    subject: 'Science',
    grade: 'Grade 9',
    tags: ['Science', 'Biology'],
    overviewHeading: 'Overview: How Cells Harvest Chemical Energy',
    introParagraph:
      'Cellular respiration breaks down glucose in the presence of oxygen to synthesize ATP, the primary energy currency of living cells. Each stage takes place in a specialized compartment of the cell.',
    keyComponents: [
      {
        id: 'kc-s1',
        term: 'Glycolysis',
        detail: 'Occurs in the cytoplasm; splits glucose into 2 pyruvate molecules for a net gain of 2 ATP.',
      },
      {
        id: 'kc-s2',
        term: 'Citric Acid (Krebs) Cycle',
        detail: 'Occurs in the mitochondrial matrix; generates NADH, FADH2, and releases CO2.',
      },
      {
        id: 'kc-s3',
        term: 'Electron Transport Chain',
        detail: 'Uses oxygen as the final electron acceptor to produce roughly 32–34 ATP.',
      },
    ],
    exampleQuote: '"C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + ~36–38 ATP"',
    exampleCaption: 'Balanced Respiration Equation',
    usageHeading: 'LAB & QUIZ CONNECTION',
    usageParagraph:
      'Compare aerobic respiration with anaerobic lactic acid fermentation when muscles operate under limited oxygen supply.',
    pinned: false,
    bookmarked: true,
    lastEdited: '4 days ago',
    coverTone: 'amber',
    attachments: [],
  },
  {
    id: 'note-shared-sat',
    shortTitle: 'SAT Evidence Guide',
    title: 'SAT Reading: Command of Evidence Checklist',
    previewText: 'Shared teacher playbook for pairing claim questions with strongest textual lines...',
    subject: 'English',
    grade: 'Grade 11',
    tags: ['SATPrep', 'Reading'],
    overviewHeading: 'Overview: Linking Claims to Textual Evidence',
    introParagraph:
      'Command of Evidence items test whether you can verify an argument strictly using direct evidence stated in the passage rather than outside assumptions.',
    keyComponents: [
      {
        id: 'kc-sh1',
        term: 'Eliminate Extreme Modifiers',
        detail: "Watch out for unsupported absolutes like 'always', 'never', or 'solely'.",
      },
      {
        id: 'kc-sh2',
        term: 'Anchor Line Numbers First',
        detail: 'Read 2 lines above and below the cited quote to catch contrast pivots.',
      },
    ],
    exampleQuote:
      '"If a choice introduces a new comparison not present in the passage, cross it out immediately."',
    exampleCaption: 'Coach Tip · Mr. Smith',
    usageHeading: 'SHARED STRATEGY',
    usageParagraph:
      'Use this checklist alongside the SAT Vocabulary Essential PDF before timed practice sets.',
    pinned: false,
    bookmarked: false,
    sharedBy: 'Mr. Smith',
    lastEdited: '5 days ago',
    coverTone: 'blue',
    attachments: [],
  },
];

export const INITIAL_LEARNING_RESOURCES: LearningResourceItem[] = [
  {
    id: 'res-sat-vocab',
    title: 'SAT Vocabulary Essential.pdf',
    subject: 'English',
    resourceType: 'pdf',
    authorOrMeta: 'Teacher: Mr. Smith',
    sizeOrDuration: '4MB',
    bookmarked: false,
    sharedBy: 'Mr. Smith',
    uploadedAt: 'Jul 09, 2026',
    chapterRef: 'High-Frequency Academic Words (Units 1–6)',
    summary:
      'Curated 250 high-utility academic vocabulary words organized by root families, context sentences, and tone polarity for SAT Reading & Writing.',
    chapterHighlights: [
      'Prefix & Latin root decoding chart (bene-, mal-, cred-, spec-).',
      'Paired contrast drills for words-in-context questions.',
      'Annotated example passages with distractor explanations.',
    ],
  },
  {
    id: 'res-physics-lecture',
    title: 'Intro to Physics 101 - Lecture',
    subject: 'Science',
    resourceType: 'video',
    authorOrMeta: 'Duration: 45:12',
    sizeOrDuration: 'Video Content',
    bookmarked: true,
    uploadedAt: 'Jul 10, 2026',
    chapterRef: 'Kinematics, Velocity Graphs & Newton Laws',
    summary:
      'Recorded concept walkthrough covering displacement vs. distance, interpreting velocity-time slopes, and drawing clean free-body force diagrams.',
    chapterHighlights: [
      '00:00–14:20 — Position, velocity, and acceleration graph relationships.',
      '14:20–31:05 — Resolving net forces on inclined planes.',
      '31:05–45:12 — Practice problem walkthrough and unit checks.',
    ],
    progressPercent: 62,
  },
  {
    id: 'res-algebra-book',
    title: 'Algebra II Textbook — Chapter 4 Quadratics.pdf',
    subject: 'Mathematics',
    resourceType: 'book',
    authorOrMeta: 'Uploaded Textbook Chapter',
    sizeOrDuration: '6.2 MB',
    bookmarked: true,
    uploadedAt: 'Jul 11, 2026',
    chapterRef: 'Pages 142–168 · Vertex & Factored Forms',
    summary:
      'Student-uploaded textbook chapter covering parabolas, completing the square, discriminant analysis, and real-world projectile modeling.',
    chapterHighlights: [
      'Vertex form y = a(x - h)^2 + k transformations and axis of symmetry.',
      'Discriminant b^2 - 4ac classifies 2 real, 1 repeated, or 2 complex roots.',
      'End-of-chapter worked problem bank (Questions 1–24).',
    ],
  },
  {
    id: 'res-bio-scan',
    title: 'Chapter 7 Photosynthesis Diagram Scan.png',
    subject: 'Science',
    resourceType: 'chapter-image',
    authorOrMeta: 'Shared by: Ms. Patel',
    sizeOrDuration: '1.8 MB',
    bookmarked: false,
    sharedBy: 'Ms. Patel',
    uploadedAt: 'Jul 12, 2026',
    chapterRef: 'Chloroplast Light-Dependent & Calvin Cycle',
    summary:
      'Annotated textbook diagram showing thylakoid light reactions producing ATP & NADPH to power carbon fixation in the stroma.',
    chapterHighlights: [
      'Light-dependent reactions occur on the thylakoid membrane and release O2.',
      'Calvin cycle in the stroma fixes CO2 into G3P sugars using ATP and NADPH.',
    ],
  },
];

export function formatBytesLabel(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '120 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function detectAttachmentKind(fileName: string, mimeType: string): NoteAttachmentKind {
  const lower = fileName.toLowerCase();
  if (
    mimeType.startsWith('image/') ||
    /\.(png|jpe?g|webp|gif)$/i.test(lower)
  ) {
    return 'image';
  }
  if (mimeType === 'application/pdf' || lower.endsWith('.pdf')) {
    return 'pdf';
  }
  return 'doc';
}

export function countNoteWords(note: RichNoteItem): number {
  const combined = [
    note.title,
    note.overviewHeading,
    note.introParagraph,
    ...note.keyComponents.map((k) => `${k.term} ${k.detail}`),
    note.exampleQuote,
    note.usageHeading,
    note.usageParagraph,
  ]
    .join(' ')
    .trim();
  if (!combined) return 0;
  return combined.split(/\s+/).filter(Boolean).length;
}

export function validateChapterUpload(input: UploadChapterInput): string | null {
  if (!input.fileName.trim()) {
    return 'Please upload a book PDF, chapter image, or study file first.';
  }
  const lower = input.fileName.toLowerCase();
  const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
  if (!hasAllowedExt) {
    return 'Supported formats: PDF, PNG, JPG, WEBP, TXT, MD, DOC, DOCX, or EPUB.';
  }
  if (input.fileSizeBytes > MAX_UPLOAD_BYTES) {
    return 'File is larger than 25 MB. Please upload a chapter excerpt or compressed image.';
  }
  if (!input.title.trim()) {
    return 'Please enter a title for your uploaded chapter or book.';
  }
  if (!input.subject.trim()) {
    return 'Please choose a subject so Tutor Cloud can organize your study kit.';
  }
  return null;
}

export function extractAiChapterNotesDraft(
  title: string,
  subject: string,
  chapterRef: string,
  fileName: string
): {
  summary: string;
  keyPoints: string[];
} {
  const cleanTitle = title.trim() || fileName.replace(/\.[^.]+$/, '');
  const refLabel = chapterRef.trim() || 'Uploaded Chapter Excerpt';
  return {
    summary: `Structured study breakdown extracted from "${cleanTitle}" (${refLabel}) for ${subject}. Focuses on core definitions, worked examples, and likely quiz checkpoints.`,
    keyPoints: [
      `Core Concept: Identify the primary theorem or principle introduced in ${cleanTitle}.`,
      `Worked Example Check: Trace each intermediate step from ${refLabel} without skipping units or transitions.`,
      `Self-Test Trigger: Explain the main takeaway aloud in 2 sentences before starting practice questions.`,
    ],
  };
}

export function buildUploadedItems(input: UploadChapterInput): {
  createdNote?: RichNoteItem;
  createdResource?: LearningResourceItem;
} {
  const stamp = Date.now();
  const kind = detectAttachmentKind(input.fileName, input.fileMimeType);
  const sizeLabel = formatBytesLabel(input.fileSizeBytes);
  const cleanTitle = input.title.trim();
  const ref = input.chapterRef.trim() || 'Uploaded Chapter';
  const extracted = extractAiChapterNotesDraft(cleanTitle, input.subject, ref, input.fileName);
  const studentBody = input.notesText.trim() || extracted.summary;

  const toneBySubject: Record<string, 'blue' | 'mint' | 'amber'> = {
    English: 'blue',
    History: 'blue',
    Mathematics: 'mint',
    Science: 'amber',
    'Computer Science': 'mint',
  };

  let createdNote: RichNoteItem | undefined;
  let createdResource: LearningResourceItem | undefined;

  if (input.destination === 'note' || input.destination === 'both') {
    const attachment: NoteAttachment = {
      id: `att-up-${stamp}`,
      name: input.fileName,
      sizeLabel,
      kind,
      pinned: true,
      dataUrl: input.previewDataUrl,
      chapterRef: ref,
      uploadedAt: 'Just now',
    };

    createdNote = {
      id: `note-up-${stamp}`,
      shortTitle: cleanTitle.length > 26 ? `${cleanTitle.slice(0, 24)}…` : cleanTitle,
      title: cleanTitle,
      previewText: studentBody.slice(0, 96) + (studentBody.length > 96 ? '...' : ''),
      subject: input.subject,
      grade: input.grade || 'Grade 9',
      tags: [input.subject.replace(/\s+/g, ''), kind === 'image' ? 'ChapterScan' : 'BookNotes'],
      overviewHeading: `Overview: ${cleanTitle}`,
      introParagraph: studentBody,
      keyComponents: extracted.keyPoints.map((pt, idx) => {
        const [term, ...rest] = pt.split(':');
        return {
          id: `kc-up-${stamp}-${idx}`,
          term: term.trim(),
          detail: rest.join(':').trim() || pt,
        };
      }),
      exampleQuote: `"Review ${input.fileName} (${ref}) alongside this note during your next AI Tutor session or Quick Quiz."`,
      exampleCaption: `Source: ${input.fileName}`,
      usageHeading: 'NEXT REVIEW & PRACTICE STEPS',
      usageParagraph:
        'Open this note directly inside a Tutoring Session or launch a Quick Quiz to verify you can recall the chapter concepts without peeking at the uploaded pages.',
      pinned: true,
      bookmarked: false,
      lastEdited: 'Just now',
      coverTone: toneBySubject[input.subject] ?? 'blue',
      coverImageUrl: kind === 'image' ? input.previewDataUrl : undefined,
      attachments: [attachment],
    };
  }

  if (input.destination === 'resource' || input.destination === 'both') {
    const resourceType: LearningResourceType =
      kind === 'image'
        ? 'chapter-image'
        : input.fileName.toLowerCase().includes('book') ||
          input.fileName.toLowerCase().includes('chapter')
        ? 'book'
        : 'pdf';

    createdResource = {
      id: `res-up-${stamp}`,
      title: input.fileName,
      subject: input.subject,
      resourceType,
      authorOrMeta:
        kind === 'image' ? `Chapter Image · ${ref}` : `Uploaded Book · ${ref}`,
      sizeOrDuration: sizeLabel,
      bookmarked: false,
      uploadedAt: 'Just now',
      previewDataUrl: input.previewDataUrl,
      chapterRef: ref,
      summary: studentBody,
      chapterHighlights: extracted.keyPoints,
    };
  }

  return { createdNote, createdResource };
}

export function filterNotesForTab(
  notes: RichNoteItem[],
  tab: NotesFilterTab,
  searchQuery: string = ''
): RichNoteItem[] {
  const q = searchQuery.trim().toLowerCase();
  return notes
    .filter((note) => {
      if (tab === 'bookmarked' && !note.bookmarked) return false;
      if (tab === 'shared' && !note.sharedBy) return false;
      if (tab === 'resources') return false;
      if (!q) return true;
      const hay = `${note.title} ${note.subject} ${note.tags.join(' ')} ${note.introParagraph}`.toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));
}

export function filterResourcesForTab(
  resources: LearningResourceItem[],
  tab: NotesFilterTab,
  searchQuery: string = ''
): LearningResourceItem[] {
  const q = searchQuery.trim().toLowerCase();
  return resources.filter((res) => {
    if (tab === 'bookmarked' && !res.bookmarked) return false;
    if (tab === 'shared' && !res.sharedBy) return false;
    if (!q) return true;
    const hay = `${res.title} ${res.subject} ${res.authorOrMeta} ${res.summary}`.toLowerCase();
    return hay.includes(q);
  });
}

export function buildMarkdownExport(notes: RichNoteItem[]): string {
  return notes
    .map((note) => {
      const components = note.keyComponents
        .map((c) => `- **${c.term}:** ${c.detail}`)
        .join('\n');
      const attachments =
        note.attachments.length > 0
          ? `\n### Attached Files\n${note.attachments
              .map((a) => `- ${a.name} (${a.sizeLabel})`)
              .join('\n')}`
          : '';
      return [
        `# ${note.title}`,
        `Subject: ${note.subject} | ${note.grade} | Tags: ${note.tags.map((t) => `#${t}`).join(' ')}`,
        '',
        `## ${note.overviewHeading}`,
        note.introParagraph,
        '',
        '### Key Components',
        components,
        '',
        `> ${note.exampleQuote}`,
        `> — ${note.exampleCaption}`,
        '',
        `### ${note.usageHeading}`,
        note.usageParagraph,
        attachments,
      ].join('\n');
    })
    .join('\n\n---\n\n');
}

export function buildStudyKitForNote(note: RichNoteItem): StudyKitBundle {
  const baseCards: StudyKitFlashcard[] = note.keyComponents.map((comp, idx) => ({
    id: `fc-${note.id}-${idx}`,
    front: `What is "${comp.term}" in ${note.shortTitle}?`,
    back: comp.detail,
    tag: note.tags[0] || note.subject,
  }));

  const extraCards: StudyKitFlashcard[] = [
    {
      id: `fc-${note.id}-overview`,
      front: `Summarize the core rule behind "${note.overviewHeading}".`,
      back: note.introParagraph,
      tag: 'Core Concept',
    },
    {
      id: `fc-${note.id}-example`,
      front: `Give a concrete example illustrating ${note.shortTitle}.`,
      back: `${note.exampleQuote} (${note.exampleCaption})`,
      tag: 'Application',
    },
    {
      id: `fc-${note.id}-usage`,
      front: `Why does ${note.shortTitle} matter in exams or real writing/problem solving?`,
      back: note.usageParagraph,
      tag: 'Exam Strategy',
    },
  ];

  return {
    subject: note.subject,
    sourceNoteTitle: note.title,
    summaryHeadline: note.overviewHeading,
    summaryPoints: [
      note.introParagraph,
      ...note.keyComponents.map((k) => `${k.term}: ${k.detail}`),
    ],
    flashcards: [...baseCards, ...extraCards],
    quizSubject: note.subject,
    quizTopic: note.shortTitle,
  };
}

export function createBlankRichNote(subject: string = 'English', grade: string = 'Grade 9'): RichNoteItem {
  const stamp = Date.now();
  return {
    id: `note-new-${stamp}`,
    shortTitle: 'Untitled Learning Unit',
    title: 'Untitled Learning Unit',
    previewText: 'Start typing your lecture notes, chapter highlights, or attach textbook pages...',
    subject,
    grade,
    tags: [subject.replace(/\s+/g, ''), 'StudyNote'],
    overviewHeading: 'Overview: Key Concept',
    introParagraph:
      'Capture the core idea from your lesson, textbook chapter, or practice session here.',
    keyComponents: [
      {
        id: `kc-new-${stamp}-1`,
        term: 'Main Takeaway',
        detail: 'Write the key rule, formula, or definition in your own words.',
      },
    ],
    exampleQuote: '"Add an illustrative quote, solved example, or formula check here."',
    exampleCaption: 'Example Case',
    usageHeading: 'APPLICATION & PRACTICE NOTES',
    usageParagraph:
      'Note any tricky edge cases or questions you want to review with your AI Tutor next.',
    pinned: false,
    bookmarked: false,
    lastEdited: 'Just now',
    coverTone: 'blue',
    attachments: [],
  };
}

export function createQuickSessionNote(params: {
  subject: string;
  title: string;
  content: string;
  sourceLabel?: string;
  grade?: string;
}): RichNoteItem {
  const stamp = Date.now();
  const cleanTitle = params.title.trim() || `${params.subject} Study Note`;
  const lines = params.content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const intro = lines[0] || params.content.trim();
  const bulletLines = lines.slice(1).filter((l) => l.startsWith('-') || l.startsWith('•'));
  const keyComponents: NoteKeyComponent[] =
    bulletLines.length > 0
      ? bulletLines.map((line, idx) => ({
          id: `kc-q-${stamp}-${idx}`,
          term: `Point ${idx + 1}`,
          detail: line.replace(/^[-•]\s*/, ''),
        }))
      : [
          {
            id: `kc-q-${stamp}-1`,
            term: params.sourceLabel || 'Key Insight',
            detail: lines.slice(1).join(' ') || intro,
          },
        ];

  return {
    id: `note-quick-${stamp}`,
    shortTitle: cleanTitle.length > 26 ? `${cleanTitle.slice(0, 24)}…` : cleanTitle,
    title: cleanTitle,
    previewText: intro.slice(0, 96) + (intro.length > 96 ? '...' : ''),
    subject: params.subject || 'General',
    grade: params.grade || 'Grade 9',
    tags: [
      (params.subject || 'Study').replace(/\s+/g, ''),
      params.sourceLabel ? params.sourceLabel.replace(/\s+/g, '') : 'SessionNote',
    ],
    overviewHeading: `Overview: ${cleanTitle}`,
    introParagraph: intro,
    keyComponents,
    exampleQuote: `"Captured during ${params.sourceLabel || 'study session'} for quick review before practice."`,
    exampleCaption: params.sourceLabel || 'Session Capture',
    usageHeading: 'REVIEW CHECKLIST',
    usageParagraph:
      'Revisit this note in your next AI Tutor session or generate flashcards from Notes & Resources.',
    pinned: false,
    bookmarked: false,
    lastEdited: 'Just now',
    coverTone:
      params.subject === 'Mathematics'
        ? 'mint'
        : params.subject === 'Science'
        ? 'amber'
        : 'blue',
    attachments: [],
  };
}
