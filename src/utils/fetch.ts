import { YAZIO_BASE_URL, YAZIO_USER_AGENT } from "@/utils/constants";

/**
 * Utility function to automatically fetch from the given base URL. If an
 * explicit URL is provided (string starting with `http`), it will be used.
 *
 * @param input - The URL or endpoint to fetch from.
 * @param init - The fetch options.
 *
 * @returns - Promise resolving the JSON data of the response body.
 */
export const fetchYazio = <T>(
  input: Parameters<typeof fetch>[0],
  init: Parameters<typeof fetch>[1]
) => {
  const headers = new Headers(init?.headers);
  if (!headers.has("User-Agent")) headers.set("User-Agent", YAZIO_USER_AGENT);
  return fetch(
    typeof input === "string" && !input.startsWith("http")
      ? `${YAZIO_BASE_URL}${input}`
      : input,
    { ...init, headers }
  ).then((res) => {
    if (!res.ok)
      throw new Error(
        `Error fetching \`${input}\`. (${res.status} ${res.statusText})`
      );

    if (res.status === 204) return Promise.resolve() as Promise<T>;

    return res.json() as Promise<T>;
  });
};
