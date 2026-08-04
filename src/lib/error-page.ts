import { isServerUnavailableError } from "./errors";

export function renderErrorPage(error?: unknown): string {
  const serverUnavailable = isServerUnavailableError(error);
  const title = serverUnavailable ? "We can’t reach our server" : "This page didn’t load";
  const body = serverUnavailable
    ? "Our website content is temporarily unavailable. Please try again in a moment."
    : "Something unexpected happened. Please try again.";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title} | Triple H Insurance Broker</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body { font: 15px/1.6 Inter, system-ui, -apple-system, sans-serif; background: #123a53; color: #fff; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 36rem; width: 100%; text-align: center; padding: 3.5rem 1rem; border-block: 1px solid rgba(255,255,255,.24); }
      .eyebrow { margin: 0; color: rgba(255,255,255,.68); font-size: .6875rem; letter-spacing: .24em; text-transform: uppercase; }
      h1 { font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 500; line-height: 1.15; margin: 1.5rem 0 0; }
      .body { color: rgba(255,255,255,.72); margin: 1.25rem auto 0; max-width: 28rem; }
      button { margin-top: 2.25rem; min-height: 2.75rem; padding: .6rem 1.25rem; font: inherit; font-weight: 600; cursor: pointer; border: 1px solid #fff; background: #fff; color: #123a53; }
      button:hover { background: rgba(255,255,255,.9); }
    </style>
  </head>
  <body>
    <main class="card">
      <p class="eyebrow">Triple H Insurance Broker</p>
      <h1>${title}</h1>
      <p class="body">${body}</p>
      <button type="button" onclick="location.reload()">Try again</button>
    </main>
  </body>
</html>`;
}
