import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedValue, LocalizedElement } from "../i18n/Localized";import CatalogImage from './CatalogImage';
import SpoilerText from "./SpoilerText";
import { useEffect, useState } from "react";
import { getFriendsFeed, activityMatchesFilter, SOCIAL_FEED_FILTERS } from "../services/socialProfiles";
import { SocialAvatar } from "./ProfilePhoto";
import "./SocialHub.css";
import SocialReactions, { useSocialReactions } from './SocialReactions';

export function SocialNavigation({ view, onChange, profile, friendCount, requestCount = 0 }) {useLanguage();
  const profileView = view === "profile" || view === "showcase";
  return <>
    <header className="social-hub-header">
      <div><h2><LocalizedMessage source={"Social"} values={[]} /></h2><p><LocalizedMessage source={"Les jeux nous rassemblent."} values={[]} /></p></div>
      <LocalizedElement __as={"button"} className="social-hub-account" type="button" onClick={() => onChange("profile")} aria-label="Modifier mon profil public">
        <SocialAvatar name={profile.displayName} src={profile.photoURL} />
        <span><strong>{profile.displayName || "Mon profil"}</strong><small><LocalizedValue value={profile.handle ? `@${profile.handle}` : "Personnaliser mon profil"} /></small></span>
      </LocalizedElement>
    </header>
    <LocalizedElement __as={"nav"} className="social-hub-nav" aria-label="Navigation sociale">{
      [["feed", "Fil"], ["friends", "Amis"], ["recommendations", "Recommandations"], ["polls", "Sondages"], ["challenges", "Défis"], ["profile", "Profil public"]].map(([key, label]) =>
      <button key={key} type="button" aria-pressed={key === "profile" ? profileView : view === key}
      className={(key === "profile" ? profileView : view === key) ? "active" : ""} onClick={() => onChange(key)}>
          <LocalizedValue value={label} />{key === "friends" && friendCount > 0 && <small><LocalizedValue value={friendCount} /></small>}{key === "friends" && requestCount > 0 && <LocalizedElement __as={"small"} __messages={{ "aria-label": { source: "{{0}} invitation{{1}} reçue{{2}}", values: [requestCount, requestCount > 1 ? 's' : '', requestCount > 1 ? 's' : ''], preserve: [] } }}><LocalizedMessage source={" · {{0}} à accepter"} values={[requestCount]} /></LocalizedElement>}
        </button>)}
    </LocalizedElement>
    {profileView && <LocalizedElement __as={"div"} className="social-hub-profile-tabs" role="group" aria-label="Personnaliser mon profil">
      <button type="button" className={view === "profile" ? "active" : ""} aria-pressed={view === "profile"} onClick={() => onChange("profile")}><LocalizedMessage source={"Identité et partage"} values={[]} /></button>
      <button type="button" className={view === "showcase" ? "active" : ""} aria-pressed={view === "showcase"} onClick={() => onChange("showcase")}><LocalizedMessage source={"Ma vitrine"} values={[]} /></button>
    </LocalizedElement>}
  </>;
}

export function SocialFriendsDirectory({ friends, onOpen, onRemove, loadProfile, onBlock, onCommon, onInvite, confirmedHandles = [], mutedHandles = [], onMute, onReport }) {useLanguage();
  const [query, setQuery] = useState("");
  const [opening, setOpening] = useState("");
  const [error, setError] = useState("");
  const [currentProfiles, setCurrentProfiles] = useState({});
  const [limit, setLimit] = useState(20);
  const filtered = friends.filter((friend) => `${friend.displayName} ${friend.handle}`.toLowerCase().includes(query.toLowerCase()));
  const shown = filtered.slice(0, limit);
  const handles = shown.map((friend) => friend.handle).join(",");
  useEffect(() => {
    if (!loadProfile) return undefined;
    let cancelled = false;
    const list = handles.split(",").filter(Boolean);
    Promise.allSettled(list.map((handle) => loadProfile(handle))).then((results) => {
      if (!cancelled) setCurrentProfiles(Object.fromEntries(results.map((result, index) => [list[index], result.status === "fulfilled" ? result.value : null])));
    });
    return () => {cancelled = true;};
  }, [handles, loadProfile]);
  const open = async (handle) => {
    setOpening(handle);setError("");
    try {await onOpen(handle);} catch (e) {setError(e.message || "Impossible de charger ce profil. Réessaie.");} finally
    {setOpening("");}
  };
  return <div className="social-hub-directory">
    {friends.length > 0 && <LocalizedElement __as={"input"} type="search" aria-label="Rechercher un ami" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher parmi mes amis" />}
    {error && <p role="alert" className="social-hub-notice"><LocalizedValue value={error} /></p>}
    {shown.map((friend) => <article key={friend.handle} className="social-hub-friend">
      <LocalizedElement __as={"button"} type="button" className="social-hub-friend-identity" disabled={Boolean(opening)} onClick={() => open(friend.handle)} __messages={{ "aria-label": { source: "Voir le profil de {{0}}", values: [friend.displayName || friend.handle], preserve: [] } }}>
        <SocialAvatar name={friend.displayName} src={loadProfile ? currentProfiles[friend.handle]?.photoURL : friend.photoURL} />
        <span><strong>{friend.displayName || friend.handle}</strong><small>@<LocalizedValue value={friend.handle} /></small>{friend.platform && <small><LocalizedValue value={friend.platform} /></small>}</span>
      </LocalizedElement>
      <div className="social-hub-friend-actions">
        <button type="button" className="social-hub-primary" disabled={Boolean(opening)} onClick={() => open(friend.handle)}><LocalizedValue value={opening === friend.handle ? "Chargement…" : "Voir le profil"} /></button>{
        onCommon && <button type="button" onClick={() => onCommon(friend)}><LocalizedMessage source={"Nos jeux en commun"} values={[]} /></button>}
        <details className="social-hub-friend-manage"><summary><LocalizedMessage source={"Gérer cet ami"} values={[]} /></summary><div className="social-hub-friend-secondary">
        {onInvite && !confirmedHandles.includes(friend.handle) && <button type="button" onClick={() => onInvite(friend.handle)}><LocalizedMessage source={"Confirmer l’amitié"} values={[]} /></button>}
        {onMute && <button type="button" className="social-hub-remove" onClick={() => onMute(friend)}><LocalizedValue value={mutedHandles.includes(friend.handle) ? 'Réafficher dans le fil' : 'Masquer dans le fil'} /></button>}
        {mutedHandles.includes(friend.handle) && <small><LocalizedMessage source={"Activités masquées, amitié conservée."} values={[]} /></small>}
        <LocalizedElement __as={"button"} type="button" className="social-hub-remove" onClick={() => onRemove(friend.handle)} __messages={{ "aria-label": { source: "Retirer {{0}} des amis", values: [friend.displayName || friend.handle], preserve: [] } }}><LocalizedMessage source="Retirer" values={[]}/></LocalizedElement>
        {onBlock && <button type="button" className="social-hub-remove" onClick={() => onBlock(friend)}><LocalizedMessage source={"Bloquer"} values={[]} /></button>}
        {onReport && <button type="button" className="social-hub-remove" onClick={() => onReport({ type: 'profile', handle: friend.handle })}><LocalizedMessage source={"Signaler le profil"} values={[]} /></button>}
        </div></details>
      </div>
    </article>)}
    {!friends.length && <p className="social-hub-empty"><LocalizedMessage source={"Ton cercle commence ici. Invite un joueur avec son identifiant Checkpoint : il rejoindra tes amis après acceptation."} values={[]} /></p>}
    {friends.length > 0 && !filtered.length && <p className="social-hub-empty"><LocalizedMessage source={"Aucun ami ne correspond à cette recherche."} values={[]} /></p>}
    {filtered.length > limit && <button type="button" className="option-pill" onClick={() => setLimit((n) => n + 20)}><LocalizedMessage source={"Voir les autres amis"} values={[]} /></button>}
  </div>;
}

export function FriendsActivityFeed({ friends, loadProfile, onOpen, mutedHandles = [], onReport }) {useLanguage();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(0);
  const [revision, setRevision] = useState(0);
  const [limit, setLimit] = useState(20);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState("");
  const [filter, setFilter] = useState('all');
  const handles = friends.filter((friend) => !mutedHandles.includes(friend.handle)).map((friend) => friend.handle).join(",");
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled(handles.split(",").filter(Boolean).slice(0, limit).map((handle) => loadProfile(handle))).then((results) => {
      if (cancelled) return;
      setProfiles(results.filter((r) => r.status === "fulfilled").map((r) => r.value));
      setUnavailable(results.filter((r) => r.status === "rejected").length);
      setLoading(false);
    });
    return () => {cancelled = true;};
  }, [handles, limit, revision, loadProfile]);
  const visibleProfiles = profiles.filter((profile) => !mutedHandles.includes(profile.handle));
  const allActivities = getFriendsFeed(visibleProfiles);
  const activities = allActivities.filter((item) => activityMatchesFilter(item, filter)).slice(0, 40);
  const reactions = useSocialReactions(visibleProfiles);
  const open = async (handle) => {
    setOpening(handle);setError("");
    try {await onOpen(handle);} catch (e) {setError(e.message || "Profil indisponible.");} finally
    {setOpening("");}
  };
  return <section className="social-hub-friends-feed" aria-busy={loading}>
    <div className="social-hub-feed-heading"><h3><LocalizedMessage source={"Du côté de tes amis"} values={[]} /></h3><button type="button" disabled={loading} onClick={() => setRevision((r) => r + 1)}><LocalizedMessage source={"Actualiser"} values={[]} /></button></div>
    <p className="social-hub-notice"><LocalizedMessage source={"Les activités les plus récentes apparaissent en premier."} values={[]} /></p>
    <LocalizedElement __as={"div"} className="tool-filter-buttons" role="group" aria-label="Filtrer les activités des amis">{SOCIAL_FEED_FILTERS.map(([key, label]) => <button type="button" key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}><LocalizedValue value={label} /></button>)}</LocalizedElement>
    {loading && <p role="status"><LocalizedMessage source={"Chargement des activités…"} values={[]} /></p>}
    {error && <p role="alert" className="social-hub-notice"><LocalizedValue value={error} /></p>}
    {reactions.error && <p role="alert"><LocalizedValue value={reactions.error} /></p>}
    {!loading && unavailable > 0 && <p className="social-hub-notice"><LocalizedMessage source={"Certains profils ne sont pas disponibles pour le moment."} values={[]} /></p>}
    {!loading && !activities.length && <p className="social-hub-empty"><LocalizedValue value={filter !== 'all' ? "Aucune activité partagée dans cette catégorie. Les fins de jeu utilisent les dates renseignées." : friends.length ? "Pas encore d’activité à afficher. Les amis masqués dans le fil restent accessibles dans Amis." : "Ajoute des amis pour retrouver ici leurs jeux, leurs notes et leurs publications."} /></p>}
    {!loading && activities.map((item) => <article className="social-hub-post" key={item.feedId}>
      <button type="button" className="social-hub-post-author" disabled={Boolean(opening)} onClick={() => open(item.profile.handle)}>
        <SocialAvatar name={item.profile.displayName} src={item.profile.photoURL} />
        <span><strong>{item.profile.displayName || item.profile.handle}</strong><small>@<LocalizedValue value={item.profile.handle} /></small></span>
        <span className="social-hub-profile-link"><LocalizedValue value={opening === item.profile.handle ? "Chargement…" : "Voir le profil"} /></span>
      </button>
      <div className="social-hub-post-body">{item.image && <CatalogImage src={item.image} alt="" loading="lazy" />}<div><small><LocalizedValue value={item.type || "Activité"} /></small><h4><LocalizedValue value={item.title} /></h4>{item.text && <p>{item.text}</p>}{item.detail && <p><SpoilerText text={item.detail} /></p>}{item.reviewText && <p><SpoilerText text={item.reviewText} whole={item.reviewSpoiler} /></p>}</div></div>
      <SocialReactions handle={item.profile.handle} activityId={item.id} resource={reactions} />{
      onReport && <button type="button" className="social-report-trigger" onClick={() => onReport({ type: 'activity', handle: item.profile.handle, activityId: String(item.id) })}><LocalizedMessage source={"Signaler cette publication"} values={[]} /></button>}
    </article>)}
    {friends.length > limit && <button type="button" disabled={loading} onClick={() => setLimit((n) => n + 20)}><LocalizedMessage source={"Charger les autres amis"} values={[]} /></button>}
  </section>;
}
