import { useEffect, useState } from "react";
import { getFriendsFeed } from "../services/socialProfiles";
import "./SocialHub.css";

const initials = name => String(name || "CP").split(/\s+/).map(word => word[0]).slice(0, 2).join("").toUpperCase();

export function SocialNavigation({ view, onChange, profile, friendCount }) {
  const profileView = view === "profile" || view === "showcase";
  return <>
    <header className="social-hub-header">
      <div><h2>Social</h2><p>Les jeux nous rassemblent.</p></div>
      <button className="social-hub-account" type="button" onClick={() => onChange("profile")} aria-label="Ouvrir mon profil">
        <span className="social-hub-avatar" aria-hidden="true">{initials(profile.displayName)}</span>
        <span><strong>{profile.displayName || "Mon profil"}</strong><small>{profile.handle ? `@${profile.handle}` : "Personnaliser mon profil"}</small></span>
      </button>
    </header>
    <nav className="social-hub-nav" aria-label="Navigation sociale">
      {[["feed", "Fil"], ["friends", "Amis"], ["profile", "Mon profil"]].map(([key, label]) =>
        <button key={key} type="button" aria-pressed={key === "profile" ? profileView : view === key}
          className={(key === "profile" ? profileView : view === key) ? "active" : ""} onClick={() => onChange(key)}>
          {label}{key === "friends" && friendCount > 0 && <small>{friendCount}</small>}
        </button>)}
    </nav>
    {profileView && <div className="social-hub-profile-tabs" role="group" aria-label="Personnaliser mon profil">
      <button type="button" className={view === "profile" ? "active" : ""} aria-pressed={view === "profile"} onClick={() => onChange("profile")}>Identité et partage</button>
      <button type="button" className={view === "showcase" ? "active" : ""} aria-pressed={view === "showcase"} onClick={() => onChange("showcase")}>Ma vitrine</button>
    </div>}
  </>;
}

export function SocialFriendsDirectory({ friends, onOpen, onRemove }) {
  const [query, setQuery] = useState("");
  const [opening, setOpening] = useState("");
  const [error, setError] = useState("");
  const filtered = friends.filter(friend => `${friend.displayName} ${friend.handle}`.toLowerCase().includes(query.toLowerCase()));
  const open = async handle => {
    setOpening(handle); setError("");
    try { await onOpen(handle); } catch (e) { setError(e.message || "Impossible de charger ce profil. Réessaie."); }
    finally { setOpening(""); }
  };
  return <div className="social-hub-directory">
    {friends.length > 0 && <input type="search" aria-label="Rechercher un ami" value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher parmi mes amis" />}
    {error && <p role="alert" className="social-hub-notice">{error}</p>}
    {filtered.map(friend => <article key={friend.handle} className="social-hub-friend">
      <button type="button" className="social-hub-friend-identity" disabled={Boolean(opening)} onClick={() => open(friend.handle)} aria-label={`Voir le profil de ${friend.displayName || friend.handle}`}>
        <span className="social-hub-avatar" aria-hidden="true">{initials(friend.displayName)}</span>
        <span><strong>{friend.displayName || friend.handle}</strong><small>@{friend.handle}</small>{friend.platform && <small>{friend.platform}</small>}</span>
      </button>
      <div className="social-hub-friend-actions">
        <button type="button" className="social-hub-primary" disabled={Boolean(opening)} onClick={() => open(friend.handle)}>{opening === friend.handle ? "Chargement…" : "Voir le profil"}</button>
        <button type="button" className="social-hub-remove" onClick={() => onRemove(friend.handle)} aria-label={`Retirer ${friend.displayName || friend.handle} des amis`}>Retirer</button>
      </div>
    </article>)}
    {!friends.length && <p className="social-hub-empty">Ton cercle commence ici. Ajoute un ami avec son identifiant Checkpoint.</p>}
    {friends.length > 0 && !filtered.length && <p className="social-hub-empty">Aucun ami ne correspond à cette recherche.</p>}
  </div>;
}

export function FriendsActivityFeed({ friends, loadProfile, onOpen }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(0);
  const [revision, setRevision] = useState(0);
  const [limit, setLimit] = useState(20);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState("");
  const handles = friends.map(friend => friend.handle).join(",");
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled(handles.split(",").filter(Boolean).slice(0, limit).map(handle => loadProfile(handle))).then(results => {
      if (cancelled) return;
      setProfiles(results.filter(r => r.status === "fulfilled").map(r => r.value));
      setUnavailable(results.filter(r => r.status === "rejected").length);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [handles, limit, revision, loadProfile]);
  const activities = getFriendsFeed(profiles).slice(0, 40);
  const open = async handle => {
    setOpening(handle); setError("");
    try { await onOpen(handle); } catch (e) { setError(e.message || "Profil indisponible."); }
    finally { setOpening(""); }
  };
  return <section className="social-hub-friends-feed" aria-busy={loading}>
    <div className="social-hub-feed-heading"><h3>Du côté de tes amis</h3><button type="button" disabled={loading} onClick={() => setRevision(r => r + 1)}>Actualiser</button></div>
    {loading && <p role="status">Chargement des activités…</p>}
    {error && <p role="alert" className="social-hub-notice">{error}</p>}
    {!loading && unavailable > 0 && <p className="social-hub-notice">Certains profils ne sont pas disponibles pour le moment.</p>}
    {!loading && !activities.length && <p className="social-hub-empty">{friends.length ? "Pas encore d’activité publique à afficher. Tu peux retrouver tes amis et leurs vitrines dans Amis." : "Ajoute des amis pour retrouver ici leurs jeux, leurs notes et leurs publications."}</p>}
    {!loading && activities.map(item => <article className="social-hub-post" key={item.feedId}>
      <button type="button" className="social-hub-post-author" disabled={Boolean(opening)} onClick={() => open(item.profile.handle)}>
        <span className="social-hub-avatar" aria-hidden="true">{initials(item.profile.displayName)}</span>
        <span><strong>{item.profile.displayName || item.profile.handle}</strong><small>@{item.profile.handle}</small></span>
        <span className="social-hub-profile-link">{opening === item.profile.handle ? "Chargement…" : "Voir le profil"}</span>
      </button>
      <div className="social-hub-post-body">{item.image && <img src={item.image} alt="" loading="lazy" />}<div><small>{item.type || "Activité"}</small><h4>{item.title}</h4>{item.text && <p>{item.text}</p>}{item.detail && <p>{item.detail}</p>}</div></div>
    </article>)}
    {friends.length > limit && <button type="button" disabled={loading} onClick={() => setLimit(n => n + 20)}>Charger les autres amis</button>}
  </section>;
}
