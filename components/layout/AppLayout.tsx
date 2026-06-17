import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-offwhite">
      <Sidebar />
      {/* Main content — offset for sidebar on desktop */}
      <main className="md:ml-60 pb-28 md:pb-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 md:pt-8">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h1 className="text-2xl font-bold text-charcoal-900">{title}</h1>
              )}
              {subtitle && (
                <p className="text-sm text-charcoal-500 mt-1">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
