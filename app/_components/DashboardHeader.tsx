"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut, FiX } from "react-icons/fi";
import { useBoards } from "../_context/BoardContext";

function DashboardHeader() {
  const { user, logoutUser } = useBoards();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

  async function handleLogout() {
    await logoutUser();
    router.replace("/landing-page");
    toast.success("Logged out");
    setMobileMenuOpen(false);
  }

  return (
    <>
      <nav className="flex justify-between items-center px-4 md:px-6 h-14 bg-slate-950/90 backdrop-blur-md z-50 border-b border-slate-800 shrink-0 sticky top-0">
        {/* Logo */}
        <Link href="/landing-page" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black leading-none">
              T
            </span>
          </div>
          <span className="text-sm font-bold text-slate-100 tracking-tight">
            TaskFlow
          </span>
        </Link>

        {user?.username && (
          <p className="text-xs text-slate-500 font-medium">
            <span className="text-slate-400">{user.username}</span>&apos;s
            workspace
          </p>
        )}

        {/* Desktop — workspace + actions */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-white leading-none">
                {initials}
              </span>
            </div>
            <span className="text-xs font-medium text-slate-300">
              {user?.username}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-700"
          >
            <FiLogOut size={13} />
            Logout
          </button>
        </div>

        {/* Mobile — avatar + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white leading-none">
              {initials}
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-all"
            aria-label="Open menu"
          >
            <FiMenu size={18} />
          </button>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Panel — slides from top */}
          <div className="absolute top-0 left-0 right-0 bg-slate-900 border-b border-slate-700 shadow-xl shadow-black/40 rounded-b-2xl overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-white leading-none">
                    {initials}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {user?.username}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Personal Workspace
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-all"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Menu items */}
            <div className="p-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 active:bg-red-500/20 rounded-xl transition-all"
              >
                <FiLogOut size={16} />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardHeader;
