/**
 * Captures d'écran de l'application, pour revue visuelle.
 *
 * Utilise le Chrome déjà installé sur la machine via playwright-core, sans
 * télécharger de navigateur.
 *
 * Prérequis :
 *   npm run build
 *   python3 -m http.server 8788 --directory dist
 * Usage :
 *   node tools/shot.mjs [url_de_base] [dossier_de_sortie]
 *
 * Deux contournements sont nécessaires, uniquement pour la revue locale :
 *   · security.js bloque les navigateurs automatisés (navigator.webdriver,
 *     « HeadlessChrome » dans l'agent utilisateur) ;
 *   · SecurityGuard floute le contenu quand la fenêtre perd le focus, ce qui
 *     est le cas par défaut d'un navigateur piloté.
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] || "http://127.0.0.1:8788";
const OUT = process.argv[3] || "shots";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const VIEWS = [
  { name: "01-accueil", hash: "#/home" },
  { name: "02-cours", hash: "#/courses" },
  { name: "03-examen", hash: "#/exam" },
  { name: "04-examen-question", hash: "#/exam/run/section/3" },
  { name: "05-etudes-de-cas", hash: "#/cases" },
  { name: "06-etude-de-cas-fiche", hash: "#/case/altostrat" },
  { name: "07-quiz", hash: "#/quiz" },
  { name: "08-progression", hash: "#/progress" },
];

const DEVICES = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "mobile", width: 390, height: 844 },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-blink-features=AutomationControlled", "--force-device-scale-factor=1"],
});

for (const theme of ["dark", "light"]) {
  for (const dev of DEVICES) {
    const ctx = await browser.newContext({
      viewport: { width: dev.width, height: dev.height },
      userAgent: UA,
      deviceScaleFactor: 2,
      colorScheme: theme === "dark" ? "dark" : "light",
    });

    // Masque l'automatisation et neutralise le flou de perte de focus.
    await ctx.addInitScript((t) => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      localStorage.setItem("gcp_theme", JSON.stringify(t));
      localStorage.setItem("gcp_onboarded", "true");
      document.hasFocus = () => true;
      Object.defineProperty(document, "hidden", { get: () => false });
      Object.defineProperty(document, "visibilityState", { get: () => "visible" });
    }, theme);

    const page = await ctx.newPage();

    for (const v of VIEWS) {
      // Sur mobile, on ne garde qu'un sous-ensemble représentatif.
      if (dev.label === "mobile" && !["01-accueil", "03-examen", "04-examen-question"].includes(v.name)) continue;

      await page.goto(`${BASE}/${v.hash}`, { waitUntil: "load" });
      await page.waitForTimeout(700);
      // Retire le filigrane, qui parasite la lecture d'une capture.
      await page.evaluate(() => {
        document.querySelectorAll(".security-watermark, #gcp-watermark").forEach((e) => e.remove());
      });
      await page.waitForTimeout(150);

      const file = `${OUT}/${v.name}-${theme}-${dev.label}.png`;
      await page.screenshot({ path: file, fullPage: dev.label === "desktop" });
      console.log("  " + file);
    }

    await ctx.close();
  }
}

await browser.close();
console.log("Terminé.");
