import postgres from "postgres";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
// import crypto from "crypto";
// import { Resend } from "resend";

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: "require",
});

// const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiter for unsubscribe requests (prevent abuse)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // max requests
const RATE_WINDOW = 60 * 60 * 1000; // per hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

// // Generate a secure random token (for magic link verification)
// function generateToken(): string {
//   return crypto.randomBytes(32).toString("hex");
// }

export async function POST(request: Request) {
  try {
    // Rate limiting by IP
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Direct unsubscribe - set timestamp immediately
    // Returns success even if email not found (prevents enumeration)
    await sql`
      UPDATE waitlist
      SET unsubscribed_at = NOW()
      WHERE email = ${normalizedEmail} AND unsubscribed_at IS NULL
    `;

    return NextResponse.json({
      success: true,
      message: "If this email was on our waitlist, it has been removed.",
    });

    // =========================================================================
    // MAGIC LINK VERIFICATION (uncomment when you have a verified domain)
    // =========================================================================
    // // Check if email exists and is not already unsubscribed
    // const existing = await sql`
    //   SELECT email, unsubscribed_at
    //   FROM waitlist
    //   WHERE email = ${normalizedEmail}
    // `;
    //
    // // Always return success to prevent email enumeration
    // if (existing.length === 0 || existing[0].unsubscribed_at !== null) {
    //   return NextResponse.json({
    //     success: true,
    //     message: "If this email is on our waitlist, you will receive a verification link.",
    //   });
    // }
    //
    // // Generate token and expiry (24 hours)
    // const token = generateToken();
    // const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    //
    // // Store token in database
    // await sql`
    //   UPDATE waitlist
    //   SET unsubscribe_token = ${token},
    //       unsubscribe_token_expires = ${expiresAt}
    //   WHERE email = ${normalizedEmail}
    // `;
    //
    // // Send verification email via Resend
    // const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://argovesta.vercel.app";
    // const confirmUrl = `${baseUrl}/unsubscribe/${token}`;
    //
    // const { error } = await resend.emails.send({
    //   from: "Vesta <noreply@yourdomain.com>", // TODO: Update to your verified domain
    //   to: normalizedEmail,
    //   subject: "Confirm your unsubscribe request - Vesta",
    //   html: `
    //     <!DOCTYPE html>
    //     <html>
    //     <head>
    //       <meta charset="utf-8">
    //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //     </head>
    //     <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0b; color: #e5e5e5; padding: 40px 20px; margin: 0;">
    //       <div style="max-width: 480px; margin: 0 auto; background-color: #111113; border-radius: 12px; padding: 32px; border: 1px solid #222;">
    //         <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">Vesta</h1>
    //         <p style="color: #888; font-size: 14px; margin: 0 0 24px 0;">Unsubscribe Verification</p>
    //
    //         <p style="color: #ccc; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
    //           We received a request to remove your email from the Vesta waitlist. Click the button below to confirm.
    //         </p>
    //
    //         <a href="${confirmUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; font-size: 14px;">
    //           Confirm Removal
    //         </a>
    //
    //         <p style="color: #666; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0;">
    //           This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
    //         </p>
    //
    //         <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;">
    //
    //         <p style="color: #555; font-size: 12px; margin: 0;">
    //           Vesta is an informational software tool provided for educational purposes only. Backend services provided by Argo.
    //         </p>
    //       </div>
    //     </body>
    //     </html>
    //   `,
    // });
    //
    // if (error) {
    //   console.error("Failed to send verification email:", error);
    // }
    //
    // return NextResponse.json({
    //   success: true,
    //   message: "If this email is on our waitlist, you will receive a verification link.",
    // });
    // =========================================================================
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
