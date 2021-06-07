import { Db, MongoClient, ObjectID } from "mongodb";

export interface HapiRequest<T> {
  mongo: {
    client: MongoClient;
    db: Db;
    ObjectID: ObjectID;
  };
  payload: T;
}
