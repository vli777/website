import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: "require",
});

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find the email with this token and check if it's still valid
    const result = await sql`
      UPDATE waitlist
      SET unsubscribed_at = NOW(),
          unsubscribe_token = NULL,
          unsubscribe_token_expires = NULL
      WHERE unsubscribe_token = ${token}
        AND unsubscribe_token_expires > NOW()
        AND unsubscribed_at IS NULL
      RETURNING email
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "You have been successfully removed from the waitlist.",
    });
  } catch (error) {
    console.error("Confirm unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
