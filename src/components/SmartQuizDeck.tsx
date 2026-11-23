import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'motion/react';
import { Check, RotateCcw, X } from 'lucide-react';
import type { SmartQuizInput } from '../types/dashboard';
import {
  buildSmartQuizDeck,
  resolveSwipeDirection,
  scoreSmartQuiz,
} from '../utils/smartQuizLogic';
import { MascotHelperPopup } from './MascotHelperPopup';

interface SmartQuizDeckProps {
  config: SmartQuizInput;
  onComplete: (scorePercent: number) => void;
  onClose: () => void;
}

const cardVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 110 : -110,
    opacity: 0,
    scale: 0.96,
    rotate: direction >= 0 ? 4 : -4,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 340,
      damping: 30,
      mass: 0.9,
    },
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -240 : 240,
    opacity: 0,
    scale: 0.94,
    rotate: direction >= 0 ? -9 : 9,
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export const SmartQuizDeck: React.FC<SmartQuizDeckProps> = ({
  config,
  onComplete,
  onClose,
}) => {
  const questions = useMemo(
    () => buildSmartQuizDeck(config.subject, config.topic),
    [config.subject, config.topic]
  );

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState<boolean>(false);
  const [showReview, setShowReview] = useState<boolean>(false);

  const autoAdvanceTimerRef = useRef<number | null>(null);
  const dragX = useMotionValue(0);
  const dragRotate = useTransform(dragX, [-220, 0, 220], [-8, 0, 8]);

  const clearPendingAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearPendingAutoAdvance();
  }, [clearPendingAutoAdvance]);

  const goNext = useCallback(() => {
    clearPendingAutoAdvance();
    dragX.set(0);
    setDirection(1);
    setCurrentIndex((prev) => {
      if (prev + 1 >= questions.length) {
        setCompleted(true);
        return prev;
      }
      return prev + 1;
    });
  }, [clearPendingAutoAdvance, dragX, questions.length]);

  const goPrev = useCallback(() => {
    clearPendingAutoAdvance();
    dragX.set(0);
    if (completed) {
      setDirection(-1);
      setCompleted(false);
      setCurrentIndex(questions.length - 1);
      return;
    }
    setCurrentIndex((prev) => {
      if (prev <= 0) return prev;
      setDirection(-1);
      return prev - 1;
    });
  }, [clearPendingAutoAdvance, completed, dragX, questions.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && (currentIndex > 0 || completed)) {
        goPrev();
      } else if (e.key === 'ArrowRight' && !completed) {
        goNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [completed, currentIndex, goNext, goPrev, onClose]);

  const handleSelectOption = (optionIndex: number) => {
    clearPendingAutoAdvance();
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      autoAdvanceTimerRef.current = null;
      setDirection(1);
      if (currentIndex + 1 >= questions.length) {
        setCompleted(true);
      } else {
        setCurrentIndex((curr) => Math.min(curr + 1, questions.length - 1));
      }
    }, 280);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipe = resolveSwipeDirection(info.offset.x, info.velocity.x);
    if (swipe === 'next') {
      goNext();
    } else if (swipe === 'prev' && currentIndex > 0) {
      goPrev();
    }
  };

  const handleRetake = () => {
    clearPendingAutoAdvance();
    setAnswers({});
    setCurrentIndex(0);
    setDirection(-1);
    setCompleted(false);
    setShowReview(false);
  };

  const scoreSummary = useMemo(
    () => scoreSmartQuiz(questions, answers),
    [questions, answers]
  );

  const currentQuestion = questions[currentIndex];
  const selectedOption = answers[currentIndex];
  const remainingCardsCount = completed ? 0 : questions.length - 1 - currentIndex;
  const questionCode = String(currentIndex + 1).padStart(2, '0');

  return (
    <div
      data-testid="smart-quiz-stage"
      role="dialog"
      aria-modal="true"
      aria-label={`Smart Quiz: ${config.subject} - ${config.topic}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto px-4 py-8"
      style={{
        backgroundColor: '#E5E6DC',
        backgroundImage:
          'linear-gradient(to right, rgba(28, 44, 28, 0.055) 1px, transparent 1px)',
        backgroundSize: '180px 100%',
      }}
    >
      {/* Subtle unboxed context header */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2 text-[12.5px] font-medium text-[#4D5A4D]">
        <span>{config.subject}</span>
        <span aria-hidden="true">·</span>
        <span>{config.topic}</span>
        <span aria-hidden="true">·</span>
        <span className="text-[#6B766B]">Swipe card or tap an answer</span>
      </div>

      {/* Stacked Card Deck Container */}
      <div className="relative w-full max-w-[440px] min-h-[540px] flex items-center justify-center">
        {/* Background stacked card 2 (deepest) */}
        {remainingCardsCount >= 2 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 top-3 bottom-1 rounded-[30px] bg-white/55 shadow-[0_12px_30px_rgba(24,38,24,0.05)] transition-transform duration-300"
            style={{ transform: 'rotate(-4.5deg) translateY(6px)' }}
          />
        )}

        {/* Background stacked card 1 (tilted right — matches reference image) */}
        {remainingCardsCount >= 1 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-1 top-1 bottom-0 rounded-[30px] bg-[#F7F8F5]/90 shadow-[0_16px_42px_rgba(24,38,24,0.07)] transition-transform duration-300"
            style={{ transform: 'rotate(6.2deg) translate(4px, 4px)' }}
          />
        )}

        {/* Active Foreground Card */}
        <AnimatePresence mode="wait" custom={direction}>
          {!completed ? (
            <motion.article
              key={currentQuestion.id}
              data-testid="smart-quiz-card"
              data-question-index={currentIndex}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.42}
              onDragEnd={handleDragEnd}
              style={{ x: dragX, rotate: dragRotate }}
              whileDrag={{ cursor: 'grabbing' }}
              className="relative z-10 flex w-full min-h-[536px] cursor-grab flex-col justify-between rounded-[28px] bg-white px-8 py-8 shadow-[0_22px_58px_rgba(26,42,26,0.11)] select-none"
            >
              <div>
                {/* Top Segmented Progress Bar + Circular Close Button */}
                <div className="flex items-center justify-between gap-5">
                  <div
                    className="flex flex-1 items-center gap-2"
                    role="progressbar"
                    aria-label="Quiz progress"
                    aria-valuemin={1}
                    aria-valuemax={questions.length}
                    aria-valuenow={currentIndex + 1}
                  >
                    {questions.map((q, idx) => {
                      const isDone = idx < currentIndex;
                      const isCurrent = idx === currentIndex;
                      return (
                        <div
                          key={q.id}
                          className="h-[3.5px] flex-1 overflow-hidden rounded-full bg-[#D9DDD5]"
                        >
                          <div
                            className="h-full rounded-full bg-[#192D1A] transition-all duration-300"
                            style={{
                              width: isDone
                                ? '100%'
                                : isCurrent
                                ? selectedOption !== undefined
                                  ? '100%'
                                  : '55%'
                                : '0%',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close Smart Quiz"
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#B5B9AF] text-white hover:bg-[#93988D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#192D1A]"
                  >
                    <X className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
                  </button>
                </div>

                {/* Question Number & Prompt */}
                <div className="mt-8">
                  <p className="font-mono text-[11.5px] font-semibold tracking-[0.08em] text-[#283829] tabular-nums">
                    QUESTION {questionCode}
                  </p>
                  <h2 className="mt-3 font-display text-[23px] sm:text-[25px] font-medium leading-[1.28] tracking-[-0.015em] text-[#1A2B1C] [text-wrap:balance]">
                    {currentQuestion.prompt}
                  </h2>
                </div>

                {/* Select Only One + Radio Options */}
                <div className="mt-8">
                  <p className="font-mono text-[10.5px] font-medium tracking-[0.11em] text-[#9BA197]">
                    SELECT ONLY ONE
                  </p>

                  <div
                    role="radiogroup"
                    aria-label={`Options for question ${currentIndex + 1}`}
                    className="mt-4 space-y-2.5"
                  >
                    {currentQuestion.options.map((option, optIdx) => {
                      const isSelected = selectedOption === optIdx;
                      return (
                        <button
                          key={option}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`group flex w-full items-start gap-3.5 rounded-xl px-2.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#192D1A] ${
                            isSelected
                              ? 'bg-[#EEF9E3] text-[#142516]'
                              : 'hover:bg-[#F5F7F2] text-[#1E2E20]'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border-[1.75px] transition-colors ${
                              isSelected
                                ? 'border-[#192D1A] bg-[#192D1A]'
                                : 'border-[#2D3E2E] bg-white group-hover:border-[#192D1A]'
                            }`}
                          >
                            {isSelected && (
                              <span className="h-2 w-2 rounded-full bg-[#B5F480]" />
                            )}
                          </span>
                          <span className="text-[15.5px] font-normal leading-snug">
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Footer: Back (Previous) & Lime Next CTA */}
              <div className="mt-8 flex items-center justify-end gap-5 pt-2">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className={`rounded-xl px-4 py-2.5 text-[14.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#192D1A] ${
                    currentIndex === 0
                      ? 'cursor-not-allowed text-[#9BA298]'
                      : 'text-[#1B2B1C] hover:bg-[#F3F5F0]'
                  }`}
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-xl bg-[#B5F480] hover:bg-[#A3EC67] active:scale-[0.99] px-7 py-3 text-[14.5px] font-semibold text-[#182B19] shadow-[0_3px_12px_rgba(148,226,90,0.28)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#192D1A] whitespace-nowrap"
                >
                  {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </motion.article>
          ) : (
            <motion.article
              key="quiz-results"
              data-testid="smart-quiz-results"
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative z-10 flex w-full min-h-[536px] flex-col justify-between rounded-[28px] bg-white px-8 py-8 shadow-[0_22px_58px_rgba(26,42,26,0.11)]"
            >
              <div>
                {/* Full Completed Progress Bar + Close */}
                <div className="flex items-center justify-between gap-5">
                  <div className="flex flex-1 items-center gap-2" aria-hidden="true">
                    {questions.map((q) => (
                      <div
                        key={q.id}
                        className="h-[3.5px] flex-1 rounded-full bg-[#192D1A]"
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onComplete(scoreSummary.percent);
                      onClose();
                    }}
                    aria-label="Close Smart Quiz results"
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#B5B9AF] text-white hover:bg-[#93988D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#192D1A]"
                  >
                    <X className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
                  </button>
                </div>

                {/* Summary Score Header */}
                <div className="mt-7">
                  <p className="font-mono text-[11.5px] font-semibold tracking-[0.08em] text-[#283829]">
                    QUIZ COMPLETE
                  </p>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="font-display text-[44px] font-bold leading-none tracking-tight text-[#1A2B1C] tabular-nums">
                      {scoreSummary.percent}%
                    </span>
                    <span className="text-[14px] font-medium text-[#556355] tabular-nums">
                      {scoreSummary.correctCount} of {scoreSummary.total} correct
                    </span>
                  </div>
                  <p className="mt-2 text-[13.5px] text-[#556355] leading-relaxed">
                    {scoreSummary.percent >= 80
                      ? `Strong mastery of ${config.topic}. Your streak has been credited.`
                      : `Good run on ${config.topic}. Review the explanations below or swipe back to revisit any card.`}
                  </p>
                </div>

                {/* Toggleable Answer Review */}
                <div className="mt-5">
                  <button
                    type="button"
                    aria-expanded={showReview}
                    onClick={() => setShowReview((v) => !v)}
                    className="text-[12.5px] font-semibold text-[#192D1A] underline underline-offset-4 hover:text-[#355437]"
                  >
                    {showReview ? 'Hide Answer Review' : 'Review Answers'}
                  </button>

                  {showReview && (
                    <div className="mt-3 max-h-[210px] space-y-2.5 overflow-y-auto pr-1 scrollbar-thin">
                      {questions.map((q, idx) => {
                        const res = scoreSummary.results[idx];
                        return (
                          <div
                            key={q.id}
                            className="rounded-xl border border-[#E5E8E0] bg-[#FAFBFA] p-3"
                          >
                            <div className="flex items-center justify-between gap-2 text-[11.5px] font-semibold">
                              <span className="font-mono text-[#4B584C] tabular-nums">
                                Q{String(idx + 1).padStart(2, '0')}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 ${
                                  res.isCorrect ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                {res.isCorrect ? (
                                  <>
                                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>Correct</span>
                                  </>
                                ) : (
                                  <span>Needs review</span>
                                )}
                              </span>
                            </div>
                            <p className="mt-1 text-[12.5px] font-medium text-[#1A2B1C]">
                              {q.prompt}
                            </p>
                            <p className="mt-1 text-[11.5px] text-[#5B685B] leading-snug">
                              {q.explanation}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-7 flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-[#1B2B1C] hover:bg-[#F3F5F0] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-[#4A594B] hover:bg-[#F3F5F0] transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Retake</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onComplete(scoreSummary.percent);
                    onClose();
                  }}
                  className="rounded-xl bg-[#B5F480] hover:bg-[#A3EC67] px-7 py-3 text-[14.5px] font-semibold text-[#182B19] shadow-[0_3px_12px_rgba(148,226,90,0.28)] transition-all whitespace-nowrap"
                >
                  Done
                </button>
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
      {/* Floating Mascot Helper Popup for Smart Quiz */}
      <MascotHelperPopup
        context="quiz"
        subject={config.subject}
        topic={config.topic}
        quizQuestionIndex={currentIndex}
        quizTotalQuestions={questions.length}
        quizPrompt={currentQuestion?.prompt}
        quizExplanation={currentQuestion?.explanation}
        quizCorrectOption={currentQuestion?.options[currentQuestion.correctIndex]}
        quizCompleted={completed}
        quizScorePercent={scoreSummary.percent}
        onNextStep={goNext}
        onPrevStep={goPrev}
        onReviewAnswers={() => setShowReview(true)}
      />
    </div>
  );
};
