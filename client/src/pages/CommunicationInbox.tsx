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
} from "lucide-react";

type Tab = "conversations" | "tickets";

export default function CommunicationInbox() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("conversations");
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
                <Badge variant="secondary" className="ml-3">
                  {conversation.status}
                </Badge>
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
  const messages = conversation.data?.messages ?? [];

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
        <div>
          <CardTitle className="text-lg">
            {conversation.data?.subject || "Conversation"}
          </CardTitle>
          <CardDescription className="capitalize">
            {conversation.data?.contextType}
          </CardDescription>
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
                  <p className="text-xs font-semibold">{message.senderName}</p>
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
            ? "Create and assign tickets to staff."
            : "Tickets assigned to you."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tickets.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-600">Loading tickets…</p>
        ) : tickets.isError ? (
          <p className="py-8 text-center text-sm text-red-800">Unable to load tickets. Please refresh and try again.</p>
        ) : (tickets.data ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-600">No tickets found.</p>
        ) : (
          <div className="space-y-2">
            {(tickets.data ?? []).map(ticket => (
              <div
                key={ticket.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{ticket.title}</p>
                  <p className="text-xs text-slate-600 line-clamp-1">{ticket.description}</p>
                  <div className="mt-2 flex gap-2">
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
