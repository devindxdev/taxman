"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { SandboxTransactionsButton } from "@/components/SandboxTransactionsButton";
import {
  BC_TAX_YEAR,
  BC_FILING_DEADLINE,
  BC_BRACKETS_DISPLAY,
  getMarginalRateBC,
} from "@/lib/bc-tax";
import { VAULT_CATEGORIES, getCategoryLabel } from "@/lib/vault-categories";
import {
  getDocuments,
  addDocument,
  updateDocument,
  getTransactions,
  updateTransaction,
  replaceTransactions,
  computeReadinessScore,
  setLoggedIn,
  type Document,
  type Transaction,
} from "@/lib/local-storage";
import { getTaxRelevantInfo } from "@/lib/tax-relevant-transactions";

function ManualAmountInput({
  docId,
  currentAmount,
  onSave,
}: {
  docId: string;
  currentAmount?: number;
  onSave: (docId: string, amount: number) => void;
}) {
  const [amount, setAmount] = useState(currentAmount?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAmount(currentAmount?.toString() ?? "");
  }, [currentAmount]);

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        step="0.01"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-24 px-2 py-1 text-sm rounded border border-tm-border bg-white text-tm-black"
      />
      <button
        onClick={() => {
          const num = parseFloat(amount);
          if (!isNaN(num) && num > 0) {
            setSaving(true);
            onSave(docId, num);
            setSaving(false);
          }
        }}
        disabled={saving || !amount}
        className="text-sm px-2 py-1 rounded border border-tm-blue text-tm-blue hover:bg-tm-blue/10 disabled:opacity-50"
      >
        {saving ? "..." : "Save"}
      </button>
    </div>
  );
}

function inferDocType(fileName: string): "receipt" | "invoice" | "form" | "other" {
  const lower = fileName.toLowerCase();
  if (lower.includes("receipt")) return "receipt";
  if (lower.includes("invoice") || lower.includes("inv")) return "invoice";
  if (lower.includes("w2") || lower.includes("1099") || lower.includes("form"))
    return "form";
  return "other";
}

export default function DashboardPage() {
  const [documents, setDocumentsState] = useState<Document[]>([]);
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [extractingIds, setExtractingIds] = useState<Set<string>>(new Set());
  const [readinessScore, setReadinessScore] = useState<number | null>(null);
  const [simulatePercent, setSimulatePercent] = useState(50);
  const [estimatedIncome, setEstimatedIncome] = useState("");
  const [simulateResult, setSimulateResult] = useState<{
    marginalRate: number;
    estimatedDeductible: number;
    estimatedTaxSavings: number;
  } | null>(null);
  const [bracketsOpen, setBracketsOpen] = useState(false);
  const [transactionsFilter, setTransactionsFilter] = useState<"all" | "tax_relevant">("all");

  const MAX_HIGHLIGHTED = 5;

  const loadFromStorage = useCallback(() => {
    setDocumentsState(getDocuments());
    setTransactionsState(getTransactions());
    setReadinessScore(computeReadinessScore());
  }, []);

  const refreshAll = useCallback(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    loadFromStorage();
    setLoading(false);
  }, [loadFromStorage]);

  useEffect(() => {
    if (!loading && getTransactions().length === 0) {
      fetch("/api/sandbox-transactions")
        .then((r) => r.json())
        .then((data) => {
          if (data.transactions?.length) {
            replaceTransactions(data.transactions);
            loadFromStorage();
          }
        })
        .catch(() => {});
    }
  }, [loading, loadFromStorage]);

  function handleManualAmount(docId: string, amount: number) {
    const doc = getDocuments().find((d) => d.id === docId);
    if (doc) {
      updateDocument(docId, {
        extracted_json: { ...doc.extracted_json, amount } as Record<string, unknown>,
      });
      refreshAll();
    }
  }

  async function handleExtractAI(doc: Document) {
    const fileBase64 = doc.fileBase64;
    if (!fileBase64) {
      alert("File data not available. Re-upload the document.");
      return;
    }
    setExtractingIds((prev) => new Set(prev).add(doc.id));
    try {
      const mimeType =
        doc.file_type === "application/pdf"
          ? "application/pdf"
          : doc.file_type === "image/png"
            ? "image/png"
            : doc.file_type === "image/webp"
              ? "image/webp"
              : "image/jpeg";
      const res = await fetch("/api/extract-from-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64: fileBase64, mimeType }),
      });
      const data = await res.json();
      if (res.ok && data.extracted) {
        updateDocument(doc.id, {
          extracted_json: data.extracted,
          doc_type: data.doc_type ?? doc.doc_type,
        });
      } else {
        alert(data.error || "Extraction failed");
      }
    } catch {
      alert("Extraction failed");
    } finally {
      setExtractingIds((prev) => {
        const next = new Set(prev);
        next.delete(doc.id);
        return next;
      });
      refreshAll();
    }
  }

  function handleSimulate() {
    const DEFAULT_MARGINAL_RATE = 28.2;
    const estimatedIncomeNum = estimatedIncome ? Number(estimatedIncome) : 0;
    const marginalRate =
      estimatedIncomeNum > 0 ? getMarginalRateBC(estimatedIncomeNum) : DEFAULT_MARGINAL_RATE;

    let totalDeductible = 0;
    for (const doc of documents) {
      const amount = Number(doc.extracted_json?.amount);
      if (!isNaN(amount)) {
        totalDeductible += amount * (simulatePercent / 100);
      }
    }

    const estimatedSavings = totalDeductible * (marginalRate / 100);

    setSimulateResult({
      marginalRate,
      estimatedDeductible: Math.round(totalDeductible * 100) / 100,
      estimatedTaxSavings: Math.round(estimatedSavings * 100) / 100,
    });
  }

  function handleMatch(docId: string) {
    const doc = getDocuments().find((d) => d.id === docId);
    const amount = doc?.extracted_json?.amount;
    if (amount == null) return;
    const txns = getTransactions();
    const match = txns.find(
      (t) =>
        !t.matched_document_id &&
        Math.abs(t.amount - Number(amount)) < 0.02
    );
    if (match) {
      updateTransaction(match.id, { matched_document_id: docId });
      refreshAll();
    } else {
      alert("No matching transaction found. Connect your bank and sync transactions first.");
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    e.target.value = "";

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const match = result.match(/^data:[^;]+;base64,(.+)$/);
        resolve(match ? match[1] : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }).catch(() => {
      setUploading(false);
      alert("Upload failed");
      return null;
    });

    if (base64 == null) return;

    const doc = addDocument({
      file_name: file.name,
      file_type: file.type,
      doc_type: inferDocType(file.name),
      source: "upload",
      fileBase64: base64,
    });

    setExtractingIds((prev) => new Set(prev).add(doc.id));
    refreshAll();

    try {
      let res: Response;
      if (file.type === "application/pdf") {
        const formData = new FormData();
        formData.append("file", file);
        res = await fetch("/api/extract-from-file", {
          method: "POST",
          body: formData,
        });
      } else {
        const mimeType =
          file.type === "image/png"
            ? "image/png"
            : file.type === "image/webp"
              ? "image/webp"
              : "image/jpeg";
        res = await fetch("/api/extract-from-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, mimeType }),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.extracted) {
        updateDocument(doc.id, {
          extracted_json: data.extracted,
          doc_type: data.doc_type ?? doc.doc_type,
        });
      }
    } catch {
      alert("Extraction failed");
    } finally {
      setExtractingIds((prev) => {
        const next = new Set(prev);
        next.delete(doc.id);
        return next;
      });
      setUploading(false);
      refreshAll();
    }
  }

  function handleSignOut() {
    setLoggedIn(false);
    window.location.href = "/login";
  }

  const incomeNum = estimatedIncome ? Number(estimatedIncome) : 0;
  const userMarginalRate = incomeNum > 0 ? getMarginalRateBC(incomeNum) : null;

  const documentsByCategory = useMemo(() => {
    const groups: Record<string, Document[]> = {};
    for (const cat of VAULT_CATEGORIES) {
      groups[cat.key] = [];
    }
    groups.uncategorized = [];
    for (const d of documents) {
      const cat = (d.extracted_json?.category as string) || null;
      if (cat && groups[cat]) {
        groups[cat].push(d);
      } else {
        groups.uncategorized.push(d);
      }
    }
    return groups;
  }, [documents]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tm-offwhite">
        <p className="text-tm-gray">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tm-offwhite">
      <header className="border-b border-tm-border bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-semibold text-tm-black">
              Taxman
            </Link>
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-tm-blue/20 text-tm-blue border border-tm-blue/40">
              BC, Canada
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => document.getElementById("storage-vault")?.scrollIntoView({ behavior: "smooth" })}
              className="text-sm text-tm-gray hover:text-tm-blue hover:underline"
            >
              Storage Vault
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm text-tm-gray hover:text-tm-black"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-2xl border border-tm-border bg-white/80">
            <h2 className="text-sm font-medium text-tm-gray">
              BC Tax Overview
            </h2>
            <div className="mt-2 flex flex-wrap gap-6 text-tm-black">
              <span>Tax year: {BC_TAX_YEAR}</span>
              <span>Filing deadline: {BC_FILING_DEADLINE}</span>
              <span>Province: British Columbia</span>
            </div>
            <a
              href="https://www2.gov.bc.ca/gov/content/taxes/income-taxes/personal"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-tm-blue hover:text-tm-blue-dark"
            >
              BC Personal Income Tax →
            </a>
          </div>
          {readinessScore !== null && (
            <div className="p-6 rounded-2xl bg-tm-blue/10 border border-tm-blue/30 backdrop-blur-sm shadow-glow-blue-sm">
              <h2 className="text-sm font-medium text-tm-gray">
                Tax Readiness Score
              </h2>
              <p className="mt-2 text-4xl font-bold text-tm-blue">
                {readinessScore}%
              </p>
              <p className="mt-1 text-sm text-tm-gray">
                Based on documents, transactions, matches, and extractions.
              </p>
            </div>
          )}
        </div>

        <h1 id="storage-vault" className="text-2xl font-bold text-tm-black scroll-mt-8">
          Storage Vault
        </h1>
        <p className="mt-2 text-tm-gray">
          Documents auto-organized by category. Upload a receipt and it will be categorized automatically.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-tm-blue text-white font-semibold rounded-lg cursor-pointer hover:bg-tm-blue-dark disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-glow-blue-sm">
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? "Uploading..." : "Upload document"}
          </label>
          <SandboxTransactionsButton onSuccess={refreshAll} />
        </div>

        <div className="mt-12">
          {documents.length === 0 ? (
            <div className="p-12 rounded-xl border-2 border-dashed border-tm-border text-center text-tm-gray">
              No documents yet. Upload your first receipt or invoice above.
            </div>
          ) : (
            <div className="space-y-8">
              {[...VAULT_CATEGORIES, { key: "uncategorized", label: "Uncategorized" }].map(
                ({ key, label }) => {
                  const docs = documentsByCategory[key] || [];
                  if (docs.length === 0) return null;
                  return (
                    <div key={key} className="rounded-xl border border-tm-border bg-white/50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-tm-border flex items-center justify-between">
                        <h2 className="font-semibold text-tm-black">{label}</h2>
                        <span className="text-sm text-tm-gray">{docs.length} document{docs.length !== 1 ? "s" : ""}</span>
                      </div>
                      <ul className="divide-y divide-tm-border">
                        {docs.map((doc) => (
                          <li
                            key={doc.id}
                            className="flex flex-wrap items-center justify-between gap-4 p-4"
                          >
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-tm-black">
                                  {doc.file_name || "Untitled"}
                                </p>
                                {extractingIds.has(doc.id) ? (
                                  <span className="px-2 py-0.5 text-xs rounded bg-tm-blue/20 text-tm-blue border border-tm-blue/40">
                                    Organizing...
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 text-xs rounded bg-tm-border/50 text-tm-gray border border-tm-border">
                                    Organized into: {getCategoryLabel(doc.extracted_json?.category as string)}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-tm-gray">
                                {doc.doc_type || "other"} • {doc.source} •{" "}
                                {new Date(doc.created_at).toLocaleDateString()}
                                {doc.extracted_json?.amount != null && (
                                  <> • ${Number(doc.extracted_json.amount).toFixed(2)}</>
                                )}
                                {doc.extracted_json?.vendor != null && (
                                  <> • {String(doc.extracted_json.vendor)}</>
                                )}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                              <button
                                onClick={() => handleExtractAI(doc)}
                                disabled={extractingIds.has(doc.id)}
                                className="text-sm px-3 py-1 rounded border border-tm-blue/50 text-tm-blue hover:bg-tm-blue/10 disabled:opacity-50"
                              >
                                {extractingIds.has(doc.id) ? "Extracting..." : "Extract with AI"}
                              </button>
                              <ManualAmountInput
                                docId={doc.id}
                                currentAmount={doc.extracted_json?.amount != null ? Number(doc.extracted_json.amount) : undefined}
                                onSave={handleManualAmount}
                              />
                              <button
                                onClick={() => handleMatch(doc.id)}
                                disabled={doc.extracted_json?.amount == null}
                                className="text-sm px-3 py-1 rounded border border-tm-border text-tm-gray hover:bg-tm-border disabled:opacity-50"
                              >
                                Match
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="p-6 rounded-2xl border border-tm-border bg-white/80 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-tm-black">
              BC Tax Simulator
            </h2>
            <p className="mt-2 text-tm-gray text-sm">
              Estimate tax savings from business expense deductions using BC combined federal + provincial rates.
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-6">
              <div>
                <label className="block text-sm font-medium text-tm-black">
                  Estimated taxable income ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="e.g. 75000"
                  value={estimatedIncome}
                  onChange={(e) => setEstimatedIncome(e.target.value)}
                  className="mt-1 w-36 px-3 py-2 rounded border border-tm-border bg-white text-tm-black"
                />
                <p className="mt-1 text-xs text-tm-gray">
                  Optional – used for marginal rate
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-tm-black">
                  Business use %
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simulatePercent}
                  onChange={(e) => setSimulatePercent(Number(e.target.value))}
                  className="mt-1 w-48"
                />
                <span className="ml-2 text-tm-black">{simulatePercent}%</span>
              </div>
              <button
                onClick={handleSimulate}
                className="px-4 py-2 bg-tm-blue text-white font-semibold rounded-lg hover:bg-tm-blue-dark transition-all duration-200 hover:scale-[1.02] hover:shadow-glow-blue-sm"
              >
                Simulate
              </button>
            </div>
            {simulateResult && (
              <div className="mt-4 p-4 rounded-lg bg-tm-offwhite">
                <p className="text-sm text-tm-gray">
                  Marginal rate used: {simulateResult.marginalRate}%
                </p>
                <p className="text-sm text-tm-gray">
                  Estimated deductible: ${simulateResult.estimatedDeductible.toFixed(2)}
                </p>
                <p className="text-sm text-tm-gray">
                  Estimated tax savings: ${simulateResult.estimatedTaxSavings.toFixed(2)}
                </p>
              </div>
            )}
            <p className="mt-4 text-xs text-tm-gray">
              BC combined federal + provincial rates. Consult a tax professional.
            </p>
            <div className="mt-4">
              <button
                onClick={() => setBracketsOpen(!bracketsOpen)}
                className="text-sm font-bold text-tm-black hover:text-tm-blue"
              >
                BC Tax Brackets Reference {bracketsOpen ? "−" : "+"}
              </button>
              {bracketsOpen && (
                <div className="mt-2 overflow-x-auto rounded-lg border border-tm-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-tm-border">
                        <th className="px-4 py-2 text-left text-tm-gray">Taxable income</th>
                        <th className="px-4 py-2 text-right text-tm-gray">Marginal rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BC_BRACKETS_DISPLAY.map((b, i) => {
                        const isUserBracket =
                          userMarginalRate !== null &&
                          Math.abs(b.rate - userMarginalRate) < 0.01;
                        return (
                          <tr
                            key={i}
                            className={`border-b border-tm-border last:border-0 ${
                              isUserBracket ? "bg-tm-blue/10" : ""
                            }`}
                          >
                            <td className="px-4 py-2 text-tm-black">
                              ${b.from.toLocaleString()}
                              {b.to !== null ? ` – $${b.to.toLocaleString()}` : " +"}
                              {isUserBracket && (
                                <span className="ml-2 text-xs text-tm-blue">(your bracket)</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-right text-tm-black">
                              {b.rate}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 rounded-2xl border border-tm-border bg-white/50">
            <h2 className="text-lg font-bold text-tm-black">
              Common deductions (BC)
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-tm-gray">
              <li>• RRSP contributions</li>
              <li>• Charitable donations</li>
              <li>• Medical expenses</li>
              <li>• Business expenses (track with documents above)</li>
            </ul>
          </div>
        </div>

        <h2 className="mt-16 text-xl font-bold text-tm-black">
          Plaid Transactions
        </h2>
        <p className="mt-2 text-tm-gray">
          Load Plaid transactions to see sample data. Tax-relevant transactions are flagged for potential deductions.
        </p>
        {transactions.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <p className="text-sm text-tm-blue">
              Up to 5 highlighted as potentially tax-deductible
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTransactionsFilter("all")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  transactionsFilter === "all"
                    ? "bg-tm-blue text-tm-black font-medium"
                    : "bg-tm-border/50 text-tm-gray hover:text-tm-black"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTransactionsFilter("tax_relevant")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  transactionsFilter === "tax_relevant"
                    ? "bg-tm-blue text-tm-black font-medium"
                    : "bg-tm-border/50 text-tm-gray hover:text-tm-black"
                }`}
              >
                Tax-relevant only
              </button>
            </div>
          </div>
        )}
        <div className="mt-6">
          {transactions.length === 0 ? (
            <div className="p-8 rounded-xl border-2 border-dashed border-tm-border text-center text-tm-gray">
              No transactions yet. Load Plaid transactions above.
            </div>
          ) : (
              (() => {
                const filtered =
                  transactionsFilter === "tax_relevant"
                    ? transactions.filter((tx) => getTaxRelevantInfo(tx).relevant)
                    : [...transactions].sort((a, b) => {
                        const aRel = getTaxRelevantInfo(a).relevant ? 1 : 0;
                        const bRel = getTaxRelevantInfo(b).relevant ? 1 : 0;
                        return bRel - aRel;
                      });

                return (
                  <div>
                    <p className="text-sm text-tm-gray mb-2">
                      {transactionsFilter === "tax_relevant"
                        ? `Showing ${filtered.length} tax-relevant of ${transactions.length} total`
                        : `Showing all ${filtered.length} transactions`}
                    </p>
                    <ul key={transactionsFilter} className="space-y-2">
                    {filtered.map((tx, idx) => {
                      const { relevant } = getTaxRelevantInfo(tx);
                      const highlightedCount = filtered.slice(0, idx).filter((t) => getTaxRelevantInfo(t).relevant).length;
                      const shouldHighlight = relevant && highlightedCount < MAX_HIGHLIGHTED;
                      return (
                        <li
                          key={tx.id}
                          className={`flex items-center gap-4 p-3 rounded-lg border text-sm ${
                            shouldHighlight
                              ? "border-tm-blue/60 bg-tm-blue/10 shadow-glow-blue-sm"
                              : "border-tm-border bg-white"
                          }`}
                        >
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <span className="font-medium text-tm-black truncate">{tx.merchant || "Unknown"}</span>
                          </div>
                          <span className={`shrink-0 tabular-nums w-20 text-right ${shouldHighlight ? "text-tm-blue font-semibold" : "text-tm-black"}`}>${Number(tx.amount).toFixed(2)}</span>
                          <span className="text-tm-gray shrink-0 w-24 text-right">
                            {new Date(tx.date).toLocaleDateString()}
                          </span>
                        </li>
                      );
                    })}
                    </ul>
                  </div>
                );
              })()
          )}
        </div>
      </main>
    </div>
  );
}
