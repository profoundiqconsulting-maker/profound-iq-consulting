import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Settings2,
  Mail,
  CalendarClock,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Server,
  Key,
} from "lucide-react";

type HealthStatus = "healthy" | "degraded" | "down";

function statusIcon(status: HealthStatus) {
  if (status === "healthy") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === "degraded") return <AlertTriangle className="h-4 w-4 text-amber-600" />;
  return <XCircle className="h-4 w-4 text-red-600" />;
}

export default function AdminSystem() {
  const settingsQuery = trpc.admin.systemSettings.useQuery(undefined, {
    retry: false,
    refetchInterval: false,
  });
  const emailConnection = trpc.admin.emailConnection.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const scheduleStatus = trpc.admin.scheduleStatus.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });

  const saveMutation = trpc.admin.upsertSystemSetting.useMutation({
    onSuccess: () => {
      void settingsQuery.refetch();
      toast.success("Setting saved");
    },
    onError: error => toast.error(error.message),
  });

  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settingsQuery.data) {
      const next: Record<string, string> = {};
      for (const row of settingsQuery.data) next[row.settingKey] = row.settingValue;
      setForm(next);
    }
  }, [settingsQuery.data]);

  const setValue = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const save = (key: string) =>
    saveMutation.mutate({ settingKey: key, settingValue: form[key] || "" });

  const saveAll = () => {
    for (const key of Object.keys(form)) save(key);
  };

  const emailStatus: HealthStatus = emailConnection.data?.connected
    ? "healthy"
    : emailConnection.isLoading
      ? "degraded"
      : "down";

  const scheduleHealth: HealthStatus = scheduleStatus.data?.config?.scheduleTaskUid
    ? "healthy"
    : "degraded";

  const defaultKeys = [
    { key: "resend_api_key", label: "Resend API Key", placeholder: "re_...", masked: true },
    { key: "email_from", label: "From address", placeholder: "noreply@profoundiq.com" },
    { key: "email_from_name", label: "From name", placeholder: "Profound IQ Consulting" },
    { key: "paystack_key", label: "Paystack Key", placeholder: "pk_live_...", masked: true },
    { key: "paystack_secret", label: "Paystack Secret", placeholder: "sk_live_...", masked: true },
    { key: "google_client_id", label: "Google Client ID", placeholder: "..." },
    { key: "google_client_secret", label: "Google Client Secret", placeholder: "••••••••", masked: true },
  ];

  return (
    <DashboardLayout role="admin" title="System">
      <div className="admin-observatory w-full space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="exec-eyebrow">Infrastructure</p>
            <h1 className="display mt-2 text-3xl">Configuration and health</h1>
            <p className="mt-1 text-sm text-[#64748b]">
              Manage platform credentials, verify external services, and monitor scheduled jobs.
            </p>
          </div>
          <Button
            type="button"
            onClick={saveAll}
            disabled={saveMutation.isPending}
            className="bg-[#16243d] text-[#f7f3e8] hover:bg-[#0a1426]"
          >
            {saveMutation.isPending ? "Saving..." : "Save all settings"}
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="exec-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#16243d]/5 text-[#16243d]">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="exec-label-muted">Email service</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
                  {statusIcon(emailStatus)}
                  {emailConnection.isLoading
                    ? "Checking..."
                    : emailConnection.data?.connected
                      ? "Connected"
                      : "Disconnected"}
                </p>
                {emailConnection.data?.error && (
                  <p className="text-xs text-red-700">{emailConnection.data.error}</p>
                )}
                {!emailConnection.isLoading && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => emailConnection.refetch()}
                    className="mt-2 h-7 text-[10px] font-black uppercase tracking-[.08em]"
                  >
                    <RefreshCw className="mr-1.5 h-3 w-3" /> Re-verify
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card className="exec-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#16243d]/5 text-[#16243d]">
                <CalendarClock className="h-4 w-4" />
              </div>
              <div>
                <p className="exec-label-muted">Scheduled exports</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
                  {statusIcon(scheduleHealth)}
                  {scheduleStatus.data?.config?.scheduleTaskUid ? "Active" : "Inactive"}
                </p>
                <p className="text-xs text-[#64748b]">
                  {scheduleStatus.data?.config?.lastRunAt
                    ? `Last run: ${new Date(scheduleStatus.data.config.lastRunAt).toLocaleString()}`
                    : "No runs yet"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="exec-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#16243d]/5 text-[#16243d]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="exec-label-muted">Security posture</p>
                <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                  Operational
                </p>
                <p className="text-xs text-[#64748b]">
                  Review security logs and access controls in the security section.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="exec-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#16243d]/5 text-[#16243d]">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <p className="exec-label-gold">Credentials and keys</p>
              <p className="mt-1 text-xs text-[#64748b]">
                Update API keys and integration settings. Values are stored securely.
              </p>
            </div>
          </div>
          <Separator className="my-5" />
          <div className="space-y-4">
            {defaultKeys.map(item => (
              <div
                key={item.key}
                className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)_auto] sm:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">{item.label}</p>
                  <p className="text-[10px] uppercase tracking-[.12em] text-[#64748b]">{item.key}</p>
                </div>
                <Input
                  value={form[item.key] ?? ""}
                  onChange={event => setValue(item.key, event.target.value)}
                  placeholder={item.placeholder}
                  type={item.masked ? "password" : "text"}
                  className="h-9"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => save(item.key)}
                  disabled={saveMutation.isPending}
                  className="h-8 text-[10px] font-black uppercase tracking-[.08em]"
                >
                  Save
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
