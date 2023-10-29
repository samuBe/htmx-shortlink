/// <reference types="@kitajs/html/htmx.d.ts"/>

import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import Html from "@kitajs/html";
import staticPlugin from "@elysiajs/static";
import "dotenv/config";
import { createLink, getLongLink } from "./db/dynamo";
import { nanoid } from "nanoid";

const Layout = (props: Html.PropsWithChildren<{ title?: string }>) => {
  return (
    <>
      {"<!doctype html>"}
      <html lang="en" hx-boost>
        <head>
          <meta charset="UTF-8" />
          <title>Short links by Samuel</title>
          <link rel="icon" type="image/x-icon" href="/public/favicon.ico" />
          <link href="/public/output.css" rel="stylesheet" />
          <script src="/public/htmx.min.js"></script>
          <script src="https://unpkg.com/clipboard@2/dist/clipboard.min.js"></script>
        </head>
        <body class="flex bg-gradient-to-r from-slate-50 to-slate-200 align-middle justify-center items-center h-screen w-screen">
          {props.children}
          <footer class="fixed bottom-0 flex flex-col w-screen items-center justify-center text-xl pb-8">
            <div>
              Made by{" "}
              <a
                href="https://samuelberton.com"
                class="underline text-blue-600"
              >
                Samuel Berton
              </a>
              , using{" "}
              <a href="https://htmx.org" class="underline text-blue-600">
                HTMX
              </a>
              .
            </div>
            <div>
              More info on{" "}
              <a
                class="text-blue-600 underline"
                href="https://github.com/samube"
              >
                GitHub
              </a>
              .
            </div>
          </footer>
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
    <form class="">
      <label class="text-2xl" for="link"></label>
      <div class="flex p-4 flex-col gap-4">
        <input
          id="link"
          name="link"
          placeholder="Long link"
          hx-post="/validate"
          hx-target="#error"
          hx-trigger="change, keyup delay:100ms"
          value={props.url ?? ""}
          class="p-4 rounded-lg text-xl"
          autofocus="true"
        ></input>
        <button
          hx-post="/submit"
          hx-swap="innerHtml"
          hx-target="#container"
          id="submit"
          class="border-black p-8 border-2 text-3xl bg-slate-400 font-bold rounded-lg"
        >
          SHORTEN MY URL!
        </button>
      </div>
      <p id="error" class="text-red-600 h-6">
        {props.errors ?? ""}
      </p>
    </form>
  );
};

let maxId = 2;

const app = new Elysia()
  .use(html())
  .use(staticPlugin())
  .get("/", () => (
    <Layout>
      <div class="flex flex-col">
        <h1 class="text-5xl text-center font-extrabold justify-center align-middle">
          Generate short links using HTMX
        </h1>
        <div class="p-6" id="container">
          <UrlEntry />
        </div>
      </div>
    </Layout>
  ))
  .post(
    "/validate",
    ({ body }) => {
      if (body.link.length < 1) return "Enter something!";
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
      const link = body.link;
      if (link.length < 1) {
        return <UrlEntry url={link} errors="Enter something!" />;
      }
      if (!isValidUrl(link)) {
        return <UrlEntry url={link} errors="Not a valid URL" />;
      }
      try {
        const id = nanoid(8);
        createLink({ longLink: link, shortLink: id });
        const shorturl = `${process.env.LINK}/${id.toString()}`;
        return (
          <>
            <div class="p-4 flex flex-col gap-4">
              <script>var clipboard = new ClipboardJS("#copy")</script>
              <p
                id="short-url"
                class="p-4 rounded-lg text-xl bg-white text-black"
              >
                {shorturl}
              </p>
              <div class="gap-2 flex flex-row justify-around">
                <a
                  class="border-2 border-black grow bg-slate-400 justify-center flex align-middle p-1 rounded-lg"
                  href={shorturl}
                >
                  <img
                    alt="goto"
                    class="object-scale-down h-24"
                    src="/public/goto.svg"
                  ></img>
                </a>
                <button
                  class="border-2 p-1 rounded-lg border-black grow flex bg-slate-400 align-middle justify-center"
                  id="copy"
                  hx-get="/copy"
                  hx-target="#error"
                  data-clipboard-text={`${shorturl}`}
                >
                  <img
                    alt="copy"
                    src="/public/copy.svg"
                    class="object-scale-down h-24"
                  ></img>
                </button>
                <button
                  class="border-2 border-black grow flex items-center p-1 justify-center align-middle bg-slate-400 rounded-lg"
                  hx-get="/redo"
                  hx-target="#container"
                  hx-swap="innerHtml"
                >
                  <img
                    src="/public/redo.svg"
                    class="object-scale-down h-24"
                    alt="redo"
                  ></img>
                </button>
              </div>
            </div>
            <p id="error" class="text-black h-6"></p>
          </>
        );
      } catch (error) {
        console.log(error);
        return (
          <UrlEntry
            url={link}
            errors="Something went wrong please try again!"
          />
        );
      }
    },
    { body: t.Object({ link: t.String() }) }
  )
  .get("/copy", () => "Copied your short url!")
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        const re = await getLongLink(id);
        if (!re) {
          set.status = 404;
          set.redirect = "/";
          return;
        }
        set.status = 302;
        set.redirect = re;
      } catch (error) {
        console.log(error);
        set.status = 404;
        set.redirect = "/";
        return;
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .get("/redo", ({}) => {
    return <UrlEntry url={""} />;
  })
  .listen(process.env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
