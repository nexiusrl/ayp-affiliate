import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const data = await db.getProducts({ includeInactive: true });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, image_url, affiliate_url, platform, category_id, description, is_active } = body;

    if (!name || !affiliate_url || !platform) {
      return NextResponse.json(
        { error: "Field name, affiliate_url, dan platform wajib diisi" },
        { status: 400 }
      );
    }

    const data = await db.createProduct({
      name,
      price: price || 0,
      image_url: image_url || "",
      affiliate_url,
      platform,
      category_id: category_id || null,
      description: description || null,
      is_active: is_active ?? true,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid request" }, { status: 400 });
  }
}
