import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_WEAK_AREAS,
  buildAiGeneratedNoteForWeakArea,
  buildWeakAreaClassroomInput,
  getWeakAreaSubjects,
  groupWeakAreasBySubject,
  updateWeakAreaNote,
  validateNoteSubmission,
  validateNoteUploadFile,
} from './weakAreaLogic';

test('groupWeakAreasBySubject categorizes weak areas by subject and sorts lowest mastery first', () => {
  const subjects = getWeakAreaSubjects(INITIAL_WEAK_AREAS);
  assert.ok(subjects.includes('Mathematics'));
  assert.ok(subjects.includes('English'));
  assert.ok(subjects.includes('Science'));

  const allGroups = groupWeakAreasBySubject(INITIAL_WEAK_AREAS, 'All');
  assert.equal(allGroups.length, subjects.length);

  const mathGroups = groupWeakAreasBySubject(INITIAL_WEAK_AREAS, 'Mathematics');
  assert.equal(mathGroups.length, 1);
  assert.equal(mathGroups[0].subject, 'Mathematics');
  assert.ok(mathGroups[0].items.length >= 2);
  assert.ok(mathGroups[0].items[0].masteryPercent <= mathGroups[0].items[1].masteryPercent);
});

test('updateWeakAreaNote updates note content, source badge, and uploaded file metadata immutably', () => {
  const target = INITIAL_WEAK_AREAS[0];
  const edited = updateWeakAreaNote(INITIAL_WEAK_AREAS, target.id, {
    noteContent: 'My custom quadratic factoring checklist.',
    noteSource: 'student-edited',
  });
  assert.equal(INITIAL_WEAK_AREAS[0].noteSource, 'ai-generated');
  assert.equal(edited[0].noteSource, 'student-edited');
  assert.equal(edited[0].noteContent, 'My custom quadratic factoring checklist.');

  const uploaded = updateWeakAreaNote(edited, target.id, {
    noteTitle: 'Uploaded Quadratics Cheat Sheet',
    noteContent: 'Extracted text from uploaded file.',
    noteSource: 'student-uploaded',
    uploadedFile: {
      fileName: 'quadratics-notes.txt',
      mimeType: 'text/plain',
      sizeBytes: 1024,
    },
  });
  assert.equal(uploaded[0].noteSource, 'student-uploaded');
  assert.equal(uploaded[0].uploadedFile?.fileName, 'quadratics-notes.txt');
});

test('buildAiGeneratedNoteForWeakArea produces tailored study guidance for the weak topic', () => {
  const target = INITIAL_WEAK_AREAS[0];
  const generated = buildAiGeneratedNoteForWeakArea(target);
  assert.ok(generated.noteTitle.includes(target.topic));
  assert.ok(generated.noteContent.includes(target.subject));
  assert.ok(generated.noteContent.includes(`${target.masteryPercent}%`));
});

test('validateNoteUploadFile and validateNoteSubmission enforce file type, size, and non-empty rules', () => {
  assert.equal(
    validateNoteUploadFile({ name: 'notes.txt', type: 'text/plain', size: 2048 }).valid,
    true
  );
  assert.equal(
    validateNoteUploadFile({ name: 'diagram.png', type: 'image/png', size: 500000 }).valid,
    true
  );
  assert.equal(
    validateNoteUploadFile({ name: 'sheet.pdf', type: 'application/pdf', size: 120000 }).valid,
    true
  );
  assert.equal(
    validateNoteUploadFile({ name: 'virus.exe', type: 'application/octet-stream', size: 500 }).valid,
    false
  );
  assert.equal(
    validateNoteUploadFile({ name: 'huge.pdf', type: 'application/pdf', size: 12 * 1024 * 1024 })
      .valid,
    false
  );

  assert.equal(validateNoteSubmission('  ', null).valid, false);
  assert.equal(validateNoteSubmission('Factor out GCF first', null).valid, true);
  assert.equal(
    validateNoteSubmission('', { fileName: 'my-notes.pdf', mimeType: 'application/pdf', sizeBytes: 1200 })
      .valid,
    true
  );
});

test('buildWeakAreaClassroomInput maps weak area subject, topic, and gap summary cleanly', () => {
  const target = INITIAL_WEAK_AREAS[0];
  const sessionInput = buildWeakAreaClassroomInput(target, '9');
  assert.equal(sessionInput.subject, target.subject);
  assert.equal(sessionInput.topic, target.topic);
  assert.equal(sessionInput.gradeLevel, '9');
  assert.ok(sessionInput.specificQuestion.includes(target.gapSummary));
});
