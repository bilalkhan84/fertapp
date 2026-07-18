import Link from "next/link";
import { Leaf } from "lucide-react";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={["flex items-center gap-2.5 shrink-0", className].join(" ")}
    >
      <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center">
        <Leaf className="w-4.5 h-4.5 text-white" />
      </div>
      <span className="text-lg font-bold text-charcoal-900 tracking-tight">
        FertTrack
      </span>
    </Link>
  );
}
