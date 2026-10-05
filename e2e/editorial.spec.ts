import { expect, test } from "@playwright/test";
import { login, openDashboardScreen, trackPageErrors } from "./helpers";

test("writer drafts with autosave and submits; admin publishes", async ({ page, browser }) => {
  const errors = trackPageErrors(page);
  const title = `E2E post ${Date.now()}`;

  await login(page, "writer@example.com");
  await page.goto("/edit");
  await page.getByLabel("Title", { exact: true }).fill(title);
  const editor = page.locator(".tiptap-editor");
  await editor.click();
  await page.keyboard.type("Intro paragraph for the end-to-end test.");
  await page.keyboard.press("Enter");

  // Slash menu inserts a heading.
  await page.keyboard.type("/h2");
  await expect(page.getByRole("listbox", { name: "Insert block" })).toBeVisible();
  await page.keyboard.press("Enter");
  await page.keyboard.type("A section heading");
  await page.keyboard.press("Enter");
  await page.keyboard.type("More body text after the heading.");
  await expect(editor.locator("h2")).toHaveText("A section heading");

  // Autosave creates the draft and moves to its edit URL.
  await expect(page).toHaveURL(/\/edit\/[A-Za-z0-9]+$/, { timeout: 15_000 });
  await expect(page.getByText(/Saved ·/).filter({ visible: true }).first()).toBeVisible();

  // Survives a reload.
  await page.reload();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(title);
  await expect(page.locator(".tiptap-editor h2")).toHaveText("A section heading");

  // Preview renders the article.
  await page.getByRole("button", { name: "Preview" }).click();
  await expect(page.locator(".article-content h2")).toHaveText("A section heading");
  await page.getByRole("button", { name: "Write" }).click();

  await page.getByRole("button", { name: "Submit for review" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByText("Submitted for review")).toBeVisible();

  // Admin sees it in the review queue and publishes it.
  const adminContext = await browser.newContext({ locale: "en-US" });
  const admin = await adminContext.newPage();
  await login(admin, "admin@example.com");
  await expect(admin.getByRole("heading", { name: "Review queue" })).toBeVisible();
  await expect(admin.getByText(title)).toBeVisible();
  await openDashboardScreen(admin, "Posts");
  await admin.getByRole("button", { name: `Publish "${title}"` }).first().click();
  await admin.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(admin.getByText("Post published")).toBeVisible();
  await adminContext.close();

  // Writer gets notified and the post is public.
  await page.goto("/admin");
  await page.getByRole("button", { name: /Notifications/ }).click();
  await expect(page.getByText(`Your post "${title}" was published`)).toBeVisible();
  await page.goto("/blog");
  await expect(page.getByText(title)).toBeVisible();
  expect(errors).toEqual([]);
});

test("admin dashboard, messages, categories and users", async ({ page }) => {
  const errors = trackPageErrors(page);
  await login(page, "admin@example.com");
  await expect(page.getByRole("heading", { name: "Views, last 30 days" })).toBeVisible();
  await expect(page.getByRole("img", { name: /Daily views/ })).toBeVisible();

  await openDashboardScreen(page, "Messages");
  await expect(page.getByRole("heading", { name: "Messages" })).toBeVisible();
  await page.getByRole("button", { name: /Jordan Client/ }).click();
  await expect(page.getByRole("link", { name: "Reply by email" })).toBeVisible();

  await openDashboardScreen(page, "Categories");
  const category = `Cat${Date.now() % 100000}`;
  await page.getByLabel("New category name").fill(category);
  await page.getByRole("button", { name: /Add Category/i }).click();
  await expect(page.getByRole("heading", { name: category })).toBeVisible();

  await openDashboardScreen(page, "Users");
  await expect(page.getByText("writer@example.com")).toBeVisible();

  await openDashboardScreen(page, "Projects");
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
