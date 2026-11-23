import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedValue, LocalizedElement } from "../i18n/Localized";import React, { Children, Fragment, cloneElement, isValidElement, useState } from 'react';
import { HOME_BLOCKS, HOME_ACTIVITIES, normalizeHomeLayout } from '../services/homeLayout';
import ToolDialog from './ToolDialog';
import './DailyTools.css';
import './HomeLayout.css';
export function HomeBlock({ children }) {return <>{children}</>;}
function flatten(children) {return Children.toArray(children).flatMap((child) => isValidElement(child) && child.type === Fragment ? flatten(child.props.children) : [child]);}
export default function HomeLayout({ children, value, onChange }) {useLanguage();
  const layout = normalizeHomeLayout(value),nodes = flatten(children),blocks = new Map(nodes.filter((c) => isValidElement(c) && c.type === HomeBlock).map((c) => [c.props.id, c]));
  const [notice, setNotice] = useState(''),[activity, setActivity] = useState(null),[dismissed, setDismissed] = useState(null);
  const visible = layout.order.filter((id) => !layout.hidden.includes(id) && blocks.has(id));
  const activities = visible.filter((id) => HOME_ACTIVITIES[id]);
  const activityAnchor = activities[0];
  const activityContent = activity && activities.includes(activity) ? blocks.get(activity)?.props.children : null;
  const closeOnNavigate = (content) => {
    if (!isValidElement(content)) return content;
    const handlers = {};
    for (const name of ['onOpen', 'onOpenGame', 'onChallenges']) if (typeof content.props[name] === 'function') handlers[name] = (...args) => {setActivity(null);return content.props[name](...args);};
    return cloneElement(content, handlers);
  };
  const save = (next) => {onChange?.(normalizeHomeLayout(next));setNotice('Accueil mis à jour.');};
  const dismiss = (id) => {save({ ...layout, hidden: [...layout.hidden, id] });setDismissed(id);setActivity(null);};
  const move = (id, direction) => {const order = [...layout.order],index = order.indexOf(id),target = index + direction;if (target < 0 || target >= order.length) return;[order[index], order[target]] = [order[target], order[index]];save({ ...layout, order });};
  return <div className="home-page">
  <LocalizedValue value={nodes.filter((c) => !isValidElement(c) || c.type !== HomeBlock)} />
  {onChange && <details className="home-customizer"><summary><LocalizedMessage source={"Personnaliser l’accueil"} values={[]} /></summary><p><LocalizedMessage source={"Ton niveau reste en haut. Choisis les autres blocs et leur ordre."} values={[]} /></p><label className="home-group-activities"><input type="checkbox" checked={layout.groupActivities} onChange={(e) => save({ ...layout, groupActivities: e.target.checked })} /><LocalizedMessage source={"Regrouper les activités dans « Pour toi »"} values={[]} /></label><div className="home-customizer-list">{layout.order.map((id, index) => <div className="home-customizer-row" key={id}><label><input type="checkbox" checked={!layout.hidden.includes(id)} onChange={(e) => save({ ...layout, hidden: e.target.checked ? layout.hidden.filter((k) => k !== id) : [...layout.hidden, id] })} /><LocalizedValue value={HOME_BLOCKS[id]} /></label><LocalizedElement __as={"button"} type="button" disabled={index === 0} onClick={() => move(id, -1)} __messages={{ "aria-label": { source: "Monter {{0}}", values: [HOME_BLOCKS[id]], preserve: [] } }}>↑</LocalizedElement><LocalizedElement __as={"button"} type="button" disabled={index === layout.order.length - 1} onClick={() => move(id, 1)} __messages={{ "aria-label": { source: "Descendre {{0}}", values: [HOME_BLOCKS[id]], preserve: [] } }}>↓</LocalizedElement></div>)}</div><button type="button" className="option-pill" onClick={() => save({})}><LocalizedMessage source={"Rétablir l’accueil par défaut"} values={[]} /></button>{notice && <p role="status"><LocalizedValue value={notice} /></p>}</details>}
  {dismissed && <p className="home-dismiss-notice" role="status"><LocalizedMessage source={"{{0}} masqué. Tu peux le réactiver dans « Personnaliser l’accueil ». "} values={[HOME_BLOCKS[dismissed]]} /><button type="button" className="option-pill" onClick={() => {save({ ...layout, hidden: layout.hidden.filter((id) => id !== dismissed) });setDismissed(null);}}><LocalizedMessage source={"Annuler"} values={[]} /></button></p>}
  {visible.map((id) => layout.groupActivities && HOME_ACTIVITIES[id] ? id === activityAnchor ? <section key="home-activities" className="home-for-you"><h2><LocalizedMessage source={"Pour toi"} values={[]} /></h2><p><LocalizedMessage source={"Choisis ce qui te tente aujourd’hui."} values={[]} /></p><div className="home-activity-shortcuts">{activities.map((key) => <article className="home-activity-choice" key={key}><button type="button" className="home-activity-shortcut" aria-haspopup="dialog" aria-expanded={activity === key} onClick={() => setActivity((current) => current === key ? null : key)}><strong><LocalizedValue value={HOME_ACTIVITIES[key].label} /></strong><span><LocalizedValue value={HOME_ACTIVITIES[key].description} /></span><small><LocalizedValue value={blocks.get(key)?.props.notice ? `${blocks.get(key).props.notice} · Ouvrir →` : 'Ouvrir →'} /></small></button>{onChange && <LocalizedElement __as={"button"} type="button" className="home-dismiss-action" onClick={() => dismiss(key)} __messages={{ "aria-label": { source: "Masquer l’activité : {{0}}", values: [HOME_ACTIVITIES[key].label], preserve: [] } }}><LocalizedMessage source={"Ça ne m’intéresse pas"} values={[]} /></LocalizedElement>}</article>)}</div></section> : null : <Fragment key={`home-block-${id}`}>{blocks.get(id).props.children}</Fragment>)}
 {layout.groupActivities && activityContent && <ToolDialog key={activity} title={HOME_ACTIVITIES[activity].label} wide className="home-activity-dialog" onClose={() => setActivity(null)}><LocalizedValue value={closeOnNavigate(activityContent)} /></ToolDialog>}
 </div>;
}
