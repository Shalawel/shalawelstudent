import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CornerDownLeft,
  Delete,
  Eraser,
  Eye,
  EyeOff,
  Keyboard,
  PenTool,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  evaluateMathExpression,
  type PlottedExpression,
} from '../utils/classroomLogic';
import type { WhiteboardTelemetryInput } from '../utils/tutorMasteryEngine';

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface ClassroomWhiteboardProps {
  variant: 'sidebar' | 'popover';
  expressions: PlottedExpression[];
  onAddExpression: (formula: string) => void;
  onToggleExpression: (id: string) => void;
  onRemoveExpression: (id: string) => void;
  onInsertEquation?: (equation: string) => void;
  onShareStepWithTutor?: (telemetry: WhiteboardTelemetryInput) => void;
  onClose?: () => void;
}

const PEN_COLORS = [
  { name: 'Black', hex: '#0F172A' },
  { name: 'Blue', hex: '#1D4ED8' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Green', hex: '#16A34A' },
];

const KEYPAD_ROWS = [
  ['7', '8', '9', '/', 'x', 'y', '²'],
  ['4', '5', '6', '×', '^', '√(', '|'],
  ['1', '2', '3', '-', 'sin(', 'cos(', 'tan('],
  ['0', '.', 'π', '+', '(', ')', 'e'],
];

export const ClassroomWhiteboard: React.FC<ClassroomWhiteboardProps> = ({
  variant,
  expressions,
  onAddExpression,
  onToggleExpression,
  onRemoveExpression,
  onInsertEquation,
  onShareStepWithTutor,
  onClose,
}) => {
  const [penSize, setPenSize] = useState<number>(3);
  const [penColor, setPenColor] = useState<string>('#1D4ED8');
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser' | 'graph'>('pen');
  const [graphMode, setGraphMode] = useState<'canvas' | 'desmos'>('desmos');
  const [zoom, setZoom] = useState<number>(1);
  const [showKeypad, setShowKeypad] = useState<boolean>(false);
  const [exprDraft, setExprDraft] = useState<string>('y = 2x + 1');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [eraseOrUndoCount, setEraseOrUndoCount] = useState<number>(0);
  const [clearCount, setClearCount] = useState<number>(0);
  const lastActivityAtRef = useRef<number>(Date.now());

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasWidth = variant === 'popover' ? 420 : 320;
  const canvasHeight = variant === 'popover' ? 210 : 250;

  // Render coordinate grid, live math curves, and user freehand strokes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    // Coordinate grid (always drawn in Desmos mode, subtle in Canvas mode)
    const step = 36 * zoom;
    const cx = w / 2;
    const cy = h / 2;

    ctx.strokeStyle = graphMode === 'desmos' ? '#E2E8F0' : '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = cx % step; x < w; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = cy % step; y < h; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Axes
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();

    // Plot visible expressions in Desmos Graph Mode
    if (graphMode === 'desmos') {
      const unitsPerPixel = 1 / (36 * zoom);
      expressions.forEach((expr) => {
        if (!expr.visible) return;
        ctx.strokeStyle = expr.color;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        let started = false;
        for (let px = 0; px <= w; px += 2) {
          const xVal = (px - cx) * unitsPerPixel;
          const yVal = evaluateMathExpression(expr.formula, xVal);
          if (yVal === null || Math.abs(yVal) > 50) {
            started = false;
            continue;
          }
          const py = cy - yVal / unitsPerPixel;
          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      });
    }

    // Draw freehand strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }, [expressions, strokes, graphMode, zoom, canvasWidth, canvasHeight]);

  const getPointerCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === 'graph') return;
    lastActivityAtRef.current = Date.now();
    if (activeTool === 'eraser') {
      setEraseOrUndoCount((c) => c + 1);
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getPointerCoords(e);
    setIsDrawing(true);
    setStrokes((prev) => [
      ...prev,
      {
        points: [pt],
        color: activeTool === 'eraser' ? '#FFFFFF' : penColor,
        width: activeTool === 'eraser' ? penSize * 4 : penSize,
      },
    ]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pt = getPointerCoords(e);
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const last = next[next.length - 1];
      next[next.length - 1] = { ...last, points: [...last.points, pt] };
      return next;
    });
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    lastActivityAtRef.current = Date.now();
  };

  const handleSubmitExpression = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = exprDraft.trim();
    if (!trimmed) return;
    lastActivityAtRef.current = Date.now();
    onAddExpression(trimmed);
    setExprDraft('');
  };

  const handleKeypadInsert = (token: string) => {
    lastActivityAtRef.current = Date.now();
    setExprDraft((prev) => prev + token);
  };

  const handleUndo = () => {
    setEraseOrUndoCount((c) => c + 1);
    lastActivityAtRef.current = Date.now();
    if (strokes.length > 0) {
      setStrokes((prev) => prev.slice(0, -1));
    } else if (exprDraft.length > 0) {
      setExprDraft((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    setClearCount((c) => c + 1);
    lastActivityAtRef.current = Date.now();
    setStrokes([]);
    setExprDraft('');
  };

  const buildCurrentTelemetry = (): WhiteboardTelemetryInput => {
    const visibleExpressions = expressions
      .filter((e) => e.visible)
      .map((e) => e.formula);
    if (exprDraft.trim() && !visibleExpressions.includes(exprDraft.trim())) {
      visibleExpressions.push(exprDraft.trim());
    }
    return {
      expressions: visibleExpressions,
      strokeCount: strokes.length,
      eraseOrUndoCount,
      clearCount,
      pauseSeconds: Math.max(0, Math.round((Date.now() - lastActivityAtRef.current) / 1000)),
    };
  };

  const toolbarRow = (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
      <div className="flex items-center gap-3 flex-wrap">
        {/* PEN slider */}
        <label className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider text-slate-500">
          <span>PEN</span>
          <input
            type="range"
            min={1}
            max={8}
            value={penSize}
            onChange={(e) => setPenSize(Number(e.target.value))}
            aria-label="Pen stroke thickness"
            className="w-14 accent-slate-900"
          />
        </label>

        {/* COLOR swatches */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10.5px] font-bold tracking-wider text-slate-500">COLOR</span>
          {PEN_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => {
                setPenColor(c.hex);
                setActiveTool('pen');
              }}
              aria-label={`Pen color ${c.name}`}
              aria-pressed={penColor === c.hex && activeTool === 'pen'}
              className={`h-4 w-4 rounded-sm transition-transform ${
                penColor === c.hex && activeTool === 'pen'
                  ? 'ring-2 ring-offset-1 ring-slate-900 scale-110'
                  : 'opacity-85 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        {/* Drawing tool buttons */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={() => setActiveTool('pen')}
            aria-label="Pen draw tool"
            aria-pressed={activeTool === 'pen'}
            className={`rounded-md p-1.5 transition-colors ${
              activeTool === 'pen' ? 'bg-blue-100 text-[#1D4ED8]' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <PenTool className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('eraser')}
            aria-label="Eraser tool"
            aria-pressed={activeTool === 'eraser'}
            className={`rounded-md p-1.5 transition-colors ${
              activeTool === 'eraser' ? 'bg-blue-100 text-[#1D4ED8]' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <Eraser className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('graph')}
            aria-label="Graph inspect tool"
            aria-pressed={activeTool === 'graph'}
            className={`rounded-md p-1.5 transition-colors ${
              activeTool === 'graph' ? 'bg-blue-100 text-[#1D4ED8]' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear whiteboard strokes"
            className="rounded-md p-1.5 text-slate-600 hover:bg-white hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Mode Switch */}
      {variant === 'popover' ? (
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-0.5 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setGraphMode('canvas')}
            className={`rounded-lg px-2.5 py-1 transition-colors ${
              graphMode === 'canvas' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Canvas graph
          </button>
          <button
            type="button"
            onClick={() => setGraphMode('desmos')}
            className={`rounded-lg px-2.5 py-1 transition-colors ${
              graphMode === 'desmos'
                ? 'bg-[#FEF3C7] text-[#B45309]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Desmos Graph Mode
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setGraphMode((m) => (m === 'desmos' ? 'canvas' : 'desmos'))}
          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/70 px-2.5 py-1 text-[11px] font-semibold text-[#1D4ED8] hover:bg-blue-100"
        >
          <span>{graphMode === 'desmos' ? 'Desmos Graph Mode' : 'Canvas Graph'}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      )}
    </div>
  );

  const canvasElement = (
    <div className="relative rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="absolute left-2.5 top-2 z-10 flex items-center gap-1 rounded-md border border-slate-200 bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-slate-600 tabular-nums shadow-2xs">
        <span>Zoom: {zoom.toFixed(1)}x</span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2, Number((z + 0.2).toFixed(1))))}
          aria-label="Zoom in graph"
          className="ml-1 px-1 hover:text-[#15629E]"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
          aria-label="Zoom out graph"
          className="px-1 hover:text-[#15629E]"
        >
          −
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        data-testid={`whiteboard-canvas-${variant}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-auto block touch-none cursor-crosshair"
      />
    </div>
  );

  const expressionsSection = (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-800">Expressions</span>
        <button
          type="button"
          onClick={() => setShowKeypad((v) => !v)}
          aria-expanded={showKeypad}
          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#1D4ED8] hover:bg-blue-100 transition-colors"
        >
          <Keyboard className="h-3.5 w-3.5" />
          <span>Keypad</span>
          {showKeypad ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      <form onSubmit={handleSubmitExpression} className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
        <span className="text-xs font-serif italic font-semibold text-slate-400">fx</span>
        <input
          type="text"
          aria-label="Enter math expression"
          value={exprDraft}
          onChange={(e) => setExprDraft(e.target.value)}
          placeholder="Enter expression (e.g. y = 2x + 1)..."
          className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none font-mono"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-100 hover:bg-blue-100 hover:text-[#1D4ED8] px-2 py-0.5 text-[10.5px] font-semibold text-slate-600"
        >
          Plot
        </button>
      </form>

      <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin">
        {expressions.map((expr) => (
          <div
            key={expr.id}
            className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: expr.color }}
                aria-hidden="true"
              />
              <span className="font-mono text-slate-800 truncate">{expr.formula}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onToggleExpression(expr.id)}
                aria-label={`${expr.visible ? 'Hide' : 'Show'} ${expr.formula}`}
                className="rounded p-1 text-slate-500 hover:bg-slate-200/70"
              >
                {expr.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => onRemoveExpression(expr.id)}
                aria-label={`Remove ${expr.formula}`}
                className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const keypadSection = showKeypad && (
    <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
        <span className="text-slate-500 font-medium">
          Input:{' '}
          <strong className="font-mono text-[#1D4ED8]">{exprDraft || 'y = 2x + _'}</strong>
        </span>
        <Keyboard className="h-3.5 w-3.5 text-[#1D4ED8]" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-8 gap-1.5">
        <div className="col-span-7 grid grid-cols-7 gap-1.5">
          {KEYPAD_ROWS.flat().map((keyLabel) => {
            const isOp = ['/', '×', '-', '+'].includes(keyLabel);
            return (
              <button
                key={keyLabel}
                type="button"
                onClick={() => handleKeypadInsert(keyLabel)}
                className={`rounded-lg border py-1.5 text-xs font-semibold transition-colors ${
                  isOp
                    ? 'border-blue-200 bg-blue-50 text-[#1D4ED8] hover:bg-blue-100'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100'
                }`}
              >
                {keyLabel}
              </button>
            );
          })}
        </div>

        <div className="col-span-1 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setExprDraft((prev) => prev.slice(0, -1))}
            aria-label="Backspace equation"
            className="flex-1 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-200/80 hover:bg-slate-300 text-slate-700"
          >
            <Delete className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleSubmitExpression()}
            aria-label="Plot equation"
            className="flex-1 flex items-center justify-center rounded-lg bg-[#93B8E8] hover:bg-[#15629E] text-white transition-colors"
          >
            <CornerDownLeft className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (variant === 'sidebar') {
    return (
      <div className="space-y-3.5">
        {toolbarRow}
        {canvasElement}
        {expressionsSection}
        {keypadSection}
        {onShareStepWithTutor && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500 leading-snug">
              Maya reviews your step without completing it for you.
            </p>
            <button
              type="button"
              onClick={() => onShareStepWithTutor(buildCurrentTelemetry())}
              className="shrink-0 rounded-lg bg-[#1245A8] hover:bg-[#0D3585] px-3.5 py-2 text-xs font-semibold text-white transition-colors"
            >
              Share Step with Maya
            </button>
          </div>
        )}
      </div>
    );
  }

  // Floating Popover Modal matching Screenshot 2 middle panels
  return (
    <div
      role="dialog"
      aria-label="Whiteboard"
      className="w-[700px] max-w-[94vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between bg-[#0E5A9E] px-4 py-2.5 text-white">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <PenTool className="h-4 w-4" aria-hidden="true" />
          <span>Whiteboard</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Whiteboard"
            className="rounded-lg p-1 text-white/80 hover:bg-white/15 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {toolbarRow}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-7">{canvasElement}</div>
          <div className="md:col-span-5">{expressionsSection}</div>
        </div>

        {keypadSection}

        {/* Footer Actions matching Screenshot 2 */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              className="rounded-lg border border-blue-300 bg-white hover:bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#1D4ED8]"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg border border-blue-300 bg-white hover:bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#1D4ED8]"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2">
            {onShareStepWithTutor && (
              <button
                type="button"
                onClick={() => {
                  onShareStepWithTutor(buildCurrentTelemetry());
                  onClose?.();
                }}
                className="rounded-lg border border-[#1245A8] bg-blue-50/70 hover:bg-blue-100 px-3.5 py-2 text-xs font-semibold text-[#1245A8]"
              >
                Check My Step
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const eq =
                  exprDraft.trim() || expressions[0]?.formula || 'y = 2x² + 4x - 1';
                onInsertEquation?.(eq);
                onClose?.();
              }}
              className="rounded-lg bg-[#F39200] hover:bg-[#DF8500] px-5 py-2 text-xs font-semibold text-slate-950 shadow-xs"
            >
              Insert Equation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
