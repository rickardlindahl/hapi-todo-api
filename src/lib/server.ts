import Boom from "@hapi/boom";
import Hapi from "@hapi/hapi";
import Joi from "joi";
import { ObjectId } from "mongodb";
import { Collection } from "../types/collection";
import { HapiRequest } from "../types/hapi";
import { HttpMethod } from "../types/http";
import { Todo } from "../types/todo";
import { addTodo, deleteTodo, getAllTodos } from "./todo";

export const init = async () => {
  console.log("Creating Hapi Server");

  const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

  console.log("Registering MongoDB plugin");

  await server.register({
    plugin: require("hapi-mongodb"),
    options: {
      url: `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER_URL}/${process.env.MONGODB_DATABASE_NAME}?retryWrites=true&w=majority`,
      settings: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      decorate: true,
    },
  });

  console.log("Adding routes");

  server.route({
    method: HttpMethod.Get,
    path: "/",
    handler: () => {
      return "Hello World!";
    },
  });

  // Get todos
  server.route({
    method: HttpMethod.Get,
    path: "/todos",
    handler: async (request: HapiRequest<void>, h) => {
      const { db } = request.mongo;

      try {
        const result = await getAllTodos(db);
        return h.response(result);
      } catch (e) {
        throw Boom.badImplementation("terrible implementation", e);
      }
    },
  });

  // Add todos to a list,
  server.route({
    method: HttpMethod.Post,
    path: "/todos",
    handler: async (request: HapiRequest<Exclude<Todo, "completed">>, h) => {
      const { db } = request.mongo;

      try {
        const result = await addTodo(db, request.payload.title);
        return h.response(result);
      } catch (e) {
        throw Boom.badImplementation("terrible implementation", e);
      }
    },
    options: {
      validate: {
        payload: Joi.object<Todo>({
          title: Joi.string().min(1).max(255).required(),
        }),
      },
    },
  });

  // Remove todos from the list,
  // TODO: Handle todo does not exist
  server.route({
    method: HttpMethod.Delete,
    path: "/todos/{todoId}",
    handler: async (request: HapiRequest<void>, h) => {
      const { db } = request.mongo;

      try {
        const result = await deleteTodo(db, h.request.params.todoId);
        return h.response(result);
      } catch (e) {
        throw Boom.badImplementation("terrible implementation", e);
      }
    },
    options: {
      validate: {
        params: Joi.object<{ todoId: string }>({
          todoId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required(),
        }),
      },
    },
  });

  // Mark todo as done,
  // Unmark todos as done,
  server.route({
    method: HttpMethod.Patch,
    path: "/todos/{todoId}",
    handler: async (request: HapiRequest<Pick<Todo, "completed">>, h) => {
      const { db } = request.mongo;

      try {
        const result = await db
          .collection<Todo>(Collection.Todos)
          .findOneAndUpdate(
            { _id: new ObjectId(h.request.params.todoId) },
            { $set: { completed: request.payload.completed } },
            { returnOriginal: false } // returnOriginal is deprecated but will do for now
          );
        return h.response(result.value);
      } catch (e) {
        throw Boom.badImplementation("terrible implementation", e);
      }
    },
    options: {
      validate: {
        params: Joi.object<{ todoId: string }>({
          todoId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required(),
        }),
        payload: Joi.object<Todo>({
          completed: Joi.boolean().required(),
        }),
      },
    },
  });

  // Retrieve all events associated with a list of todos (think CRUD events,)
  server.route({
    method: HttpMethod.Get,
    path: "/events",
    handler: (_request, _h) => {
      return "All events!";
    },
  });

  console.log("Initializing server");
  await server.initialize();

  return server;
};
