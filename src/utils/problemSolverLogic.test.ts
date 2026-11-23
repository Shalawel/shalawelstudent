import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveProblemSessionTitle,
  formatFileSizeLabel,
  isProblemSolverSession,
  isSupportedProblemFile,
  MAX_PROBLEM_FILE_BYTES,
  shouldTriggerEnterSubmit,
  validateProblemFileMeta,
  validateProblemSubmission,
} from './problemSolverLogic';

test('validateProblemFileMeta accepts images, PDFs, and text files under 8MB', () => {
  assert.equal(
    validateProblemFileMeta({ name: 'geometry_q3.png', type: 'image/png', size: 120_000 }).valid,
    true
  );
  assert.equal(
    validateProblemFileMeta({ name: 'worksheet.pdf', type: 'application/pdf', size: 512_000 }).valid,
    true
  );
  assert.equal(
    validateProblemFileMeta({ name: 'word_problem.txt', type: 'text/plain', size: 1024 }).valid,
    true
  );
  assert.equal(
    validateProblemFileMeta({ name: 'script.exe', type: 'application/octet-stream', size: 1024 }).valid,
    false
  );
  assert.equal(
    validateProblemFileMeta({
      name: 'huge.png',
      type: 'image/png',
      size: MAX_PROBLEM_FILE_BYTES + 1,
    }).valid,
    false
  );
  assert.equal(isSupportedProblemFile('notes.md', ''), true);
});

test('validateProblemSubmission requires either written text or uploaded file', () => {
  assert.equal(validateProblemSubmission({ problemText: '   ', attachment: null }).valid, false);
  assert.equal(validateProblemSubmission({ problemText: 'hi', attachment: null }).valid, false);
  assert.equal(
    validateProblemSubmission({ problemText: 'Solve 3x + 7 = 22', attachment: null }).valid,
    true
  );
  assert.equal(
    validateProblemSubmission({
      problemText: '',
      attachment: { fileName: 'q1.png', mimeType: 'image/png', sizeBytes: 4096 },
    }).valid,
    true
  );
});

test('deriveProblemSessionTitle summarizes written problem or file name cleanly', () => {
  assert.equal(deriveProblemSessionTitle('Solve 2x + 5 = 19'), 'Solve 2x + 5 = 19');
  assert.equal(
    deriveProblemSessionTitle('', 'fraction_word_problem.png'),
    'Problem: fraction word problem'
  );
  const longTitle = deriveProblemSessionTitle(
    'A train leaves Station A at 60 km/h and another train leaves Station B at 80 km/h three hours later'
  );
  assert.ok(longTitle.length <= 54);
  assert.ok(longTitle.endsWith('...'));
});

test('shouldTriggerEnterSubmit triggers on plain Enter and ignores Shift+Enter or IME', () => {
  assert.equal(shouldTriggerEnterSubmit({ key: 'Enter', shiftKey: false }), true);
  assert.equal(shouldTriggerEnterSubmit({ key: 'Enter', shiftKey: true }), false);
  assert.equal(
    shouldTriggerEnterSubmit({ key: 'Enter', shiftKey: false, isComposing: true }),
    false
  );
  assert.equal(shouldTriggerEnterSubmit({ key: 'a', shiftKey: false }), false);
});

test('isProblemSolverSession and formatFileSizeLabel behave predictably', () => {
  assert.equal(
    isProblemSolverSession({
      helpType: 'Homework Help',
      subject: 'Problem Solver',
      lessonSource: 'another-topic',
      topic: 'Solve 3x + 7 = 22',
      specificQuestion: 'Solve 3x + 7 = 22',
      problemSolver: { problemText: 'Solve 3x + 7 = 22', attachment: null },
    }),
    true
  );
  assert.equal(
    isProblemSolverSession({
      helpType: 'Learn a Lesson',
      subject: 'Mathematics',
      lessonSource: 'another-topic',
      topic: 'Angles',
      specificQuestion: '',
    }),
    false
  );
  assert.equal(formatFileSizeLabel(850), '850 B');
  assert.equal(formatFileSizeLabel(2048), '2.0 KB');
});
