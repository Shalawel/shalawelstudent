import { useEffect, useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Pause,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  User,
  Video,
  X,
} from 'lucide-react';
import {
  SCHEDULE_DURATIONS,
  format24hTimeTo12h,
  formatIsoDateShort,
  formatIsoDateWithYear,
  formatTimeRange12h,
  type ScheduledConfirmationItem,
  type ScheduleSessionItem,
} from '../utils/scheduleLogic';
import { playUiSound } from '../utils/uiSounds';

interface SessionScheduledModalProps {
  confirmations: ScheduledConfirmationItem[];
  onClose: () => void;
  onGoToDashboard: () => void;
}

export function SessionScheduledModal({
  confirmations,
  onClose,
  onGoToDashboard,
}: SessionScheduledModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const count = confirmations.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-scheduled-title"
      data-testid="session-scheduled-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
        {/* Dark Navy Header matching reference */}
        <div className="bg-[#0B2A4A] px-6 py-5 flex items-start justify-between gap-4 shrink-0">
          <div>
            <h2
              id="session-scheduled-title"
              className="font-display text-lg font-bold text-white tracking-tight"
            >
              Session Scheduled Successfully!
            </h2>
            <p className="text-sm text-slate-300 mt-0.5 tabular-nums">
              {count} {count === 1 ? 'session has' : 'sessions have'} been scheduled successfully.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              onClose();
            }}
            aria-label="Close scheduled confirmation"
            className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stacked Summary Cards */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          {confirmations.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 p-4 space-y-2.5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Subject:</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {item.subject}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Lesson:</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {item.lesson}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Date &amp; Time:
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {item.dateTimeLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Duration:</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {item.durationLabel}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Session Type:
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {item.sessionType}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA matching reference */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 shrink-0 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              playUiSound('success');
              onGoToDashboard();
            }}
            className="w-full h-11 rounded-xl bg-[#E69300] hover:bg-[#CC8200] text-slate-950 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            Go to Dashboard
          </button>
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              onClose();
            }}
            className="w-full h-9 rounded-lg text-xs font-semibold text-[#15629E] dark:text-sky-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            View in Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

interface RescheduleSessionModalProps {
  session: ScheduleSessionItem;
  onClose: () => void;
  onConfirm: (sessionId: string, newDateIso: string, newTime24: string, durationMins: number) => void;
}

export function RescheduleSessionModal({
  session,
  onClose,
  onConfirm,
}: RescheduleSessionModalProps) {
  const [dateIso, setDateIso] = useState(session.dateIso);
  const [time24, setTime24] = useState(session.startTime24);
  const [durationMins, setDurationMins] = useState(session.durationMins);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateIso.trim()) {
      setError('Please choose a new date for this session.');
      return;
    }
    if (!time24.trim()) {
      setError('Please choose a start time.');
      return;
    }
    setError(null);
    playUiSound('success');
    onConfirm(session.id, dateIso, time24, durationMins);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-modal-title"
      data-testid="reschedule-session-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
        <div className="bg-[#0B2A4A] px-6 py-4 flex items-center justify-between gap-3">
          <div>
            <h2
              id="reschedule-modal-title"
              className="font-display text-base font-bold text-white"
            >
              Reschedule Session
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Pick a better date and time for your AI Tutor session.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reschedule modal"
            className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-xl bg-[#F4F9FF] dark:bg-slate-800/70 border border-[#D4E6F8] dark:border-slate-700 p-3.5">
            <p className="text-xs font-semibold text-[#15629E] dark:text-sky-300">
              {session.subject}
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
              {session.topic}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
              Current slot: {formatIsoDateWithYear(session.dateIso)} ·{' '}
              {format24hTimeTo12h(session.startTime24)} ({session.durationMins} min)
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="reschedule-date"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
              >
                New Date
              </label>
              <input
                id="reschedule-date"
                type="date"
                value={dateIso}
                onChange={(e) => setDateIso(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="reschedule-time"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  New Time
                </label>
                <input
                  id="reschedule-time"
                  type="time"
                  value={time24}
                  onChange={(e) => setTime24(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
                />
              </div>
              <div>
                <label
                  htmlFor="reschedule-duration"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  Session Duration
                </label>
                <select
                  id="reschedule-duration"
                  value={durationMins}
                  onChange={(e) => setDurationMins(Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
                >
                  {SCHEDULE_DURATIONS.map((mins) => (
                    <option key={mins} value={mins}>
                      {mins} min
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-2"
            >
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-[#F5B74C] text-[#B86E00] dark:text-amber-300 font-semibold text-sm hover:bg-[#FFF9EC] dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-xl bg-[#E69300] hover:bg-[#CC8200] text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface SessionRecordingNotesDrawerProps {
  session: ScheduleSessionItem;
  initialTab: 'recording' | 'notes';
  onClose: () => void;
  onSaveToNotes: (subject: string, title: string, content: string) => void;
  onStartSession?: (session: ScheduleSessionItem) => void;
}

export function SessionRecordingNotesDrawer({
  session,
  initialTab,
  onClose,
  onSaveToNotes,
  onStartSession,
}: SessionRecordingNotesDrawerProps) {
  const [activeTab, setActiveTab] = useState<'recording' | 'notes'>(initialTab);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const totalSeconds = Math.max(600, session.durationMins * 60);
  const [currentSeconds, setCurrentSeconds] = useState<number>(
    session.recordingChapters[0]?.seconds ?? 0
  );
  const [personalNote, setPersonalNote] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, session.id]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setCurrentSeconds((prev) => {
        if (prev + 1 >= totalSeconds) {
          setIsPlaying(false);
          return totalSeconds;
        }
        return prev + 1;
      });
    }, Math.round(1000 / playbackSpeed));
    return () => window.clearInterval(timer);
  }, [isPlaying, playbackSpeed, totalSeconds]);

  const formatClock = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const handleSaveNotes = () => {
    const combined = [
      session.notesSummary,
      '',
      'Key Takeaways:',
      ...session.keyTakeaways.map((t) => `- ${t}`),
      ...(personalNote.trim() ? ['', `My Reflection: ${personalNote.trim()}`] : []),
    ].join('\n');

    onSaveToNotes(session.subject, `${session.topic} — Session Notes`, combined);
    setSavedNotice(true);
    playUiSound('success');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/55"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-drawer-title"
      data-testid="schedule-notes-drawer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Header */}
        <div className="bg-[#0B2A4A] px-6 py-5 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white/15 text-white">
                {session.subject}
              </span>
              {typeof session.masteryScore === 'number' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-200 tabular-nums">
                  Mastery {session.masteryScore}%
                </span>
              )}
            </div>
            <h2
              id="session-drawer-title"
              className="font-display text-base font-bold text-white mt-2 leading-snug"
            >
              {session.topic}
            </h2>
            <p className="text-xs text-slate-300 mt-1 tabular-nums">
              {formatIsoDateShort(session.dateIso)} · {format24hTimeTo12h(session.startTime24)} ·{' '}
              {session.durationMins} min · {session.tutorName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close session drawer"
            className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div
          className="px-6 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0 bg-[#FFF9EC] dark:bg-slate-900"
          role="tablist"
          aria-label="Session review sections"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'recording'}
            onClick={() => {
              playUiSound('switch');
              setActiveTab('recording');
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'recording'
                ? 'bg-[#E69300] text-slate-950 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-amber-100/70 dark:hover:bg-slate-800'
            }`}
          >
            <Video className="w-4 h-4" />
            Recording
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'notes'}
            onClick={() => {
              playUiSound('switch');
              setActiveTab('notes');
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'notes'
                ? 'bg-[#E69300] text-slate-950 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-amber-100/70 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            AI Notes
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'recording' ? (
            <>
              <div className="rounded-xl bg-[#0B2A4A] text-white p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-lg bg-[#15629E] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">AI Tutor Session Replay</p>
                      <p className="text-xs text-slate-300">
                        Interactive whiteboard &amp; voice walkthrough
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPlaybackSpeed((s) => (s === 1 ? 1.25 : s === 1.25 ? 1.5 : 1))
                    }
                    className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-semibold tabular-nums cursor-pointer"
                  >
                    {playbackSpeed}x
                  </button>
                </div>

                {/* Scrubber */}
                <div className="space-y-1.5">
                  <input
                    type="range"
                    aria-label="Recording playback timeline"
                    min={0}
                    max={totalSeconds}
                    value={currentSeconds}
                    onChange={(e) => setCurrentSeconds(Number(e.target.value))}
                    className="w-full accent-[#E69300] cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-300 tabular-nums">
                    <span>{formatClock(currentSeconds)}</span>
                    <span>{formatClock(totalSeconds)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      setIsPlaying((p) => !p);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E69300] hover:bg-[#CC8200] text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? 'Pause Replay' : 'Play Replay'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentSeconds(0);
                      setIsPlaying(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restart
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Jump to Chapter
                </h3>
                {session.recordingChapters.map((chapter) => {
                  const isCurrent = Math.abs(currentSeconds - chapter.seconds) < 60;
                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => {
                        playUiSound('click');
                        setCurrentSeconds(chapter.seconds);
                        setIsPlaying(true);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                        isCurrent
                          ? 'border-[#15629E] bg-[#EBF5FF] dark:bg-sky-950/40 dark:border-sky-500'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {chapter.title}
                        </span>
                        <span className="text-xs font-semibold text-[#15629E] dark:text-sky-300 tabular-nums">
                          {chapter.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {chapter.summary}
                      </p>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F8FBFF] dark:bg-slate-800/60 p-4 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#15629E] dark:text-sky-400" />
                  AI Tutor Session Summary
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {session.notesSummary}
                </p>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Key Takeaways
                </h3>
                <ul className="space-y-2">
                  {session.keyTakeaways.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-lg p-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="schedule-personal-note"
                  className="block text-sm font-bold text-slate-900 dark:text-white"
                >
                  Your Reflection / Follow-up Questions
                </label>
                <textarea
                  id="schedule-personal-note"
                  rows={3}
                  value={personalNote}
                  onChange={(e) => {
                    setPersonalNote(e.target.value);
                    setSavedNotice(false);
                  }}
                  placeholder="Write a quick reminder or question to ask next session..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#15629E] hover:bg-[#115082] text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save to Notes &amp; Resources
                </button>
                {savedNotice && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Saved to Notes
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-50 dark:bg-slate-900/90">
          {session.status === 'upcoming' && onStartSession ? (
            <button
              type="button"
              onClick={() => {
                playUiSound('switch');
                onClose();
                onStartSession(session);
              }}
              className="px-4 py-2 rounded-lg bg-[#E69300] hover:bg-[#CC8200] text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
            >
              Start session
            </button>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Curriculum: {session.curriculum}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface CalendarEventDetailModalProps {
  session: ScheduleSessionItem;
  onClose: () => void;
  onStartSession: (session: ScheduleSessionItem) => void;
  onReschedule: (session: ScheduleSessionItem) => void;
  onViewNotes: (session: ScheduleSessionItem) => void;
  onCancelSession: (session: ScheduleSessionItem) => void;
}

export function CalendarEventDetailModal({
  session,
  onClose,
  onStartSession,
  onReschedule,
  onViewNotes,
  onCancelSession,
}: CalendarEventDetailModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-event-modal-title"
      data-testid="calendar-event-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
        <div className="bg-[#0B2A4A] px-6 py-4 flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-white/15 text-white">
              {session.subject}
            </span>
            <h2
              id="calendar-event-modal-title"
              className="font-display text-base font-bold text-white mt-2 leading-snug"
            >
              {session.topic}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close event details"
            className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-[#15629E] dark:text-sky-400 shrink-0" />
              <span className="tabular-nums">{formatIsoDateWithYear(session.dateIso)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4 text-[#15629E] dark:text-sky-400 shrink-0" />
              <span className="tabular-nums">
                {formatTimeRange12h(session.startTime24, session.durationMins)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <User className="w-4 h-4 text-[#15629E] dark:text-sky-400 shrink-0" />
              <span>{session.tutorName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <BookOpen className="w-4 h-4 text-[#15629E] dark:text-sky-400 shrink-0" />
              <span>{session.sessionType}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/70 rounded-xl p-3.5 leading-relaxed">
            {session.notesSummary}
          </p>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {session.status === 'upcoming' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartSession(session);
                }}
                className="flex-1 h-10 rounded-xl bg-[#E69300] hover:bg-[#CC8200] text-slate-950 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap px-4"
              >
                Start session
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewNotes(session);
              }}
              className="flex-1 h-10 rounded-xl border border-[#F5B74C] text-[#B86E00] dark:text-amber-300 font-semibold text-sm hover:bg-[#FFF9EC] dark:hover:bg-amber-950/30 transition-colors cursor-pointer whitespace-nowrap px-4"
            >
              View Notes
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                onClose();
                onReschedule(session);
              }}
              className="text-xs font-semibold text-[#15629E] dark:text-sky-400 hover:underline cursor-pointer"
            >
              Reschedule session
            </button>
            {session.status === 'upcoming' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCancelSession(session);
                }}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Cancel session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
