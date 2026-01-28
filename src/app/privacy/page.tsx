"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function PrivacyPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            &larr; Back to Home
          </Link>
          <h1 className="mt-6 text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Vesta (powered by Argo)</p>
        </div>

        {/* Privacy Policy Intro */}
        <div className="mb-10 p-6 rounded-lg border border-gray-800 bg-gray-900/50">
          <p className="text-gray-300 leading-relaxed">
            This policy describes how Vesta (powered by Argo) handles your data.
            We only collect your email address to notify you of milestones and
            Alpha/Beta testing. Your data is stored securely in our database and
            will never be sold. To be removed, use the timestamped opt-out tool
            below.
          </p>
        </div>

        {/* Privacy Policy Content */}
        <div className="space-y-10">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              1. Data Collection and Purpose
            </h2>
            <p className="text-gray-400 leading-relaxed">
              We only collect your email address when you voluntarily provide it
              to join our waitlist. The purpose of this collection is strictly
              to notify you of project milestones, such as our Alpha/Beta
              testing phases and official launch. We do not collect any other
              personally identifiable information (PII) at this stage.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              2. Storage, Security, and Third Parties
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Your email address is stored securely in our database. We
              implement technical measures to protect your information from
              unauthorized access. We do not sell, rent, or share your email
              address with third parties for marketing purposes.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              3. Your Rights and Data Retention
            </h2>
            <p className="text-gray-400 leading-relaxed">
              You have the right to access, correct, or request the deletion of
              your email address from our database at any time. We will retain
              your information only as long as necessary to fulfill the
              pre-launch purposes described above. To be removed from our
              waitlist, use the timestamped opt-out tool below.
            </p>
          </section>

          {/* Deletion Request Form */}
          <section className="mt-12 pt-8 border-t border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">
              Deletion Request Form
            </h2>
            <p className="text-gray-400 mb-6">
              Enter your email address below to be removed from our waitlist.
              Your request will be timestamped and honored immediately.
            </p>

            {status === "success" ? (
              <div className="rounded-lg border border-green-800 bg-green-900/20 p-4">
                <p className="text-green-400">
                  Your request has been processed. If this email was on our
                  waitlist, it has been removed.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUnsubscribe} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={status === "loading"}
                    className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-800/80 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="rounded-lg bg-red-700/80 px-6 py-3 font-medium text-gray-300 transition-all hover:bg-red-700 hover:text-white disabled:opacity-50"
                >
                  {status === "loading" ? "Processing..." : "Remove My Email"}
                </button>

                {status === "error" && (
                  <p className="text-sm text-red-400">{errorMessage}</p>
                )}
              </form>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-800 space-y-4">
          <p className="text-xs text-gray-600">
            If you have any questions about this Privacy Policy, please contact
            us through our website.
          </p>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Vesta. All rights reserved. Vesta is an
            informational software tool provided for educational purposes only.
            It does not provide investment advice, does not execute trades, and
            is not a recommendation to buy or sell securities. Backend services
            provided by Argo.
          </p>
        </div>
      </div>
    </div>
  );
}
