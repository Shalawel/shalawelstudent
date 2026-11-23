import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  MessageSquare,
  Pin,
  Play,
  Plus,
  Rocket,
  Search,
  Send,
  Sparkles,
  TrendingUp,
  Video,
} from 'lucide-react';
import type {
  AiLesson,
  CalendarDay,
  CalendarSession,
  LearningAction,
  LearningGoal,
  LearningPlanModule,
  NavSectionId,
  SessionColumnStatus,
  StudentProfile,
  StudyNote,
  TutorMessageThread,
} from '../types/dashboard';
import { AVAILABLE_CURRICULA, AVAILABLE_SUBJECTS } from '../data/seedData';

interface SecondaryViewProps {
  section: Exclude<NavSectionId, 'dashboard'>;
  profile: StudentProfile;
  onUpdateProfile: (profile: StudentProfile) => void;
  streakDays: number;
  actions: LearningAction[];
  onTriggerAction: (action: LearningAction) => void;
  onGeneratePlan: (action: LearningAction) => void;
  goals: LearningGoal[];
  onOpenSetGoal: () => void;
  sessions: CalendarSession[];
  calendarDays: CalendarDay[];
  selectedDateKey: string;
  onSelectDateKey: (dateKey: string) => void;
  onSelectSession: (session: CalendarSession) => void;
  onAddSession: (session: Omit<CalendarSession, 'id'>) => void;
  planModules: LearningPlanModule[];
  onTogglePlanModule: (moduleId: string) => void;
  lessons: AiLesson[];
  onOpenAiLessons: () => void;
  onOpenSmartQuiz: () => void;
  onOpenAiTutor: (prompt?: string) => void;
  notes: StudyNote[];
  onAddNote: (note: Omit<StudyNote, 'id' | 'updatedAt' | 'pinned'>) => void;
  onTogglePinNote: (noteId: string) => void;
  threads: TutorMessageThread[];
  onSendThreadReply: (threadId: string, text: string) => void;
  onMarkThreadRead: (threadId: string) => void;
  completedQuizzesCount: number;
}

export const SecondaryViews: React.FC<SecondaryViewProps> = ({
  section,
  profile,
  onUpdateProfile,
  streakDays,
  actions,
  onTriggerAction,
  onGeneratePlan,
  goals,
  onOpenSetGoal,
  sessions,
  calendarDays,
  selectedDateKey,
  onSelectDateKey,
  onSelectSession,
  onAddSession,
  planModules,
  onTogglePlanModule,
  lessons,
  onOpenAiLessons,
  onOpenSmartQuiz,
  onOpenAiTutor,
  notes,
  onAddNote,
  onTogglePinNote,
  threads,
  onSendThreadReply,
  onMarkThreadRead,
  completedQuizzesCount,
}) => {
  // Schedule filter + quick add state
  const [statusFilter, setStatusFilter] = useState<'all' | SessionColumnStatus>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTime, setNewTime] = useState('04:00');
  const [newMeridiem, setNewMeridiem] = useState<'AM' | 'PM'>('PM');
  const [newStatus, setNewStatus] = useState<SessionColumnStatus>('scheduled');
  const [sessionError, setSessionError] = useState('');

  // Notes state
  const [noteQuery, setNoteQuery] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('English');
  const [noteBody, setNoteBody] = useState('');
  const [noteError, setNoteError] = useState('');

  // Messages state
  const [activeThreadId, setActiveThreadId] = useState(threads[0]?.id ?? '');
  const [replyDraft, setReplyDraft] = useState('');

  // Settings local draft
  const [settingsSavedBanner, setSettingsSavedBanner] = useState(false);

  if (section === 'schedule') {
    const filtered = sessions.filter((s) =>
      statusFilter === 'all' ? true : s.status === statusFilter
    );

    return (
      <div className="space-y-5">
        <div className="rounded-[22px] bg-white p-6 shadow-[0_8px_28px_rgba(21,98,158,0.08)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900">Full Schedule</h1>
              <p className="text-xs text-slate-500 mt-1">
                Filter sessions across dates, click any session to reschedule, or book a new slot.
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1">
              {(['all', 'missed', 'upcoming', 'scheduled'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    statusFilter === tab
                      ? 'bg-white text-[#15629E] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Session list */}
            <div className="lg:col-span-8 space-y-2.5">
              {filtered.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectSession(s)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#15629E] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-semibold">
                      <span className="tabular-nums text-slate-500">
                        {s.dateKey} · {s.time} {s.meridiem}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 capitalize ${
                          s.status === 'missed'
                            ? 'bg-red-100 text-red-700'
                            : s.status === 'upcoming'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <h2 className="mt-1 text-sm font-bold text-slate-900">{s.title}</h2>
                    <p className="text-xs text-slate-500">
                      {s.description} · {s.tutorName}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#15629E] whitespace-nowrap">
                    Manage →
                  </span>
                </button>
              ))}
            </div>

            {/* Book New Session Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTitle.trim()) {
                  setSessionError('Please enter a session title.');
                  return;
                }
                onAddSession({
                  dateKey: selectedDateKey,
                  time: newTime,
                  meridiem: newMeridiem,
                  title: newTitle.trim(),
                  description: newDesc.trim() || 'Guided study coaching session',
                  status: newStatus,
                  tutorName: 'Ms. Elena Rivera',
                  subject: profile.subjects[0] ?? 'English',
                });
                setNewTitle('');
                setNewDesc('');
                setSessionError('');
              }}
              className="lg:col-span-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 h-fit"
            >
              <h2 className="font-display text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#15629E]" />
                Add Study Session
              </h2>
              <div>
                <label htmlFor="sched-date" className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Date
                </label>
                <select
                  id="sched-date"
                  value={selectedDateKey}
                  onChange={(e) => onSelectDateKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                >
                  {calendarDays.slice(0, 14).map((d) => (
                    <option key={d.dateKey} value={d.dateKey}>
                      {d.weekday} {d.dayNumber} ({d.dateKey})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sched-title" className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Session Title
                </label>
                <input
                  id="sched-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    setSessionError('');
                  }}
                  placeholder="e.g. Algebra Practice Lab"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label htmlFor="sched-desc" className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Topic Notes
                </label>
                <input
                  id="sched-desc"
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Focus on word problems"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  aria-label="Session time"
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs tabular-nums"
                />
                <select
                  aria-label="AM or PM"
                  value={newMeridiem}
                  onChange={(e) => setNewMeridiem(e.target.value as 'AM' | 'PM')}
                  className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
                <select
                  aria-label="Session status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as SessionColumnStatus)}
                  className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>
              {sessionError && (
                <p role="alert" className="text-xs font-medium text-red-600">
                  {sessionError}
                </p>
              )}
              <button
                type="submit"
                className="w-full rounded-xl bg-[#15629E] hover:bg-[#104E7E] py-2.5 text-xs font-semibold text-white"
              >
                Add to Schedule
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (section === 'sessions') {
    const upcoming = sessions.filter((s) => s.status !== 'missed');
    return (
      <div className="rounded-[22px] bg-white p-6 shadow-[0_8px_28px_rgba(21,98,158,0.08)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">Tutoring Sessions</h1>
            <p className="text-xs text-slate-500 mt-1">
              Join live 1-on-1 tutoring rooms or launch an instant AI Tutor coaching session.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenAiTutor('Start a live guided tutoring walkthrough')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#15629E] hover:bg-[#104E7E] px-4 py-2.5 text-xs font-semibold text-white whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4" />
            <span>Launch Instant AI Tutor</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {upcoming.slice(0, 6).map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-slate-200 p-4 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span className="text-[#15629E]">{s.subject}</span>
                  <span className="tabular-nums">
                    {s.dateKey} · {s.time} {s.meridiem}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-base font-bold text-slate-900">{s.title}</h2>
                <p className="mt-1 text-xs text-slate-600">{s.description}</p>
                <p className="mt-2 text-xs font-medium text-slate-500">Tutor: {s.tutorName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onOpenAiTutor(`Prepare me for my "${s.title}" session (${s.subject})`)
                  }
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F39200] hover:bg-[#DF8500] py-2 text-xs font-semibold text-slate-950"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Prep Room</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectSession(s)}
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Reschedule
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'learning-plan') {
    const completedCount = planModules.filter((m) => m.completed).length;
    const overallPct = Math.round((completedCount / Math.max(1, planModules.length)) * 100);
    return (
      <div className="space-y-5">
        <div className="rounded-[22px] bg-white p-6 shadow-[0_8px_28px_rgba(21,98,158,0.08)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900">
                Individualized Learning Plan (ILP)
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Grade {profile.grade} · {profile.curriculum} · {completedCount} of{' '}
                {planModules.length} milestones completed ({overallPct}%)
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const pendingAction = actions.find((a) => a.status !== 'Plan Ready');
                onGeneratePlan(
                  pendingAction ?? {
                    id: `custom-ilp-${Date.now()}`,
                    category: 'Custom ILP',
                    focus: 'Concept Mastery',
                    status: 'In Progress',
                    subject: profile.subjects[0] || 'Mathematics',
                    description: 'Build an additional individualized learning track.',
                    primaryCta: 'Resume ILP Generation',
                    hasGeneratePlan: false,
                    unitTopic: 'Personalized Mastery Track',
                  }
                );
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F39200] hover:bg-[#DF8500] px-4 py-2.5 text-xs font-semibold text-slate-950 whitespace-nowrap"
            >
              <Rocket className="h-4 w-4" />
              <span>Generate New Track</span>
            </button>
          </div>

          <div className="mt-4 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#15629E] transition-all"
              style={{ width: `${overallPct}%` }}
            />
          </div>

          <div data-testid="learning-plan-modules" className="mt-5 space-y-3">
            {planModules.map((mod) => (
              <div
                key={mod.id}
                className="rounded-2xl border border-slate-200 px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => onTogglePlanModule(mod.id)}
                    aria-label={`Toggle completion for ${mod.title}`}
                    aria-pressed={mod.completed}
                    className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border transition-colors shrink-0 ${
                      mod.completed
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 bg-white hover:border-[#15629E]'
                    }`}
                  >
                    {mod.completed && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                      <span className="text-[#15629E]">{mod.subject}</span>
                      <span>·</span>
                      <span>{mod.week}</span>
                      <span>·</span>
                      <span className="tabular-nums">{mod.estimatedMinutes} min</span>
                    </div>
                    <h2
                      className={`mt-0.5 text-sm font-bold ${
                        mod.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {mod.title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-slate-700 tabular-nums">
                    {mod.completed ? 100 : mod.mastery}% mastery
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenAiTutor(`Help me study ${mod.title}`)}
                    className="rounded-xl border border-[#15629E] px-3 py-1.5 text-xs font-semibold text-[#15629E] hover:bg-blue-50"
                  >
                    Study with AI
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section === 'practice') {
    return (
      <div className="rounded-[22px] bg-white p-6 shadow-[0_8px_28px_rgba(21,98,158,0.08)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">
              Practice & Readiness Hub
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Run diagnostic readiness checks, quick peer quizzes, and interactive AI lessons.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenSmartQuiz}
              className="rounded-xl bg-[#F39200] hover:bg-[#DF8500] px-4 py-2.5 text-xs font-semibold text-slate-950"
            >
              Launch Smart Quiz
            </button>
            <button
              type="button"
              onClick={onOpenAiLessons}
              className="rounded-xl border border-[#15629E] px-4 py-2.5 text-xs font-semibold text-[#15629E] hover:bg-blue-50"
            >
              Accelerate Your Knowledge
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <div
              key={action.id}
              className="rounded-2xl border border-slate-200 p-4 flex flex-col justify-between gap-4"
            >
              <div>
                <p className="text-[11px] font-semibold text-[#15629E]">
                  {action.category} · {action.status}
                </p>
                <h2 className="mt-1 font-display text-base font-bold text-slate-900">
                  {action.subject}: {action.unitTopic}
                </h2>
                <p className="mt-1.5 text-xs text-slate-500">{action.description}</p>
              </div>
              <button
                type="button"
                onClick={() => onTriggerAction(action)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#15629E] hover:bg-[#104E7E] py-2.5 text-xs font-semibold text-white"
              >
                <Play className="h-3.5 w-3.5" />
                <span>{action.primaryCta}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'progress') {
    const completedGoals = goals.filter((g) => g.completed).length;
    const weeklyHours = [
      { day: 'Mon', mins: 35 },
      { day: 'Tue', mins: 45 },
      { day: 'Wed', mins: 60 },
      { day: 'Thu', mins: 30 },
      { day: 'Fri', mins: 50 },
      { day: 'Sat', mins: 40 },
      { day: 'Sun', mins: 25 },
    ];
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-[22px] bg-white p-5 shadow-[0_8px_28px_rgba(21,98,158,0.08)]">
            <p className="text-xs font-semibold text-slate-500">Current Daily Streak</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-[#C2410C] tabular-nums">
              Day-{streakDays}
            </p>
            <p className="mt-1 text-xs text-slate-500">Consistent daily momentum</p>
          </div>
          <div className="rounded-[22px] bg-white p-5 shadow-[0_8px_28px_rgba(21,98,158,0.08)]">
            <p className="text-xs font-semibold text-slate-500">Assessments Completed</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-[#15629E] tabular-nums">
              {completedQuizzesCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">Readiness checks & Smart Quizzes</p>
          </div>
          <div className="rounded-[22px] bg-white p-5 shadow-[0_8px_28px_rgba(21,98,158,0.08)]">
            <p className="text-xs font-semibold text-slate-500">Goals Completed</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-emerald-700 tabular-nums">
              {completedGoals} / {goals.length}
            </p>
            <button
              type="button"
              onClick={onOpenSetGoal}
              className="mt-1 text-xs font-semibold text-[#15629E] hover:underline"
            >
              + Add a new milestone
            </button>
          </div>
        </div>

        <div className="rounded-[22px] bg-white p-6 shadow-[0_8px_28px_rgba(21,98,158,0.08)]">
          <div className="flex items-center justify-between mb-5">
            <h1 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#15629E]" />
              Weekly Study Activity (Minutes)
            </h1>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              285 min total
            </span>
          </div>
          <div className="grid grid-cols-7 gap-3 items-end h-44 pt-4">
            {weeklyHours.map((item) => (
              <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-bold text-slate-600 tabular-nums">
                  {item.mins}m
                </span>
                <div
                  className="w-full max-w-[44px] rounded-t-xl bg-gradient-to-t from-[#15629E] to-[#3B82F6] transition-all"
                  style={{ height: `${Math.round((item.mins / 65) * 100)}%` }}
                />
                <span className="text-xs font-semibold text-slate-500">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section === 'notes') {
    const visibleNotes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(noteQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(noteQuery.toLowerCase()) ||
        n.subject.toLowerCase().includes(noteQuery.toLowerCase())
    );
    return (
      <div className="rounded-[22px] bg-white p-6 shadow-[0_8px_28px_rgba(21,98,158,0.08)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">Notes & Resources</h1>
            <p className="text-xs text-slate-500 mt-1">
              Keep formula sheets, essay outlines, and tutor feedback organized by subject.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={noteQuery}
              onChange={(e) => setNoteQuery(e.target.value)}
              placeholder="Search notes..."
              aria-label="Search study notes"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {visibleNotes.map((note) => (
              <article
                key={note.id}
                className="rounded-2xl border border-slate-200 p-4 flex flex-col justify-between gap-3 bg-[#FFFDF9]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#15629E]">{note.subject}</span>
                    <button
                      type="button"
                      onClick={() => onTogglePinNote(note.id)}
                      aria-label={note.pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}
                      className={`rounded-lg p-1 ${
                        note.pinned ? 'text-[#D97706] bg-amber-50' : 'text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h2 className="mt-1 font-display text-sm font-bold text-slate-900">
                    {note.title}
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-xs text-slate-600 leading-relaxed">
                    {note.content}
                  </p>
                </div>
                <span className="text-[10.5px] text-slate-400 tabular-nums">
                  Updated {note.updatedAt}
                </span>
              </article>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!noteTitle.trim() || !noteBody.trim()) {
                setNoteError('Enter both a title and note content.');
                return;
              }
              onAddNote({
                subject: noteSubject,
                title: noteTitle.trim(),
                content: noteBody.trim(),
              });
              setNoteTitle('');
              setNoteBody('');
              setNoteError('');
            }}
            className="lg:col-span-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 h-fit"
          >
            <h2 className="font-display text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-[#15629E]" />
              New Study Note
            </h2>
            <select
              aria-label="Note subject"
              value={noteSubject}
              onChange={(e) => setNoteSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
            >
              {AVAILABLE_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="text"
              aria-label="Note title"
              value={noteTitle}
              onChange={(e) => {
                setNoteTitle(e.target.value);
                setNoteError('');
              }}
              placeholder="Note title..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
            />
            <textarea
              aria-label="Note content"
              rows={4}
              value={noteBody}
              onChange={(e) => {
                setNoteBody(e.target.value);
                setNoteError('');
              }}
              placeholder="Key formulas, essay quotes, or takeaways..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
            />
            {noteError && (
              <p role="alert" className="text-xs font-medium text-red-600">
                {noteError}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-xl bg-[#15629E] hover:bg-[#104E7E] py-2.5 text-xs font-semibold text-white"
            >
              Save Note
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (section === 'messages') {
    const activeThread = threads.find((t) => t.id === activeThreadId) ?? threads[0];
    return (
      <div className="rounded-[22px] bg-white p-6 shadow-[0_8px_28px_rgba(21,98,158,0.08)]">
        <h1 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#15629E]" />
          Tutor Messages
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[420px]">
          <div className="md:col-span-4 space-y-2 border-r border-slate-100 pr-2">
            {threads.map((t) => {
              const selected = t.id === activeThread?.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setActiveThreadId(t.id);
                    onMarkThreadRead(t.id);
                  }}
                  className={`w-full rounded-2xl p-3.5 text-left transition-colors ${
                    selected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">{t.tutorName}</span>
                    {t.unread > 0 && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F59E0B] px-1.5 text-[10px] font-bold text-slate-950">
                        {t.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {t.role} · {t.subject}
                  </p>
                </button>
              );
            })}
          </div>

          {activeThread && (
            <div className="md:col-span-8 flex flex-col justify-between gap-4">
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {activeThread.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'student' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        msg.sender === 'student'
                          ? 'bg-[#15629E] text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="mt-1 text-[10px] text-slate-400">{msg.time}</span>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!replyDraft.trim()) return;
                  onSendThreadReply(activeThread.id, replyDraft.trim());
                  setReplyDraft('');
                }}
                className="flex items-center gap-2 pt-3 border-t border-slate-100"
              >
                <input
                  type="text"
                  aria-label={`Reply to ${activeThread.tutorName}`}
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder={`Message ${activeThread.tutorName}...`}
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#15629E] hover:bg-[#104E7E] px-4 py-2.5 text-xs font-semibold text-white"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (section === 'achievements') {
    const badges = [
      {
        title: 'First Spark',
        desc: 'Started your learning streak on Tutor Cloud.',
        unlocked: streakDays >= 1,
        icon: Flame,
      },
      {
        title: 'Streak Builder',
        desc: 'Reach Day-2 daily streak by completing an activity.',
        unlocked: streakDays >= 2,
        icon: Award,
      },
      {
        title: 'Diagnostic Explorer',
        desc: 'Complete at least one Readiness Check or Smart Quiz.',
        unlocked: completedQuizzesCount >= 1,
        icon: BookOpen,
      },
      {
        title: 'Goal Setter',
        desc: 'Maintain 4 or more active learning goals.',
        unlocked: goals.length >= 4,
        icon: Clock,
      },
    ];
    return (
      <div className="rounded-[22px] bg-white p-6 shadow-[0_8px_28px_rgba(21,98,158,0.08)] space-y-5">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900">Achievements & Badges</h1>
          <p className="text-xs text-slate-500 mt-1">
            Earn badges automatically as you complete readiness checks, quizzes, and daily streaks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className={`rounded-2xl border p-5 flex flex-col justify-between gap-3 ${
                  b.unlocked
                    ? 'border-[#F5B041] bg-[#FFF9F0]'
                    : 'border-slate-200 bg-slate-50 opacity-75'
                }`}
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
                    b.unlocked ? 'bg-[#F39200] text-slate-950' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-sm font-bold text-slate-900">{b.title}</h2>
                  <p className="mt-1 text-xs text-slate-600">{b.desc}</p>
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    b.unlocked ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {b.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Settings View
  return (
    <div className="rounded-[22px] bg-white p-6 shadow-[0_8px_28px_rgba(21,98,158,0.08)] max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-slate-900">Account & Study Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Changes here sync immediately with your dashboard header and AI tutor preferences.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSettingsSavedBanner(true);
          window.setTimeout(() => setSettingsSavedBanner(false), 3000);
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="set-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              id="set-name"
              type="text"
              value={profile.fullName}
              onChange={(e) =>
                onUpdateProfile({
                  ...profile,
                  fullName: e.target.value,
                  firstName: e.target.value.trim().split(' ')[0] || profile.firstName,
                })
              }
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="set-email" className="block text-xs font-semibold text-slate-700 mb-1">
              Student Email
            </label>
            <input
              id="set-email"
              type="email"
              value={profile.email}
              onChange={(e) => onUpdateProfile({ ...profile, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="set-grade" className="block text-xs font-semibold text-slate-700 mb-1">
              Grade
            </label>
            <select
              id="set-grade"
              value={profile.grade}
              onChange={(e) => onUpdateProfile({ ...profile, grade: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            >
              {['7', '8', '9', '10', '11', '12'].map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="set-curr" className="block text-xs font-semibold text-slate-700 mb-1">
              Curriculum
            </label>
            <select
              id="set-curr"
              value={profile.curriculum}
              onChange={(e) => onUpdateProfile({ ...profile, curriculum: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            >
              {AVAILABLE_CURRICULA.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {settingsSavedBanner ? (
            <span className="text-xs font-semibold text-emerald-700">
              Preferences saved!
            </span>
          ) : (
            <span />
          )}
          <button
            type="submit"
            className="rounded-xl bg-[#15629E] hover:bg-[#104E7E] px-5 py-2.5 text-xs font-semibold text-white"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
