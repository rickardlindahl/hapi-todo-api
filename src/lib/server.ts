import Hapi from "@hapi/hapi";

const server = Hapi.server({
  port: 3000,
  host: "localhost",
});

server.route({
  method: "GET",
  path: "/",
  handler: () => {
    return "Hello World!";
  },
});

// Get todos
server.route({
  method: "GET",
  path: "/todos",
  handler: (_request, _h) => {
    return "Todos!";
  },
});

// Add todos to a list,
server.route({
  method: "POST",
  path: "/todos",
  handler: (_request, _h) => {
    return "New todo created";
  },
});

// Remove todos from the list,
server.route({
  method: "DELETE",
  path: "/todos/{todoId}",
  handler: (_request, _h) => {
    return "Todo deleted";
  },
});

// Mark todo as done,
// Unmark todos as done,
server.route({
  method: "PATCH",
  path: "/todos/{todoId}",
  handler: (_request, _h) => {
    return "Todo updated";
  },
});

// Retrieve all events associated with a list of todos (think CRUD events,)
server.route({
  method: "GET",
  path: "/events",
  handler: (_request, _h) => {
    return "All events!";
  },
})

export const init = async () => {
  await server.initialize();
  return server;
};

export const start = async () => {
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
  return server;
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});
