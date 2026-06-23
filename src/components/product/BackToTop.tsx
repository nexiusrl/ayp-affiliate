"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#2563EB] text-white shadow-lg cursor-pointer hover:bg-[#1D4ED8] hover:-translate-y-0.5 active:scale-[0.95] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2",
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-75 pointer-events-none"
      )}
      aria-label="Kembali ke atas"
    >
      <ArrowUp size={20} />
    </button>
  );
}
