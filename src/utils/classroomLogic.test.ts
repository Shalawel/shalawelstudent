import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildClassroomWelcome,
  checkOrderingAnswer,
  evaluateMathExpression,
  formatTimerClock,
  resolveInteractionModeLayout,
} from './classroomLogic';

test('formatTimerClock formats seconds into MM:SS cleanly', () => {
  assert.equal(formatTimerClock(0), '00:00');
  assert.equal(formatTimerClock(17), '00:17');
  assert.equal(formatTimerClock(44 * 60 + 43), '44:43');
  assert.equal(formatTimerClock(-5), '00:00');
});

test('evaluateMathExpression evaluates polynomials and trig functions safely', () => {
  // y = 2x^2 + 4x - 1 at x = 2 => 8 + 8 - 1 = 15
  assert.equal(evaluateMathExpression('y = 2x² + 4x - 1', 2), 15);
  // y = 2x + 3 at x = -1 => 1
  assert.equal(evaluateMathExpression('y = 2x + 3', -1), 1);
  // y = sin(x) at x = 0 => 0
  assert.equal(evaluateMathExpression('y = sin(x)', 0), 0);
  // Invalid syntax returns null safely
  assert.equal(evaluateMathExpression('alert(1)', 1), null);
});

test('buildClassroomWelcome adapts content for Math and English sessions', () => {
  const mathWelcome = buildClassroomWelcome(
    {
      helpType: 'Learn a Lesson',
      subject: 'Mathematics',
      lessonSource: 'another-topic',
      topic: 'Integers on the Number Line',
      specificQuestion: '',
    },
    '9'
  );
  assert.match(mathWelcome.intro, /Integers on the Number Line/);
  assert.equal(mathWelcome.warmupSequence, '-3, -2, -1, 0, 1, 2, 3');

  const engWelcome = buildClassroomWelcome(
    {
      helpType: 'Prepare for a Test',
      subject: 'English',
      lessonSource: 'another-topic',
      topic: 'Identify Theme and Summarize a Story',
      specificQuestion: 'How do I separate plot from theme?',
    },
    '9'
  );
  assert.match(engWelcome.warmupQuestion, /How do I separate plot from theme\?/);
});

test('checkOrderingAnswer verifies exact step sequence', () => {
  assert.equal(checkOrderingAnswer(['s1', 's2', 's3'], ['s1', 's2', 's3']), true);
  assert.equal(checkOrderingAnswer(['s2', 's1', 's3'], ['s1', 's2', 's3']), false);
});

test('resolveInteractionModeLayout minimizes chat in voice mode and opens right drawer in text mode', () => {
  assert.deepEqual(resolveInteractionModeLayout('voice'), {
    chatDrawerOpen: false,
    showVoiceDock: true,
  });
  assert.deepEqual(resolveInteractionModeLayout('text'), {
    chatDrawerOpen: true,
    showVoiceDock: false,
  });
});

test('buildClassroomWelcome produces pedagogy-family-aligned content for Economics, History, and Science', () => {
  const econWelcome = buildClassroomWelcome(
    {
      helpType: 'Prepare for a Test',
      subject: 'Economics',
      lessonSource: 'another-topic',
      topic: 'Supply and Demand',
      specificQuestion: '',
    },
    '9'
  );
  assert.match(econWelcome.warmupSequence, /Feedback Loop/i);
  assert.doesNotMatch(econWelcome.warmupQuestion, /story|plot|theme/i);

  const histWelcome = buildClassroomWelcome(
    {
      helpType: 'Learn a Lesson',
      subject: 'History',
      lessonSource: 'another-topic',
      topic: 'Industrial Revolution',
      specificQuestion: '',
    },
    '9'
  );
  assert.match(histWelcome.warmupSequence, /Multiple Causes/i);
  assert.doesNotMatch(histWelcome.warmupQuestion, /story|plot|theme/i);

  const sciWelcome = buildClassroomWelcome(
    {
      helpType: 'Learn a Lesson',
      subject: 'Science',
      lessonSource: 'another-topic',
      topic: 'Photosynthesis',
      specificQuestion: '',
    },
    '9'
  );
  assert.match(sciWelcome.warmupSequence, /Hypothesis/i);
  assert.doesNotMatch(sciWelcome.warmupQuestion, /story|plot|theme/i);
});

