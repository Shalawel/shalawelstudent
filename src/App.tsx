/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardHome } from './components/DashboardHome';
import {
  AiTutorModal,
  GoalDetailModal,
  IlpGeneratorModal,
  ProfileModal,
  QuizAssessmentModal,
  SetGoalModal,
} from './components/DashboardModals';
import { CalendarSessionDrawer } from './components/CalendarSessionDrawer';
import { AccelerateKnowledgeDrawer } from './components/AccelerateKnowledgeDrawer';
import { StartSessionDrawer } from './components/StartSessionDrawer';
import { SolveProblemDrawer } from './components/SolveProblemDrawer';
import { SmartQuizDrawer } from './components/SmartQuizDrawer';
import { SmartQuizDeck } from './components/SmartQuizDeck';
import { SessionClassroom } from './components/SessionClassroom';
import { SecondaryViews } from './components/SecondaryViews';
import { SettingsView } from './components/SettingsView';
import { AchievementsView } from './components/AchievementsView';
import { LearningProgressView } from './components/LearningProgressView';
import { ReadinessPracticeView } from './components/ReadinessPracticeView';
import { LearningSessionView } from './components/LearningSessionView';
import { ScheduleView } from './components/ScheduleView';
import { NotesResourcesView } from './components/NotesResourcesView';
import { QuickNotesCompanionDrawer } from './components/NotesResourcesOverlays';
import { AuthFlow } from './components/AuthFlow';
import { OnboardingRoadmapModal } from './components/OnboardingRoadmapModal';
import {
  CALENDAR_DAYS,
  INITIAL_AI_LESSONS,
  INITIAL_CHAT_HISTORY,
  INITIAL_GOALS,
  INITIAL_LEARNING_ACTIONS,
  INITIAL_NOTES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PLAN_MODULES,
  INITIAL_PROFILE,
  INITIAL_SESSIONS,
  INITIAL_THREADS,
  QUIZ_QUESTIONS,
} from './data/seedData';
import type {
  AiLesson,
  AuthView,
  CalendarSession,
  ChatTurn,
  LanguageCode,
  LearningAction,
  LearningGoal,
  LearningPlanModule,
  NavSectionId,
  NotificationItem,
  ProblemSolverPayload,
  SessionColumnStatus,
  SmartQuizInput,
  StartSessionInput,
  StudentProfile,
  StudyNote,
  TutorMessageThread,
} from './types/dashboard';
import {
  advanceStreak,
  buildIlpModuleFromGeneration,
  createGoal,
  generateTutorReply,
  getActiveDashboardGoals,
  getDashboardVisibleActions,
  markActionIlpCompleted,
  markActionIlpInProgress,
  rescheduleSession,
  toggleGoalCompletion,
  updateActionAfterCheck,
  type GoalFormInput,
} from './utils/dashboardLogic';
import { deriveProblemSessionTitle } from './utils/problemSolverLogic';
import {
  computeRoadmapProgress,
  filterDashboardActionsAfterPopup,
  filterDashboardGoalsAfterPopup,
  generatePersonalizedPlanModules,
  getAvailableReadinessChecks,
  getTodayDateKey,
  loadOnboardingState,
  saveOnboardingState,
  shouldAutoShowOnboardingPopup,
  shouldShowDashboardLearningGoals,
  type CompletedReadinessRecord,
  type OnboardingGoalRecord,
  type OnboardingState,
} from './utils/onboardingRoadmapLogic';
import {
  buildClassroomInputFromCalendarSession,
  cancelScheduledSession,
  format24hTo12h,
  getTimeSlotForDate,
  rescheduleCalendarSessionToScheduled,
} from './utils/calendarSessionLogic';
import {
  INITIAL_WEAK_AREAS,
  buildWeakAreaClassroomInput,
  updateWeakAreaNote,
  type UploadedNoteFile,
  type WeakAreaItem,
  type WeakAreaNoteSource,
} from './utils/weakAreaLogic';
import {
  DEFAULT_APP_SETTINGS,
  type AppSettingsState,
} from './utils/settingsLogic';
import {
  INITIAL_ACHIEVEMENT_BADGES,
  type AchievementBadge,
} from './utils/achievementsLogic';
import {
  INITIAL_PAST_ACTIVITIES,
  INITIAL_REVISIT_CONCEPTS,
  INITIAL_SAVED_PRACTICE,
  recordCompletedPracticeAttempt,
  type PracticeWorkspaceState,
} from './utils/readinessPracticeLogic';
import {
  INITIAL_ARCHIVED_PLANS,
  INITIAL_LEARNING_PATH_LESSONS,
  type LearningPathState,
} from './utils/learningSessionLogic';
import {
  INITIAL_SCHEDULE_SESSIONS,
  toDashboardCalendarSession,
  type ScheduleSessionItem,
} from './utils/scheduleLogic';
import {
  INITIAL_LEARNING_RESOURCES,
  INITIAL_RICH_NOTES,
  createQuickSessionNote,
  type LearningResourceItem,
  type RichNoteItem,
} from './utils/notesResourcesLogic';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const autostart = params.get('autostart');
      if (autostart === '1' || autostart === 'angles' || autostart === 'dashboard') {
        return true;
      }
    }
    return false;
  });
  const [authInitialView, setAuthInitialView] = useState<AuthView>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'login') return 'login';
    }
    return 'signup';
  });
  // Session token kept strictly in React memory (never persisted to localStorage)
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<NavSectionId>('dashboard');
  const [notesHubResetKey, setNotesHubResetKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [profile, setProfile] = useState<StudentProfile>(INITIAL_PROFILE);
  const [appSettings, setAppSettings] = useState<AppSettingsState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('tutorcloud_app_settings_v1');
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<AppSettingsState>;
          return {
            profilePrefs: { ...DEFAULT_APP_SETTINGS.profilePrefs, ...parsed.profilePrefs },
            notifications: {
              channels: {
                ...DEFAULT_APP_SETTINGS.notifications.channels,
                ...parsed.notifications?.channels,
              },
              topics: {
                ...DEFAULT_APP_SETTINGS.notifications.topics,
                ...parsed.notifications?.topics,
                messages: true,
              },
            },
            linkedParents: Array.isArray(parsed.linkedParents)
              ? parsed.linkedParents
              : DEFAULT_APP_SETTINGS.linkedParents,
            devices: Array.isArray(parsed.devices) && parsed.devices.length > 0
              ? parsed.devices
              : DEFAULT_APP_SETTINGS.devices,
            accessibility: {
              ...DEFAULT_APP_SETTINGS.accessibility,
              ...parsed.accessibility,
            },
          };
        }
      } catch {
        // Fallback to default settings
      }
    }
    return DEFAULT_APP_SETTINGS;
  });
  const [language, setLanguage] = useState<LanguageCode>('ENG');
  const [streakDays, setStreakDays] = useState<number>(1);
  const [streakEarnedToday, setStreakEarnedToday] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('tutorcloud_app_settings_v1', JSON.stringify(appSettings));
    } catch {
      // Ignore storage quota errors
    }
    const root = document.documentElement;
    const a11y = appSettings.accessibility;
    root.dataset.a11yText = a11y.textSize;
    root.dataset.a11yReduceMotion = String(a11y.reduceMotion);
    root.dataset.a11yFocus = String(a11y.enhancedFocusIndicators);
    root.dataset.a11yContrast = String(a11y.highContrast);
    root.dataset.a11yColorblind = a11y.colorBlindMode;

    const prefersDark =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = a11y.theme === 'dark' || (a11y.theme === 'system' && prefersDark);
    root.classList.toggle('dark', shouldBeDark);
  }, [appSettings]);

  const [achievementBadges, setAchievementBadges] = useState<AchievementBadge[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('tutorcloud_achievements_v1');
        if (raw) {
          const parsed = JSON.parse(raw) as AchievementBadge[];
          if (Array.isArray(parsed) && parsed.length === INITIAL_ACHIEVEMENT_BADGES.length) {
            return parsed;
          }
        }
      } catch {
        // Fallback to seed badges
      }
    }
    return INITIAL_ACHIEVEMENT_BADGES;
  });

  const [pinnedBadgeIds, setPinnedBadgeIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('tutorcloud_pinned_badges_v1');
        if (raw) {
          const parsed = JSON.parse(raw) as string[];
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // Fallback to default pinned
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        'tutorcloud_achievements_v1',
        JSON.stringify(achievementBadges)
      );
      window.localStorage.setItem(
        'tutorcloud_pinned_badges_v1',
        JSON.stringify(pinnedBadgeIds)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [achievementBadges, pinnedBadgeIds]);

  const [actions, setActions] = useState<LearningAction[]>(INITIAL_LEARNING_ACTIONS);
  const [isRefreshingActions, setIsRefreshingActions] = useState(false);

  const [goals, setGoals] = useState<LearningGoal[]>(INITIAL_GOALS);
  const [goalPage, setGoalPage] = useState<number>(0);

  const [selectedDateKey, setSelectedDateKey] = useState<string>('2026-07-15');
  const [sessions, setSessions] = useState<CalendarSession[]>(() => {
    const now = new Date();
    const liveSlot = getTimeSlotForDate(now, 0);
    const laterSlot1 = getTimeSlotForDate(now, 150);
    const laterSlot2 = getTimeSlotForDate(now, 240);
    return INITIAL_SESSIONS.map((s) => {
      if (s.id === 'ses-15-u1') {
        return { ...s, time: liveSlot.time, meridiem: liveSlot.meridiem };
      }
      if (s.id === 'ses-15-u2') {
        return { ...s, time: laterSlot1.time, meridiem: laterSlot1.meridiem };
      }
      if (s.id === 'ses-15-u3') {
        return { ...s, time: laterSlot2.time, meridiem: laterSlot2.meridiem };
      }
      return s;
    });
  });

  const [planModules, setPlanModules] = useState<LearningPlanModule[]>(INITIAL_PLAN_MODULES);
  const [lessons] = useState<AiLesson[]>(INITIAL_AI_LESSONS);
  const [notes, setNotes] = useState<StudyNote[]>(INITIAL_NOTES);
  const [weakAreas, setWeakAreas] = useState<WeakAreaItem[]>(INITIAL_WEAK_AREAS);
  const [threads, setThreads] = useState<TutorMessageThread[]>(INITIAL_THREADS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>(INITIAL_CHAT_HISTORY);
  const [completedQuizzesCount, setCompletedQuizzesCount] = useState<number>(0);
  const [practiceWorkspace, setPracticeWorkspace] = useState<PracticeWorkspaceState>({
    savedPractice: INITIAL_SAVED_PRACTICE,
    revisitConcepts: INITIAL_REVISIT_CONCEPTS,
    pastActivities: INITIAL_PAST_ACTIVITIES,
  });
  const [learningPathState, setLearningPathState] = useState<LearningPathState>({
    lessons: INITIAL_LEARNING_PATH_LESSONS,
    archivedPlans: INITIAL_ARCHIVED_PLANS,
  });
  const [scheduleSessions, setScheduleSessions] = useState<ScheduleSessionItem[]>(
    INITIAL_SCHEDULE_SESSIONS
  );
  const [richNotes, setRichNotes] = useState<RichNoteItem[]>(INITIAL_RICH_NOTES);
  const [learningResources, setLearningResources] = useState<LearningResourceItem[]>(
    INITIAL_LEARNING_RESOURCES
  );
  const [quickNotesContext, setQuickNotesContext] = useState<{
    label: string;
    subject: string;
    topic?: string;
  } | null>(null);

  // Active modals, drawers & full-screen classroom
  const [showStartSessionDrawer, setShowStartSessionDrawer] = useState(false);
  const [showSolveProblemDrawer, setShowSolveProblemDrawer] = useState(false);
  const [activeClassroomSession, setActiveClassroomSession] = useState<StartSessionInput | null>(
    () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('autostart') === 'angles' || params.get('autostart') === '1') {
          return {
            helpType: 'Learn a Lesson',
            subject: 'Mathematics',
            lessonSource: 'another-topic',
            topic: 'Angles',
            specificQuestion: '',
            gradeLevel: '5',
          };
        }
      }
      return null;
    }
  );
  const [activeTutorSubject, setActiveTutorSubject] = useState<string>('English');
  const [showAiTutor, setShowAiTutor] = useState(false);
  const [showSmartQuizDrawer, setShowSmartQuizDrawer] = useState(false);
  const [activeSmartQuiz, setActiveSmartQuiz] = useState<SmartQuizInput | null>(null);
  const [activeReadinessAction, setActiveReadinessAction] = useState<LearningAction | null>(null);
  const [activeIlpAction, setActiveIlpAction] = useState<LearningAction | null>(null);
  const [showAiLessons, setShowAiLessons] = useState(false);
  const [showSetGoal, setShowSetGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Interactive Onboarding Roadmap state (persisted per student email)
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(() =>
    loadOnboardingState(INITIAL_PROFILE.email)
  );
  const [onboardingDismissedThisSession, setOnboardingDismissedThisSession] =
    useState<boolean>(false);
  const [manualOpenOnboarding, setManualOpenOnboarding] = useState<boolean>(false);

  const availableReadinessChecks = useMemo(
    () => getAvailableReadinessChecks(profile.subjects, profile.grade),
    [profile.subjects, profile.grade]
  );

  const onboardingProgress = useMemo(
    () => computeRoadmapProgress(onboardingState, availableReadinessChecks),
    [onboardingState, availableReadinessChecks]
  );

  const dashboardVisibleActions = useMemo(
    () =>
      getDashboardVisibleActions(
        filterDashboardActionsAfterPopup(
          actions,
          onboardingState,
          availableReadinessChecks
        )
      ),
    [actions, onboardingState, availableReadinessChecks]
  );

  const dashboardVisibleGoals = useMemo(
    () =>
      getActiveDashboardGoals(
        filterDashboardGoalsAfterPopup(goals, onboardingState)
      ),
    [goals, onboardingState]
  );

  const showDashboardLearningGoals = shouldShowDashboardLearningGoals(onboardingState);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loaded = loadOnboardingState(profile.email);
    setOnboardingState(loaded);
    saveOnboardingState(profile.email, loaded);
  }, [isAuthenticated, profile.email]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  const handleDismissOnboarding = () => {
    setManualOpenOnboarding(false);
    setOnboardingDismissedThisSession(true);
    setOnboardingState((prev) => {
      const updated: OnboardingState = {
        ...prev,
        lastDismissedDate: getTodayDateKey(),
      };
      saveOnboardingState(profile.email, updated);
      return updated;
    });
    if (!onboardingProgress.isComplete) {
      showToast('Setup progress saved — resume anytime from your dashboard');
    }
  };

  const handleSubmitOnboardingReadiness = (record: CompletedReadinessRecord) => {
    setCompletedQuizzesCount((c) => c + 1);
    creditDailyStreak();
    setOnboardingState((prev) => {
      const updated: OnboardingState = {
        ...prev,
        completedAssessments: {
          ...prev.completedAssessments,
          [record.assessmentId]: record,
        },
      };
      saveOnboardingState(profile.email, updated);
      return updated;
    });
    // Sync matching Dashboard Next Learning Action card if subject matches
    setActions((prev) => {
      const match = prev.find(
        (a) => a.subject.toLowerCase() === record.subject.toLowerCase()
      );
      return match ? updateActionAfterCheck(prev, match.id, record.scorePercent) : prev;
    });
  };

  const handleSaveOnboardingGoalsAndGeneratePlan = (newGoals: OnboardingGoalRecord[]) => {
    creditDailyStreak();
    setOnboardingState((prev) => {
      const updated: OnboardingState = {
        ...prev,
        savedGoals: [...newGoals, ...prev.savedGoals],
        learningPlanGenerated: true,
      };
      saveOnboardingState(profile.email, updated);
      return updated;
    });

    // Keep modal open on the celebratory screen until user clicks "View My Learning Plan"
    setManualOpenOnboarding(true);

    // Sync saved goals into Dashboard goals & student daily pace
    newGoals.forEach((g) => {
      setGoals((prev) =>
        createGoal(prev, {
          title: g.title,
          subject: g.subject,
          category: g.focusArea,
          dueDate: g.dueDate,
        })
      );
    });
    if (newGoals[0]?.dailyMinutes) {
      setProfile((prev) => ({ ...prev, dailyTargetMinutes: newGoals[0].dailyMinutes }));
    }

    // Generate personalized Learning Plan modules from readiness results & goals
    const generatedModules = generatePersonalizedPlanModules(
      onboardingState.completedAssessments,
      newGoals,
      profile
    );
    if (generatedModules.length > 0) {
      setPlanModules((prev) => [...generatedModules, ...prev]);
    }
  };

  const handleViewGeneratedLearningPlan = () => {
    setManualOpenOnboarding(false);
    setOnboardingDismissedThisSession(true);
    setActiveSection('learning-plan');
    showToast('Your personalized Learning Plan is ready!');
  };

  const handleSignOut = async () => {
    if (authToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch {
        // Ignore network errors on logout and clear local session state
      }
    }
    setAuthToken(null);
    setActiveClassroomSession(null);
    setActiveSmartQuiz(null);
    setActiveSection('dashboard');
    setAuthInitialView('login');
    setManualOpenOnboarding(false);
    setOnboardingDismissedThisSession(false);
    setIsAuthenticated(false);
  };

  const creditDailyStreak = () => {
    const next = advanceStreak(streakDays, streakEarnedToday);
    setStreakDays(next.streakDays);
    setStreakEarnedToday(next.earnedToday);
  };

  const handleOpenAiTutor = (initialPrompt?: string, subjectOverride?: string) => {
    const resolvedSubject = subjectOverride || profile.subjects[0] || 'English';
    setActiveTutorSubject(resolvedSubject);
    if (initialPrompt) {
      const studentTurn: ChatTurn = {
        id: `st-${Date.now()}`,
        sender: 'student',
        text: initialPrompt,
        timestamp: 'Just now',
      };
      const { reply, chips } = generateTutorReply(initialPrompt, resolvedSubject);
      const aiTurn: ChatTurn = {
        id: `ai-${Date.now() + 1}`,
        sender: 'ai',
        text: reply,
        timestamp: 'Just now',
        suggestionChips: chips,
      };
      setChatHistory((prev) => [...prev, studentTurn, aiTurn]);
    }
    setShowAiTutor(true);
  };

  const handleStartConfiguredSession = (input: StartSessionInput) => {
    setShowStartSessionDrawer(false);
    creditDailyStreak();
    setSessions((prev) => [
      {
        id: `ses-live-${Date.now()}`,
        dateKey: selectedDateKey,
        time: 'Now',
        meridiem: 'PM',
        title: `${input.helpType}: ${input.topic}`,
        description: input.specificQuestion
          ? input.specificQuestion
          : `45 min ${input.subject} AI Tutor session`,
        status: 'upcoming',
        tutorName: 'Maya · Lumio AI Tutor',
        subject: input.subject,
      },
      ...prev,
    ]);
    setToastMessage(null);
    setActiveClassroomSession(input);
  };

  const handleLaunchProblemClassroom = (payload: ProblemSolverPayload) => {
    setShowSolveProblemDrawer(false);
    const derivedTitle = deriveProblemSessionTitle(
      payload.problemText,
      payload.attachment?.fileName
    );
    handleStartConfiguredSession({
      helpType: 'Homework Help',
      subject: 'Solve my Problem',
      lessonSource: 'another-topic',
      topic: derivedTitle,
      specificQuestion: payload.problemText,
      gradeLevel: profile.grade,
      problemSolver: payload,
    });
  };

  const handleRefreshActions = () => {
    setIsRefreshingActions(true);
    window.setTimeout(() => {
      setActions((prev) => {
        if (prev.length < 2) return prev;
        const [first, ...rest] = prev;
        return [...rest, first];
      });
      setIsRefreshingActions(false);
      showToast('Next Learning Actions refreshed');
    }, 350);
  };

  const handleTriggerAction = (action: LearningAction) => {
    if (action.primaryCta === 'Resume ILP Generation' || action.status === 'Completed') {
      setActiveIlpAction(action);
      return;
    }
    setActiveReadinessAction(action);
  };

  const handleCompleteAssessment = (scorePercent: number, actionId?: string) => {
    setCompletedQuizzesCount((c) => c + 1);
    creditDailyStreak();
    if (actionId) {
      setActions((prev) => updateActionAfterCheck(prev, actionId, scorePercent));
    }
    showToast(`Assessment complete (${scorePercent}%) · Ready to generate your Learning Plan!`);
  };

  const handleInterruptIlpGeneration = (actionId: string, draftTopic: string) => {
    setActions((prev) => markActionIlpInProgress(prev, actionId, draftTopic));
    showToast('ILP generation paused — click "Resume ILP Generation" anytime to finish');
  };

  const handleConfirmIlpPlan = (
    actionId: string,
    moduleTitle: string,
    subject: string,
    pace: string = 'Balanced (30m/day)'
  ) => {
    setPlanModules((prev) => [
      buildIlpModuleFromGeneration({
        subject,
        moduleTitle,
        pace,
        existingCount: prev.length,
      }),
      ...prev,
    ]);
    setActions((prev) => markActionIlpCompleted(prev, actionId, moduleTitle));
    creditDailyStreak();
    showToast(`${subject} Learning Plan completed! View it on the Learning Plan page.`);
  };

  const handleCreateGoal = (input: GoalFormInput) => {
    setGoals((prev) => createGoal(prev, input));
    setGoalPage(0);
    showToast(`Goal "${input.title.trim()}" added`);
  };

  const handleRescheduleToScheduled = (
    sessionId: string,
    newDateKey: string,
    newTime24: string
  ) => {
    setSessions((prev) =>
      rescheduleCalendarSessionToScheduled(prev, {
        sessionId,
        newDateKey,
        newTime24,
      })
    );
    setSelectedDateKey(newDateKey);
    const parsed = format24hTo12h(newTime24);
    const timeLabel = parsed ? `${parsed.time} ${parsed.meridiem}` : newTime24;
    showToast(`Session rescheduled to Scheduled (${newDateKey} at ${timeLabel})`);
  };

  const handleGoToClassroomFromCalendar = (session: CalendarSession) => {
    setSelectedSession(null);
    creditDailyStreak();
    // If joining from Missed list, remove it from Missed since student is attending now
    if (session.status === 'missed') {
      setSessions((prev) => prev.filter((s) => s.id !== session.id));
    }
    const classroomInput = buildClassroomInputFromCalendarSession(session, profile.grade);
    setToastMessage(null);
    setActiveClassroomSession(classroomInput);
  };

  const handleCancelScheduledSession = (sessionId: string, reason: string) => {
    setSessions((prev) => {
      const { updatedSessions, cancelledRecord } = cancelScheduledSession(
        prev,
        sessionId,
        reason
      );
      if (cancelledRecord) {
        showToast(`Cancelled "${cancelledRecord.title}" · Reason recorded`);
      }
      return updatedSessions;
    });
  };

  const handleJoinWeakAreaSession = (area: WeakAreaItem) => {
    setShowAiLessons(false);
    creditDailyStreak();
    const classroomInput = buildWeakAreaClassroomInput(area, profile.grade);
    setToastMessage(null);
    setActiveClassroomSession(classroomInput);
  };

  const handleSaveWeakAreaNote = (
    areaId: string,
    payload: {
      noteTitle: string;
      noteContent: string;
      noteSource: WeakAreaNoteSource;
      uploadedFile?: UploadedNoteFile | null;
    }
  ) => {
    const targetArea = weakAreas.find((a) => a.id === areaId);
    setWeakAreas((prev) => updateWeakAreaNote(prev, areaId, payload));

    if (targetArea && payload.noteSource !== 'ai-generated') {
      setNotes((prev) => [
        {
          id: `note-wa-${Date.now()}`,
          subject: targetArea.subject,
          title: payload.noteTitle,
          content: payload.noteContent,
          updatedAt: 'Just now',
          pinned: false,
        },
        ...prev,
      ]);
    }

    if (payload.noteSource === 'student-uploaded') {
      showToast(`Uploaded note saved for ${targetArea?.topic ?? 'weak area'}`);
    } else if (payload.noteSource === 'student-edited') {
      showToast(`Updated study note saved for ${targetArea?.topic ?? 'weak area'}`);
    } else {
      showToast(`Fresh AI study note generated for ${targetArea?.topic ?? 'weak area'}`);
    }
  };

  const handleAddSession = (session: Omit<CalendarSession, 'id'>) => {
    setSessions((prev) => [{ ...session, id: `ses-${Date.now()}` }, ...prev]);
    showToast(`Session "${session.title}" scheduled`);
  };

  const handleOpenAddSessionFromBoard = () => {
    setActiveSection('schedule');
  };

  const unreadMessages = threads.reduce((sum, t) => sum + t.unread, 0);

  if (!isAuthenticated) {
    return (
      <AuthFlow
        initialView={authInitialView}
        onAuthenticated={({ profile: registeredProfile, token, welcomeMessage }) => {
          setProfile(registeredProfile);
          setAuthToken(token);
          setOnboardingDismissedThisSession(false);
          setManualOpenOnboarding(false);
          setIsAuthenticated(true);
          setActiveSection('dashboard');
          showToast(welcomeMessage);
        }}
        onContinueDemo={() => {
          setProfile(INITIAL_PROFILE);
          setAuthToken(null);
          setOnboardingDismissedThisSession(false);
          setManualOpenOnboarding(false);
          setIsAuthenticated(true);
          setActiveSection('dashboard');
          showToast('Exploring Tutor Cloud in Demo Student mode');
        }}
      />
    );
  }

  const hasActiveLearningSession = Boolean(activeClassroomSession || activeSmartQuiz);
  const isOnboardingModalOpen =
    isAuthenticated &&
    !hasActiveLearningSession &&
    (manualOpenOnboarding ||
      shouldAutoShowOnboardingPopup({
        state: onboardingState,
        progress: onboardingProgress,
        isDismissedThisSession: onboardingDismissedThisSession,
        hasActiveSession: hasActiveLearningSession,
        isAuthenticated,
      }));

  const nextMilestoneTitle =
    onboardingProgress.visibleMilestones.find((m) => m.status === 'active')?.title ||
    'Set Your Learning Goals';

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#D6E2FF] via-[#C3D4FF] to-[#A6BEFF] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        unreadMessages={unreadMessages}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5 flex-1">
          <TopBar
            profile={profile}
            language={language}
            onChangeLanguage={(lang) => {
              setLanguage(lang);
              showToast(`Display language set to ${lang}`);
            }}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onOpenProfileModal={() => setShowProfileModal(true)}
            onNavigate={setActiveSection}
            onSignOut={handleSignOut}
          />

          <main>
            {activeSection === 'dashboard' ? (
              <DashboardHome
                profile={profile}
                streakDays={streakDays}
                streakEarnedToday={streakEarnedToday}
                onClaimDailyStreak={() => {
                  creditDailyStreak();
                  showToast('Daily learning streak checked in!');
                }}
                actions={dashboardVisibleActions}
                onRefreshActions={handleRefreshActions}
                isRefreshingActions={isRefreshingActions}
                onTriggerAction={handleTriggerAction}
                onGeneratePlan={(action) => setActiveIlpAction(action)}
                goals={dashboardVisibleGoals}
                showLearningGoals={showDashboardLearningGoals}
                goalPage={goalPage}
                onChangeGoalPage={setGoalPage}
                onOpenSetGoal={() => setShowSetGoal(true)}
                onSelectGoal={(goal) => setSelectedGoal(goal)}
                calendarDays={CALENDAR_DAYS}
                selectedDateKey={selectedDateKey}
                onSelectDateKey={setSelectedDateKey}
                sessions={sessions}
                onSelectSession={(session) => setSelectedSession(session)}
                onOpenAddSession={handleOpenAddSessionFromBoard}
                notifications={notifications}
                onMarkAllNotificationsRead={() =>
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                }
                onOpenProfileModal={() => setShowProfileModal(true)}
                onOpenStartSession={() => setShowStartSessionDrawer(true)}
                onOpenAnglesVoiceClassroom={() =>
                  handleStartConfiguredSession({
                    helpType: 'Learn a Lesson',
                    subject: 'Mathematics',
                    lessonSource: 'another-topic',
                    topic: 'Angles',
                    specificQuestion: '',
                    gradeLevel: '5',
                  })
                }
                onOpenSolveProblem={() => setShowSolveProblemDrawer(true)}
                onOpenSmartQuiz={() => setShowSmartQuizDrawer(true)}
                onOpenAiLessons={() => setShowAiLessons(true)}
                onboardingBanner={
                  !onboardingProgress.isComplete && !isOnboardingModalOpen
                    ? {
                        completedSteps: onboardingProgress.completedSteps,
                        totalSteps: onboardingProgress.totalSteps,
                        percentComplete: onboardingProgress.percentComplete,
                        nextStepLabel: nextMilestoneTitle,
                        onResume: () => setManualOpenOnboarding(true),
                      }
                    : null
                }
              />
            ) : activeSection === 'schedule' ? (
              <ScheduleView
                sessions={scheduleSessions}
                defaultCurriculum={
                  profile.curriculum === 'CCSS'
                    ? 'Common Core State Standards (CCSS)'
                    : profile.curriculum
                }
                onUpdateSessions={setScheduleSessions}
                onSyncCreatedSessions={(created) => {
                  const mapped = created.map(toDashboardCalendarSession);
                  setSessions((prev) => [...mapped, ...prev]);
                }}
                onStartTopicSession={(input) => handleStartConfiguredSession(input)}
                onAddNote={(note) => {
                  setNotes((prev) => [
                    {
                      ...note,
                      id: `note-${Date.now()}`,
                      updatedAt: '13 Jul, 2026',
                      pinned: false,
                    },
                    ...prev,
                  ]);
                  setRichNotes((prev) => [
                    createQuickSessionNote({
                      subject: note.subject,
                      title: note.title,
                      content: note.content,
                      sourceLabel: 'Schedule Session',
                      grade: `Grade ${profile.grade}`,
                    }),
                    ...prev,
                  ]);
                  showToast('Session notes saved to Notes & Resources');
                }}
                onNavigate={setActiveSection}
                onNotify={showToast}
              />
            ) : activeSection === 'notes' ? (
              <NotesResourcesView
                key={notesHubResetKey}
                notes={richNotes}
                resources={learningResources}
                gradeLabel={`Grade ${profile.grade}`}
                onUpdateNotes={setRichNotes}
                onUpdateResources={setLearningResources}
                onStartTopicSession={(input) => handleStartConfiguredSession(input)}
                onLaunchSmartQuiz={(input) => setActiveSmartQuiz(input)}
                onNotify={showToast}
              />
            ) : activeSection === 'settings' ? (
              <SettingsView
                profile={profile}
                settings={appSettings}
                onUpdateProfile={setProfile}
                onUpdateSettings={setAppSettings}
                onNotify={showToast}
              />
            ) : activeSection === 'achievements' ? (
              <AchievementsView
                badges={achievementBadges}
                pinnedBadgeIds={pinnedBadgeIds}
                onUpdateBadges={setAchievementBadges}
                onUpdatePinnedBadges={setPinnedBadgeIds}
                onNavigateToActivity={(targetSection) => setActiveSection(targetSection)}
                onNotify={showToast}
              />
            ) : activeSection === 'learning-plan' ? (
              <LearningSessionView
                pathState={learningPathState}
                onUpdatePathState={setLearningPathState}
                actions={actions}
                onStartTopicSession={(input) => handleStartConfiguredSession(input)}
                onLaunchSmartQuiz={(input) => setActiveSmartQuiz(input)}
                onOpenSetGoal={() => setShowSetGoal(true)}
                onOpenOnboardingWizard={() => setManualOpenOnboarding(true)}
                onTriggerReadinessAction={handleTriggerAction}
                onGeneratePlan={(action) => setActiveIlpAction(action)}
                onNotify={showToast}
              />
            ) : activeSection === 'practice' ? (
              <ReadinessPracticeView
                workspace={practiceWorkspace}
                actions={actions}
                weakAreaCount={weakAreas.length}
                onOpenStartSession={() => setShowStartSessionDrawer(true)}
                onOpenSmartQuizDrawer={() => setShowSmartQuizDrawer(true)}
                onOpenWeakAreas={() => setShowAiLessons(true)}
                onLaunchSmartQuiz={(input) => setActiveSmartQuiz(input)}
                onStartTopicSession={(input) => handleStartConfiguredSession(input)}
                onTriggerReadinessAction={handleTriggerAction}
                onNavigate={setActiveSection}
                onOpenMyNotes={() =>
                  setQuickNotesContext({
                    label: 'Practice',
                    subject: profile.subjects[0] || 'Mathematics',
                    topic: 'Readiness & Practice',
                  })
                }
              />
            ) : activeSection === 'progress' ? (
              <LearningProgressView
                profile={profile}
                streakDays={streakDays}
                streakEarnedToday={streakEarnedToday}
                onClaimDailyStreak={() => {
                  creditDailyStreak();
                  showToast('Daily learning streak checked in!');
                }}
                completedQuizzesCount={completedQuizzesCount}
                planModules={planModules}
                achievementBadges={achievementBadges}
                onNavigate={setActiveSection}
                onLaunchSmartQuiz={(input) => setActiveSmartQuiz(input)}
                onStartTopicSession={(input) => handleStartConfiguredSession(input)}
                onNotify={showToast}
              />
            ) : (
              <SecondaryViews
                section={activeSection}
                profile={profile}
                onUpdateProfile={setProfile}
                streakDays={streakDays}
                actions={actions}
                onTriggerAction={handleTriggerAction}
                onGeneratePlan={(action) => setActiveIlpAction(action)}
                goals={goals}
                onOpenSetGoal={() => setShowSetGoal(true)}
                sessions={sessions}
                calendarDays={CALENDAR_DAYS}
                selectedDateKey={selectedDateKey}
                onSelectDateKey={setSelectedDateKey}
                onSelectSession={(session) => setSelectedSession(session)}
                onAddSession={handleAddSession}
                planModules={planModules}
                onTogglePlanModule={(modId) =>
                  setPlanModules((prev) =>
                    prev.map((m) =>
                      m.id === modId ? { ...m, completed: !m.completed } : m
                    )
                  )
                }
                lessons={lessons}
                onOpenAiLessons={() => setShowAiLessons(true)}
                onOpenSmartQuiz={() => setShowSmartQuizDrawer(true)}
                onOpenAiTutor={handleOpenAiTutor}
                notes={notes}
                onAddNote={(note) => {
                  setNotes((prev) => [
                    {
                      ...note,
                      id: `note-${Date.now()}`,
                      updatedAt: '07 Jul, 2026',
                      pinned: false,
                    },
                    ...prev,
                  ]);
                  showToast('Study note saved');
                }}
                onTogglePinNote={(noteId) =>
                  setNotes((prev) =>
                    prev.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n))
                  )
                }
                threads={threads}
                onSendThreadReply={(threadId, text) =>
                  setThreads((prev) =>
                    prev.map((t) =>
                      t.id === threadId
                        ? {
                            ...t,
                            unread: 0,
                            messages: [
                              ...t.messages,
                              {
                                id: `msg-${Date.now()}`,
                                sender: 'student',
                                text,
                                time: 'Just now',
                              },
                            ],
                          }
                        : t
                    )
                  )
                }
                onMarkThreadRead={(threadId) =>
                  setThreads((prev) =>
                    prev.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t))
                  )
                }
                completedQuizzesCount={completedQuizzesCount}
              />
            )}
          </main>
        </div>
      </div>

      {/* Right-side Start a Session Drawer */}
      <StartSessionDrawer
        open={showStartSessionDrawer}
        onClose={() => setShowStartSessionDrawer(false)}
        hasCompletedReadinessCheck={actions.some((a) => a.status === 'Completed')}
        planModules={planModules}
        onStartSession={handleStartConfiguredSession}
      />

      {/* Right-side Solve my Problem Drawer */}
      <SolveProblemDrawer
        open={showSolveProblemDrawer}
        onClose={() => setShowSolveProblemDrawer(false)}
        onLaunchProblemClassroom={handleLaunchProblemClassroom}
      />

      {/* Full-Screen AI Classroom */}
      {activeClassroomSession && (
        <SessionClassroom
          session={activeClassroomSession}
          profile={profile}
          onOpenMyNotes={() =>
            setQuickNotesContext({
              label: 'Live Session',
              subject: activeClassroomSession.subject,
              topic: activeClassroomSession.topic,
            })
          }
          onSaveTeacherNote={(subject, topic, noteText) => {
            setNotes((prev) => [
              {
                id: `note-teacher-${Date.now()}`,
                subject,
                title: `Teacher Follow-Up: ${topic}`,
                content: noteText,
                updatedAt: 'Just now',
                pinned: true,
              },
              ...prev,
            ]);
            setRichNotes((prev) => [
              createQuickSessionNote({
                subject,
                title: `Session Notes: ${topic}`,
                content: noteText,
                sourceLabel: 'Live Session',
                grade: `Grade ${profile.grade}`,
              }),
              ...prev,
            ]);
          }}
          onEndSession={(closureReport) => {
            setActiveClassroomSession(null);
            if (closureReport) {
              // Update matching Learning Plan module conservatively using verified mastery standing
              setPlanModules((prev) =>
                prev.map((mod) => {
                  const sameSubject =
                    mod.subject.toLowerCase() === closureReport.subject.toLowerCase();
                  const topicMatches =
                    mod.title.toLowerCase().includes(closureReport.topic.toLowerCase()) ||
                    closureReport.topic.toLowerCase().includes(mod.title.toLowerCase());
                  if (sameSubject && topicMatches) {
                    const updatedMastery = Math.max(mod.mastery, closureReport.masteryPercent);
                    return {
                      ...mod,
                      mastery: updatedMastery,
                      completed:
                        mod.completed ||
                        closureReport.masteryBand === 'Reliable Transfer Mastery',
                    };
                  }
                  return mod;
                })
              );

              // Honestly track remaining weak areas inside Accelerate Your Knowledge
              if (closureReport.shouldPersistWeakArea) {
                setWeakAreas((prev) => {
                  const existingIdx = prev.findIndex(
                    (w) =>
                      w.subject.toLowerCase() === closureReport.subject.toLowerCase() &&
                      w.topic.toLowerCase() === closureReport.topic.toLowerCase()
                  );
                  if (existingIdx >= 0) {
                    const next = [...prev];
                    next[existingIdx] = {
                      ...next[existingIdx],
                      masteryPercent: closureReport.masteryPercent,
                      gapSummary:
                        closureReport.remainingWeakAreas[0] || next[existingIdx].gapSummary,
                    };
                    return next;
                  }
                  return [
                    {
                      id: `wa-ses-${Date.now()}`,
                      subject: closureReport.subject,
                      topic: closureReport.topic,
                      masteryPercent: closureReport.masteryPercent,
                      priority:
                        closureReport.masteryPercent < 45
                          ? 'High Priority'
                          : closureReport.masteryPercent < 65
                          ? 'Needs Practice'
                          : 'Review Soon',
                      gapSummary:
                        closureReport.remainingWeakAreas[0] ||
                        `Strengthen independent transfer on ${closureReport.topic}.`,
                      noteTitle: `${closureReport.topic} — Session Wrap-Up Notes`,
                      noteContent: [
                        closureReport.keyLearningSummary,
                        `Mastery Standing: ${closureReport.masteryBand} (${closureReport.masteryPercent}%)`,
                        `Next Steps: ${closureReport.recommendedNextSteps.join(' ')}`,
                      ].join('\n'),
                      noteSource: 'ai-generated',
                      noteUpdatedAt: 'Just now',
                    },
                    ...prev,
                  ];
                });
              }

              showToast(
                `Session saved · ${closureReport.masteryBand} (${closureReport.masteryPercent}%)`
              );
            } else {
              showToast('Classroom session ended · Progress saved');
            }
          }}
        />
      )}

      {/* Modals */}
      {showAiTutor && (
        <AiTutorModal
          history={chatHistory}
          subjectHint={activeTutorSubject}
          onSendMessage={(studentTurn, aiTurn) =>
            setChatHistory((prev) => [...prev, studentTurn, aiTurn])
          }
          onClose={() => setShowAiTutor(false)}
        />
      )}

      {/* Left-side Smart Quiz Drawer */}
      <SmartQuizDrawer
        open={showSmartQuizDrawer}
        onClose={() => setShowSmartQuizDrawer(false)}
        onStartQuiz={(input) => {
          setShowSmartQuizDrawer(false);
          setActiveSmartQuiz(input);
        }}
      />

      {/* Interactive Swipeable Smart Quiz Deck */}
      {activeSmartQuiz && (
        <SmartQuizDeck
          config={activeSmartQuiz}
          onComplete={(score) => {
            setCompletedQuizzesCount((c) => c + 1);
            setPracticeWorkspace((prev) =>
              recordCompletedPracticeAttempt(prev, {
                subject: activeSmartQuiz.subject,
                topic: activeSmartQuiz.topic,
                score,
                activityType: 'Quiz',
              })
            );
            creditDailyStreak();
            showToast(
              `Smart Quiz (${activeSmartQuiz.subject}: ${activeSmartQuiz.topic}) finished — ${score}%`
            );
          }}
          onClose={() => setActiveSmartQuiz(null)}
        />
      )}

      {/* Quick Notes & Uploaded Books Companion Drawer (available in Live Sessions & Practice) */}
      <QuickNotesCompanionDrawer
        open={Boolean(quickNotesContext)}
        contextLabel={quickNotesContext?.label || 'Study'}
        defaultSubject={quickNotesContext?.subject || profile.subjects[0] || 'Mathematics'}
        defaultTopic={quickNotesContext?.topic}
        notes={richNotes}
        resources={learningResources}
        onClose={() => setQuickNotesContext(null)}
        onCreateNote={(subject, title, content, sourceLabel) => {
          setRichNotes((prev) => [
            createQuickSessionNote({
              subject,
              title,
              content,
              sourceLabel,
              grade: `Grade ${profile.grade}`,
            }),
            ...prev,
          ]);
          showToast(`Saved "${title}" to Notes & Resources`);
        }}
        onOpenFullLibrary={() => {
          setActiveClassroomSession(null);
          setNotesHubResetKey((k) => k + 1);
          setActiveSection('notes');
        }}
      />

      {activeReadinessAction && (
        <QuizAssessmentModal
          mode="readiness"
          action={activeReadinessAction}
          questions={QUIZ_QUESTIONS}
          onComplete={handleCompleteAssessment}
          onRequestGeneratePlan={(action) => {
            const latestAction = actions.find((a) => a.id === action.id) ?? action;
            setActiveReadinessAction(null);
            setActiveIlpAction(latestAction);
          }}
          onClose={() => setActiveReadinessAction(null)}
        />
      )}

      {activeIlpAction && (
        <IlpGeneratorModal
          action={activeIlpAction}
          profile={profile}
          onConfirmPlan={handleConfirmIlpPlan}
          onInterruptGeneration={handleInterruptIlpGeneration}
          onClose={() => setActiveIlpAction(null)}
        />
      )}

      <AccelerateKnowledgeDrawer
        open={showAiLessons}
        weakAreas={weakAreas}
        onClose={() => setShowAiLessons(false)}
        onJoinSession={handleJoinWeakAreaSession}
        onSaveWeakAreaNote={handleSaveWeakAreaNote}
      />

      {showSetGoal && (
        <SetGoalModal
          onCreateGoal={handleCreateGoal}
          onClose={() => setShowSetGoal(false)}
        />
      )}

      {selectedGoal && (
        <GoalDetailModal
          goal={selectedGoal}
          onToggleComplete={(id) => {
            const target = goals.find((g) => g.id === id);
            setGoals((prev) => toggleGoalCompletion(prev, id));
            if (target && !target.completed) {
              creditDailyStreak();
              showToast(`Goal "${target.title}" completed and removed from Dashboard`);
            } else {
              showToast('Goal status updated');
            }
          }}
          onUpdateProgress={(id, progress) => {
            const reachedComplete = progress >= 100;
            const target = goals.find((g) => g.id === id);
            setGoals((prev) =>
              prev.map((g) =>
                g.id === id ? { ...g, progress, completed: reachedComplete } : g
              )
            );
            setSelectedGoal((curr) =>
              curr && curr.id === id
                ? { ...curr, progress, completed: reachedComplete }
                : curr
            );
            if (reachedComplete && target && !target.completed) {
              creditDailyStreak();
              showToast(`Goal "${target.title}" completed and removed from Dashboard`);
            }
          }}
          onDelete={(id) => {
            setGoals((prev) => prev.filter((g) => g.id !== id));
            showToast('Goal removed');
          }}
          onClose={() => setSelectedGoal(null)}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          profile={profile}
          onSave={(updated) => {
            setProfile(updated);
            showToast('Student profile updated');
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      <CalendarSessionDrawer
        session={selectedSession}
        calendarDays={CALENDAR_DAYS}
        onClose={() => setSelectedSession(null)}
        onGoToClassroom={handleGoToClassroomFromCalendar}
        onRescheduleToScheduled={handleRescheduleToScheduled}
        onCancelScheduled={handleCancelScheduledSession}
      />

      {/* Interactive Onboarding Learning Roadmap Popup */}
      <OnboardingRoadmapModal
        open={isOnboardingModalOpen}
        profile={profile}
        onboardingState={onboardingState}
        onDismiss={handleDismissOnboarding}
        onSubmitReadinessQuiz={handleSubmitOnboardingReadiness}
        onSaveGoalsAndGeneratePlan={handleSaveOnboardingGoalsAndGeneratePlan}
        onViewLearningPlan={handleViewGeneratedLearningPlan}
      />

      {/* Subtle status toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
