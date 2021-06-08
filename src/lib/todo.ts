import { Db } from "mongodb";
import { Collection } from "../types/collection";
import { TodoDocument } from "../types/todo";

export const getAllTodos = async (db: Db): Promise<TodoDocument[]> =>
  db.collection<TodoDocument>(Collection.Todos).find({}).toArray();
