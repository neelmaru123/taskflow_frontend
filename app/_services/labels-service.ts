import axiosInstance from "./axiosInstance";
import axios from "axios";
import { ApiErrorResponse } from "./types";

export type Label = {
  id: string;
  name: string;
  color: string;
  userId: string;
};

export async function createLabel(
  name: string,
  color: string,
  userId: string,
): Promise<Label> {
  try {
    const res = await axiosInstance.post("labels", { name, color, userId });
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to create label";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}

export async function getLabelsByUser(userId: string): Promise<Label[]> {
  try {
    const res = await axiosInstance.get(`labels/${userId}`);
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to get labels";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}
