import { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Info,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  User,
  UserCheck,
  Video,
  X,
} from 'lucide-react';
import type { NavSectionId, StartSessionInput } from '../types/dashboard';
import {
  SCHEDULE_SUBJECTS,
  SCHEDULE_TODAY_ISO,
  cancelScheduleSession,
  computeWeeklyScheduleSummary,
  dismissMissedScheduleSession,
  filterScheduleSessions,
  format24hTimeTo12h,
  formatIsoDateShort,
  formatTimeRange12h,
  groupScheduleSessions,
  rescheduleScheduleSession,
  type SchedulePeriodFilter,
  type ScheduleSessionItem,
  type ScheduleStatusTab,
  type ScheduleViewMode,
  type ScheduledConfirmationItem,
} from '../utils/scheduleLogic';
import { ScheduleCalendarView } from './ScheduleCalendarView';
import { CreateSchedulePage } from './CreateSchedulePage';
import {
  CalendarEventDetailModal,
  RescheduleSessionModal,
  SessionRecordingNotesDrawer,
  SessionScheduledModal,
} from './ScheduleOverlays';
import { playUiSound } from '../utils/uiSounds';

interface ScheduleViewProps {
  sessions: ScheduleSessionItem[];
  defaultCurriculum: string;
  onUpdateSessions: (updater: (prev: ScheduleSessionItem[]) => ScheduleSessionItem[]) => void;
  onSyncCreatedSessions?: (created: ScheduleSessionItem[]) => void;
  onStartTopicSession: (input: StartSessionInput) => void;
  onAddNote: (note: { subject: string; title: string; content: string }) => void;
  onNavigate: (section: NavSectionId) => void;
  onNotify: (message: string) => void;
}

const PERIOD_OPTIONS: SchedulePeriodFilter[] = ['This Week', 'This Month', 'All Time'];

const STATUS_TABS: { id: ScheduleStatusTab; label: string }[] = [
  { id: 'all', label: 'All sessions' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'missed', label: 'Missed' },
];

export function ScheduleView({
  sessions,
  defaultCurriculum,
  onUpdateSessions,
  onSyncCreatedSessions,
  onStartTopicSession,
  onAddNote,
  onNavigate,
  onNotify,
}: ScheduleViewProps) {
  const [subView, setSubView] = useState<'main' | 'create'>('main');
  const [presetCreateDate, setPresetCreateDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('list');
  const [periodFilter, setPeriodFilter] = useState<SchedulePeriodFilter>('This Week');
  const [subjectFilter, setSubjectFilter] = useState<string>('All Subjects');
  const [statusTab, setStatusTab] = useState<ScheduleStatusTab>('all');

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    today: false,
    upcomingLater: true,
    lastWeek: false,
    missed: false,
  });

  const [masteryTooltipId, setMasteryTooltipId] = useState<string | null>(null);
  const [drawerState, setDrawerState] = useState<{
    session: ScheduleSessionItem;
    tab: 'recording' | 'notes';
  } | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<ScheduleSessionItem | null>(null);
  const [calendarEventTarget, setCalendarEventTarget] = useState<ScheduleSessionItem | null>(null);
  const [scheduledConfirmations, setScheduledConfirmations] = useState<
    ScheduledConfirmationItem[] | null
  >(null);

  const filteredSessions = useMemo(
    () =>
      filterScheduleSessions(
        sessions,
        periodFilter,
        subjectFilter,
        statusTab,
        SCHEDULE_TODAY_ISO
      ),
    [sessions, periodFilter, subjectFilter, statusTab]
  );

  const grouped = useMemo(
    () => groupScheduleSessions(filteredSessions, SCHEDULE_TODAY_ISO),
    [filteredSessions]
  );

  const weeklySummary = useMemo(
    () => computeWeeklyScheduleSummary(sessions, SCHEDULE_TODAY_ISO),
    [sessions]
  );

  const toggleGroup = (key: string) => {
    playUiSound('click');
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLaunchSession = (session: ScheduleSessionItem) => {
    playUiSound('switch');
    onStartTopicSession({
      helpType: session.sessionType,
      subject: session.subject,
      lessonSource: 'learning-plan',
      topic: session.topic,
      specificQuestion: session.notesSummary,
    });
  };

  const handleCancelSession = (session: ScheduleSessionItem) => {
    playUiSound('subtle');
    onUpdateSessions((prev) => cancelScheduleSession(prev, session.id));
    onNotify(`Canceled "${session.topic}". You can reschedule it anytime.`);
  };

  const handleDismissMissed = (session: ScheduleSessionItem) => {
    playUiSound('click');
    onUpdateSessions((prev) => dismissMissedScheduleSession(prev, session.id));
    onNotify('Removed session from your reschedule list.');
  };

  const handleConfirmReschedule = (
    sessionId: string,
    newDateIso: string,
    newTime24: string,
    durationMins: number
  ) => {
    onUpdateSessions((prev) =>
      rescheduleScheduleSession(prev, sessionId, newDateIso, newTime24, durationMins)
    );
    setRescheduleTarget(null);
    setCollapsedGroups((prev) => ({ ...prev, upcomingLater: false, today: false }));
    onNotify(`Session rescheduled to ${formatIsoDateShort(newDateIso)} at ${format24hTimeTo12h(newTime24)}.`);
  };

  const handleSessionsCreated = (
    newSessions: ScheduleSessionItem[],
    confirmations: ScheduledConfirmationItem[]
  ) => {
    onUpdateSessions((prev) => [...newSessions, ...prev]);
    onSyncCreatedSessions?.(newSessions);
    setSubView('main');
    setPresetCreateDate('');
    setCollapsedGroups((prev) => ({ ...prev, today: false, upcomingLater: false }));
    setScheduledConfirmations(confirmations);
  };

  if (subView === 'create') {
    return (
      <CreateSchedulePage
        defaultCurriculum={defaultCurriculum}
        presetDateIso={presetCreateDate}
        onCancel={() => {
          setSubView('main');
          setPresetCreateDate('');
        }}
        onScheduled={handleSessionsCreated}
      />
    );
  }

  const hasAnyVisibleListSessions =
    grouped.today.length > 0 ||
    grouped.upcomingLater.length > 0 ||
    grouped.lastWeek.length > 0 ||
    grouped.missedOrCancelled.length > 0;

  return (
    <div className="space-y-5" data-testid="schedule-view">
      {/* Top Header Row matching Image 1 */}
      <div className="rounded-2xl bg-[#EDF5FC] dark:bg-slate-900/80 border border-[#D9E9F8] dark:border-slate-800 px-5 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Schedule
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            View and manage your tutoring sessions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Select */}
          <div className="relative">
            <CalendarIcon className="w-4 h-4 text-slate-600 dark:text-slate-400 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              aria-label="Filter schedule by period"
              value={periodFilter}
              onChange={(e) => {
                playUiSound('click');
                setPeriodFilter(e.target.value as SchedulePeriodFilter);
              }}
              className="h-10 appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-8 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#15629E] cursor-pointer"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Subject Select */}
          <div className="relative">
            <select
              aria-label="Filter schedule by subject"
              value={subjectFilter}
              onChange={(e) => {
                playUiSound('click');
                setSubjectFilter(e.target.value);
              }}
              className="h-10 appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3.5 pr-8 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#15629E] cursor-pointer"
            >
              <option value="All Subjects">All Subjects</option>
              {SCHEDULE_SUBJECTS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* View Mode Switcher (List / Calendar) */}
          <div
            className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1"
            role="group"
            aria-label="Schedule view mode"
          >
            <button
              type="button"
              onClick={() => {
                playUiSound('switch');
                setViewMode('list');
              }}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#E69300] text-slate-950 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                playUiSound('switch');
                setViewMode('calendar');
              }}
              aria-label="Calendar view"
              aria-pressed={viewMode === 'calendar'}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-[#E69300] text-slate-950 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Create Schedule CTA */}
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              setPresetCreateDate('');
              setSubView('create');
            }}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#15629E] hover:bg-[#115082] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Create my schedule
          </button>
        </div>
      </div>

      {/* Main Content: Calendar OR List View */}
      {viewMode === 'calendar' ? (
        <ScheduleCalendarView
          sessions={sessions}
          subjectFilter={subjectFilter}
          onSubjectFilterChange={setSubjectFilter}
          onSelectSession={(session) => setCalendarEventTarget(session)}
          onQuickCreateForDate={(dateIso) => {
            setPresetCreateDate(dateIso);
            setSubView('create');
          }}
        />
      ) : (
        <div className="space-y-5">
          {/* Warm Amber Status Filter Strip matching Image 1 */}
          <div
            role="tablist"
            aria-label="Session status filter"
            className="rounded-xl bg-[#FFF8EB] dark:bg-slate-900 border border-[#F5E0B5] dark:border-slate-800 px-3 py-2 flex flex-wrap items-center gap-1 sm:gap-2"
          >
            {STATUS_TABS.map((tab, idx) => {
              const active = statusTab === tab.id;
              return (
                <div key={tab.id} className="flex items-center">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      playUiSound('switch');
                      setStatusTab(tab.id);
                      if (tab.id === 'upcoming') {
                        setCollapsedGroups((prev) => ({ ...prev, upcomingLater: false }));
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#E69300] text-slate-950 shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-amber-100/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                  {idx < STATUS_TABS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden sm:inline-block h-5 w-px bg-amber-200/90 dark:bg-slate-700 ml-2"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {!hasAnyVisibleListSessions && (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-10 text-center space-y-3">
              <p className="font-display text-base font-bold text-slate-900 dark:text-white">
                No tutoring sessions match these filters
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Try switching the period or subject filter, or create a new tutoring schedule.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPeriodFilter('All Time');
                  setSubjectFilter('All Subjects');
                  setStatusTab('all');
                }}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-[#15629E] text-white text-sm font-semibold hover:bg-[#115082] transition-colors cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )}

          {/* GROUP 1: TODAY */}
          {grouped.today.length > 0 && (
            <section
              aria-label="Today's sessions"
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden"
            >
              <button
                type="button"
                aria-expanded={!collapsedGroups.today}
                onClick={() => toggleGroup('today')}
                className="w-full bg-[#15629E] px-5 py-3.5 flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white text-[#15629E] flex items-center justify-center shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                  </span>
                  <span className="font-display text-base font-bold text-white">Today</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-[#15629E] text-xs font-semibold tabular-nums">
                    {grouped.today.length}{' '}
                    {grouped.today.length === 1 ? 'session' : 'sessions'}
                  </span>
                </div>
                {collapsedGroups.today ? (
                  <ChevronDown className="w-4 h-4 text-white/90" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-white/90" />
                )}
              </button>

              {!collapsedGroups.today && (
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {grouped.today.map((session, idx) => {
                    const isPrimaryLive = Boolean(session.isLive) || idx === 0;
                    return (
                      <div
                        key={session.id}
                        className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                              {session.subject}
                            </h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              Upcoming
                            </span>
                            {session.isLive && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-800 dark:text-slate-100 border border-slate-700 dark:border-slate-500">
                                <Video className="w-3 h-3" />
                                LIVE
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {session.topic}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-0.5 tabular-nums">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTimeRange12h(session.startTime24, session.durationMins)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5" />
                              {session.tutorName}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleLaunchSession(session)}
                            className={`h-10 px-6 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                              isPrimaryLive
                                ? 'bg-[#E69300] hover:bg-[#CC8200] text-slate-950 shadow-xs'
                                : 'bg-[#FFF5E0] hover:bg-[#FFE8BA] dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-[#8A5200] dark:text-amber-300 border border-[#F3D196] dark:border-amber-800'
                            }`}
                          >
                            Start session
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                playUiSound('click');
                                setRescheduleTarget(session);
                              }}
                              aria-label={`Reschedule ${session.topic}`}
                              title="Reschedule session"
                              className="w-9 h-8 rounded-lg border border-[#3898E8] dark:border-sky-600 text-[#15629E] dark:text-sky-300 hover:bg-[#EBF5FF] dark:hover:bg-sky-950/40 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playUiSound('click');
                                setDrawerState({ session, tab: 'notes' });
                              }}
                              aria-label={`View notes for ${session.topic}`}
                              title="View session notes"
                              className="w-9 h-8 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelSession(session)}
                              aria-label={`Cancel ${session.topic}`}
                              title="Cancel session"
                              className="w-9 h-8 rounded-lg border border-rose-500 dark:border-rose-500 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* GROUP 1B: UPCOMING LATER */}
          {grouped.upcomingLater.length > 0 && (
            <section
              aria-label="Upcoming scheduled sessions"
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden"
            >
              <button
                type="button"
                aria-expanded={!collapsedGroups.upcomingLater}
                onClick={() => toggleGroup('upcomingLater')}
                className="w-full bg-[#15629E] px-5 py-3.5 flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white text-[#15629E] flex items-center justify-center shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                  </span>
                  <span className="font-display text-base font-bold text-white">Upcoming</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-[#15629E] text-xs font-semibold tabular-nums">
                    {grouped.upcomingLater.length}{' '}
                    {grouped.upcomingLater.length === 1 ? 'session' : 'sessions'}
                  </span>
                </div>
                {collapsedGroups.upcomingLater ? (
                  <ChevronDown className="w-4 h-4 text-white/90" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-white/90" />
                )}
              </button>

              {!collapsedGroups.upcomingLater && (
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {grouped.upcomingLater.map((session) => (
                    <div
                      key={session.id}
                      className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                            {session.subject}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#EBF5FF] dark:bg-sky-950/50 text-[#15629E] dark:text-sky-300 border border-[#C6E0FA] dark:border-sky-800 tabular-nums">
                            {formatIsoDateShort(session.dateIso)}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Scheduled
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {session.topic}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-0.5 tabular-nums">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTimeRange12h(session.startTime24, session.durationMins)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            {session.tutorName}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLaunchSession(session)}
                          className="h-10 px-6 rounded-xl bg-[#FFF5E0] hover:bg-[#FFE8BA] dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-[#8A5200] dark:text-amber-300 border border-[#F3D196] dark:border-amber-800 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Start early
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              playUiSound('click');
                              setRescheduleTarget(session);
                            }}
                            aria-label={`Reschedule ${session.topic}`}
                            title="Reschedule session"
                            className="w-9 h-8 rounded-lg border border-[#3898E8] dark:border-sky-600 text-[#15629E] dark:text-sky-300 hover:bg-[#EBF5FF] dark:hover:bg-sky-950/40 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playUiSound('click');
                              setDrawerState({ session, tab: 'notes' });
                            }}
                            aria-label={`View notes for ${session.topic}`}
                            title="View session notes"
                            className="w-9 h-8 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelSession(session)}
                            aria-label={`Cancel ${session.topic}`}
                            title="Cancel session"
                            className="w-9 h-8 rounded-lg border border-rose-500 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* GROUP 2: LAST WEEK (COMPLETED) */}
          {grouped.lastWeek.length > 0 && (
            <section
              aria-label="Last week's completed sessions"
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden"
            >
              <button
                type="button"
                aria-expanded={!collapsedGroups.lastWeek}
                onClick={() => toggleGroup('lastWeek')}
                className="w-full bg-[#15629E] px-5 py-3.5 flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white text-[#15629E] flex items-center justify-center shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                  </span>
                  <span className="font-display text-base font-bold text-white">Last Week</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-[#15629E] text-xs font-semibold tabular-nums">
                    {grouped.lastWeek.length}{' '}
                    {grouped.lastWeek.length === 1 ? 'session' : 'sessions'}
                  </span>
                </div>
                {collapsedGroups.lastWeek ? (
                  <ChevronDown className="w-4 h-4 text-white/90" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-white/90" />
                )}
              </button>

              {!collapsedGroups.lastWeek && (
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {grouped.lastWeek.map((session) => {
                    const score = session.masteryScore ?? 75;
                    return (
                      <div
                        key={session.id}
                        className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                              {session.subject}
                            </h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                              {session.performanceLabel ?? 'Good'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {session.topic}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {formatIsoDateShort(session.dateIso)} at{' '}
                              {format24hTimeTo12h(session.startTime24)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5" />
                              {session.durationMins} min
                            </span>
                          </div>

                          {/* Mastery Score bar matching Image 1 */}
                          <div className="pt-1 space-y-1.5 max-w-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                Mastery Score
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setMasteryTooltipId((id) =>
                                    id === session.id ? null : session.id
                                  )
                                }
                                aria-label={`Mastery score info for ${session.topic}`}
                                className="text-[#15629E] dark:text-sky-400 hover:opacity-80 cursor-pointer"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {masteryTooltipId === session.id && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-[#EBF5FF] dark:bg-slate-800 border border-[#C6E0FA] dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                                Calculated from accuracy, independent problem-solving steps, and exit check performance.
                              </p>
                            )}
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#18A957]"
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                                {score}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col gap-2.5 shrink-0 sm:w-44">
                          <button
                            type="button"
                            onClick={() => {
                              playUiSound('click');
                              setDrawerState({ session, tab: 'recording' });
                            }}
                            className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-[#E69300] hover:bg-[#CC8200] text-slate-950 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                          >
                            Review Recording
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playUiSound('click');
                              setDrawerState({ session, tab: 'notes' });
                            }}
                            className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-[#F5B74C] text-[#B86E00] dark:text-amber-300 font-semibold text-sm hover:bg-[#FFF9EC] dark:hover:bg-amber-950/30 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            View Notes
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* GROUP 3: MISSED OR CANCELLED */}
          {grouped.missedOrCancelled.length > 0 && (
            <section
              aria-label="Missed or cancelled sessions"
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden"
            >
              <button
                type="button"
                aria-expanded={!collapsedGroups.missed}
                onClick={() => toggleGroup('missed')}
                className="w-full bg-[#FFE4B5] dark:bg-amber-950/60 px-5 py-3.5 flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#E69300] text-white flex items-center justify-center shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                  </span>
                  <span className="font-display text-base font-bold text-slate-900 dark:text-amber-100">
                    Missed or Cancelled
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-amber-200 text-xs font-semibold tabular-nums">
                    {grouped.missedOrCancelled.length} to reschedule
                  </span>
                </div>
                {collapsedGroups.missed ? (
                  <ChevronDown className="w-4 h-4 text-slate-700 dark:text-amber-200" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-slate-700 dark:text-amber-200" />
                )}
              </button>

              {!collapsedGroups.missed && (
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  <div className="px-5 sm:px-6 py-3.5 bg-[#FFFDF8] dark:bg-slate-900/60 flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#C27800] dark:text-amber-300">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>
                      Reschedule missed or canceled sessions, or remove them from your list.
                    </span>
                  </div>

                  {grouped.missedOrCancelled.map((session) => {
                    const isCanceled = session.status === 'canceled';
                    return (
                      <div
                        key={session.id}
                        className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                              {session.subject}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                isCanceled
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                              }`}
                            >
                              {isCanceled ? 'Canceled' : 'Missed'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {session.topic}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {isCanceled ? 'Original: ' : ''}
                              {formatIsoDateShort(session.dateIso)}{' '}
                              {isCanceled ? '' : 'at '}
                              {format24hTimeTo12h(session.startTime24)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col gap-2.5 shrink-0 sm:w-44">
                          {isCanceled ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  playUiSound('click');
                                  setRescheduleTarget(session);
                                }}
                                className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-[#E69300] hover:bg-[#CC8200] text-slate-950 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                              >
                                Reschedule Now
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDismissMissed(session)}
                                className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-[#F5B74C] text-[#B86E00] dark:text-amber-300 font-semibold text-sm hover:bg-[#FFF9EC] dark:hover:bg-amber-950/30 transition-colors cursor-pointer whitespace-nowrap"
                              >
                                Mark as not needed
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  playUiSound('click');
                                  setDrawerState({ session, tab: 'recording' });
                                }}
                                className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-[#E69300] hover:bg-[#CC8200] text-slate-950 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                              >
                                Review Recording
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  playUiSound('click');
                                  setDrawerState({ session, tab: 'notes' });
                                }}
                                className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-[#F5B74C] text-[#B86E00] dark:text-amber-300 font-semibold text-sm hover:bg-[#FFF9EC] dark:hover:bg-amber-950/30 transition-colors cursor-pointer whitespace-nowrap"
                              >
                                View Notes
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  playUiSound('click');
                                  setRescheduleTarget(session);
                                }}
                                className="text-xs font-semibold text-[#15629E] dark:text-sky-400 hover:underline text-center cursor-pointer"
                              >
                                Reschedule instead
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* WEEKLY SUMMARY CARD matching Image 1 */}
          <section
            aria-label="Weekly summary"
            data-testid="weekly-summary-card"
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Weekly Summary
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                ({weeklySummary.rangeLabel})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#FFF8EB] dark:bg-amber-950/40 text-[#E69300] flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">
                    {weeklySummary.totalThisWeek}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Total Sessions This Week
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#FFF8EB] dark:bg-amber-950/40 text-[#E69300] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">
                    {weeklySummary.completed}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Sessions Completed
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#FFF8EB] dark:bg-amber-950/40 text-[#E69300] flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">
                    {weeklySummary.pending}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Sessions Pending
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 p-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#FFF8EB] dark:bg-amber-950/40 text-[#E69300] flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">
                    {weeklySummary.attendanceRate}%
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Attendance Rate
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Internal Drawers & Modals */}
      {drawerState && (
        <SessionRecordingNotesDrawer
          session={drawerState.session}
          initialTab={drawerState.tab}
          onClose={() => setDrawerState(null)}
          onSaveToNotes={(subject, title, content) => {
            onAddNote({ subject, title, content });
          }}
          onStartSession={handleLaunchSession}
        />
      )}

      {rescheduleTarget && (
        <RescheduleSessionModal
          session={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onConfirm={handleConfirmReschedule}
        />
      )}

      {calendarEventTarget && (
        <CalendarEventDetailModal
          session={calendarEventTarget}
          onClose={() => setCalendarEventTarget(null)}
          onStartSession={handleLaunchSession}
          onReschedule={(session) => setRescheduleTarget(session)}
          onViewNotes={(session) => setDrawerState({ session, tab: 'notes' })}
          onCancelSession={handleCancelSession}
        />
      )}

      {scheduledConfirmations && (
        <SessionScheduledModal
          confirmations={scheduledConfirmations}
          onClose={() => setScheduledConfirmations(null)}
          onGoToDashboard={() => {
            setScheduledConfirmations(null);
            onNavigate('dashboard');
          }}
        />
      )}
    </div>
  );
}
