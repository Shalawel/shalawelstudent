import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  CornerDownLeft,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { ProblemAttachment, ProblemSolverPayload } from '../types/dashboard';
import {
  formatFileSizeLabel,
  isTextProblemFile,
  shouldTriggerEnterSubmit,
  validateProblemFileMeta,
  validateProblemSubmission,
} from '../utils/problemSolverLogic';

interface SolveProblemDrawerProps {
  open: boolean;
  onClose: () => void;
  onLaunchProblemClassroom: (payload: ProblemSolverPayload) => void;
}

const SAMPLE_PROBLEMS = [
  'Solve for x: 3x + 7 = 22 and verify the answer.',
  'A rectangle is 12 cm long and 7 cm wide. Find its perimeter and area.',
  'Why does ice float on liquid water even though both are made of H2O?',
];

/** Detailed SVG Basketball with curved seams */
const BasketballSvg: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="bballGrad" cx="35%" cy="30%" r="68%">
        <stop offset="0%" stopColor="#FFB347" />
        <stop offset="55%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#C2410C" />
      </radialGradient>
    </defs>
    <circle cx="24" cy="24" r="21" fill="url(#bballGrad)" stroke="#7C2D12" strokeWidth="1.8" />
    {/* Classic basketball curved seams */}
    <path d="M3 24H45" stroke="#431407" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M24 3V45" stroke="#431407" strokeWidth="1.6" strokeLinecap="round" />
    <path
      d="M11 7.5C17 14 17 34 11 40.5"
      stroke="#431407"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M37 7.5C31 14 31 34 37 40.5"
      stroke="#431407"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Subtle glossy highlight */}
    <ellipse cx="16.5" cy="14" rx="5.5" ry="3" transform="rotate(-24 16.5 14)" fill="#FFFFFF" fillOpacity="0.28" />
  </svg>
);

type ShotPhase = 'idle' | 'shooting' | 'swish';

export const SolveProblemDrawer: React.FC<SolveProblemDrawerProps> = ({
  open,
  onClose,
  onLaunchProblemClassroom,
}) => {
  const [problemText, setProblemText] = useState('');
  const [attachment, setAttachment] = useState<ProblemAttachment | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basketball swish animation state
  const [shotPhase, setShotPhase] = useState<ShotPhase>('idle');
  const shotPhaseRef = useRef<ShotPhase>('idle');
  shotPhaseRef.current = shotPhase;

  const [shotId, setShotId] = useState(0);
  const [shotCaption, setShotCaption] = useState<string>(
    'Upload a file or press Enter to shoot!'
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    if (!open) {
      clearTimers();
      setShotPhase('idle');
      setError(null);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && shotPhaseRef.current === 'idle') {
        onCloseRef.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    const focusTimer = window.setTimeout(() => textareaRef.current?.focus(), 180);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(focusTimer);
      clearTimers();
    };
  }, [open]);

  if (!open) return null;

  const triggerBasketballShot = (opts: {
    sourceLabel: string;
    payloadToLaunch: ProblemSolverPayload | null;
  }) => {
    clearTimers();
    setError(null);
    setShotId((n) => n + 1);
    setShotPhase('shooting');
    setShotCaption(`Shooting ${opts.sourceLabel} to the basket...`);

    const swishTimer = window.setTimeout(() => {
      setShotPhase('swish');
      setShotCaption(
        opts.payloadToLaunch
          ? 'SWISH! Opening your Problem Classroom...'
          : `SWISH! ${opts.sourceLabel} landed in the net — press Enter to open classroom!`
      );
    }, 560);
    timersRef.current.push(swishTimer);

    const finishTimer = window.setTimeout(() => {
      if (opts.payloadToLaunch) {
        const launchData = opts.payloadToLaunch;
        setProblemText('');
        setAttachment(null);
        setShotPhase('idle');
        setShotCaption('Upload a file or press Enter to shoot!');
        onLaunchProblemClassroom(launchData);
      } else {
        setShotPhase('idle');
      }
    }, 1150);
    timersRef.current.push(finishTimer);
  };

  const processSelectedFile = async (file: File) => {
    const check = validateProblemFileMeta({
      name: file.name,
      type: file.type,
      size: file.size,
    });
    if (!check.valid) {
      setError(check.error ?? 'Unsupported file type.');
      return;
    }

    setError(null);

    try {
      let nextAttachment: ProblemAttachment;

      if (isTextProblemFile(file.name, file.type)) {
        const textContent = await file.text();
        nextAttachment = {
          fileName: file.name,
          mimeType: file.type || 'text/plain',
          sizeBytes: file.size,
          textContent: textContent.slice(0, 6000),
        };
      } else {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(new Error('Could not read uploaded file.'));
          reader.readAsDataURL(file);
        });
        const commaIdx = dataUrl.indexOf(',');
        const base64Data = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
        const resolvedMime =
          file.type ||
          (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/png');

        nextAttachment = {
          fileName: file.name,
          mimeType: resolvedMime,
          sizeBytes: file.size,
          base64Data,
          previewDataUrl: resolvedMime.startsWith('image/') ? dataUrl : undefined,
        };
      }

      setAttachment(nextAttachment);

      // Shoot the uploaded file into the basketball net!
      // If user hasn't typed a draft yet, swish right into the Problem Classroom;
      // if they already typed notes, swish to confirm attachment and let Enter/CTA launch.
      const hasTypedNotes = problemText.trim().length > 0;
      triggerBasketballShot({
        sourceLabel: `"${file.name}"`,
        payloadToLaunch: hasTypedNotes
          ? null
          : {
              problemText: '',
              attachment: nextAttachment,
            },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to read the selected file.');
    }
  };

  const handleLaunchSubmit = () => {
    if (shotPhase !== 'idle') return;
    const validation = validateProblemSubmission({ problemText, attachment });
    if (!validation.valid) {
      setError(validation.error ?? 'Please upload a file or write your problem.');
      return;
    }
    triggerBasketballShot({
      sourceLabel: attachment ? `"${attachment.fileName}"` : 'your problem',
      payloadToLaunch: {
        problemText: problemText.trim(),
        attachment,
      },
    });
  };

  const isReady = Boolean(problemText.trim().length >= 3 || attachment);
  const isAnimating = shotPhase !== 'idle';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="solve-problem-drawer-title"
      data-testid="solve-problem-drawer"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity"
        onClick={() => {
          if (!isAnimating) onClose();
        }}
        aria-hidden="true"
      />

      {/* Right-side Slide-Over Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-[560px] flex-col bg-white shadow-2xl animate-drawer-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#28C768] to-[#17A34A] text-white shadow-sm">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="solve-problem-drawer-title"
                className="font-display text-[17.5px] font-bold text-slate-900 leading-tight"
              >
                Solve my Problem
              </h2>
              <p className="mt-0.5 text-[13px] text-slate-500">
                Upload a question file or write your problem to shoot straight into a focused classroom.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isAnimating}
            onClick={onClose}
            aria-label="Close Solve my Problem drawer"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17A34A]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-6 py-5 space-y-5 scrollbar-thin">
          <div className="space-y-5">
            {/* INTERACTIVE BASKETBALL HOOP & NET STAGE */}
            <div
              data-testid="basketball-hoop-stage"
              data-shot-phase={shotPhase}
              className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-[#F0F9FF] via-[#F8FAFC] to-[#FFF7ED] px-4 pt-3 pb-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
            >
              {/* Status Strip */}
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#C2410C] whitespace-nowrap shrink-0">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      shotPhase === 'swish'
                        ? 'bg-emerald-500 animate-ping'
                        : shotPhase === 'shooting'
                        ? 'bg-orange-500 animate-pulse'
                        : 'bg-orange-400'
                    }`}
                  />
                  <span>Problem Hoop</span>
                </span>
                <span
                  data-testid="basketball-shot-caption"
                  className={`text-[11.5px] font-semibold truncate ${
                    shotPhase === 'swish' ? 'text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  {shotCaption}
                </span>
              </div>

              {/* Court & Hoop Canvas */}
              <div className="relative h-[154px] w-full select-none">
                <svg
                  viewBox="0 0 460 154"
                  className="h-full w-full overflow-visible"
                  role="img"
                  aria-label="Basketball hoop and net animation for problem launch"
                >
                  {/* Subtle court arc & floor line */}
                  <line x1="14" y1="142" x2="446" y2="142" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                  <path
                    d="M 52 126 Q 190 -8 338 64"
                    fill="none"
                    stroke={shotPhase !== 'idle' ? '#FB923C' : '#CBD5E1'}
                    strokeWidth="2"
                    strokeDasharray="6 6"
                    opacity={shotPhase !== 'idle' ? 0.9 : 0.65}
                  />

                  {/* Hoop Stand Pole */}
                  <rect x="404" y="24" width="10" height="118" rx="4" fill="#334155" />
                  <rect x="394" y="135" width="30" height="8" rx="3" fill="#1E293B" />

                  {/* Backboard Support Arm */}
                  <rect x="382" y="40" width="24" height="7" rx="3" fill="#475569" />

                  {/* Glass Backboard */}
                  <rect
                    x="374"
                    y="14"
                    width="12"
                    height="62"
                    rx="3"
                    fill="#FFFFFF"
                    stroke="#0F172A"
                    strokeWidth="2.4"
                  />
                  {/* Red/Orange Shooter's Square edge */}
                  <rect x="374" y="34" width="4" height="24" fill="#EA580C" />

                  {/* Back Rim Ring */}
                  <ellipse
                    cx="344"
                    cy="62"
                    rx="27"
                    ry="6"
                    fill="none"
                    stroke="#C2410C"
                    strokeWidth="3.5"
                  />

                  {/* Animated Woven Basketball Net */}
                  <motion.g
                    style={{ transformOrigin: '344px 62px' }}
                    animate={
                      shotPhase === 'swish'
                        ? {
                            scaleX: [1, 1.22, 0.88, 1.08, 1],
                            scaleY: [1, 1.18, 0.92, 1.05, 1],
                            skewX: [0, -7, 6, -3, 0],
                          }
                        : { scaleX: 1, scaleY: 1, skewX: 0 }
                    }
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                  >
                    {/* Net outer silhouette */}
                    <path
                      d="M318 64 L327 112 L361 112 L370 64"
                      fill="rgba(255,255,255,0.62)"
                      stroke="#94A3B8"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    {/* Crisp diamond net mesh lines */}
                    <path
                      d="M322 65 L337 111 M334 65 L349 111 M346 65 L359 109 M358 65 L364 90"
                      stroke="#64748B"
                      strokeWidth="1.35"
                    />
                    <path
                      d="M366 65 L351 111 M354 65 L339 111 M342 65 L329 109 M330 65 L324 90"
                      stroke="#64748B"
                      strokeWidth="1.35"
                    />
                    {/* Horizontal net loops */}
                    <path
                      d="M321 79 Q344 85 367 79 M324 95 Q344 101 364 95"
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="1.3"
                    />
                  </motion.g>

                  {/* Front Rim Bar (renders in front of net top) */}
                  <path
                    d="M316 62 Q344 70 372 62"
                    fill="none"
                    stroke="#EA580C"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {/* Rim Bracket */}
                  <rect x="370" y="59" width="7" height="7" rx="1.5" fill="#9A3412" />

                  {/* Swish Sparkle Burst */}
                  {shotPhase === 'swish' && (
                    <g data-testid="basketball-swish-burst">
                      <motion.circle
                        cx="344"
                        cy="86"
                        r="14"
                        fill="none"
                        stroke="#16A34A"
                        strokeWidth="2.5"
                        initial={{ scale: 0.4, opacity: 1 }}
                        animate={{ scale: 2.2, opacity: 0 }}
                        transition={{ duration: 0.55 }}
                      />
                      <motion.text
                        x="284"
                        y="42"
                        fontSize="16"
                        fontWeight="800"
                        fill="#15803D"
                        initial={{ opacity: 0, y: 12, scale: 0.7 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25 }}
                      >
                        SWISH!
                      </motion.text>
                    </g>
                  )}

                  {/* Starting launch tee badge */}
                  <ellipse cx="52" cy="142" rx="22" ry="4" fill="#CBD5E1" opacity="0.65" />
                </svg>

                {/* Animated Spinning Basketball (Parabolic Arc -> Through Net) */}
                <AnimatePresence mode="wait">
                  {shotPhase === 'idle' ? (
                    <motion.div
                      key="ball-idle"
                      className="absolute left-[28px] bottom-[12px] pointer-events-none"
                      animate={{ y: [0, -7, 0] }}
                      transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <BasketballSvg size={44} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`ball-shot-${shotId}`}
                      data-testid="basketball-shot-active"
                      className="absolute left-0 top-0 pointer-events-none"
                      initial={{ x: 28, y: 98, scale: 1, rotate: 0, opacity: 1 }}
                      animate={{
                        x: [28, 125, 240, 322, 322, 322],
                        y: [98, 22, 0, 38, 86, 118],
                        scale: [1, 1.06, 0.96, 0.86, 0.82, 0.76],
                        rotate: [0, 180, 380, 560, 720, 840],
                        opacity: [1, 1, 1, 1, 1, 0],
                      }}
                      transition={{
                        duration: 0.95,
                        times: [0, 0.24, 0.48, 0.68, 0.86, 1],
                        ease: 'easeInOut',
                      }}
                    >
                      <BasketballSvg size={44} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 1. UPLOAD QUESTION FILE DROPZONE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13.5px] font-semibold text-slate-900">
                  Upload Question File
                </label>
                <span className="text-[11.5px] text-slate-500">
                  PNG, JPG, PDF, or TXT · Max 8 MB
                </span>
              </div>

              <input
                ref={fileInputRef}
                data-testid="solve-problem-file-input"
                type="file"
                accept="image/*,.pdf,.txt,.md,.csv"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void processSelectedFile(file);
                  }
                  e.target.value = '';
                }}
              />

              <div
                role="button"
                tabIndex={0}
                onClick={() => !isAnimating && fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isAnimating) {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file && !isAnimating) {
                    void processSelectedFile(file);
                  }
                }}
                className={`group cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17A34A] ${
                  isDraggingFile
                    ? 'border-[#17A34A] bg-emerald-50/70'
                    : attachment
                    ? 'border-emerald-300 bg-emerald-50/35'
                    : 'border-slate-300/90 bg-[#F8FAFC] hover:border-[#17A34A] hover:bg-emerald-50/30'
                }`}
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-slate-200 text-[#17A34A] shadow-2xs group-hover:scale-105 transition-transform">
                  <Upload className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-2.5 text-[13.5px] font-semibold text-slate-900">
                  {isDraggingFile
                    ? 'Release to shoot file into the basket!'
                    : 'Click to upload or drag & drop your question file'}
                </p>
                <p className="mt-1 text-[12px] text-slate-500">
                  Photo of homework, worksheet PDF, or text question — shoots straight to the net
                </p>
              </div>

              {/* Attached File Preview Card */}
              {attachment && (
                <div
                  data-testid="uploaded-problem-preview"
                  className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {attachment.previewDataUrl ? (
                      <img
                        src={attachment.previewDataUrl}
                        alt={attachment.fileName}
                        className="h-11 w-11 rounded-lg object-cover border border-emerald-200 shrink-0"
                      />
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white border border-emerald-200 text-emerald-700">
                        {attachment.mimeType.startsWith('image/') ? (
                          <ImageIcon className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 truncate">
                        {attachment.fileName}
                      </p>
                      <p className="text-[11.5px] text-emerald-800">
                        {formatFileSizeLabel(attachment.sizeBytes)} · Ready for Maya
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isAnimating}
                    onClick={() => setAttachment(null)}
                    aria-label="Remove uploaded file"
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Or write your problem
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            {/* 2. WRITE THE PROBLEM SCENARIO (Enter Key Shoots to Net & Opens Classroom!) */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label
                  htmlFor="solve-problem-textarea"
                  className="text-[13.5px] font-semibold text-slate-900"
                >
                  Write your Question or Problem Scenario
                </label>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
                  <span>Enter to shoot</span>
                </span>
              </div>

              <textarea
                ref={textareaRef}
                id="solve-problem-textarea"
                data-testid="solve-problem-textarea"
                rows={4}
                disabled={isAnimating}
                value={problemText}
                onChange={(e) => {
                  setProblemText(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => {
                  if (
                    shouldTriggerEnterSubmit({
                      key: e.key,
                      shiftKey: e.shiftKey,
                      isComposing: e.nativeEvent.isComposing,
                    })
                  ) {
                    e.preventDefault();
                    handleLaunchSubmit();
                  }
                }}
                placeholder="Type or paste your math, science, or homework problem here... Press Enter to shoot it into the basket and open the classroom! (Shift+Enter for new line)"
                className={`w-full rounded-2xl border bg-[#F8FAFC] px-4 py-3 text-[13.5px] text-slate-900 placeholder:text-slate-400 leading-relaxed transition-colors focus:bg-white focus:border-[#17A34A] focus:outline-none focus:ring-2 focus:ring-[#17A34A]/20 disabled:opacity-60 ${
                  error ? 'border-rose-400' : 'border-slate-200'
                }`}
              />

              {/* Sample Problem Quick Chips */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 mr-0.5">Try:</span>
                {SAMPLE_PROBLEMS.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    disabled={isAnimating}
                    onClick={() => {
                      setProblemText(sample);
                      setError(null);
                      textareaRef.current?.focus();
                    }}
                    className="rounded-lg border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors text-left"
                  >
                    {sample.length > 42 ? `${sample.slice(0, 39)}...` : sample}
                  </button>
                ))}
              </div>

              {error && (
                <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Bottom Launch CTA */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <button
              type="button"
              data-testid="solve-problem-submit-btn"
              disabled={isAnimating}
              onClick={handleLaunchSubmit}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 px-5 text-[14px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17A34A] ${
                isReady || isAnimating
                  ? 'bg-gradient-to-r from-[#17A34A] to-[#15803D] hover:brightness-105 text-white shadow-[0_6px_18px_rgba(23,163,74,0.28)]'
                  : 'bg-[#EFEFF1] hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              {isAnimating ? (
                <span>
                  {shotPhase === 'swish' ? 'SWISH! Launching Classroom...' : 'Shooting to the Basket...'}
                </span>
              ) : (
                <>
                  {attachment && <Paperclip className="h-4 w-4" aria-hidden="true" />}
                  <span>Shoot &amp; Open Problem Classroom</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
            <p className="text-center text-[11.5px] text-slate-500">
              Your classroom conversation will focus exclusively on the problem you submit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
