"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, Tag, LogOut, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/categories", label: "Kategori", icon: Tag },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-[#E2E8F0] min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2 text-[#0F172A]">
          <ShoppingBag size={18} className="text-[#2563EB]" />
          <div>
            <p className="text-sm font-semibold">AYP Affiliate</p>
            <p className="text-[10px] text-[#64748B]">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[#E2E8F0]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-colors duration-150 w-full"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
