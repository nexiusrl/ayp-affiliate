"use client";

import { useState } from "react";
import { Menu, ShoppingBag } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row relative">
      {/* Mobile Top Header */}
      <header className="md:hidden h-14 bg-white border-b border-[#E2E8F0] px-4 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2 text-[#0F172A]">
          <ShoppingBag size={18} className="text-[#2563EB]" />
          <div>
            <p className="text-xs font-bold leading-tight">AYP Affiliate</p>
            <p className="text-[9px] text-[#64748B]">Admin Panel</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -mr-2 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-[#F8FAFC] transition-colors"
          title="Buka Menu"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Sidebar Overlay Backdrop on Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 md:sticky md:top-0 md:h-screen md:block md:translate-x-0 transition-transform duration-300 ease-in-out shrink-0 bg-white shadow-lg md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar onClose={() => setIsOpen(false)} />
      </div>

      {/* Main Panel Content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
