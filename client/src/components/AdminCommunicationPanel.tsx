/* Profound IQ Consulting — Admin communications panel: campaigns and tickets. */
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Send,
  Ticket,
  Users,
  CalendarClock,
  Filter,
  UserPlus,
  CheckCircle2,
} from "lucide-react";

type CampaignTab = "campaigns" | "tickets";

export default function AdminCommunicationPanel() {
  const [tab, setTab] = useState<CampaignTab>("campaigns");

  return (
    <div className="mt-8 space-y-8">
      <div className="flex gap-2" role="tablist" aria-label="Communications">
        <Button
          type="button"
          role="tab"
          aria-selected={tab === "campaigns"}
          onClick={() => setTab("campaigns")}
          variant={tab === "campaigns" ? "default" : "outline"}
          size="sm"
          className="text-[10px] font-black uppercase tracking-[.12em]"
        >
          <Mail size={14} className="mr-2" /> Campaigns
        </Button>
        <Button
          type="button"
          role="tab"
          aria-selected={tab === "tickets"}
          onClick={() => setTab("tickets")}
          variant={tab === "tickets" ? "default" : "outline"}
          size="sm"
          className="text-[10px] font-black uppercase tracking-[.12em]"
        >
          <Ticket size={14} className="mr-2" /> Tickets
        </Button>
      </div>
      {tab === "campaigns" && <CampaignComposer />}
      {tab === "tickets" && <TicketManager />}
    </div>
  );
}

function CampaignComposer() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [recipientType, setRecipientType] = useState<"all" | "psychometrics" | "careerpath" | "courses" | "enrollment" | "assessment">("all");
  const [timePeriod, setTimePeriod] = useState("");
  const [sending, setSending] = useState(false);

  const campaigns = trpc.communication.campaigns.list.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });
  const createCampaign = trpc.communication.campaigns.create.useMutation({
    onSuccess: () => {
      setTitle("");
      setBody("");
      setRecipientType("all");
      setTimePeriod("");
      toast.success("Campaign created.");
      campaigns.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSend = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required.");
      return;
    }
    setSending(true);
    const filters: Record<string, unknown> = {};
    if (timePeriod) filters.timePeriod = timePeriod;
    createCampaign.mutate(
      { title: title.trim(), body: body.trim(), recipientType, filters },
      {
        onSettled: () => setSending(false),
      }
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New Campaign</CardTitle>
          <CardDescription>
            Send a message to a targeted group of users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Title
            </label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Campaign title"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Message
            </label>
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write your message…"
              rows={5}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Recipients
            </label>
            <Select value={recipientType} onValueChange={(value) => setRecipientType(value as typeof recipientType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipient group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="psychometrics">
                  Psychometrics respondents
                </SelectItem>
                <SelectItem value="careerpath">
                  CareerPath participants
                </SelectItem>
                <SelectItem value="courses">
                  Course enrollees
                </SelectItem>
                <SelectItem value="enrollment">
                  Recent enrollees
                </SelectItem>
                <SelectItem value="assessment">
                  Recent assessments
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Time period (optional)
            </label>
            <Input
              value={timePeriod}
              onChange={(event) => setTimePeriod(event.target.value)}
              placeholder="e.g. last 30 days"
            />
          </div>
          <Button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="w-full bg-[#16243d] text-white"
          >
            <Send size={14} className="mr-2" />
            {sending ? "Sending…" : "Send Campaign"}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Campaigns</CardTitle>
          <CardDescription>
            {campaigns.data?.length ?? 0} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.isLoading ? (
            <p className="py-8 text-center text-sm text-slate-600">Loading…</p>
          ) : (campaigns.data ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-600">
              No campaigns yet.
            </p>
          ) : (
            <div className="space-y-2">
              {(campaigns.data ?? []).map(campaign => (
                <div
                  key={campaign.id}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <p className="font-semibold text-slate-900">{campaign.title}</p>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {campaign.body}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline" className="capitalize">
                      {campaign.recipientType}
                    </Badge>
                    <span className="text-xs text-slate-600">
                      {campaign.sentAt
                        ? new Date(campaign.sentAt).toLocaleString()
                        : "Draft"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TicketManager() {
  const [status, setStatus] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [assignedToOpenId, setAssignedToOpenId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [followUpValues, setFollowUpValues] = useState<Record<number, string>>({});
  const [savingFollowUpId, setSavingFollowUpId] = useState<number | null>(null);

  const users = trpc.admin.listAllUsers.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });

  const tickets = trpc.communication.tickets.list.useQuery(
    { status },
    { retry: false, refetchOnWindowFocus: true }
  );
  const createTicket = trpc.communication.tickets.create.useMutation({
    onSuccess: () => {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setAssignedToOpenId("");
      toast.success("Ticket created.");
      tickets.refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  const updateTicket = trpc.communication.tickets.update.useMutation({
    onSuccess: () => {
      tickets.refetch();
      setSavingFollowUpId(null);
    },
    onError: (error) => {
      toast.error(error.message);
      setSavingFollowUpId(null);
    },
  });

  const staffUsers = (users.data ?? []).filter(
    u => u.role === "staff" || u.role === "admin"
  );

  const handleFollowUpSave = (ticketId: number, followUp: string) => {
    setSavingFollowUpId(ticketId);
    updateTicket.mutate({ id: ticketId, followUp: followUp.trim() || undefined });
    setFollowUpValues(prev => {
      const next = { ...prev };
      delete next[ticketId];
      return next;
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New Ticket</CardTitle>
          <CardDescription>
            Create an action ticket and assign it to staff.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Title
            </label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ticket title"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the action needed…"
              rows={4}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Priority
            </label>
            <Select value={priority} onValueChange={(value) => setPriority(value as typeof priority)}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Assign to (optional)
            </label>
            <Select value={assignedToOpenId} onValueChange={setAssignedToOpenId}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {staffUsers.map(staff => (
                  <SelectItem key={staff.openId} value={staff.openId}>
                    {staff.name || staff.email} ({staff.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={() => {
              if (!title.trim() || !description.trim()) {
                toast.error("Title and description are required.");
                return;
              }
              setCreating(true);
              createTicket.mutate(
                {
                  title: title.trim(),
                  description: description.trim(),
                  priority,
                  assignedToOpenId: assignedToOpenId || undefined,
                },
                { onSettled: () => setCreating(false) }
              );
            }}
            disabled={creating}
            className="w-full bg-[#16243d] text-white"
          >
            <UserPlus size={14} className="mr-2" />
            {creating ? "Creating…" : "Create Ticket"}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Tickets</CardTitle>
            <CardDescription>
              {tickets.data?.length ?? 0} total
            </CardDescription>
          </div>
          <Select
            value={status ?? "all"}
            onValueChange={(value) =>
              setStatus(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {tickets.isLoading ? (
            <p className="py-8 text-center text-sm text-slate-600">Loading…</p>
          ) : (tickets.data ?? []).length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto mb-3 text-[#8b6914]" size={32} />
              <p className="text-sm text-slate-600">No tickets found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(tickets.data ?? []).map(ticket => {
                const isEditingFollowUp = followUpValues[ticket.id] !== undefined;
                const followUpText = isEditingFollowUp
                  ? followUpValues[ticket.id]
                  : ticket.followUp ?? "";

                return (
                  <div
                    key={ticket.id}
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{ticket.title}</p>
                        <p className="text-xs text-slate-600 line-clamp-1">{ticket.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline" className="capitalize">
                            {ticket.status}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {ticket.priority}
                          </Badge>
                          {ticket.assignedToName && (
                            <span className="text-xs text-slate-600">
                              Assigned to: {ticket.assignedToName}
                            </span>
                          )}
                        </div>
                      </div>
                      <select
                        value={ticket.status}
                        onChange={(e) => updateTicket.mutate({ id: ticket.id, status: e.target.value })}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-[#c9a34e] focus:outline-none"
                        aria-label={`Update status for ${ticket.title}`}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div className="mt-3">
                      <label className="text-[10px] font-bold uppercase tracking-[.1em] text-slate-500">
                        Follow-up
                      </label>
                      <Textarea
                        value={followUpText}
                        onChange={(e) =>
                          setFollowUpValues(prev => ({
                            ...prev,
                            [ticket.id]: e.target.value,
                          }))
                        }
                        placeholder="Add follow-up notes..."
                        rows={2}
                        className="mt-1 text-xs"
                      />
                      <div className="mt-1 flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          disabled={savingFollowUpId === ticket.id}
                          onClick={() => handleFollowUpSave(ticket.id, followUpText)}
                          className="text-[10px] font-black uppercase tracking-[.08em]"
                        >
                          {savingFollowUpId === ticket.id ? "Saving…" : "Save follow-up"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
