"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function UnsubscribeConfirmPage() {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "expired"
  >("loading");

  useEffect(() => {
    const confirmUnsubscribe = async () => {
      try {
        const response = await fetch("/api/unsubscribe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setStatus("success");
        } else {
          const data = await response.json();
          if (data.error?.includes("expired")) {
            setStatus("expired");
          } else {
            setStatus("error");
          }
        }
      } catch {
        setStatus("error");
      }
    };

    if (token) {
      confirmUnsubscribe();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        {status === "loading" && (
          <>
            <div className="mb-6">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Processing your request...
            </h1>
            <p className="text-gray-400">
              Please wait while we confirm your unsubscribe request.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-6 text-green-500">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Successfully Unsubscribed
            </h1>
            <p className="text-gray-400 mb-8">
              You have been removed from our waitlist. You will no longer
              receive emails from Vesta.
            </p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-gray-800 px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              Return to Home
            </Link>
          </>
        )}

        {status === "expired" && (
          <>
            <div className="mb-6 text-yellow-500">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Link Expired</h1>
            <p className="text-gray-400 mb-8">
              This unsubscribe link has expired. Please request a new one from
              our privacy page.
            </p>
            <Link
              href="/privacy"
              className="inline-block rounded-lg bg-blue-700 px-6 py-3 text-gray-300 hover:text-white transition-colors"
            >
              Go to Privacy Page
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-6 text-red-500">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Something Went Wrong
            </h1>
            <p className="text-gray-400 mb-8">
              We couldn&apos;t process your request. The link may be invalid or
              already used.
            </p>
            <Link
              href="/privacy"
              className="inline-block rounded-lg bg-blue-700 px-6 py-3 text-gray-300 hover:text-white transition-colors"
            >
              Try Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
