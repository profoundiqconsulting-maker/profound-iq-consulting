/* Profound IQ Consulting — Assessment Results with Recommendations
 *
 * Free assessment results page with personalized recommendations for:
 * - Courses based on capability gaps
 * - Psychometric assessments for deeper insights
 * - Personal consulting services
 */

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Crown,
  ExternalLink,
  GraduationCap,
  Heart,
  Loader2,
  MessagesSquare,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { TransformationNav } from "@/components/TransformationNav";
import { SocialSharing, type SocialPlatform } from "@/components/SocialSharing";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn } from "@/lib/utils";
import { assessmentCopy } from "@shared/assessmentLocalization";
import { dimensions } from "@shared/assessment";
import { courseCatalog } from "@shared/courseCatalog";
import { psychometricTests } from "@shared/psychometrics";
import { trpc } from "@/lib/trpc";
import { BrandLogo } from "@/components/BrandLogo";
import { ProgressPageTransition } from "@/components/ProgressMotion";
import { Badge } from "@/components/ui/badge";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type AssessmentResultsProps = {
  report?: any;
  reference?: string | null;
  name?: string;
  email?: string;
  answers?: any;
};

interface CourseRecommendation {
  course: (typeof courseCatalog)[0];
  matchScore: number;
  reason: string;
  priority: "high" | "medium" | "low";
}

interface PsychometricRecommendation {
  test: {
    slug: string;
    title: string;
    description: string;
    estimatedMinutes: number;
    questionCount: number;
  };
  matchScore: number;
  reason: string;
  priority: "high" | "medium" | "low";
}

interface ConsultingRecommendation {
  service: {
    id: string;
    title: string;
    description: string;
    duration: string;
    priceKes: number;
  };
  matchScore: number;
  reason: string;
  priority: "high" | "medium" | "low";
}

const CONSULTING_SERVICES = [
  {
    id: "coaching-debrief",
    title: "1-on-1 Coaching Debrief",
    description:
      "60-minute personalized debrief with a certified coach to review your assessment results and create an action plan.",
    duration: "60 minutes",
    priceKes: 1299,
  },
  {
    id: "team-workshop",
    title: "Team Development Workshop",
    description:
      "Half-day facilitated workshop for teams to align on capabilities, communication styles, and collaboration patterns.",
    duration: "4 hours",
    priceKes: 49999,
  },
  {
    id: "leadership-program",
    title: "Executive Leadership Program",
    description:
      "6-month personalized leadership development program with monthly coaching, assessments, and peer learning.",
    duration: "6 months",
    priceKes: 5999,
  },
  {
    id: "career-transition",
    title: "Career Transition Coaching",
    description:
      "Personalized career transition support with assessment review, role mapping, and interview preparation.",
    duration: "3 months",
    priceKes: 9999,
  },
];

const CONSULTING_ICONS: Record<string, any> = {
  "coaching-debrief": MessagesSquare,
  "team-workshop": Users,
  "leadership-program": Crown,
  "career-transition": Compass,
};

const PSYCHOMETRIC_TEST_SIGNALS: Record<string, string[]> = {
  "career-personality-profile": ["selfAwareness", "adaptability"],
  "cognitive-reasoning-assessment": ["clarity", "execution"],
  "emotional-intelligence-profile": [
    "selfAwareness",
    "collaboration",
    "communication",
  ],
  "future-ready-employability-profile": ["adaptability", "growth"],
  "leadership-potential-profile": ["leadership", "influence"],
  "career-interests-occupational-fit": ["growth", "adaptability"],
};

const PSYCHOMETRIC_TESTS = psychometricTests.map(test => ({
  slug: test.slug,
  title: test.shortTitle,
  description: test.strapline,
  estimatedMinutes: parseInt(test.estimatedMinutes, 10) || 15,
  questionCount: test.questions.length,
}));

export default function AssessmentResults({
  report,
  reference,
  name,
  email,
  answers,
}: AssessmentResultsProps) {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [courseRecommendations, setCourseRecommendations] = useState<
    CourseRecommendation[]
  >([]);
  const [psychometricRecommendations, setPsychometricRecommendations] =
    useState<PsychometricRecommendation[]>([]);
  const [consultingRecommendations, setConsultingRecommendations] = useState<
    ConsultingRecommendation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const roadmapUtils = trpc.useUtils();
  const roadmapQuery = trpc.roadmap.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const addToRoadmap = trpc.roadmap.add.useMutation({
    onSuccess: () => {
      toast.success("Added to My Roadmap");
      roadmapUtils.roadmap.list.invalidate();
    },
    onError: error => {
      console.error("roadmap.add failed", error);
      const message = (error as { message?: string })?.message ?? "";
      toast.error(
        /not available|relation|doesn't exist|unknown/i.test(message)
          ? "Roadmap is not set up yet. Please contact support."
          : "Could not add to your roadmap. Please sign in and try again."
      );
    },
  });
  const roadmapSlugs = new Set(
    (roadmapQuery.data?.items ?? []).map(item => item.courseSlug)
  );
  const roadmapDiscountActive = Boolean(roadmapQuery.data?.discountActive);
  const [activeTab, setActiveTab] = useState<
    "courses" | "psychometrics" | "consulting" | "report"
  >("report");

  const renderPdf = trpc.assessment.renderPdf.useMutation();
  const saveReport = trpc.assessment.saveReport.useMutation();

  const triggerDownload = (data: string, filename: string) => {
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    if (!report) return;
    try {
      const result = await renderPdf.mutateAsync({
        participantName: name || "Profound IQ Learner",
        email: email || undefined,
        report,
      });
      triggerDownload(result.data, result.filename);
      toast.success("Report downloaded");
    } catch (error: any) {
      toast.error("Download failed", {
        description: error?.message || "Please try again.",
      });
    }
  };

  const handleSaveToDashboard = async () => {
    if (!report || !answers || !name || !email) {
      window.localStorage.setItem(
        `piq-assessment-saved-${reference || "local"}`,
        JSON.stringify({ report, savedAt: new Date().toISOString() })
      );
      toast.success("Report saved on this device");
      return;
    }
    try {
      await saveReport.mutateAsync({ name, email, answers, consent: true });
      toast.success("Report saved to your dashboard");
    } catch (error: any) {
      toast.error("Could not save to dashboard", {
        description: error?.message || "Saved locally instead.",
      });
    }
  };

  // Generate recommendations based on assessment report
  useEffect(() => {
    if (!report) return;

    const generateRecommendations = async () => {
      setIsLoading(true);

      // Use static catalog for now (trpc query in useEffect requires proper setup)
      generateCourseRecommendations(courseCatalog);

      generatePsychometricRecommendations();
      generateConsultingRecommendations();
      setIsLoading(false);
    };

  const generateCourseRecommendations = (catalog: typeof courseCatalog) => {
      if (!report?.dimensions) return;

      // Identify lowest scoring dimensions (greatest development needs)
      const sortedDimensions = [...report.dimensions].sort(
        (a, b) => a.score - b.score
      );
      const lowestDimensions = sortedDimensions.slice(0, 3).map(d => d.key);
      const highestDimensions = [...report.dimensions]
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(d => d.key);

      const recommendations: CourseRecommendation[] = catalog.map(course => {
        // Match course modules to assessment dimensions
        const courseModules = course.modules.map(m => m.id);
        const matchCount = courseModules.filter(m =>
          lowestDimensions.includes(m)
        ).length;
        const strengthCount = courseModules.filter(m =>
          highestDimensions.includes(m)
        ).length;

        let matchScore = matchCount * 30 + strengthCount * 10;

        // Boost for overall low score
        if (report.overallScore < 50) matchScore += 20;
        else if (report.overallScore < 70) matchScore += 10;

        let reason = "";
        if (matchCount > 0) {
          reason = `Addresses your development areas: ${lowestDimensions.filter(d => courseModules.includes(d)).join(", ")}`;
        } else if (strengthCount > 0) {
          reason = `Builds on your strengths: ${highestDimensions.filter(d => courseModules.includes(d)).join(", ")}`;
        } else {
          reason =
            "Complements your capability profile with structured development";
        }

        let priority: "high" | "medium" | "low" = "low";
        if (matchScore >= 60) priority = "high";
        else if (matchScore >= 30) priority = "medium";

        return { course, matchScore, reason, priority };
      });

      // Sort by match score descending
      recommendations.sort((a, b) => b.matchScore - a.matchScore);
      setCourseRecommendations(recommendations.slice(0, 6));
    };

    const generatePsychometricRecommendations = () => {
      if (!report?.dimensions) return;

      const lowestDimensions = [...report.dimensions]
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map(d => d.key);

      const recommendations: PsychometricRecommendation[] =
        PSYCHOMETRIC_TESTS.map(test => {
          const signals = PSYCHOMETRIC_TEST_SIGNALS[test.slug] ?? [];
          const matched = signals.filter(signal =>
            lowestDimensions.includes(signal)
          );

          let matchScore = matched.length * 30;
          let reason = matched.length
            ? `Deepens insight into your development areas: ${matched.join(", ")}.`
            : `Broadens your self-knowledge with ${test.title}.`;

          // Boost for overall low score
          if (report.overallScore && report.overallScore < 50) matchScore += 15;
          else if (report.overallScore && report.overallScore < 70)
            matchScore += 8;

          let priority: "high" | "medium" | "low" = "low";
          if (matchScore >= 40) priority = "high";
          else if (matchScore >= 20) priority = "medium";

          return {
            test: { ...test, slug: test.slug },
            matchScore,
            reason,
            priority,
          };
        });

      recommendations.sort((a, b) => b.matchScore - a.matchScore);
      setPsychometricRecommendations(recommendations.slice(0, 4));
    };

    const generateConsultingRecommendations = () => {
      if (!report?.dimensions) return;

      const lowestDimensions = [...report.dimensions]
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map(d => d.key);
      const overallScore = report.overallScore || 50;

      const recommendations: ConsultingRecommendation[] =
        CONSULTING_SERVICES.map(service => {
          let matchScore = 0;
          let reason = "";

          if (service.id === "coaching-debrief") {
            matchScore = 50; // Always relevant
            reason =
              "Personalized interpretation of your results with actionable next steps";
          } else if (service.id === "team-workshop") {
            if (
              lowestDimensions.includes("collaboration") ||
              lowestDimensions.includes("communication")
            ) {
              matchScore = 45;
              reason =
                "Addresses team collaboration and communication challenges";
            } else {
              matchScore = 20;
              reason = "Strengthens team dynamics and shared understanding";
            }
          } else if (service.id === "leadership-program") {
            if (
              lowestDimensions.includes("leadership") ||
              lowestDimensions.includes("decision-making") ||
              overallScore < 60
            ) {
              matchScore = 40;
              reason =
                "Comprehensive leadership development for sustained growth";
            } else {
              matchScore = 15;
              reason =
                "Advanced leadership development for high-potential leaders";
            }
          } else if (service.id === "career-transition") {
            if (
              lowestDimensions.includes("career-management") ||
              lowestDimensions.includes("adaptability")
            ) {
              matchScore = 40;
              reason =
                "Guided career transition with assessment-backed role mapping";
            } else {
              matchScore = 10;
              reason = "Support for professionals navigating career changes";
            }
          }

          let priority: "high" | "medium" | "low" = "low";
          if (matchScore >= 40) priority = "high";
          else if (matchScore >= 25) priority = "medium";

          return {
            service: { ...service, id: service.id },
            matchScore,
            reason,
            priority,
          };
        });

      recommendations.sort((a, b) => b.matchScore - a.matchScore);
      setConsultingRecommendations(recommendations.slice(0, 4));
    };

    generateRecommendations();
  }, [report]);

  const shareUrl = `${window.location.origin}/assessment?reference=${reference ?? ""}`;
  const shareTitle = "My Profound IQ Self-Assessment Report";
  const shareMessage =
    "I've completed my Profound IQ Self-Assessment. Here's my capability snapshot.";

  const handleShare = (platform: SocialPlatform) => {
    console.log(`Shared on ${platform}`);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]";
      case "medium":
        return "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]";
      default:
        return "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]";
    }
  };

  const getPriorityLabel = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "High Match";
      case "medium":
        return "Good Match";
      default:
        return "Explore";
    }
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-body">
        <TransformationNav active="assessment" />
        <main className="container py-20">
          <div
            className="mx-auto max-w-xl text-center"
            role="status"
            aria-live="polite"
          >
            <Loader2
              className="mx-auto animate-spin text-[var(--brand)]"
              size={48}
            />
            <h1 className="text-display text-3xl font-semibold mt-8 text-[var(--foreground)]">
              Loading your results…
            </h1>
            <p className="mt-5 text-base leading-7 text-[var(--muted-foreground)]">
              Retrieving your personalized assessment report and
              recommendations.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-body">
      <TransformationNav active="assessment" />

      <main className="container py-8 lg:py-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-[var(--brand)]">
                Assessment Results — Free Report
              </p>
              <h1 className="text-display text-3xl font-semibold mt-2 text-[var(--navy-deep)]">
                Your Capability Snapshot
              </h1>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {name} · {email} · Completed {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="brand"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={renderPdf.isPending}
              >
                {renderPdf.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveToDashboard}
                disabled={saveReport.isPending}
              >
                {saveReport.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save to Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={copyLink}>
                <ExternalLink size={14} className="mr-2" /> Share Link
              </Button>
              <Button
                variant="brand"
                size="sm"
                  onClick={() => setLocation("/assessment")}
              >
                <ArrowRight size={14} className="ml-2" /> Retake Assessment
              </Button>
            </div>
          </div>

          <div className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)] mb-2">
              Share your results
            </p>
            <SocialSharing
              url={shareUrl}
              title={shareTitle}
              text={shareMessage}
              platforms={[
                "linkedin",
                "x",
                "facebook",
                "instagram",
                "tiktok",
                "whatsapp",
                "copy",
                "native",
              ]}
              className="bg-transparent border-transparent shadow-none"
            />
          </div>

          {/* Progress & Overall Score */}
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <Card className="border-l-2 border-[var(--brand)] bg-[var(--navy-deep)]/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="eyebrow text-[var(--brand)]">
                      Overall Foundation
                    </p>
                    <p className="text-display text-4xl font-semibold mt-2 text-[var(--foreground)]">
                      {report.overallScore}
                      <span className="text-2xl text-[var(--muted-foreground)]">
                        {" "}
                        / 100
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-bold uppercase tracking-[.14em] text-[var(--brand)]">
                      {report.overallBand}
                    </p>
                  </div>
                  <ProgressRing
                    value={report.overallScore}
                    size={80}
                    strokeWidth={6}
                    className="text-[var(--brand)]"
                  >
                    <span className="text-2xl font-bold text-[var(--foreground)]">
                      {report.overallScore}%
                    </span>
                  </ProgressRing>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="eyebrow text-[var(--brand)]">
                  Dimensions Assessed
                </p>
                <p className="text-display text-4xl font-semibold mt-2 text-[var(--foreground)]">
                  {report.dimensions?.length ?? 10}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Capability dimensions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="eyebrow text-[var(--brand)]">Focus Areas</p>
                <p className="text-display text-4xl font-semibold mt-2 text-[var(--foreground)]">
                  {report.focusAreas?.length ?? 3}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Priority development areas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="eyebrow text-[var(--brand)]">Recommendations</p>
                <p className="text-display text-4xl font-semibold mt-2 text-[var(--foreground)]">
                  {courseRecommendations.filter(r => r.priority === "high")
                    .length +
                    psychometricRecommendations.filter(
                      r => r.priority === "high"
                    ).length +
                    consultingRecommendations.filter(r => r.priority === "high")
                      .length}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  High-priority matches
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 border-b border-[var(--border)]">
            <nav
              className="flex flex-wrap gap-1"
              role="tablist"
              aria-label="Report sections"
            >
              <button
                role="tab"
                aria-selected={activeTab === "report"}
                onClick={() => setActiveTab("report")}
                className={cn(
                  "px-4 py-3 text-sm font-semibold uppercase tracking-[.1em] rounded-t-lg border-b-2 transition-all",
                  activeTab === "report"
                    ? "border-[var(--brand)] text-[var(--brand)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                Assessment Report
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "courses"}
                onClick={() => setActiveTab("courses")}
                className={cn(
                  "px-4 py-3 text-sm font-semibold uppercase tracking-[.1em] rounded-t-lg border-b-2 transition-all",
                  activeTab === "courses"
                    ? "border-[var(--brand)] text-[var(--brand)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                <GraduationCap size={14} className="inline mr-1" /> Courses
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "psychometrics"}
                onClick={() => setActiveTab("psychometrics")}
                className={cn(
                  "px-4 py-3 text-sm font-semibold uppercase tracking-[.1em] rounded-t-lg border-b-2 transition-all",
                  activeTab === "psychometrics"
                    ? "border-[var(--warning)] text-[var(--warning)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                <Brain size={14} className="inline mr-1" /> Psychometrics
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "consulting"}
                onClick={() => setActiveTab("consulting")}
                className={cn(
                  "px-4 py-3 text-sm font-semibold uppercase tracking-[.1em] rounded-t-lg border-b-2 transition-all",
                  activeTab === "consulting"
                    ? "border-[var(--danger)] text-[var(--danger)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                <Users size={14} className="inline mr-1" /> Consulting
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "report" && (
            <ProgressPageTransition>
            <div
              className="space-y-8"
              role="tabpanel"
              aria-label="Assessment Report"
            >
              {/* Executive Summary */}
              <section className="border border-[var(--brand)] bg-[var(--navy-deep)] p-6 text-[var(--background)] sm:p-8">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="eyebrow text-[var(--brand)]">
                      Executive summary · {name}
                    </p>
                    <h2 className="text-display text-2xl font-semibold mt-3">
                      {report.executiveSummary?.headline ??
                        `${report.overallBand}: Your ${report.overallScore >= 70 ? "strengths-led" : report.overallScore >= 50 ? "balanced" : "growth-focused"} capability profile`}
                    </h2>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <BrandLogo context="Assessment report" />
                    <span className="hidden border border-[var(--brand)]/60 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[var(--brand)] sm:block">
                      One-page brief
                    </span>
                  </div>
                </div>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--muted-foreground)]">
                  {report.executiveSummary?.overview ??
                    `Your overall score of ${report.overallScore}/100 places you in the ${report.overallBand.toLowerCase()} band. ${report.overallScore >= 70 ? "You demonstrate strong capabilities across most dimensions. Focus on refining your top strengths and sharing them with others." : report.overallScore >= 50 ? "You have a solid foundation with clear areas for growth. Targeted development in your lower-scoring dimensions will yield the highest returns." : "You have significant development opportunities. Prioritize the three focus areas below for maximum impact."}`}
                </p>
                <div className="mt-7 grid gap-6 border-t border-[var(--brand)]/30 pt-6 lg:grid-cols-2">
                  <div>
                    <p className="eyebrow text-[var(--brand)]">
                      Your top priorities
                    </p>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
                      {(
                        report.executiveSummary?.priorities ?? report.focusAreas
                      ).map((priority: string, idx: number) => (
                        <li
                          key={priority}
                          className="border-l border-[var(--brand)] pl-3 relative"
                        >
                          <span className="absolute -left-3 top-0 h-5 w-5 rounded-full bg-[var(--brand)] text-[var(--navy-deep)] text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {priority}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="eyebrow text-[var(--brand)]">
                      Coaching conversation starters
                    </p>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
                      {(
                        report.executiveSummary?.discussionPrompts ??
                        report.reflectionPoints
                      )
                        .slice(0, 3)
                        .map((prompt: string) => (
                          <li key={prompt} className="flex gap-2">
                            <span className="text-[var(--brand)]">→</span>{" "}
                            {prompt}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Score & Dimensions — Executive Dashboard */}
              <section className="space-y-8">
                {/* Header with overall score */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-6 border-b border-[var(--border)]">
                  <div>
                    <p className="eyebrow text-[var(--brand)]">
                      Capability Profile
                    </p>
                    <h2 className="text-display text-3xl font-semibold mt-2 text-[var(--navy-deep)]">
                      Your dimension scores at a glance
                    </h2>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      {report.overallScore}/100 overall · {report.overallBand} ·{" "}
                      {report.dimensions.length} dimensions assessed
                    </p>
                  </div>
                  <div className="flex items-center gap-4 lg:ml-auto">
                    <div className="relative w-24 h-24">
                      <ProgressRing
                        value={report.overallScore}
                        size={80}
                        strokeWidth={6}
                        className="text-[var(--brand)]"
                      >
                        <span className="text-2xl font-bold text-[var(--foreground)]">
                          {report.overallScore}%
                        </span>
                      </ProgressRing>
                    </div>
                    <div>
                      <p className="text-display text-3xl font-bold text-[var(--foreground)]">
                        {report.overallScore}
                        <span className="text-xl text-[var(--muted-foreground)]">
                          /100
                        </span>
                      </p>
                      <p className="text-sm font-bold uppercase tracking-[.14em] text-[var(--brand)]">
                        {report.overallBand}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visual Capability Profile — Branded Charts & Infographic */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-[var(--border)] bg-[var(--card)]">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Compass className="h-4 w-4 text-[var(--brand)]" />
                        <CardTitle className="text-base text-[var(--navy-deep)]">
                          Capability profile
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart
                            data={report.dimensions.map((d: any) => ({
                              subject: d.label,
                              score: d.score,
                            }))}
                          >
                            <PolarGrid stroke="var(--border)" />
                            <PolarAngleAxis
                              dataKey="subject"
                              tick={{
                                fontSize: 10,
                                fill: "var(--muted-foreground)",
                              }}
                            />
                            <PolarRadiusAxis
                              domain={[0, 100]}
                              tick={{
                                fontSize: 9,
                                fill: "var(--muted-foreground)",
                              }}
                            />
                            <Radar
                              name="Score"
                              dataKey="score"
                              stroke="var(--brand)"
                              fill="var(--brand)"
                              fillOpacity={0.28}
                              strokeWidth={2}
                            />
                            <Tooltip
                              formatter={(value: any) => [`${value}/100`, "Score"]}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[var(--border)] bg-[var(--card)]">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-[var(--brand)]" />
                        <CardTitle className="text-base text-[var(--navy-deep)]">
                          Dimension scores
                        </CardTitle>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Colour shows performance level — green strength, gold
                        developing, red priority.
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={report.dimensions.map((d: any) => ({
                              name: d.label.substring(0, 14),
                              score: d.score,
                            }))}
                            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="var(--border)"
                            />
                            <XAxis
                              dataKey="name"
                              tick={{
                                fontSize: 10,
                                fill: "var(--muted-foreground)",
                              }}
                              interval={0}
                              angle={-15}
                              textAnchor="end"
                              height={50}
                            />
                            <YAxis
                              domain={[0, 100]}
                              tick={{
                                fontSize: 10,
                                fill: "var(--muted-foreground)",
                              }}
                            />
                            <Tooltip
                              formatter={(value: any) => [`${value}/100`, "Score"]}
                            />
                            <Bar
                              dataKey="score"
                              radius={[4, 4, 0, 0]}
                              background={{ fill: "var(--muted)" }}
                            >
                              {report.dimensions.map((d: any, i: number) => (
                                <Cell
                                  key={i}
                                  fill={
                                    d.score >= 70
                                      ? "var(--success)"
                                      : d.score >= 50
                                        ? "var(--brand)"
                                        : "var(--danger)"
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Dimension Grid — Executive Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {report.dimensions.map((dimension: any) => (
                    <Card
                      key={dimension.key}
                      className={cn(
                        "border-[var(--border)] bg-[var(--card)] transition-all hover:shadow-lg hover:border-[var(--brand)]/30",
                        dimension.score >= 70 &&
                          "border-l-4 border-l-[var(--success)]",
                        dimension.score >= 50 &&
                          dimension.score < 70 &&
                          "border-l-4 border-l-[var(--warning)]",
                        dimension.score < 50 &&
                          "border-l-4 border-l-[var(--danger)]"
                      )}
                    >
                      <CardContent className="p-5">
                        {/* Score Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-[.12em]",
                              dimension.score >= 70
                                ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]"
                                : dimension.score >= 50
                                  ? "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]"
                                  : "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]"
                            )}
                          >
                            {dimension.score >= 70
                              ? "Strength"
                              : dimension.score >= 50
                                ? "Developing"
                                : "Priority"}
                          </span>
                        </div>

                        {/* Dimension Header */}
                        <div className="flex items-baseline justify-between gap-3 mb-3">
                          <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                            {dimension.label}
                          </h3>
                          <span className="text-display text-2xl text-[var(--brand)]">
                            {dimension.score}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-[var(--border)] rounded-full mb-3">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              dimension.score >= 70 && "bg-[var(--success)]",
                              dimension.score >= 50 &&
                                dimension.score < 70 &&
                                "bg-[var(--warning)]",
                              dimension.score < 50 && "bg-[var(--danger)]"
                            )}
                            style={{ width: `${dimension.score}%` }}
                          />
                        </div>

                        {/* Consistency (reliability) */}
                        <div className="mb-3 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[var(--muted-foreground)]">
                          <span>Response consistency</span>
                          <span
                            className={cn(
                              dimension.reliability >= 70
                                ? "text-[var(--success)]"
                                : dimension.reliability >= 40
                                  ? "text-[var(--warning)]"
                                  : "text-[var(--danger)]"
                            )}
                          >
                            {dimension.reliability}%
                          </span>
                        </div>

                        {/* Description & Readout */}
                        <p className="text-xs leading-5 text-[var(--muted-foreground)] mb-3">
                          {dimension.description}
                        </p>
                        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                          {dimension.readout}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Quick Stats Row */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-[var(--border)]">
                  <div className="p-4 rounded-xl bg-[var(--muted)]/30">
                    <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--muted-foreground)]">
                      Highest
                    </p>
                    <p className="text-display text-2xl font-bold text-[var(--success)] mt-1">
                      {
                        report.dimensions.reduce((a: any, b: any) =>
                          a.score > b.score ? a : b
                        ).label
                      }
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {
                        report.dimensions.reduce((a: any, b: any) =>
                          a.score > b.score ? a : b
                        ).score
                      }
                      /100
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--muted)]/30">
                    <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--muted-foreground)]">
                      Priority
                    </p>
                    <p className="text-display text-2xl font-bold text-[var(--danger)] mt-1">
                      {
                        report.dimensions.reduce((a: any, b: any) =>
                          a.score < b.score ? a : b
                        ).label
                      }
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {
                        report.dimensions.reduce((a: any, b: any) =>
                          a.score < b.score ? a : b
                        ).score
                      }
                      /100
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--muted)]/30">
                    <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--muted-foreground)]">
                      Spread
                    </p>
                    <p className="text-display text-2xl font-bold text-[var(--brand)] mt-1">
                      {report.dimensions.reduce((a: any, b: any) =>
                        a.score > b.score ? a : b
                      ).score -
                        report.dimensions.reduce((a: any, b: any) =>
                          a.score < b.score ? a : b
                        ).score}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Point difference
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--muted)]/30">
                    <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--muted-foreground)]">
                      Average
                    </p>
                    <p className="text-display text-2xl font-bold text-[var(--brand)] mt-1">
                      {Math.round(
                        report.dimensions.reduce(
                          (sum: number, d: any) => sum + d.score,
                          0
                        ) / report.dimensions.length
                      )}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Across all dimensions
                    </p>
                  </div>
                </div>
              </section>

              {/* Insights & Actions */}
              <section>
                <div className="space-y-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="eyebrow text-[var(--brand)]">
                        Development insights
                      </p>
                      <h2 className="text-display text-2xl font-semibold mt-3 text-[var(--navy-deep)]">
                        Your personalized development roadmap
                      </h2>
                      <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                        Based on your assessment pattern, these are the
                        capabilities that will move the needle most.
                      </p>
                    </div>
                    <svg
                      viewBox="0 0 120 120"
                      className="h-24 w-24 shrink-0"
                      role="img"
                      aria-label="Development compass illustration"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="var(--bg-elevated)"
                        stroke="var(--brand)"
                        strokeWidth="2"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="40"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <path
                        d="M60 18 L68 60 L60 102 L52 60 Z"
                        fill="var(--brand)"
                      />
                      <path
                        d="M18 60 L60 52 L102 60 L60 68 Z"
                        fill="var(--navy-deep)"
                        opacity="0.85"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="6"
                        fill="var(--navy-deep)"
                        stroke="var(--brand)"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {report.focusAreas.map((area: string, index: number) => (
                      <Card
                        key={index}
                        className="border-[var(--border)] bg-[var(--card)]"
                      >
                        <CardHeader>
                          <CardTitle className="text-lg text-[var(--navy-deep)]">
                            {area}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            Focus on building this capability through deliberate
                            practice and feedback.
                          </p>
                          <div className="mt-4 flex gap-2">
                            <Link href="/dashboard">
                              <Button variant="outline" size="sm">
                                Add to plan
                              </Button>
                            </Link>
                            <Link href="/courses">
                              <Button variant="ghost" size="sm">
                                Learn more
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Recommended courses + roadmap discount */}
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="eyebrow text-[var(--brand)]">Recommended courses</p>
                        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                          Add courses to My Roadmap to track progress. Enroll in two or more to unlock 10% off each course.
                        </p>
                      </div>
                      {roadmapDiscountActive && (
                        <Badge className="border-[var(--success)]/40 bg-[var(--success)]/15 text-[var(--success)]">
                          10% off unlocked
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {courseRecommendations.slice(0, 3).map(rec => {
                        const inRoadmap = roadmapSlugs.has(rec.course.slug);
                        return (
                          <div
                            key={rec.course.slug}
                            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4"
                          >
                            <p className="line-clamp-1 text-sm font-bold text-[var(--navy-deep)]">
                              {rec.course.title}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs text-[var(--muted-foreground)]">
                              {rec.reason}
                            </p>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-[var(--brand)]">
                                KES {(rec.course.priceKes ?? 0).toLocaleString()}
                              </span>
                              <Button
                                size="sm"
                                variant={inRoadmap ? "outline" : "brand"}
                                disabled={inRoadmap || addToRoadmap.isPending}
                                onClick={() => {
                                  if (!isAuthenticated) {
                                    toast.error("Please sign in to save to your roadmap");
                                    setLocation(
                                      "/auth?mode=login&returnTo=%2Fassessment"
                                    );
                                    return;
                                  }
                                  addToRoadmap.mutate({ courseSlug: rec.course.slug });
                                }}
                              >
                                {inRoadmap ? "In roadmap" : "Add to roadmap"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            </div>
            </ProgressPageTransition>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div
              className="space-y-8"
              role="tabpanel"
              aria-label="Course Recommendations"
            >
              <div>
                <p className="eyebrow text-[var(--brand)]">
                  Personalized course recommendations
                </p>
                <h2 className="text-display text-2xl font-semibold mt-3 text-[var(--navy-deep)]">
                  Courses tailored to your development areas
                </h2>
                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  Based on your assessment results, these courses target your
                  lowest-scoring dimensions and build on your strengths.
                </p>
              </div>

              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map(i => (
                    <Card
                      key={i}
                      className="border-[var(--border)] bg-[var(--card)] animate-pulse"
                    >
                      <CardHeader>
                        <div className="h-4 w-3/4 bg-[var(--muted)] rounded" />
                        <div className="h-3 w-1/2 bg-[var(--muted)] rounded mt-2" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-32 bg-[var(--muted)] rounded" />
                        <div className="h-4 w-1/2 bg-[var(--muted)] rounded mt-4" />
                        <div className="h-4 w-1/3 bg-[var(--muted)] rounded mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : courseRecommendations.length === 0 ? (
                <Card className="border-[var(--border)] bg-[var(--card)]">
                  <CardContent className="p-8 text-center">
                    <GraduationCap
                      size={48}
                      className="mx-auto text-[var(--muted-foreground)]"
                    />
                    <h3 className="text-display text-xl font-semibold mt-4 text-[var(--foreground)]">
                      No course matches yet
                    </h3>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      Complete the assessment to see personalized course
                      recommendations.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {courseRecommendations.map((rec, index) => (
                    <Card
                      key={rec.course.slug}
                      className={cn(
                        "border-[var(--border)] bg-[var(--card)] transition-all hover:shadow-lg",
                        rec.priority === "high" &&
                          "border-[var(--brand)] shadow-[var(--brand)]/10"
                      )}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-[.12em]",
                                getPriorityColor(rec.priority)
                              )}
                            >
                              {getPriorityLabel(rec.priority)}
                            </span>
                            <h3 className="mt-2 text-display text-xl font-semibold text-[var(--navy-deep)]">
                              {rec.course.title}
                            </h3>
                          </div>
                          {rec.priority === "high" && (
                            <Star className="text-[var(--brand)]" size={20} />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                          {rec.reason}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-display text-xl font-bold text-[var(--brand)]">
                            KES {rec.course.priceKes?.toLocaleString() ?? "—"}
                          </span>
                          <Link
                            href={`/courses/${rec.course.slug}`}
                            className="inline-flex items-center gap-1 text-sm font-bold uppercase tracking-[.1em] text-[var(--brand)] hover:underline"
                          >
                            View course <ChevronRight size={12} />
                          </Link>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {rec.course.modules.slice(0, 3).map((module: any) => (
                            <span
                              key={module.id}
                              className="px-2 py-1 text-[10px] font-medium uppercase tracking-[.1em] bg-[var(--muted)] text-[var(--muted-foreground)] rounded"
                            >
                              {module.title}
                            </span>
                          ))}
                          {rec.course.modules.length > 3 && (
                            <span className="px-2 py-1 text-[10px] font-medium uppercase tracking-[.1em] bg-[var(--muted)] text-[var(--muted-foreground)] rounded">
                              +{rec.course.modules.length - 3} more
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Psychometrics Tab */}
          {activeTab === "psychometrics" && (
            <div
              className="space-y-8"
              role="tabpanel"
              aria-label="Psychometric Recommendations"
            >
              <div>
                <p className="eyebrow text-[var(--warning)]">
                  Deeper self-knowledge
                </p>
                <h2 className="text-display text-2xl font-semibold mt-3 text-[var(--navy-deep)]">
                  Psychometric assessments for deeper insights
                </h2>
                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  Complement your capability assessment with validated
                  psychometric tools for personality, behavioral style, and
                  emotional intelligence.
                </p>
              </div>

              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map(i => (
                    <Card
                      key={i}
                      className="border-[var(--border)] bg-[var(--card)] animate-pulse"
                    >
                      <CardHeader>
                        <div className="h-4 w-3/4 bg-[var(--muted)] rounded" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 bg-[var(--muted)] rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {psychometricRecommendations.map((rec, index) => (
                    <Card
                      key={rec.test.slug}
                      className={cn(
                        "border-[var(--border)] bg-[var(--card)] transition-all hover:shadow-lg",
                        rec.priority === "high" &&
                          "border-[var(--warning)] shadow-[var(--warning)]/10"
                      )}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-[.12em]",
                                getPriorityColor(rec.priority)
                              )}
                            >
                              {getPriorityLabel(rec.priority)}
                            </span>
                            <h3 className="mt-2 text-display text-lg font-semibold text-[var(--navy-deep)]">
                              {rec.test.title}
                            </h3>
                          </div>
                          {rec.priority === "high" && (
                            <Sparkles
                              className="text-[var(--warning)]"
                              size={20}
                            />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                          {rec.test.description}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
                          <span className="flex items-center gap-1 px-2 py-1 bg-[var(--muted)] rounded-full">
                            <Clock size={10} /> {rec.test.estimatedMinutes} min
                          </span>
                          <span className="flex items-center gap-1 px-2 py-1 bg-[var(--muted)] rounded-full">
                            <Brain size={10} /> {rec.test.questionCount}{" "}
                            questions
                          </span>
                        </div>
                        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                          {rec.reason}
                        </p>
                        <Link
                          href={`/psychometrics/${rec.test.slug}`}
                          className="mt-4 inline-flex items-center gap-1 text-sm font-bold uppercase tracking-[.1em] text-[var(--brand)] hover:underline"
                        >
                          Start assessment <ChevronRight size={12} />
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Consulting Tab */}
          {activeTab === "consulting" && (
            <div
              className="space-y-8"
              role="tabpanel"
              aria-label="Consulting Services"
            >
              <div>
                <p className="eyebrow text-[var(--danger)]">
                  Personalized support
                </p>
                <h2 className="text-display text-2xl font-semibold mt-3 text-[var(--navy-deep)]">
                  Consulting services for accelerated growth
                </h2>
                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  Work directly with certified coaches and consultants to
                  translate your insights into measurable outcomes.
                </p>
              </div>

              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map(i => (
                    <Card
                      key={i}
                      className="border-[var(--border)] bg-[var(--card)] animate-pulse"
                    >
                      <CardHeader>
                        <div className="h-4 w-3/4 bg-[var(--muted)] rounded" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 bg-[var(--muted)] rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {consultingRecommendations.map((rec) => {
                    const Icon = CONSULTING_ICONS[rec.service.id] ?? Award;
                    return (
                      <Card
                        key={rec.service.id}
                        className={cn(
                          "border-[var(--border)] bg-[var(--card)] transition-all hover:shadow-lg",
                          rec.priority === "high" &&
                            "border-[var(--danger)] shadow-[var(--danger)]/10"
                        )}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-3">
                            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--danger)]/10">
                              <Icon className="text-[var(--danger)]" size={22} />
                            </div>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-[.12em]",
                                getPriorityColor(rec.priority)
                              )}
                            >
                              {getPriorityLabel(rec.priority)}
                            </span>
                          </div>
                          <h3 className="mt-2 text-display text-lg font-semibold text-[var(--navy-deep)]">
                            {rec.service.title}
                          </h3>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                            {rec.service.description}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
                            <span className="flex items-center gap-1 px-2 py-1 bg-[var(--muted)] rounded-full">
                              <Clock size={10} /> {rec.service.duration}
                            </span>
                            <span className="flex items-center gap-1 px-2 py-1 bg-[var(--muted)] rounded-full">
                              <Briefcase size={10} /> KES{" "}
                              {rec.service.priceKes.toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                            {rec.reason}
                          </p>
                          <Button
                            variant={
                              rec.priority === "high" ? "danger" : "outline"
                            }
                            size="sm"
                            className="mt-4 w-full gap-2"
                            onClick={() =>
                              setLocation(
                                `/contact?service=${rec.service.id}&ref=${reference}`
                              )
                            }
                          >
                            <Icon className="h-4 w-4" />
                            Inquire now
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CTA Footer */}
          <div className="mt-12 p-8 rounded-2xl bg-[var(--navy-deep)] text-[var(--background)] relative overflow-hidden">
            <Sparkles
              className="text-[var(--brand)] absolute top-6 right-6"
              size={32}
            />
            <h2 className="text-display text-2xl font-semibold max-w-xl">
              Ready to accelerate your development?
            </h2>
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)] max-w-xl">
              Turn insights into action with personalized courses, deeper
              psychometric insights, or 1-on-1 coaching tailored to your
              assessment results.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/courses">
                <Button variant="brand" size="lg">
                  <GraduationCap size={16} className="mr-2" />
                  Explore Courses
                </Button>
              </Link>
              <Link href="/psychometrics">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)]/10"
                >
                  <Brain size={16} className="mr-2" />
                  Try Psychometrics
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)]/10"
                >
                  <Users size={16} className="mr-2" />
                  Book Consulting
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
