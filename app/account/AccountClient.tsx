"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resetUser } from "@/lib/posthog";
import { Profile } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  User,
  Mail,
  MapPin,
  LogOut,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const PROVINCES = [
  "Ontario",
  "British Columbia",
  "Alberta",
  "Quebec",
  "Manitoba",
  "Saskatchewan",
  "Nova Scotia",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Prince Edward Island",
  "Northwest Territories",
  "Yukon",
  "Nunavut",
];

interface Props {
  profile: Profile;
}

export default function AccountClient({ profile }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [province, setProvince] = useState(profile.province ?? "Ontario");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  async function handleSave() {
    setSaving(true);
    setSaveStatus("idle");
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, province })
      .eq("id", profile.id);

    if (error) {
      setSaveStatus("error");
    } else {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
    setSaving(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    resetUser();
    router.push("/login");
  }

  const hasChanges =
    fullName !== (profile.full_name ?? "") ||
    province !== (profile.province ?? "Ontario");

  return (
    <div className="space-y-5 max-w-lg">
      {/* Profile info */}
      <Card>
        <h2 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wide mb-4">
          Profile
        </h2>
        <div className="space-y-4">
          {/* Avatar */}
          {profile.avatar_url && (
            <div className="flex items-center gap-3 mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-charcoal-800">
                  {profile.full_name ?? "Your account"}
                </p>
                <p className="text-xs text-charcoal-400">{profile.email}</p>
              </div>
            </div>
          )}

          {/* Full name */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-600 mb-1.5">
              Display name
            </label>
            <div className="relative">
              <User
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400"
              />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Email — read-only, managed by Google */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-600 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400"
              />
              <input
                type="email"
                value={profile.email ?? ""}
                disabled
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-400 bg-charcoal-50 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-charcoal-400 mt-1.5">
              Managed by your Google account. Change it at{" "}
              <a
                href="https://myaccount.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:underline"
              >
                myaccount.google.com
              </a>
            </p>
          </div>

          {/* Province */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-600 mb-1.5">
              Province / Territory
            </label>
            <div className="relative">
              <MapPin
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none z-10"
              />
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition appearance-none"
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={!hasChanges || saving}
              size="sm"
            >
              Save changes
            </Button>
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <CheckCircle size={14} /> Saved
              </span>
            )}
            {saveStatus === "error" && (
              <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                <AlertCircle size={14} /> Failed to save
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Sign-in method */}
      <Card>
        <h2 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wide mb-3">
          Sign-in method
        </h2>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            {/* Google logo */}
            <div className="w-8 h-8 rounded-xl bg-charcoal-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal-800">
                Google
              </p>
              <p className="text-xs text-charcoal-400">{profile.email}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <Shield size={12} /> Active
          </span>
        </div>
        <p className="text-xs text-charcoal-400 mt-2">
          Your account uses Google Sign-In. You can manage your Google account at{" "}
          <a
            href="https://myaccount.google.com/security"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:underline"
          >
            myaccount.google.com/security
          </a>
        </p>
      </Card>

      {/* Sign out */}
      <Card className="border-red-100 bg-red-50">
        <h2 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wide mb-3">
          Sign out
        </h2>
        <p className="text-xs text-charcoal-500 mb-4">
          You&apos;ll be signed out of your FertTrack account on this device.
        </p>
        <Button
          variant="danger"
          onClick={handleSignOut}
          loading={signingOut}
          className="w-full sm:w-auto"
        >
          <LogOut size={15} />
          Sign out
        </Button>
      </Card>
    </div>
  );
}
