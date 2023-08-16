import { client } from "../../index.js";

type Replacements = {
  guild?: string | null;
  channel?: string | null;
  message?: string | null;
  interaction?: string | null;
  me?: string | null;
  bot?: string | null;
};

export function prepareHttp(r: Replacements) {
  return {
    get: async (path: string, body?: BodyInit, headers?: HeadersInit) => request("get", path, r, body, headers),
    head: async (path: string, body?: BodyInit, headers?: HeadersInit) => request("head", path, r, body, headers),
    post: async (path: string, body?: BodyInit, headers?: HeadersInit) => request("post", path, r, body, headers),
    put: async (path: string, body?: BodyInit, headers?: HeadersInit) => request("put", path, r, body, headers),
    del: async (path: string, body?: BodyInit, headers?: HeadersInit) => request("delete", path, r, body, headers),
    connect: async (path: string, body?: BodyInit, headers?: HeadersInit) => request("connect", path, r, body, headers),
    options: async (path: string, body?: BodyInit, headers?: HeadersInit) => request("options", path, r, body, headers),
    trace: async (path: string, body?: BodyInit, headers?: HeadersInit) => request("trace", path, r, body, headers),
    patch: async (path: string, body?: BodyInit, headers?: HeadersInit) => request("patch", path, r, body, headers),
  };
}

async function request(
  method: string,
  path: string,
  replacements: Replacements,
  body?: BodyInit,
  headers?: HeadersInit,
) {
  const url = path.startsWith("/")
    ? `https://discord.com/api${path}`
        .replaceAll(":guild", replacements.guild ?? "")
        .replaceAll(":channel", replacements.channel ?? "")
        .replaceAll(":message", replacements.message ?? "")
        .replaceAll(":interaction", replacements.interaction ?? "")
        .replaceAll(":me", replacements.me ?? "")
        .replaceAll(":bot", replacements.bot ?? "")
    : path;

  const res = await fetch(url, {
    method,
    body,
    headers: {
      Authorization: path.startsWith("/") ? `Bot ${client.token}` : "",
      ...headers,
    },
  });

  const json = await res.json().catch(() => undefined);
  if (json) return json;
  const text = await res.text().catch(() => undefined);
  if (text) return text;
  return res;
}
