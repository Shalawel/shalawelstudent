import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_SCHEDULE_SESSIONS,
  SCHEDULE_TODAY_ISO,
  autoScheduleLessons,
  buildCalendarMonthGrid,
  buildSessionsFromCreateForm,
  cancelScheduleSession,
  computeWeeklyScheduleSummary,
  dismissMissedScheduleSession,
  filterScheduleSessions,
  format24hTimeTo12h,
  formatTimeRange12h,
  groupScheduleSessions,
  rescheduleScheduleSession,
  validateCreateScheduleForm,
  type CreateScheduleFormInput,
} from './scheduleLogic';

test('filterScheduleSessions filters by status tab, subject, and period', () => {
  const allWeek = filterScheduleSessions(
    INITIAL_SCHEDULE_SESSIONS,
    'This Week',
    'All Subjects',
    'all'
  );
  assert.ok(allWeek.length >= 6);

  const upcomingOnly = filterScheduleSessions(
    INITIAL_SCHEDULE_SESSIONS,
    'This Month',
    'All Subjects',
    'upcoming'
  );
  assert.ok(upcomingOnly.every((s) => s.status === 'upcoming'));

  const completedMath = filterScheduleSessions(
    INITIAL_SCHEDULE_SESSIONS,
    'This Month',
    'Mathematics',
    'completed'
  );
  assert.ok(completedMath.length >= 1);
  assert.ok(completedMath.every((s) => s.subject === 'Mathematics' && s.status === 'completed'));

  const missedOnly = filterScheduleSessions(
    INITIAL_SCHEDULE_SESSIONS,
    'This Week',
    'All Subjects',
    'missed'
  );
  assert.equal(missedOnly.length, 2);
  assert.ok(missedOnly.every((s) => s.status === 'missed' || s.status === 'canceled'));
});

test('groupScheduleSessions separates Today, Upcoming Later, Last Week, and Missed/Cancelled', () => {
  const grouped = groupScheduleSessions(INITIAL_SCHEDULE_SESSIONS, SCHEDULE_TODAY_ISO);
  assert.equal(grouped.today.length, 2);
  assert.ok(grouped.upcomingLater.length >= 4);
  assert.ok(grouped.lastWeek.length >= 2);
  assert.equal(grouped.missedOrCancelled.length, 2);
});

test('computeWeeklyScheduleSummary returns consistent totals and attendance rate', () => {
  const summary = computeWeeklyScheduleSummary(INITIAL_SCHEDULE_SESSIONS, SCHEDULE_TODAY_ISO);
  assert.equal(
    summary.totalThisWeek,
    summary.completed + summary.pending + 2
  );
  assert.ok(summary.attendanceRate >= 0 && summary.attendanceRate <= 100);
});

test('buildCalendarMonthGrid builds July 2026 with Monday Jul 13 marked as today', () => {
  const grid = buildCalendarMonthGrid(2026, 6, SCHEDULE_TODAY_ISO); // monthIndex 6 = July
  assert.ok(grid.length === 35 || grid.length === 42);
  const july1 = grid.find((c) => c.dateIso === '2026-07-01');
  assert.ok(july1 && july1.inCurrentMonth && july1.dayNumber === 1);
  // July 1, 2026 is Wednesday (index 3 in Sunday-start grid)
  assert.equal(grid[3].dateIso, '2026-07-01');
  const todayCell = grid.find((c) => c.isToday);
  assert.ok(todayCell);
  assert.equal(todayCell.dateIso, '2026-07-13');
  assert.equal(todayCell.dayNumber, 13);
});

test('autoScheduleLessons populates at least 3 weekday lessons with valid dates and times', () => {
  const lessons = autoScheduleLessons('Mathematics', [], '2026-07-15');
  assert.equal(lessons.length, 3);
  for (const lesson of lessons) {
    assert.ok(lesson.lessonName.length > 0);
    assert.match(lesson.dateIso, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(lesson.startTime24, /^\d{2}:\d{2}$/);
    assert.equal(lesson.durationMins, 45);
  }
});

test('validateCreateScheduleForm rejects incomplete required fields and accepts valid forms', () => {
  const missingHelpType: CreateScheduleFormInput = {
    helpType: '',
    subject: 'Mathematics',
    curriculum: 'Common Core State Standards (CCSS)',
    mode: 'one-time',
    lessons: [
      {
        id: 'd1',
        lessonName: 'Review: Trigonometry (Review)',
        dateIso: '2026-07-15',
        durationMins: 45,
        startTime24: '13:21',
      },
    ],
  };
  assert.ok(validateCreateScheduleForm(missingHelpType)?.includes('help'));

  const missingDate: CreateScheduleFormInput = {
    ...missingHelpType,
    helpType: 'Learn a Lesson',
    lessons: [{ ...missingHelpType.lessons[0], dateIso: '' }],
  };
  assert.ok(validateCreateScheduleForm(missingDate)?.includes('date'));

  const validForm: CreateScheduleFormInput = {
    ...missingHelpType,
    helpType: 'Learn a Lesson',
  };
  assert.equal(validateCreateScheduleForm(validForm), null);
});

test('buildSessionsFromCreateForm creates one-time and recurring sessions with confirmation cards', () => {
  const recurringInput: CreateScheduleFormInput = {
    helpType: 'Learn a Lesson',
    subject: 'Mathematics',
    curriculum: 'Common Core State Standards (CCSS)',
    mode: 'recurring',
    lessons: [
      {
        id: 'l1',
        lessonName: 'Review: Trigonometry (Review)',
        dateIso: '2026-07-15',
        durationMins: 45,
        startTime24: '13:21',
      },
      {
        id: 'l2',
        lessonName: 'Quadratic Functions and Vertex Form',
        dateIso: '2026-07-17',
        durationMins: 45,
        startTime24: '15:00',
      },
    ],
  };

  const { newSessions, confirmations } = buildSessionsFromCreateForm(recurringInput);
  assert.equal(newSessions.length, 2);
  assert.equal(confirmations.length, 2);
  assert.equal(confirmations[0].dateTimeLabel, 'Jul 15, 2026 at 01:21 PM');
  assert.equal(confirmations[0].durationLabel, '45m');
  assert.equal(confirmations[0].sessionType, 'Learn a Lesson');

  const oneTimeResult = buildSessionsFromCreateForm({
    ...recurringInput,
    mode: 'one-time',
  });
  assert.equal(oneTimeResult.newSessions.length, 1);
  assert.equal(oneTimeResult.confirmations.length, 1);
});

test('reschedule, cancel, and dismiss mutations update target sessions cleanly', () => {
  const rescheduled = rescheduleScheduleSession(
    INITIAL_SCHEDULE_SESSIONS,
    'sch-missed-1',
    '2026-07-18',
    '11:30',
    60
  );
  const moved = rescheduled.find((s) => s.id === 'sch-missed-1');
  assert.ok(moved);
  assert.equal(moved.status, 'upcoming');
  assert.equal(moved.dateIso, '2026-07-18');
  assert.equal(moved.startTime24, '11:30');
  assert.equal(moved.durationMins, 60);

  const canceled = cancelScheduleSession(INITIAL_SCHEDULE_SESSIONS, 'sch-today-1');
  const canceledItem = canceled.find((s) => s.id === 'sch-today-1');
  assert.equal(canceledItem?.status, 'canceled');
  assert.equal(canceledItem?.isLive, false);

  const dismissed = dismissMissedScheduleSession(INITIAL_SCHEDULE_SESSIONS, 'sch-missed-1');
  const visible = filterScheduleSessions(dismissed, 'This Week', 'All Subjects', 'missed');
  assert.equal(visible.length, 1);
});

test('time formatting helpers produce 12-hour displays', () => {
  assert.equal(format24hTimeTo12h('09:00'), '09:00 AM');
  assert.equal(format24hTimeTo12h('13:21'), '01:21 PM');
  assert.equal(formatTimeRange12h('09:00', 30), '09:00 AM - 09:30 AM');
});
