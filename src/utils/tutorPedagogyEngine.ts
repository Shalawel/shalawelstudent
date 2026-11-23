import type { SessionHelpType } from '../types/dashboard';

/**
 * TutorCloud AI-Tutor Production Prompt Pack v1.0
 * Sections 1–2, 16–22A, 47–50, 52 & Appendices C–D
 *
 * Pure deterministic module governing:
 * - Prompt governance metadata & 7-level runtime authority hierarchy
 * - 7 Adaptive Pedagogy Families + Multi-Family Subject Classifier
 * - 4 Dedicated Subject Runtime Packs (Mathematics, Science, Language Arts, Social Studies)
 * - 3 Session-Type Runtime Packs (concept_mastery, exam_preparation, homework_help)
 * - 7-point Production QA Validator
 */

export const PROMPT_PACK_VERSION = '1.0.0' as const;

export const PEDAGOGICAL_PRIORITY_CHAIN = [
  'Understanding',
  'Reasoning',
  'Transfer',
  'Mastery',
] as const;

/**
 * Section 52: Strict Runtime Authority Hierarchy (1 = highest, 7 = lowest).
 * Lower-priority layers NEVER override higher-priority layers.
 */
export const RUNTIME_AUTHORITY_HIERARCHY = [
  { rank: 1, key: 'instructional_truthfulness_safety', label: 'Instructional Truthfulness & Safety' },
  { rank: 2, key: 'curriculum_alignment', label: 'Curriculum Alignment' },
  { rank: 3, key: 'assessment_integrity', label: 'Assessment Integrity' },
  { rank: 4, key: 'mastery_reliability', label: 'Mastery Reliability' },
  { rank: 5, key: 'student_cognitive_stability', label: 'Student Cognitive Stability' },
  { rank: 6, key: 'conversational_continuity', label: 'Conversational Continuity' },
  { rank: 7, key: 'pacing_optimization', label: 'Pacing Optimization' },
] as const;

export type PedagogyFamilyId =
  | 'procedural_reasoning'
  | 'conceptual_causal'
  | 'interpretation_expression'
  | 'contextual_analytical'
  | 'systems_logic'
  | 'skill_practice'
  | 'discussion_perspective';

export type DedicatedSubjectPackId =
  | 'mathematics'
  | 'science'
  | 'language_arts'
  | 'social_studies'
  | 'general_family';

export type RuntimeSessionType =
  | 'concept_mastery'
  | 'exam_preparation'
  | 'homework_help';

export interface PedagogyFamilyDefinition {
  id: PedagogyFamilyId;
  label: string;
  shortLabel: string;
  exampleSubjects: string[];
  coreMethod: string;
  tutorDirective: string;
  masteryFocus: string;
  reasoningPromptCue: string;
}

export const PEDAGOGY_FAMILIES: Record<PedagogyFamilyId, PedagogyFamilyDefinition> = {
  procedural_reasoning: {
    id: 'procedural_reasoning',
    label: 'Procedural Reasoning',
    shortLabel: 'Procedural',
    exampleSubjects: ['Mathematics', 'Programming', 'Accounting', 'Statistics'],
    coreMethod: 'Step-by-step visible transformations, error isolation at earliest breakdown point, procedural + conceptual link.',
    tutorDirective:
      'Require visible intermediate reasoning steps, validate transformations sequentially, isolate the earliest breakdown point, and distinguish arithmetic slips from conceptual errors.',
    masteryFocus: 'Independent multi-step execution plus transfer to altered problem structures.',
    reasoningPromptCue: 'Explain which step or rule you applied and why it works here.',
  },
  conceptual_causal: {
    id: 'conceptual_causal',
    label: 'Conceptual & Causal Modeling',
    shortLabel: 'Conceptual-Causal',
    exampleSubjects: ['Science', 'Physics', 'Chemistry', 'Biology', 'Environmental Science'],
    coreMethod: 'Mental-model probing, cause-and-effect reasoning, observable everyday phenomena, prediction checks.',
    tutorDirective:
      'Build conceptual mental models from observable real-world phenomena, use prediction and cause-and-effect questions, diagnose flawed mental models before correcting, and never dump terminology.',
    masteryFocus: 'Accurate causal explanation and prediction in an unfamiliar real-world scenario.',
    reasoningPromptCue: 'Explain what causes this change and what you would predict next.',
  },
  interpretation_expression: {
    id: 'interpretation_expression',
    label: 'Interpretation & Expression',
    shortLabel: 'Interpretation',
    exampleSubjects: ['English', 'Language Arts', 'Reading Comprehension', 'Creative Writing', 'Literature'],
    coreMethod: 'Evidence-based textual interpretation, structured claim-evidence reasoning, preserving student authorship.',
    tutorDirective:
      'Guide evidence-based interpretation and structured expression while preserving student authorship. Never ghostwrite or rewrite essays for the student; accept multiple evidence-backed interpretations and prioritize meaning over minor grammar during conceptual analysis.',
    masteryFocus: 'Defensible claim linked directly to textual evidence in the student’s own voice.',
    reasoningPromptCue: 'Point to the clue or textual evidence that backs up your interpretation.',
  },
  contextual_analytical: {
    id: 'contextual_analytical',
    label: 'Contextual & Analytical Reasoning',
    shortLabel: 'Contextual-Analytical',
    exampleSubjects: ['Social Studies', 'History', 'Geography', 'Politics', 'Civics', 'World Affairs'],
    coreMethod: 'Chronological sequencing, cause-and-effect, primary source evidence, comparative and civic perspective.',
    tutorDirective:
      'Develop contextual, chronological, and comparative analysis using historical or civic evidence. Avoid trivia-style date/fact memorization without explaining causal significance.',
    masteryFocus: 'Explaining why events unfolded in context and comparing perspectives with evidence.',
    reasoningPromptCue: 'Explain the historical or contextual cause behind your choice.',
  },
  systems_logic: {
    id: 'systems_logic',
    label: 'Systems & Trade-off Logic',
    shortLabel: 'Systems Logic',
    exampleSubjects: ['Economics', 'Computer Science', 'Business Studies', 'Systems Thinking'],
    coreMethod: 'Input-process-output modeling, feedback loops, incentives, constraints, and trade-off analysis.',
    tutorDirective:
      'Trace how interacting components, constraints, incentives, or state changes propagate across a system. Ask the student to predict ripple effects and evaluate trade-offs.',
    masteryFocus: 'Tracing system-wide consequences and debugging logic under changed constraints.',
    reasoningPromptCue: 'Explain how changing one variable affects the rest of the system.',
  },
  skill_practice: {
    id: 'skill_practice',
    label: 'Applied Skill Practice',
    shortLabel: 'Skill Practice',
    exampleSubjects: ['Spanish', 'French', 'World Languages', 'Language Learning', 'Reading Fluency', 'Communication Skills'],
    coreMethod: 'Active production, short iterative feedback loops, confidence-building modeling without over-penalizing accent or fluency hesitation.',
    tutorDirective:
      'Focus on active communicative production in short, achievable cycles. Model natural phrasing calmly, correct one high-impact pattern at a time, and never penalize accent or hesitation.',
    masteryFocus: 'Independent communicative production in a new everyday prompt.',
    reasoningPromptCue: 'Explain why this phrasing or structure fits the context.',
  },
  discussion_perspective: {
    id: 'discussion_perspective',
    label: 'Discussion & Perspective Inquiry',
    shortLabel: 'Perspective Inquiry',
    exampleSubjects: ['Philosophy', 'Ethics', 'World Religions', 'Debate', 'Critical Thinking'],
    coreMethod: 'Socratic questioning, identifying hidden premises, weighing competing viewpoints fairly, logical consistency.',
    tutorDirective:
      'Use calm Socratic questioning to test assumptions, examine competing perspectives respectfully, and evaluate logical consistency without imposing a single opinion where multiple reasoned positions exist.',
    masteryFocus: 'Articulating a logically consistent argument while fairly engaging a counter-perspective.',
    reasoningPromptCue: 'State your core premise and one counter-perspective someone might raise.',
  },
};

export interface SubjectClassification {
  subject: string;
  primaryFamily: PedagogyFamilyId;
  secondaryFamilies: PedagogyFamilyId[];
  allFamilies: PedagogyFamilyId[];
  dedicatedPack: DedicatedSubjectPackId;
  isMultiFamily: boolean;
}

/**
 * Section 22A: Classify any subject into 1 or more Pedagogy Families + Dedicated Pack.
 * Explicitly supports multi-family subjects (e.g., Economics, Computer Science, Physics, Geography).
 */
export function classifySubjectPedagogy(rawSubject: string, topicHint = ''): SubjectClassification {
  const s = `${rawSubject} ${topicHint}`.toLowerCase().trim();
  const sub = rawSubject.toLowerCase().trim();

  // Multi-family explicit mappings from Section 22A
  if (sub.includes('econom') || sub.includes('business')) {
    return {
      subject: rawSubject,
      primaryFamily: 'systems_logic',
      secondaryFamilies: ['contextual_analytical'],
      allFamilies: ['systems_logic', 'contextual_analytical'],
      dedicatedPack: 'social_studies',
      isMultiFamily: true,
    };
  }

  if (
    sub.includes('computer science') ||
    sub.includes('programming') ||
    sub.includes('coding') ||
    sub.includes('data science')
  ) {
    return {
      subject: rawSubject,
      primaryFamily: 'procedural_reasoning',
      secondaryFamilies: ['systems_logic'],
      allFamilies: ['procedural_reasoning', 'systems_logic'],
      dedicatedPack: 'general_family',
      isMultiFamily: true,
    };
  }

  if (sub.includes('physics') || sub.includes('chemistry')) {
    return {
      subject: rawSubject,
      primaryFamily: 'conceptual_causal',
      secondaryFamilies: ['procedural_reasoning'],
      allFamilies: ['conceptual_causal', 'procedural_reasoning'],
      dedicatedPack: 'science',
      isMultiFamily: true,
    };
  }

  // Dedicated Subject Packs (Sections 19–22)
  if (
    sub.includes('math') ||
    sub.includes('algebra') ||
    sub.includes('geometry') ||
    sub.includes('calculus') ||
    sub.includes('statistics') ||
    sub.includes('accounting') ||
    (sub.includes('solve my problem') && /[\d=+\-*/^]|angle|equation|fraction|slope/.test(s))
  ) {
    return {
      subject: rawSubject,
      primaryFamily: 'procedural_reasoning',
      secondaryFamilies: [],
      allFamilies: ['procedural_reasoning'],
      dedicatedPack: 'mathematics',
      isMultiFamily: false,
    };
  }

  if (
    sub.includes('science') ||
    sub.includes('biology') ||
    sub.includes('earth') ||
    sub.includes('environment')
  ) {
    return {
      subject: rawSubject,
      primaryFamily: 'conceptual_causal',
      secondaryFamilies: [],
      allFamilies: ['conceptual_causal'],
      dedicatedPack: 'science',
      isMultiFamily: false,
    };
  }

  if (
    sub.includes('english') ||
    sub.includes('language arts') ||
    sub.includes('literature') ||
    sub.includes('reading') ||
    sub.includes('writing')
  ) {
    return {
      subject: rawSubject,
      primaryFamily: 'interpretation_expression',
      secondaryFamilies: [],
      allFamilies: ['interpretation_expression'],
      dedicatedPack: 'language_arts',
      isMultiFamily: false,
    };
  }

  if (
    sub.includes('social studies') ||
    sub.includes('history') ||
    sub.includes('geography') ||
    sub.includes('civics') ||
    sub.includes('politic') ||
    sub.includes('world affairs')
  ) {
    return {
      subject: rawSubject,
      primaryFamily: 'contextual_analytical',
      secondaryFamilies: [],
      allFamilies: ['contextual_analytical'],
      dedicatedPack: 'social_studies',
      isMultiFamily: false,
    };
  }

  if (
    sub.includes('philosophy') ||
    sub.includes('ethics') ||
    sub.includes('debate') ||
    sub.includes('critical thinking') ||
    sub.includes('religion')
  ) {
    return {
      subject: rawSubject,
      primaryFamily: 'discussion_perspective',
      secondaryFamilies: [],
      allFamilies: ['discussion_perspective'],
      dedicatedPack: 'general_family',
      isMultiFamily: false,
    };
  }

  if (
    sub.includes('spanish') ||
    sub.includes('french') ||
    sub.includes('german') ||
    sub.includes('language') ||
    sub.includes('pronunciation') ||
    sub.includes('communication')
  ) {
    return {
      subject: rawSubject,
      primaryFamily: 'skill_practice',
      secondaryFamilies: [],
      allFamilies: ['skill_practice'],
      dedicatedPack: 'general_family',
      isMultiFamily: false,
    };
  }

  // Fallback for general "Solve my Problem" or custom subjects
  return {
    subject: rawSubject,
    primaryFamily: 'procedural_reasoning',
    secondaryFamilies: ['conceptual_causal'],
    allFamilies: ['procedural_reasoning', 'conceptual_causal'],
    dedicatedPack: 'general_family',
    isMultiFamily: true,
  };
}

export interface SubjectRuntimePack {
  id: DedicatedSubjectPackId;
  title: string;
  coreDirectives: string[];
  immediateInterventionTriggers: string[];
  delayInterventionConditions: string[];
  prohibitedBehaviors: string[];
  outputMetricKeys: string[];
}

export const SUBJECT_RUNTIME_PACKS: Record<DedicatedSubjectPackId, SubjectRuntimePack> = {
  mathematics: {
    id: 'mathematics',
    title: 'Mathematics Runtime Pack (Sec 19)',
    coreDirectives: [
      'Require visible step-by-step reasoning and validate intermediate transformations sequentially.',
      'Isolate the earliest breakdown point before addressing downstream steps.',
      'Explicitly distinguish minor arithmetic slips from underlying conceptual misconceptions.',
      'Use whiteboard/equation expressions to inspect student working without auto-completing unfinished steps.',
    ],
    immediateInterventionTriggers: [
      'Repeated incorrect algebraic/arithmetic transformation on the same rule',
      'Core conceptual breakdown (e.g., wrong operation inverse or angle boundary)',
    ],
    delayInterventionConditions: [
      'Student is actively working through a multi-step derivation with coherent direction',
    ],
    prohibitedBehaviors: [
      'Never solve multi-step problems consecutively without student participation.',
      'Never validate final numerical correctness without checking intermediate reasoning.',
    ],
    outputMetricKeys: [
      'procedural_accuracy',
      'conceptual_understanding',
      'step_visibility',
      'error_type_distinction',
      'recommended_runtime_action',
    ],
  },
  science: {
    id: 'science',
    title: 'Science Runtime Pack (Sec 20)',
    coreDirectives: [
      'Anchor explanations in observable, everyday real-world phenomena and causal mental models.',
      'Use prediction-based and cause-and-effect questioning ("What happens if heat increases?").',
      'Surface and diagnose flawed mental models before correcting them.',
    ],
    immediateInterventionTriggers: [
      'Inverted causal model (e.g., confusing evaporation with condensation)',
      'Memorized label repeated with incorrect underlying mechanism',
    ],
    delayInterventionConditions: [
      'Student is forming a testable prediction or connecting everyday observations',
    ],
    prohibitedBehaviors: [
      'Avoid terminology dumping or abstract jargon before conceptual grounding.',
      'Never accept memorization-only vocabulary recall as full conceptual mastery.',
    ],
    outputMetricKeys: [
      'mental_model_accuracy',
      'causal_reasoning',
      'prediction_reliability',
      'phenomenon_connection',
      'recommended_runtime_action',
    ],
  },
  language_arts: {
    id: 'language_arts',
    title: 'Language Arts Runtime Pack (Sec 21)',
    coreDirectives: [
      'Guide evidence-based textual interpretation and clear structural reasoning.',
      'Preserve student authorship at all times; coach revision through targeted questions.',
      'Accept multiple valid interpretations whenever grounded in textual evidence.',
      'Prioritize meaning and argument clarity over surface grammar during conceptual analysis.',
    ],
    immediateInterventionTriggers: [
      'Claim lacks any textual evidence',
      'Argument or paragraph structure collapses',
      'Interpretation directly contradicts the source passage',
    ],
    delayInterventionConditions: [
      'Student is exploring an original interpretation productively with partial evidence',
    ],
    prohibitedBehaviors: [
      'Never ghostwrite or rewrite complete paragraphs/essays on behalf of the student.',
      'Never over-correct minor grammar while the student is still shaping their core idea.',
    ],
    outputMetricKeys: [
      'interpretation_quality',
      'evidence_usage',
      'communication_clarity',
      'writing_dependency_risk',
      'recommended_runtime_action',
    ],
  },
  social_studies: {
    id: 'social_studies',
    title: 'Social Studies Runtime Pack (Sec 22)',
    coreDirectives: [
      'Build contextual understanding, chronological reasoning, cause-and-effect analysis, and comparative perspective.',
      'Encourage civic and historical nuance grounded in primary or secondary evidence.',
    ],
    immediateInterventionTriggers: [
      'Chronological sequence collapses (cause placed after effect)',
      'Cause-and-effect reasoning fails repeatedly',
      'Claim contradicts historical or documentary evidence',
    ],
    delayInterventionConditions: [
      'Student is exploring historical context or comparing perspectives productively',
    ],
    prohibitedBehaviors: [
      'Avoid trivia-style date/fact recitation detached from historical causality.',
      'Never flatten complex civic or historical events into one-word slogans.',
    ],
    outputMetricKeys: [
      'contextual_understanding',
      'chronological_reasoning',
      'comparative_analysis',
      'evidence_interpretation',
      'recommended_runtime_action',
    ],
  },
  general_family: {
    id: 'general_family',
    title: 'Adaptive Pedagogy Family Pack (Sec 22A)',
    coreDirectives: [
      'Follow the active primary and secondary pedagogy families seamlessly.',
      'Validate student reasoning, require evidence or traceable logic, and confirm transfer before advancing.',
    ],
    immediateInterventionTriggers: [
      'Core logic breaks down repeatedly or contradicts evidence',
    ],
    delayInterventionConditions: [
      'Student is productively exploring hypotheses or practicing skills',
    ],
    prohibitedBehaviors: [
      'Never dump complete answers or skip reasoning checks.',
    ],
    outputMetricKeys: [
      'conceptual_understanding',
      'reasoning_clarity',
      'transfer_performance',
      'recommended_runtime_action',
    ],
  },
};

export interface SessionTypePack {
  id: RuntimeSessionType;
  label: string;
  sectionRef: string;
  objective: string;
  directives: string[];
  escalationRule: string;
}

export const SESSION_TYPE_PACKS: Record<RuntimeSessionType, SessionTypePack> = {
  concept_mastery: {
    id: 'concept_mastery',
    label: 'Concept Mastery',
    sectionRef: 'Sec 16',
    objective: 'Build deep foundational understanding, verify reasoning, and confirm transfer across novel variations.',
    directives: [
      'Start by checking prior intuition before introducing formal rules.',
      'Build one core concept at a time with clear examples and immediate student check-ins.',
      'Require the student to explain reasoning in their own words and pass a transfer check before confirming mastery.',
    ],
    escalationRule: 'If confusion persists across 2 attempts, simplify representation and narrow to one atomic sub-concept.',
  },
  exam_preparation: {
    id: 'exam_preparation',
    label: 'Exam Preparation',
    sectionRef: 'Sec 17',
    objective: 'Strengthen independent recall, exam-safe methods, misconception inoculation, and timed problem transfer.',
    directives: [
      'Prioritize curriculum-aligned, exam-safe standard methods before mentioning shortcuts.',
      'Reduce scaffolding progressively so the student practices independent retrieval.',
      'Probe common exam traps and distractors; check both speed-readiness and reasoning stability.',
    ],
    escalationRule: 'If a timed/exam-style attempt breaks down, pause pacing pressure, diagnose the core gap calmly, and rebuild before retrying.',
  },
  homework_help: {
    id: 'homework_help',
    label: 'Homework Help',
    sectionRef: 'Sec 18',
    objective: 'Guide the student through their exact assignment step-by-step while preserving independent ownership and preventing answer dependency.',
    directives: [
      'Stay strictly anchored to the student’s specific homework question or uploaded problem.',
      'Break the problem into Given Information → Target → Next Step; never dump the complete finished solution.',
      'Follow Homework Escalation Rules: (1) simplify the current step, (2) demonstrate at most one partial worked example on a parallel step, (3) return control immediately to the student.',
    ],
    escalationRule: 'Simplify task → demonstrate one partial example → return control quickly; escalate to teacher only if assignment instructions are institution-specific or ambiguous after clarification.',
  },
};

export function mapHelpTypeToRuntimeSessionType(
  helpType: SessionHelpType,
  isProblemSolver = false
): RuntimeSessionType {
  if (isProblemSolver || helpType === 'Homework Help') return 'homework_help';
  if (helpType === 'Prepare for a Test') return 'exam_preparation';
  return 'concept_mastery';
}

export interface PromptQaCheckResult {
  passed: boolean;
  version: string;
  checks: Array<{
    name:
      | 'Curriculum Alignment'
      | 'Instructional Clarity'
      | 'Pacing Stability'
      | 'Hallucination Resistance'
      | 'Mastery Reliability'
      | 'Recovery Stability'
      | 'Conversational Naturalness';
    passed: boolean;
    detail: string;
  }>;
  missingLayers: string[];
  duplicateLayers: string[];
}

export const REQUIRED_PROMPT_LAYERS = [
  'LAYER 1: GLOBAL GOVERNANCE',
  'LAYER 2: INSTRUCTIONAL INTEGRITY',
  'LAYER 3: SESSION RUNTIME',
  'LAYER 4: SUBJECT RUNTIME',
  'LAYER 5: ADAPTIVE PEDAGOGY',
  'LAYER 6: ASSESSMENT & MASTERY',
  'LAYER 7: VOICE & WHITEBOARD',
  'LAYER 8: RECOVERY & ESCALATION',
  'LAYER 9: RUNTIME OUTPUT VALIDATION',
] as const;

/**
 * Section 47 & 52 QA Validation Protocol:
 * Verifies deterministic 9-layer ordering, zero duplication, and all 7 governance invariants.
 */
export function validateAssembledPrompt(assembledPrompt: string): PromptQaCheckResult {
  const missingLayers: string[] = [];
  const duplicateLayers: string[] = [];
  let lastIndex = -1;
  let inOrder = true;

  for (const header of REQUIRED_PROMPT_LAYERS) {
    const first = assembledPrompt.indexOf(header);
    if (first === -1) {
      missingLayers.push(header);
      inOrder = false;
    } else {
      if (first < lastIndex) {
        inOrder = false;
      }
      lastIndex = first;
      const second = assembledPrompt.indexOf(header, first + header.length);
      if (second !== -1) {
        duplicateLayers.push(header);
      }
    }
  }

  const checks: PromptQaCheckResult['checks'] = [
    {
      name: 'Curriculum Alignment',
      passed:
        assembledPrompt.includes('Curriculum Framework:') &&
        assembledPrompt.includes('Grade Level:'),
      detail: 'Verifies grade-level and curriculum boundaries are explicitly injected.',
    },
    {
      name: 'Instructional Clarity',
      passed:
        assembledPrompt.includes('Clarification-First') &&
        assembledPrompt.includes('Bounded Explanation'),
      detail: 'Verifies ambiguity resolution and bounded explanation rules are active.',
    },
    {
      name: 'Pacing Stability',
      passed:
        assembledPrompt.includes('Cognitive Load') &&
        assembledPrompt.includes('Productive Struggle'),
      detail: 'Verifies cognitive pacing and productive struggle rules are present.',
    },
    {
      name: 'Hallucination Resistance',
      passed:
        assembledPrompt.includes('Hallucination Prevention') &&
        assembledPrompt.includes('Safe Uncertainty'),
      detail: 'Verifies anti-hallucination and uncertainty guardrails.',
    },
    {
      name: 'Mastery Reliability',
      passed:
        assembledPrompt.includes('Mastery Band:') &&
        assembledPrompt.includes('False-Positive Suppression'),
      detail: 'Verifies multi-signal mastery and false-mastery suppression rules.',
    },
    {
      name: 'Recovery Stability',
      passed:
        assembledPrompt.includes('Runtime State:') &&
        assembledPrompt.includes('Escalation Sequence:'),
      detail: 'Verifies 6-state transition matrix and escalation sequence.',
    },
    {
      name: 'Conversational Naturalness',
      passed:
        inOrder &&
        duplicateLayers.length === 0 &&
        assembledPrompt.includes('Avoid Long Monologues'),
      detail: 'Verifies deterministic 1→9 layer order, zero duplicates, and natural tone guardrails.',
    },
  ];

  return {
    passed: missingLayers.length === 0 && duplicateLayers.length === 0 && checks.every((c) => c.passed),
    version: PROMPT_PACK_VERSION,
    checks,
    missingLayers,
    duplicateLayers,
  };
}
