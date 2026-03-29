import type { ApiErrorResponse, Card, CreateCardInput } from "./types";
import axiosInstance from "./axiosInstance";
import axios from "axios";

function extractMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorResponse;
    return Array.isArray(data?.message)
      ? data.message[0]
      : data?.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export async function createCard(cardInput: CreateCardInput): Promise<Card> {
  try {
    const res = await axiosInstance.post("cards", {
      title: cardInput.title,
      description: cardInput.description,
      listId: String(cardInput.listId),
    });
    return res.data;
  } catch (err: unknown) {
    throw new Error(extractMessage(err, "Failed to add card"));
  }
}

export async function updateCard(
  cardId: number | string,
  updatedData: Partial<Card>,
): Promise<boolean> {
  try {
    const res = await axiosInstance.put(`cards/${cardId}`, { ...updatedData });
    return res.status === 200 || res.status === 201;
  } catch (err: unknown) {
    throw new Error(extractMessage(err, "Failed to update card"));
  }
}

export async function deleteCard(cardId: number | string): Promise<void> {
  try {
    await axiosInstance.delete(`cards/${cardId}`);
  } catch (err: unknown) {
    throw new Error(extractMessage(err, "Failed to delete card"));
  }
}

export async function getCardsByBoard(boardId: string): Promise<Card[]> {
  try {
    const res = await axiosInstance.get(`cards/board/${boardId}`);
    return res.data;
  } catch (err: unknown) {
    throw new Error(extractMessage(err, "Failed to get cards"));
  }
}

export async function moveCard(cardId: string, listId: string) {
  try {
    const res = await axiosInstance.patch("cards/moveCard", { listId, cardId });
    return res;
  } catch (err: unknown) {
    throw new Error(extractMessage(err, "Failed to move card"));
  }
}

export async function completeTask(
  cardId: number | string,
  updatedData: Partial<Pick<Card, "completed">>,
) {
  try {
    const res = await axiosInstance.patch("cards/updateStatusOfCard", {
      cardId,
      completed: updatedData.completed,
    });
    return res.data;
  } catch (err: unknown) {
    throw new Error(extractMessage(err, "Failed to update card status"));
  }
}
