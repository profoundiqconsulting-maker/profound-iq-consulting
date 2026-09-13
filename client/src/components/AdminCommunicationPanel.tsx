/* Profound IQ Consulting — Admin communications panel: campaigns and tickets. */
import { useState } from "react";
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
  const [creating, setCreating] = useState(false);

  const tickets = trpc.communication.tickets.list.useQuery(
    { status },
    { retry: false, refetchOnWindowFocus: true }
  );
  const createTicket = trpc.communication.tickets.create.useMutation({
    onSuccess: () => {
      setTitle("");
      setDescription("");
      setPriority("medium");
      toast.success("Ticket created.");
      tickets.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

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
          <Button
            type="button"
            onClick={() => {
              if (!title.trim() || !description.trim()) {
                toast.error("Title and description are required.");
                return;
              }
              setCreating(true);
              createTicket.mutate(
                { title: title.trim(), description: description.trim(), priority },
                { onSettled: () => setCreating(false) }
              );
            }}
            disabled={creating}
            className="w-full bg-[#16243d] text-white"
          >
            <Ticket size={14} className="mr-2" />
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
            <p className="py-8 text-center text-sm text-slate-600">
              No tickets found.
            </p>
          ) : (
            <div className="space-y-2">
              {(tickets.data ?? []).map(ticket => (
                <div
                  key={ticket.id}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <p className="font-semibold text-slate-900">{ticket.title}</p>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {ticket.description}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline" className="capitalize">
                      {ticket.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {ticket.priority}
                    </Badge>
                    {ticket.assignedToName && (
                      <span className="text-xs text-slate-600">
                        {ticket.assignedToName}
                      </span>
                    )}
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
