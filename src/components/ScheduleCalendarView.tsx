import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import {
  SCHEDULE_TODAY_ISO,
  buildCalendarMonthGrid,
  formatMonthYearHeading,
  type ScheduleSessionItem,
} from '../utils/scheduleLogic';
import { playUiSound } from '../utils/uiSounds';

interface ScheduleCalendarViewProps {
  sessions: ScheduleSessionItem[];
  subjectFilter: string;
  onSubjectFilterChange: (subject: string) => void;
  onSelectSession: (session: ScheduleSessionItem) => void;
  onQuickCreateForDate: (dateIso: string) => void;
}

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const LEGEND_SUBJECTS = [
  { name: 'Mathematics', dotClass: 'bg-[#15629E]' },
  { name: 'Science', dotClass: 'bg-[#0B843E]' },
  { name: 'English', dotClass: 'bg-[#F59E0B]' },
] as const;

function getEventPillClasses(subject: string, status: ScheduleSessionItem['status']): string {
  if (status === 'canceled' || status === 'missed') {
    return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 line-through opacity-80 hover:opacity-100';
  }
  switch (subject) {
    case 'Mathematics':
      return 'bg-[#15629E] hover:bg-[#104F80] text-white';
    case 'Science':
      return 'bg-[#0B843E] hover:bg-[#086A31] text-white';
    case 'English':
      return 'bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-semibold';
    default:
      return 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white';
  }
}

export function ScheduleCalendarView({
  sessions,
  subjectFilter,
  onSubjectFilterChange,
  onSelectSession,
  onQuickCreateForDate,
}: ScheduleCalendarViewProps) {
  const [year, setYear] = useState(2026);
  const [monthIndex, setMonthIndex] = useState(6); // July 2026 matching reference

  const cells = useMemo(
    () => buildCalendarMonthGrid(year, monthIndex, SCHEDULE_TODAY_ISO),
    [year, monthIndex]
  );

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, ScheduleSessionItem[]>();
    for (const session of sessions) {
      if (session.dismissed) continue;
      if (subjectFilter !== 'All Subjects' && session.subject !== subjectFilter) continue;
      const list = map.get(session.dateIso) ?? [];
      list.push(session);
      map.set(session.dateIso, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.startTime24.localeCompare(b.startTime24));
    }
    return map;
  }, [sessions, subjectFilter]);

  const handlePrevMonth = () => {
    playUiSound('click');
    if (monthIndex === 0) {
      setYear((y) => y - 1);
      setMonthIndex(11);
    } else {
      setMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    playUiSound('click');
    if (monthIndex === 11) {
      setYear((y) => y + 1);
      setMonthIndex(0);
    } else {
      setMonthIndex((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    playUiSound('switch');
    setYear(2026);
    setMonthIndex(6);
  };

  const handleLegendToggle = (subjectName: string) => {
    playUiSound('click');
    if (subjectFilter === subjectName) {
      onSubjectFilterChange('All Subjects');
    } else {
      onSubjectFilterChange(subjectName);
    }
  };

  return (
    <section
      aria-label="Monthly schedule calendar"
      data-testid="schedule-calendar-view"
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-4 sm:p-6 shadow-xs space-y-5"
    >
      {/* Top Controls matching Image 2 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3.5">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
            {formatMonthYearHeading(year, monthIndex)}
          </h2>

          <div className="inline-flex items-center gap-1 rounded-full bg-[#E8F2FF] dark:bg-slate-800 px-2 py-1.5 border border-[#D4E6FA] dark:border-slate-700">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleGoToday}
              className="px-2.5 py-0.5 text-sm font-semibold text-slate-900 dark:text-white hover:text-[#15629E] dark:hover:text-sky-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clickable Subject Color Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3" role="group" aria-label="Subject legend filter">
          {LEGEND_SUBJECTS.map((item) => {
            const isSelected = subjectFilter === item.name;
            const isDimmed = subjectFilter !== 'All Subjects' && !isSelected;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleLegendToggle(item.name)}
                aria-pressed={isSelected}
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EBF5FF] dark:bg-sky-950/50 text-slate-900 dark:text-white ring-1 ring-[#15629E]'
                    : isDimmed
                    ? 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dotClass}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive Scroll Wrapper for 7-column Monthly Grid */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="min-w-[680px] rounded-xl border border-slate-200 dark:border-slate-700/90 overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-[#EDF5FF] dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-3 px-2 text-center text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 bg-white dark:bg-slate-900">
            {cells.map((cell) => {
              const dayEvents = sessionsByDate.get(cell.dateIso) ?? [];
              return (
                <div
                  key={cell.dateIso}
                  data-date={cell.dateIso}
                  className={`group relative min-h-[112px] sm:min-h-[124px] p-2.5 border-r border-b border-slate-100 dark:border-slate-800 flex flex-col gap-1.5 transition-colors ${
                    cell.isToday
                      ? 'ring-2 ring-inset ring-[#15629E] bg-[#F7FBFF] dark:bg-sky-950/25 z-10'
                      : cell.inCurrentMonth
                      ? 'bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      : 'bg-slate-50/40 dark:bg-slate-950/40'
                  }`}
                >
                  {/* Top Row: Day number + TODAY or quick add */}
                  <div className="flex items-center justify-between gap-1">
                    {cell.isToday ? (
                      <span className="w-7 h-7 rounded-full bg-[#15629E] text-white text-xs font-bold flex items-center justify-center tabular-nums">
                        {cell.dayNumber}
                      </span>
                    ) : (
                      <span
                        className={`text-sm font-medium tabular-nums ${
                          cell.inCurrentMonth
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                    )}

                    {cell.isToday ? (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#15629E] dark:text-sky-300">
                        TODAY
                      </span>
                    ) : (
                      cell.inCurrentMonth && (
                        <button
                          type="button"
                          onClick={() => {
                            playUiSound('click');
                            onQuickCreateForDate(cell.dateIso);
                          }}
                          aria-label={`Schedule session on ${cell.dateIso}`}
                          className="w-6 h-6 rounded-md text-slate-400 hover:text-[#15629E] hover:bg-[#EBF5FF] dark:hover:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>

                  {/* Event Pills */}
                  <div className="space-y-1.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => {
                          playUiSound('click');
                          onSelectSession(ev);
                        }}
                        title={`${ev.subject}: ${ev.topic}`}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] sm:text-xs font-medium leading-tight truncate transition-colors cursor-pointer ${getEventPillClasses(
                          ev.subject,
                          ev.status
                        )}`}
                      >
                        {ev.calendarLabel}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          playUiSound('click');
                          onSelectSession(dayEvents[3]);
                        }}
                        className="text-[11px] font-semibold text-[#15629E] dark:text-sky-300 hover:underline px-1 cursor-pointer"
                      >
                        +{dayEvents.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
