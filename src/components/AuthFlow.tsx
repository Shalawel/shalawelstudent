import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Flag,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { TutorCloudLogo } from './BrandAssets';
import type { AccountRole, AuthView, StudentProfile } from '../types/dashboard';
import {
  CURRICULUM_OPTIONS,
  DEMO_LOGIN_CREDENTIALS,
  GRADE_OPTIONS,
  INSTITUTION_TYPES,
  ROLE_OPTIONS,
  SUBJECT_CHOICES,
  buildStudentProfileFromAccount,
  evaluatePasswordStrength,
  getRoleSpec,
  isValidEmail,
  validateLoginInput,
  validateRoleSetup,
  validateSignupCredentials,
} from '../utils/authLogic';
import { playUiSound } from '../utils/uiSounds';
import authBackdropImg from '../assets/images/auth_students_huddle_1795283371568.jpg';

interface AuthFlowProps {
  initialView?: AuthView;
  onAuthenticated: (payload: {
    profile: StudentProfile;
    token: string;
    welcomeMessage: string;
  }) => void;
  onContinueDemo: () => void;
}

type SignupStep = 1 | 2 | 3;
type SsoProvider = 'google' | 'microsoft' | 'organisation';

const RoleIconArt: React.FC<{ role: AccountRole }> = ({ role }) => {
  if (role === 'student') {
    return (
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="shrink-0">
        <circle cx="20" cy="20" r="18" fill="#FEF3C7" />
        {/* Graduation cap */}
        <path d="M9 14.5L20 10L31 14.5L20 19L9 14.5Z" fill="#1E293B" />
        <path d="M13.5 16.5V20.5C13.5 22.4 16.4 24 20 24C23.6 24 26.5 22.4 26.5 20.5V16.5" fill="#334155" />
        <path d="M30 15V21" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="30" cy="22" r="1.4" fill="#F59E0B" />
        {/* Face & shoulders */}
        <circle cx="20" cy="22" r="6" fill="#F5CBA7" />
        <circle cx="18" cy="21.5" r="0.9" fill="#1E293B" />
        <circle cx="22" cy="21.5" r="0.9" fill="#1E293B" />
        <path d="M18.2 24.4C19.2 25.3 20.8 25.3 21.8 24.4" stroke="#9A3412" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M11.5 34C12.8 29.8 16 28 20 28C24 28 27.2 29.8 28.5 34" fill="#1E293B" />
        <path d="M17 28.2L20 31.8L23 28.2" fill="#F59E0B" />
      </svg>
    );
  }
  if (role === 'parent') {
    return (
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="shrink-0">
        <circle cx="20" cy="20" r="18" fill="#EFF6FF" />
        {/* Left adult */}
        <circle cx="14.5" cy="15.5" r="4.3" fill="#F4C7A1" />
        <path d="M10.5 15C10.8 11.8 12.6 10.6 14.6 10.6C16.8 10.6 18.4 12 18.6 15" fill="#5B3A29" />
        <path d="M8.5 30C9.2 25.2 11.4 23 14.5 23C17.6 23 19.8 25.2 20.5 30" fill="#2563EB" />
        {/* Right adult */}
        <circle cx="25.8" cy="16" r="4.1" fill="#F6D0B1" />
        <path d="M21.8 15.8C22 12 23.8 10.8 26 10.8C28.2 10.8 29.8 12.4 29.9 16.5" fill="#92400E" />
        <path d="M20.2 30C20.8 25.4 22.8 23.2 25.8 23.2C28.8 23.2 30.8 25.4 31.4 30" fill="#F59E0B" />
        {/* Child front center */}
        <circle cx="20" cy="22.5" r="3.4" fill="#F9D5B8" />
        <path d="M15.8 32.5C16.3 29 17.9 27.3 20 27.3C22.1 27.3 23.7 29 24.2 32.5" fill="#10B981" />
      </svg>
    );
  }
  if (role === 'teacher') {
    return (
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="shrink-0">
        <circle cx="20" cy="20" r="18" fill="#FEF9C3" />
        {/* Hair */}
        <path d="M11 21C11 13.5 14.8 10 20 10C25.2 10 29 13.5 29 21V26H11V21Z" fill="#78350F" />
        {/* Face */}
        <circle cx="20" cy="19.5" r="6" fill="#F5CBA7" />
        {/* Glasses */}
        <circle cx="17.5" cy="19.5" r="2.2" stroke="#1E293B" strokeWidth="1.2" fill="white" fillOpacity="0.4" />
        <circle cx="22.5" cy="19.5" r="2.2" stroke="#1E293B" strokeWidth="1.2" fill="white" fillOpacity="0.4" />
        <line x1="19.7" y1="19.5" x2="20.3" y2="19.5" stroke="#1E293B" strokeWidth="1.2" />
        <path d="M18.3 22.8C19.3 23.6 20.7 23.6 21.7 22.8" stroke="#9A3412" strokeWidth="1.2" strokeLinecap="round" />
        {/* Blazer & collar */}
        <path d="M11.5 34C12.8 29 16 27 20 27C24 27 27.2 29 28.5 34" fill="#DC2626" />
        <path d="M17.2 27.2L20 31L22.8 27.2" fill="#FFFFFF" />
      </svg>
    );
  }
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="20" cy="20" r="18" fill="#F1F5F9" />
      {/* Roof */}
      <path d="M8 18L20 10L32 18H8Z" fill="#D97706" />
      {/* Building body */}
      <rect x="10" y="18" width="20" height="14" rx="1.5" fill="#FDE68A" stroke="#D97706" strokeWidth="1.2" />
      {/* Clock */}
      <circle cx="20" cy="15.2" r="2.4" fill="#FFFFFF" stroke="#92400E" strokeWidth="1" />
      <path d="M20 14V15.3L21 15.8" stroke="#92400E" strokeWidth="0.9" strokeLinecap="round" />
      {/* Windows & door */}
      <rect x="12.5" y="21" width="3.5" height="3.5" rx="0.6" fill="#38BDF8" />
      <rect x="24" y="21" width="3.5" height="3.5" rx="0.6" fill="#38BDF8" />
      <rect x="17.8" y="24.5" width="4.4" height="7.5" rx="0.8" fill="#92400E" />
    </svg>
  );
};

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.65Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.87-3a7.17 7.17 0 0 1-10.67-3.77H1.41v3.09A12 12 0 0 0 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.41 14.32a7.21 7.21 0 0 1 0-4.64V6.59H1.41a12 12 0 0 0 0 10.82l4-3.09Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.77c1.76 0 3.34.61 4.59 1.79l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.41 6.59l4 3.09A7.16 7.16 0 0 1 12 4.77Z"
    />
  </svg>
);

const MicrosoftIcon: React.FC = () => (
  <svg width="17" height="17" viewBox="0 0 21 21" aria-hidden="true">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

export const AuthFlow: React.FC<AuthFlowProps> = ({
  initialView = 'signup',
  onAuthenticated,
  onContinueDemo,
}) => {
  const [authView, setAuthView] = useState<AuthView>(initialView);
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  const [selectedRole, setSelectedRole] = useState<AccountRole>('student');

  // Step 2 signup form state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  // Step 3 role setup state
  const [grade, setGrade] = useState('9');
  const [curriculum, setCurriculum] = useState('CCSS');
  const [subjects, setSubjects] = useState<string[]>(['Mathematics', 'Science', 'English']);
  const [learningStyle, setLearningStyle] =
    useState<StudentProfile['learningStyle']>('Interactive');
  const [childName, setChildName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [institutionType, setInstitutionType] = useState<string>(INSTITUTION_TYPES[0]);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [setupErrors, setSetupErrors] = useState<Record<string, string>>({});

  // Sign In form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // Forgot password & SSO modal states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );
  const [activeSsoProvider, setActiveSsoProvider] = useState<SsoProvider | null>(null);
  const [ssoEmail, setSsoEmail] = useState('');
  const [ssoName, setSsoName] = useState('');
  const [ssoOrg, setSsoOrg] = useState('');
  const [ssoError, setSsoError] = useState<string | null>(null);

  // Submission & server error state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const roleSpec = getRoleSpec(selectedRole);
  const passwordStrength = evaluatePasswordStrength(signupPassword);

  const switchView = (next: AuthView) => {
    playUiSound('switch');
    setAuthView(next);
    setServerError(null);
    setShowForgotPassword(false);
    setActiveSsoProvider(null);
    if (next === 'signup') {
      setSignupStep(1);
    }
  };

  const handleSelectRoleCard = (role: AccountRole) => {
    playUiSound('pop');
    setSelectedRole(role);
    const spec = getRoleSpec(role);
    setGrade(spec.defaultGrade);
    setCurriculum(spec.defaultCurriculum);
    setServerError(null);
    setSignupErrors({});
    setSetupErrors({});
    setSignupStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const validation = validateSignupCredentials({
      fullName,
      email: signupEmail,
      password: signupPassword,
      confirmPassword,
      acceptedTerms,
    });
    if (!validation.valid) {
      playUiSound('subtle');
      setSignupErrors(validation.errors as Record<string, string>);
      return;
    }
    playUiSound('click');
    setSignupErrors({});
    setSignupStep(3);
  };

  const toggleSubjectChoice = (subject: string) => {
    playUiSound('switch');
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((item) => item !== subject) : [...prev, subject]
    );
    setSetupErrors((prev) => ({ ...prev, subjects: '' }));
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const validation = validateRoleSetup(selectedRole, {
      grade,
      curriculum,
      subjects,
      learningStyle,
      childName,
      organizationName,
      institutionType,
      weeklyReports,
    });
    if (!validation.valid) {
      playUiSound('subtle');
      setSetupErrors(validation.errors as Record<string, string>);
      return;
    }

    setSetupErrors({});
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          role: selectedRole,
          grade,
          curriculum,
          subjects,
          learningStyle,
          organizationName: organizationName.trim() || undefined,
          childName: childName.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setServerError(data.error || 'Could not complete registration. Please try again.');
        if (response.status === 409) {
          setSignupStep(2);
        }
        return;
      }

      playUiSound('success');
      const profile = buildStudentProfileFromAccount(data.user);
      onAuthenticated({
        profile,
        token: data.token,
        welcomeMessage: `Welcome to Tutor Cloud, ${profile.firstName}! Your 7-day free trial is active.`,
      });
    } catch {
      setServerError('Network error while creating your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const validation = validateLoginInput({
      identifier: loginIdentifier,
      password: loginPassword,
    });
    if (!validation.valid) {
      playUiSound('subtle');
      setLoginErrors(validation.errors as Record<string, string>);
      return;
    }

    setLoginErrors({});
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword,
          rememberMe,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setServerError(data.error || 'Sign in failed. Please check your credentials.');
        return;
      }
      playUiSound('success');
      const profile = buildStudentProfileFromAccount(data.user);
      onAuthenticated({
        profile,
        token: data.token,
        welcomeMessage: `Welcome back, ${profile.firstName}!`,
      });
    } catch {
      setServerError('Network error while signing in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);
    if (!isValidEmail(resetEmail)) {
      setResetStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setResetStatus({ type: 'error', text: data.error || 'Could not process reset request.' });
        return;
      }
      playUiSound('success');
      setResetStatus({ type: 'success', text: data.message });
    } catch {
      setResetStatus({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSsoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSsoProvider) return;
    setSsoError(null);
    if (!isValidEmail(ssoEmail)) {
      setSsoError('Please enter a valid email address to continue.');
      return;
    }
    if (activeSsoProvider === 'organisation' && ssoOrg.trim().length < 2) {
      setSsoError('Please enter your school or organisation name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: activeSsoProvider,
          email: ssoEmail.trim(),
          fullName: ssoName.trim() || undefined,
          organizationName: ssoOrg.trim() || undefined,
          role: activeSsoProvider === 'organisation' ? 'school' : selectedRole,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setSsoError(data.error || 'Single sign-on failed. Please try again.');
        return;
      }
      playUiSound('success');
      const profile = buildStudentProfileFromAccount(data.user);
      const providerLabel =
        activeSsoProvider === 'google'
          ? 'Google'
          : activeSsoProvider === 'microsoft'
          ? 'Microsoft'
          : ssoOrg.trim() || 'Organisation SSO';
      onAuthenticated({
        profile,
        token: data.token,
        welcomeMessage: `Signed in via ${providerLabel} as ${profile.fullName}`,
      });
    } catch {
      setSsoError('Network error while connecting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackArrow = () => {
    playUiSound('click');
    setServerError(null);
    if (authView === 'signup') {
      if (signupStep === 3) {
        setSignupStep(2);
      } else if (signupStep === 2) {
        setSignupStep(1);
      } else {
        setAuthView('login');
      }
    } else if (showForgotPassword) {
      setShowForgotPassword(false);
    } else if (activeSsoProvider) {
      setActiveSsoProvider(null);
    }
  };

  return (
    <div
      data-testid="auth-flow-root"
      data-auth-view={authView}
      className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white text-slate-900"
    >
      {/* LEFT PANEL: Full-bleed atmospheric student photo + deep navy scrim (bottom on mobile, left on desktop) */}
      <section
        aria-label="Tutor Cloud overview"
        data-testid="auth-left-panel"
        className="relative order-2 lg:order-1 flex flex-col justify-between overflow-hidden bg-[#151E2C] px-5 sm:px-10 lg:px-12 xl:px-16 py-8 sm:py-10 text-white"
      >
        {/* Background photograph with resilient CSS gradient fallback */}
        <img
          src={authBackdropImg}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-22 mix-blend-luminosity scale-[1.02]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#141C2A]/92 via-[#1A2436]/86 to-[#111827]/94"
        />

        {/* Top Brand Mark (desktop left panel; mobile displays compact header at top of page) */}
        <div className="relative z-10 hidden lg:block">
          <TutorCloudLogo />
        </div>

        {/* Center Hero Copy — switches smoothly between Sign Up (Design 1) and Sign In (Design 2) */}
        <div className="relative z-10 mx-auto lg:mx-0 my-auto w-full max-w-[440px] lg:max-w-[500px] py-2 sm:py-4 lg:py-8">
          <AnimatePresence mode="wait">
            {authView === 'signup' ? (
              <motion.div
                key="hero-signup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="inline-block rounded-full bg-white/[0.11] border border-white/10 px-4 py-1.5 text-[13px] sm:text-[13.5px] font-medium text-slate-200 tracking-[0.01em]">
                  7-day free trial · No credit card
                </span>

                <h1 className="mt-4 sm:mt-5 font-display text-[26px] sm:text-[30px] lg:text-[32px] xl:text-[36px] font-extrabold leading-[1.16] tracking-tight text-white [text-wrap:balance]">
                  The AI tutor built by educators.
                </h1>

                <p className="mt-3.5 sm:mt-4 text-[14.5px] sm:text-[15.5px] leading-[1.6] text-slate-200/90 max-w-[470px]">
                  Every lesson lines up with your state standards. Student data is protected under
                  FERPA and COPPA.
                </p>

                <ul className="mt-5 sm:mt-6 space-y-3 sm:space-y-3.5 text-[14px] sm:text-[15px] font-medium text-slate-100">
                  {[
                    'Guides learners to real understanding, not just answers',
                    'Live progress for families, teachers and schools',
                    'Built by educators, with privacy designed in',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F59E0B] text-[#151E2C]"
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Privacy Protected Frosted Card */}
                <div className="mt-7 sm:mt-10 lg:mt-16 rounded-2xl border border-white/25 bg-[#4C586A]/55 px-4 sm:px-5 py-3.5 sm:py-4 max-w-[445px] shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                  <div className="flex items-center gap-2 text-[14.5px] sm:text-[15px] font-bold text-white">
                    <ShieldCheck className="h-5 w-5 text-white shrink-0" aria-hidden="true" />
                    <span>Privacy protected</span>
                  </div>
                  <p className="mt-1.5 text-[13px] sm:text-[13.5px] leading-relaxed text-slate-200/95">
                    COPPA · FERPA · CCPA/CPRA · SOPIPA · PPRA · State student privacy laws
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="hero-login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className="font-display text-[28px] sm:text-[32px] lg:text-[36px] xl:text-[42px] font-extrabold leading-[1.12] tracking-tight text-white [text-wrap:balance]">
                  Welcome to TutorCloud
                </h1>

                <p className="mt-3 sm:mt-4 text-[14.5px] sm:text-[16px] leading-[1.6] text-slate-200/90 max-w-[430px]">
                  Personalized learning for students, educators, schools, and families - smarter
                  learning, connected growth.
                </p>

                <ul className="mt-6 sm:mt-8 space-y-3.5 sm:space-y-4">
                  {[
                    { icon: Zap, text: 'Personalized AI learning support' },
                    { icon: Flag, text: 'Progress insights & guided sessions' },
                    { icon: Lock, text: 'Secure multi-role access' },
                    { icon: Trophy, text: 'Achievements & streak rewards' },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3.5 text-[14.5px] sm:text-[15.5px] font-medium text-slate-100">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#F59E0B]/40 bg-[#F59E0B]/15 text-[#F59E0B]"
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quiet spacer for visual balance matching reference on desktop */}
        <div className="relative z-10 hidden lg:block h-4" aria-hidden="true" />
      </section>

      {/* RIGHT PANEL: Clean Pure-White Interactive Sign Up & Sign In Experience (top on mobile, right on desktop) */}
      <main
        data-testid="auth-right-panel"
        className="relative order-1 lg:order-2 flex lg:min-h-screen flex-col justify-center bg-white px-4 sm:px-10 py-6 sm:py-10 lg:overflow-y-auto"
      >
        {/* Mobile Brand Header */}
        <div className="mx-auto w-full max-w-[440px] lg:hidden mb-5 flex items-center justify-between gap-3">
          <div className="rounded-xl bg-[#151E2C] px-3.5 py-2">
            <TutorCloudLogo />
          </div>
          <button
            type="button"
            onClick={() => switchView(authView === 'signup' ? 'login' : 'signup')}
            className="text-xs font-semibold text-[#1D6FD8] hover:underline whitespace-nowrap"
          >
            {authView === 'signup' ? 'Sign in' : 'Create account'}
          </button>
        </div>

        <div className="mx-auto w-full max-w-[440px]">
          <AnimatePresence mode="wait">
            {/* ============================================================== */}
            {/* SIGN UP FLOW (Step 1: Role Selection -> Step 2 -> Step 3)       */}
            {/* ============================================================== */}
            {authView === 'signup' && (
              <motion.div
                key={`signup-step-${signupStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Top Back & Close Row matching Attachment 1 */}
                <div className="flex items-center justify-between mb-5 sm:mb-10">
                  <button
                    type="button"
                    data-testid="auth-back-button"
                    onClick={handleBackArrow}
                    aria-label={signupStep === 1 ? 'Go to Sign In' : 'Go back a step'}
                    className="bencho-press inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
                  >
                    <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {signupStep > 1 && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span>Step {signupStep} of 3</span>
                      <span className="flex items-center gap-1" aria-hidden="true">
                        {[1, 2, 3].map((step) => (
                          <span
                            key={step}
                            className={`h-1.5 rounded-full transition-all ${
                              step <= signupStep ? 'w-5 bg-[#F59E0B]' : 'w-2.5 bg-slate-200'
                            }`}
                          />
                        ))}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    data-testid="auth-close-demo-button"
                    onClick={() => {
                      playUiSound('click');
                      onContinueDemo();
                    }}
                    aria-label="Preview demo dashboard"
                    title="Preview demo dashboard"
                    className="bencho-press inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                {/* STEP 1: Who Are You Signing Up As? (Matches Attachment 1) */}
                {signupStep === 1 && (
                  <div data-testid="signup-role-step">
                    <h2 className="font-display text-[24px] sm:text-[28px] font-extrabold tracking-tight text-[#F59E0B] leading-tight">
                      Who Are You Signing Up As?
                    </h2>
                    <p className="mt-1.5 text-[14px] text-slate-500">
                      We&apos;ll set everything up to match.
                    </p>

                    <div className="mt-5 sm:mt-7 space-y-3 sm:space-y-3.5" role="list" aria-label="Account role options">
                      {ROLE_OPTIONS.map((option) => {
                        const isSelected = selectedRole === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            data-testid={`role-card-${option.id}`}
                            onClick={() => handleSelectRoleCard(option.id)}
                            className={`bencho-press group flex w-full items-center gap-3.5 sm:gap-4 rounded-2xl border px-4 sm:px-5 py-3.5 sm:py-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
                              isSelected
                                ? 'border-[#F59E0B] bg-[#FFF9EB] shadow-[0_2px_10px_rgba(245,158,11,0.12)]'
                                : 'border-slate-200/90 bg-[#F8FAFC] hover:border-[#F59E0B]/70 hover:bg-[#FFFBF2]'
                            }`}
                          >
                            <RoleIconArt role={option.id} />
                            <span className="min-w-0 flex-1">
                              <span
                                className={`block text-[14.5px] font-bold leading-snug transition-colors ${
                                  isSelected
                                    ? 'text-[#E68A00]'
                                    : 'text-slate-900 group-hover:text-[#D97706]'
                                }`}
                              >
                                {option.title}
                              </span>
                              <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">
                                {option.description}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-6 sm:mt-8 text-center text-[13.5px] text-slate-500">
                      Already a member?{' '}
                      <button
                        type="button"
                        data-testid="switch-to-login-link"
                        onClick={() => switchView('login')}
                        className="font-semibold text-[#1D6FD8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FD8] rounded"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                )}

                {/* STEP 2: Account Details */}
                {signupStep === 2 && (
                  <div data-testid="signup-credentials-step">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12.5px] font-semibold text-[#B45309]">
                        {roleSpec.shortLabel} Registration
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          playUiSound('click');
                          setSignupStep(1);
                        }}
                        className="text-[12px] font-semibold text-[#1D6FD8] hover:underline"
                      >
                        Change role
                      </button>
                    </div>

                    <h2 className="mt-1 font-display text-[25px] font-extrabold tracking-tight text-[#F59E0B] leading-tight">
                      Create Your Free Account
                    </h2>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                      Start your 7-day free trial — no credit card required.
                    </p>

                    {serverError && (
                      <div
                        role="alert"
                        className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{serverError}</span>
                      </div>
                    )}

                    <form onSubmit={handleStep2Submit} noValidate className="mt-5 space-y-4">
                      <div>
                        <label
                          htmlFor="signup-fullname"
                          className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                        >
                          Full Name
                        </label>
                        <input
                          id="signup-fullname"
                          type="text"
                          autoComplete="name"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            setSignupErrors((p) => ({ ...p, fullName: '' }));
                          }}
                          placeholder="e.g. Maya Patel"
                          className={`w-full rounded-xl border bg-[#F8FAFC] px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#F59E0B] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 ${
                            signupErrors.fullName ? 'border-red-400' : 'border-slate-200'
                          }`}
                        />
                        {signupErrors.fullName && (
                          <p role="alert" className="mt-1 text-[12px] font-medium text-red-600">
                            {signupErrors.fullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="signup-email"
                          className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                        >
                          Email Address
                        </label>
                        <input
                          id="signup-email"
                          type="email"
                          autoComplete="email"
                          value={signupEmail}
                          onChange={(e) => {
                            setSignupEmail(e.target.value);
                            setSignupErrors((p) => ({ ...p, email: '' }));
                          }}
                          placeholder="name@school.edu"
                          className={`w-full rounded-xl border bg-[#F8FAFC] px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#F59E0B] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 ${
                            signupErrors.email ? 'border-red-400' : 'border-slate-200'
                          }`}
                        />
                        {signupErrors.email && (
                          <p role="alert" className="mt-1 text-[12px] font-medium text-red-600">
                            {signupErrors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="signup-password"
                          className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="signup-password"
                            type={showSignupPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={signupPassword}
                            onChange={(e) => {
                              setSignupPassword(e.target.value);
                              setSignupErrors((p) => ({ ...p, password: '' }));
                            }}
                            placeholder="At least 8 characters"
                            className={`w-full rounded-xl border bg-[#F8FAFC] px-4 py-3 pr-11 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#F59E0B] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 ${
                              signupErrors.password ? 'border-red-400' : 'border-slate-200'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword((v) => !v)}
                            aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                          >
                            {showSignupPassword ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>

                        {signupPassword.length > 0 && (
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <div className="flex flex-1 gap-1" aria-hidden="true">
                              {[1, 2, 3, 4].map((bar) => (
                                <span
                                  key={bar}
                                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                                    passwordStrength.score >= bar
                                      ? passwordStrength.score <= 1
                                        ? 'bg-red-500'
                                        : passwordStrength.score === 2
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                      : 'bg-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                              {passwordStrength.label}
                            </span>
                          </div>
                        )}
                        {signupErrors.password && (
                          <p role="alert" className="mt-1 text-[12px] font-medium text-red-600">
                            {signupErrors.password}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="signup-confirm-password"
                          className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                        >
                          Confirm Password
                        </label>
                        <input
                          id="signup-confirm-password"
                          type={showSignupPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setSignupErrors((p) => ({ ...p, confirmPassword: '' }));
                          }}
                          placeholder="Re-enter your password"
                          className={`w-full rounded-xl border bg-[#F8FAFC] px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#F59E0B] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 ${
                            signupErrors.confirmPassword ? 'border-red-400' : 'border-slate-200'
                          }`}
                        />
                        {signupErrors.confirmPassword && (
                          <p role="alert" className="mt-1 text-[12px] font-medium text-red-600">
                            {signupErrors.confirmPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-start gap-2.5 cursor-pointer text-[12.5px] text-slate-600 leading-snug">
                          <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => {
                              setAcceptedTerms(e.target.checked);
                              setSignupErrors((p) => ({ ...p, acceptedTerms: '' }));
                            }}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#F39200]"
                          />
                          <span>
                            I agree to the TutorCloud Terms of Service and COPPA / FERPA Student
                            Privacy Policy.
                          </span>
                        </label>
                        {signupErrors.acceptedTerms && (
                          <p role="alert" className="mt-1 text-[12px] font-medium text-red-600">
                            {signupErrors.acceptedTerms}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        data-testid="signup-step2-continue"
                        className="bencho-press w-full rounded-xl bg-[#F39200] hover:bg-[#DF8500] py-3.5 text-[14.5px] font-bold text-slate-950 shadow-[0_8px_20px_rgba(243,146,0,0.28)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2"
                      >
                        Continue to Personalize
                      </button>
                    </form>

                    <p className="mt-6 text-center text-[13.5px] text-slate-500">
                      Already a member?{' '}
                      <button
                        type="button"
                        onClick={() => switchView('login')}
                        className="font-semibold text-[#1D6FD8] hover:underline"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                )}

                {/* STEP 3: Role-Tailored Onboarding Setup */}
                {signupStep === 3 && (
                  <div data-testid="signup-setup-step">
                    <span className="text-[12.5px] font-semibold text-[#B45309]">
                      Final Step · {roleSpec.shortLabel}
                    </span>
                    <h2 className="mt-1 font-display text-[25px] font-extrabold tracking-tight text-[#F59E0B] leading-tight">
                      Personalize Your Workspace
                    </h2>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                      We&apos;ll align lessons, quizzes, and AI tutoring right away.
                    </p>

                    {serverError && (
                      <div
                        role="alert"
                        className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{serverError}</span>
                      </div>
                    )}

                    <form onSubmit={handleCompleteRegistration} noValidate className="mt-5 space-y-4">
                      {selectedRole === 'parent' && (
                        <div>
                          <label
                            htmlFor="setup-child-name"
                            className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                          >
                            Child&apos;s Name
                          </label>
                          <input
                            id="setup-child-name"
                            type="text"
                            value={childName}
                            onChange={(e) => {
                              setChildName(e.target.value);
                              setSetupErrors((p) => ({ ...p, childName: '' }));
                            }}
                            placeholder="e.g. Leo Carter"
                            className={`w-full rounded-xl border bg-[#F8FAFC] px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#F59E0B] focus:outline-none ${
                              setupErrors.childName ? 'border-red-400' : 'border-slate-200'
                            }`}
                          />
                          {setupErrors.childName && (
                            <p role="alert" className="mt-1 text-[12px] font-medium text-red-600">
                              {setupErrors.childName}
                            </p>
                          )}
                        </div>
                      )}

                      {(selectedRole === 'teacher' || selectedRole === 'school') && (
                        <div>
                          <label
                            htmlFor="setup-org-name"
                            className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                          >
                            {selectedRole === 'school'
                              ? 'School or District Name'
                              : 'School or Tutoring Practice'}
                          </label>
                          <input
                            id="setup-org-name"
                            type="text"
                            value={organizationName}
                            onChange={(e) => {
                              setOrganizationName(e.target.value);
                              setSetupErrors((p) => ({ ...p, organizationName: '' }));
                            }}
                            placeholder={
                              selectedRole === 'school'
                                ? 'e.g. Lincoln Prep Academy'
                                : 'e.g. Oakridge Middle School'
                            }
                            className={`w-full rounded-xl border bg-[#F8FAFC] px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#F59E0B] focus:outline-none ${
                              setupErrors.organizationName ? 'border-red-400' : 'border-slate-200'
                            }`}
                          />
                          {setupErrors.organizationName && (
                            <p role="alert" className="mt-1 text-[12px] font-medium text-red-600">
                              {setupErrors.organizationName}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedRole === 'school' ? (
                          <div>
                            <label
                              htmlFor="setup-inst-type"
                              className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                            >
                              Institution Type
                            </label>
                            <select
                              id="setup-inst-type"
                              value={institutionType}
                              onChange={(e) => setInstitutionType(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-3.5 py-3 text-[13.5px] text-slate-900 focus:bg-white focus:border-[#F59E0B] focus:outline-none"
                            >
                              {INSTITUTION_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label
                              htmlFor="setup-grade"
                              className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                            >
                              {selectedRole === 'parent'
                                ? "Child's Grade"
                                : selectedRole === 'teacher'
                                ? 'Primary Grade'
                                : 'Grade Level'}
                            </label>
                            <select
                              id="setup-grade"
                              value={grade}
                              onChange={(e) => setGrade(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-3.5 py-3 text-[13.5px] text-slate-900 focus:bg-white focus:border-[#F59E0B] focus:outline-none"
                            >
                              {GRADE_OPTIONS.map((g) => (
                                <option key={g} value={g}>
                                  Grade {g}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div>
                          <label
                            htmlFor="setup-curriculum"
                            className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                          >
                            Curriculum
                          </label>
                          <select
                            id="setup-curriculum"
                            value={curriculum}
                            onChange={(e) => setCurriculum(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-3.5 py-3 text-[13.5px] text-slate-900 focus:bg-white focus:border-[#F59E0B] focus:outline-none"
                          >
                            {CURRICULUM_OPTIONS.map((cur) => (
                              <option key={cur} value={cur}>
                                {cur}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[13px] font-semibold text-slate-800 mb-2">
                          {selectedRole === 'teacher' ? 'Subjects You Teach' : 'Focus Subjects'}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {SUBJECT_CHOICES.map((subj) => {
                            const active = subjects.includes(subj);
                            return (
                              <button
                                key={subj}
                                type="button"
                                aria-pressed={active}
                                onClick={() => toggleSubjectChoice(subj)}
                                className={`bencho-press rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition-colors whitespace-nowrap ${
                                  active
                                    ? 'border-[#F59E0B] bg-[#FFF8EB] text-[#B45309]'
                                    : 'border-slate-200 bg-[#F8FAFC] text-slate-600 hover:border-slate-300'
                                }`}
                              >
                                {subj}
                              </button>
                            );
                          })}
                        </div>
                        {setupErrors.subjects && (
                          <p role="alert" className="mt-1.5 text-[12px] font-medium text-red-600">
                            {setupErrors.subjects}
                          </p>
                        )}
                      </div>

                      {selectedRole === 'student' && (
                        <div>
                          <span className="block text-[13px] font-semibold text-slate-800 mb-2">
                            Preferred Learning Style
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {(['Interactive', 'Visual', 'Step-by-Step', 'Practice-First'] as const).map(
                              (style) => (
                                <button
                                  key={style}
                                  type="button"
                                  aria-pressed={learningStyle === style}
                                  onClick={() => {
                                    playUiSound('switch');
                                    setLearningStyle(style);
                                  }}
                                  className={`bencho-press rounded-xl border px-3 py-2 text-[12.5px] font-semibold transition-colors ${
                                    learningStyle === style
                                      ? 'border-[#0B4F7C] bg-[#EEF6FF] text-[#0B4F7C]'
                                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  {style}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {selectedRole === 'parent' && (
                        <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] px-3.5 py-3 text-[12.5px] text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={weeklyReports}
                            onChange={(e) => setWeeklyReports(e.target.checked)}
                            className="h-4 w-4 rounded accent-[#F39200]"
                          />
                          <span>Send weekly progress &amp; mastery summaries to my email</span>
                        </label>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        data-testid="signup-complete-submit"
                        className="bencho-press w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#F39200] hover:bg-[#DF8500] disabled:opacity-60 py-3.5 text-[14.5px] font-bold text-slate-950 shadow-[0_8px_20px_rgba(243,146,0,0.28)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2"
                      >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                        <span>Complete Registration</span>
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* SIGN IN FLOW (Matches Attachment 2 + Forgot Password + SSO)    */}
            {/* ============================================================== */}
            {authView === 'login' && (
              <motion.div
                key={
                  showForgotPassword
                    ? 'login-forgot'
                    : activeSsoProvider
                    ? `login-sso-${activeSsoProvider}`
                    : 'login-main'
                }
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                {showForgotPassword ? (
                  <div data-testid="forgot-password-panel">
                    <button
                      type="button"
                      onClick={() => {
                        playUiSound('click');
                        setShowForgotPassword(false);
                        setResetStatus(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 hover:text-slate-900 mb-6"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      <span>Back to Sign In</span>
                    </button>

                    <h2 className="font-display text-[25px] font-extrabold tracking-tight text-[#F59E0B]">
                      Reset Password
                    </h2>
                    <p className="mt-1.5 text-[13.5px] text-slate-500">
                      Enter your account email and we&apos;ll send a secure reset link.
                    </p>

                    <form onSubmit={handleForgotSubmit} noValidate className="mt-6 space-y-4">
                      <div>
                        <label
                          htmlFor="reset-email-input"
                          className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                        >
                          Email address
                        </label>
                        <div className="relative">
                          <Mail
                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            aria-hidden="true"
                          />
                          <input
                            id="reset-email-input"
                            type="email"
                            value={resetEmail}
                            onChange={(e) => {
                              setResetEmail(e.target.value);
                              setResetStatus(null);
                            }}
                            placeholder="Enter your email address"
                            className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] pl-10 pr-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#F59E0B] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                          />
                        </div>
                      </div>

                      {resetStatus && (
                        <div
                          role={resetStatus.type === 'error' ? 'alert' : 'status'}
                          className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[12.5px] ${
                            resetStatus.type === 'error'
                              ? 'border-red-200 bg-red-50 text-red-700'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {resetStatus.type === 'error' ? (
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                          )}
                          <span>{resetStatus.text}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bencho-press w-full rounded-xl bg-[#F39200] hover:bg-[#DF8500] disabled:opacity-60 py-3.5 text-[14.5px] font-bold text-slate-950 shadow-[0_8px_20px_rgba(243,146,0,0.28)] transition-colors"
                      >
                        Send Reset Link
                      </button>
                    </form>
                  </div>
                ) : activeSsoProvider ? (
                  <div data-testid="sso-signin-panel">
                    <button
                      type="button"
                      onClick={() => {
                        playUiSound('click');
                        setActiveSsoProvider(null);
                        setSsoError(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 hover:text-slate-900 mb-6"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      <span>Back to Sign In</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                        {activeSsoProvider === 'google' ? (
                          <GoogleIcon />
                        ) : activeSsoProvider === 'microsoft' ? (
                          <MicrosoftIcon />
                        ) : (
                          <Building2 className="h-5 w-5 text-[#F59E0B]" aria-hidden="true" />
                        )}
                      </span>
                      <div>
                        <h2 className="font-display text-[22px] font-extrabold text-slate-900 leading-tight">
                          Continue with{' '}
                          {activeSsoProvider === 'google'
                            ? 'Google'
                            : activeSsoProvider === 'microsoft'
                            ? 'Microsoft'
                            : 'Organisation SSO'}
                        </h2>
                        <p className="text-[13px] text-slate-500">
                          Verify your workspace email to sign in securely.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSsoSubmit} noValidate className="mt-6 space-y-4">
                      {activeSsoProvider === 'organisation' && (
                        <div>
                          <label
                            htmlFor="sso-org-input"
                            className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                          >
                            School / Organisation Name
                          </label>
                          <input
                            id="sso-org-input"
                            type="text"
                            value={ssoOrg}
                            onChange={(e) => {
                              setSsoOrg(e.target.value);
                              setSsoError(null);
                            }}
                            placeholder="e.g. Lincoln Unified School District"
                            className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#F59E0B] focus:outline-none"
                          />
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="sso-email-input"
                          className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                        >
                          {activeSsoProvider === 'organisation'
                            ? 'School Email Address'
                            : 'Account Email Address'}
                        </label>
                        <input
                          id="sso-email-input"
                          type="email"
                          value={ssoEmail}
                          onChange={(e) => {
                            setSsoEmail(e.target.value);
                            setSsoError(null);
                          }}
                          placeholder="student@school.edu"
                          className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#F59E0B] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="sso-name-input"
                          className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                        >
                          Display Name (Optional)
                        </label>
                        <input
                          id="sso-name-input"
                          type="text"
                          value={ssoName}
                          onChange={(e) => setSsoName(e.target.value)}
                          placeholder="e.g. Jane Carter"
                          className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#F59E0B] focus:outline-none"
                        />
                      </div>

                      {ssoError && (
                        <div
                          role="alert"
                          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700"
                        >
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{ssoError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bencho-press w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B4F7C] hover:bg-[#083D61] disabled:opacity-60 py-3.5 text-[14px] font-semibold text-white shadow-[0_6px_18px_rgba(11,79,124,0.28)] transition-colors"
                      >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                        <span>Continue to TutorCloud</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  /* MAIN SIGN IN FORM (Exact match to Attachment 2) */
                  <div data-testid="login-form-panel">
                    <div className="text-center">
                      <h2 className="font-display text-[28px] font-extrabold tracking-tight text-[#F59E0B]">
                        Sign In
                      </h2>
                      <p className="mt-1.5 text-[13.5px] text-slate-500">
                        Welcome back! Enter your details below
                      </p>
                    </div>

                    {serverError && (
                      <div
                        role="alert"
                        className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{serverError}</span>
                      </div>
                    )}

                    <form onSubmit={handleLoginSubmit} noValidate className="mt-6 space-y-4">
                      <div>
                        <label
                          htmlFor="login-identifier"
                          className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                        >
                          User ID / Email address
                        </label>
                        <input
                          id="login-identifier"
                          type="text"
                          autoComplete="username"
                          value={loginIdentifier}
                          onChange={(e) => {
                            setLoginIdentifier(e.target.value);
                            setLoginErrors((p) => ({ ...p, identifier: '' }));
                            setServerError(null);
                          }}
                          placeholder="you@your.edu"
                          className={`w-full rounded-xl border bg-[#F8FAFC] px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 transition-colors focus:bg-white focus:border-[#F59E0B] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 ${
                            loginErrors.identifier ? 'border-red-400' : 'border-slate-200/90'
                          }`}
                        />
                        {loginErrors.identifier && (
                          <p role="alert" className="mt-1 text-[12px] font-medium text-red-600">
                            {loginErrors.identifier}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="login-password"
                          className="block text-[13px] font-semibold text-slate-800 mb-1.5"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="login-password"
                            type={showLoginPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={loginPassword}
                            onChange={(e) => {
                              setLoginPassword(e.target.value);
                              setLoginErrors((p) => ({ ...p, password: '' }));
                              setServerError(null);
                            }}
                            placeholder="Enter your password"
                            className={`w-full rounded-xl border bg-[#F8FAFC] px-4 py-3 pr-11 text-[14px] text-slate-900 placeholder:text-slate-400 transition-colors focus:bg-white focus:border-[#F59E0B] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 ${
                              loginErrors.password ? 'border-red-400' : 'border-slate-200/90'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword((v) => !v)}
                            aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                          >
                            {showLoginPassword ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                        {loginErrors.password && (
                          <p role="alert" className="mt-1 text-[12px] font-medium text-red-600">
                            {loginErrors.password}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <label className="inline-flex items-center gap-2 cursor-pointer text-[13px] text-slate-500">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 accent-[#F39200]"
                          />
                          <span>Remember me</span>
                        </label>

                        <button
                          type="button"
                          data-testid="forgot-password-button"
                          onClick={() => {
                            playUiSound('click');
                            setShowForgotPassword(true);
                            setResetEmail(loginIdentifier.includes('@') ? loginIdentifier : '');
                          }}
                          className="text-[13px] font-semibold text-[#1D6FD8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FD8] rounded"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <div
                        data-testid="demo-credentials-banner"
                        className="flex items-center justify-between gap-2 rounded-xl border border-[#DCEBFA] bg-[#F4F9FF] px-3.5 py-2 text-[12px] text-slate-600"
                      >
                        <div className="min-w-0 truncate">
                          <span className="font-semibold text-[#0B4F7C]">Demo ID:</span>{' '}
                          <span className="font-mono text-slate-800">{DEMO_LOGIN_CREDENTIALS.identifier}</span>
                          <span className="mx-1.5 text-slate-300">|</span>
                          <span className="font-semibold text-[#0B4F7C]">Pass:</span>{' '}
                          <span className="font-mono text-slate-800">{DEMO_LOGIN_CREDENTIALS.password}</span>
                        </div>
                        <button
                          type="button"
                          data-testid="fill-demo-credentials-button"
                          onClick={() => {
                            playUiSound('click');
                            setLoginIdentifier(DEMO_LOGIN_CREDENTIALS.identifier);
                            setLoginPassword(DEMO_LOGIN_CREDENTIALS.password);
                            setLoginErrors({});
                            setServerError(null);
                          }}
                          className="shrink-0 rounded-lg bg-white border border-[#BFD9F5] px-2.5 py-1 text-[11.5px] font-semibold text-[#0B4F7C] hover:bg-[#EBF5FF] transition-colors cursor-pointer"
                        >
                          Fill
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        data-testid="login-submit-button"
                        className="bencho-press w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#F39200] hover:bg-[#DF8500] disabled:opacity-60 py-3.5 text-[15px] font-semibold text-slate-950 shadow-[0_10px_24px_rgba(243,146,0,0.3)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2"
                      >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                        <span>Sign In</span>
                      </button>
                    </form>

                    {/* Divider */}
                    <div className="my-5 flex items-center gap-3">
                      <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
                      <span className="text-[12px] font-medium text-slate-400">or continue with</span>
                      <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
                    </div>

                    {/* Quick Dashboard CTA + 3 SSO Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                      <button
                        type="button"
                        data-testid="quick-dashboard-cta"
                        onClick={() => {
                          playUiSound('success');
                          onContinueDemo();
                        }}
                        className="bencho-press flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#BFD9F5] bg-[#F4F9FF] py-2.5 sm:py-3 px-1.5 sm:px-2 text-[11.5px] sm:text-[12.5px] font-semibold text-[#0B4F7C] hover:border-[#0B4F7C]/45 hover:bg-[#EBF5FF] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FD8]"
                      >
                        <LayoutDashboard className="h-[18px] w-[18px] text-[#0B4F7C]" aria-hidden="true" />
                        <span className="whitespace-nowrap">Dashboard</span>
                      </button>

                      {(
                        [
                          { id: 'google', label: 'Google', icon: <GoogleIcon /> },
                          { id: 'microsoft', label: 'Microsoft', icon: <MicrosoftIcon /> },
                          {
                            id: 'organisation',
                            label: 'Organisation',
                            icon: <Building2 className="h-[18px] w-[18px] text-[#F59E0B]" aria-hidden="true" />,
                          },
                        ] as const
                      ).map((provider) => (
                        <button
                          key={provider.id}
                          type="button"
                          data-testid={`sso-${provider.id}-button`}
                          onClick={() => {
                            playUiSound('click');
                            setActiveSsoProvider(provider.id);
                            setSsoError(null);
                          }}
                          className="bencho-press flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200/95 bg-white py-2.5 sm:py-3 px-1.5 sm:px-2 text-[11.5px] sm:text-[12.5px] font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FD8]"
                        >
                          {provider.icon}
                          <span className="whitespace-nowrap">{provider.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Bottom Ecosystem Sign Up Promo Card matching Attachment 2 */}
                    <div className="relative mt-6 overflow-hidden rounded-2xl border border-[#3B82F6]/60 bg-gradient-to-b from-[#F4F9FF] via-[#EDF5FF] to-[#E6F1FF] p-4 sm:p-5 shadow-[0_10px_28px_rgba(37,99,235,0.12)]">
                      {/* Crisp blue top highlight edge matching reference */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA]"
                      />

                      <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.04em] text-[#0B4F7C] uppercase">
                        <Sparkles className="h-3.5 w-3.5 text-[#1D6FD8]" aria-hidden="true" />
                        <span>NEW TO TUTORCLOUD?</span>
                      </div>

                      <h3 className="mt-1.5 font-display text-[17px] font-extrabold text-slate-900">
                        Join the learning ecosystem
                      </h3>

                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">
                        One platform bringing together learners, families, educators, and
                        institutions to create more connected and effective learning experiences.
                      </p>

                      {/* 4 Compact Ecosystem Tags matching Attachment 2 */}
                      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-1.5">
                        {[
                          { label: 'Learn', icon: BookOpen, color: 'text-[#1D6FD8]' },
                          { label: 'Teach', icon: GraduationCap, color: 'text-[#0B4F7C]' },
                          { label: 'Grow', icon: Trophy, color: 'text-[#D97706]' },
                          { label: 'Support', icon: HeartHandshake, color: 'text-[#0F766E]' },
                        ].map(({ label, icon: Icon, color }) => (
                          <span
                            key={label}
                            className="inline-flex items-center justify-center gap-1 rounded-full border border-sky-200/80 bg-white/90 px-2 py-1 text-[11px] font-semibold text-[#0B4F7C] whitespace-nowrap"
                          >
                            <Icon className={`h-3 w-3 shrink-0 ${color}`} aria-hidden="true" />
                            <span>{label}</span>
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        data-testid="create-free-account-button"
                        onClick={() => switchView('signup')}
                        className="bencho-press mt-4 w-full rounded-xl bg-[#094A76] hover:bg-[#073A5D] py-3 text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(9,74,118,0.28)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#094A76] focus-visible:ring-offset-2"
                      >
                        Create Free Account
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
