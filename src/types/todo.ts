import type { ObjectId, WithId } from "mongodb";

export interface Todo {
  title: string;
  completed: boolean;
  dueDate?: number;
  todoList: ObjectId;
}

export type TodoDocument = WithId<Todo>; 

export interface TodoList {
  title: string;
  users: string[];
}

export type TodoListDocument = WithId<TodoList>;
