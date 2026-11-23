/**
 * TutorCloud AI-Tutor Production Prompt Pack v1.0
 * Sections 23–27, 34–38 & Section 51 (51.1–51.13)
 *
 * Pure deterministic module governing:
 * - Multi-Signal Mastery Scoring Engine (9 signals, 5 exact mastery bands, False-Positive Suppression)
 * - Longitudinal Retention Validation & Regression Detection
 * - 5 Contradiction Detection Rules + 3-Tier Severity Scaling + Recovery Unlock
 * - Transfer Validation (6 variation dimensions) + Subject-Tailored Reasoning & Transfer Checks
 * - Whiteboard Signal & 6-Misconception Analyzer (never auto-completing incomplete work)
 * - Voice & Accent/Code-Switching Signal Analyzer (never penalizing accent/hesitation)
 */

import type { PedagogyFamilyId } from './tutorPedagogyEngine';

export interface MasterySignals {
  conceptual_understanding: number; // 0..1
  procedural_accuracy: number; // 0..1
  transfer_performance: number; // 0..1
  hint_dependency: number; // 0..1 (higher = MORE dependent on hints = worse)
  independent_completion: number; // 0..1
  reasoning_clarity: number; // 0..1
  recovery_stability: number; // 0..1
  misconception_frequency: number; // 0..1 (higher = MORE misconceptions = worse)
  retention_stability: number; // 0..1
  // Behavioral evidence counters
  attemptsCount: number;
  correctAnswersCount: number;
  hintsUsedCount: number;
  transferAttemptsCount: number;
  transferSuccessCount: number;
  verbalReasoningSubmittedCount: number;
  verbalReasoningStrongCount: number;
  whiteboardSuccessCount: number;
  confidentWrongCount: number;
  previousSessionScore?: number | null;
}

export type MasteryBandLabel =
  | 'Minimal Understanding'
  | 'Emerging Understanding'
  | 'Developing Stability'
  | 'Stable Understanding'
  | 'Reliable Transfer Mastery';

export type ContradictionRuleId =
  | 'correctness_reasoning_conflict'
  | 'transfer_repetition_conflict'
  | 'guidance_accuracy_conflict'
  | 'confidence_conceptual_conflict'
  | 'whiteboard_verbal_conflict';

export type ContradictionSeverity = 'low' | 'moderate' | 'high';

export interface DetectedContradiction {
  id: ContradictionRuleId;
  title: string;
  severity: ContradictionSeverity;
  description: string;
  stabilizationAction: string;
  recoveryRequirement: string;
}

export interface MasteryEvaluationResult {
  rawScore: number; // 0..1
  finalScore: number; // 0..1 after suppression/contradiction caps
  percent: number; // 0..100
  band: MasteryBandLabel;
  falsePositiveSuppressed: boolean;
  suppressionReason: string | null;
  highMasteryEligible: boolean;
  highMasteryBlockers: string[];
  contradictions: DetectedContradiction[];
  highestContradictionSeverity: ContradictionSeverity | null;
  retentionStatus: 'unverified' | 'stable' | 'regressed';
  masteryStability: 'low' | 'moderate' | 'high';
  transferReliability: 'untested' | 'fragile' | 'developing' | 'reliable';
  nextPedagogicalAction: string;
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, Number(value.toFixed(4))));
}

export function createInitialMasterySignals(previousSessionScore?: number | null): MasterySignals {
  const baselineRetention =
    typeof previousSessionScore === 'number' ? clamp01(previousSessionScore) : 0.45;
  return {
    conceptual_understanding: 0.35,
    procedural_accuracy: 0.35,
    transfer_performance: 0.2,
    hint_dependency: 0.2,
    independent_completion: 0.3,
    reasoning_clarity: 0.3,
    recovery_stability: 0.5,
    misconception_frequency: 0.15,
    retention_stability: baselineRetention,
    attemptsCount: 0,
    correctAnswersCount: 0,
    hintsUsedCount: 0,
    transferAttemptsCount: 0,
    transferSuccessCount: 0,
    verbalReasoningSubmittedCount: 0,
    verbalReasoningStrongCount: 0,
    whiteboardSuccessCount: 0,
    confidentWrongCount: 0,
    previousSessionScore: previousSessionScore ?? null,
  };
}

/**
 * Exact 5 Mastery Bands from Section 25 & Section 51.3:
 * 0.00–0.20: Minimal Understanding
 * 0.21–0.40: Emerging Understanding
 * 0.41–0.60: Developing Stability
 * 0.61–0.80: Stable Understanding
 * 0.81–1.00: Reliable Transfer Mastery
 */
export function getMasteryBand(score: number): MasteryBandLabel {
  const s = clamp01(score);
  if (s <= 0.2) return 'Minimal Understanding';
  if (s <= 0.4) return 'Emerging Understanding';
  if (s <= 0.6) return 'Developing Stability';
  if (s <= 0.8) return 'Stable Understanding';
  return 'Reliable Transfer Mastery';
}

/**
 * Section 27 & 51.9: All 5 Contradiction Detection Rules + Severity Scaling.
 */
export function detectContradictions(signals: MasterySignals): DetectedContradiction[] {
  const found: DetectedContradiction[] = [];

  // Rule 1: Correct Answer + Poor Explanation
  if (
    (signals.procedural_accuracy >= 0.7 || signals.correctAnswersCount >= 1) &&
    signals.reasoning_clarity <= 0.45 &&
    (signals.verbalReasoningSubmittedCount > 0 || signals.attemptsCount >= 2)
  ) {
    const severity: ContradictionSeverity =
      signals.reasoning_clarity <= 0.25 ? 'high' : 'moderate';
    found.push({
      id: 'correctness_reasoning_conflict',
      title: 'Correct Answer with Weak Reasoning',
      severity,
      description:
        'Final answers look correct, but the explanation behind why they work is still unclear or incomplete.',
      stabilizationAction:
        'Pause mastery advancement and ask the student to explain the key step in their own words before confirming mastery.',
      recoveryRequirement:
        'Provide a clear, accurate reasoning explanation alongside an independent correct attempt.',
    });
  }

  // Rule 2: Transfer Failure + Repetition Success
  if (
    signals.procedural_accuracy >= 0.65 &&
    signals.transferAttemptsCount > 0 &&
    signals.transfer_performance <= 0.45
  ) {
    const severity: ContradictionSeverity =
      signals.transfer_performance <= 0.25 ? 'high' : 'moderate';
    found.push({
      id: 'transfer_repetition_conflict',
      title: 'Familiar Practice Success but Transfer Struggle',
      severity,
      description:
        'The student succeeds on familiar practice patterns but struggles when the context or structure changes.',
      stabilizationAction:
        'Suppress mastery escalation and bridge the core concept across a slightly varied example.',
      recoveryRequirement:
        'Demonstrate reliable transfer on a novel context or representation without step-by-step scaffolding.',
    });
  }

  // Rule 3: Heavy Guidance + High Accuracy
  if (
    signals.procedural_accuracy >= 0.65 &&
    (signals.hint_dependency >= 0.6 || signals.hintsUsedCount >= 3)
  ) {
    const severity: ContradictionSeverity =
      signals.hint_dependency >= 0.75 ? 'high' : 'moderate';
    found.push({
      id: 'guidance_accuracy_conflict',
      title: 'High Accuracy Driven by Heavy Hints',
      severity,
      description:
        'Accuracy is high while relying heavily on guided hints, creating a risk of false mastery.',
      stabilizationAction:
        'Reduce hints gradually and present one unassisted independent check before raising mastery.',
      recoveryRequirement:
        'Complete a problem independently with reduced hint dependency.',
    });
  }

  // Rule 4: Confident Response + Conceptual Error
  if (
    signals.confidentWrongCount >= 1 ||
    (signals.misconception_frequency >= 0.55 && signals.conceptual_understanding <= 0.45)
  ) {
    const severity: ContradictionSeverity =
      signals.confidentWrongCount >= 2 || signals.misconception_frequency >= 0.7
        ? 'high'
        : 'moderate';
    found.push({
      id: 'confidence_conceptual_conflict',
      title: 'Confident Misconception Detected',
      severity,
      description:
        'A confident answer carries an underlying conceptual error that needs gentle, clear untangling.',
      stabilizationAction:
        'Use a concrete counterexample or prediction check to surface the conceptual gap calmly.',
      recoveryRequirement:
        'Correct the mental model and explain why the revised reasoning holds.',
    });
  }

  // Rule 5: Whiteboard Success + Verbal Confusion
  if (
    signals.whiteboardSuccessCount >= 1 &&
    signals.reasoning_clarity <= 0.45 &&
    signals.conceptual_understanding <= 0.5
  ) {
    found.push({
      id: 'whiteboard_verbal_conflict',
      title: 'Whiteboard Work vs. Verbal Explanation Gap',
      severity: 'low',
      description:
        'Written/plotted whiteboard work looks right, yet verbal explanation shows hesitation or confusion.',
      stabilizationAction:
        'Increase observation and invite the student to narrate one single step from their whiteboard work.',
      recoveryRequirement:
        'Connect the visual/symbolic whiteboard step cleanly to its verbal explanation.',
    });
  }

  return found;
}

const SEVERITY_RANK: Record<ContradictionSeverity, number> = {
  low: 1,
  moderate: 2,
  high: 3,
};

/**
 * Section 25 & Section 51: Multi-Signal Mastery Scoring & False-Positive Suppression Engine.
 */
export function evaluateMastery(signals: MasterySignals): MasteryEvaluationResult {
  const conceptual = clamp01(signals.conceptual_understanding);
  const procedural = clamp01(signals.procedural_accuracy);
  const transfer = clamp01(signals.transfer_performance);
  const independence = clamp01(signals.independent_completion);
  const reasoning = clamp01(signals.reasoning_clarity);
  const recovery = clamp01(signals.recovery_stability);
  const retention = clamp01(signals.retention_stability);
  const lowDependencyScore = clamp01(1 - clamp01(signals.hint_dependency));
  const lowMisconceptionScore = clamp01(1 - clamp01(signals.misconception_frequency));

  // Weighted multi-signal mastery composite (no single signal can dominate)
  const rawScore = clamp01(
    conceptual * 0.18 +
      procedural * 0.14 +
      transfer * 0.18 +
      independence * 0.14 +
      reasoning * 0.14 +
      lowDependencyScore * 0.08 +
      lowMisconceptionScore * 0.06 +
      recovery * 0.04 +
      retention * 0.04
  );

  const contradictions = detectContradictions(signals);
  const highestContradictionSeverity: ContradictionSeverity | null =
    contradictions.length === 0
      ? null
      : contradictions.reduce<ContradictionSeverity>(
          (max, curr) => (SEVERITY_RANK[curr.severity] > SEVERITY_RANK[max] ? curr.severity : max),
          contradictions[0].severity
        );

  let finalScore = rawScore;
  let falsePositiveSuppressed = false;
  let suppressionReason: string | null = null;

  // Section 51.5: False Positive Suppression
  // Correct answers + Heavy hint usage + Transfer failure -> cap at Moderate (<= 0.60)
  const heavyHints = signals.hint_dependency >= 0.6 || signals.hintsUsedCount >= 3;
  const transferFailed =
    signals.transferAttemptsCount > 0 && signals.transfer_performance < 0.5;
  const weakReasoning = signals.reasoning_clarity < 0.5;

  if (heavyHints && (transferFailed || signals.independent_completion < 0.5)) {
    falsePositiveSuppressed = true;
    suppressionReason =
      'Mastery capped at Developing Stability because accuracy relied on heavy hints without independent transfer.';
    finalScore = Math.min(finalScore, 0.58);
  } else if (transferFailed) {
    falsePositiveSuppressed = true;
    suppressionReason =
      'Mastery capped until the concept holds across a novel transfer variation.';
    finalScore = Math.min(finalScore, 0.6);
  } else if (weakReasoning && finalScore > 0.65) {
    falsePositiveSuppressed = true;
    suppressionReason =
      'Correctness alone cannot confirm high mastery — clearer explanation of reasoning is needed.';
    finalScore = Math.min(finalScore, 0.65);
  }

  // Contradiction severity caps (Sec 27 & 51.9)
  if (highestContradictionSeverity === 'high') {
    finalScore = Math.min(finalScore, 0.52);
  } else if (highestContradictionSeverity === 'moderate') {
    finalScore = Math.min(finalScore, 0.6);
  }

  // Section 51.4: Strict High Mastery (> 0.80) requirements
  const highMasteryBlockers: string[] = [];
  if (independence < 0.75) highMasteryBlockers.push('Needs consistent independent completion');
  if (transfer < 0.75 || signals.transferSuccessCount < 1) {
    highMasteryBlockers.push('Needs verified transfer on a novel variation');
  }
  if (reasoning < 0.7) highMasteryBlockers.push('Needs stable reasoning explanation');
  if (signals.hint_dependency > 0.3) highMasteryBlockers.push('Reduce reliance on guided hints');
  if (signals.misconception_frequency > 0.25) {
    highMasteryBlockers.push('Resolve recurring misconceptions');
  }
  if (contradictions.some((c) => c.severity !== 'low')) {
    highMasteryBlockers.push('Resolve active performance-reasoning contradiction');
  }

  const highMasteryEligible = highMasteryBlockers.length === 0;
  if (!highMasteryEligible && finalScore > 0.8) {
    finalScore = 0.79;
  }

  const band = getMasteryBand(finalScore);

  // Longitudinal Retention Validation (Sec 26 & 51.10)
  let retentionStatus: MasteryEvaluationResult['retentionStatus'] = 'unverified';
  if (typeof signals.previousSessionScore === 'number') {
    if (finalScore + 0.12 < signals.previousSessionScore) {
      retentionStatus = 'regressed';
    } else if (signals.retention_stability >= 0.65) {
      retentionStatus = 'stable';
    }
  } else if (signals.attemptsCount >= 2 && signals.retention_stability >= 0.7) {
    retentionStatus = 'stable';
  }

  const masteryStability: MasteryEvaluationResult['masteryStability'] =
    highestContradictionSeverity === 'high' || finalScore < 0.41
      ? 'low'
      : highestContradictionSeverity === 'moderate' || finalScore <= 0.72
      ? 'moderate'
      : 'high';

  const transferReliability: MasteryEvaluationResult['transferReliability'] =
    signals.transferAttemptsCount === 0
      ? 'untested'
      : transfer >= 0.75
      ? 'reliable'
      : transfer >= 0.5
      ? 'developing'
      : 'fragile';

  let nextPedagogicalAction = 'Continue guided exploration with a quick reasoning check.';
  if (highestContradictionSeverity === 'high') {
    nextPedagogicalAction = contradictions[0].stabilizationAction;
  } else if (falsePositiveSuppressed) {
    nextPedagogicalAction =
      'Present a fresh independent transfer question with minimal hints to confirm true mastery.';
  } else if (signals.transferAttemptsCount === 0 && finalScore >= 0.55) {
    nextPedagogicalAction = 'Run a Transfer Validation check in a new context before advancing.';
  } else if (band === 'Reliable Transfer Mastery') {
    nextPedagogicalAction = 'Mastery verified — move to synthesis or a higher-order extension.';
  } else if (retentionStatus === 'regressed') {
    nextPedagogicalAction = 'Refresh core anchor concept calmly with a delayed-recall warm-up.';
  }

  return {
    rawScore,
    finalScore,
    percent: Math.round(finalScore * 100),
    band,
    falsePositiveSuppressed,
    suppressionReason,
    highMasteryEligible,
    highMasteryBlockers,
    contradictions,
    highestContradictionSeverity,
    retentionStatus,
    masteryStability,
    transferReliability,
    nextPedagogicalAction,
  };
}

/**
 * Deterministic signal updater when a student submits an interactive assessment,
 * requests a hint, completes a transfer challenge, or shares whiteboard work.
 */
export function applyAssessmentEventToSignals(
  prev: MasterySignals,
  event:
    | {
        type: 'practice_answer';
        isCorrect: boolean;
        reasoningText: string;
        usedHintThisQuestion: boolean;
        expressedHighConfidence?: boolean;
      }
    | {
        type: 'hint_requested';
      }
    | {
        type: 'transfer_answer';
        isCorrect: boolean;
        reasoningText: string;
        usedHintThisQuestion: boolean;
      }
    | {
        type: 'whiteboard_step';
        coherent: boolean;
        misconceptionDetected: boolean;
      }
    | {
        type: 'tutor_chat_turn';
        showsReasoning: boolean;
        showsConfusion: boolean;
        isAccentOrCodeSwitch: boolean; // Sec 34A: NEVER penalize
      }
): MasterySignals {
  if (event.type === 'hint_requested') {
    return {
      ...prev,
      hintsUsedCount: prev.hintsUsedCount + 1,
      hint_dependency: clamp01(prev.hint_dependency + 0.2),
      independent_completion: clamp01(prev.independent_completion - 0.08),
    };
  }

  if (event.type === 'practice_answer') {
    const cleanReason = event.reasoningText.trim();
    const hasMeaningfulReasoning =
      cleanReason.length >= 16 &&
      /(because|since|so|therefore|means|greater|less|equal|cool|heat|evapor|condens|evidence|quote|cause|effect|angle|slope|step|trade|supply|demand|variable)/i.test(
        cleanReason
      );
    const partialReasoning = cleanReason.length >= 8;

    const reasoningDelta = hasMeaningfulReasoning
      ? 0.24
      : partialReasoning
      ? 0.08
      : -0.14;

    return {
      ...prev,
      attemptsCount: prev.attemptsCount + 1,
      correctAnswersCount: prev.correctAnswersCount + (event.isCorrect ? 1 : 0),
      verbalReasoningSubmittedCount: prev.verbalReasoningSubmittedCount + 1,
      verbalReasoningStrongCount:
        prev.verbalReasoningStrongCount + (hasMeaningfulReasoning ? 1 : 0),
      procedural_accuracy: clamp01(
        prev.procedural_accuracy + (event.isCorrect ? 0.22 : -0.12)
      ),
      conceptual_understanding: clamp01(
        prev.conceptual_understanding +
          (event.isCorrect && hasMeaningfulReasoning
            ? 0.24
            : event.isCorrect
            ? 0.08
            : -0.1)
      ),
      reasoning_clarity: clamp01(prev.reasoning_clarity + reasoningDelta),
      independent_completion: clamp01(
        prev.independent_completion +
          (event.isCorrect && !event.usedHintThisQuestion
            ? 0.24
            : event.isCorrect
            ? 0.04
            : -0.08)
      ),
      hint_dependency: clamp01(
        prev.hint_dependency + (event.usedHintThisQuestion ? 0.14 : -0.06)
      ),
      misconception_frequency: clamp01(
        prev.misconception_frequency + (event.isCorrect ? -0.05 : 0.18)
      ),
      confidentWrongCount:
        prev.confidentWrongCount +
        (!event.isCorrect && event.expressedHighConfidence ? 1 : 0),
      recovery_stability: clamp01(
        prev.recovery_stability + (event.isCorrect ? 0.08 : -0.04)
      ),
      retention_stability: clamp01(
        prev.retention_stability + (event.isCorrect ? 0.1 : -0.05)
      ),
    };
  }

  if (event.type === 'transfer_answer') {
    const cleanReason = event.reasoningText.trim();
    const strongReason = cleanReason.length >= 14;
    return {
      ...prev,
      attemptsCount: prev.attemptsCount + 1,
      transferAttemptsCount: prev.transferAttemptsCount + 1,
      transferSuccessCount: prev.transferSuccessCount + (event.isCorrect ? 1 : 0),
      correctAnswersCount: prev.correctAnswersCount + (event.isCorrect ? 1 : 0),
      verbalReasoningSubmittedCount: prev.verbalReasoningSubmittedCount + 1,
      verbalReasoningStrongCount:
        prev.verbalReasoningStrongCount + (strongReason ? 1 : 0),
      transfer_performance: clamp01(
        event.isCorrect
          ? Math.max(prev.transfer_performance + 0.42, event.usedHintThisQuestion ? 0.65 : 0.85)
          : Math.min(prev.transfer_performance, 0.3)
      ),
      conceptual_understanding: clamp01(
        prev.conceptual_understanding + (event.isCorrect ? 0.22 : -0.1)
      ),
      independent_completion: clamp01(
        prev.independent_completion +
          (event.isCorrect && !event.usedHintThisQuestion ? 0.25 : event.isCorrect ? 0.05 : -0.08)
      ),
      reasoning_clarity: clamp01(
        prev.reasoning_clarity + (strongReason ? 0.2 : -0.08)
      ),
      hint_dependency: clamp01(
        prev.hint_dependency + (event.usedHintThisQuestion ? 0.12 : -0.08)
      ),
      misconception_frequency: clamp01(
        prev.misconception_frequency + (event.isCorrect ? -0.08 : 0.14)
      ),
      retention_stability: clamp01(
        prev.retention_stability + (event.isCorrect ? 0.14 : -0.04)
      ),
    };
  }

  if (event.type === 'whiteboard_step') {
    return {
      ...prev,
      whiteboardSuccessCount: prev.whiteboardSuccessCount + (event.coherent ? 1 : 0),
      procedural_accuracy: clamp01(
        prev.procedural_accuracy + (event.coherent ? 0.12 : -0.08)
      ),
      misconception_frequency: clamp01(
        prev.misconception_frequency + (event.misconceptionDetected ? 0.16 : -0.03)
      ),
    };
  }

  // tutor_chat_turn — Sec 34A: Accent / code-switching NEVER penalizes mastery signals
  if (event.isAccentOrCodeSwitch && !event.showsConfusion) {
    return prev;
  }

  return {
    ...prev,
    reasoning_clarity: clamp01(
      prev.reasoning_clarity + (event.showsReasoning ? 0.1 : 0)
    ),
    conceptual_understanding: clamp01(
      prev.conceptual_understanding + (event.showsReasoning ? 0.08 : event.showsConfusion ? -0.05 : 0)
    ),
    recovery_stability: clamp01(
      prev.recovery_stability + (event.showsReasoning ? 0.06 : event.showsConfusion ? -0.06 : 0)
    ),
  };
}

/**
 * Section 24: Transfer Validation — 6 Variation Dimensions without changing core concept.
 */
export const TRANSFER_VARIATION_DIMENSIONS = [
  'context',
  'representation',
  'problem_structure',
  'application_path',
  'reasoning_sequence',
  'difficulty_layer',
] as const;

export type TransferVariationDimension = (typeof TRANSFER_VARIATION_DIMENSIONS)[number];

export interface SubjectAssessmentBundle {
  practiceQuestion: {
    prompt: string;
    options: string[];
    correctOption: string;
    guidedHint: string;
    reasoningPlaceholder: string;
    correctExplanation: string;
    incorrectNudge: string;
  };
  transferQuestion: {
    variationDimensions: TransferVariationDimension[];
    variationSummary: string;
    prompt: string;
    options: string[];
    correctOption: string;
    reasoningPlaceholder: string;
    correctExplanation: string;
    incorrectNudge: string;
  };
  orderingQuestion: {
    prompt: string;
    items: Array<{ id: string; text: string }>;
    expectedOrderIds: string[];
    hintOnWrong: string;
  };
}

export function buildSubjectAssessmentBundle(params: {
  subject: string;
  topic: string;
  primaryFamily: PedagogyFamilyId;
  isAngles: boolean;
  isWaterCycle: boolean;
}): SubjectAssessmentBundle {
  if (params.isWaterCycle) {
    return {
      practiceQuestion: {
        prompt:
          'Tiny water droplets form on the outside of an ice-cold glass of lemonade. Which process is this?',
        options: ['Evaporation', 'Condensation', 'Precipitation', 'Collection'],
        correctOption: 'Condensation',
        guidedHint:
          'Ask yourself: is liquid turning into invisible vapour, or is warm air vapour cooling down into liquid drops on a cold surface?',
        reasoningPlaceholder:
          'e.g., Because warm water vapour in the air cools when it touches the cold glass...',
        correctExplanation:
          'Correct! Warm water vapour in the air cooled on the cold glass surface and turned back into liquid droplets (Condensation).',
        incorrectNudge:
          'Not quite — focus on the state change: invisible gas in the air is cooling into visible liquid droplets.',
      },
      transferQuestion: {
        variationDimensions: ['context', 'application_path'],
        variationSummary: 'Context + Application shift (everyday morning dew & mirror fog)',
        prompt:
          'Transfer Check: After a hot shower, the bathroom mirror becomes foggy. Which causal chain explains why?',
        options: [
          'Cold water leaked through the mirror glass from behind',
          'Warm water vapour cooled on the cooler mirror surface and condensed into tiny liquid droplets',
          'Shower steam evaporated off the mirror into solid ice crystals',
          'Precipitation fell directly from the bathroom ceiling',
        ],
        correctOption:
          'Warm water vapour cooled on the cooler mirror surface and condensed into tiny liquid droplets',
        reasoningPlaceholder:
          'Connect how temperature difference causes the same phase change in this new setting...',
        correctExplanation:
          'Strong transfer! You recognized Condensation in a completely new everyday situation.',
        incorrectNudge:
          'Compare the mirror to the cold lemonade glass — what happens when warm vapour hits a cooler surface?',
      },
      orderingQuestion: {
        prompt: 'Arrange the four stages of the water cycle in causal order.',
        items: [
          { id: 'wc-2', text: 'Condensation: Rising vapour cools high in the sky to form clouds.' },
          { id: 'wc-1', text: 'Evaporation: Heat from the Sun turns ocean water into water vapour.' },
          { id: 'wc-4', text: 'Collection: Rainwater flows back into rivers, lakes, and oceans.' },
          { id: 'wc-3', text: 'Precipitation: Heavy cloud droplets fall back to Earth as rain, snow, or hail.' },
        ],
        expectedOrderIds: ['wc-1', 'wc-2', 'wc-3', 'wc-4'],
        hintOnWrong: 'Start with Sun heat (Evaporation), then cooling clouds, rainfall, and collection.',
      },
    };
  }

  if (params.isAngles) {
    return {
      practiceQuestion: {
        prompt: 'An open laptop lid forms an angle of 125°. Which type of angle is 125°?',
        options: ['Acute Angle', 'Right Angle', 'Obtuse Angle', 'Straight Angle'],
        correctOption: 'Obtuse Angle',
        guidedHint:
          'Compare 125° to a 90° square corner and a 180° flat straight line — where does it sit?',
        reasoningPlaceholder:
          'e.g., Because 125° is greater than 90° and less than 180°...',
        correctExplanation:
          'Correct! 125° is wider than a 90° right angle but narrower than a 180° straight line, so it is Obtuse.',
        incorrectNudge:
          'Think about a 90° L-corner: is 125° narrower than 90°, equal to 90°, or wider than 90°?',
      },
      transferQuestion: {
        variationDimensions: ['context', 'representation', 'problem_structure'],
        variationSummary: 'Representation + Problem Structure shift (straight-line supplementary reasoning)',
        prompt:
          'Transfer Check: Two rays split a flat 180° straight road into two angles. One angle measures 55°. What type of angle is the remaining angle?',
        options: [
          'Acute Angle (35°)',
          'Right Angle (90°)',
          'Obtuse Angle (125°)',
          'Straight Angle (180°)',
        ],
        correctOption: 'Obtuse Angle (125°)',
        reasoningPlaceholder:
          'Explain how you calculated the missing angle from 180° and classified it...',
        correctExplanation:
          'Reliable transfer! Subtracting 55° from 180° gives 125°, which is Obtuse.',
        incorrectNudge:
          'First find the missing part of the 180° straight line (180 − 55), then classify that angle.',
      },
      orderingQuestion: {
        prompt: 'Put these steps in order to measure an angle accurately with a protractor.',
        items: [
          { id: 'ang-1', text: 'Place the center crosshair of the protractor right on the vertex.' },
          { id: 'ang-2', text: 'Read the degree number where the second ray crosses the scale.' },
          { id: 'ang-3', text: 'Line up the baseline ray carefully along the 0° mark.' },
        ],
        expectedOrderIds: ['ang-1', 'ang-3', 'ang-2'],
        hintOnWrong: 'Anchor the vertex first, align the 0° baseline next, and read the scale last.',
      },
    };
  }

  if (params.primaryFamily === 'procedural_reasoning') {
    return {
      practiceQuestion: {
        prompt: `In solving 2x + 3 = 11 for ${params.topic || 'Linear Equations'}, what is the cleanest first transformation?`,
        options: [
          'Divide only 11 by 2 first',
          'Subtract 3 from both sides to isolate the 2x term',
          'Add 3 to both sides to get 2x = 14',
          'Multiply both sides by 3',
        ],
        correctOption: 'Subtract 3 from both sides to isolate the 2x term',
        guidedHint:
          'To keep an equation balanced, undo the constant term (+3) using its inverse operation on BOTH sides.',
        reasoningPlaceholder:
          'e.g., Because subtracting 3 from both sides keeps the equation balanced and isolates 2x...',
        correctExplanation:
          'Correct! Subtracting 3 from both sides preserves equality and gives 2x = 8.',
        incorrectNudge:
          'Check which operation undoes "+ 3" while keeping both sides of the equation equal.',
      },
      transferQuestion: {
        variationDimensions: ['context', 'representation', 'problem_structure'],
        variationSummary: 'Word-problem context + inverse structure shift (no bare equation given)',
        prompt:
          'Transfer Check: A streaming pass costs a $3 setup fee plus $2 per rented movie. If Maya spent $11 total, how many movies did she rent?',
        options: ['3 movies', '4 movies', '5 movies', '7 movies'],
        correctOption: '4 movies',
        reasoningPlaceholder:
          'Explain how you translated the story into steps and verified your answer...',
        correctExplanation:
          'Great transfer! Removing the $3 setup fee leaves $8, and $8 ÷ $2 per movie = 4 movies.',
        incorrectNudge:
          'Take out the one-time $3 fee from $11 first, then divide what remains by $2 per movie.',
      },
      orderingQuestion: {
        prompt: 'Order the steps for solving and verifying a two-step linear equation.',
        items: [
          { id: 'math-2', text: 'Divide both sides by the coefficient to solve for the variable.' },
          { id: 'math-1', text: 'Use addition or subtraction on both sides to isolate the variable term.' },
          { id: 'math-3', text: 'Substitute your solution back into the original equation to verify both sides match.' },
        ],
        expectedOrderIds: ['math-1', 'math-2', 'math-3'],
        hintOnWrong: 'Isolate the variable term first, solve for the variable, then substitute back to check.',
      },
    };
  }

  if (params.primaryFamily === 'systems_logic') {
    return {
      practiceQuestion: {
        prompt: `In ${params.subject} (${params.topic}), if input supply suddenly drops while demand stays constant, what happens first in the system?`,
        options: [
          'A shortage creates upward pressure on equilibrium price',
          'Surplus inventory piles up immediately',
          'Demand disappears to zero automatically',
          'Nothing changes because markets ignore supply',
        ],
        correctOption: 'A shortage creates upward pressure on equilibrium price',
        guidedHint:
          'Trace the constraint: fewer units are available for the same number of buyers — does that create a shortage or surplus?',
        reasoningPlaceholder:
          'e.g., Because lower supply at the old price means quantity demanded exceeds quantity supplied...',
        correctExplanation:
          'Correct! Lower supply creates a shortage at the original price, pushing equilibrium price upward.',
        incorrectNudge:
          'Compare quantity available vs. quantity wanted at the current price before predicting the price move.',
      },
      transferQuestion: {
        variationDimensions: ['context', 'application_path', 'difficulty_layer'],
        variationSummary: 'New domain constraint shift (resource bottleneck & feedback trade-off)',
        prompt:
          'Transfer Check: A school bakery loses half its ovens during finals week while student orders stay high. Which trade-off best reflects the system effect?',
        options: [
          'Wait times or prices rise unless capacity increases or orders are rationed',
          'More bread is baked automatically because fewer ovens run faster',
          'Zero trade-off occurs because demand adapts instantly without cost',
          'Surplus bread is thrown away at lower prices',
        ],
        correctOption:
          'Wait times or prices rise unless capacity increases or orders are rationed',
        reasoningPlaceholder:
          'Explain how the bottleneck changes incentives or allocation across the system...',
        correctExplanation:
          'Strong systems transfer! You traced the same scarcity-and-trade-off logic in a new real-world scenario.',
        incorrectNudge:
          'Think of oven capacity as supply — when capacity drops below orders, what must adjust?',
      },
      orderingQuestion: {
        prompt: 'Order the steps of a systems & trade-off analysis.',
        items: [
          { id: 'sys-2', text: 'Trace the direct bottleneck or incentive shift across connected variables.' },
          { id: 'sys-1', text: 'Identify the initial constraint change and baseline equilibrium.' },
          { id: 'sys-3', text: 'Evaluate secondary trade-offs and verify whether the new state stabilizes.' },
        ],
        expectedOrderIds: ['sys-1', 'sys-2', 'sys-3'],
        hintOnWrong: 'Define the baseline constraint first, trace the direct shift, then weigh secondary trade-offs.',
      },
    };
  }

  if (params.primaryFamily === 'contextual_analytical') {
    return {
      practiceQuestion: {
        prompt: `When analyzing a historical turning point in ${params.topic || params.subject}, which approach demonstrates strong causal reasoning?`,
        options: [
          'Memorizing only the exact calendar year without context',
          'Connecting prior economic/political conditions to the event and its documented consequences',
          'Listing unrelated facts from a different century',
          'Ignoring primary source perspectives that disagree',
        ],
        correctOption:
          'Connecting prior economic/political conditions to the event and its documented consequences',
        guidedHint:
          'Strong historical analysis asks WHY an event happened then and HOW evidence links causes to outcomes.',
        reasoningPlaceholder:
          'e.g., Because cause-and-effect requires chronological context backed by sources...',
        correctExplanation:
          'Correct! Linking prior conditions to documented outcomes builds real historical understanding.',
        incorrectNudge:
          'Avoid trivia-only recall — focus on how prior conditions shaped later outcomes.',
      },
      transferQuestion: {
        variationDimensions: ['context', 'reasoning_sequence', 'application_path'],
        variationSummary: 'Comparative primary-source perspective shift',
        prompt:
          'Transfer Check: Two primary sources from the same decade describe a new trade tariff — one from a factory owner and one from a port merchant — with opposite conclusions. What is the strongest analytical step?',
        options: [
          'Discard both sources because they disagree',
          'Compare each author’s economic context and incentives to explain why their viewpoints diverge',
          'Assume the longer letter is automatically more factual',
          'Average both opinions without checking evidence',
        ],
        correctOption:
          'Compare each author’s economic context and incentives to explain why their viewpoints diverge',
        reasoningPlaceholder:
          'Explain why comparing author context strengthens historical interpretation...',
        correctExplanation:
          'Reliable analytical transfer! Weighing perspective against historical context unlocks nuance.',
        incorrectNudge:
          'When two primary sources disagree, ask what each author stood to gain or lose in that context.',
      },
      orderingQuestion: {
        prompt: 'Order these steps for contextual historical analysis.',
        items: [
          { id: 'soc-2', text: 'Examine primary evidence and author perspective within that era.' },
          { id: 'soc-1', text: 'Establish the chronological timeline and preceding conditions.' },
          { id: 'soc-3', text: 'Synthesize short-term and long-term cause-and-effect outcomes.' },
        ],
        expectedOrderIds: ['soc-1', 'soc-2', 'soc-3'],
        hintOnWrong: 'Start with chronology and prior conditions, then evaluate evidence, then synthesize outcomes.',
      },
    };
  }

  // Default: Language Arts / Interpretation & Expression / Skill / Discussion
  return {
    practiceQuestion: {
      prompt:
        'Sam sees an unfamiliar word ("evaporation") in an informational article and wants its exact meaning quickly. Which text feature should Sam use?',
      options: ['Heading', 'Caption', 'Diagram', 'Glossary'],
      correctOption: 'Glossary',
      guidedHint:
        'Think about which text feature organizes key subject vocabulary alphabetically with definitions.',
      reasoningPlaceholder:
        'e.g., Because a glossary defines key vocabulary terms from the article...',
      correctExplanation:
        'Correct! A glossary lists key terms and their definitions so readers can check meanings accurately.',
      incorrectNudge:
        'Headings organize sections and captions explain pictures — which feature defines vocabulary?',
    },
    transferQuestion: {
      variationDimensions: ['context', 'representation', 'application_path'],
      variationSummary: 'Context + Evidence-integration transfer shift',
      prompt:
        'Transfer Check: In a literary analysis paragraph, a student claims a character feels trapped. Which addition best proves that claim without letting someone else write the essay?',
      options: [
        'Repeating "the character is trapped" three times',
        'Embedding a short quoted phrase from the passage and explaining how its imagery signals confinement',
        'Adding the book’s publication date at the end',
        'Listing every event in chapter one from start to finish',
      ],
      correctOption:
        'Embedding a short quoted phrase from the passage and explaining how its imagery signals confinement',
      reasoningPlaceholder:
        'Explain why textual evidence plus your own analysis makes a claim defensible...',
      correctExplanation:
        'Strong transfer! Linking a specific quote directly to your interpretation proves the claim.',
      incorrectNudge:
        'Plot summary or repetition is not proof — what connects your claim directly to the author’s words?',
    },
    orderingQuestion: {
      prompt: 'Put these steps in order for building an evidence-backed response.',
      items: [
        { id: 'step-2', text: 'Select a concise piece of evidence from the text that supports your point.' },
        { id: 'step-1', text: 'State a clear, arguable claim answering the prompt in your own words.' },
        { id: 'step-3', text: 'Explain how the evidence proves your claim and connects to the bigger meaning.' },
      ],
      expectedOrderIds: ['step-1', 'step-2', 'step-3'],
      hintOnWrong: 'Start with your claim, bring in focused evidence, then unpack how it proves your point.',
    },
  };
}

/**
 * Sections 37 & 38: Whiteboard Real-Time Signal & 6-Misconception Analyzer.
 */
export type WhiteboardMisconceptionIndicator =
  | 'repeated_incorrect_transformations'
  | 'symbol_misuse'
  | 'representation_collapse'
  | 'contradictory_solving_steps'
  | 'formula_misapplication'
  | 'repeated_reversal_errors';

export type SignalConfidenceTier = 'high' | 'moderate' | 'low';

export interface WhiteboardTelemetryInput {
  expressions: string[];
  strokeCount: number;
  eraseOrUndoCount: number;
  clearCount: number;
  pauseSeconds: number;
  studentNote?: string;
}

export interface WhiteboardAnalysisResult {
  confidence: SignalConfidenceTier;
  stepCount: number;
  reworkFrequency: 'low' | 'moderate' | 'high';
  misconceptionIndicators: WhiteboardMisconceptionIndicator[];
  shouldAutoComplete: false; // Hard invariant from Sec 37/38: NEVER auto-complete
  interventionDecision:
    | 'observe_silently'
    | 'ask_clarification_first'
    | 'targeted_single_step_guidance';
  tutorSummary: string;
}

export function analyzeWhiteboardSignals(
  input: WhiteboardTelemetryInput
): WhiteboardAnalysisResult {
  const expressions = input.expressions.map((e) => e.trim()).filter(Boolean);
  const stepCount = expressions.length + (input.strokeCount > 0 ? 1 : 0);
  const reworkTotal = input.eraseOrUndoCount + input.clearCount * 2;
  const reworkFrequency: WhiteboardAnalysisResult['reworkFrequency'] =
    reworkTotal >= 5 ? 'high' : reworkTotal >= 2 ? 'moderate' : 'low';

  const misconceptionIndicators: WhiteboardMisconceptionIndicator[] = [];

  // Detect symbol misuse (unbalanced parens, double operators like ++ or == or stray =)
  const hasSymbolMisuse = expressions.some((expr) => {
    const opens = (expr.match(/\(/g) || []).length;
    const closes = (expr.match(/\)/g) || []).length;
    return opens !== closes || /[+\-*/^]{2,}|={2,}/.test(expr.replace(/\s+/g, ''));
  });
  if (hasSymbolMisuse) {
    misconceptionIndicators.push('symbol_misuse');
  }

  // Detect contradictory solving steps (e.g., same variable assigned conflicting constants)
  const assignments = expressions
    .map((e) => e.replace(/\s+/g, '').toLowerCase())
    .filter((e) => /^[a-z]=-?\d+(\.\d+)?$/.test(e));
  if (assignments.length >= 2) {
    const byVar = new Map<string, Set<string>>();
    for (const a of assignments) {
      const [v, val] = a.split('=');
      if (!byVar.has(v)) byVar.set(v, new Set());
      byVar.get(v)!.add(val);
    }
    for (const vals of byVar.values()) {
      if (vals.size > 1) {
        misconceptionIndicators.push('contradictory_solving_steps');
        break;
      }
    }
  }

  // High rework / erase loops suggest repeated reversal or transformation struggle
  if (input.clearCount >= 2 || input.eraseOrUndoCount >= 5) {
    misconceptionIndicators.push('repeated_reversal_errors');
  }
  if (reworkFrequency === 'high' && expressions.length >= 2) {
    misconceptionIndicators.push('repeated_incorrect_transformations');
  }

  let confidence: SignalConfidenceTier = 'high';
  if (stepCount === 0 || (expressions.length === 0 && input.strokeCount <= 2)) {
    confidence = 'low';
  } else if (
    misconceptionIndicators.length > 0 ||
    reworkFrequency === 'high' ||
    input.pauseSeconds >= 45
  ) {
    confidence = 'moderate';
  }

  let interventionDecision: WhiteboardAnalysisResult['interventionDecision'] = 'observe_silently';
  if (confidence === 'low') {
    interventionDecision = 'ask_clarification_first';
  } else if (misconceptionIndicators.length > 0 || input.pauseSeconds >= 45) {
    interventionDecision = 'targeted_single_step_guidance';
  }

  const tutorSummary =
    confidence === 'low'
      ? 'Whiteboard work is incomplete or ambiguous — ask the student to explain what they intend for their next step before assuming or completing anything.'
      : misconceptionIndicators.length > 0
      ? `Detected ${misconceptionIndicators.join(', ')} on whiteboard (${expressions.length} expressions, rework: ${reworkFrequency}). Address only the earliest single issue without correcting multiple errors at once.`
      : `Whiteboard work looks structurally coherent (${expressions.length} expressions, ${input.strokeCount} strokes). Validate reasoning verbally and never auto-complete remaining steps.`;

  return {
    confidence,
    stepCount,
    reworkFrequency,
    misconceptionIndicators,
    shouldAutoComplete: false,
    interventionDecision,
    tutorSummary,
  };
}

/**
 * Sections 34, 34A, 35, 36: Voice, Interruption Recovery & Accent/Code-Switching Signal Analyzer.
 */
export interface VoiceTelemetryInput {
  transcript: string;
  interruptedTutorText?: string | null;
  speechConfidence?: SignalConfidenceTier;
  codeSwitchingDetected?: boolean;
  accentVariabilityDetected?: boolean;
  turnCountWithConfusion?: number;
}

export interface VoiceAnalysisResult {
  speechConfidence: SignalConfidenceTier;
  accentOrCodeSwitchingNeutral: boolean;
  interruptionRecoveryActive: boolean;
  preservedContextSnippet: string | null;
  spokenCognitiveLoad: 'low' | 'moderate' | 'high';
  recommendedVoiceAction:
    | 'proceed_normally'
    | 'validate_context_selectively'
    | 'calm_targeted_clarification'
    | 'resume_after_interruption';
  directive: string;
}

export function analyzeVoiceSignals(input: VoiceTelemetryInput): VoiceAnalysisResult {
  const clean = input.transcript.trim();
  const wordCount = clean ? clean.split(/\s+/).length : 0;

  // Detect likely code-switching markers or hesitation fillers without penalizing
  const codeSwitchingDetected =
    Boolean(input.codeSwitchingDetected) ||
    /\b(matlab|samajh|nahi|pero|entonces|donc|also|yaani|kya|por qué)\b/i.test(clean);

  const hasAmbiguousFragments =
    wordCount <= 2 && !/^(yes|no|acute|right|obtuse|straight|evaporation|condensation|glossary|\d+°?)$/i.test(clean);

  const speechConfidence: SignalConfidenceTier =
    input.speechConfidence ??
    (clean.length === 0 || /\[inaudible\]|\?\?\?/.test(clean)
      ? 'low'
      : hasAmbiguousFragments
      ? 'moderate'
      : 'high');

  const interruptionRecoveryActive = Boolean(
    input.interruptedTutorText && input.interruptedTutorText.trim().length > 0
  );
  const preservedContextSnippet = interruptionRecoveryActive
    ? input.interruptedTutorText!.trim().slice(0, 140)
    : null;

  const spokenCognitiveLoad: VoiceAnalysisResult['spokenCognitiveLoad'] =
    (input.turnCountWithConfusion ?? 0) >= 2 || speechConfidence === 'low'
      ? 'high'
      : (input.turnCountWithConfusion ?? 0) === 1
      ? 'moderate'
      : 'low';

  let recommendedVoiceAction: VoiceAnalysisResult['recommendedVoiceAction'] = 'proceed_normally';
  let directive =
    'Keep spoken response short (2-3 crisp sentences), conversational, with natural pauses and zero turn stealing.';

  if (interruptionRecoveryActive) {
    recommendedVoiceAction = 'resume_after_interruption';
    directive = `Student interrupted tutor narration ("${preservedContextSnippet}"). Prioritize the student's question immediately, preserve unfinished context seamlessly, and NEVER restart the prior explanation from scratch.`;
  } else if (speechConfidence === 'low') {
    recommendedVoiceAction = 'calm_targeted_clarification';
    directive =
      'Speech recognition confidence is low. Summarize what you understood first, ask one calm targeted clarification for only the unclear part, and NEVER hallucinate missing words or penalize accent/hesitation.';
  } else if (speechConfidence === 'moderate') {
    recommendedVoiceAction = 'validate_context_selectively';
    directive =
      'Speech confidence is moderate. Briefly confirm the key term or number in context while keeping the conversation warm and natural.';
  }

  if (codeSwitchingDetected || input.accentVariabilityDetected) {
    directive +=
      ' Accent variability or multilingual code-switching detected: interpret meaning generously and NEVER reduce mastery score for pronunciation, accent, or hesitation.';
  }

  return {
    speechConfidence,
    accentOrCodeSwitchingNeutral: true,
    interruptionRecoveryActive,
    preservedContextSnippet,
    spokenCognitiveLoad,
    recommendedVoiceAction,
    directive,
  };
}
