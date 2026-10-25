import { beforeEach, describe, expect, mock, test } from "bun:test";

process.env.LINK = "https://t.sambe.uk";

const createLink = mock(async (_link: { shortLink: string; longLink: string }) => {});
const getLongLink = mock(async (_id: string): Promise<string | null> => null);
mock.module("./db/helpers", () => ({ createLink, getLongLink }));

const { app } = await import("./index");

let ip = 0;
const submit = (link: string) =>
  app.handle(
    new Request("http://localhost/submit", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        // A fresh client per request so the rate limiter doesn't interfere
        "x-real-ip": `10.0.0.${++ip}`,
      },
      body: new URLSearchParams({ link }),
    })
  );

beforeEach(() => {
  createLink.mockReset();
  createLink.mockImplementation(async () => {});
  getLongLink.mockReset();
  getLongLink.mockImplementation(async () => null);
});

describe("POST /submit", () => {
  test("stores a scheme-less URL as https", async () => {
    const res = await submit("youtube.com");
    expect(res.status).toBe(200);
    expect(createLink).toHaveBeenCalledTimes(1);
    expect(createLink.mock.calls[0][0].longLink).toBe("https://youtube.com/");
    expect(await res.text()).toContain("https://t.sambe.uk/");
  });

  test("shows an error instead of crashing when the insert fails", async () => {
    createLink.mockImplementation(async () => {
      throw new Error("connection refused");
    });
    const res = await submit("https://example.com");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("Something went wrong please try again!");
    expect(body).not.toContain("https://t.sambe.uk/");
  });

  test("rate limits a single client", async () => {
    const sameClient = () =>
      app.handle(
        new Request("http://localhost/submit", {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            "x-real-ip": "192.0.2.1",
          },
          body: new URLSearchParams({ link: "https://example.com" }),
        })
      );
    for (let i = 0; i < 10; i++) await sameClient();
    const res = await sameClient();
    expect(await res.text()).toContain("Too many links");
    expect(createLink).toHaveBeenCalledTimes(10);
  });
});

describe("GET /:id", () => {
  test("redirects to the stored link", async () => {
    getLongLink.mockImplementation(async () => "https://youtube.com/");
    const res = await app.handle(new Request("http://localhost/abcd1234"));
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://youtube.com/");
  });

  test("returns 404 for an unknown link", async () => {
    const res = await app.handle(new Request("http://localhost/nope1234"));
    expect(res.status).toBe(404);
    expect(await res.text()).toContain("This short link doesn");
  });

  test("returns 500 when the lookup fails", async () => {
    getLongLink.mockImplementation(async () => {
      throw new Error("connection refused");
    });
    const res = await app.handle(new Request("http://localhost/abcd1234"));
    expect(res.status).toBe(500);
  });
});

test("GET /robots.txt redirects to the static file", async () => {
  const res = await app.handle(new Request("http://localhost/robots.txt"));
  expect(res.status).toBe(302);
  expect(res.headers.get("location")).toBe("/public/robots.txt");
});
