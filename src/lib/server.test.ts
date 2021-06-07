import { expect } from "@hapi/code";
import type { Server } from "@hapi/hapi";
import Lab from "@hapi/lab";
import { init } from "../lib/server";

const { afterEach, beforeEach, describe, it } = (exports.lab = Lab.script());

describe("GET /", () => {
  let server: Server;

  beforeEach(async () => {
    server = await init();
  });

  afterEach(async () => {
    await server.stop();
  });

  it("responds with 200", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/",
    });
    expect(res.statusCode).to.equal(200);
  });

  it("responds with Hello World", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/",
    });
    expect(res.payload).to.equal("Hello World!");
  });
});
