// ─── Skeleton.tsx ────────────────────────────────────────────────────────────
// A single file exporting every skeleton / loading / error component used
// across the dashboard. Import what you need where you need it.
//
//  Exports:
//   Skeleton            — base shimmer block (compose everything from this)
//   CardSkeleton        — single card placeholder
//   ListSkeleton        — single list column placeholder
//   BoardSkeleton       — full board (multiple lists + cards)
//   SidebarSkeleton     — desktop sidebar board-list placeholder
//   DashboardError      — full-page error screen for the dashboard
//   InlineError         — small inline error banner (list/card level)
// ─────────────────────────────────────────────────────────────────────────────

import { FiAlertTriangle, FiRefreshCw, FiLayout } from "react-icons/fi";

// ── 1. Base shimmer block ─────────────────────────────────────────────────────

type SkeletonProps = {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
};

export function Skeleton({ className = "", rounded = "lg" }: SkeletonProps) {
  const roundedClass = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  }[rounded];

  return (
    <div
      className={`bg-slate-800 relative overflow-hidden ${roundedClass} ${className}`}
    >
      {/* Shimmer sweep */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />
    </div>
  );
}

// Add this to your globals.css (or a <style> tag in layout.tsx):
// @keyframes shimmer { to { transform: translateX(100%); } }


// ── 2. Single card skeleton ───────────────────────────────────────────────────

export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 px-3 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600/30">
      {/* Occasional label strip row */}
      <div className="flex gap-1">
        <Skeleton className="h-1.5 w-8" rounded="full" />
        <Skeleton className="h-1.5 w-6" rounded="full" />
      </div>
      {/* Title line */}
      <Skeleton className="h-3.5 w-full" rounded="md" />
      {/* Shorter second line (not every card) */}
      <Skeleton className="h-3 w-3/4" rounded="md" />
    </div>
  );
}


// ── 3. Single list skeleton ───────────────────────────────────────────────────

type ListSkeletonProps = {
  cardCount?: number;
};

export function ListSkeleton({ cardCount = 3 }: ListSkeletonProps) {
  return (
    <div className="w-[280px] md:w-72 shrink-0 flex flex-col bg-slate-800 rounded-xl border border-slate-700/60">
      {/* List header */}
      <div className="px-3.5 pt-3.5 pb-2.5 flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-28" rounded="md" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-5" rounded="md" />
          <Skeleton className="h-5 w-5" rounded="md" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-3.5 mb-2.5">
        <Skeleton className="h-0.5 w-full" rounded="full" />
      </div>

      {/* Divider */}
      <div className="mx-3.5 border-t border-slate-700/60" />

      {/* Cards */}
      <div className="flex flex-col gap-2 px-3 py-3">
        {Array.from({ length: cardCount }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Add card footer */}
      <div className="px-3 pb-3 pt-1">
        <Skeleton className="h-8 w-full" rounded="lg" />
      </div>
    </div>
  );
}


// ── 4. Full board skeleton ────────────────────────────────────────────────────

type BoardSkeletonProps = {
  listCount?: number;
};

export function BoardSkeleton({ listCount = 3 }: BoardSkeletonProps) {
  // Give each list a slightly different card count so it looks organic
  const cardCounts = [3, 2, 4, 1, 3];

  return (
    <div className="h-full flex flex-col overflow-hidden pb-[72px] md:pb-0">
      {/* Board header skeleton */}
      <div className="flex-shrink-0 px-4 md:px-10 pt-5 md:pt-8 pb-4 border-b border-slate-700/60">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            {/* Board title */}
            <Skeleton className="h-7 w-48" rounded="lg" />
            {/* Meta: list count + progress */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-12" rounded="md" />
              <Skeleton className="h-3 w-20" rounded="md" />
              <Skeleton className="h-1 w-16" rounded="full" />
            </div>
          </div>
          {/* Rename / Delete buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <Skeleton className="h-7 w-16" rounded="lg" />
            <Skeleton className="h-7 w-14" rounded="lg" />
          </div>
        </div>
      </div>

      {/* Lists row */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="h-full px-4 md:px-10 py-4 md:py-6">
          <div className="flex items-start gap-3" style={{ width: "max-content" }}>
            {Array.from({ length: listCount }).map((_, i) => (
              <ListSkeleton key={i} cardCount={cardCounts[i % cardCounts.length]} />
            ))}
            {/* Add list placeholder */}
            <div className="w-[280px] md:w-72 shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-dashed border-slate-800">
              <Skeleton className="h-4 w-4" rounded="md" />
              <Skeleton className="h-4 w-28" rounded="md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── 5. Sidebar skeleton ───────────────────────────────────────────────────────

export function SidebarSkeleton() {
  return (
    <div className="hidden md:flex md:flex-col w-60 min-h-screen bg-slate-950 border-r border-slate-800 shrink-0">
      {/* Section label */}
      <div className="px-4 pt-5 pb-3">
        <Skeleton className="h-2.5 w-12" rounded="full" />
      </div>

      {/* Board list items */}
      <div className="flex flex-col gap-0.5 px-2">
        {[80, 56, 72, 48].map((w, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3 py-2">
            <Skeleton className="h-3.5 w-3.5 shrink-0" rounded="md" />
            <Skeleton className={`h-3.5`} rounded="md" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>

      {/* New board button */}
      <div className="px-3 mt-2">
        <Skeleton className="h-8 w-full" rounded="xl" />
      </div>
    </div>
  );
}


// ── 6. Full-page dashboard error screen ──────────────────────────────────────

type DashboardErrorProps = {
  message?: string;
  onRetry?: () => void;
};

export function DashboardError({
  message = "Something went wrong while loading your board.",
  onRetry,
}: DashboardErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-6 text-center pb-20 md:pb-0">
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <FiAlertTriangle size={22} className="text-red-400" />
      </div>

      {/* Copy */}
      <div>
        <h2 className="text-base font-semibold text-slate-100 mb-1.5">
          Failed to load
        </h2>
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{message}</p>
      </div>

      {/* Retry */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl transition-colors"
        >
          <FiRefreshCw size={13} />
          Try again
        </button>
      )}
    </div>
  );
}


// ── 7. Inline error banner (list / card level) ────────────────────────────────

type InlineErrorProps = {
  message?: string;
  onRetry?: () => void;
};

export function InlineError({
  message = "Failed to load",
  onRetry,
}: InlineErrorProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
      <div className="flex items-center gap-2 min-w-0">
        <FiAlertTriangle size={13} className="text-red-400 shrink-0" />
        <span className="text-xs text-red-400 font-medium truncate">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-200 shrink-0 transition-colors"
        >
          <FiRefreshCw size={11} />
          Retry
        </button>
      )}
    </div>
  );
}