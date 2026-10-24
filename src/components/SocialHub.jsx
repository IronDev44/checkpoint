import SpoilerText from "./SpoilerText";
import { useEffect, useState } from "react";
import { getFriendsFeed,activityMatchesFilter,SOCIAL_FEED_FILTERS } from "../services/socialProfiles";
import { SocialAvatar } from "./ProfilePhoto";
import "./SocialHub.css";
import SocialReactions,{useSocialReactions} from './SocialReactions';

export function SocialNavigation({ view, onChange, profile, friendCount, requestCount=0 }) {
  const profileView = view === "profile" || view === "showcase";
  return <>
    <header className="social-hub-header">
      <div><h2>Social</h2><p>Les jeux nous rassemblent.</p></div>
      <button className="social-hub-account" type="button" onClick={() => onChange("profile")} aria-label="Modifier mon profil public">
        <SocialAvatar name={profile.displayName} src={profile.photoURL} />
        <span><strong>{profile.displayName || "Mon profil"}</strong><small>{profile.handle ? `@${profile.handle}` : "Personnaliser mon profil"}</small></span>
      </button>
    </header>
    <nav className="social-hub-nav" aria-label="Navigation sociale">
      {[["feed", "Fil"], ["friends", "Amis"], ["recommendations", "Recommandations"], ["polls", "Sondages"], ["challenges", "Défis"], ["profile", "Profil public"]].map(([key, label]) =>
        <button key={key} type="button" aria-pressed={key === "profile" ? profileView : view === key}
          className={(key === "profile" ? profileView : view === key) ? "active" : ""} onClick={() => onChange(key)}>
          {label}{key === "friends" && friendCount > 0 && <small>{friendCount}</small>}{key === "friends" && requestCount > 0 && <small aria-label={`${requestCount} invitation${requestCount>1?'s':''} reçue${requestCount>1?'s':''}`}> · {requestCount} à accepter</small>}
        </button>)}
    </nav>
    {profileView && <div className="social-hub-profile-tabs" role="group" aria-label="Personnaliser mon profil">
      <button type="button" className={view === "profile" ? "active" : ""} aria-pressed={view === "profile"} onClick={() => onChange("profile")}>Identité et partage</button>
      <button type="button" className={view === "showcase" ? "active" : ""} aria-pressed={view === "showcase"} onClick={() => onChange("showcase")}>Ma vitrine</button>
    </div>}
  </>;
}

export function SocialFriendsDirectory({ friends, onOpen, onRemove, loadProfile, onBlock, onCommon, onInvite, confirmedHandles=[],mutedHandles=[],onMute,onReport }) {
  const [query, setQuery] = useState("");
  const [opening, setOpening] = useState("");
  const [error, setError] = useState("");
  const [currentProfiles, setCurrentProfiles] = useState({});
  const [limit, setLimit] = useState(20);
  const filtered = friends.filter(friend => `${friend.displayName} ${friend.handle}`.toLowerCase().includes(query.toLowerCase()));
  const shown = filtered.slice(0, limit);
  const handles = shown.map(friend => friend.handle).join(",");
  useEffect(() => {
    if (!loadProfile) return undefined;
    let cancelled = false;
    const list = handles.split(",").filter(Boolean);
    Promise.allSettled(list.map(handle => loadProfile(handle))).then(results => {
      if (!cancelled) setCurrentProfiles(Object.fromEntries(results.map((result, index) => [list[index], result.status === "fulfilled" ? result.value : null])));
    });
    return () => { cancelled = true; };
  }, [handles, loadProfile]);
  const open = async handle => {
    setOpening(handle); setError("");
    try { await onOpen(handle); } catch (e) { setError(e.message || "Impossible de charger ce profil. Réessaie."); }
    finally { setOpening(""); }
  };
  return <div className="social-hub-directory">
    {friends.length > 0 && <input type="search" aria-label="Rechercher un ami" value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher parmi mes amis" />}
    {error && <p role="alert" className="social-hub-notice">{error}</p>}
    {shown.map(friend => <article key={friend.handle} className="social-hub-friend">
      <button type="button" className="social-hub-friend-identity" disabled={Boolean(opening)} onClick={() => open(friend.handle)} aria-label={`Voir le profil de ${friend.displayName || friend.handle}`}>
        <SocialAvatar name={friend.displayName} src={loadProfile ? currentProfiles[friend.handle]?.photoURL : friend.photoURL} />
        <span><strong>{friend.displayName || friend.handle}</strong><small>@{friend.handle}</small>{friend.platform && <small>{friend.platform}</small>}</span>
      </button>
      <div className="social-hub-friend-actions">
        <button type="button" className="social-hub-primary" disabled={Boolean(opening)} onClick={() => open(friend.handle)}>{opening === friend.handle ? "Chargement…" : "Voir le profil"}</button>
        {onCommon&&<button type="button" onClick={()=>onCommon(friend)}>Nos jeux en commun</button>}
        <details className="social-hub-friend-manage"><summary>Gérer cet ami</summary><div className="social-hub-friend-secondary">
        {onInvite&&!confirmedHandles.includes(friend.handle)&&<button type="button" onClick={()=>onInvite(friend.handle)}>Confirmer l’amitié</button>}
        {onMute&&<button type="button" className="social-hub-remove" onClick={()=>onMute(friend)}>{mutedHandles.includes(friend.handle)?'Réafficher dans le fil':'Masquer dans le fil'}</button>}
        {mutedHandles.includes(friend.handle)&&<small>Activités masquées, amitié conservée.</small>}
        <button type="button" className="social-hub-remove" onClick={() => onRemove(friend.handle)} aria-label={`Retirer ${friend.displayName || friend.handle} des amis`}>Retirer</button>
        {onBlock&&<button type="button" className="social-hub-remove" onClick={()=>onBlock(friend)}>Bloquer</button>}
        {onReport&&<button type="button" className="social-hub-remove" onClick={()=>onReport({type:'profile',handle:friend.handle})}>Signaler le profil</button>}
        </div></details>
      </div>
    </article>)}
    {!friends.length && <p className="social-hub-empty">Ton cercle commence ici. Invite un joueur avec son identifiant Checkpoint : il rejoindra tes amis après acceptation.</p>}
    {friends.length > 0 && !filtered.length && <p className="social-hub-empty">Aucun ami ne correspond à cette recherche.</p>}
    {filtered.length > limit && <button type="button" className="option-pill" onClick={() => setLimit(n => n + 20)}>Voir les autres amis</button>}
  </div>;
}

export function FriendsActivityFeed({ friends, loadProfile, onOpen,mutedHandles=[],onReport }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(0);
  const [revision, setRevision] = useState(0);
  const [limit, setLimit] = useState(20);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState("");
  const [filter,setFilter]=useState('all');
  const handles = friends.filter(friend=>!mutedHandles.includes(friend.handle)).map(friend => friend.handle).join(",");
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
  const visibleProfiles=profiles.filter(profile=>!mutedHandles.includes(profile.handle));
  const allActivities=getFriendsFeed(visibleProfiles);
  const activities = allActivities.filter(item=>activityMatchesFilter(item,filter)).slice(0, 40);
  const reactions=useSocialReactions(visibleProfiles);
  const open = async handle => {
    setOpening(handle); setError("");
    try { await onOpen(handle); } catch (e) { setError(e.message || "Profil indisponible."); }
    finally { setOpening(""); }
  };
  return <section className="social-hub-friends-feed" aria-busy={loading}>
    <div className="social-hub-feed-heading"><h3>Du côté de tes amis</h3><button type="button" disabled={loading} onClick={() => setRevision(r => r + 1)}>Actualiser</button></div>
    <p className="social-hub-notice">Les activités les plus récentes apparaissent en premier.</p>
    <div className="tool-filter-buttons" role="group" aria-label="Filtrer les activités des amis">{SOCIAL_FEED_FILTERS.map(([key,label])=><button type="button" key={key} aria-pressed={filter===key} onClick={()=>setFilter(key)}>{label}</button>)}</div>
    {loading && <p role="status">Chargement des activités…</p>}
    {error && <p role="alert" className="social-hub-notice">{error}</p>}
    {reactions.error&&<p role="alert">{reactions.error}</p>}
    {!loading && unavailable > 0 && <p className="social-hub-notice">Certains profils ne sont pas disponibles pour le moment.</p>}
    {!loading && !activities.length && <p className="social-hub-empty">{filter!=='all'?"Aucune activité partagée dans cette catégorie. Les fins de jeu utilisent les dates renseignées.":friends.length ? "Pas encore d’activité à afficher. Les amis masqués dans le fil restent accessibles dans Amis." : "Ajoute des amis pour retrouver ici leurs jeux, leurs notes et leurs publications."}</p>}
    {!loading && activities.map(item => <article className="social-hub-post" key={item.feedId}>
      <button type="button" className="social-hub-post-author" disabled={Boolean(opening)} onClick={() => open(item.profile.handle)}>
        <SocialAvatar name={item.profile.displayName} src={item.profile.photoURL} />
        <span><strong>{item.profile.displayName || item.profile.handle}</strong><small>@{item.profile.handle}</small></span>
        <span className="social-hub-profile-link">{opening === item.profile.handle ? "Chargement…" : "Voir le profil"}</span>
      </button>
      <div className="social-hub-post-body">{item.image && <img src={item.image} alt="" loading="lazy" />}<div><small>{item.type || "Activité"}</small><h4>{item.title}</h4>{item.text && <p>{item.text}</p>}{item.detail && <p><SpoilerText text={item.detail}/></p>}{item.reviewText&&<p><SpoilerText text={item.reviewText} whole={item.reviewSpoiler}/></p>}</div></div>
      <SocialReactions handle={item.profile.handle} activityId={item.id} resource={reactions}/>
      {onReport&&<button type="button" className="social-report-trigger" onClick={()=>onReport({type:'activity',handle:item.profile.handle,activityId:String(item.id)})}>Signaler cette publication</button>}
    </article>)}
    {friends.length > limit && <button type="button" disabled={loading} onClick={() => setLimit(n => n + 20)}>Charger les autres amis</button>}
  </section>;
}
