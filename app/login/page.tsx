"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/posthog";
import { Leaf, ShieldCheck, Lock, UserCheck } from "lucide-react";
import Button from "@/components/ui/Button";

// Separated so useSearchParams is inside a Suspense boundary
function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setError("Sign-in failed. Please try again.");
  }, [searchParams]);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    track("login_clicked");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      setError("Could not start Google sign-in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-charcoal-100 shadow-sm p-8">
      <h1 className="text-2xl font-bold text-charcoal-900 mb-2 text-center">
        Take control of your fertility health
      </h1>
      <p className="text-sm text-charcoal-500 text-center mb-8 leading-relaxed">
        Understand your results, build better habits, and navigate Ontario
        fertility care — all in one place.
      </p>

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        onClick={handleGoogleSignIn}
        loading={loading}
        fullWidth
        size="lg"
        variant="secondary"
        className="border-charcoal-200 text-charcoal-800 hover:bg-charcoal-50"
      >
        {!loading && (
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        Continue with Google
      </Button>

      <div className="mt-6 pt-6 border-t border-charcoal-100 grid grid-cols-3 gap-3">
        {[
          { icon: ShieldCheck, label: "Private & secure" },
          { icon: Lock, label: "HIPAA-aligned" },
          { icon: UserCheck, label: "Your data only" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 text-center">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
              <Icon className="w-4 h-4 text-teal-600" />
            </div>
            <span className="text-xs text-charcoal-500 font-medium leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-charcoal-900 tracking-tight">FertTrack</span>
        </div>

        <Suspense fallback={<div className="bg-white rounded-3xl border border-charcoal-100 shadow-sm p-8 h-64 animate-pulse" />}>
          <LoginForm />
        </Suspense>

        <p className="text-xs text-charcoal-400 text-center mt-6 leading-relaxed px-4">
          Your health data is stored securely and never shared with third parties. We use it only to personalize your fertility plan.
        </p>
      </div>
    </div>
  );
}
