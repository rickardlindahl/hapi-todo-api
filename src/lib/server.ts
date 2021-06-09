import Boom from "@hapi/boom";
import Hapi from "@hapi/hapi";
import Joi from "joi";
import { HapiRequest } from "../types/hapi";
import { HttpMethod } from "../types/http";
import { Todo } from "../types/todo";
import {
  getAllEvents,
  insertTodoAddedEvent,
  insertTodoDeletedEvent,
  insertTodoMarkedAsCompletedEvent,
  insertTodoMarkedAsInCompleteEvent,
} from "./event";
import { addTodo, deleteTodo, getAllTodos, updateTodo } from "./todo";

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
        const [todo] = await Promise.all([
          addTodo(db, request.payload.title),
          insertTodoAddedEvent(db),
        ]);
        return h.response(todo);
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
        const result = await Promise.all([
          deleteTodo(db, h.request.params.todoId),
          insertTodoDeletedEvent(db),
        ]);
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
        const result = await Promise.all([
          updateTodo(db, h.request.params.todoId, request.payload.completed),
          request.payload.completed
            ? insertTodoMarkedAsCompletedEvent(db)
            : insertTodoMarkedAsInCompleteEvent(db),
        ]);
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
    handler: async (request: HapiRequest<void>, h) => {
      const { db } = request.mongo;

      try {
        const result = await getAllEvents(db);
        return h.response(result);
      } catch (e) {
        throw Boom.badImplementation("terrible implementation", e);
      }
    },
  });

  console.log("Initializing server");
  await server.initialize();

  return server;
};
