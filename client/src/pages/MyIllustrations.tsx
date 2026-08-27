import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Bookmark, BookOpen, Download, Expand, Filter, Loader2, Search, X } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { DashboardQuickNav } from "@/components/DashboardQuickNav";
import { TransformationNav } from "@/components/TransformationNav";
import { useLocale } from "@/contexts/LocaleContext";
import { trpc } from "@/lib/trpc";
import { downloadIllustrationStudySheet } from "@/lib/illustrationStudySheet";
import { courseCatalog, type CourseDefinition } from "@shared/courseCatalog";
import { getLessonIllustrationCopy, localizeCourseDefinition } from "@shared/contentLocalization";

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
  visualUrl?: string;
  visualAlt?: string;
  updatedAt: Date | string;
};

const modeLabels: Record<IllustrationMode, string> = {
  explanatory: "Explanatory",
  applicational: "Applicational",
  experiential: "Experiential",
};

const modeStyles: Record<IllustrationMode, { border: string; tint: string; accent: string }> = {
  explanatory: { border: "border-[#c9a34e]/50", tint: "bg-[#fffaf0]", accent: "text-[#8a681e]" },
  applicational: { border: "border-[#2f6f78]/35", tint: "bg-[#edf4ee]", accent: "text-[#2f6f78]" },
  experiential: { border: "border-[#8b4f63]/35", tint: "bg-[#fff3f5]", accent: "text-[#8b4f63]" },
};

const findLesson = (course: CourseDefinition | undefined, lessonId: string) => course?.modules.flatMap((module) => module.lessons).find((lesson) => lesson.id === lessonId);

export default function MyIllustrations() {
  const { user, loading, isAuthenticated } = useAuth();
  const { locale, t } = useLocale();
  const [query, setQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<"all" | IllustrationMode>("all");
  const [zoomed, setZoomed] = useState<GalleryCard | null>(null);
  const bookmarksQuery = trpc.course.illustrationBookmarks.useQuery(undefined, { enabled: isAuthenticated });
  const deleteBookmark = trpc.course.deleteIllustrationBookmark.useMutation({
    onSuccess: () => {
      void bookmarksQuery.refetch();
    },
  });

  const cards = useMemo<GalleryCard[]>(() => (bookmarksQuery.data ?? []).map((bookmark) => {
    const baseCourse = courseCatalog.find((course) => course.slug === bookmark.courseSlug);
    const localizedCourse = baseCourse ? localizeCourseDefinition(locale, baseCourse) : undefined;
    const lesson = findLesson(localizedCourse, bookmark.lessonId);
    const mode = (bookmark.illustrationMode in modeLabels ? bookmark.illustrationMode : "explanatory") as IllustrationMode;
    const localizedLabel = getLessonIllustrationCopy(locale)[mode];
    const localizedContent = lesson?.illustration[mode] ?? bookmark.content;
    return {
      id: bookmark.id,
      courseSlug: bookmark.courseSlug,
      courseTitle: localizedCourse?.title ?? bookmark.courseSlug,
      lessonId: bookmark.lessonId,
      lessonTitle: lesson?.title ?? bookmark.title,
      mode,
      modeLabel: localizedLabel || modeLabels[mode],
      title: bookmark.title,
      content: localizedContent,
      visualUrl: mode === "explanatory" ? lesson?.illustration.visualUrl : undefined,
      visualAlt: mode === "explanatory" ? lesson?.illustration.visualAlt : undefined,
      updatedAt: bookmark.updatedAt,
    };
  }), [bookmarksQuery.data, locale, t]);

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return cards.filter((card) => {
      const matchesMode = modeFilter === "all" || card.mode === modeFilter;
      const matchesQuery = !normalizedQuery || [card.courseTitle, card.lessonTitle, card.modeLabel, card.title, card.content].join(" ").toLowerCase().includes(normalizedQuery);
      return matchesMode && matchesQuery;
    });
  }, [cards, modeFilter, query]);

  useEffect(() => {
    if (!zoomed) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomed(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomed]);

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[#f7f3e8] text-[#16243d]"><Loader2 className="animate-spin text-[#a27e2e]" aria-label="Loading workspace" /></div>;
  }

  if (!isAuthenticated || !user) {
    return <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]"><TransformationNav active="assessment" /><main className="container py-16"><div className="mx-auto max-w-xl border-l-2 border-[#c9a34e] bg-[#16243d] p-8 text-[#f7f3e8] shadow-xl"><p className="eyebrow text-[#c9a34e]">{t("myWorkspace")}</p><h1 className="display mt-3 text-4xl">{t("signInToContinue")}</h1><p className="mt-4 text-sm leading-6 text-[#c1cad7]">Sign in to view the visual learning cards you have saved across your courses.</p><Button type="button" onClick={() => startLogin()} className="mt-6 bg-[#c9a34e] text-[#16243d]">{t("signIn")}</Button></div></main></div>;
  }

  const removeBookmark = (card: GalleryCard) => deleteBookmark.mutate({ courseSlug: card.courseSlug, lessonId: card.lessonId, illustrationMode: card.mode });

  return <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]"><TransformationNav active="assessment" /><main className="container py-7 sm:py-12"><div className="mx-auto max-w-7xl"><DashboardQuickNav role={user.role} className="mb-8" /><div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#16243d]/15 pb-7"><div><div className="flex items-center gap-2 text-xs text-[#657084]"><Link href="/dashboard" className="transition hover:text-[#a27e2e]">{t("myWorkspace")}</Link><span aria-hidden="true">/</span><span className="font-semibold text-[#16243d]">{t("myIllustrations")}</span></div><p className="eyebrow mt-7 text-[#a27e2e]">Visual study library</p><h1 className="display mt-3 max-w-3xl text-5xl leading-[.95] tracking-[-.045em] sm:text-7xl">{t("myIllustrations")}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-[#4a566a]">{t("myIllustrationsDescription")}</p></div><div className="border border-[#c9a34e]/45 bg-[#fffaf0] px-5 py-4 text-right"><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#8a681e]">Saved collection</p><p className="display mt-2 text-4xl">{cards.length}</p><p className="text-xs text-[#657084]">visual cards</p></div></div><section className="mt-7 border border-[#16243d]/12 bg-white/55 p-4 sm:p-5" aria-label="Illustration filters"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><label className="flex min-w-0 flex-1 items-center gap-3 border-b border-[#16243d]/20 pb-2 text-sm text-[#657084] lg:max-w-xl"><Search size={17} className="shrink-0 text-[#a27e2e]" /><span className="sr-only">Search saved illustrations</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses, lessons, or illustration notes" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#8f9db3]" /></label><div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[#657084]"><Filter size={14} /> Filter</span>{(["all", "explanatory", "applicational", "experiential"] as const).map((mode) => <button key={mode} type="button" onClick={() => setModeFilter(mode)} className={`border px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] transition ${modeFilter === mode ? "border-[#16243d] bg-[#16243d] text-[#f7f3e8]" : "border-[#16243d]/15 bg-transparent text-[#657084] hover:border-[#c9a34e] hover:text-[#16243d]"}`}>{mode === "all" ? "All modes" : modeLabels[mode]}</button>)}</div></div></section>{bookmarksQuery.isLoading ? <div className="grid place-items-center py-20 text-[#657084]"><Loader2 className="animate-spin text-[#a27e2e]" /></div> : filteredCards.length === 0 ? <div className="mt-8 border border-dashed border-[#16243d]/20 bg-white/40 px-6 py-16 text-center"><Bookmark className="mx-auto text-[#c9a34e]" size={30} /><h2 className="display mt-5 text-3xl">{t("noIllustrations")}</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#657084]">Open a course lesson, choose an illustration that helps you learn, and select Save to build this collection.</p><Link href="/courses" className="mt-6 inline-flex items-center gap-2 border border-[#16243d] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] transition hover:bg-[#16243d] hover:text-[#f7f3e8]">{t("courses")} <ArrowUpRight size={14} /></Link></div> : <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredCards.map((card) => { const style = modeStyles[card.mode]; return <article key={card.id} className={`overflow-hidden border ${style.border} ${style.tint} shadow-[0_12px_30px_rgba(22,36,61,0.06)]`}><div className="relative">{card.visualUrl ? <button type="button" onClick={() => setZoomed(card)} className="group block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a34e]" aria-label={`${t("zoomArtwork")}: ${card.lessonTitle}`}><img src={card.visualUrl} alt={card.visualAlt ?? card.lessonTitle} loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]" /><span className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-[#16243d]/85 px-2 py-1 text-[9px] font-black uppercase tracking-[.1em] text-[#f7f3e8]"><Expand size={12} /> {t("viewIllustration")}</span></button> : <div className="grid aspect-[16/9] place-items-center bg-[#16243d] p-6 text-center text-[#f7f3e8]"><BookOpen size={25} className={card.mode === "applicational" ? "text-[#2f6f78]" : card.mode === "experiential" ? "text-[#8b4f63]" : "text-[#c9a34e]"} aria-hidden="true" /><p className="mt-3 max-w-xs text-sm leading-6">{card.modeLabel} learning prompt</p></div>}</div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className={`text-[10px] font-black uppercase tracking-[.14em] ${style.accent}`}>{card.modeLabel}</p><h2 className="display mt-2 text-2xl leading-tight">{card.lessonTitle}</h2></div><button type="button" onClick={() => removeBookmark(card)} disabled={deleteBookmark.isPending} aria-label={`${t("removeBookmark")}: ${card.lessonTitle}`} title={t("removeBookmark")} className="shrink-0 text-[#8a681e] transition hover:text-[#8b4f63] disabled:opacity-50"><Bookmark size={18} fill="currentColor" /></button></div><p className="mt-2 text-xs font-semibold text-[#657084]">{card.courseTitle}</p><p className="mt-4 text-sm leading-6 text-[#4a566a]">{card.content}</p><div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#16243d]/10 pt-4"><Link href={`/courses/${card.courseSlug}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[#16243d] hover:text-[#a27e2e]">{t("openLesson")} <ArrowUpRight size={13} /></Link>{card.visualUrl && <button type="button" onClick={() => downloadIllustrationStudySheet({ imageUrl: card.visualUrl ?? "", courseTitle: card.courseTitle, lessonTitle: card.lessonTitle, modeLabel: card.modeLabel, content: card.content, filename: `${card.courseSlug}-${card.lessonId}-study-sheet.svg` })} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.11em] text-[#16243d] hover:text-[#a27e2e]"><Download size={13} /> {t("downloadStudySheet")}</button>}</div><p className="mt-4 text-[10px] text-[#8f9db3]">Saved {new Date(card.updatedAt).toLocaleDateString(locale)}</p></div></article>; })}</div>}<p className="mt-8 text-xs leading-5 text-[#657084]">{filteredCards.length} of {cards.length} saved illustrations shown. Your collection is available across every course workspace.</p></div></main>{zoomed && <div className="fixed inset-0 z-[70] grid place-items-center bg-[#071225]/85 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setZoomed(null); }}><div role="dialog" aria-modal="true" aria-labelledby="gallery-artwork-title" className="w-full max-w-5xl border border-[#c9a34e]/70 bg-[#16243d] p-4 text-[#f7f3e8] shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-[#c9a34e]">{zoomed.modeLabel}</p><h2 id="gallery-artwork-title" className="display mt-2 text-3xl">{zoomed.lessonTitle}</h2><p className="mt-1 text-xs text-[#c1cad7]">{zoomed.courseTitle}</p></div><button type="button" onClick={() => setZoomed(null)} aria-label="Close artwork preview" className="inline-flex items-center gap-2 border border-white/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#f7f3e8]"><X size={14} /> {t("close")}</button></div><img src={zoomed.visualUrl} alt={zoomed.visualAlt ?? zoomed.lessonTitle} className="mt-6 max-h-[64vh] w-full object-contain" /><p className="mt-5 max-w-3xl text-sm leading-7 text-[#c1cad7]">{zoomed.content}</p><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => downloadIllustrationStudySheet({ imageUrl: zoomed.visualUrl ?? "", courseTitle: zoomed.courseTitle, lessonTitle: zoomed.lessonTitle, modeLabel: zoomed.modeLabel, content: zoomed.content, filename: `${zoomed.courseSlug}-${zoomed.lessonId}-study-sheet.svg` })} className="inline-flex items-center gap-2 bg-[#c9a34e] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]"><Download size={14} /> {t("downloadStudySheet")}</button><Link href={`/courses/${zoomed.courseSlug}`} onClick={() => setZoomed(null)} className="inline-flex items-center gap-2 border border-white/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#f7f3e8]">{t("openLesson")} <ArrowUpRight size={14} /></Link></div></div></div>}</div>;
}
