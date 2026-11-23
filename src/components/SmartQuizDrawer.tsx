import React, { useEffect, useState } from 'react';
import { ChevronDown, Play, Sparkles, X } from 'lucide-react';
import type { SmartQuizInput } from '../types/dashboard';
import { AVAILABLE_SUBJECTS } from '../data/seedData';
import {
  SUBJECT_SUGGESTED_TOPICS,
  validateSmartQuizInput,
} from '../utils/smartQuizLogic';

interface SmartQuizDrawerProps {
  open: boolean;
  onClose: () => void;
  defaultSubject?: string;
  onStartQuiz: (input: SmartQuizInput) => void;
}

const MiniQuizRobotBadge: React.FC = () => (
  <span
    aria-hidden="true"
    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-xs border border-emerald-200/80"
  >
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <line x1="16" y1="3" x2="16" y2="7" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="3" r="2" fill="#16A34A" />
      <rect x="6" y="8" width="20" height="15" rx="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
      <rect x="9" y="11" width="14" height="8" rx="3.5" fill="#1E293B" />
      <circle cx="13" cy="15" r="1.6" fill="#A3E635" />
      <circle cx="19" cy="15" r="1.6" fill="#A3E635" />
      <path d="M12 24.5C13.5 26 18.5 26 20 24.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </span>
);

export const SmartQuizDrawer: React.FC<SmartQuizDrawerProps> = ({
  open,
  onClose,
  defaultSubject = '',
  onStartQuiz,
}) => {
  const [subject, setSubject] = useState<string>(defaultSubject);
  const [topic, setTopic] = useState<string>('');
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

  const suggestedTopics = subject
    ? SUBJECT_SUGGESTED_TOPICS[subject] ?? SUBJECT_SUGGESTED_TOPICS.English
    : SUBJECT_SUGGESTED_TOPICS.English;

  const isReady = Boolean(subject.trim() && topic.trim().length >= 2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateSmartQuizInput({ subject, topic });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onStartQuiz({
      subject: subject.trim(),
      topic: topic.trim(),
    });

    setSubject(defaultSubject);
    setTopic('');
    setErrors({});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-start"
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-quiz-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Left-side Slide-Over Drawer */}
      <div
        data-testid="smart-quiz-drawer"
        className="relative z-10 flex h-full w-full max-w-[520px] flex-col bg-white shadow-2xl animate-drawer-slide-in-left"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F39200] text-white shadow-xs">
              <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="smart-quiz-drawer-title"
                className="font-display text-[17px] font-bold text-slate-900 leading-tight"
              >
                Smart Quiz
              </h2>
              <p className="mt-0.5 text-[13px] text-slate-500">
                Choose a subject and topic to start your interactive card quiz.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Smart Quiz drawer"
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
            {/* 1. Subject */}
            <div>
              <label
                htmlFor="smart-quiz-subject-select"
                className="block text-[13.5px] font-semibold text-slate-900 mb-2"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="smart-quiz-subject-select"
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

            {/* 2. Quiz Topic Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4">
              <div>
                <label
                  htmlFor="smart-quiz-topic-input"
                  className="block text-[13.5px] font-semibold text-slate-900 mb-2"
                >
                  Topic of the Quiz <span className="text-red-500">*</span>
                </label>
                <input
                  id="smart-quiz-topic-input"
                  type="text"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setErrors((prev) => ({ ...prev, topic: undefined }));
                  }}
                  placeholder="Enter the topic you want to be quizzed on"
                  className={`w-full rounded-xl border bg-[#F5F6F8] px-4 py-3 text-[13.5px] text-slate-900 placeholder:text-slate-400 transition-colors focus:bg-white focus:border-[#15629E] focus:outline-none focus:ring-2 focus:ring-[#15629E]/20 ${
                    errors.topic ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.topic && (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.topic}
                  </p>
                )}
              </div>

              {/* Quick topic suggestions */}
              <div className="pt-1 border-t border-slate-100">
                <p className="text-[12px] font-medium text-slate-500 mb-2.5">
                  {subject ? `Popular ${subject} topics` : 'Quick-pick a topic'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTopics.map((suggestion) => {
                    const selected = topic === suggestion;
                    return (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setTopic(suggestion);
                          if (!subject) setSubject('English');
                          setErrors({});
                        }}
                        className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
                          selected
                            ? 'border-[#15629E] bg-[#EBF6FF] text-[#15629E]'
                            : 'border-slate-200 bg-[#F8FAFC] text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {suggestion}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Interactive Deck Info Callout */}
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200/90 bg-[#F2FBF0] px-4 py-3.5">
              <MiniQuizRobotBadge />
              <p className="text-[12.5px] text-slate-700 leading-snug">
                Interactive 6-card deck · Select an answer to automatically advance, swipe cards
                left or right, or use Back anytime.
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
                className={`h-4 w-4 ${
                  isReady ? 'fill-white text-white' : 'fill-slate-500 text-slate-500'
                }`}
                aria-hidden="true"
              />
              <span>Start Smart Quiz</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
