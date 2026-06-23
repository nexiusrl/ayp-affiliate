"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Check, AlertCircle, FileText, Loader2 } from "lucide-react";
import { type Category, type Platform } from "@/types";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface ImportProductCSVProps {
  categories: Category[];
}

interface ParsedProduct {
  id: string; // client-side temp id for key and removal
  name: string;
  price: number;
  affiliate_url: string;
  platform: Platform;
  description: string;
}

export function ImportProductCSV({ categories }: ImportProductCSVProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categoryId, setCategoryId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parse price helper
  const parsePrice = (priceStr: string): number => {
    if (!priceStr) return 0;
    let clean = priceStr.replace(/Rp\.?/gi, '').replace(/\s+/g, '').trim();
    let multiplier = 1;
    if (/RB$/i.test(clean)) {
      multiplier = 1000;
      clean = clean.replace(/RB$/i, '');
    } else if (/JT$/i.test(clean)) {
      multiplier = 1000000;
      clean = clean.replace(/JT$/i, '');
    }
    // Strip periods (thousands separators in Indonesia)
    clean = clean.replace(/\./g, '');
    // Replace decimal comma with decimal dot
    clean = clean.replace(/,/g, '.');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : Math.round(parsed * multiplier);
  };

  // CSV parsing function that handles quotes and commas
  const parseCSV = (text: string): string[][] => {
    const result: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentValue = "";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentValue += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(currentValue.trim());
        currentValue = "";
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++; // skip LF after CR
        }
        row.push(currentValue.trim());
        if (row.length > 0 && (row.length > 1 || row[0] !== "")) {
          result.push(row);
        }
        row = [];
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    if (currentValue !== "" || row.length > 0) {
      row.push(currentValue.trim());
      result.push(row);
    }
    return result;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      setErrorMsg("Berkas harus berupa file CSV (.csv)");
      setFile(null);
      setParsedProducts([]);
      return;
    }

    setFile(selectedFile);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);

        if (rows.length < 2) {
          setErrorMsg("Berkas CSV kosong atau tidak memiliki baris data.");
          setParsedProducts([]);
          return;
        }

        const headers = rows[0].map(h => h.trim().toLowerCase());
        
        // Find column indices
        const nameIdx = headers.indexOf("nama produk");
        const priceIdx = headers.indexOf("harga");
        const linkExtraIdx = headers.indexOf("link komisi ekstra");
        const linkProdIdx = headers.indexOf("link produk");
        const shopIdx = headers.indexOf("nama toko");
        const salesIdx = headers.indexOf("penjualan");
        const commPercentIdx = headers.indexOf("komisi hingga");
        const commAmountIdx = headers.indexOf("komisi");

        if (nameIdx === -1) {
          setErrorMsg("Kolom 'Nama Produk' tidak ditemukan dalam CSV.");
          setParsedProducts([]);
          return;
        }

        const linkIndex = linkExtraIdx !== -1 ? linkExtraIdx : linkProdIdx;
        if (linkIndex === -1) {
          setErrorMsg("Kolom 'Link Produk' atau 'Link Komisi Ekstra' tidak ditemukan.");
          setParsedProducts([]);
          return;
        }

        const products: ParsedProduct[] = [];
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          // Skip empty or mismatching length rows
          if (row.length < Math.max(nameIdx, linkIndex) + 1) continue;

          const name = row[nameIdx];
          const rawPrice = priceIdx !== -1 ? row[priceIdx] : "0";
          const price = parsePrice(rawPrice);
          
          // Get affiliate URL (prefer Extra Commission link, fallback to direct product link)
          let affiliate_url = linkExtraIdx !== -1 ? row[linkExtraIdx] : "";
          if (!affiliate_url && linkProdIdx !== -1) {
            affiliate_url = row[linkProdIdx];
          }

          if (!name || !affiliate_url) continue;

          // Detect platform from domain
          let platform: Platform = "shopee";
          if (
            affiliate_url.toLowerCase().includes("tokopedia") ||
            affiliate_url.toLowerCase().includes("tokopedi.ae") ||
            affiliate_url.toLowerCase().includes("tokopedia.link")
          ) {
            platform = "tokopedia";
          }

          // Build description
          const shopName = shopIdx !== -1 ? row[shopIdx] : "";
          const sales = salesIdx !== -1 ? row[salesIdx] : "";
          const commPercent = commPercentIdx !== -1 ? row[commPercentIdx] : "";
          const commAmount = commAmountIdx !== -1 ? row[commAmountIdx] : "";

          const descParts: string[] = [];
          if (shopName) descParts.push(`Toko: ${shopName}`);
          if (sales) descParts.push(`Penjualan: ${sales}`);
          if (commAmount || commPercent) {
            const commStr = [commAmount, commPercent].filter(Boolean).join(" ");
            descParts.push(`Komisi: ${commStr}`);
          }
          const description = descParts.join(" | ");

          products.push({
            id: `temp-${i}-${Date.now()}`,
            name,
            price,
            affiliate_url,
            platform,
            description,
          });
        }

        if (products.length === 0) {
          setErrorMsg("Tidak ada data produk valid yang berhasil diparsing.");
          setParsedProducts([]);
          return;
        }

        setParsedProducts(products);
      } catch (err) {
        setErrorMsg("Gagal memproses berkas CSV. Pastikan format berkas benar.");
        setParsedProducts([]);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleRemoveProduct = (tempId: string) => {
    setParsedProducts((prev) => prev.filter((p) => p.id !== tempId));
  };

  const handleImportSubmit = async () => {
    if (!categoryId) {
      toastError("Silakan pilih kategori terlebih dahulu!");
      return;
    }
    if (parsedProducts.length === 0) {
      toastError("Tidak ada produk untuk diimpor!");
      return;
    }

    setLoading(true);
    try {
      const payload = parsedProducts.map(({ name, price, affiliate_url, platform, description }) => ({
        name,
        price,
        affiliate_url,
        platform,
        description,
        category_id: categoryId,
        image_url: "", // default fallback image (box emoji placeholder)
        is_active: true,
      }));

      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: payload }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengimpor produk");
      }

      const data = await res.json();
      success(`Berhasil mengimpor ${data.count} produk ke database!`);
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toastError(err.message || "Gagal mengimpor produk");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Settings Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Pengaturan Impor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Kategori Target <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] outline-none transition-all"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#64748B]">
              Semua produk di dalam file CSV akan dimasukkan ke dalam kategori ini.
            </p>
          </div>

          {/* File Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              File CSV (.csv) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
            <div
              onClick={triggerFileSelect}
              className="w-full h-24 border-2 border-dashed border-[#E2E8F0] hover:border-[#2563EB] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#F8FAFC] hover:bg-[#F0F5FF]"
            >
              <Upload size={20} className="text-[#64748B] mb-2" />
              <span className="text-sm font-medium text-[#0F172A]">
                {file ? file.name : "Pilih atau Seret Berkas CSV"}
              </span>
              <span className="text-xs text-[#64748B] mt-1">
                Maksimal 5MB (.csv)
              </span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2.5 text-red-700 text-xs">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Preview Card */}
      {parsedProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-[#2563EB]" />
              <h3 className="text-sm font-bold text-[#0F172A]">
                Pratinjau Impor ({parsedProducts.length} Produk)
              </h3>
            </div>
            <Button
              onClick={handleImportSubmit}
              disabled={loading || !categoryId}
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Mengimpor...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Konfirmasi Impor
                </>
              )}
            </Button>
          </div>

          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] sticky top-0 z-10">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
                    Nama Produk
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#64748B] bg-[#F8FAFC] w-28">
                    Harga
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#64748B] bg-[#F8FAFC] w-24">
                    Platform
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
                    Detail Toko & Komisi
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#64748B] bg-[#F8FAFC] w-12">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {parsedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#0F172A] line-clamp-1" title={p.name}>
                        {p.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#64748B] font-mono">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          p.platform === "shopee"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {p.platform === "shopee" ? "Shopee" : "Tokopedia"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748B]">
                      <div className="line-clamp-1">{p.description}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemoveProduct(p.id)}
                        className="p-1 rounded-lg hover:bg-red-50 text-[#64748B] hover:text-red-500 transition-colors"
                        title="Hapus dari daftar"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
