import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CLASS_5_ANGLES_STAGES,
  classifyAngle,
  computeProtractorAngle,
  evaluateDrawnAngle,
} from './anglesLogic';

test('classifyAngle classifies Zero, Acute, Right, Obtuse, and Straight angles accurately', () => {
  assert.equal(classifyAngle(0).category, 'Zero');
  assert.equal(classifyAngle(45).category, 'Acute');
  assert.equal(classifyAngle(89).category, 'Acute');
  assert.equal(classifyAngle(90).category, 'Right');
  assert.equal(classifyAngle(120).category, 'Obtuse');
  assert.equal(classifyAngle(180).category, 'Straight');
});

test('computeProtractorAngle maps SVG coordinates around vertex cleanly to [0, 180]', () => {
  // Vertex at (200, 200): right -> 0°, straight up -> 90°, left -> 180°, 45° up-right -> 45°
  assert.equal(computeProtractorAngle(200, 200, 300, 200), 0);
  assert.equal(computeProtractorAngle(200, 200, 200, 100), 90);
  assert.equal(computeProtractorAngle(200, 200, 100, 200), 180);
  assert.equal(computeProtractorAngle(200, 200, 280, 120), 45);
});

test('evaluateDrawnAngle accepts angles within tolerance and diagnoses wrong angles with examples', () => {
  const acuteStage = CLASS_5_ANGLES_STAGES[0]; // target 45° [35..55]
  const pass = evaluateDrawnAngle(47, acuteStage);
  assert.equal(pass.isCorrect, true);
  assert.equal(pass.drawnCategory, 'Acute');
  assert.match(pass.headline, /an Acute Angle/);
  assert.ok(pass.workedExampleSteps.length >= 3);

  const tooWide = evaluateDrawnAngle(125, acuteStage);
  assert.equal(tooWide.isCorrect, false);
  assert.equal(tooWide.drawnCategory, 'Obtuse');
  assert.match(tooWide.whyWrongOrRight, /too wide/i);
  assert.match(tooWide.whyWrongOrRight, /an Obtuse Angle/);
  assert.match(tooWide.correctAnswerSummary, /Acute Angle/i);
});

test('CLASS_5_ANGLES_STAGES includes draw, click-angle, straight-line, and clock interactive stages', () => {
  assert.equal(CLASS_5_ANGLES_STAGES.length, 5);
  assert.equal(CLASS_5_ANGLES_STAGES[0].mode, 'draw');
  assert.equal(CLASS_5_ANGLES_STAGES[1].mode, 'click-angle');
  assert.equal(CLASS_5_ANGLES_STAGES[2].mode, 'draw');
  assert.equal(CLASS_5_ANGLES_STAGES[3].mode, 'click-straight-line');
  assert.equal(CLASS_5_ANGLES_STAGES[4].mode, 'click-clock');
});
