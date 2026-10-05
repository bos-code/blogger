import assert from "node:assert/strict";
import test from "node:test";
import { suggestExcerpt, suggestTags } from "../src/utils/contentSuggestions.ts";

test("suggestExcerpt keeps whole sentences within the limit", () => {
  const html = "<p>React hooks are great. They simplify state. Effects run after render.</p>";
  assert.equal(suggestExcerpt(html, 50), "React hooks are great. They simplify state.");
});

test("suggestExcerpt handles empty content", () => {
  assert.equal(suggestExcerpt("<p></p>"), "");
});

test("suggestTags ranks repeated meaningful words and skips stop words", () => {
  const tags = suggestTags("React hooks", "<p>React hooks and more hooks with react state</p>");
  assert.deepEqual(tags.slice(0, 2), ["react", "hooks"]);
  assert.ok(!tags.includes("with"));
});
