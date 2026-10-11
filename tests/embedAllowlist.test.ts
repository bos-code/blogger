import { test } from "node:test";
import assert from "node:assert/strict";
import { isAllowedEmbedSrc } from "../src/utils/embedAllowlist.ts";

test("allows embeds from known providers", () => {
  for (const src of [
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    "https://codepen.io/someone/embed/abcXYZ?default-tab=result",
    "https://codesandbox.io/embed/abc123",
  ]) {
    assert.equal(isAllowedEmbedSrc(src), true, src);
  }
});

test("rejects everything else", () => {
  for (const src of [
    null,
    "",
    "javascript:alert(1)",
    "http://www.youtube.com/embed/abc",
    "https://evil.example/embed/abc",
    "https://www.youtube.com.evil.example/embed/abc",
    "https://user:pass@www.youtube.com/embed/abc",
    "https://www.youtube.com/watch?v=abc",
    "https://codepen.io/someone/pen/abc",
    "data:text/html,<script>alert(1)</script>",
  ]) {
    assert.equal(isAllowedEmbedSrc(src), false, String(src));
  }
});
