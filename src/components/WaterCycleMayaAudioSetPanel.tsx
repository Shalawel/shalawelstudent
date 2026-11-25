import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  AudioLines,
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import {
  WATER_CYCLE_MAYA_AUDIO_SET,
  formatClipDuration,
  type MayaAudioClipGroup,
  type MayaWaterCycleAudioClip,
} from '../utils/waterCycleAudioSet';
import type { WaterCycleStageId } from '../utils/waterCycleLogic';
import { playUiSound } from '../utils/uiSounds';

interface ClipRuntimeState {
  status: 'missing' | 'generating' | 'ready' | 'fallback';
  audioUrl: string | null;
  byteSize: number;
  generatedAt: string | null;
  model: string | null;
}

interface ManifestClipDto extends MayaWaterCycleAudioClip {
  status: 'ready' | 'missing';
  audioUrl: string | null;
  byteSize: number;
  generatedAt: string | null;
  model: string | null;
}

interface WaterCycleMayaAudioSetPanelProps {
  open: boolean;
  activeChapterIndex: number;
  onClose: () => void;
  onJumpToChapter: (chapterIndex: number, stageId?: WaterCycleStageId) => void;
  onFallbackSpeak: (spokenText: string) => void;
  onReadyCountChange?: (readyCount: number, totalCount: number) => void;
}

type AudioSetFilter = 'all' | MayaAudioClipGroup;

function formatKilobytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = Math.round(bytes / 1024);
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export const WaterCycleMayaAudioSetPanel: React.FC<WaterCycleMayaAudioSetPanelProps> = ({
  open,
  activeChapterIndex,
  onClose,
  onJumpToChapter,
  onFallbackSpeak,
  onReadyCountChange,
}) => {
  const [filter, setFilter] = useState<AudioSetFilter>('all');
  const [clipStates, setClipStates] = useState<Record<string, ClipRuntimeState>>(() => {
    const initial: Record<string, ClipRuntimeState> = {};
    for (const clip of WATER_CYCLE_MAYA_AUDIO_SET) {
      initial[clip.id] = {
        status: 'missing',
        audioUrl: null,
        byteSize: 0,
        generatedAt: null,
        model: null,
      };
    }
    return initial;
  });

  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; label: string } | null>(
    null
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [isPlaylistMode, setIsPlaylistMode] = useState(false);
  const [playProgressPct, setPlayProgressPct] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelBatchRef = useRef(false);
  const playlistQueueRef = useRef<string[]>([]);
  const clipStatesRef = useRef(clipStates);
  clipStatesRef.current = clipStates;

  const readyCount = useMemo(
    () =>
      WATER_CYCLE_MAYA_AUDIO_SET.filter((c) => clipStates[c.id]?.status === 'ready').length,
    [clipStates]
  );

  useEffect(() => {
    onReadyCountChange?.(readyCount, WATER_CYCLE_MAYA_AUDIO_SET.length);
  }, [readyCount, onReadyCountChange]);

  const stopAudio = useCallback(() => {
    playlistQueueRef.current = [];
    setIsPlaylistMode(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setPlayingClipId(null);
    setPlayProgressPct(0);
  }, []);

  useEffect(() => {
    return () => {
      cancelBatchRef.current = true;
      stopAudio();
    };
  }, [stopAudio]);

  // Hydrate manifest from server on mount
  const fetchManifest = useCallback(async () => {
    try {
      const res = await fetch('/api/tutor/water-cycle-audio-set');
      if (!res.ok) return;
      const data = (await res.json()) as {
        clips?: ManifestClipDto[];
      };
      if (!Array.isArray(data.clips)) return;
      setClipStates((prev) => {
        const next = { ...prev };
        for (const item of data.clips ?? []) {
          next[item.id] = {
            status: item.status === 'ready' ? 'ready' : 'missing',
            audioUrl: item.audioUrl,
            byteSize: item.byteSize,
            generatedAt: item.generatedAt,
            model: item.model,
          };
        }
        return next;
      });
    } catch {
      // Non-fatal; manifest refreshes on next user action
    }
  }, []);

  useEffect(() => {
    void fetchManifest();
  }, [fetchManifest]);

  const generateSingleClip = useCallback(
    async (
      clip: MayaWaterCycleAudioClip,
      forceRegenerate = false
    ): Promise<{ ok: boolean; audioUrl: string | null; fallbackNotice?: string; error?: string }> => {
      setClipStates((prev) => ({
        ...prev,
        [clip.id]: { ...prev[clip.id], status: 'generating' },
      }));

      try {
        const res = await fetch('/api/tutor/water-cycle-audio-set/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clipId: clip.id, forceRegenerate }),
        });
        const data = (await res.json()) as {
          generated?: Array<{
            id: string;
            status: 'ready' | 'fallback';
            audioUrl: string | null;
            byteSize: number;
            generatedAt: string | null;
            model: string | null;
          }>;
          fallbackMode?: 'browser_speech';
          notice?: string;
          error?: string;
        };

        if (!res.ok) {
          const msg = data.error || 'Could not generate Maya audio clip.';
          setClipStates((prev) => ({
            ...prev,
            [clip.id]: { ...prev[clip.id], status: 'missing' },
          }));
          return { ok: false, audioUrl: null, error: msg };
        }

        const item = data.generated?.[0];
        if (item?.status === 'ready' && item.audioUrl) {
          const bustUrl = `${item.audioUrl}?v=${Date.now()}`;
          setClipStates((prev) => ({
            ...prev,
            [clip.id]: {
              status: 'ready',
              audioUrl: bustUrl,
              byteSize: item.byteSize,
              generatedAt: item.generatedAt,
              model: item.model,
            },
          }));
          return { ok: true, audioUrl: bustUrl };
        }

        if (data.fallbackMode === 'browser_speech') {
          setClipStates((prev) => ({
            ...prev,
            [clip.id]: { ...prev[clip.id], status: 'fallback', audioUrl: null },
          }));
          return {
            ok: false,
            audioUrl: null,
            fallbackNotice:
              data.notice ||
              'Gemini TTS quota reached — playing with built-in browser voice instead.',
          };
        }

        setClipStates((prev) => ({
          ...prev,
          [clip.id]: { ...prev[clip.id], status: 'missing' },
        }));
        return { ok: false, audioUrl: null, error: 'No audio returned for this clip.' };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Network error generating Maya audio.';
        setClipStates((prev) => ({
          ...prev,
          [clip.id]: { ...prev[clip.id], status: 'missing' },
        }));
        return { ok: false, audioUrl: null, error: msg };
      }
    },
    []
  );

  const handleGenerateFullSet = async (forceRegenerate = false) => {
    if (isBatchGenerating) return;
    playUiSound('pop');
    setErrorMessage(null);
    setStatusMessage(null);
    cancelBatchRef.current = false;

    const targets = WATER_CYCLE_MAYA_AUDIO_SET.filter(
      (clip) => forceRegenerate || clipStatesRef.current[clip.id]?.status !== 'ready'
    );

    if (targets.length === 0) {
      setStatusMessage('All 10 Maya Water Cycle audio clips are already generated and ready.');
      return;
    }

    setIsBatchGenerating(true);
    let completed = 0;

    for (let i = 0; i < targets.length; i += 1) {
      if (cancelBatchRef.current) {
        setStatusMessage(`Stopped after generating ${completed} of ${targets.length} clips.`);
        break;
      }

      const clip = targets[i];
      setBatchProgress({
        current: i + 1,
        total: targets.length,
        label: clip.label,
      });

      const result = await generateSingleClip(clip, forceRegenerate);
      if (result.ok) {
        completed += 1;
        continue;
      }

      if (result.fallbackNotice) {
        setStatusMessage(result.fallbackNotice);
        break;
      }

      if (result.error) {
        setErrorMessage(result.error);
        break;
      }
    }

    setIsBatchGenerating(false);
    setBatchProgress(null);

    if (!cancelBatchRef.current && completed === targets.length) {
      playUiSound('success');
      setStatusMessage(
        `Generated complete Maya Audio Set (${WATER_CYCLE_MAYA_AUDIO_SET.length} WAV clips ready for playback & download).`
      );
    }
  };

  const playClipById = useCallback(
    async (clipId: string, syncChapter = false) => {
      const clip = WATER_CYCLE_MAYA_AUDIO_SET.find((c) => c.id === clipId);
      if (!clip) return;

      setErrorMessage(null);

      // Toggle off if already playing this exact clip in single mode
      if (playingClipId === clipId && !isPlaylistMode) {
        stopAudio();
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }

      if (syncChapter) {
        onJumpToChapter(clip.chapterIndex, clip.stageId);
      }

      let audioUrl = clipStatesRef.current[clip.id]?.audioUrl;
      if (!audioUrl) {
        const gen = await generateSingleClip(clip, false);
        if (gen.ok && gen.audioUrl) {
          audioUrl = gen.audioUrl;
        } else if (gen.fallbackNotice) {
          setStatusMessage(gen.fallbackNotice);
          setPlayingClipId(null);
          onFallbackSpeak(clip.script);
          return;
        } else {
          setErrorMessage(gen.error || 'Could not generate audio clip.');
          setPlayingClipId(null);
          return;
        }
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setPlayingClipId(clip.id);
      setPlayProgressPct(0);

      audio.ontimeupdate = () => {
        if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
          setPlayProgressPct(Math.min(100, Math.round((audio.currentTime / audio.duration) * 100)));
        }
      };

      audio.onended = () => {
        setPlayProgressPct(0);
        const nextId = playlistQueueRef.current.shift();
        if (nextId) {
          void playClipById(nextId, true);
        } else {
          setPlayingClipId(null);
          setIsPlaylistMode(false);
        }
      };

      audio.onerror = () => {
        setPlayingClipId(null);
        setIsPlaylistMode(false);
        setPlayProgressPct(0);
        setErrorMessage(`Could not play ${clip.label}. Try regenerating this clip.`);
      };

      try {
        await audio.play();
      } catch {
        setPlayingClipId(null);
        setIsPlaylistMode(false);
        setErrorMessage('Browser paused autoplay — click Play on the clip to hear Maya.');
      }
    },
    [generateSingleClip, isPlaylistMode, onFallbackSpeak, onJumpToChapter, playingClipId, stopAudio]
  );

  const visibleClips = useMemo(() => {
    if (filter === 'all') return WATER_CYCLE_MAYA_AUDIO_SET;
    return WATER_CYCLE_MAYA_AUDIO_SET.filter((c) => c.group === filter);
  }, [filter]);

  const handlePlayFullSet = () => {
    if (isPlaylistMode && playingClipId) {
      playUiSound('click');
      stopAudio();
      return;
    }
    if (visibleClips.length === 0) return;
    playUiSound('switch');
    const [first, ...rest] = visibleClips.map((c) => c.id);
    playlistQueueRef.current = rest;
    setIsPlaylistMode(true);
    void playClipById(first, true);
  };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.section
          key="maya-audio-set-panel"
          data-testid="water-cycle-maya-audio-set-panel"
          aria-label="Maya Audio Set for Water Cycle & Weather"
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="rounded-2xl border border-sky-200/90 bg-gradient-to-br from-[#F7FBFF] via-white to-[#FFFBF2] p-4 sm:p-5 shadow-[0_6px_22px_rgba(21,98,158,0.08)] space-y-4">
            {/* Top Header Row */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0B3B66] px-2.5 py-0.5 text-[11px] font-bold text-white">
                    <AudioLines className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
                    <span>Maya Voice Audio Set</span>
                  </span>
                  <span
                    data-testid="maya-audio-set-ready-count"
                    className="text-xs font-semibold text-slate-600 tabular-nums"
                  >
                    {readyCount} of {WATER_CYCLE_MAYA_AUDIO_SET.length} clips generated
                  </span>
                </div>
                <h2 className="font-display text-[15px] sm:text-base font-bold text-slate-900">
                  Water Cycle &amp; Weather — Complete Maya Narration Set
                </h2>
                <p className="text-xs text-slate-600 max-w-2xl">
                  Generate Maya’s voice once for all 6 Water Cycle chapters and 4 stage deep-dives
                  already in this lesson, play them in sequence, or download the combined WAV audio.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  stopAudio();
                  onClose();
                }}
                aria-label="Close Maya Audio Set panel"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Primary Controls + Filter Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                {isBatchGenerating ? (
                  <button
                    type="button"
                    onClick={() => {
                      cancelBatchRef.current = true;
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    <span>Stop Generating</span>
                  </button>
                ) : (
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid="generate-full-maya-set-btn"
                    onClick={() => void handleGenerateFullSet(false)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0095F6] hover:bg-[#0080D6] px-4 py-2 text-xs font-semibold text-white shadow-[0_3px_12px_rgba(0,149,246,0.28)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {readyCount === WATER_CYCLE_MAYA_AUDIO_SET.length
                        ? 'All 10 Clips Ready'
                        : readyCount > 0
                        ? `Generate Remaining (${WATER_CYCLE_MAYA_AUDIO_SET.length - readyCount})`
                        : 'Generate Full Maya Set (10)'}
                    </span>
                  </motion.button>
                )}

                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid="play-full-maya-set-btn"
                  onClick={handlePlayFullSet}
                  disabled={isBatchGenerating}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B3B66] hover:bg-[#082B4B] disabled:opacity-50 px-3.5 py-2 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPlaylistMode && playingClipId ? (
                    <>
                      <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Stop Set Playback</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                      <span>Play Full Set</span>
                    </>
                  )}
                </motion.button>

                {readyCount > 0 && (
                  <a
                    href="/api/tutor/water-cycle-audio-set/combined.wav"
                    download="maya-water-cycle-audio-set.wav"
                    data-testid="download-combined-maya-wav"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Download className="h-3.5 w-3.5 text-[#15629E]" aria-hidden="true" />
                    <span>Download Full WAV</span>
                  </a>
                )}
              </div>

              {/* Filter Tabs */}
              <div
                role="tablist"
                aria-label="Filter Maya audio tracks"
                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1"
              >
                {(
                  [
                    { id: 'all' as const, label: 'All (10)' },
                    { id: 'chapter' as const, label: 'Chapters (6)' },
                    { id: 'stage' as const, label: '4 Stages (4)' },
                  ] as const
                ).map((tab) => {
                  const active = filter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        playUiSound('click');
                        setFilter(tab.id);
                      }}
                      className={`relative rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="wc-audio-set-filter-pill"
                          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                          aria-hidden="true"
                          className="absolute inset-0 rounded-lg bg-white shadow-2xs"
                        />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Batch Progress Bar */}
            {batchProgress && (
              <div
                data-testid="maya-audio-batch-progress"
                className="rounded-xl border border-sky-200 bg-white px-3.5 py-2.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-2 font-semibold text-[#0F4D7D]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    <span>
                      Generating {batchProgress.current} of {batchProgress.total}:{' '}
                      {batchProgress.label}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-600 tabular-nums">
                    {Math.round((batchProgress.current / batchProgress.total) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.round((batchProgress.current / batchProgress.total) * 100)}%`,
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                    className="h-full rounded-full bg-[#0095F6]"
                  />
                </div>
              </div>
            )}

            {/* Status / Error Callouts */}
            {statusMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-2 text-xs text-emerald-900 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>{statusMessage}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setStatusMessage(null)}
                  aria-label="Dismiss status notice"
                  className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-900 flex items-center justify-between gap-2"
              >
                <span className="inline-flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  aria-label="Dismiss error"
                  className="text-rose-700 hover:text-rose-950 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Track List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              {visibleClips.map((clip) => {
                const state = clipStates[clip.id];
                const isReady = state?.status === 'ready';
                const isGen = state?.status === 'generating';
                const isPlaying = playingClipId === clip.id;
                const isCurrentChapter =
                  clip.group === 'chapter' && clip.chapterIndex === activeChapterIndex;

                return (
                  <motion.div
                    key={clip.id}
                    layout
                    data-testid={`maya-audio-clip-${clip.id}`}
                    className={`rounded-xl border p-3 transition-colors space-y-2 ${
                      isPlaying
                        ? 'border-[#0095F6] bg-[#F0F8FF]'
                        : isCurrentChapter
                        ? 'border-sky-300 bg-white'
                        : 'border-slate-200/90 bg-white/95 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => void playClipById(clip.id, false)}
                          disabled={isGen}
                          aria-label={isPlaying ? `Pause ${clip.label}` : `Play ${clip.label}`}
                          className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                            isPlaying
                              ? 'bg-[#0095F6] text-white'
                              : isReady
                              ? 'bg-[#0B3B66] hover:bg-[#082B4B] text-white'
                              : 'bg-sky-50 hover:bg-sky-100 text-[#15629E] border border-sky-200'
                          }`}
                        >
                          {isGen ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                          ) : isPlaying ? (
                            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Play className="h-3.5 w-3.5 fill-current ml-0.5" aria-hidden="true" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-[10.5px] font-bold text-slate-400 tabular-nums">
                              {String(clip.order).padStart(2, '0')}
                            </span>
                            <h3 className="text-xs font-bold text-slate-900 truncate">
                              {clip.label}
                            </h3>
                            <span className="text-[10.5px] text-slate-500 tabular-nums">
                              · ~{formatClipDuration(clip.estimatedSeconds)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {clip.script}
                          </p>
                        </div>
                      </div>

                      {/* Right mini-actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            playUiSound('click');
                            onJumpToChapter(clip.chapterIndex, clip.stageId);
                          }}
                          title={`Open ${clip.label}`}
                          aria-label={`Jump to ${clip.label}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-[#15629E] transition-colors cursor-pointer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>

                        {isReady && state.audioUrl ? (
                          <a
                            href={state.audioUrl}
                            download={`${clip.id}.wav`}
                            title={`Download ${clip.label} WAV`}
                            aria-label={`Download ${clip.label} WAV`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void generateSingleClip(clip, false)}
                            disabled={isGen || isBatchGenerating}
                            title={`Generate ${clip.label}`}
                            aria-label={`Generate Maya audio for ${clip.label}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-sky-50 hover:text-[#15629E] disabled:opacity-40 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Footer Status + Live Playback Bar */}
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        {isPlaying ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#0095F6]">
                            <Volume2 className="h-3 w-3" aria-hidden="true" />
                            <span>Maya speaking…</span>
                          </span>
                        ) : isGen ? (
                          <span className="font-semibold text-[#15629E]">Synthesizing WAV…</span>
                        ) : isReady ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                            <span>
                              WAV Ready
                              {state.byteSize > 0 ? ` · ${formatKilobytes(state.byteSize)}` : ''}
                            </span>
                          </span>
                        ) : (
                          <span>Not generated yet</span>
                        )}
                      </div>

                      {isPlaying && (
                        <div className="w-24 h-1.5 rounded-full bg-sky-100 overflow-hidden">
                          <div
                            style={{ width: `${Math.max(6, playProgressPct)}%` }}
                            className="h-full rounded-full bg-[#0095F6] transition-all duration-150"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};
