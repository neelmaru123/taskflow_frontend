import { ApiErrorResponse } from "./types";
import { API_URL } from "./auth-service";
import axios from "axios";

export async function getUserByToken() {
  try {
    const res = await axios.get(API_URL + "users/userByToken", {
      withCredentials: true,
    });
    console.log(res.data);
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

export async function resetPassword(password: string, email: string) {
  try {
    const res = await axios.post(
      API_URL + "users/reset-password",
      { password, email },
      { withCredentials: true },
    );

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
