import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import type {
  MonthlyBarDatum,
  ProgressSubjectFilter,
  TrendMetricMode,
  TrendViewMode,
  WeeklyTrendPoint,
} from '../utils/learningProgressLogic';
import { playUiSound } from '../utils/uiSounds';

interface LearningProgressChartsProps {
  subjectFilter: ProgressSubjectFilter;
  viewMode: TrendViewMode;
  metricMode: TrendMetricMode;
  onChangeViewMode: (mode: TrendViewMode) => void;
  onChangeMetricMode: (mode: TrendMetricMode) => void;
  barData: MonthlyBarDatum[];
  lineData: WeeklyTrendPoint[];
}

export const LearningProgressCharts: React.FC<LearningProgressChartsProps> = ({
  subjectFilter,
  viewMode,
  metricMode,
  onChangeViewMode,
  onChangeMetricMode,
  barData,
  lineData,
}) => {
  const [selectedBarKey, setSelectedBarKey] = useState<string | null>(null);
  const [hoveredWeekIdx, setHoveredWeekIdx] = useState<number | null>(null);
  const [visibleSeries, setVisibleSeries] = useState({
    yourMastery: true,
    aiPrediction: true,
    classAverage: true,
  });

  const activeBar = useMemo(() => {
    if (selectedBarKey) {
      const found = barData.find((d) => d.key === selectedBarKey);
      if (found) return found;
    }
    return barData.find((d) => d.highlighted) ?? barData[0] ?? null;
  }, [barData, selectedBarKey]);

  const maxBarValue = useMemo(() => {
    if (metricMode === 'hours') {
      return Math.max(4, ...barData.map((d) => d.hours)) * 1.15;
    }
    return 100;
  }, [barData, metricMode]);

  const getMetricValue = (item: MonthlyBarDatum): number => {
    if (metricMode === 'accuracy') return item.accuracy;
    if (metricMode === 'hours') return item.hours;
    return item.mastery;
  };

  const formatMetricValue = (val: number): string => {
    if (metricMode === 'hours') return `${val}h`;
    return `${val}%`;
  };

  // Line chart geometry
  const svgW = 820;
  const svgH = 250;
  const padL = 44;
  const padR = 24;
  const padT = 20;
  const padB = 34;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const getX = (idx: number) =>
    padL + (idx / Math.max(1, lineData.length - 1)) * plotW;
  const getY = (val: number) =>
    padT + plotH - (Math.max(0, Math.min(100, val)) / 100) * plotH;

  const buildPolyline = (getter: (pt: WeeklyTrendPoint) => number) =>
    lineData.map((pt, i) => `${getX(i).toFixed(1)},${getY(getter(pt)).toFixed(1)}`).join(' ');

  const buildAreaPath = (getter: (pt: WeeklyTrendPoint) => number) => {
    if (lineData.length === 0) return '';
    const pts = lineData.map((pt, i) => `${getX(i).toFixed(1)} ${getY(getter(pt)).toFixed(1)}`);
    return `M ${pts[0]} L ${pts.slice(1).join(' L ')} L ${getX(lineData.length - 1).toFixed(
      1
    )} ${(padT + plotH).toFixed(1)} L ${getX(0).toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;
  };

  const focusedWeek = hoveredWeekIdx !== null ? lineData[hoveredWeekIdx] ?? null : null;

  const toggleSeries = (key: keyof typeof visibleSeries) => {
    playUiSound('click');
    setVisibleSeries((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (prev[key] && activeCount <= 1) return prev; // keep at least 1 series visible
      return { ...prev, [key]: !prev[key] };
    });
  };

  return (
    <section
      aria-labelledby="growth-trends-heading"
      data-testid="growth-trends-card"
      className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-5 sm:px-6 py-5 shadow-[0_6px_24px_rgba(21,98,158,0.06)] space-y-6"
    >
      {/* Header + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2
            id="growth-trends-heading"
            className="font-display text-base font-bold text-slate-900 dark:text-white"
          >
            Learning Growth Trends
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Average {metricMode === 'hours' ? 'study time' : `${metricMode} increase`}{' '}
            {subjectFilter === 'All Subjects'
              ? 'across all subjects'
              : `in ${subjectFilter}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Select */}
          <div className="relative flex items-center">
            <select
              value={viewMode}
              onChange={(e) => {
                playUiSound('switch');
                setSelectedBarKey(null);
                onChangeViewMode(e.target.value as TrendViewMode);
              }}
              aria-label="Chart grouping view"
              className="appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3.5 pr-8 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#15629E] focus:outline-none cursor-pointer"
            >
              <option value="monthly">View by Time (Monthly)</option>
              <option value="subject">View by Subject</option>
              <option value="weekly">View by Day (This Week)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-500" />
          </div>

          {/* Metric Mode Select */}
          <div className="relative flex items-center">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 h-2 w-2 rounded-full bg-[#15629E]"
            />
            <select
              value={metricMode}
              onChange={(e) => {
                playUiSound('switch');
                onChangeMetricMode(e.target.value as TrendMetricMode);
              }}
              aria-label="Chart metric"
              className="appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-7 pr-8 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#15629E] focus:outline-none cursor-pointer"
            >
              <option value="mastery">Mastery %</option>
              <option value="accuracy">Accuracy %</option>
              <option value="hours">Study Hours</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Chart 1: Interactive Vertical Bar Chart */}
      <div className="space-y-3">
        <div
          role="group"
          aria-label="Interactive growth bar chart"
          data-testid="growth-bar-chart"
          className="pt-7 pb-1 px-1 sm:px-2"
        >
          <div className="h-[188px] flex items-end justify-between gap-1.5 sm:gap-3">
            {barData.map((item, idx) => {
              const rawVal = getMetricValue(item);
              const heightPct = Math.max(14, Math.min(100, (rawVal / maxBarValue) * 100));
              const isSelected = activeBar?.key === item.key;
              const isHighlighted = Boolean(item.highlighted);
              const showCallout = isHighlighted || isSelected;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    playUiSound('click');
                    setSelectedBarKey(item.key);
                  }}
                  onMouseEnter={() => setSelectedBarKey(item.key)}
                  aria-label={`${item.label}: ${formatMetricValue(rawVal)}, ${item.sessions} sessions`}
                  aria-pressed={isSelected}
                  className="group relative flex-1 h-full flex flex-col justify-end items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] rounded-lg"
                >
                  {/* Vertical rounded bar with callout anchored directly to bar top */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="relative w-full max-w-[46px] flex items-end"
                  >
                    {showCallout && (
                      <motion.span
                        key={`${item.key}-${rawVal}-${metricMode}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        className={`pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums shadow-xs whitespace-nowrap ${
                          isSelected && !isHighlighted
                            ? 'bg-[#15629E] text-white'
                            : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                        }`}
                      >
                        {formatMetricValue(rawVal)}
                      </motion.span>
                    )}

                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{
                        duration: 0.36,
                        delay: Math.min(idx * 0.02, 0.2),
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      style={{
                        transformOrigin: 'bottom center',
                      }}
                      className={`h-full w-full rounded-t-xl transition-colors duration-150 ${
                        isSelected && !isHighlighted
                          ? 'bg-[#15629E] dark:bg-sky-500'
                          : isHighlighted
                          ? isSelected
                            ? 'bg-[#EA8A00] ring-2 ring-[#F59E0B]/40'
                            : 'bg-[#F59E0B] group-hover:bg-[#EA8A00]'
                          : 'bg-[#E5EFFB] dark:bg-slate-800 group-hover:bg-[#C6DDF7] dark:group-hover:bg-slate-700'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* X-axis Labels */}
          <div className="mt-2.5 flex items-center justify-between gap-1.5 sm:gap-3">
            {barData.map((item) => {
              const isSelected = activeBar?.key === item.key;
              return (
                <span
                  key={`lbl-${item.key}`}
                  className={`flex-1 text-center text-[11px] truncate tabular-nums ${
                    isSelected
                      ? 'font-bold text-[#15629E] dark:text-sky-400'
                      : 'font-medium text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Focused Bar Telemetry Readout Strip */}
        {activeBar && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F5F9FE] dark:bg-slate-800/70 border border-[#DCEBFA] dark:border-slate-700/80 px-3.5 py-2 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-700 dark:text-slate-200">
              <span className="font-bold text-[#0B2242] dark:text-white">{activeBar.label}</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                ·
              </span>
              <span className="tabular-nums">
                Mastery <strong className="text-[#15629E] dark:text-sky-400">{activeBar.mastery}%</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                ·
              </span>
              <span className="tabular-nums">
                Accuracy <strong>{activeBar.accuracy}%</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                ·
              </span>
              <span className="tabular-nums">{activeBar.hours} hrs</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                ·
              </span>
              <span className="tabular-nums">{activeBar.sessions} sessions</span>
            </div>
            <span
              className={`font-semibold tabular-nums ${
                activeBar.deltaFromPrev >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              {activeBar.deltaFromPrev >= 0 ? `+${activeBar.deltaFromPrev}%` : `${activeBar.deltaFromPrev}%`} vs prior
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-800" />

      {/* Chart 2: Interactive 8-Week Multi-Series Line Chart */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            8-Week Mastery Trajectory vs AI Prediction & Class Average
          </p>
          {focusedWeek ? (
            <div className="flex flex-wrap items-center gap-2.5 text-[11.5px] tabular-nums">
              <span className="font-bold text-slate-900 dark:text-white">{focusedWeek.week}</span>
              <span className="text-[#15629E] dark:text-sky-400 font-semibold">
                You: {focusedWeek.yourMastery}%
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                AI Pred: {focusedWeek.aiPrediction}%
              </span>
              <span className="text-[#D97706] dark:text-amber-400 font-semibold">
                Class Avg: {focusedWeek.classAverage}%
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Hover or click any week node to compare scores
            </span>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full min-w-[540px] h-auto select-none"
            role="img"
            aria-label="8-week learning mastery comparison line chart"
          >
            <defs>
              <linearGradient id="lp-mastery-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#15629E" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#15629E" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {[0, 25, 50, 75, 100].map((tick) => {
              const y = getY(tick);
              return (
                <g key={`y-${tick}`}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={svgW - padR}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeDasharray={tick === 0 ? undefined : '4 4'}
                    strokeWidth="1"
                  />
                  <text
                    x={padL - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-400 dark:fill-slate-500 text-[11px] tabular-nums"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Vertical Week Guides & X-Axis Labels */}
            {lineData.map((pt, idx) => {
              const x = getX(idx);
              const isHovered = hoveredWeekIdx === idx;
              return (
                <g key={`x-${pt.week}`}>
                  <line
                    x1={x}
                    y1={padT}
                    x2={x}
                    y2={padT + plotH}
                    stroke="currentColor"
                    className={
                      isHovered
                        ? 'text-[#15629E]/50 dark:text-sky-400/50'
                        : 'text-slate-200/80 dark:text-slate-800/80'
                    }
                    strokeDasharray={isHovered ? undefined : '3 4'}
                    strokeWidth={isHovered ? '1.5' : '1'}
                  />
                  <text
                    x={x}
                    y={svgH - 8}
                    textAnchor="middle"
                    className={`text-[11px] ${
                      isHovered
                        ? 'fill-[#15629E] dark:fill-sky-400 font-bold'
                        : 'fill-slate-500 dark:fill-slate-400'
                    }`}
                  >
                    {pt.week}
                  </text>
                </g>
              );
            })}

            {/* Subtle area under Your Mastery */}
            {visibleSeries.yourMastery && (
              <path
                d={buildAreaPath((pt) => pt.yourMastery)}
                fill="url(#lp-mastery-area)"
              />
            )}

            {/* Series 1: AI Prediction (dashed cool slate-blue) */}
            {visibleSeries.aiPrediction && (
              <g>
                <polyline
                  fill="none"
                  stroke="#7D91A8"
                  strokeWidth="2.2"
                  strokeDasharray="6 5"
                  points={buildPolyline((pt) => pt.aiPrediction)}
                />
                {lineData.map((pt, idx) => (
                  <circle
                    key={`ai-${pt.week}`}
                    cx={getX(idx)}
                    cy={getY(pt.aiPrediction)}
                    r={hoveredWeekIdx === idx ? 4.5 : 3.2}
                    fill="#FFFFFF"
                    stroke="#7D91A8"
                    strokeWidth="2"
                  />
                ))}
              </g>
            )}

            {/* Series 2: Class Average (solid warm amber matching reference) */}
            {visibleSeries.classAverage && (
              <g>
                <polyline
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={buildPolyline((pt) => pt.classAverage)}
                />
                {lineData.map((pt, idx) => (
                  <circle
                    key={`avg-${pt.week}`}
                    cx={getX(idx)}
                    cy={getY(pt.classAverage)}
                    r={hoveredWeekIdx === idx ? 5.2 : 3.8}
                    fill="#FFFFFF"
                    stroke="#F59E0B"
                    strokeWidth="2.3"
                  />
                ))}
              </g>
            )}

            {/* Series 3: Your Mastery (solid TutorCloud blue) */}
            {visibleSeries.yourMastery && (
              <g>
                <polyline
                  fill="none"
                  stroke="#15629E"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={buildPolyline((pt) => pt.yourMastery)}
                />
                {lineData.map((pt, idx) => (
                  <circle
                    key={`you-${pt.week}`}
                    cx={getX(idx)}
                    cy={getY(pt.yourMastery)}
                    r={hoveredWeekIdx === idx ? 5.5 : 4}
                    fill="#FFFFFF"
                    stroke="#15629E"
                    strokeWidth="2.4"
                  />
                ))}
              </g>
            )}

            {/* Interactive Hit Columns for smooth hover & click */}
            {lineData.map((pt, idx) => {
              const colW = plotW / Math.max(1, lineData.length - 1);
              const x = getX(idx) - colW / 2;
              return (
                <rect
                  key={`hit-${pt.week}`}
                  x={Math.max(padL - 12, x)}
                  y={padT}
                  width={colW}
                  height={plotH + 24}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredWeekIdx(idx)}
                  onMouseLeave={() => setHoveredWeekIdx(null)}
                  onClick={() => {
                    playUiSound('subtle');
                    setHoveredWeekIdx((curr) => (curr === idx ? null : idx));
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* Interactive Legend Toggles */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => toggleSeries('aiPrediction')}
            aria-pressed={visibleSeries.aiPrediction}
            className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-semibold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
              visibleSeries.aiPrediction
                ? 'text-slate-600 dark:text-slate-300'
                : 'text-slate-400 opacity-50 line-through'
            }`}
          >
            <span className="inline-flex items-center gap-0.5" aria-hidden="true">
              <span className="h-0.5 w-2.5 bg-[#7D91A8]" />
              <span className="h-2 w-2 rounded-full border-2 border-[#7D91A8] bg-white" />
              <span className="h-0.5 w-2.5 bg-[#7D91A8]" />
            </span>
            AI Prediction
            {visibleSeries.aiPrediction ? (
              <Eye className="h-3 w-3 opacity-60" />
            ) : (
              <EyeOff className="h-3 w-3 opacity-60" />
            )}
          </button>

          <button
            type="button"
            onClick={() => toggleSeries('classAverage')}
            aria-pressed={visibleSeries.classAverage}
            className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-semibold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
              visibleSeries.classAverage
                ? 'text-[#D97706] dark:text-amber-400'
                : 'text-slate-400 opacity-50 line-through'
            }`}
          >
            <span className="inline-flex items-center" aria-hidden="true">
              <span className="h-0.5 w-2.5 bg-[#F59E0B]" />
              <span className="h-2 w-2 rounded-full border-2 border-[#F59E0B] bg-white" />
              <span className="h-0.5 w-2.5 bg-[#F59E0B]" />
            </span>
            Class Average
            {visibleSeries.classAverage ? (
              <Eye className="h-3 w-3 opacity-60" />
            ) : (
              <EyeOff className="h-3 w-3 opacity-60" />
            )}
          </button>

          <button
            type="button"
            onClick={() => toggleSeries('yourMastery')}
            aria-pressed={visibleSeries.yourMastery}
            className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-semibold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
              visibleSeries.yourMastery
                ? 'text-[#15629E] dark:text-sky-400'
                : 'text-slate-400 opacity-50 line-through'
            }`}
          >
            <span className="inline-flex items-center" aria-hidden="true">
              <span className="h-0.5 w-2.5 bg-[#15629E]" />
              <span className="h-2 w-2 rounded-full border-2 border-[#15629E] bg-white" />
              <span className="h-0.5 w-2.5 bg-[#15629E]" />
            </span>
            Your Mastery
            {visibleSeries.yourMastery ? (
              <Eye className="h-3 w-3 opacity-60" />
            ) : (
              <EyeOff className="h-3 w-3 opacity-60" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
