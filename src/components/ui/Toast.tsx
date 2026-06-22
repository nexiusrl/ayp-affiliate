"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle, XCircle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 3000);
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string) => toast(message, "success"),
    [toast]
  );
  const error = useCallback(
    (message: string) => toast(message, "error"),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      {/* Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm pointer-events-auto",
              "animate-in slide-in-from-right-5 fade-in duration-300",
              t.type === "success" && "bg-white border border-green-200 text-green-800",
              t.type === "error" && "bg-white border border-red-200 text-red-700",
              t.type === "info" && "bg-white border border-[#E2E8F0] text-[#0F172A]"
            )}
          >
            {t.type === "success" && (
              <CheckCircle size={16} className="text-green-500 shrink-0" />
            )}
            {t.type === "error" && (
              <XCircle size={16} className="text-red-500 shrink-0" />
            )}
            {t.type === "info" && (
              <Info size={16} className="text-blue-500 shrink-0" />
            )}
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-current opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Tutup notifikasi"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
