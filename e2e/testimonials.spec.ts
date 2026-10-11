import { expect, test } from "@playwright/test";
import { login, openDashboardScreen } from "./helpers";

// Changes shared data, so it runs once (desktop).
test.skip(({ isMobile }) => isMobile, "Runs once on desktop; it changes shared data.");

test("client testimonial: submit, approve, publish, comment", async ({ browser }) => {
  const quote = `Working together was smooth and the app is fast ${Date.now()}`;

  // A client leaves a testimonial on a project page, without an account.
  const client = await browser.newPage();
  await client.goto("/projects/forkify");
  await client.getByRole("button", { name: "Leave a testimonial" }).click();
  const dialog = client.getByRole("dialog", { name: "Write a testimonial" });
  await expect(dialog.getByLabel("Project")).toHaveValue("forkify");
  await dialog.getByLabel("Your name").fill("Tola Client");
  await dialog.getByLabel("Email or phone").fill("0803 123 4567");
  await dialog.getByLabel("Your role and company (optional)").fill("Product lead, Forkify");
  await dialog.locator("label").filter({ has: client.getByRole("radio", { name: "4 stars" }) }).click();
  await expect(dialog.getByRole("radio", { name: "4 stars" })).toBeChecked();
  await dialog.getByLabel("Your testimonial").fill(quote);
  await dialog.getByRole("button", { name: "Submit testimonial" }).click();
  await expect(dialog).toBeHidden();

  // It's private until approved.
  const visitor = await browser.newPage();
  await visitor.goto("/#testimonials");
  await expect(visitor.locator("#testimonials article").first()).toBeVisible();
  await expect(visitor.getByText(quote)).toHaveCount(0);

  // The admin approves it from the dashboard.
  const admin = await browser.newPage();
  await login(admin, "admin@example.com");
  await openDashboardScreen(admin, "Testimonials");
  const row = admin.locator("li", { hasText: quote });
  await expect(row.getByText("Project: Forkify")).toBeVisible();
  await expect(row.getByRole("link", { name: "0803 123 4567" })).toHaveAttribute("href", "https://wa.me/2348031234567");
  await row.getByRole("button", { name: "Approve" }).click();
  await expect(admin.locator("li", { hasText: quote })).toHaveCount(0);

  // Now public (on the next page load): on the home page (tagged) and on the project page.
  await visitor.reload();
  const card = visitor.locator("#testimonials article", { hasText: quote });
  await expect(card.getByRole("link", { name: "on Forkify" })).toBeVisible();
  await expect(card.getByRole("img", { name: "Rated 4 out of 5" })).toBeVisible();
  await expect(card.getByText("Tola Client")).toBeVisible();
  await expect(visitor.getByText("0803 123 4567")).toHaveCount(0);
  await visitor.goto("/projects/forkify");
  await expect(visitor.getByText(quote)).toBeVisible();

  // Someone else comments on the testimonial, and on the project.
  const other = await browser.newPage();
  await login(other, "writer@example.com");
  await other.goto("/#testimonials");
  const otherCard = other.locator("#testimonials article", { hasText: quote });
  await otherCard.getByRole("button", { name: "Comments" }).click();
  await otherCard.getByPlaceholder("Share your thoughts").fill("Great to hear it went well!");
  await otherCard.getByRole("button", { name: "Comment", exact: true }).click();
  await expect(otherCard.getByText("Great to hear it went well!")).toHaveCount(1);

  await other.goto("/projects/forkify");
  const projectComment = `Love the side-panel recipe view ${Date.now()}`;
  await other.getByPlaceholder("Share your thoughts").last().fill(projectComment);
  await other.getByRole("button", { name: "Comment", exact: true }).last().click();
  await expect(other.getByText(projectComment)).toHaveCount(1);
});
