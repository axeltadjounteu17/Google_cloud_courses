import React, { useState, useEffect } from "react";

export default function SecurityGuard({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isBlurred, setIsBlurred] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {
    // 1. Détection de connexion en ligne obligatoire
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 2. Masquage du contenu en cas de perte de focus / ouverture d'outil de capture
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === "hidden") {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    // 3. Interception des raccourcis clavier de capture/copie/impression/DevTools
    const handleKeyDown = (e) => {
      const key = e.key;
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // PrintScreen / SysReq
      if (key === "PrintScreen" || key === "F12" || key === "ScrollLock") {
        e.preventDefault();
        e.stopPropagation();
        setIsBlurred(true);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("");
        }
        showToast("⚠️ Les captures d'écran sont strictement interdites sur cette plateforme.");
        setTimeout(() => setIsBlurred(false), 2000);
        return false;
      }

      // Raccourcis Ctrl/Cmd + P (Imprimer), S (Sauvegarder), U (Code source), C (Copier), A (Tout sélectionner), I (DevTools)
      if (isCtrlOrCmd) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey === "p" ||
          lowerKey === "s" ||
          lowerKey === "u" ||
          lowerKey === "c" ||
          lowerKey === "a" ||
          (e.shiftKey && (lowerKey === "i" || lowerKey === "j" || lowerKey === "c"))
        ) {
          e.preventDefault();
          e.stopPropagation();
          showToast(`⚠️ Action (Ctrl+${key.toUpperCase()}) bloquée : protection du contenu.`);
          return false;
        }
      }
    };

    // 4. Bloquage du clic droit (Context Menu)
    const handleContextMenu = (e) => {
      e.preventDefault();
      showToast("⚠️ Le clic droit est désactivé sur cette plateforme.");
      return false;
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("contextmenu", handleContextMenu, true);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, []);

  return (
    <>
      {/* Filigrane / Tatouage numérique flottant anti-capture photo */}
      <div className="security-watermark" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="security-watermark-item">
            GCP-PCA • SESSION SÉCURISÉE EN LIGNE • REPRODUCTION INTERDITE
          </div>
        ))}
      </div>

      {/* Toast de notification de sécurité */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[10000] flex items-center gap-3 rounded-xl bg-red/90 px-4 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-md transition-all">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Écran de blocage si HORS LIGNE (Connexion Internet Obligatoire) */}
      {!isOnline && (
        <div className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-bg p-6 text-center backdrop-blur-3xl">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red/20 text-3xl text-red">
            🌐
          </div>
          <h2 className="text-2xl font-bold text-textmain">Connexion Internet Obligatoire</h2>
          <p className="mt-2 max-w-md text-sm text-textmuted">
            L'accès à la plateforme de cours exige une connexion en ligne active. L'utilisation hors-ligne est désactivée afin de protéger le contenu et de garantir le suivi de la formation.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-cyan px-6 py-2.5 text-sm font-bold text-slate-950 transition-transform hover:scale-105"
          >
            Réessayer la connexion
          </button>
        </div>
      )}

      {/* Écran de masquage dynamique en cas de perte de focus / outil de capture actif */}
      {isOnline && isBlurred && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-bg/95 p-6 text-center backdrop-blur-3xl">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan/20 text-3xl text-cyan">
            🔒
          </div>
          <h2 className="text-xl font-bold text-textmain">Contenu Masqué par Sécurité</h2>
          <p className="mt-2 max-w-md text-sm text-textmuted">
            Le contenu du cours est temporairement masqué lors des changements de fenêtre ou d'utilisation d'outils externes. Cliquez sur la fenêtre pour reprendre la lecture.
          </p>
        </div>
      )}

      {/* Application principale */}
      <div className={!isOnline || isBlurred ? "pointer-events-none blur-2xl select-none" : ""}>
        {children}
      </div>
    </>
  );
}
