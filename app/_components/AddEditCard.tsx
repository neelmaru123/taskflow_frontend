"use client";

import { useEffect, useRef, useState } from "react";
import AddLabel from "./AddLabel";
import {
  FiX,
  FiType,
  FiAlignLeft,
  FiCalendar,
  FiTag,
  FiCheck,
} from "react-icons/fi";
import toast from "react-hot-toast";
import type { Card } from "@/app/_services/types";
import { addCardLabel } from "../_services/card-label-service";

type Label = {
  id: string;
  name: string;
  color: string;
  userId: string;
};

type CardForm = {
  title: string;
  description?: string;
  dueDate?: string;
};

type CardInput = {
  listId: string;
  title: string;
  dueDate?: string;
  description?: string;
};

type AddCardProps = {
  onClose: () => void;
  onAdd?: (card: CardInput) => Promise<Card>;
  onEdit?: (id: string, card: Partial<Card>) => Promise<boolean>;
  listId?: string;
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  cardData?: Partial<Card>;
  isEdit?: boolean;
  labels?: Label[];
  setLabels?: React.Dispatch<React.SetStateAction<Label[]>>;
};

function AddEditCard({
  onClose,
  onAdd,
  listId,
  setCards,
  cardData,
  onEdit,
  isEdit,
  labels,
  setLabels,
}: AddCardProps) {
  const [form, setForm] = useState<CardForm>({
    title: "",
    description: "",
    dueDate: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit && cardData?.labels) {
      setSelectedLabelIds(cardData.labels.map((l) => l.id));
    } else {
      setSelectedLabelIds([]);
    }
  }, [isEdit, cardData]);

  useEffect(() => {
    if (isEdit && cardData) {
      setForm({
        title: cardData.title ?? "",
        description: cardData.description ?? "",
        dueDate: cardData.dueDate ?? "",
      });
    }
  }, [isEdit, cardData]);

  // Auto-focus title
  useEffect(() => {
    const t = setTimeout(() => titleRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  // Escape to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isSubmitting, onClose]);

  const toggleLabel = (labelId: string) => {
    setError(null);
    setSelectedLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId],
    );
  };

  async function handleSubmit(): Promise<void> {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    const today = new Date().toLocaleDateString("en-CA");
    if (form.dueDate && form.dueDate < today) {
      setError("Due date cannot be in the past");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        const res = await onEdit(cardData.id, { ...form });
        if (!res) {
          toast.error("Failed to update card");
          return;
        }
        setCards((prev) =>
          prev.map((card) =>
            card.id === cardData.id ? { ...card, ...form } : card,
          ),
        );
        await addCardLabel({ cardId: cardData.id, labelIds: selectedLabelIds });
      } else {
        const res = await onAdd({ listId, ...form });
        if (!res) {
          toast.error("Failed to create card");
          return;
        }
        setCards((prev) => [...prev, { listId, ...form, completed: false }]);
        await addCardLabel({ cardId: res.id, labelIds: selectedLabelIds });
      }
      onClose();
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* 
        Mobile: full bottom sheet with max-h and internal scroll
        Desktop: centered modal, max-w-md
      */}
      <div className="relative w-full md:max-w-md bg-slate-900 border border-slate-700/80 rounded-t-2xl md:rounded-2xl shadow-2xl shadow-black/60 flex flex-col max-h-[92dvh] md:max-h-[90vh]">
        {/* Drag handle — mobile */}
        <div className="flex justify-center pt-3 md:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Top accent */}
        <div className="h-0.5 bg-blue-600/60 w-full mt-3 md:mt-0 shrink-0" />

        {/* Header — fixed, doesn't scroll */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
          <h2 className="text-sm font-semibold text-slate-100">
            {isEdit ? "Edit Card" : "New Card"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-all disabled:opacity-40"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-2 space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              <FiType size={10} />
              Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleRef}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2.5 text-sm bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-600 rounded-xl outline-none focus:border-blue-500/60 transition-colors"
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                setError(null);
              }}
              value={form.title}
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              <FiAlignLeft size={10} />
              Description
            </label>
            <textarea
              placeholder="Add more context..."
              rows={3}
              value={form.description}
              className="w-full px-3 py-2.5 text-sm bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-600 rounded-xl outline-none focus:border-blue-500/60 transition-colors resize-none"
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              <FiCalendar size={10} />
              Due Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2.5 text-sm bg-slate-800 border border-slate-700 text-slate-400 rounded-xl outline-none focus:border-blue-500/60 transition-colors [color-scheme:dark]"
              value={form.dueDate}
              onChange={(e) => {
                setForm({ ...form, dueDate: e.target.value });
                setError(null);
              }}
            />
          </div>

          {/* Labels */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              <FiTag size={10} />
              Labels
            </label>
            {labels && labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {labels.map((label) => {
                  const isSelected = selectedLabelIds.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all active:scale-95 ${
                        isSelected
                          ? "ring-2 ring-white/40 opacity-100"
                          : "opacity-50 hover:opacity-80"
                      }`}
                      style={{ backgroundColor: label.color }}
                    >
                      {isSelected && <FiCheck size={10} />}
                      {label.name}
                    </button>
                  );
                })}
              </div>
            )}
            <AddLabel
              onAdd={(newLabel) => setLabels?.((prev) => [...prev, newLabel])}
            />
          </div>
        </div>

        {/* Footer actions — fixed at bottom, doesn't scroll */}
        <div className="px-5 pt-3 pb-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Card"
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 hover:border-slate-600 rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          {/* iOS safe area */}
          <div className="h-safe md:hidden" />
        </div>
      </div>
    </div>
  );
}

export default AddEditCard;
