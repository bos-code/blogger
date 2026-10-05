import assert from "node:assert/strict";
import test from "node:test";
import { getAuthErrorMessage, isPopupCancellation } from "../src/utils/authErrors.ts";

test("maps Firebase error codes to friendly messages", () => {
  assert.equal(
    getAuthErrorMessage({ code: "auth/invalid-credential", message: "Firebase: Error (auth/invalid-credential)." }),
    "Incorrect email or password. Please try again."
  );
  assert.equal(
    getAuthErrorMessage(new Error("Firebase: Error (auth/email-already-in-use).")),
    "An account with this email already exists. Please sign in instead."
  );
});

test("unknown Firebase errors use the fallback, not a config warning", () => {
  assert.equal(
    getAuthErrorMessage(new Error("Firebase: Error (auth/something-new)."), "Fallback"),
    "Fallback"
  );
});

test("plain errors keep their message", () => {
  assert.equal(getAuthErrorMessage(new Error("Email is required.")), "Email is required.");
});

test("detects popup cancellation", () => {
  assert.equal(isPopupCancellation({ code: "auth/popup-closed-by-user" }), true);
  assert.equal(isPopupCancellation({ code: "auth/invalid-credential" }), false);
});
