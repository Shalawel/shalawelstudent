import {
  WATER_CYCLE_CHAPTERS,
  WATER_CYCLE_STAGES,
  type WaterCycleChapterId,
  type WaterCycleStageId,
} from './waterCycleLogic.ts';

export type MayaAudioClipGroup = 'chapter' | 'stage';

export interface MayaWaterCycleAudioClip {
  id: string;
  order: number;
  group: MayaAudioClipGroup;
  chapterIndex: number;
  chapterId: WaterCycleChapterId;
  stageId?: WaterCycleStageId;
  label: string;
  title: string;
  script: string;
  voiceStyle: string;
  estimatedSeconds: number;
}

export function estimateSpeechDurationSec(script: string): number {
  const words = script.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(4, Math.round(words / 2.35));
}

export function formatClipDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

const CHAPTER_VOICE_STYLES: Record<WaterCycleChapterId, string> = {
  intro: 'Warm, curious Class 6 science tutor welcoming a student with bright storytelling energy',
  stages: 'Clear, enthusiastic Class 6 science tutor pacing calmly through four key science stages',
  weather: 'Friendly, inquisitive Class 6 science tutor inviting the student to be a weather detective',
  connection: 'Encouraging, clear Class 6 science tutor guiding an interactive cause-and-effect lab',
  'real-world': 'Conversational, relatable Class 6 science tutor connecting everyday observations to science',
  'knowledge-check': 'Supportive, reassuring Class 6 science tutor cheering the student on for a quick quiz',
};

const STAGE_VOICE_STYLES: Record<WaterCycleStageId, string> = {
  evaporation: 'Clear, upbeat Class 6 science tutor emphasizing sunlight warming liquid water into vapour',
  condensation: 'Calm, crisp Class 6 science tutor explaining cool upper air forming tiny cloud droplets',
  precipitation: 'Lively, articulate Class 6 science tutor describing heavy droplets falling as rain, snow, or hail',
  collection: 'Warm, steady Class 6 science tutor wrapping up how rainwater flows back to rivers and oceans',
};

export const WATER_CYCLE_MAYA_AUDIO_SET: MayaWaterCycleAudioClip[] = [
  ...WATER_CYCLE_CHAPTERS.map((chapter, index) => ({
    id: `wc-ch${chapter.number}-${chapter.id}`,
    order: index + 1,
    group: 'chapter' as const,
    chapterIndex: index,
    chapterId: chapter.id,
    label: chapter.shortTitle,
    title: chapter.title,
    script: chapter.mayaIntroScript,
    voiceStyle: CHAPTER_VOICE_STYLES[chapter.id],
    estimatedSeconds: estimateSpeechDurationSec(chapter.mayaIntroScript),
  })),
  ...WATER_CYCLE_STAGES.map((stage, index) => {
    const script = `Stage ${stage.letter}: ${stage.name}. ${stage.headline}. ${stage.explanation}`;
    return {
      id: `wc-stage-${stage.id}`,
      order: WATER_CYCLE_CHAPTERS.length + index + 1,
      group: 'stage' as const,
      chapterIndex: 1,
      chapterId: 'stages' as const,
      stageId: stage.id,
      label: `Stage ${stage.letter} · ${stage.name}`,
      title: `Stage ${stage.letter}: ${stage.name} — ${stage.headline}`,
      script,
      voiceStyle: STAGE_VOICE_STYLES[stage.id],
      estimatedSeconds: estimateSpeechDurationSec(script),
    };
  }),
];

export function findMayaWaterCycleClipById(clipId: string): MayaWaterCycleAudioClip | undefined {
  return WATER_CYCLE_MAYA_AUDIO_SET.find((clip) => clip.id === clipId);
}

export function getMayaAudioClipForChapter(
  chapterId: WaterCycleChapterId
): MayaWaterCycleAudioClip | undefined {
  return WATER_CYCLE_MAYA_AUDIO_SET.find(
    (clip) => clip.group === 'chapter' && clip.chapterId === chapterId
  );
}

export function getMayaAudioClipForStage(
  stageId: WaterCycleStageId
): MayaWaterCycleAudioClip | undefined {
  return WATER_CYCLE_MAYA_AUDIO_SET.find(
    (clip) => clip.group === 'stage' && clip.stageId === stageId
  );
}

/**
 * Concatenates multiple Gemini unary WAV files (44-byte RIFF header, 24kHz mono 16-bit PCM)
 * into one valid downloadable WAV file with a short natural silence gap between clips.
 */
export function concatenateWavBuffers(
  wavBuffers: Uint8Array[],
  pauseSeconds = 0.45
): Uint8Array {
  const validWavs = wavBuffers.filter((buf) => buf.byteLength > 44);
  if (validWavs.length === 0) {
    return new Uint8Array(0);
  }
  if (validWavs.length === 1) {
    return new Uint8Array(validWavs[0]);
  }

  const first = validWavs[0];
  const header = new Uint8Array(first.slice(0, 44));
  const view = new DataView(header.buffer, header.byteOffset, header.byteLength);

  // Read byteRate from WAV header (bytes 28..31) or default to 24000 Hz * 1 ch * 2 bytes = 48000
  const byteRate = view.getUint32(28, true) || 48000;
  const blockAlign = view.getUint16(32, true) || 2;
  const rawPauseBytes = Math.max(0, Math.round(byteRate * pauseSeconds));
  const alignedPauseBytes = rawPauseBytes - (rawPauseBytes % blockAlign);

  const pcmSegments: Uint8Array[] = [];
  let totalPcmBytes = 0;

  validWavs.forEach((wav, index) => {
    const pcm = wav.slice(44);
    pcmSegments.push(pcm);
    totalPcmBytes += pcm.byteLength;
    if (index < validWavs.length - 1 && alignedPauseBytes > 0) {
      pcmSegments.push(new Uint8Array(alignedPauseBytes));
      totalPcmBytes += alignedPauseBytes;
    }
  });

  // Update RIFF ChunkSize (36 + Subchunk2Size) and Subchunk2Size (data length)
  view.setUint32(4, 36 + totalPcmBytes, true);
  view.setUint32(40, totalPcmBytes, true);

  const output = new Uint8Array(44 + totalPcmBytes);
  output.set(header, 0);
  let offset = 44;
  for (const segment of pcmSegments) {
    output.set(segment, offset);
    offset += segment.byteLength;
  }

  return output;
}
