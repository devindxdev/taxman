/**
 * Client-side data store using localStorage.
 * Replaces Supabase for documents and transactions.
 */

const DOCUMENTS_KEY = "taxman_documents";
const TRANSACTIONS_KEY = "taxman_transactions";
const LOGGED_IN_KEY = "taxman_logged_in";

export type Document = {
  id: string;
  file_name: string | null;
  file_type: string | null;
  doc_type: string | null;
  source: string;
  created_at: string;
  extracted_json?: Record<string, unknown> | null;
  fileBase64?: string; // for extraction - stored client-side only
};

export type Transaction = {
  id: string;
  plaid_id?: string; // for dedup when syncing from Plaid
  amount: number;
  date: string;
  merchant: string | null;
  category: string | null;
  matched_document_id: string | null;
};

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LOGGED_IN_KEY) === "1";
}

export function setLoggedIn(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(LOGGED_IN_KEY, "1");
  } else {
    localStorage.removeItem(LOGGED_IN_KEY);
  }
}

export function getDocuments(): Document[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DOCUMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setDocuments(docs: Document[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
}

export function addDocument(doc: Omit<Document, "id" | "created_at"> & { fileBase64?: string }): Document {
  const docs = getDocuments();
  const newDoc: Document = {
    ...doc,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  docs.unshift(newDoc);
  setDocuments(docs);
  return newDoc;
}

export function updateDocument(id: string, updates: Partial<Document>): void {
  const docs = getDocuments();
  const idx = docs.findIndex((d) => d.id === id);
  if (idx >= 0) {
    docs[idx] = { ...docs[idx], ...updates };
    setDocuments(docs);
  }
}

export function getDocument(id: string): Document | undefined {
  return getDocuments().find((d) => d.id === id);
}

export function deleteDocument(id: string): void {
  const docs = getDocuments().filter((d) => d.id !== id);
  setDocuments(docs);
  const txns = getTransactions();
  const updated = txns.map((t) =>
    t.matched_document_id === id ? { ...t, matched_document_id: null as string | null } : t
  );
  if (updated.some((t, i) => t.matched_document_id !== txns[i].matched_document_id)) {
    setTransactions(updated);
  }
}

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setTransactions(txns: Transaction[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns));
}

export function mergeTransactions(newTxns: (Omit<Transaction, "id"> & { plaid_id?: string })[]): void {
  const existing = getTransactions();
  const existingPlaidIds = new Set(existing.filter((t) => t.plaid_id).map((t) => t.plaid_id!));
  const toAdd = newTxns
    .filter((t) => !t.plaid_id || !existingPlaidIds.has(t.plaid_id))
    .map((t) => ({
      ...t,
      id: crypto.randomUUID(),
      matched_document_id: t.matched_document_id ?? null,
    } as Transaction));
  setTransactions([...toAdd, ...existing]);
}

/** Replace all transactions (e.g. when loading fresh 10 from sandbox) */
export function replaceTransactions(newTxns: (Omit<Transaction, "id"> & { plaid_id?: string })[]): void {
  const txns = newTxns.map((t) => ({
    ...t,
    id: crypto.randomUUID(),
    matched_document_id: t.matched_document_id ?? null,
  } as Transaction));
  setTransactions(txns);
}

export function updateTransaction(id: string, updates: Partial<Transaction>): void {
  const txns = getTransactions();
  const idx = txns.findIndex((t) => t.id === id);
  if (idx >= 0) {
    txns[idx] = { ...txns[idx], ...updates };
    setTransactions(txns);
  }
}

export function computeReadinessScore(): number {
  const docs = getDocuments();
  const txns = getTransactions();
  const docCount = docs.length;
  const txCount = txns.length;
  const matchedCount = txns.filter((t) => t.matched_document_id).length;
  const extractedCount = docs.filter((d) => d.extracted_json != null).length;

  const hasDocuments = docCount > 0;
  const hasTransactions = txCount > 0;
  const matchRate = txCount > 0 ? matchedCount / txCount : 0;
  const extractRate = docCount > 0 ? extractedCount / docCount : 0;

  return Math.min(
    100,
    Math.round(
      (hasDocuments ? 25 : 0) +
        (hasTransactions ? 25 : 0) +
        matchRate * 25 +
        extractRate * 25
    )
  );
}
