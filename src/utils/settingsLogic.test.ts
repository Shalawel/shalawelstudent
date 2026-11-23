import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AI_TUTOR_PERSONAS,
  DEFAULT_APP_SETTINGS,
  applyNotificationPreset,
  createLinkedParentRecord,
  detectNotificationPreset,
  getTextSizePx,
  logoutAllOtherDevices,
  logoutSingleDevice,
  maskEmail,
  maskPhone,
  resolveActiveAccessibilityFeatures,
  summarizeAccessibility,
  summarizeDevices,
  summarizeLinkedParents,
  summarizeNotifications,
  toggleArraySelection,
  validateAddParentInput,
} from './settingsLogic';

test('AI_TUTOR_PERSONAS includes 16 distinct tutor profiles led by Maya', () => {
  assert.equal(AI_TUTOR_PERSONAS.length, 16);
  assert.equal(AI_TUTOR_PERSONAS[0].id, 'maya');
  assert.equal(new Set(AI_TUTOR_PERSONAS.map((t) => t.id)).size, 16);
});

test('Notification presets always keep school-required Messages enabled', () => {
  const minimal = applyNotificationPreset(DEFAULT_APP_SETTINGS.notifications, 'minimal');
  assert.equal(minimal.topics.messages, true);
  assert.equal(minimal.topics.learningUpdates, false);
  assert.equal(minimal.topics.achievements, false);
  assert.equal(minimal.topics.aiChallenges, false);
  assert.equal(detectNotificationPreset(minimal), 'minimal');
  assert.equal(summarizeNotifications(minimal), 'Minimal (School-required only)');

  const achievementsOnly = applyNotificationPreset(
    DEFAULT_APP_SETTINGS.notifications,
    'achievements'
  );
  assert.equal(achievementsOnly.topics.achievements, true);
  assert.equal(achievementsOnly.topics.messages, true);
  assert.equal(achievementsOnly.topics.learningUpdates, false);
  assert.equal(detectNotificationPreset(achievementsOnly), 'achievements');

  const all = applyNotificationPreset(minimal, 'all');
  assert.equal(all.channels.mobilePush, true);
  assert.equal(summarizeNotifications(all), 'All enabled');
});

test('Linked parent validation enforces Dual Guardian limit and masks contact info', () => {
  assert.equal(maskEmail('john.carter@gmail.com'), 'jo***@gmail.com');
  assert.equal(maskPhone('+1 (415) 555-1234'), '+1 *****1234');

  const invalidEmail = validateAddParentInput({
    name: 'Sarah Carter',
    email: 'invalid-email',
    phone: '4155551234',
    existingCount: 1,
  });
  assert.equal(invalidEmail.valid, false);

  const atLimit = validateAddParentInput({
    name: 'Third Guardian',
    email: 'third@example.com',
    phone: '4155559999',
    existingCount: 2,
  });
  assert.equal(atLimit.valid, false);

  const valid = validateAddParentInput({
    name: 'Sarah Carter',
    email: 'sarah@example.com',
    phone: '4155558899',
    existingCount: 1,
  });
  assert.equal(valid.valid, true);

  const record = createLinkedParentRecord(
    { name: 'Sarah Carter', email: 'sarah@example.com', phone: '4155558899' },
    1
  );
  assert.equal(record.role, 'Secondary Parent');
  assert.equal(record.initials, 'SC');
  assert.equal(record.maskedEmail, 'sa***@example.com');
  assert.equal(
    summarizeLinkedParents([...DEFAULT_APP_SETTINGS.linkedParents, record]),
    'John Carter + 1 more | Active'
  );
});

test('Device management logs out other devices while protecting current device', () => {
  assert.equal(summarizeDevices(DEFAULT_APP_SETTINGS.devices), '3 devices active');

  // Attempting to log out current device must not remove it
  const protectedList = logoutSingleDevice(DEFAULT_APP_SETTINGS.devices, 'dev-macbook');
  assert.equal(protectedList.length, 3);

  const afterSingle = logoutSingleDevice(DEFAULT_APP_SETTINGS.devices, 'dev-windows');
  assert.equal(afterSingle.length, 2);
  assert.equal(summarizeDevices(afterSingle), '2 devices active');

  const afterAllOther = logoutAllOtherDevices(DEFAULT_APP_SETTINGS.devices);
  assert.equal(afterAllOther.length, 1);
  assert.equal(afterAllOther[0].isCurrent, true);
  assert.equal(summarizeDevices(afterAllOther), '1 device active');
});

test('Accessibility helpers compute text scale, summary, and active feature badges accurately', () => {
  assert.equal(getTextSizePx('small'), 14);
  assert.equal(getTextSizePx('medium'), 16);
  assert.equal(getTextSizePx('large'), 20);
  assert.equal(
    summarizeAccessibility(DEFAULT_APP_SETTINGS.accessibility),
    'Medium text, Light theme'
  );

  const customA11y = {
    ...DEFAULT_APP_SETTINGS.accessibility,
    textSize: 'large' as const,
    theme: 'dark' as const,
    highContrast: true,
    colorBlindMode: 'deuteranopia' as const,
    reduceMotion: true,
  };
  assert.equal(summarizeAccessibility(customA11y), 'Large text, Dark theme');
  const features = resolveActiveAccessibilityFeatures(customA11y);
  assert.ok(features.includes('High Contrast'));
  assert.ok(features.includes('Deuteranopia Filter'));
  assert.ok(features.includes('Reduced Motion'));
  assert.ok(features.includes('Keyboard Nav'));
  assert.ok(features.includes('Enhanced Focus'));
});

test('toggleArraySelection enforces minRequired count for multi-select learning styles', () => {
  const removed = toggleArraySelection(['visual', 'practice'], 'visual', 1);
  assert.deepEqual(removed, ['practice']);

  // Should not remove the last remaining item when minRequired is 1
  const protectedMin = toggleArraySelection(['practice'], 'practice', 1);
  assert.deepEqual(protectedMin, ['practice']);

  const added = toggleArraySelection(['practice'], 'auditory', 1);
  assert.deepEqual(added, ['practice', 'auditory']);
});
