/**
 * Capture une URL arbitraire, pour analyse de référence visuelle.
 * Usage : node tools/shot-url.mjs <url> <prefixe_sortie> [nb_ecrans]
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const URL = process.argv[2];
const OUT = process.argv[3] || "ref";
const SCREENS = Number(process.argv[4] || 3);
if (!URL) { console.error("URL manquante"); process.exit(1); }

mkdirSync("refs", { recursive: true });

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
});
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.5,
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
});
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
await page.waitForTimeout(2500);

// Ferme les bandeaux de consentement les plus courants.
for (const sel of ['button:has-text("Accepter")', 'button:has-text("Accept")', '[aria-label*="close" i]']) {
  await page.click(sel, { timeout: 1200 }).catch(() => {});
}
await page.waitForTimeout(600);

for (let i = 0; i < SCREENS; i++) {
  const f = `refs/${OUT}-${String(i + 1).padStart(2, "0")}.png`;
  await page.screenshot({ path: f });
  console.log("  " + f);
  await page.evaluate(() => window.scrollBy(0, Math.round(window.innerHeight * 0.9)));
  await page.waitForTimeout(1200);
}

// Palette et typographie effectivement appliquées.
const style = await page.evaluate(() => {
  const seen = { bg: {}, color: {}, font: {}, radius: {}, weight: {} };
  const bump = (o, k) => { if (k) o[k] = (o[k] || 0) + 1; };
  for (const el of document.querySelectorAll("body *")) {
    const c = getComputedStyle(el);
    if (c.backgroundColor && c.backgroundColor !== "rgba(0, 0, 0, 0)") bump(seen.bg, c.backgroundColor);
    bump(seen.color, c.color);
    bump(seen.font, c.fontFamily.split(",")[0].replace(/["']/g, ""));
    if (c.borderRadius && c.borderRadius !== "0px") bump(seen.radius, c.borderRadius);
    bump(seen.weight, c.fontWeight);
  }
  const top = (o, n = 8) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
  return { bg: top(seen.bg), color: top(seen.color), font: top(seen.font, 5), radius: top(seen.radius, 6), weight: top(seen.weight, 6) };
});
console.log("\n--- fonds dominants ---"); style.bg.forEach(([k, v]) => console.log(`  ${v.toString().padStart(4)}  ${k}`));
console.log("--- couleurs de texte ---"); style.color.forEach(([k, v]) => console.log(`  ${v.toString().padStart(4)}  ${k}`));
console.log("--- polices ---"); style.font.forEach(([k, v]) => console.log(`  ${v.toString().padStart(4)}  ${k}`));
console.log("--- rayons ---"); style.radius.forEach(([k, v]) => console.log(`  ${v.toString().padStart(4)}  ${k}`));
console.log("--- graisses ---"); style.weight.forEach(([k, v]) => console.log(`  ${v.toString().padStart(4)}  ${k}`));

await browser.close();
