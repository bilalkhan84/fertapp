import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Support form submission handler.
 * Saves to Supabase AND emails mohammadbilalkhan@gmail.com via Resend.
 *
 * Setup (one-time):
 * 1. Sign up free at https://resend.com
 * 2. Get your API key from the Resend dashboard
 * 3. Add RESEND_API_KEY to Netlify: Site > Environment variables
 * 4. Verify your sending domain in Resend (or use their sandbox for testing)
 *
 * If RESEND_API_KEY is not set, email is skipped but question is still saved to DB.
 */

const TO_EMAIL = "mohammadbilalkhan@gmail.com";
const FROM_EMAIL = "FertTrack <onboarding@resend.dev>"; // TODO: change to noreply@ferttrack.app once domain is registered + verified in Resend

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, subject, message, type = "medical" } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save to Supabase
    const supabase = await createClient();
    await supabase.from("support_requests").insert({
      user_id: userId,
      subject,
      message,
    });

    // Send email via Resend (if API key is configured)
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const prefix = type === "app" ? "[FertTrack App Feedback]" : "[FertTrack Support]";
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488;">New ${type === "app" ? "App Feedback" : "Support Question"}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 100px;"><strong>Type:</strong></td>
              <td style="padding: 8px 0;">${type === "app" ? "App Feedback / Bug Report" : "Medical / General Question"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>User ID:</strong></td>
              <td style="padding: 8px 0; font-family: monospace; font-size: 13px;">${userId || "anonymous"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Subject:</strong></td>
              <td style="padding: 8px 0;">${subject}</td>
            </tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #0d9488;">
            <strong style="color: #374151;">Message:</strong>
            <p style="margin-top: 8px; color: #4b5563; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">Sent from FertTrack - ferttrack.netlify.app</p>
        </div>
      `;

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: TO_EMAIL,
          subject: `${prefix} ${subject}`,
          html: emailHtml,
        }),
      });
      const resendBody = await resendRes.json().catch(() => ({}));
      console.log("Resend response:", resendRes.status, JSON.stringify(resendBody));
      if (!resendRes.ok) {
        console.error("Resend error:", resendRes.status, JSON.stringify(resendBody));
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Support route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
