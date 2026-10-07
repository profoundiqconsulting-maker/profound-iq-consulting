import { useEffect, useState } from "react";
import { ArrowLeft, Save, UserCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { Link } from "wouter";
import type { RouteComponentProps } from "wouter";

type UserRow = {
  openId: string;
  name: string | null;
  email: string | null;
  role: string;
  loginMethod: string | null;
  createdAt: Date;
  lastSignedIn: Date | null;
};

type UserProfileDetails = {
  timezone?: string;
  learningGoals?: string[];
  notificationPreferences?: {
    assessmentUpdates?: boolean;
    courseAnnouncements?: boolean;
    monthlyInsights?: boolean;
    showAvatar?: boolean;
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  leaderboardOptIn?: boolean;
  leaderboardDisplayName?: string | null;
  exportPreferences?: {
    pageSize?: "A4" | "LETTER";
    watermark?: boolean;
    coverPage?: boolean;
    coverTemplate?: string;
  };
};

export default function AdminUserProfile(props: RouteComponentProps<{ openId: string }>) {
  const params = props.params ?? (window as unknown as { params?: { openId?: string } }).params;
  const openId = params?.openId;

  const userQuery = trpc.admin.listAllUsers.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
    enabled: false,
  });

  const profileQuery = trpc.admin.getUserProfile.useQuery(
    { openId: openId ?? "" },
    { enabled: Boolean(openId), retry: false }
  );

  const user = userQuery.data?.find((u: UserRow) => u.openId === openId) ?? null;
  const profile = profileQuery.data as UserProfileDetails | null | undefined;

  const updateProfile = trpc.admin.adminUpdateUserProfile.useMutation({
    onSuccess: () => {
      toast.success("User profile updated");
      void profileQuery.refetch();
      void userQuery.refetch();
    },
    onError: error => {
      toast.error("Update failed", { description: error.message });
    },
  });

  const updateRole = trpc.admin.updateStaffRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated");
      void userQuery.refetch();
    },
    onError: error => {
      toast.error("Update failed", { description: error.message });
    },
  });

  const [form, setForm] = useState({
    name: "",
    timezone: "",
    email: "",
    role: "user" as "user" | "staff" | "admin",
    learningGoals: "",
    notificationEmail: true,
    notificationPush: false,
    notificationSms: false,
    notificationAssessmentUpdates: true,
    notificationCourseAnnouncements: true,
    notificationMonthlyInsights: false,
    notificationShowAvatar: true,
    leaderboardOptIn: false,
    leaderboardDisplayName: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user && !profile) return;
    setForm({
      name: user?.name ?? "",
      timezone: profile?.timezone ?? "Africa/Nairobi",
      email: user?.email ?? "",
      role: (user?.role as "user" | "staff" | "admin") ?? "user",
      learningGoals: (profile?.learningGoals ?? []).join(", "),
      notificationEmail: profile?.notificationPreferences?.email ?? true,
      notificationPush: profile?.notificationPreferences?.push ?? false,
      notificationSms: profile?.notificationPreferences?.sms ?? false,
      notificationAssessmentUpdates: profile?.notificationPreferences?.assessmentUpdates ?? true,
      notificationCourseAnnouncements: profile?.notificationPreferences?.courseAnnouncements ?? true,
      notificationMonthlyInsights: profile?.notificationPreferences?.monthlyInsights ?? false,
      notificationShowAvatar: profile?.notificationPreferences?.showAvatar ?? true,
      leaderboardOptIn: profile?.leaderboardOptIn ?? false,
      leaderboardDisplayName: profile?.leaderboardDisplayName ?? "",
    });
  }, [user?.openId, profile?.timezone]);

  if (!openId) {
    return (
      <DashboardLayout role="admin" title="User Profile">
        <div className="p-6 text-sm text-[#64748b]">No user selected.</div>
      </DashboardLayout>
    );
  }

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        openId,
        name: form.name,
        timezone: form.timezone,
        learningGoals: form.learningGoals
          .split(",")
          .map(item => item.trim())
          .filter(Boolean),
        notificationPreferences: {
          assessmentUpdates: form.notificationAssessmentUpdates,
          courseAnnouncements: form.notificationCourseAnnouncements,
          monthlyInsights: form.notificationMonthlyInsights,
          showAvatar: form.notificationShowAvatar,
        },
        leaderboardOptIn: form.leaderboardOptIn,
        leaderboardDisplayName: form.leaderboardDisplayName || null,
      });
      if (user?.role !== form.role) {
        await updateRole.mutateAsync({ openId, role: form.role });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="admin" title="User Profile">
      <div className="admin-observatory w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="exec-eyebrow">User Management</p>
            <h1 className="display mt-2 text-3xl">User Profile</h1>
            <p className="mt-1 text-sm text-[#64748b]">
              View and edit user details and preferences.
            </p>
          </div>
          <Link href="/admin/users">
            <button
              type="button"
              className="inline-flex items-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] hover:border-[#c9a34e]"
            >
              <ArrowLeft size={13} /> Back to users
            </button>
          </Link>
        </div>

        <div className="exec-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
              Full name
              <input
                value={form.name}
                onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
                className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
              Email
              <input
                value={form.email}
                disabled
                className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm text-[#64748b]"
              />
            </label>
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
              Timezone
              <input
                value={form.timezone}
                onChange={event => setForm(prev => ({ ...prev, timezone: event.target.value }))}
                className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
              Role
              <select
                value={form.role}
                onChange={event =>
                  setForm(prev => ({
                    ...prev,
                    role: event.target.value as "user" | "staff" | "admin",
                  }))
                }
                className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm"
              >
                <option value="user">Learner</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
              Learning goals (comma-separated)
              <textarea
                value={form.learningGoals}
                onChange={event =>
                  setForm(prev => ({ ...prev, learningGoals: event.target.value }))
                }
                rows={3}
                className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
              Leaderboard display name
              <input
                value={form.leaderboardDisplayName}
                onChange={event =>
                  setForm(prev => ({ ...prev, leaderboardDisplayName: event.target.value }))
                }
                className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
              <input
                type="checkbox"
                checked={form.leaderboardOptIn}
                onChange={event =>
                  setForm(prev => ({ ...prev, leaderboardOptIn: event.target.checked }))
                }
              />
              Leaderboard opt-in
            </label>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
              <input
                type="checkbox"
                checked={form.notificationEmail}
                onChange={event =>
                  setForm(prev => ({ ...prev, notificationEmail: event.target.checked }))
                }
              />
              Email notifications
            </label>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
              <input
                type="checkbox"
                checked={form.notificationPush}
                onChange={event =>
                  setForm(prev => ({ ...prev, notificationPush: event.target.checked }))
                }
              />
              Push notifications
            </label>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
              <input
                type="checkbox"
                checked={form.notificationSms}
                onChange={event =>
                  setForm(prev => ({ ...prev, notificationSms: event.target.checked }))
                }
              />
              SMS notifications
            </label>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
              <input
                type="checkbox"
                checked={form.notificationAssessmentUpdates}
                onChange={event =>
                  setForm(prev => ({ ...prev, notificationAssessmentUpdates: event.target.checked }))
                }
              />
              Assessment updates
            </label>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
              <input
                type="checkbox"
                checked={form.notificationCourseAnnouncements}
                onChange={event =>
                  setForm(prev => ({ ...prev, notificationCourseAnnouncements: event.target.checked }))
                }
              />
              Course announcements
            </label>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
              <input
                type="checkbox"
                checked={form.notificationMonthlyInsights}
                onChange={event =>
                  setForm(prev => ({ ...prev, notificationMonthlyInsights: event.target.checked }))
                }
              />
              Monthly insights
            </label>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
              <input
                type="checkbox"
                checked={form.notificationShowAvatar}
                onChange={event =>
                  setForm(prev => ({ ...prev, notificationShowAvatar: event.target.checked }))
                }
              />
              Show avatar
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={save}
              disabled={saving || updateProfile.isPending || updateRole.isPending}
              className="inline-flex items-center gap-2 bg-[#16243d] px-4 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] hover:bg-[#16243d]/90 disabled:opacity-60"
            >
              <Save size={13} /> Save changes
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
