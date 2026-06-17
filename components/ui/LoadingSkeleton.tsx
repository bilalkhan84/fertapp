interface SkeletonProps {
  className?: string;
  rows?: number;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "animate-pulse bg-charcoal-200 rounded-lg",
        className,
      ].join(" ")}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-charcoal-100 shadow-sm p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <CardSkeleton />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-charcoal-100 shadow-sm p-4 space-y-2"
          >
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ))}
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

export function TableSkeleton({ rows = 3 }: SkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
