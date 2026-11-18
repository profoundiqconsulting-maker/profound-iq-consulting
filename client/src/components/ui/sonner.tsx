import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  // Use system theme by default; sonner will respect CSS variables
  return (
    <Sonner
      theme="system"
      className="toaster group"
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      } as React.CSSProperties}
      toastOptions={{ duration: 5000, ...props.toastOptions }}
      {...props}
    />
  );
};

export { Toaster };
