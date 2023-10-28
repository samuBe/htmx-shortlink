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
      <html lang="en" hx-boost>
        <head>
          <meta charset="UTF-8" />
          <title>Short links by Samuel</title>
          <link href="/public/output.css" rel="stylesheet" />
          <script src="/public/htmx.min.js"></script>
          <script src="https://unpkg.com/clipboard@2/dist/clipboard.min.js"></script>
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

const BigButton = (props: Html.PropsWithChildren<{ attributes }>) => {
  return (
    <div {attributes} >
      {props.children}
    </div>
  );
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
          <button hx-post="/submit" hx-swap="innerHtml" hx-target="#container" id="submit" class="border-black p-8 border-2 text-3xl bg-slate-400 font-bold rounded-lg">
            SHORTEN MY URL!
          </button>
      </div>
      <p id="error" class="text-red-600 h-6">
        {props.errors ?? ""}
      </p>
    </form>
  );
};

interface KeyVal {
  [key: string]: string;
}

const links: KeyVal = {
  "1": "https://sambe.uk",
  "2": "https://samuelberton.com",
};

let maxId = 2;

const app = new Elysia()
  .use(html())
  .use(staticPlugin())
  .get("/", () => (
    <Layout>
      <div class="flex bg-gradient-to-r from-slate-400 to-slate-200 align-middle justify-center items-center h-screen w-screen">
        <div class="flex flex-col">
          <h1 class="text-5xl text-center font-extrabold justify-center align-middle">
            Generate short links using HTMX
          </h1>
          <div class="p-6" id="container">
            <UrlEntry />
          </div>
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
      if (!isValidUrl(link)) {
        return <UrlEntry />;
      }
      const id = maxId + 1;
      maxId++;
      links[id.toString()] = body.link;
      const shorturl = `https://localhost:3000/${id.toString()}`;
      return (
        <>
        <div class="p-4 flex flex-col gap-4">
          <script>var clipboard = new ClipboardJS("#copy")</script>
          <p id="short-url" class="p-4 rounded-lg text-xl bg-white text-black">
            {shorturl}
          </p>
          <div class="gap-2 flex flex-row justify-around">
            <a class="border-2 border-black grow bg-slate-400 justify-center flex align-middle p-1 rounded-lg" href={shorturl}>
            <img alt="goto" class="object-scale-down h-24" src="/public/goto.svg"></img>
            </a>
            <button class="border-2 p-1 rounded-lg border-black grow flex bg-slate-400 align-middle justify-center" id="copy" hx-get="/copy" hx-target="#error" data-clipboard-text={`${shorturl}`}>
            <img alt="copy" src="/public/copy.svg" class="object-scale-down h-24"></img>
            </button>
            <button class="border-2 border-black grow flex items-center p-1 justify-center align-middle bg-slate-400 rounded-lg" hx-get="/redo" hx-target="#container" hx-swap="innerHtml">
            <img src="/public/redo.svg" class="object-scale-down h-24" alt="redo"></img>
            </button>
          </div>
        </div>
      <p id="error" class="text-black h-6"></p>
        </>
      );
    },
    { body: t.Object({ link: t.String() }) }
  )
  .get("/copy", () => "Copied your short url!")
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
  .get("/redo", ({}) => {
    return <UrlEntry url={""} />;
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
