import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BellRing,
  ChevronDown,
  Languages,
  LogOut,
  Menu,
  RotateCcw,
  Settings,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { LanguageCode, NavSectionId, StudentProfile } from '../types/dashboard';
import {
  isUiSoundEnabled,
  playUiSound,
  subscribeUiSoundPreference,
  toggleUiSoundEnabled,
} from '../utils/uiSounds';

interface TopBarProps {
  profile: StudentProfile;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  onOpenMobileMenu: () => void;
  onOpenProfileModal: () => void;
  onNavigate: (section: NavSectionId) => void;
  onSignOut?: () => void;
}

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'ENG', label: 'English (US)' },
  { code: 'ESP', label: 'Español' },
  { code: 'FRA', label: 'Français' },
  { code: 'DEU', label: 'Deutsch' },
];

const TIMEZONES = ['EDT', 'CDT', 'PDT', 'UTC'] as const;

export const TopBar: React.FC<TopBarProps> = ({
  profile,
  language,
  onChangeLanguage,
  onOpenMobileMenu,
  onOpenProfileModal,
  onNavigate,
  onSignOut,
}) => {
  const [openMenu, setOpenMenu] = useState<'lang' | 'clock' | 'profile' | null>(null);
  const [timezone, setTimezone] = useState<(typeof TIMEZONES)[number]>('EDT');
  const [secondsOffset, setSecondsOffset] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => isUiSoundEnabled());
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsOffset((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return subscribeUiSoundPreference(setSoundEnabled);
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Deterministic starting clock anchored to reference mockup (05:23:09 PM) that ticks live
  const baseSeconds = 17 * 3600 + 23 * 60 + 9 + secondsOffset;
  const tzShift =
    timezone === 'EDT' ? 0 : timezone === 'CDT' ? -3600 : timezone === 'PDT' ? -10800 : 14400;
  const totalSec = ((baseSeconds + tzShift) % 86400 + 86400) % 86400;
  const hrs24 = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const meridiem = hrs24 >= 12 ? 'PM' : 'AM';
  const hrs12 = hrs24 % 12 === 0 ? 12 : hrs24 % 12;
  const formattedClock = `${String(hrs12).padStart(2, '0')}:${String(mins).padStart(
    2,
    '0'
  )}:${String(secs).padStart(2, '0')} ${meridiem} ${timezone}`;

  const initials = profile.fullName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 1)
    .toUpperCase();

  const handleToggleSound = () => {
    const next = toggleUiSoundEnabled();
    setSoundEnabled(next);
    if (next) {
      playUiSound('pop');
    }
  };

  return (
    <header
      ref={barRef}
      className="relative z-30 flex items-center justify-between gap-3 rounded-full border border-[var(--tc-border-hairline)] bg-white/95 backdrop-blur-sm px-3.5 py-2 shadow-[0_4px_20px_rgba(21,98,158,0.08)]"
    >
      {/* Left: Mobile menu button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            playUiSound('click');
            onOpenMobileMenu();
          }}
          aria-label="Open navigation menu"
          className="lg:hidden bencho-press inline-flex h-10 w-10 items-center justify-center rounded-full text-[#15629E] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right utility pills matching mockup + Bencho UI sound toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end">
        {/* Bencho-inspired Tactile UI Sounds Toggle */}
        <button
          type="button"
          data-testid="ui-sound-toggle"
          onClick={handleToggleSound}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? 'UI sounds enabled, click to mute' : 'UI sounds muted, click to enable'}
          title={soundEnabled ? 'UI Sounds: On' : 'UI Sounds: Off'}
          className={`bencho-press inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E] ${
            soundEnabled
              ? 'border-sky-200 bg-sky-50/80 text-[#15629E] hover:bg-sky-100/80'
              : 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <VolumeX className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        {/* Language selector pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              setOpenMenu((m) => (m === 'lang' ? null : 'lang'));
            }}
            aria-expanded={openMenu === 'lang'}
            aria-label={`Language selector, current ${language}`}
            className="bencho-press flex items-center gap-2 rounded-full border border-[#F5A623] bg-white px-3 py-1.5 text-left transition-colors hover:bg-amber-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F59E0B] text-slate-950 shrink-0">
              <Languages className="h-3.5 w-3.5" />
            </span>
            <span className="leading-tight">
              <span className="block text-[12px] font-bold text-slate-900 whitespace-nowrap">
                {language}
              </span>
              <span className="block text-[10px] text-slate-500 whitespace-nowrap">Reset</span>
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-[#D97706] shrink-0 transition-transform duration-150 ${
                openMenu === 'lang' ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {openMenu === 'lang' && (
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
              >
                {LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      playUiSound('switch');
                      onChangeLanguage(item.code);
                      setOpenMenu(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                      language === item.code
                        ? 'bg-amber-50 text-[#B45309] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[11px] font-bold">{item.code}</span>
                  </button>
                ))}
                <div className="mt-1 border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      onChangeLanguage('ENG');
                      setOpenMenu(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset to Default (ENG)</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date & Live Clock pill */}
        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              setOpenMenu((m) => (m === 'clock' ? null : 'clock'));
            }}
            aria-expanded={openMenu === 'clock'}
            aria-label="Date and timezone settings"
            className="bencho-press flex items-center gap-2.5 rounded-full border border-[#F5A623] bg-white px-3.5 py-1.5 text-left transition-colors hover:bg-amber-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF3C7] text-[#D97706] shrink-0">
              <BellRing className="h-3.5 w-3.5" />
            </span>
            <span className="leading-tight">
              <span className="block text-[12px] font-bold text-slate-900 whitespace-nowrap">
                Sat, 07, July 2026
              </span>
              <span className="block text-[10px] font-medium text-slate-600 tabular-nums whitespace-nowrap">
                {formattedClock}
              </span>
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-[#D97706] shrink-0 transition-transform duration-150 ${
                openMenu === 'clock' ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {openMenu === 'clock' && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
              >
                <p className="text-[11px] font-semibold text-slate-500 mb-2">
                  Display Timezone
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {TIMEZONES.map((tz) => (
                    <button
                      key={tz}
                      type="button"
                      onClick={() => {
                        playUiSound('switch');
                        setTimezone(tz);
                        setOpenMenu(null);
                      }}
                      className={`bencho-press rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        timezone === tz
                          ? 'bg-[#15629E] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {tz}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Student Profile pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              setOpenMenu((m) => (m === 'profile' ? null : 'profile'));
            }}
            aria-expanded={openMenu === 'profile'}
            aria-label={`Student account menu for ${profile.fullName}`}
            className="bencho-press flex items-center gap-2.5 rounded-full border border-[#F5A623] bg-white px-3 py-1.5 text-left transition-colors hover:bg-amber-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF3C7] text-[12px] font-bold text-[#B45309] shrink-0">
              {initials || 'J'}
            </span>
            <span className="leading-tight hidden md:block">
              <span className="block text-[12px] font-bold text-[#D97706] whitespace-nowrap">
                {profile.fullName}
              </span>
              <span className="block text-[10px] font-medium text-slate-600 whitespace-nowrap">
                Grade - {profile.grade} <span className="mx-1 text-slate-300">|</span> Curriculum -{' '}
                {profile.curriculum}
              </span>
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-[#D97706] shrink-0 transition-transform duration-150 ${
                openMenu === 'profile' ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {openMenu === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{profile.fullName}</p>
                  <p className="text-[11px] text-slate-500">
                    Grade {profile.grade} · {profile.curriculum}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playUiSound('click');
                    setOpenMenu(null);
                    onOpenProfileModal();
                  }}
                  className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <User className="h-4 w-4 text-[#15629E]" />
                  <span>Edit Student Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playUiSound('click');
                    setOpenMenu(null);
                    onNavigate('settings');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4 text-[#15629E]" />
                  <span>Preferences & Settings</span>
                </button>
                {onSignOut && (
                  <div className="mt-1 border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      data-testid="topbar-signout-button"
                      onClick={() => {
                        playUiSound('subtle');
                        setOpenMenu(null);
                        onSignOut();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
