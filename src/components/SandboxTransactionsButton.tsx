"use client";

import { useState } from "react";
import { replaceTransactions } from "@/lib/local-storage";

export function SandboxTransactionsButton({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleLoad() {
    setLoading(true);
    try {
      const res = await fetch("/api/sandbox-transactions");
      const data = await res.json();
      if (res.ok && data.transactions?.length) {
        replaceTransactions(data.transactions);
        onSuccess?.();
      } else {
        alert("Failed to load Plaid transactions");
      }
    } catch {
      alert("Failed to load sandbox transactions");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLoad}
      disabled={loading}
      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-tm-border rounded-lg font-semibold text-tm-black hover:border-tm-blue hover:text-tm-blue disabled:opacity-50 transition-colors"
    >
      {loading ? "Loading..." : "Load Plaid transactions"}
    </button>
  );
}
