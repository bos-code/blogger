import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

// Vercel's Node 22 functions load dependencies with plain require(), which
// can't load ESM-only packages. firebase-admin 14 pulls in one (jose 6) and
// crashed every API route there, so make sure the server SDK still loads that way.
test("firebase-admin loads with require() (as on Vercel)", () => {
  const output = execFileSync(
    process.execPath,
    ["--no-experimental-require-module", "-e", "require('firebase-admin/auth'); require('firebase-admin/firestore'); console.log('ok')"],
    { encoding: "utf8" }
  );
  assert.equal(output.trim(), "ok");
});
