import type { CalendarSession, StartSessionInput } from '../types/dashboard';

export interface ParsedTime12h {
  time: string; // e.g. '09:30'
  meridiem: 'AM' | 'PM';
}

export interface RescheduleSessionInput {
  sessionId: string;
  newDateKey: string;
  newTime24: string; // HTML <input type="time"> format 'HH:MM'
}

export interface CancelValidationResult {
  valid: boolean;
  error?: string;
}

export interface CancelledSessionRecord {
  sessionId: string;
  title: string;
  subject: string;
  dateKey: string;
  timeLabel: string;
  reason: string;
  cancelledAt: string;
}

/**
 * Converts a 12-hour session time ('09:30', 'AM') into total minutes since midnight [0..1439].
 */
export function sessionTimeToMinutes(time: string, meridiem: 'AM' | 'PM'): number | null {
  const trimmed = time.trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const rawHour = Number(match[1]);
  const minutes = Number(match[2]);
  if (rawHour < 1 || rawHour > 12 || minutes < 0 || minutes > 59) return null;

  let hour24 = rawHour % 12;
  if (meridiem === 'PM') {
    hour24 += 12;
  }
  return hour24 * 60 + minutes;
}

/**
 * Converts HTML <input type="time"> 24-hour string ('14:30') to { time: '02:30', meridiem: 'PM' }.
 */
export function format24hTo12h(time24: string): ParsedTime12h | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time24.trim());
  if (!match) return null;
  const hour24 = Number(match[1]);
  const minutes = Number(match[2]);
  if (hour24 < 0 || hour24 > 23 || minutes < 0 || minutes > 59) return null;

  const meridiem: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return {
    time: `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    meridiem,
  };
}

/**
 * Converts 12-hour session time ('01:00', 'PM') to HTML <input type="time"> '13:00'.
 */
export function format12hTo24h(time: string, meridiem: 'AM' | 'PM'): string {
  const mins = sessionTimeToMinutes(time, meridiem);
  if (mins === null) return '10:00';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Formats a Date (with optional minute offset) as a 12-hour session time slot.
 */
export function getTimeSlotForDate(baseDate: Date = new Date(), offsetMinutes = 0): ParsedTime12h {
  const target = new Date(baseDate.getTime() + offsetMinutes * 60_000);
  const h24 = target.getHours();
  const mins = target.getMinutes();
  const meridiem: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return {
    time: `${String(h12).padStart(2, '0')}:${String(mins).padStart(2, '0')}`,
    meridiem,
  };
}

/**
 * Checks whether a Today Upcoming session's scheduled time matches the current time window.
 * A session is joinable from 15 minutes before start up to 45 minutes after start.
 */
export function isUpcomingSessionTimeMatch(
  session: Pick<CalendarSession, 'time' | 'meridiem' | 'status'>,
  now: Date = new Date(),
  windowBeforeMinutes = 15,
  windowAfterMinutes = 45
): { canJoin: boolean; reasonText: string } {
  if (session.status !== 'upcoming') {
    return { canJoin: false, reasonText: 'Only Today Upcoming sessions use live time matching.' };
  }
  const sessionMinutes = sessionTimeToMinutes(session.time, session.meridiem);
  if (sessionMinutes === null) {
    return { canJoin: false, reasonText: 'Session time unavailable.' };
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const diff = nowMinutes - sessionMinutes; // negative = before start, positive = after start

  if (diff >= -windowBeforeMinutes && diff <= windowAfterMinutes) {
    return {
      canJoin: true,
      reasonText: `Live window active (${session.time} ${session.meridiem}) — ready to join now.`,
    };
  }

  if (diff < -windowBeforeMinutes) {
    return {
      canJoin: false,
      reasonText: `Join unlocks 15 minutes before ${session.time} ${session.meridiem}.`,
    };
  }

  return {
    canJoin: false,
    reasonText: `The ${session.time} ${session.meridiem} live window has passed. Please reschedule.`,
  };
}

/**
 * Reschedules a missed or upcoming session to a new date and time and places it under 'scheduled'.
 */
export function rescheduleCalendarSessionToScheduled(
  sessions: CalendarSession[],
  input: RescheduleSessionInput
): CalendarSession[] {
  const parsed = format24hTo12h(input.newTime24);
  if (!parsed || !input.newDateKey.trim()) {
    return sessions;
  }

  return sessions.map((session) =>
    session.id === input.sessionId
      ? {
          ...session,
          dateKey: input.newDateKey.trim(),
          time: parsed.time,
          meridiem: parsed.meridiem,
          status: 'scheduled',
        }
      : session
  );
}

/**
 * Validates that a student provided a clear cancellation reason before cancelling a scheduled session.
 */
export function validateCancellationReason(reason: string): CancelValidationResult {
  const cleaned = reason.trim();
  if (!cleaned) {
    return { valid: false, error: 'Please write a reason for cancelling this session.' };
  }
  if (cleaned.length < 5) {
    return { valid: false, error: 'Please write at least 5 characters explaining your reason.' };
  }
  return { valid: true };
}

/**
 * Removes a cancelled scheduled session from the sessions list and creates an audit record.
 */
export function cancelScheduledSession(
  sessions: CalendarSession[],
  sessionId: string,
  reason: string,
  cancelledAt: string = new Date().toISOString()
): { updatedSessions: CalendarSession[]; cancelledRecord: CancelledSessionRecord | null } {
  const target = sessions.find((s) => s.id === sessionId);
  if (!target) {
    return { updatedSessions: sessions, cancelledRecord: null };
  }
  return {
    updatedSessions: sessions.filter((s) => s.id !== sessionId),
    cancelledRecord: {
      sessionId: target.id,
      title: target.title,
      subject: target.subject,
      dateKey: target.dateKey,
      timeLabel: `${target.time} ${target.meridiem}`,
      reason: reason.trim(),
      cancelledAt,
    },
  };
}

/**
 * Builds the StartSessionInput needed to jump directly from a calendar session into SessionClassroom.
 */
export function buildClassroomInputFromCalendarSession(
  session: CalendarSession,
  gradeLevel?: string
): StartSessionInput {
  return {
    helpType: 'Learn a Lesson',
    subject: session.subject || 'English',
    lessonSource: 'learning-plan',
    topic: session.title,
    specificQuestion: session.description || '',
    gradeLevel,
  };
}
