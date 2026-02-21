"use client";

import { useCallback, useEffect, useState } from "react";
import { mergeTransactions } from "@/lib/local-storage";

declare global {
  interface Window {
    Plaid?: {
      create: (config: {
        token: string;
        onSuccess: (publicToken: string) => void;
        onExit: (err: unknown) => void;
      }) => { open: () => void };
    };
  }
}

export function PlaidLink({ onSuccess }: { onSuccess?: () => void }) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/plaid/link-token", { method: "POST" })
      .then((r) => r.json())
      .then((data) => setLinkToken(data.link_token))
      .catch(() => setLinkToken(null));
  }, []);

  const openPlaid = useCallback(() => {
    if (!linkToken || !window.Plaid) return;
    setLoading(true);
    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: async (publicToken: string) => {
        const res = await fetch("/api/plaid/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_token: publicToken }),
        });
        setLoading(false);
        if (res.ok) {
          const data = await res.json();
          if (data.transactions?.length) {
            mergeTransactions(data.transactions);
          }
          onSuccess?.();
        } else {
          alert("Failed to connect account");
        }
      },
      onExit: () => setLoading(false),
    });
    handler.open();
  }, [linkToken, onSuccess]);

  return (
    <button
      onClick={openPlaid}
      disabled={!linkToken || loading}
      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-tm-border rounded-lg font-semibold text-tm-black hover:border-tm-blue hover:text-tm-blue disabled:opacity-50 transition-colors"
    >
      {loading ? "Connecting..." : "Connect bank with Plaid"}
    </button>
  );
}
