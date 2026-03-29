import axiosInstance from "./axiosInstance";
import axios from "axios";
import { ApiErrorResponse } from "./types";

export type Board = {
  id: string;
  title: string;
  userId: string;
};

export async function getAllBoards(userId: string): Promise<Board[]> {
  try {
    const res = await axiosInstance.get(`boards/${userId}`);
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to get boards";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}

export async function addBoard(title: string, userId: string): Promise<Board> {
  try {
    const res = await axiosInstance.post("boards", { title, userId });
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to create board";
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
  boardId: string,
  updatedData: Partial<Pick<Board, "title" | "userId">>,
): Promise<Board | null> {
  try {
    const res = await axiosInstance.put(`boards/${boardId}`, updatedData);
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to update board";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}

export async function deleteBoardService(boardId: string): Promise<boolean> {
  try {
    const res = await axiosInstance.delete(`boards/${boardId}`);
    return res.status === 200;
  } catch (err: unknown) {
    let errorMessage = "Failed to delete board";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}
