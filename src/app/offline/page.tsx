"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-5xl">📡</div>
      <h1 className="text-2xl font-bold">You're offline</h1>
      <p className="text-muted-foreground">
        Check your internet connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
      >
        Retry
      </button>
    </div>
  );
}
