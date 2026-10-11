import { expect, test } from "@playwright/test";
import { login, openDashboardScreen } from "./helpers";

const FIRESTORE = "http://127.0.0.1:8080/v1/projects/demo-blogger/databases/(default)/documents";
const ADMIN = { Authorization: "Bearer owner" };

// Mutates the shared `projects` collection, so it runs once (desktop) and in series.
test.describe.configure({ mode: "serial" });
test.skip(({ isMobile }) => isMobile, "Runs once on desktop; it changes shared data.");

const clearProjects = async (request: import("@playwright/test").APIRequestContext) => {
  const list = await (await request.get(`${FIRESTORE}/projects?pageSize=200`, { headers: ADMIN })).json();
  for (const document of list.documents ?? []) {
    await request.delete(`http://127.0.0.1:8080/v1/${document.name}`, { headers: ADMIN });
  }
};

test.afterAll(async ({ request }) => clearProjects(request));

test("saved projects show without flashing the built-in list, and can be replaced", async ({ page, request }) => {
  // Same situation as a site that imported an older project list.
  await clearProjects(request);
  for (const [id, title, order] of [["legacy-1", "Old Portfolio", 1], ["legacy-2", "Old Store", 2]] as const) {
    await request.patch(`${FIRESTORE}/projects/${id}`, {
      headers: ADMIN,
      data: {
        fields: {
          title: { stringValue: title },
          slug: { stringValue: id },
          summary: { stringValue: `${title} summary` },
          imageUrl: { stringValue: "https://example.invalid/assets/old-hash.webp" },
          order: { integerValue: String(order) },
        },
      },
    });
  }

  // Record every project title that ever renders, to catch a brief flash of the wrong list.
  await page.addInitScript(() => {
    const seen = new Set<string>();
    (window as unknown as { __seenProjects: Set<string> }).__seenProjects = seen;
    new MutationObserver(() => {
      document.querySelectorAll("#project-list h3").forEach((heading) => seen.add(heading.textContent ?? ""));
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto("/");
  await expect(page.locator("#project-list h3")).toHaveText(["Old Portfolio", "Old Store"]);
  await page.waitForTimeout(1500);
  const seen = await page.evaluate(() => [...(window as unknown as { __seenProjects: Set<string> }).__seenProjects]);
  expect(seen.sort()).toEqual(["Old Portfolio", "Old Store"]);

  // The dashboard flags the difference and replaces the saved list in one go.
  await login(page, "admin@example.com");
  await openDashboardScreen(page, "Projects");
  await expect(page.getByRole("status").filter({ hasText: "differ from the" })).toBeVisible();
  await page.getByRole("button", { name: "Use the built-in list" }).click();
  await page.getByRole("button", { name: "Replace" }).click();
  await expect(page.getByText("Old Portfolio")).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: "differ from the" })).toHaveCount(0);

  await page.goto("/");
  await expect(page.locator("#project-list h3").first()).toHaveText("Yakoyo African Kitchen");
  await expect(page.getByText("Old Portfolio")).toHaveCount(0);
  const image = page.locator("#project-list img").first();
  await expect(image).toHaveAttribute("src", /^\/project-images\/.+\.webp$/);
  expect(await image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
});

test("the whole project card opens the project page; its buttons still work", async ({ page }) => {
  await page.goto("/#work");
  const card = page.locator("#work article", { hasText: "Yakoyo African Kitchen" });
  await card.scrollIntoViewIfNeeded();
  // The live-site and code buttons sit above the card link.
  const code = card.getByRole("link", { name: /Code|Live site/ }).first();
  const codeBox = await code.boundingBox();
  const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest("a")?.textContent ?? "", {
    x: codeBox!.x + codeBox!.width / 2,
    y: codeBox!.y + codeBox!.height / 2,
  });
  expect(hit).toMatch(/Code|Live site/);
  // Clicking the picture, away from the title and buttons, opens the project page.
  const box = await card.boundingBox();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + 60);
  await expect(page).toHaveURL(/\/projects\/yakoyo-kitchen$/);
  await expect(page.getByRole("heading", { level: 1, name: "Yakoyo African Kitchen" })).toBeVisible();
});
