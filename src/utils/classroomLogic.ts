import type { StartSessionInput } from '../types/dashboard';
import { isWaterCycleSession } from './waterCycleLogic';
import { classifySubjectPedagogy } from './tutorPedagogyEngine';

export interface PlottedExpression {
  id: string;
  formula: string;
  color: string;
  visible: boolean;
}

export interface ClassroomWelcomeData {
  heading: string;
  intro: string;
  goals: { bold: string; rest: string }[];
  warmupSequence: string;
  warmupQuestion: string;
  lessonTitle: string;
  objectives: string[];
  relevance: string;
  structuredSteps: string[];
  stepsToFollow: string[];
}

export function formatTimerClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Safe recursive-descent math expression evaluator (no eval/Function).
 * Supports +, -, *, /, ^, unary -, parentheses, x, pi, e, sin, cos, tan, sqrt, abs.
 * Also supports implicit multiplication like 2x, 2x^2, 3sin(x), (x+1)(x-1).
 */
export function evaluateMathExpression(rawFormula: string, xValue: number): number | null {
  const cleaned = rawFormula
    .replace(/^y\s*=\s*/i, '')
    .replace(/^f\s*\(\s*x\s*\)\s*=\s*/i, '')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/\s+/g, '')
    .toLowerCase();

  if (!cleaned) return null;

  type Token =
    | { type: 'num'; value: number }
    | { type: 'ident'; value: string }
    | { type: 'op'; value: string }
    | { type: 'lparen' }
    | { type: 'rparen' };

  const rawTokens: Token[] = [];
  let i = 0;
  while (i < cleaned.length) {
    const ch = cleaned[i];
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      while (i < cleaned.length && /[0-9.]/.test(cleaned[i])) {
        numStr += cleaned[i++];
      }
      const parsed = Number(numStr);
      if (Number.isNaN(parsed)) return null;
      rawTokens.push({ type: 'num', value: parsed });
    } else if (/[a-z]/.test(ch)) {
      let ident = '';
      while (i < cleaned.length && /[a-z]/.test(cleaned[i])) {
        ident += cleaned[i++];
      }
      rawTokens.push({ type: 'ident', value: ident });
    } else if ('+-*/^'.includes(ch)) {
      rawTokens.push({ type: 'op', value: ch });
      i++;
    } else if (ch === '(') {
      rawTokens.push({ type: 'lparen' });
      i++;
    } else if (ch === ')') {
      rawTokens.push({ type: 'rparen' });
      i++;
    } else {
      return null;
    }
  }

  // Insert implicit multiplication tokens where appropriate (e.g. 2x -> 2*x, 2(x) -> 2*(x))
  const tokens: Token[] = [];
  const isValueEnd = (t: Token) =>
    t.type === 'num' ||
    t.type === 'rparen' ||
    (t.type === 'ident' && (t.value === 'x' || t.value === 'pi' || t.value === 'e'));
  const isValueStart = (t: Token) =>
    t.type === 'num' || t.type === 'lparen' || t.type === 'ident';

  for (let idx = 0; idx < rawTokens.length; idx++) {
    const curr = rawTokens[idx];
    if (idx > 0 && isValueEnd(rawTokens[idx - 1]) && isValueStart(curr)) {
      tokens.push({ type: 'op', value: '*' });
    }
    tokens.push(curr);
  }

  let pos = 0;

  const parseExpr = (): number => {
    let left = parseTerm();
    while (pos < tokens.length) {
      const tok = tokens[pos];
      if (tok.type === 'op' && (tok.value === '+' || tok.value === '-')) {
        pos++;
        const right = parseTerm();
        left = tok.value === '+' ? left + right : left - right;
      } else {
        break;
      }
    }
    return left;
  };

  const parseTerm = (): number => {
    let left = parsePower();
    while (pos < tokens.length) {
      const tok = tokens[pos];
      if (tok.type === 'op' && (tok.value === '*' || tok.value === '/')) {
        pos++;
        const right = parsePower();
        left = tok.value === '*' ? left * right : left / right;
      } else {
        break;
      }
    }
    return left;
  };

  const parsePower = (): number => {
    const base = parseUnary();
    if (pos < tokens.length) {
      const tok = tokens[pos];
      if (tok.type === 'op' && tok.value === '^') {
        pos++;
        const exp = parsePower();
        return Math.pow(base, exp);
      }
    }
    return base;
  };

  const parseUnary = (): number => {
    const tok = tokens[pos];
    if (tok && tok.type === 'op' && (tok.value === '+' || tok.value === '-')) {
      pos++;
      const val = parseUnary();
      return tok.value === '-' ? -val : val;
    }
    return parsePrimary();
  };

  const parsePrimary = (): number => {
    const tok = tokens[pos];
    if (!tok) return Number.NaN;

    if (tok.type === 'num') {
      pos++;
      return tok.value;
    }

    if (tok.type === 'ident') {
      pos++;
      if (tok.value === 'x') return xValue;
      if (tok.value === 'pi') return Math.PI;
      if (tok.value === 'e') return Math.E;

      // Function call: sin(...), cos(...), tan(...), sqrt(...), abs(...)
      const arg = parseUnary();
      if (tok.value === 'sin') return Math.sin(arg);
      if (tok.value === 'cos') return Math.cos(arg);
      if (tok.value === 'tan') return Math.tan(arg);
      if (tok.value === 'sqrt') return Math.sqrt(arg);
      if (tok.value === 'abs') return Math.abs(arg);
      return Number.NaN;
    }

    if (tok.type === 'lparen') {
      pos++;
      const val = parseExpr();
      if (tokens[pos]?.type === 'rparen') pos++;
      return val;
    }

    return Number.NaN;
  };

  const result = parseExpr();
  if (pos !== tokens.length || !Number.isFinite(result)) {
    return null;
  }
  return result;
}

export function isAnglesSession(session: StartSessionInput): boolean {
  if (session.problemSolver || isWaterCycleSession(session)) return false;
  const topic = session.topic.toLowerCase();
  const subject = session.subject.toLowerCase();
  return topic.includes('angle') || (subject.includes('math') && session.gradeLevel === '5');
}

export function buildClassroomWelcome(
  session: StartSessionInput,
  grade: string
): ClassroomWelcomeData {
  const resolvedGrade = session.gradeLevel || grade;
  if (session.problemSolver) {
    const ps = session.problemSolver;
    const displayProblem =
      ps.problemText.trim() ||
      (ps.attachment ? `Uploaded question file: ${ps.attachment.fileName}` : session.topic);
    return {
      heading: "Hi! I'm Maya — Problem Solver Mode",
      intro: `This classroom is dedicated strictly to your submitted problem: "${displayProblem}".`,
      goals: [
        { bold: 'Break Down Given Info', rest: 'identify every key number, clue, and question asked in your problem' },
        { bold: 'Solve Step-by-Step', rest: 'walk through each step together without jumping ahead' },
        { bold: 'Verify Your Solution', rest: 'double-check the final answer directly against your problem' },
      ],
      warmupSequence: ps.attachment ? `Attached: ${ps.attachment.fileName}` : 'Submitted Problem',
      warmupQuestion: displayProblem,
      lessonTitle: session.topic,
      objectives: [
        'Understand what your exact problem is asking',
        'Work through the solution step-by-step with Maya',
        'Verify the final answer and catch any slip-ups',
      ],
      relevance:
        'Focused problem-solving sessions keep 100% of the conversation centered on your uploaded or written question until you feel confident.',
      structuredSteps: [
        '1. Read the submitted problem and list what is known vs. what we need to find.',
        '2. Apply the matching formula, rule, or reasoning one step at a time.',
        '3. Plug the result back into the original problem to confirm it works.',
      ],
      stepsToFollow: [
        'Review your submitted problem card on the left.',
        'Follow Maya’s step-by-step guidance in the chat or switch to Voice mode to talk it through.',
        'Ask Maya to check your work or explain any step in simpler words.',
      ],
    };
  }

  if (isWaterCycleSession(session)) {
    return {
      heading: "Hi! I'm Maya — Your Class 6 Science Tutor",
      intro: `Welcome to Class ${resolvedGrade} Science: Water Cycle and Weather! Have you ever wondered where rain comes from and where all the rainwater goes?`,
      goals: [
        { bold: 'Trace the Water Cycle', rest: 'follow Evaporation, Condensation, Precipitation, and Collection' },
        { bold: 'Explore Weather Elements', rest: 'connect Temperature, Humidity, Wind, Precipitation, and Cloud Cover' },
        { bold: 'Simulate & Apply', rest: 'test how Sun heat and wind shape everyday weather conditions' },
      ],
      warmupSequence: 'Evaporation → Condensation → Precipitation → Collection',
      warmupQuestion: session.specificQuestion
        ? `Let's start with your question: "${session.specificQuestion}" — and watch how the Sun starts the water cycle!`
        : 'Have you ever wondered where rain comes from and where all the rainwater goes?',
      lessonTitle: `Class ${resolvedGrade} Science: Water Cycle & Weather`,
      objectives: [
        'Explain what the water cycle is and why it is important',
        'Understand evaporation, condensation, precipitation, and collection',
        'Describe how the Sun drives the water cycle',
        'Explain how clouds form and why rain occurs',
        'Understand the relationship between the water cycle and weather conditions',
        'Identify how temperature, humidity, wind, and rainfall influence weather',
      ],
      relevance:
        'Understanding the water cycle and weather helps Class 6 students explain everyday phenomena — from disappearing puddles and droplets on cold glasses to clouds, wind, and rainstorms.',
      structuredSteps: [
        '1. Evaporation: Sunlight heats ocean, river, and lake water into rising water vapour.',
        '2. Condensation: Rising vapour cools in the upper sky to form tiny cloud droplets.',
        '3. Precipitation: Heavy droplets fall back to Earth as rain, snow, or hail.',
        '4. Collection: Water gathers in rivers, lakes, oceans, and underground — connecting directly to local weather!',
      ],
      stepsToFollow: [
        'Explore the animated valley in Chapter 1 and click each numbered observation spot.',
        'Watch all four stages with Microscopic Zoom-In in Chapter 2, then complete Activities 1 & 4.',
        'Investigate Weather Detective (Ch 3), test the Sun & Wind simulator (Ch 4), identify real-world scenes (Ch 5), and finish the 5-question Knowledge Check (Ch 6).',
      ],
    };
  }

  if (isAnglesSession(session)) {
    return {
      heading: "Hi! I'm Maya — Your Class 5 Math Voice Tutor",
      intro: `Welcome to Class ${resolvedGrade} ${session.subject}: ${session.topic}. Let's draw angles, test our eyes on real diagrams, and talk through every step together!`,
      goals: [
        { bold: 'Draw & Measure', rest: 'acute, right, obtuse, and straight angles using the live protractor' },
        { bold: 'Identify Inside Diagrams', rest: 'spot 90° square corners, 180° straight lines, and clock angles' },
        { bold: 'Learn from Mistakes', rest: 'compare wrong vs. correct angle diagrams with complete examples' },
      ],
      warmupSequence: 'Acute (< 90°) · Right (90°) · Obtuse (91°–179°) · Straight (180°)',
      warmupQuestion: session.specificQuestion
        ? `Let's start with your question: "${session.specificQuestion}" — and try drawing a 45° acute angle on the protractor!`
        : 'Can you drag the orange ray on the protractor to draw an Acute Angle around 45°?',
      lessonTitle: `Class ${resolvedGrade} Mathematics: Mastering Angles`,
      objectives: [
        'Classify Acute (< 90°), Right (90°), Obtuse (91°–179°), and Straight (180°) angles',
        'Construct accurate angles on a 0°–180° protractor by dragging rays',
        'Calculate missing angles on a 180° straight line and analog clocks',
        'Understand common angle mistakes using side-by-side comparison diagrams',
      ],
      relevance: `Angles are everywhere in Class ${resolvedGrade} geometry and daily life — from pizza slices and open laptops to building corners and reading time on a clock.`,
      structuredSteps: [
        '1. Find the Vertex (the corner point where two rays meet).',
        '2. Line up the baseline ray along 0° on the protractor.',
        '3. Compare the opening to a 90° L-corner: narrower is Acute, exact is Right, wider is Obtuse, flat is Straight (180°).',
      ],
      stepsToFollow: [
        'Draw a 45° acute angle on Activity 1 and click Check My Angle.',
        'Click the correct answer inside the angle diagrams on Activities 2, 4, and 5.',
        'Tap Speak to Maya anytime to ask a question or hear a step-by-step voice explanation.',
      ],
    };
  }

  const isMath =
    session.subject.toLowerCase().includes('math') ||
    session.topic.toLowerCase().includes('integer') ||
    session.topic.toLowerCase().includes('equation') ||
    session.topic.toLowerCase().includes('algebra');

  if (isMath) {
    return {
      heading: "Hi! I'm Maya 😊",
      intro: `Today we're working on ${session.topic} (Grade ${resolvedGrade} — ${session.subject}).`,
      goals: [
        { bold: 'Represent', rest: 'values and expressions clearly on a number line or coordinate plane' },
        { bold: 'Compare', rest: 'terms, slopes, and inequalities using <, >, =' },
        { bold: 'Solve & Verify', rest: 'step-by-step problems and order solutions accurately' },
      ],
      warmupSequence: '-3, -2, -1, 0, 1, 2, 3',
      warmupQuestion: session.specificQuestion
        ? `Quick Warm-Up for your question: "${session.specificQuestion}" — First, which is greater: -1 or 2?`
        : 'Which is greater: -1 or 2?',
      lessonTitle: session.topic,
      objectives: [
        `Understand the core rules behind ${session.topic}`,
        'Visualize equations and values on an interactive coordinate graph',
        'Spot common sign and simplification mistakes early',
        'Apply step-by-step reasoning to timed practice problems',
      ],
      relevance: `This module helps Grade ${resolvedGrade} students build fluency in ${session.topic} by connecting algebraic rules to visual graphing models and real-world problem solving.`,
      structuredSteps: [
        '1. Identify known values, variables, and target quantities from the prompt.',
        '2. Plot or rewrite the relationship in standard form (e.g. y = mx + b).',
        '3. Check edge cases (negative signs, zero intercepts, and boundary values).',
      ],
      stepsToFollow: [
        'Answer Maya’s Quick Warm-Up in the chat below.',
        'Open the Whiteboard or Graphing Keypad to test an equation visually.',
        'Complete the Interactive Q&A check before ending the session.',
      ],
    };
  }

  const classification = classifySubjectPedagogy(session.subject, session.topic);
  const topicLabel = session.topic || session.subject;

  if (classification.primaryFamily === 'systems_logic') {
    return {
      heading: "Hi! I'm Maya 😊",
      intro: `Today we're working on ${topicLabel} (Grade ${resolvedGrade} — ${session.subject}).`,
      goals: [
        { bold: 'Map System Variables', rest: `trace how interacting inputs, constraints, and feedback loops drive ${topicLabel}` },
        { bold: 'Predict Trade-Offs', rest: 'analyze what shifts first when a bottleneck, incentive, or rule changes' },
        { bold: 'Verify Transfer', rest: 'test the same system logic on an unfamiliar scenario with clear cause-and-effect reasoning' },
      ],
      warmupSequence: 'Inputs & Constraints → Feedback Loop → Equilibrium / Trade-Off → System Outcome',
      warmupQuestion: session.specificQuestion
        ? `Let's start with your question: "${session.specificQuestion}" — Which variable or constraint shifts first?`
        : `In ${topicLabel}, if one key input suddenly drops while demand or load stays constant, what shifts first — and why?`,
      lessonTitle: topicLabel,
      objectives: [
        `Identify the core interacting variables and constraints inside ${topicLabel}`,
        'Trace cause-and-effect feedback loops rather than memorizing isolated outcomes',
        'Explain trade-offs when an external shock or rule change occurs',
        'Apply the same systems model accurately to a novel real-world scenario',
      ],
      relevance: `This module helps Grade ${resolvedGrade} students master ${topicLabel} by reasoning through interconnected variables, incentives, and feedback loops instead of isolated facts.`,
      structuredSteps: [
        '1. List the core variables, constraints, and actors operating in the system.',
        '2. Trace what happens one step at a time when a single variable shifts.',
        '3. Check for second-order effects, trade-offs, and a new equilibrium.',
      ],
      stepsToFollow: [
        'Answer Maya’s Quick Warm-Up in the chat with a brief "because..." explanation.',
        'Open the Whiteboard to sketch the interacting forces or system diagram.',
        'Complete Step 1 (Concept + Reasoning) and Step 2 (Transfer Validation) in Interactive Q&A.',
      ],
    };
  }

  if (classification.primaryFamily === 'conceptual_causal') {
    return {
      heading: "Hi! I'm Maya 😊",
      intro: `Today we're investigating ${topicLabel} (Grade ${resolvedGrade} — ${session.subject}).`,
      goals: [
        { bold: 'Explain the Mechanism', rest: `connect observable evidence to the underlying physical or biological cause in ${topicLabel}` },
        { bold: 'Control Variables', rest: 'distinguish independent, dependent, and controlled factors in an experiment' },
        { bold: 'Predict & Test', rest: 'forecast what happens when a key condition changes and justify with evidence' },
      ],
      warmupSequence: 'Observation → Hypothesis → Mechanism & Variables → Evidence-Based Conclusion',
      warmupQuestion: session.specificQuestion
        ? `Let's start with your question: "${session.specificQuestion}" — What observable evidence or variable should we inspect first?`
        : `In ${topicLabel}, what observable clue tells you the underlying process is actually happening?`,
      lessonTitle: topicLabel,
      objectives: [
        `Explain the cause-and-effect mechanism driving ${topicLabel}`,
        'Connect lab or real-world observations directly to scientific principles',
        'Identify which variables must stay constant for a fair comparison',
        'Predict outcomes accurately when environmental or physical conditions change',
      ],
      relevance: `This module builds Grade ${resolvedGrade} scientific reasoning in ${topicLabel} by linking observations, controlled variables, and underlying mechanisms.`,
      structuredSteps: [
        '1. Identify the phenomenon and the observable evidence you can measure.',
        '2. Trace the mechanism step-by-step (energy, matter, or force transfer).',
        '3. Test your prediction against a changed condition to confirm true understanding.',
      ],
      stepsToFollow: [
        'Respond to Maya’s Quick Warm-Up by naming the cause and effect.',
        'Sketch the process or variables on the Whiteboard and click Share Step with Maya.',
        'Complete the Interactive Q&A Concept Check and Transfer Validation.',
      ],
    };
  }

  if (classification.primaryFamily === 'contextual_analytical') {
    return {
      heading: "Hi! I'm Maya 😊",
      intro: `Today we're analyzing ${topicLabel} (Grade ${resolvedGrade} — ${session.subject}).`,
      goals: [
        { bold: 'Weigh Multiple Causes', rest: `examine the historical, social, or geographic forces shaping ${topicLabel}` },
        { bold: 'Evaluate Perspectives', rest: 'compare primary evidence, stakeholder viewpoints, and context' },
        { bold: 'Build a Supported Claim', rest: 'justify your interpretation with specific evidence rather than generalizations' },
      ],
      warmupSequence: 'Context → Multiple Causes → Source Evidence → Balanced Interpretation',
      warmupQuestion: session.specificQuestion
        ? `Let's start with your question: "${session.specificQuestion}" — What context or stakeholder perspective matters most here?`
        : `When studying ${topicLabel}, why is it risky to rely on only a single cause or a single viewpoint?`,
      lessonTitle: topicLabel,
      objectives: [
        `Place ${topicLabel} accurately within its broader historical or civic context`,
        'Evaluate primary and secondary evidence for reliability and perspective',
        'Connect short-term triggers with deeper long-term causes',
        'Construct a balanced, evidence-backed argument',
      ],
      relevance: `This module helps Grade ${resolvedGrade} students analyze ${topicLabel} critically by weighing evidence, context, and multiple perspectives.`,
      structuredSteps: [
        '1. Establish the setting, key stakeholders, and background context.',
        '2. Separate immediate triggers from deeper structural causes.',
        '3. Support your claim with concrete evidence and acknowledge counter-perspectives.',
      ],
      stepsToFollow: [
        'Share your initial perspective on Maya’s Quick Warm-Up in the chat.',
        'Pin key evidence and causal links to your Pinned Messages board.',
        'Complete the Interactive Q&A Concept Check and Transfer Validation.',
      ],
    };
  }

  if (
    classification.primaryFamily === 'skill_practice' ||
    classification.primaryFamily === 'procedural_reasoning'
  ) {
    return {
      heading: "Hi! I'm Maya 😊",
      intro: `Today we're building practical fluency in ${topicLabel} (Grade ${resolvedGrade} — ${session.subject}).`,
      goals: [
        { bold: 'Break Into Steps', rest: `decompose ${topicLabel} into clean, testable procedures and edge cases` },
        { bold: 'Trace & Debug', rest: 'walk through execution step-by-step to spot where assumptions break' },
        { bold: 'Apply Independently', rest: 'adapt the same method cleanly to a new constraint or problem' },
      ],
      warmupSequence: 'Specification → Step-by-Step Procedure → Trace & Test Edge Cases → Verify Output',
      warmupQuestion: session.specificQuestion
        ? `Let's start with your question: "${session.specificQuestion}" — What input and expected output are we working with first?`
        : `For ${topicLabel}, what is the very first input, state, or edge case you should check before running the procedure?`,
      lessonTitle: topicLabel,
      objectives: [
        `Decompose ${topicLabel} into clear, ordered operational steps`,
        'Trace intermediate states and catch common logic or workflow errors early',
        'Verify outputs against edge cases rather than only happy-path examples',
        'Adapt the workflow independently to a new requirement',
      ],
      relevance: `This module builds hands-on Grade ${resolvedGrade} skill in ${topicLabel} through structured tracing, debugging, and independent application.`,
      structuredSteps: [
        '1. Clarify the exact goal, inputs, and constraints before starting.',
        '2. Execute or trace one step at a time and verify intermediate state.',
        '3. Test edge cases and confirm the final result meets every requirement.',
      ],
      stepsToFollow: [
        'Reply to Maya’s Quick Warm-Up with your starting step.',
        'Use the Whiteboard to sketch your step-by-step trace or logic flow.',
        'Complete the Interactive Q&A Concept Check and Transfer Validation.',
      ],
    };
  }

  if (classification.primaryFamily === 'discussion_perspective') {
    return {
      heading: "Hi! I'm Maya 😊",
      intro: `Today we're examining ${topicLabel} (Grade ${resolvedGrade} — ${session.subject}).`,
      goals: [
        { bold: 'Unpack Premises', rest: `identify hidden assumptions and core claims inside ${topicLabel}` },
        { bold: 'Test Counterarguments', rest: 'stress-test each position fairly against objections and logic' },
        { bold: 'Refine Your Thesis', rest: 'defend a clear, logically consistent conclusion' },
      ],
      warmupSequence: 'Claim → Underlying Premises → Counterargument Test → Refined Conclusion',
      warmupQuestion: session.specificQuestion
        ? `Let's start with your question: "${session.specificQuestion}" — What assumption is that claim resting on?`
        : `In ${topicLabel}, what is one hidden assumption people often make without noticing, and how could someone challenge it?`,
      lessonTitle: topicLabel,
      objectives: [
        `Distinguish core claims, supporting premises, and unstated assumptions in ${topicLabel}`,
        'Identify common reasoning gaps or logical fallacies respectfully',
        'Engage the strongest counterargument before finalizing a position',
        'Articulate a coherent, well-supported conclusion',
      ],
      relevance: `This module sharpens Grade ${resolvedGrade} critical thinking in ${topicLabel} by testing premises, evaluating objections, and strengthening logical clarity.`,
      structuredSteps: [
        '1. State the main claim and list the premises meant to support it.',
        '2. Surface any unstated assumption or competing value.',
        '3. Test how the argument holds up against the strongest fair objection.',
      ],
      stepsToFollow: [
        'Answer Maya’s Quick Warm-Up with your claim and a brief reason.',
        'Pin key definitions or counterarguments to your Pinned Messages board.',
        'Complete the Interactive Q&A Concept Check and Transfer Validation.',
      ],
    };
  }

  return {
    heading: "Hi! I'm Maya 😊",
    intro: `Today we're working on ${topicLabel} (Grade ${resolvedGrade} — ${session.subject}).`,
    goals: [
      { bold: 'Identify', rest: 'the central theme or claim supported by key textual details' },
      { bold: 'Compare', rest: 'surface plot events vs. deeper author intent' },
      { bold: 'Summarize', rest: 'concisely using direct evidence from the passage' },
    ],
    warmupSequence: 'Claim → Evidence → Analysis → Conclusion',
    warmupQuestion: session.specificQuestion
      ? `Let's start with your question: "${session.specificQuestion}" — What key detail stands out to you first?`
      : 'What is the main difference between a story’s plot and its central theme?',
    lessonTitle: session.topic || 'Identify Theme and Summarize a Story (Fiction)',
    objectives: [
      'Identify the central theme or main message of a fiction story',
      "Tell the difference between 'plot' and 'theme'",
      'Summarize a story using key details',
      'Use evidence from the text to support your ideas',
    ],
    relevance: `This module helps Grade ${resolvedGrade} students develop critical reading comprehension skills by learning to identify the central theme of fiction stories and summarise them using key details from the text.`,
    structuredSteps: [
      '1. Read for turning points where the protagonist makes a difficult choice.',
      '2. Ask what lesson or universal truth the character discovers by the ending.',
      '3. Draft a 1-sentence theme statement without naming specific plot events.',
    ],
    stepsToFollow: [
      'Respond to Maya’s Quick Warm-Up prompt in the chat.',
      'Highlight and pin key explanations to your Pinned Messages board.',
      'Complete the Interactive Q&A Multiple Choice and Ordering checks.',
    ],
  };
}

export function checkOrderingAnswer(
  currentOrderIds: string[],
  expectedOrderIds: string[]
): boolean {
  if (currentOrderIds.length !== expectedOrderIds.length) return false;
  return currentOrderIds.every((id, idx) => id === expectedOrderIds[idx]);
}

export type ClassroomInteractionMode = 'text' | 'voice';

export interface ClassroomModeLayout {
  chatDrawerOpen: boolean;
  showVoiceDock: boolean;
}

/**
 * In Voice mode, the text chat section minimizes away and user + AI Tutor
 * interact through the live voice communication dock. In Text mode, the chat
 * session opens on the right side as a drawer.
 */
export function resolveInteractionModeLayout(
  mode: ClassroomInteractionMode
): ClassroomModeLayout {
  if (mode === 'voice') {
    return {
      chatDrawerOpen: false,
      showVoiceDock: true,
    };
  }
  return {
    chatDrawerOpen: true,
    showVoiceDock: false,
  };
}

