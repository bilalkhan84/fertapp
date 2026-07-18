"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resetUser, track } from "@/lib/posthog";
import {
  LayoutDashboard,
  FlaskConical,
  CalendarDays,
  HeartPulse,
  HelpCircle,
  UserCircle,
  Leaf,
  X,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/results", label: "My Results", icon: FlaskConical },
  { href: "/plan", label: "90-Day Plan", icon: CalendarDays },
  { href: "/care", label: "Care & Coverage", icon: HeartPulse },
  { href: "/support", label: "Support", icon: HelpCircle },
  { href: "/account", label: "Account", icon: UserCircle },
];

interface Props {
  isOpen?: boolean;
  isDesktopOpen?: boolean;
  onClose?: () => void;
  onToggleDesktop?: () => void;
}

export default function Sidebar({ isOpen = false, isDesktopOpen = true, onClose, onToggleDesktop }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    track("signed_out", { placement: "sidebar" });
    const supabase = createClient();
    await supabase.auth.signOut();
    resetUser();
    router.push("/login");
  }

  return (
    <aside
      className={[
        "flex flex-col w-60 min-h-screen bg-white border-r border-charcoal-100 py-6 px-4 fixed left-0 top-0 z-40 transition-transform duration-200 ease-in-out",
        // Mobile: follow isOpen state
        isOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: follow isDesktopOpen state (overrides mobile class at md breakpoint)
        isDesktopOpen ? "md:translate-x-0" : "md:-translate-x-full",
      ].join(" ")}
    >
      {/* Logo + toggle button */}
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-charcoal-900 text-base tracking-tight">
            FertTrack
          </span>
        </div>
        {/* Mobile: X to close drawer */}
        <button
          className="md:hidden p-1.5 rounded-xl text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-50 transition-colors"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
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

      {/* Sign out — pinned to drawer bottom */}
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-charcoal-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-100 disabled:opacity-50 mt-2 border-t border-charcoal-100 pt-4 w-full text-left"
      >
        <LogOut size={18} className="w-4.5 h-4.5 flex-shrink-0" />
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </aside>
  );
}
