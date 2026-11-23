import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_LEARNING_RESOURCES,
  INITIAL_RICH_NOTES,
  MAX_UPLOAD_BYTES,
  buildMarkdownExport,
  buildStudyKitForNote,
  buildUploadedItems,
  countNoteWords,
  createBlankRichNote,
  createQuickSessionNote,
  detectAttachmentKind,
  extractAiChapterNotesDraft,
  filterNotesForTab,
  filterResourcesForTab,
  formatBytesLabel,
  validateChapterUpload,
} from './notesResourcesLogic';

test('countNoteWords and formatBytesLabel return accurate values', () => {
  const words = countNoteWords(INITIAL_RICH_NOTES[0]);
  assert.ok(words > 80);
  assert.equal(formatBytesLabel(856 * 1024), '856 KB');
  assert.equal(formatBytesLabel(2.4 * 1024 * 1024), '2.4 MB');
  assert.equal(detectAttachmentKind('Chapter_4_Photo.png', 'image/png'), 'image');
  assert.equal(detectAttachmentKind('Physics_Book.pdf', 'application/pdf'), 'pdf');
});

test('validateChapterUpload enforces required file, allowed format, size limit, title, and subject', () => {
  assert.ok(
    validateChapterUpload({
      fileName: '',
      fileSizeBytes: 1000,
      fileMimeType: 'image/png',
      title: 'Chapter 3',
      subject: 'Science',
      chapterRef: 'p. 42',
      notesText: '',
      destination: 'both',
    })?.includes('upload')
  );

  assert.ok(
    validateChapterUpload({
      fileName: 'malware.exe',
      fileSizeBytes: 1000,
      fileMimeType: 'application/octet-stream',
      title: 'Chapter 3',
      subject: 'Science',
      chapterRef: 'p. 42',
      notesText: '',
      destination: 'note',
    })?.includes('Supported formats')
  );

  assert.ok(
    validateChapterUpload({
      fileName: 'huge-book.pdf',
      fileSizeBytes: MAX_UPLOAD_BYTES + 1,
      fileMimeType: 'application/pdf',
      title: 'Huge Book',
      subject: 'Mathematics',
      chapterRef: 'All',
      notesText: '',
      destination: 'resource',
    })?.includes('25 MB')
  );

  assert.equal(
    validateChapterUpload({
      fileName: 'Chapter_5_Triangles.png',
      fileSizeBytes: 512000,
      fileMimeType: 'image/png',
      title: 'Triangle Congruence Proofs',
      subject: 'Mathematics',
      chapterRef: 'Chapter 5 · p. 112',
      notesText: 'SAS, ASA, and SSS congruence criteria.',
      destination: 'both',
    }),
    null
  );
});

test('buildUploadedItems saves as note, resource, or both with image thumbnail preserved', () => {
  const sampleDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

  const bothRes = buildUploadedItems({
    fileName: 'Biology_Chapter_4_Mitosis.png',
    fileSizeBytes: 940 * 1024,
    fileMimeType: 'image/png',
    previewDataUrl: sampleDataUrl,
    title: 'Mitosis Phases Diagram',
    subject: 'Science',
    chapterRef: 'Chapter 4 · p. 88',
    notesText: 'Prophase, Metaphase, Anaphase, Telophase sequence.',
    destination: 'both',
  });

  assert.ok(bothRes.createdNote);
  assert.ok(bothRes.createdResource);
  assert.equal(bothRes.createdNote.coverImageUrl, sampleDataUrl);
  assert.equal(bothRes.createdNote.attachments[0].kind, 'image');
  assert.equal(bothRes.createdResource.resourceType, 'chapter-image');
  assert.equal(bothRes.createdResource.previewDataUrl, sampleDataUrl);

  const resourceOnly = buildUploadedItems({
    fileName: 'World_History_Textbook_Ch2.pdf',
    fileSizeBytes: 3.1 * 1024 * 1024,
    fileMimeType: 'application/pdf',
    title: 'Industrial Revolution Chapter',
    subject: 'History',
    chapterRef: 'Chapter 2',
    notesText: '',
    destination: 'resource',
  });
  assert.equal(resourceOnly.createdNote, undefined);
  assert.ok(resourceOnly.createdResource);
  assert.equal(resourceOnly.createdResource.resourceType, 'book');
});

test('filterNotesForTab and filterResourcesForTab filter accurately across all 4 tabs and search', () => {
  const myNotes = filterNotesForTab(INITIAL_RICH_NOTES, 'my-notes');
  assert.equal(myNotes[0].pinned, true);

  const bookmarkedNotes = filterNotesForTab(INITIAL_RICH_NOTES, 'bookmarked');
  assert.ok(bookmarkedNotes.length >= 1);
  assert.ok(bookmarkedNotes.every((n) => n.bookmarked));

  const sharedNotes = filterNotesForTab(INITIAL_RICH_NOTES, 'shared');
  assert.ok(sharedNotes.length >= 1);
  assert.ok(sharedNotes.every((n) => Boolean(n.sharedBy)));

  const searched = filterNotesForTab(INITIAL_RICH_NOTES, 'my-notes', 'grammar');
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, 'note-eng-grammar');

  const bookmarkedResources = filterResourcesForTab(INITIAL_LEARNING_RESOURCES, 'bookmarked');
  assert.ok(bookmarkedResources.every((r) => r.bookmarked));
});

test('extractAiChapterNotesDraft, buildStudyKitForNote, buildMarkdownExport, and quick note helpers work cleanly', () => {
  const draft = extractAiChapterNotesDraft('Wave Optics', 'Science', 'Ch. 9', 'wave_ch9.pdf');
  assert.ok(draft.summary.includes('Wave Optics'));
  assert.equal(draft.keyPoints.length, 3);

  const kit = buildStudyKitForNote(INITIAL_RICH_NOTES[0]);
  assert.equal(kit.subject, 'English');
  assert.ok(kit.flashcards.length >= 5);

  const md = buildMarkdownExport([INITIAL_RICH_NOTES[0]]);
  assert.ok(md.includes('# English Grammar: Complex Sentence Structures'));
  assert.ok(md.includes('Lesson_Slides.pdf'));

  const blank = createBlankRichNote('Mathematics', 'Grade 9');
  assert.equal(blank.subject, 'Mathematics');

  const quick = createQuickSessionNote({
    subject: 'Mathematics',
    title: 'Angles Session Recap',
    content: 'Vertical angles are always equal.\n- Complementary angles sum to 90 degrees.',
    sourceLabel: 'Live Session',
  });
  assert.equal(quick.subject, 'Mathematics');
  assert.equal(quick.keyComponents[0].detail, 'Complementary angles sum to 90 degrees.');
});
