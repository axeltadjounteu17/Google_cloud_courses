// Test de rendu du bundle produit (dist/index.html) dans jsdom.
// Vérifie que l'application démarre et que les écrans clés s'affichent.
// Prérequis : npm run build. Exécution : npm test
import assert from "node:assert/strict";
import { test, before } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { JSDOM, VirtualConsole as JSDOMVirtualConsole } from "jsdom";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUNDLE = join(ROOT, "dist", "index.html");

const hasBundle = existsSync(BUNDLE);

// Le filigrane anti-capture répète le même texte 16 fois dans le DOM ; on le retire
// des assertions pour ne tester que le contenu applicatif.
const WATERMARK = /GCP-PCA • SESSION SÉCURISÉE EN LIGNE • REPRODUCTION INTERDITE/g;
const appText = (dom) =>
  (dom.window.document.getElementById("root")?.textContent || "").replace(WATERMARK, "").trim();

/**
 * Monte le bundle dans jsdom.
 * jsdom n'exécute pas les modules ES, et un script inline placé dans <head>
 * tournerait avant l'existence de <body>. On extrait donc le script du HTML
 * et on l'injecte en fin de <body> une fois le document chargé.
 */
async function mount(hash = "#/home") {
  const raw = readFileSync(BUNDLE, "utf8");
  const m = raw.match(/<script type="module"[^>]*>([\s\S]*?)<\/script>/);
  assert.ok(m, "script module introuvable dans le bundle");

  const errors = [];
  const vc = new JSDOMVirtualConsole();
  vc.on("jsdomError", (e) => {
    // Les erreurs de parsing CSS et les API non implémentées par jsdom ne sont pas
    // des défauts de l'application.
    if (/Could not parse CSS|Not implemented/.test(e.message)) return;
    errors.push(e.message);
  });

  const dom = new JSDOM(raw.replace(m[0], ""), {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    url: `https://local.test/${hash}`,
    virtualConsole: vc,
  });
  const w = dom.window;
  // L'application affiche un écran bloquant si elle se croit hors ligne.
  Object.defineProperty(w.navigator, "onLine", { value: true, configurable: true });

  await new Promise((r) => w.addEventListener("load", r, { once: true }));
  const script = w.document.createElement("script");
  script.textContent = m[1];
  w.document.body.appendChild(script);
  await new Promise((r) => setTimeout(r, 500)); // laisse React monter

  dom.errors = errors;
  return dom;
}

before(() => {
  if (!hasBundle) {
    console.error("dist/index.html absent — lancez `npm run build` avant les tests de rendu.");
  }
});

test("le bundle existe et embarque les données", { skip: !hasBundle }, () => {
  const html = readFileSync(BUNDLE, "utf8");
  assert.ok(html.length > 500_000, "bundle anormalement petit");
  assert.ok(html.includes("<div id=\"root\">") || html.includes("id=root"), "point de montage React absent");
  assert.match(html, /noindex/, "meta noindex absente");
  // Marqueurs de contenu : les données doivent être inlinées.
  // On choisit des chaînes absentes des données de cours préexistantes, sinon
  // l'assertion passerait même sans la banque d'examen. « Altostrat » par exemple
  // figure déjà dans courses.js et ne prouverait rien.
  assert.match(html, /KnightMotives/, "études de cas absentes du bundle");
  assert.match(html, /Examen blanc/, "banque d'examen absente du bundle");
});

test("l'accueil se rend sans erreur", { skip: !hasBundle }, async () => {
  const dom = await mount("#/home");
  assert.deepEqual(dom.errors, [], "erreurs JS au montage");
  assert.ok(appText(dom).length > 50, "l'accueil n'a rien rendu");
  assert.match(appText(dom), /GCP Étude/);
  dom.window.close();
});

test("la navigation expose le mode Examen", { skip: !hasBundle }, async () => {
  const dom = await mount("#/home");
  const links = [...dom.window.document.querySelectorAll("a")].map((a) => a.getAttribute("href"));
  assert.ok(links.includes("#/exam"), "lien vers le mode Examen absent de la navigation");
  dom.window.close();
});

test("le mode Examen se rend et annonce la banque", { skip: !hasBundle }, async () => {
  const dom = await mount("#/exam");
  const txt = appText(dom);
  assert.deepEqual(dom.errors, [], "erreurs JS au montage");
  assert.match(txt, /Mode Examen/);
  assert.match(txt, /Examen blanc/);
  assert.match(txt, /Altostrat Media/);
  assert.match(txt, /\d+ questions/);
  dom.window.close();
});

test("une étude de cas se rend avec ses sections", { skip: !hasBundle }, async () => {
  const dom = await mount("#/case/altostrat");
  const txt = appText(dom);
  assert.deepEqual(dom.errors, [], "erreurs JS au montage");
  assert.match(txt, /Altostrat Media/);
  assert.match(txt, /Exigences métier/i);
  assert.match(txt, /Exigences techniques/i);
  assert.match(txt, /Déclaration de la direction/i);
  dom.window.close();
});

test("une session d'examen affiche une question, ses options et le compteur", { skip: !hasBundle }, async () => {
  const dom = await mount("#/exam/run/section/3");
  const doc = dom.window.document;
  const txt = appText(dom);
  assert.deepEqual(dom.errors, [], "erreurs JS au montage");
  assert.match(txt, /Question 1 \/ \d+/);
  assert.match(txt, /Sélectionnez/);
  // Chaque option est un bouton ; il en faut au moins quatre.
  const opts = [...doc.querySelectorAll("button")].filter((b) => b.textContent.trim().length > 20);
  assert.ok(opts.length >= 4, `options non rendues (${opts.length} bouton(s) de contenu)`);
  dom.window.close();
});

test("le bouton Vérifier corrige et révèle l'explication", { skip: !hasBundle }, async () => {
  const dom = await mount("#/exam/run/section/3");
  const doc = dom.window.document;
  const opts = [...doc.querySelectorAll("button")].filter((b) => b.textContent.trim().length > 20);
  opts[0].dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 120));

  const verify = [...doc.querySelectorAll("button")].find((b) => /Vérifier/.test(b.textContent));
  assert.ok(verify, "bouton Vérifier absent");
  assert.equal(verify.disabled, false, "Vérifier devrait être actif après sélection");
  verify.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 150));

  assert.match(appText(dom), /Pourquoi/, "l'explication ne s'affiche pas après vérification");
  dom.window.close();
});

test("la liste des cours se rend", { skip: !hasBundle }, async () => {
  const dom = await mount("#/courses");
  assert.ok(appText(dom).length > 100, "la page Cours n'a rien rendu");
  dom.window.close();
});

test("une route inconnue retombe sur l'accueil", { skip: !hasBundle }, async () => {
  const dom = await mount("#/nexistepas");
  assert.match(appText(dom), /GCP Étude/, "aucun rendu de repli");
  dom.window.close();
});
