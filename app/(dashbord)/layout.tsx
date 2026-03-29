"use client";

import DashboardHeader from "@/app/_components/DashboardHeader";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import "../globals.css";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useBoards } from "../_context/BoardContext";

type DashboardLayoutProps = {
  children: ReactNode;
};

function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, loading } = useBoards();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  // Show nothing while auth state is being resolved
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard shell while redirecting unauthenticated user
  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Navbar */}
      <header className="h-16 shrink-0">
        <DashboardHeader />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="h-full bg-slate-950 border-r border-slate-800 overflow-hidden flex flex-col">
          <DashboardSidebar />
        </aside>

        <main className="flex-1 bg-slate-900 no-scrollbar min-h-0 overflow-auto scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
