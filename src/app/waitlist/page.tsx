"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      // Placeholder: In production, this would call an API to store the email
      await new Promise((r) => setTimeout(r, 800));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <Header />
      <main className="pt-24 min-h-[60vh] bg-tm-offwhite">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-tm-black">
              Join the waitlist
            </h1>
            <p className="mt-4 text-tm-gray">
              Be the first to know when Taxman launches. We&apos;ll send you
              early access when it&apos;s ready.
            </p>
            <form onSubmit={handleSubmit} className="mt-10">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={status === "loading"}
                  className="flex-1 px-4 py-3 rounded-lg border border-tm-border bg-white text-tm-black placeholder-tm-gray-light focus:ring-2 focus:ring-tm-blue focus:border-tm-blue outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-6 py-3 bg-tm-blue text-white font-semibold rounded-lg hover:bg-tm-blue-dark transition-all duration-200 hover:scale-[1.02] hover:shadow-glow-blue-sm disabled:opacity-50"
                >
                  {status === "loading" ? "Joining..." : "Join waitlist"}
                </button>
              </div>
              {status === "success" && (
                <p className="mt-4 text-tm-blue font-medium">
                  Thanks! We&apos;ll be in touch soon.
                </p>
              )}
              {status === "error" && (
                <p className="mt-4 text-red-600">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
            <p className="mt-6 text-sm text-tm-gray">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
