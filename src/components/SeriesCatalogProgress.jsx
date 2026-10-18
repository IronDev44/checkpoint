import {useEffect, useRef, useState} from 'react';
import {loadSeriesCatalog, seriesRemaining} from '../services/seriesCatalog';

export default function SeriesCatalogProgress({name, games, isFinished}) {
  const root = useRef(null);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState({status:'loading'});
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {setVisible(true); return;}
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {setVisible(true); observer.disconnect();}
    }, {rootMargin:'100px'});
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    const controller = new AbortController();
    setState({status:'loading'});
    loadSeriesCatalog(name, {signal:controller.signal})
      .then(catalog => {if (!controller.signal.aborted) setState({status:'ready', catalog});})
      .catch(() => {if (!controller.signal.aborted) setState({status:'error'});});
    return () => controller.abort();
  }, [name, visible]);
  const count = state.catalog ? seriesRemaining({...state.catalog, name}, games, isFinished) : null;
  return <span ref={root} className="series-catalog-progress" aria-live="polite">
    {state.status === 'loading' ? 'Recherche des autres jeux de la série…'
      : state.status === 'error' ? 'Autres jeux de la série : catalogue indisponible'
      : !state.catalog.games.length ? 'Pas d’autre titre confirmé dans le catalogue'
      : count.remaining ? `${state.catalog.complete ? '' : 'Au moins '}${count.remaining} jeu${count.remaining > 1 ? 'x' : ''} répertorié${count.remaining > 1 ? 's' : ''} à terminer · ${count.outside} hors bibliothèque`
      : `Tous les jeux répertoriés sont terminés${state.catalog.complete ? '' : ' · catalogue partiel'}`}
  </span>;
}
