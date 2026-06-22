"use client";

import { useState } from "react";
import { Wand2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ScrapeResult {
  name: string;
  price: number;
  image_url: string;
  affiliate_url: string;
}

interface ScrapeInputProps {
  onSuccess: (data: ScrapeResult) => void;
}

export function ScrapeInput({ onSuccess }: ScrapeInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScrape = async () => {
    if (!url.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal scraping. Coba input manual.");
        return;
      }

      onSuccess({ ...data, affiliate_url: url.trim() });
    } catch {
      setError("Gagal menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScrape()}
            placeholder="https://shopee.co.id/product-name..."
            type="url"
          />
        </div>
        <Button
          type="button"
          onClick={handleScrape}
          loading={loading}
          disabled={!url.trim()}
          className="shrink-0"
        >
          <Wand2 size={15} />
          Scrape
        </Button>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
          ⚠️ {error}
        </p>
      )}

      <p className="text-xs text-[#64748B] flex items-center gap-1">
        <ExternalLink size={12} />
        Paste link affiliate dari Shopee atau Tokopedia
      </p>
    </div>
  );
}
