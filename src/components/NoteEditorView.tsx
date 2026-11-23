import { useRef, useState } from 'react';
import {
  Bold,
  BookOpen,
  ChevronRight,
  Clock,
  Download,
  FileImage,
  FileText,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  MoreVertical,
  PlayCircle,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Underline,
  X,
} from 'lucide-react';
import {
  countNoteWords,
  detectAttachmentKind,
  formatBytesLabel,
  type NoteAttachment,
  type RichNoteItem,
} from '../utils/notesResourcesLogic';
import { playUiSound } from '../utils/uiSounds';

interface NoteEditorViewProps {
  note: RichNoteItem;
  onBackToHub: () => void;
  onSaveNote: (updated: RichNoteItem) => void;
  onExportSingleNote: (note: RichNoteItem) => void;
  onReviewInSession: (note: RichNoteItem) => void;
  onLaunchQuizFromNote: (note: RichNoteItem) => void;
}

export function NoteEditorView({
  note,
  onBackToHub,
  onSaveNote,
  onExportSingleNote,
  onReviewInSession,
  onLaunchQuizFromNote,
}: NoteEditorViewProps) {
  const [draft, setDraft] = useState<RichNoteItem>(note);
  const [blockFormat, setBlockFormat] = useState<'Heading 2' | 'Paragraph' | 'Callout'>('Heading 2');
  const [activeStyles, setActiveStyles] = useState<{ bold: boolean; italic: boolean; underline: boolean }>({
    bold: false,
    italic: false,
    underline: false,
  });
  const [focusMode, setFocusMode] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');
  const [openMenuAttId, setOpenMenuAttId] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<NoteAttachment | null>(null);
  const [dirty, setDirty] = useState(false);

  const attachInputRef = useRef<HTMLInputElement | null>(null);
  const wordCount = countNoteWords(draft);

  const patchDraft = (updater: (prev: RichNoteItem) => RichNoteItem) => {
    setDirty(true);
    setDraft(updater);
  };

  const handleAttachChapterFile = (file: File) => {
    const kind = detectAttachmentKind(file.name, file.type || '');
    const sizeLabel = formatBytesLabel(file.size);

    const finalize = (dataUrl?: string) => {
      const nextAtt: NoteAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        sizeLabel,
        kind,
        pinned: true,
        dataUrl,
        uploadedAt: 'Just now',
      };
      patchDraft((prev) => ({
        ...prev,
        coverImageUrl: prev.coverImageUrl || (kind === 'image' ? dataUrl : undefined),
        attachments: [nextAtt, ...prev.attachments],
      }));
      playUiSound('success');
    };

    if (kind === 'image') {
      const reader = new FileReader();
      reader.onload = () => finalize(typeof reader.result === 'string' ? reader.result : undefined);
      reader.readAsDataURL(file);
    } else {
      finalize();
    }
  };

  const handleAddKeyComponent = () => {
    playUiSound('click');
    patchDraft((prev) => ({
      ...prev,
      keyComponents: [
        ...prev.keyComponents,
        {
          id: `kc-${Date.now()}`,
          term: 'New Key Concept',
          detail: 'Describe the rule, formula, or definition clearly.',
        },
      ],
    }));
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newTagValue.replace(/^#/, '').trim();
    if (!cleaned) return;
    if (!draft.tags.includes(cleaned)) {
      patchDraft((prev) => ({ ...prev, tags: [...prev.tags, cleaned] }));
    }
    setNewTagValue('');
    setAddingTag(false);
  };

  const handleSave = () => {
    const updated: RichNoteItem = {
      ...draft,
      shortTitle:
        draft.title.split(':')[0]?.trim() ||
        draft.title.slice(0, 26),
      previewText:
        draft.introParagraph.slice(0, 96) + (draft.introParagraph.length > 96 ? '...' : ''),
      lastEdited: 'Today, just now',
    };
    setDraft(updated);
    setDirty(false);
    playUiSound('success');
    onSaveNote(updated);
  };

  const handleInsertBulletPrompt = () => {
    playUiSound('click');
    handleAddKeyComponent();
  };

  const handleInsertLinkSnippet = () => {
    playUiSound('click');
    patchDraft((prev) => ({
      ...prev,
      usageParagraph: `${prev.usageParagraph}${prev.usageParagraph.endsWith(' ') ? '' : ' '}[Reference: Textbook Chapter Guide]`,
    }));
  };

  return (
    <div
      className={`space-y-5 ${focusMode ? 'max-w-4xl mx-auto' : ''}`}
      data-testid="note-editor-view"
    >
      {/* Breadcrumb matching Image 2 */}
      <nav aria-label="Note breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm">
        <button
          type="button"
          onClick={() => {
            playUiSound('click');
            onBackToHub();
          }}
          className="font-medium text-slate-600 dark:text-slate-400 hover:text-[#15629E] dark:hover:text-sky-300 transition-colors cursor-pointer"
        >
          Learning Hub
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-[#15629E] dark:text-sky-400 truncate">
          {draft.shortTitle}
        </span>
      </nav>

      {/* Title, Metadata & Primary Action Bar matching Image 2 */}
      <div className="space-y-3">
        <input
          type="text"
          aria-label="Note title"
          value={draft.title}
          onChange={(e) => patchDraft((prev) => ({ ...prev, title: e.target.value }))}
          className="w-full bg-transparent font-display text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight focus:outline-none focus:ring-2 focus:ring-[#15629E]/30 rounded-lg px-1 -mx-1"
        />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              {draft.subject} | {draft.grade}
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Last Edited: {draft.lastEdited}
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {draft.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EBF5FF] dark:bg-sky-950/50 text-[#15629E] dark:text-sky-300"
                >
                  #{tag}
                  <button
                    type="button"
                    aria-label={`Remove tag ${tag}`}
                    onClick={() =>
                      patchDraft((prev) => ({
                        ...prev,
                        tags: prev.tags.filter((t) => t !== tag),
                      }))
                    }
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {addingTag ? (
                <form onSubmit={handleAddTag} className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    autoFocus
                    value={newTagValue}
                    onChange={(e) => setNewTagValue(e.target.value)}
                    placeholder="Tag..."
                    className="w-24 h-6 px-2 rounded-md border border-[#15629E] bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="text-[11px] font-semibold text-[#15629E] cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingTag(true)}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full border border-dashed border-slate-300 dark:border-slate-600 text-[11px] font-medium text-slate-500 hover:text-[#15629E] cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Tag
                </button>
              )}
            </div>
          </div>

          {/* Right CTA Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playUiSound('switch');
                onReviewInSession(draft);
              }}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-[#15629E] text-[#15629E] dark:text-sky-300 dark:border-sky-500 text-xs font-semibold hover:bg-[#EBF5FF] dark:hover:bg-sky-950/40 transition-colors cursor-pointer whitespace-nowrap"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Review in Session
            </button>
            <button
              type="button"
              onClick={() => {
                playUiSound('switch');
                onLaunchQuizFromNote(draft);
              }}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E69300]" />
              Quick Quiz
            </button>
            <button
              type="button"
              onClick={() => {
                playUiSound('click');
                onExportSingleNote(draft);
              }}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-[#F5B74C] text-[#C27800] dark:text-amber-300 text-xs font-semibold hover:bg-[#FFF9EC] dark:hover:bg-amber-950/30 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#E69300] hover:bg-[#CC8200] text-slate-950 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Rich Formatting Toolbar matching Image 2 */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            aria-label="Bold text"
            aria-pressed={activeStyles.bold}
            onClick={() => setActiveStyles((s) => ({ ...s, bold: !s.bold }))}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeStyles.bold
                ? 'bg-[#FFF5E0] text-[#B86E00]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Italic text"
            aria-pressed={activeStyles.italic}
            onClick={() => setActiveStyles((s) => ({ ...s, italic: !s.italic }))}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeStyles.italic
                ? 'bg-[#FFF5E0] text-[#B86E00]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Underline text"
            aria-pressed={activeStyles.underline}
            onClick={() => setActiveStyles((s) => ({ ...s, underline: !s.underline }))}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeStyles.underline
                ? 'bg-[#FFF5E0] text-[#B86E00]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Underline className="w-4 h-4" />
          </button>

          <span className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" aria-hidden="true" />

          <button
            type="button"
            aria-label="Add bulleted key component"
            onClick={handleInsertBulletPrompt}
            className="w-8 h-8 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Add numbered key component"
            onClick={handleInsertBulletPrompt}
            className="w-8 h-8 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Insert chapter reference link"
            onClick={handleInsertLinkSnippet}
            className="w-8 h-8 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Attach book or chapter image"
            title="Attach book PDF or chapter image"
            onClick={() => attachInputRef.current?.click()}
            className="w-8 h-8 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <input
            ref={attachInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.doc,.docx"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAttachChapterFile(file);
              e.target.value = '';
            }}
          />

          <span className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" aria-hidden="true" />

          <select
            aria-label="Text block style"
            value={blockFormat}
            onChange={(e) =>
              setBlockFormat(e.target.value as 'Heading 2' | 'Paragraph' | 'Callout')
            }
            className="h-8 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-transparent px-2 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="Heading 2">Heading 2</option>
            <option value="Paragraph">Paragraph</option>
            <option value="Callout">Callout</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {dirty ? (
            <span className="text-[11px] font-semibold text-[#B86E00] dark:text-amber-300">
              Unsaved edits
            </span>
          ) : (
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              All changes saved
            </span>
          )}
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            {wordCount} Words
          </span>
          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              setFocusMode((f) => !f);
            }}
            aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
            className="w-8 h-8 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
          >
            {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Pinned Attachments Strip matching Image 2 */}
      {draft.attachments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {draft.attachments.map((att) => (
            <div
              key={att.id}
              className="relative rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between gap-3 shadow-xs"
            >
              <button
                type="button"
                onClick={() => {
                  playUiSound('click');
                  setPreviewAttachment(att);
                }}
                className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
              >
                {att.dataUrl ? (
                  <img
                    src={att.dataUrl}
                    alt={att.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                ) : (
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      att.kind === 'image'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {att.kind === 'image' ? (
                      <FileImage className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {att.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {att.sizeLabel} {att.pinned ? '• Pinned' : ''}
                  </p>
                </div>
              </button>

              <button
                type="button"
                aria-label={`Attachment options for ${att.name}`}
                onClick={() =>
                  setOpenMenuAttId((curr) => (curr === att.id ? null : att.id))
                }
                className="w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {openMenuAttId === att.id && (
                <div className="absolute right-3 top-14 z-20 w-40 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg py-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuAttId(null);
                      setPreviewAttachment(att);
                    }}
                    className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Preview Attachment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuAttId(null);
                      patchDraft((prev) => ({
                        ...prev,
                        attachments: prev.attachments.filter((a) => a.id !== att.id),
                      }));
                    }}
                    className="w-full px-3 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    Remove File
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Structured Document Canvas matching Image 2 */}
      <article className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Amber Overview Heading */}
        <input
          type="text"
          aria-label="Overview heading"
          value={draft.overviewHeading}
          onChange={(e) => patchDraft((prev) => ({ ...prev, overviewHeading: e.target.value }))}
          className="w-full bg-transparent font-display text-lg sm:text-xl font-bold text-[#E69300] focus:outline-none focus:ring-2 focus:ring-amber-300/40 rounded-lg px-1 -mx-1"
        />

        {/* Uploaded Chapter Scan Inline Preview if present */}
        {draft.coverImageUrl && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800/50 p-3">
            <img
              src={draft.coverImageUrl}
              alt={`Uploaded chapter visual for ${draft.title}`}
              className="w-full max-h-72 object-contain rounded-lg bg-white"
            />
          </div>
        )}

        {/* Intro Paragraph */}
        <textarea
          aria-label="Overview paragraph"
          rows={3}
          value={draft.introParagraph}
          onChange={(e) => patchDraft((prev) => ({ ...prev, introParagraph: e.target.value }))}
          className={`w-full bg-transparent text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#15629E]/25 rounded-lg p-1 -m-1 ${
            activeStyles.bold ? 'font-bold' : ''
          } ${activeStyles.italic ? 'italic' : ''} ${activeStyles.underline ? 'underline' : ''}`}
        />

        {/* KEY COMPONENTS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              KEY COMPONENTS
            </h3>
            <button
              type="button"
              onClick={handleAddKeyComponent}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#15629E] dark:text-sky-400 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Point
            </button>
          </div>

          <div className="space-y-3 pl-2 sm:pl-4">
            {draft.keyComponents.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-2"
              >
                <input
                  type="text"
                  aria-label="Component term"
                  value={item.term}
                  onChange={(e) =>
                    patchDraft((prev) => ({
                      ...prev,
                      keyComponents: prev.keyComponents.map((k) =>
                        k.id === item.id ? { ...k, term: e.target.value } : k
                      ),
                    }))
                  }
                  className="sm:w-64 shrink-0 bg-transparent text-sm sm:text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]/25 rounded px-1"
                />
                <input
                  type="text"
                  aria-label="Component explanation"
                  value={item.detail}
                  onChange={(e) =>
                    patchDraft((prev) => ({
                      ...prev,
                      keyComponents: prev.keyComponents.map((k) =>
                        k.id === item.id ? { ...k, detail: e.target.value } : k
                      ),
                    }))
                  }
                  className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#15629E]/25 rounded px-1"
                />
                {draft.keyComponents.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove ${item.term}`}
                    onClick={() =>
                      patchDraft((prev) => ({
                        ...prev,
                        keyComponents: prev.keyComponents.filter((k) => k.id !== item.id),
                      }))
                    }
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-rose-500 hover:text-rose-700 p-1 cursor-pointer transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Example Quote Callout matching Image 2 */}
        <div className="rounded-r-xl border-l-4 border-[#E69300] bg-[#FFF8EB] dark:bg-amber-950/30 px-5 py-4 space-y-2">
          <textarea
            aria-label="Example quote"
            rows={2}
            value={draft.exampleQuote}
            onChange={(e) => patchDraft((prev) => ({ ...prev, exampleQuote: e.target.value }))}
            className="w-full bg-transparent text-sm sm:text-base text-slate-800 dark:text-amber-100 leading-relaxed resize-none focus:outline-none"
          />
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-amber-200">
            <span>—</span>
            <input
              type="text"
              aria-label="Example caption"
              value={draft.exampleCaption}
              onChange={(e) => patchDraft((prev) => ({ ...prev, exampleCaption: e.target.value }))}
              className="bg-transparent font-bold focus:outline-none"
            />
          </div>
        </div>

        {/* USAGE IN ACADEMIC WRITING */}
        <div className="space-y-2.5">
          <input
            type="text"
            aria-label="Usage section heading"
            value={draft.usageHeading}
            onChange={(e) => patchDraft((prev) => ({ ...prev, usageHeading: e.target.value }))}
            className="w-full bg-transparent text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 focus:outline-none"
          />
          <textarea
            aria-label="Usage section body"
            rows={3}
            value={draft.usageParagraph}
            onChange={(e) => patchDraft((prev) => ({ ...prev, usageParagraph: e.target.value }))}
            className="w-full bg-transparent text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#15629E]/25 rounded-lg p-1 -m-1"
          />
        </div>
      </article>

      {/* Attachment Preview Lightbox */}
      {previewAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${previewAttachment.name}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewAttachment(null);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
            <div className="bg-[#0B2A4A] px-5 py-3.5 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-white truncate">{previewAttachment.name}</p>
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                aria-label="Close attachment preview"
                className="w-7 h-7 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {previewAttachment.dataUrl ? (
                <img
                  src={previewAttachment.dataUrl}
                  alt={previewAttachment.name}
                  className="w-full max-h-80 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50"
                />
              ) : (
                <div className="rounded-xl bg-[#F4F9FF] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 text-center space-y-2">
                  <FileText className="w-10 h-10 text-[#15629E] mx-auto" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {previewAttachment.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {previewAttachment.sizeLabel} · {previewAttachment.chapterRef || 'Pinned to note'}
                  </p>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="px-4 py-2 rounded-xl bg-[#15629E] text-white text-xs font-semibold hover:bg-[#115082] cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
