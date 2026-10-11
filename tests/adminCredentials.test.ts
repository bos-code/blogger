import { test } from "node:test";
import assert from "node:assert/strict";
import { createPrivateKey, generateKeyPairSync } from "node:crypto";
import { normalizePrivateKey, readAdminCredentials, isAdminConfigured } from "../api/_lib/adminCredentials.ts";

// A throwaway key, generated for the test.
const pem = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const escaped = pem.replace(/\n/g, "\\n"); // how it appears inside the JSON file
const isValidKey = (key: string) => {
  createPrivateKey(key);
  return true;
};

test("reads the whole service-account JSON", () => {
  const json = JSON.stringify({ project_id: "p1", client_email: "svc@p1.iam.gserviceaccount.com", private_key: pem });
  const credentials = readAdminCredentials({ FIREBASE_SERVICE_ACCOUNT: json });
  assert.equal(credentials?.projectId, "p1");
  assert.ok(isValidKey(credentials!.privateKey));
});

test("reads three separate values, falling back to the web project id", () => {
  const credentials = readAdminCredentials({
    FIREBASE_CLIENT_EMAIL: " svc@p1.iam.gserviceaccount.com ",
    FIREBASE_PRIVATE_KEY: escaped,
    VITE_FIREBASE_PROJECT_ID: "p1",
  });
  assert.equal(credentials?.clientEmail, "svc@p1.iam.gserviceaccount.com");
  assert.equal(credentials?.projectId, "p1");
  assert.ok(isValidKey(credentials!.privateKey));
});

test("repairs common copy-paste damage in the private key", () => {
  const body = pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "").replace(/\s+/g, "");
  for (const pasted of [
    `"${escaped}"`, // copied with the quotes
    `-----BEGIN PRIVATE KEY----- ${body} -----END PRIVATE KEY-----`, // line breaks lost
    `  ${pem.replace(/\n/g, "\r\n")}  `, // Windows line endings and spaces
  ]) {
    assert.ok(isValidKey(normalizePrivateKey(pasted)));
  }
});

test("reports when nothing usable is configured", () => {
  assert.equal(readAdminCredentials({}), null);
  assert.equal(readAdminCredentials({ FIREBASE_CLIENT_EMAIL: "svc@x", FIREBASE_PRIVATE_KEY: "nope", FIREBASE_PROJECT_ID: "p" }), null);
  assert.equal(isAdminConfigured({}), false);
  assert.equal(isAdminConfigured({ FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080" }), true);
});
