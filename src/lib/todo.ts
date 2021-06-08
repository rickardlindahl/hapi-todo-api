import { Db } from "mongodb";
import { Collection } from "../types/collection";
import { Todo } from "../types/todo";

export const getAllTodos = async (db: Db): Promise<Todo[]> =>
  db.collection<Todo>(Collection.Todos).find({}).toArray();
