import { cloneElement, useEffect, useState } from "react";
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, signOut, sendPasswordResetEmail, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "../firebase";
import { accountsEnabled, accountStorage } from "../services/accountData";
import { ownerUid } from "../services/accountConfig";
import WelcomeTour from "./WelcomeTour";
import "./AccountWelcome.css";

const messages = {
  "auth/invalid-credential": "L’adresse ou le mot de passe ne correspond pas.",
  "auth/email-already-in-use": "Cette adresse a déjà un compte. Choisis Se connecter.",
  "auth/weak-password": "Choisis un mot de passe d’au moins 6 caractères.",
  "auth/invalid-email": "Vérifie ton adresse e-mail.",
  "auth/operation-not-allowed": "La connexion doit encore être activée pour cette application.",
  "auth/unauthorized-domain": "La connexion Google doit encore être autorisée sur cette adresse.",
  "auth/too-many-requests": "Trop de tentatives. Réessaie dans quelques minutes.",
};
export default function AccountGate({ children }) {
  const [user, setUser] = useState(undefined);
  const [mode, setMode] = useState("create");
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(() => {
    try { return window.localStorage.getItem("checkpoint-remember-login") !== "false"; } catch { return true; }
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tour, setTour] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  useEffect(() => {
    if (!accountsEnabled) return;
    return onAuthStateChanged(auth, current => {
      if (current) {
        try {
          if (current.uid === ownerUid && accountStorage.getItem("legacy-imported") !== "true") {
            // Recover this owner's existing device preferences and locally earned progress once.
            const keys = Object.keys(window.localStorage).filter(key => key.startsWith("checkpoint-") && !key.startsWith("checkpoint-account:"));
            keys.forEach(key => accountStorage.setItem(key, window.localStorage.getItem(key)));
            accountStorage.setItem("legacy-imported", "true");
          }
          setTour(accountStorage.getItem("welcome-complete") !== "true");
        } catch { setTour(true); }
      }
      setUser(current);
    });
  }, []);
  useEffect(() => { const replay = () => setTour(true); window.addEventListener("checkpoint-replay-tour", replay); return () => window.removeEventListener("checkpoint-replay-tour", replay); }, []);
  async function run(action) {
    setBusy(true); setError("");
    try { await action(); } catch (e) { setError(messages[e.code] || "La connexion n’a pas abouti. Réessaie dans un instant."); } finally { setBusy(false); }
  }
  function finishTour() { try { accountStorage.setItem("welcome-complete", "true"); } catch {} setTour(false); }
  function changeRemember(value) {
    setRemember(value);
    try { window.localStorage.setItem("checkpoint-remember-login", String(value)); } catch {}
  }
  async function preparePersistence() {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  }
  async function submitAccount() {
    await preparePersistence();
    if (mode !== "create") return signInWithEmailAndPassword(auth, email, password);
    if (!pseudo.trim()) { setError("Choisis un pseudo pour ton profil."); return; }
    setCreatingProfile(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: pseudo.trim() });
    } finally { setCreatingProfile(false); }
  }
  if (!accountsEnabled) return <>{children}{tour && <WelcomeTour onClose={finishTour} />}</>;
  if (user === undefined || creatingProfile) return <div className="account-welcome-overlay"><p>Ouverture de ton espace…</p></div>;
  if (!user) return <div className="account-welcome-overlay"><section className="account-welcome">
    <p className="welcome-counter">CHECKPOINT</p><h1>{mode === "create" ? "Ton aventure commence ici" : "Content de te retrouver"}</h1><p>Un espace à toi pour tes jeux, ton matériel et tes souvenirs.</p>
    <form onSubmit={e => { e.preventDefault(); run(submitAccount); }}>
      {mode === "create" && <label>Ton pseudo<input required maxLength={40} value={pseudo} onChange={e => setPseudo(e.target.value)} autoComplete="nickname" /></label>}
      <label>Adresse e-mail<input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
      <label>Mot de passe<input type="password" minLength={6} required value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === "create" ? "new-password" : "current-password"} /></label>
      <label className="welcome-remember"><input type="checkbox" checked={remember} disabled={busy} onChange={e => changeRemember(e.target.checked)} /><span>Rester connecté<small>Retrouve ton espace à la prochaine ouverture.</small></span></label>
      <button className="checkpoint-primary-action" disabled={busy}>{busy ? "Un instant…" : mode === "create" ? "Créer mon compte" : "Se connecter"}</button>
    </form>
    {process.env.REACT_APP_GOOGLE_AUTH_ENABLED === "true" && <div className="welcome-actions"><button disabled={busy} onClick={() => run(async () => { await preparePersistence(); await signInWithPopup(auth, new GoogleAuthProvider()); })}>Continuer avec Google</button></div>}
    {mode === "login" && <div className="welcome-recovery"><button className="welcome-reset" disabled={busy || !email} onClick={() => run(async () => { await sendPasswordResetEmail(auth, email); setError("Si cette adresse a un compte, tu recevras un e-mail pour changer le mot de passe."); })}>Mot de passe oublié</button></div>}
    <div className="welcome-account-switch"><p>{mode === "create" ? "Déjà dans l’aventure ?" : "Nouveau sur Checkpoint ?"}</p><button disabled={busy} onClick={() => { setMode(mode === "create" ? "login" : "create"); setError(""); }}>{mode === "create" ? "J’ai déjà un compte" : "Créer un compte"}</button></div>
    {error && <p className="welcome-error" role="status">{error}</p>}
  </section></div>;
  return <>{cloneElement(children, { key: user.uid })}{tour && <WelcomeTour onClose={finishTour} />}</>;
}
export function AccountOptions() {
  return <section className="search-panel options-panel account-options"><h2 className="panel-title">Prendre ses repères</h2><p>Retrouve la présentation de Checkpoint quand tu veux.</p><button className="option-pill option-wide-action" onClick={() => window.dispatchEvent(new Event("checkpoint-replay-tour"))}>Revoir la découverte</button>{accountsEnabled && <><p>Connecté : {auth.currentUser?.email}</p><button className="option-pill option-wide-action" onClick={() => signOut(auth)}>Se déconnecter</button></>}</section>;
}
