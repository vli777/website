import postgres from "postgres";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: "require",
});

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

    // Update the unsubscribed_at timestamp for the email
    const result = await sql`
      UPDATE waitlist
      SET unsubscribed_at = NOW()
      WHERE email = ${email.toLowerCase()} AND unsubscribed_at IS NULL
      RETURNING email
    `;

    if (result.length === 0) {
      // Email not found or already unsubscribed - return success anyway to prevent enumeration
      return NextResponse.json({
        success: true,
        message: "If this email was on our waitlist, it has been removed.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "You have been removed from the waitlist.",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
