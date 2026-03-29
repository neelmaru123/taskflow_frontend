import axiosInstance from "./axiosInstance";
import axios from "axios";
import { ApiErrorResponse } from "./types";

export async function addCardLabel(cardLabelData: {
  cardId: string;
  labelIds: string[];
}) {
  try {
    const res = await axiosInstance.post("card_label", cardLabelData);
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to add label to card";
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
    const res = await axiosInstance.get(`card_label/${cardId}`);
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to get card labels";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}
