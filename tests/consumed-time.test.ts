import { afterAll, expect, spyOn, test } from "bun:test";
import { Yazio } from "@/index";

const fetchSpy = spyOn(globalThis, "fetch");
afterAll(() => fetchSpy.mockRestore());

test("diary writes preserve local time and day; ambiguous dates never reach YAZIO", async () => {
  fetchSpy.mockResolvedValue(new Response(null, { status: 204 }));
  const client = new Yazio({ token: {
    token_type: "Bearer", access_token: "synthetic", refresh_token: "synthetic",
    expires_in: 3600, expires_at: Date.now() + 3600000,
  } });
  const entry = {
    id: "00000000-0000-4000-8000-000000000001",
    product_id: "00000000-0000-4000-8000-000000000002",
    date: "2026-10-22 00:30:45", daytime: "snack" as const,
    amount: 100, serving: null, serving_quantity: null,
  };
  await client.user.addConsumedItem(entry);
  const [url, options] = fetchSpy.mock.calls[0]!;
  expect(url).toBe("https://yzapi.yazio.com/v20/user/consumed-items");
  expect(JSON.parse(options?.body as string).products[0].date).toBe(entry.date);
  for (const date of ["2026-10-22", "2026-10-22T00:30:45+03:00", "2026-02-30 12:00:00", "2026-10-22 24:00:00"]) {
    await expect(client.user.addConsumedItem({ ...entry, date })).rejects.toThrow("YYYY-MM-DD HH:mm:ss");
  }
  expect(fetchSpy.mock.calls).toHaveLength(1);
  fetchSpy.mockResolvedValue(new Response('{}'));
  await client.user.getConsumedItems({ date: "2026-10-22" });
  expect(fetchSpy.mock.calls[1]![0]).toBe("https://yzapi.yazio.com/v20/user/consumed-items?date=2026-10-22");
});
