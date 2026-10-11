import { chromium } from "@playwright/test";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await p.goto("http://localhost:3115/"); await p.waitForTimeout(5000);
console.log("buttons:", (await p.getByRole("button").allInnerTexts()).join(" | ").replace(/\n/g," "));
await p.getByRole("button", { name: /Continue/ }).click(); await p.waitForTimeout(6000);
console.log(p.url(), (await p.innerText("body")).slice(0, 500).replace(/\n/g, " | "));
await b.close();
