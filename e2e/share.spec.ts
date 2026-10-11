import { expect, test } from "@playwright/test";
import { login, openDashboardScreen } from "./helpers";

// Changes shared data, so it runs once (desktop).
test.skip(({ isMobile }) => isMobile, "Runs once on desktop; it changes shared data.");

test("admin requests a testimonial for a project; the client answers from their personal page", async ({ browser }) => {
  const admin = await browser.newPage();
  await login(admin, "admin@example.com");
  await openDashboardScreen(admin, "Testimonials");
  await admin.getByRole("button", { name: "Request a testimonial" }).click();

  const dialog = admin.getByRole("dialog", { name: "Request a testimonial" });
  await dialog.getByLabel("Project").selectOption({ label: "Veloria Essence Spa" });
  await dialog.getByLabel("Client's name").fill("Ada Obi");
  await dialog.getByLabel("WhatsApp number (optional)").fill("0803 555 1234");
  await dialog.getByLabel("Email (optional)").fill("ada@example.com");
  await dialog.getByLabel("Personal note (optional)").fill("It was a joy building the booking flow with you.");
  await dialog.getByRole("button", { name: "Create request" }).click();

  // Ready to send: emailed from the site, plus WhatsApp with the message and picture.
  const send = admin.getByRole("dialog", { name: "Send to Ada" });
  await expect(send.getByText("Emailed to ada@example.com")).toBeVisible();
  await expect(send.getByRole("img", { name: "Veloria Essence Spa" })).toHaveAttribute("src", "/project-images/og/veloria-essence-spa.jpg");
  const message = await send.getByLabel("Message").inputValue();
  expect(message).toContain("Hi Ada,");
  expect(message).toContain("*Veloria Essence Spa*");
  expect(message).toContain("It was a joy building the booking flow with you.");
  const link = message.match(/https?:\/\/\S+\/testimonial\/[A-Za-z0-9_-]+/)?.[0];
  expect(link).toBeTruthy();
  const whatsapp = await send.getByRole("link", { name: "Send on WhatsApp" }).getAttribute("href");
  expect(whatsapp).toMatch(/^https:\/\/wa\.me\/2348035551234\?text=/);
  expect(decodeURIComponent(whatsapp!.split("text=")[1])).toContain(link!);
  await send.getByRole("button", { name: "Close" }).first().click();

  // Link previews (WhatsApp, LinkedIn…) get a card with the project picture.
  const token = link!.split("/").pop()!;
  const preview = await admin.request.get(`/api/share?request=${token}`, { maxRedirects: 0 });
  const previewHtml = await preview.text();
  expect(previewHtml).toContain('content="How was working on Veloria Essence Spa?"');
  expect(previewHtml).toMatch(/og:image" content="http[^"]+\/project-images\/og\/veloria-essence-spa\.jpg"/);

  await admin.getByRole("tab", { name: /Requests/ }).click();
  const requestRow = admin.locator("li", { hasText: "Ada Obi" }).first();
  await expect(requestRow.getByText("Sent", { exact: true })).toBeVisible();

  // The client opens their personal page: everything is filled in, no account needed.
  const client = await browser.newPage();
  await client.goto(new URL(link!).pathname);
  await expect(client.getByRole("heading", { name: "Hi Ada, how did it go?" })).toBeVisible();
  await expect(client.getByText("It was a joy building the booking flow with you.")).toBeVisible();
  await expect(client.getByLabel("Your name")).toHaveValue("Ada Obi");
  await expect(client.getByLabel("Email or phone")).toHaveValue("ada@example.com");
  await expect(client.getByText("Project: Veloria Essence Spa")).toBeVisible();
  const quote = `Bookings doubled after the new site went live ${Date.now()}`;
  await client.getByLabel("Your testimonial").fill(quote);
  await client.getByRole("button", { name: "Submit testimonial" }).click();
  await expect(client.getByRole("heading", { name: "Thank you, Ada!" })).toBeVisible();

  // The link works once.
  await client.reload();
  await expect(client.getByText("You've already sent your testimonial for this project.")).toBeVisible();

  // The admin sees it answered, and the testimonial waiting for approval.
  await admin.reload();
  await openDashboardScreen(admin, "Testimonials");
  const pending = admin.locator("li", { hasText: quote });
  await expect(pending.getByText(/Project: Veloria Essence Spa/)).toBeVisible();
  await expect(pending.getByText(/From your request/)).toBeVisible();
  await admin.getByRole("tab", { name: /Requests/ }).click();
  await expect(admin.locator("li", { hasText: "Ada Obi" }).first().getByText("Answered", { exact: true })).toBeVisible();
});

test("admin sends a published post to someone", async ({ page }) => {
  await login(page, "admin@example.com");
  await page.goto("/blog/use-effect");
  await page.getByRole("button", { name: "Send to someone" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Send this post" });
  await dialog.getByLabel("Their name (optional)").fill("Kemi Bello");
  await dialog.getByLabel("Email (optional)").fill("kemi@example.com");
  await dialog.getByLabel("Personal note (optional)").fill("This is the approach I mentioned.");
  await dialog.getByRole("button", { name: "Send email and continue" }).click();

  const send = page.getByRole("dialog", { name: "Send to Kemi" });
  await expect(send.getByText("Emailed to kemi@example.com")).toBeVisible();
  const message = await send.getByLabel("Message").inputValue();
  expect(message).toContain("Hi Kemi,");
  expect(message).toContain("*When do you actually need useEffect?*");
  expect(message).toMatch(/\/blog\/use-effect\/when-do-you-actually-need-useeffect/);
  await expect(send.getByRole("link", { name: "WhatsApp: choose chat" })).toHaveAttribute("href", /^https:\/\/wa\.me\/\?text=/);
});

test("readers can share a project or post with a preview card", async ({ page }) => {
  await page.goto("/projects/forkify");
  await page.getByRole("button", { name: "Share" }).click();
  const menu = page.getByRole("menu", { name: "Share Forkify" });
  const whatsapp = await menu.getByRole("menuitem", { name: "WhatsApp" }).getAttribute("href");
  expect(decodeURIComponent(whatsapp!)).toContain("/projects/forkify");
  await expect(menu.getByRole("menuitem", { name: "LinkedIn" })).toHaveAttribute("href", /linkedin\.com\/sharing/);

  const preview = await page.request.get("/api/share?id=use-effect", { maxRedirects: 0 });
  expect(await preview.text()).toContain('og:title" content="When do you actually need useEffect?"');
});
