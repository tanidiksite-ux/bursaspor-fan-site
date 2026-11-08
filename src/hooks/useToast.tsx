"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info" | "warning"
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, type: Toast["type"]) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>()(
  persist(
    (set) => ({
      toasts: [],
      addToast: (message, type) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
        setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
        }, 4000)
      },
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    }),
    { name: "toast-storage" }
  )
)

export function useToast() {
  const { toasts, addToast, removeToast } = useToastStore()
  return {
    toasts,
    toast: addToast,
    dismiss: removeToast,
    success: (message: string) => addToast(message, "success"),
    error: (message: string) => addToast(message, "error"),
    info: (message: string) => addToast(message, "info"),
    warning: (message: string) => addToast(message, "warning"),
  }
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[280px] max-w-md
            animate-slide-in
            ${toast.type === "success" && "bg-green-600 text-white"}
            ${toast.type === "error" && "bg-red-600 text-white"}
            ${toast.type === "info" && "bg-blue-600 text-white"}
            ${toast.type === "warning" && "bg-yellow-600 text-white"}
          `}
        >
          <div className="flex-1">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}