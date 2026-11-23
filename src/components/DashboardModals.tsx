import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Play,
  Rocket,
  Send,
  Sparkles,
  Target,
  User,
  X,
} from 'lucide-react';
import type {
  AiLesson,
  CalendarDay,
  CalendarSession,
  ChatTurn,
  LearningAction,
  LearningGoal,
  QuizQuestion,
  SessionColumnStatus,
  StudentProfile,
} from '../types/dashboard';
import {
  AVAILABLE_CURRICULA,
  AVAILABLE_SUBJECTS,
} from '../data/seedData';
import {
  calculateQuizResult,
  generateTutorReply,
  validateGoalInput,
  type GoalFormInput,
} from '../utils/dashboardLogic';
import { AiMascotRobot } from './BrandAssets';
import { MascotHelperPopup } from './MascotHelperPopup';

interface ModalShellProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  maxWidthClass?: string;
  children: React.ReactNode;
}

const ModalShell: React.FC<ModalShellProps> = ({
  title,
  subtitle,
  onClose,
  maxWidthClass = 'max-w-xl',
  children,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
    role="dialog"
    aria-modal="true"
    aria-label={title}
  >
    <div
      className={`w-full ${maxWidthClass} max-h-[90vh] overflow-hidden rounded-[24px] bg-white shadow-2xl flex flex-col`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="overflow-y-auto px-6 py-5">{children}</div>
    </div>
  </div>
);

/* 1. AI Tutor Chat Modal */
export const AiTutorModal: React.FC<{
  history: ChatTurn[];
  subjectHint: string;
  onSendMessage: (turnStudent: ChatTurn, turnAi: ChatTurn) => void;
  onClose: () => void;
}> = ({ history, subjectHint, onSendMessage, onClose }) => {
  const [draft, setDraft] = useState('');

  const sendPrompt = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const nowLabel = 'Just now';
    const studentTurn: ChatTurn = {
      id: `st-${Date.now()}`,
      sender: 'student',
      text: trimmed,
      timestamp: nowLabel,
    };
    const { reply, chips } = generateTutorReply(trimmed, subjectHint);
    const aiTurn: ChatTurn = {
      id: `ai-${Date.now() + 1}`,
      sender: 'ai',
      text: reply,
      timestamp: nowLabel,
      suggestionChips: chips,
    };
    onSendMessage(studentTurn, aiTurn);
    setDraft('');
  };

  return (
    <ModalShell
      title="Tutor Cloud AI Tutor"
      subtitle={`Interactive Grade 9 CCSS Study Coach · ${subjectHint}`}
      onClose={onClose}
      maxWidthClass="max-w-2xl"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#1A3B7E] to-[#15629E] p-3.5 text-white">
          <AiMascotRobot className="h-14 w-14 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-100">Active Study Session</p>
            <p className="text-sm font-bold">
              Ask any question on essays, algebra equations, or exam readiness.
            </p>
          </div>
        </div>

        <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1 scrollbar-thin">
          {history.map((turn) => (
            <div
              key={turn.id}
              className={`flex flex-col ${
                turn.sender === 'student' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed ${
                  turn.sender === 'student'
                    ? 'bg-[#15629E] text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {turn.text}
              </div>
              {turn.suggestionChips && turn.suggestionChips.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {turn.suggestionChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => sendPrompt(chip)}
                      className="rounded-full border border-[#15629E]/30 bg-blue-50/70 px-3 py-1 text-xs font-medium text-[#15629E] hover:bg-blue-100 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendPrompt(draft);
          }}
          className="flex items-center gap-2 pt-2 border-t border-slate-100"
        >
          <label htmlFor="ai-tutor-input" className="sr-only">
            Ask your AI tutor a question
          </label>
          <input
            id="ai-tutor-input"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about thesis statements, linear equations, or study tips..."
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#15629E] focus:outline-none focus:ring-2 focus:ring-[#15629E]/20"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#15629E] hover:bg-[#114F80] disabled:opacity-45 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </ModalShell>
  );
};

/* 2. Readiness Check / Smart Quiz Modal */
export const QuizAssessmentModal: React.FC<{
  mode: 'readiness' | 'smart-quiz';
  action?: LearningAction | null;
  questions: QuizQuestion[];
  onComplete: (scorePercent: number, actionId?: string) => void;
  onRequestGeneratePlan?: (action: LearningAction) => void;
  onClose: () => void;
}> = ({ mode, action, questions, onComplete, onRequestGeneratePlan, onClose }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const evaluation = calculateQuizResult(questions, answers);

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    onComplete(evaluation.percentage, action?.id);
  };

  return (
    <ModalShell
      title={
        mode === 'readiness'
          ? `${action?.subject ?? 'English'} Readiness Check`
          : 'Smart Quiz — Grade 9 CCSS'
      }
      subtitle={
        mode === 'readiness'
          ? action?.unitTopic ?? 'Diagnostic concept mastery check'
          : '12 peers active · Earn daily streak credit on completion'
      }
      onClose={onClose}
      maxWidthClass="max-w-2xl"
    >
      {submitted ? (
        <div className="space-y-5">
          <div className="rounded-2xl bg-gradient-to-br from-[#1A3B7E] to-[#15629E] p-6 text-white text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Assessment Complete
            </p>
            <p className="mt-2 font-display text-4xl font-extrabold tabular-nums">
              {evaluation.percentage}%
            </p>
            <p className="mt-1 text-sm text-blue-100">
              {evaluation.correctCount} of {evaluation.totalQuestions} correct · Readiness Tier:{' '}
              <strong className="text-amber-300">{evaluation.readinessTier}</strong>
            </p>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const userPick = answers[q.id];
              const isRight = userPick === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-3.5 text-xs ${
                    isRight
                      ? 'border-emerald-200 bg-emerald-50/60'
                      : 'border-amber-200 bg-amber-50/60'
                  }`}
                >
                  <p className="font-bold text-slate-900">
                    {idx + 1}. {q.prompt}
                  </p>
                  <p className="mt-1 text-slate-700">{q.explanation}</p>
                </div>
              );
            })}
          </div>

          {mode === 'readiness' && action && onRequestGeneratePlan ? (
            <div
              data-testid="readiness-generate-plan-prompt"
              className="rounded-2xl border-2 border-[#15629E]/25 bg-gradient-to-br from-[#F0F7FF] via-white to-[#FFF9EE] p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#15629E] text-white shadow-xs">
                  <Rocket className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Generate Your Personalized {action.subject} Learning Plan?
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                    Using your {evaluation.percentage}% ({evaluation.readinessTier}) Readiness Check
                    score, we can build your custom Learning Plan now. Once finished, it moves to
                    your Learning Plan page.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors"
                >
                  Later
                </button>
                <button
                  type="button"
                  onClick={() => onRequestGeneratePlan(action)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#F39200] hover:bg-[#DF8500] px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-[0_4px_12px_rgba(243,146,0,0.28)] transition-colors"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>Generate Learning Plan</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-[#F39200] hover:bg-[#DF8500] px-5 py-2.5 text-sm font-semibold text-slate-950"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>
              Answered <strong className="tabular-nums">{answeredCount}</strong> of{' '}
              <strong className="tabular-nums">{questions.length}</strong>
            </span>
            <span>Select one option per question</span>
          </div>

          {questions.map((q, idx) => (
            <fieldset key={q.id} className="rounded-2xl border border-slate-200 p-4 space-y-2.5">
              <legend className="px-1 text-xs font-semibold text-[#15629E]">
                Question {idx + 1} · {q.subject}
              </legend>
              <p className="text-sm font-semibold text-slate-900">{q.prompt}</p>
              <div className="space-y-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  const selected = answers[q.id] === optIdx;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                      aria-pressed={selected}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-left text-xs sm:text-[13px] transition-colors ${
                        selected
                          ? 'border-[#15629E] bg-blue-50 font-semibold text-[#0F3D6E]'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!allAnswered}
              onClick={handleSubmit}
              className="rounded-xl bg-[#F39200] hover:bg-[#DF8500] disabled:opacity-45 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors"
            >
              Submit Assessment
            </button>
          </div>
        </div>
      )}
      <MascotHelperPopup
        context="quiz"
        subject={action?.subject ?? 'English'}
        topic={action?.unitTopic ?? 'Readiness Check'}
        quizQuestionIndex={Math.min(answeredCount, Math.max(0, questions.length - 1))}
        quizTotalQuestions={questions.length}
        quizPrompt={questions[Math.min(answeredCount, Math.max(0, questions.length - 1))]?.prompt}
        quizExplanation={questions[Math.min(answeredCount, Math.max(0, questions.length - 1))]?.explanation}
        quizCompleted={submitted}
        quizScorePercent={evaluation.percentage}
        defaultOpen={false}
        positionClassName="fixed bottom-5 left-5 z-[60]"
      />
    </ModalShell>
  );
};

/* 3. Set Goal Modal (with strict validation) */
export const SetGoalModal: React.FC<{
  onCreateGoal: (input: GoalFormInput) => void;
  onClose: () => void;
}> = ({ onCreateGoal, onClose }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [category, setCategory] = useState('Concept Mastery');
  const [dueDate, setDueDate] = useState('2026-08-15');
  const [errors, setErrors] = useState<Partial<Record<keyof GoalFormInput, string>>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: GoalFormInput = { title, subject, category, dueDate };
    const result = validateGoalInput(input);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    onCreateGoal(input);
    onClose();
  };

  return (
    <ModalShell
      title="Set New Learning Goal"
      subtitle="Add a measurable target to your Learning Goals carousel."
      onClose={onClose}
      maxWidthClass="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="goal-title" className="block text-xs font-semibold text-slate-700 mb-1">
            Goal Title
          </label>
          <input
            id="goal-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="e.g. Algebra Linear Equations"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#15629E] focus:outline-none focus:ring-2 focus:ring-[#15629E]/20"
          />
          {errors.title && (
            <p role="alert" className="mt-1 text-xs font-medium text-red-600">
              {errors.title}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="goal-subject"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Subject
            </label>
            <select
              id="goal-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-[#15629E] focus:outline-none"
            >
              {AVAILABLE_SUBJECTS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="goal-category"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Focus Area
            </label>
            <select
              id="goal-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-[#15629E] focus:outline-none"
            >
              <option value="Concept Mastery">Concept Mastery</option>
              <option value="Exam Preparation">Exam Preparation</option>
              <option value="Skill Fluency">Skill Fluency</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="goal-due-date" className="block text-xs font-semibold text-slate-700 mb-1">
            Target Completion Date
          </label>
          <input
            id="goal-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#15629E] focus:outline-none"
          />
          {errors.dueDate && (
            <p role="alert" className="mt-1 text-xs font-medium text-red-600">
              {errors.dueDate}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#F39200] hover:bg-[#DF8500] px-5 py-2 text-sm font-semibold text-slate-950"
          >
            <Target className="h-4 w-4" />
            <span>Save Goal</span>
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

/* 4. Goal Detail & Progress Modal */
export const GoalDetailModal: React.FC<{
  goal: LearningGoal;
  onToggleComplete: (id: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}> = ({ goal, onToggleComplete, onUpdateProgress, onDelete, onClose }) => (
  <ModalShell
    title={goal.title}
    subtitle={`${goal.label} · Target ${goal.dueDate}`}
    onClose={onClose}
    maxWidthClass="max-w-md"
  >
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <span className="font-semibold text-[#0369A1]">{goal.category}</span>
        <span>·</span>
        <span className="font-semibold text-[#0369A1]">{goal.subject}</span>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <label htmlFor="goal-progress-slider">Mastery Progress</label>
          <span className="tabular-nums">{goal.progress}%</span>
        </div>
        <input
          id="goal-progress-slider"
          type="range"
          min={0}
          max={100}
          step={5}
          value={goal.progress}
          onChange={(e) => onUpdateProgress(goal.id, Number(e.target.value))}
          className="w-full accent-[#15629E]"
        />
      </div>

      {goal.completed || goal.progress >= 100 ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>Goal completed! It has been removed from your Dashboard.</span>
        </div>
      ) : (
        <p className="text-[11.5px] text-slate-500">
          Completing this goal (100% or Mark Completed) will clear it from your Dashboard.
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            onDelete(goal.id);
            onClose();
          }}
          className="rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          Remove Goal
        </button>

        {goal.completed || goal.progress >= 100 ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Done</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              onToggleComplete(goal.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#15629E] hover:bg-[#104E7E] px-4 py-2 text-xs font-semibold text-white"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Mark Completed</span>
          </button>
        )}
      </div>
    </div>
  </ModalShell>
);

/* 5. Profile Completion Modal */
export const ProfileModal: React.FC<{
  profile: StudentProfile;
  onSave: (updated: StudentProfile) => void;
  onClose: () => void;
}> = ({ profile, onSave, onClose }) => {
  const [fullName, setFullName] = useState(profile.fullName);
  const [grade, setGrade] = useState(profile.grade);
  const [curriculum, setCurriculum] = useState(profile.curriculum);
  const [subjects, setSubjects] = useState<string[]>(profile.subjects);
  const [learningStyle, setLearningStyle] = useState<StudentProfile['learningStyle']>(
    profile.learningStyle
  );
  const [error, setError] = useState('');

  const toggleSubject = (subj: string) => {
    setSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (subjects.length === 0) {
      setError('Select at least one subject.');
      return;
    }
    const firstName = fullName.trim().split(' ')[0] || profile.firstName;
    onSave({
      ...profile,
      firstName,
      fullName: fullName.trim(),
      grade,
      curriculum,
      subjects,
      learningStyle,
    });
    onClose();
  };

  return (
    <ModalShell
      title="Personalize Student Profile"
      subtitle="Update your grade, curriculum, and active subjects."
      onClose={onClose}
      maxWidthClass="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="student-name" className="block text-xs font-semibold text-slate-700 mb-1">
            Student Name
          </label>
          <input
            id="student-name"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setError('');
            }}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#15629E] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="student-grade" className="block text-xs font-semibold text-slate-700 mb-1">
              Grade Level
            </label>
            <select
              id="student-grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
            >
              {['7', '8', '9', '10', '11', '12'].map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="student-curriculum"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Curriculum
            </label>
            <select
              id="student-curriculum"
              value={curriculum}
              onChange={(e) => setCurriculum(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
            >
              {AVAILABLE_CURRICULA.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className="block text-xs font-semibold text-slate-700 mb-2">
            Active Subjects (choose 2+ to reach 100%)
          </span>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_SUBJECTS.map((subj) => {
              const active = subjects.includes(subj);
              return (
                <button
                  key={subj}
                  type="button"
                  onClick={() => toggleSubject(subj)}
                  aria-pressed={active}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-[#15629E] bg-[#15629E] text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {subj}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="student-learning-style"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Preferred Learning Style
          </label>
          <select
            id="student-learning-style"
            value={learningStyle}
            onChange={(e) =>
              setLearningStyle(e.target.value as StudentProfile['learningStyle'])
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
          >
            <option value="Interactive">Interactive</option>
            <option value="Visual">Visual</option>
            <option value="Step-by-Step">Step-by-Step</option>
            <option value="Practice-First">Practice-First</option>
          </select>
        </div>

        {error && (
          <p role="alert" className="text-xs font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#C86400] hover:bg-[#B05700] px-5 py-2 text-sm font-semibold text-white"
          >
            <User className="h-4 w-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

/* 6. Session Detail & Reschedule Modal */
export const SessionDetailModal: React.FC<{
  session: CalendarSession;
  calendarDays: CalendarDay[];
  onReschedule: (
    sessionId: string,
    newStatus: SessionColumnStatus,
    newDateKey: string
  ) => void;
  onClose: () => void;
}> = ({ session, calendarDays, onReschedule, onClose }) => {
  const [targetDate, setTargetDate] = useState(session.dateKey);

  return (
    <ModalShell
      title={session.title}
      subtitle={`${session.subject} · ${session.tutorName}`}
      onClose={onClose}
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">{session.description}</p>

        <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-700">
          <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
            <Clock className="h-4 w-4 text-[#15629E]" />
            {session.time} {session.meridiem}
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold capitalize">
            <Calendar className="h-4 w-4 text-[#15629E]" />
            Status: {session.status}
          </span>
        </div>

        <div>
          <label htmlFor="reschedule-date" className="block text-xs font-semibold text-slate-700 mb-1">
            Move to Date
          </label>
          <select
            id="reschedule-date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            {calendarDays.slice(0, 12).map((d) => (
              <option key={d.dateKey} value={d.dateKey}>
                {d.weekday} {d.dayNumber} ({d.dateKey})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {session.status !== 'scheduled' && (
            <button
              type="button"
              onClick={() => {
                onReschedule(session.id, 'scheduled', targetDate);
                onClose();
              }}
              className="rounded-xl bg-[#0284C7] hover:bg-[#0369A1] px-4 py-2.5 text-xs font-semibold text-white transition-colors"
            >
              Reschedule to Scheduled
            </button>
          )}
          {session.status !== 'upcoming' && (
            <button
              type="button"
              onClick={() => {
                onReschedule(session.id, 'upcoming', targetDate);
                onClose();
              }}
              className="rounded-xl bg-[#15803D] hover:bg-[#166534] px-4 py-2.5 text-xs font-semibold text-white transition-colors"
            >
              Move to Upcoming
            </button>
          )}
          {session.status !== 'missed' && (
            <button
              type="button"
              onClick={() => {
                onReschedule(session.id, 'missed', targetDate);
                onClose();
              }}
              className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2.5 text-xs font-semibold text-red-700 transition-colors"
            >
              Mark as Missed
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

/* 7. AI Lessons Interactive Viewer Modal */
export const AiLessonsModal: React.FC<{
  lessons: AiLesson[];
  onToggleLessonComplete: (lessonId: string) => void;
  onClose: () => void;
}> = ({ lessons, onToggleLessonComplete, onClose }) => {
  const [selectedId, setSelectedId] = useState(lessons[0]?.id ?? '');
  const [activeChapter, setActiveChapter] = useState(0);
  const current = lessons.find((l) => l.id === selectedId) ?? lessons[0];

  if (!current) return null;

  return (
    <ModalShell
      title="Interactive AI Lessons"
      subtitle="Bite-sized visual walkthroughs tailored to Grade 9 CCSS"
      onClose={onClose}
      maxWidthClass="max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Lesson List */}
        <div className="md:col-span-5 space-y-2.5">
          {lessons.map((lesson) => {
            const active = lesson.id === current.id;
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => {
                  setSelectedId(lesson.id);
                  setActiveChapter(0);
                }}
                className={`w-full rounded-2xl border p-3.5 text-left transition-colors ${
                  active
                    ? 'border-[#15629E] bg-blue-50/70'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span className="font-semibold text-[#15629E]">{lesson.subject}</span>
                  <span>{lesson.duration}</span>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-900">{lesson.title}</p>
                {lesson.completed && (
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Completed
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Lesson Player Area */}
        <div className="md:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
          <div>
            <div className="rounded-xl bg-gradient-to-br from-[#1A3B7E] to-[#15629E] p-5 text-white">
              <div className="flex items-center justify-between text-xs text-blue-200">
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <BookOpen className="h-4 w-4" />
                  {current.subject} · {current.difficulty}
                </span>
                <span className="tabular-nums">
                  {current.chapters[activeChapter]?.timestamp}
                </span>
              </div>
              <h3 className="mt-2 font-display text-lg font-bold">{current.title}</h3>
              <p className="mt-1.5 text-xs text-blue-100 leading-relaxed">{current.summary}</p>
            </div>

            <div className="mt-4 space-y-2">
              {current.chapters.map((ch, idx) => {
                const isOpen = idx === activeChapter;
                return (
                  <button
                    key={ch.title}
                    type="button"
                    onClick={() => setActiveChapter(idx)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      isOpen
                        ? 'border-[#F5A623] bg-[#FFF9F0]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span className="inline-flex items-center gap-1.5">
                        <Play className="h-3 w-3 text-[#D97706]" />
                        {ch.title}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 tabular-nums">
                        {ch.timestamp}
                      </span>
                    </div>
                    {isOpen && (
                      <p className="mt-2 text-xs text-slate-700 leading-relaxed">{ch.content}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => onToggleLessonComplete(current.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                current.completed
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-[#15629E] text-white hover:bg-[#104E7E]'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{current.completed ? 'Completed' : 'Mark Lesson Complete'}</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveChapter((c) => (c + 1) % current.chapters.length)
              }
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#15629E] hover:underline"
            >
              <span>Next Chapter</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

/* 8. ILP Generator Modal (with Pause/Resume in-progress & Complete-to-Learning-Plan lifecycle) */
export const IlpGeneratorModal: React.FC<{
  action: LearningAction;
  profile: StudentProfile;
  onConfirmPlan: (actionId: string, moduleTitle: string, subject: string, pace: string) => void;
  onInterruptGeneration?: (actionId: string, draftTopic: string) => void;
  onClose: () => void;
}> = ({ action, profile, onConfirmPlan, onInterruptGeneration, onClose }) => {
  const [pace, setPace] = useState<'Balanced (30m/day)' | 'Accelerated (45m/day)' | 'Exam Sprint (60m/day)'>(
    'Balanced (30m/day)'
  );
  const [focusTopic, setFocusTopic] = useState(action.unitTopic);
  const [step, setStep] = useState<'configure' | 'generating' | 'preview'>('configure');

  const isResuming = action.primaryCta === 'Resume ILP Generation' || action.status === 'In Progress';

  useEffect(() => {
    if (step !== 'generating') return;
    const timer = window.setTimeout(() => {
      setStep('preview');
    }, 650);
    return () => window.clearTimeout(timer);
  }, [step]);

  const handleCloseMidway = () => {
    onInterruptGeneration?.(action.id, focusTopic.trim() || action.unitTopic);
    onClose();
  };

  const resolvedTitle = focusTopic.trim() || action.unitTopic;

  return (
    <ModalShell
      title={`${isResuming ? 'Resume Learning Plan Generation' : 'Generate Learning Plan'} · ${action.subject}`}
      subtitle={`Grade ${profile.grade} ${profile.curriculum} Individualized Learning Plan (ILP)`}
      onClose={handleCloseMidway}
      maxWidthClass="max-w-lg"
    >
      <div className="space-y-4" data-testid="ilp-generator-modal" data-step={step}>
        {isResuming && step === 'configure' && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-900">
            Resuming your paused ILP generation — complete the steps below to move this track to your Learning Plan page.
          </div>
        )}

        {step === 'configure' && (
          <>
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-[#15629E] flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                Step 1 of 2 · Customize Your Learning Plan
              </p>
              <p className="mt-1">
                We will generate a tailored mastery track for <strong>{action.subject}</strong> and
                save it directly to your <strong>Learning Plan</strong> page. Closing before
                completion lets you resume anytime.
              </p>
            </div>

            <div>
              <label htmlFor="ilp-topic" className="block text-xs font-semibold text-slate-700 mb-1">
                Target Focus Unit
              </label>
              <input
                id="ilp-topic"
                type="text"
                value={focusTopic}
                onChange={(e) => setFocusTopic(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-2">Study Pace</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['Balanced (30m/day)', 'Accelerated (45m/day)', 'Exam Sprint (60m/day)'] as const).map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPace(option)}
                      aria-pressed={pace === option}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                        pace === option
                          ? 'border-[#15629E] bg-[#15629E] text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCloseMidway}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Save &amp; Finish Later
              </button>
              <button
                type="button"
                onClick={() => setStep('generating')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F39200] hover:bg-[#DF8500] px-5 py-2 text-sm font-semibold text-slate-950"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>{isResuming ? 'Continue Generating Plan' : 'Generate Learning Plan'}</span>
              </button>
            </div>
          </>
        )}

        {step === 'generating' && (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#15629E]">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Building your {action.subject} Learning Plan...
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Aligning "{resolvedTitle}" to Grade {profile.grade} {profile.curriculum} ({pace})
              </p>
            </div>
            <div className="mx-auto max-w-xs h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-[#15629E] animate-pulse" />
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCloseMidway}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close &amp; Resume Later
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  Step 2 of 2 · Learning Plan Blueprint Ready
                </span>
                <span className="rounded-md bg-white border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  {pace}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">{resolvedTitle}</p>
              <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Core Concept Walkthrough &amp; Guided Examples ({action.subject})
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Targeted Practice Drills based on your Readiness Check
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Mastery Checkpoint &amp; Weekly Progress Tracking
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCloseMidway}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Pause &amp; Resume Later
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirmPlan(action.id, resolvedTitle, action.subject, pace);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#15803D] hover:bg-[#166534] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>Complete &amp; Save Learning Plan</span>
              </button>
            </div>
          </>
        )}
      </div>
    </ModalShell>
  );
};
