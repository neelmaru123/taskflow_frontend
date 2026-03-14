import axios from "axios";
import { ApiErrorResponse } from "./types";
import { API_URL } from "./auth-service";

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
  // const labels: Label[] = JSON.parse(
  //   localStorage.getItem("labels") || "[]",
  // ) as Label[];
  // const newLabel = {
  //   id: Math.floor(Date.now() + Math.random()),
  //   name,
  //   color,
  // };
  // labels.push(newLabel);
  // localStorage.setItem("labels", JSON.stringify(labels));
  // return newLabel;

  try {
    const res = await axios.post(
      `${API_URL}labels`,
      { name, color, userId },
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

// export function deleteLabel(labelId: string): void {
//   let labels: Label[] = JSON.parse(
//     localStorage.getItem("labels") || "[]",
//   ) as Label[];
//   labels = labels.filter((label) => label.id !== String(labelId));
//   localStorage.setItem("labels", JSON.stringify(labels));
// }

export async function getLabelsByUser(userId: string) {
  try {
    const res = await axios.get(`${API_URL}labels/${userId}`, {
      withCredentials: true,
    });

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
