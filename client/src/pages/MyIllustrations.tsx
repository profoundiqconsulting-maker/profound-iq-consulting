import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Expand,
  Filter,
  Folder,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";

import {
  downloadIllustrationStudySheet,
  downloadIllustrationStudySheetPng,
} from "@/lib/illustrationStudySheet";
import { courseCatalog, type CourseDefinition } from "@shared/courseCatalog";
import {
  getLessonIllustrationCopy,
  localizeCourseDefinition,
} from "@shared/contentLocalization";
import {
  DashboardHero,
  Section,
  StatCard,
  FilterBar,
} from "@/components/dashboard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IllustrationMode = "explanatory" | "applicational" | "experiential";
type GalleryCard = {
  id: number;
  courseSlug: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  mode: IllustrationMode;
  modeLabel: string;
  title: string;
  content: string;
  folder: string;
  visualUrl?: string;
  visualAlt?: string;
  updatedAt: Date | string;
};

const modeLabels: Record<IllustrationMode, string> = {
  explanatory: "Explanatory",
  applicational: "Applicational",
  experiential: "Experiential",
};
const modeStyles: Record<
  IllustrationMode,
  { border: string; tint: string; accent: string }
> = {
  explanatory: {
    border: "border-[#c9a34e]/50",
    tint: "bg-[#fffaf0]",
    accent: "text-accent dark:text-accent-on-dark",
  },
  applicational: {
    border: "border-[#2f6f78]/35",
    tint: "bg-[#edf4ee]",
    accent: "text-[#1d5a6e] dark:text-accent-on-dark",
  },
  experiential: {
    border: "border-[#8b4f63]/35",
    tint: "bg-[#fff3f5]",
    accent: "text-[#6b3a4d] dark:text-accent-on-dark",
  },
};
const findLesson = (course: CourseDefinition | undefined, lessonId: string) =>
  course?.modules
    .flatMap(module => module.lessons)
    .find(lesson => lesson.id === lessonId);
const pageSize = 24;

type CardProps = {
  card: GalleryCard;
  selected: boolean;
  folders: string[];
  editingFolderId: number | null;
  folderDraft: string;
  pngBusy: boolean;
  onToggleSelect: (id: number) => void;
  onZoom: (card: GalleryCard) => void;
  onDelete: (card: GalleryCard) => void;
  onStartFolderEdit: (card: GalleryCard) => void;
  onFolderDraftChange: (value: string) => void;
  onSaveFolder: (card: GalleryCard) => void;
  onDownloadPng: (card: GalleryCard) => void;
  onDragStart: (id: number) => void;
  onDragOver: (event: React.DragEvent<HTMLElement>, id: number) => void;
  onDrop: (id: number) => void;
  onMove: (id: number, direction: -1 | 1) => void;
};

function IllustrationCard({
  card,
  selected,
  folders,
  editingFolderId,
  folderDraft,
  pngBusy,
  onToggleSelect,
  onZoom,
  onDelete,
  onStartFolderEdit,
  onFolderDraftChange,
  onSaveFolder,
  onDownloadPng,
  onDragStart,
  onDragOver,
  onDrop,
  onMove,
}: CardProps) {
  const style = modeStyles[card.mode];
  const studySheetInput = {
    imageUrl: card.visualUrl ?? "",
    courseTitle: card.courseTitle,
    lessonTitle: card.lessonTitle,
    modeLabel: card.modeLabel,
    content: card.content,
    filename: `${card.courseSlug}-${card.lessonId}-study-sheet.svg`,
  };
  return (
    <Card
      draggable
      onDragStart={() => onDragStart(card.id)}
      onDragOver={event => onDragOver(event, card.id)}
      onDrop={() => onDrop(card.id)}
      className={`overflow-hidden border transition-all duration-200 hover:shadow-lg ${selected ? "ring-2 ring-[#c9a34e]" : ""} ${style.border} ${style.tint}`}
    >
      <div className="relative">
        {card.visualUrl ? (
          <button
            type="button"
            onClick={() => onZoom(card)}
            className="group block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a34e]"
            aria-label={`Zoom ${card.lessonTitle}`}
          >
            <img
              src={card.visualUrl}
              alt={card.visualAlt ?? card.lessonTitle}
              width={1600}
              height={900}
              loading="lazy"
              className="aspect-[16/9] w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-[#16243d]/85 px-2 py-1 text-[9px] font-black uppercase tracking-[.1em] text-[#f7f3e8]">
              <Expand size={12} /> View
            </span>
          </button>
        ) : (
          <div className="grid aspect-[16/9] place-items-center bg-[#16243d] p-6 text-center text-[#f7f3e8]">
            <BookOpen size={25} className="text-accent-on-dark" aria-hidden="true" />
            <p className="mt-3 max-w-xs text-sm leading-6">
              {card.modeLabel} learning prompt
            </p>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <label className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(card.id)}
              aria-label={`Select ${card.lessonTitle}`}
              className="mt-1 accent-[#a27e2e]"
            />
            <span>
              <p
                className={`text-[10px] font-black uppercase tracking-[.14em] ${style.accent}`}
              >
                {card.modeLabel}
              </p>
              <h2 className="display mt-2 text-2xl leading-tight text-[#16243d]">
                {card.lessonTitle}
              </h2>
            </span>
          </label>
          <button
            type="button"
            onClick={() => onDelete(card)}
            aria-label={`Remove ${card.lessonTitle}`}
            className="shrink-0 text-[#7d5e1e] transition hover:text-[#6b3a4d]"
          >
            <Bookmark size={18} fill="currentColor" />
          </button>
        </div>
        <p className="mt-2 text-xs font-semibold text-muted-foreground">
          {card.courseTitle}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#16243d]">{card.content}</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Folder size={13} className="text-[#7d5e1e]" />
          <span>{card.folder}</span>
          <button
            type="button"
            onClick={() => onStartFolderEdit(card)}
            className="ml-auto text-[10px] font-black uppercase tracking-[.1em] text-[#16243d] underline decoration-[#c9a34e] underline-offset-4"
          >
            Organize
          </button>
        </div>
        {editingFolderId === card.id && (
          <div className="mt-3 border border-[#c9a34e]/40 bg-white/70 p-3">
            <label
              className="block text-[10px] font-black uppercase tracking-[.12em] text-muted-foreground"
              htmlFor={`folder-${card.id}`}
            >
              Create or move to folder
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id={`folder-${card.id}`}
                value={folderDraft}
                onChange={event => onFolderDraftChange(event.target.value)}
                maxLength={80}
                className="min-w-0 flex-1 border border-[#16243d]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#c9a34e]"
                placeholder="e.g. Leadership ideas"
                list={`folders-${card.id}`}
              />
              <datalist id={`folders-${card.id}`}>
                {folders.map(folder => (
                  <option key={folder} value={folder} />
                ))}
              </datalist>
              <button
                type="button"
                onClick={() => onSaveFolder(card)}
                className="inline-flex items-center gap-1 bg-[#16243d] px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8]"
              >
                {updateLabel}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Type a new name to create a folder, or reuse an existing one.
            </p>
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#16243d]/10 pt-4">
          <Link
            href={`/courses/${card.courseSlug}`}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[#16243d] hover:text-[#7d5e1e]"
          >
            Open lesson <ArrowUpRight size={13} />
          </Link>
          {card.visualUrl && (
            <>
              <button
                type="button"
                onClick={() => downloadIllustrationStudySheet(studySheetInput)}
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[#16243d] hover:text-[#7d5e1e]"
              >
                <Download size={13} /> SVG
              </button>
              <button
                type="button"
                onClick={() => onDownloadPng(card)}
                disabled={pngBusy}
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[#16243d] hover:text-[#7d5e1e] disabled:opacity-50"
              >
                {pngBusy ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Download size={13} />
                )}{" "}
                PNG</button>
            </>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[#16243d]/10 pt-3">
          <span
            className="cursor-grab text-[10px] font-black uppercase tracking-[.1em] text-muted-foreground"
            title="Drag to reorder within this folder"
          >
            Drag to reorder
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onMove(card.id, -1)}
              aria-label={`Move ${card.lessonTitle} earlier`}
              className="border border-[#16243d]/15 p-1 text-muted-foreground hover:text-[#16243d] transition-colors"
            >
              <ChevronUp size={15} />
            </button>
            <button
              type="button"
              onClick={() => onMove(card.id, 1)}
              aria-label={`Move ${card.lessonTitle} later`}
              className="border border-[#16243d]/15 p-1 text-muted-foreground hover:text-[#16243d] transition-colors"
            >
              <ChevronDown size={15} />
            </button>
          </div>
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">
          Saved {new Date(card.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
}
const updateLabel = "Save";

export default function MyIllustrations() {
  const { user, loading, isAuthenticated } = useAuth();
  const locale = "en";

  const [query, setQuery] = useState("");
  const [folderQuery, setFolderQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<"all" | IllustrationMode>("all");
  const [folderFilter, setFolderFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [zoomed, setZoomed] = useState<GalleryCard | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [folderDraft, setFolderDraft] = useState("");
  const [bulkFolder, setBulkFolder] = useState("");
  const [folderManageName, setFolderManageName] = useState("");
  const [moveCelebration, setMoveCelebration] = useState(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [pngBusyId, setPngBusyId] = useState<number | null>(null);
  const deferredQuery = useDeferredValue(query);
  const bookmarksQuery = trpc.course.illustrationBookmarksPage.useQuery(
    {
      page,
      pageSize,
      search: deferredQuery.trim() || undefined,
      illustrationMode: modeFilter,
      folder: folderFilter === "all" ? undefined : folderFilter,
    },
    { enabled: isAuthenticated, placeholderData: previous => previous }
  );
  const allMatchingIdsQuery = trpc.course.illustrationBookmarkIds.useQuery(
    {
      search: deferredQuery.trim() || undefined,
      illustrationMode: modeFilter,
      folder: folderFilter === "all" ? undefined : folderFilter,
    },
    { enabled: isAuthenticated }
  );
  const deleteBookmark = trpc.course.deleteIllustrationBookmark.useMutation({
    onSuccess: () => {
      void bookmarksQuery.refetch();
      toast.success("Illustration removed");
    },
    onError: error =>
      toast.error("Could not remove illustration", {
        description: error.message,
      }),
  });
  const updateFolder = trpc.course.updateIllustrationBookmarkFolder.useMutation(
    {
      onSuccess: () => {
        void bookmarksQuery.refetch();
        setEditingFolderId(null);
        toast.success("Folder updated");
      },
      onError: error =>
        toast.error("Could not update folder", { description: error.message }),
    }
  );
  const bulkMove = trpc.course.bulkMoveIllustrationBookmarks.useMutation({
    onSuccess: () => {
      setSelectedIds([]);
      setBulkFolder("");
      setMoveCelebration(true);
      window.setTimeout(() => setMoveCelebration(false), 1800);
      void bookmarksQuery.refetch();
      toast.success("Illustrations moved");
    },
    onError: error =>
      toast.error("Could not move illustrations", {
        description: error.message,
      }),
  });
  const renameFolder = trpc.course.renameIllustrationFolder.useMutation({
    onSuccess: () => {
      setFolderManageName("");
      void bookmarksQuery.refetch();
      toast.success("Folder renamed");
    },
    onError: error =>
      toast.error("Could not rename folder", { description: error.message }),
  });
  const deleteFolder = trpc.course.deleteIllustrationFolder.useMutation({
    onSuccess: result => {
      setFolderManageName("");
      void bookmarksQuery.refetch();
      toast.success("Folder deleted", {
        description: `${result.reassigned} illustration${result.reassigned === 1 ? "" : "s"} moved to Unsorted.`,
      });
    },
    onError: error =>
      toast.error("Could not delete folder", { description: error.message }),
  });
  const reorder = trpc.course.reorderIllustrationBookmarks.useMutation({
    onSuccess: () => {
      void bookmarksQuery.refetch();
      toast.success("Folder order saved");
    },
    onError: error =>
      toast.error("Could not save order", { description: error.message }),
  });

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
    setFolderManageName(folderFilter === "all" ? "" : folderFilter);
  }, [deferredQuery, modeFilter, folderFilter]);
  useEffect(() => {
    if (bookmarksQuery.data && page > bookmarksQuery.data.pageCount)
      setPage(bookmarksQuery.data.pageCount);
  }, [bookmarksQuery.data, page]);
  useEffect(() => {
    if (!zoomed) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomed(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomed]);

  const cards = useMemo<GalleryCard[]>(
    () =>
      (bookmarksQuery.data?.rows ?? []).map(bookmark => {
        const locale = "en";
        const baseCourse = courseCatalog.find(
          course => course.slug === bookmark.courseSlug
        );
        const localizedCourse = baseCourse
          ? localizeCourseDefinition(locale, baseCourse)
          : undefined;
        const lesson = findLesson(localizedCourse, bookmark.lessonId);
        const mode = (
          bookmark.illustrationMode in modeLabels
            ? bookmark.illustrationMode
            : "explanatory"
        ) as IllustrationMode;
        return {
          id: bookmark.id,
          courseSlug: bookmark.courseSlug,
          courseTitle: localizedCourse?.title ?? bookmark.courseSlug,
          lessonId: bookmark.lessonId,
          lessonTitle: lesson?.title ?? bookmark.title,
          mode,
          modeLabel:
            getLessonIllustrationCopy(locale)[mode] || modeLabels[mode],
          title: bookmark.title,
          content: lesson?.illustration[mode] ?? bookmark.content,
          folder: bookmark.folder || "Unsorted",
          visualUrl:
            mode === "explanatory" ? lesson?.illustration.visualUrl : undefined,
          visualAlt:
            mode === "explanatory" ? lesson?.illustration.visualAlt : undefined,
          updatedAt: bookmark.updatedAt,
        };
      }),
    [bookmarksQuery.data?.rows]
  );
  const allFolders = bookmarksQuery.data?.folders ?? [];
  const folders = useMemo(
    () =>
      allFolders.filter(folder =>
        folder.toLowerCase().includes(folderQuery.trim().toLowerCase())
      ),
    [allFolders, folderQuery]
  );
  const visibleSelectedIds = selectedIds.filter(id =>
    cards.some(card => card.id === id)
  );
  const allMatchingIds = allMatchingIdsQuery.data ?? [];
  const allMatchingSelected =
    allMatchingIds.length > 0 &&
    allMatchingIds.every(id => selectedIds.includes(id));

  const toggleSelect = (id: number) =>
    setSelectedIds(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id]
    );
  const selectPage = () => {
    const pageSelected =
      cards.length > 0 && cards.every(card => selectedIds.includes(card.id));
    setSelectedIds(current =>
      pageSelected
        ? current.filter(id => !cards.some(card => card.id === id))
        : Array.from(new Set([...current, ...cards.map(card => card.id)]))
    );
  };
  const selectAllMatches = () =>
    setSelectedIds(current =>
      allMatchingSelected
        ? current.filter(id => !allMatchingIds.includes(id))
        : Array.from(new Set([...current, ...allMatchingIds]))
    );
  const clearSelection = () => setSelectedIds([]);
  const submitBulkMove = () => {
    const folder = bulkFolder.trim();
    if (!folder || !selectedIds.length) {
      toast.error("Select illustrations and enter a folder name");
      return;
    }
    bulkMove.mutate({ bookmarkIds: selectedIds, folder });
  };
  const reorderCards = (sourceId: number, targetId: number) => {
    if (sourceId === targetId || !folderFilter || folderFilter === "all")
      return;
    const order = cards.map(card => card.id);
    const sourceIndex = order.indexOf(sourceId);
    const targetIndex = order.indexOf(targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    order.splice(sourceIndex, 1);
    order.splice(targetIndex, 0, sourceId);
    reorder.mutate({ folder: folderFilter, orderedBookmarkIds: order });
  };
  const moveCard = (id: number, direction: -1 | 1) => {
    if (folderFilter === "all") {
      toast.info("Choose a folder before reordering");
      return;
    }
    const order = cards.map(card => card.id);
    const index = order.indexOf(id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    reorder.mutate({ folder: folderFilter, orderedBookmarkIds: order });
  };
  const downloadPng = async (card: GalleryCard) => {
    if (!card.visualUrl) return;
    setPngBusyId(card.id);
    try {
      await downloadIllustrationStudySheetPng({
        imageUrl: card.visualUrl,
        courseTitle: card.courseTitle,
        lessonTitle: card.lessonTitle,
        modeLabel: card.modeLabel,
        content: card.content,
        filename: `${card.courseSlug}-${card.lessonId}-study-sheet.svg`,
      });
      toast.success("PNG study sheet downloaded");
    } catch (error) {
      toast.error("PNG export failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setPngBusyId(null);
    }
  };

  if (loading)
    return (
      <DashboardLayout role="user" title="My Illustrations">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#7d5e1e]" />
        </div>
      </DashboardLayout>
    );
  if (!isAuthenticated || !user)
    return (
      <DashboardLayout role="user" title="My Illustrations">
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <BookOpen size={48} className="text-[#16243d]/60" />
          <p className="text-sm text-[#16243d]">Sign in to view your saved illustrations.</p>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout role="user" title="My Illustrations">
      <DashboardHero
        eyebrow="Growth"
        title="My Illustrations"
        description={"Your saved visual study cards from every course."}
        stats={[
          { label: "Saved cards", value: bookmarksQuery.data?.total ?? 0 },
          { label: "Folders", value: allFolders.length },
          { label: "Modes", value: "3" },
        ]}
      />

      <Section
        eyebrow="Library"
        title="Filter illustrations"
        description="Search by course, lesson, or content. Filter by mode or folder."
        className="mb-8"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#16243d]/60" />
                <Input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search courses, lessons, or illustration notes"
                  className="pl-9 h-9 bg-white dark:bg-[#16243d]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(["all", "explanatory", "applicational", "experiential"] as const).map(mode => (
                  <Button
                    key={mode}
                    variant={modeFilter === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setModeFilter(mode)}
                    className={
                      modeFilter === mode
                        ? "bg-[#16243d] text-[#f7f3e8]"
                        : "border-[#16243d]/25"
                    }
                  >
                    {mode === "all" ? "All modes" : getLessonIllustrationCopy(locale)[mode]}
                  </Button>
                ))}
                <Select value={folderFilter} onValueChange={setFolderFilter}>
                  <SelectTrigger className="h-9 min-w-[140px] bg-white dark:bg-[#16243d]">
                    <SelectValue placeholder="All folders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All folders</SelectItem>
                    {allFolders.map(folder => (
                      <SelectItem key={folder} value={folder}>
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#16243d]/60" />
                <Input
                  value={folderQuery}
                  onChange={event => setFolderQuery(event.target.value)}
                  placeholder="Search custom folders"
                  className="pl-9 h-9 bg-white dark:bg-[#16243d]"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {folders.length} matching folder{folders.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {folderFilter !== "all" && (
        <Section
          eyebrow="Organization"
          title={`Manage folder: ${folderFilter}`}
          description="Rename this folder or delete it and safely move its illustrations to Unsorted."
          className="mb-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:max-w-xl">
                <Input
                  value={folderManageName}
                  onChange={event => setFolderManageName(event.target.value)}
                  placeholder="New folder name"
                  className="bg-white dark:bg-[#16243d]"
                />
                <Button
                  onClick={() => {
                    const next = folderManageName.trim();
                    if (!next || next === folderFilter) {
                      toast.error("Enter a different folder name");
                      return;
                    }
                    renameFolder.mutate({
                      fromFolder: folderFilter,
                      toFolder: next,
                    });
                  }}
                  disabled={renameFolder.isPending || deleteFolder.isPending}
                  className="bg-[#16243d] text-[#f7f3e8]"
                >
                  {renameFolder.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Rename"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete ${folderFilter}? Its illustrations will move to Unsorted.`
                      )
                    )
                      deleteFolder.mutate({ folder: folderFilter });
                  }}
                  disabled={renameFolder.isPending || deleteFolder.isPending}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  {deleteFolder.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Section>
      )}

      {cards.length > 0 && (
        <Section
          eyebrow="Bulk actions"
          title="Organize illustrations"
          description="Select multiple cards to move them to a folder at once."
          className="mb-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold">
                <input
                  type="checkbox"
                  checked={
                    cards.length > 0 &&
                    cards.every(card => selectedIds.includes(card.id))
                  }
                  onChange={selectPage}
                  className="accent-[#a27e2e]"
                />{" "}
                Select page
              </label>
              <span className="text-xs text-muted-foreground">
                {selectedIds.length} selected
                {allMatchingIds.length > cards.length
                  ? ` of ${allMatchingIds.length} matching`
                  : ""}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllMatches}
                disabled={
                  allMatchingIdsQuery.isLoading || !allMatchingIds.length
                }
                className="border-[#16243d]/20"
              >
                {allMatchingSelected ? "Deselect all" : "Select all results"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                disabled={!selectedIds.length}
                className="border-[#16243d]/20 motion-safe:animate-[pulse_650ms_ease-out]"
              >
                Clear selection
              </Button>
            </div>
            <div className="flex min-w-0 flex-1 gap-2 sm:ml-auto sm:max-w-xl">
              <Input
                value={bulkFolder}
                onChange={event => setBulkFolder(event.target.value)}
                list="bulk-folders"
                placeholder="Folder for selected illustrations"
                maxLength={80}
                className="bg-white dark:bg-[#16243d]"
              />
              <datalist id="bulk-folders">
                {bookmarksQuery.data?.folders?.map(folder => (
                  <option key={folder} value={folder} />
                ))}
              </datalist>
              <Button
                onClick={submitBulkMove}
                disabled={!selectedIds.length || bulkMove.isPending}
                className="bg-[#16243d] text-[#f7f3e8]"
              >
                {bulkMove.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Folder size={14} />
                )}{" "}
                Move selected
              </Button>
            </div>
          </div>
        </Section>
      )}

      {moveCelebration && (
        <div
          role="status"
          aria-live="polite"
          className="mb-6 flex items-center gap-3 border border-[#2f6f78]/35 bg-[#edf4ee] px-4 py-3 text-sm font-semibold text-[#1d5a6e]"
        >
          <CheckCircle2 size={18} /> Illustrations moved into their folder.
        </div>
      )}

      {bookmarksQuery.isLoading ? (
        <Section title="Loading illustrations" isEmpty>
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="animate-spin text-[#7d5e1e]" size={24} />
            <p className="text-sm text-muted-foreground">Loading your illustrations...</p>
          </div>
        </Section>
      ) : cards.length === 0 ? (
        <Section
          eyebrow="Library"
          title={"No illustrations saved yet."}
          description="Open a course lesson, choose an illustration that helps you learn, and select Save to build this collection."
        >
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f7f3e8] transition-transform hover:scale-110">
              <Bookmark size={28} className="text-[#16243d]/70" />
            </div>
            <p className="text-sm text-[#16243d] max-w-sm">
              You have not saved any illustrations yet. Explore courses to start building your visual study library.
            </p>
            <Link href="/courses">
              <Button className="bg-[#16243d] text-[#f7f3e8] hover:bg-[#0f1a2e] transition-colors">
                {"Courses"} <ArrowUpRight size={14} />
              </Button>
            </Link>
          </div>
        </Section>
      ) : (
        <>
          <p className="mb-4 text-xs text-muted-foreground">
            Reordering is available when one custom folder is selected. Drag
            a card or use the arrow controls; changes are saved across
            devices.
          </p>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.map(card => (
              <IllustrationCard
                key={card.id}
                card={card}
                selected={visibleSelectedIds.includes(card.id)}
                folders={bookmarksQuery.data?.folders ?? []}
                editingFolderId={editingFolderId}
                folderDraft={folderDraft}
                pngBusy={pngBusyId === card.id}
                onToggleSelect={toggleSelect}
                onZoom={setZoomed}
                onDelete={item =>
                  deleteBookmark.mutate({
                    courseSlug: item.courseSlug,
                    lessonId: item.lessonId,
                    illustrationMode: item.mode,
                  })
                }
                onStartFolderEdit={item => {
                  setEditingFolderId(item.id);
                  setFolderDraft(item.folder);
                }}
                onFolderDraftChange={setFolderDraft}
                onSaveFolder={item => {
                  const folder = folderDraft.trim();
                  if (!folder) {
                    toast.error("Enter a folder name");
                    return;
                  }
                  updateFolder.mutate({ bookmarkId: item.id, folder });
                }}
                onDownloadPng={item => void downloadPng(item)}
                onDragStart={setDraggedId}
                onDragOver={(event, id) => {
                  event.preventDefault();
                  if (draggedId !== null && draggedId !== id)
                    event.dataTransfer.dropEffect = "move";
                }}
                onDrop={id => {
                  if (draggedId !== null) reorderCards(draggedId, id);
                  setDraggedId(null);
                }}
                onMove={moveCard}
              />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#16243d]/15 pt-5">
            <p className="text-xs text-muted-foreground">
              Showing {((page - 1) * pageSize) + 1}–
              {Math.min(page * pageSize, bookmarksQuery.data?.total ?? 0)}{" "}
              of {bookmarksQuery.data?.total ?? 0} saved illustrations
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(current => Math.max(1, current - 1))}
                disabled={page <= 1 || bookmarksQuery.isFetching}
                className="border-[#16243d]/20"
              >
                <ChevronLeft size={14} /> Previous
              </Button>
              <span className="px-2 text-xs font-bold text-muted-foreground">
                Page {page} of {bookmarksQuery.data?.pageCount ?? 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage(current =>
                    Math.min(
                      bookmarksQuery.data?.pageCount ?? current,
                      current + 1
                    )
                  )
                }
                disabled={
                  page >= (bookmarksQuery.data?.pageCount ?? 1) ||
                  bookmarksQuery.isFetching
                }
                className="border-[#16243d]/20"
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </>
      )}
      <p className="mt-8 text-xs text-muted-foreground">
        Your collection is available across every course workspace.
      </p>

      {zoomed && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-[#071225]/85 p-4"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setZoomed(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-artwork-title"
            className="w-full max-w-5xl border border-[#c9a34e]/70 bg-[#16243d] p-4 text-[#f7f3e8] shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-[#8b6914]">{zoomed.modeLabel}</p>
                <h2
                  id="gallery-artwork-title"
                  className="display mt-2 text-3xl"
                >
                  {zoomed.lessonTitle}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {zoomed.courseTitle}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomed(null)}
                className="border-white/20 text-[#f7f3e8] hover:bg-white/10"
              >
                <X size={14} /> {"Close"}
              </Button>
            </div>
            {zoomed.visualUrl && (
              <img
                src={zoomed.visualUrl}
                alt={zoomed.visualAlt ?? zoomed.lessonTitle}
                className="mt-6 max-h-[64vh] w-full object-contain"
              />
            )}
            <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">
              {zoomed.content}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {zoomed.visualUrl && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      downloadIllustrationStudySheet({
                        imageUrl: zoomed.visualUrl ?? "",
                        courseTitle: zoomed.courseTitle,
                        lessonTitle: zoomed.lessonTitle,
                        modeLabel: zoomed.modeLabel,
                        content: zoomed.content,
                        filename: `${zoomed.courseSlug}-${zoomed.lessonId}-study-sheet.svg`,
                      })
                    }
                    className="border-white/25 text-[#f7f3e8] hover:bg-white/10"
                  >
                    <Download size={14} /> SVG
                  </Button>
                  <Button
                    onClick={() => void downloadPng(zoomed)}
                    disabled={pngBusyId === zoomed.id}
                    className="bg-[#c9a34e] text-[#16243d] hover:bg-[#b18d3d]"
                  >
                    {pngBusyId === zoomed.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}{" "}
                    PNG
                  </Button>
                </>
              )}
              <Link
                href={`/courses/${zoomed.courseSlug}`}
                onClick={() => setZoomed(null)}
              >
                <Button
                  variant="outline"
                  className="border-white/25 text-[#f7f3e8] hover:bg-white/10"
                >
                  Open lesson <ArrowUpRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
