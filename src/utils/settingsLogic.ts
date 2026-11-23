export type SettingsSubSection =
  | 'overview'
  | 'profile'
  | 'notifications'
  | 'linked-parent'
  | 'devices'
  | 'accessibility';

export type LearningStyleOption = 'visual' | 'auditory' | 'practice';
export type GoalFocusOption = 'concept-mastery' | 'exam-prep' | 'homework-support';
export type NotificationPreset = 'all' | 'minimal' | 'achievements';
export type TextSizeOption = 'small' | 'medium' | 'large';
export type ThemeOption = 'light' | 'dark' | 'system';
export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface AiTutorPersona {
  id: string;
  name: string;
  role: string;
  skinTone: string;
  hairColor: string;
  shirtColor: string;
  hairStyle: 'bob' | 'short' | 'bun' | 'curly' | 'wavy' | 'bald-beard' | 'glasses-long' | 'fade';
  hasGlasses?: boolean;
}

export interface LinkedParentRecord {
  id: string;
  name: string;
  initials: string;
  role: 'Primary Parent' | 'Secondary Parent';
  status: 'Active' | 'Pending';
  maskedEmail: string;
  maskedPhone: string;
  linkedDate: string;
  lastSynced: string;
}

export interface SignedInDevice {
  id: string;
  name: string;
  type: 'laptop' | 'phone' | 'desktop';
  browser: string;
  os: string;
  location: string;
  status: 'This device' | 'Active' | 'Idle';
  lastActive: string;
  isCurrent: boolean;
}

export interface NotificationSettings {
  channels: {
    inApp: boolean;
    email: boolean;
    mobilePush: boolean;
  };
  topics: {
    learningUpdates: boolean;
    achievements: boolean;
    aiChallenges: boolean;
    messages: true; // School-required
  };
}

export interface AccessibilitySettings {
  textSize: TextSizeOption;
  theme: ThemeOption;
  highContrast: boolean;
  colorBlindMode: ColorBlindMode;
  reduceMotion: boolean;
  enhancedKeyboardNav: boolean;
  enhancedFocusIndicators: boolean;
  voiceNarration: boolean;
  screenReaderOptimization: boolean;
}

export interface ProfilePreferencesSettings {
  avatarId: string;
  studentId: string;
  schoolId: string;
  timezone: string;
  mobileCountryCode: string;
  mobileNumber: string;
  mobileVerified: boolean;
  tutorId: string;
  learningStyles: LearningStyleOption[];
  goalFocus: GoalFocusOption;
  learningInterests: string[];
  lastUpdatedLabel: string;
}

export interface AppSettingsState {
  profilePrefs: ProfilePreferencesSettings;
  notifications: NotificationSettings;
  linkedParents: LinkedParentRecord[];
  devices: SignedInDevice[];
  accessibility: AccessibilitySettings;
}

export const AI_TUTOR_PERSONAS: AiTutorPersona[] = [
  { id: 'maya', name: 'Maya', role: 'AI Tutor', skinTone: '#F6CDB4', hairColor: '#4A2525', shirtColor: '#B84B5B', hairStyle: 'glasses-long', hasGlasses: true },
  { id: 'kai', name: 'Kai', role: 'AI Tutor', skinTone: '#F2C7A5', hairColor: '#C9B39B', shirtColor: '#7C4D3A', hairStyle: 'bald-beard', hasGlasses: true },
  { id: 'sophia', name: 'Sophia', role: 'AI Tutor', skinTone: '#F6CDB4', hairColor: '#7A4C2E', shirtColor: '#2563EB', hairStyle: 'glasses-long', hasGlasses: true },
  { id: 'ethan', name: 'Ethan', role: 'AI Tutor', skinTone: '#F4C9A8', hairColor: '#1E293B', shirtColor: '#16A34A', hairStyle: 'short', hasGlasses: true },
  { id: 'aisha', name: 'Aisha', role: 'AI Tutor', skinTone: '#E8B894', hairColor: '#3B2314', shirtColor: '#475569', hairStyle: 'bob' },
  { id: 'liam', name: 'Liam', role: 'AI Tutor', skinTone: '#F6CDB4', hairColor: '#6D4329', shirtColor: '#0284C7', hairStyle: 'wavy', hasGlasses: true },
  { id: 'elena', name: 'Elena', role: 'AI Tutor', skinTone: '#F5C7A7', hairColor: '#4A2E1B', shirtColor: '#0F766E', hairStyle: 'bob' },
  { id: 'marcus', name: 'Marcus', role: 'AI Tutor', skinTone: '#F0BEA0', hairColor: '#8B4A34', shirtColor: '#6D28D9', hairStyle: 'short', hasGlasses: true },
  { id: 'zara', name: 'Zara', role: 'AI Tutor', skinTone: '#F6CDB4', hairColor: '#5B1F2E', shirtColor: '#15629E', hairStyle: 'glasses-long', hasGlasses: true },
  { id: 'david', name: 'David', role: 'AI Tutor', skinTone: '#F2C7A5', hairColor: '#334155', shirtColor: '#1E3A8A', hairStyle: 'fade' },
  { id: 'noah', name: 'Noah', role: 'AI Tutor', skinTone: '#C68B59', hairColor: '#1E1B18', shirtColor: '#0369A1', hairStyle: 'curly' },
  { id: 'priya', name: 'Priya', role: 'AI Tutor', skinTone: '#B57B52', hairColor: '#1F1A17', shirtColor: '#DC2626', hairStyle: 'curly' },
  { id: 'mateo', name: 'Mateo', role: 'AI Tutor', skinTone: '#D49A6A', hairColor: '#2B1D14', shirtColor: '#1D4ED8', hairStyle: 'fade' },
  { id: 'amara', name: 'Amara', role: 'AI Tutor', skinTone: '#8D5524', hairColor: '#1C1917', shirtColor: '#7C3AED', hairStyle: 'bun', hasGlasses: true },
  { id: 'samir', name: 'Samir', role: 'AI Tutor', skinTone: '#D9A077', hairColor: '#334155', shirtColor: '#1E293B', hairStyle: 'bald-beard' },
  { id: 'chloe', name: 'Chloe', role: 'AI Tutor', skinTone: '#E0AC69', hairColor: '#3E2723', shirtColor: '#D97706', hairStyle: 'wavy' },
];

export const STUDENT_AVATAR_OPTIONS = [
  { id: 'grad-blue', label: 'Scholar Blue', bg: '#E0F2FE', accent: '#15629E' },
  { id: 'grad-navy', label: 'Deep Navy', bg: '#DBEAFE', accent: '#0B2242' },
  { id: 'grad-teal', label: 'Emerald Focus', bg: '#D1FAE5', accent: '#047857' },
  { id: 'grad-amber', label: 'Warm Horizon', bg: '#FEF3C7', accent: '#B45309' },
];

export const TIMEZONE_OPTIONS = [
  'EST Eastern Timezone (UTC-5)',
  'CST Central Timezone (UTC-6)',
  'MST Mountain Timezone (UTC-7)',
  'PST Pacific Timezone (UTC-8)',
  'GMT Greenwich Mean Time (UTC+0)',
  'IST India Standard Time (UTC+5:30)',
];

export const LEARNING_INTEREST_SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Physics',
  'Chemistry',
  'Biology',
  'Literature',
  'Creative Writing',
  'Art',
  'Music',
  'Physical Education',
  'Computer Science',
  'Languages',
];

export const DEFAULT_APP_SETTINGS: AppSettingsState = {
  profilePrefs: {
    avatarId: 'grad-blue',
    studentId: 'STU-2024-10456',
    schoolId: 'SCH-2024-10456',
    timezone: 'EST Eastern Timezone (UTC-5)',
    mobileCountryCode: '+1',
    mobileNumber: '9876543210',
    mobileVerified: true,
    tutorId: 'maya',
    learningStyles: ['visual', 'practice'],
    goalFocus: 'concept-mastery',
    learningInterests: ['Mathematics', 'Science', 'Computer Science'],
    lastUpdatedLabel: 'Updated 2 days ago',
  },
  notifications: {
    channels: {
      inApp: true,
      email: true,
      mobilePush: false,
    },
    topics: {
      learningUpdates: true,
      achievements: true,
      aiChallenges: true,
      messages: true,
    },
  },
  linkedParents: [
    {
      id: 'parent-1',
      name: 'John Carter',
      initials: 'JC',
      role: 'Primary Parent',
      status: 'Active',
      maskedEmail: 'jo***@gmail.com',
      maskedPhone: '+1 *****1234',
      linkedDate: 'Linked on Nov 12, 2025',
      lastSynced: 'Last synced: 2 hours ago',
    },
  ],
  devices: [
    {
      id: 'dev-macbook',
      name: 'MacBook Pro',
      type: 'laptop',
      browser: 'Chrome 120',
      os: 'macOS Sonoma',
      location: 'San Francisco, CA',
      status: 'This device',
      lastActive: 'Active now',
      isCurrent: true,
    },
    {
      id: 'dev-iphone',
      name: 'iPhone 15',
      type: 'phone',
      browser: 'Safari Mobile',
      os: 'iOS 17',
      location: 'San Francisco, CA',
      status: 'Active',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
    {
      id: 'dev-windows',
      name: 'Windows Desktop',
      type: 'desktop',
      browser: 'Edge 120',
      os: 'Windows 11',
      location: 'Los Angeles, CA',
      status: 'Idle',
      lastActive: '5 days ago',
      isCurrent: false,
    },
  ],
  accessibility: {
    textSize: 'medium',
    theme: 'light',
    highContrast: false,
    colorBlindMode: 'none',
    reduceMotion: false,
    enhancedKeyboardNav: true,
    enhancedFocusIndicators: true,
    voiceNarration: false,
    screenReaderOptimization: false,
  },
};

export function applyNotificationPreset(
  current: NotificationSettings,
  preset: NotificationPreset
): NotificationSettings {
  if (preset === 'all') {
    return {
      channels: {
        inApp: true,
        email: true,
        mobilePush: true,
      },
      topics: {
        learningUpdates: true,
        achievements: true,
        aiChallenges: true,
        messages: true,
      },
    };
  }
  if (preset === 'minimal') {
    return {
      channels: {
        inApp: true,
        email: false,
        mobilePush: false,
      },
      topics: {
        learningUpdates: false,
        achievements: false,
        aiChallenges: false,
        messages: true,
      },
    };
  }
  return {
    channels: {
      ...current.channels,
      inApp: true,
    },
    topics: {
      learningUpdates: false,
      achievements: true,
      aiChallenges: false,
      messages: true,
    },
  };
}

export function detectNotificationPreset(
  settings: NotificationSettings
): NotificationPreset | null {
  const { topics, channels } = settings;
  if (
    topics.learningUpdates &&
    topics.achievements &&
    topics.aiChallenges &&
    channels.inApp &&
    channels.email &&
    channels.mobilePush
  ) {
    return 'all';
  }
  if (!topics.learningUpdates && !topics.achievements && !topics.aiChallenges) {
    return 'minimal';
  }
  if (!topics.learningUpdates && topics.achievements && !topics.aiChallenges) {
    return 'achievements';
  }
  return null;
}

export function summarizeNotifications(settings: NotificationSettings): string {
  const { topics } = settings;
  const enabledTopics = [
    topics.learningUpdates,
    topics.achievements,
    topics.aiChallenges,
    topics.messages,
  ].filter(Boolean).length;

  if (enabledTopics === 4) {
    return 'All enabled';
  }
  if (enabledTopics === 1) {
    return 'Minimal (School-required only)';
  }
  return `${enabledTopics} of 4 alert types enabled`;
}

export function summarizeLinkedParents(parents: LinkedParentRecord[]): string {
  if (parents.length === 0) {
    return 'No parent linked';
  }
  const primary = parents[0];
  if (parents.length === 1) {
    return `${primary.name} | ${primary.status}`;
  }
  return `${primary.name} + ${parents.length - 1} more | Active`;
}

export function summarizeDevices(devices: SignedInDevice[]): string {
  const count = devices.length;
  return `${count} ${count === 1 ? 'device' : 'devices'} active`;
}

export function getTextSizePx(size: TextSizeOption): number {
  switch (size) {
    case 'small':
      return 14;
    case 'large':
      return 20;
    default:
      return 16;
  }
}

export function summarizeAccessibility(a11y: AccessibilitySettings): string {
  const sizeLabel =
    a11y.textSize === 'small'
      ? 'Small text'
      : a11y.textSize === 'large'
      ? 'Large text'
      : 'Medium text';
  const themeLabel =
    a11y.theme === 'dark'
      ? 'Dark theme'
      : a11y.theme === 'system'
      ? 'System theme'
      : 'Light theme';
  return `${sizeLabel}, ${themeLabel}`;
}

export function resolveActiveAccessibilityFeatures(a11y: AccessibilitySettings): string[] {
  const features: string[] = [];
  if (a11y.highContrast) features.push('High Contrast');
  if (a11y.colorBlindMode !== 'none') {
    const label =
      a11y.colorBlindMode === 'protanopia'
        ? 'Protanopia Filter'
        : a11y.colorBlindMode === 'deuteranopia'
        ? 'Deuteranopia Filter'
        : 'Tritanopia Filter';
    features.push(label);
  }
  if (a11y.reduceMotion) features.push('Reduced Motion');
  if (a11y.enhancedKeyboardNav) features.push('Keyboard Nav');
  if (a11y.enhancedFocusIndicators) features.push('Enhanced Focus');
  if (a11y.voiceNarration) features.push('Voice Narration');
  if (a11y.screenReaderOptimization) features.push('Screen Reader');
  return features;
}

export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const [local, domain] = trimmed.split('@');
  if (!local || !domain) return trimmed;
  const prefix = local.slice(0, Math.min(2, local.length));
  return `${prefix}***@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '+1 *****0000';
  return `+1 *****${digits.slice(-4)}`;
}

export function validateAddParentInput(input: {
  name: string;
  email: string;
  phone: string;
  existingCount: number;
}): { valid: boolean; error?: string } {
  if (input.existingCount >= 2) {
    return { valid: false, error: 'Dual Guardian Support allows up to 2 linked parents.' };
  }
  if (input.name.trim().length < 2) {
    return { valid: false, error: 'Please enter the parent or guardian full name.' };
  }
  const emailTrimmed = input.email.trim();
  if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
    return { valid: false, error: 'Please enter a valid parent email address.' };
  }
  if (input.phone.replace(/\D/g, '').length < 7) {
    return { valid: false, error: 'Please enter a valid phone number.' };
  }
  return { valid: true };
}

export function createLinkedParentRecord(
  input: { name: string; email: string; phone: string },
  existingCount: number
): LinkedParentRecord {
  const cleanName = input.name.trim();
  const parts = cleanName.split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : cleanName.slice(0, 2).toUpperCase();

  return {
    id: `parent-${Date.now()}`,
    name: cleanName,
    initials,
    role: existingCount === 0 ? 'Primary Parent' : 'Secondary Parent',
    status: 'Active',
    maskedEmail: maskEmail(input.email),
    maskedPhone: maskPhone(input.phone),
    linkedDate: 'Linked today',
    lastSynced: 'Last synced: Just now',
  };
}

export function logoutSingleDevice(
  devices: SignedInDevice[],
  deviceId: string
): SignedInDevice[] {
  return devices.filter((d) => d.isCurrent || d.id !== deviceId);
}

export function logoutAllOtherDevices(devices: SignedInDevice[]): SignedInDevice[] {
  return devices.filter((d) => d.isCurrent);
}

export function toggleArraySelection<T>(items: T[], value: T, minRequired = 0): T[] {
  if (items.includes(value)) {
    if (items.length <= minRequired) return items;
    return items.filter((item) => item !== value);
  }
  return [...items, value];
}
