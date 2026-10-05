import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateReadingTime,
  getExcerpt,
  htmlToText,
  postPath,
  slugify,
  truncateText,
} from "../src/utils/posts.ts";

test("htmlToText strips tags and decodes common entities", () => {
  assert.equal(htmlToText("<h1>Hi&nbsp;there</h1><p>A &amp; B</p>"), "Hi there A & B");
});

test("calculateReadingTime is at least one minute", () => {
  assert.equal(calculateReadingTime(""), 1);
  assert.equal(calculateReadingTime(`<p>${"word ".repeat(401)}</p>`), 3);
});

test("truncateText only adds an ellipsis when it cuts", () => {
  assert.equal(truncateText("short", 10), "short");
  assert.equal(truncateText("one two three four five", 12), "one two…");
});

test("getExcerpt prefers the saved excerpt", () => {
  assert.equal(getExcerpt({ content: "<p>Body</p>", excerpt: "Saved" }), "Saved");
  assert.equal(getExcerpt({ content: "<p>Body</p>", excerpt: "" }), "Body");
});

test("slugify produces URL-safe slugs", () => {
  assert.equal(slugify("Héllo, World! React & TS"), "hello-world-react-ts");
  assert.equal(slugify("!!!"), "");
});

test("postPath keeps the id first", () => {
  assert.equal(postPath({ id: "abc", title: "My Post" }), "/blog/abc/my-post");
  assert.equal(postPath({ id: "abc", title: "" }), "/blog/abc");
});

test("addHeadingIds adds unique ids and lists headings", async () => {
  const { addHeadingIds } = await import("../src/utils/posts.ts");
  const { html, headings } = addHeadingIds(
    '<h2>Intro</h2><p>x</p><h2 class="a">Intro</h2><h3>Deep <em>dive</em></h3><h2></h2>'
  );
  assert.equal(
    html,
    '<h2 id="intro">Intro</h2><p>x</p><h2 class="a" id="intro-2">Intro</h2><h3 id="deep-dive">Deep <em>dive</em></h3><h2></h2>'
  );
  assert.deepEqual(
    headings.map((heading) => [heading.id, heading.level]),
    [["intro", 2], ["intro-2", 2], ["deep-dive", 3]]
  );
});
