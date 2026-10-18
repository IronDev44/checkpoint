import { cloneElement, useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, signOut, sendPasswordResetEmail, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "../firebase";
import { accountsEnabled, accountStorage } from "../services/accountData";
import { ownerUid } from "../services/accountConfig";
import WelcomeTour from "./WelcomeTour";
import StartupIntro from "./StartupIntro";
import { readStartupAppearance } from "../services/startupAppearance";
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
  const [notice, setNotice] = useState("");
  const [tour, setTour] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [startupVisible, setStartupVisible] = useState(true);
  const [startupAppearance] = useState(readStartupAppearance);
  const [appProgress, setAppProgress] = useState(0);
  const reportAppProgress = useCallback(progress => setAppProgress(previous => Math.max(previous, progress)), []);
  const finishStartup = useCallback(() => setStartupVisible(false), []);
  const startupReady = !creatingProfile && (accountsEnabled ? user === null || Boolean(user && appProgress >= 1) : appProgress >= 1);
  const app = () => cloneElement(children, { key: user?.uid || "local", startupVisible, tutorialsReady: !startupVisible && !creatingProfile && !tour, onStartupProgress: reportAppProgress });
  const withStartup = content => <><div style={{display:"contents"}} inert={startupVisible || creatingProfile ? true : undefined} aria-hidden={startupVisible || creatingProfile ? "true" : undefined}>{content}</div><StartupIntro visible={startupVisible || creatingProfile} appearance={startupAppearance} authReady={!accountsEnabled || user !== undefined} appProgress={appProgress} ready={startupReady} onComplete={finishStartup}/></>;
  useEffect(() => {
    if (user !== undefined) return;
    document.documentElement.dataset.theme = startupAppearance.theme;
    document.body.dataset.theme = startupAppearance.theme;
  }, [user, startupAppearance]);
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
    setBusy(true); setError(""); setNotice("");
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
    if (mode === "reset") {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice("Si cette adresse a un compte, un lien de récupération va arriver par e-mail. Pense aussi à vérifier les courriers indésirables.");
      return;
    }
    await preparePersistence();
    if (mode !== "create") return signInWithEmailAndPassword(auth, email, password);
    if (!pseudo.trim()) { setError("Choisis un pseudo pour ton profil."); return; }
    setCreatingProfile(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: pseudo.trim() });
    } finally { setCreatingProfile(false); }
  }
  if (!accountsEnabled) return withStartup(<>{app()}{tour && !startupVisible && <WelcomeTour onClose={finishTour} />}</>);
  if (user === undefined || creatingProfile) return withStartup(null);
  if (!user) return withStartup(<div className="account-welcome-overlay"><section className="account-welcome">
    <p className="welcome-counter">CHECKPOINT</p><h1>{mode === "reset" ? "Retrouver ton compte" : mode === "create" ? "Ton aventure commence ici" : "Content de te retrouver"}</h1><p>{mode === "reset" ? "Indique l’adresse e-mail de ton compte pour recevoir un lien et choisir un nouveau mot de passe." : "Un espace à toi pour tes jeux, ton matériel et tes souvenirs."}</p>
    <form onSubmit={e => { e.preventDefault(); run(submitAccount); }}>
      {mode === "create" && <label>Ton pseudo<input required maxLength={40} value={pseudo} onChange={e => setPseudo(e.target.value)} autoComplete="nickname" /></label>}
      <label>Adresse e-mail<input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
      {mode !== "reset" && <><label>Mot de passe<input type="password" minLength={6} required value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === "create" ? "new-password" : "current-password"} /></label>
      <label className="welcome-remember"><input type="checkbox" checked={remember} disabled={busy} onChange={e => changeRemember(e.target.checked)} /><span>Rester connecté<small>Retrouve ton espace à la prochaine ouverture.</small></span></label></>}
      <button className="checkpoint-primary-action" disabled={busy}>{busy ? "Un instant…" : mode === "reset" ? "Envoyer le lien" : mode === "create" ? "Créer mon compte" : "Se connecter"}</button>
    </form>
    {process.env.REACT_APP_GOOGLE_AUTH_ENABLED === "true" && <div className="welcome-actions"><button disabled={busy} onClick={() => run(async () => { await preparePersistence(); await signInWithPopup(auth, new GoogleAuthProvider()); })}>Continuer avec Google</button></div>}
    {mode === "login" && <div className="welcome-recovery"><button className="welcome-reset" disabled={busy} onClick={() => { setMode("reset"); setError(""); setNotice(""); }}>Mot de passe oublié</button></div>}
    {notice && <p className="welcome-notice" role="status">{notice}</p>}
    <div className="welcome-account-switch">{mode !== "reset" && <p>{mode === "create" ? "Déjà dans l’aventure ?" : "Nouveau sur Checkpoint ?"}</p>}<button disabled={busy} onClick={() => { setMode(mode === "create" || mode === "reset" ? "login" : "create"); setError(""); setNotice(""); }}>{mode === "reset" ? "Retour à la connexion" : mode === "create" ? "J’ai déjà un compte" : "Créer un compte"}</button></div>
    {error && <p className="welcome-error" role="status">{error}</p>}
  </section></div>);
  return withStartup(<>{app()}{tour && !startupVisible && <WelcomeTour onClose={finishTour} />}</>);
}
export function AccountOptions() {
  return <section className="search-panel options-panel account-options"><h2 className="panel-title">Prendre ses repères</h2><p>Retrouve la présentation de Checkpoint quand tu veux.</p><button className="option-pill option-wide-action" onClick={() => window.dispatchEvent(new Event("checkpoint-replay-tour"))}>Revoir la découverte</button>{accountsEnabled && <><p>Connecté : {auth.currentUser?.email}</p><button className="option-pill option-wide-action" onClick={() => signOut(auth)}>Se déconnecter</button></>}</section>;
}
