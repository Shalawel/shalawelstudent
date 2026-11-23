import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIVITY_1_EXPECTED_ORDER,
  ACTIVITY_1_INITIAL_SHUFFLED,
  KNOWLEDGE_CHECK_QUESTIONS,
  WATER_CYCLE_CHAPTERS,
  WATER_CYCLE_STAGES,
  WEATHER_CONDITIONS,
  WEATHER_ELEMENTS,
  computeConnectedWeather,
  evaluatePredictNext,
  evaluateProcessIdentification,
  evaluateWaterCycleOrder,
  evaluateWeatherDetective,
  isWaterCycleSession,
  scoreKnowledgeCheck,
} from './waterCycleLogic.ts';

describe('waterCycleLogic', () => {
  it('detects Science Water Cycle sessions cleanly and ignores unrelated topics or problemSolver sessions', () => {
    assert.equal(
      isWaterCycleSession({
        helpType: 'Learn a Lesson',
        subject: 'Science',
        lessonSource: 'another-topic',
        topic: 'Water Cycle',
        specificQuestion: '',
      }),
      true
    );
    assert.equal(
      isWaterCycleSession({
        helpType: 'Learn a Lesson',
        subject: 'Science',
        lessonSource: 'another-topic',
        topic: 'Water Cycle and Weather',
        specificQuestion: '',
      }),
      true
    );
    assert.equal(
      isWaterCycleSession({
        helpType: 'Learn a Lesson',
        subject: 'Mathematics',
        lessonSource: 'another-topic',
        topic: 'Angles',
        specificQuestion: '',
      }),
      false
    );
    assert.equal(
      isWaterCycleSession({
        helpType: 'Homework Help',
        subject: 'Solve my Problem',
        lessonSource: 'another-topic',
        topic: 'Water Cycle',
        specificQuestion: '',
        problemSolver: { problemText: 'Explain evaporation', attachment: null },
      }),
      false
    );
  });

  it('includes all 6 connected chapters, 4 water cycle stages, 5 weather elements, 5 weather conditions, and 5 knowledge check questions', () => {
    assert.equal(WATER_CYCLE_CHAPTERS.length, 6);
    assert.equal(WATER_CYCLE_STAGES.length, 4);
    assert.equal(WEATHER_ELEMENTS.length, 5);
    assert.equal(WEATHER_CONDITIONS.length, 5);
    assert.equal(KNOWLEDGE_CHECK_QUESTIONS.length, 5);
  });

  it('evaluates Activity 1 water cycle ordering accurately', () => {
    const pass = evaluateWaterCycleOrder(ACTIVITY_1_EXPECTED_ORDER);
    assert.equal(pass.isCorrect, true);
    assert.equal(pass.correctPositions, 4);

    const fail = evaluateWaterCycleOrder(ACTIVITY_1_INITIAL_SHUFFLED);
    assert.equal(fail.isCorrect, false);
    assert.ok(fail.feedback.includes('Evaporation'));
  });

  it('evaluates Activity 2 real-world scenarios (puddle, cold glass, dark clouds)', () => {
    assert.equal(evaluateProcessIdentification('puddle', 'evaporation').isCorrect, true);
    assert.equal(evaluateProcessIdentification('cold-glass', 'condensation').isCorrect, true);
    assert.equal(evaluateProcessIdentification('dark-clouds', 'precipitation').isCorrect, true);
    assert.equal(evaluateProcessIdentification('puddle', 'condensation').isCorrect, false);
  });

  it('evaluates Activity 3 Weather Detective and Activity 4 Predict What Happens Next', () => {
    assert.equal(evaluateWeatherDetective('det-1', 'windy', 'wind').isCorrect, true);
    assert.equal(evaluateWeatherDetective('det-2', 'rainy', 'precipitation').isCorrect, true);
    assert.equal(evaluateWeatherDetective('det-3', 'sunny', 'wind').isCorrect, false);

    assert.equal(evaluatePredictNext('pred-1', 'condensation').isCorrect, true);
    assert.equal(evaluatePredictNext('pred-2', 'precipitation').isCorrect, true);
    assert.equal(evaluatePredictNext('pred-3', 'collection').isCorrect, true);
    assert.equal(evaluatePredictNext('pred-1', 'collection').isCorrect, false);
  });

  it('simulates connected water cycle and weather parameters deterministically', () => {
    const storm = computeConnectedWeather('high', 'strong');
    assert.equal(storm.condition, 'stormy');
    assert.equal(storm.evaporationRate, 'High');
    assert.ok(storm.humidityPct >= 90);

    const hotCalm = computeConnectedWeather('high', 'calm');
    assert.equal(hotCalm.condition, 'sunny');
    assert.equal(hotCalm.evaporationRate, 'High');

    const mildCloudy = computeConnectedWeather('medium', 'breezy');
    assert.equal(mildCloudy.condition, 'cloudy');
  });

  it('scores the 5-question Class 6 Knowledge Check accurately', () => {
    const perfectAnswers: Record<string, number> = {};
    for (const q of KNOWLEDGE_CHECK_QUESTIONS) {
      perfectAnswers[q.id] = q.correctIndex;
    }
    const perfect = scoreKnowledgeCheck(perfectAnswers);
    assert.equal(perfect.correctCount, 5);
    assert.equal(perfect.percent, 100);

    const partial = scoreKnowledgeCheck({ 'wc-q1': 1, 'wc-q2': 0 });
    assert.equal(partial.answeredCount, 2);
    assert.equal(partial.correctCount, 1);
    assert.equal(partial.percent, 20);
  });
});
