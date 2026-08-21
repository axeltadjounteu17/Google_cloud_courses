/**
 * Vérifie la configuration de déploiement.
 *
 * L'application est un site statique : la montée en charge ne dépend d'aucun
 * serveur applicatif, mais de la politique de cache. Une régression sur ces
 * en-têtes ne casse rien de visible et se paie uniquement en bande passante,
 * d'où ces garde-fous.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));

/** Retourne la valeur d'un en-tête pour une règle donnée. */
function headerFor(source, key) {
  const rule = cfg.headers.find((h) => h.source === source);
  if (!rule) return undefined;
  return rule.headers.find((h) => h.key.toLowerCase() === key.toLowerCase())?.value;
}

test("vercel.json ne contient que des clés reconnues par le schéma", () => {
  // Vercel fait échouer le déploiement sur toute propriété inattendue,
  // y compris une clé de commentaire.
  const allowedTop = new Set([
    "framework", "buildCommand", "outputDirectory", "headers",
    "redirects", "rewrites", "cleanUrls", "trailingSlash", "regions",
  ]);
  for (const k of Object.keys(cfg)) {
    assert.ok(allowedTop.has(k), `clé inconnue à la racine : ${k}`);
  }
  for (const rule of cfg.headers) {
    for (const k of Object.keys(rule)) {
      assert.ok(
        ["source", "headers", "has", "missing"].includes(k),
        `clé inconnue dans une règle d'en-têtes : ${k}`
      );
    }
    for (const h of rule.headers) {
      assert.deepEqual(
        Object.keys(h).sort(), ["key", "value"],
        `un en-tête doit n'avoir que key et value, reçu ${Object.keys(h)}`
      );
    }
  }
});

test("les diapositives sont mises en cache durablement", () => {
  const cc = headerFor("/slides/(.*)", "Cache-Control");
  assert.ok(cc, "aucune règle de cache pour /slides/");
  assert.match(cc, /immutable/, "les diapositives doivent être immuables");
  const max = Number(cc.match(/max-age=(\d+)/)?.[1] ?? 0);
  // Une année : ces fichiers ne changent jamais de contenu à chemin constant.
  assert.ok(max >= 2592000, `max-age de ${max}s, trop court pour un fichier immuable`);
  assert.doesNotMatch(cc, /must-revalidate|no-cache/, "revalider annule le bénéfice du cache");
});

test("le document reste revalidé pour que les déploiements se propagent", () => {
  // Le HTML porte toute l'application : s'il était figé, une mise en
  // production resterait invisible jusqu'à expiration du cache.
  // Comparaison exacte : « /slides/(.*) » contient « /(.*) » comme
  // sous-chaîne et serait capturé par une expression régulière naïve.
  const rules = cfg.headers.filter((h) => h.source === "/(.*)" || h.source === "/index.html");
  for (const r of rules) {
    const cc = r.headers.find((h) => h.key.toLowerCase() === "cache-control")?.value;
    if (cc) assert.doesNotMatch(cc, /immutable/, `${r.source} ne doit pas être immuable`);
  }
});

test("les en-têtes de sécurité restent appliqués à toutes les réponses", () => {
  for (const key of [
    "X-Robots-Tag", "X-Frame-Options", "X-Content-Type-Options",
    "Referrer-Policy", "Permissions-Policy",
  ]) {
    assert.ok(headerFor("/(.*)", key), `en-tête de sécurité absent : ${key}`);
  }
});

test("aucun backend n'est déclaré", () => {
  // L'absence de fonction serveur est ce qui rend la charge simultanée
  // indépendante du nombre de lecteurs : tout est servi depuis le CDN.
  assert.equal(cfg.functions, undefined, "une fonction serveur introduirait une limite de concurrence");
  assert.equal(cfg.crons, undefined);
});
