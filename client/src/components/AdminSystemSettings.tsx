import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const DEFAULT_KEYS = [
  { key: "resend_api_key", label: "Resend API Key", placeholder: "re_..." },
  { key: "email_from", label: "From address", placeholder: "noreply@profoundiq.com" },
  { key: "email_from_name", label: "From name", placeholder: "Profound IQ Consulting" },
  { key: "paystack_key", label: "Paystack Key", placeholder: "pk_live_..." },
  { key: "paystack_secret", label: "Paystack Secret", placeholder: "sk_live_..." },
  { key: "google_client_id", label: "Google Client ID", placeholder: "..." },
  { key: "google_client_secret", label: "Google Client Secret", placeholder: "••••••••" },
];

export default function AdminSystemSettings() {
  const settingsQuery = trpc.admin.systemSettings.useQuery(undefined, {
    retry: false,
    refetchInterval: false,
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
    saveMutation.mutate({ settingKey: key, settingValue: form[key] || "", masked: "masked" });

  const saveAll = () => {
    for (const key of Object.keys(form)) save(key);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-[#b8860b]">Infrastructure</p>
          <h2 className="display mt-2 text-2xl">System settings</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
            Manage API keys, Resend, payment, and OAuth credentials required to run the platform.
          </p>
        </div>
        <Button
          type="button"
          onClick={saveAll}
          disabled={saveMutation.isPending}
          className="bg-[#16243d] text-[#f7f3e8] hover:bg-[#0a1426]"
        >
          {saveMutation.isPending ? "Saving..." : "Save all"}
        </Button>
      </div>

      <Card className="space-y-4 border border-[#16243d]/15 bg-white p-5">
        {DEFAULT_KEYS.map(item => (
          <div key={item.key} className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)_auto] sm:items-center">
            <div>
              <p className="text-sm font-semibold text-[#16243d]">{item.label}</p>
              <p className="text-[10px] uppercase tracking-[.12em] text-[#475569]">{item.key}</p>
            </div>
            <Input
              value={form[item.key] ?? ""}
              onChange={event => setValue(item.key, event.target.value)}
              placeholder={item.placeholder}
              className="font-mono text-xs"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => save(item.key)}
              disabled={saveMutation.isPending}
            >
              Save
            </Button>
          </div>
        ))}
      </Card>
    </div>
  );
}


