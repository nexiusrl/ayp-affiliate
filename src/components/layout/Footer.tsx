import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";

export async function Footer() {
  const categories = await db.getCategories();

  return (
    <footer className="bg-white border-t border-[#E2E8F0] mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2 text-[#0F172A]">
            <Image
              src="/logo.png"
              alt="Logo AYP Affiliate"
              width={20}
              height={20}
              className="w-5 h-5 object-contain"
            />
            <span className="font-semibold text-sm">AYP Affiliate</span>
          </div>

          {/* Category Links */}
          {categories && categories.length > 0 && (
            <nav className="flex flex-wrap gap-x-4 gap-y-2">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/kategori/${cat.slug}`}
                  className="text-xs text-[#64748B] hover:text-[#2563EB] transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
          <p className="text-xs text-[#64748B] text-center">
            © {new Date().getFullYear()} AYP Affiliate. Semua produk adalah link affiliate.
          </p>
        </div>
      </div>
    </footer>
  );
}
