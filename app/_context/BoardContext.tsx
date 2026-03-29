"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import { getUserByToken } from "../_services/user.service";
import toast from "react-hot-toast";
import { logout } from "../_services/auth-service";
import {
  addBoard,
  deleteBoardService,
  getAllBoards,
  updateBoard,
  type Board,
} from "../_services/board-service";
import {
  fetchBoardByUserId,
  type MemberBoard,
} from "../_services/member-service";

/* ---------- TYPES ---------- */

type User = {
  id: string;
  email: string;
  username?: string;
};

type UseBoardsContext = {
  boards: Board[];
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  updateBoardTitle: (boardId: string, title: string) => Promise<void>;
  createBoard: (title: string) => Promise<Board | undefined>;
  activeBoard: string | null;
  setActiveBoard: React.Dispatch<React.SetStateAction<string | null>>;
  deleteBoard: (boardId: string) => Promise<boolean>;
  user: User | null;
  fetchUser: () => Promise<void>;
  loading: boolean;
  logoutUser: () => Promise<void>;
  memberBoards: MemberBoard[];
};

const BoardContext = createContext<UseBoardsContext | undefined>(undefined);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [memberBoards, setMemberBoards] = useState<MemberBoard[]>([]);
  const [activeBoard, setActiveBoard] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch authenticated user ─────────────────────────────────────────────
  async function fetchUser() {
    setLoading(true);
    try {
      const data = await getUserByToken();
      setUser(data ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // ── Fetch boards for the current user ────────────────────────────────────
  async function getBoards(userId: string) {
    try {
      const [ownedBoards, memberBoardsData] = await Promise.all([
        getAllBoards(userId),
        fetchBoardByUserId(userId),
      ]);
      setBoards(ownedBoards);
      setMemberBoards(memberBoardsData);
      // Only auto-select first board if nothing is active yet
      setActiveBoard((prev) => prev ?? ownedBoards[0]?.id ?? null);
    } catch (err: any) {
      console.error("Failed to fetch boards:", err);
      toast.error("Failed to load boards");
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  const hasFetchedBoards = useRef(false);

  useEffect(() => {
    if (!loading && user?.id && !hasFetchedBoards.current) {
      hasFetchedBoards.current = true;
      getBoards(user.id);
    }
  }, [loading, user?.id]);
  // ── Board operations ─────────────────────────────────────────────────────
  async function updateBoardTitle(
    boardId: string,
    title: string,
  ): Promise<void> {
    if (!user) return;
    try {
      await updateBoard(boardId, { title, userId: user.id });
      // Update local state optimistically instead of refetching everything
      setBoards((prev) =>
        prev.map((b) => (b.id === boardId ? { ...b, title } : b)),
      );
      toast.success("Board renamed");
    } catch (err: any) {
      toast.error(err.message || "Failed to rename board");
    }
  }

  async function createBoard(title: string): Promise<Board | undefined> {
    if (!user) return;
    try {
      const newBoard = await addBoard(title, user.id);
      setBoards((prev) => [...prev, newBoard]);
      setActiveBoard(newBoard.id);
      return newBoard;
    } catch (err: any) {
      toast.error(err.message || "Failed to create board");
    }
  }

  async function deleteBoard(boardId: string): Promise<boolean> {
    try {
      await deleteBoardService(boardId);
      toast.success("Board deleted");
      setBoards((prev) => {
        const remaining = prev.filter((b) => b.id !== boardId);
        // Auto-select next available board after deletion
        setActiveBoard(remaining[0]?.id ?? null);
        return remaining;
      });
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to delete board");
      return false;
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  async function logoutUser() {
    try {
      hasFetchedBoards.current = false;
      await logout();
    } catch {
      // Ignore logout API errors — clear state regardless
    } finally {
      setUser(null);
      setBoards([]);
      setMemberBoards([]);
      setActiveBoard(null);
    }
  }

  return (
    <BoardContext.Provider
      value={{
        boards,
        setBoards,
        updateBoardTitle,
        createBoard,
        activeBoard,
        setActiveBoard,
        deleteBoard,
        user,
        fetchUser,
        loading,
        logoutUser,
        memberBoards,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

/* ---------- HOOK ---------- */

export function useBoards(): UseBoardsContext {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoards must be used within BoardProvider");
  }
  return context;
}
