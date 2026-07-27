import assert from "node:assert/strict";
import test from "node:test";
import type { BlogPost, DateValue } from "../src/types/index.ts";
import {
  isPostPublic,
  toDate,
  toDateTimeLocalValue,
  toTimestamp,
} from "../src/utils/date.ts";

const createPost = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  id: "post-1",
  title: "A reliable CMS",
  content: "<p>Published content</p>",
  authorId: "author-1",
  authorName: "Author",
  status: "approved",
  ...overrides,
});

test("toDate normalizes supported date values", () => {
  const expected = new Date("2026-07-27T08:30:00.000Z");
  const timestampLike = {
    toDate: () => expected,
  } as unknown as DateValue;

  assert.equal(toDate(expected), expected);
  assert.equal(toDate(expected.toISOString())?.getTime(), expected.getTime());
  assert.equal(toDate(expected.getTime())?.getTime(), expected.getTime());
  assert.equal(toDate(timestampLike), expected);
  assert.equal(toDate(null), null);
  assert.equal(toDate("not-a-date"), null);
});

test("toTimestamp returns a sortable value and safely handles invalid input", () => {
  assert.equal(toTimestamp("2026-07-27T08:30:00.000Z"), 1785141000000);
  assert.equal(toTimestamp(undefined), 0);
  assert.equal(toTimestamp("invalid"), 0);
});

test("isPostPublic enforces moderation and scheduling", () => {
  const now = Date.parse("2026-07-27T12:00:00.000Z");

  assert.equal(isPostPublic(createPost(), now), true);
  assert.equal(
    isPostPublic(createPost({ status: "draft" }), now),
    false
  );
  assert.equal(
    isPostPublic(
      createPost({ scheduledFor: "2026-07-27T13:00:00.000Z" }),
      now
    ),
    false
  );
  assert.equal(
    isPostPublic(
      createPost({ scheduledFor: "2026-07-27T11:00:00.000Z" }),
      now
    ),
    true
  );
  assert.equal(
    isPostPublic(createPost({ status: undefined }), now),
    true
  );
});

test("toDateTimeLocalValue formats a value for datetime-local inputs", () => {
  const localDate = new Date(2026, 6, 27, 9, 5);

  assert.equal(toDateTimeLocalValue(localDate), "2026-07-27T09:05");
  assert.equal(toDateTimeLocalValue("invalid"), "");
});
