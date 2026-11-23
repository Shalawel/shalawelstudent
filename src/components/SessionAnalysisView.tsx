import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  filterAnalysisQuestions,
  formatTwoDigitCount,
  type AnalysisQuestionFilter,
  type SessionAnalysisReportData,
} from '../utils/learningSessionLogic';
import { playUiSound } from '../utils/uiSounds';

interface SessionAnalysisViewProps {
  report: SessionAnalysisReportData | null;
  onClose: () => void;
  onRetryPractice: (subject: string, topic: string) => void;
  onAskTutor: (subject: string, topic: string) => void;
}

export const SessionAnalysisView: React.FC<SessionAnalysisViewProps> = ({
  report,
  onClose,
  onRetryPractice,
  onAskTutor,
}) => {
  const [questionFilter, setQuestionFilter] = useState<AnalysisQuestionFilter>('all');

  useEffect(() => {
    setQuestionFilter('all');
  }, [report?.lessonId]);

  useEffect(() => {
    if (!report) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [report, onClose]);

  const filteredQuestions = useMemo(
    () => (report ? filterAnalysisQuestions(report.questions, questionFilter) : []),
    [report, questionFilter]
  );

  if (!report) return null;

  const needsReviewCount = report.questions.filter((q) => q.status !== 'Correct').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-analysis-report-title"
      data-testid="session-analysis-report"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-2 sm:p-5 flex justify-center items-start"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[920px] my-2 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Dark Navy Header Bar */}
        <header className="sticky top-0 z-10 bg-[#0B2A4A] text-white px-5 sm:px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="session-analysis-report-title"
              className="font-display text-base sm:text-lg font-bold tracking-tight text-white"
            >
              Session Analysis Report
            </h2>
            <p className="mt-0.5 text-xs text-slate-300 truncate">
              {report.title}
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              {report.subject}
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              {report.timestampLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              onClose();
            }}
            aria-label="Close Session Analysis Report"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </header>

        {/* Scrollable Report Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Sky-Blue Outlined 4-KPI Summary Container */}
          <section
            aria-label="Session performance metrics"
            data-testid="analysis-kpi-strip"
            className="rounded-2xl bg-[#EBF5FF] dark:bg-sky-950/35 border border-[#60A5FA] dark:border-sky-700/70 p-4"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="rounded-xl bg-white dark:bg-slate-900 px-4 py-4 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                <p className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <Check className="h-3.5 w-3.5 text-[#15629E] dark:text-sky-400" aria-hidden="true" />
                  Accuracy
                </p>
                <p className="mt-2 font-display text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white tabular-nums">
                  {report.accuracyPercent}%
                </p>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900 px-4 py-4 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                <p className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <Check className="h-3.5 w-3.5 text-[#15629E] dark:text-sky-400" aria-hidden="true" />
                  Time Spent
                </p>
                <p className="mt-2 font-display text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white tabular-nums">
                  {report.timeSpentLabel}
                </p>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900 px-4 py-4 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                <p className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <Check className="h-3.5 w-3.5 text-[#15629E] dark:text-sky-400" aria-hidden="true" />
                  Correct Answers
                </p>
                <p className="mt-2 font-display text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatTwoDigitCount(report.correctAnswers)}
                </p>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900 px-4 py-4 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                <p className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <Check className="h-3.5 w-3.5 text-[#15629E] dark:text-sky-400" aria-hidden="true" />
                  Total Questions
                </p>
                <p className="mt-2 font-display text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatTwoDigitCount(report.totalQuestions)}
                </p>
              </div>
            </div>
          </section>

          {/* Sky-Blue Coaching & Tutor Recommendations Card */}
          <section
            aria-label="Tutor coaching recommendations"
            className="rounded-2xl bg-[#EBF5FF] dark:bg-sky-950/35 border border-[#60A5FA] dark:border-sky-700/70 p-5"
          >
            <ul className="space-y-3">
              {report.recommendations.map((rec, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#15629E] dark:text-sky-400"
                    aria-hidden="true"
                  />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Answer Review Section */}
          <section aria-labelledby="answer-review-heading" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h3
                  id="answer-review-heading"
                  className="font-display text-base font-bold text-slate-900 dark:text-white"
                >
                  Answer review
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Each question shows your response and the correct answer so you can spot mistakes and revisit tough items.
                </p>
              </div>

              {/* Filter Tabs + Quick Learning Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <div
                  role="group"
                  aria-label="Filter reviewed questions"
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1"
                >
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      setQuestionFilter('all');
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      questionFilter === 'all'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    All ({report.totalQuestions})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      setQuestionFilter('correct');
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      questionFilter === 'correct'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Correct ({report.correctAnswers})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      setQuestionFilter('needs-review');
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      questionFilter === 'needs-review'
                        ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Review ({needsReviewCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Question Review Cards */}
            {filteredQuestions.length > 0 ? (
              <div className="space-y-3.5">
                {filteredQuestions.map((q) => (
                  <article
                    key={q.id}
                    data-testid={`analysis-question-${q.number}`}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 space-y-3 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
                  >
                    {/* Question Header Row */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                        Question {q.number}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          q.status === 'Correct'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : q.status === 'Incorrect'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {q.status === 'Correct' ? (
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : q.status === 'Incorrect' ? (
                          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {q.status}
                      </span>
                    </div>

                    {/* Question Prompt */}
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {q.prompt}
                    </p>

                    {/* Your Answer vs Correct Answer */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-0.5">
                      <div className="sm:col-span-4">
                        <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                          Your Answer
                        </p>
                        <p className="mt-1 text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                          {q.studentAnswer ?? '—'}
                        </p>
                      </div>
                      <div className="sm:col-span-8">
                        <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                          Correct Answer
                        </p>
                        <p className="mt-1 text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-white">
                          {q.correctAnswer}
                        </p>
                      </div>
                    </div>

                    {/* Warm Cream Explanation Callout */}
                    <div className="rounded-xl bg-[#FFF9ED] dark:bg-amber-950/30 border border-[#F5B74C] dark:border-amber-700/70 px-4 py-3 text-xs text-slate-800 dark:text-amber-100 leading-relaxed">
                      <strong className="font-bold text-slate-900 dark:text-amber-200">
                        Explanation:{' '}
                      </strong>
                      {q.explanation}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 text-center text-xs text-slate-600 dark:text-slate-300">
                No questions match this filter.
              </div>
            )}
          </section>

          {/* Action Helpers Above Close */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                playUiSound('switch');
                onClose();
                onAskTutor(report.subject, report.title);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#38BDF8] dark:border-sky-600 px-4 py-2 text-xs font-semibold text-[#15629E] dark:text-sky-300 hover:bg-[#EBF4FC] dark:hover:bg-sky-950/40 transition-colors whitespace-nowrap shrink-0"
            >
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              Review with AI Tutor
            </button>
            <button
              type="button"
              onClick={() => {
                playUiSound('switch');
                onClose();
                onRetryPractice(report.subject, report.title);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#E69300] hover:bg-[#CC8200] px-4 py-2 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Retry Practice Quiz
            </button>
          </div>

          {/* Full-Width Red Close Button matching Reference */}
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              onClose();
            }}
            data-testid="analysis-close-bottom"
            className="bencho-press w-full rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] py-3 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
