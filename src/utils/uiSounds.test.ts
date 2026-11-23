import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UI_SOUND_STORAGE_KEY,
  getUiSoundSpec,
  isUiSoundEnabled,
  playUiSound,
  setUiSoundEnabled,
  toggleUiSoundEnabled,
} from './uiSounds';

function createMemoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

test('UI sound defaults to enabled when storage is empty', () => {
  const store = createMemoryStorage();
  assert.equal(isUiSoundEnabled(store), true);
});

test('setUiSoundEnabled and toggleUiSoundEnabled persist boolean preference', () => {
  const store = createMemoryStorage();
  assert.equal(setUiSoundEnabled(false, store), false);
  assert.equal(store.getItem(UI_SOUND_STORAGE_KEY), 'false');
  assert.equal(isUiSoundEnabled(store), false);

  assert.equal(toggleUiSoundEnabled(store), true);
  assert.equal(store.getItem(UI_SOUND_STORAGE_KEY), 'true');
  assert.equal(isUiSoundEnabled(store), true);
});

test('sound specs keep micro-interaction volume subtle and crisp', () => {
  const click = getUiSoundSpec('click');
  const success = getUiSoundSpec('success');
  assert.ok(click.gain > 0 && click.gain <= 0.05);
  assert.ok(click.durationMs <= 80);
  assert.equal(success.frequencies.length, 3);
});

test('playUiSound safely no-ops in non-browser Node environment', () => {
  assert.equal(playUiSound('click'), false);
  assert.equal(playUiSound('success'), false);
});
