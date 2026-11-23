import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Cloud,
  CloudLightning,
  CloudRain,
  Droplets,
  HelpCircle,
  Microscope,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Sun,
  Thermometer,
  Volume2,
  Wind,
  XCircle,
} from 'lucide-react';
import {
  ACTIVITY_1_INITIAL_SHUFFLED,
  KNOWLEDGE_CHECK_QUESTIONS,
  PREDICT_NEXT_CASES,
  REAL_WORLD_SCENARIOS,
  WATER_CYCLE_CHAPTERS,
  WATER_CYCLE_STAGES,
  WEATHER_CONDITIONS,
  WEATHER_DETECTIVE_CASES,
  WEATHER_ELEMENTS,
  computeConnectedWeather,
  evaluatePredictNext,
  evaluateProcessIdentification,
  evaluateWaterCycleOrder,
  evaluateWeatherDetective,
  scoreKnowledgeCheck,
  type PrecipitationForm,
  type WaterCycleChapter,
  type WaterCycleStageId,
  type WeatherConditionId,
  type WeatherElementId,
} from '../utils/waterCycleLogic';
import {
  RealWorldScenarioVisual,
  WaterCycleSceneCanvas,
} from './WaterCycleSceneCanvas';
import { playUiSound } from '../utils/uiSounds';

interface WaterCycleInteractiveStudioProps {
  activeChapterIndex: number;
  completedChapterIds: string[];
  onSelectChapter: (index: number) => void;
  onChapterActivityFeedback: (payload: {
    chapter: WaterCycleChapter;
    isCorrect: boolean;
    studentLabel: string;
    promptForTutor: string;
  }) => void;
  onRequestVoiceExplanation: (spokenText: string) => void;
}

const HOTSPOT_DETAILS: Record<
  'sun' | 'ocean' | 'clouds' | 'river',
  { title: string; observation: string }
> = {
  sun: {
    title: 'The Warm Sun',
    observation:
      'Sunlight warms Earth’s oceans, lakes, and rivers every day — giving water the energy it needs to start its upward journey!',
  },
  ocean: {
    title: 'Vast Ocean Water',
    observation:
      'Most of Earth’s water sits in oceans. Even though it looks still from far away, invisible water is constantly lifting off the warm surface into the air.',
  },
  clouds: {
    title: 'Drifting Clouds',
    observation:
      'High in the cool sky, tiny droplets gather into clouds that winds carry over mountains and towns until water falls back down as rain!',
  },
  river: {
    title: 'Rivers, Trees & Underground',
    observation:
      'Rainwater flows down mountains into streams and rivers, nourishes trees, and soaks into the soil — returning to the ocean so the journey never stops.',
  },
};

export const WaterCycleInteractiveStudio: React.FC<WaterCycleInteractiveStudioProps> = ({
  activeChapterIndex,
  completedChapterIds,
  onSelectChapter,
  onChapterActivityFeedback,
  onRequestVoiceExplanation,
}) => {
  const chapter = WATER_CYCLE_CHAPTERS[activeChapterIndex] ?? WATER_CYCLE_CHAPTERS[0];

  // Chapter 1 state
  const [introPaused, setIntroPaused] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<'sun' | 'ocean' | 'clouds' | 'river'>('sun');
  const [showObjectives, setShowObjectives] = useState(false);

  // Chapter 2 state: Four Stages + Microscopic Zoom + Activity 1 & Activity 4
  const [selectedStageId, setSelectedStageId] = useState<WaterCycleStageId>('evaporation');
  const [showMicroscopic, setShowMicroscopic] = useState(false);
  const [precipForm, setPrecipForm] = useState<PrecipitationForm>('rain');
  const [stageLabTab, setStageLabTab] = useState<'arrange' | 'predict'>('arrange');

  // Activity 1: Arrange the Water Cycle
  const [arrangeOrder, setArrangeOrder] = useState<WaterCycleStageId[]>(ACTIVITY_1_INITIAL_SHUFFLED);
  const [arrangeResult, setArrangeResult] = useState<{
    isCorrect: boolean;
    feedback: string;
  } | null>(null);

  // Activity 4: Predict What Happens Next
  const [predictIndex, setPredictIndex] = useState(0);
  const [predictResults, setPredictResults] = useState<
    Record<string, { chosen: WaterCycleStageId; isCorrect: boolean; feedback: string }>
  >({});

  // Chapter 3 state: Weather Lab + Activity 3 (Weather Detective)
  const [selectedWeather, setSelectedWeather] = useState<WeatherConditionId>('sunny');
  const [detectiveIndex, setDetectiveIndex] = useState(0);
  const [detCondition, setDetCondition] = useState<WeatherConditionId | ''>('');
  const [detElement, setDetElement] = useState<WeatherElementId | ''>('');
  const [detResults, setDetResults] = useState<
    Record<string, { isCorrect: boolean; feedback: string }>
  >({});

  // Chapter 4 state: Connected Water Cycle & Weather Simulator
  const [simSunHeat, setSimSunHeat] = useState<'low' | 'medium' | 'high'>('medium');
  const [simWindSpeed, setSimWindSpeed] = useState<'calm' | 'breezy' | 'strong'>('breezy');
  const simOutput = computeConnectedWeather(simSunHeat, simWindSpeed);

  // Chapter 5 state: Activity 2 (Identify the Process in Real-World Scenarios)
  const [scenarioResults, setScenarioResults] = useState<
    Record<
      string,
      { chosen: 'evaporation' | 'condensation' | 'precipitation'; isCorrect: boolean; feedback: string }
    >
  >({});

  // Chapter 6 state: Knowledge Check (5 Questions)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const quizScore = scoreKnowledgeCheck(quizAnswers);

  const selectedStageInfo =
    WATER_CYCLE_STAGES.find((s) => s.id === selectedStageId) ?? WATER_CYCLE_STAGES[0];
  const selectedWeatherPreset =
    WEATHER_CONDITIONS.find((w) => w.id === selectedWeather) ?? WEATHER_CONDITIONS[0];
  const currentPredictCase = PREDICT_NEXT_CASES[predictIndex] ?? PREDICT_NEXT_CASES[0];
  const currentDetectiveCase = WEATHER_DETECTIVE_CASES[detectiveIndex] ?? WEATHER_DETECTIVE_CASES[0];

  const moveArrangeItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= arrangeOrder.length) return;
    const next = [...arrangeOrder];
    [next[idx], next[target]] = [next[target], next[idx]];
    setArrangeOrder(next);
    setArrangeResult(null);
  };

  const handleCheckArrangeOrder = () => {
    const res = evaluateWaterCycleOrder(arrangeOrder);
    playUiSound(res.isCorrect ? 'success' : 'click');
    setArrangeResult(res);
    onChapterActivityFeedback({
      chapter: WATER_CYCLE_CHAPTERS[1],
      isCorrect: res.isCorrect,
      studentLabel: `Arrange the Water Cycle: ${arrangeOrder.join(' → ')}`,
      promptForTutor: res.isCorrect
        ? `I arranged the four water cycle stages in the right order: Evaporation, Condensation, Precipitation, Collection! Celebrate this and ask me a fun Class 6 question about what drives the cycle.`
        : `I tried arranging the water cycle as ${arrangeOrder.join(', ')} and got ${res.correctPositions} out of 4 in the right place. Help me remember the correct order with a simple tip.`,
    });
  };

  const handlePredictPick = (predicted: WaterCycleStageId) => {
    const res = evaluatePredictNext(currentPredictCase.id, predicted);
    setPredictResults((prev) => ({
      ...prev,
      [currentPredictCase.id]: { chosen: predicted, ...res },
    }));
    onChapterActivityFeedback({
      chapter: WATER_CYCLE_CHAPTERS[1],
      isCorrect: res.isCorrect,
      studentLabel: `Predict Next (after ${currentPredictCase.pausedAtStage}): ${predicted}`,
      promptForTutor: res.isCorrect
        ? `In Predict What Happens Next, the scene paused at ${currentPredictCase.pausedAtStage} and I correctly predicted ${predicted}! Briefly confirm why.`
        : `In Predict What Happens Next, after ${currentPredictCase.pausedAtStage} I guessed ${predicted}, which was not right. Explain gently why ${currentPredictCase.correctNextStage} comes next.`,
    });
  };

  const handleCheckDetective = () => {
    if (!detCondition || !detElement) return;
    const res = evaluateWeatherDetective(currentDetectiveCase.id, detCondition, detElement);
    setDetResults((prev) => ({
      ...prev,
      [currentDetectiveCase.id]: res,
    }));
    onChapterActivityFeedback({
      chapter: WATER_CYCLE_CHAPTERS[2],
      isCorrect: res.isCorrect,
      studentLabel: `Weather Detective (${currentDetectiveCase.clueTitle}): ${detCondition} + ${detElement}`,
      promptForTutor: res.isCorrect
        ? `I solved Weather Detective ${currentDetectiveCase.clueTitle} by identifying ${detCondition} weather and ${detElement}! Give me quick praise.`
        : `In Weather Detective ${currentDetectiveCase.clueTitle}, I guessed ${detCondition} and ${detElement}. Give me a clear Class 6 hint using the clues.`,
    });
  };

  const handleIdentifyRealWorld = (
    scenarioId: string,
    chosen: 'evaporation' | 'condensation' | 'precipitation'
  ) => {
    const res = evaluateProcessIdentification(scenarioId, chosen);
    setScenarioResults((prev) => ({
      ...prev,
      [scenarioId]: { chosen, ...res },
    }));
    const scenario = REAL_WORLD_SCENARIOS.find((s) => s.id === scenarioId);
    onChapterActivityFeedback({
      chapter: WATER_CYCLE_CHAPTERS[4],
      isCorrect: res.isCorrect,
      studentLabel: `${scenario?.title ?? 'Real-World'}: ${chosen}`,
      promptForTutor: res.isCorrect
        ? `For "${scenario?.title}", I correctly identified ${chosen}! Affirm this with a quick everyday connection.`
        : `For "${scenario?.title}", I guessed ${chosen}. Explain simply why it is actually ${scenario?.correctProcess}.`,
    });
  };

  const handleQuizOptionSelect = (questionId: string, optionIdx: number) => {
    const q = KNOWLEDGE_CHECK_QUESTIONS.find((item) => item.id === questionId);
    if (!q) return;
    const nextAnswers = { ...quizAnswers, [questionId]: optionIdx };
    setQuizAnswers(nextAnswers);
    const isCorrect = optionIdx === q.correctIndex;
    playUiSound(isCorrect ? 'success' : 'click');
    const updatedScore = scoreKnowledgeCheck(nextAnswers);
    if (updatedScore.answeredCount === updatedScore.totalQuestions) {
      onChapterActivityFeedback({
        chapter: WATER_CYCLE_CHAPTERS[5],
        isCorrect: updatedScore.correctCount >= 4,
        studentLabel: `Knowledge Check finished: ${updatedScore.correctCount}/${updatedScore.totalQuestions}`,
        promptForTutor: `I just completed the Class 6 Water Cycle & Weather Knowledge Check with ${updatedScore.correctCount} out of ${updatedScore.totalQuestions} correct! Give me encouraging feedback and summarize one key takeaway.`,
      });
    } else if (!isCorrect) {
      onChapterActivityFeedback({
        chapter: WATER_CYCLE_CHAPTERS[5],
        isCorrect: false,
        studentLabel: `Quiz ${q.conceptTag}: selected "${q.options[optionIdx]}"`,
        promptForTutor: `On the quiz question "${q.prompt}", I picked "${q.options[optionIdx]}". Kindly explain why "${q.options[q.correctIndex]}" is the right answer in simple Class 6 words.`,
      });
    }
  };

  const nextChapter = WATER_CYCLE_CHAPTERS[activeChapterIndex + 1];

  return (
    <div
      data-testid="water-cycle-studio"
      className="space-y-4 pb-6"
    >
      {/* TOP SESSION BANNER & 6-CHAPTER STEPPER */}
      <div className="rounded-2xl border border-sky-200/90 bg-white p-4 sm:p-5 shadow-[0_2px_14px_rgba(15,23,42,0.04)] space-y-3.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-[11px] font-bold text-[#0F4D7D]">
                <Droplets className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
                <span>Class 6 Science · Interactive Lab</span>
              </span>
              <span className="text-[11.5px] font-semibold text-slate-500">
                {completedChapterIds.length}/{WATER_CYCLE_CHAPTERS.length} chapters explored
              </span>
            </div>
            <h1 className="mt-1.5 font-display text-[18px] sm:text-[20px] font-bold text-slate-900 leading-snug">
              Water Cycle &amp; Weather
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowObjectives((v) => !v)}
              aria-expanded={showObjectives}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
              <span>{showObjectives ? 'Hide Objectives' : 'Learning Objectives'}</span>
            </button>
            <button
              type="button"
              onClick={() => onRequestVoiceExplanation(chapter.mayaIntroScript)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 text-xs font-semibold text-[#15629E] transition-colors"
            >
              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Hear Maya</span>
            </button>
          </div>
        </div>

        {/* Collapsible Learning Objectives */}
        {showObjectives && (
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 grid sm:grid-cols-2 gap-2 text-[12px] text-slate-800">
            {[
              'Explain what the water cycle is and why it is important.',
              'Understand Evaporation, Condensation, Precipitation, and Collection.',
              'Describe how the Sun drives the water cycle.',
              'Explain how clouds form and why rain occurs.',
              'Connect the water cycle to different weather conditions.',
              'Identify how temperature, humidity, wind, and rainfall shape weather.',
            ].map((obj) => (
              <div key={obj} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </div>
            ))}
          </div>
        )}

        {/* 6 Connected Chapter Tabs with Obsidian/Aceternity spring active indicator */}
        <div
          role="tablist"
          aria-label="Water Cycle learning chapters"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin"
        >
          {WATER_CYCLE_CHAPTERS.map((ch, idx) => {
            const active = idx === activeChapterIndex;
            const completed = completedChapterIds.includes(ch.id);
            return (
              <button
                key={ch.id}
                type="button"
                role="tab"
                aria-selected={active}
                data-testid={`wc-chapter-tab-${ch.id}`}
                onClick={() => {
                  playUiSound('switch');
                  onSelectChapter(idx);
                }}
                className={`bencho-press relative inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold whitespace-nowrap transition-colors shrink-0 border ${
                  active
                    ? 'text-white border-transparent'
                    : completed
                    ? 'bg-emerald-50/80 text-emerald-900 border-emerald-200 hover:bg-emerald-100/70'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="wc-active-chapter"
                    transition={{ type: 'spring', stiffness: 430, damping: 32 }}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-xl bg-[#0B2242] shadow-xs"
                  />
                )}
                {completed && (
                  <CheckCircle2
                    className={`relative z-10 h-3.5 w-3.5 ${active ? 'text-emerald-300' : 'text-emerald-600'}`}
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{ch.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CHAPTER 1: INTRODUCTION — WHERE DOES RAIN COME FROM?                  */}
      {/* ===================================================================== */}
      {chapter.id === 'intro' && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-4">
          <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-sky-50 px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Big Real-World Question
              </p>
              <h2 className="font-display text-[16px] sm:text-[18px] font-bold text-slate-900">
                “{chapter.hookQuestion}”
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIntroPaused((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs"
            >
              {introPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              <span>{introPaused ? 'Resume Animation' : 'Pause Animation'}</span>
            </button>
          </div>

          <p className="text-[13.5px] text-slate-700 leading-relaxed">{chapter.summary}</p>

          {/* Animated Mystery Landscape (click numbered spots to observe!) */}
          <WaterCycleSceneCanvas
            mode="mystery"
            weather="sunny"
            paused={introPaused}
            activeHotspot={activeHotspot}
            onSelectHotspot={setActiveHotspot}
          />

          {/* Interactive Hotspot Observation Card */}
          <div className="grid sm:grid-cols-4 gap-2">
            {(['sun', 'ocean', 'clouds', 'river'] as const).map((spot, idx) => {
              const active = activeHotspot === spot;
              return (
                <button
                  key={spot}
                  type="button"
                  onClick={() => setActiveHotspot(spot)}
                  className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                    active
                      ? 'border-[#15629E] bg-sky-50 text-[#0B2242]'
                      : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {idx + 1}. {HOTSPOT_DETAILS[spot].title}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-sky-200/80 bg-sky-50/60 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5 flex-1 min-w-[220px]">
              <p className="text-[12.5px] font-bold text-[#0F4D7D]">
                Observation: {HOTSPOT_DETAILS[activeHotspot].title}
              </p>
              <p className="text-[13px] text-slate-700 leading-relaxed">
                {HOTSPOT_DETAILS[activeHotspot].observation}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectChapter(1)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#15629E] hover:bg-[#0F4D7D] px-4 py-2.5 text-xs font-bold text-white shadow-xs whitespace-nowrap"
            >
              <span>Discover the 4 Scientific Stages</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CHAPTER 2: UNDERSTANDING THE WATER CYCLE + ACTIVITIES 1 & 4           */}
      {/* ===================================================================== */}
      {chapter.id === 'stages' && (
        <div className="space-y-4">
          {/* Interactive 4-Stage Explorer */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-[17px] font-bold text-slate-900">
                  {chapter.title}
                </h2>
                <p className="text-[12.5px] text-slate-600">
                  Click each stage (A–D) to watch its animation and zoom into microscopic water particles.
                </p>
              </div>

              <button
                type="button"
                data-testid="toggle-microscopic-btn"
                aria-pressed={showMicroscopic}
                onClick={() => setShowMicroscopic((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                  showMicroscopic
                    ? 'border-sky-600 bg-[#0B2242] text-sky-200 shadow-xs'
                    : 'border-sky-200 bg-sky-50 text-[#0F4D7D] hover:bg-sky-100'
                }`}
              >
                <Microscope className="h-4 w-4" aria-hidden="true" />
                <span>{showMicroscopic ? 'Microscopic Zoom: ON' : 'Microscopic Zoom-In'}</span>
              </button>
            </div>

            {/* 4 Stage Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {WATER_CYCLE_STAGES.map((st) => {
                const active = st.id === selectedStageId;
                return (
                  <button
                    key={st.id}
                    type="button"
                    data-testid={`stage-btn-${st.id}`}
                    onClick={() => setSelectedStageId(st.id)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                      active
                        ? 'border-[#15629E] bg-[#15629E] text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`block text-[10.5px] font-bold uppercase tracking-wider ${
                        active ? 'text-sky-200' : 'text-slate-500'
                      }`}
                    >
                      Stage {st.letter}
                    </span>
                    <span className="text-[13.5px] font-bold">{st.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Precipitation Form Picker when on Stage C */}
            {selectedStageId === 'precipitation' && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-2.5">
                <span className="text-xs font-bold text-blue-900">
                  Preview Precipitation Forms:
                </span>
                {(['rain', 'snow', 'hail'] as PrecipitationForm[]).map((form) => (
                  <button
                    key={form}
                    type="button"
                    data-testid={`precip-form-${form}`}
                    onClick={() => setPrecipForm(form)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold capitalize transition-colors ${
                      precipForm === form
                        ? 'bg-[#15629E] text-white'
                        : 'bg-white border border-blue-200 text-blue-900 hover:bg-blue-100'
                    }`}
                  >
                    {form}
                  </button>
                ))}
              </div>
            )}

            {/* Live Stage-Focused Animated Canvas */}
            <WaterCycleSceneCanvas
              mode="stage"
              highlightStage={
                stageLabTab === 'predict'
                  ? currentPredictCase.pausedAtStage
                  : selectedStageId
              }
              precipitationForm={precipForm}
              showMicroscopic={showMicroscopic && stageLabTab !== 'predict'}
              paused={stageLabTab === 'predict'}
            />

            {/* Stage Explanation + Highlighted Scientific Term */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-md bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold text-amber-950">
                    Key Term: {selectedStageInfo.keyTerm}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onRequestVoiceExplanation(
                        `${selectedStageInfo.name}: ${selectedStageInfo.explanation}`
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#15629E] hover:underline"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Listen</span>
                  </button>
                </div>
                <p className="text-[14px] font-bold text-slate-900">
                  {selectedStageInfo.headline}
                </p>
                <p className="text-[13px] text-slate-700 leading-relaxed">
                  {selectedStageInfo.explanation}
                </p>
              </div>

              <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F4D7D]">
                  {selectedStageInfo.microTitle}
                </p>
                <p className="text-[13px] text-slate-800 leading-relaxed">
                  {selectedStageInfo.microExplanation}
                </p>
                <p className="text-[12px] font-semibold text-[#15629E]">
                  Definition: {selectedStageInfo.keyTermDef}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Activities for Chapter 2: Activity 1 (Arrange) & Activity 4 (Predict Next) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="tab-activity-arrange"
                  onClick={() => setStageLabTab('arrange')}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                    stageLabTab === 'arrange'
                      ? 'bg-[#15629E] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Activity 1: Arrange the Water Cycle
                </button>
                <button
                  type="button"
                  data-testid="tab-activity-predict"
                  onClick={() => setStageLabTab('predict')}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                    stageLabTab === 'predict'
                      ? 'bg-[#15629E] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Activity 4: Predict What Happens Next
                </button>
              </div>
            </div>

            {stageLabTab === 'arrange' ? (
              <div className="space-y-3" data-testid="activity-1-panel">
                <p className="text-[13px] text-slate-700">
                  Put the four stages of the water cycle in the exact order starting from the Sun warming ocean water:
                </p>
                <div className="space-y-2">
                  {arrangeOrder.map((stageId, idx) => {
                    const info = WATER_CYCLE_STAGES.find((s) => s.id === stageId)!;
                    return (
                      <div
                        key={stageId}
                        data-testid={`arrange-row-${idx}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B2242] text-xs font-bold text-white tabular-nums">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-bold text-slate-900">{info.name}</p>
                            <p className="text-[11.5px] text-slate-500 truncate">{info.keyTermDef}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveArrangeItem(idx, -1)}
                            aria-label={`Move ${info.name} up`}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-35"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arrangeOrder.length - 1}
                            onClick={() => moveArrangeItem(idx, 1)}
                            aria-label={`Move ${info.name} down`}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-35"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    data-testid="check-arrange-btn"
                    onClick={handleCheckArrangeOrder}
                    className="rounded-xl bg-[#00A859] hover:bg-[#008C4A] px-4 py-2 text-xs font-bold text-white shadow-xs"
                  >
                    Check Order
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setArrangeOrder(ACTIVITY_1_INITIAL_SHUFFLED);
                      setArrangeResult(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Shuffle Again</span>
                  </button>
                </div>

                {arrangeResult && (
                  <div
                    data-testid="arrange-feedback"
                    className={`rounded-xl border px-4 py-3 text-[13px] font-medium flex items-start gap-2.5 ${
                      arrangeResult.isCorrect
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                        : 'border-amber-200 bg-amber-50 text-amber-950'
                    }`}
                  >
                    {arrangeResult.isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <span>{arrangeResult.feedback}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3" data-testid="activity-4-panel">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12.5px] font-bold text-amber-800">
                    The animation above is paused at: <span className="capitalize">{currentPredictCase.pausedAtStage}</span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    {PREDICT_NEXT_CASES.map((pc, idx) => (
                      <button
                        key={pc.id}
                        type="button"
                        onClick={() => setPredictIndex(idx)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                          idx === predictIndex
                            ? 'bg-[#0B2242] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Pause {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-1">
                  <p className="text-[12.5px] text-amber-950">{currentPredictCase.sceneDescription}</p>
                  <p className="text-[14px] font-bold text-slate-900">{currentPredictCase.question}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WATER_CYCLE_STAGES.map((st) => {
                    const attempt = predictResults[currentPredictCase.id];
                    const picked = attempt?.chosen === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        data-testid={`predict-choice-${st.id}`}
                        onClick={() => handlePredictPick(st.id)}
                        className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors ${
                          picked
                            ? attempt.isCorrect
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                              : 'border-amber-500 bg-amber-50 text-amber-900'
                            : 'border-slate-200 bg-white hover:bg-sky-50 text-slate-800'
                        }`}
                      >
                        {st.name}
                      </button>
                    );
                  })}
                </div>

                {predictResults[currentPredictCase.id] && (
                  <div
                    data-testid="predict-feedback"
                    className={`rounded-xl border px-4 py-3 text-[13px] font-medium flex items-start gap-2.5 ${
                      predictResults[currentPredictCase.id].isCorrect
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                        : 'border-amber-200 bg-amber-50 text-amber-950'
                    }`}
                  >
                    {predictResults[currentPredictCase.id].isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <span>{predictResults[currentPredictCase.id].feedback}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CHAPTER 3: WHAT IS WEATHER? + ACTIVITY 3 (WEATHER DETECTIVE)          */}
      {/* ===================================================================== */}
      {chapter.id === 'weather' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#15629E]">
                {chapter.title}
              </p>
              <h2 className="font-display text-[17px] font-bold text-slate-900">
                “{chapter.hookQuestion}”
              </h2>
              <p className="text-[13px] text-slate-600 leading-relaxed">{chapter.summary}</p>
            </div>

            {/* 5 Animated Weather Condition Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {WEATHER_CONDITIONS.map((wc) => {
                const active = wc.id === selectedWeather;
                const Icon =
                  wc.id === 'sunny'
                    ? Sun
                    : wc.id === 'cloudy'
                    ? Cloud
                    : wc.id === 'rainy'
                    ? CloudRain
                    : wc.id === 'windy'
                    ? Wind
                    : CloudLightning;
                return (
                  <button
                    key={wc.id}
                    type="button"
                    data-testid={`weather-preset-${wc.id}`}
                    onClick={() => setSelectedWeather(wc.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                      active
                        ? 'border-[#15629E] bg-[#15629E] text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{wc.label}</span>
                  </button>
                );
              })}
            </div>

            <WaterCycleSceneCanvas mode="weather" weather={selectedWeather} />

            <p className="rounded-xl bg-sky-50/70 border border-sky-200/80 px-4 py-2.5 text-[13px] font-medium text-slate-800">
              <strong className="text-[#0F4D7D]">{selectedWeatherPreset.label} Weather:</strong>{' '}
              {selectedWeatherPreset.description}
            </p>

            {/* 5 Weather Elements Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {WEATHER_ELEMENTS.map((el) => {
                const highlighted = selectedWeatherPreset.primaryElements.includes(el.id);
                const liveValue =
                  el.id === 'temperature'
                    ? `${selectedWeatherPreset.temperatureC}°C`
                    : el.id === 'humidity'
                    ? `${selectedWeatherPreset.humidityPct}%`
                    : el.id === 'wind'
                    ? `${selectedWeatherPreset.windKmh} km/h`
                    : el.id === 'cloud-cover'
                    ? `${selectedWeatherPreset.cloudCoverPct}%`
                    : selectedWeatherPreset.precipitationLabel;
                return (
                  <div
                    key={el.id}
                    className={`rounded-xl border p-3 space-y-1 ${
                      highlighted
                        ? 'border-sky-300 bg-sky-50/70 shadow-2xs'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className="text-[11px] font-bold text-slate-500">{el.name}</p>
                    <p className="text-[14px] font-extrabold text-slate-900 tabular-nums">
                      {liveValue}
                    </p>
                    <p className="text-[11px] text-slate-600 leading-snug">{el.meaning}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity 3: Weather Detective */}
          <div
            data-testid="activity-3-detective"
            className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Activity 3 · Interactive Investigation
                </p>
                <h3 className="font-display text-[16px] font-bold text-slate-900">
                  Weather Detective — {currentDetectiveCase.clueTitle}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {WEATHER_DETECTIVE_CASES.map((dc, idx) => (
                  <button
                    key={dc.id}
                    type="button"
                    onClick={() => {
                      setDetectiveIndex(idx);
                      setDetCondition('');
                      setDetElement('');
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                      idx === detectiveIndex
                        ? 'bg-[#0B2242] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Case {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <ul className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 space-y-1.5 text-[13px] text-slate-800">
              {currentDetectiveCase.clues.map((clue) => (
                <li key={clue} className="flex items-start gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-1" />
                  <span>{clue}</span>
                </li>
              ))}
            </ul>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800">
                  1. Which weather condition matches these clues?
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {WEATHER_CONDITIONS.map((wc) => (
                    <button
                      key={wc.id}
                      type="button"
                      data-testid={`det-cond-${wc.id}`}
                      onClick={() => setDetCondition(wc.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        detCondition === wc.id
                          ? 'border-[#15629E] bg-[#15629E] text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {wc.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800">
                  2. Which weather element is mainly responsible?
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {WEATHER_ELEMENTS.map((el) => (
                    <button
                      key={el.id}
                      type="button"
                      data-testid={`det-elem-${el.id}`}
                      onClick={() => setDetElement(el.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        detElement === el.id
                          ? 'border-[#15629E] bg-[#15629E] text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {el.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              data-testid="check-detective-btn"
              disabled={!detCondition || !detElement}
              onClick={handleCheckDetective}
              className="rounded-xl bg-[#00A859] hover:bg-[#008C4A] disabled:opacity-45 px-4 py-2 text-xs font-bold text-white shadow-xs"
            >
              Check Investigation
            </button>

            {detResults[currentDetectiveCase.id] && (
              <div
                data-testid="detective-feedback"
                className={`rounded-xl border px-4 py-3 text-[13px] font-medium flex items-start gap-2.5 ${
                  detResults[currentDetectiveCase.id].isCorrect
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                    : 'border-amber-200 bg-amber-50 text-amber-950'
                }`}
              >
                {detResults[currentDetectiveCase.id].isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{detResults[currentDetectiveCase.id].feedback}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CHAPTER 4: HOW ARE THE WATER CYCLE AND WEATHER CONNECTED?             */}
      {/* ===================================================================== */}
      {chapter.id === 'connection' && (
        <div
          data-testid="connection-simulator"
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-4"
        >
          <div className="space-y-1">
            <h2 className="font-display text-[17px] font-bold text-slate-900">
              {chapter.title}
            </h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">{chapter.summary}</p>
          </div>

          {/* Interactive Sun Heat & Wind Speed Controls */}
          <div className="grid sm:grid-cols-2 gap-3 rounded-xl border border-sky-200/80 bg-sky-50/50 p-4">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Sun className="h-4 w-4 text-amber-500" />
                <span>Sun Heat Intensity (Drives Evaporation)</span>
              </p>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    data-testid={`sim-sun-${lvl}`}
                    onClick={() => setSimSunHeat(lvl)}
                    className={`flex-1 rounded-xl border py-2 text-xs font-bold capitalize transition-colors ${
                      simSunHeat === lvl
                        ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Wind className="h-4 w-4 text-sky-600" />
                <span>Wind Speed (Moves Clouds &amp; Air)</span>
              </p>
              <div className="flex gap-2">
                {(['calm', 'breezy', 'strong'] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    data-testid={`sim-wind-${spd}`}
                    onClick={() => setSimWindSpeed(spd)}
                    className={`flex-1 rounded-xl border py-2 text-xs font-bold capitalize transition-colors ${
                      simWindSpeed === spd
                        ? 'border-[#15629E] bg-[#15629E] text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-sky-50'
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Connected Simulation Landscape */}
          <WaterCycleSceneCanvas
            mode="connection"
            weather={simOutput.condition}
            sunHeat={simSunHeat}
            windSpeed={simWindSpeed}
          />

          {/* Live Resulting Weather Readouts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { label: 'Resulting Weather', value: simOutput.label, testId: 'sim-result-label' },
              { label: 'Evaporation', value: simOutput.evaporationRate },
              { label: 'Temperature', value: `${simOutput.temperatureC}°C` },
              { label: 'Humidity', value: `${simOutput.humidityPct}%` },
              { label: 'Cloud Cover', value: `${simOutput.cloudCoverPct}%` },
              { label: 'Precipitation', value: simOutput.precipitationForm },
            ].map((stat) => (
              <div
                key={stat.label}
                data-testid={stat.testId}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
              >
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-[13px] font-extrabold text-slate-900 leading-tight">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Cause & Effect Explanation Banner */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1 flex-1 min-w-[240px]">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <Thermometer className="h-3.5 w-3.5" />
                <span>How the Water Cycle Created This Weather:</span>
              </p>
              <p className="text-[13px] text-slate-800 leading-relaxed">{simOutput.explanation}</p>
            </div>
            <button
              type="button"
              onClick={() =>
                onChapterActivityFeedback({
                  chapter,
                  isCorrect: true,
                  studentLabel: `Simulated Sun=${simSunHeat}, Wind=${simWindSpeed} → ${simOutput.label}`,
                  promptForTutor: `In the Water Cycle and Weather simulator, I set Sun Heat to ${simSunHeat} and Wind Speed to ${simWindSpeed}, creating "${simOutput.label}" (${simOutput.humidityPct}% humidity, ${simOutput.cloudCoverPct}% clouds). Explain in simple Class 6 language why this combination causes that weather!`,
                })
              }
              className="rounded-xl bg-[#15629E] hover:bg-[#0F4D7D] px-3.5 py-2 text-xs font-bold text-white whitespace-nowrap"
            >
              Ask Maya Why
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CHAPTER 5: REAL-WORLD APPLICATION + ACTIVITY 2 (IDENTIFY THE PROCESS) */}
      {/* ===================================================================== */}
      {chapter.id === 'real-world' && (
        <div
          data-testid="activity-2-real-world"
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Activity 2 · Identify the Process
              </p>
              <h2 className="font-display text-[17px] font-bold text-slate-900">
                {chapter.title}
              </h2>
              <p className="text-[13px] text-slate-600">{chapter.summary}</p>
            </div>
            <span className="rounded-xl bg-sky-50 border border-sky-200 px-3 py-1.5 text-xs font-bold text-[#0F4D7D] tabular-nums">
              {Object.values(scenarioResults).filter((r) => r.isCorrect).length} / 3 Correct
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {REAL_WORLD_SCENARIOS.map((sc) => {
              const attempt = scenarioResults[sc.id];
              return (
                <div
                  key={sc.id}
                  data-testid={`scenario-card-${sc.id}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    <RealWorldScenarioVisual visualType={sc.visualType} />
                    <h3 className="text-[14px] font-bold text-slate-900">{sc.title}</h3>
                    <p className="text-[12.5px] text-slate-700 leading-relaxed">{sc.story}</p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Which process is this?
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {(['evaporation', 'condensation', 'precipitation'] as const).map((proc) => {
                        const chosen = attempt?.chosen === proc;
                        return (
                          <button
                            key={proc}
                            type="button"
                            data-testid={`scenario-${sc.id}-pick-${proc}`}
                            onClick={() => handleIdentifyRealWorld(sc.id, proc)}
                            className={`rounded-xl border px-3 py-2 text-xs font-bold capitalize transition-colors ${
                              chosen
                                ? attempt.isCorrect
                                  ? 'border-emerald-500 bg-emerald-600 text-white'
                                  : 'border-amber-500 bg-amber-500 text-white'
                                : 'border-slate-200 bg-white hover:bg-sky-50 text-slate-800'
                            }`}
                          >
                            {proc}
                          </button>
                        );
                      })}
                    </div>

                    {attempt && (
                      <div
                        data-testid={`scenario-feedback-${sc.id}`}
                        className={`rounded-xl border p-2.5 text-[12px] leading-snug ${
                          attempt.isCorrect
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                            : 'border-amber-200 bg-amber-50 text-amber-950'
                        }`}
                      >
                        {attempt.feedback}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CHAPTER 6: KNOWLEDGE CHECK (5 CLASS 6 QUESTIONS)                      */}
      {/* ===================================================================== */}
      {chapter.id === 'knowledge-check' && (
        <div
          data-testid="water-cycle-knowledge-check"
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div>
              <h2 className="font-display text-[17px] font-bold text-slate-900">
                {chapter.title}
              </h2>
              <p className="text-[12.5px] text-slate-600">{chapter.summary}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                data-testid="wc-quiz-score"
                className="rounded-xl bg-[#0B2242] px-3.5 py-1.5 text-xs font-bold text-white tabular-nums"
              >
                Score: {quizScore.correctCount} / {quizScore.totalQuestions}
              </span>
              {quizScore.answeredCount > 0 && (
                <button
                  type="button"
                  onClick={() => setQuizAnswers({})}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {KNOWLEDGE_CHECK_QUESTIONS.map((q, qIdx) => {
              const selected = quizAnswers[q.id];
              const isAnswered = typeof selected === 'number';
              const isCorrect = selected === q.correctIndex;
              return (
                <div
                  key={q.id}
                  data-testid={`wc-quiz-card-${q.id}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-[#0F4D7D]">
                      Q{qIdx + 1} · {q.conceptTag}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onRequestVoiceExplanation(
                          `Question ${qIdx + 1}: ${q.prompt} ${
                            isAnswered ? q.explanation : 'Think carefully about what we saw in the animated landscape!'
                          }`
                        )
                      }
                      className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#15629E] hover:underline"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Hear Hint</span>
                    </button>
                  </div>

                  <p className="text-[14px] font-bold text-slate-900 leading-snug">{q.prompt}</p>

                  <div className="grid sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const picked = selected === optIdx;
                      const showRight = isAnswered && optIdx === q.correctIndex;
                      const showWrong = picked && !isCorrect;
                      return (
                        <button
                          key={opt}
                          type="button"
                          data-testid={`wc-quiz-${q.id}-opt-${optIdx}`}
                          onClick={() => handleQuizOptionSelect(q.id, optIdx)}
                          className={`rounded-xl border px-3.5 py-2.5 text-left text-[12.5px] font-medium transition-all ${
                            showRight
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                              : showWrong
                              ? 'border-rose-400 bg-rose-50 text-rose-900'
                              : 'border-slate-200 bg-white hover:border-[#15629E] hover:bg-sky-50/40 text-slate-800'
                          }`}
                        >
                          <span className="font-bold mr-1.5 text-slate-500">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div
                      className={`rounded-xl border px-3.5 py-2.5 text-[12.5px] leading-relaxed flex items-start gap-2 ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                          : 'border-amber-200 bg-amber-50 text-amber-950'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <span>
                        <strong>{isCorrect ? 'Correct! ' : 'Not quite — '}</strong>
                        {q.explanation}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {quizScore.answeredCount === quizScore.totalQuestions && (
            <div
              data-testid="wc-quiz-complete-banner"
              className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-sky-50 p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-[15px] font-bold text-emerald-950">
                  Knowledge Check Complete — {quizScore.correctCount}/{quizScore.totalQuestions} ({quizScore.percent}%)
                </p>
                <p className="text-[12.5px] text-slate-700">
                  {quizScore.correctCount >= 4
                    ? 'Fantastic Class 6 Science work! You clearly understand how the Sun, water cycle, and weather work together.'
                    : 'Great effort! Review the highlighted explanations above or ask Maya to walk through any stage again.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectChapter(0)}
                className="rounded-xl bg-[#0B2242] hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white"
              >
                Revisit Animated Valley
              </button>
            </div>
          )}
        </div>
      )}

      {/* FOOTER NEXT CHAPTER BAR */}
      {nextChapter && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            data-testid="wc-next-chapter-btn"
            onClick={() => onSelectChapter(activeChapterIndex + 1)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#15629E] hover:bg-[#0F4D7D] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
          >
            <span>Next: {nextChapter.shortTitle}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
