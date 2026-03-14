import axios from "axios";
import { ApiErrorResponse } from "./types";
import { API_URL } from "./auth-service";

type Board = {
  id: string;
  title: string;
  userId: number;
};

export async function getAllBoards(userId: string): Promise<Board[]> {
  try {
    const res = await axios.get(`${API_URL}boards/${userId}`, {
      withCredentials: true,
    });

    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed get all boards ";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}

// export function getBoardById(boardId: number | string): Board | undefined {
//   const boards = (JSON.parse(localStorage.getItem("boards")) as Board[]) || [];
//   return boards.find((board: Board) => board.id === Number(boardId));
// }

export async function addBoard(title: string, userId: string): Promise<Board> {
  try {
    const res = await axios.post(
      API_URL + "boards",
      { title, userId },
      { withCredentials: true },
    );

    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to add boards";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}

export async function updateBoard(
  boardId: string | string,
  updatedData: Partial<Pick<Board, "title" | "userId">>,
): Promise<Board | null> {
  try {
    const res = await axios.put(`${API_URL}boards/${boardId}`, updatedData, {
      withCredentials: true,
    });

    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to update boards";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}

export async function deleteBoardService(
  boardId: number | string,
): Promise<boolean> {
  try {
    const res = await axios.delete(`${API_URL}boards/${boardId}`, {
      withCredentials: true,
    });

    if (res.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (err: unknown) {
    let errorMessage = "Failed to update boards";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}
