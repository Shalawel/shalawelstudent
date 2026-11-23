export type AngleCategory = 'Zero' | 'Acute' | 'Right' | 'Obtuse' | 'Straight';

export interface AngleClassification {
  category: AngleCategory;
  label: string;
  rule: string;
  realWorldExample: string;
}

export interface AngleEvaluation {
  isCorrect: boolean;
  drawnDegrees: number;
  drawnCategory: AngleCategory;
  targetDegrees: number;
  targetCategory: AngleCategory;
  headline: string;
  whyWrongOrRight: string;
  correctAnswerSummary: string;
  workedExampleTitle: string;
  workedExampleSteps: string[];
  voicePromptForTutor: string;
}

export interface AngleDiagramOption {
  id: string;
  label: string;
  sublabel?: string;
  compareDegrees: number;
  wrongReason: string;
}

export interface AngleLessonStage {
  id: string;
  stepNumber: number;
  shortTitle: string;
  mode: 'draw' | 'click-angle' | 'click-straight-line' | 'click-clock';
  prompt: string;
  hint: string;
  mayaIntroScript: string;
  // For 'draw' stages
  targetDegrees?: number;
  minDegrees?: number;
  maxDegrees?: number;
  initialDegrees?: number;
  // For 'click-*' stages
  diagramDegrees?: number;
  givenSubAngle?: number; // e.g., 65° on a 180° straight line
  clockHour?: number; // e.g., 4 for 4:00
  options?: AngleDiagramOption[];
  correctOptionId?: string;
  correctAnswerLabel: string;
  workedExampleTitle: string;
  workedExampleSteps: string[];
}

export function clampAngleDegrees(deg: number): number {
  if (!Number.isFinite(deg)) return 0;
  return Math.max(0, Math.min(180, Math.round(deg)));
}

export function classifyAngle(degrees: number): AngleClassification {
  const d = clampAngleDegrees(degrees);
  if (d === 0) {
    return {
      category: 'Zero',
      label: 'Zero Angle (0°)',
      rule: 'Both rays point in the exact same direction with no opening.',
      realWorldExample: 'A completely closed pair of scissors or a book shut flat.',
    };
  }
  if (d < 90) {
    return {
      category: 'Acute',
      label: 'Acute Angle (< 90°)',
      rule: 'Measures more than 0° and less than 90° — narrower than a square corner.',
      realWorldExample: 'A slice of pizza, a beak of a bird, or a partially opened pair of scissors.',
    };
  }
  if (d === 90) {
    return {
      category: 'Right',
      label: 'Right Angle (= 90°)',
      rule: 'Measures exactly 90° and forms a perfect square L-corner.',
      realWorldExample: 'The corner of a math notebook, a doorframe, or clock hands at 3:00.',
    };
  }
  if (d < 180) {
    return {
      category: 'Obtuse',
      label: 'Obtuse Angle (91°–179°)',
      rule: 'Measures more than 90° and less than 180° — wider than a square corner.',
      realWorldExample: 'A wide-open laptop screen, a reclining beach chair, or clock hands at 4:00.',
    };
  }
  return {
    category: 'Straight',
    label: 'Straight Angle (= 180°)',
    rule: 'Measures exactly 180° and forms a perfectly flat straight line.',
    realWorldExample: 'A flat ruler, an open flat book lying on a desk, or clock hands at 6:00.',
  };
}

/**
 * Computes angle in degrees [0, 180] from vertex (vx, vy) to pointer (px, py)
 * in SVG coordinates where +x is right (0°) and -y is up (90°).
 */
export function computeProtractorAngle(
  vx: number,
  vy: number,
  px: number,
  py: number
): number {
  const dx = px - vx;
  const dy = vy - py; // inverted because SVG y grows downward
  if (dy < 0) {
    return dx >= 0 ? 0 : 180;
  }
  const radians = Math.atan2(dy, dx);
  const deg = (radians * 180) / Math.PI;
  return clampAngleDegrees(deg);
}

export function indefiniteArticle(word: string): 'a' | 'an' {
  return /^[aeiou]/i.test(word.trim()) ? 'an' : 'a';
}

export function evaluateDrawnAngle(
  drawnDegrees: number,
  stage: AngleLessonStage
): AngleEvaluation {
  const drawn = clampAngleDegrees(drawnDegrees);
  const target = stage.targetDegrees ?? 45;
  const minDeg = stage.minDegrees ?? target - 10;
  const maxDeg = stage.maxDegrees ?? target + 10;
  const drawnInfo = classifyAngle(drawn);
  const targetInfo = classifyAngle(target);
  const drawnArticle = indefiniteArticle(drawnInfo.category);
  const targetArticle = indefiniteArticle(targetInfo.category);

  const isCorrect = drawn >= minDeg && drawn <= maxDeg;

  if (isCorrect) {
    return {
      isCorrect: true,
      drawnDegrees: drawn,
      drawnCategory: drawnInfo.category,
      targetDegrees: target,
      targetCategory: targetInfo.category,
      headline: `Great job! ${drawn}° is ${targetArticle} ${targetInfo.category} Angle.`,
      whyWrongOrRight: `Your angle measures ${drawn}°, which sits right inside our target zone (${minDeg}°–${maxDeg}°) and clearly matches the rule for ${targetArticle} ${targetInfo.label}.`,
      correctAnswerSummary: `${stage.correctAnswerLabel} — ${targetInfo.rule}`,
      workedExampleTitle: stage.workedExampleTitle,
      workedExampleSteps: stage.workedExampleSteps,
      voicePromptForTutor: `The Class 5 student just drew ${drawn} degrees on the protractor for the challenge "${stage.prompt}". That is CORRECT! Celebrate their ${drawn}-degree ${targetInfo.category.toLowerCase()} angle warmly and encourage them to try the next activity.`,
    };
  }

  const diff = Math.abs(drawn - target);
  const directionHint =
    drawn < minDeg
      ? `Your ray at ${drawn}° is ${diff}° too narrow (too closed). Drag the orange ray counter-clockwise to the left to open it wider toward ${target}°.`
      : `Your ray at ${drawn}° is ${diff}° too wide (too open). Drag the orange ray clockwise to the right to close it closer to ${target}°.`;

  return {
    isCorrect: false,
    drawnDegrees: drawn,
    drawnCategory: drawnInfo.category,
    targetDegrees: target,
    targetCategory: targetInfo.category,
    headline: `Not quite yet — you drew ${drawn}° (${drawnInfo.category} Angle).`,
    whyWrongOrRight: `${directionHint} Right now your angle is ${drawnArticle} ${drawnInfo.label}, whereas we need ${targetArticle} ${targetInfo.label} around ${target}°.`,
    correctAnswerSummary: `Correct target: ${stage.correctAnswerLabel} (${minDeg}° to ${maxDeg}°). ${targetInfo.rule}`,
    workedExampleTitle: stage.workedExampleTitle,
    workedExampleSteps: stage.workedExampleSteps,
    voicePromptForTutor: `The Class 5 student drew ${drawn} degrees (${drawnInfo.category} angle), which is wrong for the challenge "${stage.prompt}" (target is ${target} degrees, ${targetInfo.category} angle). Kindly explain why ${drawn} degrees is off, state the correct answer (${target} degrees, ${targetInfo.category} angle), share a quick Class 5 example, and invite them to adjust the ray.`,
  };
}

export const CLASS_5_ANGLES_STAGES: AngleLessonStage[] = [
  {
    id: 'stage-draw-acute',
    stepNumber: 1,
    shortTitle: 'Draw Acute (45°)',
    mode: 'draw',
    prompt: 'Draw an Acute Angle of about 45° by dragging the orange ray on the protractor.',
    hint: 'An acute angle is smaller than a 90° square corner. Stop halfway between 0° and 90°!',
    mayaIntroScript:
      'Welcome to Class 5 Math! Today we are mastering Angles together. For our first challenge, grab the orange ray on the protractor and draw an acute angle around 45 degrees — that is halfway to a square corner!',
    targetDegrees: 45,
    minDegrees: 35,
    maxDegrees: 55,
    initialDegrees: 115,
    correctAnswerLabel: 'Acute Angle (~45°)',
    workedExampleTitle: 'Worked Example: Half of a Square Corner',
    workedExampleSteps: [
      'Step 1: Start with a square notebook corner, which measures exactly 90°.',
      'Step 2: Fold that corner diagonally in half: 90° ÷ 2 = 45°.',
      'Step 3: Because 45° is greater than 0° and less than 90°, it is a sharp Acute Angle — just like a triangular pizza slice!',
    ],
  },
  {
    id: 'stage-click-right',
    stepNumber: 2,
    shortTitle: 'Identify Inside Angle',
    mode: 'click-angle',
    prompt: 'Look at angle ∠ABC below. Click the correct angle type right inside the diagram.',
    hint: 'Notice the small square box at vertex B — that special symbol always marks a 90° corner!',
    mayaIntroScript:
      'Awesome! Now look closely at angle A B C on screen. See that little square corner tucked inside vertex B? Click the angle name that matches it, or tell me your answer out loud!',
    diagramDegrees: 90,
    options: [
      {
        id: 'acute',
        label: 'Acute Angle',
        sublabel: 'Less than 90°',
        compareDegrees: 45,
        wrongReason:
          'An acute angle is sharper and narrower than an L-corner (less than 90°). Here the vertical ray stands straight up at exactly 90°.',
      },
      {
        id: 'right',
        label: 'Right Angle',
        sublabel: 'Exactly 90°',
        compareDegrees: 90,
        wrongReason: '',
      },
      {
        id: 'obtuse',
        label: 'Obtuse Angle',
        sublabel: 'Between 91° and 179°',
        compareDegrees: 130,
        wrongReason:
          'An obtuse angle leans wide open past a square corner (more than 90°). Notice how ray BA stands straight up without leaning outward.',
      },
      {
        id: 'straight',
        label: 'Straight Angle',
        sublabel: 'Exactly 180°',
        compareDegrees: 180,
        wrongReason:
          'A straight angle opens all the way into a flat 180° line. Angle ∠ABC forms an upright L-shape instead.',
      },
    ],
    correctOptionId: 'right',
    correctAnswerLabel: 'Right Angle (90°)',
    workedExampleTitle: 'Worked Example: Spotting a 90° Right Angle',
    workedExampleSteps: [
      'Step 1: Check the corner at vertex B. The square marker (∟) is the universal math symbol for 90°.',
      'Step 2: Imagine placing the corner of your math textbook into ∠ABC — both edges line up perfectly!',
      'Step 3: Any angle that measures exactly 90° is called a Right Angle (like clock hands at 3:00).',
    ],
  },
  {
    id: 'stage-draw-obtuse',
    stepNumber: 3,
    shortTitle: 'Draw Obtuse (120°)',
    mode: 'draw',
    prompt: 'Now draw an Obtuse Angle of about 120° by opening the orange ray past 90°.',
    hint: 'Move past the upright 90° mark by 30° more to reach 120° — like an open laptop screen!',
    mayaIntroScript:
      'Time to draw again! This time, open the orange ray wider than a square 90-degree corner to create an obtuse angle around 120 degrees, just like a comfortable open laptop screen.',
    targetDegrees: 120,
    minDegrees: 110,
    maxDegrees: 130,
    initialDegrees: 50,
    correctAnswerLabel: 'Obtuse Angle (~120°)',
    workedExampleTitle: 'Worked Example: Building 120° from 90°',
    workedExampleSteps: [
      'Step 1: Begin at 90° (a square right angle pointing straight up).',
      'Step 2: Open the ray 30° wider to the left: 90° + 30° = 120°.',
      'Step 3: Because 120° is bigger than 90° and smaller than 180°, it is an Obtuse Angle!',
    ],
  },
  {
    id: 'stage-click-straight',
    stepNumber: 4,
    shortTitle: 'Missing Angle (180°)',
    mode: 'click-straight-line',
    prompt: 'Angles on a straight line add up to 180°. Click the correct missing angle x inside the diagram!',
    hint: 'Subtract the known 65° angle from the full straight line of 180°: 180° − 65°.',
    mayaIntroScript:
      'Here is a fun angle puzzle! A straight line always measures 180 degrees total. One side is 65 degrees — what must the missing angle x be? Click your answer right inside the diagram or say it out loud!',
    diagramDegrees: 115,
    givenSubAngle: 65,
    options: [
      {
        id: '95',
        label: '95°',
        sublabel: 'Obtuse',
        compareDegrees: 95,
        wrongReason:
          'Check the sum: 65° + 95° = 160°, which falls 20° short of a complete 180° straight line.',
      },
      {
        id: '115',
        label: '115°',
        sublabel: 'Obtuse',
        compareDegrees: 115,
        wrongReason: '',
      },
      {
        id: '125',
        label: '125°',
        sublabel: 'Obtuse',
        compareDegrees: 125,
        wrongReason:
          'Careful with carrying! 65° + 125° = 190°, which goes 10° past a flat 180° straight line.',
      },
      {
        id: '105',
        label: '105°',
        sublabel: 'Obtuse',
        compareDegrees: 105,
        wrongReason:
          'Check the sum: 65° + 105° = 170°, which is still 10° smaller than a 180° straight line.',
      },
    ],
    correctOptionId: '115',
    correctAnswerLabel: 'x = 115° (Supplementary Obtuse Angle)',
    workedExampleTitle: 'Worked Example: Angles on a Straight Line',
    workedExampleSteps: [
      'Step 1: Recall that a straight line forms a Straight Angle of exactly 180°.',
      'Step 2: Subtract the given angle: 180° − 65° = 115° (180 − 60 = 120, then 120 − 5 = 115).',
      'Step 3: Double-check by adding back: 65° + 115° = 180° ✓!',
    ],
  },
  {
    id: 'stage-click-clock',
    stepNumber: 5,
    shortTitle: 'Clock Angle (4:00)',
    mode: 'click-clock',
    prompt: 'A clock shows 4:00. Each hour gap is 30°. Click the correct angle between the two hands!',
    hint: 'Count how many hour spaces lie between 12 and 4, then multiply by 30°.',
    mayaIntroScript:
      'Final mastery challenge! Look at the clock showing 4 o’clock. Every hour step around a clock is 30 degrees. Count the steps from 12 to 4 and click the right angle!',
    diagramDegrees: 120,
    clockHour: 4,
    options: [
      {
        id: '60',
        label: '60° (Acute)',
        sublabel: '2 hour spaces',
        compareDegrees: 60,
        wrongReason:
          '60° equals only 2 hour spaces (like 2:00), because 2 × 30° = 60°. At 4:00, the hands are 4 hour spaces apart.',
      },
      {
        id: '90',
        label: '90° (Right)',
        sublabel: '3 hour spaces',
        compareDegrees: 90,
        wrongReason:
          '90° is 3 hour spaces (3:00). At 4:00, the hour hand has moved one full 30° step past 3!',
      },
      {
        id: '120',
        label: '120° (Obtuse)',
        sublabel: '4 hour spaces',
        compareDegrees: 120,
        wrongReason: '',
      },
      {
        id: '150',
        label: '150° (Obtuse)',
        sublabel: '5 hour spaces',
        compareDegrees: 150,
        wrongReason:
          '150° is 5 hour spaces (5:00), since 5 × 30° = 150°. Here the hour hand points directly at 4.',
      },
    ],
    correctOptionId: '120',
    correctAnswerLabel: '120° Obtuse Angle',
    workedExampleTitle: 'Worked Example: Measuring Angles on a Clock',
    workedExampleSteps: [
      'Step 1: A full clock circle is 360° divided into 12 equal hours: 360° ÷ 12 = 30° per hour.',
      'Step 2: From 12 to 4, count 4 hour spaces.',
      'Step 3: Multiply 4 × 30° = 120°. Because 120° > 90°, it is an Obtuse Angle!',
    ],
  },
];
