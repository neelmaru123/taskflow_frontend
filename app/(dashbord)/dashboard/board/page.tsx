"use client";

import DisplayList from "@/app/_components/DisplayList";
import { createList, getListsByBoardId } from "@/app/_services/list-service";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { DragDropContext } from "react-beautiful-dnd";
import type { DropResult } from "react-beautiful-dnd";
import { getCardsByBoard, moveCard } from "@/app/_services/cards-service";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { useBoards } from "@/app/_context/BoardContext";
import { FiEdit2, FiTrash2, FiPlus, FiLayout, FiUsers } from "react-icons/fi";
import ConfrimDelete from "@/app/_components/ConfrimDelete";
import type { Card } from "@/app/_services/types";
import { BoardSkeleton, DashboardError } from "@/app/_components/skeleton";
import { BoardMembers } from "@/app/_components/Boardmembers";

import {
  fetchBoardMembers,
  searchUserByEmail,
  addBoardMember,
  removeBoardMember,
} from "@/app/_services/member-service";

type List = { id: string; boardId: string; name: string };
type LoadState = "idle" | "loading" | "error" | "ready";

export default function BoardPage() {
  const { boards, updateBoardTitle, activeBoard, deleteBoard, user } =
    useBoards();
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [isAddListOpen, setIsAddListOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [boardTitle, setBoardTitle] = useState("");
  const [isEditBoardTitle, setIsEditBoardTitle] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [displayConfrimDelete, setDisplayConfrimDelete] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boardTitleRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── Derive whether the current user owns this board ──────────────────────
  const activeBoardData = boards.find((b) => b.id === String(activeBoard));
  const isOwner = activeBoardData
    ? String(activeBoardData.userId) === String(user?.id)
    : false;

  useEffect(() => {
    setBoardTitle(activeBoardData?.title ?? "");
  }, [boards, activeBoard]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isEditBoardTitle &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsEditBoardTitle(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditBoardTitle]);

  async function fetchData() {
    if (!activeBoard) return;
    setLoadState("loading");
    try {
      const [listData, cardData] = await Promise.all([
        getListsByBoardId(String(activeBoard)),
        getCardsByBoard(String(activeBoard)),
      ]);
      setLists(listData || []);
      setCards(cardData || []);
      setLoadState("ready");
    } catch {
      setLoadState("error");
      toast.error("Failed to load board data");
    }
  }

  useEffect(() => {
    fetchData();
  }, [activeBoard]);
  useEffect(() => {
    if (isAddListOpen) inputRef.current?.focus();
  }, [isAddListOpen]);
  useEffect(() => {
    if (isEditBoardTitle) boardTitleRef.current?.focus();
  }, [isEditBoardTitle]);

  async function handleAddList() {
    if (!title.trim()) {
      setIsAddListOpen(false);
      setTitle("");
      return;
    }
    const list = await createList(String(activeBoard), title);
    if (!list) {
      toast.error("Failed to create list");
      return;
    }
    setLists((prev) => [...prev, list]);
    setTitle("");
    setIsAddListOpen(false);
    toast.success("List created");
  }

  function handleEditBoardTitle() {
    if (!boardTitle.trim()) return;
    updateBoardTitle(String(activeBoard), boardTitle);
    setIsEditBoardTitle(false);
  }

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    setCards((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((c) => String(c.id) === draggableId);
      if (index === -1) return prev;
      const movedCard = { ...updated[index], listId: destination.droppableId };
      updated.splice(index, 1);
      updated.splice(destination.index, 0, movedCard);
      return updated;
    });

    try {
      await moveCard(draggableId, destination.droppableId);
      toast.success("Card moved");
    } catch {
      toast.error("Failed to save position");
      const freshCards = await getCardsByBoard(activeBoard);
      setCards(freshCards);
    }
  }

  async function handleDeleteBoard() {
    setDisplayConfrimDelete(false);
    await deleteBoard(String(activeBoard));
  }

  const totalCards = cards.length;
  const completedCards = cards.filter((c) => c.completed).length;

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!activeBoard) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6 pb-20 md:pb-0">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
          <FiLayout className="text-slate-500" size={24} />
        </div>
        <div>
          <p className="text-slate-300 font-semibold text-base mb-1.5">
            No board selected
          </p>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
            Tap <span className="text-slate-400 font-medium">"Switch"</span> at
            the bottom to open a board, or create a new one.
          </p>
        </div>
      </div>
    );
  }

  if (loadState === "loading") return <BoardSkeleton listCount={3} />;
  if (loadState === "error")
    return (
      <DashboardError
        message="We couldn't load your board. Check your connection and try again."
        onRetry={fetchData}
      />
    );

  return (
    <div className="h-full flex flex-col overflow-hidden pb-[72px] md:pb-0">
      {/* ── Board header ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 md:px-10 pt-5 md:pt-8 pb-4 border-b border-slate-700/60">
        <div className="flex items-start justify-between gap-3">
          {/* Title + meta */}
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            {isEditBoardTitle ? (
              <div ref={wrapperRef} className="flex items-center gap-2">
                <input
                  ref={boardTitleRef}
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditBoardTitle();
                    if (e.key === "Escape") setIsEditBoardTitle(false);
                  }}
                  className="text-xl md:text-2xl font-bold bg-transparent border-b-2 border-blue-500 text-slate-100 outline-none pb-0.5 w-full max-w-xs placeholder:text-slate-600 tracking-tight"
                  placeholder="Board title"
                />
                <button
                  onClick={handleEditBoardTitle}
                  className="p-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors shrink-0"
                >
                  <AiOutlineCheck size={15} />
                </button>
                <button
                  onClick={() => setIsEditBoardTitle(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors shrink-0"
                >
                  <AiOutlineClose size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight leading-tight truncate">
                  {boardTitle || "Untitled Board"}
                </h1>
                {/* Badge shown to members who don't own the board */}
                {!isOwner && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-semibold uppercase tracking-wider">
                    <FiUsers size={9} />
                    Member
                  </span>
                )}
              </div>
            )}

            {!isEditBoardTitle && (
              <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
                <span>
                  {lists.length} {lists.length === 1 ? "list" : "lists"}
                </span>
                {totalCards > 0 && (
                  <>
                    <span className="text-slate-700">·</span>
                    <span>
                      {completedCards}/{totalCards} done
                    </span>
                    <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${(completedCards / totalCards) * 100}%`,
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action buttons — layout differs for owner vs member */}
          {!isEditBoardTitle && (
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              {/* Members button — visible to everyone */}
              <button
                onClick={() => setShowMembers(true)}
                className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-all"
                title={isOwner ? "Manage members" : "View members"}
              >
                <FiUsers size={13} />
                <span className="hidden sm:inline">
                  {isOwner ? "Members" : "Members"}
                </span>
              </button>

              {/* Rename + Delete — owner only */}
              {isOwner && (
                <>
                  <div className="w-px h-4 bg-slate-700 mx-0.5" />
                  <button
                    onClick={() => {
                      setIsEditBoardTitle(true);
                      setEditingListId(null);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-all"
                    title="Rename board"
                  >
                    <FiEdit2 size={13} />
                    <span className="hidden sm:inline">Rename</span>
                  </button>
                  <button
                    onClick={() => setDisplayConfrimDelete(true)}
                    className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/5 active:bg-red-500/10 rounded-lg transition-all"
                    title="Delete board"
                  >
                    <FiTrash2 size={13} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Lists ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <div className="h-full px-4 md:px-10 py-4 md:py-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div
              className="md:flex-row md:flex flex flex-col items-center md:items-start md:gap-3 gap-5 h-full"
              style={{ width: "max-content", minWidth: "100%" }}
            >
              {lists.map((list) => (
                <DisplayList
                  key={list.id}
                  list={list}
                  cards={cards.filter((c) => String(c.listId) === list.id)}
                  setLists={setLists}
                  setCards={setCards}
                  editingListId={editingListId}
                  setEditingListId={setEditingListId}
                />
              ))}

              {isAddListOpen ? (
                <div className="w-[280px] md:w-72 shrink-0 bg-slate-800 border border-slate-700 rounded-xl p-3.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-0.5">
                    New List
                  </p>
                  <input
                    ref={inputRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddList();
                      if (e.key === "Escape") {
                        setIsAddListOpen(false);
                        setTitle("");
                      }
                    }}
                    placeholder="e.g. To Do, In Progress, Done"
                    className="w-full bg-slate-700/50 text-sm text-slate-200 placeholder:text-slate-500 outline-none rounded-lg px-3 py-2.5 mb-3 border border-transparent focus:border-blue-500/60 transition-colors"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddList}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Add list
                    </button>
                    <button
                      onClick={() => {
                        setIsAddListOpen(false);
                        setTitle("");
                      }}
                      className="px-3 py-2 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddListOpen(true)}
                  className="w-[320px] md:w-72 shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-800/50 border-2 border-dashed border-slate-700 text-slate-500 text-sm font-medium hover:border-slate-500 hover:text-slate-300 hover:bg-slate-800 active:bg-slate-800 transition-all"
                >
                  <FiPlus size={16} />
                  Add another list
                </button>
              )}
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {displayConfrimDelete && (
        <ConfrimDelete
          onClose={() => setDisplayConfrimDelete(false)}
          label="Board"
          DeleteFn={() => handleDeleteBoard()}
        />
      )}

      {showMembers && (
        <BoardMembers
          boardId={String(activeBoard)}
          boardTitle={boardTitle}
          currentUserId={String(user?.id)}
          onClose={() => setShowMembers(false)}
          fetchMembers={fetchBoardMembers}
          searchUserByEmail={searchUserByEmail}
          addMember={addBoardMember}
          removeMember={removeBoardMember}
          isOwner={isOwner}
        />
      )}
    </div>
  );
}
