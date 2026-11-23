import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Compass,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Send,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {
  MASCOT_CHARACTERS,
  buildMascotTips,
  getAlternateMascot,
  getDefaultMascotForContext,
  type MascotActionSuggestion,
  type MascotCharacterId,
  type MascotContextInput,
  type MascotTipTab,
} from '../utils/mascotHelperLogic';
import { playUiSound } from '../utils/uiSounds';

interface MascotHelperPopupProps extends MascotContextInput {
  /** Lift collapsed trigger button higher when bottom Voice Interaction Dock is open */
  liftForVoiceDock?: boolean;
  /** Optional custom bottom/left positioning override for the collapsed trigger */
  positionClassName?: string;
  /** Start expanded on entry (default true) */
  defaultOpen?: boolean;
  /** Callback to send a prompt directly to Maya in Session / Solution Session */
  onAskTutor?: (prompt: string) => void;
  /** Callback to speak the current hint aloud */
  onSpeakHint?: (text: string) => void;
  /** Quiz navigation callbacks */
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onReviewAnswers?: () => void;
}

const TAB_ITEMS: {
  id: MascotTipTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'hint', label: 'Hint', icon: Lightbulb },
  { id: 'next', label: 'What to do', icon: Compass },
  { id: 'help', label: 'Ask help', icon: HelpCircle },
];

export const MascotHelperPopup: React.FC<MascotHelperPopupProps> = ({
  context,
  subject,
  topic,
  isWaterCycle,
  waterCycleChapterTitle,
  isAngles,
  anglesStageTitle,
  quizQuestionIndex,
  quizTotalQuestions,
  quizPrompt,
  quizExplanation,
  quizCorrectOption,
  quizCompleted,
  quizScorePercent,
  problemText,
  problemFileName,
  liftForVoiceDock = false,
  positionClassName,
  defaultOpen = true,
  onAskTutor,
  onSpeakHint,
  onNextStep,
  onPrevStep,
  onReviewAnswers,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [activeTab, setActiveTab] = useState<MascotTipTab>('hint');
  const [characterId, setCharacterId] = useState<MascotCharacterId>(() =>
    getDefaultMascotForContext(context)
  );
  const [quickQuestion, setQuickQuestion] = useState('');
  const [nudgeBadge, setNudgeBadge] = useState(false);

  const character = MASCOT_CHARACTERS[characterId];

  const tips = useMemo(
    () =>
      buildMascotTips({
        context,
        subject,
        topic,
        isWaterCycle,
        waterCycleChapterTitle,
        isAngles,
        anglesStageTitle,
        quizQuestionIndex,
        quizTotalQuestions,
        quizPrompt,
        quizExplanation,
        quizCorrectOption,
        quizCompleted,
        quizScorePercent,
        problemText,
        problemFileName,
      }),
    [
      context,
      subject,
      topic,
      isWaterCycle,
      waterCycleChapterTitle,
      isAngles,
      anglesStageTitle,
      quizQuestionIndex,
      quizTotalQuestions,
      quizPrompt,
      quizExplanation,
      quizCorrectOption,
      quizCompleted,
      quizScorePercent,
      problemText,
      problemFileName,
    ]
  );

  // Subtle notification dot when moving to a new quiz card or chapter while collapsed
  useEffect(() => {
    if (!isOpen) {
      setNudgeBadge(true);
    }
  }, [quizQuestionIndex, waterCycleChapterTitle, anglesStageTitle, isOpen]);

  // Allow dismissing spotlight dialogue with Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen]);

  const handleOpen = () => {
    playUiSound('pop');
    setNudgeBadge(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    playUiSound('subtle');
    setIsOpen(false);
  };

  const handleSwapCharacter = () => {
    playUiSound('switch');
    setCharacterId((curr) => getAlternateMascot(curr));
  };

  const handleActionClick = (action: MascotActionSuggestion) => {
    playUiSound('click');
    if (action.actionKind === 'ask_tutor' && action.prompt && onAskTutor) {
      onAskTutor(action.prompt);
      setIsOpen(false);
      return;
    }
    if (action.actionKind === 'speak_hint' && onSpeakHint) {
      onSpeakHint(`${tips.hintText} ${tips.nextStepText}`);
      return;
    }
    if (action.actionKind === 'next_step' && onNextStep) {
      onNextStep();
      setIsOpen(false);
      return;
    }
    if (action.actionKind === 'prev_step' && onPrevStep) {
      onPrevStep();
      setIsOpen(false);
      return;
    }
    if (action.actionKind === 'review_answers' && onReviewAnswers) {
      onReviewAnswers();
      setIsOpen(false);
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickQuestion.trim();
    if (!trimmed || !onAskTutor) return;
    playUiSound('pop');
    onAskTutor(trimmed);
    setQuickQuestion('');
    setIsOpen(false);
  };

  const resolvedTriggerPosition =
    positionClassName ??
    (liftForVoiceDock
      ? 'fixed bottom-[126px] left-4 sm:left-5 z-40'
      : 'fixed bottom-4 left-4 sm:bottom-5 sm:left-5 z-40');

  const contextLabel =
    context === 'solution'
      ? 'Solution Coach'
      : context === 'quiz'
      ? 'Quiz Helper'
      : 'Session Helper';

  const activeBodyText =
    activeTab === 'hint'
      ? tips.hintText
      : activeTab === 'next'
      ? tips.nextStepText
      : tips.helpIntro;

  return (
    <div data-testid="mascot-helper-root" data-context={context}>
      <AnimatePresence mode="wait">
        {isOpen ? (
          /* FULL-SCREEN GAME-STYLE CHARACTER SPOTLIGHT DIALOGUE POPUP (matches reference) */
          <motion.div
            key="mascot-spotlight-overlay"
            data-testid="mascot-helper-popup"
            role="dialog"
            aria-modal="false"
            aria-label={`${character.name} ${contextLabel} popup`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex items-end justify-start overflow-hidden"
          >
            {/* Dimmed spotlight backdrop — crisp dark tint matching reference (no heavy blur) */}
            <div
              data-testid="mascot-spotlight-backdrop"
              onClick={handleClose}
              aria-hidden="true"
              className="absolute inset-0 bg-slate-950/60 cursor-pointer"
            />

            {/* Spotlight Stage: Left-Aligned Standing Mascot (Bottom-Left) + Comic Speech Bubble */}
            <div className="pointer-events-none relative z-10 flex w-full flex-col sm:flex-row items-start sm:items-end justify-start pl-2 sm:pl-4 md:pl-5 pr-4 pt-10">
              {/* Large Standing Character anchored flush to the bottom-left edge */}
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 48, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 36, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                className="pointer-events-none relative z-20 shrink-0 -mb-2 sm:-mb-3 ml-0 order-2 sm:order-1"
              >
                {/* Soft lightweight warm spotlight halo behind mascot */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-4 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 55%, rgba(251, 191, 36, 0.22), transparent 68%)',
                  }}
                />
                <img
                  src={character.imageSrc}
                  alt={character.alt}
                  data-testid="mascot-helper-image"
                  className="relative h-[220px] sm:h-[330px] md:h-[380px] w-auto max-w-[240px] sm:max-w-[360px] object-contain object-bottom select-none"
                />
              </motion.div>

              {/* Crisp Rounded White Speech Bubble with Sharp Bottom-Left Tail pointing to Mascot */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 380, damping: 27, delay: 0.04 }}
                className="pointer-events-auto relative z-30 order-1 sm:order-2 mb-4 sm:mb-[200px] md:mb-[235px] sm:-ml-6 w-full max-w-[430px]"
              >
                <div className="relative rounded-[28px] bg-white px-6 sm:px-7 pt-5 pb-5 shadow-[0_24px_60px_rgba(0,0,0,0.34)]">
                  {/* Sharp comic speech-bubble tail pointing down-left toward mascot */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 46 34"
                    className="hidden sm:block pointer-events-none absolute -bottom-[24px] left-[22px] h-[30px] w-[42px] text-white"
                    fill="currentColor"
                  >
                    <path d="M8 0 L44 0 L0 32 Z" />
                  </svg>
                  {/* Mobile downward tail */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 36 24"
                    className="sm:hidden pointer-events-none absolute -bottom-[18px] left-[72px] h-[22px] w-[32px] text-white"
                    fill="currentColor"
                  >
                    <path d="M4 0 L34 0 L12 24 Z" />
                  </svg>

                  {/* Top Utility Strip: Mascot tag + Swap Character + Close */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-bold text-[#A63D17]">
                      <span>{character.name}</span>
                      <span aria-hidden="true" className="text-amber-400">·</span>
                      <span className="font-semibold text-amber-800">{contextLabel}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        data-testid="mascot-swap-button"
                        onClick={handleSwapCharacter}
                        aria-label={`Switch mascot to ${MASCOT_CHARACTERS[getAlternateMascot(characterId)].name}`}
                        title={`Switch to ${MASCOT_CHARACTERS[getAlternateMascot(characterId)].name}`}
                        className="bencho-press inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-[#A63D17] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
                      >
                        <RefreshCw className="h-3 w-3" aria-hidden="true" />
                        <span>{MASCOT_CHARACTERS[getAlternateMascot(characterId)].name}</span>
                      </button>
                      <button
                        type="button"
                        data-testid="mascot-minimize-button"
                        onClick={handleClose}
                        aria-label="Minimize mascot helper"
                        title="Dismiss popup"
                        className="bencho-press inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Bold Warm Centered Game-Dialogue Headline (matching reference terracotta tone) */}
                  <h2 className="font-display text-center text-[21px] sm:text-[23px] font-extrabold leading-[1.24] tracking-tight text-[#A63D17] [text-wrap:balance]">
                    {tips.headline}
                  </h2>

                  {/* Speech Message Body */}
                  <p className="mt-2.5 text-center text-[14px] sm:text-[14.5px] font-medium leading-relaxed text-slate-700">
                    {activeBodyText}
                  </p>

                  {/* Segmented Mode Switcher: Hint | What to do | Ask help */}
                  <div
                    role="tablist"
                    aria-label="Mascot assistance modes"
                    className="mt-4 grid grid-cols-3 gap-1 rounded-full bg-slate-100 p-1"
                  >
                    {TAB_ITEMS.map((tab) => {
                      const Icon = tab.icon;
                      const active = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          data-testid={`mascot-tab-${tab.id}`}
                          onClick={() => {
                            playUiSound('switch');
                            setActiveTab(tab.id);
                          }}
                          className={`relative flex items-center justify-center gap-1.5 rounded-full py-1.5 px-2 text-[11.5px] font-bold transition-colors whitespace-nowrap ${
                            active ? 'text-[#A63D17]' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId={`mascot-bubble-tab-${context}`}
                              transition={{ type: 'spring', stiffness: 460, damping: 32 }}
                              aria-hidden="true"
                              className="absolute inset-0 rounded-full bg-white shadow-xs"
                            />
                          )}
                          <Icon
                            className={`relative z-10 h-3.5 w-3.5 shrink-0 ${
                              active ? 'text-[#F39200]' : 'text-slate-500'
                            }`}
                            aria-hidden="true"
                          />
                          <span className="relative z-10">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive Suggestions & Actions */}
                  <div className="mt-3.5 space-y-2.5">
                    {activeTab === 'hint' && onSpeakHint && (
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            playUiSound('click');
                            onSpeakHint(tips.hintText);
                          }}
                          className="bencho-press inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50/80 hover:bg-sky-100 px-3.5 py-1.5 text-[12px] font-semibold text-[#15629E] transition-colors"
                        >
                          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Hear {character.name} read this hint</span>
                        </button>
                      </div>
                    )}

                    {(activeTab === 'next' || activeTab === 'help') && tips.actions.length > 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {tips.actions.map((act) => (
                          <button
                            key={act.id}
                            type="button"
                            onClick={() => handleActionClick(act)}
                            className="bencho-press inline-flex items-center gap-1.5 rounded-full border border-amber-300/90 bg-[#FFF9F0] hover:bg-amber-100/80 px-3.5 py-1.5 text-[12px] font-bold text-[#9A3412] transition-colors"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-[#F39200] shrink-0" aria-hidden="true" />
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {activeTab === 'help' && onAskTutor && (
                      <form onSubmit={handleQuickSubmit} className="flex items-center gap-2 pt-0.5">
                        <label htmlFor={`mascot-quick-ask-${context}`} className="sr-only">
                          Ask {character.name} for help
                        </label>
                        <input
                          id={`mascot-quick-ask-${context}`}
                          type="text"
                          value={quickQuestion}
                          onChange={(e) => setQuickQuestion(e.target.value)}
                          placeholder={`Ask ${character.name} a quick question…`}
                          className="flex-1 min-w-0 rounded-full border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:border-[#15629E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15629E]/20"
                        />
                        <button
                          type="submit"
                          disabled={!quickQuestion.trim()}
                          aria-label="Send quick help question"
                          className="bencho-press inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F39200] hover:bg-[#DF8500] disabled:opacity-45 text-white shadow-sm transition-colors"
                        >
                          <Send className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </form>
                    )}

                    {/* Primary Got It / Continue CTA */}
                    <div className="flex items-center justify-center pt-1">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="bencho-press rounded-full bg-[#15629E] hover:bg-[#114F80] px-6 py-2 text-[12.5px] font-bold text-white shadow-[0_6px_16px_rgba(21,98,158,0.28)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] focus-visible:ring-offset-2"
                      >
                        Got it, continue!
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* COMPACT FLOATING MASCOT TRIGGER WHEN DISMISSED */
          <div className={`${resolvedTriggerPosition} pointer-events-none select-none`}>
            <motion.button
              key="mascot-collapsed"
              type="button"
              data-testid="mascot-helper-trigger"
              onClick={handleOpen}
              initial={{ opacity: 0, scale: 0.88, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 10 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              aria-label={`Open ${character.name} ${contextLabel} for hints and help`}
              className="pointer-events-auto group relative flex items-center gap-2.5 rounded-full border-2 border-[#F5A623] bg-white pl-1.5 pr-4 py-1.5 shadow-[0_10px_28px_rgba(11,34,66,0.2)] hover:shadow-[0_14px_34px_rgba(11,34,66,0.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
            >
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-visible rounded-full bg-gradient-to-br from-amber-100 to-sky-100">
                <img
                  src={character.imageSrc}
                  alt=""
                  aria-hidden="true"
                  className="h-12 w-12 -mt-1 object-contain transition-transform duration-150 group-hover:scale-105"
                />
                {nudgeBadge && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#F39200] ring-2 ring-white"
                  />
                )}
              </span>
              <span className="text-left leading-tight">
                <span className="block font-display text-[12.5px] font-bold text-slate-900 whitespace-nowrap">
                  Need a hint?
                </span>
                <span className="block text-[10.5px] font-medium text-[#15629E] whitespace-nowrap">
                  Ask {character.name}
                </span>
              </span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
