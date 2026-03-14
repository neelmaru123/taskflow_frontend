import axios from "axios";
import { ApiErrorResponse } from "./types";
import { API_URL } from "./auth-service";

export async function addCardLabel(cardLabelData: {
  cardId: string;
  labelIds: string[];
}) {
  try {
    const res = await axios.post(`${API_URL}card_label`, cardLabelData, {
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

export async function getLabels(cardId: string) {
  try {
    const res = await axios.get(`${API_URL}card_label/${cardId}`, {
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
