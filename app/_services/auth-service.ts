import axiosInstance from "./axiosInstance";
import { ApiErrorResponse } from "./types";
import axios from "axios";

export { API_URL } from "./axiosInstance";

export async function login(userData: { email: string; password: string }) {
  try {
    const res = await axiosInstance.post("users/login", userData);
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to login";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}

export async function register(userData: {
  username: string;
  email: string;
  password: string;
}) {
  try {
    const res = await axiosInstance.post("users", userData);
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to register";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}

export async function logout() {
  try {
    const res = await axiosInstance.get("users/logout");
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to logout";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}
