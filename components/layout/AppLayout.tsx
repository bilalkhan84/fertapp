"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { Menu, ChevronLeft } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-offwhite">
      <Sidebar
        isOpen={mobileMenuOpen}
        isDesktopOpen={desktopSidebarOpen}
        onClose={() => setMobileMenuOpen(false)}
        onToggleDesktop={() => setDesktopSidebarOpen((v) => !v)}
      />

      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content — shifts right when desktop sidebar is open */}
      <main
        className={[
          "pb-28 md:pb-8 transition-all duration-200 ease-in-out",
          desktopSidebarOpen ? "md:ml-60" : "md:ml-0",
        ].join(" ")}
      >
        {/* ── Mobile top bar ────────────────────────────────────── */}
        <div className="md:hidden flex items-center gap-2 px-4 pt-5 pb-2 bg-offwhite sticky top-0 z-20 border-b border-charcoal-100">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-1 rounded-xl hover:bg-charcoal-100 text-charcoal-600 transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          {!isDashboard && (
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-charcoal-100 text-charcoal-600 transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {title && (
            <h1 className="text-base font-bold text-charcoal-900 truncate">{title}</h1>
          )}
        </div>

        {/* ── Desktop top bar ───────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3 px-6 py-3.5 bg-offwhite sticky top-0 z-20 border-b border-charcoal-100">
          {/* Sidebar toggle */}
          <button
            onClick={() => setDesktopSidebarOpen((v) => !v)}
            className="p-2 -ml-1 rounded-xl hover:bg-charcoal-100 text-charcoal-600 transition-colors flex-shrink-0"
            aria-label={desktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu size={20} />
          </button>

          {/* Back button — hidden on dashboard */}
          {!isDashboard && (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-sm font-medium text-charcoal-500 hover:text-charcoal-900 transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}

          {/* Page title */}
          {title && (
            <h1 className="text-xl font-bold text-charcoal-900">{title}</h1>
          )}
        </div>

        {/* ── Page content ──────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 md:pt-6">
          {subtitle && (
            <p className="text-sm text-charcoal-500 mb-4 md:mb-6">{subtitle}</p>
          )}
          {children}
        </div>

        {/* Legal disclaimer footer */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-8 mb-2">
          <div className="border-t border-charcoal-100 pt-4">
            <p className="text-xs text-charcoal-400 text-center leading-relaxed">
              FertTrack is for informational purposes only and does not constitute medical advice, diagnosis, or treatment.
              Always consult a qualified healthcare provider before making changes to your health regimen.
              FertTrack is not a licensed medical device.{" "}
              <a href="/support" className="text-teal-600 hover:underline">Contact us</a>{" "}
              with any questions.
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
