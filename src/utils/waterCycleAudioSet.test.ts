import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WATER_CYCLE_MAYA_AUDIO_SET,
  concatenateWavBuffers,
  estimateSpeechDurationSec,
  findMayaWaterCycleClipById,
  formatClipDuration,
  getMayaAudioClipForChapter,
  getMayaAudioClipForStage,
} from './waterCycleAudioSet.ts';
import { WATER_CYCLE_CHAPTERS, WATER_CYCLE_STAGES } from './waterCycleLogic.ts';

function buildSyntheticWav(pcmByteLength: number, fillByte: number): Uint8Array {
  const buf = new Uint8Array(44 + pcmByteLength);
  const view = new DataView(buf.buffer);
  // "RIFF"
  buf.set([0x52, 0x49, 0x46, 0x46], 0);
  view.setUint32(4, 36 + pcmByteLength, true);
  // "WAVEfmt "
  buf.set([0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20], 8);
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, 24000, true); // sampleRate
  view.setUint32(28, 48000, true); // byteRate
  view.setUint16(32, 2, true); // blockAlign
  view.setUint16(34, 16, true); // bitsPerSample
  // "data"
  buf.set([0x64, 0x61, 0x74, 0x61], 36);
  view.setUint32(40, pcmByteLength, true);
  buf.fill(fillByte, 44);
  return buf;
}

test('builds complete 10-track Maya audio set from existing Water Cycle chapters and stages', () => {
  assert.equal(
    WATER_CYCLE_MAYA_AUDIO_SET.length,
    WATER_CYCLE_CHAPTERS.length + WATER_CYCLE_STAGES.length
  );

  const chapterClips = WATER_CYCLE_MAYA_AUDIO_SET.filter((c) => c.group === 'chapter');
  const stageClips = WATER_CYCLE_MAYA_AUDIO_SET.filter((c) => c.group === 'stage');
  assert.equal(chapterClips.length, 6);
  assert.equal(stageClips.length, 4);

  // Verify every chapter intro script matches verbatim
  WATER_CYCLE_CHAPTERS.forEach((chapter) => {
    const clip = getMayaAudioClipForChapter(chapter.id);
    assert.ok(clip, `Missing clip for chapter ${chapter.id}`);
    assert.equal(clip.script, chapter.mayaIntroScript);
    assert.ok(clip.estimatedSeconds >= 4);
  });

  // Verify stage lookups and ID lookups
  const evapClip = getMayaAudioClipForStage('evaporation');
  assert.ok(evapClip);
  assert.equal(findMayaWaterCycleClipById(evapClip.id)?.stageId, 'evaporation');
});

test('formats and estimates clip durations cleanly', () => {
  assert.equal(formatClipDuration(18), '0:18');
  assert.equal(formatClipDuration(75), '1:15');
  assert.ok(estimateSpeechDurationSec('Hello class today we explore the water cycle.') >= 4);
});

test('concatenates multiple WAV clips with updated RIFF headers and silence gap', () => {
  const wavA = buildSyntheticWav(100, 0x11);
  const wavB = buildSyntheticWav(200, 0x22);
  const combined = concatenateWavBuffers([wavA, wavB], 0.1);

  // 0.1s @ 48000 bytes/sec = 4800 bytes silence gap
  const expectedPcmBytes = 100 + 4800 + 200;
  assert.equal(combined.byteLength, 44 + expectedPcmBytes);

  const view = new DataView(combined.buffer, combined.byteOffset, combined.byteLength);
  assert.equal(view.getUint32(4, true), 36 + expectedPcmBytes);
  assert.equal(view.getUint32(40, true), expectedPcmBytes);

  // First PCM segment bytes preserved
  assert.equal(combined[44], 0x11);
  assert.equal(combined[44 + 99], 0x11);
  // Silence gap zeroed
  assert.equal(combined[44 + 100], 0x00);
  // Second PCM segment preserved
  assert.equal(combined[44 + 100 + 4800], 0x22);
});
