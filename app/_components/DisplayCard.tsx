"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  completeTask,
  deleteCard,
  updateCard,
} from "../_services/cards-service";
import { Draggable } from "react-beautiful-dnd";
import ConfrimDelete from "./ConfrimDelete";
import type { Card } from "@/app/_services/types";
import AddEditCard from "./AddEditCard";
import { getLabels } from "../_services/card-label-service";

type DisplayCardProps = {
  card: Card;
  index: number;
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  allLabels: Label[];
  setAllLabels: React.Dispatch<React.SetStateAction<Label[]>>;
};

type Label = {
  id: string;
  name: string;
  color: string;
  userId: string;
};

function DisplayCard({
  card,
  index,
  setCards,
  allLabels,
  setAllLabels,
}: DisplayCardProps) {
  const [displayAddCard, setDisplayAddCard] = useState(false);
  const [displayConfrimDelete, setDisplayConfrimDelete] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    async function fetchLabel() {
      try {
        const data = await getLabels(card.id);
        setLabels(data);
      } catch (err) {
        toast.error(err.message);
      }
    }
    fetchLabel();
  }, []);

  async function handleCheckBox(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.checked;

    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, completed: newValue } : c)),
    );

    try {
      const res = await completeTask(card.id, { completed: newValue });
      if (!res) throw new Error();
    } catch (err) {
      toast.error("Something went wrong");
      // Rollback on error
      setCards((prev) =>
        prev.map((c) =>
          c.id === card.id ? { ...c, completed: !newValue } : c,
        ),
      );
    }
  }

  async function handleDeleteCard() {
    try {
      await deleteCard(card.id);
      setCards((prev) => prev.filter((c) => c.id !== card.id));
      toast.success("Card deleted");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <Draggable draggableId={String(card.id)} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`
              relative group flex flex-col gap-2 px-3 py-2.5 rounded-xl text-sm
              border transition-all duration-150 cursor-grab active:cursor-grabbing select-none
              ${
                snapshot.isDragging
                  ? "bg-slate-600 border-slate-500 shadow-xl shadow-black/30 scale-[1.02] rotate-1"
                  : card.completed
                    ? "bg-slate-800/50 border-slate-700/40 hover:border-slate-600"
                    : "bg-slate-700/80 border-slate-600/50 hover:border-slate-500 hover:bg-slate-700"
              }
            `}
          >
            {/* Label strips */}
            {labels?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {labels.map((label, idx) => (
                  <span
                    key={idx}
                    title={label?.label?.name}
                    className="h-1.5 w-8 rounded-full opacity-90"
                    style={{ backgroundColor: label?.label?.color }}
                  />
                ))}
              </div>
            )}

            {/* Content row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                {/* Checkbox — always visible on mobile for easy tap, hover-reveal on desktop */}
                <input
                  type="checkbox"
                  checked={card.completed}
                  onChange={handleCheckBox}
                  title={card.completed ? "Mark incomplete" : "Mark complete"}
                  className={`
                    mt-0.5 shrink-0 w-4 h-4 rounded accent-blue-500 cursor-pointer
                    transition-opacity duration-150
                    opacity-100 md:opacity-0 md:group-hover:opacity-70
                    ${card.completed ? "md:opacity-100" : ""}
                  `}
                />
                <p
                  className={`text-sm leading-snug break-words flex-1 min-w-0 transition-colors ${
                    card.completed
                      ? "line-through text-slate-500"
                      : "text-slate-200"
                  }`}
                >
                  {typeof card.title === "string"
                    ? card.title
                    : String(card.title) || "Untitled"}
                </p>
              </div>

              {/* Actions — always visible on mobile, hover on desktop */}
              <div className="flex items-center gap-0.5 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDisplayAddCard(true);
                  }}
                  title="Edit card"
                  className="p-1.5 text-slate-400 hover:text-slate-100 active:text-slate-100 rounded hover:bg-slate-600 active:bg-slate-600 transition-all"
                >
                  <FiEdit2 size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDisplayConfrimDelete(true);
                  }}
                  title="Delete card"
                  className="p-1.5 text-slate-400 hover:text-red-400 active:text-red-400 rounded hover:bg-slate-600 active:bg-slate-600 transition-all"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      {displayAddCard && (
        <AddEditCard
          onClose={() => setDisplayAddCard(false)}
          onEdit={updateCard}
          setCards={setCards}
          isEdit
          cardData={card}
          labels={allLabels}
          setLabels={setAllLabels}
        />
      )}

      {displayConfrimDelete && (
        <ConfrimDelete
          onClose={() => setDisplayConfrimDelete(false)}
          label="Card"
          DeleteFn={() => handleDeleteCard()}
        />
      )}
    </>
  );
}

export default DisplayCard;
