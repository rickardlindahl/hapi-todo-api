import type { WithId } from "mongodb";

export interface Todo {
  title: string;
  completed: boolean;
}

export type TodoDocument = WithId<Todo>;
