import React, { useEffect, useRef, useState } from "react";

/**
 * Couche de protection côté interface.
 *
 * Répartition des responsabilités, pour éviter le doublon qui existait :
 *   · `lib/security.js` détient les protections DOM : filigrane, blocage de
 *     l'impression, raccourcis clavier, détection des navigateurs automatisés.
 *     Il signale une action bloquée par l'événement `gcp:blocked`.
 *   · Ce composant détient l'interface : exigence de connexion, masquage
 *     temporaire et message d'action bloquée.
 *
 * Le filigrane et les gestionnaires clavier ont été retirés d'ici : ils
 * existaient en double, ce qui superposait deux calques de filigrane sur le
 * contenu et traitait chaque touche deux fois.
 */

// Délai avant masquage. Passer sur la documentation puis revenir ne doit pas
// déclencher le voile : seule une absence prolongée le justifie.
const HIDE_DELAY_MS = 2500;

export default function SecurityGuard({ children }) {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isHidden, setIsHidden] = useState(false);
  const [toast, setToast] = useState("");
  const hideTimer = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    /**
     * Masquage sur changement de visibilité uniquement.
     *
     * L'ancienne version écoutait aussi `blur` sur la fenêtre, donc le contenu
     * disparaissait dès qu'on cliquait dans une autre application — y compris
     * la documentation Google Cloud ouverte à côté, ou un second écran. Sur un
     * outil de révision, c'était le geste le plus fréquent qui était puni.
     *
     * `visibilitychange` ne se déclenche que si l'onglet passe réellement à
     * l'arrière-plan ou si la fenêtre est réduite. La consultation côte à côte
     * reste donc possible.
     */
    const onVisibility = () => {
      clearTimeout(hideTimer.current);
      if (document.visibilityState === "hidden") {
        hideTimer.current = setTimeout(() => setIsHidden(true), HIDE_DELAY_MS);
      } else {
        setIsHidden(false);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Messages émis par lib/security.js quand une action est refusée.
    const onBlocked = (e) => {
      const msg = e?.detail?.message;
      if (!msg) return;
      setToast(msg);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(""), 3200);
    };
    window.addEventListener("gcp:blocked", onBlocked);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("gcp:blocked", onBlocked);
      clearTimeout(hideTimer.current);
      clearTimeout(toastTimer.current);
    };
  }, []);

  const veiled = !isOnline || isHidden;

  return (
    <>
      {toast && (
        <div
          role="status"
          className="fixed right-6 bottom-6 z-[10000] flex items-center gap-2.5 rounded-[8px] border border-edgered bg-tintred px-4 py-3 text-[13px] font-semibold text-red"
        >
          {toast}
        </div>
      )}

      {!isOnline && (
        <div className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-bg p-6 text-center">
          <div className="rounded-[4px] mb-4 flex h-16 w-16 items-center justify-center bg-tintred text-[30px] text-red">
            &#9888;
          </div>
          <h2 className="text-h2">Connexion requise</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-textmuted">
            L'accès aux cours exige une connexion active. Le mode hors ligne est
            désactivé afin de protéger le contenu.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-[8px] bg-textmain px-6 py-2.5 text-sm font-bold text-onaccent transition-opacity hover:opacity-90"
          >
            Réessayer
          </button>
        </div>
      )}

      {isOnline && isHidden && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-bg p-6 text-center">
          <div className="rounded-[4px] mb-4 flex h-16 w-16 items-center justify-center bg-hover text-[28px] text-textmain">
            &#128274;
          </div>
          <h2 className="text-h3">Contenu masqué</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-textmuted">
            La lecture est suspendue quand l'onglet passe à l'arrière-plan.
            Revenez sur cette fenêtre pour reprendre.
          </p>
        </div>
      )}

      <div className={veiled ? "pointer-events-none select-none opacity-0" : ""}>{children}</div>
    </>
  );
}
