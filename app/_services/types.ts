export type Card = {
  id?: string;
  title: string;
  listId: string;
  completed?: boolean;
  labels?: Label[];
  description?: string;
  dueDate?: string;
  createdAt?: string;
};

type Label = {
  id: string;
  name: string;
  color: string;
};

export type CreateCardInput = Omit<
  Card,
  "id" | "createdAt" | "completed" | "labels" | "dueDate"
>;

export interface ApiErrorResponse {
  message: string;
}
