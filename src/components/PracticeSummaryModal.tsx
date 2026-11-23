import React, { useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  RotateCcw,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import type { ActivityReviewDetail } from '../utils/readinessPracticeLogic';
import { playUiSound } from '../utils/uiSounds';

interface PracticeSummaryModalProps {
  detail: ActivityReviewDetail | null;
  onClose: () => void;
  onTryAgain: (subject: string, topic: string) => void;
  onAskTutor: (subject: string, topic: string) => void;
  onOpenLearningPlan: () => void;
}

export const PracticeSummaryModal: React.FC<PracticeSummaryModalProps> = ({
  detail,
  onClose,
  onTryAgain,
  onAskTutor,
  onOpenLearningPlan,
}) => {
  useEffect(() => {
    if (!detail) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [detail, onClose]);

  if (!detail) return null;

  const isMastered = detail.accuracyPercent >= 80;
  const correctCount = detail.questions.filter((q) => q.isCorrect).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="practice-summary-title"
      data-testid="practice-summary-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#15629E] dark:text-sky-400">
              {detail.subject} · {detail.activityType} · {detail.dateLabel}
            </p>
            <h2
              id="practice-summary-title"
              className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white leading-snug"
            >
              {detail.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              onClose();
            }}
            aria-label="Close activity summary"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Summary KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Target className="h-4 w-4 text-[#E69300]" aria-hidden="true" />
                <span>Accuracy</span>
              </div>
              <p className="mt-1.5 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {detail.accuracyPercent}%
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  style={{ width: `${detail.accuracyPercent}%` }}
                  className={`h-full rounded-full ${
                    isMastered ? 'bg-emerald-500' : 'bg-[#E69300]'
                  }`}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="h-4 w-4 text-[#15629E] dark:text-sky-400" aria-hidden="true" />
                <span>Time Spent</span>
              </div>
              <p className="mt-1.5 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {detail.durationLabel}
              </p>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {correctCount} of {detail.questions.length} sample items verified
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                {isMastered ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                )}
                <span>Mastery Status</span>
              </div>
              <p
                className={`mt-1.5 font-display text-lg font-bold ${
                  isMastered
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                {detail.statusNote}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Target: 80% mastery
              </p>
            </div>
          </div>

          {/* AI Tutor Recommendation */}
          <div className="rounded-2xl bg-[#EBF4FC] dark:bg-sky-950/40 border border-[#C6E0F7] dark:border-sky-800/60 p-4 flex items-start gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-[#15629E] dark:text-sky-400 shadow-2xs">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#0B2242] dark:text-sky-200">
                TutorCloud Coaching Insight
              </p>
              <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {detail.tutorTip}
              </p>
            </div>
          </div>

          {/* Question-by-Question Review */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Question Review
            </h3>
            {detail.questions.map((q, idx) => (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-white leading-snug">
                    <span className="text-slate-400 dark:text-slate-500 mr-1.5 tabular-nums">
                      0{idx + 1}.
                    </span>
                    {q.prompt}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 shrink-0 text-[11px] font-bold whitespace-nowrap ${
                      q.isCorrect
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {q.isCorrect ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Correct
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Review
                      </>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 px-3 py-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Your answer:{' '}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {q.studentAnswer}
                    </span>
                  </div>
                  <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 px-3 py-2">
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Correct answer:{' '}
                    </span>
                    <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                      {q.correctAnswer}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {q.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
          {detail.activityType === 'Readiness' ? (
            <button
              type="button"
              onClick={() => {
                playUiSound('switch');
                onClose();
                onOpenLearningPlan();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#15629E] hover:text-[#15629E] transition-colors whitespace-nowrap shrink-0"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              Open Learning Plan
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                playUiSound('click');
                onClose();
              }}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              Close
            </button>
          )}

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                playUiSound('switch');
                onClose();
                onAskTutor(detail.subject, detail.title);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#38BDF8] dark:border-sky-600 px-4 py-2 text-xs font-semibold text-[#15629E] dark:text-sky-300 hover:bg-[#EBF4FC] dark:hover:bg-sky-950/50 transition-colors whitespace-nowrap shrink-0"
            >
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              Ask Tutor
            </button>
            <button
              type="button"
              onClick={() => {
                playUiSound('switch');
                onClose();
                onTryAgain(detail.subject, detail.title);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#E69300] px-4 py-2 text-xs font-semibold text-white hover:bg-[#CC8200] transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Try Again
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
