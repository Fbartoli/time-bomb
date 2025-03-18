"use client"

import { Toaster } from "sonner"

export function ToastProvider() {
  return (
    <Toaster
      theme="dark"
      position="top-right"
      toastOptions={{
        style: {
          background: "linear-gradient(to right, #FF4000, #FD9D00)",
          color: "white",
          border: "none",
        },
        className: "rounded-xl shadow-lg shadow-[#FF4000]/20",
      }}
    />
  )
} 