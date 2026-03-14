import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { BoardProvider } from "./_context/BoardContext";

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-900 h-screen">
        <BoardProvider> {children}</BoardProvider>
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,

            // ── Base style (all toasts) ──────────────────────────────────────
            style: {
              background: "#0f172a", // slate-900
              color: "#e2e8f0", // slate-200
              border: "1px solid rgba(51, 65, 85, 0.8)", // slate-700/80
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "500",
              padding: "10px 14px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              maxWidth: "360px",
            },

            // ── Success ──────────────────────────────────────────────────────
            success: {
              iconTheme: {
                primary: "#22c55e", // green-500
                secondary: "#0f172a", // slate-900
              },
              style: {
                background: "#0f172a",
                color: "#e2e8f0",
                border: "1px solid rgba(34, 197, 94, 0.25)", // green-500/25
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: "500",
                padding: "10px 14px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              },
            },

            // ── Error ────────────────────────────────────────────────────────
            error: {
              iconTheme: {
                primary: "#ef4444", // red-500
                secondary: "#0f172a", // slate-900
              },
              style: {
                background: "#0f172a",
                color: "#e2e8f0",
                border: "1px solid rgba(239, 68, 68, 0.25)", // red-500/25
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: "500",
                padding: "10px 14px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              },
            },

            // ── Loading ──────────────────────────────────────────────────────
            loading: {
              iconTheme: {
                primary: "#3b82f6", // blue-500
                secondary: "#0f172a", // slate-900
              },
              style: {
                background: "#0f172a",
                color: "#94a3b8", // slate-400
                border: "1px solid rgba(59, 130, 246, 0.25)", // blue-500/25
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: "500",
                padding: "10px 14px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
