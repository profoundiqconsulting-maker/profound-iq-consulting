import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertPanelProps {
  variant: AlertVariant;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

const variantConfig: Record<
  AlertVariant,
  {
    icon: React.ReactNode;
    bg: string;
    border: string;
    text: string;
    iconText: string;
  }
> = {
  info: {
    icon: <Info size={18} />,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    iconText: "text-blue-600",
  },
  success: {
    icon: <CheckCircle2 size={18} />,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-900",
    iconText: "text-emerald-600",
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    iconText: "text-amber-600",
  },
  error: {
    icon: <AlertCircle size={18} />,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    iconText: "text-red-600",
  },
};

export function AlertPanel({
  variant,
  title,
  description,
  action,
  onDismiss,
  className = "",
}: AlertPanelProps) {
  const config = variantConfig[variant];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border p-4 ${config.bg} ${config.border} ${className}`}
    >
      <div className={`shrink-0 ${config.iconText}`}>{config.icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${config.text}`}>{title}</p>
        {description && (
          <p className={`mt-1 text-sm ${config.text} opacity-90`}>
            {description}
          </p>
        )}
        {action && (
          <Button
            variant="link"
            size="sm"
            onClick={action.onClick}
            className={`mt-2 h-auto p-0 text-sm font-semibold ${config.text} ${config.iconText}`}
          >
            {action.label}
          </Button>
        )}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className={`h-8 w-8 shrink-0 ${config.iconText} hover:${config.iconText}`}
          aria-label="Dismiss"
        >
          <X size={16} />
        </Button>
      )}
    </div>
  );
}
