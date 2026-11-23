import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Pencil,
  Play,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  buildAiGeneratedNoteForWeakArea,
  getWeakAreaSubjects,
  groupWeakAreasBySubject,
  validateNoteSubmission,
  validateNoteUploadFile,
  type UploadedNoteFile,
  type WeakAreaItem,
  type WeakAreaNoteSource,
} from '../utils/weakAreaLogic';
import { playUiSound } from '../utils/uiSounds';

interface AccelerateKnowledgeDrawerProps {
  open: boolean;
  weakAreas: WeakAreaItem[];
  onClose: () => void;
  onJoinSession: (area: WeakAreaItem) => void;
  onSaveWeakAreaNote: (
    areaId: string,
    payload: {
      noteTitle: string;
      noteContent: string;
      noteSource: WeakAreaNoteSource;
      uploadedFile?: UploadedNoteFile | null;
    }
  ) => void;
}

type DrawerViewMode = 'list' | 'read' | 'upload';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getSourceBadge(source: WeakAreaNoteSource): {
  label: string;
  className: string;
} {
  if (source === 'student-uploaded') {
    return {
      label: 'Uploaded Note',
      className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }
  if (source === 'student-edited') {
    return {
      label: 'Edited by You',
      className: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }
  return {
    label: 'AI Generated',
    className: 'bg-sky-50 text-[#0369A1] border-sky-200',
  };
}

function getPriorityStyle(priority: WeakAreaItem['priority']): string {
  if (priority === 'High Priority') {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (priority === 'Needs Practice') {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  return 'bg-sky-50 text-sky-800 border-sky-200';
}

export const AccelerateKnowledgeDrawer: React.FC<AccelerateKnowledgeDrawerProps> = ({
  open,
  weakAreas,
  onClose,
  onJoinSession,
  onSaveWeakAreaNote,
}) => {
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<DrawerViewMode>('list');
  const [activeAreaId, setActiveAreaId] = useState<string | null>(null);

  // Read / Edit Note state
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Upload Note state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadText, setUploadText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadedNoteFile | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setViewMode('list');
      setActiveAreaId(null);
      setIsEditingNote(false);
      setEditError(null);
      setUploadError(null);
    }
  }, [open]);

  const subjects = useMemo(() => getWeakAreaSubjects(weakAreas), [weakAreas]);
  const groupedAreas = useMemo(
    () => groupWeakAreasBySubject(weakAreas, subjectFilter),
    [weakAreas, subjectFilter]
  );

  const activeArea = useMemo(
    () => weakAreas.find((a) => a.id === activeAreaId) ?? null,
    [weakAreas, activeAreaId]
  );

  if (!open) return null;

  const openReadNotes = (area: WeakAreaItem) => {
    playUiSound('click');
    setActiveAreaId(area.id);
    setEditTitle(area.noteTitle);
    setEditContent(area.noteContent);
    setIsEditingNote(false);
    setEditError(null);
    setViewMode('read');
  };

  const openUploadNote = (area: WeakAreaItem) => {
    playUiSound('click');
    setActiveAreaId(area.id);
    setUploadTitle(`My Study Note · ${area.topic}`);
    setUploadText('');
    setUploadedFile(null);
    setUploadError(null);
    setViewMode('upload');
  };

  const handleSaveEditedNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArea) return;
    if (editContent.trim().length < 3) {
      setEditError('Please write at least 3 characters for your study note.');
      return;
    }
    setEditError(null);
    playUiSound('success');
    onSaveWeakAreaNote(activeArea.id, {
      noteTitle: editTitle.trim() || activeArea.noteTitle,
      noteContent: editContent.trim(),
      noteSource: 'student-edited',
      uploadedFile: activeArea.uploadedFile ?? null,
    });
    setIsEditingNote(false);
  };

  const handleRegenerateAiNote = () => {
    if (!activeArea) return;
    playUiSound('pop');
    const generated = buildAiGeneratedNoteForWeakArea(activeArea);
    setEditTitle(generated.noteTitle);
    setEditContent(generated.noteContent);
    setIsEditingNote(false);
    setEditError(null);
    onSaveWeakAreaNote(activeArea.id, {
      noteTitle: generated.noteTitle,
      noteContent: generated.noteContent,
      noteSource: 'ai-generated',
      uploadedFile: null,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateNoteUploadFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });
    if (!validation.valid) {
      setUploadError(validation.error || 'Unsupported file.');
      setUploadedFile(null);
      return;
    }

    setUploadError(null);
    const meta: UploadedNoteFile = {
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
    };

    const lowerName = file.name.toLowerCase();
    if (
      file.type.startsWith('text/') ||
      lowerName.endsWith('.txt') ||
      lowerName.endsWith('.md')
    ) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : '';
        if (text.trim()) {
          setUploadText(text.trim());
        }
        setUploadedFile(meta);
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFile({
          ...meta,
          previewDataUrl: typeof reader.result === 'string' ? reader.result : undefined,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedFile(meta);
    }
  };

  const handleSubmitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArea) return;

    const check = validateNoteSubmission(uploadText, uploadedFile);
    if (!check.valid) {
      setUploadError(check.error || 'Please upload a note file or write a note.');
      return;
    }

    const finalContent =
      uploadText.trim() ||
      `Attached study note file: ${uploadedFile?.fileName ?? 'Uploaded Note'} (${
        uploadedFile ? formatBytes(uploadedFile.sizeBytes) : ''
      }). Review this note before your next ${activeArea.subject} session.`;

    const finalTitle =
      uploadTitle.trim() ||
      (uploadedFile ? `Uploaded · ${uploadedFile.fileName}` : `My Note · ${activeArea.topic}`);

    playUiSound('success');
    onSaveWeakAreaNote(activeArea.id, {
      noteTitle: finalTitle,
      noteContent: finalContent,
      noteSource: 'student-uploaded',
      uploadedFile,
    });
    setEditTitle(finalTitle);
    setEditContent(finalContent);
    setIsEditingNote(false);
    setViewMode('read');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accelerate-knowledge-drawer-title"
      data-testid="accelerate-knowledge-drawer"
    >
      {/* Backdrop */}
      <div className="flex-1" onClick={onClose} aria-hidden="true" />

      {/* Right-Side Drawer Panel */}
      <aside className="animate-drawer-slide-in relative w-full max-w-[540px] h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="shrink-0 bg-gradient-to-br from-[#EFF6FF] via-white to-[#FFF8EB] border-b border-slate-200/80 px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#15629E]/25 bg-[#15629E]/10 px-2.5 py-0.5 text-[10.5px] font-bold tracking-wider text-[#085891]">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                ACCELERATE YOUR KNOWLEDGE
              </span>
              <h2
                id="accelerate-knowledge-drawer-title"
                className="mt-2 font-display text-[20px] font-bold text-slate-900 leading-snug"
              >
                Weak Areas &amp; Study Notes
              </h2>
              <p className="mt-1 text-[12.5px] text-slate-600 leading-snug">
                Categorized by subject &amp; topic — join a live session, read AI notes, or edit
                and upload your own.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Accelerate Your Knowledge drawer"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15629E]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Subject Filter Pills (shown in list mode) */}
          {viewMode === 'list' && (
            <div
              role="tablist"
              aria-label="Filter weak areas by subject"
              className="mt-4 flex flex-wrap items-center gap-1.5"
            >
              {['All', ...subjects].map((subj) => {
                const isSelected = subjectFilter === subj;
                const count =
                  subj === 'All'
                    ? weakAreas.length
                    : weakAreas.filter((a) => a.subject === subj).length;
                return (
                  <button
                    key={subj}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => {
                      playUiSound('switch');
                      setSubjectFilter(subj);
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-[#085891] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {subj}{' '}
                    <span
                      className={`ml-1 tabular-nums ${
                        isSelected ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-5 space-y-5">
          {/* VIEW 1: CATEGORIZED WEAK AREAS LIST */}
          {viewMode === 'list' && (
            <div className="space-y-5" data-testid="weak-areas-list">
              {groupedAreas.map((group) => (
                <section
                  key={group.subject}
                  aria-label={`${group.subject} weak areas`}
                  className="space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <h3 className="font-display text-[13.5px] font-bold uppercase tracking-wider text-[#085891]">
                      {group.subject}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {group.items.length} {group.items.length === 1 ? 'topic' : 'topics'} to
                      strengthen
                    </span>
                  </div>

                  <div className="space-y-3">
                    {group.items.map((area) => {
                      const sourceBadge = getSourceBadge(area.noteSource);
                      return (
                        <article
                          key={area.id}
                          data-testid={`weak-area-card-${area.id}`}
                          className="rounded-2xl border border-slate-200/90 bg-[#FAFBFD] p-4 space-y-3 hover:border-[#15629E]/45 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10.5px] font-bold ${getPriorityStyle(
                                    area.priority
                                  )}`}
                                >
                                  {area.priority}
                                </span>
                                <span
                                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10.5px] font-semibold ${sourceBadge.className}`}
                                >
                                  {sourceBadge.label}
                                </span>
                              </div>
                              <h4 className="mt-1.5 text-[14.5px] font-bold text-slate-900 leading-snug">
                                {area.topic}
                              </h4>
                            </div>

                            <div className="shrink-0 text-right">
                              <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Mastery
                              </span>
                              <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                                {area.masteryPercent}%
                              </span>
                            </div>
                          </div>

                          {/* Mastery Progress Bar */}
                          <div className="h-1.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                area.masteryPercent < 55
                                  ? 'bg-red-500'
                                  : area.masteryPercent < 70
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${area.masteryPercent}%` }}
                            />
                          </div>

                          <p className="text-[12px] text-slate-600 leading-relaxed">
                            {area.gapSummary}
                          </p>

                          {area.uploadedFile && (
                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                              <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <span className="truncate max-w-[260px]">
                                {area.uploadedFile.fileName}
                              </span>
                            </div>
                          )}

                          {/* 3 Action Buttons: Join Session, Read Notes, Upload Note */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                playUiSound('pop');
                                onJoinSession(area);
                              }}
                              className="bencho-press inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F19500] hover:bg-[#DC8700] px-3 py-2 text-xs font-bold text-slate-950 shadow-xs transition-colors"
                            >
                              <Play className="h-3.5 w-3.5 fill-slate-950" aria-hidden="true" />
                              <span>Join Session</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openReadNotes(area)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#085891]/35 bg-white hover:bg-blue-50 px-3 py-2 text-xs font-semibold text-[#085891] transition-colors"
                            >
                              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Read Notes</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openUploadNote(area)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors"
                            >
                              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Upload Note</span>
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* VIEW 2: READ & EDIT AI / STUDENT NOTES */}
          {viewMode === 'read' && activeArea && (
            <div className="space-y-4" data-testid="weak-area-note-reader">
              <button
                type="button"
                onClick={() => {
                  playUiSound('click');
                  setViewMode('list');
                  setIsEditingNote(false);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#085891] hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Back to Weak Areas</span>
              </button>

              <div className="rounded-2xl border border-slate-200 bg-[#FAFBFD] p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#085891]">
                    {activeArea.subject} · {activeArea.masteryPercent}% Mastery
                  </span>
                  <span
                    data-testid="active-note-source-badge"
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                      getSourceBadge(activeArea.noteSource).className
                    }`}
                  >
                    {getSourceBadge(activeArea.noteSource).label}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  {activeArea.topic}
                </h3>
                <p className="text-xs text-slate-600">{activeArea.gapSummary}</p>
              </div>

              {isEditingNote ? (
                <form
                  onSubmit={handleSaveEditedNote}
                  data-testid="weak-area-note-editor-form"
                  className="rounded-2xl border border-[#15629E]/30 bg-white p-4 space-y-3"
                >
                  <div>
                    <label
                      htmlFor="weak-area-edit-title"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Note Title
                    </label>
                    <input
                      id="weak-area-edit-title"
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#085891] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="weak-area-edit-content"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Study Notes
                    </label>
                    <textarea
                      id="weak-area-edit-content"
                      rows={7}
                      value={editContent}
                      onChange={(e) => {
                        setEditContent(e.target.value);
                        setEditError(null);
                      }}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs sm:text-[13px] text-slate-900 leading-relaxed focus:border-[#085891] focus:outline-none"
                    />
                  </div>

                  {editError && (
                    <p role="alert" className="text-xs font-semibold text-red-600">
                      {editError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingNote(false);
                        setEditTitle(activeArea.noteTitle);
                        setEditContent(activeArea.noteContent);
                        setEditError(null);
                      }}
                      className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#085891] hover:bg-[#064572] px-4 py-2 text-xs font-bold text-white"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Save My Notes</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{activeArea.noteTitle}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{activeArea.noteUpdatedAt}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playUiSound('click');
                        setEditTitle(activeArea.noteTitle);
                        setEditContent(activeArea.noteContent);
                        setIsEditingNote(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 hover:bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shrink-0"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Edit Note</span>
                    </button>
                  </div>

                  {activeArea.uploadedFile && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                        <FileText className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
                        <span className="truncate">{activeArea.uploadedFile.fileName}</span>
                        <span className="text-[11px] text-emerald-700 shrink-0">
                          ({formatBytes(activeArea.uploadedFile.sizeBytes)})
                        </span>
                      </div>
                      {activeArea.uploadedFile.previewDataUrl && (
                        <img
                          src={activeArea.uploadedFile.previewDataUrl}
                          alt={activeArea.uploadedFile.fileName}
                          className="max-h-40 rounded-lg border border-emerald-200 object-contain bg-white"
                        />
                      )}
                    </div>
                  )}

                  <div
                    data-testid="active-note-content"
                    className="rounded-xl bg-[#FAFBFD] border border-slate-100 p-3.5 text-[13px] text-slate-800 leading-relaxed whitespace-pre-line"
                  >
                    {activeArea.noteContent}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleRegenerateAiNote}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#15629E]/30 bg-blue-50/60 hover:bg-blue-100/70 px-3 py-2 text-xs font-semibold text-[#085891] transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Generate Fresh AI Note</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openUploadNote(activeArea)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Upload Note</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Direct CTA to Join Session from Notes view */}
              <button
                type="button"
                onClick={() => {
                  playUiSound('pop');
                  onJoinSession(activeArea);
                }}
                className="bencho-press w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#F19500] hover:bg-[#DC8700] px-4 py-3 text-[13px] font-bold text-slate-950 shadow-[0_6px_16px_rgba(241,149,0,0.28)] transition-colors"
              >
                <Play className="h-4 w-4 fill-slate-950" aria-hidden="true" />
                <span>Join Live Session for {activeArea.topic}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* VIEW 3: UPLOAD STUDENT NOTE */}
          {viewMode === 'upload' && activeArea && (
            <form
              onSubmit={handleSubmitUpload}
              data-testid="weak-area-note-upload-form"
              className="space-y-4"
            >
              <button
                type="button"
                onClick={() => {
                  playUiSound('click');
                  setViewMode('list');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#085891] hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Back to Weak Areas</span>
              </button>

              <div className="rounded-2xl border border-slate-200 bg-[#FAFBFD] p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#085891]">
                  Upload Study Note · {activeArea.subject}
                </span>
                <h3 className="mt-1 font-display text-base font-bold text-slate-900">
                  {activeArea.topic}
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  Attach your handwritten note photo, PDF, or text notes — or type your own key
                  takeaways below.
                </p>
              </div>

              <div>
                <label
                  htmlFor="upload-note-title"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Note Title
                </label>
                <input
                  id="upload-note-title"
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#085891] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="upload-note-file-input"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Attach Note File (.txt, .md, .pdf, .png, .jpg)
                </label>
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-[#FAFBFD] hover:border-[#085891]/60 p-4 text-center space-y-2 transition-colors">
                  <input
                    ref={fileInputRef}
                    id="upload-note-file-input"
                    type="file"
                    accept=".txt,.md,.pdf,image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#085891]/10 text-[#085891]">
                    <Upload className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    Choose a study note file to attach (max 8 MB)
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#085891]/30 bg-white hover:bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-[#085891]"
                  >
                    <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Select Note File</span>
                  </button>
                </div>

                {uploadedFile && (
                  <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
                      <span className="font-semibold truncate">{uploadedFile.fileName}</span>
                      <span className="text-[11px] text-emerald-700 shrink-0">
                        ({formatBytes(uploadedFile.sizeBytes)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      aria-label="Remove attached file"
                      className="rounded-lg p-1 text-emerald-800 hover:bg-emerald-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="upload-note-content"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Note Content / Key Takeaways
                </label>
                <textarea
                  id="upload-note-content"
                  rows={5}
                  value={uploadText}
                  onChange={(e) => {
                    setUploadText(e.target.value);
                    setUploadError(null);
                  }}
                  placeholder="Write or paste your own notes here (automatically filled if you attach a .txt or .md file)..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-[#085891] focus:outline-none"
                />
              </div>

              {uploadError && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"
                >
                  {uploadError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bencho-press inline-flex items-center gap-1.5 rounded-xl bg-[#085891] hover:bg-[#064572] px-5 py-2.5 text-xs font-bold text-white"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>Save Uploaded Note</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <footer className="shrink-0 border-t border-slate-200/80 bg-[#FAFBFD] px-5 py-3 flex items-center justify-between">
          <span className="text-[11.5px] font-medium text-slate-500">
            {weakAreas.length} weak areas tracked across {subjects.length} subjects
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition-colors"
          >
            Close
          </button>
        </footer>
      </aside>
    </div>
  );
};
