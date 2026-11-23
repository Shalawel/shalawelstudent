import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CalendarClock,
  Clock,
  Play,
  Trash2,
  UserCheck,
  Video,
  X,
} from 'lucide-react';
import type { CalendarDay, CalendarSession } from '../types/dashboard';
import {
  format12hTo24h,
  format24hTo12h,
  isUpcomingSessionTimeMatch,
  validateCancellationReason,
} from '../utils/calendarSessionLogic';
import { playUiSound } from '../utils/uiSounds';

interface CalendarSessionDrawerProps {
  session: CalendarSession | null;
  calendarDays: CalendarDay[];
  onClose: () => void;
  onGoToClassroom: (session: CalendarSession) => void;
  onRescheduleToScheduled: (
    sessionId: string,
    newDateKey: string,
    newTime24: string
  ) => void;
  onCancelScheduled: (sessionId: string, reason: string) => void;
}

const QUICK_CANCEL_REASONS = [
  'Schedule conflict with another class',
  'Need extra time to finish practice first',
  'Not feeling well today',
  'Family appointment at this time',
];

export const CalendarSessionDrawer: React.FC<CalendarSessionDrawerProps> = ({
  session,
  calendarDays,
  onClose,
  onGoToClassroom,
  onRescheduleToScheduled,
  onCancelScheduled,
}) => {
  const [targetDateKey, setTargetDateKey] = useState<string>('');
  const [targetTime24, setTargetTime24] = useState<string>('10:00');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [showReschedulePanel, setShowReschedulePanel] = useState<boolean>(false);

  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    setTargetDateKey(session.dateKey);
    setTargetTime24(format12hTo24h(session.time, session.meridiem));
    setRescheduleError(null);
    setShowReschedulePanel(false);
    setCancelReason('');
    setCancelError(null);
  }, [session]);

  if (!session) return null;

  const isMissed = session.status === 'missed';
  const isUpcoming = session.status === 'upcoming';
  const isScheduled = session.status === 'scheduled';

  const upcomingTimeCheck = isUpcoming
    ? isUpcomingSessionTimeMatch(session)
    : { canJoin: false, reasonText: '' };

  const statusMeta = isMissed
    ? {
        badge: 'MISSED SESSION',
        headerBg: 'from-[#FEF2F2] via-white to-[#FFF7ED]',
        badgeStyle: 'bg-red-100 text-red-700 border-red-200',
        subtitle: 'Jump right into the classroom now or reschedule for another date and time.',
      }
    : isUpcoming
    ? {
        badge: 'TODAY UPCOMING',
        headerBg: 'from-[#ECFDF5] via-white to-[#F0F9FF]',
        badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        subtitle: upcomingTimeCheck.canJoin
          ? 'Your session time matches right now — join the classroom or reschedule.'
          : 'Join opens when the scheduled time matches, or you can reschedule now.',
      }
    : {
        badge: 'SCHEDULED SESSION',
        headerBg: 'from-[#EFF6FF] via-white to-[#F8FAFC]',
        badgeStyle: 'bg-sky-100 text-sky-800 border-sky-200',
        subtitle: 'Need to cancel this scheduled session? Share a short reason below.',
      };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDateKey.trim()) {
      setRescheduleError('Please choose a date.');
      return;
    }
    const parsedTime = format24hTo12h(targetTime24);
    if (!parsedTime) {
      setRescheduleError('Please choose a valid time.');
      return;
    }
    setRescheduleError(null);
    playUiSound('success');
    onRescheduleToScheduled(session.id, targetDateKey, targetTime24);
    onClose();
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCancellationReason(cancelReason);
    if (!validation.valid) {
      setCancelError(validation.error || 'Please enter a cancellation reason.');
      return;
    }
    setCancelError(null);
    playUiSound('subtle');
    onCancelScheduled(session.id, cancelReason.trim());
    onClose();
  };

  const selectedDayObj = calendarDays.find((d) => d.dateKey === session.dateKey);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-session-drawer-title"
      data-testid="calendar-session-drawer"
      data-session-status={session.status}
    >
      {/* Clickable backdrop to close */}
      <div className="flex-1" onClick={onClose} aria-hidden="true" />

      {/* Right-Side Drawer Panel */}
      <aside className="animate-drawer-slide-in relative w-full max-w-[440px] h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <header
          className={`shrink-0 bg-gradient-to-br ${statusMeta.headerBg} border-b border-slate-200/80 px-5 pt-5 pb-4`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold tracking-wider ${statusMeta.badgeStyle}`}
              >
                {statusMeta.badge}
              </span>
              <h2
                id="calendar-session-drawer-title"
                className="mt-2 font-display text-[20px] font-bold text-slate-900 leading-snug"
              >
                {session.title}
              </h2>
              <p className="mt-1 text-[12.5px] text-slate-600 leading-snug">
                {statusMeta.subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close session drawer"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-5 space-y-5">
          {/* Session Overview Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-[#FAFBFD] p-4 space-y-3">
            <p className="text-[13px] text-slate-700 leading-relaxed">{session.description}</p>

            <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="min-w-0 rounded-xl bg-white border border-slate-200/80 px-3 py-2">
                <span className="block text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
                  Date &amp; Time
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 font-bold text-slate-800 tabular-nums min-w-0">
                  <Clock className="h-3.5 w-3.5 text-[#15629E] shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {selectedDayObj ? `${selectedDayObj.weekday} ${selectedDayObj.dayNumber} · ` : ''}
                    {session.time} {session.meridiem}
                  </span>
                </span>
              </div>

              <div className="min-w-0 rounded-xl bg-white border border-slate-200/80 px-3 py-2">
                <span className="block text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
                  Subject &amp; Tutor
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 font-bold text-slate-800 min-w-0">
                  <UserCheck className="h-3.5 w-3.5 text-[#15629E] shrink-0" aria-hidden="true" />
                  <span className="truncate" title={`${session.subject} · ${session.tutorName}`}>
                    {session.subject} · {session.tutorName}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* CASE 1: MISSED SESSION — Go to Classroom Now OR Reschedule */}
          {isMissed && (
            <div className="space-y-4">
              {/* Primary Option 1: Jump straight into Classroom Now */}
              <div className="rounded-2xl border-2 border-[#F19500]/50 bg-gradient-to-br from-[#FFF9EE] to-white p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F19500] text-slate-950 shadow-xs">
                    <Play className="h-5 w-5 fill-slate-950 ml-0.5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-[14.5px] font-bold text-slate-900">
                      Go to Session Classroom Now
                    </h3>
                    <p className="mt-0.5 text-[12px] text-slate-600 leading-snug">
                      Catch up immediately with your interactive AI classroom on{' '}
                      <span className="font-semibold text-slate-800">{session.title}</span>.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playUiSound('pop');
                    onGoToClassroom(session);
                  }}
                  className="bencho-press w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#F19500] hover:bg-[#DC8700] px-4 py-3 text-[13px] font-bold text-slate-950 shadow-[0_6px_16px_rgba(241,149,0,0.28)] transition-colors"
                >
                  <span>Go to Classroom Now</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {/* Option 2: Reschedule Session (Date & Time -> Scheduled list) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-[#085891]" aria-hidden="true" />
                    <h3 className="text-[14px] font-bold text-slate-900">
                      Reschedule Session
                    </h3>
                  </div>
                  {!showReschedulePanel && (
                    <button
                      type="button"
                      onClick={() => {
                        playUiSound('click');
                        setShowReschedulePanel(true);
                      }}
                      className="rounded-lg border border-[#085891]/30 bg-[#085891]/5 hover:bg-[#085891]/10 px-3 py-1.5 text-xs font-bold text-[#085891] transition-colors"
                    >
                      Change Date &amp; Time
                    </button>
                  )}
                </div>

                <p className="text-[12px] text-slate-600 leading-snug">
                  Pick a new date and time to move this session into your{' '}
                  <span className="font-semibold text-[#0284C7]">Scheduled</span> list.
                </p>

                {showReschedulePanel && (
                  <form
                    onSubmit={handleRescheduleSubmit}
                    data-testid="reschedule-session-form"
                    className="space-y-3 pt-2 border-t border-slate-100"
                  >
                    <div>
                      <label
                        htmlFor="drawer-reschedule-date"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Select New Date
                      </label>
                      <div className="relative">
                        <Calendar
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                          aria-hidden="true"
                        />
                        <select
                          id="drawer-reschedule-date"
                          value={targetDateKey}
                          onChange={(e) => {
                            setTargetDateKey(e.target.value);
                            setRescheduleError(null);
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:border-[#085891] focus:bg-white focus:outline-none"
                        >
                          {calendarDays.map((d) => (
                            <option key={d.dateKey} value={d.dateKey}>
                              {d.weekday} {d.dayNumber} ({d.dateKey})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="drawer-reschedule-time"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Select New Time
                      </label>
                      <div className="relative">
                        <Clock
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                          aria-hidden="true"
                        />
                        <input
                          id="drawer-reschedule-time"
                          type="time"
                          value={targetTime24}
                          onChange={(e) => {
                            setTargetTime24(e.target.value);
                            setRescheduleError(null);
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:border-[#085891] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {rescheduleError && (
                      <p role="alert" className="text-xs font-semibold text-red-600">
                        {rescheduleError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="bencho-press w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#085891] hover:bg-[#064572] px-4 py-2.5 text-[13px] font-bold text-white transition-colors"
                    >
                      <CalendarClock className="h-4 w-4" aria-hidden="true" />
                      <span>Confirm Reschedule to Scheduled</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* CASE 2: TODAY UPCOMING — Join Now (if time matches) OR Reschedule */}
          {isUpcoming && (
            <div className="space-y-4">
              {/* Option 1: Join Now (time-gated) */}
              <div
                className={`rounded-2xl border-2 p-4 space-y-3 ${
                  upcomingTimeCheck.canJoin
                    ? 'border-emerald-400/70 bg-gradient-to-br from-emerald-50/80 to-white'
                    : 'border-slate-200 bg-slate-50/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      upcomingTimeCheck.canJoin
                        ? 'bg-[#15803D] text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Video className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14.5px] font-bold text-slate-900">Join Session Now</h3>
                      {upcomingTimeCheck.canJoin && (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                          TIME MATCHED
                        </span>
                      )}
                    </div>
                    <p
                      data-testid="upcoming-time-match-status"
                      className="mt-0.5 text-[12px] text-slate-600 leading-snug"
                    >
                      {upcomingTimeCheck.reasonText}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!upcomingTimeCheck.canJoin}
                  onClick={() => {
                    if (!upcomingTimeCheck.canJoin) return;
                    playUiSound('pop');
                    onGoToClassroom(session);
                  }}
                  className={`bencho-press w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold transition-colors ${
                    upcomingTimeCheck.canJoin
                      ? 'bg-[#15803D] hover:bg-[#166534] text-white shadow-[0_6px_16px_rgba(21,128,61,0.28)]'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>{upcomingTimeCheck.canJoin ? 'Join Now' : 'Join Now (Waiting for Session Time)'}</span>
                  {upcomingTimeCheck.canJoin && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>

              {/* Option 2: Reschedule Session */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-[#085891]" aria-hidden="true" />
                    <h3 className="text-[14px] font-bold text-slate-900">
                      Reschedule Session
                    </h3>
                  </div>
                  {!showReschedulePanel && (
                    <button
                      type="button"
                      onClick={() => {
                        playUiSound('click');
                        setShowReschedulePanel(true);
                      }}
                      className="rounded-lg border border-[#085891]/30 bg-[#085891]/5 hover:bg-[#085891]/10 px-3 py-1.5 text-xs font-bold text-[#085891] transition-colors"
                    >
                      Reschedule
                    </button>
                  )}
                </div>

                <p className="text-[12px] text-slate-600 leading-snug">
                  Can&apos;t make this slot? Pick a new date and time to move it to your{' '}
                  <span className="font-semibold text-[#0284C7]">Scheduled</span> list.
                </p>

                {showReschedulePanel && (
                  <form
                    onSubmit={handleRescheduleSubmit}
                    data-testid="reschedule-session-form"
                    className="space-y-3 pt-2 border-t border-slate-100"
                  >
                    <div>
                      <label
                        htmlFor="drawer-reschedule-date"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Select New Date
                      </label>
                      <select
                        id="drawer-reschedule-date"
                        value={targetDateKey}
                        onChange={(e) => {
                          setTargetDateKey(e.target.value);
                          setRescheduleError(null);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] px-3 py-2.5 text-sm text-slate-900 focus:border-[#085891] focus:bg-white focus:outline-none"
                      >
                        {calendarDays.map((d) => (
                          <option key={d.dateKey} value={d.dateKey}>
                            {d.weekday} {d.dayNumber} ({d.dateKey})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="drawer-reschedule-time"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Select New Time
                      </label>
                      <input
                        id="drawer-reschedule-time"
                        type="time"
                        value={targetTime24}
                        onChange={(e) => {
                          setTargetTime24(e.target.value);
                          setRescheduleError(null);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-[#FAFBFD] px-3 py-2.5 text-sm text-slate-900 focus:border-[#085891] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {rescheduleError && (
                      <p role="alert" className="text-xs font-semibold text-red-600">
                        {rescheduleError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="bencho-press w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#085891] hover:bg-[#064572] px-4 py-2.5 text-[13px] font-bold text-white transition-colors"
                    >
                      <CalendarClock className="h-4 w-4" aria-hidden="true" />
                      <span>Confirm Reschedule to Scheduled</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* CASE 3: SCHEDULED SESSION — ONLY Cancel Session with required Reason */}
          {isScheduled && (
            <form
              onSubmit={handleCancelSubmit}
              data-testid="cancel-scheduled-session-form"
              className="rounded-2xl border border-red-200/90 bg-red-50/35 p-4 space-y-3.5"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-[14.5px] font-bold text-slate-900">Cancel Session</h3>
                  <p className="mt-0.5 text-[12px] text-slate-600 leading-snug">
                    Please write the reason for cancelling this scheduled session so your tutor is
                    notified.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="cancel-session-reason"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Reason for cancellation <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="cancel-session-reason"
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    setCancelError(null);
                  }}
                  placeholder="Write why you need to cancel this session..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:outline-none"
                />

                {/* Quick reason helpers */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_CANCEL_REASONS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        playUiSound('click');
                        setCancelReason(preset);
                        setCancelError(null);
                      }}
                      className="rounded-lg bg-white border border-slate-200 hover:border-red-300 hover:text-red-700 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {cancelError && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-100/80 border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"
                >
                  {cancelError}
                </p>
              )}

              <button
                type="submit"
                className="bencho-press w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-3 text-[13px] font-bold text-white shadow-[0_6px_16px_rgba(220,38,38,0.24)] transition-colors"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Cancel Session</span>
              </button>
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        <footer className="shrink-0 border-t border-slate-200/80 bg-[#FAFBFD] px-5 py-3 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition-colors"
          >
            Close
          </button>
        </footer>
      </aside>
    </div>
  );
};
