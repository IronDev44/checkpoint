import React,{Children,Fragment,isValidElement,useState} from 'react';
import {HOME_BLOCKS,HOME_ACTIVITIES,normalizeHomeLayout} from '../services/homeLayout';
import './DailyTools.css';
export function HomeBlock({children}){return <>{children}</>;}
function flatten(children){return Children.toArray(children).flatMap(child=>isValidElement(child)&&child.type===Fragment?flatten(child.props.children):[child]);}
export default function HomeLayout({children,value,onChange}){
 const layout=normalizeHomeLayout(value),nodes=flatten(children),blocks=new Map(nodes.filter(c=>isValidElement(c)&&c.type===HomeBlock).map(c=>[c.props.id,c]));
 const [notice,setNotice]=useState(''),[activity,setActivity]=useState(null);
 const visible=layout.order.filter(id=>!layout.hidden.includes(id)&&blocks.has(id));
 const activities=visible.filter(id=>HOME_ACTIVITIES[id]);
 const activityAnchor=activities[0];
 const save=next=>{onChange?.(normalizeHomeLayout(next));setNotice('Accueil mis à jour.');};
 const move=(id,direction)=>{const order=[...layout.order],index=order.indexOf(id),target=index+direction;if(target<0||target>=order.length)return;[order[index],order[target]]=[order[target],order[index]];save({...layout,order});};
 return <div className="home-page">
  {nodes.filter(c=>!isValidElement(c)||c.type!==HomeBlock)}
  {onChange&&<details className="home-customizer"><summary>Personnaliser l’accueil</summary><p>Ton niveau reste en haut. Choisis les autres blocs et leur ordre.</p><label className="home-group-activities"><input type="checkbox" checked={layout.groupActivities} onChange={e=>save({...layout,groupActivities:e.target.checked})}/>Regrouper les activités dans « Pour toi »</label><div className="home-customizer-list">{layout.order.map((id,index)=><div className="home-customizer-row" key={id}><label><input type="checkbox" checked={!layout.hidden.includes(id)} onChange={e=>save({...layout,hidden:e.target.checked?layout.hidden.filter(k=>k!==id):[...layout.hidden,id]})}/>{HOME_BLOCKS[id]}</label><button type="button" disabled={index===0} aria-label={`Monter ${HOME_BLOCKS[id]}`} onClick={()=>move(id,-1)}>↑</button><button type="button" disabled={index===layout.order.length-1} aria-label={`Descendre ${HOME_BLOCKS[id]}`} onClick={()=>move(id,1)}>↓</button></div>)}</div><button type="button" className="option-pill" onClick={()=>save({})}>Rétablir l’accueil par défaut</button>{notice&&<p role="status">{notice}</p>}</details>}
  {visible.map(id=>layout.groupActivities&&HOME_ACTIVITIES[id]?(id===activityAnchor?<section key="home-activities" className="home-for-you"><h2>Pour toi</h2><p>Choisis ce qui te tente aujourd’hui.</p><div className="home-activity-shortcuts">{activities.map(key=><button key={key} type="button" className="home-activity-shortcut" aria-expanded={activity===key} aria-controls="home-activity-content" onClick={()=>setActivity(current=>current===key?null:key)}><strong>{HOME_ACTIVITIES[key].label}</strong><span>{HOME_ACTIVITIES[key].description}</span><small>{blocks.get(key)?.props.notice?`${blocks.get(key).props.notice} · Ouvrir →`:'Ouvrir →'}</small></button>)}</div>{activity&&activities.includes(activity)&&<div id="home-activity-content" className="home-activity-content" role="region" aria-label={HOME_ACTIVITIES[activity].label}><button type="button" className="option-pill" onClick={()=>setActivity(null)}>Fermer cette activité</button><div key={activity}>{blocks.get(activity)?.props.children}</div></div>}</section>:null):<Fragment key={`home-block-${id}`}>{blocks.get(id).props.children}</Fragment>)}
 </div>;
}
