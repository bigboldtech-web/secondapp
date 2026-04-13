"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bulkCreateListings } from "./actions";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BulkUploadClientProps {
  categories: Category[];
  vendorId: string;
  plan: string;
}

export default function BulkUploadClient({ categories, plan }: BulkUploadClientProps) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState("");
  const [csvText, setCsvText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);

  const parseCsv = (text: string) => {
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] || ""; });

      const specs: Record<string, string> = {};
      for (const key of Object.keys(row)) {
        if (!["brand", "model", "condition", "price", "original_price", "quantity", "description"].includes(key) && row[key]) {
          specs[key] = row[key];
        }
      }

      return {
        brandSlug: row.brand?.toLowerCase().replace(/\s+/g, "-") ?? "",
        modelSlug: row.model?.toLowerCase().replace(/\s+/g, "-") ?? "",
        condition: row.condition || "Good",
        price: parseFloat(row.price) || 0,
        originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
        quantity: row.quantity ? parseInt(row.quantity) : 1,
        description: row.description || undefined,
        specs: Object.keys(specs).length > 0 ? specs : undefined,
      };
    });
  };

  const handleUpload = async () => {
    if (!categoryId || !csvText.trim()) return;
    setUploading(true);
    setResult(null);

    const rows = parseCsv(csvText);
    if (rows.length === 0) {
      setResult({ created: 0, skipped: 0, errors: ["No valid rows found. Check your CSV format."] });
      setUploading(false);
      return;
    }

    const res = await bulkCreateListings(categoryId, rows);
    if ("error" in res) {
      setResult({ created: 0, skipped: 0, errors: [res.error ?? "Unknown error"] });
    } else {
      setResult(res);
    }
    setUploading(false);
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setCsvText(e.target?.result as string ?? "");
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6 h-[52px] flex items-center gap-3">
          <Link href="/vendor/listings/manage" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">
            Second <span className="text-coral">App</span>
          </Link>
          <div className="w-px h-5 bg-border" />
          <span className="text-[12px] font-medium text-text-muted">Bulk upload</span>
          <span className="ml-auto text-[10px] font-semibold text-coral uppercase">{plan} plan</span>
        </div>
      </header>

      <main className="mx-auto max-w-[800px] px-4 sm:px-6 py-6">
        <h1 className="text-xl font-bold text-text-primary mb-1">Bulk upload listings</h1>
        <p className="text-[13px] text-text-muted mb-5">
          Upload a CSV to create multiple listings at once. Max 200 rows per upload.
        </p>

        <div className="bg-card border border-border rounded-[10px] px-5 py-5 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-1">Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 text-[13px] border border-border rounded-lg bg-white text-text-primary cursor-pointer outline-none"
            >
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-1">CSV data</label>
            <div className="flex gap-2 mb-2">
              <label className="px-3 py-1.5 rounded-md border border-border bg-white text-[12px] font-medium text-text-primary cursor-pointer">
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
                Choose file
              </label>
              <span className="text-[11px] text-text-muted self-center">or paste below</span>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={10}
              placeholder={"brand,model,condition,price,original_price,quantity,storage,color\napple,iphone-15-pro-max,Like New,109999,159900,2,256GB,Black\nsamsung,galaxy-s24-ultra,Good,62500,129999,1,256GB,Titanium"}
              className="w-full px-3 py-2.5 text-[12px] font-mono border border-border rounded-lg bg-white text-text-primary resize-none outline-none"
            />
            <p className="text-[10px] text-text-muted mt-1">
              Required columns: brand, model, condition, price. Optional: original_price, quantity, description. Extra columns become specs.
            </p>
          </div>

          {result && (
            <div className={`px-3 py-2.5 rounded-lg text-[12px] ${result.created > 0 ? "bg-condition-likenew-bg text-condition-likenew-text" : "bg-condition-rough-bg text-condition-rough-text"}`}>
              <p className="font-semibold">{result.created} created · {result.skipped} skipped</p>
              {result.errors.length > 0 && (
                <ul className="mt-1 list-disc pl-4 text-[11px]">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!categoryId || !csvText.trim() || uploading}
            className="w-full py-2.5 rounded-lg bg-coral text-white text-[14px] font-semibold border-none cursor-pointer disabled:opacity-50"
          >
            {uploading ? "Processing…" : "Upload & create listings"}
          </button>
        </div>
      </main>
    </div>
  );
}
