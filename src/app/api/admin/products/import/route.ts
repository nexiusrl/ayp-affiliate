import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { products } = body;

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: "Payload harus memiliki array 'products'" },
        { status: 400 }
      );
    }

    if (products.length === 0) {
      return NextResponse.json(
        { error: "Array 'products' tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Validate each product
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (!p.name || !p.affiliate_url || !p.platform) {
        return NextResponse.json(
          { error: `Produk ke-${i + 1} tidak memiliki field name, affiliate_url, atau platform` },
          { status: 400 }
        );
      }
      if (p.platform !== "shopee" && p.platform !== "tokopedia") {
        return NextResponse.json(
          { error: `Produk ke-${i + 1} memiliki platform tidak valid: '${p.platform}'` },
          { status: 400 }
        );
      }
    }

    const importedProducts = [];
    // Insert products sequentially
    for (const p of products) {
      const created = await db.createProduct({
        name: p.name,
        description: p.description || null,
        price: p.price || 0,
        image_url: p.image_url || "",
        affiliate_url: p.affiliate_url,
        platform: p.platform,
        category_id: p.category_id || null,
        is_active: p.is_active ?? true,
      });
      importedProducts.push(created);
    }

    return NextResponse.json(
      {
        success: true,
        count: importedProducts.length,
        products: importedProducts,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengimpor produk" },
      { status: 500 }
    );
  }
}
