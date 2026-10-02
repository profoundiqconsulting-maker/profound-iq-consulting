import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BrandLogo } from "@/components/BrandLogo";
import {
  ArrowLeft,
  Bell,
  Check,
  FlaskConical,
  Globe2,
  LockKeyhole,
  Loader2,
  LogOut,
  Monitor,
  RefreshCw,
  Save,
  ShieldCheck,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  isQaFixtureEnabled,
  QA_FIXTURE_STORAGE_KEY,
  qaFixtureStorageValue,
} from "@shared/qaFixture";
import { useTheme } from "@/contexts/ThemeContext";
import DashboardLayout from "@/components/DashboardLayout";
import { DashboardHero, Section } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const defaults = {
  assessmentUpdates: true,
  courseAnnouncements: true,
  monthlyInsights: false,
  showAvatar: true,
  instructorFeedbackEmail: true,
  instructorFeedbackInApp: true,
};
const timezoneOptions = [
  "Africa/Nairobi",
  "Africa/Johannesburg",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
  "UTC",
];
const learningGoalOptions = [
  { value: "leadership", label: "Leadership" },
  { value: "career-transition", label: "Career transition" },
  { value: "communication", label: "Communication" },
  { value: "productivity", label: "Productivity" },
  { value: "emotional-intelligence", label: "Emotional intelligence" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
  { value: "critical-thinking", label: "Critical thinking" },
  { value: "digital-confidence", label: "Digital confidence" },
] as const;

export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const profile = trpc.profile.get.useQuery(undefined, {
    enabled: Boolean(user),
    retry: false,
  });
  const courseState = trpc.course.state.useQuery(undefined, {
    enabled: Boolean(user),
    retry: false,
  });
  const update = trpc.profile.update.useMutation();
  const uploadAvatar = trpc.profile.uploadAvatar.useMutation();
  const removeAvatar = trpc.profile.removeAvatar.useMutation({
    onSuccess: () => {
      setAvatarUrl(null);
      profile.refetch();
      toast.success("Profile picture removed", {
        description: "Your navigation now uses your initials.",
      });
    },
    onError: () =>
      toast.error("Could not remove profile picture", {
        description: "Please try again.",
      }),
  });
  const [activityDevice, setActivityDevice] = useState<
    "all" | "desktop" | "mobile" | "tablet" | "unknown"
  >("all");
  const [activityLocation, setActivityLocation] = useState("");
  const activityInput = useMemo(
    () => ({
      deviceType: activityDevice,
      locationSearch: activityLocation.trim() || undefined,
    }),
    [activityDevice, activityLocation]
  );
  const loginHistory = trpc.profile.loginHistory.useQuery(activityInput, {
    enabled: Boolean(user),
    retry: false,
  });
  const sessions = trpc.profile.sessions.useQuery(undefined, {
    enabled: Boolean(user),
    retry: false,
  });
  const revokeSession = trpc.profile.revokeSession.useMutation({
    onSuccess: () => {
      sessions.refetch();
      toast.success("Session revoked", {
        description: "That device can no longer access your workspace.",
      });
    },
    onError: () =>
      toast.error("Could not revoke session", {
        description: "Refresh the page and try again.",
      }),
  });
  const revokeOtherSessions = trpc.profile.revokeOtherSessions.useMutation({
    onSuccess: () => {
      sessions.refetch();
      toast.success("Other sessions signed out", {
        description: "Only this device remains active.",
      });
    },
    onError: () =>
      toast.error("Could not sign out other sessions", {
        description: "Refresh the page and try again.",
      }),
  });
  const revokeCurrentSession = trpc.profile.revokeCurrentSession.useMutation({
    onSuccess: () => {
      window.location.href = "/auth";
    },
  });
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("Africa/Nairobi");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropError, setCropError] = useState("");
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [preferences, setPreferences] = useState(defaults);
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [qaFixtureEnabled, setQaFixtureEnabled] = useState(
    () =>
      import.meta.env.DEV &&
      isQaFixtureEnabled(window.localStorage.getItem(QA_FIXTURE_STORAGE_KEY))
  );
  const [pendingRevoke, setPendingRevoke] = useState<{
    kind: "session" | "others" | "current";
    sessionId?: number;
    label: string;
  } | null>(null);
  const [saved, setSaved] = useState(false);
  const currentSessionId = sessions.data?.currentSessionId ?? null;

  useEffect(() => {
    if (!profile.data) return;
    setName(profile.data.name ?? "");
    setTimezone(profile.data.timezone ?? "Africa/Nairobi");
    setAvatarUrl(profile.data.avatarUrl ?? null);
    setPreferences({ ...defaults, ...profile.data.notificationPreferences });
    setLearningGoals(
      (profile.data.learningGoals as string[] | null | undefined) ?? []
    );
  }, [profile.data]);

  useEffect(() => {
    const image = cropImageRef.current;
    const canvas = cropCanvasRef.current;
    if (!image || !canvas || !image.complete || !image.naturalWidth) return;
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return;
    const sourceSize =
      Math.min(image.naturalWidth, image.naturalHeight) / cropZoom;
    const maxX = Math.max(0, image.naturalWidth - sourceSize);
    const maxY = Math.max(0, image.naturalHeight - sourceSize);
    const sourceX = maxX / 2 + (maxX / 2) * cropX;
    const sourceY = maxY / 2 + (maxY / 2) * cropY;
    context.clearRect(0, 0, size, size);
    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      size,
      size
    );
  }, [cropSrc, cropZoom, cropX, cropY]);

  if (authLoading) return <LoadingState />;
  if (!user) return <AccessState />;

  const sessionLabel = (userAgent: string | null) =>
    userAgent?.split(" ").slice(0, 3).join(" ") || "Unknown device";

  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|webp)$/)) {
      setCropError("Choose a PNG, JPEG, or WebP image.");
      toast.error("Unsupported avatar format", {
        description: "Choose a PNG, JPEG, or WebP image.",
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setCropError("Choose an image smaller than 2MB.");
      toast.error("Avatar is too large", {
        description: "Choose an image smaller than 2MB.",
      });
      return;
    }
    setCropError("");
    setCropZoom(1);
    setCropX(0);
    setCropY(0);
    setCropSrc(URL.createObjectURL(file));
  };

  const confirmCrop = () => {
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    uploadAvatar.mutate(
      { dataUrl: canvas.toDataURL("image/jpeg", 0.9) },
      {
        onSuccess: next => {
          setAvatarUrl(next?.avatarUrl ?? null);
          setCropSrc(null);
          toast.success("Avatar updated", {
            description: "Your new profile image is now saved.",
          });
        },
        onError: () => {
          setCropError("The avatar could not be uploaded. Please try again.");
          toast.error("Avatar upload failed", {
            description: "Please try again in a moment.",
          });
        },
      }
    );
  };

  const toggleQaFixture = (enabled: boolean) => {
    setQaFixtureEnabled(enabled);
    const storageValue = qaFixtureStorageValue(enabled);
    if (storageValue)
      window.localStorage.setItem(QA_FIXTURE_STORAGE_KEY, storageValue);
    else window.localStorage.removeItem(QA_FIXTURE_STORAGE_KEY);
    toast.success(enabled ? "QA fixture enabled" : "QA fixture disabled", {
      description: enabled
        ? "Open My dashboard to review populated versions."
        : "The dashboard will use your real history.",
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(false);
    update.mutate(
      {
        name,
        timezone,
        learningGoals: learningGoals as Array<
          (typeof learningGoalOptions)[number]["value"]
        >,
        notificationPreferences: preferences,
      },
      { onSuccess: () => setSaved(true) }
    );
  };

  const confirmPendingRevoke = () => {
    if (!pendingRevoke) return;
    const closeAfterSuccess = () => setPendingRevoke(null);
    if (pendingRevoke.kind === "current")
      revokeCurrentSession.mutate(undefined, {
        onSuccess: () => {
          closeAfterSuccess();
          window.location.href = "/auth";
        },
      });
    else if (pendingRevoke.kind === "others")
      revokeOtherSessions.mutate(undefined, { onSuccess: closeAfterSuccess });
    else if (pendingRevoke.sessionId)
      revokeSession.mutate(
        { sessionId: pendingRevoke.sessionId },
        { onSuccess: closeAfterSuccess }
      );
  };

  return (
    <DashboardLayout role="user" title="Settings">
      <DashboardHero
        eyebrow="Workspace"
        title="Settings"
        description="Keep your account details current and choose the development signals you want to receive."
      />
      <main className="min-w-0 flex-1 p-3 sm:p-4 lg:p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Section
            eyebrow="Profile"
            title="Profile details"
            description="Your sign-in email is managed by your account provider."
          >
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-[#16243d]/20 bg-[#f7f3e8] text-xl font-black text-[#16243d]">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>
                    {(name || user.name || "P").slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <label
                  className={`inline-flex items-center gap-2 border border-[#16243d]/20 px-4 py-3 text-[10px] font-black uppercase tracking-[.14em] ${uploadAvatar.isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                >
                  Choose avatar
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={handleAvatarFile}
                  />
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => removeAvatar.mutate()}
                    disabled={removeAvatar.isPending}
                    className="ml-2 border border-red-800/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.14em] text-red-800 disabled:opacity-50"
                  >
                    {removeAvatar.isPending ? "Removing…" : "Remove picture"}
                  </button>
                )}
                <p className="mt-2 text-xs text-[#16243d]">
                  PNG, JPEG, or WebP. Maximum 2MB. Remove the current picture
                  to hide it from navigation.
                </p>
                {cropError && (
                  <p className="mt-2 text-xs font-semibold text-red-800">
                    {cropError}
                  </p>
                )}
                {cropSrc && (
                  <Card className="mt-5 max-w-sm border border-[#16243d]/15 bg-[#f7f3e8] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-[.14em] text-[#16243d]">
                        Crop preview
                      </p>
                      <button
                        type="button"
                        onClick={() => setCropSrc(null)}
                        className="text-xs font-bold text-[#16243d] hover:text-[#7d5e1e]"
                      >
                        Cancel
                      </button>
                    </div>
                    <img
                      ref={cropImageRef}
                      src={cropSrc}
                      alt="Selected avatar source"
                      className="sr-only"
                      onLoad={() => setCropZoom(1)}
                    />
                    <canvas
                      ref={cropCanvasRef}
                      className="mt-4 aspect-square w-full border border-[#16243d]/15 bg-[#16243d]"
                      aria-label="Square avatar crop preview"
                    />
                    <label className="mt-4 block text-[10px] font-black uppercase tracking-[.14em] text-[#16243d]">
                      Zoom
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.05"
                        value={cropZoom}
                        onChange={event =>
                          setCropZoom(Number(event.target.value))
                        }
                        className="mt-2 block w-full accent-[#a27e2e]"
                      />
                    </label>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <label className="text-[10px] font-black uppercase tracking-[.14em] text-[#16243d]">
                        Horizontal
                        <input
                          type="range"
                          min="-1"
                          max="1"
                          step="0.05"
                          value={cropX}
                          onChange={event =>
                            setCropX(Number(event.target.value))
                          }
                          className="mt-2 block w-full accent-[#a27e2e]"
                        />
                      </label>
                      <label className="text-[10px] font-black uppercase tracking-[.14em] text-[#16243d]">
                        Vertical
                        <input
                          type="range"
                          min="-1"
                          max="1"
                          step="0.05"
                          value={cropY}
                          onChange={event =>
                            setCropY(Number(event.target.value))
                          }
                          className="mt-2 block w-full accent-[#a27e2e]"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={confirmCrop}
                      disabled={uploadAvatar.isPending}
                      className="mt-4 w-full bg-[#16243d] px-4 py-3 text-[10px] font-black uppercase tracking-[.14em] text-[#f7f3e8] disabled:opacity-60"
                    >
                      {uploadAvatar.isPending ? (
                        <>
                          <Loader2
                            size={14}
                            className="animate-spin"
                            aria-hidden="true"
                          />{" "}
                          Uploading…
                        </>
                      ) : (
                        "Use this crop"
                      )}
                    </button>
                  </Card>
                )}
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-xs font-black uppercase tracking-[.14em] text-[#16243d]">
                Full name
                <Input
                  value={name}
                  onChange={event => setName(event.target.value)}
                  minLength={2}
                  maxLength={160}
                  required
                  className="mt-2"
                />
              </label>
            </div>
            <div className="mt-6">
              <label className="block text-xs font-black uppercase tracking-[.14em] text-[#16243d]">
                Account email
                <Input
                  value={user.email ?? ""}
                  readOnly
                  className="mt-2 cursor-not-allowed border border-[#16243d]/10 bg-[#ebe7dc] text-[#16243d]"
                />
              </label>
            </div>
            <Card className="mt-6 border border-[#16243d]/10 bg-[#ebe7dc]/60 p-4">
              <div className="flex items-start gap-3">
                <Globe2 size={17} className="mt-0.5 text-[#7d5e1e]" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]">
                    {"Connected account"}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#16243d]">
                    {user.loginMethod === "google"
                      ? "Google account connected"
                      : user.loginMethod
                        ? `${user.loginMethod} ${"account connected"}`
                        : "Email and password account"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#16243d]">
                    {user.loginMethod === "google"
                      ? "Your Google profile email and picture are used for secure sign-in. You can hide the picture below without disconnecting the account."
                      : "Your current sign-in method is shown here for account clarity."}
                  </p>
                </div>
              </div>
            </Card>
            <div className="mt-6">
              <label className="block text-xs font-black uppercase tracking-[.14em] text-[#16243d]">
                Timezone
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezoneOptions.map(option => (
                      <SelectItem key={option} value={option}>
                        {option.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
          </Section>

          <Section
            eyebrow="Growth"
            title="Learning goals"
            description="Select up to five priorities to make psychometric course recommendations more relevant."
          >
            <div className="mt-6 flex flex-wrap gap-2">
              {learningGoalOptions.map(goal => {
                const selected = learningGoals.includes(goal.value);
                return (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() =>
                      setLearningGoals(current =>
                        selected
                          ? current.filter(item => item !== goal.value)
                          : current.length < 5
                            ? [...current, goal.value]
                            : current
                      )
                    }
                    className={`border px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] ${selected ? "border-[#16243d] bg-[#16243d] text-[#f7f3e8]" : "border-[#16243d]/20 text-[#16243d] hover:border-[#16243d]"}`}
                    aria-pressed={selected}
                  >
                    {goal.label}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section
            eyebrow="Display"
            title="Display preference"
            description="Choose light, dark, or automatic system-synced appearance."
          >
            <div className="mt-6 grid grid-cols-3 border border-[#16243d]/15 p-1">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`px-3 py-3 text-[10px] font-black uppercase tracking-[.12em] ${theme === "light" ? "bg-[#16243d] text-[#f7f3e8]" : "text-[#16243d]"}`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`px-3 py-3 text-[10px] font-black uppercase tracking-[.12em] ${theme === "dark" ? "bg-[#16243d] text-[#f7f3e8]" : "text-[#16243d]"}`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme("auto")}
                className={`px-3 py-3 text-[10px] font-black uppercase tracking-[.12em] ${theme === "auto" ? "bg-[#c9a34e] text-[#16243d]" : "text-[#16243d]"}`}
              >
                Auto
              </button>
            </div>
          </Section>

          <Section
            eyebrow="Notifications"
            title="Notification preferences"
            description="Choose what is useful. You can change these preferences at any time."
          >
            <div className="mt-6 space-y-3">
              <Preference
                label="Assessment updates"
                description="Payment confirmations and report availability."
                checked={preferences.assessmentUpdates}
                onChange={checked =>
                  setPreferences(current => ({
                    ...current,
                    assessmentUpdates: checked,
                  }))
                }
              />
              <Preference
                label="Course announcements"
                description="New professional courses and enrollment windows."
                checked={preferences.courseAnnouncements}
                onChange={checked =>
                  setPreferences(current => ({
                    ...current,
                    courseAnnouncements: checked,
                  }))
                }
              />
              <Preference
                label="Instructor feedback by email"
                description="Receive an email when a staff reviewer posts new feedback on one of your lesson responses."
                checked={preferences.instructorFeedbackEmail}
                onChange={checked =>
                  setPreferences(current => ({
                    ...current,
                    instructorFeedbackEmail: checked,
                  }))
                }
              />
              <Preference
                label="Instructor feedback in workspace"
                description="Show new feedback alerts and unread status inside your course workspace."
                checked={preferences.instructorFeedbackInApp}
                onChange={checked =>
                  setPreferences(current => ({
                    ...current,
                    instructorFeedbackInApp: checked,
                  }))
                }
              />
              <Preference
                label="Monthly insights"
                description="Occasional prompts for reflective professional development."
                checked={preferences.monthlyInsights}
                onChange={checked =>
                  setPreferences(current => ({
                    ...current,
                    monthlyInsights: checked,
                  }))
                }
              />
              <Preference
                label="Show Google profile picture"
                description="Your Google image is stored on your account and shown only in authenticated navigation when enabled. Turn this off to use initials without deleting it; use Remove picture to permanently clear the stored image."
                checked={preferences.showAvatar !== false}
                onChange={checked =>
                  setPreferences(current => ({
                    ...current,
                    showAvatar: checked,
                  }))
                }
              />
            </div>
          </Section>

          {import.meta.env.DEV && (
            <Section
              eyebrow="Reviewer tools"
              title="QA fixture mode"
              description="Use three local-only paid report versions to verify trend charts and legend toggles. No database records are created and this control is unavailable in production."
            >
              <label className="mt-5 flex items-start gap-3 text-sm font-semibold text-[#16243d]">
                <input
                  type="checkbox"
                  checked={qaFixtureEnabled}
                  onChange={event => toggleQaFixture(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#a27e2e]"
                />
                Enable populated version preview on My dashboard
              </label>
            </Section>
          )}

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button
              type="submit"
              disabled={update.isPending}
              className="text-[11px] font-black uppercase tracking-[.15em]"
            >
              {update.isPending ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save size={15} /> {"Save preferences"}
                </>
              )}
            </Button>
            {saved && (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <Check size={16} /> Changes saved
              </span>
            )}
            {update.isError && (
              <span className="text-sm font-semibold text-red-800">
                Could not save changes. Please try again.
              </span>
            )}
          </div>
        </form>

        <Section
          id="payment-history"
          eyebrow="Enrollment"
          title={
            courseState.data?.length
              ? `${courseState.data.length} active course${courseState.data.length === 1 ? "" : "s"}`
              : "No course enrollments yet."
          }
          description={"Review your active courses and the staged payments attached to each enrollment."}
        >
          {courseState.isLoading ? (
            <div className="flex items-center gap-3 text-sm text-[#16243d]">
              <Loader2 size={16} className="animate-spin text-[#7d5e1e]" />{" "}
              {"Course enrollment status"}…
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {courseState.data?.map(record => {
                const paid = record.stages.filter(
                  stage => stage.paymentStatus === "paid"
                ).length;
                return (
                  <Card
                    key={record.enrollment.id}
                    className="border border-[#16243d]/10 bg-[#f7f3e8] p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="text-base font-bold text-[#16243d]">
                          {record.enrollment.courseSlug}
                        </h3>
                        <p className="mt-1 text-xs text-[#16243d]">
                          {paid} / {record.stages.length} staged payments
                          complete
                        </p>
                      </div>
                      <span
                        className={`inline-flex w-fit items-center gap-2 border px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] ${paid > 0 ? "border-emerald-800/30 text-emerald-800" : "border-[#7d5e1e]/40 text-[#7d5e1e]"}`}
                      >
                        {paid > 0 ? "Paid" : "Payment pending"}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {record.stages.slice(0, 4).map(stage => (
                        <div
                          key={stage.id}
                          className="flex items-center justify-between border-t border-[#16243d]/10 pt-2 text-xs"
                        >
                          <span className="text-[#16243d]">
                            {"Stage"} {stage.stage} · KES{" "}
                            {stage.amountKes.toLocaleString()}
                          </span>
                          <span
                            className={
                              stage.paymentStatus === "paid"
                                ? "font-bold text-emerald-800"
                                : "text-[#16243d]"
                            }
                          >
                            {stage.paymentStatus === "paid"
                              ? `${"Paid"} · ${stage.paidAt ? new Date(stage.paidAt).toLocaleDateString() : ""}`
                              : "Payment pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>

        <Section
          eyebrow="Security"
          title="Recent activity"
          description="Review your own sign-in history, check device and location signals, and revoke any session you do not recognize."
        >
          <div className="mt-6 flex flex-wrap gap-2">
            {currentSessionId && (
              <Button
                type="button"
                onClick={() =>
                  setPendingRevoke({ kind: "current", label: "this device" })
                }
                disabled={revokeCurrentSession.isPending}
                variant="outline"
                size="sm"
                className="text-[10px] font-black uppercase tracking-[.1em] text-red-800 hover:text-red-800"
              >
                {revokeCurrentSession.isPending ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <LogOut size={12} />
                )}{" "}
                Sign out this device
              </Button>
            )}
            {(sessions.data?.sessions.length ?? 0) > 1 && (
              <Button
                type="button"
                onClick={() =>
                  setPendingRevoke({
                    kind: "others",
                    label: "all other active sessions",
                  })
                }
                disabled={revokeOtherSessions.isPending}
                variant="outline"
                size="sm"
                className="text-[10px] font-black uppercase tracking-[.1em] text-red-800 hover:text-red-800"
              >
                {revokeOtherSessions.isPending ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <LogOut size={12} />
                )}{" "}
                Sign out other sessions
              </Button>
            )}
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]">
                Active sessions · revoke unrecognized access
              </p>
              <div className="mt-3 divide-y divide-[#16243d]/10 border-y border-[#16243d]/10">
                {(sessions.data?.sessions.length ?? 0) === 0 ? (
                  <p className="py-4 text-sm text-[#16243d]">
                    No active session records yet.
                  </p>
                ) : (
                  sessions.data?.sessions.map(session => (
                    <div
                      key={session.id}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <Monitor size={16} className="mt-0.5 text-[#7d5e1e]" />
                        <div>
                          <p className="text-sm font-bold text-[#16243d]">
                            {session.id === currentSessionId
                              ? "This device"
                              : sessionLabel(session.userAgent)}
                          </p>
                          <p className="mt-1 text-xs capitalize text-[#16243d]">
                            {session.deviceType ?? "unknown"} device
                            {session.estimatedLocation
                              ? ` · estimated location ${session.estimatedLocation}`
                              : " · location unavailable"}
                          </p>
                          <p className="mt-1 text-xs text-[#16243d]">
                            Last active{" "}
                            {new Date(session.lastSeenAt).toLocaleString()}
                          </p>
                          {session.trustedDevice && (
                            <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[.1em] text-emerald-800">
                              <ShieldCheck size={11} /> Trusted device
                            </span>
                          )}
                        </div>
                      </div>
                      {session.id === currentSessionId ? (
                        <span className="text-[10px] font-black uppercase tracking-[.1em] text-emerald-800">
                          Current
                        </span>
                      ) : (
                        <Button
                          type="button"
                          onClick={() =>
                            setPendingRevoke({
                              kind: "session",
                              sessionId: session.id,
                              label: sessionLabel(session.userAgent),
                            })
                          }
                          disabled={revokeSession.isPending}
                          variant="outline"
                          size="sm"
                          className="self-start text-[10px] font-black uppercase tracking-[.1em] text-red-800 hover:text-red-800"
                        >
                          {revokeSession.isPending
                            ? "Revoking…"
                            : "Revoke access"}
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <div className="flex flex-col gap-3 border-b border-[#16243d]/10 pb-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]">
                    Recent login history
                  </p>
                  <p className="mt-1 text-xs text-[#16243d]">
                    Search by the device classification or estimated location
                    recorded at sign-in.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#16243d]">
                      Device
                      <Select
                        value={activityDevice}
                        onValueChange={value =>
                          setActivityDevice(value as typeof activityDevice)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="All devices" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All devices</SelectItem>
                          <SelectItem value="desktop">Desktop</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                          <SelectItem value="tablet">Tablet</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </label>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#16243d]">
                      Location
                      <Input
                        value={activityLocation}
                        onChange={event =>
                          setActivityLocation(event.target.value)
                        }
                        placeholder="e.g. KE"
                        maxLength={80}
                        className="mt-1"
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-3 divide-y divide-[#16243d]/10 border-y border-[#16243d]/10">
                {(loginHistory.data?.length ?? 0) === 0 ? (
                  <p className="py-4 text-sm text-[#16243d]">
                    No recent login events to display.
                  </p>
                ) : (
                  loginHistory.data?.map(event => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between gap-3 py-4"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#16243d]">
                          {event.success
                            ? "Successful sign-in"
                            : "Sign-in blocked"}
                        </p>
                        <p className="mt-1 text-xs capitalize text-[#16243d]">
                          {event.identifierType} ·{" "}
                          {event.failureCode?.replaceAll("_", " ") ??
                            "Authenticated"}
                        </p>
                        <p className="mt-1 text-xs text-[#16243d]">
                          {event.deviceType ?? "Unknown device"} ·{" "}
                          {event.estimatedLocation
                            ? `estimated location ${event.estimatedLocation}`
                            : "location unavailable"}
                        </p>
                      </div>
                      <time className="shrink-0 text-right text-[11px] text-[#16243d]">
                        {new Date(event.createdAt).toLocaleString()}
                      </time>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Section>

        <Card className="mt-8 border-l-4 border-[#c9a34e] bg-[#16243d] p-5 text-sm leading-6 text-[#f7f3e8]">
          <div className="flex items-start gap-3">
            <LockKeyhole size={18} className="mt-0.5 shrink-0 text-[#8b6914]" />
            <p>
              <strong className="text-[#f7f3e8]">Account privacy.</strong> Your
              preferences are saved to your authenticated account and are not
              visible to other participants.
            </p>
          </div>
        </Card>

        {pendingRevoke && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-[#101d35]/75 p-4"
            role="presentation"
          >
            <Card
              role="dialog"
              aria-modal="true"
              aria-labelledby="revoke-dialog-title"
              aria-describedby="revoke-dialog-copy"
              className="w-full max-w-md border border-[#c9a34e] bg-[#f7f3e8] p-6 text-[#16243d] shadow-2xl sm:p-8"
            >
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={22}
                  className="mt-0.5 shrink-0 text-[#7d5e1e]"
                />
                <div>
                  <p className="eyebrow text-[#7d5e1e]">
                    Security confirmation
                  </p>
                  <h2
                    id="revoke-dialog-title"
                    className="display mt-2 text-2xl text-[#16243d]"
                  >
                    Revoke {pendingRevoke.label}?
                  </h2>
                </div>
              </div>
              <p
                id="revoke-dialog-copy"
                className="mt-5 text-sm leading-7 text-[#16243d]"
              >
                This will immediately end access for the selected session. The
                device will need to sign in again, and this action cannot be
                undone.
              </p>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  onClick={() => setPendingRevoke(null)}
                  disabled={
                    revokeSession.isPending ||
                    revokeOtherSessions.isPending ||
                    revokeCurrentSession.isPending
                  }
                  variant="outline"
                  className="text-[10px] font-black uppercase tracking-[.12em]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={confirmPendingRevoke}
                  disabled={
                    revokeSession.isPending ||
                    revokeOtherSessions.isPending ||
                    revokeCurrentSession.isPending
                  }
                  className="bg-red-800 text-[10px] font-black uppercase tracking-[.12em] text-[#f7f3e8] hover:bg-red-800/90"
                >
                  {revokeSession.isPending ||
                  revokeOtherSessions.isPending ||
                  revokeCurrentSession.isPending ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : null}
                  {revokeSession.isPending ||
                  revokeOtherSessions.isPending ||
                  revokeCurrentSession.isPending
                    ? "Revoking…"
                    : "Yes, revoke access"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}

function Preference({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Card className="flex cursor-pointer items-start gap-4 border border-[#16243d]/10 bg-[#f7f3e8]/75 p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-[#7d5e1e]"
      />
      <span>
        <span className="block text-sm font-bold text-[#16243d]">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-[#16243d]">
          {description}
        </span>
      </span>
    </Card>
  );
}
function LoadingState() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f3e8] text-[#16243d]">
      <RefreshCw className="animate-spin text-[#7d5e1e]" />
    </div>
  );
}
function AccessState() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f3e8] px-6 text-[#16243d]">
      <div className="max-w-md border-t-2 border-[#c9a34e] bg-white/50 p-8 text-center">
        <LockKeyhole className="mx-auto text-[#7d5e1e]" />
      </div>
    </div>
  );
}
