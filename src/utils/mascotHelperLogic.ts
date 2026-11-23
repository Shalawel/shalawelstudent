export type MascotContextKind = 'session' | 'quiz' | 'solution';
export type MascotCharacterId = 'maya' | 'leo';
export type MascotTipTab = 'hint' | 'next' | 'help';

export interface MascotCharacter {
  id: MascotCharacterId;
  name: string;
  role: string;
  imageSrc: string;
  alt: string;
}

export const MASCOT_CHARACTERS: Record<MascotCharacterId, MascotCharacter> = {
  maya: {
    id: 'maya',
    name: 'Maya',
    role: 'AI Study Guide',
    imageSrc: '/assets/aistudio/Enthusiastic_Tutor_with_Idea_Rays_3462c79e.png',
    alt: 'Maya the enthusiastic tutor mascot with book and idea rays',
  },
  leo: {
    id: 'leo',
    name: 'Leo',
    role: 'Hint & Strategy Coach',
    imageSrc: '/assets/aistudio/Cartoon_Teacher_with_Book_and_Idea_Gesture_c36e5a65.png',
    alt: 'Leo the friendly tutor mascot with open blue book and idea gesture',
  },
};

export function getDefaultMascotForContext(context: MascotContextKind): MascotCharacterId {
  return context === 'quiz' ? 'leo' : 'maya';
}

export function getAlternateMascot(current: MascotCharacterId): MascotCharacterId {
  return current === 'maya' ? 'leo' : 'maya';
}

export interface MascotActionSuggestion {
  id: string;
  label: string;
  prompt?: string;
  actionKind: 'ask_tutor' | 'speak_hint' | 'next_step' | 'review_answers' | 'prev_step';
}

export interface MascotTipBundle {
  headline: string;
  hintText: string;
  nextStepText: string;
  helpIntro: string;
  actions: MascotActionSuggestion[];
}

export interface MascotContextInput {
  context: MascotContextKind;
  subject?: string;
  topic?: string;
  // Session-specific context
  isWaterCycle?: boolean;
  waterCycleChapterTitle?: string;
  isAngles?: boolean;
  anglesStageTitle?: string;
  // Quiz-specific context
  quizQuestionIndex?: number;
  quizTotalQuestions?: number;
  quizPrompt?: string;
  quizExplanation?: string;
  quizCorrectOption?: string;
  quizCompleted?: boolean;
  quizScorePercent?: number;
  // Solution-session context
  problemText?: string;
  problemFileName?: string;
}

/**
 * Turns a quiz explanation into a supportive non-spoiler clue by focusing on
 * the underlying reasoning rather than giving away the exact answer option.
 */
export function buildNonSpoilerQuizHint(
  explanation?: string,
  subject?: string,
  topic?: string,
  correctOption?: string
): string {
  const cleaned = (explanation ?? '').trim();
  if (cleaned.length > 0) {
    let clue = cleaned.split(/(?<=[.!?])\s+/)[0] ?? cleaned;
    const answerToken = (correctOption ?? '').trim();
    if (answerToken.length >= 2) {
      const escaped = answerToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      clue = clue.replace(new RegExp(escaped, 'gi'), '___');
    }
    const trimmed = clue.length > 155 ? `${clue.slice(0, 152).trimEnd()}…` : clue;
    return `Clue: ${trimmed}`;
  }
  const focus = topic ? `${topic}` : subject ? `${subject}` : 'this question';
  return `Read the key words in ${focus} carefully and eliminate any choice that contradicts the main rule first.`;
}

export function buildMascotTips(input: MascotContextInput): MascotTipBundle {
  if (input.context === 'quiz') {
    const qNum = (input.quizQuestionIndex ?? 0) + 1;
    const total = input.quizTotalQuestions ?? 6;
    const topicLabel = input.topic || input.subject || 'this quiz';

    if (input.quizCompleted) {
      const score = input.quizScorePercent ?? 0;
      return {
        headline: score >= 80 ? 'Awesome quiz finish!' : 'Great effort — want to level up?',
        hintText:
          score >= 80
            ? `You scored ${score}% on ${topicLabel}! Glance through the explanations once to lock the concepts into long-term memory.`
            : `You scored ${score}% on ${topicLabel}. Reviewing the missed cards right away helps boost recall by over 50%.`,
        nextStepText:
          'Tap "Review Answers" to check each explanation, or hit "Retake" to aim for a 100% streak score!',
        helpIntro: 'Not sure what to do after finishing? Pick a quick next move below:',
        actions: [
          {
            id: 'quiz-review',
            label: 'Open Answer Review',
            actionKind: 'review_answers',
          },
          {
            id: 'quiz-prev',
            label: 'Go Back to Last Card',
            actionKind: 'prev_step',
          },
        ],
      };
    }

    return {
      headline: `Stuck on Question ${String(qNum).padStart(2, '0')}?`,
      hintText: buildNonSpoilerQuizHint(
        input.quizExplanation,
        input.subject,
        input.topic,
        input.quizCorrectOption
      ),
      nextStepText:
        qNum < total
          ? `Pick one option to auto-advance, swipe left to skip ahead to Q${String(qNum + 1).padStart(2, '0')}, or tap Back anytime to revise.`
          : 'This is the final card! Choose your best answer or tap Finish to see your score and full answer review.',
      helpIntro: `Need a boost on ${topicLabel}? Here are quick ways to tackle this card:`,
      actions: [
        {
          id: 'quiz-next',
          label: qNum < total ? 'Skip to Next Card' : 'Finish & View Score',
          actionKind: 'next_step',
        },
        ...(qNum > 1
          ? [
              {
                id: 'quiz-prev-card',
                label: 'Revisit Previous Card',
                actionKind: 'prev_step' as const,
              },
            ]
          : []),
      ],
    };
  }

  if (input.context === 'solution') {
    const preview = input.problemText?.trim()
      ? input.problemText.trim().slice(0, 80) + (input.problemText.trim().length > 80 ? '…' : '')
      : input.problemFileName
      ? `your uploaded file (${input.problemFileName})`
      : 'your submitted problem';

    return {
      headline: 'Want a step-by-step clue?',
      hintText: `Start by listing what is given and what you need to find in ${preview}. Breaking it into Step 1 makes the rest click!`,
      nextStepText:
        'Try asking Maya for a Step 1 hint first instead of the full answer — or switch to Voice Mode to talk your reasoning out loud.',
      helpIntro: 'I stay 100% focused on your exact problem. Tap any helper action below:',
      actions: [
        {
          id: 'sol-step1',
          label: 'Give me a Step 1 hint',
          prompt: 'Give me just a small hint for Step 1 of my submitted problem without revealing the final answer yet.',
          actionKind: 'ask_tutor',
        },
        {
          id: 'sol-concept',
          label: 'Identify the rule or formula',
          prompt: 'Which key concept, rule, or formula applies to my submitted problem, and why?',
          actionKind: 'ask_tutor',
        },
        {
          id: 'sol-check',
          label: 'Explain step-by-step',
          prompt: 'Walk me step-by-step through solving my submitted problem and check if I follow each step.',
          actionKind: 'ask_tutor',
        },
      ],
    };
  }

  // Default: Interactive Learning Session
  if (input.isWaterCycle) {
    const chTitle = input.waterCycleChapterTitle || 'Water Cycle & Weather';
    return {
      headline: 'Need a science clue?',
      hintText: `In "${chTitle}", watch how heat from the Sun and cool air high in the sky drive water from liquid → vapour → clouds → rain.`,
      nextStepText:
        'Explore the interactive animation buttons above, try the hands-on activity card, or tap a chapter tab to move forward.',
      helpIntro: 'Ask Maya anything about the water cycle or hear a quick audio recap:',
      actions: [
        {
          id: 'wc-hint',
          label: 'Give me a simple hint',
          prompt: `Give me a quick, kid-friendly Class 6 hint for "${chTitle}" using an everyday example.`,
          actionKind: 'ask_tutor',
        },
        {
          id: 'wc-quiz-me',
          label: 'Ask me a quick question',
          prompt: `Ask me one fun check-in question about "${chTitle}" so I can test what I learned!`,
          actionKind: 'ask_tutor',
        },
        {
          id: 'wc-voice',
          label: 'Hear this hint aloud',
          actionKind: 'speak_hint',
        },
      ],
    };
  }

  if (input.isAngles) {
    const stageTitle = input.anglesStageTitle || 'Class 5 Angles';
    return {
      headline: 'Need an angle tip?',
      hintText: `For "${stageTitle}", remember the benchmark: 90° is a square corner (Right), smaller is Acute (< 90°), wider is Obtuse (90°–180°), and a flat line is 180°.`,
      nextStepText:
        'Drag the ray on the interactive protractor to match the target, then press Check Angle — or ask Maya aloud in Voice Mode!',
      helpIntro: 'Pick a quick shortcut to get unstuck on angles right away:',
      actions: [
        {
          id: 'ang-hint',
          label: 'Hint for this angle task',
          prompt: `Give me a simple visual hint for "${stageTitle}" without giving away the exact number right away.`,
          actionKind: 'ask_tutor',
        },
        {
          id: 'ang-example',
          label: 'Show a real-life example',
          prompt: `Give me a fun real-life example for "${stageTitle}" like a clock hand, pizza slice, or open door.`,
          actionKind: 'ask_tutor',
        },
        {
          id: 'ang-voice',
          label: 'Hear tip aloud',
          actionKind: 'speak_hint',
        },
      ],
    };
  }

  const subjectLabel = input.subject || 'this subject';
  const topicLabel = input.topic || 'today’s lesson';
  return {
    headline: 'Need help or a quick hint?',
    hintText: `Focus on one small idea in ${topicLabel} at a time. Start with the Quick Warm-Up box to see what you already know!`,
    nextStepText:
      'Reply to Maya in the right-side chat drawer, open the Lesson Content panel at top-right, or try Voice mode to talk naturally.',
    helpIntro: `I’m right here if ${subjectLabel} feels tricky. Tap a quick suggestion:`,
    actions: [
      {
        id: 'sess-hint',
        label: 'Give me a hint on the warm-up',
        prompt: `Can you give me a gentle hint for the warm-up question on ${topicLabel}?`,
        actionKind: 'ask_tutor',
      },
      {
        id: 'sess-example',
        label: 'Show a worked example',
        prompt: `Walk me through one easy worked example of ${topicLabel} step by step.`,
        actionKind: 'ask_tutor',
      },
      {
        id: 'sess-next',
        label: 'What should I try next?',
        prompt: `What is the best next exercise for me to practice in ${topicLabel}?`,
        actionKind: 'ask_tutor',
      },
    ],
  };
}
