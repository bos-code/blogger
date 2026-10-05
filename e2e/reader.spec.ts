import { expect, test } from "@playwright/test";
import { login, openDashboardScreen, trackPageErrors } from "./helpers";

test("reader can like, save, comment and reply", async ({ page }) => {
  const errors = trackPageErrors(page);
  await login(page, "reader@example.com");

  // Hard refresh on a protected route keeps the session.
  await page.reload();
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByRole("heading", { name: /Welcome, Riley/ })).toBeVisible();

  await page.goto("/blog/modern-css");
  // Toggle like (works whether or not an earlier run liked it).
  const like = page.getByRole("button", { name: /^(Like|Unlike) "Modern CSS layout/ }).first();
  const wasLiked = (await like.getAttribute("aria-pressed")) === "true";
  await like.click();
  await expect(like).toHaveAttribute("aria-pressed", wasLiked ? "false" : "true");

  const save = page.getByRole("button", { name: /^(Save for later|Remove from saved posts)$/ }).first();
  if ((await save.getAttribute("aria-pressed")) !== "true") {
    await save.click();
    await expect(save).toHaveAttribute("aria-pressed", "true");
  }

  const text = `E2E comment ${Date.now()}`;
  await page.getByLabel("Share your thoughts").fill(text);
  await page.getByRole("button", { name: "Comment", exact: true }).click();
  await expect(page.getByLabel("Share your thoughts")).toHaveValue("");
  await expect(page.locator("article p", { hasText: text })).toBeVisible();

  const comment = page.locator("li > article", { hasText: text });
  await comment.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Edit your comment").fill(`${text} (edited)`);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("article p", { hasText: `${text} (edited)` })).toBeVisible();
  await expect(page.locator("li > article", { hasText: `${text} (edited)` }).getByText("edited", { exact: false }).first()).toBeVisible();

  await page.locator("li > article", { hasText: `${text} (edited)` }).getByRole("button", { name: "Reply" }).click();
  await page.getByLabel(/Reply to/).fill(`Reply ${text}`);
  await page.getByRole("button", { name: "Reply", exact: true }).last().click();
  await expect(page.locator("li > article p", { hasText: `Reply ${text}` })).toBeVisible();

  await page.locator("li > article", { hasText: `${text} (edited)` }).getByRole("button", { name: "Delete" }).first().click();
  await page.getByRole("button", { name: "Delete", exact: true }).last().click();
  await expect(page.locator("article p", { hasText: `${text} (edited)` })).toHaveCount(0);

  await page.goto("/admin");
  await openDashboardScreen(page, "Saved posts");
  await expect(page.getByRole("heading", { name: "Saved posts" })).toBeVisible();
  await expect(page.getByText("Modern CSS layout with grid and container queries")).toBeVisible();

  // Readers can't open the editor.
  await page.goto("/edit");
  await expect(page).not.toHaveURL(/\/edit/);
  expect(errors).toEqual([]);
});
