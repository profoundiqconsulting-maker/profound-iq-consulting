/* Profound IQ Consulting — Communication inbox for authenticated users. */
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
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
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MailOpen,
  MessageSquare,
  Plus,
  Send,
  Ticket,
  ArrowLeft,
  Forward,
  UserPlus,
  CheckCircle2,
} from "lucide-react";

type Tab = "conversations" | "tickets";

export default function CommunicationInbox() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("conversations");
  const [composeOpen, setComposeOpen] = useState(false);
  const [, navigate] = useLocation();

  return (
    <DashboardLayout role={user?.role as "admin" | "staff" | "user" | undefined} title="Communications">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="display text-2xl text-slate-900">Communications</h1>
            <p className="text-sm text-slate-600">
              Your messages, conversations, and action tickets.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setComposeOpen(open => !open)}
              size="sm"
              className="text-[10px] font-black uppercase tracking-[.12em]"
            >
              <Plus size={14} className="mr-2" /> New Conversation
            </Button>
            {user?.role === "admin" && (
              <Button
                onClick={() => navigate("/admin?tab=communications")}
                variant="outline"
                size="sm"
                className="text-[10px] font-black uppercase tracking-[.12em]"
              >
                <Mail size={14} className="mr-2" /> Admin Composer
              </Button>
            )}
          </div>
        </div>

        {composeOpen && (
          <ComposeForm onClose={() => setComposeOpen(false)} />
        )}

        <div className="mb-4 flex gap-2">
          <Button
            type="button"
            variant={tab === "conversations" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("conversations")}
            className="text-[10px] font-black uppercase tracking-[.12em]"
          >
            <MessageSquare size={14} className="mr-2" /> Messages
          </Button>
          <Button
            type="button"
            variant={tab === "tickets" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("tickets")}
            className="text-[10px] font-black uppercase tracking-[.12em]"
          >
            <Ticket size={14} className="mr-2" /> Tickets
          </Button>
        </div>
        {tab === "conversations" && <ConversationList />}
        {tab === "tickets" && <TicketDesk />}
      </div>
    </DashboardLayout>
  );
}

function ComposeForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const createConversation = trpc.communication.conversations.create.useMutation({
    onSuccess: () => {
      setSubject("");
      setBody("");
      setSending(false);
      toast.success("Conversation started");
      onClose();
    },
    onError: (error) => {
      setSending(false);
      toast.error(error.message);
    },
  });

  const send = () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and message are required.");
      return;
    }
    setSending(true);
    createConversation.mutate({
      participantOpenIds: [],
      subject: subject.trim(),
      contextType: "general",
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">New Conversation</CardTitle>
        <CardDescription>
          Start a new conversation with the Profound IQ team.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-[.1em]">
            Subject
          </label>
          <Input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="What is this about?"
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
            rows={4}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={send}
            disabled={sending}
            className="text-[10px] font-black uppercase tracking-[.12em]"
          >
            <Send size={14} className="mr-2" />
            {sending ? "Sending…" : "Send Message"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-[10px] font-black uppercase tracking-[.12em]"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ConversationList() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const conversations = trpc.communication.conversations.list.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });

  if (conversations.isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-slate-600">
          Loading conversations…
        </CardContent>
      </Card>
    );
  }

  if (conversations.isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-red-800">
          Unable to load conversations. Please refresh and try again.
        </CardContent>
      </Card>
    );
  }

  if (selectedId) {
    return (
      <ConversationDetail conversationId={selectedId} onBack={() => setSelectedId(null)} />
    );
  }

  const rows = conversations.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Messages</CardTitle>
        <CardDescription>
          {rows.length === 0
            ? "No conversations yet."
            : `${rows.length} conversation${rows.length === 1 ? "" : "s"}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-600">
            When you start a conversation or receive a message, it will appear here.
          </p>
        ) : (
          <div className="space-y-2">
            {rows.map(conversation => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedId(conversation.id)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-4 text-left hover:border-[#c9a34e] transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {conversation.subject || "Conversation"}
                  </p>
                  <p className="text-xs text-slate-600 capitalize">
                    {conversation.contextType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {                  conversation.status}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConversationDetail({
  conversationId,
  onBack,
}: {
  conversationId: number;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [forwarding, setForwarding] = useState(false);
  const [raisingTicket, setRaisingTicket] = useState(false);
  const conversation = trpc.communication.conversations.get.useQuery(
    { id: conversationId },
    { retry: false }
  );
  const send = trpc.communication.messages.send.useMutation({
    onSuccess: () => {
      setBody("");
      conversation.refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  const raiseTicket = trpc.communication.tickets.create.useMutation({
    onSuccess: () => {
      toast.success("Ticket raised successfully");
      setRaisingTicket(false);
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
      setRaisingTicket(false);
    },
  });
  const messages = conversation.data?.messages ?? [];

  const handleForward = () => {
    setForwarding(true);
    const forwardBody = prompt("Forward this conversation. Add a note (optional):");
    if (forwardBody === null) {
      setForwarding(false);
      return;
    }
    send.mutate(
      {
        conversationId,
        body: forwardBody ? `[Forwarded] ${forwardBody}\n\n---\nOriginal: ${messages.map(m => `${m.senderName}: ${m.body}`).join("\n")}` : `[Forwarded]\n\n${messages.map(m => `${m.senderName}: ${m.body}`).join("\n")}`,
      },
      {
        onSettled: () => setForwarding(false),
      }
    );
  };

  const handleRaiseTicket = () => {
    setRaisingTicket(true);
    const title = prompt("Ticket title:");
    if (!title) {
      setRaisingTicket(false);
      return;
    }
    const description = prompt("Ticket description:") || title;
    raiseTicket.mutate(
      {
        title,
        description,
        relatedConversationId: conversationId,
        priority: "medium",
      }
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-[10px] font-black uppercase tracking-[.12em]"
        >
          <ArrowLeft size={14} className="mr-2" /> Back
        </Button>
        <div className="flex-1">
          <CardTitle className="text-lg">
            {conversation.data?.subject || "Conversation"}
          </CardTitle>
          <CardDescription className="capitalize">
            {conversation.data?.contextType}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleForward}
            disabled={forwarding}
            className="text-[10px] font-black uppercase tracking-[.12em]"
          >
            <Forward size={14} className="mr-2" />
            Forward
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRaiseTicket}
            disabled={raisingTicket}
            className="text-[10px] font-black uppercase tracking-[.12em]"
          >
            <Ticket size={14} className="mr-2" />
            Raise Ticket
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {conversation.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-600">Loading…</p>
        ) : conversation.isError ? (
          <p className="py-8 text-center text-sm text-red-800">Unable to load this conversation. Please try again.</p>
        ) : (
          <>
            <div className="mb-4 max-h-96 space-y-3 overflow-y-auto">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`rounded-lg p-3 ${
                    message.senderOpenId === user?.openId
                      ? "ml-auto bg-[#16243d] text-white"
                      : "bg-slate-100 text-slate-900"
                  } max-w-[80%]`}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold">{message.senderName}</p>
                    {message.senderRole && (
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {message.senderRole}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{message.body}</p>
                  <p className="mt-1 text-[10px] opacity-70">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <form
              onSubmit={event => {
                event.preventDefault();
                if (!body.trim()) return;
                send.mutate({
                  conversationId,
                  body: body.trim(),
                });
              }}
              className="flex gap-2"
            >
              <Input
                value={body}
                onChange={event => setBody(event.target.value)}
                placeholder="Type a message…"
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={send.isPending}
                className="bg-[#16243d] text-white"
              >
                <Send size={16} />
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TicketDesk() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string | undefined>();
  const tickets = trpc.communication.tickets.list.useQuery(
    { status },
    { retry: false, refetchOnWindowFocus: true }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Action Tickets</CardTitle>
        <CardDescription>
          {user?.role === "admin"
              ? "Create, assign, and manage tickets for staff."
              : user?.role === "staff"
                ? "Tickets assigned to you and team tickets."
                : "Tickets assigned to you."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tickets.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-600">Loading tickets…</p>
        ) : tickets.isError ? (
          <p className="py-8 text-center text-sm text-red-800">Unable to load tickets. Please refresh and try again.</p>
        ) : (tickets.data ?? []).length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 text-[#c9a34e]" size={32} />
            <p className="text-sm text-slate-600">No tickets found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(tickets.data ?? []).map(ticket => (
              <div
                key={ticket.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
              >
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
