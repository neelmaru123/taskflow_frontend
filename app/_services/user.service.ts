import { ApiErrorResponse } from "./types";
import axiosInstance from "./axiosInstance";
import axios from "axios";

export async function getUserByToken() {
  try {
    const res = await axiosInstance.get("users/userByToken");
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to get user";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}

export async function resetPassword(password: string, email: string) {
  try {
    const res = await axiosInstance.put("users/reset-password", {
      password,
      email,
    });
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to reset password";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}
