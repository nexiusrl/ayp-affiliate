import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL tidak valid" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Format URL tidak valid" }, { status: 400 });
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "Protokol URL tidak didukung (hanya http/https)" },
        { status: 400 }
      );
    }

    const host = parsedUrl.hostname.toLowerCase();
    const isShopee = host === "shopee.co.id" || host.endsWith(".shopee.co.id") || host === "shope.ee";
    const isTokopedia =
      host === "tokopedia.com" || host.endsWith(".tokopedia.com") ||
      host === "tokopedia.net" || host.endsWith(".tokopedia.net");

    if (!isShopee && !isTokopedia) {
      return NextResponse.json(
        { error: "Hanya mendukung domain Shopee atau Tokopedia resmi" },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "id-ID,id;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let name = "";
    let price = 0;
    let image_url = "";

    if (isShopee) {
      // Shopee meta tags
      name =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text().split("|")[0] ||
        "";
      const priceText =
        $('meta[property="product:price:amount"]').attr("content") || "";
      price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
      image_url =
        $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content") ||
        "";
    } else if (isTokopedia) {
      // Tokopedia meta tags
      name =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text().split("|")[0] ||
        "";
      const priceText =
        $('meta[property="product:price:amount"]').attr("content") ||
        $('meta[name="twitter:data1"]').attr("content") ||
        "";
      price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
      image_url =
        $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content") ||
        "";
    }

    // Clean up name
    name = name
      .replace(/\s*\|\s*(Shopee|Tokopedia).*$/i, "")
      .replace(/\s*-\s*(Shopee|Tokopedia).*$/i, "")
      .trim();

    return NextResponse.json({ name, price, image_url });
  } catch (err) {
    console.error("Scrape error:", err);
    return NextResponse.json(
      {
        error:
          "Gagal mengambil data produk. Platform mungkin memblokir request. Gunakan mode manual.",
      },
      { status: 422 }
    );
  }
}
