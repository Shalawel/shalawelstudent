import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildClassroomInputFromCalendarSession,
  cancelScheduledSession,
  format12hTo24h,
  format24hTo12h,
  isUpcomingSessionTimeMatch,
  rescheduleCalendarSessionToScheduled,
  sessionTimeToMinutes,
  validateCancellationReason,
} from './calendarSessionLogic';
import type { CalendarSession } from '../types/dashboard';

const SAMPLE_SESSIONS: CalendarSession[] = [
  {
    id: 'm1',
    dateKey: '2026-07-15',
    time: '09:00',
    meridiem: 'AM',
    title: 'Design Workshop',
    description: 'Interactive components session',
    status: 'missed',
    tutorName: 'Ms. Elena Rivera',
    subject: 'English',
  },
  {
    id: 'u1',
    dateKey: '2026-07-15',
    time: '01:00',
    meridiem: 'PM',
    title: 'Feedback Round',
    description: 'Discuss progress and challenges',
    status: 'upcoming',
    tutorName: 'Mr. Aaron Patel',
    subject: 'Mathematics',
  },
  {
    id: 's1',
    dateKey: '2026-07-15',
    time: '03:30',
    meridiem: 'PM',
    title: 'Client Presentation',
    description: 'Showcase design concepts',
    status: 'scheduled',
    tutorName: 'Dr. Clara Chen',
    subject: 'History',
  },
];

test('time format conversions between 12h and 24h work accurately', () => {
  assert.equal(sessionTimeToMinutes('12:00', 'AM'), 0);
  assert.equal(sessionTimeToMinutes('09:30', 'AM'), 570);
  assert.equal(sessionTimeToMinutes('12:15', 'PM'), 735);
  assert.equal(sessionTimeToMinutes('03:45', 'PM'), 945);

  assert.deepEqual(format24hTo12h('00:15'), { time: '12:15', meridiem: 'AM' });
  assert.deepEqual(format24hTo12h('14:30'), { time: '02:30', meridiem: 'PM' });
  assert.equal(format12hTo24h('02:30', 'PM'), '14:30');
  assert.equal(format12hTo24h('09:00', 'AM'), '09:00');
});

test('rescheduling a missed or upcoming session changes date/time and moves it to scheduled', () => {
  const updated = rescheduleCalendarSessionToScheduled(SAMPLE_SESSIONS, {
    sessionId: 'm1',
    newDateKey: '2026-07-18',
    newTime24: '16:15',
  });

  const moved = updated.find((s) => s.id === 'm1');
  assert.ok(moved);
  assert.equal(moved.status, 'scheduled');
  assert.equal(moved.dateKey, '2026-07-18');
  assert.equal(moved.time, '04:15');
  assert.equal(moved.meridiem, 'PM');
});

test('upcoming session time-match allows Join Now only inside the live window', () => {
  const upcoming = SAMPLE_SESSIONS[1]; // 01:00 PM

  // 10 minutes before start (12:50 PM) -> joinable
  const beforeMatch = isUpcomingSessionTimeMatch(upcoming, new Date(2026, 6, 15, 12, 50));
  assert.equal(beforeMatch.canJoin, true);

  // 20 minutes after start (01:20 PM) -> joinable
  const duringMatch = isUpcomingSessionTimeMatch(upcoming, new Date(2026, 6, 15, 13, 20));
  assert.equal(duringMatch.canJoin, true);

  // 1 hour before start (12:00 PM) -> NOT joinable yet
  const tooEarly = isUpcomingSessionTimeMatch(upcoming, new Date(2026, 6, 15, 12, 0));
  assert.equal(tooEarly.canJoin, false);

  // 1 hour after start (02:00 PM) -> window passed
  const tooLate = isUpcomingSessionTimeMatch(upcoming, new Date(2026, 6, 15, 14, 0));
  assert.equal(tooLate.canJoin, false);
});

test('cancelling a scheduled session validates reason and removes session from list', () => {
  assert.equal(validateCancellationReason('').valid, false);
  assert.equal(validateCancellationReason('   no ').valid, false);
  assert.equal(validateCancellationReason('Family appointment at 3:30 PM').valid, true);

  const { updatedSessions, cancelledRecord } = cancelScheduledSession(
    SAMPLE_SESSIONS,
    's1',
    'Family appointment at 3:30 PM'
  );
  assert.equal(updatedSessions.length, 2);
  assert.ok(updatedSessions.every((s) => s.id !== 's1'));
  assert.ok(cancelledRecord);
  assert.equal(cancelledRecord.reason, 'Family appointment at 3:30 PM');
  assert.equal(cancelledRecord.title, 'Client Presentation');
});

test('buildClassroomInputFromCalendarSession maps session subject and topic cleanly', () => {
  const input = buildClassroomInputFromCalendarSession(SAMPLE_SESSIONS[0], '9');
  assert.equal(input.subject, 'English');
  assert.equal(input.topic, 'Design Workshop');
  assert.equal(input.specificQuestion, 'Interactive components session');
  assert.equal(input.gradeLevel, '9');
});
