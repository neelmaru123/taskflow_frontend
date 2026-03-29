import axiosInstance from "./axiosInstance";
import axios from "axios";
import { ApiErrorResponse } from "./types";

export type Member = {
  userId: string;
  boardId: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatarColor?: string;
  };
  createdAt?: string;
  role?: "owner" | "member";
};

export type MemberBoard = {
  userId: string;
  boardId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  board: {
    title: string;
    id: string;
    userId: string;
  };
};

function extractMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorResponse;
    return data?.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

/** Returns all members of a board (including the owner). */
export async function fetchBoardMembers(boardId: string): Promise<Member[]> {
  try {
    const res = await axiosInstance.get(
      `user_board/getUserByBoardId/${boardId}`,
    );
    return res.data;
  } catch (err: unknown) {
    throw new Error(extractMessage(err, "Failed to fetch board members"));
  }
}

/**
 * Searches for a user by exact email address.
 * Returns null if no user is found (404).
 */
export async function searchUserByEmail(
  email: string,
): Promise<Member["user"] | null> {
  try {
    const res = await axiosInstance.get(`users/getByEmail/${email}`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw new Error(extractMessage(err, "Failed to search user"));
  }
}

/** Adds a user (by userId) to a board. Returns true on success. */
export async function addBoardMember(
  boardId: string,
  userId: string,
): Promise<boolean> {
  try {
    await axiosInstance.post("user_board", { boardId, userId: [userId] });
    return true;
  } catch (err: unknown) {
    throw new Error(extractMessage(err, "Failed to add member"));
  }
}

/** Removes a user (by userId) from a board. Returns true on success. */
export async function removeBoardMember(
  boardId: string,
  userId: string,
): Promise<boolean> {
  try {
    await axiosInstance.delete(`user_board/${userId}/${boardId}`);
    return true;
  } catch (err: unknown) {
    throw new Error(extractMessage(err, "Failed to remove member"));
  }
}

/** Returns all boards a user is a member of (not owner). */
export async function fetchBoardByUserId(
  userId: string,
): Promise<MemberBoard[]> {
  try {
    const res = await axiosInstance.get(
      `user_board/getBoardByUserId/${userId}`,
    );
    return res.data;
  } catch (err: unknown) {
    throw new Error(extractMessage(err, "Failed to fetch member boards"));
  }
}
