import { Db, ObjectId } from "mongodb";
import { Collection } from "../types/collection";
import { Todo, TodoDocument } from "../types/todo";

export const getAllTodos = async (db: Db): Promise<TodoDocument[]> =>
  db.collection<TodoDocument>(Collection.Todos).find({}).toArray();

export const addTodo = async (db: Db, title: string): Promise<TodoDocument> => {
  const todo = await db.collection<Todo>(Collection.Todos).insertOne({
    title,
    completed: false,
  });

  return todo.ops[0];
};

export const deleteTodo = async (db: Db, id: string): Promise<Todo | null> => {
  const todo = await db
    .collection<Todo>(Collection.Todos)
    .findOneAndDelete({ _id: new ObjectId(id) });

  return todo.value;
};
