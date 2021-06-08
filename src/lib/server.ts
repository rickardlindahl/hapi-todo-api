import Boom from "@hapi/boom";
import Hapi from "@hapi/hapi";
import Joi from "joi";
import { ObjectId } from "mongodb";
import { Collection } from "../types/collection";
import { HapiRequest } from "../types/hapi";
import { HttpMethod } from "../types/http";
import { Todo } from "../types/todo";

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
    handler: (_request, _h) => {
      return "Todos!";
    },
  });

  // Add todos to a list,
  server.route({
    method: HttpMethod.Post,
    path: "/todos",
    handler: async (request: HapiRequest<Exclude<Todo, "completed">>, h) => {
      const { db } = request.mongo;

      try {
        const count = await db
          .collection(Collection.TodoLists)
          .countDocuments({ _id: new ObjectId(request.payload.todoList) });

        if (count !== 1) {
          throw Boom.badImplementation(
            `There is no list id ${request.payload.todoList}`
          );
        }

        const result = await db.collection<Todo>(Collection.Todos).insertOne({
          ...request.payload,
          completed: false,
        });

        return h.response(result.ops[0]);
      } catch (e) {
        throw Boom.badImplementation("terrible implementation", e);
      }
    },
    options: {
      validate: {
        payload: Joi.object({
          title: Joi.string().min(1).max(255).required(),
          todoList: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required(),
          dueDate: Joi.date(),
        }),
      },
    },
  });

  // Remove todos from the list,
  server.route({
    method: HttpMethod.Delete,
    path: "/todos/{todoId}",
    handler: (_request, _h) => {
      return "Todo deleted";
    },
  });

  // Mark todo as done,
  // Unmark todos as done,
  server.route({
    method: HttpMethod.Patch,
    path: "/todos/{todoId}",
    handler: (_request, _h) => {
      return "Todo updated";
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
