import axios from "axios";
import { API_URL } from "./auth-service";
import { ApiErrorResponse } from "./types";

export type List = {
  id: string;
  boardId: string;
  name: string;
};

export async function getListsByBoardId(boardId: string): Promise<List[]> {
  // const lists: List[] = JSON.parse(localStorage.getItem("lists") || "[]") as List[];
  // return lists.filter((list) => list.boardId === Number(boardId));

  try {
    const res = await axios.get(`${API_URL}lists/${boardId}`, {
      withCredentials: true,
    });

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
  // const lists: List[] = JSON.parse(
  //   localStorage.getItem("lists") || "[]",
  // ) as List[];

  // const newList: List = {
  //   id: Math.floor(Date.now() + Math.random()),
  //   boardId: Number(boardId),
  //   name,
  // };

  // lists.push(newList);
  // localStorage.setItem("lists", JSON.stringify(lists));

  // return newList;

  try {
    const res = await axios.post(
      API_URL + "lists",
      { boardId, name },
      { withCredentials: true },
    );
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to create lists";

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
  // const lists: List[] = JSON.parse(
  //   localStorage.getItem("lists") || "[]",
  // ) as List[];

  // const listIndex = lists.findIndex((list) => list.id === Number(listId));
  // if (listIndex !== -1) {
  //   lists[listIndex] = { ...lists[listIndex], ...updatedData };
  //   localStorage.setItem("lists", JSON.stringify(lists));
  //   return lists[listIndex];
  // }

  // return null;

  try {
    const res = await axios.put(`${API_URL}lists/${listId}`, updatedData, {
      withCredentials: true,
    });

    if (res.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (err: unknown) {
    let errorMessage = "Failed to create lists";

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
  // let lists: List[] = JSON.parse(
  //   localStorage.getItem("lists") || "[]",
  // ) as List[];
  // lists = lists.filter((list) => list.id !== Number(listId));
  // localStorage.setItem("lists", JSON.stringify(lists));
  // return true;

  try {
    const res = await axios.delete(`${API_URL}lists/${listId}`, {
      withCredentials: true,
    });

    if (res.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (err: unknown) {
    let errorMessage = "Failed to create lists";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}
