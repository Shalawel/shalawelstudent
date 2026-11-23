import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MASCOT_CHARACTERS,
  buildMascotTips,
  buildNonSpoilerQuizHint,
  getAlternateMascot,
  getDefaultMascotForContext,
} from './mascotHelperLogic';

test('exposes both uploaded mascot assets and toggles cleanly between Maya and Leo', () => {
  assert.equal(
    MASCOT_CHARACTERS.maya.imageSrc,
    '/assets/aistudio/Enthusiastic_Tutor_with_Idea_Rays_3462c79e.png'
  );
  assert.equal(
    MASCOT_CHARACTERS.leo.imageSrc,
    '/assets/aistudio/Cartoon_Teacher_with_Book_and_Idea_Gesture_c36e5a65.png'
  );
  assert.equal(getDefaultMascotForContext('quiz'), 'leo');
  assert.equal(getDefaultMascotForContext('session'), 'maya');
  assert.equal(getDefaultMascotForContext('solution'), 'maya');
  assert.equal(getAlternateMascot('maya'), 'leo');
  assert.equal(getAlternateMascot('leo'), 'maya');
});

test('builds tailored tips for Water Cycle and Angles learning sessions', () => {
  const wcTips = buildMascotTips({
    context: 'session',
    subject: 'Science',
    topic: 'Water Cycle',
    isWaterCycle: true,
    waterCycleChapterTitle: 'Understanding the Water Cycle',
  });
  assert.match(wcTips.hintText, /Understanding the Water Cycle/);
  assert.equal(wcTips.actions.length, 3);
  assert.equal(wcTips.actions[2].actionKind, 'speak_hint');

  const anglesTips = buildMascotTips({
    context: 'session',
    subject: 'Mathematics',
    topic: 'Angles',
    isAngles: true,
    anglesStageTitle: 'Draw an Acute Angle',
  });
  assert.match(anglesTips.hintText, /90°/);
  assert.match(anglesTips.actions[0].prompt ?? '', /Draw an Acute Angle/);
});

test('builds non-spoiler hints and navigation guidance for Smart Quiz cards', () => {
  const activeTips = buildMascotTips({
    context: 'quiz',
    subject: 'Mathematics',
    topic: 'Fractions',
    quizQuestionIndex: 1,
    quizTotalQuestions: 6,
    quizExplanation: 'A common denominator lets you add numerators directly. Simplify afterwards.',
    quizCompleted: false,
  });
  assert.equal(activeTips.headline, 'Stuck on Question 02?');
  assert.match(activeTips.hintText, /Clue: A common denominator/);
  assert.equal(activeTips.actions.some((a) => a.actionKind === 'next_step'), true);
  assert.equal(activeTips.actions.some((a) => a.actionKind === 'prev_step'), true);

  const doneTips = buildMascotTips({
    context: 'quiz',
    subject: 'Mathematics',
    topic: 'Fractions',
    quizCompleted: true,
    quizScorePercent: 83,
  });
  assert.match(doneTips.headline, /Awesome/);
  assert.equal(doneTips.actions[0].actionKind, 'review_answers');
});

test('builds problem-locked hints for Solution Session (Solve my Problem)', () => {
  const solTips = buildMascotTips({
    context: 'solution',
    problemText: 'Solve 3x + 7 = 22 for x',
  });
  assert.match(solTips.hintText, /Solve 3x \+ 7 = 22/);
  assert.equal(solTips.actions.length, 3);
  assert.ok(solTips.actions.every((a) => a.actionKind === 'ask_tutor' && Boolean(a.prompt)));
});

test('buildNonSpoilerQuizHint masks exact answer option and handles empty explanation cleanly', () => {
  const masked = buildNonSpoilerQuizHint(
    'Rearranging to slope-intercept form gives -2y = -3x + 12, so y = (3/2)x - 6.',
    'Mathematics',
    'Linear Equations',
    '3/2'
  );
  assert.equal(masked.includes('3/2'), false);
  assert.match(masked, /___/);

  const fallback = buildNonSpoilerQuizHint('', 'Science', 'Water Cycle');
  assert.match(fallback, /Water Cycle/);
});
