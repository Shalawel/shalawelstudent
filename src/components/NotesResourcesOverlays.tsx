import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileImage,
  FileText,
  Layers,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Upload,
  Video,
  X,
} from 'lucide-react';
import {
  NOTES_SUBJECTS,
  buildUploadedItems,
  detectAttachmentKind,
  extractAiChapterNotesDraft,
  formatBytesLabel,
  validateChapterUpload,
  type LearningResourceItem,
  type RichNoteItem,
  type StudyKitBundle,
  type UploadSaveDestination,
} from '../utils/notesResourcesLogic';
import { playUiSound } from '../utils/uiSounds';

/* -------------------------------------------------------------------------- */
/* 1. Upload Book / Chapter Image / Study File Modal                          */
/* -------------------------------------------------------------------------- */

interface UploadBookChapterModalProps {
  defaultSubject?: string;
  gradeLabel: string;
  onClose: () => void;
  onSaveUploaded: (result: {
    createdNote?: RichNoteItem;
    createdResource?: LearningResourceItem;
  }) => void;
}

const SAMPLE_CHAPTER_SVG_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
      <rect width="640" height="400" fill="#F8FBFF"/>
      <rect x="28" y="24" width="584" height="352" rx="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
      <rect x="28" y="24" width="584" height="58" rx="16" fill="#0B2A4A"/>
      <text x="52" y="60" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF">Chapter 6: Geometry &amp; Triangle Congruence Proofs</text>
      <polygon points="150,270 270,130 330,270" fill="#EBF5FF" stroke="#15629E" stroke-width="4"/>
      <polygon points="380,270 500,130 560,270" fill="#FFF8EB" stroke="#E69300" stroke-width="4"/>
      <text x="200" y="305" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#15629E">ΔABC (SAS)</text>
      <text x="435" y="305" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#B86E00">ΔDEF (SAS)</text>
      <text x="52" y="346" font-family="Arial, sans-serif" font-size="13" fill="#475569">Theorem 6.2: If two sides and the included angle are congruent, the triangles are congruent.</text>
    </svg>`
  );

export function UploadBookChapterModal({
  defaultSubject = 'Science',
  gradeLabel,
  onClose,
  onSaveUploaded,
}: UploadBookChapterModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSizeBytes, setFileSizeBytes] = useState(0);
  const [fileMimeType, setFileMimeType] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | undefined>(undefined);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [chapterRef, setChapterRef] = useState('');
  const [notesText, setNotesText] = useState('');
  const [destination, setDestination] = useState<UploadSaveDestination>('both');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const ingestFile = (file: File) => {
    setError(null);
    setFileName(file.name);
    setFileSizeBytes(file.size);
    setFileMimeType(file.type || '');
    if (!title.trim()) {
      const cleaned = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
      setTitle(cleaned);
    }

    const kind = detectAttachmentKind(file.name, file.type || '');
    if (kind === 'image') {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPreviewDataUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else if (file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string' && !notesText.trim()) {
          setNotesText(reader.result.slice(0, 600));
        }
      };
      reader.readAsText(file);
      setPreviewDataUrl(undefined);
    } else {
      setPreviewDataUrl(undefined);
    }
  };

  const handleLoadSampleChapter = () => {
    playUiSound('click');
    setError(null);
    setFileName('Geometry_Chapter6_Congruence_Page.png');
    setFileSizeBytes(920 * 1024);
    setFileMimeType('image/png');
    setPreviewDataUrl(SAMPLE_CHAPTER_SVG_DATA_URL);
    setTitle('Chapter 6: Triangle Congruence Proofs');
    setSubject('Mathematics');
    setChapterRef('Chapter 6 · Page 148');
    setNotesText(
      'SAS, ASA, and SSS congruence theorems allow us to prove two triangles have identical side lengths and angle measures without checking all 6 parts.'
    );
  };

  const handleExtractAiNotes = () => {
    playUiSound('success');
    const draft = extractAiChapterNotesDraft(
      title || 'Uploaded Chapter',
      subject,
      chapterRef || 'Uploaded Page',
      fileName || 'chapter.pdf'
    );
    setNotesText(`${draft.summary}\n\n${draft.keyPoints.map((p) => `- ${p}`).join('\n')}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErr = validateChapterUpload({
      fileName,
      fileSizeBytes,
      fileMimeType,
      previewDataUrl,
      title,
      subject,
      chapterRef,
      notesText,
      destination,
      grade: gradeLabel,
    });
    if (validationErr) {
      setError(validationErr);
      playUiSound('subtle');
      return;
    }

    const result = buildUploadedItems({
      fileName,
      fileSizeBytes,
      fileMimeType,
      previewDataUrl,
      title,
      subject,
      chapterRef,
      notesText,
      destination,
      grade: gradeLabel,
    });
    playUiSound('success');
    onSaveUploaded(result);
  };

  const detectedKind = fileName ? detectAttachmentKind(fileName, fileMimeType) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-book-modal-title"
      data-testid="upload-chapter-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
        <div className="bg-[#0B2A4A] px-6 py-4 flex items-start justify-between gap-4 shrink-0">
          <div>
            <h2
              id="upload-book-modal-title"
              className="font-display text-lg font-bold text-white"
            >
              Upload Book or Chapter Image
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Upload a textbook PDF, photo of a chapter page, or study sheet and save it to Notes
              or Resources.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close upload modal"
            className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1" noValidate>
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) ingestFile(file);
            }}
            className={`rounded-xl border-2 border-dashed p-4 sm:p-5 transition-colors ${
              isDragging
                ? 'border-[#15629E] bg-[#EBF5FF] dark:bg-sky-950/30'
                : 'border-slate-300 dark:border-slate-600 bg-slate-50/70 dark:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              aria-label="Choose book or chapter image file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.doc,.docx,.epub"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) ingestFile(file);
              }}
              className="sr-only"
              data-testid="chapter-file-input"
            />

            {!fileName ? (
              <div className="flex flex-col items-center text-center gap-2.5 py-2">
                <div className="w-11 h-11 rounded-xl bg-[#EBF5FF] dark:bg-sky-950/60 text-[#15629E] dark:text-sky-300 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Drop a book PDF or chapter photo here
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Supports PDF, EPUB, PNG, JPG, WEBP, DOCX, TXT (up to 25 MB)
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-[#15629E] hover:bg-[#115082] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Browse Book / Image
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSampleChapter}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Use sample chapter scan
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt={`Preview of ${fileName}`}
                    className="w-28 h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 bg-white"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                    {detectedKind === 'image' ? (
                      <FileImage className="w-6 h-6" />
                    ) : (
                      <FileText className="w-6 h-6" />
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {fileName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                    {formatBytesLabel(fileSizeBytes)} ·{' '}
                    {detectedKind === 'image'
                      ? 'Chapter Image'
                      : detectedKind === 'pdf'
                      ? 'Book / PDF Document'
                      : 'Study Document'}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-[#15629E] dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      Replace file
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFileName('');
                        setFileSizeBytes(0);
                        setPreviewDataUrl(undefined);
                      }}
                      className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Title & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="upload-chapter-title"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
              >
                Chapter / Book Title <span className="text-rose-600">*</span>
              </label>
              <input
                id="upload-chapter-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(null);
                }}
                placeholder="e.g., Chapter 6: Triangle Congruence Proofs"
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
              />
            </div>

            <div>
              <label
                htmlFor="upload-chapter-subject"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
              >
                Subject <span className="text-rose-600">*</span>
              </label>
              <select
                id="upload-chapter-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
              >
                {NOTES_SUBJECTS.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chapter / Page Reference */}
          <div>
            <label
              htmlFor="upload-chapter-ref"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
            >
              Chapter / Page Reference
            </label>
            <input
              id="upload-chapter-ref"
              type="text"
              value={chapterRef}
              onChange={(e) => setChapterRef(e.target.value)}
              placeholder="e.g., Chapter 4 · Pages 82–90"
              className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
            />
          </div>

          {/* Save Destination (full width so labels never clip) */}
          <div>
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Save Destination
            </span>
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
              role="radiogroup"
              aria-label="Save destination"
            >
              {(
                [
                  { id: 'both', label: 'Note + Resource' },
                  { id: 'note', label: 'Save as Note' },
                  { id: 'resource', label: 'Save as Resource' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={destination === opt.id}
                  onClick={() => {
                    playUiSound('click');
                    setDestination(opt.id);
                  }}
                  className={`h-10 px-3.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    destination === opt.id
                      ? 'bg-[#FFF5E0] dark:bg-amber-950/40 border-[#E69300] text-[#9A5B00] dark:text-amber-300'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes / AI Extraction */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label
                htmlFor="upload-chapter-notes"
                className="text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Chapter Highlights / Study Notes
              </label>
              <button
                type="button"
                onClick={handleExtractAiNotes}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15629E] dark:text-sky-400 hover:underline cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Extract AI Chapter Notes
              </button>
            </div>
            <textarea
              id="upload-chapter-notes"
              rows={3}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Write key formulas, definitions, or click 'Extract AI Chapter Notes' to draft structured takeaways..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:text-rose-300"
            >
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-[#F5B74C] text-[#B86E00] dark:text-amber-300 font-semibold text-sm hover:bg-[#FFF9EC] dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-xl bg-[#E69300] hover:bg-[#CC8200] text-slate-950 font-semibold text-sm transition-colors cursor-pointer shadow-xs"
            >
              Save to Library
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Resource Viewer & Chapter Reader Drawer                                 */
/* -------------------------------------------------------------------------- */

interface ResourceViewerDrawerProps {
  resource: LearningResourceItem;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
  onConvertToNote: (resource: LearningResourceItem) => void;
  onStudyInSession: (resource: LearningResourceItem) => void;
  onLaunchQuiz: (resource: LearningResourceItem) => void;
  onDownload: (resource: LearningResourceItem) => void;
}

export function ResourceViewerDrawer({
  resource,
  onClose,
  onToggleBookmark,
  onConvertToNote,
  onStudyInSession,
  onLaunchQuiz,
  onDownload,
}: ResourceViewerDrawerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(resource.progressPercent ?? 35);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 1));
    }, 900);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/55"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-drawer-title"
      data-testid="resource-viewer-drawer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col">
        <div className="bg-[#0B2A4A] px-6 py-5 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white/15 text-white">
                {resource.subject}
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-400/20 text-amber-200">
                {resource.resourceType === 'chapter-image'
                  ? 'Chapter Image'
                  : resource.resourceType === 'book'
                  ? 'Uploaded Book'
                  : resource.resourceType === 'video'
                  ? 'Video Lecture'
                  : 'PDF Resource'}
              </span>
            </div>
            <h2
              id="resource-drawer-title"
              className="font-display text-base font-bold text-white mt-2 leading-snug"
            >
              {resource.title}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {resource.authorOrMeta} · {resource.sizeOrDuration}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close resource reader"
            className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Preview Block */}
          {resource.previewDataUrl ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
              <img
                src={resource.previewDataUrl}
                alt={resource.title}
                className="w-full max-h-64 object-contain bg-white"
              />
            </div>
          ) : resource.resourceType === 'video' ? (
            <div className="rounded-xl bg-[#0B2A4A] text-white p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-lg bg-[#15629E] flex items-center justify-center">
                    <Video className="w-4 h-4 text-amber-300" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Lecture Playback</p>
                    <p className="text-xs text-slate-300">{resource.chapterRef}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold tabular-nums text-amber-300">
                  {progress}% watched
                </span>
              </div>
              <input
                type="range"
                aria-label="Lecture playback progress"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-[#E69300] cursor-pointer"
              />
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playUiSound('click');
                    setIsPlaying((p) => !p);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E69300] hover:bg-[#CC8200] text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlaying ? 'Pause' : 'Resume Lecture'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProgress(0);
                    setIsPlaying(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restart
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4F9FF] dark:bg-slate-800/70 p-4 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {resource.chapterRef || 'Full Document Ready'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Saved in your library · Available inside Tutoring Sessions &amp; Practice
                </p>
              </div>
            </div>
          )}

          {/* Summary & Highlights */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Chapter Overview</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {resource.summary}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Key Highlights</h3>
            <ul className="space-y-2">
              {resource.chapterHighlights.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                playUiSound('success');
                onConvertToNote(resource);
              }}
              className="h-10 px-4 rounded-xl bg-[#15629E] hover:bg-[#115082] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Create Note from Chapter
            </button>
            <button
              type="button"
              onClick={() => {
                playUiSound('switch');
                onClose();
                onStudyInSession(resource);
              }}
              className="h-10 px-4 rounded-xl bg-[#E69300] hover:bg-[#CC8200] text-slate-950 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Review in AI Session
            </button>
            <button
              type="button"
              onClick={() => {
                playUiSound('switch');
                onClose();
                onLaunchQuiz(resource);
              }}
              className="h-10 px-4 rounded-xl border border-[#F5B74C] text-[#B86E00] dark:text-amber-300 text-sm font-semibold hover:bg-[#FFF9EC] dark:hover:bg-amber-950/30 transition-colors cursor-pointer whitespace-nowrap"
            >
              Practice Quick Quiz
            </button>
            <button
              type="button"
              onClick={() => {
                playUiSound('click');
                onDownload(resource);
              }}
              className="h-10 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Download Copy
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              onToggleBookmark(resource.id);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              resource.bookmarked
                ? 'bg-[#FFF5E0] border-[#E69300] text-[#9A5B00] dark:bg-amber-950/40 dark:text-amber-300'
                : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            {resource.bookmarked ? 'Bookmarked' : 'Bookmark Resource'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. AI-Powered Study Kit Modal (Lesson Summary & Interactive Flashcards)    */
/* -------------------------------------------------------------------------- */

interface StudyKitModalProps {
  mode: 'summary' | 'flashcards';
  kit: StudyKitBundle;
  onClose: () => void;
  onSaveSummaryNote: () => void;
  onStartQuiz: () => void;
  onStartSession: () => void;
}

export function StudyKitModal({
  mode,
  kit,
  onClose,
  onSaveSummaryNote,
  onStartQuiz,
  onStartSession,
}: StudyKitModalProps) {
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const currentCard = kit.flashcards[cardIndex] ?? kit.flashcards[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="study-kit-modal-title"
      data-testid="study-kit-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
        <div className="bg-[#0B2A4A] px-6 py-4 flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Study Kit · {kit.subject}
            </span>
            <h2
              id="study-kit-modal-title"
              className="font-display text-lg font-bold text-white mt-0.5"
            >
              {mode === 'summary' ? 'Lesson Summary' : 'Interactive Flashcards'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close study kit"
            className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {mode === 'summary' ? (
            <>
              <div className="rounded-xl bg-[#FFF8EB] dark:bg-amber-950/30 border border-[#F5E0B5] dark:border-amber-800 p-4">
                <p className="text-xs font-semibold text-[#B86E00] dark:text-amber-300 uppercase tracking-wide">
                  Generated from {kit.sourceNoteTitle}
                </p>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mt-1">
                  {kit.summaryHeadline}
                </h3>
              </div>

              <ul className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {kit.summaryPoints.map((pt, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#15629E] dark:text-sky-400 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    playUiSound('success');
                    onSaveSummaryNote();
                    onClose();
                  }}
                  className="flex-1 h-10 px-4 rounded-xl bg-[#15629E] hover:bg-[#115082] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Save Summary as Note
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playUiSound('switch');
                    onClose();
                    onStartSession();
                  }}
                  className="flex-1 h-10 px-4 rounded-xl bg-[#E69300] hover:bg-[#CC8200] text-slate-950 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Review in AI Session
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                <span>
                  Card {cardIndex + 1} of {kit.flashcards.length}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400">
                  {masteredIds.length} Mastered
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  playUiSound('switch');
                  setFlipped((f) => !f);
                }}
                className="w-full min-h-[210px] rounded-2xl border-2 border-[#D4E6FA] dark:border-slate-700 bg-gradient-to-br from-[#F4F9FF] to-white dark:from-slate-800 dark:to-slate-900 p-6 flex flex-col items-center justify-center text-center gap-3 hover:border-[#15629E] transition-colors cursor-pointer"
              >
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#EBF5FF] dark:bg-sky-950/60 text-[#15629E] dark:text-sky-300">
                  {flipped ? 'Answer · Tap to flip back' : `${currentCard.tag} · Tap to reveal`}
                </span>
                <p className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug max-w-md">
                  {flipped ? currentCard.back : currentCard.front}
                </p>
              </button>

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={cardIndex === 0}
                    onClick={() => {
                      playUiSound('click');
                      setFlipped(false);
                      setCardIndex((i) => Math.max(0, i - 1));
                    }}
                    className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={cardIndex >= kit.flashcards.length - 1}
                    onClick={() => {
                      playUiSound('click');
                      setFlipped(false);
                      setCardIndex((i) => Math.min(kit.flashcards.length - 1, i + 1));
                    }}
                    className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound('success');
                      setMasteredIds((prev) =>
                        prev.includes(currentCard.id) ? prev : [...prev, currentCard.id]
                      );
                      if (cardIndex < kit.flashcards.length - 1) {
                        setFlipped(false);
                        setCardIndex((i) => i + 1);
                      }
                    }}
                    className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Got It
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound('switch');
                      onClose();
                      onStartQuiz();
                    }}
                    className="h-9 px-3.5 rounded-lg bg-[#E69300] hover:bg-[#CC8200] text-slate-950 text-xs font-semibold cursor-pointer"
                  >
                    Take Quick Quiz
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. Reusable Quick Notes Companion Drawer (for Live Sessions & Practice)    */
/* -------------------------------------------------------------------------- */

interface QuickNotesCompanionDrawerProps {
  open: boolean;
  contextLabel: string;
  defaultSubject: string;
  defaultTopic?: string;
  notes: RichNoteItem[];
  resources: LearningResourceItem[];
  onClose: () => void;
  onCreateNote: (subject: string, title: string, content: string, sourceLabel: string) => void;
  onOpenFullLibrary?: () => void;
}

export function QuickNotesCompanionDrawer({
  open,
  contextLabel,
  defaultSubject,
  defaultTopic = '',
  notes,
  resources,
  onClose,
  onCreateNote,
  onOpenFullLibrary,
}: QuickNotesCompanionDrawerProps) {
  const [tab, setTab] = useState<'review' | 'new'>('review');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(notes[0]?.id ?? null);

  const [newTitle, setNewTitle] = useState(
    defaultTopic ? `${defaultTopic} — ${contextLabel} Notes` : ''
  );
  const [newSubject, setNewSubject] = useState(
    NOTES_SUBJECTS.includes(defaultSubject as (typeof NOTES_SUBJECTS)[number])
      ? defaultSubject
      : 'Mathematics'
  );
  const [newBody, setNewBody] = useState('');
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const filteredNotes = notes.filter((n) =>
    !q ? true : `${n.title} ${n.subject} ${n.introParagraph}`.toLowerCase().includes(q)
  );
  const filteredResources = resources.filter((r) =>
    !q ? true : `${r.title} ${r.subject} ${r.summary}`.toLowerCase().includes(q)
  );

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;
    onCreateNote(newSubject, newTitle.trim(), newBody.trim(), contextLabel);
    playUiSound('success');
    setSavedBanner(true);
    setNewTitle('');
    setNewBody('');
    setTab('review');
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex justify-end bg-slate-950/55"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-notes-companion-title"
      data-testid="quick-notes-companion-drawer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col">
        <div className="bg-[#0B2A4A] px-5 py-4 flex items-start justify-between gap-3 shrink-0">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
              {contextLabel} Companion
            </span>
            <h2
              id="quick-notes-companion-title"
              className="font-display text-base font-bold text-white mt-0.5"
            >
              My Notes &amp; Uploaded Books
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick notes drawer"
            className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-[#FFF8EB] dark:bg-slate-900 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              playUiSound('switch');
              setTab('review');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              tab === 'review'
                ? 'bg-[#E69300] text-slate-950'
                : 'text-slate-700 dark:text-slate-300 hover:bg-amber-100/70 dark:hover:bg-slate-800'
            }`}
          >
            Review Saved ({notes.length + resources.length})
          </button>
          <button
            type="button"
            onClick={() => {
              playUiSound('switch');
              setTab('new');
              setSavedBanner(false);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              tab === 'new'
                ? 'bg-[#E69300] text-slate-950'
                : 'text-slate-700 dark:text-slate-300 hover:bg-amber-100/70 dark:hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Make New Note
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {savedBanner && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Saved to Notes &amp; Resources!
            </div>
          )}

          {tab === 'review' ? (
            <>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search saved notes or uploaded chapters..."
                  className="w-full h-9 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
                />
              </div>

              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Saved Notes
                </h3>
                {filteredNotes.map((note) => {
                  const isOpen = expandedId === note.id;
                  return (
                    <div
                      key={note.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedId(isOpen ? null : note.id)}
                        className="w-full p-3.5 text-left flex items-start justify-between gap-2 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <span className="text-[11px] font-semibold text-[#15629E] dark:text-sky-400">
                            {note.subject}
                          </span>
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {note.title}
                          </p>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {isOpen ? 'Hide' : 'Read'}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 dark:border-slate-700/70 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                          {note.coverImageUrl && (
                            <img
                              src={note.coverImageUrl}
                              alt={note.title}
                              className="w-full max-h-36 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
                            />
                          )}
                          <p className="leading-relaxed">{note.introParagraph}</p>
                          {note.keyComponents.slice(0, 3).map((kc) => (
                            <p key={kc.id}>
                              <strong className="text-slate-900 dark:text-white">
                                {kc.term}:
                              </strong>{' '}
                              {kc.detail}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Uploaded Books &amp; Chapter Scans
                </h3>
                {filteredResources.map((res) => (
                  <div
                    key={res.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-[#15629E] dark:text-sky-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {res.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {res.subject} · {res.sizeOrDuration}
                        </p>
                      </div>
                    </div>
                    {res.previewDataUrl && (
                      <img
                        src={res.previewDataUrl}
                        alt={res.title}
                        className="w-full max-h-32 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
                      />
                    )}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {res.summary}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleSaveNew} className="space-y-3.5">
              <div>
                <label
                  htmlFor="companion-note-subject"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                >
                  Subject
                </label>
                <select
                  id="companion-note-subject"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white"
                >
                  {NOTES_SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="companion-note-title"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                >
                  Note Title
                </label>
                <input
                  id="companion-note-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Quadratic Formula Shortcut"
                  className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="companion-note-body"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                >
                  Key Takeaways &amp; Formulas
                </label>
                <textarea
                  id="companion-note-body"
                  required
                  rows={6}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Jot down what clicked during this session or practice..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-[#E69300] hover:bg-[#CC8200] text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
              >
                Save Note to Library
              </button>
            </form>
          )}
        </div>

        {onOpenFullLibrary && (
          <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Synced live with Notes &amp; Resources
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullLibrary();
              }}
              className="text-xs font-semibold text-[#15629E] dark:text-sky-400 hover:underline cursor-pointer"
            >
              Open Full Library →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
