import type { AccountRole, StudentProfile } from '../types/dashboard';

export interface RoleOptionSpec {
  id: AccountRole;
  title: string;
  shortLabel: string;
  description: string;
  defaultCurriculum: string;
  defaultGrade: string;
}

export const ROLE_OPTIONS: RoleOptionSpec[] = [
  {
    id: 'student',
    title: "I'm a Student",
    shortLabel: 'Student',
    description: 'Learn with AI guidance and personalized learning paths',
    defaultCurriculum: 'CCSS',
    defaultGrade: '9',
  },
  {
    id: 'parent',
    title: "I'm a parent or guardian",
    shortLabel: 'Parent / Guardian',
    description: "Support your child's learning journey and track progress",
    defaultCurriculum: 'CCSS',
    defaultGrade: '6',
  },
  {
    id: 'teacher',
    title: "I'm a teacher or tutor",
    shortLabel: 'Teacher / Tutor',
    description: 'Empower learning with AI-assisted teaching support',
    defaultCurriculum: 'CCSS',
    defaultGrade: '6-8',
  },
  {
    id: 'school',
    title: "I'm from a school",
    shortLabel: 'School Admin',
    description: 'Manage learning, users, and engagement across your institution',
    defaultCurriculum: 'CCSS',
    defaultGrade: 'K-12',
  },
];

export const CURRICULUM_OPTIONS = ['CCSS', 'CBSE', 'IB', 'GCSE', 'NGSS'] as const;

export const GRADE_OPTIONS = [
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
] as const;

export const SUBJECT_CHOICES = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Computer Science',
] as const;

export const INSTITUTION_TYPES = [
  'Public School',
  'Private School',
  'Charter / Academy',
  'School District',
] as const;

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Too short' | 'Weak' | 'Fair' | 'Good' | 'Strong';
}

export interface SignupCredentialsInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export interface RoleSetupInput {
  grade: string;
  curriculum: string;
  subjects: string[];
  learningStyle: StudentProfile['learningStyle'];
  childName?: string;
  organizationName?: string;
  institutionType?: string;
  weeklyReports?: boolean;
}

export interface LoginFormInput {
  identifier: string;
  password: string;
}

export const DEMO_LOGIN_CREDENTIALS = {
  identifier: 'you@your.edu',
  password: 'You1234',
} as const;

export interface ValidationResult<T extends string = string> {
  valid: boolean;
  errors: Partial<Record<T, string>>;
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (password.length < 8) {
    return { score: 0, label: 'Too short' };
  }
  let points = 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points += 1;
  if (/\d/.test(password)) points += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) points += 1;

  const clamped = Math.min(4, Math.max(1, points)) as 1 | 2 | 3 | 4;
  const labels: Record<1 | 2 | 3 | 4, PasswordStrengthResult['label']> = {
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong',
  };
  return { score: clamped, label: labels[clamped] };
}

export function validateSignupCredentials(
  input: SignupCredentialsInput
): ValidationResult<'fullName' | 'email' | 'password' | 'confirmPassword' | 'acceptedTerms'> {
  const errors: Partial<
    Record<'fullName' | 'email' | 'password' | 'confirmPassword' | 'acceptedTerms', string>
  > = {};

  if (input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  }
  if (!isValidEmail(input.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (input.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }
  if (input.confirmPassword !== input.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  if (!input.acceptedTerms) {
    errors.acceptedTerms = 'Please accept the privacy policy and terms to continue.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRoleSetup(
  role: AccountRole,
  input: RoleSetupInput
): ValidationResult<'childName' | 'organizationName' | 'subjects' | 'grade' | 'curriculum'> {
  const errors: Partial<
    Record<'childName' | 'organizationName' | 'subjects' | 'grade' | 'curriculum', string>
  > = {};

  if (!input.curriculum.trim()) {
    errors.curriculum = 'Select a curriculum standard.';
  }

  if (role === 'student') {
    if (!input.grade.trim()) {
      errors.grade = 'Select your grade level.';
    }
    if (input.subjects.length === 0) {
      errors.subjects = 'Pick at least one subject to personalize your plan.';
    }
  } else if (role === 'parent') {
    if (!input.childName || input.childName.trim().length < 2) {
      errors.childName = "Enter your child's name (at least 2 characters).";
    }
    if (!input.grade.trim()) {
      errors.grade = "Select your child's grade level.";
    }
  } else if (role === 'teacher') {
    if (!input.organizationName || input.organizationName.trim().length < 2) {
      errors.organizationName = 'Enter your school or tutoring practice name.';
    }
    if (input.subjects.length === 0) {
      errors.subjects = 'Select at least one subject you teach.';
    }
  } else if (role === 'school') {
    if (!input.organizationName || input.organizationName.trim().length < 2) {
      errors.organizationName = 'Enter your school or district name.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLoginInput(
  input: LoginFormInput
): ValidationResult<'identifier' | 'password'> {
  const errors: Partial<Record<'identifier' | 'password', string>> = {};
  const trimmedId = input.identifier.trim();

  if (trimmedId.length < 3) {
    errors.identifier = 'Enter your User ID or email address.';
  }
  if (!input.password || input.password.length < 6) {
    errors.password = 'Enter your password (at least 6 characters).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function getRoleSpec(role: AccountRole): RoleOptionSpec {
  return ROLE_OPTIONS.find((item) => item.id === role) ?? ROLE_OPTIONS[0];
}

export function buildStudentProfileFromAccount(account: {
  fullName: string;
  email: string;
  role: AccountRole;
  grade?: string;
  curriculum?: string;
  subjects?: string[];
  learningStyle?: StudentProfile['learningStyle'];
  organizationName?: string;
  childName?: string;
}): StudentProfile {
  const cleanFullName = account.fullName.trim() || 'TutorCloud Member';
  const firstName = cleanFullName.split(/\s+/)[0] || cleanFullName;
  const roleSpec = getRoleSpec(account.role);

  return {
    firstName,
    fullName: cleanFullName,
    email: account.email.trim().toLowerCase(),
    role: account.role,
    grade: account.grade?.trim() || roleSpec.defaultGrade,
    curriculum: account.curriculum?.trim() || roleSpec.defaultCurriculum,
    subjects:
      account.subjects && account.subjects.length > 0
        ? account.subjects
        : ['Mathematics', 'Science', 'English'],
    learningStyle: account.learningStyle ?? 'Interactive',
    dailyTargetMinutes: 45,
    organizationName: account.organizationName?.trim() || undefined,
    childName: account.childName?.trim() || undefined,
  };
}
