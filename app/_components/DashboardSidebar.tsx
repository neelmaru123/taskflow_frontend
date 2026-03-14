"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useBoards } from "../_context/BoardContext";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { FiPlus, FiLayout, FiX, FiGrid, FiUsers } from "react-icons/fi";

type Board = {
  id: number | string;
  title: string | { title: string };
  userId: number;
};

type MemberBoard = {
  userId: string;
  boardId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  board: {
    title: string;
    id: string;
    userId: string;
  };
};

// ─── Shared board list used in both desktop & mobile ────────────────────────
function BoardList({
  boards,
  activeBoard,
  setActiveBoard,
  onSelect,
  memberBoards,
}: {
  boards: Board[];
  activeBoard: string | number | null;
  setActiveBoard: (id: string) => void;
  onSelect?: () => void;
  memberBoards?: MemberBoard[];
}) {
  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { createBoard } = useBoards();

  useEffect(() => {
    if (isAddBoardOpen) inputRef.current?.focus();
  }, [isAddBoardOpen]);

  async function handleAddBoard() {
    if (!title.trim()) {
      setIsAddBoardOpen(false);
      return;
    }
    await createBoard(title);
    setIsAddBoardOpen(false);
    setTitle("");
  }

  return (
    <ul className="flex-1 px-2 pb-4 space-y-0.5 overflow-y-auto">
      {/* ── My Boards section ── */}
      <li className="px-3 pt-3 pb-1">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          My Boards
        </p>
      </li>

      {boards.length === 0 && (
        <li className="px-3 py-4 text-xs text-slate-600 text-center">
          No boards yet. Create one below.
        </li>
      )}

      {boards.map((board: Board) => {
        const boardTitle =
          typeof board.title === "string" ? board.title : board.title.title;
        const isActive = String(activeBoard) === String(board.id);

        return (
          <li key={board.id}>
            <Link
              onClick={() => {
                setActiveBoard(String(board.id));
                onSelect?.();
              }}
              href="/dashboard/board"
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all active:scale-[0.98] ${
                isActive
                  ? "bg-slate-800 text-slate-100 font-medium"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <FiLayout
                size={14}
                className={
                  isActive
                    ? "text-blue-400 shrink-0"
                    : "text-slate-600 shrink-0"
                }
              />
              <span className="truncate flex-1">{boardTitle}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              )}
            </Link>
          </li>
        );
      })}

      {/* Add Board */}
      <li className="pt-1">
        {isAddBoardOpen ? (
          <div className="px-1">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddBoard();
                  if (e.key === "Escape") {
                    setIsAddBoardOpen(false);
                    setTitle("");
                  }
                }}
                placeholder="Board name"
                className="w-full px-3 py-2.5 pr-14 text-sm rounded-xl text-slate-200 bg-slate-800 border border-slate-700 outline-none focus:border-blue-500/60 transition-colors placeholder:text-slate-600"
              />
              <button
                onClick={handleAddBoard}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-400 p-1 transition-colors"
              >
                <AiOutlineCheck size={14} />
              </button>
              <button
                onClick={() => {
                  setIsAddBoardOpen(false);
                  setTitle("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 transition-colors"
              >
                <AiOutlineClose size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddBoardOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-slate-900 active:bg-slate-800 rounded-xl transition-all"
          >
            <FiPlus size={14} />
            New board
          </button>
        )}
      </li>

      {/* ── Member Boards section ── */}
      {memberBoards && memberBoards.length > 0 && (
        <>
          {/* Divider */}
          <li className="px-3 pt-4 pb-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-slate-800" />
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest shrink-0">
                Member of
              </p>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
          </li>

          {memberBoards.map((mb: MemberBoard) => {
            const isActive = String(activeBoard) === String(mb.board.id);
            return (
              <li key={mb.boardId}>
                <Link
                  onClick={() => {
                    setActiveBoard(String(mb.board.id));
                    onSelect?.();
                  }}
                  href="/dashboard/board"
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all active:scale-[0.98] ${
                    isActive
                      ? "bg-slate-800 text-slate-100 font-medium"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <FiUsers
                    size={14}
                    className={
                      isActive
                        ? "text-purple-400 shrink-0"
                        : "text-slate-600 shrink-0"
                    }
                  />
                  <span className="truncate flex-1">{mb.board.title}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                  )}
                </Link>
              </li>
            );
          })}
        </>
      )}
    </ul>
  );
}

// ─── Mobile bottom-tab trigger + drawer ─────────────────────────────────────
function MobileSidebar({
  boards,
  activeBoard,
  setActiveBoard,
  memberBoards,
}: {
  boards: Board[];
  activeBoard: string | number | null;
  setActiveBoard: (id: string) => void;
  memberBoards?: MemberBoard[];
}) {
  const [open, setOpen] = useState(false);

  const activeTitle = (() => {
    // Check owned boards first
    const owned = boards.find((b) => String(b.id) === String(activeBoard));
    if (owned)
      return typeof owned.title === "string" ? owned.title : owned.title.title;
    // Then check member boards
    const member = memberBoards?.find(
      (mb) => String(mb.board.id) === String(activeBoard),
    );
    if (member) return member.board.title;
    return "Boards";
  })();

  return (
    <>
      {/* Sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950 border-t border-slate-800 px-4 pb-safe pt-2 pb-3">
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium text-slate-200 active:bg-slate-700 transition-all"
        >
          <div className="flex items-center gap-2">
            <FiGrid size={14} className="text-blue-400" />
            <span className="truncate max-w-[180px]">{activeTitle}</span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
            Switch
          </span>
        </button>
      </div>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="relative bg-slate-900 border-t border-slate-700 rounded-t-2xl shadow-2xl shadow-black/60 max-h-[80vh] flex flex-col">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-700" />
            </div>

            {/* Sheet header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                My Boards
              </p>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
              >
                <FiX size={15} />
              </button>
            </div>

            {/* Board list inside sheet */}
            <div className="flex-1 overflow-y-auto pt-2">
              <BoardList
                boards={boards}
                activeBoard={activeBoard}
                setActiveBoard={setActiveBoard}
                memberBoards={memberBoards}
                onSelect={() => setOpen(false)}
              />
            </div>

            {/* Bottom safe area spacer */}
            <div className="h-safe shrink-0 pb-2" />
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
function DashboardSidebar() {
  const { boards, activeBoard, setActiveBoard, memberBoards } = useBoards();

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col w-60 min-h-screen bg-slate-950 border-r border-slate-800 shrink-0">
        <BoardList
          boards={boards}
          activeBoard={activeBoard}
          setActiveBoard={setActiveBoard}
          memberBoards={memberBoards}
        />
      </div>

      {/* Mobile bottom bar + drawer */}
      <MobileSidebar
        boards={boards}
        activeBoard={activeBoard}
        setActiveBoard={setActiveBoard}
        memberBoards={memberBoards}
      />
    </>
  );
}

export default DashboardSidebar;
