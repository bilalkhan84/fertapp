import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Public contact form handler (unauthenticated visitors from the marketing site).
 * Saves to the same `support_requests` table used by the in-app support form,
 * and emails mohammadbilalkhan@gmail.com via Resend if configured.
 */

const TO_EMAIL = "mohammadbilalkhan@gmail.com";
const FROM_EMAIL = "FertTrack <onboarding@resend.dev>"; // TODO: change to noreply@ferttrack.app once domain is registered + verified in Resend

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const subject = `Contact form: ${name}`;
    const fullMessage = `From: ${name} <${email}>\n\n${message}`;

    const supabase = await createClient();
    await supabase.from("support_requests").insert({
      user_id: null,
      subject,
      message: fullMessage,
    });

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 100px;"><strong>Name:</strong></td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
              <td style="padding: 8px 0;">${email}</td>
            </tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #0d9488;">
            <strong style="color: #374151;">Message:</strong>
            <p style="margin-top: 8px; color: #4b5563; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">Sent from the FertTrack contact form.</p>
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
          reply_to: email,
          subject: `[FertTrack Contact] ${subject}`,
          html: emailHtml,
        }),
      });
      const resendBody = await resendRes.json().catch(() => ({}));
      if (!resendRes.ok) {
        console.error("Resend error:", resendRes.status, JSON.stringify(resendBody));
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
