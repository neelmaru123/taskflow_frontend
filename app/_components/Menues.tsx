"use client";

import { ReactElement, useEffect, useRef, useState } from "react";
import { useBoards } from "../_context/BoardContext";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";

type MenuesProps = {
  onClose?: () => void;
};

function Menues({ onClose }: MenuesProps): ReactElement {
  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const { boards, createBoard, activeBoard, setActiveBoard } = useBoards();

  useEffect(() => {
    if (isAddBoardOpen) inputRef.current?.focus();
  }, [isAddBoardOpen]);

  function handleAddBoard() {
    if (!title.trim()) {
      setIsAddBoardOpen(false);
      return;
    }

    const newBoard = createBoard(title);
    setActiveBoard(String(newBoard.id));
    setTitle("");
    setIsAddBoardOpen(false);
    onClose?.();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-end md:items-center">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-h-[80vh] bg-slate-900 rounded-t-2xl p-4 md:max-w-md md:rounded-2xl flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Your Boards</h2>
          <AiOutlineClose
            size={22}
            className="text-slate-400 cursor-pointer"
            onClick={onClose}
          />
        </div>

        <ul className="flex-1 overflow-y-auto space-y-2 mb-4">
          {boards.map((board) => (
            <li key={board.id}>
              <button
                onClick={() => {
                  setActiveBoard(String(board.id));
                  onClose?.();
                }}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-left text-sm font-medium transition
                  ${
                    activeBoard === board.id
                      ? "bg-slate-800 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-800"
                  }`}
              >
                {board.title || "Untitled Board"}
              </button>
            </li>
          ))}
        </ul>

        {isAddBoardOpen ? (
          <div className="relative">
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddBoard();
                if (e.key === "Escape") setIsAddBoardOpen(false);
              }}
              placeholder="Board title"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 text-slate-200 outline-none ring-2 ring-blue-500"
            />

            <AiOutlineCheck
              className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500 cursor-pointer"
              size={20}
              onClick={handleAddBoard}
            />

            <AiOutlineClose
              className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 cursor-pointer"
              size={20}
              onClick={() => setIsAddBoardOpen(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAddBoardOpen(true)}
            className="w-full py-3 rounded-xl border border-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-800 transition"
          >
            + Create Board
          </button>
        )}
      </div>
    </div>
  );
}

export default Menues;
