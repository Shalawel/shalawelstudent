import type { CalendarSession, SessionHelpType } from '../types/dashboard';

export type ScheduleSessionStatus = 'upcoming' | 'completed' | 'missed' | 'canceled';
export type SchedulePeriodFilter = 'This Week' | 'This Month' | 'All Time';
export type ScheduleStatusTab = 'all' | 'upcoming' | 'completed' | 'missed';
export type ScheduleViewMode = 'list' | 'calendar';
export type ScheduleRecurrenceMode = 'one-time' | 'recurring';

export interface RecordingChapter {
  id: string;
  title: string;
  timestamp: string;
  seconds: number;
  summary: string;
}

export interface ScheduleSessionItem {
  id: string;
  subject: string;
  topic: string;
  calendarLabel: string;
  status: ScheduleSessionStatus;
  dateIso: string; // YYYY-MM-DD
  startTime24: string; // HH:MM
  durationMins: number;
  tutorName: string;
  sessionType: SessionHelpType;
  curriculum: string;
  isLive?: boolean;
  masteryScore?: number;
  performanceLabel?: 'Good' | 'Excellent' | 'Developing';
  notesSummary: string;
  keyTakeaways: string[];
  recordingChapters: RecordingChapter[];
  dismissed?: boolean;
}

export interface ScheduleDraftLesson {
  id: string;
  lessonName: string;
  dateIso: string;
  durationMins: number;
  startTime24: string;
}

export interface CreateScheduleFormInput {
  helpType: SessionHelpType | '';
  subject: string;
  curriculum: string;
  mode: ScheduleRecurrenceMode;
  lessons: ScheduleDraftLesson[];
}

export interface ScheduledConfirmationItem {
  id: string;
  subject: string;
  lesson: string;
  dateTimeLabel: string;
  durationLabel: string;
  sessionType: SessionHelpType;
}

export interface WeeklyScheduleSummary {
  rangeLabel: string;
  totalThisWeek: number;
  completed: number;
  pending: number;
  attendanceRate: number;
}

export interface CalendarGridCell {
  dateIso: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
}

export const SCHEDULE_TODAY_ISO = '2026-07-13';

export const SCHEDULE_SUBJECTS = ['Mathematics', 'Science', 'English', 'History'] as const;

export const SCHEDULE_HELP_TYPES: SessionHelpType[] = [
  'Learn a Lesson',
  'Prepare for a Test',
  'Homework Help',
];

export const SCHEDULE_DURATIONS = [30, 45, 60, 90] as const;

export const SUBJECT_LESSON_CATALOG: Record<string, string[]> = {
  Mathematics: [
    'Solving linear equations and inequalities in one variable - Part 1',
    'Graphing Linear Equations and Inequalities on the Coordinate Plane - Part 2',
    'Review: Trigonometry (Review)',
    'Factorization of Algebraic Expressions - Part 1',
    'Quadratic Functions and Vertex Form',
    'Systems of Linear Equations & Matrix Basics',
  ],
  Science: [
    'Matter: Physical Properties and Chemical Properties',
    'Atomic Structure and Periodic Table Trends',
    'Cellular Respiration and Photosynthesis',
    'Forces, Newton Laws, and Motion Graphs',
    'Chemical Bonding and Molecular Geometry',
  ],
  English: [
    'Writing Lab: Argumentative Thesis & Evidence',
    'Rhetorical Analysis of Non-Fiction Texts',
    'Literary Devices & Theme Synthesis',
    'Grammar & Concise Academic Style Workshop',
  ],
  History: [
    'Industrial Revolution & Economic Transformation',
    'Constitutional Principles & Civic Institutions',
    'Primary Source Analysis: Early 20th Century',
    'Global Trade Networks & Cultural Exchange',
  ],
};

export function getShortCalendarLabel(subject: string, topic: string): string {
  const lower = topic.toLowerCase();
  if (lower.includes('trigonometry')) return 'Trigonometry';
  if (lower.includes('quadratic')) return 'Quadratic Eq.';
  if (lower.includes('writing')) return 'Writing Lab';
  if (lower.includes('cellular') || lower.includes('biology')) return 'Biology 101';
  if (lower.includes('matter') || lower.includes('atomic') || lower.includes('chemical')) {
    return 'Biology 101';
  }
  if (subject === 'Mathematics') return 'Algebra II';
  if (subject === 'Science') return 'Biology 101';
  if (subject === 'English') return 'Writing Lab';
  return topic.slice(0, 18);
}

export const INITIAL_SCHEDULE_SESSIONS: ScheduleSessionItem[] = [
  {
    id: 'sch-today-1',
    subject: 'Mathematics',
    topic: 'Graphing Linear Equations and Inequalities on the Coordinate Plane - Part 2',
    calendarLabel: '09:00 Algebra II',
    status: 'upcoming',
    dateIso: '2026-07-13',
    startTime24: '09:00',
    durationMins: 30,
    tutorName: 'AI Tutor',
    sessionType: 'Learn a Lesson',
    curriculum: 'Common Core State Standards (CCSS)',
    isLive: true,
    notesSummary:
      'Focus on plotting slope-intercept inequalities, choosing solid vs. dashed boundary lines, and testing (0, 0) to shade the valid half-plane.',
    keyTakeaways: [
      'Use a dashed line for strict inequalities (< or >) and solid line for <= or >=.',
      'Always verify shading direction with a test point not on the boundary line.',
      'Convert standard form Ax + By <= C into slope-intercept form carefully when dividing by a negative.',
    ],
    recordingChapters: [
      {
        id: 'ch-t1-1',
        title: 'Boundary Line Rules',
        timestamp: '00:00',
        seconds: 0,
        summary: 'Recap of solid vs. dashed lines for linear inequalities.',
      },
      {
        id: 'ch-t1-2',
        title: 'Test Point Shading Strategy',
        timestamp: '09:15',
        seconds: 555,
        summary: 'Using (0, 0) as the fastest validation test point.',
      },
      {
        id: 'ch-t1-3',
        title: 'Guided Coordinate Practice',
        timestamp: '19:40',
        seconds: 1180,
        summary: 'Graphing two-variable systems and finding overlap regions.',
      },
    ],
  },
  {
    id: 'sch-today-2',
    subject: 'Science',
    topic: 'Cellular Respiration and Energy Pathways - Guided Lab Review',
    calendarLabel: '14:00 Biology',
    status: 'upcoming',
    dateIso: '2026-07-13',
    startTime24: '14:00',
    durationMins: 45,
    tutorName: 'AI Tutor',
    sessionType: 'Learn a Lesson',
    curriculum: 'Common Core State Standards (CCSS)',
    isLive: false,
    notesSummary:
      'Compare aerobic glycolysis, the Krebs cycle, and ATP yield against anaerobic fermentation.',
    keyTakeaways: [
      'Glycolysis occurs in the cytoplasm and yields a net 2 ATP.',
      'Electron transport chain in the inner mitochondrial membrane produces the majority of ATP.',
      'Oxygen serves as the final electron acceptor in aerobic respiration.',
    ],
    recordingChapters: [
      {
        id: 'ch-t2-1',
        title: 'ATP & Cellular Energy Basics',
        timestamp: '00:00',
        seconds: 0,
        summary: 'Overview of how cells convert glucose into usable ATP.',
      },
      {
        id: 'ch-t2-2',
        title: 'Mitochondria & Aerobic Stages',
        timestamp: '14:10',
        seconds: 850,
        summary: 'Step-by-step walk through Krebs cycle and ETC.',
      },
    ],
  },
  {
    id: 'sch-future-1',
    subject: 'English',
    topic: 'Writing Lab: Argumentative Thesis & Evidence',
    calendarLabel: 'Writing Lab',
    status: 'upcoming',
    dateIso: '2026-07-14',
    startTime24: '11:00',
    durationMins: 45,
    tutorName: 'AI Tutor',
    sessionType: 'Learn a Lesson',
    curriculum: 'Common Core State Standards (CCSS)',
    notesSummary: 'Drafting strong claim statements backed by credible textual evidence.',
    keyTakeaways: [
      'A defensible thesis makes a specific claim and outlines reasoning.',
      'Integrate quotations smoothly instead of dropping standalone quotes.',
    ],
    recordingChapters: [
      {
        id: 'ch-f1-1',
        title: 'Thesis Precision',
        timestamp: '00:00',
        seconds: 0,
        summary: 'Sharpening broad topics into arguable claims.',
      },
    ],
  },
  {
    id: 'sch-future-2',
    subject: 'Mathematics',
    topic: 'Quadratic Functions and Vertex Form',
    calendarLabel: 'Algebra II',
    status: 'upcoming',
    dateIso: '2026-07-15',
    startTime24: '15:30',
    durationMins: 45,
    tutorName: 'AI Tutor',
    sessionType: 'Learn a Lesson',
    curriculum: 'Common Core State Standards (CCSS)',
    notesSummary: 'Completing the square to transform standard quadratics into vertex form.',
    keyTakeaways: [
      'Vertex form y = a(x - h)^2 + k immediately reveals vertex (h, k).',
      'Sign of a determines whether the parabola opens upward or downward.',
    ],
    recordingChapters: [
      {
        id: 'ch-f2-1',
        title: 'Completing the Square',
        timestamp: '00:00',
        seconds: 0,
        summary: 'Deriving vertex form step by step.',
      },
    ],
  },
  {
    id: 'sch-future-3',
    subject: 'Science',
    topic: 'Chemical Bonding and Molecular Geometry',
    calendarLabel: 'Biology 101',
    status: 'upcoming',
    dateIso: '2026-07-16',
    startTime24: '10:00',
    durationMins: 45,
    tutorName: 'AI Tutor',
    sessionType: 'Prepare for a Test',
    curriculum: 'Common Core State Standards (CCSS)',
    notesSummary: 'Ionic vs. covalent bonds and VSEPR molecular shapes.',
    keyTakeaways: [
      'Electronegativity difference predicts polar vs. nonpolar covalent bonds.',
      'Lone electron pairs compress bond angles in tetrahedral structures.',
    ],
    recordingChapters: [
      {
        id: 'ch-f3-1',
        title: 'Lewis Structures',
        timestamp: '00:00',
        seconds: 0,
        summary: 'Counting valence electrons and drawing octet structures.',
      },
    ],
  },
  {
    id: 'sch-future-4',
    subject: 'Mathematics',
    topic: 'Review: Trigonometry (Review)',
    calendarLabel: 'Algebra II',
    status: 'upcoming',
    dateIso: '2026-07-17',
    startTime24: '16:00',
    durationMins: 45,
    tutorName: 'AI Tutor',
    sessionType: 'Prepare for a Test',
    curriculum: 'Common Core State Standards (CCSS)',
    notesSummary: 'Right-triangle trigonometric ratios and unit circle angle conversions.',
    keyTakeaways: [
      'SOH-CAH-TOA applies strictly to right triangles.',
      'Convert degrees to radians by multiplying by pi / 180.',
    ],
    recordingChapters: [
      {
        id: 'ch-f4-1',
        title: 'Trig Ratios Refresher',
        timestamp: '00:00',
        seconds: 0,
        summary: 'Solving unknown sides and angles with sin, cos, and tan.',
      },
    ],
  },
  {
    id: 'sch-future-5',
    subject: 'Science',
    topic: 'Forces, Newton Laws, and Motion Graphs',
    calendarLabel: 'Biology 101',
    status: 'upcoming',
    dateIso: '2026-07-20',
    startTime24: '11:00',
    durationMins: 45,
    tutorName: 'AI Tutor',
    sessionType: 'Learn a Lesson',
    curriculum: 'Common Core State Standards (CCSS)',
    notesSummary: 'Free-body diagrams and interpreting velocity-time slope and area.',
    keyTakeaways: [
      'Slope of a velocity-time graph gives acceleration; area gives displacement.',
    ],
    recordingChapters: [
      {
        id: 'ch-f5-1',
        title: 'Free-Body Diagrams',
        timestamp: '00:00',
        seconds: 0,
        summary: 'Resolving normal force, friction, and gravity components.',
      },
    ],
  },
  {
    id: 'sch-future-6',
    subject: 'Mathematics',
    topic: 'Systems of Linear Equations & Matrix Basics',
    calendarLabel: 'Algebra II',
    status: 'upcoming',
    dateIso: '2026-07-22',
    startTime24: '14:30',
    durationMins: 45,
    tutorName: 'AI Tutor',
    sessionType: 'Learn a Lesson',
    curriculum: 'Common Core State Standards (CCSS)',
    notesSummary: 'Solving 2x2 and 3x3 systems using elimination and substitution.',
    keyTakeaways: [
      'Parallel lines indicate an inconsistent system with zero solutions.',
    ],
    recordingChapters: [
      {
        id: 'ch-f6-1',
        title: 'Elimination Shortcuts',
        timestamp: '00:00',
        seconds: 0,
        summary: 'Choosing multipliers that cancel variables cleanly.',
      },
    ],
  },
  {
    id: 'sch-lw-1',
    subject: 'Science',
    topic: 'Matter: Physical Properties and Chemical Properties',
    calendarLabel: 'Biology 101',
    status: 'completed',
    dateIso: '2026-07-06',
    startTime24: '07:32',
    durationMins: 45,
    tutorName: 'AI Tutor',
    sessionType: 'Learn a Lesson',
    curriculum: 'Common Core State Standards (CCSS)',
    masteryScore: 60,
    performanceLabel: 'Good',
    notesSummary:
      'Explored distinguishing reversible physical changes from chemical reactions that form new substances.',
    keyTakeaways: [
      'Density, melting point, and state changes are physical properties.',
      'Gas evolution, precipitate formation, and color change often signal chemical change.',
      'Review balancing simple combustion equations to push mastery above 85%.',
    ],
    recordingChapters: [
      {
        id: 'ch-lw1-1',
        title: 'Physical vs. Chemical Properties',
        timestamp: '00:00',
        seconds: 0,
        summary: 'Sorting real-world lab observations into physical or chemical categories.',
      },
      {
        id: 'ch-lw1-2',
        title: 'Conservation of Mass Check',
        timestamp: '16:20',
        seconds: 980,
        summary: 'Closed-system mass experiments and common misconceptions.',
      },
      {
        id: 'ch-lw1-3',
        title: 'Exit Quiz & Feedback',
        timestamp: '34:10',
        seconds: 2050,
        summary: 'Scored 60% with recommended targeted follow-up drills.',
      },
    ],
  },
  {
    id: 'sch-lw-2',
    subject: 'Science',
    topic: 'Matter: Physical Properties and Chemical Properties - Lab Mastery',
    calendarLabel: 'Biology 101',
    status: 'completed',
    dateIso: '2026-07-08',
    startTime24: '07:32',
    durationMins: 45,
    tutorName: 'AI Tutor',
    sessionType: 'Learn a Lesson',
    curriculum: 'Common Core State Standards (CCSS)',
    masteryScore: 90,
    performanceLabel: 'Excellent',
    notesSummary:
      'Mastered density calculations, phase-change heating curves, and identifying chemical reactivity patterns.',
    keyTakeaways: [
      'Temperature remains constant during phase transitions because energy breaks intermolecular forces.',
      'Solved 9 of 10 synthesis lab prompts independently without hints.',
      'Ready to advance to Atomic Structure and Bonding.',
    ],
    recordingChapters: [
      {
        id: 'ch-lw2-1',
        title: 'Heating Curve Breakdown',
        timestamp: '00:00',
        seconds: 0,
        summary: 'Understanding latent heat plateaus on temperature-time graphs.',
      },
      {
        id: 'ch-lw2-2',
        title: 'Density & Buoyancy Drills',
        timestamp: '18:05',
        seconds: 1085,
        summary: 'Multi-step unit conversions for mass and displaced volume.',
      },
      {
        id: 'ch-lw2-3',
        title: 'Mastery Checkpoint (90%)',
        timestamp: '36:45',
        seconds: 2205,
        summary: 'High-accuracy synthesis round with zero conceptual errors.',
      },
    ],
  },
  {
    id: 'sch-lw-3',
    subject: 'Mathematics',
    topic: 'Linear Functions & Rate of Change Foundations',
    calendarLabel: 'Algebra II',
    status: 'completed',
    dateIso: '2026-07-02',
    startTime24: '15:00',
    durationMins: 45,
    tutorName: 'AI Tutor',
    sessionType: 'Learn a Lesson',
    curriculum: 'Common Core State Standards (CCSS)',
    masteryScore: 88,
    performanceLabel: 'Excellent',
    notesSummary: 'Interpreted slope as average rate of change across tables and graphs.',
    keyTakeaways: [
      'Constant first differences in equally spaced x-values confirm linearity.',
    ],
    recordingChapters: [
      {
        id: 'ch-lw3-1',
        title: 'Slope from Tables',
        timestamp: '00:00',
        seconds: 0,
        summary: 'Calculating delta y / delta x consistently.',
      },
    ],
  },
  {
    id: 'sch-missed-1',
    subject: 'Mathematics',
    topic: 'Factorization of Algebraic Expressions - Part 1',
    calendarLabel: 'Algebra II',
    status: 'canceled',
    dateIso: '2026-07-10',
    startTime24: '09:00',
    durationMins: 45,
    tutorName: 'AI Tutor',
    sessionType: 'Learn a Lesson',
    curriculum: 'Common Core State Standards (CCSS)',
    notesSummary:
      'Canceled prior to start. Covers greatest common factor (GCF), grouping, and difference of squares.',
    keyTakeaways: [
      'Always factor out the GCF before applying trinomial or difference-of-squares patterns.',
    ],
    recordingChapters: [
      {
        id: 'ch-m1-1',
        title: 'Pre-Session Concept Preview',
        timestamp: '00:00',
        seconds: 0,
        summary: 'Short warm-up walkthrough of GCF factoring.',
      },
    ],
  },
  {
    id: 'sch-missed-2',
    subject: 'Science',
    topic: 'Forces, Newton Laws, and Motion Graphs - Part 1',
    calendarLabel: 'Science Prep',
    status: 'missed',
    dateIso: '2026-07-08',
    startTime24: '07:32',
    durationMins: 45,
    tutorName: 'AI Tutor',
    sessionType: 'Homework Help',
    curriculum: 'Common Core State Standards (CCSS)',
    notesSummary:
      'Missed session — AI Tutor generated a self-paced recording recap and practice sheet so you can catch up or reschedule.',
    keyTakeaways: [
      'Isolate the variable by applying inverse operations symmetrically to both sides.',
      'Reverse the inequality symbol whenever multiplying or dividing by a negative number.',
    ],
    recordingChapters: [
      {
        id: 'ch-m2-1',
        title: 'AI Catch-Up Recap',
        timestamp: '00:00',
        seconds: 0,
        summary: '8-minute condensed lesson walkthrough prepared automatically.',
      },
      {
        id: 'ch-m2-2',
        title: 'Negative Multiplier Sign Flip',
        timestamp: '05:10',
        seconds: 310,
        summary: 'Visual proof on a number line for why inequality direction flips.',
      },
    ],
  },
];

const MONTHS_SHORT = [
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

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function parseIsoDate(dateIso: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateIso.split('-').map((n) => Number(n));
  return {
    year: Number.isFinite(y) ? y : 2026,
    month: Number.isFinite(m) ? m : 7,
    day: Number.isFinite(d) ? d : 13,
  };
}

export function formatIsoDateShort(dateIso: string): string {
  const { month, day } = parseIsoDate(dateIso);
  const mon = MONTHS_SHORT[Math.max(0, Math.min(11, month - 1))];
  return `${mon} ${day}`;
}

export function formatIsoDateWithYear(dateIso: string): string {
  const { year, month, day } = parseIsoDate(dateIso);
  const mon = MONTHS_SHORT[Math.max(0, Math.min(11, month - 1))];
  return `${mon} ${day}, ${year}`;
}

export function formatMonthYearHeading(year: number, monthIndex: number): string {
  const safeMonth = ((monthIndex % 12) + 12) % 12;
  return `${MONTHS_LONG[safeMonth]} ${year}`;
}

export function format24hTimeTo12h(time24: string): string {
  const [rawH, rawM] = time24.split(':').map((n) => Number(n));
  const h = Number.isFinite(rawH) ? rawH : 9;
  const m = Number.isFinite(rawM) ? rawM : 0;
  const meridiem = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${meridiem}`;
}

export function formatTimeRange12h(startTime24: string, durationMins: number): string {
  const [rawH, rawM] = startTime24.split(':').map((n) => Number(n));
  const startTotal = (Number.isFinite(rawH) ? rawH : 9) * 60 + (Number.isFinite(rawM) ? rawM : 0);
  const endTotal = (startTotal + durationMins) % (24 * 60);
  const endH = Math.floor(endTotal / 60);
  const endM = endTotal % 60;
  const end24 = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  return `${format24hTimeTo12h(startTime24)} - ${format24hTimeTo12h(end24)}`;
}

export function addDaysIso(dateIso: string, deltaDays: number): string {
  const { year, month, day } = parseIsoDate(dateIso);
  const dt = new Date(Date.UTC(year, month - 1, day + deltaDays));
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function diffDaysIso(dateIsoA: string, dateIsoB: string): number {
  const a = parseIsoDate(dateIsoA);
  const b = parseIsoDate(dateIsoB);
  const msA = Date.UTC(a.year, a.month - 1, a.day);
  const msB = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((msA - msB) / (1000 * 60 * 60 * 24));
}

export function filterScheduleSessions(
  sessions: ScheduleSessionItem[],
  periodFilter: SchedulePeriodFilter,
  subjectFilter: string,
  statusTab: ScheduleStatusTab,
  todayIso: string = SCHEDULE_TODAY_ISO
): ScheduleSessionItem[] {
  return sessions.filter((session) => {
    if (session.dismissed) return false;

    if (subjectFilter !== 'All Subjects' && session.subject !== subjectFilter) {
      return false;
    }

    if (statusTab === 'upcoming' && session.status !== 'upcoming') return false;
    if (statusTab === 'completed' && session.status !== 'completed') return false;
    if (
      statusTab === 'missed' &&
      session.status !== 'missed' &&
      session.status !== 'canceled'
    ) {
      return false;
    }

    if (periodFilter === 'This Week') {
      const delta = diffDaysIso(session.dateIso, todayIso);
      // Include last week completed/missed (-7..+6) so Today, Last Week & Missed/Cancelled stay visible together
      if (delta < -7 || delta > 6) return false;
    } else if (periodFilter === 'This Month') {
      const todayParts = parseIsoDate(todayIso);
      const sesParts = parseIsoDate(session.dateIso);
      if (sesParts.year !== todayParts.year || sesParts.month !== todayParts.month) {
        return false;
      }
    }

    return true;
  });
}

export interface GroupedScheduleSessions {
  today: ScheduleSessionItem[];
  upcomingLater: ScheduleSessionItem[];
  lastWeek: ScheduleSessionItem[];
  missedOrCancelled: ScheduleSessionItem[];
}

export function groupScheduleSessions(
  sessions: ScheduleSessionItem[],
  todayIso: string = SCHEDULE_TODAY_ISO
): GroupedScheduleSessions {
  const today: ScheduleSessionItem[] = [];
  const upcomingLater: ScheduleSessionItem[] = [];
  const lastWeek: ScheduleSessionItem[] = [];
  const missedOrCancelled: ScheduleSessionItem[] = [];

  const sorted = [...sessions].sort((a, b) => {
    const dateCmp = a.dateIso.localeCompare(b.dateIso);
    if (dateCmp !== 0) return dateCmp;
    return a.startTime24.localeCompare(b.startTime24);
  });

  for (const item of sorted) {
    if (item.dismissed) continue;
    if (item.status === 'missed' || item.status === 'canceled') {
      missedOrCancelled.push(item);
    } else if (item.status === 'completed') {
      lastWeek.push(item);
    } else if (item.dateIso === todayIso) {
      today.push(item);
    } else {
      upcomingLater.push(item);
    }
  }

  return { today, upcomingLater, lastWeek, missedOrCancelled };
}

export function computeWeeklyScheduleSummary(
  sessions: ScheduleSessionItem[],
  todayIso: string = SCHEDULE_TODAY_ISO
): WeeklyScheduleSummary {
  const active = sessions.filter((s) => !s.dismissed);
  const inWindow = active.filter((s) => {
    const delta = diffDaysIso(s.dateIso, todayIso);
    return delta >= -7 && delta <= 6;
  });

  const completed = inWindow.filter((s) => s.status === 'completed').length;
  const pending = inWindow.filter((s) => s.status === 'upcoming').length;
  const missedOnly = inWindow.filter((s) => s.status === 'missed').length;
  const canceledOnly = inWindow.filter((s) => s.status === 'canceled').length;
  const totalThisWeek = completed + pending + missedOnly + canceledOnly;
  const attendanceDenominator = completed + missedOnly;
  const attendanceRate =
    attendanceDenominator > 0 ? Math.round((completed / attendanceDenominator) * 100) : 100;

  return {
    rangeLabel: 'Jul 06 - Jul 18',
    totalThisWeek,
    completed,
    pending,
    attendanceRate,
  };
}

export function buildCalendarMonthGrid(
  year: number,
  monthIndex: number,
  todayIso: string = SCHEDULE_TODAY_ISO
): CalendarGridCell[] {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const startWeekday = firstDay.getUTCDay(); // 0 = Sunday
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const totalCells = startWeekday + daysInMonth > 35 ? 42 : 35;

  const cells: CalendarGridCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayOffset = i - startWeekday;
    const cellDate = new Date(Date.UTC(year, monthIndex, 1 + dayOffset));
    const cy = cellDate.getUTCFullYear();
    const cm = cellDate.getUTCMonth();
    const cd = cellDate.getUTCDate();
    const dateIso = `${cy}-${String(cm + 1).padStart(2, '0')}-${String(cd).padStart(2, '0')}`;
    cells.push({
      dateIso,
      dayNumber: cd,
      inCurrentMonth: cy === year && cm === monthIndex,
      isToday: dateIso === todayIso,
    });
  }
  return cells;
}

export function createBlankDraftLesson(
  subject: string,
  index: number,
  presetDateIso: string = ''
): ScheduleDraftLesson {
  const catalog = SUBJECT_LESSON_CATALOG[subject] ?? SUBJECT_LESSON_CATALOG.Mathematics;
  return {
    id: `draft-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    lessonName: catalog[index % catalog.length],
    dateIso: presetDateIso,
    durationMins: 45,
    startTime24: '',
  };
}

export function autoScheduleLessons(
  subject: string,
  existingLessons: ScheduleDraftLesson[],
  startDateIso: string = addDaysIso(SCHEDULE_TODAY_ISO, 2)
): ScheduleDraftLesson[] {
  const resolvedSubject = subject || 'Mathematics';
  const catalog = SUBJECT_LESSON_CATALOG[resolvedSubject] ?? SUBJECT_LESSON_CATALOG.Mathematics;
  const count = Math.max(3, existingLessons.length);
  const preferredTimes = ['13:30', '15:00', '16:00', '14:15', '17:00'];

  const scheduled: ScheduleDraftLesson[] = [];
  let cursorIso = startDateIso;

  for (let i = 0; i < count; i++) {
    // Advance off weekends cleanly
    let safety = 0;
    while (safety < 7) {
      const { year, month, day } = parseIsoDate(cursorIso);
      const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
      if (weekday !== 0 && weekday !== 6) break;
      cursorIso = addDaysIso(cursorIso, 1);
      safety++;
    }

    const base = existingLessons[i];
    scheduled.push({
      id: base?.id ?? `auto-${i + 1}`,
      lessonName: catalog[i % catalog.length],
      dateIso: cursorIso,
      durationMins: base?.durationMins || 45,
      startTime24: preferredTimes[i % preferredTimes.length],
    });

    cursorIso = addDaysIso(cursorIso, 2);
  }

  return scheduled;
}

export function validateCreateScheduleForm(input: CreateScheduleFormInput): string | null {
  if (!input.helpType) {
    return 'Please choose what you need help with before confirming.';
  }
  if (!input.subject.trim()) {
    return 'Please select a subject for your tutoring schedule.';
  }
  if (!input.curriculum.trim()) {
    return 'Please specify your curriculum or standards.';
  }

  const activeLessons = input.mode === 'one-time' ? input.lessons.slice(0, 1) : input.lessons;
  if (activeLessons.length === 0) {
    return 'Please add at least one lesson to schedule.';
  }

  for (let i = 0; i < activeLessons.length; i++) {
    const lesson = activeLessons[i];
    if (!lesson.lessonName.trim()) {
      return `Please choose a lesson name for Lesson ${i + 1}.`;
    }
    if (!lesson.dateIso.trim()) {
      return `Please pick a date for Lesson ${i + 1}.`;
    }
    if (!lesson.startTime24.trim()) {
      return `Please pick a start time for Lesson ${i + 1}.`;
    }
  }

  return null;
}

export function buildSessionsFromCreateForm(input: CreateScheduleFormInput): {
  newSessions: ScheduleSessionItem[];
  confirmations: ScheduledConfirmationItem[];
} {
  const activeLessons = input.mode === 'one-time' ? input.lessons.slice(0, 1) : input.lessons;
  const sessionType: SessionHelpType = (input.helpType || 'Learn a Lesson') as SessionHelpType;
  const stamp = Date.now();

  const newSessions: ScheduleSessionItem[] = [];
  const confirmations: ScheduledConfirmationItem[] = [];

  activeLessons.forEach((draft, idx) => {
    const id = `sch-created-${stamp}-${idx + 1}`;
    const duration = draft.durationMins || 45;
    const shortLabel = getShortCalendarLabel(input.subject, draft.lessonName);
    const calLabel =
      draft.dateIso === SCHEDULE_TODAY_ISO
        ? `${draft.startTime24} ${shortLabel}`
        : shortLabel;

    newSessions.push({
      id,
      subject: input.subject,
      topic: draft.lessonName,
      calendarLabel: calLabel,
      status: 'upcoming',
      dateIso: draft.dateIso,
      startTime24: draft.startTime24,
      durationMins: duration,
      tutorName: 'AI Tutor',
      sessionType,
      curriculum: input.curriculum.trim(),
      isLive: draft.dateIso === SCHEDULE_TODAY_ISO,
      notesSummary: `Scheduled ${sessionType.toLowerCase()} session on ${draft.lessonName} (${input.curriculum.trim()}).`,
      keyTakeaways: [
        `Bring your questions for ${draft.lessonName}.`,
        'AI Tutor will adapt pacing based on your live mastery check.',
      ],
      recordingChapters: [
        {
          id: `ch-new-${stamp}-${idx}`,
          title: 'Pre-Session Briefing',
          timestamp: '00:00',
          seconds: 0,
          summary: 'Recording becomes available right after the tutoring session wraps.',
        },
      ],
    });

    confirmations.push({
      id,
      subject: input.subject,
      lesson: draft.lessonName,
      dateTimeLabel: `${formatIsoDateWithYear(draft.dateIso)} at ${format24hTimeTo12h(draft.startTime24)}`,
      durationLabel: `${duration}m`,
      sessionType,
    });
  });

  return { newSessions, confirmations };
}

export function rescheduleScheduleSession(
  sessions: ScheduleSessionItem[],
  sessionId: string,
  newDateIso: string,
  newTime24: string,
  newDurationMins?: number
): ScheduleSessionItem[] {
  return sessions.map((session) => {
    if (session.id !== sessionId) return session;
    const duration = newDurationMins ?? session.durationMins;
    const shortLabel = getShortCalendarLabel(session.subject, session.topic);
    return {
      ...session,
      dateIso: newDateIso,
      startTime24: newTime24,
      durationMins: duration,
      status: 'upcoming',
      isLive: newDateIso === SCHEDULE_TODAY_ISO,
      calendarLabel:
        newDateIso === SCHEDULE_TODAY_ISO ? `${newTime24} ${shortLabel}` : shortLabel,
    };
  });
}

export function cancelScheduleSession(
  sessions: ScheduleSessionItem[],
  sessionId: string
): ScheduleSessionItem[] {
  return sessions.map((session) =>
    session.id === sessionId
      ? { ...session, status: 'canceled', isLive: false }
      : session
  );
}

export function dismissMissedScheduleSession(
  sessions: ScheduleSessionItem[],
  sessionId: string
): ScheduleSessionItem[] {
  return sessions.map((session) =>
    session.id === sessionId ? { ...session, dismissed: true } : session
  );
}

export function toDashboardCalendarSession(item: ScheduleSessionItem): CalendarSession {
  const [rawH, rawM] = item.startTime24.split(':').map((n) => Number(n));
  const h = Number.isFinite(rawH) ? rawH : 9;
  const m = Number.isFinite(rawM) ? rawM : 0;
  const meridiem: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;

  return {
    id: item.id,
    dateKey: item.dateIso,
    time: `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
    meridiem,
    title: item.topic,
    description: `${item.durationMins} min ${item.subject} · ${item.sessionType}`,
    status: item.status === 'upcoming' ? 'scheduled' : 'missed',
    tutorName: item.tutorName,
    subject: item.subject,
  };
}
