import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  GraduationCap,
  Headphones,
  Info,
  Keyboard,
  Laptop,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Minimize2,
  Monitor,
  Moon,
  Palette,
  PenTool,
  Phone,
  Plus,
  RefreshCw,
  Rocket,
  ScanEye,
  Shield,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Sun,
  Target,
  Type,
  User,
  UserMinus,
  Users,
  Volume2,
  XCircle,
} from 'lucide-react';
import type { StudentProfile } from '../types/dashboard';
import {
  AI_TUTOR_PERSONAS,
  LEARNING_INTEREST_SUBJECTS,
  STUDENT_AVATAR_OPTIONS,
  TIMEZONE_OPTIONS,
  applyNotificationPreset,
  createLinkedParentRecord,
  detectNotificationPreset,
  getTextSizePx,
  logoutAllOtherDevices,
  logoutSingleDevice,
  resolveActiveAccessibilityFeatures,
  summarizeAccessibility,
  summarizeDevices,
  summarizeLinkedParents,
  summarizeNotifications,
  toggleArraySelection,
  validateAddParentInput,
  type AccessibilitySettings,
  type AiTutorPersona,
  type AppSettingsState,
  type ColorBlindMode,
  type GoalFocusOption,
  type LearningStyleOption,
  type NotificationPreset,
  type SettingsSubSection,
  type TextSizeOption,
  type ThemeOption,
} from '../utils/settingsLogic';
import { playUiSound } from '../utils/uiSounds';

interface SettingsViewProps {
  profile: StudentProfile;
  settings: AppSettingsState;
  onUpdateProfile: (next: StudentProfile) => void;
  onUpdateSettings: (next: AppSettingsState) => void;
  onNotify: (message: string) => void;
}

/** Accessible brand-blue switch control */
const SettingsSwitch: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
}> = ({ checked, onChange, ariaLabel, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    disabled={disabled}
    onClick={() => {
      if (disabled) return;
      playUiSound('click');
      onChange(!checked);
    }}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] focus-visible:ring-offset-2 ${
      disabled
        ? 'cursor-not-allowed bg-slate-200 dark:bg-slate-700 opacity-70'
        : checked
        ? 'bg-[#15629E]'
        : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
    }`}
  >
    <span
      className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-xs transition-transform ${
        checked ? 'translate-x-5.5' : 'translate-x-1'
      }`}
    />
  </button>
);

/** Crisp vector portrait avatar for AI Tutor personas */
const TutorPersonaAvatar: React.FC<{ persona: AiTutorPersona; selected: boolean }> = ({
  persona,
  selected,
}) => (
  <div
    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 transition-colors overflow-hidden ${
      selected
        ? 'border-[#15629E] bg-[#E8F3FC]'
        : 'border-slate-200/80 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800'
    }`}
  >
    <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden="true">
      {/* Shoulders */}
      <path d="M12 64 C14 48, 22 44, 32 44 C42 44, 50 48, 52 64 Z" fill={persona.shirtColor} />
      {/* Collar / Shirt accent */}
      <path d="M26 44 L32 52 L38 44 Z" fill="#FFFFFF" opacity="0.88" />
      {/* Book held lightly */}
      <rect x="19" y="51" width="13" height="10" rx="2" fill="#0B2242" opacity="0.85" />
      <line x1="25.5" y1="51" x2="25.5" y2="61" stroke="#E0F2FE" strokeWidth="1" />
      {/* Neck */}
      <rect x="28" y="38" width="8" height="8" rx="3" fill={persona.skinTone} />
      {/* Hair back */}
      {persona.hairStyle === 'glasses-long' && (
        <path d="M17 24 C17 12, 47 12, 47 24 L48 42 C44 45, 20 45, 16 42 Z" fill={persona.hairColor} />
      )}
      {persona.hairStyle === 'bob' && (
        <path d="M18 24 C18 12, 46 12, 46 24 L46 37 C42 39, 22 39, 18 37 Z" fill={persona.hairColor} />
      )}
      {persona.hairStyle === 'bun' && (
        <>
          <circle cx="32" cy="11" r="7" fill={persona.hairColor} />
          <path d="M19 24 C19 14, 45 14, 45 24 Z" fill={persona.hairColor} />
        </>
      )}
      {persona.hairStyle === 'curly' && (
        <circle cx="32" cy="23" r="16" fill={persona.hairColor} />
      )}
      {persona.hairStyle === 'wavy' && (
        <path d="M18 25 C17 12, 47 12, 46 25 L47 38 C42 40, 22 40, 17 38 Z" fill={persona.hairColor} />
      )}
      {/* Head */}
      <circle cx="32" cy="26" r="12" fill={persona.skinTone} />
      {/* Hair top */}
      {(persona.hairStyle === 'short' || persona.hairStyle === 'fade') && (
        <path d="M20 23 C20 14, 44 14, 44 23 C40 19, 24 19, 20 23 Z" fill={persona.hairColor} />
      )}
      {persona.hairStyle === 'bald-beard' && (
        <path d="M22 29 C23 36, 41 36, 42 29 C38 33, 26 33, 22 29 Z" fill={persona.hairColor} />
      )}
      {(persona.hairStyle === 'glasses-long' || persona.hairStyle === 'bob' || persona.hairStyle === 'wavy') && (
        <path d="M20 23 C22 14, 42 14, 44 23 C38 19, 27 19, 20 23 Z" fill={persona.hairColor} />
      )}
      {/* Eyes */}
      <circle cx="27.5" cy="26" r="1.5" fill="#1E293B" />
      <circle cx="36.5" cy="26" r="1.5" fill="#1E293B" />
      {/* Glasses */}
      {persona.hasGlasses && (
        <g stroke="#1E293B" strokeWidth="1.2" fill="none">
          <circle cx="27.5" cy="26" r="3.6" />
          <circle cx="36.5" cy="26" r="3.6" />
          <line x1="31.1" y1="26" x2="32.9" y2="26" />
        </g>
      )}
      {/* Friendly Smile */}
      <path d="M28.5 31.5 Q32 34.5 35.5 31.5" stroke="#7C2D12" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  </div>
);

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  settings,
  onUpdateProfile,
  onUpdateSettings,
  onNotify,
}) => {
  const [subSection, setSubSection] = useState<SettingsSubSection>('overview');

  // Local draft states so "Save changes" / "Apply Changes" commits deliberately
  const [profileDraft, setProfileDraft] = useState(settings.profilePrefs);
  const [notifDraft, setNotifDraft] = useState(settings.notifications);
  const [a11yDraft, setA11yDraft] = useState(settings.accessibility);

  // Interactive inline UI states
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showTutorInfo, setShowTutorInfo] = useState(false);
  const [editingMobile, setEditingMobile] = useState(false);
  const [mobileInput, setMobileInput] = useState(settings.profilePrefs.mobileNumber);

  // Linked Parent inline UI states
  const [showAddParentForm, setShowAddParentForm] = useState(false);
  const [parentFormName, setParentFormName] = useState('');
  const [parentFormEmail, setParentFormEmail] = useState('');
  const [parentFormPhone, setParentFormPhone] = useState('');
  const [parentFormError, setParentFormError] = useState<string | null>(null);
  const [expandedPermissionsId, setExpandedPermissionsId] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  // Sync drafts whenever switching sub-sections
  useEffect(() => {
    setProfileDraft(settings.profilePrefs);
    setMobileInput(settings.profilePrefs.mobileNumber);
    setNotifDraft(settings.notifications);
    setA11yDraft(settings.accessibility);
  }, [subSection, settings]);

  const nameParts = profile.fullName.trim().split(/\s+/);
  const firstNameDisplay = nameParts[0] || profile.firstName;
  const lastNameDisplay = nameParts.slice(1).join(' ') || 'Carter';

  const activeAvatarOption =
    STUDENT_AVATAR_OPTIONS.find((opt) => opt.id === profileDraft.avatarId) ||
    STUDENT_AVATAR_OPTIONS[0];

  const handleSaveProfilePrefs = () => {
    playUiSound('success');
    const updatedPrefs = {
      ...profileDraft,
      lastUpdatedLabel: 'Updated just now',
    };
    onUpdateSettings({
      ...settings,
      profilePrefs: updatedPrefs,
    });
    // Keep student profile subjects and learning style synced across the app
    const mappedPrimaryStyle: StudentProfile['learningStyle'] = updatedPrefs.learningStyles.includes('visual')
      ? 'Visual'
      : updatedPrefs.learningStyles.includes('practice')
      ? 'Practice-First'
      : 'Interactive';
    onUpdateProfile({
      ...profile,
      learningStyle: mappedPrimaryStyle,
      subjects:
        updatedPrefs.learningInterests.length > 0
          ? updatedPrefs.learningInterests.slice(0, 5)
          : profile.subjects,
    });
    onNotify('Profile & learning preferences saved!');
  };

  const handleSaveMobileNumber = () => {
    const cleaned = mobileInput.replace(/[^\d-\s]/g, '').trim();
    if (cleaned.replace(/\D/g, '').length < 7) {
      onNotify('Please enter a valid 7+ digit mobile number.');
      return;
    }
    playUiSound('success');
    setProfileDraft((prev) => ({
      ...prev,
      mobileNumber: cleaned,
      mobileVerified: true,
    }));
    setEditingMobile(false);
    onNotify('Mobile number updated and verified.');
  };

  const handleSaveNotifications = () => {
    playUiSound('success');
    onUpdateSettings({
      ...settings,
      notifications: notifDraft,
    });
    onNotify('Notification preferences saved!');
  };

  const handleApplyNotificationPreset = (preset: NotificationPreset) => {
    playUiSound('click');
    setNotifDraft((prev) => applyNotificationPreset(prev, preset));
  };

  const handleAddParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAddParentInput({
      name: parentFormName,
      email: parentFormEmail,
      phone: parentFormPhone,
      existingCount: settings.linkedParents.length,
    });
    if (!validation.valid) {
      setParentFormError(validation.error || 'Please fill out all required fields.');
      return;
    }
    playUiSound('success');
    const newParent = createLinkedParentRecord(
      { name: parentFormName, email: parentFormEmail, phone: parentFormPhone },
      settings.linkedParents.length
    );
    onUpdateSettings({
      ...settings,
      linkedParents: [...settings.linkedParents, newParent],
    });
    setParentFormName('');
    setParentFormEmail('');
    setParentFormPhone('');
    setParentFormError(null);
    setShowAddParentForm(false);
    onNotify(`${newParent.name} linked as ${newParent.role}.`);
  };

  const handleRevokeParent = (parentId: string) => {
    playUiSound('click');
    const target = settings.linkedParents.find((p) => p.id === parentId);
    onUpdateSettings({
      ...settings,
      linkedParents: settings.linkedParents.filter((p) => p.id !== parentId),
    });
    setConfirmRevokeId(null);
    if (target) {
      onNotify(`Revoked access for ${target.name}.`);
    }
  };

  const handleSyncParent = (parentId: string) => {
    playUiSound('subtle');
    onUpdateSettings({
      ...settings,
      linkedParents: settings.linkedParents.map((p) =>
        p.id === parentId ? { ...p, lastSynced: 'Last synced: Just now' } : p
      ),
    });
    onNotify('Parent progress summary synced.');
  };

  const handleLogoutDevice = (deviceId: string) => {
    const dev = settings.devices.find((d) => d.id === deviceId);
    playUiSound('click');
    onUpdateSettings({
      ...settings,
      devices: logoutSingleDevice(settings.devices, deviceId),
    });
    if (dev) {
      onNotify(`Signed out of ${dev.name}.`);
    }
  };

  const handleLogoutAllOtherDevices = () => {
    playUiSound('click');
    const otherCount = settings.devices.filter((d) => !d.isCurrent).length;
    if (otherCount === 0) {
      onNotify('No other active devices to sign out.');
      return;
    }
    onUpdateSettings({
      ...settings,
      devices: logoutAllOtherDevices(settings.devices),
    });
    onNotify(`Signed out of ${otherCount} other ${otherCount === 1 ? 'device' : 'devices'}.`);
  };

  const handleApplyAccessibility = () => {
    playUiSound('success');
    onUpdateSettings({
      ...settings,
      accessibility: a11yDraft,
    });
    onNotify('Accessibility & interface settings applied!');
  };

  // ============================================================================
  // VIEW 1: SETTINGS OVERVIEW HUB
  // ============================================================================
  if (subSection === 'overview') {
    const overviewItems: {
      id: Exclude<SettingsSubSection, 'overview'>;
      title: string;
      description: string;
      meta: string;
      icon: React.ReactNode;
    }[] = [
      {
        id: 'profile',
        title: 'Profile & Preferences',
        description: 'Edit name, avatar, and learning preferences',
        meta: settings.profilePrefs.lastUpdatedLabel,
        icon: <User className="h-5 w-5" aria-hidden="true" />,
      },
      {
        id: 'notifications',
        title: 'Notifications',
        description: 'Choose how you receive alerts',
        meta: summarizeNotifications(settings.notifications),
        icon: <Bell className="h-5 w-5" aria-hidden="true" />,
      },
      {
        id: 'linked-parent',
        title: 'Linked Parent',
        description: 'Manage parent connections and control what progress information they can view.',
        meta: summarizeLinkedParents(settings.linkedParents),
        icon: <Users className="h-5 w-5" aria-hidden="true" />,
      },
      {
        id: 'devices',
        title: 'Device Management',
        description: 'View and manage signed-in devices',
        meta: summarizeDevices(settings.devices),
        icon: <Laptop className="h-5 w-5" aria-hidden="true" />,
      },
      {
        id: 'accessibility',
        title: 'Accessibility & Interface',
        description: 'Adjust your study environment',
        meta: summarizeAccessibility(settings.accessibility),
        icon: <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />,
      },
    ];

    return (
      <div data-testid="settings-overview" className="space-y-5">
        {/* Top Banner Header matching attached layout in TutorCloud blue */}
        <section className="rounded-2xl border border-[#15629E]/15 bg-[#EBF4FC] dark:bg-slate-900 dark:border-slate-800 px-6 py-5">
          <h1 className="font-display text-[22px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Settings
          </h1>
          <p className="mt-1 text-[13.5px] text-slate-600 dark:text-slate-400 max-w-2xl">
            Manage your learning profile, notifications, devices, and accessibility preferences.
          </p>
        </section>

        {/* Main 5-Row Navigation Card */}
        <section
          aria-label="Settings categories"
          className="rounded-[22px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.04)] overflow-hidden divide-y divide-slate-100 dark:divide-slate-800"
        >
          {overviewItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                playUiSound('click');
                setSubSection(item.id);
              }}
              className="group w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[#F5F9FE] dark:hover:bg-slate-800/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#15629E]"
            >
              <div className="flex items-start gap-4 min-w-0">
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EBF4FC] dark:bg-[#15629E]/20 text-[#15629E] dark:text-sky-300 group-hover:bg-[#15629E] group-hover:text-white transition-colors">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-[15.5px] font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {item.title}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="mt-1.5 text-[12px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                    {item.meta}
                  </p>
                </div>
              </div>
              <ChevronRight
                className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-[#15629E] group-hover:translate-x-0.5 transition-all"
                aria-hidden="true"
              />
            </button>
          ))}
        </section>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: PROFILE & PREFERENCES
  // ============================================================================
  if (subSection === 'profile') {
    const learningStyleCards: {
      id: LearningStyleOption;
      title: string;
      subtitle: string;
      icon: React.ReactNode;
    }[] = [
      {
        id: 'visual',
        title: 'Visual',
        subtitle: 'Charts & Diagrams',
        icon: <BarChart3 className="h-5 w-5 text-[#15629E]" aria-hidden="true" />,
      },
      {
        id: 'auditory',
        title: 'Auditory',
        subtitle: 'Narration & Voice',
        icon: <Headphones className="h-5 w-5 text-[#15629E]" aria-hidden="true" />,
      },
      {
        id: 'practice',
        title: 'Practice-based',
        subtitle: 'Quizzes & Tasks',
        icon: <PenTool className="h-5 w-5 text-[#15629E]" aria-hidden="true" />,
      },
    ];

    const goalFocusCards: {
      id: GoalFocusOption;
      title: string;
      subtitle: string;
      icon: React.ReactNode;
    }[] = [
      {
        id: 'concept-mastery',
        title: 'Concept Mastery',
        subtitle: 'Build deep understanding',
        icon: <BookOpen className="h-5 w-5 text-[#15629E]" aria-hidden="true" />,
      },
      {
        id: 'exam-prep',
        title: 'Exam Preparation',
        subtitle: 'Ace upcoming tests',
        icon: <Rocket className="h-5 w-5 text-[#15629E]" aria-hidden="true" />,
      },
      {
        id: 'homework-support',
        title: 'Homework Support',
        subtitle: 'Daily assignments & tasks',
        icon: <Target className="h-5 w-5 text-[#15629E]" aria-hidden="true" />,
      },
    ];

    return (
      <div data-testid="settings-profile" className="space-y-5">
        {/* Subpage Header Bar */}
        <section className="rounded-2xl border border-[#15629E]/15 bg-[#EBF4FC] dark:bg-slate-900 dark:border-slate-800 px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              type="button"
              onClick={() => {
                playUiSound('click');
                setSubSection('overview');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back</span>
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-[19px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Profile &amp; Preferences
              </h1>
              <p className="text-[12.5px] text-slate-600 dark:text-slate-400">
                Customize your learning identity
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveProfilePrefs}
            className="bencho-press inline-flex items-center gap-1.5 rounded-xl bg-[#15629E] hover:bg-[#104E7E] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            <span>Save changes</span>
          </button>
        </section>

        {/* Card 1: Personal Information */}
        <section className="rounded-[22px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-6">
          <div className="flex items-center gap-2.5">
            <User className="h-4.5 w-4.5 text-[#15629E]" aria-hidden="true" />
            <h2 className="font-display text-[15.5px] font-bold text-slate-900 dark:text-slate-100">
              Personal Information
            </h2>
          </div>

          {/* Profile Avatar Row */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  playUiSound('click');
                  setShowAvatarPicker((v) => !v);
                }}
                aria-label="Change profile avatar"
                className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#15629E]/35 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
                style={{ backgroundColor: activeAvatarOption.bg }}
              >
                <GraduationCap
                  className="h-8 w-8"
                  style={{ color: activeAvatarOption.accent }}
                  aria-hidden="true"
                />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#15629E] text-white ring-2 ring-white dark:ring-slate-900">
                  <Camera className="h-3 w-3" aria-hidden="true" />
                </span>
              </button>
              <div>
                <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">
                  Profile Avatar
                </p>
                <button
                  type="button"
                  onClick={() => {
                    playUiSound('click');
                    setShowAvatarPicker((v) => !v);
                  }}
                  className="text-[12.5px] font-medium text-[#15629E] hover:underline"
                >
                  Click to change avatar
                </button>
              </div>
            </div>

            {showAvatarPicker && (
              <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 p-3">
                {STUDENT_AVATAR_OPTIONS.map((opt) => {
                  const active = profileDraft.avatarId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        playUiSound('click');
                        setProfileDraft((prev) => ({ ...prev, avatarId: opt.id }));
                        setShowAvatarPicker(false);
                      }}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? 'border-[#15629E] bg-white dark:bg-slate-900 text-[#15629E]'
                          : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-[#15629E]/50'
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-black/10"
                        style={{ backgroundColor: opt.accent }}
                        aria-hidden="true"
                      />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2-Column Read-only & Editable Identity Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="settings-first-name"
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                <span>First Name</span>
                <Lock className="h-3 w-3 text-slate-400" aria-hidden="true" />
              </label>
              <input
                id="settings-first-name"
                type="text"
                readOnly
                value={firstNameDisplay}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-[13.5px] text-slate-700 dark:text-slate-300 cursor-not-allowed"
              />
              <p className="mt-1 text-[11.5px] text-slate-500">Managed by your school</p>
            </div>

            <div>
              <label
                htmlFor="settings-last-name"
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                <span>Last Name</span>
                <Lock className="h-3 w-3 text-slate-400" aria-hidden="true" />
              </label>
              <input
                id="settings-last-name"
                type="text"
                readOnly
                value={lastNameDisplay}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-[13.5px] text-slate-700 dark:text-slate-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="settings-grade"
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                <span>Grade</span>
                <Lock className="h-3 w-3 text-slate-400" aria-hidden="true" />
              </label>
              <input
                id="settings-grade"
                type="text"
                readOnly
                value={`Grade ${profile.grade}`}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-[13.5px] text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="settings-student-id"
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                <span>Student ID</span>
                <Lock className="h-3 w-3 text-slate-400" aria-hidden="true" />
              </label>
              <input
                id="settings-student-id"
                type="text"
                readOnly
                value={profileDraft.studentId}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-[13.5px] font-mono tabular-nums text-slate-700 dark:text-slate-300 cursor-not-allowed"
              />
              <p className="mt-1 text-[11.5px] text-slate-500">School-provided identifier</p>
            </div>

            <div>
              <label
                htmlFor="settings-timezone"
                className="block text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Timezone
              </label>
              <select
                id="settings-timezone"
                value={profileDraft.timezone}
                onChange={(e) =>
                  setProfileDraft((prev) => ({ ...prev, timezone: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-[13.5px] text-slate-800 dark:text-slate-100 focus:border-[#15629E] focus:outline-none focus:ring-2 focus:ring-[#15629E]/20"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="settings-school-id"
                className="block text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                School ID
              </label>
              <input
                id="settings-school-id"
                type="text"
                readOnly
                value={profileDraft.schoolId}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-[13.5px] font-mono tabular-nums text-slate-700 dark:text-slate-300 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Mobile Number Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-[#15629E]" aria-hidden="true" />
              <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                Mobile Number
              </span>
              {profileDraft.mobileVerified && (
                <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {editingMobile ? (
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <span className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                    {profileDraft.mobileCountryCode}
                  </span>
                  <input
                    type="tel"
                    aria-label="Mobile number"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value)}
                    className="flex-1 min-w-[180px] max-w-xs rounded-xl border border-[#15629E] bg-white dark:bg-slate-800 px-3.5 py-2 text-[13.5px] font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#15629E]/20"
                  />
                  <button
                    type="button"
                    onClick={handleSaveMobileNumber}
                    className="rounded-xl bg-[#15629E] hover:bg-[#104E7E] px-3.5 py-2 text-xs font-semibold text-white transition-colors"
                  >
                    Verify &amp; Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileInput(profileDraft.mobileNumber);
                      setEditingMobile(false);
                    }}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 px-3.5 py-2 text-[13.5px] font-mono tabular-nums text-slate-700 dark:text-slate-200">
                    <span className="text-slate-400">{profileDraft.mobileCountryCode}</span>
                    <span>{profileDraft.mobileNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      setEditingMobile(true);
                    }}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-colors whitespace-nowrap"
                  >
                    Edit Number
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/75 dark:bg-emerald-950/30 px-4 py-2.5 text-[12.5px] font-medium text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>Your mobile number is verified and secure</span>
            </div>
          </div>
        </section>

        {/* Card 2: Learning Preferences */}
        <section className="rounded-[22px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-7">
          <div>
            <h2 className="font-display text-[15.5px] font-bold text-slate-900 dark:text-slate-100">
              Learning Preferences
            </h2>
          </div>

          {/* Tutor Profile Grid */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-slate-100">
                Tutor Profile
              </h3>
              <button
                type="button"
                onClick={() => setShowTutorInfo((v) => !v)}
                aria-label="About AI Tutor Profile"
                aria-expanded={showTutorInfo}
                className="rounded-full p-0.5 text-slate-400 hover:text-[#15629E] transition-colors"
              >
                <Info className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="text-[13px] text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Choose how your AI Tutor appears during learning sessions. Your selected tutor name
              and avatar will appear during tutoring conversations, practice sessions, and AI
              learning activities.
            </p>
            {showTutorInfo && (
              <p className="rounded-xl bg-[#EBF4FC] dark:bg-slate-800 px-3.5 py-2.5 text-[12px] text-[#0B2242] dark:text-sky-200">
                All AI tutors share the same TutorCloud pedagogy and safety standards—pick whichever
                companion feels most encouraging to learn with.
              </p>
            )}

            <div
              role="radiogroup"
              aria-label="Choose your AI Tutor"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 pt-1"
            >
              {AI_TUTOR_PERSONAS.map((persona) => {
                const selected = profileDraft.tutorId === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      playUiSound('click');
                      setProfileDraft((prev) => ({ ...prev, tutorId: persona.id }));
                    }}
                    className={`relative flex flex-col items-center rounded-2xl border p-4 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
                      selected
                        ? 'border-[#15629E] bg-[#F2F8FE] dark:bg-[#15629E]/15 shadow-[0_4px_14px_rgba(21,98,158,0.12)]'
                        : 'border-slate-200/90 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 hover:border-[#15629E]/50 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    {selected && (
                      <span
                        aria-hidden="true"
                        className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#15629E] text-white"
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                    <TutorPersonaAvatar persona={persona} selected={selected} />
                    <span
                      className={`mt-3 w-full rounded-lg px-2 py-1 text-[13px] font-bold transition-colors ${
                        selected
                          ? 'bg-[#15629E] text-white'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {persona.name}
                    </span>
                    <span className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {persona.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Learning Style (Select one or more) */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-[13.5px] font-bold text-slate-900 dark:text-slate-100">
              Learning Style (Select one or more)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {learningStyleCards.map((card) => {
                const selected = profileDraft.learningStyles.includes(card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      playUiSound('click');
                      setProfileDraft((prev) => ({
                        ...prev,
                        learningStyles: toggleArraySelection(prev.learningStyles, card.id, 1),
                      }));
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-4 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
                      selected
                        ? 'border-[#15629E] bg-[#F2F8FE] dark:bg-[#15629E]/15 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-[#15629E]/50'
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF4FC] dark:bg-slate-800">
                      {card.icon}
                    </span>
                    <span className="text-[13.5px] font-bold text-slate-900 dark:text-slate-100">
                      {card.title}
                    </span>
                    <span className="text-[12px] text-slate-500 dark:text-slate-400">
                      {card.subtitle}
                    </span>
                    <span
                      className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                        selected
                          ? 'border-[#15629E] bg-[#15629E] text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {selected && <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Goal Focus */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-[13.5px] font-bold text-slate-900 dark:text-slate-100">
              Goal Focus
            </h3>
            <div
              role="radiogroup"
              aria-label="Goal Focus"
              className="grid grid-cols-1 sm:grid-cols-3 gap-3.5"
            >
              {goalFocusCards.map((card) => {
                const selected = profileDraft.goalFocus === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      playUiSound('click');
                      setProfileDraft((prev) => ({ ...prev, goalFocus: card.id }));
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-4 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
                      selected
                        ? 'border-[#15629E] bg-[#F2F8FE] dark:bg-[#15629E]/15 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-[#15629E]/50'
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF4FC] dark:bg-slate-800">
                      {card.icon}
                    </span>
                    <span className="text-[13.5px] font-bold text-slate-900 dark:text-slate-100">
                      {card.title}
                    </span>
                    <span className="text-[12px] text-slate-500 dark:text-slate-400">
                      {card.subtitle}
                    </span>
                    <span
                      className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                        selected
                          ? 'border-[#15629E] bg-[#15629E] text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {selected && <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Learning Interests */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-slate-100">
                Learning Interests
              </h3>
              <p className="mt-0.5 text-[12.5px] text-slate-500 dark:text-slate-400">
                Choose subjects you want more learning support and recommendations for.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {LEARNING_INTEREST_SUBJECTS.map((subj) => {
                const selected = profileDraft.learningInterests.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      playUiSound('click');
                      setProfileDraft((prev) => ({
                        ...prev,
                        learningInterests: toggleArraySelection(prev.learningInterests, subj, 1),
                      }));
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
                      selected
                        ? 'border-[#15629E] bg-[#15629E] text-white'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#15629E]/50 hover:bg-[#F2F8FE]'
                    }`}
                  >
                    <span>{subj}</span>
                    {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ============================================================================
  // VIEW 3: NOTIFICATIONS
  // ============================================================================
  if (subSection === 'notifications') {
    const activePreset = detectNotificationPreset(notifDraft);

    const topicRows: {
      key: 'learningUpdates' | 'achievements' | 'aiChallenges' | 'messages';
      title: string;
      subtitle: string;
      example: string;
      required?: boolean;
    }[] = [
      {
        key: 'learningUpdates',
        title: 'Learning Updates',
        subtitle: 'Session reminders and quiz results',
        example: '"Your session starts in 15 minutes!"',
      },
      {
        key: 'achievements',
        title: 'Achievements',
        subtitle: 'Badges, streaks, and XP milestones',
        example: '"Your new badge is ready!"',
      },
      {
        key: 'aiChallenges',
        title: 'AI Challenges',
        subtitle: 'New goals and upcoming deadlines',
        example: '"Complete 3 more quizzes to reach your weekly goal!"',
      },
      {
        key: 'messages',
        title: 'Messages',
        subtitle: 'Feedback and announcements',
        example: '"Your teacher left you feedback on your essay"',
        required: true,
      },
    ];

    return (
      <div data-testid="settings-notifications" className="space-y-5">
        {/* Subpage Header Bar */}
        <section className="rounded-2xl border border-[#15629E]/15 bg-[#EBF4FC] dark:bg-slate-900 dark:border-slate-800 px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              type="button"
              onClick={() => {
                playUiSound('click');
                setSubSection('overview');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back</span>
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-[19px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Notifications
              </h1>
              <p className="text-[12.5px] text-slate-600 dark:text-slate-400">
                Choose how you receive alerts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveNotifications}
            className="bencho-press inline-flex items-center gap-1.5 rounded-xl bg-[#15629E] hover:bg-[#104E7E] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            <span>Save changes</span>
          </button>
        </section>

        {/* Card 1: Notification Channels */}
        <section className="rounded-[22px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-[15.5px] font-bold text-slate-900 dark:text-slate-100">
              <Bell className="h-4.5 w-4.5 text-[#15629E]" aria-hidden="true" />
              <span>Notification Channels</span>
            </h2>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              Choose where you want to receive notifications
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                key: 'inApp' as const,
                title: 'In-App Notifications',
                subtitle: 'See notifications within the platform',
                icon: <Bell className="h-4.5 w-4.5 text-[#15629E]" aria-hidden="true" />,
              },
              {
                key: 'email' as const,
                title: 'Email',
                subtitle: 'Receive updates via email',
                icon: <Mail className="h-4.5 w-4.5 text-[#15629E]" aria-hidden="true" />,
              },
              {
                key: 'mobilePush' as const,
                title: 'Mobile Push',
                subtitle: 'Get notifications on your mobile device',
                icon: <Smartphone className="h-4.5 w-4.5 text-[#15629E]" aria-hidden="true" />,
              },
            ].map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 px-4 py-3.5"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF4FC] dark:bg-[#15629E]/20">
                    {row.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-slate-900 dark:text-slate-100">
                      {row.title}
                    </p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">{row.subtitle}</p>
                  </div>
                </div>
                <SettingsSwitch
                  checked={notifDraft.channels[row.key]}
                  ariaLabel={`Toggle ${row.title}`}
                  onChange={(next) =>
                    setNotifDraft((prev) => ({
                      ...prev,
                      channels: { ...prev.channels, [row.key]: next },
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </section>

        {/* Card 2: What to Get Notified About */}
        <section className="rounded-[22px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-4">
          <div>
            <h2 className="font-display text-[15.5px] font-bold text-slate-900 dark:text-slate-100">
              What to Get Notified About
            </h2>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              Select the types of updates you want to receive
            </p>
          </div>

          <div className="space-y-3.5">
            {topicRows.map((row) => (
              <div
                key={row.key}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-slate-900 dark:text-slate-100">
                      <span>{row.title}</span>
                      {row.required && (
                        <Lock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      )}
                    </p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">{row.subtitle}</p>
                  </div>

                  <SettingsSwitch
                    checked={notifDraft.topics[row.key]}
                    disabled={row.required}
                    ariaLabel={`Toggle ${row.title}`}
                    onChange={(next) => {
                      if (row.required) return;
                      setNotifDraft((prev) => ({
                        ...prev,
                        topics: { ...prev.topics, [row.key]: next },
                      }));
                    }}
                  />
                </div>

                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 px-3.5 py-2.5">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Example:
                  </p>
                  <p className="mt-0.5 text-[12.5px] italic text-slate-700 dark:text-slate-200">
                    {row.example}
                  </p>
                </div>

                {row.required && (
                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                    This notification is required by your school
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Card 3: Quick Presets */}
        <section className="rounded-2xl border border-[#15629E]/20 bg-[#EEF6FD] dark:bg-slate-900 dark:border-slate-800 p-5 space-y-3">
          <h2 className="font-display text-[14.5px] font-bold text-slate-900 dark:text-slate-100">
            Quick Presets
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {(
              [
                { id: 'all', label: 'Enable All' },
                { id: 'minimal', label: 'Minimal (School-required only)' },
                { id: 'achievements', label: 'Achievements Only' },
              ] as { id: NotificationPreset; label: string }[]
            ).map((preset) => {
              const active = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleApplyNotificationPreset(preset.id)}
                  className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? 'border-[#15629E] bg-[#15629E] text-white shadow-xs'
                      : 'border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#15629E]/60'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // ============================================================================
  // VIEW 4: LINKED PARENT
  // ============================================================================
  if (subSection === 'linked-parent') {
    const atGuardianLimit = settings.linkedParents.length >= 2;

    return (
      <div data-testid="settings-linked-parent" className="space-y-5">
        {/* Subpage Header Bar */}
        <section className="rounded-2xl border border-[#15629E]/15 bg-[#EBF4FC] dark:bg-slate-900 dark:border-slate-800 px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              type="button"
              onClick={() => {
                playUiSound('click');
                setSubSection('overview');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back</span>
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-[19px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Linked Parent
              </h1>
              <p className="text-[12.5px] text-slate-600 dark:text-slate-400">
                Manage parent connections and control what progress information they can view.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={atGuardianLimit}
            onClick={() => {
              playUiSound('click');
              setShowAddParentForm((v) => !v);
              setParentFormError(null);
            }}
            className="bencho-press inline-flex items-center gap-1.5 rounded-xl bg-[#15629E] hover:bg-[#104E7E] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Parent</span>
          </button>
        </section>

        {/* Inline Add Parent Form */}
        {showAddParentForm && (
          <form
            onSubmit={handleAddParentSubmit}
            className="rounded-[22px] border border-[#15629E]/30 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
                {settings.linkedParents.length === 0
                  ? 'Link Primary Parent / Guardian'
                  : 'Add Secondary Parent / Guardian'}
              </h2>
              <button
                type="button"
                onClick={() => setShowAddParentForm(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label
                  htmlFor="add-parent-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="add-parent-name"
                  type="text"
                  value={parentFormName}
                  onChange={(e) => setParentFormName(e.target.value)}
                  placeholder="e.g. Sarah Carter"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[#15629E] focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="add-parent-email"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Parent Email
                </label>
                <input
                  id="add-parent-email"
                  type="email"
                  value={parentFormEmail}
                  onChange={(e) => setParentFormEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[#15629E] focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="add-parent-phone"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="add-parent-phone"
                  type="tel"
                  value={parentFormPhone}
                  onChange={(e) => setParentFormPhone(e.target.value)}
                  placeholder="+1 415 555 8899"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-[#15629E] focus:outline-none"
                />
              </div>
            </div>
            {parentFormError && (
              <p role="alert" className="text-xs font-semibold text-red-600">
                {parentFormError}
              </p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-[#15629E] hover:bg-[#104E7E] px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                Send Invite &amp; Link Parent
              </button>
            </div>
          </form>
        )}

        {/* Linked Parent Cards */}
        {settings.linkedParents.length === 0 ? (
          <section className="rounded-[22px] border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
            <Users className="mx-auto h-9 w-9 text-slate-400" aria-hidden="true" />
            <h2 className="font-display text-[15.5px] font-bold text-slate-900 dark:text-slate-100">
              No Linked Parents Yet
            </h2>
            <p className="text-[13px] text-slate-500 max-w-md mx-auto">
              Add a parent or guardian to share your progress summaries and milestone achievements.
            </p>
            <button
              type="button"
              onClick={() => setShowAddParentForm(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#15629E] hover:bg-[#104E7E] px-4 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Parent</span>
            </button>
          </section>
        ) : (
          <div className="space-y-4">
            {settings.linkedParents.map((parent) => (
              <section
                key={parent.id}
                className="rounded-[22px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border-2 border-[#15629E]/35 bg-[#EBF4FC] dark:bg-[#15629E]/20 font-display text-[16px] font-bold text-[#15629E] dark:text-sky-300">
                    {parent.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="font-display text-[16px] font-bold text-slate-900 dark:text-slate-100">
                        {parent.name}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{parent.status}</span>
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] font-semibold text-[#15629E] dark:text-sky-300">
                      {parent.role}
                    </p>
                  </div>
                </div>

                {/* Contact & Date Metadata Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[13px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                    <span className="truncate">{parent.maskedEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                    <span className="tabular-nums">{parent.maskedPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                    <span>{parent.linkedDate}</span>
                  </div>
                </div>

                {/* Last Synced Bar */}
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 px-4 py-2.5 text-[12.5px] text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span>{parent.lastSynced}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSyncParent(parent.id)}
                    className="text-xs font-semibold text-[#15629E] hover:underline"
                  >
                    Sync now
                  </button>
                </div>

                {/* Action Row */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      setExpandedPermissionsId((curr) => (curr === parent.id ? null : parent.id));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#15629E] bg-[#F2F8FE] dark:bg-[#15629E]/15 hover:bg-[#E4F0FC] px-4 py-2 text-xs font-semibold text-[#15629E] dark:text-sky-300 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {expandedPermissionsId === parent.id
                        ? 'Hide Permissions'
                        : 'View Permissions'}
                    </span>
                  </button>

                  {confirmRevokeId === parent.id ? (
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRevokeParent(parent.id)}
                        className="rounded-xl bg-red-600 hover:bg-red-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
                      >
                        Confirm Revoke
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRevokeId(null)}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        playUiSound('click');
                        setConfirmRevokeId(parent.id);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/30 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors"
                    >
                      <UserMinus className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Revoke Access</span>
                    </button>
                  )}
                </div>

                {expandedPermissionsId === parent.id && (
                  <div className="rounded-xl border border-[#15629E]/20 bg-[#F5F9FE] dark:bg-slate-800/70 p-4 text-[12.5px] text-slate-700 dark:text-slate-300 space-y-1.5">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Access Scope for {parent.name} ({parent.role})
                    </p>
                    <p>
                      {parent.role === 'Primary Parent'
                        ? 'Receives real-time learning alerts, weekly mastery summaries, and badge updates. Read-only access.'
                        : 'Receives weekly progress summary views only. Cannot modify account settings or view private AI chat threads.'}
                    </p>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        {/* Card 2: What Your Parent Can See */}
        <section className="rounded-[22px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#15629E]/25 bg-[#EBF4FC] dark:bg-[#15629E]/20 text-[#15629E] dark:text-sky-300">
              <Shield className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="space-y-3">
              <h2 className="font-display text-[15.5px] font-bold text-slate-900 dark:text-slate-100">
                What Your Parent Can See
              </h2>
              <ul className="space-y-2 text-[13.5px] text-slate-700 dark:text-slate-300">
                {[
                  'Progress reports and mastery scores',
                  'Achievements and badges',
                  'Learning goals and summaries',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
                {[
                  'Private notes and creative projects (Hidden)',
                  'AI conversations and feedback threads (Hidden)',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <XCircle
                      className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="pt-1 text-[12.5px] italic text-slate-500 dark:text-slate-400">
                Your parent can see your progress but cannot edit or message within your account.
              </p>
            </div>
          </div>
        </section>

        {/* Dual Guardian Support Info Banner */}
        <section className="flex items-start gap-3 rounded-2xl border border-[#15629E]/25 bg-[#EEF6FD] dark:bg-slate-900 dark:border-slate-800 px-5 py-4 text-[13px] text-slate-700 dark:text-slate-300">
          <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#15629E] dark:text-sky-300" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-slate-900 dark:text-slate-100">
              Dual Guardian Support:
            </strong>{' '}
            You can add a second parent if your school allows it. The primary parent receives all
            notifications, while the secondary parent gets summary views only.
          </p>
        </section>
      </div>
    );
  }

  // ============================================================================
  // VIEW 5: DEVICE MANAGEMENT
  // ============================================================================
  if (subSection === 'devices') {
    const currentDevice = settings.devices.find((d) => d.isCurrent);
    const otherDevices = settings.devices.filter((d) => !d.isCurrent);

    return (
      <div data-testid="settings-devices" className="space-y-5">
        {/* Subpage Header Bar */}
        <section className="rounded-2xl border border-[#15629E]/15 bg-[#EBF4FC] dark:bg-slate-900 dark:border-slate-800 px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-[19px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Device Management
            </h1>
            <p className="text-[12.5px] text-slate-600 dark:text-slate-400">
              View and manage signed-in devices
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                playUiSound('click');
                setSubSection('overview');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={otherDevices.length === 0}
              onClick={handleLogoutAllOtherDevices}
              className="bencho-press inline-flex items-center gap-1.5 rounded-xl bg-[#15629E] hover:bg-[#104E7E] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Logout All Other</span>
            </button>
          </div>
        </section>

        {/* Current Device Section */}
        {currentDevice && (
          <section className="space-y-2.5">
            <h2 className="text-[13.5px] font-semibold text-slate-700 dark:text-slate-300">
              Current Device
            </h2>
            <div className="rounded-2xl border-2 border-[#15629E] bg-white dark:bg-slate-900 p-5 shadow-[0_2px_12px_rgba(21,98,158,0.08)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Monitor className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-display text-[15.5px] font-bold text-slate-900 dark:text-slate-100">
                      {currentDevice.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{currentDevice.status}</span>
                    </span>
                  </div>
                  <p className="text-[12.5px] text-slate-600 dark:text-slate-400">
                    {currentDevice.browser} · {currentDevice.os}
                  </p>
                  <p className="flex items-center gap-1.5 text-[12.5px] text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span>{currentDevice.location}</span>
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{currentDevice.lastActive}</span>
              </span>
            </div>
          </section>
        )}

        {/* Other Devices Section */}
        <section className="space-y-3">
          <h2 className="text-[13.5px] font-semibold text-slate-700 dark:text-slate-300">
            Other Devices
          </h2>

          {otherDevices.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center space-y-1.5">
              <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600" aria-hidden="true" />
              <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">
                No other active devices signed in
              </p>
              <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
                Your TutorCloud account is currently only signed in on this device.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {otherDevices.map((device) => (
                <div
                  key={device.id}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex flex-wrap items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${
                        device.status === 'Active' ? 'bg-[#15629E]' : 'bg-slate-400 dark:bg-slate-600'
                      }`}
                    >
                      {device.type === 'phone' ? (
                        <Smartphone className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Monitor className="h-5 w-5" aria-hidden="true" />
                      )}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
                          {device.name}
                        </h3>
                        <span
                          className={`text-[12px] font-semibold ${
                            device.status === 'Active'
                              ? 'text-[#15629E] dark:text-sky-300'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {device.status}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-slate-600 dark:text-slate-400">
                        {device.browser} · {device.os}
                      </p>
                      <p className="flex items-center gap-1.5 text-[12.5px] text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        <span>{device.location}</span>
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleLogoutDevice(device.id)}
                          aria-label={`Log Out ${device.name}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/30 px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Log Out This Device</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-500 dark:text-slate-400 tabular-nums">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{device.lastActive}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Security Tips Card */}
        <section className="rounded-2xl border border-[#15629E]/25 bg-[#EEF6FD] dark:bg-slate-900 dark:border-slate-800 p-5 space-y-3">
          <h2 className="font-display text-[14.5px] font-bold text-slate-900 dark:text-slate-100">
            Security Tips
          </h2>
          <ul className="space-y-2 text-[13px] text-slate-700 dark:text-slate-300">
            {[
              "Log out from devices you don't recognize or no longer use",
              'Always log out from shared or public computers',
              'Review your active devices regularly to keep your account secure',
            ].map((tip) => (
              <li key={tip} className="flex items-center gap-2.5">
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-[#15629E] dark:text-sky-300"
                  aria-hidden="true"
                />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  // ============================================================================
  // VIEW 6: ACCESSIBILITY & INTERFACE
  // ============================================================================
  const previewTextPx = getTextSizePx(a11yDraft.textSize);
  const previewDark =
    a11yDraft.theme === 'dark' ||
    (a11yDraft.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  const activeA11yFeatures = resolveActiveAccessibilityFeatures(a11yDraft);

  const previewColorFilter =
    a11yDraft.colorBlindMode === 'protanopia'
      ? 'saturate(0.75) hue-rotate(-18deg)'
      : a11yDraft.colorBlindMode === 'deuteranopia'
      ? 'saturate(0.75) hue-rotate(18deg)'
      : a11yDraft.colorBlindMode === 'tritanopia'
      ? 'saturate(0.8) hue-rotate(140deg)'
      : undefined;

  return (
    <div data-testid="settings-accessibility" className="space-y-5">
      {/* Subpage Header Bar */}
      <section className="rounded-2xl border border-[#15629E]/15 bg-[#EBF4FC] dark:bg-slate-900 dark:border-slate-800 px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-[19px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Accessibility &amp; Interface
          </h1>
          <p className="text-[12.5px] text-slate-600 dark:text-slate-400">
            Adjust your study environment
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              setSubSection('overview');
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={handleApplyAccessibility}
            className="bencho-press inline-flex items-center gap-1.5 rounded-xl bg-[#15629E] hover:bg-[#104E7E] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors whitespace-nowrap"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            <span>Apply Changes</span>
          </button>
        </div>
      </section>

      {/* Card 1: Text Size */}
      <section className="rounded-[22px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
            <Type className="h-4.5 w-4.5 text-[#15629E]" aria-hidden="true" />
            <span>Text Size</span>
          </h2>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
            Choose a comfortable reading size for all text throughout the application
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Text Size"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3.5"
        >
          {(
            [
              { id: 'small', label: 'Small (14px)', sizeClass: 'text-[14px]' },
              { id: 'medium', label: 'Medium (16px)', sizeClass: 'text-[16px]' },
              { id: 'large', label: 'Large (20px)', sizeClass: 'text-[20px]' },
            ] as { id: TextSizeOption; label: string; sizeClass: string }[]
          ).map((opt) => {
            const active = a11yDraft.textSize === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  playUiSound('click');
                  setA11yDraft((prev) => ({ ...prev, textSize: opt.id }));
                }}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-5 px-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
                  active
                    ? 'border-[#15629E] bg-[#F2F8FE] dark:bg-[#15629E]/15 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-[#15629E]/50'
                }`}
              >
                <span className={`font-display font-bold text-slate-900 dark:text-slate-100 ${opt.sizeClass}`}>
                  Aa
                </span>
                <span className="text-[12.5px] font-medium text-slate-600 dark:text-slate-300 tabular-nums">
                  {opt.label}
                </span>
                {active && (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#15629E]" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Card 2: Theme */}
      <section className="rounded-[22px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
            <Sun className="h-4.5 w-4.5 text-[#15629E]" aria-hidden="true" />
            <span>Theme</span>
          </h2>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
            Choose your preferred color scheme - affects the entire application
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Theme"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3.5"
        >
          {(
            [
              {
                id: 'light',
                label: 'Light',
                icon: <Sun className="h-5 w-5 text-[#15629E]" aria-hidden="true" />,
                iconBg: 'bg-white border border-slate-200',
              },
              {
                id: 'dark',
                label: 'Dark',
                icon: <Moon className="h-5 w-5 text-sky-200" aria-hidden="true" />,
                iconBg: 'bg-[#0B2242] border border-[#0B2242]',
              },
              {
                id: 'system',
                label: 'System',
                icon: <Monitor className="h-5 w-5 text-slate-700" aria-hidden="true" />,
                iconBg: 'bg-gradient-to-br from-white to-slate-300 border border-slate-300',
              },
            ] as {
              id: ThemeOption;
              label: string;
              icon: React.ReactNode;
              iconBg: string;
            }[]
          ).map((opt) => {
            const active = a11yDraft.theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  playUiSound('click');
                  setA11yDraft((prev) => ({ ...prev, theme: opt.id }));
                }}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border py-5 px-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
                  active
                    ? 'border-[#15629E] bg-[#F2F8FE] dark:bg-[#15629E]/15 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-[#15629E]/50'
                }`}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${opt.iconBg}`}>
                  {opt.icon}
                </span>
                <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                  {opt.label}
                </span>
                {active && (
                  <CheckCircle2 className="h-4 w-4 text-[#15629E]" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Card 3: Visual Accessibility */}
      <section className="rounded-[22px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-4">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
          <Eye className="h-4.5 w-4.5 text-[#15629E]" aria-hidden="true" />
          <span>Visual Accessibility</span>
        </h2>

        <div className="space-y-3">
          {/* High Contrast Mode */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 px-4 py-3.5">
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF4FC] dark:bg-[#15629E]/20 text-[#15629E]">
                <Eye className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-slate-900 dark:text-slate-100">
                  High Contrast Mode
                </p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400">
                  Enhance color contrast for better visibility
                </p>
              </div>
            </div>
            <SettingsSwitch
              checked={a11yDraft.highContrast}
              ariaLabel="Toggle High Contrast Mode"
              onChange={(next) => setA11yDraft((prev) => ({ ...prev, highContrast: next }))}
            />
          </div>

          {/* Color Blind Mode */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF4FC] dark:bg-[#15629E]/20 text-[#15629E]">
                <Palette className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[13.5px] font-semibold text-slate-900 dark:text-slate-100">
                  Color Blind Mode
                </p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400">
                  Adjust colors for color vision deficiency
                </p>
              </div>
            </div>

            <div
              role="radiogroup"
              aria-label="Color Blind Mode"
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
            >
              {(
                [
                  { id: 'none', label: 'None' },
                  { id: 'protanopia', label: 'Protanopia (Red-blind)' },
                  { id: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
                  { id: 'tritanopia', label: 'Tritanopia (Blue-blind)' },
                ] as { id: ColorBlindMode; label: string }[]
              ).map((opt) => {
                const active = a11yDraft.colorBlindMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      playUiSound('click');
                      setA11yDraft((prev) => ({ ...prev, colorBlindMode: opt.id }));
                    }}
                    className={`rounded-xl border px-4 py-2.5 text-center text-[12.5px] font-semibold transition-colors ${
                      active
                        ? 'border-[#15629E] bg-[#F2F8FE] dark:bg-[#15629E]/15 text-[#15629E] dark:text-sky-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-[#15629E]/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Card 4: Motion & Interaction */}
      <section className="rounded-[22px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-4">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
          <Minimize2 className="h-4.5 w-4.5 text-[#15629E]" aria-hidden="true" />
          <span>Motion &amp; Interaction</span>
        </h2>

        <div className="space-y-3">
          {(
            [
              {
                key: 'reduceMotion',
                title: 'Reduce Motion',
                subtitle: 'Minimize animations and transitions',
                icon: <Minimize2 className="h-4.5 w-4.5 text-[#15629E]" aria-hidden="true" />,
              },
              {
                key: 'enhancedKeyboardNav',
                title: 'Enhanced Keyboard Navigation',
                subtitle: 'Optimize interface for keyboard-only navigation',
                icon: <Keyboard className="h-4.5 w-4.5 text-[#15629E]" aria-hidden="true" />,
              },
              {
                key: 'enhancedFocusIndicators',
                title: 'Enhanced Focus Indicators',
                subtitle: 'Show prominent outlines on focused elements',
                icon: <ScanEye className="h-4.5 w-4.5 text-[#15629E]" aria-hidden="true" />,
              },
            ] as {
              key: keyof Pick<
                AccessibilitySettings,
                'reduceMotion' | 'enhancedKeyboardNav' | 'enhancedFocusIndicators'
              >;
              title: string;
              subtitle: string;
              icon: React.ReactNode;
            }[]
          ).map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 px-4 py-3.5"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF4FC] dark:bg-[#15629E]/20">
                  {row.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-slate-900 dark:text-slate-100">
                    {row.title}
                  </p>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400">{row.subtitle}</p>
                </div>
              </div>
              <SettingsSwitch
                checked={a11yDraft[row.key]}
                ariaLabel={`Toggle ${row.title}`}
                onChange={(next) => setA11yDraft((prev) => ({ ...prev, [row.key]: next }))}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Card 5: Audio & Screen Reader */}
      <section className="rounded-[22px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-4">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
          <Volume2 className="h-4.5 w-4.5 text-[#15629E]" aria-hidden="true" />
          <span>Audio &amp; Screen Reader</span>
        </h2>

        <div className="space-y-3">
          {(
            [
              {
                key: 'voiceNarration',
                title: 'Voice Narration',
                subtitle: 'Enable AI voice for reading content aloud',
                icon: <Volume2 className="h-4.5 w-4.5 text-[#15629E]" aria-hidden="true" />,
              },
              {
                key: 'screenReaderOptimization',
                title: 'Screen Reader Optimization',
                subtitle: 'Enhanced ARIA labels and semantic structure',
                icon: <Headphones className="h-4.5 w-4.5 text-[#15629E]" aria-hidden="true" />,
              },
            ] as {
              key: keyof Pick<
                AccessibilitySettings,
                'voiceNarration' | 'screenReaderOptimization'
              >;
              title: string;
              subtitle: string;
              icon: React.ReactNode;
            }[]
          ).map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 px-4 py-3.5"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF4FC] dark:bg-[#15629E]/20">
                  {row.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-slate-900 dark:text-slate-100">
                    {row.title}
                  </p>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400">{row.subtitle}</p>
                </div>
              </div>
              <SettingsSwitch
                checked={a11yDraft[row.key]}
                ariaLabel={`Toggle ${row.title}`}
                onChange={(next) => setA11yDraft((prev) => ({ ...prev, [row.key]: next }))}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Card 6: Live Preview */}
      <section
        data-testid="accessibility-live-preview"
        style={{ filter: previewColorFilter }}
        className={`rounded-[22px] border p-6 space-y-5 transition-colors ${
          previewDark
            ? 'border-slate-700 bg-[#0B2242] text-slate-100'
            : a11yDraft.highContrast
            ? 'border-slate-900 bg-white text-slate-950'
            : 'border-slate-200/90 bg-white text-slate-900'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-[15px] font-bold">
            <Sparkles className="h-4.5 w-4.5 text-[#15629E] dark:text-sky-300" aria-hidden="true" />
            <span>Live Preview</span>
          </h2>
          <span className="text-[12px] font-semibold text-[#15629E] dark:text-sky-300 tabular-nums">
            {previewTextPx}px · {a11yDraft.theme} theme
          </span>
        </div>

        <p
          style={{ fontSize: `${previewTextPx}px`, lineHeight: 1.6 }}
          className={previewDark ? 'text-slate-100' : 'text-slate-800'}
        >
          This is how text will appear with your current settings. The quick brown fox jumps over
          the lazy dog. Text size and spacing scale proportionally throughout the application in
          real-time.
        </p>

        {/* Color Swatches */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {[
              { letter: 'P', cls: 'bg-[#15629E] text-white' },
              { letter: 'A', cls: 'bg-[#0B2242] text-white' },
              { letter: 'S', cls: 'bg-emerald-600 text-white' },
              { letter: 'C', cls: 'bg-[#C86400] text-white' },
            ].map((swatch) => (
              <span
                key={swatch.letter}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${swatch.cls}`}
              >
                {swatch.letter}
              </span>
            ))}
          </div>
          <span
            className={`text-[13px] font-medium ${
              previewDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Progress, Achievement, Success, Custom
          </span>
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              onNotify('Preview button tested with active accessibility preferences.');
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
              a11yDraft.highContrast
                ? 'bg-slate-950 text-white border-2 border-[#15629E]'
                : 'bg-[#15629E] hover:bg-[#104E7E] text-white'
            } ${
              a11yDraft.enhancedFocusIndicators
                ? 'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#15629E]/50 focus-visible:ring-offset-2'
                : ''
            }`}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>Sample Button (Demo)</span>
          </button>
        </div>

        <div
          className={`pt-4 border-t text-[12px] space-y-1.5 ${
            previewDark ? 'border-slate-700' : 'border-slate-100'
          }`}
        >
          <p className={previewDark ? 'text-slate-400' : 'text-slate-500'}>
            Active Accessibility Features:
          </p>
          <p
            className={`font-semibold ${
              previewDark ? 'text-sky-300' : 'text-[#15629E]'
            }`}
          >
            {activeA11yFeatures.length > 0 ? activeA11yFeatures.join(' · ') : 'Standard defaults'}
          </p>
        </div>
      </section>
    </div>
  );
};
