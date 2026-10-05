import { expect, test } from "@playwright/test";
import { trackPageErrors } from "./helpers";

test.describe("public site", () => {
  test("home page renders every section and working links", async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Chidera");
    for (const id of ["about", "stack", "work", "blog", "contact"]) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Download CV" }).first()).toHaveAttribute("href", "/John-Dera-Resume.pdf");
    const cv = await page.request.get("/John-Dera-Resume.pdf");
    expect(cv.status()).toBe(200);
    await expect(page.locator("#blog").getByText("When do you actually need useEffect?")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("experience timeline, RSS feed and newsletter signup", async ({ page }) => {
    await page.goto("/#experience");
    await expect(page.getByRole("heading", { name: "Where I've been" })).toBeVisible();
    await expect(page.getByText("Lagos State University (LASU)")).toBeVisible();

    const rss = await page.request.get("/rss.xml");
    expect(rss.status()).toBe(200);
    expect(await rss.text()).toContain("When do you actually need useEffect?");

    await page.goto("/blog");
    const email = page.getByLabel("Email address").first();
    await email.fill("not-an-email");
    await page.getByRole("button", { name: "Subscribe" }).first().click();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await email.fill(`e2e-${Date.now()}@example.com`);
    await page.getByRole("button", { name: "Subscribe" }).first().click();
    await expect(page.getByText("Check your inbox to confirm your subscription.")).toBeVisible();
  });

  test("contact form validates and sends", async ({ page }) => {
    await page.goto("/#contact");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText("Please enter at least 3 characters.")).toBeVisible();
    await page.getByLabel("Your name").fill("Test Person");
    await page.getByLabel("Your email").fill("test@example.com");
    await page.getByLabel("Message").fill("Hello there, this is an end-to-end test message.");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText("Message sent!")).toBeVisible();
    await expect(page.getByLabel("Your name")).toHaveValue("");
  });

  test("blog search, filters and post page", async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto("/blog");
    await expect(page.getByRole("heading", { level: 1, name: "Blog" })).toBeVisible();
    // Drafts and pending posts are never listed publicly.
    await expect(page.getByText("Accessible forms in React")).toHaveCount(0);

    await page.getByRole("searchbox", { name: "Search posts" }).last().fill("css");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page).toHaveURL(/q=css/);
    await expect(page.getByText("Modern CSS layout with grid and container queries")).toBeVisible();
    await expect(page.getByText("Thinking in React state")).toHaveCount(0);

    await page.goto("/blog?category=React");
    await expect(page.getByText("Thinking in React state")).toBeVisible();

    await page.goto("/blog/use-effect");
    await expect(page).toHaveURL(/\/blog\/use-effect\/when-do-you-actually-need-useeffect$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("When do you actually need useEffect?");
    await expect(page.locator(".article-content pre code.hljs")).toBeVisible();
    await expect(page.locator(".code-copy-button")).toHaveCount(1);
    await expect(page.getByText("React foundations").first()).toBeVisible();
    await expect(page.getByText("Glad it helped!")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Keep reading" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("protected pages redirect to login and back", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
    await page.getByLabel("Email").fill("reader@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page).toHaveURL(/\/admin/);
  });

  test("wrong password shows a helpful message", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("reader@example.com");
    await page.getByLabel("Password", { exact: true }).fill("not-the-password");
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("Incorrect email or password");
  });

  test("unknown routes show the 404 page", async ({ page }) => {
    await page.goto("/definitely-not-a-page");
    await expect(page.getByRole("heading", { name: "This page doesn't exist" })).toBeVisible();
  });

  test("no horizontal overflow on key pages", async ({ page }) => {
    for (const path of ["/", "/blog", "/blog/use-effect", "/login", "/signup", "/privacy"]) {
      await page.goto(path);
      await page.waitForTimeout(800);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);
    }
  });
});
