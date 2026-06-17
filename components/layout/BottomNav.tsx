"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  CalendarDays,
  HeartPulse,
  UserCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/results", label: "Results", icon: FlaskConical },
  { href: "/plan", label: "Plan", icon: CalendarDays },
  { href: "/care", label: "Care", icon: HeartPulse },
  { href: "/account", label: "Account", icon: UserCircle },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-charcoal-100 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-colors min-w-0 flex-1",
                active ? "text-teal-600" : "text-charcoal-400",
              ].join(" ")}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
