import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  CheckCircle2,
  Compass,
  X,
} from 'lucide-react';
import type { SessionClosureReport } from '../utils/tutorRuntimeOrchestrator';

interface SessionClosureModalProps {
  open: boolean;
  report: SessionClosureReport;
  onContinueSession: () => void;
  onConfirmEndAndSave: (report: SessionClosureReport) => void;
}

/**
 * Section 15: Honest Session Closure Summary Modal
 * Summarizes key learning, reinforces stable concepts, honestly names remaining weak areas,
 * recommends focused next steps, and gives authentic acknowledgement without inflated mastery.
 */
export const SessionClosureModal: React.FC<SessionClosureModalProps> = ({
  open,
  report,
  onContinueSession,
  onConfirmEndAndSave,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-closure-title"
    >
      <div
        className="fixed inset-0 bg-slate-950/55 backdrop-blur-[2px]"
        onClick={onContinueSession}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Top Navy Header */}
        <div className="flex items-start justify-between gap-4 bg-[#0B2242] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-300/30">
              <Award className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-200">
                Session Wrap-Up · {report.sessionTypeLabel}
              </p>
              <h2
                id="session-closure-title"
                className="font-display text-lg font-bold text-white leading-snug"
              >
                {report.sessionTitle}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onContinueSession}
            aria-label="Close wrap-up and continue session"
            className="rounded-xl p-1.5 text-white/75 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Earned Mastery Standing */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 space-y-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Mastery Standing
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-[#1245A8]">
                <span>{report.masteryBand}</span>
                <span className="tabular-nums">· {report.masteryPercent}%</span>
              </span>
            </div>
            <p className="text-[13px] text-slate-800 leading-relaxed">
              {report.authenticAcknowledgement}
            </p>
            <p className="text-[12px] text-slate-600 leading-snug">{report.honestMasteryNote}</p>
          </div>

          {/* Stable Concepts */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              <span>What Is Stabilizing Well</span>
            </h3>
            <ul className="space-y-1.5">
              {report.stableConcepts.map((item) => (
                <li
                  key={item}
                  className="rounded-xl bg-emerald-50/70 border border-emerald-100 px-3.5 py-2 text-[12.5px] text-emerald-950"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Honest Remaining Weak Areas */}
          {report.remainingWeakAreas.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                <span>Areas to Strengthen Next</span>
              </h3>
              <ul className="space-y-1.5">
                {report.remainingWeakAreas.map((area) => (
                  <li
                    key={area}
                    className="rounded-xl bg-amber-50/75 border border-amber-200/70 px-3.5 py-2 text-[12.5px] text-amber-950"
                  >
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Next Steps */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1245A8] flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-[#1245A8]" aria-hidden="true" />
              <span>Recommended Next Steps</span>
            </h3>
            <ul className="space-y-1.5">
              {report.recommendedNextSteps.map((step) => (
                <li
                  key={step}
                  className="flex items-start gap-2 rounded-xl bg-blue-50/60 border border-blue-100 px-3.5 py-2 text-[12.5px] text-slate-800"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-[#1245A8] shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onContinueSession}
              className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors"
            >
              Keep Learning
            </button>
            <button
              type="button"
              onClick={() => onConfirmEndAndSave(report)}
              className="w-full sm:w-auto rounded-xl bg-[#1245A8] hover:bg-[#0D3585] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              Save Progress &amp; Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
