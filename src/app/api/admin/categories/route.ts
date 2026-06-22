import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const data = await db.getCategories();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, slug } = await request.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name dan slug wajib diisi" },
        { status: 400 }
      );
    }

    const data = await db.createCategory({ name, slug });
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    if (error?.message === "DUPLICATE_SLUG") {
      return NextResponse.json(
        { error: "Kategori dengan slug ini sudah ada" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
