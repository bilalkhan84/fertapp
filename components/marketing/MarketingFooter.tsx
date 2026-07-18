import Link from "next/link";
import Logo from "./Logo";

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Blog", href: "/blog" },
];

const supportLinks = [{ label: "Contact", href: "/contact" }];

export default function MarketingFooter() {
  return (
    <footer className="border-t border-charcoal-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-charcoal-500 max-w-xs leading-relaxed">
              Understand your results, build better habits, and take control
              of your fertility health.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">
              Product
            </h3>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-charcoal-600 hover:text-teal-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">
              Support
            </h3>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-charcoal-600 hover:text-teal-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-charcoal-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-charcoal-400">
            © {new Date().getFullYear()} FertTrack. All rights reserved.
          </p>
          <p className="text-xs text-charcoal-400">
            Informational only — not a substitute for medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
