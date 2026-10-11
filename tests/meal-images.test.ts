import { afterAll, afterEach, expect, spyOn, test } from "bun:test";
import { Yazio } from "@/index";
import { YazioAuth } from "@/auth";
import { getUserMealImages, UserMealImagesSchema } from "@/api";
import { fetchYazio } from "@/utils/fetch";
import { YAZIO_USER_AGENT, YAZIO_OAUTH_URL, YAZIO_CLIENT_ID } from "@/utils/constants";
import type { Token } from "@/types/auth";

const token: Token = { token_type: "Bearer", access_token: "test-access", refresh_token: "test-refresh", expires_in: 3600, expires_at: Date.now() + 3600000 };
const fetchSpy = spyOn(globalThis, "fetch");
afterEach(() => fetchSpy.mockReset());
afterAll(() => fetchSpy.mockRestore());

test("facade requests the date with Bearer and accepted app version", async () => {
  fetchSpy.mockResolvedValue(new Response(JSON.stringify({ lunch: "https://images.yazio-cdn.com/example.jpg" })));
  const images = await new Yazio({ token }).user.getMealImages({ date: "2026-10-09" });
  expect(images.lunch).toBe("https://images.yazio-cdn.com/example.jpg");
  const [url, init] = fetchSpy.mock.calls[0]!;
  expect(url).toBe("https://yzapi.yazio.com/v20/user/meal-images/2026-10-09");
  const headers = new Headers(init?.headers);
  expect(headers.get("Authorization")).toBe("Bearer test-access");
  expect(headers.get("User-Agent")).toBe(YAZIO_USER_AGENT);
});

test("empty days, Date inputs and invalid responses", async () => {
  fetchSpy.mockResolvedValue(new Response("{}"));
  expect(await getUserMealImages(token, { date: new Date("2026-10-10T00:00:00Z") })).toEqual({});
  expect(fetchSpy.mock.calls[0]![0]).toBe("https://yzapi.yazio.com/v20/user/meal-images/2026-10-10");
  expect(UserMealImagesSchema.safeParse({ lunch: ["https://example.com/image.jpg"] }).success).toBe(false);
  fetchSpy.mockResolvedValue(new Response('{"error":"version_blocked"}', { status: 403 }));
  await expect(getUserMealImages(token)).rejects.toThrow("403");
});

test("header merging preserves Headers values and caller User-Agent", async () => {
  fetchSpy.mockResolvedValue(new Response("{}"));
  await fetchYazio("/user", { headers: new Headers({ Authorization: "Bearer custom", "User-Agent": "custom-agent" }) });
  const headers = new Headers(fetchSpy.mock.calls[0]![1]?.headers);
  expect(headers.get("Authorization")).toBe("Bearer custom");
  expect(headers.get("User-Agent")).toBe("custom-agent");
});

test("login and refresh use v22 and current mobile OAuth client", async () => {
  fetchSpy.mockImplementation(async () => new Response(JSON.stringify(token)));
  await new YazioAuth({ credentials: { username: "example@example.com", password: "test" } }).authenticate();
  await new YazioAuth({ token: { ...token, expires_at: 0 } }).authenticate();
  expect(fetchSpy.mock.calls).toHaveLength(2);
  for (const [url, init] of fetchSpy.mock.calls) {
    expect(url).toBe(YAZIO_OAUTH_URL);
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
    expect(new Headers(init?.headers).get("User-Agent")).toBe(YAZIO_USER_AGENT);
    expect(JSON.parse(init?.body as string).client_id).toBe(YAZIO_CLIENT_ID);
  }
  expect(JSON.parse(fetchSpy.mock.calls[0]![1]?.body as string).grant_type).toBe("password");
  expect(JSON.parse(fetchSpy.mock.calls[1]![1]?.body as string).grant_type).toBe("refresh_token");
});

test("rejected legacy refresh falls back to credentials", async () => {
  fetchSpy.mockResolvedValueOnce(new Response("{}", { status: 400 }))
    .mockResolvedValueOnce(new Response(JSON.stringify(token)));
  const auth = new YazioAuth({ token: { ...token, expires_at: 0 }, credentials: { username: "example@example.com", password: "test" } });
  expect((await auth.authenticate()).access_token).toBe(token.access_token);
  expect(fetchSpy.mock.calls).toHaveLength(2);
});
