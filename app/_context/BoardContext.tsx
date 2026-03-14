"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getUserByToken } from "../_services/user.service";
import toast from "react-hot-toast";
import { logout } from "../_services/auth-service";
import {
  addBoard,
  deleteBoardService,
  getAllBoards,
  updateBoard,
} from "../_services/board-service";
import { fetchBoardByUserId } from "../_services/member-service";

/* ---------- TYPES ---------- */

type Board = {
  id: string;
  title: string;
  userId: number;
};

type User = {
  id: string;
  email: string;
  password: string;
  username?: string;
};

type UseBoardsContext = {
  boards: Board[];
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  updateBoardTitle: (boardId: string, title: string) => Promise<undefined>;
  createBoard: (title: string) => Promise<Board | undefined>;
  activeBoard: string | null;
  setActiveBoard: React.Dispatch<React.SetStateAction<string | null>>;
  deleteBoard: (boardId: string) => Promise<boolean>;
  user: User;
  fetchUser: () => Promise<void>;
  loading: boolean;
  logoutUser: () => Promise<void>;
  memberBoards: Board[];
};

const BoardContext = createContext<UseBoardsContext | undefined>(undefined);

function safeJSONParse<T>(value: string | null): T | null {
  try {
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export function BoardProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [memberBoards, setMemberBoards] = useState<Board[]>([]);
  const [activeBoard, setActiveBoard] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    setLoading(true);
    try {
      const data = await getUserByToken();

      if (data) {
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      // toast.error(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function getBoards() {
    if (!loading && user?.id) {
      try {
        const data = await getAllBoards(user.id);
        const memberBoardsData = await fetchBoardByUserId(user.id);
        setBoards(data);
        setMemberBoards(memberBoardsData);
        setActiveBoard(data[0]?.id ?? null);
      } catch (err) {
        console.error("Failed to fetch boards:", err);
      }
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    getBoards();
  }, [loading, user?.id]);

  async function updateBoardTitle(
    boardId: string,
    title: string,
  ): Promise<undefined> {
    try {
      const data = await updateBoard(boardId, { title, userId: user.id });
      await getBoards();
      toast.success("Title updated successfully");
    } catch (err) {
      console.error("Error in updating board title :" + err);
      toast.error(err.message);
    }
  }

  async function createBoard(title: string): Promise<Board | undefined> {
    if (!user) return;
    try {
      const newBoard: Board = await addBoard(title, user.id);

      await getBoards();
      setActiveBoard(newBoard.id);

      return newBoard;
    } catch (err) {
      console.error("Error in creating board :" + err);
      toast.error(err.message);
    }
  }

  async function deleteBoard(boardId: string): Promise<boolean> {
    try {
      const success = await deleteBoardService(boardId);

      if (success) {
        toast.success("Board deleted successfully");

        // 1. Fetch fresh boards
        await getBoards();

        // 2. Reset activeBoard to null or the first available board
        // This prevents the app from trying to render a deleted ID
        setActiveBoard(null);

        return true;
      }

      return false;
    } catch (err: any) {
      toast.error(err.message || "Failed to delete board");
      return false;
    }
  }

  async function logoutUser() {
    try {
      const data = await logout();

      setUser(null);
    } catch (err) {
      console.error("Error in logout user : ", err);
      toast.error(err.message);
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
