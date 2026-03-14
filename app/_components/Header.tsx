"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { useBoards } from "../_context/BoardContext";
import { FiLogOut, FiLogIn, FiUserPlus } from "react-icons/fi";

function Header() {
  const { user, logoutUser } = useBoards();

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center py-2 px-4 md:px-12 h-14 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-black leading-none">T</span>
        </div>
        <span className="text-sm font-bold text-slate-100 tracking-tight">
          TaskFlow
        </span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {user === null ? (
          <>
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-all min-h-[36px]"
            >
              <FiLogIn size={14} />
              <span>Login</span>
            </Link>
            <Link
              href="/signUp"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg transition-colors min-h-[36px]"
            >
              <FiUserPlus size={14} />
              <span>Sign Up</span>
            </Link>
          </>
        ) : (
          <button
            onClick={async () => {
              await logoutUser();
              toast.success("Logged out");
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-all border border-transparent hover:border-slate-700 min-h-[36px]"
          >
            <FiLogOut size={14} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
}

export default Header;
