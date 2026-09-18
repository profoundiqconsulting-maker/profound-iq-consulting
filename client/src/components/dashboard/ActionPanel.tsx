import { Button } from "@/components/ui/button";
import { Download, Send, Plus, RefreshCw, Save, Play, Pause } from "lucide-react";
import { ReactNode } from "react";

interface ActionPanelProps {
  primaryAction?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  secondaryActions?: Array<{
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: "default" | "outline" | "secondary" | "ghost";
  }>;
  className?: string;
}

export function ActionPanel({
  primaryAction,
  secondaryActions = [],
  className = "",
}: ActionPanelProps) {
  if (!primaryAction && secondaryActions.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {primaryAction && (
        <Button
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled || primaryAction.loading}
          className="h-10 gap-2 bg-[#16243d] px-5 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] hover:bg-[#16243d]/90 disabled:opacity-50"
        >
          {primaryAction.loading ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            primaryAction.icon || <Play size={14} />
          )}
          {primaryAction.loading ? "Loading..." : primaryAction.label}
        </Button>
      )}
      {secondaryActions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "outline"}
          onClick={action.onClick}
          disabled={action.disabled || action.loading}
          className="h-10 gap-2 border-[#16243d]/15 px-4 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-50"
        >
          {action.loading ? (
            <RefreshCw size={13} className="animate-spin" />
          ) : (
            action.icon
          )}
          {action.loading ? "Loading..." : action.label}
        </Button>
      ))}
    </div>
  );
}
