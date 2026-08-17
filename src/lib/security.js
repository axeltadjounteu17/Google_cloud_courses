const blocked = (e) => {
  e.preventDefault();
  return false;
};

const isEditable = (t) =>
  t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);

let protectEl = null;

function showProtect() {
  if (protectEl) return;
  protectEl = document.createElement("div");
  protectEl.id = "gcp-protect";
  protectEl.style.cssText =
    "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#070b16;color:#eef3fc;font-family:system-ui,sans-serif;";
  protectEl.innerHTML =
    '<div style="text-align:center;padding:2rem">' +
    '<div style="width:64px;height:64px;margin:0 auto;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:30px;background:rgba(56,189,248,.15);border:1px solid rgba(56,189,248,.35)">🔒</div>' +
    '<div style="margin-top:1rem;font-weight:700;font-size:17px">Contenu protégé</div>' +
    '<div style="margin-top:.4rem;font-size:13px;color:#94a3b8;max-width:280px">Les outils de développement doivent être fermés pour continuer la lecture.</div>' +
    "</div>";
  document.body.appendChild(protectEl);
}

function hideProtect() {
  if (protectEl) {
    protectEl.remove();
    protectEl = null;
  }
}

export function initSecurity() {
  if (typeof window === "undefined") return;

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
    if (mod && e.shiftKey && ["i", "j", "c"].includes(k)) return blocked(e);
    if (mod && ["c", "x", "s", "p", "u", "a"].includes(k)) {
      if (isEditable(e.target)) return;
      return blocked(e);
    }
    return undefined;
  }, true);

  // Détection ouverture DevTools (heuristique sur la largeur de la fenêtre)
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