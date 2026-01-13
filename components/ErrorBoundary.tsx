"use client";

import { Component, type ReactNode } from "react";
import { Button } from "./Button";
import { Card } from "./Card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary to catch and handle React errors gracefully.
 * Prevents the entire app from crashing when a component throws.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service (Sentry, LogRocket, etc.)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // TODO: Send to error tracking service
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <Card className="max-w-md space-y-4 text-center">
            <div className="text-6xl">💥</div>
            <h1 className="font-heading text-2xl">Something went wrong</h1>
            <p className="text-sm text-slate">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={this.handleReset}>
                Try again
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Go home
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-slate">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 overflow-auto rounded-lg bg-slate/5 p-3 text-xs">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
