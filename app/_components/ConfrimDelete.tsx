"use client";

import { useEffect, useState } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

type ConfirmDeleteProps = {
  onClose: () => void;
  DeleteFn: () => void;
  label: string;
};

function ConfrimDelete({ onClose, label, DeleteFn }: ConfirmDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isDeleting) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isDeleting, onClose]);

  const handleInternalDelete = async () => {
    setIsDeleting(true);
    await DeleteFn();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!isDeleting ? onClose : undefined}
      />

      {/* Sheet on mobile / centered modal on desktop */}
      <div className="relative w-full md:max-w-sm bg-slate-900 border border-slate-700/80 rounded-t-2xl md:rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 md:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Top accent bar */}
        <div className="h-0.5 bg-red-500/60 w-full mt-3 md:mt-0" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <FiAlertTriangle size={16} className="text-red-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-100">
                  Delete {label}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  This cannot be undone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-40"
            >
              <FiX size={15} />
            </button>
          </div>

          {/* Body */}
          <p className="text-sm text-slate-300 mb-5 leading-relaxed">
            Are you sure you want to delete this{" "}
            <span className="font-semibold text-slate-100">
              {label.toLowerCase()}
            </span>
            ? All associated data will be permanently removed.
          </p>

          {/* Actions — stacked on very small screens, side by side otherwise */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 hover:border-slate-600 rounded-xl transition-all disabled:opacity-50 text-center"
            >
              Cancel
            </button>
            <button
              onClick={handleInternalDelete}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {isDeleting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>

        {/* Safe area spacer on mobile */}
        <div className="h-safe md:hidden pb-2" />
      </div>
    </div>
  );
}

export default ConfrimDelete;
