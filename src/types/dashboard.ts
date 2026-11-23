export type NavSectionId =
  | 'dashboard'
  | 'schedule'
  | 'sessions'
  | 'learning-plan'
  | 'practice'
  | 'progress'
  | 'notes'
  | 'messages'
  | 'achievements'
  | 'settings';

export type LanguageCode = 'ENG' | 'ESP' | 'FRA' | 'DEU';

export type AccountRole = 'student' | 'parent' | 'teacher' | 'school';

export type AuthView = 'signup' | 'login';

export interface StudentProfile {
  firstName: string;
  fullName: string;
  grade: string;
  curriculum: string;
  subjects: string[];
  learningStyle: 'Visual' | 'Interactive' | 'Step-by-Step' | 'Practice-First';
  dailyTargetMinutes: number;
  email: string;
  role?: AccountRole;
  organizationName?: string;
  childName?: string;
}

export type ActionStatus = 'In Progress' | 'Term 2' | 'Final' | 'Completed' | 'Plan Ready';

export interface LearningAction {
  id: string;
  category: string;
  focus: string;
  status: ActionStatus;
  subject: string;
  description: string;
  primaryCta: 'Resume ILP Generation' | 'Start Readiness Check' | 'View Readiness Report';
  hasGeneratePlan: boolean;
  score?: number;
  unitTopic: string;
}

export interface LearningGoal {
  id: string;
  label: string;
  dueDate: string;
  category: string;
  subject: string;
  title: string;
  progress: number;
  completed: boolean;
}

export type SessionColumnStatus = 'missed' | 'upcoming' | 'scheduled';

export interface CalendarSession {
  id: string;
  dateKey: string; // e.g. '2026-07-15'
  time: string; // e.g. '09:00'
  meridiem: 'AM' | 'PM';
  title: string;
  description: string;
  status: SessionColumnStatus;
  tutorName: string;
  subject: string;
}

export interface CalendarDay {
  dateKey: string;
  weekday: string;
  dayNumber: number;
}

export interface QuizQuestion {
  id: string;
  subject: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AiLesson {
  id: string;
  title: string;
  subject: string;
  duration: string;
  difficulty: 'Foundation' | 'Core' | 'Honors';
  summary: string;
  chapters: { title: string; timestamp: string; content: string }[];
  completed: boolean;
}

export interface LearningPlanModule {
  id: string;
  subject: string;
  title: string;
  week: string;
  estimatedMinutes: number;
  completed: boolean;
  mastery: number;
}

export interface StudyNote {
  id: string;
  subject: string;
  title: string;
  content: string;
  updatedAt: string;
  pinned: boolean;
}

export interface TutorMessageThread {
  id: string;
  tutorName: string;
  role: string;
  subject: string;
  unread: number;
  messages: {
    id: string;
    sender: 'tutor' | 'student';
    text: string;
    time: string;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  type: 'streak' | 'session' | 'plan';
}

export interface ChatTurn {
  id: string;
  sender: 'ai' | 'student';
  text: string;
  timestamp: string;
  suggestionChips?: string[];
}

export type SessionHelpType = 'Learn a Lesson' | 'Prepare for a Test' | 'Homework Help';

export type LessonSource = 'learning-plan' | 'another-topic';

export interface ProblemAttachment {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  base64Data?: string;
  previewDataUrl?: string;
  textContent?: string;
}

export interface ProblemSolverPayload {
  problemText: string;
  attachment: ProblemAttachment | null;
}

export interface StartSessionInput {
  helpType: SessionHelpType;
  subject: string;
  lessonSource: LessonSource;
  topic: string;
  specificQuestion: string;
  gradeLevel?: string;
  problemSolver?: ProblemSolverPayload;
}

export interface SmartQuizInput {
  subject: string;
  topic: string;
}


