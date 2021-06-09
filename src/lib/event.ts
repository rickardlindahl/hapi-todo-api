import { Db } from "mongodb";
import { Collection } from "../types/collection";
import { TodoEvent, TodoEventType } from "../types/event";
import { SortOrder } from "../types/sort";

const addEvent = async (db: Db, type: TodoEventType) => {
  const todo = await db.collection<TodoEvent>(Collection.Events).insertOne({
    type,
  });

  return todo.ops[0];
};

export const insertTodoAddedEvent = async (db: Db) =>
  addEvent(db, TodoEventType.Added);

export const insertTodoDeletedEvent = async (db: Db) =>
  addEvent(db, TodoEventType.Deleted);

export const insertTodoMarkedAsCompletedEvent = async (db: Db) =>
  addEvent(db, TodoEventType.MarkedAsCompleted);

export const insertTodoMarkedAsInCompleteEvent = async (db: Db) =>
  addEvent(db, TodoEventType.MarkedAsInComplete);

export const getAllEvents = async (db: Db) =>
  db
    .collection<TodoEvent>(Collection.Events)
    .find({})
    .sort({ _id: SortOrder.Ascending })
    .toArray();
