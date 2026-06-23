import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface ClickRouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: ClickRouteProps) {
  try {
    const { id } = await params;
    
    // 1. Increment click count asynchronously (we don't block the redirect for this)
    db.incrementClickCount(id).catch((err) => {
      console.error(`Failed to increment click count for product ${id}:`, err);
    });

    // 2. Fetch the product to get the target affiliate URL
    const product = await db.getProductById(id);
    
    if (!product || !product.affiliate_url) {
      // Fallback redirect to homepage if product is not found
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 3. Redirect the user to the affiliate link
    return NextResponse.redirect(product.affiliate_url);
  } catch (error) {
    console.error("Error in product click redirect route:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
