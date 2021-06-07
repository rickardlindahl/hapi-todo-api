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
