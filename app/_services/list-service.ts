import axiosInstance from "./axiosInstance";
import axios from "axios";
import { ApiErrorResponse } from "./types";

export type List = {
  id: string;
  boardId: string;
  name: string;
};

export async function getListsByBoardId(boardId: string): Promise<List[]> {
  try {
    const res = await axiosInstance.get(`lists/${boardId}`);
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to get lists";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}

export async function createList(boardId: string, name: string): Promise<List> {
  try {
    const res = await axiosInstance.post("lists", { boardId, name });
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to create list";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}

export async function updateList(
  listId: string,
  updatedData: Partial<Pick<List, "name" | "boardId">>,
): Promise<boolean> {
  try {
    const res = await axiosInstance.put(`lists/${listId}`, updatedData);
    return res.status === 200;
  } catch (err: unknown) {
    let errorMessage = "Failed to update list";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}

export async function deleteList(listId: number | string): Promise<boolean> {
  try {
    const res = await axiosInstance.delete(`lists/${listId}`);
    return res.status === 200;
  } catch (err: unknown) {
    let errorMessage = "Failed to delete list";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}
