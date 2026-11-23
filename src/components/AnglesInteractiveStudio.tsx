import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Compass,
  HelpCircle,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import {
  CLASS_5_ANGLES_STAGES,
  classifyAngle,
  computeProtractorAngle,
  evaluateDrawnAngle,
  type AngleCategory,
  type AngleDiagramOption,
  type AngleEvaluation,
  type AngleLessonStage,
} from '../utils/anglesLogic';

interface AnglesInteractiveStudioProps {
  activeStageIndex: number;
  completedStageIds: string[];
  onSelectStage: (index: number) => void;
  onAngleChange: (degrees: number) => void;
  onStageEvaluated: (payload: {
    stage: AngleLessonStage;
    isCorrect: boolean;
    studentLabel: string;
    voicePromptForTutor: string;
    spokenFallbackSummary: string;
  }) => void;
  onRequestVoiceExplanation: (text: string) => void;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  };
}

function describeSectorPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const span = Math.abs(endDeg - startDeg);
  const largeArc = span > 180 ? 1 : 0;
  const sweepFlag = endDeg >= startDeg ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${end.x} ${end.y} Z`;
}

function getCategoryStyle(category: AngleCategory) {
  switch (category) {
    case 'Acute':
      return {
        fill: 'rgba(16, 185, 129, 0.22)',
        stroke: '#059669',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    case 'Right':
      return {
        fill: 'rgba(29, 78, 216, 0.18)',
        stroke: '#1D4ED8',
        badge: 'bg-blue-50 text-blue-800 border-blue-200',
      };
    case 'Obtuse':
      return {
        fill: 'rgba(217, 119, 6, 0.20)',
        stroke: '#D97706',
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    case 'Straight':
      return {
        fill: 'rgba(124, 58, 237, 0.16)',
        stroke: '#7C3AED',
        badge: 'bg-purple-50 text-purple-800 border-purple-200',
      };
    default:
      return {
        fill: 'rgba(100, 116, 139, 0.16)',
        stroke: '#475569',
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
      };
  }
}

/** Compact SVG mini-diagram for Wrong vs. Correct visual comparison */
const MiniAngleComparisonDiagram: React.FC<{
  degrees: number;
  title: string;
  caption: string;
  tone: 'wrong' | 'correct';
}> = ({ degrees, title, caption, tone }) => {
  const cx = 105;
  const cy = 112;
  const rayLen = 76;
  const arcR = 34;
  const endPt = polarToCartesian(cx, cy, rayLen, degrees);
  const strokeColor = tone === 'correct' ? '#059669' : '#DC2626';
  const fillColor = tone === 'correct' ? 'rgba(16,185,129,0.22)' : 'rgba(220,38,38,0.16)';
  const labelPt = polarToCartesian(cx, cy, arcR + 18, Math.max(16, degrees / 2));

  return (
    <div
      className={`rounded-xl border p-3 ${
        tone === 'correct'
          ? 'border-emerald-200 bg-emerald-50/40'
          : 'border-rose-200 bg-rose-50/40'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span
          className={`text-[11px] font-bold uppercase tracking-wide ${
            tone === 'correct' ? 'text-emerald-800' : 'text-rose-800'
          }`}
        >
          {title}
        </span>
        <span className="font-mono text-[11px] font-bold text-slate-800 tabular-nums">
          {degrees}°
        </span>
      </div>
      <svg
        viewBox="0 0 210 132"
        className="w-full h-[116px]"
        role="img"
        aria-label={`${title}: ${degrees} degrees angle diagram`}
      >
        {/* Faint reference 90-degree L guide */}
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - rayLen}
          stroke="#CBD5E1"
          strokeWidth="1.25"
          strokeDasharray="3 3"
        />
        {/* Shaded sector */}
        {degrees > 0 && (
          <path d={describeSectorPath(cx, cy, arcR, 0, degrees)} fill={fillColor} />
        )}
        {/* Right-angle square marker when 90 */}
        {degrees === 90 && (
          <rect
            x={cx}
            y={cy - 18}
            width={18}
            height={18}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
          />
        )}
        {/* Base ray (0 deg) */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + rayLen}
          y2={cy}
          stroke="#0F172A"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        {/* Second ray */}
        <line
          x1={cx}
          y1={cy}
          x2={endPt.x}
          y2={endPt.y}
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Vertex dot */}
        <circle cx={cx} cy={cy} r="4.5" fill="#0F172A" />
        {/* Degree label */}
        <text
          x={labelPt.x}
          y={labelPt.y}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={strokeColor}
          fontFamily="monospace"
        >
          {degrees}°
        </text>
      </svg>
      <p className="mt-1 text-[11.5px] text-slate-700 leading-snug">{caption}</p>
    </div>
  );
};

export const AnglesInteractiveStudio: React.FC<AnglesInteractiveStudioProps> = ({
  activeStageIndex,
  completedStageIds,
  onSelectStage,
  onAngleChange,
  onStageEvaluated,
  onRequestVoiceExplanation,
}) => {
  const stage = CLASS_5_ANGLES_STAGES[activeStageIndex] ?? CLASS_5_ANGLES_STAGES[0];

  const [drawnDegrees, setDrawnDegrees] = useState<number>(stage.initialDegrees ?? 115);
  const [showHint, setShowHint] = useState(false);
  const [drawResult, setDrawResult] = useState<AngleEvaluation | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Reset per-stage interactive state cleanly after stage switch (never during render)
  useEffect(() => {
    const initDeg = stage.initialDegrees ?? 60;
    setDrawnDegrees(initDeg);
    setShowHint(false);
    setDrawResult(null);
    setSelectedOptionId(null);
    onAngleChange(initDeg);
  }, [stage.id, stage.initialDegrees, onAngleChange]);

  const updateAngle = (nextDeg: number) => {
    const clamped = Math.max(0, Math.min(180, Math.round(nextDeg)));
    setDrawnDegrees(clamped);
    setDrawResult(null);
    onAngleChange(clamped);
  };

  const handleSvgPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    // Map client coords into viewBox 0..420 x 0..248 (vertex at 210, 206)
    const svgX = ((e.clientX - rect.left) / rect.width) * 420;
    const svgY = ((e.clientY - rect.top) / rect.height) * 248;
    const angle = computeProtractorAngle(210, 206, svgX, svgY);
    updateAngle(angle);
  };

  const handleCheckDrawnAngle = () => {
    const evaluation = evaluateDrawnAngle(drawnDegrees, stage);
    setDrawResult(evaluation);
    onStageEvaluated({
      stage,
      isCorrect: evaluation.isCorrect,
      studentLabel: `Drew ${evaluation.drawnDegrees}° (${evaluation.drawnCategory} Angle)`,
      voicePromptForTutor: evaluation.voicePromptForTutor,
      spokenFallbackSummary: `${evaluation.headline} ${evaluation.whyWrongOrRight}`,
    });
  };

  const handleClickDiagramOption = (opt: AngleDiagramOption) => {
    setSelectedOptionId(opt.id);
    const isCorrect = opt.id === stage.correctOptionId;
    const voicePrompt = isCorrect
      ? `The Class 5 student clicked "${opt.label}" for "${stage.prompt}", which is CORRECT! Celebrate their answer warmly and reinforce why ${stage.correctAnswerLabel} is right with one quick tip.`
      : `The Class 5 student clicked "${opt.label}" for "${stage.prompt}", which is WRONG. Why it is wrong: ${opt.wrongReason} The correct answer is ${stage.correctAnswerLabel}. Kindly explain why "${opt.label}" was wrong, state the correct answer clearly, walk through the Class 5 example, and encourage them to try again or move on.`;

    onStageEvaluated({
      stage,
      isCorrect,
      studentLabel: `Clicked "${opt.label}"`,
      voicePromptForTutor: voicePrompt,
      spokenFallbackSummary: isCorrect
        ? `Spot on! ${stage.correctAnswerLabel} is right.`
        : `Not quite! ${opt.wrongReason} The correct answer is ${stage.correctAnswerLabel}.`,
    });
  };

  const selectedOption = useMemo(
    () => stage.options?.find((o) => o.id === selectedOptionId) ?? null,
    [stage.options, selectedOptionId]
  );

  const isClickCorrect =
    selectedOption !== null && selectedOption.id === stage.correctOptionId;

  const liveClassification = classifyAngle(drawnDegrees);
  const liveStyle = getCategoryStyle(liveClassification.category);

  // Geometry constants for protractor (viewBox 420 x 248)
  const cx = 210;
  const cy = 206;
  const outerR = 166;
  const rayR = 148;
  const arcR = 64;
  const rayEnd = polarToCartesian(cx, cy, rayR, drawnDegrees);
  const handlePt = polarToCartesian(cx, cy, rayR, drawnDegrees);

  const hasNextStage = activeStageIndex < CLASS_5_ANGLES_STAGES.length - 1;

  return (
    <div
      data-testid="angles-interactive-studio"
      className="flex flex-col gap-4"
    >
      {/* 5-Stage Interactive Progress Stepper */}
      <nav aria-label="Angles lesson stages" className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {CLASS_5_ANGLES_STAGES.map((st, idx) => {
          const active = idx === activeStageIndex;
          const done = completedStageIds.includes(st.id);
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectStage(idx)}
              aria-current={active ? 'step' : undefined}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
                active
                  ? 'border-[#15629E] bg-[#15629E] text-white shadow-xs'
                  : done
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {done ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <span className="font-mono text-[11px] tabular-nums">{st.stepNumber}.</span>
              )}
              <span>{st.shortTitle}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Interactive Activity Stage Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] space-y-4">
        {/* Stage Prompt Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-semibold text-[#15629E]">
              Class 5 Mathematics · Angles · Activity {stage.stepNumber} of {CLASS_5_ANGLES_STAGES.length}
            </p>
            <h2 className="mt-1 font-display text-[18px] font-bold text-slate-900 leading-snug">
              {stage.prompt}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            aria-expanded={showHint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0"
          >
            <HelpCircle className="h-3.5 w-3.5 text-[#15629E]" aria-hidden="true" />
            <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
          </button>
        </div>

        {showHint && (
          <div className="rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-2.5 text-[12.5px] text-sky-950">
            <strong>Hint:</strong> {stage.hint}
          </div>
        )}

        {/* MODE A: INTERACTIVE PROTRACTOR ANGLE DRAWING LAB */}
        {stage.mode === 'draw' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/90 bg-[#F8FAFC] p-3 sm:p-4">
              {/* Live Degree & Classification Readout */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
                <div className="flex items-center gap-2.5">
                  <Compass className="h-4 w-4 text-[#15629E]" aria-hidden="true" />
                  <span
                    data-testid="drawn-angle-readout"
                    className="font-mono text-[22px] font-bold text-slate-900 tabular-nums"
                  >
                    {drawnDegrees}°
                  </span>
                  <span
                    className={`rounded-lg border px-2.5 py-0.5 text-xs font-bold ${liveStyle.badge}`}
                  >
                    {liveClassification.category} Angle
                  </span>
                </div>
                <span className="text-[12px] text-slate-500">
                  Drag the orange handle or use the slider below
                </span>
              </div>

              {/* Interactive SVG Protractor */}
              <svg
                ref={svgRef}
                data-testid="protractor-canvas"
                viewBox="0 0 420 248"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setIsDragging(true);
                  handleSvgPointer(e);
                }}
                onPointerMove={(e) => {
                  if (!isDragging) return;
                  handleSvgPointer(e);
                }}
                onPointerUp={() => setIsDragging(false)}
                onPointerCancel={() => setIsDragging(false)}
                className="w-full max-h-[260px] touch-none select-none cursor-crosshair"
                role="img"
                aria-label={`Interactive protractor currently showing ${drawnDegrees} degrees, a ${liveClassification.category} angle`}
              >
                {/* Protractor Semicircle Body */}
                <path
                  d={`M ${cx - outerR} ${cy} A ${outerR} ${outerR} 0 0 1 ${cx + outerR} ${cy} Z`}
                  fill="#FFFFFF"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                />
                {/* Inner faint guide semicircle */}
                <path
                  d={`M ${cx - 115} ${cy} A 115 115 0 0 1 ${cx + 115} ${cy}`}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />

                {/* Optional dashed target zone when Hint is toggled */}
                {showHint &&
                  typeof stage.minDegrees === 'number' &&
                  typeof stage.maxDegrees === 'number' && (
                    <path
                      d={describeSectorPath(cx, cy, rayR, stage.minDegrees, stage.maxDegrees)}
                      fill="rgba(16, 185, 129, 0.14)"
                      stroke="#10B981"
                      strokeWidth="1.5"
                      strokeDasharray="5 4"
                    />
                  )}

                {/* Protractor Tick Marks every 5 degrees */}
                {Array.from({ length: 37 }).map((_, i) => {
                  const deg = i * 5;
                  const isMajor = deg % 30 === 0;
                  const isMed = deg % 15 === 0;
                  const pOuter = polarToCartesian(cx, cy, outerR, deg);
                  const pInner = polarToCartesian(
                    cx,
                    cy,
                    outerR - (isMajor ? 14 : isMed ? 10 : 6),
                    deg
                  );
                  const pLabel = polarToCartesian(cx, cy, outerR - 25, deg);
                  return (
                    <g key={deg}>
                      <line
                        x1={pInner.x}
                        y1={pInner.y}
                        x2={pOuter.x}
                        y2={pOuter.y}
                        stroke={isMajor ? '#475569' : '#94A3B8'}
                        strokeWidth={isMajor ? 1.6 : 1}
                      />
                      {isMajor && (
                        <text
                          x={pLabel.x}
                          y={deg === 0 || deg === 180 ? pLabel.y - 8 : pLabel.y + 4}
                          textAnchor="middle"
                          fontSize="10.5"
                          fontWeight="600"
                          fill="#475569"
                          fontFamily="monospace"
                        >
                          {deg}°
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Shaded Dynamic Angle Sector */}
                {drawnDegrees > 0 && (
                  <path
                    d={describeSectorPath(cx, cy, arcR, 0, drawnDegrees)}
                    fill={liveStyle.fill}
                    stroke={liveStyle.stroke}
                    strokeWidth="2"
                  />
                )}

                {/* Square Right-Angle Corner Marker at 90° */}
                {drawnDegrees === 90 && (
                  <rect
                    x={cx}
                    y={cy - 22}
                    width={22}
                    height={22}
                    fill="none"
                    stroke="#1D4ED8"
                    strokeWidth="2.2"
                  />
                )}

                {/* Fixed Baseline Ray BC (0°) */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx + rayR}
                  y2={cy}
                  stroke="#0F172A"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <polygon
                  points={`${cx + rayR + 8},${cy} ${cx + rayR - 4},${cy - 5} ${cx + rayR - 4},${cy + 5}`}
                  fill="#0F172A"
                />
                <text x={cx + rayR - 4} y={cy + 22} fontSize="12" fontWeight="700" fill="#0F172A">
                  C
                </text>

                {/* Draggable Movable Ray BA */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={rayEnd.x}
                  y2={rayEnd.y}
                  stroke="#EA580C"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Vertex Point B */}
                <circle cx={cx} cy={cy} r="6.5" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2" />
                <text x={cx - 4} y={cy + 24} fontSize="12.5" fontWeight="700" fill="#0F172A">
                  B (Vertex)
                </text>

                {/* Draggable Orange Handle */}
                <circle
                  cx={handlePt.x}
                  cy={handlePt.y}
                  r="11.5"
                  fill="#F39200"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  className="cursor-grab"
                />
                <circle cx={handlePt.x} cy={handlePt.y} r="3.5" fill="#FFFFFF" />
              </svg>

              {/* Accessible Precision Slider + Step Controls */}
              <div className="mt-3 flex flex-wrap items-center gap-3 px-1">
                <label
                  htmlFor="angle-degree-slider"
                  className="text-xs font-semibold text-slate-700 whitespace-nowrap"
                >
                  Angle measure: <span className="font-mono tabular-nums">{drawnDegrees}°</span>
                </label>
                <input
                  id="angle-degree-slider"
                  type="range"
                  min={0}
                  max={180}
                  step={1}
                  value={drawnDegrees}
                  onChange={(e) => updateAngle(Number(e.target.value))}
                  className="flex-1 min-w-[140px] accent-[#EA580C]"
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateAngle(drawnDegrees - 5)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 tabular-nums"
                  >
                    −5°
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAngle(drawnDegrees + 5)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 tabular-nums"
                  >
                    +5°
                  </button>
                </div>
              </div>
            </div>

            {/* Check My Angle Action Row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-600">
                <strong>Rule check:</strong> {liveClassification.rule}
              </p>
              <button
                type="button"
                onClick={handleCheckDrawnAngle}
                className="rounded-xl bg-[#15629E] hover:bg-[#104D7D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors whitespace-nowrap"
              >
                Check My Angle ({drawnDegrees}°)
              </button>
            </div>
          </div>
        )}

        {/* MODE B: CLICK ANSWER INSIDE THE ANGLE DIAGRAM (RIGHT ANGLE / STRAIGHT LINE / CLOCK) */}
        {stage.mode !== 'draw' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/90 bg-[#F8FAFC] p-4 flex flex-col items-center">
              {/* Stage 2: Angle ∠ABC Right Angle Diagram */}
              {stage.mode === 'click-angle' && (
                <svg
                  viewBox="0 0 380 210"
                  className="w-full max-w-[380px] h-[196px]"
                  role="img"
                  aria-label="Diagram of angle ABC with a square corner marker at vertex B"
                >
                  {/* Shaded corner sector */}
                  <rect
                    x="130"
                    y="120"
                    width="34"
                    height="34"
                    fill="rgba(29, 78, 216, 0.16)"
                    stroke="#1D4ED8"
                    strokeWidth="2.5"
                  />
                  {/* Ray BA (upward) */}
                  <line
                    x1="130"
                    y1="154"
                    x2="130"
                    y2="34"
                    stroke="#0F172A"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <polygon points="130,22 123,36 137,36" fill="#0F172A" />
                  <text x="110" y="38" fontSize="14" fontWeight="700" fill="#0F172A">
                    A
                  </text>

                  {/* Ray BC (horizontal) */}
                  <line
                    x1="130"
                    y1="154"
                    x2="290"
                    y2="154"
                    stroke="#0F172A"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <polygon points="302,154 288,147 288,161" fill="#0F172A" />
                  <text x="292" y="178" fontSize="14" fontWeight="700" fill="#0F172A">
                    C
                  </text>

                  {/* Vertex B */}
                  <circle cx="130" cy="154" r="6" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="2" />
                  <text x="108" y="176" fontSize="14" fontWeight="700" fill="#0F172A">
                    B
                  </text>

                  {/* Question Badge INSIDE the angle */}
                  <rect
                    x="176"
                    y="84"
                    width="126"
                    height="36"
                    rx="10"
                    fill="#FFFFFF"
                    stroke="#1D4ED8"
                    strokeWidth="1.8"
                  />
                  <text
                    x="239"
                    y="106"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill="#1D4ED8"
                  >
                    ∠ABC = ?
                  </text>
                </svg>
              )}

              {/* Stage 4: Straight Line 180° Missing Angle Diagram */}
              {stage.mode === 'click-straight-line' && (
                <svg
                  viewBox="0 0 400 205"
                  className="w-full max-w-[400px] h-[196px]"
                  role="img"
                  aria-label="Straight line angle measuring 180 degrees divided into 65 degrees and unknown angle x"
                >
                  {/* 65° shaded sector (right) */}
                  <path
                    d={describeSectorPath(200, 160, 68, 0, 65)}
                    fill="rgba(29, 78, 216, 0.2)"
                    stroke="#1D4ED8"
                    strokeWidth="2"
                  />
                  {/* Unknown x° shaded sector (left, 65° to 180°) */}
                  <path
                    d={describeSectorPath(200, 160, 68, 65, 180)}
                    fill="rgba(245, 158, 11, 0.22)"
                    stroke="#D97706"
                    strokeWidth="2"
                  />
                  {/* Straight line PQ */}
                  <line
                    x1="34"
                    y1="160"
                    x2="366"
                    y2="160"
                    stroke="#0F172A"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <polygon points="24,160 38,153 38,167" fill="#0F172A" />
                  <polygon points="376,160 362,153 362,167" fill="#0F172A" />

                  {/* Dividing Ray at 65° */}
                  {(() => {
                    const rayPt = polarToCartesian(200, 160, 134, 65);
                    return (
                      <line
                        x1="200"
                        y1="160"
                        x2={rayPt.x}
                        y2={rayPt.y}
                        stroke="#EA580C"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    );
                  })()}

                  <circle cx="200" cy="160" r="6" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2" />
                  <text x="200" y="185" textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">
                    Straight Line = 180°
                  </text>

                  {/* Labels inside both angles */}
                  <text x="242" y="138" fontSize="15" fontWeight="800" fill="#1D4ED8" fontFamily="monospace">
                    65°
                  </text>
                  <rect
                    x="104"
                    y="102"
                    width="68"
                    height="32"
                    rx="9"
                    fill="#FFFFFF"
                    stroke="#D97706"
                    strokeWidth="2"
                  />
                  <text
                    x="138"
                    y="123"
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="800"
                    fill="#B45309"
                    fontFamily="monospace"
                  >
                    x = ?
                  </text>
                </svg>
              )}

              {/* Stage 5: Analog Clock at 4:00 */}
              {stage.mode === 'click-clock' && (
                <svg
                  viewBox="0 0 260 220"
                  className="w-full max-w-[260px] h-[205px]"
                  role="img"
                  aria-label="Clock showing 4:00 with highlighted angle between 12 and 4"
                >
                  {/* Clock Face */}
                  <circle cx="130" cy="110" r="94" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3.5" />
                  {/* Highlighted 120° sector between 12 (90° math) and 4 (-30° math) */}
                  <path
                    d={`M 130 110 L 130 40 A 70 70 0 0 1 ${130 + 70 * Math.cos((-30 * Math.PI) / 180)} ${
                      110 - 70 * Math.sin((-30 * Math.PI) / 180)
                    } Z`}
                    fill="rgba(245, 158, 11, 0.22)"
                    stroke="#D97706"
                    strokeWidth="2"
                  />
                  {/* Hour Numbers */}
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const hr = idx === 0 ? 12 : idx;
                    const mathDeg = 90 - idx * 30;
                    const pt = polarToCartesian(130, 110, 77, mathDeg);
                    return (
                      <text
                        key={hr}
                        x={pt.x}
                        y={pt.y + 4}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight={hr === 12 || hr === 4 ? '800' : '600'}
                        fill={hr === 12 || hr === 4 ? '#15629E' : '#475569'}
                      >
                        {hr}
                      </text>
                    );
                  })}
                  {/* Minute hand pointing to 12 */}
                  <line x1="130" y1="110" x2="130" y2="42" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
                  {/* Hour hand pointing to 4 */}
                  {(() => {
                    const pt = polarToCartesian(130, 110, 56, -30);
                    return (
                      <line
                        x1="130"
                        y1="110"
                        x2={pt.x}
                        y2={pt.y}
                        stroke="#EA580C"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                    );
                  })()}
                  <circle cx="130" cy="110" r="5.5" fill="#0F172A" />
                  <text x="164" y="102" fontSize="14" fontWeight="800" fill="#B45309" fontFamily="monospace">
                    ?°
                  </text>
                </svg>
              )}

              {/* Clickable Answer Options Inside Diagram Workspace */}
              <div
                role="radiogroup"
                aria-label="Choose the correct angle answer"
                className="mt-3 grid w-full grid-cols-2 gap-2.5"
              >
                {(stage.options ?? []).map((opt) => {
                  const chosen = selectedOptionId === opt.id;
                  const isCorrectOpt = opt.id === stage.correctOptionId;
                  let btnStyle =
                    'border-slate-200 bg-white text-slate-800 hover:border-[#15629E] hover:bg-blue-50/40';
                  if (chosen && isCorrectOpt) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200';
                  } else if (chosen && !isCorrectOpt) {
                    btnStyle = 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-200';
                  } else if (selectedOptionId && isCorrectOpt) {
                    btnStyle = 'border-emerald-400 bg-emerald-50/60 text-emerald-900';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={chosen}
                      onClick={() => handleClickDiagramOption(opt)}
                      className={`rounded-xl border px-3.5 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${btnStyle}`}
                    >
                      <span className="block text-[13.5px] font-bold">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="mt-0.5 block text-[11.5px] opacity-80">
                          {opt.sublabel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* COMPLETE FEEDBACK, WRONG-ANSWER EXPLANATION, COMPARISON DIAGRAM & WORKED EXAMPLE */}
        {(drawResult || selectedOption) && (
          <div
            data-testid="angle-feedback-card"
            className={`rounded-2xl border p-4 space-y-4 ${
              (drawResult?.isCorrect ?? isClickCorrect)
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-rose-200 bg-rose-50/40'
            }`}
          >
            {/* Status Header */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                {(drawResult?.isCorrect ?? isClickCorrect) ? (
                  <CheckCircle2
                    className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                ) : (
                  <AlertCircle
                    className="h-5 w-5 text-rose-600 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                )}
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">
                    {drawResult
                      ? drawResult.headline
                      : isClickCorrect
                      ? `Correct! ${stage.correctAnswerLabel}`
                      : `Not quite — You clicked "${selectedOption?.label}"`}
                  </h3>
                  <p className="mt-1 text-[12.5px] text-slate-700 leading-relaxed">
                    {drawResult
                      ? drawResult.whyWrongOrRight
                      : isClickCorrect
                      ? `Awesome eye! You matched the geometry clue accurately to ${stage.correctAnswerLabel}.`
                      : selectedOption?.wrongReason}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onRequestVoiceExplanation(
                    drawResult
                      ? `${drawResult.headline} ${drawResult.whyWrongOrRight} ${drawResult.workedExampleSteps.join(' ')}`
                      : isClickCorrect
                      ? `Great job! ${stage.correctAnswerLabel}. ${stage.workedExampleSteps.join(' ')}`
                      : `Let's look closely! ${selectedOption?.wrongReason} The correct answer is ${stage.correctAnswerLabel}. ${stage.workedExampleSteps.join(' ')}`
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#15629E] hover:bg-blue-50 whitespace-nowrap shrink-0"
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Hear Explanation</span>
              </button>
            </div>

            {/* Correct Answer Callout (always shown clearly on wrong answer!) */}
            {!(drawResult?.isCorrect ?? isClickCorrect) && (
              <div className="rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 text-[12.5px] text-slate-800">
                <strong className="text-emerald-800">Correct Answer:</strong>{' '}
                {drawResult ? drawResult.correctAnswerSummary : stage.correctAnswerLabel}
              </div>
            )}

            {/* Side-by-Side Comparison Diagram (Wrong vs. Correct) */}
            {!(drawResult?.isCorrect ?? isClickCorrect) && (
              <div
                data-testid="wrong-vs-correct-diagrams"
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <MiniAngleComparisonDiagram
                  degrees={
                    drawResult
                      ? drawResult.drawnDegrees
                      : selectedOption?.compareDegrees ?? 45
                  }
                  title="Your Choice"
                  caption={
                    drawResult
                      ? `${drawResult.drawnDegrees}° (${drawResult.drawnCategory} Angle)`
                      : `${selectedOption?.label ?? ''} (${selectedOption?.compareDegrees ?? 0}°)`
                  }
                  tone="wrong"
                />
                <MiniAngleComparisonDiagram
                  degrees={
                    drawResult
                      ? drawResult.targetDegrees
                      : stage.diagramDegrees ?? 90
                  }
                  title="Correct Angle"
                  caption={stage.correctAnswerLabel}
                  tone="correct"
                />
              </div>
            )}

            {/* Complete Worked Example Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
              <p className="text-[12px] font-bold text-[#15629E]">
                {stage.workedExampleTitle}
              </p>
              <ul className="space-y-1 text-[12.5px] text-slate-700 leading-snug">
                {stage.workedExampleSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>

            {/* Bottom Retry / Next Activity Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setDrawResult(null);
                  setSelectedOptionId(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Try Again</span>
              </button>

              {hasNextStage && (
                <button
                  type="button"
                  onClick={() => onSelectStage(activeStageIndex + 1)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#00A859] hover:bg-[#00924D] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  <span>Next Activity</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
