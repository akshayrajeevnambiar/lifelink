"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="glass-card p-8 max-w-md w-full text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-red-500/10">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-[hsl(var(--color-muted-foreground))]">
          We encountered an error while processing your request.
        </p>
        <Button onClick={reset} className="w-full rounded-xl">
          Try again
        </Button>
      </div>
    </div>
  );
}
