import assert from "node:assert/strict";
import test from "node:test";
import { fillDays } from "../src/utils/analytics.ts";

test("fillDays returns a continuous range ending today", () => {
  const today = new Date("2026-10-05T12:00:00Z");
  const result = fillDays([{ date: "2026-10-04", views: 7, posts: {} }], 3, today);
  assert.deepEqual(
    result.map((day) => [day.date, day.views]),
    [["2026-10-03", 0], ["2026-10-04", 7], ["2026-10-05", 0]]
  );
});
