// Garde-fous du système de design : surfaces opaques et contrastes WCAG AA.
// Empêche la réintroduction accidentelle de l'effet verre.
import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(SRC);
const jsx = files.filter((f) => f.endsWith(".jsx"));
const cssRaw = readFileSync(join(SRC, "index.css"), "utf8");
// Les commentaires citent l'ancien code (« mark { background: transparent } ») :
// il faut les retirer avant toute analyse, sinon les règles décrites y sont
// détectées comme si elles étaient appliquées.
const css = cssRaw.replace(/\/\*[\s\S]*?\*\//g, "");

// ── Opacité des surfaces ──────────────────────────────────────────────────

test("aucun backdrop-filter dans la feuille de style", () => {
  const applied = css
    .split("\n")
    .filter((l) => /backdrop-filter\s*:/.test(l) && !l.trim().startsWith("*") && !l.includes("//"));
  assert.deepEqual(applied, [], "backdrop-filter réintroduit");
});

test("aucune classe backdrop-blur dans les composants", () => {
  const bad = [];
  for (const f of jsx) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/backdrop-blur-[\w[\]-]+/g)) bad.push(`${f.replace(SRC, "src")}: ${m[0]}`);
  }
  assert.deepEqual(bad, [], "effet verre réintroduit");
});

test("aucun fond de surface semi-transparent", () => {
  // Les scrims de modale restent translucides : c'est leur fonction.
  const ALLOW = /^bg-scrim\//;
  const bad = [];
  for (const f of jsx) {
    const src = readFileSync(f, "utf8");
    const re = /\bbg-(bg|bgsoft|secondary|panel|hover|active|white|black|scrim|red|blue|cyan|green|violet|orange|yellow)\/\d+/g;
    for (const m of src.matchAll(re)) {
      if (ALLOW.test(m[0])) continue;
      bad.push(`${f.replace(SRC, "src")}: ${m[0]}`);
    }
  }
  assert.deepEqual(bad, [], "fond semi-transparent réintroduit — utiliser bg-tint*");
});

test("les variables de surface sont des couleurs pleines, pas des rgba", () => {
  for (const name of ["--hover", "--active", "--borderline"]) {
    const re = new RegExp(`${name}:\\s*([^;]+);`, "g");
    for (const m of css.matchAll(re)) {
      assert.doesNotMatch(m[1], /rgba?\(/, `${name} composé en alpha : ${m[1].trim()}`);
    }
  }
});

test("chaque accent possède une teinte et une bordure opaques dans les deux thèmes", () => {
  const accents = ["red", "blue", "cyan", "green", "violet", "orange", "yellow"];
  for (const a of accents) {
    assert.equal((css.match(new RegExp(`--tint-${a}:`, "g")) || []).length, 2, `--tint-${a}`);
    assert.equal((css.match(new RegExp(`--edge-${a}:`, "g")) || []).length, 2, `--edge-${a}`);
  }
});

// ── Accessibilité ─────────────────────────────────────────────────────────

test("la surbrillance de recherche est visible", () => {
  const rule = css.match(/\bmark\s*\{[^}]*\}/);
  assert.ok(rule, "règle mark absente");
  assert.doesNotMatch(rule[0], /background:\s*transparent/, "surbrillance neutralisée");
  assert.match(rule[0], /background:\s*var\(--tint-/, "surbrillance sans fond");
});

test("un style de focus clavier existe", () => {
  assert.match(css, /:focus-visible\s*\{[^}]*outline:/, "aucun focus visible");
});

test("les boutons pleins utilisent l'encre à contraste garanti", () => {
  const bad = [];
  for (const f of jsx) {
    const src = readFileSync(f, "utf8");
    const re = /\bbg-(red|blue|cyan|green|violet|orange|yellow)\b(?![\w-])(?:(?!className|\n).){0,160}?\btext-(white|black|\[#[0-9a-fA-F]+\])/g;
    for (const m of src.matchAll(re)) bad.push(`${f.replace(SRC, "src")}: ${m[0].slice(0, 70)}`);
  }
  assert.deepEqual(bad, [], "utiliser text-onaccent sur un bouton plein");
});

// ── Contrastes calculés ───────────────────────────────────────────────────

const hslToRgb = (h, s, l) => {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
};
const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lumin = (c) => {
  const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const l1 = lumin(a), l2 = lumin(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

/**
 * Extrait les tokens d'un bloc de thème de index.css.
 *
 * Les accents pointent désormais vers `var(--neutral)` : le système est
 * achromatique et une seule valeur sert de référence. La résolution suit donc
 * un niveau d'indirection.
 */
function tokens(selector) {
  const i = css.indexOf(selector);
  assert.ok(i >= 0, `bloc ${selector} introuvable`);
  const block = css.slice(i, css.indexOf("}", i));

  const raw = (n) => (block.match(new RegExp(`${n}:\\s*([^;]+);`)) || [])[1]?.trim();

  const get = (n) => {
    let v = raw(n);
    let guard = 0;
    while (v && v.startsWith("var(") && guard++ < 4) {
      v = raw(v.slice(4, -1).trim());
    }
    return v;
  };

  const accent = (n) => {
    const v = get(`--${n}`);
    assert.ok(v, `--${n} non résolu`);
    const [h, s, l] = v.replace(/%/g, "").split(/\s+/).map(Number);
    return hslToRgb(h, s, l);
  };

  return { get, raw, accent };
}

const ACCENTS = ["red", "blue", "cyan", "green", "violet", "orange", "yellow"];

for (const [label, selector, cardKey] of [
  ["sombre", ":root {", "--secondary"],
  ["clair", 'html[data-theme="light"] {', "--secondary"],
]) {
  test(`thème ${label} : accent sur carte >= 4,5:1`, () => {
    const t = tokens(selector);
    const card = hexToRgb(t.get(cardKey));
    for (const a of ACCENTS) {
      const r = contrast(t.accent(a), card);
      assert.ok(r >= 4.5, `${a} : ${r.toFixed(2)}:1`);
    }
  });

  test(`thème ${label} : accent sur sa propre teinte >= 4,5:1 (badges)`, () => {
    const t = tokens(selector);
    for (const a of ACCENTS) {
      const r = contrast(t.accent(a), hexToRgb(t.get(`--tint-${a}`)));
      assert.ok(r >= 4.5, `${a} sur --tint-${a} : ${r.toFixed(2)}:1`);
    }
  });

  test(`thème ${label} : encre sur bouton plein >= 4,5:1`, () => {
    const t = tokens(selector);
    const ink = hexToRgb(t.get("--on-accent"));
    for (const a of ACCENTS) {
      const r = contrast(ink, t.accent(a));
      assert.ok(r >= 4.5, `--on-accent sur ${a} : ${r.toFixed(2)}:1`);
    }
  });

  test(`thème ${label} : textes sur carte conformes`, () => {
    const t = tokens(selector);
    const card = hexToRgb(t.get(cardKey));
    const main = contrast(hexToRgb(t.get("--text-main")), card);
    const muted = contrast(hexToRgb(t.get("--text-muted")), card);
    assert.ok(main >= 7, `texte principal : ${main.toFixed(2)}:1`);
    assert.ok(muted >= 4.5, `texte secondaire : ${muted.toFixed(2)}:1`);
  });
}

// ── Icônes ────────────────────────────────────────────────────────────────

test("toute icône référencée existe dans le jeu d'icônes", async () => {
  const icons = readFileSync(join(SRC, "lib", "icons.jsx"), "utf8");
  // Clés du dictionnaire P : `nom:` ou `"nom-compose":`
  const known = new Set(
    [...icons.matchAll(/^\s{2}(?:"([a-z0-9-]+)"|([a-z0-9-]+)):/gm)].map((m) => m[1] || m[2])
  );
  assert.ok(known.size > 20, `jeu d'icônes non détecté (${known.size} clés)`);

  const used = new Set();
  // Études de cas et modes d'examen déclarent leur icône dans les données.
  for (const f of [join(SRC, "data", "caseStudies.js"), join(SRC, "lib", "exam.js"), join(SRC, "App.jsx")]) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/\bicon:\s*"([a-z0-9-]+)"/g)) used.add(m[1]);
  }
  // Usages littéraux dans les composants : <Icon name="..." />
  for (const f of jsx) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/name="([a-z0-9-]+)"\s+size=/g)) used.add(m[1]);
  }

  const missing = [...used].filter((i) => !known.has(i));
  assert.deepEqual(missing, [], `icônes inexistantes, rendues en repli silencieux : ${missing}`);
});

test("le thème n'a qu'une source de vérité", () => {
  // La barre latérale lisait localStorage en brut alors que le store y écrit du
  // JSON : la comparaison échouait et le libellé du bouton était toujours faux.
  const app = readFileSync(join(SRC, "App.jsx"), "utf8");
  assert.doesNotMatch(app, /localStorage\.getItem\(\s*["']gcp_theme["']\s*\)/, "lecture directe du thème dans App.jsx");
  assert.doesNotMatch(app, /localStorage\.setItem\(\s*["']gcp_theme["']/, "écriture directe du thème dans App.jsx");
});

// ── Couche de sécurité : une seule implémentation ──────────────────────────

test("le filigrane n'est produit qu'à un seul endroit", () => {
  const guard = readFileSync(join(SRC, "components", "SecurityGuard.jsx"), "utf8");
  const sec = readFileSync(join(SRC, "lib", "security.js"), "utf8");
  // security.js détient le filigrane ; SecurityGuard n'en rend plus.
  assert.match(sec, /gcp-watermark/, "filigrane absent de security.js");
  assert.doesNotMatch(guard, /watermark/i, "second calque de filigrane réintroduit dans SecurityGuard");
  assert.doesNotMatch(css, /\.security-watermark/, "styles du second filigrane réintroduits");
});

test("les raccourcis clavier ne sont interceptés qu'une fois", () => {
  const guard = readFileSync(join(SRC, "components", "SecurityGuard.jsx"), "utf8");
  const sec = readFileSync(join(SRC, "lib", "security.js"), "utf8");
  assert.match(sec, /addEventListener\("keydown"/, "blocage clavier absent de security.js");
  assert.doesNotMatch(guard, /addEventListener\("keydown"/, "second gestionnaire clavier dans SecurityGuard");
  // La communication passe par un événement, pas par une duplication de logique.
  assert.match(sec, /gcp:blocked/, "security.js ne signale pas les actions bloquées");
  assert.match(guard, /gcp:blocked/, "SecurityGuard n'écoute pas les actions bloquées");
});

test("le contenu n'est pas masqué sur une simple perte de focus", () => {
  // Écouter `blur` sur la fenêtre masquait le contenu dès qu'on cliquait dans
  // une autre application, y compris la documentation ouverte à côté.
  const guard = readFileSync(join(SRC, "components", "SecurityGuard.jsx"), "utf8");
  const sec = readFileSync(join(SRC, "lib", "security.js"), "utf8");
  for (const [name, src] of [["SecurityGuard.jsx", guard], ["security.js", sec]]) {
    assert.doesNotMatch(src, /addEventListener\(\s*["']blur["']/, `${name} masque encore sur blur`);
    assert.doesNotMatch(src, /hasFocus\s*\(/, `${name} s'appuie encore sur hasFocus`);
  }
  // Le masquage reste actif sur passage réel en arrière-plan, avec un délai.
  assert.match(guard, /visibilitychange/, "masquage sur arrière-plan supprimé");
  assert.match(guard, /HIDE_DELAY_MS/, "délai de grâce absent");
});

// ── Palette colorée : chaque accent reste une vraie teinte ────────────────

for (const [label, selector] of [
  ["sombre", ":root {"],
  ["clair", 'html[data-theme="light"] {'],
]) {
  test(`thème ${label} : les sept accents sont des teintes distinctes`, () => {
    const t = tokens(selector);
    const hues = {};
    for (const a of ["red", "blue", "cyan", "green", "violet", "orange", "yellow"]) {
      const [h, sat] = t.get(`--${a}`).replace(/%/g, "").split(/\s+/).map(Number);
      assert.ok(sat > 40, `--${a} : saturation de ${sat}%, la couleur doit rester franche`);
      hues[a] = h;
    }
    // Deux accents ne doivent pas se confondre : au moins 12° d'écart de teinte.
    const keys = Object.keys(hues);
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const d = Math.min(
          Math.abs(hues[keys[i]] - hues[keys[j]]),
          360 - Math.abs(hues[keys[i]] - hues[keys[j]])
        );
        assert.ok(d >= 12, `${keys[i]} et ${keys[j]} trop proches : ${d}° d'écart`);
      }
    }
  });

  test(`thème ${label} : chaque teinte de fond dérive de son accent`, () => {
    const t = tokens(selector);
    for (const a of ["red", "blue", "cyan", "green", "violet", "orange", "yellow"]) {
      const hex = t.get(`--tint-${a}`);
      assert.match(hex, /^#[0-9a-f]{6}$/i, `--tint-${a} devrait être une couleur pleine`);
      // Une teinte plate et grise signifierait que l'accent a été neutralisé.
      const [r, g, b] = hexToRgb(hex);
      const spread = Math.max(r, g, b) - Math.min(r, g, b);
      assert.ok(spread >= 4, `--tint-${a} (${hex}) est gris : écart RVB de ${spread}`);
    }
  });
}

test("les couleurs de repérage du menu existent pour chaque entrée", () => {
  // La couleur est conservée uniquement sur la navigation : c'est là qu'elle
  // aide à se situer. Ces tokens sont séparés des surfaces pour qu'elle ne
  // puisse pas fuiter dans les pages.
  const entries = ["home", "courses", "search", "quiz", "exam", "cases", "progress", "settings"];
  for (const e of entries) {
    assert.equal(
      (css.match(new RegExp(`--nav-${e}:`, "g")) || []).length,
      2,
      `--nav-${e} doit être défini dans les deux thèmes`
    );
  }
});

test("les couleurs de menu sont lisibles sur la surface de la barre latérale", () => {
  for (const [label, selector] of [["sombre", ":root {"], ["clair", 'html[data-theme="light"] {']]) {
    const t = tokens(selector);
    const bg = hexToRgb(t.get("--bg"));

    /**
     * Les couleurs de menu référencent la palette : `hsl(var(--cyan))` ou
     * `var(--text-muted)`. La résolution suit donc l'indirection avant de
     * mesurer le contraste.
     */
    const resolve = (raw) => {
      const v = raw.trim();
      const hslVar = v.match(/^hsl\(var\((--[a-z-]+)\)\)$/);
      if (hslVar) {
        const [h, s, l] = t.get(hslVar[1]).replace(/%/g, "").split(/\s+/).map(Number);
        return hslToRgb(h, s, l);
      }
      const plain = v.match(/^var\((--[a-z-]+)\)$/);
      if (plain) return resolve(t.get(plain[1]));
      if (v.startsWith("#")) return hexToRgb(v);
      const [h, s, l] = v.replace(/%/g, "").split(/\s+/).map(Number);
      return hslToRgb(h, s, l);
    };

    for (const e of ["home", "courses", "search", "quiz", "exam", "cases", "progress", "settings"]) {
      const c = resolve(t.get(`--nav-${e}`));
      const r = contrast(c, bg);
      // Seuil « élément graphique » : ces couleurs portent une icône et un
      // libellé de 13,5 px en gras.
      assert.ok(r >= 3, `${label} : --nav-${e} à ${r.toFixed(2)}:1 sur le fond`);
    }
  }
});

test("les couleurs de menu ne servent qu'à la navigation", () => {
  const bad = [];
  for (const f of jsx) {
    const src = readFileSync(f, "utf8");
    if (f.endsWith("App.jsx")) continue; // la barre latérale est le seul lieu légitime
    for (const m of src.matchAll(/\b(?:text|bg|border)-nav[a-z]+/g)) {
      bad.push(`${f.replace(SRC, "src")}: ${m[0]}`);
    }
  }
  assert.deepEqual(bad, [], "une couleur de menu a fuité dans le contenu");
});

// ── Typographie du système ────────────────────────────────────────────────

test("Inter et JetBrains Mono sont déclarées et embarquées", () => {
  assert.match(css, /font-family:\s*"Inter"/, "Inter absente");
  assert.match(css, /font-family:\s*"JetBrains Mono"/, "JetBrains Mono absente");
  assert.match(css, /Inter-latin\.woff2/, "fichier Inter non référencé");
  assert.match(css, /JetBrainsMono-latin\.woff2/, "fichier JetBrains Mono non référencé");
  // Space Grotesk a été remplacée : plus aucune trace ne doit subsister.
  assert.doesNotMatch(css, /SpaceGrotesk/, "reste de Space Grotesk");
});

test("le libellé technique en mono capitales est disponible", () => {
  for (const cls of ["label-mono", "label-mono-sm"]) {
    assert.match(css, new RegExp(`\\.${cls}\\s*\\{`), `.${cls} absent`);
  }
  const rule = css.match(/\.label-mono\s*\{[^}]*\}/)[0];
  assert.match(rule, /text-transform:\s*uppercase/, "label-mono devrait être en capitales");
  assert.match(rule, /JetBrains Mono/, "label-mono devrait être en mono");
});

// ── Formes ────────────────────────────────────────────────────────────────

test("les rayons restent techniques : 4 px et 8 px", () => {
  const found = new Set();
  for (const f of jsx) {
    for (const m of readFileSync(f, "utf8").matchAll(/rounded-\[(\d+)px\]/g)) found.add(Number(m[1]));
  }
  const tooRound = [...found].filter((r) => r > 8);
  assert.deepEqual(tooRound, [], `rayons supérieurs à 8 px : ${tooRound.join(", ")}`);
});

test("les barres de progression ont des bouts carrés", () => {
  const track = css.match(/\.bar-track\s*\{[^}]*\}/);
  const fill = css.match(/\.bar-fill\s*\{[^}]*\}/);
  assert.ok(track && fill, "classes .bar-track / .bar-fill absentes");
  for (const r of [track[0], fill[0]]) {
    assert.doesNotMatch(r, /border-radius:\s*9999px|border-radius:\s*50%/, "capuchon arrondi sur une barre");
  }
});

// ── Accent par section ────────────────────────────────────────────────────

test("chaque section déclare son accent", () => {
  for (const sec of ["home", "courses", "search", "quiz", "exam", "cases", "progress", "settings"]) {
    assert.match(
      css,
      new RegExp(`\\[data-section="${sec}"\\]\\s*\\{[^}]*--accent:`),
      `pas d'accent déclaré pour la section ${sec}`
    );
  }
});

test("l'accent de section est dérivé en teinte et bordure opaques", () => {
  for (const token of ["--color-tintaccent", "--color-edgeaccent"]) {
    const m = css.match(new RegExp(`${token}:\\s*([^;]+);`));
    assert.ok(m, `${token} absent`);
    // color-mix produit une couleur pleine : pas d'alpha, donc pas de verre.
    assert.match(m[1], /color-mix\(/, `${token} devrait dériver de --accent`);
    assert.doesNotMatch(m[1], /rgba?\(|\/\s*\d+%/, `${token} introduit de la transparence`);
  }
});

test("le menu et la page d'une section partagent la même teinte", () => {
  // --nav-* pointe vers les accents de la palette : l'entrée de menu et la page
  // qu'elle ouvre ne peuvent pas diverger.
  for (const sec of ["home", "courses", "quiz", "exam", "progress"]) {
    const m = css.match(new RegExp(`--nav-${sec}:\\s*([^;]+);`));
    assert.ok(m, `--nav-${sec} absent`);
    assert.match(m[1].trim(), /^hsl\(var\(--|^var\(--/, `--nav-${sec} devrait référencer la palette`);
  }
});
