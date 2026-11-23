import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSmartQuizDeck,
  resolveSwipeDirection,
  scoreSmartQuiz,
  validateSmartQuizInput,
} from './smartQuizLogic';

test('validateSmartQuizInput rejects missing subject or short topic', () => {
  const empty = validateSmartQuizInput({ subject: '', topic: '' });
  assert.equal(empty.valid, false);
  assert.ok(empty.errors.subject);
  assert.ok(empty.errors.topic);

  const shortTopic = validateSmartQuizInput({ subject: 'Mathematics', topic: 'A' });
  assert.equal(shortTopic.valid, false);
  assert.equal(shortTopic.errors.subject, undefined);
  assert.ok(shortTopic.errors.topic);

  const valid = validateSmartQuizInput({ subject: 'Mathematics', topic: 'Linear Equations' });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('buildSmartQuizDeck produces 6 subject-tailored cards scoped to the topic', () => {
  const deck = buildSmartQuizDeck('Mathematics', 'Linear Equations');
  assert.equal(deck.length, 6);
  assert.equal(deck[0].subject, 'Mathematics');
  assert.match(deck[0].id, /linear-equations/);
  assert.equal(deck[0].prompt.startsWith('['), false);
  for (const card of deck) {
    assert.ok(card.options.length >= 3);
    assert.ok(card.correctIndex >= 0 && card.correctIndex < card.options.length);
  }
});

test('scoreSmartQuiz calculates correct count and percentage accurately', () => {
  const deck = buildSmartQuizDeck('English', 'Literary Theme');
  const answers: Record<number, number> = {
    0: deck[0].correctIndex,
    1: deck[1].correctIndex,
    2: deck[2].correctIndex,
    3: (deck[3].correctIndex + 1) % deck[3].options.length,
    4: deck[4].correctIndex,
    5: (deck[5].correctIndex + 1) % deck[5].options.length,
  };

  const summary = scoreSmartQuiz(deck, answers);
  assert.equal(summary.total, 6);
  assert.equal(summary.correctCount, 4);
  assert.equal(summary.percent, 67);
  assert.equal(summary.results[0].isCorrect, true);
  assert.equal(summary.results[3].isCorrect, false);
});

test('resolveSwipeDirection interprets left swipe as next and right swipe as prev', () => {
  assert.equal(resolveSwipeDirection(-95, -200), 'next');
  assert.equal(resolveSwipeDirection(95, 180), 'prev');
  assert.equal(resolveSwipeDirection(-20, -40), null);
  assert.equal(resolveSwipeDirection(15, 25), null);
});
