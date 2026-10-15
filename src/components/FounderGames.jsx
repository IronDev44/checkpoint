import { useEffect, useState } from "react";
import { Gamepad2 } from "lucide-react";
import { getCoverPlatformNames, getGameCoverKey, getKnownGameCover, resolveGameCover } from "../services/gameCovers";
import "./FounderGames.css";

function FounderGame({ game, index, resolveCover }) {
  const key = getGameCoverKey(game);
  const knownCover = getKnownGameCover(game);
  const [resolved, setResolved] = useState({ key: "", url: "", done: false });
  const [failedUrl, setFailedUrl] = useState("");
  useEffect(() => {
    let active = true;
    resolveCover(game).then(url => {
      if (active) setResolved({ key, url, done: true });
    }).catch(() => {
      if (active) setResolved({ key, url: "", done: true });
    });
    return () => { active = false; };
  }, [game, key, resolveCover]);
  const cover = knownCover || (resolved.key === key ? resolved.url : "");
  const loading = !knownCover && (resolved.key !== key || !resolved.done);
  const platforms = getCoverPlatformNames(game).slice(0, 2).join(", ");
  const rating = Number(game.rating);
  const caption = [platforms, rating > 0 && rating <= 10 ? `${rating.toLocaleString("fr-FR")}/10` : ""].filter(Boolean).join(" · ");
  return (
    <li className="founder-game">
      <div className="founder-game-cover">
        {cover && cover !== failedUrl
          ? <img src={cover} alt={`Jaquette de ${game.name}`} loading="lazy" decoding="async" onError={() => setFailedUrl(cover)} />
          : <div className="founder-cover-placeholder"><Gamepad2 size={28} aria-hidden="true" /><small>{loading ? "Recherche de la jaquette…" : "Jaquette indisponible"}</small></div>}
        <span className="founder-game-rank" aria-label={`Jeu fondateur ${index + 1}`}>{index + 1}</span>
      </div>
      <div className="founder-game-copy"><strong>{game.name}</strong>{caption && <small>{caption}</small>}</div>
    </li>
  );
}

export default function FounderGames({ games = [], resolveCover = resolveGameCover }) {
  return <ol className="founder-games" aria-label="Jeux fondateurs">{games.filter(Boolean).slice(0, 3).map((game, index) => <FounderGame key={`${game.id || game.name}-${index}`} game={game} index={index} resolveCover={resolveCover} />)}</ol>;
}
