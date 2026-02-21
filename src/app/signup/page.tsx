"use client";

import { useState } from "react";
import Link from "next/link";
import { setLoggedIn } from "@/lib/local-storage";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);

  function handleEnter() {
    setLoading(true);
    setLoggedIn(true);
    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-tm-offwhite px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="text-xl font-semibold text-tm-black">
          Taxman
        </Link>
        <h1 className="mt-8 text-2xl font-bold text-tm-black">
          Create account
        </h1>
        <p className="mt-2 text-tm-gray text-sm">
          Dev mode – one click to enter.
        </p>
        <div className="mt-6">
          <button
            onClick={handleEnter}
            disabled={loading}
            className="w-full py-3 bg-tm-blue text-white font-semibold rounded-lg hover:bg-tm-blue-dark disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-glow-blue-sm"
          >
            {loading ? "Entering..." : "Enter Dashboard"}
          </button>
        </div>
        <p className="mt-4 text-sm text-tm-gray">
          Already have an account?{" "}
          <Link href="/login" className="text-tm-blue hover:text-tm-blue-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
