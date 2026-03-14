import { useCallback, useEffect, useRef, useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { Droppable } from "react-beautiful-dnd";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import toast from "react-hot-toast";

import AddEditCard from "./AddEditCard";
import ConfrimDelete from "./ConfrimDelete";
import DisplayCard from "./DisplayCard";
import { deleteList, updateList } from "../_services/list-service";
import { createCard } from "../_services/cards-service";
import type { Card } from "@/app/_services/types";
import { getLabelsByUser, Label } from "../_services/labels-service";
import { useBoards } from "../_context/BoardContext";
import { CardSkeleton, InlineError } from "./skeleton";
import { StrictModeDroppable } from "./StrictModeDroppable";

type List = { id: string; name: string; boardId: string };
type LabelLoadState = "loading" | "error" | "ready";

type DisplayListProps = {
  list: List;
  setLists: React.Dispatch<React.SetStateAction<List[]>>;
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  editingListId: string | null;
  setEditingListId: (id: string | null) => void;
};

function DisplayList({
  list,
  setLists,
  cards,
  setCards,
  setEditingListId,
  editingListId,
}: DisplayListProps) {
  const isEditListOpen = editingListId === list.id;
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(list.name);
  const [displayAddCard, setDisplayAddCard] = useState(false);
  const [displayConfrimDelete, setDisplayConfrimDelete] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);
  const [labelState, setLabelState] = useState<LabelLoadState>("loading");
  const { user } = useBoards();

  const completedCount = cards.filter((c) => c.completed).length;
  const totalCount = cards.length;

  async function fetchLabels() {
    setLabelState("loading");
    try {
      const data = await getLabelsByUser(user.id);
      setLabels(data);
      setLabelState("ready");
    } catch (err) {
      console.error("Error fetching labels:", err);
      setLabelState("error");
    }
  }

  useEffect(() => {
    fetchLabels();
  }, []);
  useEffect(() => {
    if (isEditListOpen) inputRef.current?.focus();
  }, [isEditListOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isEditListOpen &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setEditingListId(null);
        setTitle(list.name);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [list.name]);

  async function handleDeleteList() {
    const res = await deleteList(list.id);
    if (!res) {
      toast.error("Failed to delete list");
      return;
    }
    setLists((prev) => prev.filter((l) => l.id !== list.id));
    toast.success("List deleted");
  }

  async function handleEditList() {
    if (!title.trim()) {
      setEditingListId(null);
      setTitle(list.name);
      return;
    }
    const res = await updateList(list.id, {
      name: title,
      boardId: list.boardId,
    });
    if (!res) {
      toast.error("Failed to update list");
      return;
    }
    setLists((prev) =>
      prev.map((l) => (l.id === list.id ? { ...l, name: title } : l)),
    );
    setEditingListId(null);
  }

  const handleDisplayAddCard = useCallback(() => setDisplayAddCard(false), []);

  return (
    <>
      <div className="w-[320px] md:w-72 shrink-0 flex flex-col bg-slate-800 rounded-xl border border-slate-700/60 max-h-[calc(100dvh-220px)] md:max-h-[calc(100vh-200px)]">
        {/* Header */}
        <div className="px-3.5 pt-3.5 pb-2.5 flex-shrink-0">
          <div className="flex items-center justify-between gap-2 group">
            {isEditListOpen ? (
              <div
                ref={wrapperRef}
                className="flex items-center gap-1.5 flex-1 min-w-0"
              >
                <input
                  ref={inputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditList();
                    if (e.key === "Escape") setEditingListId(null);
                  }}
                  className="flex-1 min-w-0 text-sm font-semibold bg-transparent border-b-2 border-blue-500 text-slate-100 outline-none pb-0.5"
                />
                <button
                  onClick={handleEditList}
                  className="p-1 text-green-400 hover:text-green-300 transition-colors shrink-0"
                >
                  <AiOutlineCheck size={14} />
                </button>
                <button
                  onClick={() => setEditingListId(null)}
                  className="p-1 text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                >
                  <AiOutlineClose size={14} />
                </button>
              </div>
            ) : (
              <h2 className="text-sm font-semibold text-slate-200 truncate flex-1">
                {list.name}
              </h2>
            )}

            {!isEditListOpen && (
              <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingListId(list.id)}
                  className="p-1.5 text-slate-500 hover:text-slate-200 rounded-md hover:bg-slate-700 active:bg-slate-600 transition-all"
                  title="Rename"
                >
                  <FiEdit2 size={12} />
                </button>
                <button
                  onClick={() => setDisplayConfrimDelete(true)}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-md hover:bg-slate-700 active:bg-slate-600 transition-all"
                  title="Delete"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-0.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500/70 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-medium tabular-nums shrink-0">
                {completedCount}/{totalCount}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-3.5 border-t border-slate-700/60" />

        {/* Cards */}
        <StrictModeDroppable droppableId={String(list.id)} type="CARD">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 overflow-y-auto px-3 py-3 space-y-2 transition-colors duration-150 ${
                snapshot.isDraggingOver ? "bg-blue-500/5" : ""
              }`}
              style={{ minHeight: 8 }}
            >
              {/* Label loading state — show card skeletons */}
              {labelState === "loading" && cards.length === 0 && (
                <>
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </>
              )}

              {/* Label error state */}
              {labelState === "error" && (
                <InlineError
                  message="Failed to load labels"
                  onRetry={fetchLabels}
                />
              )}

              {/* Empty state */}
              {cards.length === 0 &&
                labelState === "ready" &&
                !snapshot.isDraggingOver && (
                  <p className="text-xs text-slate-600 text-center py-4">
                    No cards yet
                  </p>
                )}

              {cards.map((card, index) => (
                <DisplayCard
                  key={card.id}
                  card={card}
                  index={index}
                  setCards={setCards}
                  allLabels={labels}
                  setAllLabels={setLabels}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </StrictModeDroppable>

        {/* Add card footer */}
        <div className="px-3 pb-3 flex-shrink-0">
          <button
            className="w-full flex items-center gap-2 px-2.5 py-2.5 text-xs font-medium text-slate-500 hover:text-slate-200 hover:bg-slate-700/60 active:bg-slate-700 rounded-lg transition-all border border-transparent hover:border-slate-600/50"
            onClick={() => setDisplayAddCard(true)}
          >
            <FiPlus size={13} />
            Add a card
          </button>
        </div>
      </div>

      {displayConfrimDelete && (
        <ConfrimDelete
          onClose={() => setDisplayConfrimDelete(false)}
          label="List"
          DeleteFn={async () => await handleDeleteList()}
        />
      )}

      {displayAddCard && (
        <AddEditCard
          listId={list.id}
          onClose={handleDisplayAddCard}
          onAdd={createCard}
          setCards={setCards}
          labels={labels}
          setLabels={setLabels}
        />
      )}
    </>
  );
}

export default DisplayList;
