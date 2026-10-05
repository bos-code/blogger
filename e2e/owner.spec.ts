import { expect, test } from "@playwright/test";
import { isMobile, login } from "./helpers";

test("the site owner's account is promoted to super admin on sign-in", async ({ page }) => {
  await login(page, "chidera9713@gmail.com");
  if (isMobile(page)) await page.getByRole("button", { name: "Open dashboard menu" }).click();
  await expect(page.getByText(/super admin/i).filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /^Users/ }).filter({ visible: true }).first()).toBeVisible();
});

test("other accounts cannot make themselves super admin", async ({ request }) => {
  const auth = await request.post(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key",
    { data: { email: "reader@example.com", password: "password123", returnSecureToken: true } }
  );
  const { idToken, localId } = await auth.json();
  const response = await request.patch(
    `http://127.0.0.1:8080/v1/projects/demo-blogger/databases/(default)/documents/users/${localId}?updateMask.fieldPaths=role`,
    {
      headers: { Authorization: `Bearer ${idToken}` },
      data: { fields: { role: { stringValue: "super_admin" } } },
    }
  );
  expect(response.status()).toBe(403);
});
