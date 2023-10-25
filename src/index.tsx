/// <reference types="@kitajs/html/htmx.d.ts"/>

import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import Html from "@kitajs/html";
import staticPlugin from "@elysiajs/static";
import { string, z } from "zod";

const Layout = (props: Html.PropsWithChildren<{ title?: string }>) => {
  return (
    <>
      {"<!doctype html>"}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Short links by Samuel</title>
          <link href="/public/output.css" rel="stylesheet" />
          <script src="/public/htmx.min.js"></script>
        </head>
        <body class="flex bg-gradient-to-r from-slate-400 to-slate-200 align-middle items-center h-screen w-screen">
          {props.children}
        </body>
      </html>
    </>
  );
};

const isValidUrl = (urlString: string) => {
  var urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // validate protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // validate fragment locator
  return !!urlPattern.test(urlString);
};

const UrlEntry = (
  props: Html.PropsWithChildren<{ url?: string; errors?: string }>
) => {
  return (
    <form>
      <label for="link"></label>
      <div>
        <input
          id="link"
          name="link"
          placeholder="Long link"
          hx-post="/validate"
          hx-target="next error"
          hx-trigger="change, keyup delay:200ms"
          value={props.url ?? ""}
        ></input>
        <p id="error" class="text-red-600">
          {props.errors ?? ""}
        </p>
      </div>
      <button hx-post="/submit" hx-target="short-url">
        Submit
      </button>
      <div id="short-url"></div>
    </form>
  );
};

const links = {
  "1": "https://sambe.uk",
  "2": "https://samuelberton.com",
};

let maxId = 2;

const app = new Elysia()
  .use(html())
  .use(staticPlugin())
  .get("/", () => (
    <Layout>
      <div class="flex bg-gradient-to-r from-slate-400 to-slate-200 align-middle items-center h-screen w-screen">
        <div class="flex flex-col">
          <h1 class="text-5xl text-center font-bold justify-center align-middle">
            Generate short links using HTMX
          </h1>
          <UrlEntry />
        </div>
      </div>
    </Layout>
  ))
  .post(
    "/validate",
    ({ body }) => {
      console.log("validated");
      console.log(isValidUrl(body.link) ? "" : "borat");
      return isValidUrl(body.link) ? "" : "Not a valid URL";
    },
    {
      body: t.Object({
        link: t.String(),
      }),
    }
  )
  .post(
    "/submit",
    ({ body }) => {
      console.log(body);
      const id = maxId + 1;
      maxId++;
      links[id] = body.link;
      return (
        <div>
          <p>Short link: </p>
          <p>localhost:3000/{id}</p>
        </div>
      );
    },
    { body: t.Object({ link: t.String() }) }
  )
  .get("/:id", ({ params: { id }, set }) => {
    const re = links[id];
    if (!re) {
      set.status = 404;
      set.redirect = "/";
      return;
    }
    set.status = 302;
    set.redirect = re;
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
