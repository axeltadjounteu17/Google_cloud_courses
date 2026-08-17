const blocked = (e) => {
  e.preventDefault();
  e.stopPropagation && e.stopPropagation();
  return false;
};

const isEditable = (t) =>
  t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);

let protectEl = null;

function showProtect(title = "Contenu protégé", sub = "Les outils de développement doivent être fermés pour continuer la lecture.") {
  if (protectEl) return;
  protectEl = document.createElement("div");
  protectEl.id = "gcp-protect";
  protectEl.style.cssText =
    "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#070b16;color:#eef3fc;font-family:system-ui,sans-serif;";
  protectEl.innerHTML =
    '<div style="text-align:center;padding:2rem">' +
    '<div style="width:64px;height:64px;margin:0 auto;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:30px;background:rgba(56,189,248,.15);border:1px solid rgba(56,189,248,.35)">🔒</div>' +
    '<div style="margin-top:1rem;font-weight:700;font-size:17px">' + title + '</div>' +
    '<div style="margin-top:.4rem;font-size:13px;color:#94a3b8;max-width:300px">' + sub + "</div>" +
    "</div>";
  document.body.appendChild(protectEl);
}

function hideProtect() {
  if (protectEl) {
    protectEl.remove();
    protectEl = null;
  }
}

/* Alerte transitoire (capture d'écran, impression) */
let warnEl = null;
function flashWarn(text, ms = 1600) {
  if (warnEl) warnEl.remove();
  warnEl = document.createElement("div");
  warnEl.style.cssText =
    "position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;background:rgba(127,29,29,.92);color:#fee2e2;font:600 15px/1.5 system-ui,sans-serif;text-align:center;padding:2rem;";
  warnEl.textContent = text;
  document.body.appendChild(warnEl);
  setTimeout(() => {
    warnEl.remove();
    warnEl = null;
  }, ms);
}

/* Écran plein « impression refusée » pendant l'impression */
let printEl = null;
function initPrintBlock() {
  window.addEventListener("beforeprint", () => {
    if (printEl) return;
    printEl = document.createElement("div");
    printEl.id = "gcp-print-block";
    printEl.style.cssText =
      "position:fixed;inset:0;z-index:99997;display:flex;align-items:center;justify-content:center;background:#fff;color:#7f1d1d;font:700 18px system-ui,sans-serif;";
    printEl.textContent = "Impression non autorisée";
    document.body.appendChild(printEl);
  });
  window.addEventListener("afterprint", () => {
    if (printEl) {
      printEl.remove();
      printEl = null;
    }
  });
}

/* Filigrane persistant (visible sur toute capture d'écran) */
const SESSION = (Math.random().toString(36).slice(2, 10)).toUpperCase();
let wmEl = null;
function initWatermark() {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='150'>" +
    "<g transform='rotate(-28 160 75)' fill='rgba(148,163,184,0.13)' font-family='system-ui,sans-serif' font-size='13'>" +
    "<text x='14' y='42'>GCP Étude — Accès privé</text>" +
    "<text x='14' y='62'>Session " + SESSION + "</text>" +
    "<text x='14' y='82'>Lecture suivie · " + new Date().toLocaleDateString("fr-FR") + "</text>" +
    "</g></svg>";
  const url = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  wmEl = document.createElement("div");
  wmEl.id = "gcp-watermark";
  wmEl.style.cssText =
    "position:fixed;inset:0;z-index:9990;pointer-events:none;background-image:url(\"" + url + "\");background-repeat:repeat;";
  document.body.appendChild(wmEl);
}

/* Flou du contenu quand la fenêtre perd le focus */
let appBlur = false;
function setAppBlur(on) {
  if (appBlur === on) return;
  appBlur = on;
  const app = document.querySelector(".app");
  if (!app) return;
  if (on) {
    app.style.filter = "blur(16px)";
    app.style.pointerEvents = "none";
  } else {
    app.style.filter = "";
    app.style.pointerEvents = "";
  }
}

function initFocusLock() {
  const apply = () => setAppBlur(document.hidden || !document.hasFocus());
  window.addEventListener("blur", apply);
  window.addEventListener("focus", apply);
  document.addEventListener("visibilitychange", apply);
  setTimeout(apply, 600);
}

/* Bots / navigateurs automatisés / headless */
function initBotBlock() {
  const ua = (navigator.userAgent || "").toLowerCase();
  const headless = /headlesschrome|phantomjs|slimerjs|electron|playwright|puppeteer|selenium/i.test(ua);
  const automated =
    navigator.webdriver === true ||
    (window.chrome && window.chrome.webview) || // (webview natif)
    headless;
  if (automated) {
    showProtect("Accès restreint", "Les navigateurs automatisés ne sont pas autorisés à consulter ce contenu.");
    return true;
  }
  return false;
}

export function initSecurity() {
  if (typeof window === "undefined") return;

  if (initBotBlock()) return;

  document.addEventListener("contextmenu", (e) => {
    if (!isEditable(e.target)) blocked(e);
  }, true);

  document.addEventListener("selectstart", (e) => {
    if (!isEditable(e.target)) blocked(e);
  }, true);

  document.addEventListener("copy", (e) => {
    if (!isEditable(e.target)) blocked(e);
  }, true);

  document.addEventListener("cut", blocked, true);
  document.addEventListener("dragstart", blocked, true);
  document.addEventListener("drop", blocked, true);

  document.addEventListener("keydown", (e) => {
    const mod = e.ctrlKey || e.metaKey;
    const k = (e.key || "").toLowerCase();
    if (e.key === "F12") return blocked(e);
    if (mod && e.shiftKey && ["i", "j", "c", "s", "p"].includes(k)) return blocked(e);
    if (mod && ["c", "x", "s", "p", "u", "a"].includes(k)) {
      if (isEditable(e.target)) return;
      return blocked(e);
    }
    return undefined;
  }, true);

  /* Touche Impr. écran : alerte de dissuasion */
  document.addEventListener("keyup", (e) => {
    if (e.key === "PrintScreen" || e.code === "PrintScreen") {
      flashWarn("Capture d'écran non autorisée — chaque action de ce type est journalisée.");
    }
  }, true);

  initPrintBlock();
  initWatermark();
  initFocusLock();

  /* Détection DevTools (heuristique sur la largeur de la fenêtre) */
  let open = false;
  const THRESHOLD = 200;
  const check = () => {
    const w = (window.outerWidth || 0) - (window.innerWidth || 0);
    const h = (window.outerHeight || 0) - (window.innerHeight || 0);
    const nowOpen = w > THRESHOLD || h > THRESHOLD;
    if (nowOpen && !open) { open = true; showProtect(); }
    if (!nowOpen && open) { open = false; hideProtect(); }
  };
  check();
  setInterval(check, 1200);
}
