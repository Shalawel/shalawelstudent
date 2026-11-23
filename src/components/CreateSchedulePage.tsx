import { useState } from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
  Info,
  Plus,
  Radio,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { SessionHelpType } from '../types/dashboard';
import {
  SCHEDULE_DURATIONS,
  SCHEDULE_HELP_TYPES,
  SCHEDULE_SUBJECTS,
  SUBJECT_LESSON_CATALOG,
  autoScheduleLessons,
  buildSessionsFromCreateForm,
  createBlankDraftLesson,
  validateCreateScheduleForm,
  type ScheduleDraftLesson,
  type ScheduleRecurrenceMode,
  type ScheduleSessionItem,
  type ScheduledConfirmationItem,
} from '../utils/scheduleLogic';
import { playUiSound } from '../utils/uiSounds';

interface CreateSchedulePageProps {
  defaultCurriculum: string;
  presetDateIso?: string;
  onCancel: () => void;
  onScheduled: (
    newSessions: ScheduleSessionItem[],
    confirmations: ScheduledConfirmationItem[]
  ) => void;
}

export function CreateSchedulePage({
  defaultCurriculum,
  presetDateIso = '',
  onCancel,
  onScheduled,
}: CreateSchedulePageProps) {
  const [helpType, setHelpType] = useState<SessionHelpType | ''>('');
  const [subject, setSubject] = useState<string>('');
  const [curriculum, setCurriculum] = useState<string>(
    defaultCurriculum || 'Common Core State Standards (CCSS)'
  );
  const [mode, setMode] = useState<ScheduleRecurrenceMode>('one-time');
  const [lessons, setLessons] = useState<ScheduleDraftLesson[]>(() => [
    createBlankDraftLesson('Mathematics', 0, presetDateIso),
  ]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [autoScheduleBanner, setAutoScheduleBanner] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<'subject' | 'curriculum' | null>(null);

  const catalog = SUBJECT_LESSON_CATALOG[subject] ?? SUBJECT_LESSON_CATALOG.Mathematics;

  const handleSwitchMode = (nextMode: ScheduleRecurrenceMode) => {
    playUiSound('switch');
    setMode(nextMode);
    setValidationError(null);
    setAutoScheduleBanner(null);

    if (nextMode === 'recurring' && lessons.length < 3) {
      const targetSubject = subject || 'Mathematics';
      setLessons((prev) => {
        const next = [...prev];
        while (next.length < 3) {
          next.push(createBlankDraftLesson(targetSubject, next.length));
        }
        return next;
      });
    }
  };

  const handleSubjectChange = (nextSubject: string) => {
    setSubject(nextSubject);
    setValidationError(null);
    if (!nextSubject) return;
    const nextCatalog = SUBJECT_LESSON_CATALOG[nextSubject] ?? SUBJECT_LESSON_CATALOG.Mathematics;
    setLessons((prev) =>
      prev.map((item, idx) => ({
        ...item,
        lessonName: nextCatalog[idx % nextCatalog.length],
      }))
    );
  };

  const handleUpdateLesson = (
    lessonId: string,
    patch: Partial<Omit<ScheduleDraftLesson, 'id'>>
  ) => {
    setValidationError(null);
    setLessons((prev) =>
      prev.map((item) => (item.id === lessonId ? { ...item, ...patch } : item))
    );
  };

  const handleAddAnotherLesson = () => {
    playUiSound('click');
    const targetSubject = subject || 'Mathematics';
    setLessons((prev) => [...prev, createBlankDraftLesson(targetSubject, prev.length)]);
  };

  const handleRemoveLesson = (lessonId: string) => {
    playUiSound('click');
    setLessons((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.id !== lessonId)));
  };

  const handleAutoSchedule = () => {
    playUiSound('success');
    const targetSubject = subject || 'Mathematics';
    const populated = autoScheduleLessons(targetSubject, lessons);
    setLessons(populated);
    setValidationError(null);
    setAutoScheduleBanner(
      `AI suggested ${populated.length} balanced weekday slots for ${targetSubject}. Review or customize any slot below.`
    );
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateCreateScheduleForm({
      helpType,
      subject,
      curriculum,
      mode,
      lessons,
    });
    if (error) {
      setValidationError(error);
      playUiSound('subtle');
      return;
    }

    const { newSessions, confirmations } = buildSessionsFromCreateForm({
      helpType,
      subject,
      curriculum,
      mode,
      lessons,
    });
    playUiSound('success');
    onScheduled(newSessions, confirmations);
  };

  const activeVisibleLessons = mode === 'one-time' ? lessons.slice(0, 1) : lessons;

  return (
    <div className="space-y-5" data-testid="create-schedule-page">
      {/* Page Header Strip matching reference */}
      <div className="rounded-2xl bg-[#EDF5FC] dark:bg-slate-900/80 border border-[#D9E9F8] dark:border-slate-800 px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Tutoring Sessions
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Start and schedule tutoring sessions for your lessons and learning goals.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            playUiSound('click');
            onCancel();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Schedule
        </button>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleConfirm} className="space-y-5" noValidate>
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden">
          {/* Dark Navy Header */}
          <div className="bg-[#0B2A4A] px-6 py-5">
            <h2 className="font-display text-lg font-bold text-white">Schedule Details</h2>
            <p className="text-sm text-slate-300 mt-0.5">
              Choose how you want to schedule your tutoring sessions.
            </p>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Help Type */}
            <div>
              <label
                htmlFor="schedule-help-type"
                className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2"
              >
                What do you need help with? <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <select
                  id="schedule-help-type"
                  value={helpType}
                  onChange={(e) => {
                    setHelpType(e.target.value as SessionHelpType | '');
                    setValidationError(null);
                  }}
                  className="w-full h-11 appearance-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 pr-10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
                >
                  <option value="">Select type</option>
                  {SCHEDULE_HELP_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Subject */}
            <div>
              <div className="flex items-center gap-2 mb-2 relative">
                <label
                  htmlFor="schedule-subject"
                  className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                >
                  Subject <span className="text-rose-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setActiveTooltip((t) => (t === 'subject' ? null : 'subject'))
                  }
                  aria-label="Subject guidance info"
                  className="text-[#15629E] dark:text-sky-400 hover:opacity-80 cursor-pointer"
                >
                  <Info className="w-4 h-4" />
                </button>
                {activeTooltip === 'subject' && (
                  <span className="text-xs text-slate-600 dark:text-slate-300 bg-[#EBF5FF] dark:bg-slate-800 border border-[#C6E0FA] dark:border-slate-700 rounded-lg px-2.5 py-1">
                    Lessons below automatically align with your selected subject&apos;s learning plan.
                  </span>
                )}
              </div>
              <div className="relative">
                <select
                  id="schedule-subject"
                  value={subject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full h-11 appearance-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 pr-10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
                >
                  <option value="">Select Subject</option>
                  {SCHEDULE_SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Curriculum / Standards */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label
                  htmlFor="schedule-curriculum"
                  className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                >
                  Curriculum / Standards <span className="text-rose-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setActiveTooltip((t) => (t === 'curriculum' ? null : 'curriculum'))
                  }
                  aria-label="Curriculum standards info"
                  className="text-[#15629E] dark:text-sky-400 hover:opacity-80 cursor-pointer"
                >
                  <Info className="w-4 h-4" />
                </button>
                {activeTooltip === 'curriculum' && (
                  <span className="text-xs text-slate-600 dark:text-slate-300 bg-[#EBF5FF] dark:bg-slate-800 border border-[#C6E0FA] dark:border-slate-700 rounded-lg px-2.5 py-1">
                    Synced from your student profile; edit if preparing for a different standard.
                  </span>
                )}
              </div>
              <input
                id="schedule-curriculum"
                type="text"
                value={curriculum}
                onChange={(e) => {
                  setCurriculum(e.target.value);
                  setValidationError(null);
                }}
                placeholder="Common Core State Standards (CCSS)"
                className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
              />
            </div>

            {/* Mode Radio Selection */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                How would you like to schedule sessions?
              </legend>
              <div className="flex flex-wrap items-center gap-6">
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800 dark:text-slate-200">
                  <input
                    type="radio"
                    name="schedule-mode"
                    value="one-time"
                    checked={mode === 'one-time'}
                    onChange={() => handleSwitchMode('one-time')}
                    className="w-4 h-4 accent-[#E69300] cursor-pointer"
                  />
                  One-time Session
                </label>
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800 dark:text-slate-200">
                  <input
                    type="radio"
                    name="schedule-mode"
                    value="recurring"
                    checked={mode === 'recurring'}
                    onChange={() => handleSwitchMode('recurring')}
                    className="w-4 h-4 accent-[#E69300] cursor-pointer"
                  />
                  Recurring Schedule
                </label>
              </div>

              {/* Recurring Auto-Schedule Strip */}
              {mode === 'recurring' && (
                <div className="pt-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleAutoSchedule}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#15629E] hover:bg-[#115082] text-white font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Sparkles className="w-4 h-4" />
                      Auto-Schedule
                    </button>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                    Let AI automatically schedule lessons from your learning plan based on your
                    preferred days and times.
                  </p>
                  {autoScheduleBanner && (
                    <div className="rounded-xl bg-[#EBF5FF] dark:bg-sky-950/40 border border-[#C6E0FA] dark:border-sky-800 px-3.5 py-2 text-xs font-medium text-[#0F4C81] dark:text-sky-200">
                      {autoScheduleBanner}
                    </div>
                  )}
                </div>
              )}
            </fieldset>

            {/* Lessons to Schedule Section */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/90 bg-slate-50/40 dark:bg-slate-800/30 p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <CalendarIcon className="w-5 h-5 text-[#E69300] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Lessons to Schedule
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Choose lessons and set a date and time for each session.
                    </p>
                  </div>
                </div>
                {mode === 'recurring' && (
                  <span
                    data-testid="lessons-count-badge"
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FFF9EC] dark:bg-amber-950/40 text-[#B86E00] dark:text-amber-300 border border-[#F5B74C] dark:border-amber-700 tabular-nums"
                  >
                    {String(lessons.length).padStart(3, '0')} Lessons
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <Radio className="w-4 h-4 text-[#E69300] shrink-0" />
                <span>
                  {mode === 'one-time'
                    ? 'Single session (pick date and time)'
                    : 'List of lessons (according to learning plan)'}
                </span>
              </div>

              {mode === 'one-time' ? (
                /* One-time Lesson Form matching Image 3 */
                <div className="space-y-4 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <label
                      htmlFor="onetime-lesson-name"
                      className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
                    >
                      Lesson Name
                    </label>
                    <div className="relative">
                      <select
                        id="onetime-lesson-name"
                        value={activeVisibleLessons[0].lessonName}
                        onChange={(e) =>
                          handleUpdateLesson(activeVisibleLessons[0].id, {
                            lessonName: e.target.value,
                          })
                        }
                        className="w-full h-11 appearance-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 pr-10 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
                      >
                        {catalog.map((title) => (
                          <option key={title} value={title}>
                            {title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="onetime-date"
                      className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
                    >
                      Date
                    </label>
                    <input
                      id="onetime-date"
                      type="date"
                      value={activeVisibleLessons[0].dateIso}
                      onChange={(e) =>
                        handleUpdateLesson(activeVisibleLessons[0].id, {
                          dateIso: e.target.value,
                        })
                      }
                      className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="onetime-time"
                      className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
                    >
                      Time
                    </label>
                    <input
                      id="onetime-time"
                      type="time"
                      value={activeVisibleLessons[0].startTime24}
                      onChange={(e) =>
                        handleUpdateLesson(activeVisibleLessons[0].id, {
                          startTime24: e.target.value,
                        })
                      }
                      className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
                    />
                  </div>
                </div>
              ) : (
                /* Recurring Lesson Cards matching Image 4 */
                <div className="space-y-4">
                  {lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor={`recurring-lesson-${lesson.id}`}
                          className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                        >
                          Lesson Name
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveLesson(lesson.id)}
                          disabled={lessons.length <= 1}
                          aria-label={`Remove lesson ${idx + 1}`}
                          className="w-8 h-8 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="relative">
                        <select
                          id={`recurring-lesson-${lesson.id}`}
                          value={lesson.lessonName}
                          onChange={(e) =>
                            handleUpdateLesson(lesson.id, { lessonName: e.target.value })
                          }
                          className="w-full h-11 appearance-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 pr-10 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
                        >
                          {catalog.map((title) => (
                            <option key={title} value={title}>
                              {title}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label
                            htmlFor={`recurring-date-${lesson.id}`}
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                          >
                            Date
                          </label>
                          <input
                            id={`recurring-date-${lesson.id}`}
                            type="date"
                            value={lesson.dateIso}
                            onChange={(e) =>
                              handleUpdateLesson(lesson.id, { dateIso: e.target.value })
                            }
                            className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`recurring-duration-${lesson.id}`}
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                          >
                            Session Duration
                          </label>
                          <div className="relative">
                            <select
                              id={`recurring-duration-${lesson.id}`}
                              value={lesson.durationMins}
                              onChange={(e) =>
                                handleUpdateLesson(lesson.id, {
                                  durationMins: Number(e.target.value),
                                })
                              }
                              className="w-full h-10 appearance-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 pr-9 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E] tabular-nums"
                            >
                              {SCHEDULE_DURATIONS.map((mins) => (
                                <option key={mins} value={mins}>
                                  {mins} min
                                </option>
                              ))}
                            </select>
                            <Clock className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor={`recurring-time-${lesson.id}`}
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                          >
                            Time
                          </label>
                          <input
                            id={`recurring-time-${lesson.id}`}
                            type="time"
                            value={lesson.startTime24}
                            onChange={(e) =>
                              handleUpdateLesson(lesson.id, { startTime24: e.target.value })
                            }
                            className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddAnotherLesson}
                    className="w-full h-11 rounded-xl border border-[#3898E8] dark:border-sky-500 text-[#15629E] dark:text-sky-300 font-semibold text-sm hover:bg-[#EBF5FF] dark:hover:bg-sky-950/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Lesson
                  </button>
                </div>
              )}
            </div>

            {validationError && (
              <div
                role="alert"
                className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300"
              >
                {validationError}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Bar matching Images 3 & 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              onCancel();
            }}
            className="h-11 rounded-xl border border-[#F5B74C] bg-white dark:bg-slate-900 text-[#C27800] dark:text-amber-300 font-semibold text-sm hover:bg-[#FFF9EC] dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 rounded-xl bg-[#E69300] hover:bg-[#CC8200] text-slate-950 font-semibold text-sm transition-colors cursor-pointer shadow-xs"
          >
            Confirm Schedule
          </button>
        </div>
      </form>
    </div>
  );
}
