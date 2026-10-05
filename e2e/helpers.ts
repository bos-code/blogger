import { expect, type Page } from "@playwright/test";

export const PASSWORD = "password123";

export const login = async (page: Page, email: string) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin/);
};

/** Fails the test on uncaught page errors. */
export const trackPageErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
};

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024;

/** Opens a dashboard screen from the sidebar (or the mobile drawer). */
export const openDashboardScreen = async (page: Page, label: string) => {
  // Matches "Messages" and "Messages 2 unread" but not "Saved posts" for "Posts".
  const name = new RegExp(`^${label}(\\s|$)`);
  if (isMobile(page)) {
    await page.getByRole("button", { name: "Open dashboard menu" }).click();
    await page.getByRole("dialog", { name: "Dashboard menu" }).getByRole("button", { name }).click();
  } else {
    await page.getByRole("navigation", { name: "Dashboard" }).getByRole("button", { name }).click();
  }
};
