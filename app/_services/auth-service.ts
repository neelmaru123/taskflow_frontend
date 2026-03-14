import axios from "axios";

import { ApiErrorResponse } from "./types";

export const API_URL = "http://localhost:8080/";

export async function login(userData: { email: string; password: string }) {
  try {
    const res = await axios.post(API_URL + "users/login", userData, {
      withCredentials: true,
    });
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to login user";

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
    const res = await axios.post(API_URL + "users", userData, {
      withCredentials: true,
    });
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to register user";

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
    const res = await axios.get(API_URL + "users/logout", {
      withCredentials: true,
    });

    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to logout user";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}
