import type {
  ApiErrorResponse,
  Card,
  CreateCardInput,
} from "@/app/_services/types";
import axios from "axios";
import { API_URL } from "./auth-service";

// export type CardInput = {
//   listId: number;
//   title: string;
//   description?: string;
//   dueDate?: string;
//   labels: number[];
// };

export function getCardsByListId(listId: number | string): Card[] {
  const cards = (JSON.parse(localStorage.getItem("cards")) as Card[]) || [];
  return cards.filter((card: Card) => card.listId === String(listId));
}

export async function createCard(cardInput: CreateCardInput): Promise<Card> {
  // Instead of spreading (...cardInput), pick only what the backend expects
  const newCard = {
    title: cardInput.title,
    description: cardInput.description,
    listId: String(cardInput.listId),
  };

  try {
    const res = await axios.post(`${API_URL}cards`, newCard, {
      withCredentials: true,
    });

    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to add card";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      // Handle NestJS error format where message can be an array
      errorMessage = Array.isArray(data?.message)
        ? data.message[0]
        : data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}

export async function updateCard(
  cardId: number | string,
  updatedData: Partial<Card>,
): Promise<boolean> {
  // const cards: Card[] = getAllCards();
  // const cardIndex = cards.findIndex((card) => card.id === Number(cardId));

  // if (cardIndex !== -1) {
  //   cards[cardIndex] = { ...cards[cardIndex], ...updatedData };
  //   localStorage.setItem("cards", JSON.stringify(cards));
  //   return cards[cardIndex] ? true : false;
  // }

  // return false;

  try {
    const res = await axios.put(
      `${API_URL}cards/${cardId}`,
      { ...updatedData },
      { withCredentials: true },
    );

    if (res.status === 200 || res.status === 201) {
      return true;
    } else {
      return false;
    }
  } catch (err: unknown) {
    let errorMessage = "Failed to update card";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      // Handle NestJS error format where message can be an array
      errorMessage = Array.isArray(data?.message)
        ? data.message[0]
        : data?.message || errorMessage;
    } else if (err instanceof Error) {
      console.log("Called");
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}

export async function deleteCard(cardId: number | string): Promise<void> {
  // let cards: Card[] = getAllCards();
  // cards = cards.filter((card) => card.id !== Number(cardId));
  // localStorage.setItem("cards", JSON.stringify(cards));

  try {
    const res = await axios.delete(`${API_URL}cards/${cardId}`, {
      withCredentials: true,
    });
  } catch (err: unknown) {
    let errorMessage = "Failed to delete card";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      // Handle NestJS error format where message can be an array
      errorMessage = Array.isArray(data?.message)
        ? data.message[0]
        : data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}

// export function completeTask(
//   cardId: number | string,
//   updatedData: Partial<Pick<Card, "completed">>,
// ): boolean {
//   try {
//     return updateCard(cardId, updatedData);
//   } catch (err) {
//     console.error(err);
//     return false;
//   }
// }

// export function getAllCards(): Card[] {
//   const cards: Card[] = JSON.parse(
//     localStorage.getItem("cards") || "[]",
//   ) as Card[];
//   return cards;
// }

export async function getCardsByBoard(boardId: string) {
  try {
    const res = await axios.get(`${API_URL}cards/board/${boardId}`, {
      withCredentials: true,
    });

    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to get cards";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}

export async function moveCard(cardId: string, listId: string) {
  try {
    const res = await axios.patch(
      `${API_URL}cards/moveCard`,
      { listId, cardId },
      { withCredentials: true },
    );

    return res;
  } catch (err: unknown) {
    let errorMessage = "Failed to move cards";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}

export async function completeTask(
  cardId: number | string,
  updatedData: Partial<Pick<Card, "completed">>,
) {
  try {
    const res = await axios.patch(
      `${API_URL}cards/updateStatusOfCard`,
      {
        cardId,
        completed: updatedData.completed,
      },
      {
        withCredentials: true,
      },
    );

    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to move cards";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}
