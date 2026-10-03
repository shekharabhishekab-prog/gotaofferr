import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

/**
 * Agents (and curl) that don't ask for HTML get a short markdown 404 body that
 * tells them where to look next. Browsers still get the styled 404 page.
 */
function agentNotFoundMarkdown(pathname: string): string {
  return [
    "# 404 — Page not found",
    "",
    `No page exists at \`${pathname}\` on gotaofferr.com.`,
    "",
    "## Where to look next",
    "",
    "- [/llms.txt](https://gotaofferr.com/llms.txt): what this site does and when to use it",
    "- [/sitemap.xml](https://gotaofferr.com/sitemap.xml): every indexable URL",
    "- [/](https://gotaofferr.com/): home",
    "- [/tailor](https://gotaofferr.com/tailor): tailor a resume to a job description",
    "- [/jobs](https://gotaofferr.com/jobs): job finder",
    "- [/pricing](https://gotaofferr.com/pricing): plans and pricing",
    "- [/contact](https://gotaofferr.com/contact): support",
    "",
  ].join("\n");
}

function wantsHtml(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/html");
}

function markdownNotFound(request: Request, response: Response): Response {
  const pathname = new URL(request.url).pathname;
  const headers = new Headers(response.headers);
  headers.set("content-type", "text/markdown; charset=utf-8");
  headers.delete("content-length");
  headers.delete("content-encoding");
  return new Response(agentNotFoundMarkdown(pathname), { status: 404, headers });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      if (
        normalized.status === 404 &&
        request.method === "GET" &&
        !wantsHtml(request) &&
        !(normalized.headers.get("content-type") ?? "").includes("text/markdown")
      ) {
        return markdownNotFound(request, normalized);
      }
      return normalized;
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
