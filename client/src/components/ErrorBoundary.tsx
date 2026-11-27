import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[React render error]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
          <section
            role="alert"
            aria-labelledby="app-error-title"
            className="flex w-full max-w-lg flex-col items-center rounded-xl border border-border bg-card p-8 text-center shadow-sm"
          >
            <AlertTriangle
              size={48}
              aria-hidden="true"
              className="mb-6 shrink-0 text-destructive"
            />
            <h1 id="app-error-title" className="mb-3 text-xl font-semibold">
              We couldn’t load this page.
            </h1>
            <p className="mb-6 text-sm leading-6 text-muted-foreground">
              An unexpected issue interrupted the page. Reload to try again. If
              the problem continues,{" "}
              <a
                href="/contact"
                className="font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                contact support
              </a>
              .
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              <RotateCcw size={16} aria-hidden="true" />
              Reload page
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
