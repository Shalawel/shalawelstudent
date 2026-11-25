import React from 'react';
import { motion } from 'motion/react';
import {
  Award,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  Gauge,
  MessageSquare,
  Rocket,
  Settings,
  TrendingUp,
  X,
} from 'lucide-react';
import type { NavSectionId } from '../types/dashboard';
import { playUiSound } from '../utils/uiSounds';
import { TutorCloudLogo } from './BrandAssets';

interface SidebarProps {
  activeSection: NavSectionId;
  onSelectSection: (section: NavSectionId) => void;
  unreadMessages: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: {
  id: NavSectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Gauge },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'sessions', label: 'Learning Plan', icon: ClipboardList },
  { id: 'learning-plan', label: 'Learning Session', icon: Rocket },
  { id: 'practice', label: 'Practice & Readiness', icon: BookOpen },
  { id: 'progress', label: 'Learning Progress', icon: TrendingUp },
  { id: 'notes', label: 'Notes & Resources', icon: FileText },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  unreadMessages,
  mobileOpen,
  onCloseMobile,
}) => {
  const handleSelect = (id: NavSectionId) => {
    if (id !== activeSection) {
      playUiSound('switch');
    } else {
      playUiSound('subtle');
    }
    onSelectSection(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex h-full flex-col bg-[#15629E] text-white select-none">
      {/* Brand header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-6">
        <button
          type="button"
          onClick={() => handleSelect('dashboard')}
          className="bencho-press rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label="Tutor Cloud Home"
        >
          <TutorCloudLogo />
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation items with Obsidian/Aceternity shared-layout spring highlight */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 pb-6 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const isDashboardCard = isActive && item.id === 'dashboard';

          if (isDashboardCard) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current="page"
                className="bencho-press relative w-full flex flex-col items-start gap-2 rounded-2xl px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <motion.span
                  layoutId="sidebar-active-surface"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-2xl bg-white border-2 border-[#F5A623] shadow-[0_6px_18px_rgba(9,35,66,0.18)]"
                />
                <Icon className="relative z-10 h-5 w-5 text-[#E67E00] shrink-0" />
                <span className="relative z-10 text-[14px] font-semibold text-[#D97706] whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`bencho-press relative w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                isActive
                  ? 'text-[#D97706] font-semibold'
                  : 'text-white/95 hover:bg-white/12'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-surface"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-xl bg-white border-2 border-[#F5A623] shadow-[0_4px_14px_rgba(9,35,66,0.16)]"
                />
              )}
              <span className="relative z-10 flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`h-[16px] w-[16px] shrink-0 ${
                    isActive ? 'text-[#E67E00]' : 'text-white/90'
                  }`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </span>
              {item.id === 'messages' && unreadMessages > 0 && (
                <span
                  className={`relative z-10 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
                    isActive
                      ? 'bg-[#FEF3C7] text-[#B45309]'
                      : 'bg-[#F59E0B] text-slate-950'
                  }`}
                >
                  {unreadMessages}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop full-height sidebar with sticky inner navigation */}
      <aside className="hidden lg:block w-[228px] shrink-0 bg-[#15629E] self-stretch">
        <div className="sticky top-0 h-screen">{navContent}</div>
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-[2px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[250px] max-w-[82vw] h-full shadow-2xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
