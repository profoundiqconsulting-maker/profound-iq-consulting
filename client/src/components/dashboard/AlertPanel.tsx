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
    hover: string;
  }
> = {
  info: {
    icon: <Info size={18} />,
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-900",
    text: "text-blue-900 dark:text-blue-100",
    iconText: "text-blue-700 dark:text-blue-300",
    hover: "hover:bg-blue-100 dark:hover:bg-blue-900",
  },
  success: {
    icon: <CheckCircle2 size={18} />,
    bg: "bg-emerald-50 dark:bg-emerald-950",
    border: "border-emerald-200 dark:border-emerald-900",
    text: "text-emerald-900 dark:text-emerald-100",
    iconText: "text-emerald-700 dark:text-emerald-300",
    hover: "hover:bg-emerald-100 dark:hover:bg-emerald-900",
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    bg: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-200 dark:border-amber-900",
    text: "text-amber-900 dark:text-amber-100",
    iconText: "text-amber-700 dark:text-amber-300",
    hover: "hover:bg-amber-100 dark:hover:bg-amber-900",
  },
  error: {
    icon: <AlertCircle size={18} />,
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-900",
    text: "text-red-900 dark:text-red-100",
    iconText: "text-red-700 dark:text-red-300",
    hover: "hover:bg-red-100 dark:hover:bg-red-900",
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
          <p className={`mt-1 text-sm ${config.text}`}>{description}</p>
        )}
        {action && (
          <Button
            variant="link"
            size="sm"
            onClick={action.onClick}
            className={`mt-2 h-auto p-0 text-sm font-semibold underline underline-offset-4 ${config.iconText}`}
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
          className={`h-8 w-8 shrink-0 ${config.iconText} ${config.hover}`}
          aria-label="Dismiss"
        >
          <X size={16} />
        </Button>
      )}
    </div>
  );
}
