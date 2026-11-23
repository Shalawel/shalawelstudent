import { useMemo, useState } from 'react';
import {
  BookOpen,
  Bookmark,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileImage,
  FileText,
  FolderOpen,
  Heart,
  HelpCircle,
  Layers,
  LayoutGrid,
  List,
  MessageSquarePlus,
  MoreVertical,
  Pin,
  Play,
  PlusCircle,
  Search,
  Share2,
  Sparkles,
  Upload,
  Users,
} from 'lucide-react';
import type { SmartQuizInput, StartSessionInput } from '../types/dashboard';
import {
  buildMarkdownExport,
  buildStudyKitForNote,
  createBlankRichNote,
  createQuickSessionNote,
  filterNotesForTab,
  filterResourcesForTab,
  type LearningResourceItem,
  type NotesFilterTab,
  type NotesLayoutMode,
  type RichNoteItem,
} from '../utils/notesResourcesLogic';
import { NoteEditorView } from './NoteEditorView';
import {
  ResourceViewerDrawer,
  StudyKitModal,
  UploadBookChapterModal,
} from './NotesResourcesOverlays';
import { playUiSound } from '../utils/uiSounds';

interface NotesResourcesViewProps {
  notes: RichNoteItem[];
  resources: LearningResourceItem[];
  gradeLabel: string;
  onUpdateNotes: (updater: (prev: RichNoteItem[]) => RichNoteItem[]) => void;
  onUpdateResources: (
    updater: (prev: LearningResourceItem[]) => LearningResourceItem[]
  ) => void;
  onStartTopicSession: (input: StartSessionInput) => void;
  onLaunchSmartQuiz: (input: SmartQuizInput) => void;
  onNotify: (message: string) => void;
}

function triggerFileDownload(fileName: string, content: string, mimeType = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const TAB_ITEMS: { id: NotesFilterTab; label: string; icon: typeof FileText }[] = [
  { id: 'my-notes', label: 'My Notes', icon: FileText },
  { id: 'bookmarked', label: 'Bookmarked', icon: Bookmark },
  { id: 'resources', label: 'Resources', icon: FolderOpen },
  { id: 'shared', label: 'Shared with me', icon: Users },
];

export function NotesResourcesView({
  notes,
  resources,
  gradeLabel,
  onUpdateNotes,
  onUpdateResources,
  onStartTopicSession,
  onLaunchSmartQuiz,
  onNotify,
}: NotesResourcesViewProps) {
  const [activeTab, setActiveTab] = useState<NotesFilterTab>('my-notes');
  const [layoutMode, setLayoutMode] = useState<NotesLayoutMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [resourcePage, setResourcePage] = useState(0);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeResourceId, setActiveResourceId] = useState<string | null>(null);
  const [studyKitModalMode, setStudyKitModalMode] = useState<'summary' | 'flashcards' | null>(null);
  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null);
  const [openResMenuId, setOpenResMenuId] = useState<string | null>(null);

  const editingNote = useMemo(
    () => notes.find((n) => n.id === editingNoteId) ?? null,
    [notes, editingNoteId]
  );

  const activeResource = useMemo(
    () => resources.find((r) => r.id === activeResourceId) ?? null,
    [resources, activeResourceId]
  );

  const filteredNotes = useMemo(
    () => filterNotesForTab(notes, activeTab, searchQuery),
    [notes, activeTab, searchQuery]
  );

  const filteredResources = useMemo(
    () => filterResourcesForTab(resources, activeTab, searchQuery),
    [resources, activeTab, searchQuery]
  );

  // Study Kit dynamically generated from the student's latest Science/first note
  const studyKit = useMemo(() => {
    const preferred =
      notes.find((n) => n.subject === 'Science') ?? notes[0] ?? createBlankRichNote();
    return buildStudyKitForNote(preferred);
  }, [notes]);

  const visibleNotes =
    showAllNotes || activeTab !== 'my-notes' || searchQuery.trim().length > 0
      ? filteredNotes
      : filteredNotes.slice(0, 2);

  const resourcesPerPage = activeTab === 'resources' ? 8 : 2;
  const maxResPage = Math.max(0, Math.ceil(filteredResources.length / resourcesPerPage) - 1);
  const safeResPage = Math.min(resourcePage, maxResPage);
  const visibleResources = filteredResources.slice(
    safeResPage * resourcesPerPage,
    safeResPage * resourcesPerPage + resourcesPerPage
  );

  const handleCreateNewNote = () => {
    playUiSound('click');
    const fresh = createBlankRichNote('English', gradeLabel);
    onUpdateNotes((prev) => [fresh, ...prev]);
    setEditingNoteId(fresh.id);
    onNotify('Created a new blank learning unit');
  };

  const handleExportNotes = (targetNotes: RichNoteItem[], fileName = 'TutorCloud_Notes_Export.md') => {
    if (targetNotes.length === 0) {
      onNotify('No notes available to export.');
      return;
    }
    const markdown = buildMarkdownExport(targetNotes);
    triggerFileDownload(fileName, markdown);
    playUiSound('success');
    onNotify(`Exported ${targetNotes.length} ${targetNotes.length === 1 ? 'note' : 'notes'} as Markdown`);
  };

  const handleSaveUploadedChapter = (result: {
    createdNote?: RichNoteItem;
    createdResource?: LearningResourceItem;
  }) => {
    if (result.createdNote) {
      onUpdateNotes((prev) => [result.createdNote!, ...prev]);
    }
    if (result.createdResource) {
      onUpdateResources((prev) => [result.createdResource!, ...prev]);
    }
    setShowUploadModal(false);
    setResourcePage(0);

    if (result.createdNote && result.createdResource) {
      setShowAllNotes(true);
      onNotify(`Saved "${result.createdNote.title}" to both Notes and Learning Resources`);
    } else if (result.createdNote) {
      setShowAllNotes(true);
      onNotify(`Saved "${result.createdNote.title}" to My Notes`);
    } else if (result.createdResource) {
      setActiveTab('resources');
      onNotify(`Saved "${result.createdResource.title}" to Learning Resources`);
    }
  };

  const handleConvertResourceToNote = (res: LearningResourceItem) => {
    const converted = createQuickSessionNote({
      subject: res.subject,
      title: res.title.replace(/\.[^.]+$/, ''),
      content: `${res.summary}\n${res.chapterHighlights.map((h) => `- ${h}`).join('\n')}`,
      sourceLabel: 'Book Chapter',
      grade: gradeLabel,
    });
    if (res.previewDataUrl) {
      converted.coverImageUrl = res.previewDataUrl;
    }
    converted.attachments = [
      {
        id: `att-res-${Date.now()}`,
        name: res.title,
        sizeLabel: res.sizeOrDuration,
        kind: res.resourceType === 'chapter-image' ? 'image' : 'pdf',
        pinned: true,
        dataUrl: res.previewDataUrl,
        chapterRef: res.chapterRef,
        uploadedAt: res.uploadedAt,
      },
    ];
    onUpdateNotes((prev) => [converted, ...prev]);
    setActiveResourceId(null);
    setEditingNoteId(converted.id);
    onNotify(`Created study note from "${res.title}"`);
  };

  const handleReviewNoteInSession = (note: RichNoteItem) => {
    onStartTopicSession({
      helpType: 'Learn a Lesson',
      subject: note.subject,
      lessonSource: 'another-topic',
      topic: note.title,
      specificQuestion: `${note.overviewHeading}: ${note.introParagraph}`,
      gradeLevel: gradeLabel,
    });
  };

  const handleReviewResourceInSession = (res: LearningResourceItem) => {
    onStartTopicSession({
      helpType: 'Learn a Lesson',
      subject: res.subject,
      lessonSource: 'another-topic',
      topic: res.title.replace(/\.[^.]+$/, ''),
      specificQuestion: res.summary,
      gradeLevel: gradeLabel,
    });
  };

  const handleToggleNotePin = (id: string) => {
    playUiSound('click');
    onUpdateNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleToggleNoteBookmark = (id: string) => {
    playUiSound('click');
    onUpdateNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, bookmarked: !n.bookmarked } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    playUiSound('subtle');
    onUpdateNotes((prev) => prev.filter((n) => n.id !== id));
    setOpenCardMenuId(null);
    onNotify('Note removed from library');
  };

  const handleToggleResourceBookmark = (id: string) => {
    playUiSound('click');
    onUpdateResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, bookmarked: !r.bookmarked } : r))
    );
  };

  const handleDeleteResource = (id: string) => {
    playUiSound('subtle');
    onUpdateResources((prev) => prev.filter((r) => r.id !== id));
    setOpenResMenuId(null);
    onNotify('Resource removed from library');
  };

  const handleDownloadResource = (res: LearningResourceItem) => {
    if (res.previewDataUrl) {
      const link = document.createElement('a');
      link.href = res.previewDataUrl;
      link.download = res.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      triggerFileDownload(
        `${res.title.replace(/\.[^.]+$/, '')}_Summary.txt`,
        `${res.title}\nSubject: ${res.subject}\n${res.authorOrMeta}\n\n${res.summary}\n\nHighlights:\n${res.chapterHighlights
          .map((h) => `- ${h}`)
          .join('\n')}`,
        'text/plain;charset=utf-8'
      );
    }
    onNotify(`Downloaded "${res.title}"`);
  };

  return (
    <div className="space-y-5" data-testid="notes-resources-view">
      {/* Persistent Top Header Strip matching Images 1 & 2 */}
      <div className="rounded-2xl bg-[#EDF5FC] dark:bg-slate-900/80 border border-[#D9E9F8] dark:border-slate-800 px-5 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Notes &amp; Resources
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Review your notes, saved resources, and shared learning materials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCreateNewNote}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[#F5B74C] bg-white dark:bg-slate-800 text-[#D98200] dark:text-amber-300 text-sm font-semibold hover:bg-[#FFF9EC] dark:hover:bg-amber-950/30 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            <MessageSquarePlus className="w-4 h-4" />
            New Notes
          </button>

          <button
            type="button"
            onClick={() => {
              playUiSound('click');
              setShowUploadModal(true);
            }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </button>

          <button
            type="button"
            onClick={() =>
              handleExportNotes(editingNote ? [editingNote] : notes)
            }
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export Notes
          </button>

          <button
            type="button"
            aria-label="Download complete study library"
            title="Download all notes"
            onClick={() => handleExportNotes(notes, 'TutorCloud_Full_Study_Library.md')}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conditional Body: Interactive Note Editor (Image 2) OR Hub Gallery (Image 1) */}
      {editingNote ? (
        <NoteEditorView
          key={editingNote.id}
          note={editingNote}
          onBackToHub={() => setEditingNoteId(null)}
          onSaveNote={(updated) => {
            onUpdateNotes((prev) =>
              prev.map((n) => (n.id === updated.id ? updated : n))
            );
            onNotify(`Saved changes to "${updated.title}"`);
          }}
          onExportSingleNote={(target) =>
            handleExportNotes([target], `${target.shortTitle.replace(/\s+/g, '_')}.md`)
          }
          onReviewInSession={handleReviewNoteInSession}
          onLaunchQuizFromNote={(target) =>
            onLaunchSmartQuiz({ subject: target.subject, topic: target.shortTitle })
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Filter Bar Card matching Image 1 */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-xs">
            <div
              role="tablist"
              aria-label="Notes and resources categories"
              className="flex flex-wrap items-center gap-2"
            >
              {TAB_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      playUiSound('switch');
                      setActiveTab(item.id);
                      setResourcePage(0);
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border ${
                      active
                        ? 'bg-[#FFF5E0] dark:bg-amber-950/40 border-[#F5B74C] text-[#9A5B00] dark:text-amber-300'
                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        active ? 'text-[#E69300]' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 md:w-52">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  aria-label="Search notes and uploaded books"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes or chapters..."
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15629E]"
                />
              </div>

              {/* List / Grid Switcher */}
              <div
                className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shrink-0"
                role="group"
                aria-label="Notes layout switcher"
              >
                <button
                  type="button"
                  aria-label="List layout"
                  aria-pressed={layoutMode === 'list'}
                  onClick={() => {
                    playUiSound('switch');
                    setLayoutMode('list');
                  }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    layoutMode === 'list'
                      ? 'bg-[#E69300] text-slate-950'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Grid layout"
                  aria-pressed={layoutMode === 'grid'}
                  onClick={() => {
                    playUiSound('switch');
                    setLayoutMode('grid');
                  }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    layoutMode === 'grid'
                      ? 'bg-[#E69300] text-slate-950'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* MY NOTES SECTION */}
          {activeTab !== 'resources' && (
            <section aria-label="My Notes" className="space-y-3.5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {activeTab === 'bookmarked'
                    ? 'Bookmarked Notes'
                    : activeTab === 'shared'
                    ? 'Shared Notes'
                    : 'My Notes'}
                </h2>
                {activeTab === 'my-notes' && filteredNotes.length > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      setShowAllNotes((v) => !v);
                    }}
                    className="text-sm font-semibold text-[#15629E] dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    {showAllNotes ? 'Show Less' : `View All (${filteredNotes.length})`}
                  </button>
                )}
              </div>

              {visibleNotes.length === 0 && activeTab !== 'my-notes' ? (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-8 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    No notes in this view yet
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bookmark a note or upload a chapter photo/book to populate this tab.
                  </p>
                </div>
              ) : layoutMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleNotes.map((note) => {
                    const bannerBg =
                      note.coverTone === 'mint'
                        ? 'bg-[#EDF6F0] dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                        : note.coverTone === 'amber'
                        ? 'bg-[#FFF6E5] dark:bg-amber-950/30 text-[#B86E00] dark:text-amber-300'
                        : 'bg-[#EEF4FC] dark:bg-sky-950/30 text-[#15629E] dark:text-sky-300';

                    return (
                      <article
                        key={note.id}
                        className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                      >
                        {/* Top Tinted Preview Banner OR Chapter Image Thumbnail */}
                        <div className={`relative h-28 flex items-center justify-center ${bannerBg}`}>
                          {note.coverImageUrl ? (
                            <button
                              type="button"
                              onClick={() => {
                                playUiSound('click');
                                setEditingNoteId(note.id);
                              }}
                              aria-label={`Open note ${note.title}`}
                              className="w-full h-full cursor-pointer"
                            >
                              <img
                                src={note.coverImageUrl}
                                alt={note.title}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                playUiSound('click');
                                setEditingNoteId(note.id);
                              }}
                              aria-label={`Open note ${note.title}`}
                              className="w-full h-full flex items-center justify-center cursor-pointer"
                            >
                              {note.subject === 'Mathematics' ? (
                                <Calculator className="w-7 h-7 opacity-75" />
                              ) : (
                                <FileText className="w-7 h-7 opacity-75" />
                              )}
                            </button>
                          )}

                          {/* Pin & More buttons */}
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                            <button
                              type="button"
                              aria-label={note.pinned ? `Unpin ${note.shortTitle}` : `Pin ${note.shortTitle}`}
                              onClick={() => handleToggleNotePin(note.id)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                note.pinned
                                  ? 'bg-white/90 dark:bg-slate-900/80 text-[#15629E] dark:text-sky-400 shadow-xs'
                                  : 'bg-white/60 dark:bg-slate-900/50 text-slate-500 hover:text-[#15629E]'
                              }`}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              aria-label={`More actions for ${note.shortTitle}`}
                              onClick={() =>
                                setOpenCardMenuId((curr) => (curr === note.id ? null : note.id))
                              }
                              className="w-7 h-7 rounded-lg bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {openCardMenuId === note.id && (
                            <div className="absolute right-2.5 top-11 z-20 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg py-1 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  setEditingNoteId(note.id);
                                }}
                                className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                              >
                                Open &amp; Edit Note
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  handleReviewNoteInSession(note);
                                }}
                                className="w-full px-3 py-2 text-left text-[#15629E] dark:text-sky-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                              >
                                Review in AI Session
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenCardMenuId(null);
                                  onLaunchSmartQuiz({
                                    subject: note.subject,
                                    topic: note.shortTitle,
                                  });
                                }}
                                className="w-full px-3 py-2 text-left text-[#B86E00] dark:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                              >
                                Launch Quick Quiz
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteNote(note.id)}
                                className="w-full px-3 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              >
                                Delete Note
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {note.tags.slice(0, 2).map((tag, i) => (
                                <span
                                  key={tag}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                    i === 0
                                      ? note.coverTone === 'mint'
                                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                                        : 'bg-[#EBF5FF] dark:bg-sky-950/50 text-[#15629E] dark:text-sky-300'
                                      : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                              {note.attachments.length > 0 && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tabular-nums">
                                  {note.attachments.length} file
                                  {note.attachments.length === 1 ? '' : 's'}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                playUiSound('click');
                                setEditingNoteId(note.id);
                              }}
                              className="text-left block w-full group cursor-pointer"
                            >
                              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white group-hover:text-[#15629E] dark:group-hover:text-sky-300 transition-colors">
                                {note.shortTitle}
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {note.previewText}
                              </p>
                            </button>
                          </div>

                          {/* Card Footer */}
                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Last Edited: {note.lastEdited}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                aria-label={
                                  note.bookmarked
                                    ? `Remove bookmark for ${note.shortTitle}`
                                    : `Bookmark ${note.shortTitle}`
                                }
                                aria-pressed={note.bookmarked}
                                onClick={() => handleToggleNoteBookmark(note.id)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                  note.bookmarked
                                    ? 'text-[#E69300] bg-[#FFF5E0] dark:bg-amber-950/40'
                                    : 'text-slate-500 hover:text-[#E69300] hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                <Heart
                                  className="w-4 h-4"
                                  fill={note.bookmarked ? 'currentColor' : 'none'}
                                />
                              </button>
                              <button
                                type="button"
                                aria-label={`Share ${note.shortTitle}`}
                                onClick={() => {
                                  playUiSound('click');
                                  onNotify(`Copied study link for "${note.title}"`);
                                }}
                                className="w-7 h-7 rounded-lg text-slate-500 hover:text-[#15629E] hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {/* Dashed "+ New Learning Unit" Card matching Image 1 */}
                  {activeTab === 'my-notes' && (
                    <button
                      type="button"
                      onClick={handleCreateNewNote}
                      className="min-h-[250px] rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 hover:border-[#15629E] hover:bg-[#F4F9FF] dark:hover:bg-slate-800/70 p-6 flex flex-col items-center justify-center text-center gap-2 transition-colors cursor-pointer group"
                    >
                      <PlusCircle className="w-7 h-7 text-slate-400 group-hover:text-[#15629E] transition-colors" />
                      <span className="font-display text-sm font-bold text-slate-800 dark:text-slate-100">
                        New Learning Unit
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Create a blank canvas
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                /* List Layout */
                <div className="space-y-2.5">
                  {visibleNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <button
                        type="button"
                        onClick={() => setEditingNoteId(note.id)}
                        className="flex items-center gap-3.5 min-w-0 text-left flex-1 cursor-pointer"
                      >
                        {note.coverImageUrl ? (
                          <img
                            src={note.coverImageUrl}
                            alt={note.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <span className="w-11 h-11 rounded-xl bg-[#EEF4FC] dark:bg-sky-950/50 text-[#15629E] dark:text-sky-300 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                              {note.title}
                            </h3>
                            <span className="text-[11px] font-semibold text-[#15629E] dark:text-sky-300">
                              {note.subject}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {note.previewText}
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-400 mr-1">{note.lastEdited}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleNoteBookmark(note.id)}
                          aria-label={`Bookmark ${note.shortTitle}`}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer ${
                            note.bookmarked ? 'text-[#E69300] bg-[#FFF5E0]' : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <Heart className="w-4 h-4" fill={note.bookmarked ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNoteId(note.id)}
                          className="h-8 px-3 rounded-lg bg-[#15629E] text-white text-xs font-semibold hover:bg-[#115082] cursor-pointer"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* LEARNING RESOURCES SECTION matching Image 1 */}
          <section aria-label="Learning Resources" className="space-y-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Learning Resources
                </h2>
                {activeTab === 'resources' && (
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EBF5FF] dark:bg-sky-950/50 text-[#15629E] dark:text-sky-300 text-xs font-semibold hover:bg-[#DCEEFF] cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Add Book / Chapter Scan
                  </button>
                )}
              </div>

              {filteredResources.length > resourcesPerPage && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Previous learning resources"
                    disabled={safeResPage === 0}
                    onClick={() => {
                      playUiSound('click');
                      setResourcePage((p) => Math.max(0, p - 1));
                    }}
                    className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next learning resources"
                    disabled={safeResPage >= maxResPage}
                    onClick={() => {
                      playUiSound('click');
                      setResourcePage((p) => Math.min(maxResPage, p + 1));
                    }}
                    className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {visibleResources.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-8 text-center space-y-2.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  No resources match this filter
                </p>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#15629E] text-white text-xs font-semibold hover:bg-[#115082] cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Book or Chapter Image
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleResources.map((res) => {
                  const isVideo = res.resourceType === 'video';
                  const isChapterImg = res.resourceType === 'chapter-image';

                  return (
                    <article
                      key={res.id}
                      className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 p-4 flex items-center justify-between gap-3.5 shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Resource Thumbnail / Badge */}
                        {res.previewDataUrl ? (
                          <img
                            src={res.previewDataUrl}
                            alt={res.title}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-white"
                          />
                        ) : isVideo ? (
                          <div className="w-14 h-14 rounded-xl bg-[#EEF4FC] dark:bg-sky-950/50 text-[#15629E] dark:text-sky-300 flex items-center justify-center shrink-0">
                            <Play className="w-6 h-6" />
                          </div>
                        ) : isChapterImg ? (
                          <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                            <FileImage className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-extrabold border-2 border-current rounded px-1 py-0.5 leading-none">
                              PDF
                            </span>
                          </div>
                        )}

                        <div className="min-w-0 flex-1 space-y-1">
                          <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                            {res.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {res.authorOrMeta} • {res.sizeOrDuration}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 pt-1">
                            {isVideo ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    playUiSound('click');
                                    setActiveResourceId(res.id);
                                  }}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#15629E] dark:text-sky-400 hover:underline cursor-pointer"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                  Resume
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleResourceBookmark(res.id)}
                                  className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline cursor-pointer ${
                                    res.bookmarked
                                      ? 'text-[#D98200] dark:text-amber-300'
                                      : 'text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <Bookmark className="w-3.5 h-3.5" />
                                  {res.bookmarked ? 'Bookmarked' : 'Bookmark'}
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadResource(res)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#15629E] dark:text-sky-400 hover:underline cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    playUiSound('click');
                                    setActiveResourceId(res.id);
                                  }}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-[#15629E] hover:underline cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Open
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        aria-label={`More options for ${res.title}`}
                        onClick={() =>
                          setOpenResMenuId((curr) => (curr === res.id ? null : res.id))
                        }
                        className="w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openResMenuId === res.id && (
                        <div className="absolute right-3 top-14 z-20 w-48 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg py-1 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenResMenuId(null);
                              setActiveResourceId(res.id);
                            }}
                            className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            Open Reader
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenResMenuId(null);
                              handleConvertResourceToNote(res);
                            }}
                            className="w-full px-3 py-2 text-left text-[#15629E] dark:text-sky-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            Save as Study Note
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenResMenuId(null);
                              handleReviewResourceInSession(res);
                            }}
                            className="w-full px-3 py-2 text-left text-[#B86E00] dark:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            Review in AI Session
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteResource(res.id)}
                            className="w-full px-3 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            Delete Resource
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* AI-POWERED STUDY KIT BANNER matching Image 1 */}
          <section
            aria-label="AI-Powered Study Kit"
            data-testid="ai-study-kit-section"
            className="rounded-2xl bg-gradient-to-br from-[#FFF4DD] via-[#FFF8EC] to-[#FFFDF8] dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/90 border border-[#F5DFB5] dark:border-slate-700 p-5 sm:p-6 space-y-5 shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-[#E8D8B8] dark:border-slate-700 shadow-xs flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#15629E] dark:text-sky-400" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  AI-Powered Study Kit
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#15629E] dark:text-sky-300">
                  Generated from your latest {studyKit.subject} notes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => {
                  playUiSound('click');
                  setStudyKitModalMode('summary');
                }}
                className="text-left rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 p-5 hover:border-[#15629E] hover:shadow-md transition-all cursor-pointer space-y-2.5"
              >
                <BookOpen className="w-5 h-5 text-[#15629E] dark:text-sky-400" />
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Lesson Summary
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Concise breakdown of core concepts and definitions.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  playUiSound('click');
                  setStudyKitModalMode('flashcards');
                }}
                className="text-left rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 p-5 hover:border-[#15629E] hover:shadow-md transition-all cursor-pointer space-y-2.5"
              >
                <Layers className="w-5 h-5 text-[#15629E] dark:text-sky-400" />
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Flashcards
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {studyKit.flashcards.length} practice cards for memorization reinforcement.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  playUiSound('switch');
                  onLaunchSmartQuiz({
                    subject: studyKit.quizSubject,
                    topic: studyKit.quizTopic,
                  });
                }}
                className="text-left rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 p-5 hover:border-[#15629E] hover:shadow-md transition-all cursor-pointer space-y-2.5"
              >
                <HelpCircle className="w-5 h-5 text-[#15629E] dark:text-sky-400" />
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Quick Quiz
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  10 questions to test your subject knowledge.
                </p>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Upload Book / Chapter Image Modal */}
      {showUploadModal && (
        <UploadBookChapterModal
          defaultSubject={editingNote?.subject || 'Science'}
          gradeLabel={gradeLabel}
          onClose={() => setShowUploadModal(false)}
          onSaveUploaded={handleSaveUploadedChapter}
        />
      )}

      {/* Resource Viewer & Chapter Reader Drawer */}
      {activeResource && (
        <ResourceViewerDrawer
          resource={activeResource}
          onClose={() => setActiveResourceId(null)}
          onToggleBookmark={handleToggleResourceBookmark}
          onConvertToNote={handleConvertResourceToNote}
          onStudyInSession={handleReviewResourceInSession}
          onLaunchQuiz={(res) =>
            onLaunchSmartQuiz({
              subject: res.subject,
              topic: res.title.replace(/\.[^.]+$/, ''),
            })
          }
          onDownload={handleDownloadResource}
        />
      )}

      {/* AI Study Kit Modal (Summary & Flashcards) */}
      {studyKitModalMode && (
        <StudyKitModal
          mode={studyKitModalMode}
          kit={studyKit}
          onClose={() => setStudyKitModalMode(null)}
          onSaveSummaryNote={() => {
            const note = createQuickSessionNote({
              subject: studyKit.subject,
              title: `${studyKit.sourceNoteTitle} — AI Summary`,
              content: studyKit.summaryPoints.map((p) => `- ${p}`).join('\n'),
              sourceLabel: 'AI Study Kit',
              grade: gradeLabel,
            });
            onUpdateNotes((prev) => [note, ...prev]);
            onNotify('Saved AI Lesson Summary to My Notes');
          }}
          onStartQuiz={() =>
            onLaunchSmartQuiz({
              subject: studyKit.quizSubject,
              topic: studyKit.quizTopic,
            })
          }
          onStartSession={() =>
            onStartTopicSession({
              helpType: 'Learn a Lesson',
              subject: studyKit.quizSubject,
              lessonSource: 'another-topic',
              topic: studyKit.quizTopic,
              specificQuestion: studyKit.summaryPoints[0] || '',
              gradeLevel: gradeLabel,
            })
          }
        />
      )}
    </div>
  );
}
