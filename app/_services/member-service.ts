// _services/members-service.ts
// ─────────────────────────────────────────────────────────────────────────────
// Replace each function body with your real API calls.
// The types and signatures must stay the same — BoardMembers.tsx and
// BoardPage.tsx depend on them.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";
import { API_URL } from "./auth-service";
import { ApiErrorResponse } from "./types";

type Member = {
  id: string;
  username: string;
  email: string;
  role?: "owner" | "member";
  avatarColor?: string;
};

/**
 * Returns all members of a board (including the owner).
 */
export async function fetchBoardMembers(boardId: string): Promise<Member[]> {
  try {
    const res = await axios.get(
      `${API_URL}user_board/getUserByBoardId/${boardId}`,
      { withCredentials: true },
    );
    if (!res) throw new Error("Failed to fetch members");

    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to get Labels";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}

/**
 * Searches for a user by exact email address.
 * Returns null if no user is found.
 */
export async function searchUserByEmail(email: string): Promise<Member | null> {
  try {
    const res = await axios.get(`${API_URL}users/getByEmail/${email}`, {
      withCredentials: true,
    });
    if (res.status === 404) return null;
    if (!res) throw new Error("Search failed");
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to get Labels";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}

/**
 * Adds a user (by userId) to a board.
 * Returns true on success.
 */
export async function addBoardMember(
  boardId: string,
  userId: string,
): Promise<boolean> {
  try {
    const res = await axios.post(
      `${API_URL}user_board`,
      { boardId, userId: [userId] },
      { withCredentials: true },
    );
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to Add member";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}

/**
 * Removes a user (by userId) from a board.
 * Returns true on success.
 */
export async function removeBoardMember(
  boardId: string,
  userId: string,
): Promise<boolean> {
  try {
    const res = await axios.delete(
      `${API_URL}user_board/${userId}/${boardId}`,
      { withCredentials: true },
    );
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to get Labels";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
}

export async function fetchBoardByUserId(userId: string) {
  try {
    const res = await axios.get(
      `${API_URL}user_board/getBoardByUserId/${userId}`,
      { withCredentials: true },
    );
    if (!res) throw new Error("Failed to fetch members");
    return res.data;
  } catch (err: unknown) {
    let errorMessage = "Failed to get Labels";

    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ApiErrorResponse;
      errorMessage = data?.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}
