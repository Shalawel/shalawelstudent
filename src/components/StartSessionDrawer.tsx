import React, { useEffect, useState } from 'react';
import { ChevronDown, Minus, Play, Plus, X } from 'lucide-react';
import type {
  LearningPlanModule,
  LessonSource,
  SessionHelpType,
  StartSessionInput,
} from '../types/dashboard';
import { AVAILABLE_SUBJECTS } from '../data/seedData';
import { validateStartSessionInput } from '../utils/dashboardLogic';

interface StartSessionDrawerProps {
  open: boolean;
  onClose: () => void;
  hasCompletedReadinessCheck: boolean;
  planModules: LearningPlanModule[];
  onStartSession: (input: StartSessionInput) => void;
}

const HELP_TYPES: SessionHelpType[] = [
  'Learn a Lesson',
  'Prepare for a Test',
  'Homework Help',
];

const MiniRobotBadge: React.FC = () => (
  <span
    aria-hidden="true"
    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-xs border border-sky-100"
  >
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <line x1="16" y1="3" x2="16" y2="7" stroke="#EC4899" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="3" r="2" fill="#EC4899" />
      <rect x="6" y="8" width="20" height="15" rx="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
      <rect x="9" y="11" width="14" height="8" rx="3.5" fill="#1E293B" />
      <circle cx="13" cy="15" r="1.6" fill="#38BDF8" />
      <circle cx="19" cy="15" r="1.6" fill="#38BDF8" />
      <path d="M12 24.5C13.5 26 18.5 26 20 24.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </span>
);

export const StartSessionDrawer: React.FC<StartSessionDrawerProps> = ({
  open,
  onClose,
  hasCompletedReadinessCheck,
  planModules,
  onStartSession,
}) => {
  const [helpType, setHelpType] = useState<SessionHelpType>('Learn a Lesson');
  const [subject, setSubject] = useState<string>('');
  const [lessonSource, setLessonSource] = useState<LessonSource>('another-topic');
  const [topic, setTopic] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string | undefined>(undefined);
  const [showSpecificQuestion, setShowSpecificQuestion] = useState<boolean>(false);
  const [specificQuestion, setSpecificQuestion] = useState<string>('');
  const [errors, setErrors] = useState<{ subject?: string; topic?: string }>({});

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const filteredPlanModules = subject
    ? planModules.filter((m) => m.subject === subject)
    : planModules;
  const selectablePlanModules =
    filteredPlanModules.length > 0 ? filteredPlanModules : planModules;

  const isReady = Boolean(subject.trim() && topic.trim().length >= 2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateStartSessionInput({ subject, topic });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onStartSession({
      helpType,
      subject,
      lessonSource,
      topic: topic.trim(),
      specificQuestion: showSpecificQuestion ? specificQuestion.trim() : '',
      gradeLevel:
        gradeLevel ??
        (topic.toLowerCase().includes('angle') && subject === 'Mathematics'
          ? '5'
          : subject === 'Science' &&
            (topic.toLowerCase().includes('water') || topic.toLowerCase().includes('weather'))
          ? '6'
          : undefined),
    });

    // Reset form state for next open
    setSubject('');
    setTopic('');
    setGradeLevel(undefined);
    setSpecificQuestion('');
    setShowSpecificQuestion(false);
    setLessonSource('another-topic');
    setHelpType('Learn a Lesson');
    setErrors({});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="start-session-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right-side Slide-Over Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-[560px] flex-col bg-white shadow-2xl animate-drawer-slide-in">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00A859] text-white shadow-xs">
              <Play className="h-5 w-5 fill-white text-white ml-0.5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="start-session-drawer-title"
                className="font-display text-[17px] font-bold text-slate-900 leading-tight"
              >
                Start a Session
              </h2>
              <p className="mt-0.5 text-[13px] text-slate-500">
                Choose what you want help with and start learning.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Start a Session drawer"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-1 flex-col justify-between overflow-y-auto px-6 pb-6 pt-2"
        >
          <div className="space-y-5">
            {/* 1. What do you need help with today? * */}
            <div>
              <span className="block text-[13.5px] font-semibold text-slate-900 mb-3">
                What do you need help with today? <span className="text-red-500">*</span>
              </span>

              <div className="flex justify-center">
                <div
                  role="radiogroup"
                  aria-label="What do you need help with today?"
                  className="inline-flex flex-wrap sm:flex-nowrap items-center justify-center gap-1.5 rounded-2xl sm:rounded-full border border-slate-200/90 bg-white p-1.5 shadow-[0_1px_6px_rgba(15,23,42,0.05)]"
                >
                  {HELP_TYPES.map((type) => {
                    const active = helpType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setHelpType(type)}
                        className={`rounded-full px-4 py-2 text-[12.5px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                          active
                            ? 'bg-[#C86400] text-white shadow-xs'
                            : 'bg-[#F4F5F7] border border-slate-200/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Subject */}
            <div>
              <label
                htmlFor="session-subject-select"
                className="block text-[13.5px] font-semibold text-slate-900 mb-2"
              >
                Subject
              </label>
              <div className="relative">
                <select
                  id="session-subject-select"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setErrors((prev) => ({ ...prev, subject: undefined }));
                  }}
                  className={`w-full appearance-none rounded-xl border bg-[#F5F6F8] px-4 py-3 pr-10 text-[13.5px] transition-colors focus:bg-white focus:border-[#15629E] focus:outline-none focus:ring-2 focus:ring-[#15629E]/20 ${
                    subject ? 'text-slate-900 font-medium' : 'text-slate-500'
                  } ${errors.subject ? 'border-red-400' : 'border-slate-200'}`}
                >
                  <option value="">Select a subject</option>
                  {AVAILABLE_SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                />
              </div>
              {errors.subject && (
                <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.subject}
                </p>
              )}
            </div>

            {/* 3. Where is this lesson from? + Lesson or Topic * */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4">
              <fieldset className="space-y-3.5">
                <legend className="text-[13.5px] font-semibold text-slate-900 mb-2">
                  Where is this lesson from?
                </legend>

                {/* My Learning Plan */}
                <label
                  className={`flex items-start gap-3 ${
                    hasCompletedReadinessCheck
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <input
                    type="radio"
                    name="lesson-source"
                    value="learning-plan"
                    disabled={!hasCompletedReadinessCheck}
                    checked={lessonSource === 'learning-plan'}
                    onChange={() => {
                      setLessonSource('learning-plan');
                      const firstMod = selectablePlanModules[0];
                      if (firstMod) {
                        setTopic(firstMod.title);
                        if (!subject) setSubject(firstMod.subject);
                      }
                      setErrors((prev) => ({ ...prev, topic: undefined }));
                    }}
                    className="mt-0.5 h-4 w-4 accent-slate-900"
                  />
                  <span className="leading-snug">
                    <span className="block text-[13.5px] font-medium text-slate-700">
                      My Learning Plan
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-slate-500">
                      {hasCompletedReadinessCheck
                        ? 'Choose a milestone directly from your individualized Learning Plan.'
                        : 'Lessons from your plan appear after your Readiness Check.'}
                    </span>
                  </span>
                </label>

                {/* Another Topic */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="lesson-source"
                    value="another-topic"
                    checked={lessonSource === 'another-topic'}
                    onChange={() => {
                      setLessonSource('another-topic');
                      setTopic('');
                    }}
                    className="h-4 w-4 accent-slate-900"
                  />
                  <span className="text-[13.5px] font-medium text-slate-900">
                    Another Topic
                  </span>
                </label>
              </fieldset>

              <hr className="border-slate-100" />

              {/* Lesson or Topic * */}
              <div>
                <label
                  htmlFor="session-topic-input"
                  className="block text-[13.5px] font-semibold text-slate-900 mb-2"
                >
                  Lesson or Topic <span className="text-red-500">*</span>
                </label>

                {lessonSource === 'learning-plan' && hasCompletedReadinessCheck ? (
                  <div className="relative">
                    <select
                      id="session-topic-input"
                      value={topic}
                      onChange={(e) => {
                        setTopic(e.target.value);
                        setErrors((prev) => ({ ...prev, topic: undefined }));
                      }}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-[#F5F6F8] px-4 py-3 pr-10 text-[13.5px] text-slate-900 focus:bg-white focus:border-[#15629E] focus:outline-none"
                    >
                      <option value="">Select a lesson from your plan</option>
                      {selectablePlanModules.map((mod) => (
                        <option key={mod.id} value={mod.title}>
                          {mod.week}: {mod.title} ({mod.subject})
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                    />
                  </div>
                ) : (
                  <input
                    id="session-topic-input"
                    type="text"
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      setErrors((prev) => ({ ...prev, topic: undefined }));
                    }}
                    placeholder="Enter the topic you'd like to work on"
                    className={`w-full rounded-xl border bg-[#F5F6F8] px-4 py-3 text-[13.5px] text-slate-900 placeholder:text-slate-400 transition-colors focus:bg-white focus:border-[#15629E] focus:outline-none focus:ring-2 focus:ring-[#15629E]/20 ${
                      errors.topic ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                )}

                {errors.topic && (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.topic}
                  </p>
                )}

                {subject === 'Science' && lessonSource === 'another-topic' && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[11.5px] font-medium text-slate-500">
                      Science topics:
                    </span>
                    {['Water Cycle', 'Photosynthesis', 'Electricity & Circuits'].map((sciTopic) => {
                      const active = topic.trim().toLowerCase() === sciTopic.toLowerCase();
                      return (
                        <button
                          key={sciTopic}
                          type="button"
                          data-testid={`science-topic-${sciTopic.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={() => {
                            setTopic(sciTopic);
                            setGradeLevel(sciTopic === 'Water Cycle' ? '6' : undefined);
                            setErrors((prev) => ({ ...prev, topic: undefined }));
                          }}
                          className={`rounded-lg border px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
                            active
                              ? 'border-[#00A859] bg-[#00A859] text-white'
                              : 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {sciTopic}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[11.5px] font-medium text-slate-500">Quick start:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSubject('Mathematics');
                      setLessonSource('another-topic');
                      setTopic('Angles');
                      setGradeLevel('5');
                      setErrors({});
                    }}
                    className="rounded-lg border border-sky-200 bg-sky-50/70 hover:bg-sky-100 px-2.5 py-1 text-[11.5px] font-semibold text-[#15629E] transition-colors"
                  >
                    Class 5 Math · Angles (Voice)
                  </button>
                  <button
                    type="button"
                    data-testid="quick-start-water-cycle"
                    onClick={() => {
                      setSubject('Science');
                      setLessonSource('another-topic');
                      setTopic('Water Cycle');
                      setGradeLevel('6');
                      setErrors({});
                    }}
                    className="rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-800 transition-colors"
                  >
                    Class 6 Science · Water Cycle
                  </button>
                </div>
              </div>
            </div>

            {/* 4. + Add a Specific Question (Optional) */}
            <div>
              <button
                type="button"
                aria-expanded={showSpecificQuestion}
                onClick={() => setShowSpecificQuestion((v) => !v)}
                className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-slate-900 hover:text-[#15629E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] rounded-md py-1"
              >
                {showSpecificQuestion ? (
                  <Minus className="h-4 w-4 text-slate-700" aria-hidden="true" />
                ) : (
                  <Plus className="h-4 w-4 text-slate-700" aria-hidden="true" />
                )}
                <span>Add a Specific Question (Optional)</span>
              </button>

              {showSpecificQuestion && (
                <div className="mt-2.5">
                  <label htmlFor="session-specific-question" className="sr-only">
                    Specific Question (Optional)
                  </label>
                  <textarea
                    id="session-specific-question"
                    rows={3}
                    value={specificQuestion}
                    onChange={(e) => setSpecificQuestion(e.target.value)}
                    placeholder="Paste a homework problem or ask a specific question you want to cover..."
                    className="w-full rounded-xl border border-slate-200 bg-[#F5F6F8] px-4 py-3 text-[13.5px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#15629E] focus:outline-none focus:ring-2 focus:ring-[#15629E]/20"
                  />
                </div>
              )}
            </div>

            {/* 5. Suggested Time Info Callout */}
            <div className="flex items-center gap-3 rounded-xl border border-sky-200/90 bg-[#EBF6FF] px-4 py-3.5">
              <MiniRobotBadge />
              <p className="text-[12.5px] text-slate-700 leading-snug">
                Suggested time: about 45 minutes. You can stop anytime or keep going if you need
                more time.
              </p>
            </div>
          </div>

          {/* Bottom Primary CTA */}
          <div className="pt-5">
            <button
              type="submit"
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
                isReady
                  ? 'bg-[#15629E] hover:bg-[#104E7E] text-white shadow-[0_6px_18px_rgba(21,98,158,0.28)]'
                  : 'bg-[#EFEFF1] hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              <Play
                className={`h-4 w-4 ${isReady ? 'fill-white text-white' : 'fill-slate-500 text-slate-500'}`}
                aria-hidden="true"
              />
              <span>Start Session</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
