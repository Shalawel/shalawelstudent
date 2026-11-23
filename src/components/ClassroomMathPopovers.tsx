import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

/* 1. Graphing / Math Symbol Palette Popover (Screenshot 2 Panel 1) */
const SYMBOL_SECTIONS: { title: string; symbols: string[] }[] = [
  {
    title: 'Greek alphabet',
    symbols: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'λ', 'μ', 'σ', 'Ω', 'Σ', 'Δ'],
  },
  {
    title: 'BASIC OPERATIONS',
    symbols: ['+', '-', '×', '÷', '=', '≠', '<', '>'],
  },
  {
    title: 'Calculus & operators',
    symbols: ['∫', '∬', '∭', '∂', '∇', 'lim', '∞', '±', '≈', '≠', '×', '÷', '√', '∛'],
  },
  {
    title: 'Sets & logic',
    symbols: ['∈', '∉', '⊂', '⊆', '∪', '∩', '∀', '∃', '¬', '∧', '∨', '⇒', '⇔', '∅'],
  },
];

export const MathSymbolsPopover: React.FC<{
  onInsertEquation: (eq: string) => void;
  onClose: () => void;
}> = ({ onInsertEquation, onClose }) => {
  const [buffer, setBuffer] = useState<string[]>([]);

  const handleAppend = (sym: string) => {
    setBuffer((prev) => [...prev, sym]);
  };

  return (
    <div
      role="dialog"
      aria-label="Graphing math symbols"
      className="w-[330px] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between bg-[#0E5A9E] px-4 py-2.5 text-white">
        <span className="text-sm font-semibold">
          <span className="font-serif italic mr-1.5">fx</span>Graphing
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Graphing symbols"
          className="rounded-lg p-1 text-white/80 hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3.5 bg-[#F5F7FA] space-y-3 max-h-[420px] overflow-y-auto scrollbar-thin">
        {buffer.length > 0 && (
          <div className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-mono text-[#1D4ED8]">
            {buffer.join(' ')}
          </div>
        )}

        {SYMBOL_SECTIONS.map((sec) => (
          <div key={sec.title}>
            <p className="text-[11px] font-bold text-slate-700 mb-1.5">{sec.title}</p>
            <div className="grid grid-cols-7 gap-1.5">
              {sec.symbols.map((sym, idx) => (
                <button
                  key={`${sec.title}-${sym}-${idx}`}
                  type="button"
                  onClick={() => handleAppend(sym)}
                  className="h-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:border-[#15629E] hover:bg-blue-50 hover:text-[#15629E] transition-colors"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-white px-3.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setBuffer((prev) => prev.slice(0, -1))}
            className="rounded-lg border border-blue-300 bg-white hover:bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1D4ED8]"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => setBuffer([])}
            className="rounded-lg border border-blue-300 bg-white hover:bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1D4ED8]"
          >
            Clear
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            onInsertEquation(buffer.length > 0 ? buffer.join(' ') : 'Σ x = 0');
            onClose();
          }}
          className="rounded-lg bg-[#F39200] hover:bg-[#DF8500] px-4 py-1.5 text-xs font-semibold text-slate-950"
        >
          Insert Equation
        </button>
      </div>
    </div>
  );
};

/* 2. Ink Equation Popover (Screenshot 2 Panel 2) */
const RECOGNIZED_SAMPLES = ['y = 2x + 3', 'y = x² - 4', 'a² + b² = c²', 'f(x) = sin(x)'];

export const InkEquationPopover: React.FC<{
  onInsertEquation: (eq: string) => void;
  onClose: () => void;
}> = ({ onInsertEquation, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<{ x: number; y: number }[][]>([]);
  const [drawing, setDrawing] = useState(false);
  const [previewEquation, setPreviewEquation] = useState('y = 2x + 3');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    strokes.forEach((pts) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    });
  }, [strokes]);

  const getPt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * e.currentTarget.width) / rect.width,
      y: ((e.clientY - rect.top) * e.currentTarget.height) / rect.height,
    };
  };

  return (
    <div
      role="dialog"
      aria-label="Ink Equation"
      className="w-[340px] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between bg-[#0E5A9E] px-4 py-2.5 text-white">
        <span className="text-sm font-semibold">Σ Ink Equation</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Ink Equation"
          className="rounded-lg p-1 text-white/80 hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="relative rounded-xl border-2 border-dashed border-slate-200 bg-[#F8FAFC] p-1.5">
          <canvas
            ref={canvasRef}
            width={296}
            height={130}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDrawing(true);
              setStrokes((prev) => [...prev, [getPt(e)]]);
            }}
            onPointerMove={(e) => {
              if (!drawing) return;
              const pt = getPt(e);
              setStrokes((prev) => {
                const next = [...prev];
                next[next.length - 1] = [...next[next.length - 1], pt];
                return next;
              });
            }}
            onPointerUp={() => {
              setDrawing(false);
              setPreviewEquation(
                RECOGNIZED_SAMPLES[strokes.length % RECOGNIZED_SAMPLES.length]
              );
            }}
            className="w-full h-[130px] rounded-lg bg-white touch-none cursor-crosshair block"
          />
          {strokes.length === 0 && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              Draw an equation here...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
          <span className="font-semibold text-slate-700 shrink-0">Input preview:</span>
          <input
            type="text"
            aria-label="Recognized equation preview"
            value={previewEquation}
            onChange={(e) => setPreviewEquation(e.target.value)}
            className="w-full font-mono font-semibold text-[#1D4ED8] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStrokes((prev) => prev.slice(0, -1))}
              className="rounded-lg border border-blue-300 bg-white hover:bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1D4ED8]"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => {
                setStrokes([]);
                setPreviewEquation('');
              }}
              className="rounded-lg border border-blue-300 bg-white hover:bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1D4ED8]"
            >
              Clear
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              onInsertEquation(previewEquation.trim() || 'y = 2x + 3');
              onClose();
            }}
            className="rounded-lg bg-[#F39200] hover:bg-[#DF8500] px-4 py-1.5 text-xs font-semibold text-slate-950"
          >
            Insert Equation
          </button>
        </div>
      </div>
    </div>
  );
};
