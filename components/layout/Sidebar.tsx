"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  CalendarDays,
  HeartPulse,
  HelpCircle,
  UserCircle,
  Leaf,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/results", label: "My Results", icon: FlaskConical },
  { href: "/plan", label: "90-Day Plan", icon: CalendarDays },
  { href: "/care", label: "Care & Coverage", icon: HeartPulse },
  { href: "/support", label: "Support", icon: HelpCircle },
  { href: "/account", label: "Account", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-charcoal-100 py-6 px-4 fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-charcoal-900 text-base tracking-tight">
          FertTrack
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-100",
                active
                  ? "bg-teal-50 text-teal-700"
                  : "text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900",
              ].join(" ")}
            >
              <Icon
                className={[
                  "w-4.5 h-4.5 flex-shrink-0",
                  active ? "text-teal-600" : "text-charcoal-400",
                ].join(" ")}
                size={18}
              />
              {label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
